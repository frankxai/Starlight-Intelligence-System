# cockpit/scripts/install.ps1
#
# Idempotent installer:
#   1. Ensure ~/.starlight/cockpit/ exists
#   2. Copy default config if absent
#   3. Add SessionStart + Stop hooks to ~/.claude/settings.json (preserves existing entries)
#   4. Register Task Scheduler trigger for periodic snapshot (every 5min, idle-only)
#   5. Register Task Scheduler trigger for shutdown event (1074)
#   6. Add `arc` PROFILE source line if not present
#
# Re-running this is safe.

[CmdletBinding()]
param(
    [switch]$SkipHooks,
    [switch]$SkipScheduler,
    [switch]$SkipProfile,
    [switch]$WhatIf,
    [switch]$Minimal,           # Skip auto-rehydrate-on-login + auto-save + weekly-GC tasks
    [switch]$NoAutoRehydrate    # Skip ONLY the auto-rehydrate-on-login task (keep auto-save + GC)
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'manifest.ps1')

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$CockpitRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

Write-Host "=== Cockpit Continuity install ===" -ForegroundColor Cyan
Write-Host "  CockpitRoot: $CockpitRoot" -ForegroundColor DarkGray
Write-Host "  HOME: $HOME" -ForegroundColor DarkGray
Write-Host ''

# 1. Cockpit home directory
Initialize-CockpitHome
Write-Host "[OK] cockpit home: $(Get-CockpitHome)" -ForegroundColor Green

# 2. Default config
$configPath = Join-Path (Get-CockpitHome) 'config.json'
if (-not (Test-Path $configPath)) {
    $defaultConfig = Join-Path $CockpitRoot 'config\default.json'
    if (Test-Path $defaultConfig) {
        if ($WhatIf) {
            Write-Host "[WHATIF] would copy $defaultConfig -> $configPath" -ForegroundColor Yellow
        } else {
            Copy-Item -Path $defaultConfig -Destination $configPath
            Write-Host "[OK] default config copied to $configPath" -ForegroundColor Green
        }
    }
} else {
    Write-Host "[OK] config exists: $configPath" -ForegroundColor DarkGray
}

