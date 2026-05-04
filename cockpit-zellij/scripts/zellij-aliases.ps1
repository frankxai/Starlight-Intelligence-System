# Zellij PowerShell aliases -- source from $PROFILE
#
# To install permanently:
#   notepad $PROFILE
#   add: . "$HOME\Starlight-Intelligence-System\cockpit-zellij\scripts\zellij-aliases.ps1"
#   save, then: . $PROFILE
#
# Then in any terminal:  arc <project>  -- e.g. arc sis, arc arcanea, arc frankx
# Inside Dispatcher pane: claude --resume <project>  -- persistent named conversation

. (Join-Path $PSScriptRoot '..\lib\projects.ps1')

function arc {
    param([string]$Project)

    if (-not $Project) {
        zellij --layout starlight-orchestrator
        return
    }

    $LayoutsDir = Join-Path $PSScriptRoot '..\layouts'
    $LayoutFile = Join-Path $LayoutsDir "$Project.kdl"

    if (-not (Test-Path $LayoutFile)) {
        Write-Warning "Layout '$Project.kdl' not found at $LayoutsDir."
        Write-Warning "Run: arc-list-projects"
        Write-Warning "Or generate: pwsh cockpit-zellij/scripts/generate-layouts.ps1 -Only $Project"
        return
    }

    zellij --layout $LayoutFile --session $Project
}

function arc-attach {
    param([string]$Project)

    if (-not $Project) {
        $sessions = zellij list-sessions 2>$null
        if ($sessions) { zellij attach } else { arc }
        return
    }

    $sessions = zellij list-sessions 2>$null
    if ($sessions -match "^$Project") {
        zellij attach $Project
    } else {
        arc $Project
    }
}

function arc-kill {
    zellij kill-all-sessions --yes
}

function arc-list {
    zellij list-sessions
}

function arc-layout {
    param([string]$Layout = 'starlight-orchestrator')
    zellij --layout $Layout
}

function arc-list-projects {
    $LayoutsDir = Join-Path $PSScriptRoot '..\layouts'
    Get-ChildItem $LayoutsDir -Filter '*.kdl' -File |
        Where-Object { $_.Name -notmatch '^_' } |
        Sort-Object Name |
        ForEach-Object {
            [PSCustomObject]@{
                Key      = $_.BaseName
                LayoutKB = [math]::Round($_.Length / 1KB, 1)
                Cmd      = "arc $($_.BaseName)"
            }
        } | Format-Table -AutoSize
}

function arc-resume {
    param([string]$Project)
    if (-not $Project) {
        Write-Warning 'Usage: arc-resume <project-key>'
        return
    }
    arc-attach $Project
}

Write-Host 'Starlight aliases loaded: arc, arc-attach, arc-kill, arc-list, arc-layout, arc-list-projects, arc-resume' -ForegroundColor Cyan
