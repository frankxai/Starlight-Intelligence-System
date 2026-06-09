# Master Plan — T-4 to Friday Demo + Service-Wedge Foundation

**Date:** 2026-05-11
**Author:** Claude Opus 4.7 (1M ctx) — autonomous audit-and-plan per Frank's directive
**Tier:** substrate (touches demo runbook + ledger schemas + cockpit hooks + memory router)
**Status:** PRE-BOARD — `/starlight-board` pressure-test gates this plan before any work begins
**Companion:** `docs/ops/HANDOVER-2026-05-11-three-tier-fleet-build.md`, `docs/ops/DEMO-RUNBOOK-2026-05-15.md`, `NAMING.md`

---

## TL;DR

**The Friday 2026-05-15 demo is broken right now.** All 7 dashboard routes return 500. The substrate test suite is 913/913 green but the operator path isn't. Plus voice agent UX is rough, work-packet orchestrator isn't consuming its queue, and the machine hit memory pressure during today's heavy session.

**Strategic gravity (per goals audit):** the "Build Your Company Brain" €7,500 service wedge is what every other mission compounds through. Friday's v01 demo is the proof-of-concept that wedge ships against. So the demo isn't decorative — it's revenue-adjacent.

**This plan: stabilize → polish → rehearse → demo.** 5 phases over 4 days. No new features. No new substrate. Just make what's shipped actually work.

---

## Current state — audited 2026-05-11 09:30 UTC

### What's healthy
- 11 Starlight-related scheduled tasks Ready (Dreaming, Cockpit, CrossRepoIndexer, PortfolioAudit, etc.)
- 15 of 24 MCP servers Connected (memory-bus, cockpit, Vercel, Notion, Linear, etc.)
- Cockpit v0.2 install live (sessions.jsonl active, snapshots fresh)
- 913/913 cumulative tests green at last parallel-session handover
- 42 agents registered, 0 parked
- All 3 voice services up (:3007 node, :7373 python, :7777 node)
- Memory Bus 125x cold-start speedup applied
- Cross-agent MCP (Gemini + Codex + Claude) verified writing

### What's broken
| # | Issue | Severity | Owner | Detected |
|---|---|---|---|---|
| 1 | **7 demo routes return 500** (mission-control, agents, decisions, packs, council, vaults/loop, tooling) | **CRITICAL** | dashboard build/data layer | 2026-05-11 09:30 audit |
| 2 | Work-packets queue has 3 pending items, zero processing | high | substrate orchestrator | machine state audit |
| 3 | Voice agent UX feels rough (Frank explicit, 2026-05-11) | high | voice-operator + orb + bridge | Frank report |
| 4 | OpenRouter Tier-1 JSON parse error intermittent | medium | cognition router | voice-operator log |
| 5 | Voice sessions stale 10 days | medium | adoption/habit | machine state audit |
| 6 | Dreaming cron processes empty sets (4 consecutive zero-result runs) | medium | dreaming-run.ts input | CONSOLIDATION_LOG.md |
| 7 | GitHub MCP failing | low | external auth | mcp list |
| 8 | 4 cockpit Task Scheduler triggers haven't fired yet (Evening-save, Shutdown-snapshot, Weekly-GC, PortfolioAudit) | low | trigger windows not reached | local task audit |
| 9 | Machine RAM headroom thin (1.3 GB available, 3.2 GB node footprint) | low | session-pressure-induced | machine state audit |

### What's parked (decision-pending on Frank)
1. **B2 — Dispatcher canonicalization** (Option A: promote arco → @starlight/orchestrator with shim, B: adopt, C: vendor) — `docs/superpowers/specs/2026-05-11-dispatcher-canonicalization-decision.md`
2. **Infisical onboarding** (gates Cost Plane real data) — Frank sets up the secret-management instance
3. **W3 Finance IS scope** (extension of Business IS vs new vertical) — `docs/superpowers/specs/2026-05-11-finance-business-is-design.md` (board verdict pending)

---

## Strategic gravity

Per the substrate documents (per goals audit), Frank's top-level missions in priority order:

1. **Service wedge: "Build Your Company Brain" €7,500 10-day sprint** — revenue gravity. Every other mission compounds through this.
2. **SIP protocol v1.1.1+** — the sovereignty contract; foundational, not decorative.
3. **Domain Sub-Stack pattern** — People IS + Sound IS + Music IS reference verticals enable forkable intelligence stacks per sovereign user.
4. **Creator Economy Stack** — Music IS + GenCreator Community + Voice/Video IS.
5. **Horizon Vault** — AGI alignment via human-hopes-as-architecture.

**Friday 2026-05-15 demo is the proof-of-concept for #1.** It walks the substrate (Council 7-archetype review, WorkPacket lifecycle, VaultLoop Desire stage, Pack registry) for a live audience. If it doesn't work, the wedge can't ship.

---

## The 5-phase plan

