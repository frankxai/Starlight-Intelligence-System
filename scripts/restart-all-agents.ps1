# C:\Users\frank\Starlight-Intelligence-System\scripts\restart-all-agents.ps1
#
# Starlight Agent Lifecycle & Session Manager
# Role: MachineOps / Session Restart Automation
#
# Usage:
#   pwsh -File .\scripts\restart-all-agents.ps1 -Action Status
#   pwsh -File .\scripts\restart-all-agents.ps1 -Action Start
#   pwsh -File .\scripts\restart-all-agents.ps1 -Action Restart
#   pwsh -File .\scripts\restart-all-agents.ps1 -Action Kill
#
# Syncs via SIS repository to both laptops. Hostname-aware.

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Status", "Start", "Restart", "Kill")]
    [string]$Action = "Status"
)

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RepoRoot  = (Resolve-Path "$ScriptDir\..").Path
$ConfigFile = Join-Path $RepoRoot "memory\agent-sessions.json"
$StatusJsFile = Join-Path $RepoRoot "cockpit\agent-status-data.js"
$TriggerFile = Join-Path $RepoRoot "private\launcher-trigger.txt"
$Hostname  = $env:COMPUTERNAME

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Starlight Agent Session Manager (v1.0)" -ForegroundColor Cyan
Write-Host " Hostname: $Hostname | Action: $Action" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Load configuration
if (-not (Test-Path $ConfigFile)) {
    Write-Error "Config file not found at $ConfigFile"
    exit 1
}

$config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
$machineConfig = $null

if ($config.machines.PSObject.Properties[$Hostname]) {
    $machineConfig = $config.machines.$Hostname
    Write-Host "Matched host: $Hostname ($($machineConfig.role))" -ForegroundColor Green
} else {
    $machineConfig = $config.machines.DEFAULT_SECONDARY
    Write-Host "No explicit host config for '$Hostname'. Using DEFAULT_SECONDARY settings." -ForegroundColor Yellow
}

# 2. Process query helper
function Get-ActiveProcesses {
    # Fetch relevant processes once for performance
    $procs = Get-CimInstance Win32_Process -Filter "Name='node.exe' or Name='claude.exe' or Name='codex.exe' or Name='agy.exe' or Name='pwsh.exe'" -ErrorAction SilentlyContinue
    
    $list = @()
    foreach ($p in $procs) {
        $list += [pscustomobject]@{
            Id = $p.ProcessId
            Name = $p.Name
            CommandLine = $p.CommandLine
            WorkingDirectory = $p.WorkingDirectory
            ParentId = $p.ParentProcessId
        }
    }
    return $list
}

$activeProcs = Get-ActiveProcesses

# 3. Status inspection logic
$statusList = @()
foreach ($repo in $machineConfig.auto_start_repos) {
    $path = $repo.path
    $agent = $repo.agent
    
    $runningPid = $null
    $isRunning = $false
    $details = "Not running"

    # Search for running pwsh shell matching the command
    $pwshShell = $activeProcs | Where-Object { $_.Name -eq 'pwsh.exe' -and $_.CommandLine -match ('-Command\s+["'']?' + [regex]::Escape($repo.command) + '["'']?(\b|$)') } | Select-Object -First 1

    if ($pwshShell) {
        $children = $activeProcs | Where-Object { $_.ParentId -eq $pwshShell.Id }
        $agentChild = $null
        
        foreach ($c in $children) {
            $match = $false
            if ($agent -eq 'claude' -and ($c.Name -eq 'claude.exe' -or ($c.Name -eq 'node.exe' -and $c.CommandLine -match 'claude'))) { $match = $true }
            elseif ($agent -eq 'antigravity' -and ($c.Name -eq 'agy.exe' -or ($c.Name -eq 'node.exe' -and $c.CommandLine -match 'agy'))) { $match = $true }
            elseif ($agent -eq 'codex' -and ($c.Name -eq 'codex.exe' -or ($c.Name -eq 'node.exe' -and $c.CommandLine -match 'codex'))) { $match = $true }
            
            if ($match) {
                $agentChild = $c
                break
            }
        }

        if ($agentChild) {
            $runningPid = $agentChild.Id
            $isRunning = $true
            $details = "Agent active (PID $($agentChild.Id)) inside pwsh shell (PID $($pwshShell.Id))"
        } else {
            $runningPid = $pwshShell.Id
            $isRunning = $true
            $details = "PowerShell shell open (PID $($pwshShell.Id)); agent starting or idle"
        }
    }

    $statusList += [ordered]@{
        name = $repo.name
        path = $repo.path
        agent = $repo.agent
        command = $repo.command
        role = $repo.role
        running = $isRunning
        pid = $runningPid
        details = $details
    }
}

# 4. Action Execution
if ($Action -eq "Kill" -or $Action -eq "Restart") {
    Write-Host "Killing existing target agent processes..." -ForegroundColor Yellow
    foreach ($item in $statusList) {
        if ($item.running) {
            # Find the pwsh shell running this command
            $shell = $activeProcs | Where-Object { $_.Name -eq 'pwsh.exe' -and $_.CommandLine -match ('-Command\s+["'']?' + [regex]::Escape($item.command) + '["'']?(\b|$)') } | Select-Object -First 1
            if ($shell) {
                try {
                    Write-Host "  Closing shell PID $($shell.Id) for $($item.name) (closes tab)..." -ForegroundColor DarkYellow
                    Stop-Process -Id $shell.Id -Force -ErrorAction Stop
                } catch {
                    Write-Warning "  Failed to stop shell $($shell.Id): $($_.Exception.Message)"
                }
            } elseif ($item.pid) {
                try {
                    Write-Host "  Stopping PID $($item.pid) for $($item.name)..." -ForegroundColor DarkYellow
                    Stop-Process -Id $item.pid -Force -ErrorAction Stop
                } catch {
                    Write-Warning "  Failed to stop process $($item.pid): $($_.Exception.Message)"
                }
            }
            $item.running = $false
            $item.pid = $null
            $item.details = "Terminated during clean restart"
        }
    }
}

