[CmdletBinding()]
param()

# Show full trigger + action detail for the cockpit & arcanea24x7 tasks.
# Idempotent — read-only diagnostic, re-run = same result.

$ErrorActionPreference = 'Stop'

$names = @(
    'Cockpit-Periodic-Snapshot',
    'Cockpit-Auto-Save-Morning',
    'Cockpit-Auto-Save-Evening',
    'Cockpit-Shutdown-Snapshot',
    'Cockpit-Weekly-GC',
    'StarlightCockpit',
    'Starlight Dreaming',
    'StarlightCrossRepoIndexer',
    'StarlightPortfolioAudit',
    'StarlightSubstrateBackup',
    'Arcanea24x7'
)

foreach ($n in $names) {
    $t = Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue
    if (-not $t) { continue }
    Write-Host "`n=== $n ===" -ForegroundColor Yellow
    Write-Host "State: $($t.State)"
    foreach ($trg in $t.Triggers) {
        $rep = if ($trg.Repetition) { "every $($trg.Repetition.Interval) for $($trg.Repetition.Duration)" } else { 'one-shot' }
        Write-Host "  Trigger: $($trg.CimClass.CimClassName) | $rep | enabled=$($trg.Enabled)"
    }
    foreach ($a in $t.Actions) {
        Write-Host "  Action : $($a.Execute) $($a.Arguments)"
    }
    Write-Host "  Hidden : $($t.Settings.Hidden)"
}
