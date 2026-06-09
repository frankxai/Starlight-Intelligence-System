# cockpit/scripts/tui.ps1 -- live status dashboard
#
# Pure ANSI implementation. No external dependencies (no Spectre.Console, no Terminal.Gui).
# Refreshes every 2s. Press 'q' to quit, 'r' to force refresh, 's' to take snapshot,
# 'h' to toggle help.

[CmdletBinding()]
param(
    [int]$RefreshSeconds = 2
)

. (Join-Path $PSScriptRoot 'manifest.ps1')

# ANSI color helpers
$esc = [char]27
$reset    = "$esc[0m"
$bold     = "$esc[1m"
$dim      = "$esc[2m"
$cyan     = "$esc[36m"
$green    = "$esc[32m"
$yellow   = "$esc[33m"
$red      = "$esc[31m"
$magenta  = "$esc[35m"
$blue     = "$esc[34m"
$gray     = "$esc[90m"
$bgBlue   = "$esc[44m"
$white    = "$esc[97m"

function Move-Cursor { param([int]$Row, [int]$Col) Write-Host -NoNewline "$esc[${Row};${Col}H" }
function Clear-Screen { Write-Host -NoNewline "$esc[2J$esc[H" }
function Hide-Cursor { Write-Host -NoNewline "$esc[?25l" }
function Show-Cursor { Write-Host -NoNewline "$esc[?25h" }

function Format-Age {
    param([DateTime]$When)
    $diff = (Get-Date).ToUniversalTime() - $When.ToUniversalTime()
    if ($diff.TotalMinutes -lt 1)  { return "{0}s" -f [int]$diff.TotalSeconds }
    if ($diff.TotalHours   -lt 1)  { return "{0}m" -f [int]$diff.TotalMinutes }
    if ($diff.TotalDays    -lt 1)  { return "{0}h" -f [int]$diff.TotalHours }
    return "{0}d" -f [int]$diff.TotalDays
}

function Get-CockpitSnapshotInfo {
    $path = Join-Path (Get-CockpitHome) 'last-snapshot.json'
    if (-not (Test-Path $path)) { return $null }
    $info = Get-Item $path
    try {
        $snap = Get-Content -Path $path -Raw | ConvertFrom-Json
        $paneCount = 0
        foreach ($w in $snap.windows) { foreach ($t in $w.tabs) { $paneCount += $t.panes.Count } }
        return [PSCustomObject]@{
            Path     = $path
            Modified = $info.LastWriteTime
            Panes    = $paneCount
            Windows  = $snap.windows.Count
            Terminal = $snap.terminal
        }
    } catch { return $null }
}

function Get-RecentEvents {
    param([int]$Tail = 8)
    $logPath = Get-CockpitEventLogPath
    if (-not (Test-Path $logPath)) { return @() }
    $rows = @()
    foreach ($line in (Get-Content -Path $logPath -Tail $Tail)) {
        try { $rows += ($line | ConvertFrom-Json) } catch {}
    }
    return $rows
}

function Render-Header {
    param([int]$Width)
    $title = " Cockpit Continuity v$(Get-CockpitVersion) "
    $padding = [Math]::Max(0, $Width - $title.Length)
    Write-Host "${bgBlue}${white}${bold}${title}${gray}$(' ' * $padding)${reset}"
}

function Render-StatusBar {
    param([int]$Width)
    $now = Get-Date -Format 'HH:mm:ss'
    $home = Get-CockpitHome
    $hint = "[q] quit  [r] refresh  [s] snapshot  [h] help"
    $left = " $now  $home"
    $padding = [Math]::Max(0, $Width - $left.Length - $hint.Length - 1)
    Write-Host "${gray}${left}$(' ' * $padding)${hint}${reset}"
}

function Render-Sessions {
    param([int]$Width)
    Write-Host ""
    Write-Host "${bold}${cyan}ALIVE SESSIONS${reset}"
    Write-Host "${gray}$('-' * ($Width - 1))${reset}"

    $alive = Get-CockpitAliveSessions
    if (-not $alive -or $alive.Count -eq 0) {
        Write-Host "${dim}  (no alive sessions in manifest)${reset}"
        return
    }

    $now = (Get-Date).ToUniversalTime()
    $headFmt = "  {0,-9} {1,-20} {2,-6} {3,-7} {4,-12} {5}"
    Write-Host ($headFmt -f 'AGENT', 'PROJECT', 'AGE', 'PID', 'SESSION', 'CWD') -ForegroundColor DarkGray

    $rowFmt = "  {0,-9} {1,-20} {2,-6} {3,-7} {4,-12} {5}"
    foreach ($s in ($alive | Sort-Object agent, project_key)) {
        $age = '?'
        try {
            $start = [DateTime]::Parse($s.ts).ToUniversalTime()
            $age = Format-Age -When $start
        } catch {}
        $sid = if ($s.session_id) { $s.session_id.Substring(0, [Math]::Min(11, $s.session_id.Length)) } else { '?' }
        $cwd = $s.cwd
        if ($cwd.Length -gt ($Width - 60)) {
            $cwd = '...' + $cwd.Substring($cwd.Length - ($Width - 63))
        }
        $color = switch ($s.agent) {
            'claude' { $green }
            'gemini' { $blue }
            'codex'  { $magenta }
            default  { $reset }
        }
        Write-Host -NoNewline $color
        Write-Host ($rowFmt -f $s.agent, $s.project_key, $age, $s.pid, $sid, $cwd)
        Write-Host -NoNewline $reset
    }
}

