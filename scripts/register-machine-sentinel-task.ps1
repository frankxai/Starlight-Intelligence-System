# Register Machine Sentinel as a daily Windows scheduled task.
#
# Idempotent -- safe to re-run; replaces existing task with same name.
#
# IMPORTANT: deliberately uses the STABLE WindowsApps pwsh alias
# ($env:LOCALAPPDATA\Microsoft\WindowsApps\pwsh.exe), NOT (Get-Command pwsh)
# -- the latter resolves to a versioned Store path that breaks on every
# PowerShell auto-update (this exact bug killed all guard tasks 2026-05-27).

$ErrorActionPreference = 'Stop'

$TaskName    = 'StarlightMachineSentinel'
$RepoRoot    = (Resolve-Path "$PSScriptRoot\..").Path
$LauncherPs1 = Join-Path $RepoRoot 'scripts\machine-sentinel.ps1'

if (-not (Test-Path $LauncherPs1)) {
    throw "Launcher not found at $LauncherPs1"
}

$pwshPath = Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps\pwsh.exe'
if (-not (Test-Path $pwshPath)) {
    $pwshPath = (Get-Command pwsh -ErrorAction Stop).Source
    Write-Warning "Stable pwsh alias missing; falling back to $pwshPath (versioned -- may break on update)"
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task '$TaskName'" -ForegroundColor Yellow
}

$Action = New-ScheduledTaskAction `
    -Execute $pwshPath `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$LauncherPs1`""

$Trigger = New-ScheduledTaskTrigger -Daily -At 7:30am

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description 'Daily Machine Sentinel: guard-task health, port/autostart drift, secret-scan recency, Defender/firewall posture. Built on SIP.' | Out-Null

Write-Host "[OK] Registered scheduled task '$TaskName'" -ForegroundColor Green
Write-Host "     Runs daily at 07:30 (local time), catches up if machine was off"
Write-Host "     Launcher: $LauncherPs1"
