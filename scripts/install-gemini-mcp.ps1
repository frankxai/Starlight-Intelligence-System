param()

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
$repoRootPath = $repoRoot.Path
$settingsDir = Join-Path $HOME '.gemini'
$settingsPath = Join-Path $settingsDir 'settings.json'
$harnessPath = Join-Path $repoRootPath 'core\orchestrator\harnesses\gemini\mcp-config.json'
$mcpServerPath = Join-Path $repoRootPath 'dist\starlight-mcp.js'

if (-not (Test-Path $harnessPath)) {
    throw "Canonical Gemini harness config not found at $harnessPath"
}

if (-not (Test-Path $mcpServerPath)) {
    throw "Compiled MCP server not found at $mcpServerPath. Run npm run build first."
}

$harnessConfig = Get-Content -Raw -Path $harnessPath | ConvertFrom-Json -AsHashtable
$starlightServer = $harnessConfig['mcpServers']['starlight-substrate']

if (-not $starlightServer) {
    throw "Harness config does not define mcpServers.starlight-substrate."
}

$liveConfig = if (Test-Path $settingsPath) {
    Get-Content -Raw -Path $settingsPath | ConvertFrom-Json -AsHashtable
} else {
    @{}
}

if (-not $liveConfig.ContainsKey('mcpServers')) {
    $liveConfig['mcpServers'] = @{}
}

$liveConfig['mcpServers']['starlight-substrate'] = @{
    command = 'node'
    args    = @($mcpServerPath)
    env     = @{
        STARLIGHT_MCP_MODE    = 'read-only'
        STARLIGHT_MCP_BREADTH = 'full'
    }
}

New-Item -ItemType Directory -Force -Path $settingsDir | Out-Null
$tmpPath = "$settingsPath.tmp"
$liveConfig | ConvertTo-Json -Depth 20 | Set-Content -Path $tmpPath -Encoding utf8
Move-Item -Force -Path $tmpPath -Destination $settingsPath

Write-Host "[OK] Gemini MCP config written to $settingsPath" -ForegroundColor Green
Write-Host "[OK] starlight-substrate -> node $mcpServerPath" -ForegroundColor Green

$listOutput = & gemini mcp list 2>&1
$exitCode = $LASTEXITCODE
if ($exitCode -ne 0) {
    Write-Host $listOutput
    throw "gemini mcp list failed with exit code $exitCode"
}

if ($listOutput -match 'No MCP servers configured') {
    Write-Host $listOutput
    throw "Gemini still reports no MCP servers after install."
}

Write-Host "[OK] Gemini now lists starlight-substrate." -ForegroundColor Green
