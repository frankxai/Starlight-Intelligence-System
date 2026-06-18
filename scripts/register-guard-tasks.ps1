# register-guard-tasks.ps1
# Restores the daily guard tasks watched by machine-sentinel.ps1.

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$PwshPath = Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps\pwsh.exe'
if (-not (Test-Path $PwshPath)) {
    $PwshPath = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
}
if (-not $PwshPath) {
    $PwshPath = (Get-Command powershell -ErrorAction Stop).Source
}

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 10)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

function Register-GuardTask {
    param(
        [string]$TaskName,
        [string]$ScriptRelativePath,
        [datetime]$At,
        [string]$Description
    )

    $scriptPath = Join-Path $RepoRoot $ScriptRelativePath
    if (-not (Test-Path $scriptPath)) {
        throw "Guard script not found: $scriptPath"
    }

    $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existing) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "Removed existing task '$TaskName'" -ForegroundColor Yellow
    }

    $action = New-ScheduledTaskAction `
        -Execute $PwshPath `
        -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -Daily -At $At

    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $Settings `
        -Principal $Principal `
        -Description $Description | Out-Null

    Write-Host "[OK] Registered $TaskName -> $scriptPath at $($At.ToString('HH:mm'))" -ForegroundColor Green
}

Register-GuardTask `
    -TaskName 'StarlightAPIKeyMonitor' `
    -ScriptRelativePath 'scripts\api-usage-monitor.ps1' `
    -At ([datetime]'04:00') `
    -Description 'Daily LLM API key health and usage monitor.'

Register-GuardTask `
    -TaskName 'StarlightSecretScan' `
    -ScriptRelativePath 'scripts\api-secret-scan.ps1' `
    -At ([datetime]'04:30') `
    -Description 'Daily secret leak scan across active Starlight repos.'

Register-GuardTask `
    -TaskName 'StarlightSubstrateBackup' `
    -ScriptRelativePath 'scripts\run-restic-backup.ps1' `
    -At ([datetime]'02:15') `
    -Description 'Daily restic backup of SIS substrate and local Starlight memory.'

Write-Host ''
Write-Host 'Guard task registration complete.' -ForegroundColor Green
