# scripts/cron/proving-ground-cadence.ps1 — Starlight Proving Ground cadence entry.
#
# The "continuous" half of the Starlight Queen loop (Board verdict 2026-06-10,
# ROUTING-DOCTRINE.md §Cadence). Mirrors daily-cost-snapshot.ps1.
#
# Wire via Windows Task Scheduler as "StarlightProvingGround":
#   - Monthly (full system scorecard) — runs the mechanically-verifiable lanes and
#     stamps a staleness check against scorecards/*.json::nextRunDue.
# This script runs the JUDGE-FREE lanes (harness, retrieval, substrate) that need no
# model dispatch, and flags if the latest scorecard is past nextRunDue. The model lane
# (arena rounds) stays human-triggered via /starlight-eval to keep model spend deliberate.
#
# Logs: memory/_audit/proving-ground/_cron.log (append-only)

$ErrorActionPreference = 'Continue'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SisRoot = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
Set-Location $SisRoot

$PgDir = Join-Path $SisRoot 'memory\_audit\proving-ground'
if (-not (Test-Path $PgDir)) { New-Item -ItemType Directory -Path $PgDir -Force | Out-Null }

$LogPath = Join-Path $PgDir '_cron.log'
$Ts = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
Add-Content -Path $LogPath -Value "[$Ts] === proving-ground-cadence starting ==="

# --- Staleness check (R1): is the latest scorecard past nextRunDue? ---
try {
    $latest = Get-ChildItem (Join-Path $SisRoot 'tools\proving-ground\scorecards\*.json') |
        Sort-Object Name -Descending | Select-Object -First 1
    if ($latest) {
        $card = Get-Content $latest.FullName -Raw | ConvertFrom-Json
        $due = [datetime]$card.nextRunDue
        if ((Get-Date) -gt $due) {
            Add-Content -Path $LogPath -Value "[$Ts] STALE: latest scorecard nextRunDue=$($card.nextRunDue) is past. Run /starlight-eval."
        } else {
            Add-Content -Path $LogPath -Value "[$Ts] FRESH: next run due $($card.nextRunDue)."
        }
    }
} catch {
    Add-Content -Path $LogPath -Value "[$Ts] staleness check error: $_"
}

# --- Judge-free lanes (no model spend): harness + retrieval + substrate ---
try {
    Add-Content -Path $LogPath -Value "[$Ts] running judge-free lanes (harness, retrieval, substrate)..."
    $harness = & node 'tools/run-v01-evals.mjs' 2>&1
    Add-Content -Path $LogPath -Value $harness
    $retrieval = & node '--import' 'tsx' '--test' 'test/retrieval-eval.test.ts' 2>&1
    Add-Content -Path $LogPath -Value $retrieval
    Add-Content -Path $LogPath -Value "[$Ts] === proving-ground-cadence done (model lane is /starlight-eval-triggered) ==="
    exit 0
} catch {
    Add-Content -Path $LogPath -Value "[$Ts] === error: $_ ==="
    exit 1
}
