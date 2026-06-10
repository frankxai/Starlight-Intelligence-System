# Antigravity CLI wrappers — engineer-grid parity with cla/ga/cda/oaa/cura.
# Pattern mirrors Microsoft.PowerShell_profile.ps1 (Documents primary).
# Sourced from OneDrive\Dokumente\PowerShell\Microsoft.PowerShell_profile.ps1.

function Invoke-Agy {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RepoName,
        [Parameter(Mandatory=$true)][string]$RepoPath,
        [string]$Color = "Cyan",
        [Parameter(ValueFromRemainingArguments)][string[]]$Rest
    )

    Write-Host ""
    Write-Host "   [ENGINEER] Launching Antigravity in $RepoName..." -ForegroundColor $Color
    Write-Host "   Focus: Gemini-3 agentic IDE / async exec / browser control" -ForegroundColor DarkGray
    Write-Host "   Path: $RepoPath" -ForegroundColor DarkGray
    Write-Host ""

    if (-not (Test-Path -LiteralPath $RepoPath)) {
        Write-Host "   [ERROR] Path not found: $RepoPath" -ForegroundColor Red
        return
    }
    if (-not (Get-Command agy -ErrorAction SilentlyContinue)) {
        Write-Host "   [ERROR] agy not on PATH. Install Antigravity CLI then re-source profile." -ForegroundColor Red
        return
    }

    Set-Location -LiteralPath $RepoPath
    agy --dangerously-skip-permissions @Rest
}

# Repo wrappers — mirror cla/ga/cda/oaa/cura naming convention.
# Add new entries as new repos enter the engineer grid.
function agya   { Invoke-Agy -RepoName "Arcanea"      -RepoPath "$HOME\Arcanea"                       -Color Cyan    @args }
function agysis { Invoke-Agy -RepoName "SIS"          -RepoPath "$HOME\Starlight-Intelligence-System" -Color Cyan    @args }
function agyfx  { Invoke-Agy -RepoName "FrankX"       -RepoPath "$HOME\FrankX"                        -Color Magenta @args }
function agyg   { Invoke-Agy -RepoName "GenCreator"   -RepoPath "$HOME\gencreator.ai"                 -Color Yellow  @args }
function agyvc  { Invoke-Agy -RepoName "Vibeclubs"    -RepoPath "$HOME\vibeclubs.ai"                  -Color Yellow  @args }
function agyani { Invoke-Agy -RepoName "AnimeLegends" -RepoPath "$HOME\AnimeLegends.ai"               -Color Magenta @args }
function agydpi { Invoke-Agy -RepoName "DPI"          -RepoPath "$HOME\dpi"                           -Color Cyan    @args }
# NO Business wrapper by design: ~/Business is the off-limits private wealth repo
# (global CLAUDE.md Doctrine 0 item 6). Never pair it with --dangerously-skip-permissions.

Write-Host "Antigravity wrappers loaded: agya | agysis | agyfx | agyg | agyvc | agyani | agydpi" -ForegroundColor DarkCyan
