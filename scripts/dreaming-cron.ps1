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

# HealthWatch derives status from a heartbeat when one exists for this task's kebab name
# (StarlightDreaming -> heartbeat-task-dreaming.json) instead of trusting wscript's exit
# code alone — a task can exit 0 while doing nothing, or exit nonzero for a self-reported
# reason. Only write 'ok' on a real successful run; a missing/stale heartbeat on failure
# keeps the raw LastTaskResult as the (correctly red) signal.
$HeartbeatPath = Join-Path $RepoRoot '..\..\logs\heartbeats\heartbeat-task-dreaming.json'

try {
    # tsx is a devDependency in this repo's package.json.
    # The --import flag wires it as a Node loader for TS extensions.
    & node --import tsx scripts/dreaming-run.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Host "dreaming-cron: dreaming-run.ts exited $LASTEXITCODE" -ForegroundColor Yellow
        exit $LASTEXITCODE
    }
    [ordered]@{
        ts     = (Get-Date).ToString('o')
        source = 'StarlightDreaming'
        status = 'ok'
        detail = 'dreaming-run.ts completed and appended CONSOLIDATION_LOG.md'
    } | ConvertTo-Json | Set-Content -LiteralPath $HeartbeatPath -Encoding UTF8
} finally {
    Pop-Location
}
