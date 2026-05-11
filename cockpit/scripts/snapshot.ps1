# cockpit/scripts/snapshot.ps1
#
# Walks current terminal state via the appropriate adapter and writes
# ~/.starlight/cockpit/last-snapshot.json per CONTRACTS.md section 2.

[CmdletBinding()]
param(
    [ValidateSet('auto', 'windows-terminal', 'zellij', 'both')] [string]$Terminal = 'auto',
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'manifest.ps1')

function Get-CockpitSnapshotPath {
    if ($OutputPath) { return $OutputPath }
    Initialize-CockpitHome
    return (Join-Path (Get-CockpitHome) 'last-snapshot.json')
}

function Resolve-CockpitTerminal {
    if ($Terminal -ne 'auto') { return $Terminal }
    $hasWt = $null -ne (Get-Process -Name 'WindowsTerminal' -ErrorAction SilentlyContinue)
    $hasZellij = $false
    try {
        $sessions = & zellij list-sessions 2>$null
        if ($LASTEXITCODE -eq 0 -and $sessions) { $hasZellij = $true }
    } catch {}
    if ($hasWt -and $hasZellij) { return 'both' }
    if ($hasWt) { return 'windows-terminal' }
    if ($hasZellij) { return 'zellij' }
    return 'windows-terminal'
}

function Merge-CockpitSnapshots {
    param([object]$Wt, [object]$Zj)
    $merged = [PSCustomObject]@{
        schema      = 'cockpit.snapshot/v1'
        snapshot_at = (Get-Date).ToUniversalTime().ToString('o')
        host        = $env:COMPUTERNAME
        user        = $env:USERNAME
        terminal    = 'both'
        windows     = @()
    }
    if ($Wt -and $Wt.windows) { $merged.windows += $Wt.windows }
    if ($Zj -and $Zj.windows) { $merged.windows += $Zj.windows }
    return $merged
}

$resolved = Resolve-CockpitTerminal

$snapshot = $null
switch ($resolved) {
    'windows-terminal' {
        . (Join-Path $PSScriptRoot '..\adapters\windows-terminal\capture.ps1')
        $snapshot = New-WindowsTerminalSnapshot
    }
    'zellij' {
        . (Join-Path $PSScriptRoot '..\adapters\zellij\capture.ps1')
        $snapshot = New-ZellijSnapshot
    }
    'both' {
        . (Join-Path $PSScriptRoot '..\adapters\windows-terminal\capture.ps1')
        . (Join-Path $PSScriptRoot '..\adapters\zellij\capture.ps1')
        $wt = New-WindowsTerminalSnapshot
        $zj = New-ZellijSnapshot
        $snapshot = Merge-CockpitSnapshots -Wt $wt -Zj $zj
    }
}

$path = Get-CockpitSnapshotPath

# Schema validation BEFORE write
if (-not (Test-CockpitSnapshotSchema -Doc $snapshot)) {
    Write-CockpitEvent -Kind 'snapshot.schema-invalid' -Status 'error' -Fields @{ terminal = $resolved }
    throw "Snapshot failed schema validation (cockpit.snapshot/v1). Refusing to write corrupt snapshot."
}

# Atomic write: temp + rename. Crash-safe.
Write-CockpitAtomicJson -Path $path -Object $snapshot

# Also archive in snapshots/ for `arc undo` history (keep last 10)
$snapshotsDir = Get-CockpitSnapshotsDir
$archive = Join-Path $snapshotsDir ("snapshot-$(Get-Date -Format 'yyyyMMdd-HHmmss').json")
Write-CockpitAtomicJson -Path $archive -Object $snapshot

$archives = @(Get-ChildItem -Path $snapshotsDir -Filter 'snapshot-*.json' | Sort-Object LastWriteTime -Descending)
if ($archives.Count -gt 10) {
    for ($i = 10; $i -lt $archives.Count; $i++) {
        Remove-Item -Path $archives[$i].FullName -Force -ErrorAction SilentlyContinue
    }
}

$paneCount = 0
foreach ($w in $snapshot.windows) {
    foreach ($t in $w.tabs) { $paneCount += $t.panes.Count }
}

Write-CockpitEvent -Kind 'snapshot.written' -Status 'ok' -Fields @{
    terminal = $resolved; windows = $snapshot.windows.Count; panes = $paneCount; path = $path
}

return [PSCustomObject]@{
    Path     = $path
    Terminal = $resolved
    Windows  = $snapshot.windows.Count
    Panes    = $paneCount
    At       = $snapshot.snapshot_at
    Archive  = $archive
}
