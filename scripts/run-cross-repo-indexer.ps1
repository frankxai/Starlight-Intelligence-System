# Cross-Repo Memory Indexer launcher
# Crawls ~/.claude/projects/*/memory/ into Memory Bus.
# Idempotent — sidecar state at ~/.memory-bus-indexer-state.json.

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$indexerDir = Join-Path $repoRoot "private\memory-bus"

if (-not (Test-Path $indexerDir)) {
    Write-Error "Indexer not found at: $indexerDir"
    exit 1
}

Set-Location $indexerDir
Write-Host "Cross-Repo Indexer running from $indexerDir" -ForegroundColor Cyan
python -m indexer --all
