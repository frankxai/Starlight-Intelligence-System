# dashboard-cockpit-pack — Windows installer
#
# Registers the StarlightCockpit scheduled task, lays down ~/.starlight/cockpit/,
# and (optionally) wires the `arc` PowerShell alias.
#
# Permissions required (declared in manifest.json):
#   fs:read:HOME/.claude
#   fs:write:HOME/.starlight/cockpit
#   task-scheduler:register
#
# Run after `sis.pack.install` has accepted the install (the runtime gates on
# permissions_acked:true). This script is the user-facing on-machine step.

param(
  [switch]$EnableAlias,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$cockpitDir = Join-Path $HOME ".starlight\cockpit"
$layoutsSrc = Join-Path $PSScriptRoot "cockpit-layouts"

if (-not (Test-Path $cockpitDir)) {
  if ($DryRun) { Write-Host "[dry-run] would create $cockpitDir" } else { New-Item -ItemType Directory -Path $cockpitDir | Out-Null }
}

if (-not $DryRun) {
  Copy-Item -Path "$layoutsSrc\*" -Destination $cockpitDir -Recurse -Force
  Write-Host "[ok] cockpit layouts copied to $cockpitDir"
}

# Register scheduled task
$taskName = "StarlightCockpit"
$arcPath = Join-Path $PSScriptRoot "arc.ps1"
if ($DryRun) {
  Write-Host "[dry-run] would register scheduled task '$taskName' -> $arcPath"
} else {
  $action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-NoProfile -File `"$arcPath`" -Default"
  $trigger = New-ScheduledTaskTrigger -AtLogOn
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Force | Out-Null
  Write-Host "[ok] scheduled task '$taskName' registered"
}

if ($EnableAlias -and -not $DryRun) {
  $profilePath = $PROFILE
  $aliasLine = "Set-Alias arc '$arcPath'"
  if (-not (Test-Path $profilePath) -or -not (Select-String -Path $profilePath -Pattern "Set-Alias arc" -Quiet)) {
    Add-Content -Path $profilePath -Value $aliasLine
    Write-Host "[ok] arc alias added to $profilePath"
  }
}

Write-Host ""
Write-Host "dashboard-cockpit-pack installed. Restart your terminal then run 'arc <project>'."
