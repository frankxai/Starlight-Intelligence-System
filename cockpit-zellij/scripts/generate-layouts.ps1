# cockpit-zellij/scripts/generate-layouts.ps1 -- generate per-project Zellij layouts
#
# Reads cockpit-zellij/layouts/_template.kdl.tmpl
# Substitutes {{PROJECT_NAME}}, {{PROJECT_KEY}}, {{PROJECT_PATH}}, and per-pane
# {{LAUNCH_DISPATCHER}}, {{LAUNCH_CLAUDE}}, {{LAUNCH_CODEX}}, {{LAUNCH_GEMINI},
# {{LAUNCH_OPENCODE}}.
#
# Per-pane launch blocks are resolved from <project-path>/cockpit-profile.json
# when present; otherwise template defaults apply (see PROFILES.md).
#
# Writes cockpit-zellij/layouts/<key>.kdl per requested project. Idempotent.

param(
    [string[]]$Only = @('sis', 'arcanea', 'frankx', 'energy-is'),
    [switch]$All
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
. (Join-Path $RepoRoot 'cockpit-zellij\lib\projects.ps1')

$LayoutsDir = Join-Path $RepoRoot 'cockpit-zellij\layouts'
$TemplatePath = Join-Path $LayoutsDir '_template.kdl.tmpl'

if (-not (Test-Path $TemplatePath)) {
    throw "Template not found at $TemplatePath"
}

$Template = Get-Content $TemplatePath -Raw

# Per-pane defaults applied when profile is absent or omits a pane.
# Match the geometry intent: Dispatcher/Claude/Codex stay as shells
# (manual launch with --resume), Gemini auto-yolos, OpenCode auto-runs.
$PaneDefaults = @{
    dispatcher = @{ command = $null;       args = @() }
    claude     = @{ command = $null;       args = @() }
    codex      = @{ command = $null;       args = @() }
    gemini     = @{ command = 'gemini';    args = @('--yolo') }
    opencode   = @{ command = 'opencode';  args = @() }
}

# Special-case alias keys -> repo paths.
# Used for: (a) repos not in the 'active' set of the audit JSON but still in
# Frank's daily ecosystem (arcanea-flow is stale-classed but ecosystem-active),
# (b) alias keys that don't match a repo name 1:1 (sis, energy-is).
$specialPaths = @{
    'sis'          = $RepoRoot
    'energy-is'    = $RepoRoot
    'arcanea-flow' = 'C:\Users\frank\arcanea-flow'
}

function Format-LaunchBlock {
    param(
        [string]$Command,
        [string[]]$ArgsList
    )
    if (-not $Command) { return '' }
    $argsLine = ''
    if ($ArgsList -and $ArgsList.Count -gt 0) {
        $quotedArgs = ($ArgsList | ForEach-Object { '"' + $_ + '"' }) -join ' '
        $argsLine = "`n            args $quotedArgs"
    }
    return " {`n            command `"$Command`"$argsLine`n        }"
}

function Get-CockpitProfile {
    param(
        [string]$ProjectPath,
        [string]$ProjectKey
    )

    # 1. Repo-owned profile takes precedence (lives in the project's own git history)
    $candidates = @()
    if (Test-Path $ProjectPath) {
        $candidates += (Join-Path $ProjectPath 'cockpit-profile.json')
    }

    # 2. SIS-tracked fallback at cockpit-zellij/profiles/<key>.json
    $sisProfiles = Join-Path $LayoutsDir '..\profiles'
    $candidates += (Join-Path $sisProfiles "$ProjectKey.json")

    foreach ($p in $candidates) {
        if (-not (Test-Path $p)) { continue }
        try {
            return Get-Content $p -Raw | ConvertFrom-Json
        } catch {
            Write-Warning "Failed to parse $p -- continuing: $($_.Exception.Message)"
        }
    }
    return $null
}

function Resolve-PaneLaunch {
    param(
        $Profile,
        [string]$PaneKey
    )
    $defCmd = $PaneDefaults[$PaneKey].command
    $defArgs = $PaneDefaults[$PaneKey].args

    if ($Profile -and $Profile.panes) {
        $pane = $Profile.panes.$PaneKey
        if ($pane -and $pane.command) {
            $cmd = [string]$pane.command
            $argsArr = @()
            if ($pane.args) {
                $argsArr = @($pane.args | ForEach-Object { [string]$_ })
            }
            return Format-LaunchBlock -Command $cmd -ArgsList $argsArr
        }
    }
    return Format-LaunchBlock -Command $defCmd -ArgsList $defArgs
}

$projects = Get-StarlightProjects

if ($All) {
    $keys = @($projects.Keys) + @($specialPaths.Keys) | Sort-Object -Unique
} else {
    $keys = $Only
}

$written = 0
foreach ($key in $keys) {
    $name = $null
    $path = $null

    if ($specialPaths.ContainsKey($key)) {
        $path = $specialPaths[$key]
        $name = $key.ToUpper()
    } elseif ($projects.Contains($key)) {
        $path = $projects[$key].path
        $name = $projects[$key].name
    } else {
        $proj = Get-StarlightProject -Key $key
        if ($proj) {
            $path = $proj.path
            $name = $proj.name
        } else {
            Write-Warning "Project key '$key' not found in audit; skipping."
            continue
        }
    }

    # KDL string literals: backslashes need doubling for Windows paths
    $kdlPath = $path -replace '\\', '\\'

    # Resolve per-pane launch blocks from profile (if any) or defaults
    $profile = Get-CockpitProfile -ProjectPath $path -ProjectKey $key

    $launchDispatcher = Resolve-PaneLaunch -Profile $profile -PaneKey 'dispatcher'
    $launchClaude     = Resolve-PaneLaunch -Profile $profile -PaneKey 'claude'
    $launchCodex      = Resolve-PaneLaunch -Profile $profile -PaneKey 'codex'
    $launchGemini     = Resolve-PaneLaunch -Profile $profile -PaneKey 'gemini'
    $launchOpencode   = Resolve-PaneLaunch -Profile $profile -PaneKey 'opencode'

    $content = $Template `
        -replace '\{\{PROJECT_NAME\}\}', $name `
        -replace '\{\{PROJECT_KEY\}\}',  $key `
        -replace '\{\{PROJECT_PATH\}\}', $kdlPath
    $content = $content.Replace('{{LAUNCH_DISPATCHER}}', $launchDispatcher)
    $content = $content.Replace('{{LAUNCH_CLAUDE}}',     $launchClaude)
    $content = $content.Replace('{{LAUNCH_CODEX}}',      $launchCodex)
    $content = $content.Replace('{{LAUNCH_GEMINI}}',     $launchGemini)
    $content = $content.Replace('{{LAUNCH_OPENCODE}}',   $launchOpencode)

    $outPath = Join-Path $LayoutsDir "$key.kdl"
    $content | Out-File -FilePath $outPath -Encoding utf8
    $profileLabel = if ($profile) { ' [profile]' } else { '' }
    Write-Host "Wrote $outPath$profileLabel"
    $written++
}

Write-Host ''
Write-Host "Generated $written layouts."
