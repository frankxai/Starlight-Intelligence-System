# Register Starlight Agent Watchdog as a daily/hourly Windows scheduled task.
#
# Idempotent -- safe to re-run; replaces existing task with same name.
#
# Uses the STABLE WindowsApps pwsh alias ($env:LOCALAPPDATA\Microsoft\WindowsApps\pwsh.exe)
# to avoid version-path breaks during PowerShell Store updates.

$ErrorActionPreference = 'Stop'

$TaskName    = 'StarlightAgentWatchdog'
$RepoRoot    = (Resolve-Path "$PSScriptRoot\..").Path
$LauncherPs1 = Join-Path $RepoRoot 'scripts\agent-watchdog.ps1'

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

$Trigger1 = New-ScheduledTaskTrigger -Daily -At 8:00am
$Trigger2 = New-ScheduledTaskTrigger -Daily -At 8:00pm
$Triggers = @($Trigger1, $Trigger2)

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Triggers `
    -Settings $Settings `
    -Principal $Principal `
    -Description 'Orphaned Agent Lifecycle Watchdog: terminates leaked agent CLI processes and cleans up unused git worktrees. Built on SIP.' | Out-Null

Write-Host "[OK] Registered scheduled task '$TaskName'" -ForegroundColor Green
Write-Host "     Runs daily at 08:00 and 20:00 (local time), catches up if machine was off"
Write-Host "     Launcher: $LauncherPs1"
