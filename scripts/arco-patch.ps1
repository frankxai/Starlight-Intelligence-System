#Requires -Version 7.0
<#
.SYNOPSIS
  Patch global @arcanea/orchestrator for Grok surface + Codex research.quick resolution.
  Idempotent — safe to re-run after npm updates (re-apply as needed).
#>
[CmdletBinding()]
param([switch]$WhatIf)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$orchestratorRoot = Join-Path $env:APPDATA 'npm\node_modules\@arcanea\orchestrator'
$routerSpec = Join-Path $orchestratorRoot 'node_modules\@arcanea\router-spec\models.yaml'
$runtimesJs = Join-Path $orchestratorRoot 'dist\runtimes.js'
$configYaml = Join-Path $env:USERPROFILE '.arcanea\config.yaml'

if (-not (Test-Path $routerSpec)) { throw "router-spec not found: $routerSpec" }
if (-not (Test-Path $runtimesJs)) { throw "runtimes.js not found: $runtimesJs" }

# --- 1. models.yaml: grok model + surfaces + codex research.quick fix ---
$yaml = Get-Content $routerSpec -Raw

if ($yaml -notmatch 'grok-4:') {
    $grokModel = @'

  grok-4:
    provider: xai
    family: grok
    context: 128000
    tier: byok
    strengths: [fast, shell-automation, real-time-reasoning]
    aliases: [grok-2, grok-beta]
'@
    $yaml = $yaml -replace '(  gpt-5-nano:\r?\n(?:.*\r?\n)*?    strengths:.*\r?\n)', "`$1$grokModel`n"
    Write-Host 'Added grok-4 model to router-spec' -ForegroundColor Green
}

if ($yaml -notmatch 'grok-sis:') {
    $grokSurfaces = @'

  grok-sis:
    description: Grok CLI overlay for Starlight Intelligence System. xAI BYOK / OAuth.
    prefer: byok
    authContext: [byok]
    taskOverrides:
      research.quick: [grok-4, gpt-5]
      code.debug: [grok-4]
      nav.fast: [grok-4]

  grok-arcanea:
    description: Grok CLI overlay. xAI reasoning lane for quick tasks + shell automation.
    prefer: byok
    authContext: [byok]
    taskOverrides:
      research.quick: [grok-4]
      nav.fast: [grok-4]
'@
    $yaml = $yaml -replace '(  web\.models-page:\r?\n(?:.*\r?\n)*?    authContext: \[\]\r?\n)', "`$1$grokSurfaces`n"
    Write-Host 'Added grok-sis + grok-arcanea surfaces' -ForegroundColor Green
}

if ($yaml -notmatch 'research\.quick: \[gpt-5\]') {
    $yaml = $yaml -replace '(  codex-arcanea:\r?\n(?:.*\r?\n)*?    taskOverrides:\r?\n)', "`$1      research.quick: [gpt-5]`n"
    Write-Host 'Added codex-arcanea research.quick override' -ForegroundColor Green
}

if ($yaml -notmatch 'grok-cli:') {
    $grokDelegation = @'

  grok-cli:
    binary: grok
    useFor: [research.quick, nav.fast]
    rationale: Grok CLI for fast status checks and shell automation via -p headless mode.
'@
    $yaml = $yaml -replace '(  agent-orchestrator:\r?\n(?:.*\r?\n)*?    rationale:.*\r?\n)', "`$1$grokDelegation`n"
    Write-Host 'Added grok-cli delegation entry' -ForegroundColor Green
}

if (-not $WhatIf) { Set-Content -Path $routerSpec -Value $yaml -Encoding UTF8 -NoNewline }

# --- 2. runtimes.js: grok runtime ---
$rt = Get-Content $runtimesJs -Raw
if ($rt -notmatch "grok:") {
    $grokRuntime = @'
    grok: {
        id: 'grok',
        binary: 'grok',
        // `grok -p "<prompt>" --cwd . --disable-web-search` — headless single-turn.
        argv: (_modelId, prompt) => ['-p', prompt, '--disable-web-search', '--max-turns', '8', '--output-format', 'plain'],
    },
'@
    $rt = $rt -replace '(    gemini: \{[^}]+\},)', "`$1`n$grokRuntime"
    if ($rt -notmatch "case 'xai'") {
        $rt = $rt -replace "(        case 'google':\r?\n            return 'gemini';)", "`$1`n        case 'xai':`n            return 'grok';"
    }
    if (-not $WhatIf) { Set-Content -Path $runtimesJs -Value $rt -Encoding UTF8 -NoNewline }
    Write-Host 'Patched runtimes.js with grok runtime' -ForegroundColor Green
}

# --- 3. ~/.arcanea/config.yaml: grok auth ---
if (Test-Path $configYaml) {
    $cfg = Get-Content $configYaml -Raw
    if ($cfg -notmatch 'grok:') {
        $stamp = (Get-Date).ToUniversalTime().ToString('o')
        $grokAuth = @"

  grok:
    installed: true
    tier: byok
    checkedAt: $stamp
"@
        $cfg = $cfg -replace '(  gemini:\r?\n(?:.*\r?\n)*?    checkedAt:.*\r?\n)', "`$1$grokAuth"
        if (-not $WhatIf) { Set-Content -Path $configYaml -Value $cfg -Encoding UTF8 -NoNewline }
        Write-Host 'Added grok auth to ~/.arcanea/config.yaml' -ForegroundColor Green
    }
}

Write-Host "`nArco patch complete. Verify with:" -ForegroundColor Cyan
Write-Host '  arco explain research.quick --surface grok-sis' -ForegroundColor DarkGray
Write-Host '  arco explain research.quick --surface codex-arcanea' -ForegroundColor DarkGray
Write-Host '  arco run --task research.quick --surface grok-sis --dry-run "ping"' -ForegroundColor DarkGray