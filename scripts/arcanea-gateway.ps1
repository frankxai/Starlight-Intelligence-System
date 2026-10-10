# ==============================================================================
# Arcanea Sovereign Ecosystem Gateway & Dispatcher
# ==============================================================================
# Built on SIP & CANON_LOCKED · Zero-Slop · Fast (<50ms)
# Serves as the central command plane for the entire Arcanea creative universe.
# ==============================================================================

function Invoke-ArcaneaGateway {
    [CmdletBinding()]
    param(
        [Parameter(Position=0)]
        [string]$Command,

        [Parameter(Position=1, ValueFromRemainingArguments=$true)]
        [string[]]$Args
    )

    $estateRoot = "C:\Users\frank\starlight\repos"
    $appPath = Join-Path $estateRoot "arcanea-ai-app"
    $orchPath = Join-Path $estateRoot "arcanea-orchestrator"
    $authorPath = Join-Path $estateRoot "author-os"
    $studioPath = Join-Path $estateRoot "arcanea-studio"
    $clawPath = Join-Path $estateRoot "arcanea-claw"
    $gencreatorPath = Join-Path $estateRoot "gencreator.ai"
    $ecoPath = Join-Path $estateRoot "arcanea-ecosystem"

    # Route Subcommands
    switch -Regex ($Command.ToLowerInvariant()) {
        "^(dev|run|start)$" {
            Write-Host "🚀 Launching Arcanea Product Monorepo (localhost:3000)..." -ForegroundColor Cyan
            Set-Location $appPath
            pnpm dev
            return
        }

        "^(status|stat|check)$" {
            Show-ArcaneaConstellationStatus
            return
        }

        "^(author|write|book|novel)$" {
            Write-Host "✍️ Opening Author OS Novel Workspace..." -ForegroundColor Magenta
            Set-Location $authorPath
            if (Test-Path "$authorPath\package.json") {
                pnpm dev
            }
            return
        }

        "^(studio|canvas|visual)$" {
            Write-Host "🎨 Opening Arcanea Studio..." -ForegroundColor Yellow
            if (Test-Path $studioPath) { Set-Location $studioPath; pnpm dev }
            else { Set-Location $ecoPath }
            return
        }

        "^(swarm|ao|orch|orchestrator)$" {
            Write-Host "⚡ Spawning Arcanea Multi-Agent Swarm..." -ForegroundColor DarkCyan
            Set-Location $orchPath
            if (Test-Path "$orchPath\packages\cli") {
                node "$orchPath\packages\cli\dist\index.js" @Args
            } else {
                pnpm test
            }
            return
        }

        "^(claw|media)$" {
            Write-Host "🦅 Dispatched Arcanea Claw Media Pipeline..." -ForegroundColor Red
            Set-Location $clawPath
            pnpm dev
            return
        }

        "^(publish|gen|gencreator|social)$" {
            Write-Host "🌐 Launching GenCreator Distribution Engine..." -ForegroundColor Green
            Set-Location $gencreatorPath
            pnpm dev
            return
        }

        "^(agent|harness)$" {
            $harness = if ($Args.Count -gt 0) { $Args[0] } else { "hermes" }
            Invoke-ArcaneaHarness -Harness $harness -RemainingArgs ($Args | Select-Object -Skip 1)
            return
        }

        "^(hermes)$" {
            Invoke-ArcaneaHarness -Harness "hermes" -RemainingArgs $Args
            return
        }

        "^(claude)$" {
            Invoke-ArcaneaHarness -Harness "claude" -RemainingArgs $Args
            return
        }

        "^(grok)$" {
            Invoke-ArcaneaHarness -Harness "grok" -RemainingArgs $Args
            return
        }

        "^(agy|gemini)$" {
            Invoke-ArcaneaHarness -Harness "agy" -RemainingArgs $Args
            return
        }

        "^(open|web)$" {
            Write-Host "🌐 Opening Arcanea Platform in browser..." -ForegroundColor Cyan
            Start-Process "https://arcanea.ai"
            return
        }

        "^(help|--help|-h)$" {
            Show-ArcaneaHelp
            return
        }

        default {
            if ([string]::IsNullOrWhiteSpace($Command)) {
                # Interactive TUI Gateway
                Show-ArcaneaInteractiveTUI
            } else {
                Write-Host "❌ Unknown Arcanea command: '$Command'" -ForegroundColor Red
                Show-ArcaneaHelp
            }
        }
    }
}

function Invoke-ArcaneaHarness {
    param([string]$Harness, [string[]]$RemainingArgs)
    $ecoPath = "C:\Users\frank\starlight\repos\arcanea-ecosystem"
    Set-Location $ecoPath

    switch ($Harness.ToLowerInvariant()) {
        "hermes" {
            Write-Host "🪄 Spawning Hermes Agent (Arcanea Profile)..." -ForegroundColor Cyan
            & hermes -p arcanea @RemainingArgs
        }
        "claude" {
            Write-Host "🪄 Spawning Claude Code in Arcanea..." -ForegroundColor Magenta
            claude @RemainingArgs
        }
        "grok" {
            Write-Host "🪄 Spawning Grok Build in Arcanea..." -ForegroundColor Yellow
            grok @RemainingArgs
        }
        "agy" {
            Write-Host "🪄 Spawning Gemini CLI (agy) YOLO in Arcanea..." -ForegroundColor Green
            agy-arc @RemainingArgs
        }
        "codex" {
            Write-Host "🪄 Spawning Codex in Arcanea..." -ForegroundColor Blue
            codex @RemainingArgs
        }
        default {
            Write-Host "Unknown harness '$Harness'. Available: hermes, claude, grok, agy, codex" -ForegroundColor Yellow
        }
    }
}

