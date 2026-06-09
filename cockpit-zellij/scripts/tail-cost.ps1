# cockpit-zellij/scripts/tail-cost.ps1 — tails today's cost snapshot JSONL.

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SisRoot  = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
$CostDir  = Join-Path $SisRoot 'memory\_audit\cost'

if (-not (Test-Path $CostDir)) {
    New-Item -ItemType Directory -Path $CostDir -Force | Out-Null
}

Write-Host '=== Cost snapshot tail ===' -ForegroundColor Cyan
Write-Host "Directory: $CostDir"
Write-Host ''

$today = (Get-Date).ToString('yyyy-MM-dd')
$logFile = Join-Path $CostDir "$today.jsonl"

if (-not (Test-Path $logFile)) {
    Write-Host "(no snapshot for $today yet — waiting for first cron run)" -ForegroundColor Yellow
    while (-not (Test-Path $logFile)) {
        Start-Sleep -Seconds 30
    }
    Write-Host "Snapshot detected for $today" -ForegroundColor Green
    Write-Host ''
}

Write-Host "Tailing: $logFile" -ForegroundColor Green
Get-Content -Path $logFile -Wait -Tail 20
