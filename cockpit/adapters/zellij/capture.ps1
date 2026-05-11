# cockpit/adapters/zellij/capture.ps1
#
# For Zellij users: each project gets its own zellij session via `arc <project>`.
# We capture the active zellij sessions list + correlate to manifest entries.

function Get-ZellijSessions {
    $zellij = Get-Command zellij -ErrorAction SilentlyContinue
    if (-not $zellij) { return @() }

    try {
        $raw = & zellij list-sessions 2>$null
    } catch {
        return @()
    }
    if (-not $raw) { return @() }

    $names = @()
    foreach ($line in $raw) {
        # zellij list-sessions output is like "session-name [created N seconds ago] (current)"
        $clean = ($line -replace '\x1b\[[0-9;]*m', '').Trim()
        if (-not $clean) { continue }
        $name = ($clean -split '\s+')[0]
        if ($name -and $name -notmatch '^\(') { $names += $name }
    }
    return $names
}

function New-ZellijSnapshot {
    $manifestLib = Join-Path $PSScriptRoot '..\..\scripts\manifest.ps1'
    . $manifestLib

    $sessions = Get-ZellijSessions
    $tabs = @()

    $i = 0
    foreach ($name in $sessions) {
        # Each zellij session in this cockpit corresponds to an `arc <project>` invocation.
        $tabs += [PSCustomObject]@{
            index  = $i
            title  = $name
            active = $false
            panes  = @([PSCustomObject]@{
                guid              = $null
                cwd               = $null
                agent             = 'zellij-session'
                session_id        = $name
                rehydrate_command = "arc-attach $name"
                shell             = 'zellij'
                alive             = $true
            })
        }
        $i++
    }

    return [PSCustomObject]@{
        schema      = 'cockpit.snapshot/v1'
        snapshot_at = (Get-Date).ToUniversalTime().ToString('o')
        host        = $env:COMPUTERNAME
        user        = $env:USERNAME
        terminal    = 'zellij'
        windows     = @([PSCustomObject]@{
            guid  = $null
            title = "Zellij sessions"
            tabs  = $tabs
        })
    }
}
