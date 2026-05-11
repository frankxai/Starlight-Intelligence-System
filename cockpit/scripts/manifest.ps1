# cockpit/scripts/manifest.ps1 -- session manifest read/write primitives (v0.2 hardened)
#
# Hard contract per CONTRACTS.md section 1 + 7:
#   - Append-only writes (atomic on Windows + POSIX up to PIPE_BUF)
#   - All errors swallowed in writer (hooks must never break agents)
#   - Reader filters by PID liveness for "alive" view
#   - Snapshot writes use temp+rename for crash safety
#   - Structured logging: NDJSON lines to events.log for observability
#   - Auto-rotation when manifest exceeds threshold

# Cockpit version
$script:CockpitVersion = '0.2.0'

# Schema versions (stable contracts; bump only with migration script)
$script:SchemaSession  = 'cockpit.session/v1'
$script:SchemaSnapshot = 'cockpit.snapshot/v1'
$script:SchemaConfig   = 'cockpit.config/v1'
$script:SchemaWorkspace = 'cockpit.workspace/v1'

# Auto-rotation threshold: 5 MB before forced rotation
$script:RotationThresholdBytes = 5 * 1024 * 1024

# Hook rate limit: max events per agent per second (anti-flood guard, not throttle)
# Set high; intent is to catch runaway loops, not pace normal usage.
$script:HookRateLimitPerSec = if ($env:COCKPIT_RATE_LIMIT) { [int]$env:COCKPIT_RATE_LIMIT } else { 100 }

$script:CockpitHome = if ($env:COCKPIT_HOME) {
    $env:COCKPIT_HOME
} else {
    Join-Path $HOME '.starlight\cockpit'
}

function Get-CockpitHome { $script:CockpitHome }
function Get-CockpitVersion { $script:CockpitVersion }

function Get-CockpitManifestPath { Join-Path $script:CockpitHome 'sessions.jsonl' }
function Get-CockpitErrorLogPath { Join-Path $script:CockpitHome 'hook-errors.log' }
function Get-CockpitEventLogPath { Join-Path $script:CockpitHome 'events.log' }
function Get-CockpitWorkspacesDir { Join-Path $script:CockpitHome 'workspaces' }
function Get-CockpitSnapshotsDir { Join-Path $script:CockpitHome 'snapshots' }
function Get-CockpitRateLimitPath { Join-Path $script:CockpitHome '.rate-limit' }

function Initialize-CockpitHome {
    if (-not (Test-Path $script:CockpitHome)) {
        New-Item -ItemType Directory -Path $script:CockpitHome -Force | Out-Null
    }
    foreach ($sub in @((Get-CockpitWorkspacesDir), (Get-CockpitSnapshotsDir))) {
        if (-not (Test-Path $sub)) { New-Item -ItemType Directory -Path $sub -Force | Out-Null }
    }
}

function Write-CockpitHookError {
    param([string]$Source, [string]$Message)
    try {
        Initialize-CockpitHome
        $line = "[{0}] {1}: {2}" -f (Get-Date -Format 'o'), $Source, $Message
        Add-Content -Path (Get-CockpitErrorLogPath) -Value $line -Encoding utf8
    } catch {}
}

# Structured NDJSON event log (separate from manifest, for observability without polluting source-of-truth)
function Write-CockpitEvent {
    param(
        [Parameter(Mandatory)] [string]$Kind,        # e.g. hook.fired, snapshot.written, rehydrate.spawned
        [Parameter(Mandatory)] [string]$Status,      # ok | error | warn
        [hashtable]$Fields = @{}
    )
    try {
        Initialize-CockpitHome
        $row = [ordered]@{
            ts      = (Get-Date).ToUniversalTime().ToString('o')
            kind    = $Kind
            status  = $Status
            host    = $env:COMPUTERNAME
            user    = $env:USERNAME
            cockpit_version = $script:CockpitVersion
        }
        foreach ($k in $Fields.Keys) { $row[$k] = $Fields[$k] }
        $json = $row | ConvertTo-Json -Compress -Depth 6
        Add-Content -Path (Get-CockpitEventLogPath) -Value $json -Encoding utf8
    } catch {}
}

