# cockpit/test/bench.ps1 -- performance benchmark with regression detection
#
# Measures:
#   1. Hook write latency (single Write-CockpitSessionEvent call)
#   2. Snapshot capture wall-time
#   3. Manifest read for N=1000 rows
#   4. GC over N=10000 rows
#
# Output: benchmarks.json with timestamps, suitable for tracking trends.
# Regression: if any metric exceeds its budget by >2x, exits non-zero.

param(
    [string]$OutputJson,
    [switch]$NoRegressionCheck
)

$ErrorActionPreference = 'Stop'
$CockpitRoot = Split-Path -Parent $PSScriptRoot

# Sandbox
$sandbox = Join-Path ([System.IO.Path]::GetTempPath()) "cockpit-bench-$(Get-Random)"
$env:COCKPIT_HOME = $sandbox
$env:COCKPIT_RATE_LIMIT = '100000'  # don't let rate limiter affect bench
New-Item -ItemType Directory -Path $sandbox -Force | Out-Null

. (Join-Path $CockpitRoot 'scripts\manifest.ps1')

# Performance budgets (ms). Exceeding 2x = regression.
$budgets = @{
    'hook_write_ms_p50'    = 250    # one CIM query (~150ms) + JSON encode + append
    'hook_write_ms_p99'    = 500
    'snapshot_ms'          = 2000   # full process tree walk + JSON write
    'read_1k_ms'           = 500
    'gc_10k_ms'            = 5000   # 10k rows is the upper end; rotation kicks in at ~5MB anyway
}

$results = [ordered]@{
    cockpit_version = (Get-CockpitVersion)
    benchmark_at    = (Get-Date).ToUniversalTime().ToString('o')
    host            = $env:COMPUTERNAME
    ps_version      = $PSVersionTable.PSVersion.ToString()
}

Write-Host "=== Cockpit perf benchmark ===" -ForegroundColor Cyan
Write-Host "Sandbox: $sandbox" -ForegroundColor DarkGray
Write-Host ""

# ---------- Bench 1: hook write latency ----------
Write-Host "Bench 1: hook write latency (50 iterations)" -ForegroundColor Yellow
$writeMillis = @()
for ($i = 0; $i -lt 50; $i++) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    Write-CockpitSessionEvent -Event 'start' -Agent 'bench' -SessionId "bench-$i" -Cwd $env:USERPROFILE | Out-Null
    $sw.Stop()
    $writeMillis += $sw.Elapsed.TotalMilliseconds
}
$writeMillisSorted = $writeMillis | Sort-Object
$p50idx = [Math]::Min([int]([Math]::Floor($writeMillisSorted.Count * 0.5)), $writeMillisSorted.Count - 1)
$p99idx = [Math]::Min([int]([Math]::Floor($writeMillisSorted.Count * 0.99)), $writeMillisSorted.Count - 1)
$p50 = $writeMillisSorted[$p50idx]
$p99 = $writeMillisSorted[$p99idx]
$mean = ($writeMillis | Measure-Object -Average).Average
Write-Host ("  p50: {0:F1}ms   p99: {1:F1}ms   mean: {2:F1}ms" -f $p50, $p99, $mean)
$results['hook_write_ms_p50']  = [math]::Round($p50, 2)
$results['hook_write_ms_p99']  = [math]::Round($p99, 2)
$results['hook_write_ms_mean'] = [math]::Round($mean, 2)

# ---------- Bench 2: snapshot wall-time ----------
Write-Host ""
Write-Host "Bench 2: snapshot.ps1 wall time (5 iterations)" -ForegroundColor Yellow
$snapMillis = @()
for ($i = 0; $i -lt 5; $i++) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    & (Join-Path $CockpitRoot 'scripts\snapshot.ps1') -Terminal 'windows-terminal' | Out-Null
    $sw.Stop()
    $snapMillis += $sw.Elapsed.TotalMilliseconds
}
$snapMean = ($snapMillis | Measure-Object -Average).Average
Write-Host ("  mean: {0:F1}ms   min: {1:F1}ms   max: {2:F1}ms" -f $snapMean, ($snapMillis | Measure-Object -Minimum).Minimum, ($snapMillis | Measure-Object -Maximum).Maximum)
$results['snapshot_ms'] = [math]::Round($snapMean, 2)

# ---------- Bench 3: manifest read for N=1000 rows ----------
Write-Host ""
Write-Host "Bench 3: read 1000-row manifest" -ForegroundColor Yellow

