# cockpit/adapters/windows-terminal/emit.ps1
#
# Reads a cockpit snapshot, builds the wt.exe command-line that recreates it.
# Reference: https://learn.microsoft.com/windows/terminal/command-line-arguments
#
# Pattern: wt.exe new-tab -d <cwd> --title <title> <command> ; new-tab -d <cwd2> ... ; ...
# In PowerShell, the chaining ';' must be passed as a literal arg ('`;') or wt swallows it.

function ConvertTo-WtArgList {
    param(
        [Parameter(Mandatory)] [object]$Snapshot,
        [string]$WindowName = '0'
    )

    $wtArgs = @()
    $wtArgs += '-w'
    $wtArgs += $WindowName

    $isFirst = $true

    foreach ($win in $Snapshot.windows) {
        foreach ($tab in $win.tabs) {
            foreach ($pane in $tab.panes) {
                if (-not $pane.alive) { continue }

                if ($isFirst) {
                    $wtArgs += 'new-tab'
                    $isFirst = $false
                } else {
                    $wtArgs += ';'
                    $wtArgs += 'new-tab'
                }

                if ($pane.cwd) {
                    $wtArgs += '-d'
                    $wtArgs += $pane.cwd
                }

                if ($tab.title) {
                    $wtArgs += '--title'
                    $wtArgs += $tab.title
                }

                # Spawn pwsh as the shell host; nested command runs the agent.
                # -NoExit keeps the shell alive so the user retains control if the agent quits.
                $shellCmd = if ($pane.rehydrate_command) {
                    "pwsh -NoExit -Command `"$($pane.rehydrate_command)`""
                } else {
                    'pwsh -NoExit'
                }
                $wtArgs += $shellCmd
            }
        }
    }

    return ,$wtArgs
}

function Invoke-WtRehydrate {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)] [object]$Snapshot,
        [string]$WindowName = '0',
        [switch]$DryRun
    )

    $wtArgs = ConvertTo-WtArgList -Snapshot $Snapshot -WindowName $WindowName

    if ($wtArgs.Count -le 2) {
        return [PSCustomObject]@{
            Spawned = 0
            DryRun  = [bool]$DryRun
            Command = "wt.exe (no panes to rehydrate)"
        }
    }

    $spawnedCount = (($wtArgs | Where-Object { $_ -eq 'new-tab' }) | Measure-Object).Count

    # Render command for display / dry-run
    $rendered = "wt.exe " + (($wtArgs | ForEach-Object {
        if ($_ -match '\s') { "`"$_`"" } else { $_ }
    }) -join ' ')

    if ($DryRun) {
        return [PSCustomObject]@{
            Spawned = $spawnedCount
            DryRun  = $true
            Command = $rendered
        }
    }

    if ($PSCmdlet.ShouldProcess("wt.exe", "spawn $spawnedCount panes")) {
        Start-Process -FilePath 'wt.exe' -ArgumentList $wtArgs | Out-Null
    }

    return [PSCustomObject]@{
        Spawned = $spawnedCount
        DryRun  = $false
        Command = $rendered
    }
}
