[CmdletBinding()]
param(
    [string]$PackagesRoot = 'C:\Users\frank\Arcanea\packages',
    [string[]]$Names = @(
        'arcanea-voice','arcanea-voice-agent','starlight-runtime','memory-mcp',
        'arcanea-mcp','intelligence-bridge','presence','flow-engine','agent-bus',
        'guardian-memory','hybrid-memory','swarm-coordinator','arcanea-hooks',
        'arcanea-skills','council','orchestrator','overlay-claude','peak-performance',
        'arcanea-registry-mcp','publishing-house-mcp'
    )
)

# arcanea-pkg-inventory.ps1 — quick per-package inventory of named Arcanea
# subpackages: src file count, last-write date, and package.json description.
# Idempotent — read-only filesystem + package.json inspection, re-run = same result.

$ErrorActionPreference = 'Stop'

foreach ($n in $Names) {
    $p = Join-Path $PackagesRoot $n
    if (Test-Path $p) {
        $pkg = Join-Path $p 'package.json'
        $desc = ''
        if (Test-Path $pkg) {
            try { $desc = (Get-Content $pkg -Raw | ConvertFrom-Json).description } catch { $desc = '(parse-fail)' }
        }
        $srcCount = (Get-ChildItem $p -Recurse -Include *.ts,*.tsx,*.js -EA SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules|dist|\.next' }).Count
        $lastWrite = (Get-Item $p).LastWriteTime.ToString('yyyy-MM-dd')
        "{0,-26} files={1,-4} mod={2} desc='{3}'" -f $n, $srcCount, $lastWrite, $desc
    }
}
