# ==============================================================================
# Starlight Intelligence System — Substrate Ops Health Monitor (6-Gates)
# ==============================================================================
# Built on SIP · Idempotent · Windows-optimized
# Checks Memory Bus, brain_watchdog, Voice Operator, dashboard, audit log, and scheduled tasks.
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

# Gate 1: Memory Bus
$bus = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -match 'memory-bus' -or
    (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -match 'memory-bus.server'
}
if ($bus) {
    $gates["Memory Bus"] = "GREEN"
    $score++
} else {
    $gates["Memory Bus"] = "RED (not running — run: pwsh scripts/start-memory-bus-watcher.ps1)"
}

# Gate 2: brain_watchdog
$brain = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object {
    (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -match 'brain_watchdog'
}
if ($brain) {
    $gates["brain_watchdog"] = "GREEN"
    $score++
} else {
    $gates["brain_watchdog"] = "YELLOW (not running)"
}

# Gate 3: Voice Operator
try {
    $vo = Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 2 -ErrorAction Stop
    $gates["Voice Operator"] = "GREEN"
    $score++
} catch {
    $gates["Voice Operator"] = "YELLOW (no response on :8000)"
}

# Gate 4: Dashboard
try {
    $dash = Invoke-WebRequest -Uri 'http://localhost:3007/' -TimeoutSec 2 -ErrorAction Stop
    $gates["Dashboard"] = "GREEN"
    $score++
} catch {
    $gates["Dashboard"] = "YELLOW (no response on :3007 — run: cd private/local-command-center/apps/dashboard && npm run dev)"
}

# Gate 5: Audit log freshness
$today = (Get-Date).ToString('yyyy-MM-dd')
$audit = "C:\Users\frank\Starlight-Intelligence-System\memory\_audit\$today.jsonl"
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
$tasks = @('StarlightCockpit', 'StarlightCrossRepoIndexer', 'Starlight Dreaming')
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
        $tasksDetail += "$t (MISSING — run scripts/register-*.ps1 files)"
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
Write-Host ""
Write-Host "/heart — Ops health: $score/$totalGates ($statusLabel)" -ForegroundColor (if ($statusLabel -eq "GREEN") { "Green" } elseif ($statusLabel -eq "YELLOW") { "Yellow" } else { "Red" })
Write-Host ""

foreach ($g in $gates.Keys) {
    $val = $gates[$g]
    $icon = "✓"
    $color = "DarkGray"
    if ($val -match '^GREEN') {
        $icon = "✓"
        $color = "Green"
    } elseif ($val -match '^YELLOW') {
        $icon = "⚠"
        $color = "Yellow"
    } else {
        $icon = "✗"
        $color = "Red"
    }
    Write-Host "  $icon $g : $val" -ForegroundColor $color
}
Write-Host ""
Write-Host "Built on SIP — operational-tier · machine substrate check" -ForegroundColor DarkCyan
Write-Host ""

# Exit code reflects health: 0 if green/yellow, 1 if critical red
if ($statusLabel -eq "RED") {
    exit 1
} else {
    exit 0
}
