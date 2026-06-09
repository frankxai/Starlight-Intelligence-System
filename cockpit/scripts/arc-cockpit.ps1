# cockpit/scripts/arc-cockpit.ps1 -- cockpit subcommands for `arc`
#
# Sourced from $PROFILE alongside cockpit-zellij/scripts/zellij-aliases.ps1.
# Wraps the existing `arc` function so `arc snapshot|rehydrate|status|...`
# routes here, while `arc <project>` still hits the Zellij layout launcher.

. (Join-Path $PSScriptRoot 'manifest.ps1')
. (Join-Path $PSScriptRoot 'workspaces.ps1')

$script:CockpitRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$script:CockpitSubcommands = @(
    'snapshot', 'rehydrate', 'status', 'install', 'uninstall', 'doctor', 'gc',
    'save', 'load', 'workspaces', 'rm-workspace', 'undo', 'history', 'tui', 'events',
    'help', 'version'
)

function Invoke-CockpitSnapshot {
    param([string]$Terminal = 'auto')
    $result = & (Join-Path $script:CockpitRoot 'scripts\snapshot.ps1') -Terminal $Terminal
    Write-Host "Snapshot written: $($result.Path)" -ForegroundColor Green
    Write-Host ("  terminal: {0}  windows: {1}  panes: {2}" -f $result.Terminal, $result.Windows, $result.Panes) -ForegroundColor DarkGray
    return $result
}

function Invoke-CockpitRehydrate {
    param([switch]$DryRun, [string]$Mode = 'skip')
    $result = & (Join-Path $script:CockpitRoot 'scripts\rehydrate.ps1') -DryRun:$DryRun -Mode $Mode
    foreach ($r in @($result)) {
        if ($r.DryRun) {
            Write-Host "DRY-RUN ($($r.Spawned) panes):" -ForegroundColor Yellow
            Write-Host "  $($r.Command)" -ForegroundColor DarkGray
        } elseif ($r.Skipped) {
            Write-Host "SKIPPED: $($r.Reason)" -ForegroundColor Yellow
        } else {
            Write-Host "Rehydrated $($r.Spawned) panes" -ForegroundColor Green
        }
    }
    return $result
}

function Invoke-CockpitStatus {
    $alive = Get-CockpitAliveSessions
    if (-not $alive -or $alive.Count -eq 0) {
        Write-Host "No alive sessions in manifest." -ForegroundColor DarkGray
        Write-Host "Manifest: $(Get-CockpitManifestPath)" -ForegroundColor DarkGray
        return
    }

    $now = (Get-Date).ToUniversalTime()
    $rows = $alive | ForEach-Object {
        $age = '?'
        try {
            $start = [DateTime]::Parse($_.ts).ToUniversalTime()
            $diff = $now - $start
            if ($diff.TotalHours -lt 1) {
                $age = "$([int]$diff.TotalMinutes)m"
            } elseif ($diff.TotalDays -lt 1) {
                $age = "$([int]$diff.TotalHours)h"
            } else {
                $age = "$([int]$diff.TotalDays)d"
            }
        } catch {}
        [PSCustomObject]@{
            Agent      = $_.agent
            Project    = $_.project_key
            Age        = $age
            PID        = $_.pid
            SessionId  = ($_.session_id -replace '-.*$', '...')
            Cwd        = $_.cwd
        }
    }
    $rows | Sort-Object Agent, Project | Format-Table -AutoSize
    Write-Host "Manifest: $(Get-CockpitManifestPath)" -ForegroundColor DarkGray
}

function Invoke-CockpitInstall {
    & (Join-Path $script:CockpitRoot 'scripts\install.ps1')
}

function Invoke-CockpitUninstall {
    & (Join-Path $script:CockpitRoot 'scripts\uninstall.ps1')
}

function Invoke-CockpitDoctor {
    & (Join-Path $script:CockpitRoot 'scripts\doctor.ps1')
}

function Invoke-CockpitGC {
    param([int]$RetentionDays = 30)
    $result = Invoke-CockpitManifestGC -RetentionDays $RetentionDays
    Write-Host ("GC: dropped {0} stop-rows, reclaimed {1} bytes" -f $result.DroppedRows, $result.BytesSaved) -ForegroundColor Green
}

function Invoke-CockpitSave {
    param([string]$Name, [string]$Description)
    if (-not $Name) {
        Write-Warning "Usage: arc save <name> [-Description '<text>']"
        return
    }
    $result = New-CockpitWorkspace -Name $Name -Description $Description
    Write-Host "Workspace saved: $($result.Name)" -ForegroundColor Green
    Write-Host "  panes: $($result.PaneCount)" -ForegroundColor DarkGray
    Write-Host "  path:  $($result.Path)" -ForegroundColor DarkGray
}

