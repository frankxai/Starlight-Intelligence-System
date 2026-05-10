---
name: storage
description: Disk audit and dedup-hint skill. Reports repo sizes, oversized files, worktree bloat, and surfaces candidates for archival/cleanup. Cross-cutting machine-layer skill, sibling to /pp and /heart.
type: skill
domain: machine
trigger: /storage, "disk usage", "what's eating my disk", "cleanup candidates", "dedup", "storage emergency"
---

# /storage — Disk Audit & Dedup Hints

Cross-cutting machine-layer skill. Where `/pp` watches RAM/CPU and `/heart` watches daemons, `/storage` watches where the disk is going.

## When to invoke

- Disk space warning (under 50 GB free)
- After a heavy build or worktree-heavy week
- When `pp` flags storage as a constraint
- Before a `git clone` of a large repo
- Periodically (weekly or per `weekly-recap`)

## What to check

| Signal | Why it matters |
|---|---|
| Top 10 repos by size | Identifies the heaviest costs |
| Repos > 5 GB | Often hide nested worktrees / vendored deps / build artifacts |
| Files > 100 MB tracked in git | Should be LFS or .gitignored |
| Worktrees (`git worktree list`) | Each worktree is a full working copy |
| node_modules / .venv on disk | Cumulative drain across repos |
| Memory Bus mempalace size | Vector DB can grow large unchecked |
| Audit log accumulation | `memory/_audit/*.jsonl` files past 30 days |

## Quick implementation

```powershell
# Read the canonical audit JSON for repo sizes
$auditPath = 'C:\Users\frank\Starlight-Intelligence-System\memory\_audit\repo-portfolio-2026-05-04.json'
if (-not (Test-Path $auditPath)) {
    Write-Host 'Audit JSON missing — run tools/audit-repo-portfolio.ps1 first' -ForegroundColor Yellow
    return
}
$audit = Get-Content $auditPath -Raw | ConvertFrom-Json
$auditAge = (Get-Date) - [DateTime]::Parse($audit.generated_at)
"Audit age: $([int]$auditAge.TotalDays) days"

# Top 10 repos by size
"`n=== Top 10 repos by size ==="
$audit.repos | Sort-Object size_mb -Descending | Select-Object -First 10 |
    Format-Table @{N='Repo';E={$_.name}}, @{N='Size GB';E={[math]::Round($_.size_mb/1024, 1)}}, class, days_since -AutoSize

# Free disk space on C:
"`n=== Free space ==="
$drive = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
"C:\ Free: $([math]::Round($drive.FreeSpace/1GB, 1)) GB / $([math]::Round($drive.Size/1GB, 1)) GB"

# Oversized non-git files (>100MB) in top repo
"`n=== Files >100MB in top repo ==="
$top = ($audit.repos | Sort-Object size_mb -Descending | Select-Object -First 1).path
if (Test-Path $top) {
    Get-ChildItem $top -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Length -gt 100MB -and $_.FullName -notmatch '\.git\\' } |
        Sort-Object Length -Descending |
        Select-Object -First 5 |
        Format-Table @{N='Size MB';E={[math]::Round($_.Length/1MB,0)}}, FullName -AutoSize
}

# Audit log accumulation
"`n=== Audit log files >30 days old ==="
$auditDir = 'C:\Users\frank\Starlight-Intelligence-System\memory\_audit'
Get-ChildItem $auditDir -Filter '*.jsonl' -ErrorAction SilentlyContinue |
    Where-Object { (Get-Date) - $_.LastWriteTime -gt (New-TimeSpan -Days 30) } |
    Select-Object Name, @{N='Age days';E={[int]((Get-Date) - $_.LastWriteTime).TotalDays}}, @{N='Size KB';E={[math]::Round($_.Length/1KB,1)}} |
    Format-Table -AutoSize
```

## Refresh the audit

The audit JSON is canonical for repo metadata. If it's >7 days old, refresh:

```powershell
pwsh tools/audit-repo-portfolio.ps1
```

## Output format

```
/storage — Disk audit

  Audit age: 6 days (stale > 7d would auto-refresh)
  C:\ Free: 187.4 GB / 953.9 GB

  Top repos:
    1. FrankX        19.2 GB  active   (suspect: worktrees + nested sibling)
    2. Arcanea       9.7 GB   active   (suspect: path-duplicate cluster)
    3. frankx-prod-* ~9.0 GB  active   (4 sibling repos, candidates for dedup)
    4. ...

  Recommended actions:
    - Run /storage --deep on FrankX (memory has known worktree bloat)
    - Archive frankx-prod-* siblings older than 30 days
    - 3 audit log files >30 days old (47 KB) — consider archive
```

## Cross-cutting with /heart and /pp

- `/pp` = capacity (am I going to run out)
- `/heart` = process health (is the substrate alive)
- `/storage` = disk distribution (where did all my disk go)

Invoke as a trio at start of a sprint: `/pp && /heart && /storage`.

Built on SIP — operational-tier · machine substrate skill
