<#
.SYNOPSIS
  Read-only machine audit: every git repo + worktree under a root, classified into action buckets.

.DESCRIPTION
  Never mutates a working tree. The only network action is `git fetch --prune` when -Fetch is passed.
  Output: a console table plus JSON + Markdown reports in -OutDir (default ~/.starlight/audit, outside any repo).

  Buckets
    A  clean, in sync                       -> leave alone
    B  clean, behind only                   -> safe `git pull --ff-only`
    C  clean, ahead (unpushed commits)      -> push to agent/<harness>/<scope>, draft PR
    D  dirty (uncommitted work)             -> triage by owner; never auto-discard
    E  diverged (ahead AND behind), or far behind (>= -FarBehind), or detached/unborn/no upstream -> Frank decides

  Worktree verdict
    prunable  clean + branch merged into default branch + not the main checkout
    keep      everything else

.EXAMPLE
  pwsh scripts/machine-audit.ps1 -Fetch
#>
[CmdletBinding()]
param(
  [string]$Root = $HOME,
  [string]$OutDir = (Join-Path $HOME '.starlight\audit'),
  [switch]$Fetch,
  [int]$FarBehind = 50,
  [int]$StaleDays = 30
)

$ErrorActionPreference = 'Continue'

function Invoke-Git([string]$Path, [string[]]$GitArgs) {
  $out = & git -C $Path @GitArgs 2>$null
  if ($LASTEXITCODE -ne 0) { return $null }
  return $out
}

function Get-DefaultBranchRef([string]$Path) {
  $head = Invoke-Git $Path @('symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD')
  if ($head) { return ($head -replace '^refs/remotes/', '') }
  foreach ($c in 'origin/main', 'origin/master', 'origin/dev') {
    if (Invoke-Git $Path @('rev-parse', '--verify', '--quiet', $c)) { return $c }
  }
  return $null
}

function Get-RepoState([string]$Path) {
  $branch = Invoke-Git $Path @('rev-parse', '--abbrev-ref', 'HEAD')
  $detached = (-not $branch) -or $branch -eq 'HEAD'
  $upstream = Invoke-Git $Path @('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}')
  $ahead = 0; $behind = 0
  if ($upstream) {
    $counts = Invoke-Git $Path @('rev-list', '--left-right', '--count', '@{u}...HEAD')
    if ($counts) {
      $parts = ("$counts" -split '\s+') | Where-Object { $_ -ne '' }
      if ($parts.Count -ge 2) { $behind = [int]$parts[0]; $ahead = [int]$parts[1] }
    }
  }
  $porcelain = @(Invoke-Git $Path @('status', '--porcelain'))
  $porcelain = @($porcelain | Where-Object { $_ })
  $untracked = @($porcelain | Where-Object { "$_".StartsWith('??') }).Count
  $tracked = $porcelain.Count - $untracked
  $stash = @(Invoke-Git $Path @('stash', 'list') | Where-Object { $_ }).Count
  $lastEpoch = Invoke-Git $Path @('log', '-1', '--format=%ct')
  $ageDays = $null
  if ($lastEpoch) { $ageDays = [int](([DateTimeOffset]::UtcNow.ToUnixTimeSeconds() - [int64]$lastEpoch) / 86400) }

  [pscustomobject]@{
    path = $Path; branch = $(if ($detached) { '(detached)' } else { $branch })
    detached = $detached; upstream = $upstream; ahead = $ahead; behind = $behind
    trackedDirty = $tracked; untracked = $untracked; stash = $stash; ageDays = $ageDays
  }
}

function Get-Bucket($s, [int]$far) {
  if ($s.detached -or -not $s.upstream) { return 'E' }
  if ($s.ahead -gt 0 -and $s.behind -gt 0) { return 'E' }
  if ($s.behind -ge $far) { return 'E' }
  if (($s.trackedDirty + $s.untracked) -gt 0) { return 'D' }
  if ($s.ahead -gt 0) { return 'C' }
  if ($s.behind -gt 0) { return 'B' }
  return 'A'
}

# --- discover top-level repos (depth 1) -------------------------------------
$repos = Get-ChildItem -LiteralPath $Root -Directory -Force -ErrorAction SilentlyContinue |
  Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName '.git') -PathType Container }

