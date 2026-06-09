# cockpit/adapters/windows-terminal/capture.ps1
#
# Walks the live process tree to discover Windows Terminal panes,
# correlates them to cockpit manifest entries, and returns a snapshot.
#
# Returns a snapshot-shaped object per CONTRACTS.md section 2.

function Get-CockpitProcessIndex {
    # Returns hashtable: ParentPid -> array of Win32_Process child rows.
    try {
        $all = Get-CimInstance Win32_Process -ErrorAction Stop
    } catch {
        return @{}
    }
    $index = @{}
    foreach ($p in $all) {
        $ppid = [int]$p.ParentProcessId
        if (-not $index.ContainsKey($ppid)) { $index[$ppid] = @() }
        $index[$ppid] += $p
    }
    return $index
}

function Get-CockpitDescendants {
    param(
        [Parameter(Mandatory)] [int]$RootPid,
        [Parameter(Mandatory)] [hashtable]$Index,
        [int]$MaxDepth = 6
    )
    $out = @()
    $queue = New-Object System.Collections.Generic.Queue[object]
    $queue.Enqueue([PSCustomObject]@{ Pid = $RootPid; Depth = 0 })
    while ($queue.Count -gt 0) {
        $cur = $queue.Dequeue()
        if ($cur.Depth -ge $MaxDepth) { continue }
        if (-not $Index.ContainsKey($cur.Pid)) { continue }
        foreach ($child in $Index[$cur.Pid]) {
            $out += $child
            $queue.Enqueue([PSCustomObject]@{ Pid = [int]$child.ProcessId; Depth = ($cur.Depth + 1) })
        }
    }
    return $out
}

function Resolve-CockpitAgentForShell {
    param(
        [AllowEmptyCollection()] [object[]]$ShellDescendants = @()
    )
    if (-not $ShellDescendants -or $ShellDescendants.Count -eq 0) { return $null }
    $agentExeNames = @('claude', 'gemini', 'codex', 'opencode')
    foreach ($d in $ShellDescendants) {
        $name = ($d.Name -replace '\.exe$', '').ToLower()
        if ($agentExeNames -contains $name) {
            return [PSCustomObject]@{ Process = $d; AgentName = $name }
        }
        if ($d.CommandLine) {
            $cl = $d.CommandLine
            if ($cl -match '\bclaude\b')  { return [PSCustomObject]@{ Process = $d; AgentName = 'claude' } }
            if ($cl -match '\bgemini\b')  { return [PSCustomObject]@{ Process = $d; AgentName = 'gemini' } }
            if ($cl -match '\bcodex\b')   { return [PSCustomObject]@{ Process = $d; AgentName = 'codex' } }
        }
    }
    return $null
}

function Find-CockpitMatchingSession {
    param(
        [AllowEmptyCollection()] [object[]]$AliveSessions = @(),
        [Parameter(Mandatory)] [int[]]$DescendantPids
    )
    if (-not $AliveSessions -or $AliveSessions.Count -eq 0) { return $null }

    $set = [System.Collections.Generic.HashSet[int]]::new()
    foreach ($p in $DescendantPids) { [void]$set.Add($p) }

    foreach ($s in $AliveSessions) {
        if ($s.pid -and $set.Contains([int]$s.pid)) { return $s }
        if ($s.ppid_chain) {
            foreach ($pp in $s.ppid_chain) {
                if ($set.Contains([int]$pp)) { return $s }
            }
        }
    }
    return $null
}

function Get-CockpitRehydrateCommand {
    param(
        [string]$Agent,
        [string]$SessionId
    )
    if (-not $Agent) { return $null }
    switch ($Agent) {
        'claude'  { if ($SessionId) { return "claude --resume $SessionId" } else { return 'claude' } }
        'gemini'  { return 'gemini' }
        'codex'   { return 'codex' }
        'opencode' { return 'opencode' }
        default   { return $null }
    }
}