function Test-CockpitRateLimit {
    # Returns $true if write should proceed, $false if rate-limited.
    # Tracks: last 1 second of writes per agent. Rejects if > $script:HookRateLimitPerSec.
    param([string]$Agent)
    try {
        $rateFile = Get-CockpitRateLimitPath
        $now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        $cutoff = $now - 1000
        $entries = @()
        if (Test-Path $rateFile) {
            $raw = Get-Content -Path $rateFile -Raw -Encoding utf8 -ErrorAction SilentlyContinue
            if ($raw) {
                foreach ($line in ($raw -split "`n")) {
                    if ($line.Trim()) {
                        $parts = $line -split ','
                        if ($parts.Count -eq 2 -and [int64]$parts[1] -gt $cutoff) {
                            $entries += [PSCustomObject]@{ Agent = $parts[0]; Ts = [int64]$parts[1] }
                        }
                    }
                }
            }
        }
        $countForAgent = ($entries | Where-Object { $_.Agent -eq $Agent } | Measure-Object).Count
        if ($countForAgent -ge $script:HookRateLimitPerSec) {
            Write-CockpitEvent -Kind 'hook.rate-limited' -Status 'warn' -Fields @{ agent = $Agent; count = $countForAgent }
            return $false
        }
        $entries += [PSCustomObject]@{ Agent = $Agent; Ts = $now }
        $newContent = ($entries | ForEach-Object { "$($_.Agent),$($_.Ts)" }) -join "`n"
        Set-Content -Path $rateFile -Value $newContent -Encoding utf8 -ErrorAction SilentlyContinue
        return $true
    } catch {
        # Rate limiter failure must never block writes
        return $true
    }
}

function Test-CockpitManifestSize {
    # Returns $true if rotation needed
    $path = Get-CockpitManifestPath
    if (-not (Test-Path $path)) { return $false }
    return ((Get-Item $path).Length -gt $script:RotationThresholdBytes)
}

function Invoke-CockpitManifestRotate {
    # Archives current manifest with timestamp suffix, starts fresh.
    # Keeps last 3 archives, drops older.
    $path = Get-CockpitManifestPath
    if (-not (Test-Path $path)) { return $null }
    $archive = "$path.archive-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Move-Item -Path $path -Destination $archive -Force
    Write-CockpitEvent -Kind 'manifest.rotated' -Status 'ok' -Fields @{ archive = $archive }

    # Trim old archives
    $archives = @(Get-ChildItem -Path $script:CockpitHome -Filter 'sessions.jsonl.archive-*' | Sort-Object LastWriteTime -Descending)
    if ($archives.Count -gt 3) {
        for ($i = 3; $i -lt $archives.Count; $i++) {
            Remove-Item -Path $archives[$i].FullName -Force
        }
    }
    return $archive
}

function Get-CockpitProjectKey {
    param([string]$Cwd)
    try {
        $repoRoot = $env:STARLIGHT_REPO_ROOT
        if (-not $repoRoot) {
            $candidate = Join-Path $HOME 'Starlight-Intelligence-System'
            if (Test-Path $candidate) { $repoRoot = $candidate }
        }
        if ($repoRoot) {
            $libPath = Join-Path $repoRoot 'cockpit-zellij\lib\projects.ps1'
            if (Test-Path $libPath) {
                . $libPath
                $projects = Get-StarlightProjects
                foreach ($key in $projects.Keys) {
                    $p = $projects[$key]
                    if ($Cwd -and $p.path -and $Cwd.StartsWith($p.path, [System.StringComparison]::OrdinalIgnoreCase)) {
                        return $key
                    }
                }
            }
        }
    } catch {}
    if ($Cwd) {
        return (Split-Path -Leaf $Cwd).ToLower()
    }
    return 'unknown'
}

function Get-CockpitProcessChain {
    # Walks parent-PID chain. Optimized: ONE Win32_Process query, in-memory walk.
    # Per-call cost: ~150ms (one CIM call) instead of N*150ms (one per step).
    # On non-Windows or if CIM fails, returns just $RootPid (best effort).
    param([int]$RootPid)
    $chain = @($RootPid)
    if (-not (Get-Command Get-CimInstance -ErrorAction SilentlyContinue)) {
        return $chain
    }
    try {
        # Use cached process index if available (snapshot path sets this)
        if ($script:CockpitProcessIndex) {
            $idx = $script:CockpitProcessIndex
        } else {
            # Single query, build PID->ParentPID map
            $idx = @{}
            foreach ($p in (Get-CimInstance Win32_Process -Property ProcessId,ParentProcessId -ErrorAction Stop)) {
                $idx[[int]$p.ProcessId] = [int]$p.ParentProcessId
            }
        }
        $current = $RootPid
        $depth = 0
        while ($idx.ContainsKey($current) -and $depth -lt 10) {
            $parent = $idx[$current]
            if (-not $parent -or $parent -le 0 -or $parent -eq $current) { break }
            $chain += $parent
            $current = $parent
            $depth++
        }
    } catch {}
    return $chain
}

