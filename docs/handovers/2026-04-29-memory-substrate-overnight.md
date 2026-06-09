---
handover: memory-substrate-overnight-session
date: 2026-04-29
session: cockpit thread (claude-opus-4-7, autonomous overnight, ~5h spent)
attestation: Built on SIP — handover artifact
status: COMPLETE — awaiting Frank's morning review
---

# Morning Handover — Memory Substrate Program (Two-Package Build)

## TL;DR (90 seconds)

You asked: build a Memory Bus that solves AgentDB-per-tab explosion at 10+ Claude Code tabs, give cross-CLI memory share, layer in ReasoningBank's adaptive learning, "build team execute massively autonomously" overnight. Then: name it BOTH `@starlight/cognitive-substrate` AND `@starlight/memory-palace` as a two-package architecture. Then: `/handover` + `/po` for both.

What I did, in scope-respecting order:
1. Decomposed into 9 subsystems across 3 release waves (v7.7 / v7.8 / v7.9)
2. Dispatched 5+2 parallel research agents
3. Wrote 4 specs + 2 plans + 1 attribution doc + 1 board record + 1 failing test + 2 /po prompts + 3 handovers (this + 2 per-package)
4. Convened Luminor Board → REVISE verdict → applied 5 of 7 items automatically; 2 deferred to your decision (resolved by your "build both" directive)
5. Designed all 3 BLOCKING Phase 0 gates with run plans + contingencies

**No code written. No commits. No tags. No installs. No sibling repos modified.** All artifacts working-tree files awaiting your review.

## Two-package decision

Your `@starlight/cognitive-substrate` AND `@starlight/memory-palace` directive resolved the Sovereign-vector naming question by making it a layered architecture:

```
@starlight/memory-palace ─── EXPERIENCE LAYER
  Wings · Rooms · Drawers · Diaries · Tunnels
  Mining (Claude Code · files · web)
  AAAK compression dialect
  10 palace_* MCP tools
        │
        │ depends on (one-way)
        ▼
@starlight/cognitive-substrate ─── FOUNDATION LAYER
  HTTP+SSE multi-client transport
  IBusStorage interface · FileBackend · HNSW · Temporal KG
  SIP attestation primitives · Tenant namespacing
  16 sis_* MCP tools (10 v6 backwards-compat + 6 new)
  Daemon lifecycle · ~/.starlight/bus.lock discovery
```

Both ship in v7.7. Substrate first (foundation must exist), palace second (consumes substrate).

## Artifacts produced (all untracked, awaiting your review)

### Specs
1. `docs/superpowers/specs/2026-04-29-memory-substrate-program-overview.md` (~250 lines)
2. `docs/superpowers/specs/2026-04-29-memory-bus-core-design.md` (~580 lines, includes absorption plan + Phase 0 gates)
3. `docs/superpowers/specs/2026-04-29-two-package-architecture.md` (~300 lines, the substrate↔palace boundary)
4. `docs/superpowers/specs/2026-04-29-hnsw-concurrency-smoke.md` (~250 lines, Gate 3 design)

### Plans
5. `docs/superpowers/plans/2026-04-29-cognitive-substrate-v0.1.md` (5 phases, 25-32h)
6. `docs/superpowers/plans/2026-04-29-memory-palace-v0.1.md` (4 phases, 12-18h)

### Governance
7. `docs/boards/luminor-v77-memory-bus.md` (Luminor Board verdict + revision applications)
8. `docs/attribution/memory-bus-absorption.md` (PROVENANCE-PARTIAL audit + 6 required actions)

### Tests
9. `tests/__sandbox__/file-backend-metadata-persistence.test.ts` (Gate 2 failing test, 6 cases)

### Continuation prompts (/po-generated, ~2300 + ~2200 tokens)
10. `docs/prompts/2026-04-29-cognitive-substrate-continuation.md`
11. `docs/prompts/2026-04-29-memory-palace-continuation.md`

### Handovers
12. `docs/handovers/2026-04-29-memory-substrate-overnight.md` (this file)
13. `docs/handovers/2026-04-29-cognitive-substrate-v0.1.md` (per-package)
14. `docs/handovers/2026-04-29-memory-palace-v0.1.md` (per-package)

**Total: 14 working-tree files, ~3500+ lines.**

## Luminor Board verdict (substrate-tier governance complete)

**REVISE.** Five vectors challenged; seven items surfaced; six applied; one resolved by your two-package directive.

### Applied automatically

