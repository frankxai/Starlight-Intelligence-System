# Registers watch-launcher.ps1 in the Windows Startup folder and starts it immediately.

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RepoRoot  = (Resolve-Path "$ScriptDir\..").Path
$ScriptPath = Join-Path $ScriptDir "watch-launcher.ps1"
$StartupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$ShortcutPath = Join-Path $StartupFolder "StarlightLauncherWatcher.lnk"

$pwshBin = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
if (-not $pwshBin) { $pwshBin = "pwsh.exe" }

Write-Host "===================================================="
Write-Host " Installing Starlight User-Session Watcher..." -ForegroundColor Green
Write-Host "===================================================="

try {
    Write-Host "Creating startup shortcut at: $ShortcutPath"
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $pwshBin
    $Shortcut.Arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""
    $Shortcut.WorkingDirectory = $RepoRoot
    $Shortcut.Save()
    Write-Host "Shortcut created successfully." -ForegroundColor Green
} catch {
    Write-Error "Failed to create startup shortcut: $($_.Exception.Message)"
    exit 1
}

Write-Host "Checking for existing launcher watcher processes..."
$watchers = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -in @('pwsh.exe', 'powershell.exe') -and $_.CommandLine -match 'watch-launcher\.ps1'
}
if ($watchers) {
    foreach ($w in $watchers) {
        Write-Host "Stopping existing watcher PID $($w.ProcessId)..." -ForegroundColor Yellow
        Stop-Process -Id $w.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

try {
    Write-Host "Starting launcher watcher now..."
    Start-Process -FilePath $pwshBin -ArgumentList "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`"" -WorkingDirectory $RepoRoot
    Write-Host "Watcher started successfully in the background." -ForegroundColor Green
} catch {
    Write-Error "Failed to start watcher: $($_.Exception.Message)"
    exit 1
}

Write-Host "Installation complete! Watcher is active and will start automatically on logon." -ForegroundColor Green