# Optional: prime the cached process index for the duration of a snapshot call.
# Without priming, each Write-CockpitSessionEvent does its own CIM query (~150ms).
# With priming, batches share one query.
function Set-CockpitProcessIndexCache {
    param([hashtable]$Index)
    $script:CockpitProcessIndex = $Index
}
function Clear-CockpitProcessIndexCache {
    $script:CockpitProcessIndex = $null
}

# Schema validator -- enforces required fields per CONTRACTS.md
function Test-CockpitSessionSchema {
    param([Parameter(Mandatory)] [object]$Row)
    $required = @('schema', 'ts', 'event', 'agent', 'session_id', 'cwd')
    foreach ($f in $required) {
        if (-not $Row.PSObject.Properties.Match($f).Count) { return $false }
        if ($null -eq $Row.$f) { return $false }
    }
    if ($Row.schema -ne $script:SchemaSession) { return $false }
    $validEvents = @('start', 'stop', 'heartbeat', 'crash')
    if ($Row.event -notin $validEvents) { return $false }
    return $true
}

function Test-CockpitSnapshotSchema {
    param([Parameter(Mandatory)] [object]$Doc)
    $required = @('schema', 'snapshot_at', 'host', 'terminal', 'windows')
    foreach ($f in $required) {
        if (-not $Doc.PSObject.Properties.Match($f).Count) { return $false }
    }
    if ($Doc.schema -ne $script:SchemaSnapshot) { return $false }
    return $true
}

function Write-CockpitSessionEvent {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] [ValidateSet('start', 'stop', 'heartbeat', 'crash')] [string]$Event,
        [Parameter(Mandatory)] [string]$Agent,
        [Parameter(Mandatory)] [string]$SessionId,
        [Parameter(Mandatory)] [string]$Cwd,
        [int]$ProcessId = $PID,
        [int]$ParentPid = 0,
        [hashtable]$Extra = @{}
    )

    try {
        Initialize-CockpitHome

        # Rate-limit guard
        if (-not (Test-CockpitRateLimit -Agent $Agent)) {
            return $false
        }

        # Auto-rotation guard
        if (Test-CockpitManifestSize) {
            Invoke-CockpitManifestRotate | Out-Null
        }

        # Single CIM query path: chain[0]=self, chain[1]=parent (if walk found one)
        $chain = Get-CockpitProcessChain -RootPid $ProcessId
        if ($ParentPid -eq 0 -and $chain.Count -ge 2) {
            $ParentPid = [int]$chain[1]
        }

        $row = [ordered]@{
            schema       = $script:SchemaSession
            ts           = (Get-Date).ToUniversalTime().ToString('o')
            event        = $Event
            agent        = $Agent
            session_id   = $SessionId
            cwd          = $Cwd
            wt_session   = $env:WT_SESSION
            wt_window    = $null
            wt_pane      = $null
            tmux_pane    = $env:TMUX_PANE   # POSIX equivalent
            pid          = $ProcessId
            parent_pid   = $ParentPid
            ppid_chain   = $chain
            host         = $env:COMPUTERNAME
            user         = if ($env:USERNAME) { $env:USERNAME } else { $env:USER }
            project_key  = Get-CockpitProjectKey -Cwd $Cwd
            cockpit_version = $script:CockpitVersion
        }

        foreach ($key in $Extra.Keys) {
            if (-not $row.Contains($key)) { $row[$key] = $Extra[$key] }
        }

        $json = ($row | ConvertTo-Json -Compress -Depth 6)
        Add-Content -Path (Get-CockpitManifestPath) -Value $json -Encoding utf8

        Write-CockpitEvent -Kind 'session.event' -Status 'ok' -Fields @{
            agent = $Agent; event = $Event; session_id = $SessionId; project_key = $row.project_key
        }
        return $true
    } catch {
        Write-CockpitHookError -Source 'Write-CockpitSessionEvent' -Message $_.Exception.Message
        Write-CockpitEvent -Kind 'session.event' -Status 'error' -Fields @{
            agent = $Agent; error = $_.Exception.Message
        }
        return $false
    }
}

function Read-CockpitManifest {
    # Returns enumerable rows. Callers expecting array semantics MUST wrap: @(Read-CockpitManifest).
    [CmdletBinding()]
    param(
        [string]$Path = (Get-CockpitManifestPath),
        [switch]$IncludeArchives,
        [switch]$ValidateSchema
    )
    $paths = @()
    if (Test-Path $Path) { $paths += $Path }
    if ($IncludeArchives) {
        $dir = Split-Path -Parent $Path
        if (Test-Path $dir) {
            $paths += Get-ChildItem -Path $dir -Filter 'sessions.jsonl.archive-*' | ForEach-Object { $_.FullName }
        }
    }
    foreach ($p in $paths) {
        foreach ($line in (Get-Content -Path $p -Encoding utf8)) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            try {
                $obj = $line | ConvertFrom-Json
                if ($ValidateSchema -and -not (Test-CockpitSessionSchema -Row $obj)) { continue }
                Write-Output $obj
            } catch {
                # Corrupted line; skip
            }
        }
    }
}

