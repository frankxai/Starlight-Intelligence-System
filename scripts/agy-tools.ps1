# Antigravity + Grok CLI wrappers — engineer-grid parity with cla/ga/cda/oaa/cura.
# Pattern mirrors Microsoft.PowerShell_profile.ps1 (Documents primary).
# Sourced from OneDrive\Dokumente\PowerShell\Microsoft.PowerShell_profile.ps1.

function Get-AgentGridRepo {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][string]$Key)

    $repos = @{
        arc = @{ Name = "Arcanea";      Path = "$HOME\Arcanea";                       Color = "Cyan" }
        sis = @{ Name = "SIS";          Path = "$HOME\Starlight-Intelligence-System"; Color = "Cyan" }
        fx  = @{ Name = "FrankX";       Path = "$HOME\FrankX";                        Color = "Magenta" }
        g   = @{ Name = "GenCreator";   Path = "$HOME\gencreator.ai";                 Color = "Yellow" }
        vc  = @{ Name = "Vibeclubs";    Path = "$HOME\vibeclubs.ai";                  Color = "Yellow" }
        ani = @{ Name = "AnimeLegends"; Path = "$HOME\AnimeLegends.ai";               Color = "Magenta" }
        dpi = @{ Name = "DPI";          Path = "$HOME\dpi";                           Color = "Cyan" }
    }

    if (-not $repos.ContainsKey($Key)) {
        throw "Unknown repo key: $Key"
    }
    return $repos[$Key]
}

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

function Invoke-GrokRepo {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RepoName,
        [Parameter(Mandatory=$true)][string]$RepoPath,
        [string]$Color = "Cyan",
        [Parameter(ValueFromRemainingArguments)][string[]]$Rest
    )

    Write-Host ""
    Write-Host "   [ENGINEER] Launching Grok in $RepoName..." -ForegroundColor $Color
    Write-Host "   Focus: Grok CLI / xAI reasoning lane / repo-local task execution" -ForegroundColor DarkGray
    Write-Host "   Path: $RepoPath" -ForegroundColor DarkGray
    Write-Host ""

    if (-not (Test-Path -LiteralPath $RepoPath)) {
        Write-Host "   [ERROR] Path not found: $RepoPath" -ForegroundColor Red
        return
    }
    if (-not (Get-Command grok -ErrorAction SilentlyContinue)) {
        Write-Host "   [ERROR] grok not on PATH. Install Grok CLI then re-source profile." -ForegroundColor Red
        return
    }

    Set-Location -LiteralPath $RepoPath
    grok @Rest
}

function Invoke-AgyRepoKey {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$Key,
        [Parameter(ValueFromRemainingArguments)][string[]]$Rest
    )

    $repo = Get-AgentGridRepo -Key $Key
    Invoke-Agy -RepoName $repo.Name -RepoPath $repo.Path -Color $repo.Color @Rest
}

function Invoke-GrokRepoKey {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$Key,
        [Parameter(ValueFromRemainingArguments)][string[]]$Rest
    )

    $repo = Get-AgentGridRepo -Key $Key
    Invoke-GrokRepo -RepoName $repo.Name -RepoPath $repo.Path -Color $repo.Color @Rest
}

function Test-AgentGridCli {
    [CmdletBinding()]
    param()

    $checks = foreach ($name in @("agy", "grok")) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        [pscustomobject]@{
            Tool = $name
            Installed = [bool]$cmd
            Source = if ($cmd) { $cmd.Source } else { "" }
        }
    }

    $repos = foreach ($key in @("arc", "sis", "fx", "g", "vc", "ani", "dpi")) {
        $repo = Get-AgentGridRepo -Key $key
        [pscustomobject]@{
            Key = $key
            Repo = $repo.Name
            Path = $repo.Path
            Exists = Test-Path -LiteralPath $repo.Path
        }
    }

    Write-Host "== CLI binaries ==" -ForegroundColor Cyan
    $checks | Format-Table -AutoSize
    Write-Host ""
    Write-Host "== Repo targets ==" -ForegroundColor Cyan
    $repos | Format-Table -AutoSize
}

# Repo wrappers — mirror cla/ga/cda/oaa/cura naming convention.
# Add new entries as new repos enter the engineer grid.
function agyarc { Invoke-AgyRepoKey -Key "arc" @args }
function agya   { Invoke-AgyRepoKey -Key "arc" @args }
function agysis { Invoke-AgyRepoKey -Key "sis" @args }
function agyfx  { Invoke-AgyRepoKey -Key "fx"  @args }
function agyg   { Invoke-AgyRepoKey -Key "g"   @args }
function agyvc  { Invoke-AgyRepoKey -Key "vc"  @args }
function agyani { Invoke-AgyRepoKey -Key "ani" @args }
function agydpi { Invoke-AgyRepoKey -Key "dpi" @args }

function grarc { Invoke-GrokRepoKey -Key "arc" @args }
function grsis { Invoke-GrokRepoKey -Key "sis" @args }
function grfx  { Invoke-GrokRepoKey -Key "fx"  @args }
function grg   { Invoke-GrokRepoKey -Key "g"   @args }
function grvc  { Invoke-GrokRepoKey -Key "vc"  @args }
function grani { Invoke-GrokRepoKey -Key "ani" @args }
function grdpi { Invoke-GrokRepoKey -Key "dpi" @args }
# NO Business wrapper by design: ~/Business is the off-limits private wealth repo
# (global CLAUDE.md Doctrine 0 item 6). Never pair it with --dangerously-skip-permissions.

Write-Host "Antigravity wrappers loaded: agyarc/agya | agysis | agyfx | agyg | agyvc | agyani | agydpi" -ForegroundColor DarkCyan
Write-Host "Grok wrappers loaded: grarc | grsis | grfx | grg | grvc | grani | grdpi" -ForegroundColor DarkCyan
