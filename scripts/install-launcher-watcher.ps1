# C:\Users\frank\Starlight-Intelligence-System\scripts\install-launcher-watcher.ps1
#
# Registers the watch-launcher.ps1 script in the Windows Startup folder and runs it immediately.

$ErrorActionPreference = 'Stop'
$ScriptPath = "C:\Users\frank\Starlight-Intelligence-System\scripts\watch-launcher.ps1"
$StartupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$ShortcutPath = Join-Path $StartupFolder "StarlightLauncherWatcher.lnk"

Write-Host "===================================================="
Write-Host " Installing Starlight User-Session Watcher..." -ForegroundColor Green
Write-Host "===================================================="

# 1. Create Shortcut in Startup Folder
try {
    Write-Host "Creating startup shortcut at: $ShortcutPath"
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = "pwsh.exe"
    $Shortcut.Arguments = "-WindowStyle Hidden -File `"$ScriptPath`""
    $Shortcut.WorkingDirectory = "C:\Users\frank\Starlight-Intelligence-System"
    $Shortcut.Save()
    Write-Host "Shortcut created successfully." -ForegroundColor Green
} catch {
    Write-Error "Failed to create startup shortcut: $($_.Exception.Message)"
    exit 1
}

# 2. Kill any existing watcher processes first to avoid duplicates
Write-Host "Checking for existing launcher watcher processes..."
$watchers = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'pwsh.exe' -and $_.CommandLine -match 'watch-launcher.ps1' }
if ($watchers) {
    foreach ($w in $watchers) {
        Write-Host "Stopping existing watcher PID $($w.ProcessId)..." -ForegroundColor Yellow
        Stop-Process -Id $w.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

# 3. Launch the watcher right now (hidden window)
try {
    Write-Host "Starting launcher watcher now..."
    Start-Process pwsh.exe -ArgumentList "-WindowStyle Hidden", "-File `"$ScriptPath`"" -WorkingDirectory "C:\Users\frank\Starlight-Intelligence-System"
    Write-Host "Watcher started successfully in the background." -ForegroundColor Green
} catch {
    Write-Error "Failed to start watcher: $($_.Exception.Message)"
    exit 1
}

Write-Host "Installation complete! Watcher is active and will start automatically on logon." -ForegroundColor Green
