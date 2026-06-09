# audit-repo-portfolio.ps1 -- read-only inventory of all git repos under user home.
#
# Output:
#   docs/ops/REPO-PORTFOLIO-AUDIT-<YYYY-MM-DD>.md
#   memory/_audit/repo-portfolio-<YYYY-MM-DD>.json
#
# Idempotent. Re-run = same classification given same inputs.

param(
    [string]$ScanRoot1 = 'C:\Users\frank',
    [string]$ScanRoot2 = 'C:\Users\frank\Arcanea',
    [string]$RepoRoot  = 'C:\Users\frank\Starlight-Intelligence-System',
    [int]$ActiveDays   = 14,
    [int]$StaleDays    = 90
)

$ErrorActionPreference = 'Stop'
$today = Get-Date -Format 'yyyy-MM-dd'
$nowIso = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

function Get-RepoMetrics {
    param([string]$Path)
    $metrics = [ordered]@{
        name              = Split-Path $Path -Leaf
        path              = $Path
        class             = 'unknown'
        last_commit       = $null
        days_since        = $null
        branches_local    = 0
        branches_remote   = 0
        uncommitted_files = 0
        ahead_of_origin   = 0
        has_readme        = $false
        has_package_json  = $false
        size_mb           = 0
        consolidation_cluster = $null
    }

    Push-Location $Path
    try {
        $lastCommit = & git log -1 --format='%cI' 2>$null
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($lastCommit)) {
            return $metrics
        }
        $metrics.last_commit = $lastCommit.Trim()
        $commitDate = [datetime]::Parse($metrics.last_commit)
        $metrics.days_since = [int]((Get-Date) - $commitDate).TotalDays

        $localBranches = & git branch 2>$null
        $metrics.branches_local = (@($localBranches) | Where-Object { $_ -ne '' }).Count

        $remoteBranches = & git branch -r 2>$null
        $metrics.branches_remote = (@($remoteBranches) | Where-Object { $_ -ne '' -and $_ -notmatch '->' }).Count

        $uncommitted = & git status --short 2>$null
        $metrics.uncommitted_files = (@($uncommitted) | Where-Object { $_ -ne '' }).Count

        $ahead = & git rev-list '@{upstream}..HEAD' --count 2>$null
        if ($LASTEXITCODE -eq 0 -and $ahead) {
            $metrics.ahead_of_origin = [int]$ahead
        }
    } catch {
        # graceful: leave defaults
    } finally {
        Pop-Location
    }

    $metrics.has_readme = (Test-Path (Join-Path $Path 'README.md')) -or (Test-Path (Join-Path $Path 'readme.md'))
    $metrics.has_package_json = (Test-Path (Join-Path $Path 'package.json')) -or (Test-Path (Join-Path $Path 'pyproject.toml'))

    try {
        $bytes = (Get-ChildItem -Path $Path -Recurse -File -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notmatch '\\(node_modules|\.next|\.venv|dist|build|\.pytest_cache|target|out)\\' } |
            Measure-Object -Property Length -Sum).Sum
        if ($bytes) { $metrics.size_mb = [math]::Round($bytes / 1MB, 1) }
    } catch {
        $metrics.size_mb = 0
    }

    if ($null -eq $metrics.days_since) {
        $metrics.class = 'unknown'
    } elseif ($metrics.days_since -le $ActiveDays) {
        $metrics.class = 'active'
    } elseif ($metrics.days_since -le $StaleDays) {
        $metrics.class = 'stale'
    } elseif ($metrics.uncommitted_files -eq 0 -and $metrics.ahead_of_origin -eq 0) {
        $metrics.class = 'archive-candidate'
    } else {
        $metrics.class = 'dormant'
    }

    $name = $metrics.name.ToLower()
    $prefixes = @('frankx', 'arcanea', 'jarvis', 'starlight', 'claude')
    foreach ($p in $prefixes) {
        if ($name.StartsWith($p) -or $name -eq $p -or $name.StartsWith("$p-") -or $name.StartsWith("$p.")) {
            $metrics.consolidation_cluster = $p
            break
        }
    }

    return $metrics
}

