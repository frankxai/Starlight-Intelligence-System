# sync-mcp-portfolio.ps1 -- read-only inventory and audit of registered MCP/Science repositories.
#
# Usage:
#   pwsh tools/sync-mcp-portfolio.ps1
#
# Idempotent. Reads tools/mcp-registry.csv and checks local filesystem.

param(
    [string]$RegistryPath = (Join-Path $PSScriptRoot 'mcp-registry.csv'),
    [string]$SearchDir1  = 'C:\Users\frank\starlight\repos',
    [string]$SearchDir2  = 'C:\Users\frank',
    [string]$SearchDir3  = 'C:\Users\frank\OneDrive\Dokumente'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $RegistryPath)) {
    Write-Error "CSV Registry not found at: $RegistryPath"
    exit 1
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "        STARLIGHT SOVEREIGN MCP REPOSITORY AUDIT          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Loading registry: $RegistryPath" -ForegroundColor Gray

$registry = Import-Csv -Path $RegistryPath
$report = @()

foreach ($row in $registry) {
    $repoName = $row.RepositoryName
    $targetPath = $null
    $status = "Missing"
    $branch = "N/A"
    $uncommitted = "N/A"

    # Search in common repo paths
    $pathsToTest = @(
        (Join-Path $SearchDir1 $repoName),
        (Join-Path $SearchDir2 $repoName),
        (Join-Path $SearchDir3 $repoName)
    )

    foreach ($p in $pathsToTest) {
        if (Test-Path (Join-Path $p ".git")) {
            $targetPath = $p
            $status = "Located"
            break
        }
    }

    if ($null -ne $targetPath) {
        Push-Location $targetPath
        try {
            $branchName = & git branch --show-current 2>$null
            if ($LASTEXITCODE -eq 0 -and $branchName) {
                $branch = $branchName.Trim()
            }
            $changes = & git status --short 2>$null
            if ($LASTEXITCODE -eq 0) {
                $uncommittedCount = (@($changes) | Where-Object { $_ -ne '' }).Count
                $uncommitted = "$uncommittedCount files"
            }
        } catch {
            $status = "Corrupt/AccessError"
        } finally {
            Pop-Location
        }
    }

    $report += [PSCustomObject]@{
        Repository   = $repoName
        Role         = $row.Role
        Tier         = $row.Tier
        LocalStatus  = $status
        ActiveBranch = $branch
        Uncommitted  = $uncommitted
        Scope        = $row.ExecutionScope
    }
}

Write-Host ""
$report | Format-Table -AutoSize
Write-Host "Audit completed. Run 'git clone <GitHubURL>' inside your repos folder to fetch missing integrations." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
