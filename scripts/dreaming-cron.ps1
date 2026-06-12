# scripts/dreaming-cron.ps1 — Windows scheduled task wrapper.
#
# Invokes scripts/dreaming-run.ts which:
#   1. Runs DreamingAgent over voice-sessions + audit-log
#   2. Appends 1-line receipt to memory/CONSOLIDATION_LOG.md
#   3. Queues new wisdom-promotion candidates to memory/PROMOTION_QUEUE.md
#      (idempotent via memory/.dreaming-state.json dedup sidecar)
#
# One-time setup (registers daily 04:00 task — matches existing receipt cadence):
#   npm run dream:register
#   # or directly:
#   pwsh -NoProfile -File scripts\register-dreaming-task.ps1
#
# Manual run:
#   npm run dream
#   # or directly:
#   pwsh -NoProfile -File scripts\dreaming-cron.ps1
#
# Verify:
#   Get-Content memory/CONSOLIDATION_LOG.md -Tail 5
#   Get-Content memory/PROMOTION_QUEUE.md
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
