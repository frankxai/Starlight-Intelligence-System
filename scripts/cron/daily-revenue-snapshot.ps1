# scripts/cron/daily-revenue-snapshot.ps1 — daily revenue snapshot entry.
#
# Runs at 02:35 Paris (5 min after daily-cost-snapshot at 02:30).
# Snapshots Phase 1 sources (Stripe + Arcanea BV per Board REVISE-3).
#
# Runs: npx tsx src/finance/revenue-snapshot.ts
# Logs: memory/_audit/finance/_cron.log

$ErrorActionPreference = 'Continue'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SisRoot = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
Set-Location $SisRoot

$FinDir = Join-Path $SisRoot 'memory\_audit\finance'
if (-not (Test-Path $FinDir)) {
    New-Item -ItemType Directory -Path $FinDir -Force | Out-Null
}

$LogPath = Join-Path $FinDir '_cron.log'
$Ts = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')

Add-Content -Path $LogPath -Value "[$Ts] === daily-revenue-snapshot starting ==="

try {
    $output = & npx tsx 'src/finance/revenue-snapshot.ts' 2>&1
    $exitCode = $LASTEXITCODE
    Add-Content -Path $LogPath -Value $output
    Add-Content -Path $LogPath -Value "[$Ts] === exit code: $exitCode ==="
    exit $exitCode
} catch {
    Add-Content -Path $LogPath -Value "[$Ts] === error: $_ ==="
    exit 1
}
