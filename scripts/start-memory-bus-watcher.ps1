# Memory Bus Watcher launcher
# Singleton via PID file. If watcher already running (~/.memory-bus-watcher.pid + process alive),
# this no-ops cleanly. Otherwise launches detached background process.

$ErrorActionPreference = "Stop"
$pidFile = Join-Path $HOME ".memory-bus-watcher.pid"
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$busDir = Join-Path $repoRoot "private\memory-bus"

# Check existing PID file — silent no-op if watcher is already alive
if (Test-Path $pidFile) {
    $existingPid = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($existingPid -and (Get-Process -Id $existingPid -ErrorAction SilentlyContinue)) {
        exit 0
    }
}

# Launch detached background — no console window, survives parent exit
$pythonExe = (Get-Command python).Source
$logOut = Join-Path $HOME ".memory-bus-watcher.log"
$logErr = Join-Path $HOME ".memory-bus-watcher.err"

Start-Process -FilePath $pythonExe `
    -ArgumentList @("-m", "watcher.daemon") `
    -WorkingDirectory $busDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $logOut `
    -RedirectStandardError $logErr | Out-Null

# Brief grace for daemon to write its PID file
Start-Sleep -Milliseconds 500
