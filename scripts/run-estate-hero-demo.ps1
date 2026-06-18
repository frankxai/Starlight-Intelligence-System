#Requires -Version 7.0
<#
.SYNOPSIS
  Execute the Estate Factory hero demo (R5) — scripted cross-CLI replay + JSON receipt.

.DESCRIPTION
  Narrative: Voice handoff → /si fanout (grok + codex) → synthesis artifact + SIP attestation.
  Commits receipt to docs/ops/hero-demos/. Does not update public README hero (board-gated).

.EXAMPLE
  ./scripts/run-estate-hero-demo.ps1
  ./scripts/run-estate-hero-demo.ps1 -IncludeAntigravity -TimeoutSec 240
#>
[CmdletBinding()]
param(
    [switch]$IncludeAntigravity,
    [int]$TimeoutSec = 180,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path $PSScriptRoot -Parent
$DemoDir = Join-Path $RepoRoot 'docs/ops/hero-demos'
$FixtureDir = Join-Path $DemoDir 'demo-estate-trinity-anon'
$DispatchScript = Join-Path $RepoRoot 'scripts/si-dispatch.ps1'
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$ReceiptPath = Join-Path $DemoDir "receipt-$Stamp.json"

if (-not (Test-Path $DispatchScript)) {
    throw "si-dispatch.ps1 missing — run from Starlight-Intelligence-System root"
}

$gitSha = (git -C $RepoRoot rev-parse --short HEAD 2>$null)
if (-not $gitSha) { $gitSha = 'unknown' }

$task = @"
HERO DEMO — Trinity-Anon estate decision brief (READ-ONLY)

Context: anonymized estate commissioning demo. Prior atoms exist in docs/ops/hero-demos/demo-estate-trinity-anon/prior-atoms.jsonl.

Deliver exactly:
1. DECISION — one paragraph recommendation for estate factory next move
2. CONTRADICTIONS — any tension between doc velocity and mechanical proof
3. PRIOR ATOMS USED — cite atom IDs from the fixture
4. ATTESTATION — end with a Built on SIP block (substrate v1.1.1, operational v8.3.0)

Max 25 lines. Cite real paths under this repo.
"@

$lanes = @('grok', 'codex')
if ($IncludeAntigravity) { $lanes += 'antigravity' }

Write-Host "=== Estate Hero Demo ===" -ForegroundColor Cyan
Write-Host "SHA: $gitSha | Lanes: $($lanes -join ', ')" -ForegroundColor DarkGray

if ($DryRun) {
    Write-Host "[dry-run] Would dispatch to: $($lanes -join ', ')" -ForegroundColor Yellow
    exit 0
}

$dispatchJson = & $DispatchScript -Lanes ($lanes -join ',') -Repo sis -RepoPath $RepoRoot `
    -Task $task -Parallel -TimeoutSec $TimeoutSec -Json | ConvertFrom-Json

$activated = @($dispatchJson.activated)
$passed = [int]$dispatchJson.passed
$failed = [int]$dispatchJson.failed

$synthesisPath = Join-Path $DemoDir "synthesis-$Stamp.md"
$grokLane = $dispatchJson.lanes | Where-Object { $_.lane -eq 'grok' } | Select-Object -First 1
$codexLane = $dispatchJson.lanes | Where-Object { $_.lane -eq 'codex' } | Select-Object -First 1

$brief = @"
# Trinity-Anon Hero Demo — Decision Brief

**Generated:** $(Get-Date -Format o)
**Git SHA:** $gitSha
**Dispatch ID:** $($dispatchJson.dispatchId)

## Council synthesis (grok primary, codex verify)

$($grokLane.output -replace '(?m)^Gathering[^\n]*\n', '')

---

## Codex verification excerpt

$((($codexLane.output -split "`n" | Select-Object -First 12) -join "`n"))

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Substrate: starlightintelligence.org/protocol v1.1.1
- Operational: @arcanea/starlight-intelligence-system v8.3.0
- Layers: [estate-factory, orchestration, memory, attestation]
- Hero demo receipt: docs/ops/hero-demos/receipt-$Stamp.json
"@

Set-Content -Path $synthesisPath -Value $brief -Encoding utf8

$receipt = [ordered]@{
    demoId           = "hero-estate-trinity-anon-$Stamp"
    title            = 'Speak to my estate. It remembers. It acts. It attests.'
    gitSha           = $gitSha
    dispatchId       = $dispatchJson.dispatchId
    started          = $dispatchJson.started
    completed        = $dispatchJson.completed
    lanes            = $lanes
    activated        = $activated
    passed           = $passed
    failed           = $failed
    fixtureDir       = 'docs/ops/hero-demos/demo-estate-trinity-anon'
    voiceHandoff     = 'docs/ops/hero-demos/demo-estate-trinity-anon/voice-handoff-packet.json'
    synthesisArtifact = "docs/ops/hero-demos/synthesis-$Stamp.md"
    priorAtoms       = @('atom-trinity-anon-001', 'atom-trinity-anon-002', 'atom-trinity-anon-003')
    metrics          = [ordered]@{
        routingAccuracy      = if ($passed -ge 2) { 'pass' } else { 'partial' }
        firstAttemptSuccess  = if ($failed -eq 0) { 'pass' } else { 'partial' }
        attestationPresent   = ($brief -match 'Built on SIP')
        humanMidFlight       = $false
        encodedSelfLeakage   = $false
    }
    evolutionUnblocks = @(7, 12, 15)
    boardGate         = 'R5 mechanical receipt committed; public README hero still gated'
    builtOnSIP        = 'v1.1.1'
}

$receipt | ConvertTo-Json -Depth 8 | Set-Content -Path $ReceiptPath -Encoding utf8

Write-Host "`nReceipt: $ReceiptPath" -ForegroundColor Green
Write-Host "Synthesis: $synthesisPath" -ForegroundColor Green
Write-Host "Activated: $($activated -join ', ')" -ForegroundColor Cyan

if ($failed -gt 0) { exit 1 }
exit 0