function Render-Snapshot {
    param([int]$Width)
    Write-Host ""
    Write-Host "${bold}${cyan}LAST SNAPSHOT${reset}"
    Write-Host "${gray}$('-' * ($Width - 1))${reset}"
    $info = Get-CockpitSnapshotInfo
    if (-not $info) {
        Write-Host "${dim}  (no snapshot yet -- press [s] to take one)${reset}"
        return
    }
    $age = Format-Age -When $info.Modified
    $color = if (((Get-Date) - $info.Modified).TotalMinutes -gt 10) { $yellow } else { $green }
    Write-Host ("  ${color}captured: $age ago${reset}  ${dim}terminal=$($info.Terminal) windows=$($info.Windows) panes=$($info.Panes)${reset}")
}

function Render-Workspaces {
    param([int]$Width)
    Write-Host ""
    Write-Host "${bold}${cyan}SAVED WORKSPACES${reset}"
    Write-Host "${gray}$('-' * ($Width - 1))${reset}"
    try {
        . (Join-Path $PSScriptRoot 'workspaces.ps1')
        $items = Get-CockpitWorkspaces
        if (-not $items -or $items.Count -eq 0) {
            Write-Host "${dim}  (none -- use 'arc save <name>' to create)${reset}"
            return
        }
        foreach ($w in ($items | Select-Object -First 5)) {
            $age = '?'
            try { $age = Format-Age -When ([DateTime]::Parse($w.Updated)) } catch {}
            Write-Host ("  ${magenta}$($w.Name)${reset}  ${dim}panes=$($w.PaneCount) updated=$age${reset}")
        }
        if ($items.Count -gt 5) {
            Write-Host "  ${dim}  ... and $($items.Count - 5) more (run 'arc workspaces')${reset}"
        }
    } catch {
        Write-Host "${dim}  (error: $($_.Exception.Message))${reset}"
    }
}

function Render-Events {
    param([int]$Width)
    Write-Host ""
    Write-Host "${bold}${cyan}RECENT EVENTS${reset}"
    Write-Host "${gray}$('-' * ($Width - 1))${reset}"
    $events = Get-RecentEvents -Tail 6
    if (-not $events -or $events.Count -eq 0) {
        Write-Host "${dim}  (no events logged yet)${reset}"
        return
    }
    foreach ($e in $events) {
        $color = switch ($e.status) {
            'error' { $red }
            'warn'  { $yellow }
            default { $gray }
        }
        $time = '?'
        try { $time = ([DateTime]::Parse($e.ts)).ToString('HH:mm:ss') } catch {}
        $extras = ($e.PSObject.Properties |
            Where-Object { $_.Name -notin @('ts','kind','status','host','user','cockpit_version') } |
            ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ' '
        Write-Host ("  ${dim}${time}${reset}  ${color}$($e.kind)${reset}  ${dim}${extras}${reset}")
    }
}

function Render-Help {
    param([int]$Width)
    Write-Host ""
    Write-Host "${bold}${cyan}HELP${reset}"
    Write-Host "${gray}$('-' * ($Width - 1))${reset}"
    Write-Host "  ${green}q${reset}  quit"
    Write-Host "  ${green}r${reset}  refresh now"
    Write-Host "  ${green}s${reset}  take snapshot"
    Write-Host "  ${green}h${reset}  toggle help"
    Write-Host ""
    Write-Host "  Refresh interval: ${magenta}${script:RefreshSec}s${reset}"
    Write-Host "  Cockpit home:     ${magenta}$(Get-CockpitHome)${reset}"
}

function Render-Frame {
    param([int]$Width, [bool]$ShowHelp)
    Clear-Screen
    Render-Header -Width $Width
    Render-Sessions -Width $Width
    Render-Snapshot -Width $Width
    Render-Workspaces -Width $Width
    Render-Events -Width $Width
    if ($ShowHelp) { Render-Help -Width $Width }
    # Status bar at bottom
    $bottomRow = $Host.UI.RawUI.WindowSize.Height
    Move-Cursor -Row $bottomRow -Col 1
    Render-StatusBar -Width $Width
}

# Main loop
$script:RefreshSec = $RefreshSeconds
$showHelp = $false

try {
    Hide-Cursor
    [Console]::TreatControlCAsInput = $true

    while ($true) {
        $width = $Host.UI.RawUI.WindowSize.Width
        if (-not $width -or $width -lt 60) { $width = 80 }

        Render-Frame -Width $width -ShowHelp $showHelp

        # Wait for keypress with timeout = RefreshSeconds
        $deadline = (Get-Date).AddSeconds($script:RefreshSec)
        $key = $null
        while ((Get-Date) -lt $deadline) {
            if ([Console]::KeyAvailable) {
                $key = [Console]::ReadKey($true)
                break
            }
            Start-Sleep -Milliseconds 50
        }

        if ($key) {
            switch ($key.Key) {
                'Q' { return }
                'Escape' { return }
                'R' { continue }
                'H' { $showHelp = -not $showHelp }
                'S' {
                    & (Join-Path $PSScriptRoot 'snapshot.ps1') | Out-Null
                }
            }
            if ($key.Modifiers -eq 'Control' -and $key.Key -eq 'C') { return }
        }
    }
} finally {
    Show-Cursor
    [Console]::TreatControlCAsInput = $false
    Clear-Screen
    Write-Host "Cockpit TUI exited."
}
