#Requires -Version 7.0
<#
.SYNOPSIS
  Starlight council orchestration — dispatch, collect receipts, optional synthesis.

.DESCRIPTION
  Flow: classify task → fanout to named lanes → write eval ledger → print activation truth table.

.EXAMPLE
  ./scripts/si-council.ps1 -Seats grok,codex,antigravity -Mode audit -Repo sis

.EXAMPLE
  ./scripts/si-council.ps1 -Seats grok,codex -Task "Quick SIS ping" -Parallel -Json
#>
[CmdletBinding()]
param(
    [Parameter()]
    [string]$Task,

    [Parameter()]
    [Alias('Lanes', 'Seat')]
    [string[]]$Seats = @('grok', 'codex', 'antigravity'),

    [Parameter()]
    [ValidateSet('audit', 'ping', 'custom')]
    [string]$Mode = 'audit',

    [Parameter()]
    [ValidateSet('sis', 'fx', 'arc', 'app', 'acos', 'g', 'vc', 'ani', 'dpi', 'brain', 'prompts', 'studio', '.')]
    [string]$Repo = 'sis',

    [Parameter()]
    [string]$RepoPath,

    [Parameter()]
    [switch]$Parallel,

    [Parameter()]
    [int]$TimeoutSec = 240,

    [Parameter()]
    [switch]$Json,

    [Parameter()]
    [string]$OutDir = (Join-Path (Split-Path $PSScriptRoot -Parent) 'agent-tools'),

    [Parameter()]
    [switch]$Synthesize
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$AuditTask = @'
STARLIGHT COUNCIL AUDIT — SIS repo health (READ-ONLY, no file edits)

Deliver exactly these sections:
1. STATE — branch, dirty count, version, last 5 commit themes
2. RECENT SHIPS — what landed since 2026-06-16 (estate-factory, estate-army-deploy, harness, MCP)? Coherent? Tested?
3. TEST TRUTH — package.json scripts, tests/, harnesses. What runs/passes? What is unverified?
4. GAPS — stale branches, untracked dirs, doc/version drift
5. QUALITY SCORE — 1-10 each: architecture, tests, docs, deploy readiness
6. TOP 3 FIXES — highest leverage next moves

Search for v15; if absent, state canonical version from package.json/CHANGELOG.
Cite real file paths. Under 40 lines total.
'@

$PingTask = @'
SIS ping (read-only): branch, dirty count, package version, agent count, skill-rule count.
Numbers + one-line labels only. Max 8 lines.
'@

if ($Seats.Count -eq 1 -and $Seats[0] -match ',') {
    $Seats = $Seats[0] -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

if (-not $Task) {
    $Task = switch ($Mode) {
        'audit' { $AuditTask }
        'ping'  { $PingTask }
        default { throw 'Mode=custom requires -Task' }
    }
}

$dispatch = Join-Path $PSScriptRoot 'si-dispatch.ps1'
if (-not (Test-Path $dispatch)) { throw "Missing $dispatch" }

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

$dispatchParams = @{
    Lanes      = $Seats
    Repo       = $Repo
    Task       = $Task
    TimeoutSec = $TimeoutSec
    Json       = $true
    Ledger     = $true
}
if ($RepoPath) { $dispatchParams.RepoPath = $RepoPath }
if ($Parallel) { $dispatchParams.Parallel = $true }

$receiptPath = Join-Path $OutDir "council-$stamp.json"
$raw = & $dispatch @dispatchParams 2>&1 | Out-String
$summary = $raw | ConvertFrom-Json
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $receiptPath -Encoding utf8

$truth = foreach ($lane in $summary.lanes) {
    [pscustomobject]@{
        seat        = $lane.lane
        activated   = [bool]$lane.ok
        cli         = $lane.cli
        model       = $lane.model
        modelSource = $lane.modelSource
        version     = $lane.version
        sessionId   = $lane.sessionId
        elapsedSec  = $lane.elapsed
        note        = $lane.captureNote
        error       = $lane.error
    }
}

$council = [ordered]@{
    councilId  = $summary.dispatchId
    mode       = $Mode
    repo       = $summary.repo
    repoPath   = $summary.repoPath
    started    = $summary.started
    completed  = $summary.completed
    seats      = $Seats
    activated  = $summary.activated
    skipped    = $summary.skipped
    truthTable = $truth
    receipt    = $receiptPath
    lanes      = $summary.lanes
}

if ($Synthesize) {
    $bullets = $summary.lanes | Where-Object { $_.ok } | ForEach-Object {
        $excerpt = ($_.output -split "`n" | Select-Object -First 20) -join "`n"
        "### $($_.lane) ($($_.model))`n$excerpt"
    }
    $council.synthesisPrompt = @"
You are Prime synthesizer. Merge these council seat outputs into one unified audit.
Preserve disagreements. Under 50 lines. Sections: STATE, SHIPS, TEST TRUTH, GAPS, SCORES, TOP 3.

$($bullets -join "`n`n---`n`n")
"@
}

$councilPath = Join-Path $OutDir "council-truth-$stamp.json"
$council | ConvertTo-Json -Depth 8 | Set-Content -Path $councilPath -Encoding utf8

if ($Json) {
    $council | ConvertTo-Json -Depth 8
} else {
    $seatCount = @($summary.lanes).Count
    Write-Host "`n=== Starlight Council — $($summary.passed)/$seatCount seats activated ===" -ForegroundColor Cyan
    Write-Host "Council ID: $($summary.dispatchId)" -ForegroundColor DarkGray
    Write-Host "Receipt: $receiptPath`n" -ForegroundColor DarkGray
    $truth | Format-Table seat, activated, cli, model, modelSource, elapsedSec, note -AutoSize
    Write-Host "Truth ledger: $councilPath" -ForegroundColor DarkCyan
    if ($Synthesize -and $council.Contains('synthesisPrompt')) {
        Write-Host "`n--- Prime synthesis prompt (pass to orchestrator) ---`n" -ForegroundColor Yellow
        Write-Host $council.synthesisPrompt
    }
}

if ($summary.failed -gt 0) { exit 1 }
exit 0