function Invoke-CockpitLoad {
    param([string]$Name, [switch]$DryRun, [string]$Mode = 'merge')
    if (-not $Name) {
        Write-Warning "Usage: arc load <name> [-DryRun] [-Mode merge|skip|replace]"
        return
    }
    $result = Invoke-CockpitWorkspaceLoad -Name $Name -DryRun:$DryRun -Mode $Mode
    foreach ($r in @($result)) {
        if ($r.DryRun) {
            Write-Host "DRY-RUN ($($r.Spawned) panes):" -ForegroundColor Yellow
            Write-Host "  $($r.Command)" -ForegroundColor DarkGray
        } elseif ($r.Skipped) {
            Write-Host "SKIPPED: $($r.Reason)" -ForegroundColor Yellow
        } else {
            Write-Host "Loaded $($r.Spawned) panes from workspace '$Name'" -ForegroundColor Green
        }
    }
}

function Invoke-CockpitListWorkspaces {
    $items = Get-CockpitWorkspaces
    if (-not $items -or $items.Count -eq 0) {
        Write-Host "No saved workspaces. Use 'arc save <name>' to create one." -ForegroundColor DarkGray
        return
    }
    $items | Format-Table Name, Description, PaneCount, Updated -AutoSize
    Write-Host "Total: $($items.Count) workspace(s) at $(Get-CockpitWorkspacesDir)" -ForegroundColor DarkGray
}

function Invoke-CockpitRemoveWorkspace {
    param([string]$Name)
    if (-not $Name) { Write-Warning "Usage: arc rm-workspace <name>"; return }
    $ok = Remove-CockpitWorkspace -Name $Name
    if ($ok) { Write-Host "Removed workspace: $Name" -ForegroundColor Green }
    else { Write-Warning "Workspace '$Name' not found" }
}

function Invoke-CockpitUndo {
    # Restore previous snapshot from snapshots/ archive
    $snapshotsDir = Get-CockpitSnapshotsDir
    if (-not (Test-Path $snapshotsDir)) {
        Write-Warning "No snapshot history at $snapshotsDir"
        return
    }
    $archives = @(Get-ChildItem -Path $snapshotsDir -Filter 'snapshot-*.json' | Sort-Object LastWriteTime -Descending)
    if ($archives.Count -lt 2) {
        Write-Warning "No previous snapshot to restore (need at least 2 archives)."
        return
    }
    $previous = $archives[1]  # index 0 is most recent (current); index 1 is the prior one
    $current = Join-Path (Get-CockpitHome) 'last-snapshot.json'
    Copy-Item -Path $previous.FullName -Destination $current -Force
    Write-CockpitEvent -Kind 'snapshot.undo' -Status 'ok' -Fields @{ restored_from = $previous.Name }
    Write-Host "Restored snapshot from: $($previous.Name)" -ForegroundColor Green
    Write-Host "  ($([int]((Get-Date) - $previous.LastWriteTime).TotalMinutes) min ago)" -ForegroundColor DarkGray
}

function Invoke-CockpitHistory {
    $snapshotsDir = Get-CockpitSnapshotsDir
    if (-not (Test-Path $snapshotsDir)) {
        Write-Host "No snapshot history yet." -ForegroundColor DarkGray
        return
    }
    $items = @(Get-ChildItem -Path $snapshotsDir -Filter 'snapshot-*.json' | Sort-Object LastWriteTime -Descending)
    if ($items.Count -eq 0) {
        Write-Host "No snapshot history yet." -ForegroundColor DarkGray
        return
    }
    $now = Get-Date
    $items | ForEach-Object {
        $age = $now - $_.LastWriteTime
        $ageStr = if ($age.TotalHours -lt 1) { "$([int]$age.TotalMinutes)m ago" }
                  elseif ($age.TotalDays -lt 1) { "$([int]$age.TotalHours)h ago" }
                  else { "$([int]$age.TotalDays)d ago" }
        try {
            $snap = Get-Content -Path $_.FullName -Raw | ConvertFrom-Json
            $paneCount = 0
            foreach ($w in $snap.windows) { foreach ($t in $w.tabs) { $paneCount += $t.panes.Count } }
            [PSCustomObject]@{
                When     = $ageStr
                Panes    = $paneCount
                Terminal = $snap.terminal
                File     = $_.Name
            }
        } catch {}
    } | Format-Table -AutoSize
    Write-Host "Run 'arc undo' to restore the previous snapshot (index 1)." -ForegroundColor DarkGray
}

function Invoke-CockpitTui {
    & (Join-Path $script:CockpitRoot 'scripts\tui.ps1')
}

