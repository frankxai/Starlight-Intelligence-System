# Starlight tool initializers -- source from $PROFILE alongside zellij-aliases.ps1.
#
# To install permanently:
#   notepad $PROFILE
#   add: . "$HOME\starlight\repos\Starlight-Intelligence-System\scripts\starlight-tools.ps1"
#   save, then: . $PROFILE
#
# Activates zoxide (smart cd), mise (tool version mgr), and sets sensible
# environment defaults for restic, bat, lazygit. Idempotent.

# --- console encoding: force UTF-8 so the banner + emoji-adjacent chars render
# correctly in legacy PowerShell 5.1 (which defaults to the system OEM code
# page and prints "Â·" instead of "·"). pwsh 7+ defaults to UTF-8 already
# but the assignment is safely idempotent. ---
try {
    if ([Console]::OutputEncoding.CodePage -ne 65001) {
        [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
        $OutputEncoding = [System.Text.UTF8Encoding]::new()
    }
} catch {
    # Older terminals may not allow encoding change — fall through silently.
}

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
    # ASCII separator (`|`) instead of middle-dot to render correctly even
    # when the console is misconfigured (some terminals decode UTF-8 multibyte
    # chars as their CP1252 component letters → "Â·" garbling).
    Write-Host 'Starlight tools loaded: zoxide(z) | mise | bat(cat) | lazygit(lg) | eza(ll/tree) | uv | restic' -ForegroundColor DarkCyan
}
