# C:\Users\frank\Starlight-Intelligence-System\scripts\start-interactive-session.ps1
#
# Interactive Agent Session Launcher Bridge
# Allows background agents to launch GUI terminal windows on the active user desktop.
# Uses Task Scheduler with an Interactive token principal to cross the Session 0 boundary.

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RepoRoot  = (Resolve-Path "$ScriptDir\..").Path
$StartScript = Join-Path $RepoRoot "scripts\restart-all-agents.ps1"
$TaskName  = "StarlightInteractiveAgentLauncher"

Write-Host "Registering interactive scheduled task: $TaskName" -ForegroundColor Cyan

# Use the environment-resolved pwsh executable path or default to local AppData wrapper
$pwshPath = "$env:LOCALAPPDATA\Microsoft\WindowsApps\pwsh.exe"
if (-not (Test-Path $pwshPath)) {
    $pwshPath = "pwsh.exe" # Fallback to path resolution
}

# 1. Define the action to run the start script
$action = New-ScheduledTaskAction -Execute $pwshPath -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$StartScript`" -Action Start"

# 2. Define principal (runs as the currently logged-on user interactively)
$username = "$env:USERDOMAIN\$env:USERNAME"
$principal = New-ScheduledTaskPrincipal -UserId $username -LogonType Interactive

# 3. Define settings (allow running on battery, no stop on battery)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -Priority 4

# 4. Register the task (overwrite if exists)
$null = Register-ScheduledTask -TaskName $TaskName -Action $action -Principal $principal -Settings $settings -Force

Write-Host "Task registered successfully." -ForegroundColor Green
Write-Host "Triggering interactive task to spawn terminal windows on user desktop..." -ForegroundColor Cyan

# 5. Trigger the task
$task = Get-ScheduledTask -TaskName $TaskName
$null = Start-ScheduledTask -TaskName $TaskName

# 6. Verify trigger status
$state = (Get-ScheduledTaskInfo -TaskName $TaskName).LastTaskResult
Write-Host "Task trigger completed. State: $state" -ForegroundColor Green
Write-Host "Terminal window should now be open on your active desktop screen." -ForegroundColor Green
