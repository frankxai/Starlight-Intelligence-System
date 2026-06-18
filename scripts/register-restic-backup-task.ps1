# Register the restic backup as a daily Windows scheduled task.
# Runs 02:15 daily — before portfolio audit (02:30) and indexer (03:00),
# so the backup captures yesterday's complete state.

$ErrorActionPreference = 'Stop'

$TaskName    = 'StarlightSubstrateBackup'
$RepoRoot    = (Resolve-Path "$PSScriptRoot\..").Path
$ScriptPath  = Join-Path $RepoRoot 'scripts\run-restic-backup.ps1'

if (-not (Test-Path $ScriptPath)) {
    throw "Backup runner not found at $ScriptPath"
}

$pwshPath = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
if (-not $pwshPath) {
    $pwshPath = (Get-Command powershell -ErrorAction Stop).Source
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task '$TaskName'" -ForegroundColor Yellow
}

$Action = New-ScheduledTaskAction `
    -Execute $pwshPath `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""

$Trigger = New-ScheduledTaskTrigger -Daily -At 2:15am

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 10)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description 'Daily restic backup of SIS substrate (memory/, vaults, private/voice-operator/, ~/.starlight/). Built on SIP.' | Out-Null

Write-Host "[OK] Registered scheduled task '$TaskName'" -ForegroundColor Green
Write-Host "     Runs daily at 02:15 (local time)"
Write-Host "     Runner: $ScriptPath"
Write-Host ''
Write-Host "Verify:  Get-ScheduledTask -TaskName $TaskName"
Write-Host "Run now: Start-ScheduledTask -TaskName $TaskName"
