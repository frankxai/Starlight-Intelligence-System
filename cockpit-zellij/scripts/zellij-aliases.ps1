# Zellij PowerShell aliases — source from $PROFILE
#
# To install permanently:
#   1. Open: notepad $PROFILE
#      (creates the profile file if it doesn't exist)
#   2. Add this line:
#         . "$HOME\Starlight-Intelligence-System\cockpit-zellij\scripts\zellij-aliases.ps1"
#   3. Save, then in current session run:
#         . $PROFILE
#
# After that, `arc` from any directory opens the Starlight cockpit.
#
# PowerShell aliases can't carry arguments (Set-Alias only points at
# executables), so we use functions wrapped in `function arc {}`.

function arc {
    zellij --layout starlight-orchestrator @args
}

function arc-attach {
    # Attach to existing session if any, else create new
    $sessions = zellij list-sessions 2>$null
    if ($sessions) {
        zellij attach @args
    } else {
        zellij --layout starlight-orchestrator @args
    }
}

function arc-kill {
    # Kill all Zellij sessions cleanly
    zellij kill-all-sessions --yes
}

function arc-list {
    zellij list-sessions
}

# One-line dispatcher: open Zellij with a specific layout, fallback to default
function arc-layout {
    param([string]$Layout = "starlight-orchestrator")
    zellij --layout $Layout
}

Write-Host "Starlight aliases loaded: arc, arc-attach, arc-kill, arc-list, arc-layout" -ForegroundColor Cyan
