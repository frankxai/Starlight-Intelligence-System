[CmdletBinding()]
param()

# Quick post-reboot state probe — uptime, disk, RAM, and the popup task.
# Idempotent — read-only state probe, re-run = same result.

$ErrorActionPreference = 'Stop'

$d = Get-PSDrive C
$os = Get-CimInstance Win32_OperatingSystem
$upMin = [math]::Round(((Get-Date) - $os.LastBootUpTime).TotalMinutes, 1)
$ramFreeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$ramTotalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$ramPct = [math]::Round((1 - ($os.FreePhysicalMemory / $os.TotalVisibleMemorySize)) * 100, 1)
$diskFreeGB = [math]::Round($d.Free / 1GB, 2)

Write-Host "uptime_min:   $upMin"
Write-Host "disk_free_gb: $diskFreeGB"
Write-Host "ram_free_gb:  $ramFreeGB / $ramTotalGB ($ramPct% used)"
Write-Host ""

$t = Get-ScheduledTask -TaskName 'Cockpit-Periodic-Snapshot' -ErrorAction SilentlyContinue
if ($t) {
    Write-Host "Cockpit-Periodic-Snapshot:"
    Write-Host "  State : $($t.State)"
    Write-Host "  Hidden: $($t.Settings.Hidden)"
    foreach ($trg in $t.Triggers) {
        $rep = if ($trg.Repetition) { "every $($trg.Repetition.Interval)" } else { 'one-shot' }
        Write-Host "  Trigger: $rep | enabled=$($trg.Enabled)"
    }
    foreach ($a in $t.Actions) {
        $argsPreview = if ($a.Arguments.Length -gt 80) { $a.Arguments.Substring(0,80) + '...' } else { $a.Arguments }
        Write-Host "  Action : $($a.Execute) $argsPreview"
    }
} else {
    Write-Host "Cockpit-Periodic-Snapshot: not found"
}
