[CmdletBinding()]
param(
    [switch]$DryRun
)

# tools/jarvis-rescue.ps1 — STUB-TIER rescue script.
#
# Callable via `! powershell -NoProfile -File <path>` when the Bash -> git-bash -> pwsh
# spawn chain is jammed under memory pressure (see memory:
# feedback_spawn_chain_jam_under_pressure).
#
# GRADUATION GATE (Starlight Board REVISE 2026-05-14):
# Shipped as a STUB with a defined verification event. Promotes to load-bearing rescue
# infra ONLY after one successful execution under real RAM >= 90% + spawn-jam conditions
# yields output in < 5s. Until then: do NOT add destructive ops beyond the allowlist below.
#
# Allowlist (safe ops only):
#   1. State report (uptime, disk, RAM)
#   2. Orphan pnpm/store/v3 removal (deterministic, no spawning npm/pnpm)
#   3. Popup-task guard (re-disable Cockpit-Periodic-Snapshot if re-enabled)
#
# Idempotent. Re-run = same outcome.
# Use -DryRun to preview without destructive ops.

$ErrorActionPreference = 'Continue'  # graceful under jam — never error-out mid-rescue
$startTime = Get-Date

# --- 1. state report (always runs, never destructive) ---
try {
    $d = Get-PSDrive C -ErrorAction Stop
    $os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
    $ramPct = [math]::Round((1 - ($os.FreePhysicalMemory / $os.TotalVisibleMemorySize)) * 100, 1)
    $upMin = [math]::Round(((Get-Date) - $os.LastBootUpTime).TotalMinutes, 1)
    Write-Host "[rescue] uptime=${upMin}min disk_free=$([math]::Round($d.Free / 1GB, 2))GB ram_used=$ramPct%"
} catch {
    Write-Host "[rescue] state report failed: $($_.Exception.Message)"
}

# --- 2. safe reclaim: orphan pnpm/store/v3 only (no npm/pnpm spawn) ---
$orphan = "$env:LOCALAPPDATA\pnpm\store\v3"
if (Test-Path $orphan) {
    $beforeBytes = (Get-ChildItem $orphan -Recurse -Force -ErrorAction SilentlyContinue |
                    Measure-Object -Property Length -Sum).Sum
    $beforeGB = [math]::Round($beforeBytes / 1GB, 2)
    if ($DryRun) {
        Write-Host "[rescue] would reclaim ${beforeGB}GB from orphan pnpm/store/v3 (dry-run)"
    } else {
        Remove-Item -Recurse -Force $orphan -ErrorAction SilentlyContinue
        if (-not (Test-Path $orphan)) {
            Write-Host "[rescue] reclaimed ${beforeGB}GB from orphan pnpm/store/v3"
        } else {
            Write-Host "[rescue] orphan pnpm/store/v3 partial remove (still present)"
        }
    }
} else {
    Write-Host "[rescue] no orphan pnpm/store/v3"
}

# --- 3. popup-task guard ---
$popup = Get-ScheduledTask -TaskName 'Cockpit-Periodic-Snapshot' -ErrorAction SilentlyContinue
if ($popup -and $popup.State -ne 'Disabled') {
    if ($DryRun) {
        Write-Host "[rescue] would disable popup task (dry-run, state=$($popup.State))"
    } else {
        Disable-ScheduledTask -TaskName 'Cockpit-Periodic-Snapshot' -ErrorAction SilentlyContinue | Out-Null
        Write-Host "[rescue] disabled popup task (was $($popup.State))"
    }
} elseif ($popup) {
    Write-Host "[rescue] popup task already disabled"
} else {
    Write-Host "[rescue] popup task not registered"
}

$elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
Write-Host "[rescue] complete in ${elapsed}s"