function Invoke-CockpitEvents {
    param([int]$Tail = 20)
    $logPath = Get-CockpitEventLogPath
    if (-not (Test-Path $logPath)) {
        Write-Host "No events recorded yet." -ForegroundColor DarkGray
        return
    }
    Get-Content -Path $logPath -Tail $Tail | ForEach-Object {
        try {
            $row = $_ | ConvertFrom-Json
            $color = switch ($row.status) {
                'error' { 'Red' }
                'warn'  { 'Yellow' }
                default { 'DarkGray' }
            }
            $extras = ($row.PSObject.Properties |
                Where-Object { $_.Name -notin @('ts', 'kind', 'status', 'host', 'user', 'cockpit_version') } |
                ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ' '
            Write-Host ("{0}  [{1}] {2}  {3}" -f $row.ts, $row.status.ToUpper(), $row.kind, $extras) -ForegroundColor $color
        } catch {
            Write-Host $_ -ForegroundColor DarkGray
        }
    }
}

function Show-CockpitHelp {
    @"
cockpit-continuity v$(Get-CockpitVersion) -- session manifest + snapshot + rehydrate for terminal agent workspaces

CORE
  arc snapshot                Capture current terminal state to last-snapshot.json
  arc rehydrate               Rebuild last snapshot via wt.exe / zellij / tmux
  arc rehydrate -DryRun       Show what would spawn, without spawning
  arc status                  Table of alive agent sessions

WORKSPACES (named cockpit profiles)
  arc save <name> [-Description '...']   Save current state under a name
  arc load <name> [-DryRun]              Rebuild a named workspace
  arc workspaces                         List saved workspaces
  arc rm-workspace <name>                Delete a workspace

HISTORY + RECOVERY
  arc history                 List last 10 snapshots (rotating archive)
  arc undo                    Restore the previous snapshot

OBSERVABILITY
  arc tui                     Live dashboard (sessions + events + doctor)
  arc events [-Tail N]        Tail the structured event log

LIFECYCLE
  arc install                 Register hooks in ~/.claude/settings.json + Task Scheduler
  arc uninstall [-PurgeData]  Remove hooks + scheduled tasks
  arc doctor                  10-point install verification
  arc gc [-RetentionDays N]   Compact sessions.jsonl

  arc <project>               (existing) Launch Zellij layout for a project (sis, arcanea, ...)

FILES
  ~/.starlight/cockpit/sessions.jsonl                -- append-only session manifest
  ~/.starlight/cockpit/last-snapshot.json            -- most recent workspace snapshot
  ~/.starlight/cockpit/snapshots/snapshot-*.json     -- last 10 snapshots (for arc undo)
  ~/.starlight/cockpit/workspaces/<name>.json        -- named cockpit profiles
  ~/.starlight/cockpit/events.log                    -- structured NDJSON event log
  ~/.starlight/cockpit/hook-errors.log               -- hook failures (should stay empty)
  ~/.starlight/cockpit/config.json                   -- user config

See cockpit/CONTRACTS.md for schemas. See cockpit/docs/QUICKSTART.md for first run.
"@
}

# Wrap the existing `arc` function with subcommand routing.
# We rename the existing `arc` to `arc-zellij-launch` and define a new dispatcher.

if (Get-Command arc -ErrorAction SilentlyContinue) {
    $existing = Get-Command arc -CommandType Function -ErrorAction SilentlyContinue
    if ($existing -and -not (Get-Command arc-zellij-launch -ErrorAction SilentlyContinue)) {
        Set-Item -Path "Function:\arc-zellij-launch" -Value $existing.ScriptBlock
    }
}

function arc {
    param(
        [Parameter(Position=0)] [string]$Subcommand,
        [Parameter(Position=1, ValueFromRemainingArguments=$true)] $RemainingArgs
    )

    if (-not $Subcommand) {
        if (Get-Command arc-zellij-launch -ErrorAction SilentlyContinue) {
            arc-zellij-launch
        } else {
            Show-CockpitHelp
        }
        return
    }

    if ($script:CockpitSubcommands -contains $Subcommand) {
        switch ($Subcommand) {
            'snapshot'      { Invoke-CockpitSnapshot @RemainingArgs }
            'rehydrate'     { Invoke-CockpitRehydrate @RemainingArgs }
            'status'        { Invoke-CockpitStatus }
            'install'       { Invoke-CockpitInstall }
            'uninstall'     { Invoke-CockpitUninstall }
            'doctor'        { Invoke-CockpitDoctor }
            'gc'            { Invoke-CockpitGC @RemainingArgs }
            'save'          { Invoke-CockpitSave @RemainingArgs }
            'load'          { Invoke-CockpitLoad @RemainingArgs }
            'workspaces'    { Invoke-CockpitListWorkspaces }
            'rm-workspace'  { Invoke-CockpitRemoveWorkspace @RemainingArgs }
            'undo'          { Invoke-CockpitUndo }
            'history'       { Invoke-CockpitHistory }
            'tui'           { Invoke-CockpitTui }
            'events'        { Invoke-CockpitEvents @RemainingArgs }
            'help'          { Show-CockpitHelp }
            'version'       { Write-Output "cockpit-continuity v$(Get-CockpitVersion)" }
        }
        return
    }

    # Not a cockpit subcommand -- delegate to existing zellij arc launcher
    if (Get-Command arc-zellij-launch -ErrorAction SilentlyContinue) {
        arc-zellij-launch $Subcommand
    } else {
        Write-Warning "Unknown subcommand '$Subcommand' and no zellij arc available."
        Show-CockpitHelp
    }
}

if ($env:FRANK_QUIET_PROFILE -ne '1') {
    Write-Host "Cockpit subcommands loaded: snapshot, rehydrate, status, install, doctor, gc" -ForegroundColor Cyan
}
