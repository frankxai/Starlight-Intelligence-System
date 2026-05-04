# cockpit-zellij/scripts/generate-layouts.ps1 -- generate per-project Zellij layouts
#
# Reads cockpit-zellij/layouts/_template.kdl.tmpl
# Substitutes {{PROJECT_NAME}}, {{PROJECT_KEY}}, {{PROJECT_PATH}}
# Writes cockpit-zellij/layouts/<key>.kdl per requested project
#
# Idempotent. Safe to re-run.

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

# Special-case alias keys -> repo paths (for keys not in audit, like 'sis' / 'energy-is')
$specialPaths = @{
    'sis'       = $RepoRoot
    'energy-is' = $RepoRoot
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

    $content = $Template `
        -replace '\{\{PROJECT_NAME\}\}', $name `
        -replace '\{\{PROJECT_KEY\}\}',  $key `
        -replace '\{\{PROJECT_PATH\}\}', $kdlPath

    $outPath = Join-Path $LayoutsDir "$key.kdl"
    $content | Out-File -FilePath $outPath -Encoding utf8
    Write-Host "Wrote $outPath"
    $written++
}

Write-Host ''
Write-Host "Generated $written layouts."