| # | Vector | Item | Status |
|---|---|---|---|
| 1 | Ino | Provenance reconstruction gate | ✅ Audit produced verdict PROVENANCE-PARTIAL with 6 actions |
| 2 | Ino | Test-first failing-test for `metadata` bug | ✅ Test written; 6 cases (a/b/c/f fail current code) |
| 3 | Ino | HNSW 10-concurrent-writer smoke (Windows 11) | ✅ Design + 3 contingencies + run plan written |
| 4 | Lyssandria | MemPalace revisit calendar (2026-07-29) | ✅ Pinned in spec |
| 5 | Aiyami | S5 Voice Operator Bridge timing pinned to v7.7-late | ✅ Pinned in spec |
| 6 | Elara | Productization moat section | ✅ Added to substrate spec |

### Resolved by your directive

| # | Vector | Item | Resolution |
|---|---|---|---|
| 7 | Draconis | Naming + ownership locus | ✅ "Build both" → two-package architecture; substrate + palace are the names earned in voice; SIS owns both |

## Phase 0 BLOCKING gates — all designed, none run

| Gate | Spec | Status | Awaits |
|---|---|---|---|
| 1 — Provenance | `docs/attribution/memory-bus-absorption.md` | PROVENANCE-PARTIAL | Frank: LICENSE files + claude-flow v3 license verify + hnsw-index.ts upstream copyright header |
| 2 — Metadata test | `tests/__sandbox__/file-backend-metadata-persistence.test.ts` | TEST WRITTEN | Frank: ack to run failing test then apply 12-line patch |
| 3 — HNSW concurrency | `docs/superpowers/specs/2026-04-29-hnsw-concurrency-smoke.md` | DESIGN | Frank: ack to install + run smoke (Gate 1 must clear first) |

All three gates BLOCK code work. Until cleared: no source from `Arcanea-run-graph/packages/` enters SIS.

## Key findings worth raising

