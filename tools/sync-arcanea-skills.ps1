<#
.SYNOPSIS
  One-shot sync of Arcanea repo .claude/skills from upstream user-canonical ~/.claude/skills.

.DESCRIPTION
  Sweep S2 (skill ecosystem reset) — Audit D (2026-05-04) showed Arcanea-repo skills drift unidirectionally
  vs ~/.claude/skills (ACOS is a perfect mirror; only Arcanea is stale). This script reconciles by file
  path, NOT by directory replacement.

  Source of truth: C:\Users\frank\.claude\skills (user-canonical — same as what ACOS mirrors).
  Target        : C:\Users\frank\Arcanea\.claude\skills (Arcanea-repo skills).

  Algorithm (conservative -- never deletes from Arcanea):
    For each file under upstream skill tree:
      - If file exists in target AND bytes differ: REPLACE target with upstream (drift fix).
      - If file exists in target AND bytes match : IDENTICAL (no-op).
      - If file does NOT exist in target         : UPSTREAM-ONLY (copy only when -IncludeUpstreamOnly).
    Files present only in Arcanea (Arcanea-canonical content) are preserved untouched.
    Skill folders present only in Arcanea (e.g. arcanea-lore, claws, character-forge) are preserved.

  Default -Apply behavior: drift-only fix (matches the audit's stated finding "3/5 sample drifted, all smaller").
  Add -IncludeUpstreamOnly to additionally copy down upstream-only skill files (1024+ files in current state -
  this would make Arcanea a full mirror like ACOS, but is a posture call worth flagging Frank on).

  Drift detection: byte-identity via Get-FileHash SHA256 (cheap and exact).

.PARAMETER DryRun
  Default ON. Reports what would change. No filesystem writes.

.PARAMETER Apply
  Required to actually copy upstream -> Arcanea.

.PARAMETER Upstream
  Override upstream skills root.

.PARAMETER Target
  Override Arcanea skills root.

.EXAMPLE
  pwsh ./tools/sync-arcanea-skills.ps1                # dry-run (default)
  pwsh ./tools/sync-arcanea-skills.ps1 -Apply         # actually sync

.NOTES
  Idempotent. Re-running after -Apply with no upstream changes reports zero drift.
  Audit reference: memory/sprints/audits/2026-05-04-portfolio-audit.md § Skill ecosystem (Audit D).
#>
[CmdletBinding()]
param(
  [switch]$Apply,
  [switch]$IncludeUpstreamOnly,
  [string]$Upstream = 'C:\Users\frank\.claude\skills',
  [string]$Target   = 'C:\Users\frank\Arcanea\.claude\skills'
)

$ErrorActionPreference = 'Stop'
$DryRun = -not $Apply

if (-not (Test-Path $Upstream)) { throw "Upstream skills root not found: $Upstream" }
if (-not (Test-Path $Target  )) { throw "Target skills root not found  : $Target" }

function Test-WslPathStub {
  param([System.IO.FileInfo]$f)
  # Upstream contains many small files whose content is just a Linux/WSL path
  # (broken symlink artifacts when the same .claude/skills is shared with WSL).
  # These must be skipped: copying them would clobber Arcanea directories with
  # 49-byte text files like "/mnt/c/Users/Frank/.agents/skills/algorithmic-art".
  if ($f.Length -ge 300) { return $false }
  try {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction Stop
  } catch {
    return $false
  }
  return ($content -and $content -match '^(/mnt/|/home/|/opt/|/usr/|/var/)')
}

Write-Host ""
Write-Host "================================================================"
Write-Host "  sync-arcanea-skills.ps1   ($(if ($DryRun) {'DRY-RUN'} else {'APPLY'}))"
Write-Host "================================================================"
Write-Host "  Upstream : $Upstream"
Write-Host "  Target   : $Target"
Write-Host ""

# Stats
$identical    = 0
$drifted      = 0
$upstreamOnly = 0
$copied       = 0

# Track Arcanea-only files so we can report them at end
$upstreamRel = New-Object System.Collections.Generic.HashSet[string]
$visitedRel  = New-Object System.Collections.Generic.HashSet[string]

# Walk upstream tree -- but skip WSL-path stubs at the root level (broken
# WSL-side symlinks surface as small files containing a Linux path string;
# they are not real skill content).
$wslSkipped = 0
$upstreamFiles = Get-ChildItem $Upstream -File -Recurse | Where-Object {
  if (Test-WslPathStub $_) { $script:wslSkipped++; $false } else { $true }
}
$wslSkipped = $script:wslSkipped
foreach ($up in $upstreamFiles) {
  $rel = $up.FullName.Substring($Upstream.Length).TrimStart('\','/')
  [void]$upstreamRel.Add($rel)
  [void]$visitedRel.Add($rel)
  $tgt = Join-Path $Target $rel

  if (Test-Path $tgt) {
    $upHash = (Get-FileHash $up.FullName -Algorithm SHA256).Hash
    $tgHash = (Get-FileHash $tgt        -Algorithm SHA256).Hash
    if ($upHash -eq $tgHash) {
      $identical++
    } else {
      $drifted++
      Write-Host ("  DRIFT   {0}  ({1}B -> {2}B)" -f $rel,(Get-Item $tgt).Length,$up.Length)
      if (-not $DryRun) {
        # Ensure parent dir exists (should since file exists, but safety)
        $parent = Split-Path $tgt -Parent
        if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Copy-Item -Path $up.FullName -Destination $tgt -Force
        $copied++
      }
    }
  } else {
    $upstreamOnly++
    if ($IncludeUpstreamOnly) {
      Write-Host ("  COPY    {0}  (upstream-only, {1}B)" -f $rel,$up.Length)
      if (-not $DryRun) {
        $parent = Split-Path $tgt -Parent
        if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Copy-Item -Path $up.FullName -Destination $tgt -Force
        $copied++
      }
    }
    # else: skipped — reported only in summary count
  }
}

# Inventory Arcanea-only files (preserved, never touched)
$arcanaOnly = 0
$arcanaFiles = Get-ChildItem $Target -File -Recurse
foreach ($ar in $arcanaFiles) {
  $rel = $ar.FullName.Substring($Target.Length).TrimStart('\','/')
  if (-not $upstreamRel.Contains($rel)) { $arcanaOnly++ }
}

Write-Host ""
Write-Host "----------------------------------------------------------------"
Write-Host "  Summary"
Write-Host "----------------------------------------------------------------"
Write-Host ("  upstream files scanned : {0}" -f $upstreamFiles.Count)
Write-Host ("  WSL-path stubs skipped : {0}" -f $wslSkipped)
Write-Host ("  identical              : {0}" -f $identical)
Write-Host ("  drifted (need update)  : {0}" -f $drifted)
$upOnlyLabel = if ($IncludeUpstreamOnly) { "upstream-only (will copy)" } else { "upstream-only (skipped, use -IncludeUpstreamOnly)" }
Write-Host ("  {0,-22} : {1}" -f $upOnlyLabel,$upstreamOnly)
Write-Host ("  Arcanea-only preserved : {0}" -f $arcanaOnly)
$wouldCopy = if ($IncludeUpstreamOnly) { $drifted + $upstreamOnly } else { $drifted }
if ($DryRun) {
  Write-Host ("  copies that WOULD run  : {0}" -f $wouldCopy)
  Write-Host ""
  Write-Host "  (DRY-RUN -- re-run with -Apply to actually copy.)"
} else {
  Write-Host ("  files copied           : {0}" -f $copied)
  Write-Host ""
  Write-Host "  APPLY complete."
}
Write-Host ""
