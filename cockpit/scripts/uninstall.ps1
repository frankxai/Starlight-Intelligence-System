# cockpit/scripts/uninstall.ps1
#
# Removes cockpit hooks from Claude settings, removes scheduled tasks, removes
# the PROFILE source line. Leaves ~/.starlight/cockpit/ data intact (use -PurgeData
# to wipe).

[CmdletBinding()]
param(
    [switch]$PurgeData,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'manifest.ps1')

$CockpitRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

Write-Host "=== Cockpit Continuity uninstall ===" -ForegroundColor Cyan

# 1. Remove hooks from settings.json
$settingsPath = Join-Path $HOME '.claude\settings.json'
if (Test-Path $settingsPath) {
    $settings = Get-Content -Path $settingsPath -Raw -Encoding utf8 | ConvertFrom-Json
    $cockpitMarker = $CockpitRoot.Replace('\','/') -replace '/+', '/'
    $changed = $false

    if ($settings.hooks) {
        foreach ($eventName in @('SessionStart', 'Stop')) {
            if ($settings.hooks.$eventName) {
                $filtered = @()
                foreach ($entry in $settings.hooks.$eventName) {
                    $keepEntry = $true
                    if ($entry.hooks) {
                        foreach ($h in $entry.hooks) {
                            if ($h.command -and $h.command.Contains($cockpitMarker)) {
                                $keepEntry = $false
                                $changed = $true
                                break
                            }
                        }
                    }
                    if ($keepEntry) { $filtered += $entry }
                }
                $settings.hooks.$eventName = $filtered
            }
        }
    }

    if ($changed) {
        if ($WhatIf) {
            Write-Host "[WHATIF] would update settings.json" -ForegroundColor Yellow
        } else {
            $backup = "$settingsPath.bak-$(Get-Date -Format 'yyyyMMddHHmmss')"
            Copy-Item -Path $settingsPath -Destination $backup
            $settings | ConvertTo-Json -Depth 16 | Set-Content -Path $settingsPath -Encoding utf8
            Write-Host "[OK] removed cockpit hooks from settings.json (backup: $backup)" -ForegroundColor Green
        }
    } else {
        Write-Host "[OK] no cockpit hooks found in settings.json" -ForegroundColor DarkGray
    }
}

# 2. Remove scheduled tasks
$cockpitTaskNames = @(
    'Cockpit-Periodic-Snapshot',
    'Cockpit-Shutdown-Snapshot',
    'Cockpit-Auto-Rehydrate-On-Login',
    'Cockpit-Auto-Save-Morning',
    'Cockpit-Auto-Save-Evening',
    'Cockpit-Weekly-GC'
)
foreach ($taskName in $cockpitTaskNames) {
    if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
        if ($WhatIf) {
            Write-Host "[WHATIF] would remove task $taskName" -ForegroundColor Yellow
        } else {
            try {
                Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
                Write-Host "[OK] removed task: $taskName" -ForegroundColor Green
            } catch {
                Write-Warning "[FAIL] task '$taskName': $($_.Exception.Message)"
            }
        }
    } else {
        Write-Host "[OK] task '$taskName' not present" -ForegroundColor DarkGray
    }
}

# 3. Remove PROFILE source line
$profilePath = $PROFILE.CurrentUserAllHosts
if (-not $profilePath) { $profilePath = $PROFILE }
if (Test-Path $profilePath) {
    $content = Get-Content -Path $profilePath -Raw -Encoding utf8
    $arcCockpitScript = Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1'
    if ($content.Contains($arcCockpitScript)) {
        if ($WhatIf) {
            Write-Host "[WHATIF] would scrub PROFILE: $profilePath" -ForegroundColor Yellow
        } else {
            $lines = Get-Content -Path $profilePath -Encoding utf8
            $kept = $lines | Where-Object { -not $_.Contains($arcCockpitScript) -and $_ -ne '# Cockpit Continuity' }
            Set-Content -Path $profilePath -Value $kept -Encoding utf8
            Write-Host "[OK] removed source line from $profilePath" -ForegroundColor Green
        }
    } else {
        Write-Host "[OK] PROFILE has no cockpit source line" -ForegroundColor DarkGray
    }
}

# 4. Optional data purge
if ($PurgeData) {
    $cockpitHome = Get-CockpitHome
    if (Test-Path $cockpitHome) {
        if ($WhatIf) {
            Write-Host "[WHATIF] would remove $cockpitHome" -ForegroundColor Yellow
        } else {
            Remove-Item -Path $cockpitHome -Recurse -Force
            Write-Host "[OK] purged $cockpitHome" -ForegroundColor Green
        }
    }
} else {
    Write-Host "[OK] data preserved at $(Get-CockpitHome) (use -PurgeData to wipe)" -ForegroundColor DarkGray
}

Write-Host ''
Write-Host "=== uninstall complete ===" -ForegroundColor Cyan
