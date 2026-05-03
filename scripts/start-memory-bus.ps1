# Memory Bus singleton launcher
# Stdio MCP server fronting voice-operator memory substrate.
# Solves the AgentDB-per-tab failure mode (project_agentdb_singleton_constraint.md).

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$serverPath = Join-Path $repoRoot "private\memory-bus\server.py"

if (-not (Test-Path $serverPath)) {
    Write-Error "Memory Bus server.py not found at: $serverPath"
    exit 1
}

Write-Host "Memory Bus starting from $serverPath" -ForegroundColor Cyan
python $serverPath
