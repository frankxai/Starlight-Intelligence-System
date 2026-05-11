# cockpit/scripts/rehydrate.ps1
#
# Reads ~/.starlight/cockpit/last-snapshot.json and rebuilds the workspace.

[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$SnapshotPath,
    [switch]$DryRun,
    [ValidateSet('merge', 'skip', 'replace')] [string]$Mode = 'skip'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'manifest.ps1')

if (-not $SnapshotPath) {
    $SnapshotPath = Join-Path (Get-CockpitHome) 'last-snapshot.json'
}

if (-not (Test-Path $SnapshotPath)) {
    Write-Warning "No snapshot at $SnapshotPath. Run 'arc snapshot' first."
    return
}

$raw = Get-Content -Path $SnapshotPath -Raw -Encoding utf8
try {
    $snapshot = $raw | ConvertFrom-Json
} catch {
    Write-Error "Snapshot at $SnapshotPath is not valid JSON: $($_.Exception.Message)"
    return
}

if ($snapshot.schema -ne 'cockpit.snapshot/v1') {
    Write-Warning "Snapshot schema is '$($snapshot.schema)', expected 'cockpit.snapshot/v1'. Continuing anyway."
}

# Merge protection: refuse to overwrite a live cockpit if windows already exist.
if ($Mode -eq 'skip') {
    $live = Get-Process -Name 'WindowsTerminal' -ErrorAction SilentlyContinue
    if ($live) {
        Write-Warning "Windows Terminal is already running ($($live.Count) host process(es))."
        Write-Warning "Cockpit rehydrate would spawn additional tabs. Pass -Mode merge to proceed, or close WT first."
        return [PSCustomObject]@{ Spawned = 0; Skipped = $true; Reason = 'live-cockpit-detected' }
    }
}

$results = @()

switch ($snapshot.terminal) {
    'windows-terminal' {
        . (Join-Path $PSScriptRoot '..\adapters\windows-terminal\emit.ps1')
        $results += Invoke-WtRehydrate -Snapshot $snapshot -DryRun:$DryRun
    }
    'zellij' {
        . (Join-Path $PSScriptRoot '..\adapters\zellij\emit.ps1')
        $results += Invoke-ZellijRehydrate -Snapshot $snapshot -DryRun:$DryRun
    }
    'both' {
        . (Join-Path $PSScriptRoot '..\adapters\windows-terminal\emit.ps1')
        . (Join-Path $PSScriptRoot '..\adapters\zellij\emit.ps1')
        # Split snapshot by terminal subset
        $wtSnap = [PSCustomObject]@{
            schema = $snapshot.schema; snapshot_at = $snapshot.snapshot_at
            host = $snapshot.host; user = $snapshot.user
            terminal = 'windows-terminal'
            windows = ($snapshot.windows | Where-Object { $_.title -like 'Windows Terminal*' })
        }
        $zjSnap = [PSCustomObject]@{
            schema = $snapshot.schema; snapshot_at = $snapshot.snapshot_at
            host = $snapshot.host; user = $snapshot.user
            terminal = 'zellij'
            windows = ($snapshot.windows | Where-Object { $_.title -like 'Zellij*' })
        }
        $results += Invoke-WtRehydrate -Snapshot $wtSnap -DryRun:$DryRun
        $results += Invoke-ZellijRehydrate -Snapshot $zjSnap -DryRun:$DryRun
    }
    default {
        Write-Warning "Unknown terminal '$($snapshot.terminal)' in snapshot. Skipping."
    }
}

return $results
