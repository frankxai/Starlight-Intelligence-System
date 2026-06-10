# =============================================================================
# api-secret-scan.ps1 — Daily secret leak scan across active repos
# =============================================================================
#
# Runs Infisical's built-in secret scanner against Frank's active repos. Looks
# for API keys, tokens, and credentials accidentally committed to git history
# or sitting in working directories. Writes findings to
# private/api-monitor/secret-findings-YYYY-MM-DD.md.
#
# Infisical scan uses Gitleaks rules under the hood + Infisical's own ruleset.
#
# Schedule: daily 04:30 via StarlightSecretScan task.
# Manual run: pwsh -File scripts/api-secret-scan.ps1
#
# Built on SIP — operational tier (secret leak prevention).
# =============================================================================

$ErrorActionPreference = 'Continue'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $RepoRoot 'private\api-monitor'
$Today = Get-Date -Format 'yyyy-MM-dd'
$Findings = Join-Path $OutDir "secret-findings-$Today.md"
$AlertsFile = Join-Path $OutDir 'ALERTS.md'

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

# Scan targets — Frank's active repos with credentials risk
$repos = @(
  'C:\Users\frank\Starlight-Intelligence-System',
  'C:\Users\frank\FrankX',
  'C:\Users\frank\Arcanea'
)

$infisical = Get-Command infisical -ErrorAction SilentlyContinue
if (-not $infisical) {
  $msg = 'infisical CLI not found in PATH — install via `winget install Infisical.CLI`'
  Add-Content -Path $AlertsFile -Value "[ERROR] $((Get-Date).ToString('o')) secret-scan :: $msg"
  Write-Host $msg -ForegroundColor Red
  exit 1
}

"# Secret-scan findings $Today`n" | Set-Content -Path $Findings -Encoding UTF8
$totalFindings = 0

foreach ($repo in $repos) {
  if (-not (Test-Path $repo)) { continue }
  Write-Host "Scanning: $repo" -ForegroundColor Cyan
  Add-Content -Path $Findings -Value "`n## $repo`n"

  Push-Location $repo
  try {
    # Infisical scan against working tree + git history.
    # Output goes to stdout as JSON (--json flag).
    $tmpOut = [System.IO.Path]::GetTempFileName()
    & infisical scan --verbose --no-color 2>&1 | Out-File -FilePath $tmpOut -Encoding utf8
    $rc = $LASTEXITCODE

    $out = Get-Content $tmpOut -Raw -ErrorAction SilentlyContinue
    Remove-Item $tmpOut -ErrorAction SilentlyContinue

    if ($rc -eq 0) {
      Add-Content -Path $Findings -Value "OK — no secrets found.`n"
      Write-Host '  OK — no findings' -ForegroundColor Green
    } else {
      # Infisical exits non-zero when findings exist
      $findingCount = ([regex]::Matches($out, 'Finding:|secret')).Count
      $totalFindings += $findingCount
      Add-Content -Path $Findings -Value "`n``````n$out`n``````n"
      Add-Content -Path $AlertsFile -Value "[LEAK] $((Get-Date).ToString('o')) secret-scan :: $repo - findings (see $Findings)"
      Write-Host "  LEAK SUSPECT — see $Findings" -ForegroundColor Red
    }
  } catch {
    $msg = $_.Exception.Message
    Add-Content -Path $Findings -Value "ERROR scanning: $msg`n"
    Write-Host "  ERROR: $msg" -ForegroundColor Red
  } finally {
    Pop-Location
  }
}

Add-Content -Path $Findings -Value "`n---`nTotal findings across $($repos.Count) repos: $totalFindings"
Write-Host ''
Write-Host "Report: $Findings" -ForegroundColor Green
Write-Host "Total findings: $totalFindings"

# Explicit exit so Task Scheduler never sees a lingering process (0x41306 fix).
# Findings are reported via ALERTS.md, not the exit code.
exit 0
