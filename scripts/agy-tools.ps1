# ==============================================================================
# Starlight Intelligence System — Premium Antigravity CLI Integration
# ==============================================================================
# Built on SIP · Idempotent · Windows-optimized
# Provides high-velocity YOLO terminal operations for the 25 local repos.
#
# To activate, ensure this is sourced in your $PROFILE:
#   . "$HOME\starlight\repos\Starlight-Intelligence-System\scripts\agy-tools.ps1"
# ==============================================================================

# Force console UTF-8 support
try {
    if ([Console]::OutputEncoding.CodePage -ne 65001) {
        [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
        $OutputEncoding = [System.Text.UTF8Encoding]::new()
    }
} catch {}

$global:AGY_EXE_PATH = "C:\Users\frank\AppData\Local\agy\bin\agy.exe"
$global:REPOS_ROOT = "C:\Users\frank"

if (-not $global:STARLIGHT_REPO_SHORTCUTS) {
    $global:STARLIGHT_REPO_SHORTCUTS = [ordered]@{
        sis        = "Starlight-Intelligence-System"
        starlight  = "Starlight-Intelligence-System"
        fx         = "FrankX"
        frankx     = "FrankX"
        arc        = "arcanea-ecosystem"
        arcanea    = "arcanea-ecosystem"
        app        = "arcanea-ai-app"
        claw       = "arcanea-claw"
        orchestrator = "arcanea-orchestrator"
        studio     = "arcanea-studio"
        author     = "author-os"
        aco        = "agentic-creator-os"
        acos       = "agentic-creator-os"
        anime      = "AnimeLegends"
        ani        = "AnimeLegends"
        dpi        = "dpi"
        website    = "frankx.ai-vercel-website"
        gencreator = "gencreator.ai"
        g          = "gencreator.ai"
        vibeclubs  = "vibeclubs.ai"
        vc         = "vibeclubs.ai"
        kura       = "kura"
        doctor     = "mcp-doctor"
        peak       = "peak-performance"
        engine     = "prompt-engine"
        prompts    = "prompt-library"
        brain      = "second-brain-os"
        cockpit    = "sentinel-swarm-cockpit"
        swarm      = "starlight-swarm"
        suno       = "suno-mcp-server"
        visual     = "visual-intelligence"
        clconfig   = "claude-code-config"
        clhooks    = "claude-code-hooks"
        clskills   = "claude-skills-library"
        deepagent  = "deepagent"
        da         = "deepagent"
        agenticops = "agentic-ops"
    }
}

function Get-StarlightRepo {
    param(
        [Parameter(Mandatory=$true, Position=0)]
        [string]$RepoKey,
        [switch]$Silent
    )

    if (-not (Test-Path $global:REPOS_ROOT)) {
        if (-not $Silent) { Write-Error "Repository root does not exist: $global:REPOS_ROOT" }
        return $null
    }

    $key = $RepoKey.Trim()
    if ($global:STARLIGHT_REPO_SHORTCUTS.Contains($key.ToLowerInvariant())) {
        $mappedPath = Join-Path $global:REPOS_ROOT $global:STARLIGHT_REPO_SHORTCUTS[$key.ToLowerInvariant()]
        if (Test-Path $mappedPath) {
            return Get-Item $mappedPath
        }
    }

    $dirs = Get-ChildItem -Path $global:REPOS_ROOT -Directory
    $match = $dirs | Where-Object { $_.Name -ieq $key } | Select-Object -First 1

    if (-not $match) {
        $match = $dirs | Where-Object { $_.Name.StartsWith($key, [System.StringComparison]::OrdinalIgnoreCase) } | Select-Object -First 1
    }

    if (-not $match) {
        $match = $dirs | Where-Object { $_.Name -ilike "*$key*" } | Select-Object -First 1
    }

    if (-not $match) {
        if (-not $Silent) { Write-Error "Could not resolve repository key '$RepoKey' inside $global:REPOS_ROOT." }
        return $null
    }

    return $match
}

function Show-StarlightRepos {
    param(
        [string]$Verb = "run"
    )

    Write-Host "Available repositories to ${Verb}:" -ForegroundColor Cyan
    Get-ChildItem -Path $global:REPOS_ROOT -Directory | Sort-Object Name | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor DarkGray
    }
    Write-Host ""
    Write-Host "Useful keys: sis, fx, arc, app, claw, studio, author, aco, prompts, brain, cockpit, swarm, visual, g, vc, ani, dpi" -ForegroundColor DarkCyan
}

