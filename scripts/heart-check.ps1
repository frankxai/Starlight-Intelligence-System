# ==============================================================================
# Starlight Intelligence System — Substrate Ops Health Monitor (6-Gates)
# ==============================================================================
# Built on SIP · Idempotent · Windows-optimized
# Checks Memory Bus, agent watchdog, Voice Operator, dashboard, audit log, and scheduled tasks.
# ==============================================================================

# Force console UTF-8 support
try {
    if ([Console]::OutputEncoding.CodePage -ne 65001) {
        [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
        $OutputEncoding = [System.Text.UTF8Encoding]::new()
    }
} catch {}

$gates = [ordered]@{}
$score = 0
$totalGates = 6
$RepoRoot = Split-Path -Parent $PSScriptRoot

# Gate 1: Memory Bus
$memoryBusServer = Join-Path $RepoRoot "private\memory-bus\server.py"
$memoryBusRequest = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"memory_health","arguments":{}}}'
if (Test-Path $memoryBusServer) {
    try {
        $memoryBusRequestPath = [System.IO.Path]::GetTempFileName()
        try {
            Set-Content -LiteralPath $memoryBusRequestPath -Value $memoryBusRequest -Encoding ASCII -NoNewline
            $memoryBusResponse = cmd /c "type ""$memoryBusRequestPath"" | python ""$memoryBusServer""" | Select-Object -First 1
        } finally {
            Remove-Item -LiteralPath $memoryBusRequestPath -Force -ErrorAction SilentlyContinue
        }
        if ($memoryBusResponse -match 'healthy') {
            $gates["Memory Bus"] = "GREEN (stdio health probe)"
            $score++
        } else {
            $gates["Memory Bus"] = "RED (health probe failed)"
        }
    } catch {
        $gates["Memory Bus"] = "RED (health probe error: $($_.Exception.Message))"
    }
} else {
    $gates["Memory Bus"] = "RED (server missing at private\memory-bus\server.py)"
}

# Gate 2: Agent Watchdog
$watchdogScript = Join-Path $RepoRoot "scripts\agent-watchdog.ps1"
$watchdogTask = Get-ScheduledTask -TaskName 'StarlightAgentWatchdog' -ErrorAction SilentlyContinue
if (-not (Test-Path $watchdogScript)) {
    $gates["Agent Watchdog"] = "RED (script missing at scripts\agent-watchdog.ps1)"
} elseif ($watchdogTask -and ($watchdogTask.State -eq "Ready" -or $watchdogTask.State -eq "Running")) {
    $gates["Agent Watchdog"] = "GREEN ($($watchdogTask.State))"
    $score++
} elseif ($watchdogTask) {
    $gates["Agent Watchdog"] = "YELLOW ($($watchdogTask.State))"
} else {
    $gates["Agent Watchdog"] = "YELLOW (task missing - run scripts\register-agent-watchdog-task.ps1)"
}

# Gate 3: Voice Operator
$voiceOperatorRoot = Join-Path $RepoRoot 'private\voice-operator'
if (-not (Test-Path $voiceOperatorRoot)) {
    $gates["Voice Operator"] = "YELLOW (private\voice-operator not installed in this checkout)"
} else {
    try {
        $vo = Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $gates["Voice Operator"] = "GREEN"
        $score++
    } catch {
        $gates["Voice Operator"] = "YELLOW (no response on :8000)"
    }
}

# Gate 4: Dashboard
$dashboardCandidates = @()
if (Test-Path (Join-Path $RepoRoot 'private\local-command-center\apps\dashboard')) {
    $dashboardCandidates += [PSCustomObject]@{
        Name = 'legacy dashboard'
        Url = 'http://localhost:3007/'
        Hint = 'cd private\local-command-center\apps\dashboard; npm run dev'
    }
}
if (Test-Path (Join-Path $RepoRoot 'console\package.json')) {
    $dashboardCandidates += [PSCustomObject]@{
        Name = 'console'
        Url = 'http://localhost:3001/'
        Hint = 'npm --prefix console run dev'
    }
}
if (Test-Path (Join-Path $RepoRoot 'site\package.json')) {
    $dashboardCandidates += [PSCustomObject]@{
        Name = 'site cockpit'
        Url = 'http://localhost:3000/cockpit'
        Hint = 'npm --prefix site run dev'
    }
}

