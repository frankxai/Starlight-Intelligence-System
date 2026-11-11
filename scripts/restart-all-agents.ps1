# C:\Users\frank\Starlight-Intelligence-System\scripts\restart-all-agents.ps1
#
# Starlight Agent Lifecycle & Session Manager
# Role: MachineOps / Multi-Laptop Session Restart Automation
#
# Usage:
#   pwsh -NoProfile -File .\scripts\restart-all-agents.ps1 -Action Status
#   pwsh -NoProfile -File .\scripts\restart-all-agents.ps1 -Action Start
#   pwsh -NoProfile -File .\scripts\restart-all-agents.ps1 -Action Restart
#   pwsh -NoProfile -File .\scripts\restart-all-agents.ps1 -Action Kill
#   pwsh -NoProfile -File .\scripts\restart-all-agents.ps1 -Action Restart -Target sis,FrankX
#   pwsh -NoProfile -File .\scripts\restart-all-agents.ps1 -Action Restart -DryRun
#
# Syncs via SIS repository across workstations. Hostname-aware & multi-root safe.

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("Status", "Start", "Restart", "Kill")]
    [string]$Action = "Status",

    [Parameter(Mandatory = $false)]
    [ValidateSet("Auto", "Tabs", "Windows")]
    [string]$WindowMode = "Auto",

    [Parameter(Mandatory = $false)]
    [string[]]$Target = @(),

    [Parameter(Mandatory = $false)]
    [string]$ConfigPath = "",

    [Parameter(Mandatory = $false)]
    [string]$StatusJsPath = "",

    [Parameter(Mandatory = $false)]
    [switch]$DryRun,

    [Parameter(Mandatory = $false)]
    [switch]$DirectLaunch,

    [Parameter(Mandatory = $false)]
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RepoRoot  = (Resolve-Path "$ScriptDir\..").Path
$AgyToolsFile = Join-Path $ScriptDir "agy-tools.ps1"
$ConfigFile = if ($ConfigPath) { $ConfigPath } else { Join-Path $RepoRoot "memory\agent-sessions.json" }
$StatusJsFile = if ($StatusJsPath) { $StatusJsPath } else { Join-Path $RepoRoot "cockpit\agent-status-data.js" }
$TriggerFile = Join-Path $RepoRoot "private\launcher-trigger.txt"
$Hostname  = if ($env:COMPUTERNAME) { $env:COMPUTERNAME } else { [System.Net.Dns]::GetHostName() }
$HomeRoot  = if ($env:USERPROFILE) { $env:USERPROFILE } else { $HOME }

function Write-ManagerLog {
    param(
        [string]$Message = "",
        [ConsoleColor]$Color = [ConsoleColor]::Gray,
        [switch]$NoNewline
    )
    if ($Json) { return }
    if ($NoNewline) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

Write-ManagerLog "====================================================" Cyan
Write-ManagerLog " Starlight Agent Session Manager (v2.0)" Cyan
Write-ManagerLog " Hostname: $Hostname | Action: $Action$(if ($DryRun) { ' [DRY-RUN]' } else { '' })" Cyan
Write-ManagerLog "====================================================" Cyan

# 1. Load configuration
if (-not (Test-Path -LiteralPath $ConfigFile)) {
    Write-Error "Config file not found at $ConfigFile"
    exit 1
}

$config = Get-Content -LiteralPath $ConfigFile -Raw | ConvertFrom-Json
$machineConfig = $null

$matchedProp = $config.machines.PSObject.Properties | Where-Object { $_.Name -ieq $Hostname } | Select-Object -First 1
if ($matchedProp) {
    $machineConfig = $matchedProp.Value
    Write-ManagerLog "Matched host: $Hostname ($($machineConfig.role))" Green
} else {
    $machineConfig = $config.machines.DEFAULT_SECONDARY
    Write-ManagerLog "No explicit host config for '$Hostname'. Using DEFAULT_SECONDARY settings." Yellow
}

# 2. Multi-root repository path resolver
function Resolve-AgentRepoPath {
    param($RepoEntry)

    $candidates = New-Object System.Collections.Generic.List[string]
    if ($RepoEntry.path) { $candidates.Add([string]$RepoEntry.path) }
    if ($RepoEntry.name) {
        $candidates.Add((Join-Path $HomeRoot $RepoEntry.name))
        $candidates.Add((Join-Path $HomeRoot "starlight\repos\$($RepoEntry.name)"))
        $candidates.Add((Join-Path (Split-Path -Parent $RepoRoot) $RepoEntry.name))
        if ($RepoEntry.name -ieq 'Arcanea') {
            $candidates.Add((Join-Path $HomeRoot 'arcanea-ai-app'))
            $candidates.Add((Join-Path $HomeRoot 'starlight\repos\arcanea-ai-app'))
        }
    }

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) {
            return [pscustomobject]@{
                Path   = (Resolve-Path -LiteralPath $candidate).Path
                Exists = $true
            }
        }
    }

    return [pscustomobject]@{
        Path   = [string]$RepoEntry.path
        Exists = $false
    }
}

