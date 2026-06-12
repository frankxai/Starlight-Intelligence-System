# Register the dreaming-pipeline cron as a daily Windows scheduled task.
#
# Runs scripts/dreaming-cron.ps1 daily at 04:00 local — matches the receipt
# pattern in memory/CONSOLIDATION_LOG.md (2026-05-11 onward). Idempotent.
#
# The cron writes:
#   memory/CONSOLIDATION_LOG.md       (1-line receipt per run)
#   memory/PROMOTION_QUEUE.md         (new wisdom-promotion candidates)
#   memory/.dreaming-state.json       (dedup state, gitignored)
#
# Closes audit N3 (run 4, 2026-05-28): "Windows scheduled task 'Starlight
# Dreaming' not registered" — schtasks /Query returned file not found.

$ErrorActionPreference = 'Stop'

$TaskName    = 'StarlightDreaming'
$RepoRoot    = (Resolve-Path "$PSScriptRoot\..").Path
$ScriptPath  = Join-Path $RepoRoot 'scripts\dreaming-cron.ps1'

if (-not (Test-Path $ScriptPath)) {
    throw "Dreaming cron script not found at $ScriptPath"
}

$pwshPath = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
if (-not $pwshPath) {
    $pwshPath = (Get-Command powershell -ErrorAction Stop).Source
    Write-Warning "pwsh not found, falling back to $pwshPath"
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task '$TaskName'" -ForegroundColor Yellow
}

$Action = New-ScheduledTaskAction `
    -Execute $pwshPath `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""

$Trigger = New-ScheduledTaskTrigger -Daily -At 4:00am

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
    -Description 'Daily dreaming-pipeline consolidation: extracts insights from sessions + audit-log, identifies cross-vault wisdom-promotion candidates, queues them for human review. Built on SIP.' | Out-Null

Write-Host "[OK] Registered scheduled task '$TaskName'" -ForegroundColor Green
Write-Host "     Runs daily at 04:00 (local time)"
Write-Host "     Cron script: $ScriptPath"
Write-Host ''
Write-Host "Verify:  Get-ScheduledTask -TaskName $TaskName"
Write-Host "Run now: Start-ScheduledTask -TaskName $TaskName"
Write-Host "Receipts: tail -5 memory/CONSOLIDATION_LOG.md"
Write-Host "Queue:    cat memory/PROMOTION_QUEUE.md"
