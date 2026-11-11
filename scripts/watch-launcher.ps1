# Starlight User-Session Launcher Watcher
# Monitors <RepoRoot>\private\launcher-trigger.txt and delegates start/restart/kill
# to scripts\restart-all-agents.ps1 -DirectLaunch inside the interactive desktop session.

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RepoRoot  = (Resolve-Path "$ScriptDir\..").Path
$TriggerFile = Join-Path $RepoRoot "private\launcher-trigger.txt"
$RestartScript = Join-Path $ScriptDir "restart-all-agents.ps1"

Write-Host "===================================================="
Write-Host " Starlight User-Session Launcher Watcher (v2.0)" -ForegroundColor Green
Write-Host " Monitoring trigger file: $TriggerFile" -ForegroundColor Green
Write-Host "===================================================="

$TriggerDir = Split-Path -Parent $TriggerFile
if (-not (Test-Path -LiteralPath $TriggerDir)) {
    New-Item -ItemType Directory -Path $TriggerDir -Force | Out-Null
}

if (Test-Path -LiteralPath $TriggerFile) {
    Remove-Item -LiteralPath $TriggerFile -Force
}

while ($true) {
    if (Test-Path -LiteralPath $TriggerFile) {
        try {
            $content = Get-Content -LiteralPath $TriggerFile -Raw
            $action = if ($content) { $content.Trim().ToLowerInvariant() } else { "" }

            $pwshPath = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
            if (-not $pwshPath) { $pwshPath = (Get-Command powershell.exe -ErrorAction SilentlyContinue).Source }
            if (-not $pwshPath) { $pwshPath = "pwsh.exe" }

            switch ($action) {
                "start" {
                    Write-Host "[$(Get-Date)] Trigger detected: start. Spawning missing sessions..." -ForegroundColor Green
                    & $pwshPath -NoProfile -ExecutionPolicy Bypass -File $RestartScript -Action Start -DirectLaunch
                }
                "restart" {
                    Write-Host "[$(Get-Date)] Trigger detected: restart. Performing clean restart..." -ForegroundColor Green
                    & $pwshPath -NoProfile -ExecutionPolicy Bypass -File $RestartScript -Action Restart -DirectLaunch
                }
                "kill" {
                    Write-Host "[$(Get-Date)] Trigger detected: kill. Terminating target sessions..." -ForegroundColor Yellow
                    & $pwshPath -NoProfile -ExecutionPolicy Bypass -File $RestartScript -Action Kill -DirectLaunch
                }
                default {
                    Write-Warning "[$(Get-Date)] Ignored unknown trigger payload: '$action'"
                }
            }
        } catch {
            Write-Warning "Error processing trigger: $($_.Exception.Message)"
        } finally {
            if (Test-Path -LiteralPath $TriggerFile) {
                Remove-Item -LiteralPath $TriggerFile -Force -ErrorAction SilentlyContinue
            }
        }
    }
    Start-Sleep -Seconds 1
}
