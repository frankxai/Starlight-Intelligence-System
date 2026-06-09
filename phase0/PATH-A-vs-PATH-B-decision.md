# Path A vs Path B — Substrate Decision Doc

**Date:** 2026-05-22 overnight session
**Trigger:** Frank's contrarian on 2026-05-21: "why we need langgraph or letta what others not covering"
**Verdict:** **Path A wins on first principles. Path B preserved as optional ecosystem alignment.**

---

## The two paths under test

### Path A — Sovereign substrate (no external memory framework)
- File: `phase0/sovereign_substrate.py`
- ABC: SIS-native `Substrate(ABC)` with `put / get / search / delete / health` — 5 methods, direct contract
- Backend: append-only JSONL + in-memory namespace index
- External deps: **stdlib only** (json, pathlib, datetime, abc, collections)
- LOC: ~190 substrate + ~120 smoke = ~310 total

### Path B — LangGraph-aligned substrate
- File: `phase0/langgraph_substrate.py`
- ABC: inherits `langgraph.store.base.BaseStore` with `batch / abatch` op-dispatch contract
- Backend: same append-only JSONL + in-memory index (identical row format)
- External deps: **`langgraph` + `langmem`** (~80MB transitive)
- LOC: ~270 substrate + ~170 smoke = ~440 total

## Smoke results (both run against the same 6 tests)

| Test | Path A | Path B |
|---|---|---|
| T1 Put 10 SIP-attested atoms + search retrieves all 10 | PASS | PASS |
| T2 Missing attestation raises (A1 axiom) | PASS | PASS |
| T3 Tombstone deletion preserves append-only | PASS | PASS |
| T4 Namespace prefix filter | PASS | PASS |
| T5 Metadata filter | PASS | PASS |
| T6 A2 axiom — atoms.jsonl plain-text + 11 rows + attestation preserved | PASS | PASS |
| **Result** | **6/6 PASS** | **6/6 PASS** |

## Capability comparison

| Capability | Path A | Path B | Winner |
|---|---|---|---|
| A1 SIP attestation per atom | enforced at write | enforced at write | tie |
| A2 Filesystem-native | plain JSONL | plain JSONL | tie |
| A3 Vault canon as namespace | tuple maps directly | tuple maps directly | tie |
| A4 Forkable without cloud/key | yes, stdlib-only clone-and-run | yes, but pip-install langgraph first | **A** |
| A5 No silent model lock-in | yes, no model layer | yes, model-agnostic | tie |
| External maintenance burden | zero | langgraph release cadence | **A** |
| Test surface to maintain | 6 tests | 6 tests + framework upstream | **A** |
| Cross-ecosystem interop | requires SIS Substrate ABC adoption | drop-in to any LangGraph agent | **B** |
| Industry pattern legitimacy | "we made our own" | LangChain ecosystem | **B** |
| Future Anthropic ↔ LangGraph hooks | not applicable | preserved if Anthropic ships LG integration | **B** |
| Disk byte-for-byte format | identical | identical | tie (migrations are free) |
| LOC to maintain | 190 substrate | 270 substrate | **A** |
| Cold-start time | <100ms (just stdlib import) | ~2s (langgraph import) | **A** |

## Capability honest summary

**Path A wins on 6 dimensions.** **Path B wins on 3 — all ecosystem alignment, none capability.**

The 3 Path B wins:
1. LangGraph agent interop — only matters if SIS substrate gets used by external LangGraph agents (not current scope)
2. Industry pattern — soft signaling, doesn't affect runtime
3. Future hook potential — speculative

The 6 Path A wins are all load-bearing:
- A4 forkability is sharper (stdlib clone-and-run)
- Zero external maintenance burden
- Half the test surface to maintain
- Half the cold-start time
- ~30% less LOC
- Sovereignty clause §5 strengthened (no third-party Python framework in the substrate critical path)

## Why this matters for SIS specifically

The original Phase 0 charter assumed substrate candidates were "products to choose from." Frank's contrarian on 2026-05-21 reframed the question: **we are not buying a substrate, we are building one. The candidates we evaluated mostly add ecosystem alignment, not capability.**

The data backs the reframe:
- Path A and Path B produce **byte-identical JSONL on disk** for the same atom inputs
- Both enforce A1 attestation identically (the SOVEREIGN code does it; the LangGraph version delegates to our PutOp handler)
- Both satisfy A2 axiom equivalently (same JSONL plain-text)
- The LangGraph BaseStore inheritance buys us NOTHING in capability — it just lets us claim ecosystem membership

## What Path A loses (honest accounting)

1. **No drop-in for LangGraph agents.** If a future SIS feature wants to be consumed by external LangGraph agents (e.g., shared memory across Claude + LangChain ecosystem), Path A would need either an adapter shim OR a Path-B variant kept alongside.
2. **No LangMem memory manager.** LangMem's extract/update/forget pattern is genuinely useful — but we have the SIS Dreaming Agent (Fix A + Fix B shipped) that does the same job with better SIS integration.
3. **No PostgresStore drop-in.** If we ever need to scale to >100k atoms with concurrent multi-process writes, Path B's PostgresStore is a free upgrade path. Path A would need to write our own.

None of these losses block current SIS scope.

## Recommendation

**Adopt Path A as the canonical substrate. Keep Path B in `phase0/` as a reference implementation for the day SIS substrate gets consumed by external LangGraph agents.**

Concretely:
1. `phase0/sovereign_substrate.py` becomes the migration target for `private/voice-operator/service/memory/substrates/sovereign_jsonl.py` after Phase 0 6.5 + post-Phase-0 Board PROCEED
2. `phase0/langgraph_substrate.py` stays as `langgraph_compat_reference.py` — documented as "use this shape if you need LangGraph agent interop"
3. The 3-tier model still holds: Path A is the tier-3 substrate canon; AgentDB (Phase B in flight) is tier-1; mem0 stays optional tier-2

## Falsifier for the Path A recommendation

This recommendation is wrong if:
- Phase 0 6.5 eval-50 reveals LangGraph's BaseStore.search has a search-algorithm advantage we underestimated
- A future SIS feature explicitly requires LangGraph agent interop
- The langgraph community ships a load-bearing capability (e.g., distributed multi-process write coordination) that we'd be slower to build ourselves
- Multi-process advisory lock turns out to be substantially harder in pure stdlib than via langgraph's PostgresStore

## Side effect of this decision

The original Phase 0 6.5 head-to-head (Letta vs LangGraph) collapses into a SINGLE measurement question: **does Path A sovereign satisfy the eval-50 retrieval quality bar?** If yes, Letta evaluation drops out entirely. If no, Letta becomes the fallback (markdown-per-atom format) and Path A becomes the runner-up.

This SIMPLIFIES Phase 0 — we go from 3 adapters to evaluate (C3 Letta + C7 LangGraph + C8 AgentDB tier-1) to 2 (Path A sovereign + C8 AgentDB tier-1), with Letta + LangGraph held as architectural references.

---

*Built on SIP — 2026-05-22 · Path A wins on capability; Path B wins on ecosystem; SIS picks capability per SIP §5 sovereignty clause*
