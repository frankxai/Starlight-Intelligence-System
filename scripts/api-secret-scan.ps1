# Daily secret leak scan across active repositories.
[CmdletBinding()]
param(
    [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $RepoRoot 'private\api-monitor'
$Today = Get-Date -Format 'yyyy-MM-dd'
$Findings = Join-Path $OutDir "secret-findings-$Today.md"
$AlertsFile = Join-Path $OutDir 'ALERTS.md'
$Backticks = [char]96 + [char]96 + [char]96

$repos = @(
    (Join-Path $HOME 'Starlight-Intelligence-System'),
    (Join-Path $HOME 'FrankX'),
    (Join-Path $HOME 'Arcanea'),
    (Join-Path $HOME 'agentic-creator-os'),
    (Join-Path $HOME 'frankx.ai-vercel-website')
)
$existingRepos = @($repos | Where-Object { Test-Path -LiteralPath $_ -PathType Container })
$missingRepos = @($repos | Where-Object { -not (Test-Path -LiteralPath $_ -PathType Container) })

if ($existingRepos.Count -eq 0) {
    Write-Error "Secret scan has zero existing repository inputs. Refusing false-green success."
    exit 2
}

if ($ValidateOnly) {
    [pscustomobject]@{
        valid = ($missingRepos.Count -eq 0)
        configured = $repos.Count
        existing = $existingRepos.Count
        missing = $missingRepos
        infisical = [bool](Get-Command infisical -ErrorAction SilentlyContinue)
    } | ConvertTo-Json -Depth 3
    if ($missingRepos.Count -gt 0) { exit 1 }
    exit 0
}

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$infisical = Get-Command infisical -ErrorAction SilentlyContinue
if (-not $infisical) {
    $msg = 'infisical CLI not found in PATH - install via winget install Infisical.CLI'
    Add-Content -Path $AlertsFile -Value "[ERROR] $((Get-Date).ToString('o')) secret-scan :: $msg"
    Write-Error $msg
    exit 1
}

@(
    "# Secret-scan findings $Today"
    ''
    "Configured repositories: $($repos.Count) | Existing: $($existingRepos.Count) | Missing: $($missingRepos.Count)"
) | Set-Content -Path $Findings -Encoding UTF8

foreach ($missing in $missingRepos) {
    Add-Content -Path $Findings -Value "- [ERROR] Missing configured repository: $missing"
}

$totalFindings = 0
$scanFailures = 0
$scannedCount = 0
foreach ($repo in $existingRepos) {
    Write-Host "Scanning: $repo" -ForegroundColor Cyan
    Add-Content -Path $Findings -Value "`n## $repo`n"
    Push-Location $repo
    $tmpOut = [System.IO.Path]::GetTempFileName()
    try {
        & infisical scan --verbose --no-color 2>&1 | Out-File -FilePath $tmpOut -Encoding utf8
        $rc = $LASTEXITCODE
        $out = Get-Content $tmpOut -Raw -ErrorAction SilentlyContinue
        $scannedCount++
        if ($rc -eq 0) {
            Add-Content -Path $Findings -Value "OK - no secrets found.`n"
        } else {
            # Count real finding blocks only. Matching RuleID/secret inflates history scans.
            $findingCount = ([regex]::Matches([string]$out, '(?m)^Finding:\s+')).Count
            if ($findingCount -gt 0) {
                $totalFindings += $findingCount
                Add-Content -Path $Findings -Value "`n$Backticks`n$out`n$Backticks"
                Add-Content -Path $AlertsFile -Value "[LEAK] $((Get-Date).ToString('o')) secret-scan :: $repo - $findingCount findings (see $Findings)"
            } else {
                $scanFailures++
                Add-Content -Path $Findings -Value "ERROR: scanner exited $rc without parseable findings. Review local output."
                Add-Content -Path $AlertsFile -Value "[ERROR] $((Get-Date).ToString('o')) secret-scan :: $repo scanner exit $rc"
            }
        }
    } catch {
        $scanFailures++
        Add-Content -Path $Findings -Value "ERROR scanning: $($_.Exception.Message)`n"
    } finally {
        Remove-Item $tmpOut -ErrorAction SilentlyContinue
        Pop-Location
    }
}

Add-Content -Path $Findings -Value "`n---`nScanned repositories: $scannedCount/$($existingRepos.Count)`nTotal findings across $scannedCount scanned repos: $totalFindings`nOperational failures: $scanFailures"
Write-Host "Report: $Findings"
Write-Host "Scanned: $scannedCount | Findings: $totalFindings | Failures: $scanFailures"

if ($scannedCount -eq 0 -or $scanFailures -gt 0 -or $missingRepos.Count -gt 0) { exit 1 }
if ($totalFindings -gt 0) { exit 2 }
exit 0
