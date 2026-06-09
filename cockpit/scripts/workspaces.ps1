# cockpit/scripts/workspaces.ps1 -- named cockpit profiles
#
# A workspace is a named, hand-curated cockpit topology. While `arc snapshot` records
# what's currently open, `arc save <name>` saves the current state under a name you
# control, and `arc load <name>` rebuilds it. Multiple workspaces let you switch
# between contexts ("morning", "deep-work", "research") without losing any.
#
# Workspace storage:
#   ~/.starlight/cockpit/workspaces/<name>.json
#
# Schema: cockpit.workspace/v1 (extends snapshot with metadata: name, created, description)

. (Join-Path $PSScriptRoot 'manifest.ps1')

function Get-CockpitWorkspacePath {
    param([Parameter(Mandatory)] [string]$Name)
    $safe = $Name -replace '[^a-zA-Z0-9\-_]', '-'
    Join-Path (Get-CockpitWorkspacesDir) "$safe.json"
}

function New-CockpitWorkspace {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] [string]$Name,
        [string]$Description,
        [object]$FromSnapshot
    )
    Initialize-CockpitHome

    if (-not $FromSnapshot) {
        # Capture fresh snapshot if not provided
        $snapResult = & (Join-Path $PSScriptRoot 'snapshot.ps1')
        if (-not $snapResult) {
            throw "Could not capture snapshot for workspace '$Name'"
        }
        $snapPath = Join-Path (Get-CockpitHome) 'last-snapshot.json'
        $FromSnapshot = Get-Content -Path $snapPath -Raw | ConvertFrom-Json
    }

    $workspace = [PSCustomObject]@{
        schema       = 'cockpit.workspace/v1'
        name         = $Name
        description  = if ($Description) { $Description } else { '' }
        created_at   = (Get-Date).ToUniversalTime().ToString('o')
        updated_at   = (Get-Date).ToUniversalTime().ToString('o')
        cockpit_version = (Get-CockpitVersion)
        host_when_saved = $env:COMPUTERNAME
        snapshot     = $FromSnapshot
    }

    $path = Get-CockpitWorkspacePath -Name $Name
    Write-CockpitAtomicJson -Path $path -Object $workspace
    Write-CockpitEvent -Kind 'workspace.saved' -Status 'ok' -Fields @{ name = $Name; path = $path }
    return [PSCustomObject]@{
        Name = $Name
        Path = $path
        PaneCount = (Measure-CockpitWorkspacePanes -Workspace $workspace)
    }
}

function Get-CockpitWorkspaces {
    Initialize-CockpitHome
    $dir = Get-CockpitWorkspacesDir
    if (-not (Test-Path $dir)) { return @() }
    $items = @()
    foreach ($f in (Get-ChildItem -Path $dir -Filter '*.json')) {
        try {
            $ws = Get-Content -Path $f.FullName -Raw | ConvertFrom-Json
            if ($ws.schema -ne 'cockpit.workspace/v1') { continue }
            $items += [PSCustomObject]@{
                Name        = $ws.name
                Description = $ws.description
                Created     = $ws.created_at
                Updated     = $ws.updated_at
                PaneCount   = (Measure-CockpitWorkspacePanes -Workspace $ws)
                Path        = $f.FullName
            }
        } catch {
            Write-CockpitHookError -Source 'Get-CockpitWorkspaces' -Message "Could not parse $($f.Name): $($_.Exception.Message)"
        }
    }
    return $items | Sort-Object Updated -Descending
}

function Measure-CockpitWorkspacePanes {
    param([Parameter(Mandatory)] [object]$Workspace)
    $count = 0
    foreach ($w in $Workspace.snapshot.windows) {
        foreach ($t in $w.tabs) {
            $count += $t.panes.Count
        }
    }
    return $count
}

function Get-CockpitWorkspace {
    [CmdletBinding()]
    param([Parameter(Mandatory)] [string]$Name)
    $path = Get-CockpitWorkspacePath -Name $Name
    if (-not (Test-Path $path)) {
        throw "Workspace '$Name' not found at $path"
    }
    return (Get-Content -Path $path -Raw | ConvertFrom-Json)
}

function Remove-CockpitWorkspace {
    [CmdletBinding()]
    param([Parameter(Mandatory)] [string]$Name)
    $path = Get-CockpitWorkspacePath -Name $Name
    if (-not (Test-Path $path)) { return $false }
    Remove-Item -Path $path -Force
    Write-CockpitEvent -Kind 'workspace.deleted' -Status 'ok' -Fields @{ name = $Name }
    return $true
}

function Invoke-CockpitWorkspaceLoad {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)] [string]$Name,
        [switch]$DryRun,
        [ValidateSet('merge', 'skip', 'replace')] [string]$Mode = 'merge'
    )
    $ws = Get-CockpitWorkspace -Name $Name

    # Use the rehydrate script with the workspace snapshot
    $tmpSnapPath = Join-Path ([System.IO.Path]::GetTempPath()) "cockpit-load-$([guid]::NewGuid()).json"
    Write-CockpitAtomicJson -Path $tmpSnapPath -Object $ws.snapshot

    try {
        $result = & (Join-Path $PSScriptRoot 'rehydrate.ps1') -SnapshotPath $tmpSnapPath -Mode $Mode -DryRun:$DryRun
        Write-CockpitEvent -Kind 'workspace.loaded' -Status 'ok' -Fields @{ name = $Name; mode = $Mode; dry_run = [bool]$DryRun }
        return $result
    } finally {
        Remove-Item -Path $tmpSnapPath -Force -ErrorAction SilentlyContinue
    }
}
