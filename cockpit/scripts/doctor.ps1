# cockpit/scripts/doctor.ps1
#
# Verifies install: cockpit home, manifest writability, hooks present in settings.json,
# scheduled tasks active, PROFILE source line present, recent snapshot exists.

[CmdletBinding()]
param()

. (Join-Path $PSScriptRoot 'manifest.ps1')
$CockpitRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$results = @()
function Add-DoctorCheck {
    param([string]$Name, [scriptblock]$Test, [string]$Hint = '')
    try {
        $val = & $Test
        if ($val -eq $false) {
            $script:results += [PSCustomObject]@{ Status = 'FAIL'; Name = $Name; Detail = $Hint }
        } elseif ($null -eq $val) {
            $script:results += [PSCustomObject]@{ Status = 'WARN'; Name = $Name; Detail = $Hint }
        } else {
            $script:results += [PSCustomObject]@{ Status = 'PASS'; Name = $Name; Detail = '' }
        }
    } catch {
        $script:results += [PSCustomObject]@{ Status = 'FAIL'; Name = $Name; Detail = $_.Exception.Message }
    }
}

Write-Host "=== Cockpit Doctor ===" -ForegroundColor Cyan

Add-DoctorCheck -Name 'cockpit home exists' -Hint 'Run: arc install' -Test {
    Test-Path (Get-CockpitHome)
}

Add-DoctorCheck -Name 'manifest writable' -Hint 'Permissions issue on COCKPIT_HOME' -Test {
    Initialize-CockpitHome
    $testPath = Join-Path (Get-CockpitHome) '.doctor-write-test'
    Set-Content -Path $testPath -Value 'ok' -ErrorAction Stop
    Remove-Item $testPath -Force
    $true
}

Add-DoctorCheck -Name 'config.json present' -Hint 'Run: arc install' -Test {
    Test-Path (Join-Path (Get-CockpitHome) 'config.json')
}

Add-DoctorCheck -Name 'Claude SessionStart hook registered' -Hint 'Run: arc install' -Test {
    $settingsPath = Join-Path $HOME '.claude\settings.json'
    if (-not (Test-Path $settingsPath)) { return $false }
    $s = Get-Content -Path $settingsPath -Raw | ConvertFrom-Json
    $marker = $CockpitRoot.Replace('\','/') -replace '/+', '/'
    foreach ($entry in @($s.hooks.SessionStart)) {
        foreach ($h in $entry.hooks) {
            if ($h.command -and $h.command.Contains($marker)) { return $true }
        }
    }
    return $false
}

Add-DoctorCheck -Name 'Claude Stop hook registered' -Hint 'Run: arc install' -Test {
    $settingsPath = Join-Path $HOME '.claude\settings.json'
    if (-not (Test-Path $settingsPath)) { return $false }
    $s = Get-Content -Path $settingsPath -Raw | ConvertFrom-Json
    $marker = $CockpitRoot.Replace('\','/') -replace '/+', '/'
    foreach ($entry in @($s.hooks.Stop)) {
        foreach ($h in $entry.hooks) {
            if ($h.command -and $h.command.Contains($marker)) { return $true }
        }
    }
    return $false
}

Add-DoctorCheck -Name 'Periodic snapshot task registered' -Hint 'Run: arc install (or skip if undesired)' -Test {
    $null -ne (Get-ScheduledTask -TaskName 'Cockpit-Periodic-Snapshot' -ErrorAction SilentlyContinue)
}

Add-DoctorCheck -Name 'Shutdown snapshot task registered' -Hint 'Run: arc install' -Test {
    $null -ne (Get-ScheduledTask -TaskName 'Cockpit-Shutdown-Snapshot' -ErrorAction SilentlyContinue)
}

Add-DoctorCheck -Name 'Auto-rehydrate-on-login task registered' -Hint 'Run: arc install (or arc install -NoAutoRehydrate to skip intentionally)' -Test {
    if ($null -ne (Get-ScheduledTask -TaskName 'Cockpit-Auto-Rehydrate-On-Login' -ErrorAction SilentlyContinue)) { return $true }
    return $null  # WARN: missing but might be intentional
}

Add-DoctorCheck -Name 'Daily auto-save tasks registered (AM + PM)' -Hint 'Run: arc install' -Test {
    $am = $null -ne (Get-ScheduledTask -TaskName 'Cockpit-Auto-Save-Morning' -ErrorAction SilentlyContinue)
    $pm = $null -ne (Get-ScheduledTask -TaskName 'Cockpit-Auto-Save-Evening' -ErrorAction SilentlyContinue)
    if ($am -and $pm) { return $true }
    if (-not $am -and -not $pm) { return $null }  # WARN if both missing (Minimal install)
    return $false  # FAIL if mixed
}

Add-DoctorCheck -Name 'Weekly GC task registered' -Hint 'Run: arc install' -Test {
    if ($null -ne (Get-ScheduledTask -TaskName 'Cockpit-Weekly-GC' -ErrorAction SilentlyContinue)) { return $true }
    return $null
}

Add-DoctorCheck -Name 'PROFILE sources arc-cockpit.ps1' -Hint 'Run: arc install' -Test {
    $p = $PROFILE.CurrentUserAllHosts
    if (-not $p) { $p = $PROFILE }
    if (-not (Test-Path $p)) { return $false }
    $content = Get-Content -Path $p -Raw
    return $content.Contains((Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1'))
}

Add-DoctorCheck -Name 'manifest has recent activity' -Hint 'No sessions logged yet -- start a Claude tab' -Test {
    $path = Get-CockpitManifestPath
    if (-not (Test-Path $path)) { return $null }
    $size = (Get-Item $path).Length
    return ($size -gt 0)
}

Add-DoctorCheck -Name 'last-snapshot.json present' -Hint 'Run: arc snapshot' -Test {
    Test-Path (Join-Path (Get-CockpitHome) 'last-snapshot.json')
}

# Render
foreach ($r in $results) {
    $color = switch ($r.Status) {
        'PASS' { 'Green' }
        'WARN' { 'Yellow' }
        'FAIL' { 'Red' }
    }
    $line = "  [{0}] {1}" -f $r.Status, $r.Name
    Write-Host $line -ForegroundColor $color
    if ($r.Detail) { Write-Host "         -> $($r.Detail)" -ForegroundColor DarkGray }
}

$failCount = ($results | Where-Object { $_.Status -eq 'FAIL' } | Measure-Object).Count
$warnCount = ($results | Where-Object { $_.Status -eq 'WARN' } | Measure-Object).Count

Write-Host ''
if ($failCount -eq 0 -and $warnCount -eq 0) {
    Write-Host "=== ALL PASS ($($results.Count) checks) ===" -ForegroundColor Green
    exit 0
} elseif ($failCount -eq 0) {
    Write-Host "=== $warnCount warning(s), $($results.Count - $warnCount) pass ===" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "=== $failCount failure(s), $warnCount warning(s) ===" -ForegroundColor Red
    exit 1
}
