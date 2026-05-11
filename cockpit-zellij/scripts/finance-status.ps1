# cockpit-zellij/scripts/finance-status.ps1 — month-to-date P&L + runway panel.

$ErrorActionPreference = 'Stop'

$SisRoot     = 'C:\Users\frank\Starlight-Intelligence-System'
$FinDir      = Join-Path $SisRoot 'memory\_audit\finance'
$CostDir     = Join-Path $SisRoot 'memory\_audit\cost'
$Registry    = Join-Path $SisRoot 'private\business-registry.json'

while ($true) {
    Clear-Host
    Write-Host '=== Finance — month-to-date ===' -ForegroundColor Cyan
    Write-Host ''

    if (-not (Test-Path $Registry)) {
        Write-Host 'private/business-registry.json not set up.' -ForegroundColor Yellow
        Write-Host ''
        Write-Host 'cp business-registry.template.json private/business-registry.json'
        Write-Host 'then fill in real entity values.'
        Start-Sleep -Seconds 60
        continue
    }

    $registry = Get-Content -Path $Registry -Raw | ConvertFrom-Json
    $monthPrefix = (Get-Date).ToString('yyyy-MM')

    Write-Host ("Month: {0}" -f $monthPrefix)
    Write-Host ''

    foreach ($entity in $registry.entities) {
        # Inflows from revenue snapshots
        $inflowsUsd = 0.0
        if (Test-Path $FinDir) {
            $files = Get-ChildItem -Path $FinDir -Filter "$monthPrefix-*.jsonl" -ErrorAction SilentlyContinue
            foreach ($f in $files) {
                foreach ($line in Get-Content -Path $f.FullName) {
                    try {
                        $snap = $line | ConvertFrom-Json
                        if ($snap.entity -eq $entity.name) {
                            $inflowsUsd += [double]$snap.amount_usd_equiv
                        }
                    } catch { }
                }
            }
        }

        # Outflows from cost snapshots (Phase 1: assume Arcanea BV operates SIS infra)
        $outflowsUsd = 0.0
        if ($entity.name -eq 'Arcanea BV' -and (Test-Path $CostDir)) {
            $files = Get-ChildItem -Path $CostDir -Filter "$monthPrefix-*.jsonl" -ErrorAction SilentlyContinue
            foreach ($f in $files) {
                foreach ($line in Get-Content -Path $f.FullName) {
                    try {
                        $snap = $line | ConvertFrom-Json
                        $outflowsUsd += [double]$snap.cost_usd
                    } catch { }
                }
            }
        }

        $netUsd = $inflowsUsd - $outflowsUsd
        $netColour = if ($netUsd -ge 0) { 'Green' } else { 'Red' }

        Write-Host ("{0} ({1})" -f $entity.name, $entity.currency_base) -ForegroundColor White
        Write-Host ("  Inflows:  `$$([math]::Round($inflowsUsd, 2))")
        Write-Host ("  Outflows: `$$([math]::Round($outflowsUsd, 2))")
        Write-Host ("  Net:      `$$([math]::Round($netUsd, 2))") -ForegroundColor $netColour

        # Runway (if cash is fresh)
        if ($entity.current_cash -and $entity.current_cash.last_updated) {
            $lastUpdated = [datetime]$entity.current_cash.last_updated
            $cashAgeDays = (New-TimeSpan -Start $lastUpdated -End (Get-Date)).TotalDays
            if ($cashAgeDays -gt 14) {
                Write-Host ("  Runway:   STALE_CASH ({0:N1}d old, refresh via /finance-cash-tick)" -f $cashAgeDays) -ForegroundColor Yellow
            } else {
                $cashUsd = if ($entity.currency_base -eq 'USD') {
                    [double]$entity.current_cash.amount
                } elseif ($entity.currency_base -eq 'EUR') {
                    [double]$entity.current_cash.amount * 1.0810
                } else {
                    [double]$entity.current_cash.amount
                }
                $monthlyBurn = if ($netUsd -lt 0) { -$netUsd } else { 0 }
                $runwayMonths = if ($monthlyBurn -eq 0) { 'Infinity' } else { [math]::Round($cashUsd / $monthlyBurn, 1) }
                $runwayColour = if ($runwayMonths -eq 'Infinity' -or $runwayMonths -gt 12) { 'Green' } elseif ($runwayMonths -gt 6) { 'Yellow' } else { 'Red' }
                Write-Host ("  Runway:   {0} months (cash {1:N1}d old)" -f $runwayMonths, $cashAgeDays) -ForegroundColor $runwayColour
            }
        }
        Write-Host ''
    }

    Write-Host 'Refreshing in 60s... (Ctrl+C to exit)' -ForegroundColor DarkGray
    Start-Sleep -Seconds 60
}