function Show-ArcaneaInteractiveTUI {
    Write-Host ""
    Write-Host "  ARCANEA  " -NoNewline -ForegroundColor White
    Write-Host "│" -NoNewline -ForegroundColor DarkGray
    Write-Host "  Sovereign Creation Instrument  " -NoNewline -ForegroundColor DarkCyan
    Write-Host "│" -NoNewline -ForegroundColor DarkGray
    Write-Host "  Ten-Gate Cognitive Architecture" -ForegroundColor DarkGray
    Write-Host "  " -NoNewline
    Write-Host ("─" * 72) -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  SURFACES                       WORKSPACES & ENGINES" -ForegroundColor DarkGray
    Write-Host "  [1] Product Monorepo  (web)    [4] Multi-Agent Swarm (ao)" -ForegroundColor White
    Write-Host "  [2] Author OS         (novels) [5] Constellation Map (git)" -ForegroundColor White
    Write-Host "  [3] Visual Studio     (media)  [6] Sovereign Harness (agent)" -ForegroundColor White
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host ("─" * 72) -ForegroundColor DarkGray
    Write-Host "  Dispatch [1-6], [o]pen platform, [q]uit, or type a command" -ForegroundColor DarkGray
    Write-Host ""
    
    $choice = Read-Host "  arcanea ❯"
    switch ($choice.Trim().ToLowerInvariant()) {
        "1" { Invoke-ArcaneaGateway "dev" }
        "2" { Invoke-ArcaneaGateway "author" }
        "3" { Invoke-ArcaneaGateway "studio" }
        "4" { Invoke-ArcaneaGateway "swarm" }
        "5" { Invoke-ArcaneaGateway "status" }
        "6" { 
            Write-Host "`n  Select Agent Harness:" -ForegroundColor DarkGray
            Write-Host "  [1] Hermes (Native Execution)  [2] Claude (Architecture)" -ForegroundColor White
            Write-Host "  [3] Grok   (Intelligence)       [4] Gemini (Synthesis)" -ForegroundColor White
            $h = Read-Host "`n  harness ❯"
            switch ($h.Trim()) {
                "1" { Invoke-ArcaneaGateway "hermes" }
                "2" { Invoke-ArcaneaGateway "claude" }
                "3" { Invoke-ArcaneaGateway "grok" }
                "4" { Invoke-ArcaneaGateway "agy" }
                default { Invoke-ArcaneaGateway "hermes" }
            }
        }
        "o" { Invoke-ArcaneaGateway "open" }
        "q" { return }
        default {
            if (-not [string]::IsNullOrWhiteSpace($choice)) {
                Invoke-ArcaneaGateway $choice
            }
        }
    }
}

function Show-ArcaneaConstellationStatus {
    Write-Host ""
    Write-Host "✦ Arcanea Constellation Status ✦" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray

    $repos = @(
        "arcanea-ai-app", "arcanea-orchestrator", "arcanea-studio",
        "arcanea-claw", "author-os", "arcanea-ecosystem",
        "gencreator.ai", "arcanea-academy", "arcanea-agent-skills"
    )
    $estateRoot = "C:\Users\frank\starlight\repos"

    foreach ($r in $repos) {
        $p = Join-Path $estateRoot $r
        if (Test-Path $p) {
            Push-Location $p
            try {
                $branch = git branch --show-current 2>$null
                $gitStatus = git status --porcelain 2>$null
                $dirtyCount = if ($gitStatus) { ($gitStatus | Measure-Object).Count } else { 0 }
                $statusColor = if ($dirtyCount -gt 0) { "Yellow" } else { "Green" }
                $badge = if ($dirtyCount -gt 0) { "dirty ($dirtyCount)" } else { "clean" }

                Write-Host "  $($r.PadRight(24)) " -NoNewline -ForegroundColor White
                Write-Host "[$($branch.PadRight(18))] " -NoNewline -ForegroundColor DarkCyan
                Write-Host $badge -ForegroundColor $statusColor
            } finally {
                Pop-Location
            }
        } else {
            Write-Host "  $($r.PadRight(24)) [not cloned]" -ForegroundColor DarkGray
        }
    }
    Write-Host "─────────────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
}

function Show-ArcaneaHelp {
    Write-Host ""
    Write-Host "Arcanea CLI Commands:" -ForegroundColor Cyan
    Write-Host "  arcanea                  Launch the interactive Arcanea Gateway TUI" -ForegroundColor White
    Write-Host "  arcanea dev              Launch local dev server (arcanea-ai-app)" -ForegroundColor White
    Write-Host "  arcanea status           Check git health across all constellation repos" -ForegroundColor White
    Write-Host "  arcanea write            Open Author OS novel writing workspace" -ForegroundColor White
    Write-Host "  arcanea studio           Open Arcanea Studio visual canvas" -ForegroundColor White
    Write-Host "  arcanea swarm            Dispatch Arcanea Orchestrator multi-agent swarm" -ForegroundColor White
    Write-Host "  arcanea claw             Dispatch Arcanea Claw generative media engine" -ForegroundColor White
    Write-Host "  arcanea publish          Launch GenCreator social distribution pipeline" -ForegroundColor White
    Write-Host "  arcanea agent <harness>  Dispatch specific AI harness (hermes, claude, grok, agy)" -ForegroundColor White
    Write-Host "  arcanea open             Open https://arcanea.ai in browser" -ForegroundColor White
    Write-Host ""
}

# Set the global alias and function
Set-Item -Path function:arcanea -Value ${function:Invoke-ArcaneaGateway} -Force
Set-Alias -Name arc -Value arcanea -Scope Global -Force -ErrorAction SilentlyContinue