function Get-WindowsTerminalPanes {
    $manifestLib = Join-Path $PSScriptRoot '..\..\scripts\manifest.ps1'
    . $manifestLib

    $wtHosts = Get-Process -Name 'WindowsTerminal' -ErrorAction SilentlyContinue
    if (-not $wtHosts) { return @() }

    $procIndex = Get-CockpitProcessIndex
    if ($procIndex.Count -eq 0) { return @() }

    $aliveSessions = @(Get-CockpitAliveSessions)
    $shellNames = @('pwsh', 'powershell', 'cmd', 'bash', 'wsl', 'zsh')
    $panes = @()

    foreach ($wtHost in $wtHosts) {
        $descendants = Get-CockpitDescendants -RootPid $wtHost.Id -Index $procIndex

        $shells = @($descendants | Where-Object {
            $name = ($_.Name -replace '\.exe$', '').ToLower()
            $shellNames -contains $name
        })

        foreach ($shell in $shells) {
            $shellDescendants = @(Get-CockpitDescendants -RootPid ([int]$shell.ProcessId) -Index $procIndex)
            $agentInfo = Resolve-CockpitAgentForShell -ShellDescendants $shellDescendants

            $allPids = @([int]$shell.ProcessId)
            foreach ($d in $shellDescendants) { $allPids += [int]$d.ProcessId }

            $matched = Find-CockpitMatchingSession -AliveSessions $aliveSessions -DescendantPids $allPids

            $cwd = $null
            $agent = $null
            $sessionId = $null
            $projectKey = $null

            if ($matched) {
                $cwd = $matched.cwd
                $agent = $matched.agent
                $sessionId = $matched.session_id
                $projectKey = $matched.project_key
            } elseif ($agentInfo) {
                $agent = $agentInfo.AgentName
            }

            if (-not $cwd) { $cwd = $HOME }
            if (-not $projectKey) { $projectKey = Get-CockpitProjectKey -Cwd $cwd }

            $rehydrate = Get-CockpitRehydrateCommand -Agent $agent -SessionId $sessionId

            $panes += [PSCustomObject]@{
                window_pid        = [int]$wtHost.Id
                shell_pid         = [int]$shell.ProcessId
                shell_name        = ($shell.Name -replace '\.exe$', '').ToLower()
                cwd               = $cwd
                agent             = $agent
                session_id        = $sessionId
                rehydrate_command = $rehydrate
                project_key       = $projectKey
                alive             = $true
            }
        }
    }

    return $panes
}

function New-WindowsTerminalSnapshot {
    $panes = @(Get-WindowsTerminalPanes)
    $windows = @()

    if ($panes.Count -eq 0) {
        return [PSCustomObject]@{
            schema      = 'cockpit.snapshot/v1'
            snapshot_at = (Get-Date).ToUniversalTime().ToString('o')
            host        = $env:COMPUTERNAME
            user        = $env:USERNAME
            terminal    = 'windows-terminal'
            windows     = @()
        }
    }

    $byHost = $panes | Group-Object -Property window_pid
    foreach ($g in $byHost) {
        $tabs = @()
        $i = 0
        foreach ($pane in $g.Group) {
            $title = if ($pane.project_key) { $pane.project_key } else { (Split-Path -Leaf $pane.cwd) }
            $tabs += [PSCustomObject]@{
                index  = $i
                title  = $title
                active = $false
                panes  = @([PSCustomObject]@{
                    guid              = $null
                    cwd               = $pane.cwd
                    agent             = $pane.agent
                    session_id        = $pane.session_id
                    rehydrate_command = $pane.rehydrate_command
                    shell             = $pane.shell_name
                    alive             = $pane.alive
                })
            }
            $i++
        }
        $windows += [PSCustomObject]@{
            guid  = $null
            title = "Windows Terminal (PID $($g.Name))"
            tabs  = $tabs
        }
    }

    return [PSCustomObject]@{
        schema      = 'cockpit.snapshot/v1'
        snapshot_at = (Get-Date).ToUniversalTime().ToString('o')
        host        = $env:COMPUTERNAME
        user        = $env:USERNAME
        terminal    = 'windows-terminal'
        windows     = $windows
    }
}