**Board REVISE applied (2026-05-11):**
1. Added **Phase 0 — PROBE** before Phase 1 to size the 500-error blast radius honestly (Verifier's cheapest-experiment ask).
2. **Phase 2 (Voice UX) DEFERRED post-demo** per Strategist + Sovereign challenges — running in parallel with Phase 1 splits attention with no direct demo compounding. Frank's "orb not really good" signal stays parked but tagged for post-demo Phase 2'.
3. Phases renumbered: P0 (probe) → P1 (stabilize) → P3 (orchestrator) → P4 (rehearsal) → P5 (decisions). Old P2 becomes P2' post-demo.

### Phase 0 — PROBE (T-4 days, 15 minutes)

**Goal:** Classify the 500-error root cause before committing time to Phase 1.

| Step | Action | Verify |
|---|---|---|
| 0.1 | Hit `/mission-control` with curl; capture full Next.js error trace | error message visible |
| 0.2 | Classify into 4 buckets: (a) trivial config, (b) data schema mismatch, (c) build break, (d) bigger | one bucket chosen |
| 0.3 | If (a) or (c): Phase 1 = 1 hr. If (b): Phase 1 = 3-6 hrs (substrate-tier — board pre-pass). If (d): STOP, escalate to Frank with diagnosis | scope confirmed before Phase 1 starts |

**Board-gated:** NO (pure diagnostic).
**Output:** one of the 4 buckets, with citations.

### Phase 1 — STABILIZE (T-4 to T-3 days, ~6 hours)

**Goal:** Demo routes return 200 + work-packet orchestrator consumes queue + machine doesn't crash.

| Step | Action | Verify |
|---|---|---|
| 1.1 | Diagnose all 7 demo routes' 500 root cause (likely build error or schema mismatch from v01 ledgers landing) | curl each route, read Next.js error overlay |
| 1.2 | Fix the root cause (most-likely TypeScript type drift between v01 schemas and dashboard reads) | 7/7 routes return 200 |
| 1.3 | Locate the work-packet orchestrator (parallel session shipped MCP server v0.1 with sis.workpacket tools) | identify the consumer process / cron |
| 1.4 | Wire or restart the work-packet consumer; clear 3 pending items | work-packets.jsonl shows 0 pending |
| 1.5 | Memory diet: kill any zombie node processes, identify the 818MB primary | RAM available >2 GB |
| 1.6 | Pre-commit: full test sweep — 913+ substrate, 564 voice-operator, 40 dashboard | all green |

**Board-gated:** YES — any schema fix in v01 ledgers triggers `/starlight-board` pre-commit.

### Phase 2' — VOICE UX EXCELLENCE (DEFERRED post-demo, T+1 days)

**Board REVISE 2026-05-11:** moved out of pre-demo window. Parallel-running this with the demo-prep window splits focus with no direct demo compounding (Strategist challenge). Frank's "orb not really good" signal is real but P2' work doesn't touch the 7 demo routes that are 500ing.

**Tagged for post-demo execution.** Single utterance probe deferred to post-demo Verifier sweep.

**Original P2 steps preserved for post-demo execution:**

| Step | Action | Verify |
|---|---|---|
| 2.1 | Reproduce the "feels rough" — speak 5 utterances, log latencies + responses | identify worst-felt symptom |
| 2.2 | Fix OpenRouter JSON parse error (Tier-1 model JSON discipline) | 0 parse errors in 10-utterance probe |
| 2.3 | Verify A1 memory recall surfaces relevant Frank context (probe known queries) | recall hits cited in cognition log |
| 2.4 | Latency profile: STT + cognition + TTS + audio out | p95 turn_total_ms < 1500 in voice.turn events |
| 2.5 | Polish: VoiceTurnFeed mounted on /cockpit main page so feedback is glanceable | visible in dashboard |

**Board-gated:** NO — operational tier (voice-operator + orb + dashboard UI).
**Status:** PARKED until post-demo unless P0 probe reveals the demo failure IS voice-related.

### Phase 3 — WORK-PACKET ORCHESTRATOR (T-2 days, ~2 hours)

**Goal:** The 3 pending work-packets from 2026-05-11 07:12–07:16 UTC actually get processed.

| Step | Action | Verify |
|---|---|---|
| 3.1 | Read v01 ledgers + MCP server v0.1 to understand the WorkPacket lifecycle | document state machine: pending → in_flight → done |
| 3.2 | Find or build the consumer that moves pending → in_flight | a runnable script or daemon |
| 3.3 | Manually drive the 3 pending packets through the lifecycle | work-packets.jsonl shows 3 done |
| 3.4 | Optional: schedule consumer as a Task Scheduler cron | observable via /fleet |

**Board-gated:** YES — touches substrate ledger.

### Phase 4 — DEMO REHEARSAL (T-2 to T-1 days, ~2 hours)

**Goal:** Walk the Friday runbook end-to-end. All 10 demo-script steps green. Frank can drive it from muscle memory.

| Step | Action | Verify |
|---|---|---|
| 4.1 | Cold dry-run #1: `pwsh -File scripts/demo-friday-2026-05-15.ps1` | last line: "READY — all 10 steps green" |
| 4.2 | Walk `/mission-control` flow live (no script, just narrate) | each section renders + animates as expected |
| 4.3 | Identify any rough edges (slow renders, confusing copy, hidden affordances) | list of polish items |
| 4.4 | Apply polish in 1-2 commits | re-run dry-run #2, fully clean |
| 4.5 | T-1 final dry-run + screenshot capture | runbook screenshots refreshed |

**Board-gated:** NO — operational polish.

### Phase 5 — FRANK-DECISIONS (Frank's pace, async)

**Goal:** Unblock the 3 parked items so post-demo work can proceed.

| Step | Action | When |
|---|---|---|
| 5.1 | B2 dispatcher: pick Option A/B/C | next /starlight-board session |
| 5.2 | Infisical onboarding | when Frank has 15 min |
| 5.3 | W3 Finance IS scope: extension vs vertical | next /starlight-board session |

**Board-gated:** YES — each is substrate-tier.

---

## Falsifiable success criteria

| # | Criterion | How to verify |
|---|---|---|
| SC1 | All 7 demo routes return 200 | `curl localhost:3007/<route>` for each |
| SC2 | `scripts/demo-friday-2026-05-15.ps1` exits with "READY — all 10 steps green" | run it |
| SC3 | Frank speaks 3 consecutive utterances, all p95 < 1500ms, all reference real Frank context | voice.turn events + transcript review |
| SC4 | 3 pending work-packets all moved to done | work-packets.jsonl shows 0 pending |
| SC5 | At least 1 of 3 Frank-decisions resolved | dispatcher OR Infisical OR W3 picked |
| SC6 | Machine RAM > 2 GB available at typical-load baseline | `Get-Counter '\Memory\Available MBytes'` |

---

## What stays parked (won't touch this round)

- **Wave 3 C2 ambient listening** — substrate-tier, big engineering, not blocking demo
- **Wave 3 C3 multi-modal context envelope** — big engineering, depends on Wave 2.2 hardening
- **B3 full executor backend in voice-operator** — bridge already routes through orb's native tools
- **/yolo Phase-In Review** — fires at session 4, Frank-pace
- **Indexer state recovery #21** — 4 unrecoverable atoms, low leverage
- **Guardian PII regex Luhn-validator un-park** — quality-of-life, not blocking
- **MEMORY.md prune** — `/memory-prune` overdue but not blocking
- **start-cockpit.ps1 public-substrate refactor** — flagged in last assessment, not blocking

---

## Substrate-impact summary

| Surface | Phase | Direction | Reversibility |
|---|---|---|---|
| v01 ledger schemas | Phase 1 (1.2) | Bug-fix to existing schema | Schema-versioned, additive |
| Dashboard `/api/*` routes | Phase 1 (1.1-1.2) | Bug-fix | Code-revert |
| Work-packet orchestrator | Phase 3 | Add consumer process | Stop the consumer |
| Voice-operator cognition router | Phase 2 (2.2) | Tighten JSON enforcement on Tier-1 prompts | Prompt-revert |
| Demo runbook | Phase 4 (4.4) | Polish prose + screenshots | Doc-revert |
| 10-IS taxonomy / sovereignty / SIP | NONE | NOT TOUCHED | n/a |

**Substrate gate prediction:** PROCEED with notes — pure stabilization + polish, no taxonomy/sovereignty changes.

---

## Why this plan and not alternatives

**Alternative: "Ship Wave 3 (ambient + multi-modal) before demo."**
Rejected. Wave 3 is big engineering with significant new failure surface. Adding it pre-demo is the exact mistake my Wave 1+2 session made — design-first when bug-fix-first was needed. The parallel session shipped bug fixes today and got 913/913 tests green; that's the model.

**Alternative: "Punt the demo to next week."**
Rejected. Friday 2026-05-15 is the substrate's named target. Slipping it without escalating to board = sovereignty drift.

**Alternative: "Just do voice UX, skip demo prep."**
Rejected. Demo is service-wedge-adjacent. Voice UX is Frank's daily-driver. Both matter. Phases 1+2 are explicitly parallel.

---

## Sequencing inside next session

If Frank picks ONE phase for the next session, I'd recommend **Phase 1 (Stabilize)** because:
- 4-day deadline is binding
- 7 routes broken is high-confidence-of-fix
- Unblocks rehearsal in Phase 4
- All other work depends on dashboard being alive

If Frank picks ONE *signal* to look for, I'd recommend **`scripts/demo-friday-2026-05-15.ps1` last line.** If it says "READY — all 10 steps green," we're walking the demo Friday. If not, we have a specific failure to chase.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty, orchestration]
- Verticals: dashboard, voice-operator, cockpit, ledgers, orchestrator
- Tier: substrate (gates downstream verticals via demo-readiness)
- Generated: 2026-05-11
- Pre-board: ready for `/starlight-board` pressure-test
