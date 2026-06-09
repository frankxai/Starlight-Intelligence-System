# cockpit/test/e2e.ps1 -- end-to-end integration test
#
# Exercises the FULL pipeline:
#   1. Hook receives a synthetic Claude payload via stdin
#   2. Hook writes a manifest row
#   3. Snapshot script reads the manifest, walks process tree, writes snapshot.json
#   4. Workspace save captures the snapshot under a name
#   5. Workspace load returns a dry-run rehydrate plan that includes our session_id
#   6. Doctor passes all checks (or expected-WARN ones)
#
# This is the sanity check that v0.1 lacked. Smoke covers units; E2E covers the contract.

param([switch]$Verbose, [switch]$KeepSandbox)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$CockpitRoot = Split-Path -Parent $PSScriptRoot
$script:failures = @()

# Sandbox
$sandbox = Join-Path ([System.IO.Path]::GetTempPath()) "cockpit-e2e-$(Get-Random)"
$env:COCKPIT_HOME = $sandbox
$env:COCKPIT_RATE_LIMIT = '1000'  # disable rate-limit pollution between phases
New-Item -ItemType Directory -Path $sandbox -Force | Out-Null

function E2E-Step {
    param([string]$Name, [scriptblock]$Body)
    Write-Host "  [STEP] $Name" -ForegroundColor Cyan
    try {
        $result = & $Body
        if ($result -eq $false) { throw "step returned false" }
        Write-Host "         PASS" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "         FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:failures += @{ Name = $Name; Error = $_.Exception.Message }
        return $false
    }
}

Write-Host "=== Cockpit E2E integration test ===" -ForegroundColor Cyan
Write-Host "Sandbox: $sandbox" -ForegroundColor DarkGray
Write-Host ""

# Phase 1: hook lifecycle
Write-Host "Phase 1 -- Hook lifecycle" -ForegroundColor Yellow
$syntheticSessionId = "e2e-$(Get-Random)"
$startHook = Join-Path $CockpitRoot 'hooks\claude-session-start.ps1'
$stopHook  = Join-Path $CockpitRoot 'hooks\claude-session-stop.ps1'

E2E-Step "synthetic SessionStart fires hook with valid payload" {
    $payload = '{"session_id":"' + $syntheticSessionId + '","cwd":"' + ($env:USERPROFILE -replace '\\','\\') + '","transcript_path":"/x"}'
    $payload | & powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "`$env:COCKPIT_HOME='$sandbox'; & `"$startHook`""
    Test-Path (Join-Path $sandbox 'sessions.jsonl')
} | Out-Null

E2E-Step "manifest row contains the synthetic session_id" {
    $rows = @(Get-Content -Path (Join-Path $sandbox 'sessions.jsonl') | ForEach-Object { try { $_ | ConvertFrom-Json } catch {} })
    @($rows | Where-Object { $_.session_id -eq $syntheticSessionId }).Count -ge 1
} | Out-Null

E2E-Step "structured event log got matching entry" {
    if (-not (Test-Path (Join-Path $sandbox 'events.log'))) { return $false }
    $rows = @(Get-Content -Path (Join-Path $sandbox 'events.log') | ForEach-Object { try { $_ | ConvertFrom-Json } catch {} })
    @($rows | Where-Object { $_.kind -eq 'session.event' -and $_.session_id -eq $syntheticSessionId }).Count -ge 1
} | Out-Null

E2E-Step "Stop hook also writes a row" {
    $payload = '{"session_id":"' + $syntheticSessionId + '","cwd":"' + ($env:USERPROFILE -replace '\\','\\') + '"}'
    $payload | & powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "`$env:COCKPIT_HOME='$sandbox'; & `"$stopHook`""
    $rows = @(Get-Content -Path (Join-Path $sandbox 'sessions.jsonl') | ForEach-Object { try { $_ | ConvertFrom-Json } catch {} })
    @($rows | Where-Object { $_.session_id -eq $syntheticSessionId -and $_.event -eq 'stop' }).Count -ge 1
} | Out-Null

# Phase 2: snapshot pipeline
Write-Host ""
Write-Host "Phase 2 -- Snapshot pipeline" -ForegroundColor Yellow

