# Register Starlight Jules Autonomous Conductor as a 24/7 Windows Scheduled Task.
#
# Idempotent -- safe to re-run; replaces existing task with same name.
# Built on SIP — Starlight Intelligence Protocol v1.1.1.

$ErrorActionPreference = 'Stop'

$TaskName    = 'StarlightJulesConductor'
$RepoRoot    = (Resolve-Path "$PSScriptRoot\..").Path
$DaemonScript = Join-Path $RepoRoot 'scripts\start-jules-daemon.ps1'

if (-not (Test-Path $DaemonScript)) {
    throw "Daemon launcher script not found at $DaemonScript"
}

$pwshPath = Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps\pwsh.exe'
if (-not (Test-Path $pwshPath)) {
    $pwshPath = (Get-Command pwsh -ErrorAction Stop).Source
    Write-Warning "Stable pwsh alias missing; falling back to $pwshPath"
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task '$TaskName'" -ForegroundColor Yellow
}

$Action = New-ScheduledTaskAction `
    -Execute $pwshPath `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$DaemonScript`" -Action Start"

# Triggers: Run at logon, and check health every 15 minutes
$TriggerLogon = New-ScheduledTaskTrigger -AtLogOn
$TriggerRepeat = New-ScheduledTaskTrigger -Once -At 00:00 -RepetitionInterval (New-TimeSpan -Minutes 15)
$Triggers = @($TriggerLogon, $TriggerRepeat)

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 2)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Triggers `
    -Settings $Settings `
    -Principal $Principal `
    -Description 'Starlight Jules Autonomous Cloud Conductor: 24/7 zero-touch cloud agent orchestrator. Built on SIP.' | Out-Null

Write-Host "[OK] Registered scheduled task '$TaskName'" -ForegroundColor Green
Write-Host "     Runs at logon and verifies health every 15 minutes."
Write-Host "     Launcher: $DaemonScript"