# 3. Claude Code hooks
if (-not $SkipHooks) {
    $settingsPath = Join-Path $HOME '.claude\settings.json'
    if (-not (Test-Path $settingsPath)) {
        Write-Warning "[SKIP] Claude settings.json not found at $settingsPath. Skipping hook registration."
    } else {
        $startHookCmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$($CockpitRoot.Replace('\','/') -replace '/+', '/')/hooks/claude-session-start.ps1`""
        $stopHookCmd  = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$($CockpitRoot.Replace('\','/') -replace '/+', '/')/hooks/claude-session-stop.ps1`""

        $settingsRaw = Get-Content -Path $settingsPath -Raw -Encoding utf8
        $settings = $settingsRaw | ConvertFrom-Json

        if (-not $settings.hooks) {
            $settings | Add-Member -NotePropertyName 'hooks' -NotePropertyValue ([PSCustomObject]@{}) -Force
        }

        function Add-HookIfMissing {
            param([object]$HooksRoot, [string]$EventName, [string]$CommandText)
            if (-not $HooksRoot.$EventName) {
                $HooksRoot | Add-Member -NotePropertyName $EventName -NotePropertyValue @() -Force
            }
            $existing = $HooksRoot.$EventName
            $alreadyPresent = $false
            foreach ($entry in $existing) {
                if ($entry.hooks) {
                    foreach ($h in $entry.hooks) {
                        if ($h.command -and $h.command -eq $CommandText) { $alreadyPresent = $true; break }
                    }
                }
                if ($alreadyPresent) { break }
            }
            if ($alreadyPresent) {
                Write-Host "[OK] $EventName hook already present" -ForegroundColor DarkGray
                return $false
            }
            $newEntry = [PSCustomObject]@{
                hooks = @([PSCustomObject]@{
                    type    = 'command'
                    command = $CommandText
                    timeout = 5000
                })
            }
            $HooksRoot.$EventName = @($existing) + $newEntry
            Write-Host "[OK] added $EventName hook" -ForegroundColor Green
            return $true
        }

        $changed = $false
        $changed = (Add-HookIfMissing -HooksRoot $settings.hooks -EventName 'SessionStart' -CommandText $startHookCmd) -or $changed
        $changed = (Add-HookIfMissing -HooksRoot $settings.hooks -EventName 'Stop' -CommandText $stopHookCmd) -or $changed

        if ($changed) {
            if ($WhatIf) {
                Write-Host "[WHATIF] would update $settingsPath" -ForegroundColor Yellow
            } else {
                $backup = "$settingsPath.bak-$(Get-Date -Format 'yyyyMMddHHmmss')"
                Copy-Item -Path $settingsPath -Destination $backup
                Write-Host "[OK] backed up settings.json to $backup" -ForegroundColor DarkGray
                $settings | ConvertTo-Json -Depth 16 | Set-Content -Path $settingsPath -Encoding utf8
                Write-Host "[OK] settings.json updated" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "[SKIP] hook registration skipped per -SkipHooks" -ForegroundColor DarkGray
}

# 4. Task Scheduler triggers
if (-not $SkipScheduler) {
    $snapshotScript = Join-Path $CockpitRoot 'scripts\snapshot.ps1'
    $snapshotCmd = "-NoProfile -ExecutionPolicy Bypass -File `"$snapshotScript`""

    function Register-CockpitTask {
        param(
            [string]$TaskName,
            [object]$Trigger,
            [string]$Description
        )
        $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $snapshotCmd
        $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
        $task = New-ScheduledTask -Action $action -Trigger $Trigger -Settings $settings -Principal $principal -Description $Description
        if ($WhatIf) {
            Write-Host "[WHATIF] would register task '$TaskName'" -ForegroundColor Yellow
            return
        }
        try {
            Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null
            Write-Host "[OK] task registered: $TaskName" -ForegroundColor Green
        } catch {
            Write-Warning "[FAIL] task '$TaskName': $($_.Exception.Message)"
        }
    }

    # ----- ALWAYS-ON tasks (snapshot + shutdown) -----

    # Periodic: every 5 minutes (idempotent + cheap)
    $periodicTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)
    Register-CockpitTask -TaskName 'Cockpit-Periodic-Snapshot' -Trigger $periodicTrigger -Description 'Cockpit Continuity: snapshot terminal state every 5 min'

    # Event-driven: shutdown (event 1074, source User32)
    $shutdownXml = @"
<QueryList>
  <Query Id="0" Path="System">
    <Select Path="System">*[System[Provider[@Name='User32'] and EventID=1074]]</Select>
  </Query>
</QueryList>
"@
    $cimClass = New-CimInstance -ClassName MSFT_TaskEventTrigger -Namespace Root/Microsoft/Windows/TaskScheduler -ClientOnly -Property @{
        Subscription = $shutdownXml
        Enabled = $true
    }
    # PSTypeName fix: New-ScheduledTask requires MSFT_TaskTrigger typename which
    # New-CimInstance doesn't add by default on PS7 + some PS5.1 builds.
    $cimClass.PSTypeNames.Insert(0, 'Microsoft.Management.Infrastructure.CimInstance#MSFT_TaskTrigger')
    Register-CockpitTask -TaskName 'Cockpit-Shutdown-Snapshot' -Trigger $cimClass -Description 'Cockpit Continuity: snapshot on Windows shutdown event 1074'

    # ----- AUTOMATION tasks (skipped under -Minimal) -----
    if (-not $Minimal) {
        # Helper: register a task that runs an arc subcommand
        function Register-CockpitArcTask {
            param([string]$TaskName, [object]$Trigger, [string]$ArcCommand, [string]$Description)
            $arcScript = Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1'
            $cmd = "-NoProfile -ExecutionPolicy Bypass -Command `". '$arcScript'; arc $ArcCommand`""
            $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $cmd
            $taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
            $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
            $task = New-ScheduledTask -Action $action -Trigger $Trigger -Settings $taskSettings -Principal $principal -Description $Description
            if ($WhatIf) {
                Write-Host "[WHATIF] would register $TaskName" -ForegroundColor Yellow
                return
            }
            try {
                Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null
                Write-Host "[OK] task registered: $TaskName" -ForegroundColor Green
            } catch {
                Write-Warning "[FAIL] task '$TaskName': $($_.Exception.Message)"
            }
        }

        # Auto-rehydrate at login (skip-mode: no-op if WT already alive)
        if (-not $NoAutoRehydrate) {
            $loginTrigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
            Register-CockpitArcTask -TaskName 'Cockpit-Auto-Rehydrate-On-Login' `
                -Trigger $loginTrigger `
                -ArcCommand 'rehydrate -Mode skip' `
                -Description 'Cockpit Continuity: rebuild last cockpit at login (no-op if WT already alive)'
        }

        # Daily auto-save AM (09:00) -- builds rolling history of "morning state"
        $morningTrigger = New-ScheduledTaskTrigger -Daily -At '09:00'
        Register-CockpitArcTask -TaskName 'Cockpit-Auto-Save-Morning' `
            -Trigger $morningTrigger `
            -ArcCommand 'save auto-morning-$(Get-Date -Format yyyyMMdd) -Description "auto-saved 09:00"' `
            -Description 'Cockpit Continuity: daily 09:00 workspace auto-save'

        # Daily auto-save PM (17:00) -- "evening state"
        $eveningTrigger = New-ScheduledTaskTrigger -Daily -At '17:00'
        Register-CockpitArcTask -TaskName 'Cockpit-Auto-Save-Evening' `
            -Trigger $eveningTrigger `
            -ArcCommand 'save auto-evening-$(Get-Date -Format yyyyMMdd) -Description "auto-saved 17:00"' `
            -Description 'Cockpit Continuity: daily 17:00 workspace auto-save'

        # Weekly GC (Sunday 03:00) -- compacts manifest + cleans old auto-saves
        $weeklyTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At '03:00'
        Register-CockpitArcTask -TaskName 'Cockpit-Weekly-GC' `
            -Trigger $weeklyTrigger `
            -ArcCommand 'gc -RetentionDays 30' `
            -Description 'Cockpit Continuity: weekly Sunday 03:00 GC + auto-save cleanup'
    }
} else {
    Write-Host "[SKIP] scheduler registration skipped per -SkipScheduler" -ForegroundColor DarkGray
}

# 5. PROFILE source line
if (-not $SkipProfile) {
    $arcCockpitScript = Join-Path $CockpitRoot 'scripts\arc-cockpit.ps1'
    $sourceLine = ". `"$arcCockpitScript`""
    $profilePath = $PROFILE.CurrentUserAllHosts
    if (-not $profilePath) { $profilePath = $PROFILE }

    if (-not (Test-Path $profilePath)) {
        if ($WhatIf) {
            Write-Host "[WHATIF] would create $profilePath" -ForegroundColor Yellow
        } else {
            New-Item -ItemType File -Path $profilePath -Force | Out-Null
        }
    }

    $profileContent = if (Test-Path $profilePath) { Get-Content -Path $profilePath -Raw -Encoding utf8 } else { '' }
    if ($profileContent -and $profileContent.Contains($arcCockpitScript)) {
        Write-Host "[OK] PROFILE already sources arc-cockpit.ps1" -ForegroundColor DarkGray
    } else {
        if ($WhatIf) {
            Write-Host "[WHATIF] would append source line to $profilePath" -ForegroundColor Yellow
        } else {
            Add-Content -Path $profilePath -Value "`n# Cockpit Continuity`n$sourceLine`n" -Encoding utf8
            Write-Host "[OK] $profilePath patched -- restart shell or run: . `"$profilePath`"" -ForegroundColor Green
        }
    }
} else {
    Write-Host "[SKIP] profile patch skipped per -SkipProfile" -ForegroundColor DarkGray
}

Write-Host ''
Write-Host "=== install complete ===" -ForegroundColor Cyan
Write-Host "Run: arc doctor   to verify" -ForegroundColor White
Write-Host "Run: arc help     for command list" -ForegroundColor White
