# Starlight tool initializers -- source from $PROFILE alongside zellij-aliases.ps1.
#
# To install permanently:
#   notepad $PROFILE
#   add: . "$HOME\Starlight-Intelligence-System\scripts\starlight-tools.ps1"
#   save, then: . $PROFILE
#
# Activates zoxide (smart cd), mise (tool version mgr), and sets sensible
# environment defaults for restic, bat, lazygit. Idempotent.

# --- zoxide: smart cd that learns frecency ---
# Replaces `cd` with `z`. Type `z sis` from anywhere to jump to SIS.
if (Get-Command zoxide -ErrorAction SilentlyContinue) {
    Invoke-Expression (& { (zoxide init powershell | Out-String) })
}

# --- mise: per-repo tool version mgmt ---
# Drop .mise.toml in any repo to pin Node/Python/etc. versions.
if (Get-Command mise -ErrorAction SilentlyContinue) {
    Invoke-Expression (& { (mise activate pwsh | Out-String) })
}

# --- restic: substrate backup env defaults ---
# Daily cron picks these up via run-restic-backup.ps1.
# Swap STARLIGHT_RESTIC_REPO to 'b2:<bucket>:/path' + set B2_ACCOUNT_ID/KEY
# to move backups off-machine.
if (-not $env:STARLIGHT_RESTIC_REPO) {
    $env:STARLIGHT_RESTIC_REPO = Join-Path $HOME '.starlight\restic-repo'
}
if (-not $env:STARLIGHT_RESTIC_PASSWORD_FILE) {
    $env:STARLIGHT_RESTIC_PASSWORD_FILE = Join-Path $HOME '.starlight\restic-password.txt'
}

# --- bat: use as colorized cat + git diff pager ---
if (Get-Command bat -ErrorAction SilentlyContinue) {
    Set-Alias -Name cat -Value bat -Scope Global -Force -ErrorAction SilentlyContinue
    $env:BAT_THEME = 'Dracula'
    $env:PAGER = 'bat --plain'
}

# --- lazygit + eza convenience aliases ---
if (Get-Command lazygit -ErrorAction SilentlyContinue) {
    Set-Alias -Name lg -Value lazygit -Scope Global -Force -ErrorAction SilentlyContinue
}
if (Get-Command eza -ErrorAction SilentlyContinue) {
    function ls-git { eza --icons=auto --git --group-directories-first @args }
    function tree    { eza --tree --icons=auto --git-ignore @args }
    Set-Alias -Name ll -Value ls-git -Scope Global -Force -ErrorAction SilentlyContinue
}

# --- uv: fast Python package manager ---
# No init needed; uv works standalone. Just announce it's available.

if ($env:FRANK_QUIET_PROFILE -ne '1') {
    Write-Host 'Starlight tools loaded: zoxide(z) · mise · bat(cat) · lazygit(lg) · eza(ll/tree) · uv · restic' -ForegroundColor DarkCyan
}