function Test-TargetMatch {
    param($RepoEntry)
    if (-not $Target -or $Target.Count -eq 0) { return $true }
    foreach ($t in $Target) {
        foreach ($part in ($t -split ',')) {
            $needle = $part.Trim()
            if (-not $needle) { continue }
            if ($RepoEntry.name -ieq $needle -or $RepoEntry.command -ieq $needle -or $RepoEntry.name -ilike "*$needle*") {
                return $true
            }
        }
    }
    return $false
}

# 3. Process inventory & ancestry protection
function Get-ProcessSnapshot {
    $allProcs = @()
    $childrenByParent = @{}

    $cimList = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)
    foreach ($p in $cimList) {
        $procId = [int]$p.ProcessId
        $parentId = [int]$p.ParentProcessId
        $obj = [pscustomobject]@{
            Id          = $procId
            Name        = [string]$p.Name
            CommandLine = [string]$p.CommandLine
            ParentId    = $parentId
        }
        $allProcs += $obj
        if (-not $childrenByParent.ContainsKey($parentId)) {
            $childrenByParent[$parentId] = New-Object System.Collections.Generic.List[object]
        }
        $childrenByParent[$parentId].Add($obj)
    }

    return [pscustomobject]@{
        All              = $allProcs
        ChildrenByParent = $childrenByParent
    }
}

function Get-ProtectedAncestryPids {
    param($Snapshot)
    $protected = New-Object 'System.Collections.Generic.HashSet[int]'
    $byId = @{}
    foreach ($p in $Snapshot.All) { $byId[$p.Id] = $p }

    $cur = [int]$PID
    while ($cur -gt 0 -and $protected.Add($cur)) {
        if ($byId.ContainsKey($cur)) {
            $cur = [int]$byId[$cur].ParentId
        } else {
            break
        }
    }
    return $protected
}

function Get-DescendantProcesses {
    param(
        [int]$RootPid,
        $ChildrenByParent
    )
    $descendants = New-Object System.Collections.Generic.List[object]
    $visited = New-Object 'System.Collections.Generic.HashSet[int]'
    $queue = New-Object 'System.Collections.Generic.Queue[int]'
    [void]$visited.Add($RootPid)
    $queue.Enqueue($RootPid)

    while ($queue.Count -gt 0) {
        $currentId = $queue.Dequeue()
        if ($ChildrenByParent.ContainsKey($currentId)) {
            foreach ($child in $ChildrenByParent[$currentId]) {
                if ($visited.Add([int]$child.Id)) {
                    $descendants.Add($child)
                    $queue.Enqueue([int]$child.Id)
                }
            }
        }
    }
    return $descendants
}

function Test-IsAgentBinary {
    param($Proc, [string]$ExpectedAgent)
    $n = $Proc.Name.ToLowerInvariant()
    $cmd = $Proc.CommandLine

    switch ($ExpectedAgent.ToLowerInvariant()) {
        'claude'      { if ($n -eq 'claude.exe' -or ($n -eq 'node.exe' -and $cmd -match 'claude')) { return $true } }
        'antigravity' { if ($n -eq 'agy.exe' -or ($n -eq 'node.exe' -and $cmd -match 'agy')) { return $true } }
        'codex'       { if ($n -eq 'codex.exe' -or ($n -eq 'node.exe' -and $cmd -match 'codex')) { return $true } }
        'grok'        { if ($n -eq 'grok.exe' -or ($n -eq 'node.exe' -and $cmd -match 'grok')) { return $true } }
        'deepagent'   { if ($n -eq 'dcode.exe' -or ($n -eq 'node.exe' -and $cmd -match 'dcode')) { return $true } }
        'opencode'    { if ($n -eq 'opencode.exe' -or ($n -eq 'node.exe' -and $cmd -match 'opencode')) { return $true } }
    }

    if ($n -in @('claude.exe', 'agy.exe', 'codex.exe', 'grok.exe', 'dcode.exe', 'opencode.exe')) {
        return $true
    }
    return $false
}

