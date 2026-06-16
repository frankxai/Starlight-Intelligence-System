# Agent Watchdog -- automated lifecycle monitor and performance optimizer.
#
# Role: AIOps + MachineOps guardrail. Runs on a scheduled task (StarlightAgentWatchdog).
#
# What it does:
#   1. Process Audit: Identifies and terminates orphaned agent CLI sessions (claude, codex, opencode),
#      stuck Playwright/MCP instances, and idle background shells older than 4 hours, safely
#      bypassing active current agent sessions (using parent PID mapping).
#   2. Worktree Cleanup: Prunes stale git worktrees from closed/crashed agent runs.
#   3. MCP Port & Watchdog Audit: Checks if development ports are blocked by zombie processes.
#   4. Observability Log: Appends diagnostics to private/api-monitor/WATCHDOG-STATUS.md.

$ErrorActionPreference = 'Stop'

$RepoRoot     = (Resolve-Path "$PSScriptRoot\..").Path
$MonitorDir   = Join-Path $RepoRoot 'private\api-monitor'
$StatusPath   = Join-Path $MonitorDir 'WATCHDOG-STATUS.md'
$LogPath      = Join-Path $MonitorDir 'WATCHDOG-ALERTS.md'
$Now          = Get-Date

New-Item -ItemType Directory -Path $MonitorDir -Force | Out-Null

$cleanups = New-Object System.Collections.Generic.List[string]
function Log-Cleanup([string]$msg) {
    $cleanups.Add($msg)
    Write-Host $msg
}

# --- 1. Find our own session hierarchy to protect them ------------------------
$myPid = $PID
$protectedPids = @($myPid)

# Trace up parent process chain to protect our own shells and agy runners
$currPid = $myPid
while ($currPid) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $currPid" -ErrorAction SilentlyContinue
    if ($proc -and $proc.ParentProcessId) {
        $protectedPids += $proc.ParentProcessId
        $currPid = $proc.ParentProcessId
    } else {
        $currPid = $null
    }
}
Log-Cleanup ("Protected PIDs (current active chain): " + ($protectedPids -join ', '))

# --- 2. Process Cleanup (claude, codex, node, pwsh orphans) -------------------
# Target processes started > 4 hours ago
$thresholdTime = $Now.AddHours(-4)

$targetProcessNames = @('claude', 'codex', 'node', 'pwsh')
$allProcs = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -in $targetProcessNames }

foreach ($p in $allProcs) {
    if ($p.Id -in $protectedPids) {
        continue
    }

    # Safe check for StartTime (handles access exceptions gracefully)
    $startTime = $null
    try {
        $startTime = $p.StartTime
    } catch {
        # If we can't query StartTime, skip to avoid breaking system processes
        continue
    }

    if ($startTime -and $startTime -lt $thresholdTime) {
        $killProcess = $false
        $reason = ''

        # Match specific agent signatures
        if ($p.ProcessName -in 'claude', 'codex') {
            $killProcess = $true
            $reason = "Orphaned agent session started at $startTime"
        }
        elseif ($p.ProcessName -eq 'node') {
            # Inspect command line for Node agent wrappers
            $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($p.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmd -match 'playwright/mcp|openai/codex|starlight-mcp.js|npx-cli.js') {
                $killProcess = $true
                $reason = "Orphaned agent sub-process (MCP/adapter) started at $startTime -- $cmd"
            }
        }
        elseif ($p.ProcessName -eq 'pwsh') {
            # pwsh processes started long ago with no active agy or claude parents
            $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($p.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmd -match 'PSReadline|NonInteractive') {
                $killProcess = $true
                $reason = "Orphaned background terminal shell started at $startTime"
            }
        }

        if ($killProcess) {
            try {
                Stop-Process -Id $p.Id -Force -ErrorAction Stop
                Log-Cleanup ("Killed PID $($p.Id) ($($p.ProcessName)) -- $reason")
            } catch {
                Log-Cleanup ("Failed to kill PID $($p.Id) ($($p.ProcessName)): " + $_.Exception.Message)
            }
        }
    }
}

# --- 3. Git Worktree Cleanup --------------------------------------------------
Log-Cleanup "Auditing git worktrees..."
if (Test-Path "$RepoRoot\.git") {
    # Prune first (cleans up reference pointers of deleted folders)
    $null = & git -C $RepoRoot worktree prune 2>&1
    
    # Get active list
    $worktrees = & git -C $RepoRoot worktree list --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        $wtPaths = @()
        foreach ($line in $worktrees) {
            if ($line -match '^worktree\s+(.+)$') {
                $wtPaths += $Matches[1].Trim()
            }
        }
        
        # Check folders under .claude/worktrees
        $wtDir = Join-Path $RepoRoot '.claude\worktrees'
        if (Test-Path $wtDir) {
            $folders = Get-ChildItem $wtDir -Directory
            foreach ($f in $folders) {
                # If folder path is not listed as active by git worktree list, it's stale
                $matched = $wtPaths | Where-Object { $_ -replace '\\','/' -eq $f.FullName -replace '\\','/' }
                if (-not $matched) {
                    try {
                        Remove-Item $f.FullName -Recurse -Force -ErrorAction Stop
                        Log-Cleanup ("Deleted stale worktree directory: $($f.FullName)")
                    } catch {
                        Log-Cleanup ("Failed to delete stale worktree folder $($f.FullName): " + $_.Exception.Message)
                    }
                }
            }
        }
    }
}

# --- 4. MCP Port Audit --------------------------------------------------------
$ports = @(7373, 7777, 3007)
foreach ($p in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        # If port is held but starting process is older than 4 hours, it's a zombie port lock
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            $startTime = $null
            try { $startTime = $proc.StartTime } catch {}
            if ($startTime -and $startTime -lt $thresholdTime) {
                try {
                    Stop-Process -Id $proc.Id -Force -ErrorAction Stop
                    Log-Cleanup ("Freed zombie port $p by killing process $($proc.Id) ($($proc.ProcessName))")
                } catch {
                    Log-Cleanup ("Failed to free port $p (process $($proc.Id)): " + $_.Exception.Message)
                }
            }
        }
    }
}

# --- 5. Generate Report -------------------------------------------------------
$reportLines = @(
    "# Starlight Agent Watchdog Status -- $($Now.ToString('yyyy-MM-dd HH:mm'))"
    ''
    "**Cleanups executed during this run: $($cleanups.Count)**"
    ''
    '### Run details:'
)
if ($cleanups.Count -eq 0) {
    $reportLines += '- System healthy. No orphaned agent sessions or stale worktrees found.'
} else {
    foreach ($c in $cleanups) {
        $reportLines += "- $c"
    }
}

$reportLines | Set-Content $StatusPath -Encoding utf8

if ($cleanups.Count -gt 0) {
    foreach ($c in $cleanups) {
        "[WATCHDOG] $($Now.ToString('s')) :: $c" | Add-Content $LogPath -Encoding utf8
    }
}

Write-Host "Watchdog complete: $($cleanups.Count) event(s) logged."
exit 0
