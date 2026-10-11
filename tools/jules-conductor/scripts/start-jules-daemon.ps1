# Starlight Jules Autonomous Conductor Daemon Launcher
# Starts the conductor daemon detached in the background and launches telemetry server.
# Built on SIP — Starlight Intelligence Protocol v1.1.1.

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ConductorDir = Split-Path -Parent $ScriptDir
$StateDir = Join-Path $ConductorDir "state"
$PidFile = Join-Path $StateDir "daemon.pid"
$LogsDir = Join-Path $ConductorDir "logs"
$LogFile = Join-Path $LogsDir "conductor.log"

if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

if (Test-Path $PidFile) {
    $OldPid = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($OldPid) {
        $OldProc = Get-Process -Id $OldPid -ErrorAction SilentlyContinue
        if ($OldProc) {
            Write-Host "Stopping existing Jules Conductor Daemon (PID: $OldPid)..." -ForegroundColor Yellow
            Stop-Process -Id $OldPid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting Starlight Jules Conductor Daemon v2.1..." -ForegroundColor Cyan
$ConductorScript = Join-Path $ConductorDir "conductor.mjs"

$Proc = Start-Process -FilePath "node" -ArgumentList "`"$ConductorScript`"", "daemon" -WorkingDirectory $ConductorDir -PassThru -WindowStyle Hidden

if ($Proc -and -not $Proc.HasExited) {
    Write-Host "Starlight Jules Conductor active! PID: $($Proc.Id)" -ForegroundColor Green
    Write-Host "Live Telemetry HUD: http://127.0.0.1:9191" -ForegroundColor Cyan
    Write-Host "Log Output: $LogFile" -ForegroundColor Gray
} else {
    Write-Host "Failed to start conductor daemon." -ForegroundColor Red
}