$reposToStart = @()
if ($Action -eq "Start" -or $Action -eq "Restart") {
    foreach ($item in $statusList) {
        if (-not $item.running) {
            $reposToStart += $item
        } else {
            Write-Host "Agent for $($item.name) is already running (PID $($item.pid)). Skipping start." -ForegroundColor Gray
        }
    }

    if ($reposToStart.Count -gt 0) {
        # Check if running in a headless background session and the watcher is running
        $isHeadless = -not [Environment]::UserInteractive -or ([System.Diagnostics.Process]::GetCurrentProcess().MainWindowHandle -eq 0 -and $env:SESSIONNAME -notmatch 'Console|RDP-Tcp')
        $watcher = Get-CimInstance Win32_Process -Filter "Name='pwsh.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match 'watch-launcher.ps1' } | Select-Object -First 1
        
        if ($isHeadless -and $watcher) {
            Write-Host "Headless session and user-session watcher (PID $($watcher.ProcessId)) detected. Redirecting trigger..." -ForegroundColor Green
            $TriggerDir = Split-Path -Parent $TriggerFile
            if (-not (Test-Path $TriggerDir)) {
                New-Item -ItemType Directory -Path $TriggerDir -Force | Out-Null
            }
            "start" | Set-Content -Path $TriggerFile -Encoding utf8
            Write-Host "Trigger written successfully. The user-session launcher will spawn visible terminal windows." -ForegroundColor Green
            return
        }

        Write-Host "Starting $($reposToStart.Count) agent(s) in new console windows..." -ForegroundColor Green
        
        foreach ($repo in $reposToStart) {
            Write-Host "  Launching $($repo.name) via $($repo.command) in CWD: $($repo.path)..." -ForegroundColor DarkCyan
            Start-Process pwsh.exe -WorkingDirectory $repo.path -ArgumentList "-NoExit", "-Command", $repo.command
        }
        
        # Wait a moment and recheck processes to get new PIDs
        Start-Sleep -Seconds 6
        $activeProcs = Get-ActiveProcesses
        foreach ($item in $statusList) {
            if (-not $item.running) {
                $pwshShell = $activeProcs | Where-Object { $_.Name -eq 'pwsh.exe' -and $_.CommandLine -match ('-Command\s+["'']?' + [regex]::Escape($item.command) + '["'']?(\b|$)') } | Select-Object -First 1
                if ($pwshShell) {
                    $children = $activeProcs | Where-Object { $_.ParentId -eq $pwshShell.Id }
                    $agentChild = $null
                    foreach ($c in $children) {
                        $match = $false
                        if ($item.agent -eq 'claude' -and ($c.Name -eq 'claude.exe' -or ($c.Name -eq 'node.exe' -and $c.CommandLine -match 'claude'))) { $match = $true }
                        elseif ($item.agent -eq 'antigravity' -and ($c.Name -eq 'agy.exe' -or ($c.Name -eq 'node.exe' -and $c.CommandLine -match 'agy'))) { $match = $true }
                        elseif ($item.agent -eq 'codex' -and ($c.Name -eq 'codex.exe' -or ($c.Name -eq 'node.exe' -and $c.CommandLine -match 'codex'))) { $match = $true }
                        
                        if ($match) {
                            $agentChild = $c
                            break
                        }
                    }

                    if ($agentChild) {
                        $item.pid = $agentChild.Id
                        $item.running = $true
                        $item.details = "Spawned successfully (PID $($agentChild.Id))"
                    } else {
                        $item.pid = $pwshShell.Id
                        $item.running = $true
                        $item.details = "Spawned shell (PID $($pwshShell.Id)); agent initializing"
                    }
                }
            }
        }
    } else {
        Write-Host "All configured agents are already running." -ForegroundColor Green
    }
}

# 5. Save persistent status JS (CORS-proof global var)
$statusData = [ordered]@{
    last_updated = (Get-Date).ToUniversalTime().ToString('o')
    hostname = $Hostname
    machine_role = $machineConfig.role
    machine_description = $machineConfig.description
    agents = $statusList
}

$jsonStr = $statusData | ConvertTo-Json -Depth 6
$jsContent = "window.STARLIGHT_AGENT_STATUS = $jsonStr;"
$jsContent | Set-Content -Path $StatusJsFile -Encoding utf8

# Ensure cockpit directory exists (create if missing)
$cockpitDir = Split-Path -Parent $StatusJsFile
if (-not (Test-Path $cockpitDir)) {
    New-Item -ItemType Directory -Path $cockpitDir -Force | Out-Null
}

Write-Host "Updated browser status file: $StatusJsFile" -ForegroundColor Green

# 6. Render command line summary
Write-Host ""
Write-Host "Agent Session Summary:" -ForegroundColor Cyan
Write-Host "----------------------------------------------------"
foreach ($item in $statusList) {
    $statusSymbol = if ($item.running) { "[RUNNING]" } else { "[STOPPED]" }
    $statusColor = if ($item.running) { "Green" } else { "Red" }
    Write-Host "$($item.name,-30) $statusSymbol" -ForegroundColor $statusColor -NoNewline
    if ($item.running) {
        Write-Host " (PID $($item.pid)) | Command: $($item.command)" -ForegroundColor Gray
    } else {
        Write-Host " | Command: $($item.command)" -ForegroundColor Gray
    }
}
Write-Host "----------------------------------------------------"
Write-Host "Done."