function Get-CockpitAliveSessions {
    [CmdletBinding()]
    param(
        [string]$Agent,
        [switch]$IncludeArchives
    )

    $rows = @(Read-CockpitManifest -IncludeArchives:$IncludeArchives)
    if ($rows.Count -eq 0) { return @() }

    # Latest event per session_id wins
    $latest = @{}
    foreach ($r in $rows) {
        if ($Agent -and $r.agent -ne $Agent) { continue }
        if (-not $r.session_id) { continue }
        $key = "$($r.agent):$($r.session_id)"
        if (-not $latest.ContainsKey($key) -or $r.ts -gt $latest[$key].ts) {
            $latest[$key] = $r
        }
    }

    $alive = @()
    foreach ($key in $latest.Keys) {
        $r = $latest[$key]
        if ($r.event -ne 'start' -and $r.event -ne 'heartbeat') { continue }
        if (-not $r.pid) { continue }
        $running = Get-Process -Id $r.pid -ErrorAction SilentlyContinue
        if ($running) { $alive += $r }
    }
    return $alive
}

# Atomic file write -- temp file + rename. Crash-safe.
function Write-CockpitAtomicJson {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] [string]$Path,
        [Parameter(Mandatory)] [object]$Object,
        [int]$Depth = 8
    )
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $tmpPath = "$Path.tmp-$(Get-Random)"
    $json = $Object | ConvertTo-Json -Depth $Depth
    Set-Content -Path $tmpPath -Value $json -Encoding utf8
    Move-Item -Path $tmpPath -Destination $Path -Force
}

function Invoke-CockpitWorkspaceAutoGC {
    # Cleans up auto-* workspaces older than the retention window.
    # Manual workspaces (no 'auto-' prefix) are never auto-deleted.
    [CmdletBinding()]
    param([int]$RetentionDays = 30)
    $dir = Get-CockpitWorkspacesDir
    if (-not (Test-Path $dir)) { return 0 }
    $cutoff = (Get-Date).AddDays(-$RetentionDays)
    $deleted = 0
    foreach ($f in (Get-ChildItem -Path $dir -Filter 'auto-*.json')) {
        if ($f.LastWriteTime -lt $cutoff) {
            Remove-Item -Path $f.FullName -Force -ErrorAction SilentlyContinue
            $deleted++
        }
    }
    if ($deleted -gt 0) {
        Write-CockpitEvent -Kind 'workspace.auto-gc' -Status 'ok' -Fields @{ deleted = $deleted; retention_days = $RetentionDays }
    }
    return $deleted
}

function Invoke-CockpitManifestGC {
    [CmdletBinding()]
    param(
        [int]$RetentionDays = 30
    )

    # Compose: also GC old auto-* workspaces while we're at it
    $autoGCResult = Invoke-CockpitWorkspaceAutoGC -RetentionDays $RetentionDays
    $path = Get-CockpitManifestPath
    if (-not (Test-Path $path)) { return 0 }

    $cutoff = (Get-Date).ToUniversalTime().AddDays(-$RetentionDays)
    $kept = @()
    $dropped = 0
    $bytesBefore = (Get-Item $path).Length

    foreach ($r in Read-CockpitManifest -Path $path) {
        $keep = $true
        if ($r.event -eq 'stop') {
            try {
                $eventTs = [DateTime]::Parse($r.ts).ToUniversalTime()
                if ($eventTs -lt $cutoff) { $keep = $false }
            } catch {}
        }
        if ($keep) {
            $kept += ($r | ConvertTo-Json -Compress -Depth 6)
        } else {
            $dropped++
        }
    }

    # Atomic write: stage in temp, rename
    $tmpPath = "$path.tmp-gc-$(Get-Random)"
    Set-Content -Path $tmpPath -Value $kept -Encoding utf8
    Move-Item -Path $tmpPath -Destination $path -Force
    $bytesAfter = (Get-Item $path).Length

    Write-CockpitEvent -Kind 'manifest.gc' -Status 'ok' -Fields @{
        dropped_rows = $dropped; bytes_saved = ($bytesBefore - $bytesAfter)
    }

    return [PSCustomObject]@{
        DroppedRows           = $dropped
        BytesBefore           = $bytesBefore
        BytesAfter            = $bytesAfter
        BytesSaved            = ($bytesBefore - $bytesAfter)
        AutoWorkspacesDeleted = $autoGCResult
    }
}
