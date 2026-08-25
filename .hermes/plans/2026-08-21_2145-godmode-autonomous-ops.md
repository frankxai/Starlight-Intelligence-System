# God-mode autonomous ops — implementation plan

> **For Hermes:** Do not spawn 15 hourly LLM domain swarms. Execute only the admitted tasks below. Maker ≠ checker. Capacity precedes controllers.

**Goal:** One Starlight Queen, four logical lanes, script-only half-hour sensing, LLM on daily/night cadences already live, token spend bound to P0 milestones — visible on `/queen`.

**Architecture:** Hermes Queen on Yogabook is the conductor. Swarm-bus is A2A. MCP is tools (Railway, n8n, Context7 only). n8n = webhooks/HITL, not personalities. Railway Hermes = parked worker, never public Queen/Telegram. Domain teams are **leases** in `registry.v1.json`, not new crons. Visual plane = Observatory `127.0.0.1:4321/queen`.

**Tech stack:** Hermes cron + no_agent Python shims · existing `probe_production_domains.py` · Observatory Next on 4321 · GitHub draft-first · Polar sandbox until 1 purchase.

---

## Current context (verified 2026-08-21 21:43 Europe/Amsterdam)

| Fact | Evidence |
| --- | --- |
| Identity | Starlight / 83KJ / yogabook |
| Disk / RAM | 101.63 GiB BOUNDED · 68.7% RAM (CLI gate open) |
| Cron fleet | **58 jobs**. Hourly/15m **scripts already exist**. Daily LLM Queen already exists. |
| Do not duplicate | overnight-queen-driver 23:00 · night-heal 23:45 · quality-eval last tick 23:03 · observatory-collector */15 · storage-free-watchdog hourly · usage-capacity-snapshot 60m · swarm-bus-poll */15 · mid-day-queen-pulse 14:00 · morning-founder-review 08:00 |
| Errors to heal | `daily-backup-and-continuity` error · `daily-git-lane-health` error · `daily-starlight-cockpit-swarm` error |
| MCP | Railway, n8n (RO), Context7. No A2A product. |
| Railway Hermes | Parked idle sleep, no domain, no Telegram (prior session). |
| C940 | Stale/forged heartbeat. 71 pending. No generic enqueue. |
| Product P0 | GenCreator CreatorPack sandbox. frankx.ai FE HOLD on copy. #48/#13 Queen-reviewed, Frank must ready. |

---

### Task 1: Persist this plan + campaign files

**Objective:** planning-with-files SSOT so later ticks do not invent a 12-swarm.

**Files:**
- Create: this file
- Create: `C:/Users/frank/starlight/queen/campaigns/godmode-autonomous-20260821/task_plan.md`
- Create: `C:/Users/frank/starlight/queen/reports/godmode-operating-system-2026-08-21.md`

**Verify:** three files exist; charter names four lanes and forbids hourly LLM.

---

### Task 2: Silent 30m self-heal (no_agent)

**Objective:** If `/queen` is down or a production host flips, emit a short alert and try one loopback restart of the known-green Observatory. Silent when unchanged.

**Files:**
- Create: `C:/Users/frank/starlight/queen/swarm/scripts/estate_selfheal_hourly.py`
- Create: `C:/Users/frank/AppData/Local/hermes/scripts/estate-selfheal-hourly.py` (thin shim)
- Cron: `no_agent=true` `every 30m` deliver=local workdir=`C:/Users/frank/starlight`

**Do not:** start LLM, probe from home, kill Claude, bind public, create worktrees.

**Verify:** first run may print heal if 4321 down; second identical healthy run empty stdout + `last_status=ok`.

---

### Task 3: Token + team policy (docs only)

**Objective:** Bind spend to milestones. Map marketing/design/eng/content to existing jobs + domain registry.

**Policy:**
- Reserve ≥15% quota for verify/incidents.
- Hourly/30m = script only.
- Daily LLM = existing morning / midday / overnight Queen only.
- P0 tokens: GenCreator honesty + CreatorPack. P1: SIS-web #13 after Frank ready. Hold: FE copy, Vitalis public, #47 viewport, Railway LiteLLM until Frank yes.
- Teams = roles on a lease, not 15 crons.

**Verify:** charter table lists existing job IDs, not invented ones.

---

### Task 4: Diagnose three error crons (read-only this pass)

**Objective:** Name root cause; fix only if one file and no sibling owner.

`fa64e9152561` backup · `8082359b3bcd` git-lane-health · `d82e8365162f` cockpit-swarm.

**Verify:** receipt lists last_error class; no silent disable.

---

### Task 5 (NOT this session): Domain writer hours

Only after Frank readies #48/#13 and a clean gencreator worktree exists. One writer. Independent checker. Draft PR.

---

## Non-goals

- Google A2A, extra MCP (Linear/Stripe/Slack).
- Railway always-on Hermes Queen / public domain / Telegram.
- n8n LangChain agents (4 live workflows still MUST-FIX).
- Hourly LLM marketers/designers/engineers.
- C940 flood. New worktrees. FE copy rewrite.

## Risks

| Risk | Mitigation |
| --- | --- |
| 58-job registry race | Serial cron writes + readback |
| Observatory percent-disk CRITICAL vs 101 GiB | Use Queen GiB mode |
| Self-heal starts a second Next | Bind check before spawn |
| /plan vs “get it done” | Plan first; implement only Tasks 1–3 |

## Open questions (Frank)

1. Ready #48 then #13?
2. Approve Railway LiteLLM official-image Wave 1?
3. Disable 4 unsafe n8n workflows in UI?
