# cockpit/adapters/zellij/emit.ps1
#
# For each zellij session in the snapshot, spawn a new wt tab that runs `arc-attach <name>`.
# This composes Zellij with Windows Terminal: WT provides the window, Zellij provides
# the persistent in-session pane state.

function Invoke-ZellijRehydrate {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)] [object]$Snapshot,
        [switch]$DryRun
    )

    $arcAliasPath = Join-Path $HOME 'Starlight-Intelligence-System\cockpit-zellij\scripts\zellij-aliases.ps1'

    $wtArgs = @('-w', '0')
    $isFirst = $true
    $count = 0

    foreach ($win in $Snapshot.windows) {
        foreach ($tab in $win.tabs) {
            foreach ($pane in $tab.panes) {
                if ($pane.agent -ne 'zellij-session') { continue }
                if (-not $pane.session_id) { continue }

                if ($isFirst) {
                    $wtArgs += 'new-tab'
                    $isFirst = $false
                } else {
                    $wtArgs += ';'
                    $wtArgs += 'new-tab'
                }
                $wtArgs += '--title'
                $wtArgs += $pane.session_id

                $cmd = "pwsh -NoExit -Command `". '$arcAliasPath'; arc-attach $($pane.session_id)`""
                $wtArgs += $cmd
                $count++
            }
        }
    }

    $rendered = "wt.exe " + (($wtArgs | ForEach-Object {
        if ($_ -match '\s') { "`"$_`"" } else { $_ }
    }) -join ' ')

    if ($DryRun) {
        return [PSCustomObject]@{ Spawned = $count; DryRun = $true; Command = $rendered }
    }

    if ($count -eq 0) {
        return [PSCustomObject]@{ Spawned = 0; DryRun = $false; Command = '(no zellij sessions to rehydrate)' }
    }

    if ($PSCmdlet.ShouldProcess('wt.exe', "spawn $count zellij attach tabs")) {
        Start-Process -FilePath 'wt.exe' -ArgumentList $wtArgs | Out-Null
    }
    return [PSCustomObject]@{ Spawned = $count; DryRun = $false; Command = $rendered }
}
