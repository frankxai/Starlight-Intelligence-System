# dashboard-cockpit-pack — Windows uninstaller

param([switch]$Purge)

$ErrorActionPreference = 'Continue'

$taskName = "StarlightCockpit"
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "[ok] scheduled task '$taskName' removed"
}

if ($Purge) {
  $cockpitDir = Join-Path $HOME ".starlight\cockpit"
  if (Test-Path $cockpitDir) {
    Remove-Item -Recurse -Force $cockpitDir
    Write-Host "[ok] removed $cockpitDir"
  }
}

Write-Host "dashboard-cockpit-pack uninstalled."