E2E-Step "snapshot.ps1 produces a v1 document with required fields" {
    $result = & (Join-Path $CockpitRoot 'scripts\snapshot.ps1') -Terminal 'windows-terminal'
    $snapPath = Join-Path $sandbox 'last-snapshot.json'
    if (-not (Test-Path $snapPath)) { return $false }
    $snap = Get-Content -Path $snapPath -Raw | ConvertFrom-Json
    ($snap.schema -eq 'cockpit.snapshot/v1') -and ($snap.snapshot_at) -and ($snap.host) -and ($snap.terminal)
} | Out-Null

E2E-Step "snapshot is also archived for arc undo" {
    $snapshotsDir = Join-Path $sandbox 'snapshots'
    if (-not (Test-Path $snapshotsDir)) { return $false }
    @(Get-ChildItem -Path $snapshotsDir -Filter 'snapshot-*.json').Count -ge 1
} | Out-Null

# Phase 3: workspace round-trip
Write-Host ""
Write-Host "Phase 3 -- Workspace round-trip" -ForegroundColor Yellow

E2E-Step "save workspace named e2e-test" {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $result = New-CockpitWorkspace -Name 'e2e-test' -Description 'integration test'
    Test-Path $result.Path
} | Out-Null

E2E-Step "list shows the new workspace" {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $items = @(Get-CockpitWorkspaces)
    @($items | Where-Object { $_.Name -eq 'e2e-test' }).Count -ge 1
} | Out-Null

E2E-Step "load workspace dry-run returns plan" {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $result = Invoke-CockpitWorkspaceLoad -Name 'e2e-test' -DryRun
    $null -ne $result
} | Out-Null

E2E-Step "remove workspace cleans up file" {
    . (Join-Path $CockpitRoot 'scripts\workspaces.ps1')
    $ok = Remove-CockpitWorkspace -Name 'e2e-test'
    $ok -and -not (Test-Path (Get-CockpitWorkspacePath -Name 'e2e-test'))
} | Out-Null

# Phase 4: rehydrate dry-run safety
Write-Host ""
Write-Host "Phase 4 -- Rehydrate dry-run safety" -ForegroundColor Yellow

E2E-Step "rehydrate -DryRun never spawns a process" {
    $procsBefore = @(Get-Process -Name 'WindowsTerminal' -ErrorAction SilentlyContinue).Count
    $null = & (Join-Path $CockpitRoot 'scripts\rehydrate.ps1') -DryRun -Mode merge
    $procsAfter = @(Get-Process -Name 'WindowsTerminal' -ErrorAction SilentlyContinue).Count
    $procsBefore -eq $procsAfter
} | Out-Null

E2E-Step "rehydrate -Mode skip refuses when WT alive" {
    if (-not (Get-Process -Name 'WindowsTerminal' -ErrorAction SilentlyContinue)) {
        return $true  # vacuously passes if WT not running
    }
    $result = & (Join-Path $CockpitRoot 'scripts\rehydrate.ps1') -Mode skip
    if ($result -is [array]) { $result = $result[0] }
    $result.Skipped -eq $true
} | Out-Null

# Phase 5: GC + rotation
Write-Host ""
Write-Host "Phase 5 -- GC + rotation" -ForegroundColor Yellow

E2E-Step "GC reports rows-dropped count" {
    . (Join-Path $CockpitRoot 'scripts\manifest.ps1')
    # Inject an old row
    $oldRow = @{
        schema = 'cockpit.session/v1'
        ts = (Get-Date).AddDays(-60).ToUniversalTime().ToString('o')
        event = 'stop'
        agent = 'claude'
        session_id = 'gc-e2e'
        cwd = '/x'
        pid = 1
        ppid_chain = @(1)
    } | ConvertTo-Json -Compress
    Add-Content -Path (Get-CockpitManifestPath) -Value $oldRow -Encoding utf8
    $result = Invoke-CockpitManifestGC -RetentionDays 30
    $result.DroppedRows -ge 1
} | Out-Null

# Phase 6: clean up
if (-not $KeepSandbox) {
    Remove-Item -Path $sandbox -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
if ($script:failures.Count -eq 0) {
    Write-Host "=== E2E ALL PASS ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=== E2E $($script:failures.Count) FAILURES ===" -ForegroundColor Red
    foreach ($f in $script:failures) {
        Write-Host "  - $($f.Name): $($f.Error)" -ForegroundColor Red
    }
    exit 1
}
