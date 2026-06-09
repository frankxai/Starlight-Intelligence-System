# cockpit-zellij/scripts/tail-audit.ps1 -- live tail of the Memory Bus audit log
#
# The audit log at memory/_audit/<yyyy-MM-dd>.jsonl is the cross-agent activity feed:
# every commit through Memory Bus (Claude tabs + future Codex/Gemini wiring) appends
# a line. Tailing it in a dedicated pane gives real-time visibility into what the
# other agents are doing -- the closest thing to a shared event bus today.
#
# Invoked by the Audit tab in every per-project Zellij layout.
# SIS-anchored: the audit log only lives in Starlight-Intelligence-System, not in
# each project repo.

$ErrorActionPreference = 'Stop'

$SisRoot  = 'C:\Users\frank\Starlight-Intelligence-System'
$AuditDir = Join-Path $SisRoot 'memory\_audit'

if (-not (Test-Path $AuditDir)) {
    New-Item -ItemType Directory -Path $AuditDir -Force | Out-Null
}

$today    = (Get-Date).ToString('yyyy-MM-dd')
$logFile  = Join-Path $AuditDir "$today.jsonl"

if (-not (Test-Path $logFile)) {
    New-Item -ItemType File -Path $logFile -Force | Out-Null
}

Write-Host "=== Memory Bus audit tail ===" -ForegroundColor Cyan
Write-Host "File: $logFile"
Write-Host "Date: $today (Ctrl+C to exit)"
Write-Host ''

Get-Content -Path $logFile -Wait -Tail 20
