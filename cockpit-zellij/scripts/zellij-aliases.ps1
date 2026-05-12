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
        # No-arg form: start fresh session with the default layout. Use
        # --new-session-with-layout (-n) so we always create, never attach.
        $LegacyLayout = Join-Path $PSScriptRoot '..\layouts\starlight-orchestrator.kdl'
        if (Test-Path $LegacyLayout) {
            zellij -n $LegacyLayout
        } else {
            zellij -n starlight-orchestrator
        }
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

    # Per zellij --help: `--layout FILE --session NAME` means "attach to NAME
    # and add layout as new tab" → fails when NAME doesn't exist. Use
    # `--session NAME --new-session-with-layout FILE` to always create.
    # Caught 2026-05-12 — arc sis was throwing "Session 'sis' not found".
    zellij --session $Project --new-session-with-layout $LayoutFile
}

function arc-attach {
    param([string]$Project)

    if (-not $Project) {
        $sessions = zellij list-sessions 2>$null
        if ($sessions) { zellij attach } else { arc }
        return
    }

    $sessions = zellij list-sessions 2>$null
    $escaped = [regex]::Escape($Project)
    if ($sessions -match "^$escaped") {
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

function arc-revive {
    # Post-crash recovery helper.
    # No args     -> list resurrectable EXITED sessions
    # Session-name -> attach to it (revives layout + auto-resume commands)
    # -Latest     -> attach to most-recently-created resurrectable session
    param(
        [string]$Session,
        [switch]$Latest
    )

    $raw = zellij list-sessions 2>$null
    if (-not $raw) {
        Write-Host 'No zellij sessions found.' -ForegroundColor Yellow
        Write-Host 'Start fresh:  arc <project-key>  (e.g. arc sis)' -ForegroundColor Cyan
        return
    }

    # Parse lines: "name [Created N ago] (EXITED - attach to resurrect)" or "name [Created N ago]"
    $resurrectable = $raw | Select-String -Pattern 'EXITED' | ForEach-Object {
        # Strip ANSI codes then grab first whitespace-delimited token
        $clean = $_.Line -replace "`e\[[\d;]*[A-Za-z]", ''
        ($clean -split '\s+')[0]
    }

    if (-not $Session -and -not $Latest) {
        if (-not $resurrectable) {
            Write-Host 'No resurrectable sessions. All listed sessions are alive.' -ForegroundColor Green
            zellij list-sessions
            return
        }
        Write-Host 'Resurrectable sessions (attach to revive):' -ForegroundColor Cyan
        foreach ($s in $resurrectable) { Write-Host "  arc-revive $s" }
        Write-Host ''
        Write-Host 'Or: arc-revive -Latest   (most recent crashed session)' -ForegroundColor DarkCyan
        return
    }

    if ($Latest) {
        if (-not $resurrectable) {
            Write-Warning 'No resurrectable sessions found.'
            return
        }
        # list-sessions output ordering may not be by recency; trust first listed
        $Session = $resurrectable[0]
        Write-Host "Reviving most-recent: $Session" -ForegroundColor Green
    }

    if (-not ($resurrectable -contains $Session)) {
        # Maybe it's alive — still try to attach
        Write-Host "'$Session' not in resurrectable list. Attempting attach anyway..." -ForegroundColor Yellow
    }

    Write-Host "Attaching to '$Session' with -f (force re-run pane commands)." -ForegroundColor Cyan
    Write-Host 'Auto-resume on revive:' -ForegroundColor DarkCyan
    Write-Host '  Dispatcher = claude --resume <key>   (named conversation)'
    Write-Host '  Claude     = claude --continue        (last session in cwd)'
    Write-Host '  Codex      = codex resume --last      (last codex session)'
    Write-Host '  Gemini     = gemini --yolo            (ephemeral, no resume API)'
    Write-Host '  OpenCode   = opencode                 (ephemeral)'
    Write-Host ''
    # -f / --force-run-commands re-fires the layout's pane commands on
    # resurrection. Without it, resurrected panes are dead shells and the
    # auto-resume profile is wasted. Verified 2026-05-11 via zellij --help.
    zellij attach --force-run-commands $Session
}

Write-Host 'Starlight aliases loaded: arc, arc-attach, arc-kill, arc-list, arc-layout, arc-list-projects, arc-resume, arc-revive' -ForegroundColor Cyan