$seenWorktrees = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$report = New-Object System.Collections.Generic.List[object]
$i = 0
foreach ($r in $repos) {
  $i++
  Write-Progress -Activity 'machine-audit' -Status $r.Name -PercentComplete (100 * $i / [Math]::Max(1, $repos.Count))
  $p = $r.FullName
  if ($Fetch) { $null = & git -C $p fetch --all --prune --quiet 2>$null }

  $state = Get-RepoState $p
  $state | Add-Member -NotePropertyName bucket -NotePropertyValue (Get-Bucket $state $FarBehind)
  $state | Add-Member -NotePropertyName name -NotePropertyValue $r.Name

  $defaultRef = Get-DefaultBranchRef $p
  $worktrees = New-Object System.Collections.Generic.List[object]
  $wtRaw = @(Invoke-Git $p @('worktree', 'list', '--porcelain'))
  $cur = $null
  foreach ($line in ($wtRaw + '')) {
    if ($line -like 'worktree *') { $cur = [ordered]@{ path = ($line.Substring(9) -replace '/', '\'); branch = $null; locked = $false; head = $null } }
    elseif ($line -like 'HEAD *' -and $cur) { $cur.head = $line.Substring(5) }
    elseif ($line -like 'branch *' -and $cur) { $cur.branch = ($line.Substring(7) -replace '^refs/heads/', '') }
    elseif ($line -like 'locked*' -and $cur) { $cur.locked = $true }
    elseif ($line -eq '' -and $cur) {
      $isMain = ($cur.path -ieq $p)
      if (-not $isMain) {
        $null = $seenWorktrees.Add($cur.path)
        $ws = Get-RepoState $cur.path
        $dirtyCount = $ws.trackedDirty + $ws.untracked
        $merged = $false
        if ($defaultRef -and $cur.head) {
          & git -C $p merge-base --is-ancestor $cur.head $defaultRef 2>$null
          $merged = ($LASTEXITCODE -eq 0)
        }
        $verdict = if ($dirtyCount -eq 0 -and $merged -and -not $cur.locked -and $ws.ahead -eq 0) { 'prunable' } else { 'keep' }
        $worktrees.Add([pscustomobject]@{
          path = $cur.path; branch = $cur.branch; dirty = $dirtyCount; merged = $merged
          locked = $cur.locked; ageDays = $ws.ageDays; verdict = $verdict
        })
      }
      $cur = $null
    }
  }
  $state | Add-Member -NotePropertyName defaultRef -NotePropertyValue $defaultRef
  $state | Add-Member -NotePropertyName worktrees -NotePropertyValue $worktrees
  $report.Add($state)
}
Write-Progress -Activity 'machine-audit' -Completed

# --- summarize ---------------------------------------------------------------
$byBucket = $report | Group-Object bucket | Sort-Object Name
$prunable = @($report | ForEach-Object { $n = $_.name; $_.worktrees | Where-Object verdict -eq 'prunable' | ForEach-Object { [pscustomobject]@{ repo = $n; path = $_.path; branch = $_.branch } } })
$stale = @($report | Where-Object { $null -ne $_.ageDays -and $_.ageDays -ge $StaleDays } | Select-Object name, branch, ageDays)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$jsonPath = Join-Path $OutDir "machine-audit-$stamp.json"
$mdPath = Join-Path $OutDir "machine-audit-$stamp.md"
[pscustomobject]@{ generated = (Get-Date).ToString('o'); root = $Root; fetched = [bool]$Fetch; repos = $report } |
  ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $jsonPath -Encoding utf8

$md = New-Object System.Text.StringBuilder
[void]$md.AppendLine("# Machine audit $stamp")
[void]$md.AppendLine("")
[void]$md.AppendLine("Repos: $($report.Count) | fetched: $([bool]$Fetch) | far-behind threshold: $FarBehind")
[void]$md.AppendLine("")
[void]$md.AppendLine("| Bucket | Count |")
[void]$md.AppendLine("|---|---|")
foreach ($g in $byBucket) { [void]$md.AppendLine("| $($g.Name) | $($g.Count) |") }
foreach ($b in 'E', 'D', 'C', 'B') {
  $rows = @($report | Where-Object bucket -eq $b | Sort-Object { - ($_.trackedDirty + $_.untracked) })
  if ($rows.Count -eq 0) { continue }
  [void]$md.AppendLine("")
  [void]$md.AppendLine("## Bucket $b")
  [void]$md.AppendLine("")
  [void]$md.AppendLine("| Repo | Branch | Upstream | Behind | Ahead | Dirty | Untracked | Stash | Age (d) |")
  [void]$md.AppendLine("|---|---|---|---|---|---|---|---|---|")
  foreach ($x in $rows) {
    [void]$md.AppendLine("| $($x.name) | $($x.branch) | $($x.upstream) | $($x.behind) | $($x.ahead) | $($x.trackedDirty) | $($x.untracked) | $($x.stash) | $($x.ageDays) |")
  }
}
[void]$md.AppendLine("")
[void]$md.AppendLine("## Prunable worktrees ($($prunable.Count))")
foreach ($w in $prunable) { [void]$md.AppendLine("- $($w.repo): ``$($w.path)`` [$($w.branch)]") }
Set-Content -LiteralPath $mdPath -Value $md.ToString() -Encoding utf8

Write-Host ""
Write-Host "== machine-audit: $($report.Count) repos ==" -ForegroundColor Cyan
$byBucket | ForEach-Object { Write-Host ("  bucket {0}: {1}" -f $_.Name, $_.Count) }
Write-Host ("  prunable worktrees: {0}" -f $prunable.Count)
Write-Host ("  repos with no commit in {0}+ days: {1}" -f $StaleDays, $stale.Count)
Write-Host "JSON: $jsonPath"
Write-Host "MD:   $mdPath"
