# cockpit-zellij/scripts/tail-yolo.ps1 — live tail of the /yolo Hive session audit log
#
# /yolo audit logs live at memory/_audit/yolo/<session-id>.jsonl. This script finds
# the most recent session log and tails it, so the /yolo Zellij workspace gets
# real-time visibility into what the conductor is doing across the session.
#
# Invoked by the Audit tab in cockpit-zellij/layouts/yolo.kdl.

$ErrorActionPreference = 'Stop'

$SisRoot  = 'C:\Users\frank\Starlight-Intelligence-System'
$YoloDir  = Join-Path $SisRoot 'memory\_audit\yolo'

if (-not (Test-Path $YoloDir)) {
    New-Item -ItemType Directory -Path $YoloDir -Force | Out-Null
}

Write-Host "=== /yolo Hive audit tail ===" -ForegroundColor Cyan
Write-Host "Directory: $YoloDir"
Write-Host "Watching for session JSONLs (Ctrl+C to exit)"
Write-Host ''

# Find the most recent JSONL (excluding _drift.jsonl which has its own tail)
$mostRecent = Get-ChildItem -Path $YoloDir -Filter '*.jsonl' -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne '_drift.jsonl' } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $mostRecent) {
    Write-Host '(no session logs yet — waiting for first /yolo session...)' -ForegroundColor Yellow
    # Poll for first session log
    while (-not $mostRecent) {
        Start-Sleep -Seconds 2
        $mostRecent = Get-ChildItem -Path $YoloDir -Filter '*.jsonl' -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -ne '_drift.jsonl' } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
    }
    Write-Host "First session detected: $($mostRecent.Name)" -ForegroundColor Green
    Write-Host ''
}

Write-Host "Tailing: $($mostRecent.FullName)" -ForegroundColor Green
Get-Content -Path $mostRecent.FullName -Wait -Tail 20
