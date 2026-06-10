# Machine Sentinel -- daily security + guard-rail health check.
#
# Why this exists: on 2026-06-09 we found all four Starlight guard tasks
# (API key monitor, secret scan, restic backup, cross-repo indexer) had been
# silently dead since 2026-05-27 -- their scheduled-task actions pointed at a
# VERSIONED Store pwsh path (PowerShell_7.6.1.0) that vanished on auto-update
# (0x80070002). Nothing watched the watchers. This script watches them.
#
# Checks (read-only except its own reports):
#   1. Guard scheduled tasks: last result, staleness, versioned-pwsh-path bomb
#   2. Listening ports (non-loopback) vs baseline allowlist
#   3. Autostart surface (HKCU/HKLM Run, startup folder, non-MS tasks) vs baseline
#   4. Secret-scan output recency + leak counts
#   5. Defender real-time protection + firewall profiles
#
# Output: private/api-monitor/SENTINEL-STATUS.md (zone GREEN/YELLOW/RED)
#         RED/YELLOW lines appended to private/api-monitor/ALERTS.md
# Baseline: private/api-monitor/sentinel-baseline.json (auto-created on first
#           run; re-accept current state with -UpdateBaseline after reviewing).

[CmdletBinding()]
param(
    [switch]$UpdateBaseline
)

$ErrorActionPreference = 'Stop'

$RepoRoot     = (Resolve-Path "$PSScriptRoot\..").Path
$MonitorDir   = Join-Path $RepoRoot 'private\api-monitor'
$BaselinePath = Join-Path $MonitorDir 'sentinel-baseline.json'
$StatusPath   = Join-Path $MonitorDir 'SENTINEL-STATUS.md'
$AlertsPath   = Join-Path $MonitorDir 'ALERTS.md'
$Now          = Get-Date

New-Item -ItemType Directory -Path $MonitorDir -Force | Out-Null

$findings = New-Object System.Collections.Generic.List[object]
function Add-Finding([string]$Severity, [string]$Area, [string]$Message) {
    $findings.Add([PSCustomObject]@{ Severity = $Severity; Area = $Area; Message = $Message })
}

# --- 1. Guard scheduled tasks -------------------------------------------------
$GuardTasks = @(
    @{ Name = 'StarlightAPIKeyMonitor';    MaxAgeHours = 48 },
    @{ Name = 'StarlightSecretScan';       MaxAgeHours = 48 },
    @{ Name = 'StarlightSubstrateBackup';  MaxAgeHours = 48 },
    @{ Name = 'StarlightCrossRepoIndexer'; MaxAgeHours = 48 },
    @{ Name = 'FrankXMachineMonitor';      MaxAgeHours = 6  }
)
# 0 = success, 267009 = currently running, 267045 = queued
$OkResults = @(0, 267009, 267045)

foreach ($g in $GuardTasks) {
    $task = Get-ScheduledTask -TaskName $g.Name -ErrorAction SilentlyContinue
    if (-not $task) {
        Add-Finding 'RED' 'guard-tasks' "$($g.Name): task MISSING"
        continue
    }
    if ($task.State -eq 'Disabled') {
        Add-Finding 'YELLOW' 'guard-tasks' "$($g.Name): task is Disabled"
        continue
    }
    $info = Get-ScheduledTaskInfo -TaskName $g.Name
    if ($info.LastTaskResult -notin $OkResults) {
        Add-Finding 'RED' 'guard-tasks' ("$($g.Name): last result 0x{0:X} at {1}" -f $info.LastTaskResult, $info.LastRunTime)
    }
    if ($info.LastRunTime -lt $Now.AddHours(-$g.MaxAgeHours)) {
        Add-Finding 'RED' 'guard-tasks' "$($g.Name): stale -- last ran $($info.LastRunTime) (max age $($g.MaxAgeHours)h)"
    }
    # The exact bomb that killed monitoring in May: versioned Store pwsh path.
    foreach ($action in $task.Actions) {
        if ($action.Execute -match 'WindowsApps\\Microsoft\.PowerShell_[\d.]+_') {
            Add-Finding 'RED' 'guard-tasks' "$($g.Name): action uses VERSIONED pwsh path ($($action.Execute)) -- will break on next PowerShell update. Repoint to `$env:LOCALAPPDATA\Microsoft\WindowsApps\pwsh.exe"
        }
    }
}

# --- 2. Listening ports (non-loopback) ----------------------------------------
$loopback = @('127.0.0.1', '::1')
$listeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalAddress -notin $loopback } |
    ForEach-Object {
        $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        '{0}:{1}' -f ($proc.ProcessName ?? 'unknown'), $_.LocalPort
    } | Sort-Object -Unique

