# cockpit-zellij/scripts/yolo-status.ps1 — /yolo phase-in + drift status panel
#
# Reads yolo-scope.json and surfaces phase-in state + recent drift count.
# Refreshes every 10 seconds. Read-only panel.

$ErrorActionPreference = 'Stop'

$SisRoot   = 'C:\Users\frank\Starlight-Intelligence-System'
$ScopePath = Join-Path $SisRoot 'yolo-scope.json'
$DriftPath = Join-Path $SisRoot 'memory\_audit\yolo\_drift.jsonl'

while ($true) {
    Clear-Host
    Write-Host '=== /yolo Hive — phase-in status ===' -ForegroundColor Cyan
    Write-Host ''

    if (-not (Test-Path $ScopePath)) {
        Write-Host 'yolo-scope.json not found — /yolo not initialized' -ForegroundColor Red
    } else {
        $scope = Get-Content -Path $ScopePath -Raw | ConvertFrom-Json

        Write-Host ("Phase-in repo:    {0}" -f $scope.phase_in.phase_in_repo)
        Write-Host ("Session count:    {0} / 3 before unlock review" -f $scope.phase_in.session_count)
        Write-Host ("Unlock status:    {0}" -f $scope.phase_in.unlock_status)
        Write-Host ("Review passed:    {0}" -f $scope.phase_in.unlock_review_passed)
        Write-Host ''
        Write-Host ("Budget session:   `$$($scope.budget.session_threshold_usd)")
        Write-Host ("Budget action:    `$$($scope.budget.action_threshold_usd)")
        Write-Host ''
        Write-Host ("Total repos:      {0}" -f $scope.repos.Count)

        if ($scope.phase_in.unlock_status -eq 'closed') {
            Write-Host '  └─ Scope: 1 repo (phase-in lockout active)' -ForegroundColor Yellow
        } else {
            Write-Host ('  └─ Scope: {0} repos (unlocked)' -f $scope.repos.Count) -ForegroundColor Green
        }
    }

    Write-Host ''
    Write-Host '=== drift events ===' -ForegroundColor Cyan
    if (Test-Path $DriftPath) {
        $drift = Get-Content -Path $DriftPath
        Write-Host ("Total drift events: {0}" -f $drift.Count) -ForegroundColor $(if ($drift.Count -gt 0) {'Yellow'} else {'Green'})
        if ($drift.Count -gt 0) {
            Write-Host ''
            Write-Host 'Recent drift:'
            $drift | Select-Object -Last 5 | ForEach-Object { Write-Host "  $_" }
        }
    } else {
        Write-Host 'No drift log yet (clean)' -ForegroundColor Green
    }

    Write-Host ''
    Write-Host 'Refreshing in 10s... (Ctrl+C to exit)' -ForegroundColor DarkGray

    Start-Sleep -Seconds 10
}