$dashboardGreen = $false
$dashboardHints = @()
$repoRootForMatch = $RepoRoot -replace '\\','/'
foreach ($candidate in $dashboardCandidates) {
    $dashboardHints += "$($candidate.Name): $($candidate.Hint)"
    try {
        $candidateUri = [Uri]$candidate.Url
        $dash = Invoke-WebRequest -Uri $candidate.Url -UseBasicParsing -TimeoutSec 8 -ErrorAction Stop
        $ownedByRepo = $false
        $listeners = @(Get-NetTCPConnection -LocalPort $candidateUri.Port -State Listen -ErrorAction SilentlyContinue)
        foreach ($listener in $listeners) {
            $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue
            $ownerCommand = $owner.CommandLine -replace '\\','/'
            if ($ownerCommand -and $ownerCommand -like "*$repoRootForMatch*") {
                $ownedByRepo = $true
                break
            }
        }
        if (-not $ownedByRepo) {
            continue
        }
        $gates["Dashboard"] = "GREEN ($($candidate.Name) at $($candidate.Url))"
        $score++
        $dashboardGreen = $true
        break
    } catch {}
}
if (-not $dashboardGreen) {
    if ($dashboardHints.Count -gt 0) {
        $gates["Dashboard"] = "YELLOW (no local dashboard response - run one of: $($dashboardHints -join ' | '))"
    } else {
        $gates["Dashboard"] = "YELLOW (no dashboard app found in this checkout)"
    }
}

# Gate 5: Audit log freshness
$today = (Get-Date).ToString('yyyy-MM-dd')
$audit = Join-Path $RepoRoot "memory\_audit\$today.jsonl"
if (Test-Path $audit) {
    $age = (Get-Date) - (Get-Item $audit).LastWriteTime
    if ($age.TotalHours -lt 1) {
        $gates["Audit log"] = "GREEN"
        $score++
    } elseif ($age.TotalHours -lt 24) {
        $gates["Audit log"] = "YELLOW (last write $([int]$age.TotalMinutes)m ago)"
        $score++
    } else {
        $gates["Audit log"] = "RED (last write >24h ago)"
    }
} else {
    $gates["Audit log"] = "RED (today's file missing)"
}

# Gate 6: Scheduled tasks
$tasks = @(
    'StarlightAgentWatchdog',
    'StarlightMachineSentinel',
    'StarlightPortfolioAudit',
    'StarlightCrossRepoIndexer',
    'StarlightDreaming'
)
$tasksScore = 0
$tasksDetail = @()
foreach ($t in $tasks) {
    $st = Get-ScheduledTask -TaskName $t -ErrorAction SilentlyContinue
    if ($st) {
        $tasksDetail += "$t ($($st.State))"
        if ($st.State -eq "Ready" -or $st.State -eq "Running") {
            $tasksScore++
        }
    } else {
        $tasksDetail += "$t (MISSING - run scripts/register-*.ps1 files)"
    }
}
if ($tasksScore -eq $tasks.Count) {
    $gates["Scheduled tasks"] = "GREEN ($( $tasksDetail -join ', ' ))"
    $score++
} else {
    $gates["Scheduled tasks"] = "YELLOW ($( $tasksDetail -join ', ' ))"
}

# Render Score Card
$statusLabel = if ($score -eq $totalGates) { "GREEN" } elseif ($score -ge 4) { "YELLOW" } else { "RED" }
$statusColor = if ($statusLabel -eq "GREEN") { "Green" } elseif ($statusLabel -eq "YELLOW") { "Yellow" } else { "Red" }
Write-Host ""
Write-Host "/heart - Ops health: $score/$totalGates ($statusLabel)" -ForegroundColor $statusColor
Write-Host ""

foreach ($g in $gates.Keys) {
    $val = $gates[$g]
    $icon = "OK"
    $color = "DarkGray"
    if ($val -match '^GREEN') {
        $icon = "OK"
        $color = "Green"
    } elseif ($val -match '^YELLOW') {
        $icon = "WARN"
        $color = "Yellow"
    } else {
        $icon = "FAIL"
        $color = "Red"
    }
    Write-Host "  $icon $g : $val" -ForegroundColor $color
}
Write-Host ""
Write-Host "Built on SIP - operational-tier - machine substrate check" -ForegroundColor DarkCyan
Write-Host ""

# Exit code reflects health: 0 if green/yellow, 1 if critical red
if ($statusLabel -eq "RED") {
    exit 1
} else {
    exit 0
}
