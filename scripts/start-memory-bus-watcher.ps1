# Memory Bus health probe
# Memory Bus is a stdio MCP server. It should be launched by an MCP host, not
# detached as a daemon. This script validates that the server can answer a
# one-shot JSON-RPC health request.

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$serverPath = Join-Path $repoRoot "private\memory-bus\server.py"

if (-not (Test-Path $serverPath)) {
    Write-Error "Memory Bus server.py not found at: $serverPath"
    exit 1
}

$request = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"memory_health","arguments":{}}}'
$requestPath = [System.IO.Path]::GetTempFileName()
try {
    Set-Content -LiteralPath $requestPath -Value $request -Encoding ASCII -NoNewline
    $response = cmd /c "type ""$requestPath"" | python ""$serverPath""" | Select-Object -First 1
} finally {
    Remove-Item -LiteralPath $requestPath -Force -ErrorAction SilentlyContinue
}

if ($response -notmatch 'healthy') {
    Write-Error "Memory Bus health probe failed: $response"
    exit 1
}

Write-Host "Memory Bus health probe passed" -ForegroundColor Green
