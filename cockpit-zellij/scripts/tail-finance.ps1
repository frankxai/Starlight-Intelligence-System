# cockpit-zellij/scripts/tail-finance.ps1 — tails today's revenue snapshot JSONL.

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SisRoot  = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
$FinDir   = Join-Path $SisRoot 'memory\_audit\finance'

if (-not (Test-Path $FinDir)) {
    New-Item -ItemType Directory -Path $FinDir -Force | Out-Null
}

Write-Host '=== Revenue snapshot tail ===' -ForegroundColor Cyan
Write-Host "Directory: $FinDir"
Write-Host ''

$today = (Get-Date).ToString('yyyy-MM-dd')
$logFile = Join-Path $FinDir "$today.jsonl"

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
