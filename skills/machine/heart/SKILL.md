---
name: heart
description: Ops health monitor for the machine substrate. Checks Memory Bus, brain_watchdog, Voice Operator, dashboard, audit-log freshness, and scheduled tasks. Cross-cutting skill that any repo can invoke when daemons feel off or before starting a heavy work session.
type: skill
domain: machine
trigger: /heart, "is everything running", "check daemons", "ops health", "are we healthy"
---

# /heart — Ops Health Monitor

Sibling to `/pp` (Peak Performance machine audit). Where `/pp` watches the machine's *capacity* (RAM, CPU, disk), `/heart` watches the machine's *substrate processes* — the daemons that make the cockpit work.

## When to invoke

- Before starting a focused work session
- When voice operator feels slow or unresponsive
- When the audit tab shows no events (suspect bus is down)
- When dashboard at :3007 won't load
- Pre-flight before `arc <project>` if a previous session crashed

## What to check (Six Gate scoring)

| Gate | Process / Signal | Healthy state |
|---|---|---|
| 1. Memory Bus | Python process running server.py | Process exists, responds to `tools/list` |
| 2. brain_watchdog | Python daemon | Process exists, last log entry < 5min old |
| 3. Voice Operator | FastAPI service on :8000 (or configured port) | HTTP 200 on /health |
| 4. Dashboard | Next.js on :3007 | HTTP 200 on / |
| 5. Audit log | `memory/_audit/<today>.jsonl` | File exists, modified < 1 hour ago |
| 6. Scheduled tasks | StarlightCockpit, StarlightCrossRepoIndexer, Starlight Dreaming | All "Ready" or "Running" state |

Score: 6/6 = green. 4-5/6 = yellow (note degraded surface but proceed). <4 = red (stop, fix substrate first).

## Implementation (PowerShell)

```powershell
# Run the shared heart-check script
& "$PSScriptRoot/../../../scripts/heart-check.ps1"
```

## What to do per state

- **GREEN** — proceed; report 6/6 and move on
- **YELLOW** — note in response but proceed; user can choose to fix later
- **RED on any gate** — stop session work; show user how to remediate
  - Memory Bus down: `pwsh scripts/start-memory-bus-watcher.ps1`
  - Dashboard down: `cd private/local-command-center/apps/dashboard && npm run dev`
  - Indexer task missing: `pwsh scripts/register-cross-repo-indexer-task.ps1`

## Output format

When `/heart` is invoked, respond with a compact score card:

```
/heart — Ops health: 5/6 (YELLOW)

  ✓ Memory Bus
  ✓ brain_watchdog
  ✓ Voice Operator
  ✗ Dashboard (no response :3007 — run: cd private/local-command-center/apps/dashboard && npm run dev)
  ✓ Audit log (12m old)
  ✓ Scheduled tasks (3/3 Ready)
```

Built on SIP — operational-tier · machine substrate skill
