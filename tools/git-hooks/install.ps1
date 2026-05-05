# Install Starlight git hooks — point core.hooksPath at tools/git-hooks/
#
# Run once per clone:
#   pwsh tools/git-hooks/install.ps1
#
# Idempotent.

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Push-Location $RepoRoot

try {
    $current = git config --get core.hooksPath
    if ($current -eq 'tools/git-hooks') {
        Write-Host "✓ core.hooksPath already set to tools/git-hooks" -ForegroundColor Green
    } else {
        git config core.hooksPath tools/git-hooks
        Write-Host "✓ core.hooksPath set to tools/git-hooks" -ForegroundColor Green
    }

    # Verify the hook is present + executable bit set (git on Windows reads bash hooks via mingw)
    $hookPath = Join-Path $RepoRoot 'tools\git-hooks\pre-commit'
    if (-not (Test-Path $hookPath)) {
        Write-Warning "pre-commit hook missing at $hookPath"
        exit 1
    }

    Write-Host ""
    Write-Host "Installed hooks:"
    Get-ChildItem (Join-Path $RepoRoot 'tools\git-hooks') -File |
        Where-Object { $_.Name -notmatch '\.(ps1|md)$' } |
        ForEach-Object { Write-Host "  $($_.Name)" }

    Write-Host ""
    Write-Host "Bypass any hook: git commit --no-verify" -ForegroundColor DarkGray
} finally {
    Pop-Location
}