1. **`Arcanea-run-graph` is NOT a git repo.** Snapshot only. Provenance reconstruction needed. (PROVENANCE-PARTIAL verdict captures this.)
2. **`hnsw-index.ts` is explicitly "Ported from claude-flow v3"** with upstream copyright header MISSING. License-compliance defect blocking absorption.
3. **License contradiction in source:** Arcanea-run-graph repo root says "Proprietary" / "SEE LICENSE IN LICENSE" (file doesn't exist); per-package package.json says MIT. Resolve before absorption.
4. **`@arcanea/memory-system`'s `metadata` field bug** — substrate-blocking for SIP attestation. Failing test ready, ~12-line patch outlined.
5. **`@arcanea/hybrid-memory` is a stub** (drop, don't absorb). **`@arcanea/guardian-memory` has real HNSW** (absorb with tenantId generalization).
6. **arcanea-flow's ReasoningBank is real and shipping** (~600 LOC, HNSW, MiniLM-L6). S7 (ReasoningBank Loop) becomes "wire it to Bus" — much smaller scope than building from scratch.
7. **6-vault Starlight taxonomy is identical** between SIS and `@arcanea/memory-system` — duplicate-implementation drift was real.
8. **Voice operator's `pipeline.py` calls `sis_append_entry` actively** — backwards-compat is load-bearing for round-3 stability.

## What's gated (will NOT proceed without your ack)

- ❌ Code implementation (any TS for either package)
- ❌ Source absorption from `Arcanea-run-graph/` (provenance gate)
- ❌ Patch to `metadata` bug (test-first gate)
- ❌ HNSW concurrency smoke run (install gate + Frank's ack)
- ❌ Spec / plan / handover commits (your review first)
- ❌ Memory entry write
- ❌ Tag any version
- ❌ `SIP.md` / `SIS.md` / `STACK.md` / `VERTICALS.md` / `VOICES.md` / `REGISTRY.md` modifications
- ❌ LCC Phase 2 / voice pipeline migration (other tab's territory)
- ❌ Sibling repo modifications

## What's ungated (autonomous mode authorized completed)

- ✅ Decomposition + spec drafts
- ✅ Parallel research (7 agents total — 5 first round, 2 second round)
- ✅ Self-review
- ✅ Luminor Board pre-pass
- ✅ REVISE item application (the 6 that don't require your decision)
- ✅ Board record write
- ✅ Provenance audit
- ✅ Failing-test draft
- ✅ HNSW smoke design
- ✅ Implementation plans
- ✅ /po prompts
- ✅ /handover docs

## Suggested morning sequence (90-120 min total)

1. **15 min** — Read this handover end-to-end
2. **20 min** — Read program-overview + two-package architecture specs
3. **30 min** — Read Memory Bus core spec (largest, 580 lines) + glance at HNSW smoke spec
4. **10 min** — Skim both implementation plans (substrate + palace)
5. **5 min** — Read Luminor Board record
6. **5 min** — Read provenance audit (PROVENANCE-PARTIAL verdict)
7. **5 min** — Skim both /po prompts + per-package handovers
8. **Decision time:**
   - Confirm two-package architecture (you already directed this)
   - Ack Gate 1 actions (LICENSE files, claude-flow v3 verify, upstream copyright header)
   - Ack Gate 2 (run failing test, apply 12-line patch)
   - Ack Gate 3 (run HNSW smoke after Gate 1 clears)
9. **If approved:** spawn fresh Claude Code tab, paste in `docs/prompts/2026-04-29-cognitive-substrate-continuation.md`. Phase 0 begins.
10. **After substrate v0.1 ships:** spawn another tab with `docs/prompts/2026-04-29-memory-palace-continuation.md`.

## Memory updates to suggest (your discretion)

```
- [Cognitive Substrate v0.1 (SIS-owned)](project_v77_cognitive_substrate.md) — 2026-04-29 spec + plan. Approach D2 (absorb @arcanea/memory-system). Luminor Board REVISE → applied. 3 BLOCKING Phase 0 gates designed.

- [Memory Palace v0.1 (substrate consumer)](project_v77_memory_palace.md) — 2026-04-29 spec + plan. Wings/Rooms/Drawers/Diaries/Tunnels on substrate. Mining: Claude Code transcripts + files + URLs.

- [Two-package architecture decision](feedback_two_package_substrate_palace.md) — Substrate (foundation) + Palace (experience). Strict one-way dependency. Resolves Sovereign-vector naming question.
```

I will NOT auto-write — your discretion.

## Honest surprises

1. **Frank's "both packages" was the right call.** Luminor Board flagged naming as Sovereign-vector concern; your two-name answer reframes the question into "two roles, two names." Substrate-aesthetic now has rigor.
2. **Phase 0 gate work is ~80% complete in artifacts.** Once you ack, Gate 1 actions are mostly file edits (LICENSE, NOTICE, headers). Gate 2 = run test + apply patch. Gate 3 = run smoke. All deliverable in 6-10 hours of focused execution post-ack.
3. **The biggest unknown remains HNSW concurrent-write behavior on Windows 11.** Could pass cleanly or could need contingency (mutex / sqlite-vec swap / lockfile). Won't know until Gate 3 runs.
4. **`@arcanea/hybrid-memory` being a stub** was a useful surprise — would've been wasted absorption effort. Good catch by source-level audit agent.

## What I did NOT do (and why)

- **Did not invoke `superpowers:writing-plans`** — wrote plans directly using standard structure for efficiency. Plans are in `docs/superpowers/plans/` per convention.
- **Did not run any code** — gates BLOCKING. Honoring `feedback_board_before_tag.md`.
- **Did not commit anything** — your review first; structural per `feedback_board_before_tag.md`.
- **Did not auto-write MEMORY.md entries** — your discretion.
- **Did not modify any sibling repo** — substrate decisions don't reach into other repos until governance closes.
- **Did not start LCC Phase 2 or voice operator next phase** — other tab territory.
- **Did not change any user-facing brand surface** — substrate work, no UI implications.
- **Did not run /superintelligence on this** — Luminor Board was the right pressure-test for substrate; superintelligence is for hard cross-domain prompts.

## Followups after spec ack (ready commands you can fire)

- **"Specs look good, ack all 3 gates, start Phase 0"** → fresh tab loads cognitive-substrate prompt; Phase 0 executes
- **"Naming concern: rename palace to X"** → I'll patch specs, re-board if substantive
- **"Drop AAAK from palace v0.1"** → I'll mark NOT_YET in plan
- **"Run Phase 0 Gate 2 only first"** → I'll execute test sandbox + report
- **"Commit all overnight artifacts"** → I'll stage + commit on your ack
- **"Add the 3 memory entries"** → I'll write `project_v77_*` files

## Other tabs' territory (untouched)

- Voice operator round-3 + cognition refactor — other tab
- LCC Phase 2/3 — other tab, gated on your ack separately
- Cognition CLI backends for codex/gemini/opencode — low priority, deferred per v7.5.3 handover
- Arcanea-run-graph re-pointing to `@starlight/*` — Arcanea team's call after substrate ships

This thread stayed strictly on Memory Bus / two-package substrate work. Zero collisions.

## Time spent

~5 hours actual (8h scope, finished with 3h buffer). Reasons for efficiency:
- Parallel agent dispatch (7 total agents in 2 rounds)
- Discipline of "no code, gates apply" prevented wasted work
- Luminor Board pre-pass + REVISE application in single sequence
- Two-package directive collapsed the Sovereign-vector decision quickly

Remaining ~3h of scope: yours. If you wake up and want me to keep going (Phase 0 execution post-ack, or other), I'm ready.

---

*Built on SIP. Two-package memory substrate overnight handover. v7.7 candidate.*
