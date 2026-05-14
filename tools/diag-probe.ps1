[CmdletBinding()]
param(
    [string]$DashboardApp  = 'C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\apps\dashboard\app',
    [string]$VoiceOperator = 'C:\Users\frank\Starlight-Intelligence-System\private\voice-operator',
    [string]$PrivateRoot   = 'C:\Users\frank\Starlight-Intelligence-System\private'
)

# diag-probe.ps1 — port + filesystem probes for SIS dashboards (:7373, :3007)
# plus dashboard/app, voice-operator, and Starlight Task Scheduler entries.
# Idempotent — read-only network + filesystem probes, re-run = same result.

$ErrorActionPreference = 'Continue'

function Probe($url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 8
    "{0,-50} OK status={1} bytes={2}" -f $url, $r.StatusCode, $r.RawContentLength
  } catch {
    "{0,-50} ERR {1}" -f $url, $_.Exception.Message
  }
}

Write-Host "=== :7373 FastAPI probes ==="
Probe 'http://127.0.0.1:7373/'
Probe 'http://127.0.0.1:7373/health'
Probe 'http://127.0.0.1:7373/docs'
Probe 'http://127.0.0.1:7373/openapi.json'

Write-Host ""
Write-Host "=== :3007 dashboard probes ==="
Probe 'http://127.0.0.1:3007/'
Probe 'http://127.0.0.1:3007/brain'
Probe 'http://127.0.0.1:3007/mission-control'
Probe 'http://127.0.0.1:3007/council'
Probe 'http://127.0.0.1:3007/vaults/loop'
Probe 'http://127.0.0.1:3007/trace'
Probe 'http://127.0.0.1:3007/packs'
Probe 'http://127.0.0.1:3007/decisions'
Probe 'http://127.0.0.1:3007/agents'
Probe 'http://127.0.0.1:3007/tooling'

Write-Host ""
Write-Host "=== dashboard app/ routes ==="
if (Test-Path $DashboardApp) {
  Get-ChildItem $DashboardApp -Directory | ForEach-Object { "  - {0}" -f $_.Name }
}

Write-Host ""
Write-Host "=== voice-operator dirs ==="
if (Test-Path $VoiceOperator) {
  Get-ChildItem $VoiceOperator -Directory | ForEach-Object { "  - {0}" -f $_.Name }
  Get-ChildItem $VoiceOperator -File -Filter '*.py' -ErrorAction SilentlyContinue | Select-Object -First 10 | ForEach-Object { "    py: {0}" -f $_.Name }
} else {
  Write-Host "  no private/voice-operator"
  Get-ChildItem $PrivateRoot -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match 'voice|orb|cockpit|cognition' } |
    ForEach-Object { "  candidate: {0}" -f $_.FullName }
}

Write-Host ""
Write-Host "=== Starlight Task Scheduler entries ==="
schtasks /Query /FO LIST 2>$null | Select-String -Pattern '^TaskName:.*(Starlight|Cockpit|Voice|Orb|Brain|Jarvis|7373)' | Select-Object -First 30 | ForEach-Object { $_.Line }