# Helper: Run history sync across harnesses
function Invoke-HistorySync {
    $syncScript = "C:\Users\frank\agentic-ops\lifecycle\sync-harnesses.js"
    if (Test-Path $syncScript) {
        Write-Host "🔄 Syncing harness histories..." -ForegroundColor DarkGray
        node $syncScript | Out-Null
    }
}

# Helper: Invoke agy with YOLO mode in a target path, optionally seeding a prompt
function Invoke-AgyYolo {
    param(
        [string]$TargetPath,
        [string]$Prompt
    )

    if (-not (Test-Path $TargetPath)) {
        Write-Error "Target repository path does not exist: $TargetPath"
        return
    }

    if (-not (Test-Path $global:AGY_EXE_PATH)) {
        Write-Error "Antigravity CLI not found at: $global:AGY_EXE_PATH"
        return
    }

    # Sync history from other harnesses
    Invoke-HistorySync

    # Switch location
    Set-Location $TargetPath
    Write-Host "⚡ Switched context to: $TargetPath" -ForegroundColor DarkCyan

    if ($Prompt) {
        Write-Host "🚀 Spawning YOLO Agent with pre-seeded prompt: '$Prompt'" -ForegroundColor Green
        & $global:AGY_EXE_PATH --dangerously-skip-permissions --prompt-interactive $Prompt
    } else {
        Write-Host "🚀 Spawning YOLO Agent (interactive)..." -ForegroundColor Green
        & $global:AGY_EXE_PATH --dangerously-skip-permissions
    }
}

# ------------------------------------------------------------------------------
# Dedicated Wrappers
# ------------------------------------------------------------------------------

