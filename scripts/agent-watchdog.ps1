# Agent Watchdog -- bounded lifecycle and machine-pressure guard.
[CmdletBinding()]
param(
    [switch]$DryRun,
    [int]$MaxAgeHours = 4,
    [double]$MinimumFreeDiskGiB = 50,
    [double]$MaximumRamPercent = 90
)

$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$MonitorDir = Join-Path $RepoRoot 'private\api-monitor'
$StatusPath = Join-Path $MonitorDir 'WATCHDOG-STATUS.md'
$LogPath = Join-Path $MonitorDir 'WATCHDOG-ALERTS.md'
$Now = Get-Date
$thresholdTime = $Now.AddHours(-$MaxAgeHours)
New-Item -ItemType Directory -Path $MonitorDir -Force | Out-Null

$events = New-Object System.Collections.Generic.List[string]
$candidates = New-Object System.Collections.Generic.List[string]
function Log-Event([string]$Message) {
    $events.Add($Message)
    Write-Host $Message
}
function Log-Candidate([string]$Message) {
    $candidates.Add($Message)
    Write-Host $Message
}
function Stop-BoundedProcess([int]$ProcessId, [string]$Name, [string]$Reason) {
    if ($DryRun) {
        Log-Candidate "DRY-RUN would stop PID $ProcessId ($Name) -- $Reason"
        return
    }
    try {
        Stop-Process -Id $ProcessId -Force -ErrorAction Stop
        Log-Event "Stopped PID $ProcessId ($Name) -- $Reason"
    } catch {
        Log-Candidate "Failed to stop PID $ProcessId ($Name): $($_.Exception.Message)"
    }
}

# Protect this task's complete process ancestry.
$protectedPids = @($PID)
$currentPid = $PID
while ($currentPid) {
    $current = Get-CimInstance Win32_Process -Filter "ProcessId = $currentPid" -ErrorAction SilentlyContinue
    if ($current -and $current.ParentProcessId -and $current.ParentProcessId -notin $protectedPids) {
        $protectedPids += [int]$current.ParentProcessId
        $currentPid = [int]$current.ParentProcessId
    } else {
        $currentPid = $null
    }
}

$allCim = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)
$childrenByParent = @{}
foreach ($item in $allCim) {
    $parentKey = [int]$item.ParentProcessId
    if (-not $childrenByParent.ContainsKey($parentKey)) {
        $childrenByParent[$parentKey] = New-Object System.Collections.Generic.List[object]
    }
    $childrenByParent[$parentKey].Add($item)
}

# Auto-stop only signatures that are strongly proven to be leaks.
foreach ($item in $allCim) {
    $name = [string]$item.Name
    if ($name -notin @('powershell.exe', 'pwsh.exe', 'node.exe', 'claude.exe', 'codex.exe')) { continue }
    if ([int]$item.ProcessId -in $protectedPids) { continue }

    $process = Get-Process -Id $item.ProcessId -ErrorAction SilentlyContinue
    if (-not $process) { continue }
    try { $startTime = $process.StartTime } catch { continue }
    if ($startTime -ge $thresholdTime) { continue }

    $commandLine = [string]$item.CommandLine
    $executablePath = [string]$item.ExecutablePath
    $ArgumentList = @()
    if ($commandLine -and $executablePath) {
        $normalizedCommand = $commandLine.Trim().Trim('"')
        $normalizedExecutable = $executablePath.Trim().Trim('"')
        if ($normalizedCommand -ine $normalizedExecutable) {
            $ArgumentList = @($normalizedCommand)
        }
    }

    if ($name -in @('powershell.exe', 'pwsh.exe') -and $ArgumentList.Count -eq 0) {
        $children = if ($childrenByParent.ContainsKey([int]$item.ProcessId)) { @($childrenByParent[[int]$item.ProcessId]) } else { @() }
        $onlyConsoleChildren = @($children | Where-Object { $_.Name -ine 'conhost.exe' }).Count -eq 0
        $connections = @(Get-NetTCPConnection -OwningProcess $item.ProcessId -ErrorAction SilentlyContinue)
        if ($onlyConsoleChildren -and $connections.Count -eq 0) {
            Stop-BoundedProcess ([int]$item.ProcessId) $name "argumentless shell older than ${MaxAgeHours}h with only conhost children and no network connections"
        }
        continue
    }

    if ($name -eq 'node.exe' -and $commandLine -match 'playwright[/\\]mcp|openai[/\\]codex|starlight-mcp\.js|npx-cli\.js') {
        Stop-BoundedProcess ([int]$item.ProcessId) $name "known orphanable agent wrapper older than ${MaxAgeHours}h"
        continue
    }

    if ($name -in @('claude.exe', 'codex.exe')) {
        Log-Candidate "Review-only: PID $($item.ProcessId) ($name) is older than ${MaxAgeHours}h; not auto-stopped without stronger idle proof"
    }
}

