# C:\Users\frank\Starlight-Intelligence-System\scripts\watch-launcher.ps1
#
# Starlight User-Session Launcher Watcher
# Monitors C:\Users\frank\Starlight-Intelligence-System\private\launcher-trigger.txt
# and executes commands in the active interactive desktop session.

$ErrorActionPreference = 'Stop'
$TriggerFile = "C:\Users\frank\Starlight-Intelligence-System\private\launcher-trigger.txt"
$WtPath = "C:\Users\frank\AppData\Local\Microsoft\WindowsApps\wt.exe"
$RestartScript = "C:\Users\frank\Starlight-Intelligence-System\scripts\restart-all-agents.ps1"

Write-Host "===================================================="
Write-Host " Starlight User-Session Launcher Watcher (v1.0)" -ForegroundColor Green
Write-Host " Monitoring trigger file: $TriggerFile" -ForegroundColor Green
Write-Host "===================================================="

# Ensure trigger directory exists
$TriggerDir = Split-Path -Parent $TriggerFile
if (-not (Test-Path $TriggerDir)) {
    New-Item -ItemType Directory -Path $TriggerDir -Force | Out-Null
}

# Clear stale trigger on startup
if (Test-Path $TriggerFile) {
    Remove-Item -Path $TriggerFile -Force
}

while ($true) {
    if (Test-Path $TriggerFile) {
        try {
            $content = Get-Content $TriggerFile -Raw
            $action = $content.Trim().ToLower()
            
            if ($action -eq "start" -or $action -eq "restart") {
                Write-Host "[$(Get-Date)] Trigger detected: $action. Initiating launch..." -ForegroundColor Green
                
                # First, ensure existing agent processes are terminated
                Write-Host "Cleaning up old agents..." -ForegroundColor Yellow
                pwsh.exe -File $RestartScript -Action Kill
                
                # Resolve absolute path to pwsh
                $pwshPath = "C:\Users\frank\AppData\Local\Microsoft\WindowsApps\pwsh.exe"
                if (-not (Test-Path $pwshPath)) {
                    $pwshPath = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
                    if (-not $pwshPath) { $pwshPath = "powershell.exe" }
                }

                # Command arguments to launch Windows Terminal with four tabs
                $Arguments = "-d C:\Users\frank\Starlight-Intelligence-System `"$pwshPath`" -NoExit -Command clsis `; new-tab -d C:\Users\frank\Arcanea `"$pwshPath`" -NoExit -Command agyarc `; new-tab -d C:\Users\frank\FrankX `"$pwshPath`" -NoExit -Command agyfx `; new-tab -d C:\Users\frank\agentic-creator-os `"$pwshPath`" -NoExit -Command acos"
                
                Write-Host "Launching Windows Terminal..." -ForegroundColor Cyan
                Start-Process $WtPath -ArgumentList $Arguments
                
            } elseif ($action -eq "kill") {
                Write-Host "[$(Get-Date)] Trigger detected: kill. Terminating all agents..." -ForegroundColor Yellow
                pwsh.exe -File $RestartScript -Action Kill
            }
        } catch {
            Write-Warning "Error processing trigger: $($_.Exception.Message)"
        } finally {
            # Clean up the trigger file to prevent loop re-execution
            if (Test-Path $TriggerFile) {
                Remove-Item -Path $TriggerFile -Force
            }
        }
    }
    Start-Sleep -Seconds 1
}
