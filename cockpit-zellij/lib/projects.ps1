# cockpit-zellij/lib/projects.ps1 -- canonical project list from audit JSON
#
# Returns hashtable of project-key -> { key, name, path, cluster, days_since, class }
# Filter: only 'active' (<= 14 days). Sorted by days_since asc.

function Get-StarlightProjects {
    param(
        [string]$AuditJsonPath = (Join-Path $PSScriptRoot '..\..\memory\_audit\repo-portfolio-2026-05-04.json')
    )

    if (-not (Test-Path $AuditJsonPath)) {
        Write-Warning "Audit JSON not found at $AuditJsonPath. Run tools/audit-repo-portfolio.ps1 first."
        return @{}
    }

    $audit = Get-Content $AuditJsonPath -Raw | ConvertFrom-Json
    $result = [ordered]@{}

    foreach ($repo in $audit.repos) {
        if ($repo.class -ne 'active') { continue }
        $key = $repo.name.ToLower() -replace '\.', '-'
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
    $matches = $projects.Keys | Where-Object { $_ -like "*$Key*" }
    if ($matches.Count -eq 1) { return $projects[$matches[0]] }
    return $null
}
