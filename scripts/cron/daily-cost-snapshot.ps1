# scripts/cron/daily-cost-snapshot.ps1 — daily cost-plane snapshot entry.
#
# Wired via Windows Task Scheduler (or cron daemon on POSIX) to run
# at 02:30 Europe/Paris per cost-plane-config.json::schedule.
#
# Runs: npx tsx src/infra/cost-snapshot.ts
# Logs: memory/_audit/cost/_cron.log (append-only)

$ErrorActionPreference = 'Continue'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SisRoot = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
Set-Location $SisRoot

$CostDir = Join-Path $SisRoot 'memory\_audit\cost'
if (-not (Test-Path $CostDir)) {
    New-Item -ItemType Directory -Path $CostDir -Force | Out-Null
}

$LogPath = Join-Path $CostDir '_cron.log'
$Ts = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')

Add-Content -Path $LogPath -Value "[$Ts] === daily-cost-snapshot starting ==="

try {
    $output = & npx tsx 'src/infra/cost-snapshot.ts' 2>&1
    $exitCode = $LASTEXITCODE
    Add-Content -Path $LogPath -Value $output
    Add-Content -Path $LogPath -Value "[$Ts] === exit code: $exitCode ==="
    exit $exitCode
} catch {
    Add-Content -Path $LogPath -Value "[$Ts] === error: $_ ==="
    exit 1
}