function Find-Repos {
    param([string]$Root)
    if (-not (Test-Path $Root)) { return @() }
    Get-ChildItem -Path $Root -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName '.git') } |
        ForEach-Object { $_.FullName }
}

Write-Host "Scanning $ScanRoot1 + $ScanRoot2 ..."
$repoPaths = @()
$repoPaths += Find-Repos $ScanRoot1
$repoPaths += Find-Repos $ScanRoot2
$repoPaths = $repoPaths | Sort-Object -Unique
Write-Host "Found $($repoPaths.Count) repos"

$repos = @()
$i = 0
foreach ($p in $repoPaths) {
    $i++
    Write-Host "[$i/$($repoPaths.Count)] $p"
    $repos += Get-RepoMetrics -Path $p
}

$byClass = @{}
foreach ($r in $repos) {
    $c = $r.class
    if (-not $byClass.ContainsKey($c)) { $byClass[$c] = 0 }
    $byClass[$c]++
}

$clusters = @{}
foreach ($r in $repos) {
    if ($r.consolidation_cluster) {
        $k = $r.consolidation_cluster
        if (-not $clusters.ContainsKey($k)) { $clusters[$k] = @() }
        $clusters[$k] += $r.name
    }
}

$jsonOut = [ordered]@{
    generated_at = $nowIso
    scan_roots = @($ScanRoot1, $ScanRoot2)
    thresholds = @{ active_days = $ActiveDays; stale_days = $StaleDays }
    repo_count = $repos.Count
    by_class = $byClass
    consolidation_clusters = $clusters
    repos = $repos
}
$jsonPath = Join-Path $RepoRoot "memory\_audit\repo-portfolio-$today.json"
$null = New-Item -ItemType Directory -Force -Path (Split-Path $jsonPath)
$jsonOut | ConvertTo-Json -Depth 6 | Out-File -FilePath $jsonPath -Encoding utf8
Write-Host "JSON: $jsonPath"

$md = New-Object System.Text.StringBuilder
[void]$md.AppendLine("# Repo Portfolio Audit -- $today")
[void]$md.AppendLine('')
[void]$md.AppendLine("> Read-only inventory of all git repos under ``$ScanRoot1`` and ``$ScanRoot2``.")
[void]$md.AppendLine("> Generated: $nowIso")
[void]$md.AppendLine('')

[void]$md.AppendLine('## TL;DR')
[void]$md.AppendLine('')
[void]$md.AppendLine("- **Total repos:** $($repos.Count)")
foreach ($k in @('active','stale','dormant','archive-candidate','unknown')) {
    if ($byClass.ContainsKey($k)) {
        [void]$md.AppendLine("- **${k}:** $($byClass[$k])")
    }
}
[void]$md.AppendLine('')

if ($clusters.Count -gt 0) {
    [void]$md.AppendLine('### Consolidation clusters')
    [void]$md.AppendLine('')
    foreach ($k in ($clusters.Keys | Sort-Object)) {
        $members = $clusters[$k] | Sort-Object
        $count = $members.Count
        $list = $members -join ', '
        [void]$md.AppendLine("- **${k}-*** ($count repos): $list")
    }
    [void]$md.AppendLine('')
}

function Write-RepoTable {
    param($md, $repos, $title, $class)
    $rows = $repos | Where-Object { $_.class -eq $class } | Sort-Object days_since
    if ($rows.Count -eq 0) { return }
    [void]$md.AppendLine("## $title ($($rows.Count))")
    [void]$md.AppendLine('')
    [void]$md.AppendLine('| Repo | Days | Branches L/R | Uncommitted | Ahead | Size MB | Cluster |')
    [void]$md.AppendLine('|---|---:|---:|---:|---:|---:|---|')
    foreach ($r in $rows) {
        $cluster = if ($r.consolidation_cluster) { $r.consolidation_cluster } else { '-' }
        [void]$md.AppendLine("| ``$($r.name)`` | $($r.days_since) | $($r.branches_local)/$($r.branches_remote) | $($r.uncommitted_files) | $($r.ahead_of_origin) | $($r.size_mb) | $cluster |")
    }
    [void]$md.AppendLine('')
}

