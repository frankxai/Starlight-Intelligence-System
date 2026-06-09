# cockpit-zellij/lib/projects.ps1 -- canonical project list from audit JSON
#
# Returns hashtable of project-key -> { key, name, path, cluster, days_since, class }
# Filter: only 'active' (<= 14 days). Sorted by days_since asc.

function Get-LatestPortfolioAuditPath {
    # Glob for the most recent repo-portfolio-*.json so daily cron writes
    # are picked up automatically. Falls back to the historical 2026-05-04
    # file if no newer audits exist yet.
    $auditDir = Join-Path $PSScriptRoot '..\..\memory\_audit'
    if (-not (Test-Path $auditDir)) { return $null }
    $latest = Get-ChildItem -Path $auditDir -Filter 'repo-portfolio-*.json' -File -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        Select-Object -First 1
    if ($latest) { return $latest.FullName }
    return $null
}

function Get-StarlightProjects {
    param(
        [string]$AuditJsonPath = (Get-LatestPortfolioAuditPath)
    )

    if (-not $AuditJsonPath -or -not (Test-Path $AuditJsonPath)) {
        Write-Warning "No repo-portfolio-*.json found in memory/_audit/. Run tools/audit-repo-portfolio.ps1 first."
        return @{}
    }

    $audit = Get-Content $AuditJsonPath -Raw | ConvertFrom-Json
    $result = [ordered]@{}

    foreach ($repo in $audit.repos) {
        if ($repo.class -ne 'active') { continue }
        # Skip config/hidden dirs (start with dot)
        if ($repo.name.StartsWith('.')) { continue }
        # Build key: lowercase, replace dots with dashes, then strip any leading dot/dash
        $key = $repo.name.ToLower() -replace '\.', '-'
        $key = $key -replace '^[\.\-]+', ''
        if (-not $key) { continue }
        $result[$key] = [PSCustomObject]@{
            key        = $key
            name       = $repo.name
            path       = $repo.path
            cluster    = $repo.consolidation_cluster
            days_since = $repo.days_since
            class      = $repo.class
        }
    }

    return $result
}

function Get-StarlightProject {
    param([string]$Key)
    $projects = Get-StarlightProjects
    if ($projects.Contains($Key)) { return $projects[$Key] }
    # Note: avoid $matches (PS automatic variable populated by -match)
    $candidates = $projects.Keys | Where-Object { $_ -like "*$Key*" }
    if ($candidates.Count -eq 1) { return $projects[$candidates[0]] }
    return $null
}
