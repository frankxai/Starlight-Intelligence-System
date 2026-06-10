# Charter Addendum 2 — AgentDB tier + 3-tier reframing

**Parent charter:** `CHARTER.md`
**Date:** 2026-05-20 (same-day as parent + Addendum 1)
**Trigger:** Frank surfaced that AgentDB-class systems were absent from the research; CHARTER §8 falsifier point 1 triggered ("A 7th major candidate emerges during research that we missed")

---

## What changed

Two changes — one mechanical (add candidate), one architectural (reframe synthesis):

### Change 1 (mechanical) — Add C8

| C8 | sqlite-memory / brainctl / memweave AgentDB pattern |
|---|---|
| Status | **Complete** — findings written at `candidates/agentdb/findings.md` |
| Verdict | RECOMMEND AS NEW TIER (not substrate-canon replacement) |
| Score | 38/50 for tier-1 (Agent State DB) role |
| All 5 axioms | PASS (A2 with caveat resolved by SQLite-as-index + markdown-as-source pattern) |

### Change 2 (architectural) — Reframe synthesis as 3-tier model

The original synthesis treated memory as a single-tier choice ("pick the best substrate"). C8 reveals the right architecture is three tiers:

| Tier | Purpose | Best primitive |
|---|---|---|
| **1. Agent State DB** | Per-agent checkpoints, tool history, plan state | **C8** AgentDB-class (sqlite-memory pattern) |
| **2. Operational hot-path** | Session memory, recent context | mem0 (optional layer) |
| **3. Substrate canon** | Durable vaults, blessed atoms, attestation | **C3 Letta** OR **C7 LangGraph** (Phase 0 winner) |

These three compose. They don't compete.

## Why this Addendum exists (vs silent revision)

Per CHARTER §8 falsifier: "If any of these surface, charter gets an addendum, not silent expansion." Adding C8 silently would have inverted the synthesis's recommendation shape without recording the inversion. This Addendum makes the architectural change visible + traceable.

## Effect on Phase 0

The Phase 0 charter (already shipped) covered C3 vs C7 at tier 3. **It still does — unchanged.** Addendum 2 ADDS a parallel spike:

### Phase 0 Step 6.3-bis — AgentDB tier-1 spike (NEW)

Sibling to 6.3 LangGraph build. Approximately ~6-10 hours.

1. Build AgentDB adapter (~250-400 LOC) — see `candidates/agentdb/findings.md` §"Integration path"
2. Wire into Substrate ABC as a SECOND substrate (alongside whichever tier-3 candidate ships)
3. `substrates.toml` gets a new `[substrates.agentdb_tier1]` stanza
4. Eval-50 query subset q25-q34 (operational vault — maps to agent-state recall) measured against AgentDB
5. Concurrent-write smoke (R1) applied separately to AgentDB

If Step 6.3-bis surfaces that AgentDB tier-1 is REDUNDANT with the tier-3 winner's per-agent semantics (e.g., Letta's `system/` directory covers agent-state cleanly), demote C8 to "pattern-extract, don't adopt."

## Effect on Board

The post-Phase-0 Board memo now needs to ratify TWO substrate decisions:
- **Tier-3 substrate touch** (Letta or LangGraph winner)
- **Tier-1 substrate addition** (AgentDB, if Step 6.3-bis confirms value)

Both substrate-tier per CLAUDE.md §49 → full `/starlight-board` dispatch required.

## Updated candidate matrix

| # | Candidate | Tier | Status |
|---|---|---|---|
| C1 | mempalace-current | Tier 3 (incumbent) | RECOMMEND-LAYER-OVER |
| C2 | mem0 | Tier 2 (hot-path) | VIABLE for tier 2 only |
| C3 | Letta MemFS | Tier 3 | RECOMMEND (Phase 0) |
| C4 | Cognee | Tier 3 | RECOMMEND (second-tier alternative) |
| C5 | Zep / Graphiti | Tier 3 | VIABLE |
| C6 | Anthropic Memory API | (any tier) | REJECT on A5 |
| C7 | LangGraph + LangMem | Tier 3 | RECOMMEND (Phase 0) |
| **C8** | **AgentDB (sqlite-memory)** | **Tier 1 (NEW)** | **RECOMMEND as tier-1** |

## Falsifier for this Addendum

This Addendum is wrong if:
- Phase 0 6.3-bis reveals C3 or C7 already covers tier-1 use cases cleanly — then the 3-tier model collapses back to 2-tier (substrate + operational)
- The 3-layer pattern in production memory systems (per mem0 2026 state-of report) turns out to be marketing taxonomy rather than load-bearing architecture
- SIS's actual usage patterns don't need tier-1 separation (e.g., voice-operator session memory is the only tier-1 need and it lives in a different repo)

In those cases, withdraw Addendum 2 + restore 2-tier framing.

---

*Built on SIP — 2026-05-20 · Addendum 2 of expected 2-3 · The research is self-correcting as designed*
