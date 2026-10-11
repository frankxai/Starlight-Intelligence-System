# C:\Users\frank\Starlight-Intelligence-System\scripts\start-jules-daemon.ps1
#
# Starlight Jules Conductor Daemon Launcher
# Role: MachineOps / Autonomous Cloud Conductor Lifecycle
# Built on SIP — Starlight Intelligence Protocol v1.1.1.

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Start", "Stop", "Status", "Restart")]
    [string]$Action = "Status"
)

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RepoRoot  = (Resolve-Path "$ScriptDir\..").Path
$ConductorScript = Join-Path $RepoRoot "tools\jules-conductor\conductor.mjs"
$LogFile = Join-Path $RepoRoot "tools\jules-conductor\logs\conductor.log"
$PidFile = Join-Path $RepoRoot "tools\jules-conductor\state\daemon.pid"

function Get-ConductorProcess {
    if (Test-Path $PidFile) {
        $raw = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
        if ($raw -and ($raw.Trim() -match '^\d+$')) {
            $p = Get-Process -Id ([int]$raw.Trim()) -ErrorAction SilentlyContinue
            if ($p -and ($p.ProcessName -match 'node')) {
                return $p
            }
        }
    }
    return $null
}

$proc = Get-ConductorProcess

if ($Action -eq "Status") {
    if ($proc) {
        $wsMb = [math]::Round($proc.WorkingSet64 / 1MB, 1)
        $cpuSec = [math]::Round($proc.TotalProcessorTime.TotalSeconds, 1)
        Write-Host "[RUNNING] Jules Conductor Daemon is active (PID: $($proc.Id), RAM: ${wsMb} MB, CPU Time: ${cpuSec}s)" -ForegroundColor Green
        Write-Host "Logs streaming to: $LogFile" -ForegroundColor Gray
    } else {
        Write-Host "[STOPPED] Jules Conductor Daemon is not running." -ForegroundColor Yellow
        Write-Host "Run: pwsh -File scripts\start-jules-daemon.ps1 -Action Start" -ForegroundColor Gray
    }
    return
}

if ($Action -eq "Stop" -or $Action -eq "Restart") {
    if ($proc) {
        Write-Host "Stopping Conductor Daemon PID $($proc.Id)..." -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force
        Start-Sleep -Seconds 1
        if (Test-Path $PidFile) { Remove-Item $PidFile -Force -ErrorAction SilentlyContinue }
        $proc = $null
    } else {
        Write-Host "No active daemon process found." -ForegroundColor Gray
    }
}

if ($Action -eq "Start" -or $Action -eq "Restart") {
    if ($proc) {
        Write-Host "Daemon is already running (PID $($proc.ProcessId))." -ForegroundColor Green
        return
    }

    Write-Host "Starting Starlight Jules Conductor Daemon v2.0 in background..." -ForegroundColor Cyan
    
    $nodeExe = (Get-Command node -ErrorAction Stop).Source
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $nodeExe
    $pinfo.Arguments = "`"$ConductorScript`" daemon"
    $pinfo.WorkingDirectory = $RepoRoot
    $pinfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $pinfo.CreateNoWindow = $true
    $pinfo.UseShellExecute = $false
    $pinfo.RedirectStandardOutput = $false
    $pinfo.RedirectStandardError = $false

    $bgProcess = [System.Diagnostics.Process]::Start($pinfo)
    Start-Sleep -Seconds 3

    $newProc = Get-ConductorProcess
    if ($newProc) {
        $wsMb = [math]::Round($newProc.WorkingSetSize / 1MB, 1)
        Write-Host "[OK] Daemon successfully started (PID: $($newProc.ProcessId), WorkingSet: ${wsMb} MB)." -ForegroundColor Green
        Write-Host "Logs streaming to: $LogFile" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] Failed to verify daemon startup. Check logs." -ForegroundColor Red
    }
}
