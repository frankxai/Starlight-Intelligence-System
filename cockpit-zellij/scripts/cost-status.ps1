# cockpit-zellij/scripts/cost-status.ps1 — month-to-date cost summary panel.

$ErrorActionPreference = 'Stop'

$SisRoot  = 'C:\Users\frank\Starlight-Intelligence-System'
$CostDir  = Join-Path $SisRoot 'memory\_audit\cost'
$ConfigPath = Join-Path $SisRoot 'cost-plane-config.json'

while ($true) {
    Clear-Host
    Write-Host '=== Cost plane — month-to-date ===' -ForegroundColor Cyan
    Write-Host ''

    if (-not (Test-Path $ConfigPath)) {
        Write-Host 'cost-plane-config.json not found' -ForegroundColor Red
        Start-Sleep -Seconds 30
        continue
    }

    $config = Get-Content -Path $ConfigPath -Raw | ConvertFrom-Json
    $monthPrefix = (Get-Date).ToString('yyyy-MM')

    if (-not (Test-Path $CostDir)) {
        Write-Host '(no snapshots captured yet)' -ForegroundColor Yellow
        Start-Sleep -Seconds 60
        continue
    }

    $files = Get-ChildItem -Path $CostDir -Filter "$monthPrefix-*.jsonl" -ErrorAction SilentlyContinue
    if (-not $files) {
        Write-Host "(no snapshots for $monthPrefix yet)" -ForegroundColor Yellow
        Start-Sleep -Seconds 60
        continue
    }

    $totals = @{}
    foreach ($source in $config.sources_phase_1) {
        $totals[$source] = 0.0
    }

    foreach ($f in $files) {
        $lines = Get-Content -Path $f.FullName
        foreach ($line in $lines) {
            try {
                $entry = $line | ConvertFrom-Json
                if ($totals.ContainsKey($entry.source)) {
                    $totals[$entry.source] += [double]$entry.cost_usd
                }
            } catch {
                # malformed line, skip
            }
        }
    }

    Write-Host ("Month: {0}" -f $monthPrefix)
    Write-Host ("Snapshots captured: {0}" -f $files.Count)
    Write-Host ''
    Write-Host 'Spend by source:'
    $monthTotal = 0.0
    foreach ($source in $config.sources_phase_1) {
        $amt = [math]::Round($totals[$source], 2)
        $cap = $config.thresholds.$source.daily_usd_cap * 30
        $pctOfMonthlyCap = if ($cap -gt 0) { [math]::Round(($amt / $cap) * 100, 1) } else { 0 }
        $colour = if ($pctOfMonthlyCap -gt 80) { 'Red' } elseif ($pctOfMonthlyCap -gt 50) { 'Yellow' } else { 'Green' }
        Write-Host ('  {0,-12} ${1,8:N2}  ({2,5}% of monthly cap)' -f $source, $amt, $pctOfMonthlyCap) -ForegroundColor $colour
        $monthTotal += $amt
    }
    Write-Host '  ────────────────────'
    Write-Host ('  Total       ${0,8:N2}' -f $monthTotal) -ForegroundColor White

    Write-Host ''
    Write-Host 'Refreshing in 60s... (Ctrl+C to exit)' -ForegroundColor DarkGray
    Start-Sleep -Seconds 60
}