function Find-RepoSession {
    param(
        [string]$CommandName,
        [string]$AgentType,
        $Snapshot
    )

    $escapedCmd = [regex]::Escape($CommandName)
    $cmdPattern = "(-Command|-c)\s+[`"']?(?:Set-Location[^;]+;\s*|\.\s+['`"][^'`"]*agy-tools\.ps1['`"]\s+)?$escapedCmd([`"'\s;]|$)"

    $pwshShell = $Snapshot.All | Where-Object {
        $_.Name -in @('pwsh.exe', 'powershell.exe') -and $_.CommandLine -match $cmdPattern
    } | Select-Object -First 1

    if (-not $pwshShell) {
        return [pscustomobject]@{
            Running  = $false
            Pid      = $null
            ShellPid = $null
            Details  = "Not running"
        }
    }

    $descendants = Get-DescendantProcesses -RootPid $pwshShell.Id -ChildrenByParent $Snapshot.ChildrenByParent
    $agentChild = $descendants | Where-Object { Test-IsAgentBinary -Proc $_ -ExpectedAgent $AgentType } | Select-Object -First 1

    if ($agentChild) {
        return [pscustomobject]@{
            Running  = $true
            Pid      = [int]$agentChild.Id
            ShellPid = [int]$pwshShell.Id
            Details  = "Agent active (PID $($agentChild.Id)) inside shell (PID $($pwshShell.Id))"
        }
    }

    return [pscustomobject]@{
        Running  = $true
        Pid      = [int]$pwshShell.Id
        ShellPid = [int]$pwshShell.Id
        Details  = "PowerShell shell open (PID $($pwshShell.Id)); agent starting or idle"
    }
}

function Stop-SessionProcessTree {
    param(
        [int]$ShellPid,
        $Snapshot,
        $ProtectedPids
    )

    $descendants = @(Get-DescendantProcesses -RootPid $ShellPid -ChildrenByParent $Snapshot.ChildrenByParent)
    $allTargetIds = @($descendants | ForEach-Object { [int]$_.Id }) + @($ShellPid)

    foreach ($tid in $allTargetIds) {
        if ($ProtectedPids.Contains($tid)) {
            return [pscustomobject]@{
                Stopped   = $false
                Preserved = $true
                Reason    = "Caller session (PID $ShellPid) preserved to prevent self-termination"
            }
        }
    }

    # Stop deepest children first so MCP servers and CLI child processes do not leak
    for ($i = $descendants.Count - 1; $i -ge 0; $i--) {
        $child = $descendants[$i]
        if ($child.Name -ieq 'conhost.exe') { continue }
        try {
            Stop-Process -Id $child.Id -Force -ErrorAction SilentlyContinue
        } catch {}
    }

    try {
        Stop-Process -Id $ShellPid -Force -ErrorAction Stop
        return [pscustomobject]@{ Stopped = $true; Preserved = $false; Reason = "Stopped shell PID $ShellPid and $($descendants.Count) child process(es)" }
    } catch {
        return [pscustomobject]@{ Stopped = $false; Preserved = $false; Reason = $_.Exception.Message }
    }
}

$snapshot = Get-ProcessSnapshot
$protectedPids = Get-ProtectedAncestryPids -Snapshot $snapshot

# 4. Inspect current status for all configured repos
$statusList = @()
foreach ($repo in $machineConfig.auto_start_repos) {
    $resolved = Resolve-AgentRepoPath -RepoEntry $repo
    $session = Find-RepoSession -CommandName $repo.command -AgentType $repo.agent -Snapshot $snapshot
    $inScope = Test-TargetMatch -RepoEntry $repo

    $details = $session.Details
    if (-not $session.Running -and -not $resolved.Exists) {
        $details = "Repository directory not found ($($repo.path))"
    }

    $statusList += [ordered]@{
        name            = [string]$repo.name
        path            = [string]$resolved.Path
        configured_path = [string]$repo.path
        path_exists     = [bool]$resolved.Exists
        agent           = [string]$repo.agent
        command         = [string]$repo.command
        role            = [string]$repo.role
        in_scope        = [bool]$inScope
        running         = [bool]$session.Running
        pid             = $session.Pid
        shell_pid       = $session.ShellPid
        details         = $details
    }
}

# 5. Execute Kill / Restart teardown
$killedAny = $false
if ($Action -eq "Kill" -or $Action -eq "Restart") {
    Write-ManagerLog "Stopping existing target agent sessions..." Yellow
    foreach ($item in $statusList) {
        if (-not $item.in_scope) { continue }
        if (-not $item.running) { continue }

        $targetShellPid = if ($item.shell_pid) { [int]$item.shell_pid } elseif ($item.pid) { [int]$item.pid } else { 0 }
        if ($targetShellPid -le 0) { continue }

        if ($DryRun) {
            Write-ManagerLog "  [DRY-RUN] Would close shell PID $targetShellPid for $($item.name)" DarkYellow
            if ($Action -eq "Kill") {
                $item.running = $false
                $item.pid = $null
                $item.shell_pid = $null
                $item.details = "Dry-run: would terminate session (PID $targetShellPid)"
            } else {
                $item.running = $false
                $item.pid = $null
                $item.shell_pid = $null
                $item.details = "Dry-run: would stop PID $targetShellPid before clean restart"
            }
            continue
        }

        $stopResult = Stop-SessionProcessTree -ShellPid $targetShellPid -Snapshot $snapshot -ProtectedPids $protectedPids
        if ($stopResult.Preserved) {
            Write-ManagerLog "  [PRESERVED] $($item.name): $($stopResult.Reason)" Cyan
            $item.details = $stopResult.Reason
        } elseif ($stopResult.Stopped) {
            Write-ManagerLog "  Closed $($item.name) ($($stopResult.Reason))" DarkYellow
            $item.running = $false
            $item.pid = $null
            $item.shell_pid = $null
            $item.details = "Terminated during clean $($Action.ToLowerInvariant())"
            $killedAny = $true
        } else {
            Write-Warning "  Failed to stop $($item.name) (PID $targetShellPid): $($stopResult.Reason)"
        }
    }

    if ($killedAny -and $Action -eq "Restart" -and -not $DryRun) {
        Start-Sleep -Milliseconds 800
    }
}

# 6. Execute Start / Restart launch
$reposToStart = @()
if ($Action -eq "Start" -or $Action -eq "Restart") {
    foreach ($item in $statusList) {
        if (-not $item.in_scope) { continue }

        if ($item.running) {
            Write-ManagerLog "Agent for $($item.name) is already running (PID $($item.pid)). Skipping start." Gray
            continue
        }

        if (-not $item.path_exists) {
            Write-ManagerLog "  [SKIP] $($item.name): repository path not found ($($item.path))" Yellow
            $item.details = "Skipped: repository path not found ($($item.path))"
            continue
        }

        $reposToStart += $item
    }

    if ($reposToStart.Count -gt 0) {
        if ($DryRun) {
            foreach ($repo in $reposToStart) {
                Write-ManagerLog "  [DRY-RUN] Would launch $($repo.name) via '$($repo.command)' in $($repo.path)" Green
                $repo.details = "Dry-run: would launch '$($repo.command)' in $($repo.path)"
            }
        } else {
            $isHeadless = -not $DirectLaunch -and (
                -not [Environment]::UserInteractive -or (
                    [System.Diagnostics.Process]::GetCurrentProcess().MainWindowHandle -eq 0 -and
                    $env:SESSIONNAME -notmatch 'Console|RDP-Tcp' -and
                    -not $env:WT_SESSION
                )
            )
            $watcher = if ($isHeadless) {
                $snapshot.All | Where-Object { $_.Name -in @('pwsh.exe', 'powershell.exe') -and $_.CommandLine -match 'watch-launcher\.ps1' } | Select-Object -First 1
            } else { $null }

            if ($isHeadless -and $watcher) {
                Write-ManagerLog "Headless session and desktop watcher (PID $($watcher.Id)) detected. Writing trigger..." Green
                $TriggerDir = Split-Path -Parent $TriggerFile
                if (-not (Test-Path -LiteralPath $TriggerDir)) {
                    New-Item -ItemType Directory -Path $TriggerDir -Force | Out-Null
                }
                $Action.ToLowerInvariant() | Set-Content -LiteralPath $TriggerFile -Encoding utf8
                foreach ($repo in $reposToStart) {
                    $repo.details = "Queued via desktop watcher (PID $($watcher.Id))"
                }
                Write-ManagerLog "Trigger written cleanly. Desktop watcher will spawn visible terminal tabs." Green
            } else {
                $pwshBin = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
                if (-not $pwshBin) { $pwshBin = (Get-Command powershell.exe -ErrorAction SilentlyContinue).Source }
                if (-not $pwshBin) { $pwshBin = "pwsh.exe" }

                $escapedTools = $AgyToolsFile.Replace("'", "''")
                $wtCmd = Get-Command wt.exe -ErrorAction SilentlyContinue
                $useTabs = ($WindowMode -eq "Tabs") -or ($WindowMode -eq "Auto" -and $null -ne $wtCmd)

                if ($useTabs -and $wtCmd) {
                    Write-ManagerLog "Starting $($reposToStart.Count) agent(s) as Windows Terminal tabs..." Green
                    foreach ($repo in $reposToStart) {
                        $tabTitle = "$($repo.name) [$($repo.agent)]"
                        $bootCmd = ". '$escapedTools' $($repo.command)"
                        $wtArgs = "-w 0 new-tab --title `"$tabTitle`" -d `"$($repo.path)`" `"$pwshBin`" -NoExit -Command `"$bootCmd`""
                        Write-ManagerLog "  [Tab] $($repo.name) -> $($repo.command) ($($repo.path))" DarkCyan
                        Start-Process -FilePath $wtCmd.Source -ArgumentList $wtArgs
                        Start-Sleep -Milliseconds 250
                    }
                } else {
                    Write-ManagerLog "Starting $($reposToStart.Count) agent(s) in console windows..." Green
                    foreach ($repo in $reposToStart) {
                        $bootCmd = ". '$escapedTools' $($repo.command)"
                        Write-ManagerLog "  [Window] $($repo.name) -> $($repo.command) ($($repo.path))" DarkCyan
                        Start-Process -FilePath $pwshBin -WorkingDirectory $repo.path -ArgumentList "-NoExit -Command `"$bootCmd`""
                    }
                }

                # Wait briefly and re-snapshot processes to record live PIDs
                Start-Sleep -Seconds 4
                $snapshot = Get-ProcessSnapshot
                foreach ($item in $statusList) {
                    if (-not $item.running -and $item.path_exists -and $item.in_scope) {
                        $refreshed = Find-RepoSession -CommandName $item.command -AgentType $item.agent -Snapshot $snapshot
                        if ($refreshed.Running) {
                            $item.running = $true
                            $item.pid = $refreshed.Pid
                            $item.shell_pid = $refreshed.ShellPid
                            $item.details = $refreshed.Details
                        }
                    }
                }
            }
        }
    } elseif ($Action -eq "Start") {
        Write-ManagerLog "All eligible configured agents are already running." Green
    }
}

# 7. Persist browser status JS (CORS-proof global var for cockpit/agent-control-center.html)
$publicAgents = @()
foreach ($item in $statusList) {
    $publicAgents += [ordered]@{
        name            = $item.name
        path            = $item.path
        configured_path = $item.configured_path
        path_exists     = $item.path_exists
        agent           = $item.agent
        command         = $item.command
        role            = $item.role
        running         = $item.running
        pid             = $item.pid
        shell_pid       = $item.shell_pid
        details         = $item.details
    }
}

$statusData = [ordered]@{
    last_updated        = (Get-Date).ToUniversalTime().ToString('o')
    hostname            = $Hostname
    action              = $Action
    dry_run             = [bool]$DryRun
    machine_role        = $machineConfig.role
    machine_description = $machineConfig.description
    agents              = $publicAgents
}

$cockpitDir = Split-Path -Parent $StatusJsFile
if ($cockpitDir -and -not (Test-Path -LiteralPath $cockpitDir)) {
    New-Item -ItemType Directory -Path $cockpitDir -Force | Out-Null
}

$jsonStr = $statusData | ConvertTo-Json -Depth 6
if (-not $DryRun -or $StatusJsPath) {
    $jsContent = "window.STARLIGHT_AGENT_STATUS = $jsonStr;"
    $jsContent | Set-Content -LiteralPath $StatusJsFile -Encoding utf8
    Write-ManagerLog "Updated browser status file: $StatusJsFile" Green
}

if ($Json) {
    Write-Output $jsonStr
    exit 0
}

# 8. Render command line summary
Write-ManagerLog ""
Write-ManagerLog "Agent Session Summary:" Cyan
Write-ManagerLog "----------------------------------------------------"
foreach ($item in $statusList) {
    $statusSymbol = if ($item.running) { "[RUNNING]" } elseif (-not $item.path_exists) { "[MISSING]" } else { "[STOPPED]" }
    $statusColor = if ($item.running) { [ConsoleColor]::Green } elseif (-not $item.path_exists) { [ConsoleColor]::Yellow } else { [ConsoleColor]::Red }
    $paddedName = $item.name.PadRight(32)
    Write-ManagerLog "$paddedName $statusSymbol" -Color $statusColor -NoNewline
    if ($item.running) {
        Write-ManagerLog " (PID $($item.pid)) | Command: $($item.command) | $($item.path)" Gray
    } else {
        Write-ManagerLog " | Command: $($item.command) | $($item.details)" Gray
    }
}
Write-ManagerLog "----------------------------------------------------"
Write-ManagerLog "Done."