# agy-sis: Starlight Intelligence System YOLO
function agy-sis {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "sis"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

# agy-fx: FrankX YOLO
function agy-fx {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "fx"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

# agy-arc: Arcanea Ecosystem YOLO
function agy-arc {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "arc"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-app {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "app"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-studio {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "studio"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-brain {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "brain"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-prompts {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "prompts"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-acos {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "acos"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-g {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "g"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-vc {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "vc"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-ani {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "ani"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

function agy-dpi {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "dpi"
    if ($repo) { Invoke-AgyYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

# Alias for convenience
Set-Alias -Name arcanea -Value agy-arc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agysis -Value agy-sis -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyfx -Value agy-fx -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyarc -Value agy-arc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyapp -Value agy-app -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agystudio -Value agy-studio -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agybrain -Value agy-brain -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyprompts -Value agy-prompts -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyacos -Value agy-acos -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyaco -Value agy-acos -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyg -Value agy-g -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyvc -Value agy-vc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agyani -Value agy-ani -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agydpi -Value agy-dpi -Scope Global -Force -ErrorAction SilentlyContinue

# ------------------------------------------------------------------------------
# Generalized Fuzzy Conductor
# ------------------------------------------------------------------------------

# agy-run: Dynamic lookup and run YOLO in any of the 25 repos
function agy-run {
    param(
        [Parameter(Mandatory=$false, Position=0)]
        [string]$RepoKey,
        [Parameter(Mandatory=$false, Position=1)]
        [string]$Prompt
    )

    if (-not $RepoKey) {
        Show-StarlightRepos -Verb "run Antigravity in"
        Write-Host "Usage: agy-run <repo-key> [prompt]" -ForegroundColor DarkCyan
        return
    }

    $match = Get-StarlightRepo $RepoKey
    if (-not $match) { return }

    Write-Host "Resolved '$RepoKey' to: $($match.Name)" -ForegroundColor Cyan
    Invoke-AgyYolo -TargetPath $match.FullName -Prompt $Prompt
}

# Global short aliases
Set-Alias -Name ay -Value agy-run -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name agy-yolo -Value agy-run -Scope Global -Force -ErrorAction SilentlyContinue

# Helper: Invoke Claude Code in a target path in YOLO mode
function Invoke-ClaudeYolo {
    param(
        [string]$TargetPath
    )

    if (-not (Test-Path $TargetPath)) {
        Write-Error "Target repository path does not exist: $TargetPath"
        return
    }

    # Resolve local path
    $claudeExe = "C:\Users\frank\.local\bin\claude.exe"
    if (-not (Test-Path $claudeExe)) {
        $claudeExe = "claude"
    }

    # Sync history from other harnesses
    Invoke-HistorySync

    # Switch location
    Set-Location $TargetPath
    Write-Host "⚡ Switched context to: $TargetPath" -ForegroundColor DarkCyan
    Write-Host "🚀 Spawning Claude Code YOLO Agent..." -ForegroundColor Green
    & $claudeExe --dangerously-skip-permissions
}

function Invoke-CodexInRepo {
    param(
        [string]$TargetPath
    )

    if (-not (Test-Path $TargetPath)) {
        Write-Error "Target repository path does not exist: $TargetPath"
        return
    }

    $codexPath = "C:\Users\frank\AppData\Roaming\npm\codex.ps1"
    if (-not (Test-Path $codexPath)) {
        $codexPath = "codex"
    }

    # Sync history from other harnesses
    Invoke-HistorySync

    Set-Location $TargetPath
    Write-Host "⚡ Switched context to: $TargetPath" -ForegroundColor DarkCyan
    Write-Host "🚀 Spawning Codex..." -ForegroundColor Green
    & $codexPath
}

# Helper: headless single-turn dispatch (used by /si fanout)
function Invoke-AgentDispatch {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet('grok','codex','claude','opencode','deepagent','antigravity')]
        [string]$Lane,
        [Parameter(Mandatory=$true)]
        [string]$TargetPath,
        [Parameter(Mandatory=$true)]
        [string]$Prompt
    )

    if (-not (Test-Path $TargetPath)) {
        Write-Error "Target repository path does not exist: $TargetPath"
        return
    }

    Set-Location $TargetPath
    Write-Host "⚡ Dispatch [$Lane] → $TargetPath" -ForegroundColor DarkCyan

    switch ($Lane) {
        'grok' {
            $grokExe = "C:\Users\frank\.grok\bin\grok.exe"
            if (-not (Test-Path $grokExe)) { $grokExe = "grok" }
            & $grokExe -p $Prompt --cwd $TargetPath --disable-web-search --max-turns 8 --output-format plain
        }
        'codex' {
            $codexPath = "C:\Users\frank\AppData\Roaming\npm\codex.ps1"
            if (-not (Test-Path $codexPath)) { $codexPath = "codex" }
            & $codexPath exec --sandbox workspace-write $Prompt
        }
        'claude' {
            $claudeExe = "C:\Users\frank\.local\bin\claude.exe"
            if (-not (Test-Path $claudeExe)) { $claudeExe = "claude" }
            & $claudeExe -p $Prompt --model claude-haiku-4-5
        }
        'opencode' {
            $oa = "C:\Users\frank\AppData\Roaming\npm\opencode.ps1"
            if (-not (Test-Path $oa)) { $oa = "opencode" }
            & $oa run $Prompt
        }
        'deepagent' {
            $dcode = "C:\Users\frank\.local\bin\dcode.exe"
            if (-not (Test-Path $dcode)) { $dcode = "dcode" }
            & $dcode -m $Prompt -y -M claude-haiku-4-5
        }
        'antigravity' {
            $script = Join-Path $PSScriptRoot 'si-dispatch.ps1'
            if (Test-Path $script) {
                & $script -Lanes antigravity -RepoPath $TargetPath -Task $Prompt
                return
            }
            if (-not (Test-Path $global:AGY_EXE_PATH)) {
                Write-Error "Antigravity CLI not found at: $global:AGY_EXE_PATH"
                return
            }
            & $global:AGY_EXE_PATH -p $Prompt --dangerously-skip-permissions --add-dir $TargetPath
        }
    }
}

# Helper: Invoke Grok in a target path in YOLO mode (interactive) or headless when -Prompt given
function Invoke-GrokYolo {
    param(
        [string]$TargetPath,
        [string]$Prompt
    )

    if (-not (Test-Path $TargetPath)) {
        Write-Error "Target repository path does not exist: $TargetPath"
        return
    }

    $grokExe = "C:\Users\frank\.grok\bin\grok.exe"
    if (-not (Test-Path $grokExe)) {
        $grokExe = "grok"
    }

    # Sync history from other harnesses
    Invoke-HistorySync

    Set-Location $TargetPath
    Write-Host "⚡ Switched context to: $TargetPath" -ForegroundColor DarkCyan
    if ($Prompt) {
        Write-Host "🚀 Grok headless dispatch..." -ForegroundColor Green
        & $grokExe -p $Prompt --cwd $TargetPath --disable-web-search --max-turns 8 --output-format plain
    } else {
        Write-Host "🚀 Spawning Grok YOLO Agent..." -ForegroundColor Green
        & $grokExe --always-approve
    }
}

# Helper: Invoke DeepAgent Code in a target path in YOLO mode
function Invoke-DeepAgentYolo {
    param(
        [string]$TargetPath
    )

    if (-not (Test-Path $TargetPath)) {
        Write-Error "Target repository path does not exist: $TargetPath"
        return
    }

    # Switch location
    Set-Location $TargetPath
    Write-Host "⚡ Switched context to: $TargetPath" -ForegroundColor DarkCyan
    Write-Host "🚀 Spawning DeepAgent YOLO Agent (interactive)..." -ForegroundColor Green
    dcode --auto-approve --shell-allow-list all
}

# Dedicated wrappers for DeepAgent (dcode)
function dasis {
    $repo = Get-StarlightRepo "sis"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function dafx {
    $repo = Get-StarlightRepo "fx"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function daarc {
    $repo = Get-StarlightRepo "arc"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function daapp {
    $repo = Get-StarlightRepo "app"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function dastudio {
    $repo = Get-StarlightRepo "studio"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function dabrain {
    $repo = Get-StarlightRepo "brain"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function daprompts {
    $repo = Get-StarlightRepo "prompts"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function daacos {
    $repo = Get-StarlightRepo "acos"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function dag {
    $repo = Get-StarlightRepo "g"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function davc {
    $repo = Get-StarlightRepo "vc"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function daani {
    $repo = Get-StarlightRepo "ani"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

function dadpi {
    $repo = Get-StarlightRepo "dpi"
    if ($repo) { Invoke-DeepAgentYolo -TargetPath $repo.FullName }
}

# General fuzzy lookup for DeepAgent YOLO
function da-run {
    param(
        [Parameter(Mandatory=$false, Position=0)]
        [string]$RepoKey
    )

    if (-not $RepoKey) {
        Show-StarlightRepos -Verb "run DeepAgent in"
        Write-Host "`nUsage: da-run <repo-key>" -ForegroundColor DarkCyan
        return
    }

    $match = Get-StarlightRepo $RepoKey
    if (-not $match) { return }

    Write-Host "Resolved '$RepoKey' to: $($match.Name)" -ForegroundColor Cyan
    Invoke-DeepAgentYolo -TargetPath $match.FullName
}

Set-Alias -Name da -Value da-run -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name dag -Value dag -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name davc -Value davc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name daani -Value daani -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name dadpi -Value dadpi -Scope Global -Force -ErrorAction SilentlyContinue

# Dedicated wrappers for Claude Code
function clsis {
    $repo = Get-StarlightRepo "sis"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clfx {
    $repo = Get-StarlightRepo "fx"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clarc {
    $repo = Get-StarlightRepo "arc"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clapp {
    $repo = Get-StarlightRepo "app"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clstudio {
    $repo = Get-StarlightRepo "studio"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clbrain {
    $repo = Get-StarlightRepo "brain"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clprompts {
    $repo = Get-StarlightRepo "prompts"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clacos {
    $repo = Get-StarlightRepo "acos"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clg {
    $repo = Get-StarlightRepo "g"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clvc {
    $repo = Get-StarlightRepo "vc"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function clani {
    $repo = Get-StarlightRepo "ani"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

function cldpi {
    $repo = Get-StarlightRepo "dpi"
    if ($repo) { Invoke-ClaudeYolo -TargetPath $repo.FullName }
}

# Dedicated wrappers for Codex in repo context
function cd-sis {
    $repo = Get-StarlightRepo "sis"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-fx {
    $repo = Get-StarlightRepo "fx"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-arc {
    $repo = Get-StarlightRepo "arc"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-app {
    $repo = Get-StarlightRepo "app"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-studio {
    $repo = Get-StarlightRepo "studio"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-brain {
    $repo = Get-StarlightRepo "brain"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-prompts {
    $repo = Get-StarlightRepo "prompts"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-acos {
    $repo = Get-StarlightRepo "acos"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-g {
    $repo = Get-StarlightRepo "g"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-vc {
    $repo = Get-StarlightRepo "vc"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-ani {
    $repo = Get-StarlightRepo "ani"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

function cd-dpi {
    $repo = Get-StarlightRepo "dpi"
    if ($repo) { Invoke-CodexInRepo -TargetPath $repo.FullName }
}

# General fuzzy lookup for Claude Code YOLO
function cl-run {
    param(
        [Parameter(Mandatory=$false, Position=0)]
        [string]$RepoKey
    )

    if (-not $RepoKey) {
        Show-StarlightRepos -Verb "run Claude Code in"
        Write-Host "`nUsage: cl-run <repo-key>" -ForegroundColor DarkCyan
        return
    }

    $match = Get-StarlightRepo $RepoKey
    if (-not $match) { return }

    Write-Host "Resolved '$RepoKey' to: $($match.Name)" -ForegroundColor Cyan
    Invoke-ClaudeYolo -TargetPath $match.FullName
}

# General fuzzy lookup for Codex
function cd-run {
    param(
        [Parameter(Mandatory=$false, Position=0)]
        [string]$RepoKey
    )

    if (-not $RepoKey) {
        Show-StarlightRepos -Verb "run Codex in"
        Write-Host "`nUsage: cd-run <repo-key>" -ForegroundColor DarkCyan
        return
    }

    $match = Get-StarlightRepo $RepoKey
    if (-not $match) { return }

    Write-Host "Resolved '$RepoKey' to: $($match.Name)" -ForegroundColor Cyan
    Invoke-CodexInRepo -TargetPath $match.FullName
}

Set-Alias -Name cdsis -Value cd-sis -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdfx -Value cd-fx -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdarc -Value cd-arc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdapp -Value cd-app -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdstudio -Value cd-studio -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdbrain -Value cd-brain -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdprompts -Value cd-prompts -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdacos -Value cd-acos -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdaco -Value cd-acos -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdg -Value cd-g -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdvc -Value cd-vc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cdani -Value cd-ani -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cddpi -Value cd-dpi -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cx -Value cd-run -Scope Global -Force -ErrorAction SilentlyContinue

# Intelligent cl wrapper: cl with no args launches Claude in CURRENT folder, cl <repo> launches in target repo
function cl-intelligent {
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$ArgsList
    )
    if ($ArgsList.Count -eq 0) {
        $claudeExe = "C:\Users\frank\.local\bin\claude.exe"
        if (-not (Test-Path $claudeExe)) { $claudeExe = "claude" }
        & $claudeExe
    } else {
        cl-run ($ArgsList -join ' ')
    }
}
Remove-Item -Path Alias:cl -ErrorAction SilentlyContinue
Set-Alias -Name cl -Value cl-intelligent -Scope Global -Force -ErrorAction SilentlyContinue

# Intelligent cd wrapper: cd with no args launches codex, cd <path> changes directory
function cd-intelligent {
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$PathArgs
    )
    if ($PathArgs.Count -eq 0) {
        $codexPath = "C:\Users\frank\AppData\Roaming\npm\codex.ps1"
        if (-not (Test-Path $codexPath)) {
            $codexPath = "codex"
        }
        & $codexPath
    } else {
        $target = $PathArgs -join ' '
        $target = $target.Trim('"').Trim("'")
        if (Test-Path $target) {
            Set-Location $target
        } elseif ($repo = Get-StarlightRepo $target -Silent) {
            Set-Location $repo.FullName
        } else {
            if (Get-Command __zoxide_z -ErrorAction SilentlyContinue) {
                __zoxide_z $target
            } else {
                Set-Location $target
            }
        }
    }
}
Remove-Item -Path Alias:cd -ErrorAction SilentlyContinue
Set-Alias -Name cd -Value cd-intelligent -Scope Global -Force -ErrorAction SilentlyContinue

# Dedicated wrappers for Grok in repo context
function gr-sis {
    param([string]$Prompt)
    $repo = Get-StarlightRepo "sis"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName -Prompt $Prompt }
}

# Dedicated wrappers for Grok in repo context
function gr-fx {
    $repo = Get-StarlightRepo "fx"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-arc {
    $repo = Get-StarlightRepo "arc"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-app {
    $repo = Get-StarlightRepo "app"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-studio {
    $repo = Get-StarlightRepo "studio"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-brain {
    $repo = Get-StarlightRepo "brain"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-prompts {
    $repo = Get-StarlightRepo "prompts"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-acos {
    $repo = Get-StarlightRepo "acos"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-g {
    $repo = Get-StarlightRepo "g"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-vc {
    $repo = Get-StarlightRepo "vc"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-ani {
    $repo = Get-StarlightRepo "ani"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

function gr-dpi {
    $repo = Get-StarlightRepo "dpi"
    if ($repo) { Invoke-GrokYolo -TargetPath $repo.FullName }
}

# General fuzzy lookup for Grok YOLO
function gr-run {
    param(
        [Parameter(Mandatory=$false, Position=0)]
        [string]$RepoKey
    )

    if (-not $RepoKey) {
        Show-StarlightRepos -Verb "run Grok in"
        Write-Host "`nUsage: gr-run <repo-key>" -ForegroundColor DarkCyan
        return
    }

    $match = Get-StarlightRepo $RepoKey
    if (-not $match) { return }

    Write-Host "Resolved '$RepoKey' to: $($match.Name)" -ForegroundColor Cyan
    Invoke-GrokYolo -TargetPath $match.FullName
}

# Grok aliases
Set-Alias -Name grsis -Value gr-sis -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gksis -Value gr-sis -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grfx -Value gr-fx -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkfx -Value gr-fx -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grarc -Value gr-arc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkarc -Value gr-arc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grapp -Value gr-app -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkapp -Value gr-app -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grstudio -Value gr-studio -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkstudio -Value gr-studio -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grbrain -Value gr-brain -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkbrain -Value gr-brain -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grprompts -Value gr-prompts -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkprompts -Value gr-prompts -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gracos -Value gr-acos -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name graco -Value gr-acos -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkacos -Value gr-acos -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkaco -Value gr-acos -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grg -Value gr-g -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkg -Value gr-g -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grvc -Value gr-vc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkvc -Value gr-vc -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grani -Value gr-ani -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkani -Value gr-ani -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name grdpi -Value gr-dpi -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gkdpi -Value gr-dpi -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gx -Value gr-run -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name gk -Value gr-run -Scope Global -Force -ErrorAction SilentlyContinue

# Intelligent gr wrapper: gr with no args launches grok in current folder, gr <repo> launches in target repo
function gr-intelligent {
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$ArgsList
    )
    if ($ArgsList.Count -eq 0) {
        $grokExe = "C:\Users\frank\.grok\bin\grok.exe"
        if (-not (Test-Path $grokExe)) { $grokExe = "grok" }
        & $grokExe
    } else {
        gr-run ($ArgsList -join ' ')
    }
}
Remove-Item -Path Alias:gr -ErrorAction SilentlyContinue
Set-Alias -Name gr -Value gr-intelligent -Scope Global -Force -ErrorAction SilentlyContinue

# ------------------------------------------------------------------------------
# ASPH & Starlight Lifecycle Aliases
# ------------------------------------------------------------------------------

function asph-cp {
    powershell.exe -ExecutionPolicy Bypass -File "C:\Users\frank\agentic-ops\lifecycle\asph-checkpoint.ps1"
}

function asph-rs {
    powershell.exe -ExecutionPolicy Bypass -File "C:\Users\frank\agentic-ops\lifecycle\asph-resume.ps1"
}

function asph-sync {
    node "C:\Users\frank\agentic-ops\lifecycle\sync-harnesses.js"
}

function starlight-status-all {
    $RegistryPath = "C:\Users\frank\repo-registry.json"
    $ReposRoot = "C:\Users\frank\starlight\repos"
    
    if (-not (Test-Path $RegistryPath)) {
        Write-Error "Repo registry not found."
        return
    }
    
    $currentPath = Get-Location
    $registry = Get-Content $RegistryPath -Raw | ConvertFrom-Json
    $results = @()
    
    foreach ($r in $registry.repos) {
        if ($r.status -eq "active" -or $r.agentStatus -eq "active") {
            $path = Join-Path $ReposRoot $r.name
            if (Test-Path "$path\.git") {
                Set-Location $path
                $branch = git branch --show-current 2>$null
                $lastCommit = git log -1 --format=%s 2>$null
                $dirtyLines = (git status --porcelain 2>$null | Measure-Object -Line).Lines
                
                $results += [PSCustomObject]@{
                    Name       = $r.name
                    Branch     = $branch
                    Status     = if ($dirtyLines -gt 0) { "Dirty ($dirtyLines files)" } else { "Clean" }
                    LastCommit = $lastCommit
                }
            }
        }
    }
    
    # Restore original directory location
    Set-Location $currentPath
    
    Write-Host "`n🧠 Starlight Fleet Repository Status" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor DarkGray
    $results | Format-Table -AutoSize
}

function starlight-cockpit {
    Write-Host "📊 Generating live Starlight Fleet Cockpit..." -ForegroundColor Cyan
    node "C:\Users\frank\agentic-ops\lifecycle\generate-dashboard.js"
}

Set-Alias -Name checkpoint -Value asph-cp -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name resume -Value asph-rs -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name hsync -Value asph-sync -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name status-all -Value starlight-status-all -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name cockpit -Value starlight-cockpit -Scope Global -Force -ErrorAction SilentlyContinue
Set-Alias -Name dashboard -Value starlight-cockpit -Scope Global -Force -ErrorAction SilentlyContinue

# Diagnostic and Verification Tools
# ------------------------------------------------------------------------------

function Test-AgentGridCli {
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host " Starlight Agent Grid CLI Diagnostic Check" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Cyan

    $binaries = @{
        "Claude Code" = @{ Path = "C:\Users\frank\.local\bin\claude.exe"; Command = "claude" }
        "Codex"       = @{ Path = "C:\Users\frank\AppData\Roaming\npm\codex.ps1"; Command = "codex" }
        "Grok"        = @{ Path = "C:\Users\frank\.grok\bin\grok.exe"; Command = "grok" }
        "OpenCode"    = @{ Path = "C:\Users\frank\AppData\Roaming\npm\opencode.ps1"; Command = "opencode" }
        "DeepAgent"   = @{ Path = "C:\Users\frank\.local\bin\dcode.exe"; Command = "dcode" }
        "Antigravity" = @{ Path = $global:AGY_EXE_PATH; Command = "agy" }
        "Arco"        = @{ Path = "C:\Users\frank\AppData\Roaming\npm\arco.ps1"; Command = "arco" }
    }

    Write-Host "`n--- AI Binaries Status ---" -ForegroundColor Yellow
    foreach ($name in $binaries.Keys) {
        $bin = $binaries[$name]
        $pathExists = Test-Path $bin.Path
        $cmdExists = Get-Command $bin.Command -ErrorAction SilentlyContinue

        if ($pathExists -or $cmdExists) {
            Write-Host "  [OK] " -NoNewline -ForegroundColor Green
            Write-Host "$name is installed." -NoNewline
            if ($pathExists) {
                Write-Host " (Path: $($bin.Path))" -ForegroundColor Gray
            } else {
                Write-Host " (Available in PATH as: $($bin.Command))" -ForegroundColor Gray
            }
        } else {
            Write-Host "  [MISSING] " -NoNewline -ForegroundColor Red
            Write-Host "$name is NOT found at expected paths or in PATH." -ForegroundColor Yellow
        }
    }

    Write-Host "`n--- Repository Path Status ---" -ForegroundColor Yellow
    $keys = $global:STARLIGHT_REPO_SHORTCUTS.Keys
    foreach ($key in $keys) {
        # Avoid duplicate prints in diagnostic list (e.g. starlight vs sis)
        if ($key -in @("starlight", "frankx", "arcanea", "aco", "da")) {
            continue
        }
        
        $dirName = $global:STARLIGHT_REPO_SHORTCUTS[$key]
        $mappedPath = Join-Path $global:REPOS_ROOT $dirName
        $exists = Test-Path $mappedPath

        if ($exists) {
            Write-Host "  [OK] " -NoNewline -ForegroundColor Green
            Write-Host "$($key.ToUpperInvariant()) -> " -NoNewline -ForegroundColor Cyan
            Write-Host "$dirName exists." -ForegroundColor Gray
        } else {
            Write-Host "  [NOT FOUND] " -NoNewline -ForegroundColor DarkGray
            Write-Host "$($key.ToUpperInvariant()) -> " -NoNewline -ForegroundColor Yellow
            Write-Host "$dirName does not exist under $global:REPOS_ROOT." -ForegroundColor DarkGray
        }
    }
    Write-Host "======================================================================" -ForegroundColor Cyan
}

# ------------------------------------------------------------------------------
# Starlight /si fanout + council orchestration
# ------------------------------------------------------------------------------

function Invoke-SiFanout {
    param(
        [string]$Task,
        [string]$TaskFile,
        [string[]]$Lanes = @('grok', 'codex'),
        [string]$RepoKey = 'sis',
        [string]$RepoPath,
        [switch]$Parallel,
        [switch]$Ledger,
        [string]$LedgerPath,
        [string]$ReceiptPath,
        [int]$TimeoutSec = 180,
        [switch]$UseArco,
        [switch]$Json
    )
    $script = Join-Path $PSScriptRoot 'si-dispatch.ps1'
    if (-not (Test-Path $script)) {
        Write-Error "si-dispatch.ps1 not found at $script"
        return
    }
    $args = @('-Lanes', $Lanes, '-Repo', $RepoKey, '-TimeoutSec', $TimeoutSec)
    if ($Task) { $args += @('-Task', $Task) }
    if ($TaskFile) { $args += @('-TaskFile', $TaskFile) }
    if ($RepoPath) { $args += @('-RepoPath', $RepoPath) }
    if ($Parallel) { $args += '-Parallel' }
    if ($Ledger) { $args += '-Ledger' }
    if ($LedgerPath) { $args += @('-LedgerPath', $LedgerPath) }
    if ($ReceiptPath) { $args += @('-ReceiptPath', $ReceiptPath) }
    if ($UseArco) { $args += '-UseArco' }
    if ($Json) { $args += '-Json' }
    & $script @args
}

function Invoke-SiCouncil {
    param(
        [string[]]$Seats = @('grok', 'codex', 'antigravity'),
        [ValidateSet('audit', 'ping', 'custom')]
        [string]$Mode = 'audit',
        [string]$Task,
        [string]$RepoKey = 'sis',
        [string]$RepoPath,
        [string]$OutDir,
        [switch]$Parallel,
        [int]$TimeoutSec = 240,
        [switch]$Json,
        [switch]$Synthesize
    )
    $script = Join-Path $PSScriptRoot 'si-council.ps1'
    if (-not (Test-Path $script)) {
        Write-Error "si-council.ps1 not found at $script"
        return
    }
    $args = @('-Seats', $Seats, '-Mode', $Mode, '-Repo', $RepoKey, '-TimeoutSec', $TimeoutSec)
    if ($Task) { $args += @('-Task', $Task) }
    if ($RepoPath) { $args += @('-RepoPath', $RepoPath) }
    if ($OutDir) { $args += @('-OutDir', $OutDir) }
    if ($Parallel) { $args += '-Parallel' }
    if ($Json) { $args += '-Json' }
    if ($Synthesize) { $args += '-Synthesize' }
    & $script @args
}

if ($env:FRANK_QUIET_PROFILE -ne '1') {
    Write-Host 'Antigravity YOLO wrappers loaded: agy-sis/agysis | agy-fx/agyfx | agy-arc/agyarc | agy-app/agyapp | agy-acos/agyacos | agy-run(ay)' -ForegroundColor Green
    Write-Host 'Claude Code, Codex, Grok & DeepAgent integrations active:' -ForegroundColor Green
    Write-Host '  - cl / cd / gr / da (launches agent in current folder)' -ForegroundColor DarkGray
    Write-Host '  - cl <repo> / clsis / clfx / clarc / clapp / clstudio / clbrain / clprompts / clacos' -ForegroundColor DarkGray
    Write-Host '  - cd <repo> / cdsis / cdfx / cdarc / cdapp / cdstudio / cdbrain / cdprompts / cdacos' -ForegroundColor DarkGray
    Write-Host '  - gr <repo> / grsis / grfx / grarc / grapp / grstudio / grbrain / grprompts / gracos (or gk*)' -ForegroundColor DarkGray
    Write-Host '  - da <repo> / dasis / dafx / daarc / daapp / dastudio / dabrain / daprompts / daacos' -ForegroundColor DarkGray
    Write-Host 'Starlight fanout + council: Invoke-SiFanout | Invoke-SiCouncil (si-dispatch.ps1 / si-council.ps1)' -ForegroundColor Green
}