# --- 3. Autostart surface ------------------------------------------------------
$runEntries = @()
foreach ($hive in 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run',
                  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run') {
    $props = Get-ItemProperty $hive -ErrorAction SilentlyContinue
    if ($props) {
        $runEntries += $props.PSObject.Properties |
            Where-Object { $_.Name -notmatch '^PS(Path|ParentPath|ChildName|Drive|Provider)$' } |
            ForEach-Object { "$hive::$($_.Name)" }
    }
}
$startupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$runEntries += Get-ChildItem $startupDir -ErrorAction SilentlyContinue | ForEach-Object { "startup::$($_.Name)" }
$nonMsTasks = Get-ScheduledTask -ErrorAction SilentlyContinue |
    Where-Object { $_.TaskPath -notlike '\Microsoft*' } |
    ForEach-Object { "task::$($_.TaskName)" }
$autostarts = @($runEntries + $nonMsTasks) | Sort-Object -Unique

# --- Baseline compare -----------------------------------------------------------
$current = [PSCustomObject]@{
    listeners  = @($listeners)
    autostarts = @($autostarts)
    updated    = $Now.ToString('s')
}

if ($UpdateBaseline -or -not (Test-Path $BaselinePath)) {
    $current | ConvertTo-Json -Depth 4 | Set-Content $BaselinePath -Encoding utf8
    Add-Finding 'INFO' 'baseline' "Baseline written ($($listeners.Count) listeners, $($autostarts.Count) autostarts)"
} else {
    $baseline = Get-Content $BaselinePath -Raw | ConvertFrom-Json
    foreach ($l in $listeners | Where-Object { $_ -notin $baseline.listeners }) {
        Add-Finding 'YELLOW' 'ports' "NEW non-loopback listener since baseline: $l"
    }
    foreach ($a in $autostarts | Where-Object { $_ -notin $baseline.autostarts }) {
        Add-Finding 'YELLOW' 'autostarts' "NEW autostart since baseline: $a"
    }
}

# --- 4. Secret-scan recency + leak counts ---------------------------------------
$latestScan = Get-ChildItem $MonitorDir -Filter 'secret-findings-*.md' -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $latestScan) {
    Add-Finding 'RED' 'secrets' 'No secret-scan output found at all'
} elseif ($latestScan.LastWriteTime -lt $Now.AddHours(-48)) {
    Add-Finding 'RED' 'secrets' "Secret scan stale -- latest output $($latestScan.Name) from $($latestScan.LastWriteTime)"
} else {
    $leakLines = Select-String -Path $latestScan.FullName -Pattern 'leaks found: (\d+)' -AllMatches
    $total = ($leakLines.Matches | ForEach-Object { [int]$_.Groups[1].Value } | Measure-Object -Sum).Sum
    if ($total -gt 0) {
        Add-Finding 'YELLOW' 'secrets' "Latest scan ($($latestScan.Name)) reports $total leak finding(s) -- triage required"
    }
}

# --- 5. Defender + firewall ------------------------------------------------------
try {
    $mp = Get-MpComputerStatus
    if (-not $mp.RealTimeProtectionEnabled) { Add-Finding 'RED' 'defender' 'Real-time protection is OFF' }
    if (-not $mp.IsTamperProtected)         { Add-Finding 'YELLOW' 'defender' 'Tamper protection is OFF' }
    if ($mp.AntivirusSignatureLastUpdated -lt $Now.AddDays(-3)) {
        Add-Finding 'YELLOW' 'defender' "AV signatures stale: $($mp.AntivirusSignatureLastUpdated)"
    }
} catch {
    Add-Finding 'YELLOW' 'defender' "Could not query Defender status: $($_.Exception.Message)"
}
foreach ($fw in Get-NetFirewallProfile -ErrorAction SilentlyContinue) {
    if (-not $fw.Enabled) { Add-Finding 'RED' 'firewall' "Firewall profile $($fw.Name) is DISABLED" }
}

# --- Report -----------------------------------------------------------------------
$zone = 'GREEN'
if ($findings | Where-Object Severity -eq 'YELLOW') { $zone = 'YELLOW' }
if ($findings | Where-Object Severity -eq 'RED')    { $zone = 'RED' }

$lines = @(
    "# Machine Sentinel -- $($Now.ToString('yyyy-MM-dd HH:mm'))"
    ''
    "**Zone: $zone**"
    ''
    "Listeners (non-loopback): $($listeners.Count) | Autostarts tracked: $($autostarts.Count)"
    ''
)
if ($findings.Count -eq 0) {
    $lines += 'All checks passed.'
} else {
    foreach ($f in $findings | Sort-Object @{ E = { @('RED','YELLOW','INFO').IndexOf($_.Severity) } }) {
        $lines += "- [$($f.Severity)] $($f.Area) :: $($f.Message)"
    }
}
$lines | Set-Content $StatusPath -Encoding utf8

foreach ($f in $findings | Where-Object { $_.Severity -in 'RED', 'YELLOW' }) {
    "[SENTINEL-$($f.Severity)] $($Now.ToString('s')) $($f.Area) :: $($f.Message)" | Add-Content $AlertsPath -Encoding utf8
}

Write-Host "Machine Sentinel: zone $zone ($($findings.Count) finding(s)) -> $StatusPath"
if ($zone -eq 'RED') { exit 2 } elseif ($zone -eq 'YELLOW') { exit 1 } else { exit 0 }
