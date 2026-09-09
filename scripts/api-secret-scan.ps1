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

$blockingFindings = 0
$historicalFindings = 0
$scanFailures = 0
$scannedCount = 0
foreach ($repo in $existingRepos) {
    Write-Host "Scanning: $repo" -ForegroundColor Cyan
    Add-Content -Path $Findings -Value "`n## $repo`n"
    Push-Location $repo
    # First scan only uncommitted/staged changes. These findings are blocking:
    # they can be stopped before an agent turns a leak into repository history.
    # Infisical shells out to Git and treats safecrlf warnings as fatal, so set
    # the narrowest temporary Git config that prevents warning-only failures.
    $repoBlockingFindings = 0
    foreach ($changeMode in @(
        @{ Label = 'working-tree'; Args = @('git-changes') },
        @{ Label = 'staged'; Args = @('git-changes', '--staged') }
    )) {
        $tmpChangeOut = [System.IO.Path]::GetTempFileName()
        $tmpChangeReport = [System.IO.Path]::GetTempFileName()
        $oldGitConfigCount = $env:GIT_CONFIG_COUNT
        $oldGitConfigKey0 = $env:GIT_CONFIG_KEY_0
        $oldGitConfigValue0 = $env:GIT_CONFIG_VALUE_0
        try {
            $env:GIT_CONFIG_COUNT = '1'
            $env:GIT_CONFIG_KEY_0 = 'core.safecrlf'
            $env:GIT_CONFIG_VALUE_0 = 'false'
            $modeArgs = @($changeMode.Args)
            & infisical scan @modeArgs --redact --silent --report-format json --report-path $tmpChangeReport --no-color 2>&1 |
                Out-File -FilePath $tmpChangeOut -Encoding utf8
            $changeRc = $LASTEXITCODE
            $changeFindings = @()
            try {
                $rawChangeReport = Get-Content $tmpChangeReport -Raw -ErrorAction Stop
                if (-not [string]::IsNullOrWhiteSpace($rawChangeReport)) {
                    $changeFindings = @($rawChangeReport | ConvertFrom-Json -ErrorAction Stop)
                }
            } catch {
                $changeFindings = @()
            }

            if ($changeFindings.Count -gt 0) {
                $repoBlockingFindings += $changeFindings.Count
            } elseif ($changeRc -ne 0) {
                $scanFailures++
                Add-Content -Path $Findings -Value "ERROR: $($changeMode.Label) scanner exited $changeRc without a parseable redacted report."
                Add-Content -Path $AlertsFile -Value "[ERROR] $((Get-Date).ToString('o')) secret-scan :: $repo $($changeMode.Label) scanner exit $changeRc"
            }
        } catch {
            $scanFailures++
            Add-Content -Path $Findings -Value "ERROR: $($changeMode.Label) scan failed without persisting scanner output."
        } finally {
            $env:GIT_CONFIG_COUNT = $oldGitConfigCount
            $env:GIT_CONFIG_KEY_0 = $oldGitConfigKey0
            $env:GIT_CONFIG_VALUE_0 = $oldGitConfigValue0
            Remove-Item $tmpChangeOut, $tmpChangeReport -ErrorAction SilentlyContinue
        }
    }
    $blockingFindings += $repoBlockingFindings
    if ($repoBlockingFindings -gt 0) {
        Add-Content -Path $Findings -Value "BLOCKING FINDINGS: $repoBlockingFindings (redacted uncommitted/staged changes; inspect locally)"
        Add-Content -Path $AlertsFile -Value "[BLOCKING-LEAK] $((Get-Date).ToString('o')) secret-scan :: $repo - $repoBlockingFindings uncommitted/staged findings (redacted metadata only)"
    } else {
        Add-Content -Path $Findings -Value "BLOCKING FINDINGS: 0"
    }

    # The full-history scan remains a durable rotation/cleanup debt signal. It
    # is intentionally separate from the blocking current-change lane above.
    # Scanner output can itself contain a live credential. Keep both stdout and
    # the structured report in temporary files, then persist aggregate counts only.
    $tmpOut = [System.IO.Path]::GetTempFileName()
    $tmpReport = [System.IO.Path]::GetTempFileName()
    try {
        & infisical scan --redact --report-format json --report-path $tmpReport --no-color 2>&1 |
            Out-File -FilePath $tmpOut -Encoding utf8
        $rc = $LASTEXITCODE
        $scannedCount++

        $scanFindings = @()
        try {
            $rawReport = Get-Content $tmpReport -Raw -ErrorAction Stop
            if (-not [string]::IsNullOrWhiteSpace($rawReport)) {
                $parsedReport = $rawReport | ConvertFrom-Json -ErrorAction Stop
                $scanFindings = @($parsedReport)
            }
        } catch {
            # Do not persist parser or scanner stdout: either may contain sensitive text.
            $scanFindings = @()
        }

        if ($rc -eq 0) {
            Add-Content -Path $Findings -Value "OK - no secrets found.`n"
        } elseif ($scanFindings.Count -gt 0) {
            $findingCount = $scanFindings.Count
            $historicalFindings += $findingCount
            $ruleSummary = @(
                $scanFindings |
                    ForEach-Object {
                        if ($_.RuleID) { $_.RuleID }
                        elseif ($_.ruleId) { $_.ruleId }
                        else { 'unknown-rule' }
                    } |
                    Group-Object |
                    Sort-Object Count -Descending |
                    ForEach-Object { "$($_.Name):$($_.Count)" }
            ) -join ', '
            Add-Content -Path $Findings -Value "HISTORICAL FINDINGS: $findingCount (redacted structured scan; rule counts: $ruleSummary)`n"
            Add-Content -Path $AlertsFile -Value "[HISTORICAL-LEAK] $((Get-Date).ToString('o')) secret-scan :: $repo - $findingCount findings (redacted metadata only)"
        } else {
            $scanFailures++
            Add-Content -Path $Findings -Value "ERROR: scanner exited $rc without a parseable redacted report."
            Add-Content -Path $AlertsFile -Value "[ERROR] $((Get-Date).ToString('o')) secret-scan :: $repo scanner exit $rc"
        }
    } catch {
        $scanFailures++
        Add-Content -Path $Findings -Value "ERROR scanning: $($_.Exception.Message)`n"
    } finally {
        Remove-Item $tmpOut, $tmpReport -ErrorAction SilentlyContinue
        Pop-Location
    }
}

Add-Content -Path $Findings -Value "`n---`nScanned repositories: $scannedCount/$($existingRepos.Count)`nBlocking findings across $scannedCount scanned repos: $blockingFindings`nHistorical findings across $scannedCount scanned repos: $historicalFindings`nTotal findings across $scannedCount scanned repos: $historicalFindings`nOperational failures: $scanFailures"
Write-Host "Report: $Findings"
Write-Host "Scanned: $scannedCount | Blocking: $blockingFindings | Historical: $historicalFindings | Failures: $scanFailures"

if ($scannedCount -eq 0 -or $scanFailures -gt 0 -or $missingRepos.Count -gt 0) { exit 1 }
if ($blockingFindings -gt 0 -or $historicalFindings -gt 0) { exit 2 }
exit 0
