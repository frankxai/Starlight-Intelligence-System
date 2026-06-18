# Register the repo portfolio audit as a daily Windows scheduled task.
#
# Runs tools/audit-repo-portfolio.ps1 daily at 02:30 local time (before the
# Cross-Repo Indexer at 03:00 so /fleet shows fresh data). Idempotent.
#
# The audit writes:
#   memory/_audit/repo-portfolio-<YYYY-MM-DD>.json
#   docs/ops/REPO-PORTFOLIO-AUDIT-<YYYY-MM-DD>.md
#
# Dashboard /api/fleet picks up the latest by glob.

$ErrorActionPreference = 'Stop'

$TaskName    = 'StarlightPortfolioAudit'
$RepoRoot    = (Resolve-Path "$PSScriptRoot\..").Path
$ScriptPath  = Join-Path $RepoRoot 'tools\audit-repo-portfolio.ps1'

if (-not (Test-Path $ScriptPath)) {
    throw "Audit script not found at $ScriptPath"
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
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""

$Trigger = New-ScheduledTaskTrigger -Daily -At 2:30am

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description 'Daily repo portfolio audit: scans ~/, classifies repos by recency, writes memory/_audit/repo-portfolio-<date>.json. Feeds /fleet dashboard. Built on SIP.' | Out-Null

Write-Host "[OK] Registered scheduled task '$TaskName'" -ForegroundColor Green
Write-Host "     Runs daily at 02:30 (local time)"
Write-Host "     Audit script: $ScriptPath"
Write-Host ''
Write-Host "Verify:  Get-ScheduledTask -TaskName $TaskName"
Write-Host "Run now: Start-ScheduledTask -TaskName $TaskName"
