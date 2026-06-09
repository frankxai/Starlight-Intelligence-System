# scripts/dreaming-cron.ps1 — Windows scheduled task wrapper.
#
# Invokes scripts/dreaming-run.ts which runs the DreamingAgent + appends a
# 1-line receipt to memory/CONSOLIDATION_LOG.md.
#
# One-time setup (registers daily 06:00 task):
#   schtasks /Create /TN "Starlight Dreaming" /SC DAILY /ST 06:00 ^
#     /TR "pwsh.exe -NoProfile -File C:\Users\frank\Starlight-Intelligence-System\scripts\dreaming-cron.ps1"
#
# Manual run:
#   pwsh -NoProfile -File scripts\dreaming-cron.ps1
#
# Verify:
#   tail -5 memory/CONSOLIDATION_LOG.md
#
# Built on SIP — operational tier (memory observability scheduled task).

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $RepoRoot

try {
    # tsx is a devDependency in this repo's package.json.
    # The --import flag wires it as a Node loader for TS extensions.
    & node --import tsx scripts/dreaming-run.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Host "dreaming-cron: dreaming-run.ts exited $LASTEXITCODE" -ForegroundColor Yellow
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}