Write-RepoTable $md $repos 'Active (<= 14 days)' 'active'
Write-RepoTable $md $repos 'Stale (15-90 days)' 'stale'
Write-RepoTable $md $repos 'Dormant (>90 days, has work)' 'dormant'
Write-RepoTable $md $repos 'Archive-candidates (>90 days, clean)' 'archive-candidate'
Write-RepoTable $md $repos 'Unknown / no commits' 'unknown'

if ($clusters.Count -gt 0) {
    [void]$md.AppendLine('## Consolidation cluster detail')
    [void]$md.AppendLine('')
    foreach ($k in ($clusters.Keys | Sort-Object)) {
        [void]$md.AppendLine("### Cluster: ``${k}-*``")
        [void]$md.AppendLine('')
        [void]$md.AppendLine('| Repo | Class | Days | Uncommitted | Ahead |')
        [void]$md.AppendLine('|---|---|---:|---:|---:|')
        $members = $repos | Where-Object { $_.consolidation_cluster -eq $k } | Sort-Object days_since
        foreach ($r in $members) {
            [void]$md.AppendLine("| ``$($r.name)`` | $($r.class) | $($r.days_since) | $($r.uncommitted_files) | $($r.ahead_of_origin) |")
        }
        [void]$md.AppendLine('')
    }
}

[void]$md.AppendLine('## Action items')
[void]$md.AppendLine('')
[void]$md.AppendLine('### Top archive candidates (clean dormants)')
$archiveTop = $repos | Where-Object { $_.class -eq 'archive-candidate' } | Sort-Object -Property days_since -Descending | Select-Object -First 5
if ($archiveTop.Count -eq 0) {
    [void]$md.AppendLine('- _none -- all dormants have uncommitted work or unpushed commits._')
} else {
    foreach ($r in $archiveTop) {
        $days = $r.days_since
        $name = $r.name
        [void]$md.AppendLine("- ``$name`` -- $days days dormant, clean. Safe to archive.")
    }
}
[void]$md.AppendLine('')

[void]$md.AppendLine('### Consolidation clusters needing decision')
foreach ($k in ($clusters.Keys | Sort-Object)) {
    $count = $clusters[$k].Count
    if ($count -ge 3) {
        [void]$md.AppendLine("- **${k}-*** has $count repos -- pick canonical, retire siblings.")
    }
}
[void]$md.AppendLine('')

[void]$md.AppendLine('### Dormant with uncommitted work (recover or discard)')
$dormantWithWork = $repos | Where-Object { $_.class -eq 'dormant' -and ($_.uncommitted_files -gt 0 -or $_.ahead_of_origin -gt 0) } | Sort-Object -Property days_since -Descending | Select-Object -First 5
if ($dormantWithWork.Count -eq 0) {
    [void]$md.AppendLine('- _none._')
} else {
    foreach ($r in $dormantWithWork) {
        $days = $r.days_since
        $name = $r.name
        $unc = $r.uncommitted_files
        $ahead = $r.ahead_of_origin
        [void]$md.AppendLine("- ``$name`` -- $days days dormant, $unc uncommitted, $ahead unpushed. Decide: ship or discard.")
    }
}
[void]$md.AppendLine('')

[void]$md.AppendLine('---')
[void]$md.AppendLine('')
[void]$md.AppendLine("*Built on SIP. Generated by ``tools/audit-repo-portfolio.ps1``. Re-run anytime -- output is deterministic given same inputs.*")

$mdPath = Join-Path $RepoRoot "docs\ops\REPO-PORTFOLIO-AUDIT-$today.md"
$null = New-Item -ItemType Directory -Force -Path (Split-Path $mdPath)
$md.ToString() | Out-File -FilePath $mdPath -Encoding utf8
Write-Host "Markdown: $mdPath"

Write-Host ''
Write-Host '=== summary ==='
foreach ($k in ($byClass.Keys | Sort-Object)) {
    $cnt = $byClass[$k]
    Write-Host ("  {0,-20} {1}" -f $k, $cnt)
}
Write-Host "  total                $($repos.Count)"
