# Register Cross-Repo Indexer as a daily Windows scheduled task.
#
# Runs run-cross-repo-indexer.ps1 daily at 03:00 local time. Idempotent --
# safe to re-run; deletes existing task with same name before recreating.
#
# Why this exists: the cross-repo indexer crawls memory directories from
# Claude, Grok, and Antigravity into the Memory Bus. It ran ONCE on 2026-05-03
# (per project memory). Without a schedule, the substrate goes stale fast.
# Daily 03:00 keeps it fresh without competing with active work hours.

$ErrorActionPreference = 'Stop'

$TaskName    = 'StarlightCrossRepoIndexer'
$RepoRoot    = (Resolve-Path "$PSScriptRoot\..").Path
$LauncherPs1 = Join-Path $RepoRoot 'scripts\run-cross-repo-indexer.ps1'

if (-not (Test-Path $LauncherPs1)) {
    throw "Launcher not found at $LauncherPs1"
}

# Find pwsh.exe (PowerShell 7+). Falls back to powershell.exe if missing.
$pwshPath = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
if (-not $pwshPath) {
    $pwshPath = (Get-Command powershell -ErrorAction Stop).Source
    Write-Warning "pwsh not found, falling back to $pwshPath"
}

# Idempotency: remove existing task with same name
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task '$TaskName'" -ForegroundColor Yellow
}

$Action = New-ScheduledTaskAction `
    -Execute $pwshPath `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$LauncherPs1`""

$Trigger = New-ScheduledTaskTrigger -Daily -At 3am

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description 'Daily Cross-Repo Memory Indexer: crawls memory files across Claude, Grok, and Antigravity into Memory Bus. Built on SIP.' | Out-Null

Write-Host "[OK] Registered scheduled task '$TaskName'" -ForegroundColor Green
Write-Host "     Runs daily at 03:00 (local time)"
Write-Host "     Launcher: $LauncherPs1"
Write-Host ''
Write-Host "Verify:  Get-ScheduledTask -TaskName $TaskName"
Write-Host "Run now: Start-ScheduledTask -TaskName $TaskName"
