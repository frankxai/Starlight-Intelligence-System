# cockpit-zellij/test/smoke.ps1 -- read-only verification harness
#
# Runs in CI or locally. Exits non-zero on first failure.

param([switch]$Verbose)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$script:failures = @()

function Test-Assert {
    param([string]$Name, [scriptblock]$Test)
    try {
        $result = & $Test
        if ($result -eq $false) { throw "assertion returned false" }
        Write-Host "  PASS: $Name" -ForegroundColor Green
    } catch {
        $script:failures += @{ Name = $Name; Error = $_.Exception.Message }
        Write-Host "  FAIL: $Name -- $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host '=== Cockpit smoke tests ==='
Write-Host ''

Test-Assert 'audit JSON present' {
    Test-Path (Join-Path $RepoRoot 'memory\_audit\repo-portfolio-2026-05-04.json')
}

Test-Assert 'projects.ps1 loads' {
    . (Join-Path $RepoRoot 'cockpit-zellij\lib\projects.ps1')
    $p = Get-StarlightProjects
    $p.Count -gt 0
}

$expectedLayouts = @('starlight-orchestrator', 'sis', 'arcanea', 'frankx', 'energy-is')
foreach ($layoutKey in $expectedLayouts) {
    $captured = $layoutKey  # snapshot for closure
    Test-Assert "layout $captured.kdl exists + non-zero" {
        $f = Join-Path $RepoRoot "cockpit-zellij\layouts\$captured.kdl"
        (Test-Path $f) -and ((Get-Item $f).Length -gt 100)
    }.GetNewClosure()
}

foreach ($layoutKey in @('sis', 'arcanea', 'frankx', 'energy-is')) {
    $captured = $layoutKey
    Test-Assert "layout $captured.kdl has cwd" {
        $content = Get-Content (Join-Path $RepoRoot "cockpit-zellij\layouts\$captured.kdl") -Raw
        $content -match 'cwd='
    }.GetNewClosure()
}

Test-Assert 'aliases load' {
    . (Join-Path $RepoRoot 'cockpit-zellij\scripts\zellij-aliases.ps1') 6>$null
    (Get-Command arc -ErrorAction SilentlyContinue) -ne $null
}

Test-Assert 'arc-list-projects function defined' {
    . (Join-Path $RepoRoot 'cockpit-zellij\scripts\zellij-aliases.ps1') 6>$null
    (Get-Command arc-list-projects -ErrorAction SilentlyContinue) -ne $null
}

Test-Assert 'arc-list-projects actually runs without error' {
    . (Join-Path $RepoRoot 'cockpit-zellij\scripts\zellij-aliases.ps1') 6>$null
    try {
        $output = arc-list-projects 6>$null | Out-String
        $output.Length -gt 0
    } catch {
        $false
    }
}

Test-Assert 'template not regenerated as layout' {
    -not (Test-Path (Join-Path $RepoRoot 'cockpit-zellij\layouts\_template.kdl'))
}

Write-Host ''
if ($script:failures.Count -eq 0) {
    Write-Host "=== ALL PASS ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=== $($script:failures.Count) FAILURES ===" -ForegroundColor Red
    foreach ($f in $script:failures) {
        Write-Host "  - $($f.Name): $($f.Error)" -ForegroundColor Red
    }
    exit 1
}