# Worktrees are report-only. Never delete directories or WIP from a watchdog.
if (Test-Path "$RepoRoot\.git") {
    $worktrees = & git -C $RepoRoot worktree list --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        $worktreeCount = @($worktrees | Where-Object { $_ -match '^worktree\s+' }).Count
        Log-Candidate "Observed $worktreeCount registered SIS worktree(s); no automatic deletion performed"
    }
}

# Old listeners are evidence, not automatic kill authority.
foreach ($port in @(7373, 7777, 3007)) {
    $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $connection) { continue }
    $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        try { $ageHours = ($Now - $process.StartTime).TotalHours } catch { $ageHours = 0 }
        if ($ageHours -ge $MaxAgeHours) {
            Log-Candidate "Review-only: port $port held by PID $($process.Id) ($($process.ProcessName)) for $([math]::Round($ageHours,1))h"
        }
    }
}

# Enforced resource receipt used by the night runner and sentinels.
$os = Get-CimInstance Win32_OperatingSystem
$ramUsedPercent = [math]::Round((1 - ($os.FreePhysicalMemory / $os.TotalVisibleMemorySize)) * 100, 1)
$ramAvailableGiB = [math]::Round(($os.FreePhysicalMemory * 1KB) / 1GB, 2)
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
$diskFreeGiB = [math]::Round($disk.FreeSpace / 1GB, 2)
$resourceZone = if ($diskFreeGiB -lt $MinimumFreeDiskGiB -or $ramUsedPercent -gt $MaximumRamPercent) { 'RED' } else { 'GREEN' }

$reportLines = @(
    "# Starlight Agent Watchdog Status -- $($Now.ToString('yyyy-MM-dd HH:mm'))",
    '',
    "**Mode:** $(if ($DryRun) { 'DRY-RUN' } else { 'ENFORCE' })",
    "**Resource zone:** $resourceZone",
    "**Disk free:** $diskFreeGiB GiB (floor $MinimumFreeDiskGiB GiB)",
    "**RAM used:** $ramUsedPercent% | available $ramAvailableGiB GiB (ceiling $MaximumRamPercent%)",
    "**Cleanup events:** $($events.Count) | review candidates: $($candidates.Count)",
    '',
    '## Events'
)
if ($events.Count -eq 0) { $reportLines += '- None.' } else { $reportLines += @($events | ForEach-Object { "- $_" }) }
$reportLines += @('', '## Review-only candidates')
if ($candidates.Count -eq 0) { $reportLines += '- None.' } else { $reportLines += @($candidates | ForEach-Object { "- $_" }) }
$reportLines | Set-Content $StatusPath -Encoding utf8

foreach ($event in $events) {
    "[WATCHDOG] $($Now.ToString('s')) :: $event" | Add-Content $LogPath -Encoding utf8
}
if ($resourceZone -eq 'RED') {
    "[WATCHDOG-RED] $($Now.ToString('s')) :: disk=${diskFreeGiB}GiB ram=${ramUsedPercent}%" | Add-Content $LogPath -Encoding utf8
}

Write-Host "Watchdog complete: zone=$resourceZone events=$($events.Count) candidates=$($candidates.Count)"
if ($resourceZone -eq 'RED') { exit 2 }
exit 0