# Generate 1000-row test manifest
$bigManifest = Join-Path $sandbox 'big-test.jsonl'
1..1000 | ForEach-Object {
    $row = @{
        schema = 'cockpit.session/v1'
        ts = (Get-Date).AddSeconds(-$_).ToUniversalTime().ToString('o')
        event = 'start'
        agent = 'bench'
        session_id = "bench-1k-$_"
        cwd = "C:\test\$_"
        pid = $_
        ppid_chain = @($_)
        host = $env:COMPUTERNAME
        user = $env:USERNAME
        project_key = "p$_"
    } | ConvertTo-Json -Compress
    Add-Content -Path $bigManifest -Value $row -Encoding utf8
}

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$rowCount = @(Read-CockpitManifest -Path $bigManifest).Count
$sw.Stop()
$readMs = $sw.Elapsed.TotalMilliseconds
Write-Host ("  rows: $rowCount   time: {0:F1}ms   ({1:F1}us/row)" -f $readMs, ($readMs * 1000 / $rowCount))
$results['read_1k_ms'] = [math]::Round($readMs, 2)
$results['read_1k_per_row_us'] = [math]::Round($readMs * 1000 / $rowCount, 2)

# ---------- Bench 4: GC over 10000 rows ----------
Write-Host ""
Write-Host "Bench 4: GC over 10k-row manifest" -ForegroundColor Yellow

# Generate 10000 rows; half are old stop events
$gcManifest = Get-CockpitManifestPath
Remove-Item -Path $gcManifest -ErrorAction SilentlyContinue
1..10000 | ForEach-Object {
    $isOld = ($_ % 2) -eq 0
    $ts = if ($isOld) {
        (Get-Date).AddDays(-90).ToUniversalTime().ToString('o')
    } else {
        (Get-Date).ToUniversalTime().ToString('o')
    }
    $event = if ($isOld) { 'stop' } else { 'start' }
    $row = @{
        schema = 'cockpit.session/v1'; ts = $ts; event = $event
        agent = 'bench-gc'; session_id = "gc-$_"; cwd = "/x"
        pid = $_; ppid_chain = @($_)
    } | ConvertTo-Json -Compress
    Add-Content -Path $gcManifest -Value $row -Encoding utf8
}

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$gcResult = Invoke-CockpitManifestGC -RetentionDays 30
$sw.Stop()
$gcMs = $sw.Elapsed.TotalMilliseconds
Write-Host ("  dropped: $($gcResult.DroppedRows)   time: {0:F1}ms   reclaimed: {1} bytes" -f $gcMs, $gcResult.BytesSaved)
$results['gc_10k_ms']            = [math]::Round($gcMs, 2)
$results['gc_10k_dropped']       = $gcResult.DroppedRows
$results['gc_10k_bytes_saved']   = $gcResult.BytesSaved

# ---------- Regression check ----------
Write-Host ""
Write-Host "=== Regression vs budget ===" -ForegroundColor Cyan
$regressions = @()
foreach ($k in $budgets.Keys) {
    $actual = $results[$k]
    $budget = $budgets[$k]
    $ratio = if ($budget -gt 0) { $actual / $budget } else { 0 }
    $color = if ($ratio -lt 1.0) { 'Green' } elseif ($ratio -lt 2.0) { 'Yellow' } else { 'Red' }
    $tag = if ($ratio -lt 1.0) { 'OK' } elseif ($ratio -lt 2.0) { 'WARN' } else { 'REGRESS' }
    Write-Host ("  [{0}] {1,-25} actual={2,8:F1}ms   budget={3,7:F1}ms   ({4:F2}x)" -f $tag, $k, $actual, $budget, $ratio) -ForegroundColor $color
    if ($ratio -ge 2.0) {
        $regressions += @{ Metric = $k; Actual = $actual; Budget = $budget }
    }
}

# Persist
$results['regressions'] = $regressions
if ($OutputJson) {
    $results | ConvertTo-Json -Depth 4 | Set-Content -Path $OutputJson -Encoding utf8
    Write-Host ""
    Write-Host "Wrote: $OutputJson" -ForegroundColor DarkGray
}

# Cleanup
Remove-Item -Path $sandbox -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
if ($regressions.Count -eq 0) {
    Write-Host "=== BENCH OK -- no regressions ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=== BENCH FAILED -- $($regressions.Count) regression(s) ===" -ForegroundColor Red
    if (-not $NoRegressionCheck) { exit 1 }
    exit 0
}
