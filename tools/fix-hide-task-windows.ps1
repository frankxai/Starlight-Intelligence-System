[CmdletBinding()]
param()

# Hide console windows for the periodic Starlight/Cockpit tasks.
# Strategy: prepend "-WindowStyle Hidden" to powershell.exe/pwsh.exe action args,
# and flip Settings.Hidden = $true. Idempotent.
# Skips Arcanea24x7 (cmd.exe, logon-only — not the 5-min popup).

$ErrorActionPreference = 'Stop'

$tasks = @(
    'Cockpit-Periodic-Snapshot',
    'Cockpit-Auto-Save-Morning',
    'Cockpit-Auto-Save-Evening',
    'Cockpit-Shutdown-Snapshot',
    'Cockpit-Weekly-GC',
    'Starlight Dreaming',
    'StarlightCrossRepoIndexer',
    'StarlightPortfolioAudit',
    'StarlightSubstrateBackup'
)

$changed = 0
$skipped = 0
$errCount = 0

foreach ($name in $tasks) {
    try {
        $t = Get-ScheduledTask -TaskName $name -ErrorAction Stop
        $action = $t.Actions[0]
        $exe = $action.Execute
        $oldArgs = $action.Arguments

        if ($exe -notmatch 'powershell\.exe$|pwsh\.exe$') {
            $skipped++
            Write-Host "  [skip] $name -- non-pwsh exe" -ForegroundColor DarkGray
            continue
        }

        if ($oldArgs -match '-WindowStyle\s+Hidden') {
            $skipped++
            Write-Host "  [skip] $name -- already hidden" -ForegroundColor DarkGray
            continue
        }

        $newArgs = "-WindowStyle Hidden $oldArgs"
        $newAction = New-ScheduledTaskAction -Execute $exe -Argument $newArgs
        $newSettings = $t.Settings
        $newSettings.Hidden = $true

        Set-ScheduledTask -TaskName $name -Action $newAction -Settings $newSettings -ErrorAction Stop | Out-Null
        $changed++
        Write-Host "  [fix]  $name" -ForegroundColor Green
    }
    catch {
        $errCount++
        $msg = $_.Exception.Message
        Write-Host "  [err]  $name -- $msg" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Changed: $changed | Skipped: $skipped | Errors: $errCount" -ForegroundColor Cyan
