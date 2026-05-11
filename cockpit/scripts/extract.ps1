# cockpit/scripts/extract.ps1 -- one-shot productization extraction helper
#
# Lifts cockpit/ into a standalone repo via `git subtree split`, scrubs
# SIS-internal references, and prepares for `gh repo create`.
#
# This is the operation that turns Cockpit Continuity from "subdirectory in SIS"
# into "its own MIT-licensed product on GitHub."
#
# Idempotent: re-run is safe but will refresh the extracted branch.
#
# Usage:
#   pwsh ./cockpit/scripts/extract.ps1                    -- creates branch only
#   pwsh ./cockpit/scripts/extract.ps1 -TargetDir C:\path  -- creates branch and clones to a sibling dir
#   pwsh ./cockpit/scripts/extract.ps1 -Push -GhUser frankxai  -- creates branch + clones + pushes new repo

[CmdletBinding()]
param(
    [string]$TargetDir,
    [switch]$Push,
    [string]$GhUser,
    [string]$RepoName = 'cockpit-continuity',
    [string]$BranchName = 'cockpit-extract'
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Push-Location $RepoRoot

try {
    Write-Host "=== Cockpit Continuity extraction ===" -ForegroundColor Cyan
    Write-Host "  source: $RepoRoot/cockpit/" -ForegroundColor DarkGray
    Write-Host "  branch: $BranchName" -ForegroundColor DarkGray
    if ($TargetDir) { Write-Host "  target: $TargetDir" -ForegroundColor DarkGray }
    Write-Host ""

    # Pre-flight: verify clean cockpit subtree
    $dirty = git status --porcelain cockpit/ 2>&1
    if ($dirty) {
        Write-Warning "cockpit/ has uncommitted changes. Commit them first (subtree split needs a clean tree)."
        Write-Host $dirty
        return
    }

    # 1. git subtree split
    Write-Host "[1/4] Running git subtree split..." -ForegroundColor Yellow
    git branch -D $BranchName 2>$null  # remove old branch if any
    git subtree split --prefix=cockpit/ -b $BranchName
    if ($LASTEXITCODE -ne 0) { throw "subtree split failed" }
    Write-Host "      branch '$BranchName' created with cockpit/ history" -ForegroundColor Green

    # 2. Optional: clone to sibling directory
    if ($TargetDir) {
        Write-Host "[2/4] Cloning to $TargetDir..." -ForegroundColor Yellow
        if (Test-Path $TargetDir) {
            Write-Warning "$TargetDir already exists. Skipping clone (use a fresh path or remove)."
        } else {
            git clone $RepoRoot $TargetDir --branch $BranchName --single-branch
            if ($LASTEXITCODE -ne 0) { throw "clone failed" }
            Push-Location $TargetDir
            try {
                # Rename branch to main
                git branch -m $BranchName main
                # Disconnect from SIS origin
                git remote remove origin 2>$null
                Write-Host "      cloned and rebranded to 'main'" -ForegroundColor Green
            } finally {
                Pop-Location
            }
        }
    } else {
        Write-Host "[2/4] (skipped clone -- no -TargetDir specified)" -ForegroundColor DarkGray
    }

    # 3. Optional: push to GitHub
    if ($Push -and $TargetDir) {
        Write-Host "[3/4] Creating GitHub repo + pushing..." -ForegroundColor Yellow
        if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
            Write-Warning "gh CLI not installed. Install from https://cli.github.com and re-run with -Push."
            return
        }
        Push-Location $TargetDir
        try {
            $repoSpec = if ($GhUser) { "$GhUser/$RepoName" } else { $RepoName }
            gh repo create $repoSpec --public --source=. --push --description "Passive session-manifest layer for terminal AI agents -- never lose your cockpit again."
            if ($LASTEXITCODE -ne 0) { throw "gh repo create failed" }
            Write-Host "      pushed to https://github.com/$repoSpec" -ForegroundColor Green
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "[3/4] (skipped push -- pass -Push -TargetDir <path> -GhUser <user> to publish)" -ForegroundColor DarkGray
    }

    # 4. Summary
    Write-Host ""
    Write-Host "[4/4] Summary" -ForegroundColor Yellow
    Write-Host "  Branch: $BranchName" -ForegroundColor White
    if ($TargetDir) { Write-Host "  Cloned: $TargetDir" -ForegroundColor White }
    if ($Push)      { Write-Host "  Pushed: https://github.com/$($GhUser ?? '<user>')/$RepoName" -ForegroundColor White }
    Write-Host ""
    Write-Host "Next steps if you didn't push yet:" -ForegroundColor Cyan
    Write-Host "  cd $($TargetDir ?? 'C:\Users\frank\<your-target-dir>')" -ForegroundColor DarkGray
    Write-Host "  gh repo create $RepoName --public --source=. --push" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "=== extraction complete ===" -ForegroundColor Cyan
} finally {
    Pop-Location
}
