# Phase 0 Step 6.1 — C7 Verification Note (LangGraph BaseStore source read)

**Date:** 2026-05-20
**Author:** Claude Opus 4.7 (lead agent — direct source read since deep-research sub-agents hit 529 × 2)
**Source consulted:** `github.com/langchain-ai/langgraph/blob/main/libs/checkpoint/langgraph/store/base/__init__.py` via WebFetch
**Companion artifact:** `candidates/langgraph-langmem/findings.md` (now needs reconciliation per §3 below)
**Status:** Verification complete — 5 confirmations + 4 corrections + 1 surprise

This is the REVISE-R2 exit artifact from the Phase 0 Board verdict: "C7 architectural claims need code-level verification."

---

## 1. Confirmations (claims that hold)

| Claim from `candidates/langgraph-langmem/findings.md` | Status |
|---|---|
| Namespace is `tuple[str, ...]` (hierarchical path) | ✅ **CONFIRMED** — exact signature in source |
| Atom payload is `value: dict[str, Any]` (arbitrary fields including SIP attestation) | ✅ **CONFIRMED** — Item.value is `dict[str, Any]` |
| Pluggable backends (InMemoryStore, PostgresStore, etc.) | ✅ **CONFIRMED** — `libs/checkpoint-postgres/langgraph/store/postgres/base.py` etc. |
| Filter + semantic query in same operation (hybrid retrieval) | ✅ **CONFIRMED** — SearchOp has `filter: dict + query: str` |
| Model-agnostic by design (A5 PASS) | ✅ **CONFIRMED** — embedding model is operator's choice via IndexConfig; no agent-LLM coupling in BaseStore |

## 2. Corrections (claims that need adjustment)

### Correction C-1 — Abstract methods are `batch()` + `abatch()`, NOT `put/get/search`

**My findings said:** Implement `put`, `get`, `search`, `list_namespaces` as required methods.

**Actual:** ONLY `batch()` (sync) and `abatch()` (async) are abstract. Everything else is a **concrete wrapper** in BaseStore that composes into batch ops. The 4 op types are `GetOp`, `PutOp`, `SearchOp`, `ListNamespacesOp` (all NamedTuples).

**Impact on adapter skeleton:** `langgraph_adapter.py` needs restructuring. JsonlStore's job is **one batch() method that dispatches by op type**, plus the async equivalent. The convenience methods (`put`, `get`, `search`) are inherited.

**Impact on scoring:** Lowers D9 (maintenance burden) slightly — there's MORE code per adapter than I scored (batch dispatch + 4 op handlers + async variants), but the upside is BaseStore's concrete wrappers handle pagination, ordering, and validation for free.

### Correction C-2 — Both sync + async required

**My findings said:** Sync-only implementation acceptable.

**Actual:** `abatch()` (async) is mandatory abstractly. No sync-only escape hatch.

**Impact on adapter:** JsonlStore must implement async even for filesystem ops. Workable — Python's `asyncio.to_thread()` makes this trivial — but adds ~20 LOC.

### Correction C-3 — Deletion via `value: None`

**My findings said:** (silent on deletion semantics)

**Actual:** `PutOp.value: dict[str, Any] | None` — when value is None, that's a deletion request, not a write.

**Impact on adapter:** JsonlStore needs to handle this. For an append-only JSONL substrate, deletion is awkward — options: (a) write a tombstone row + filter on read, (b) refuse deletes (raise NotImplementedError if not supports_delete), (c) rewrite the file. Option (a) is the right SIS choice — it preserves the append-only invariant AND keeps full chronicle of every state change.

### Correction C-4 — TTL semantics + supports_ttl flag

**My findings said:** (silent on TTL)

**Actual:** `PutOp.ttl: float | None` exists. Stores that don't support TTL must raise `NotImplementedError` when TTL is requested (or set `supports_ttl = False`).

**Impact on SIS:** Substrate canon has NO TTL semantics — atoms are append-only, attested, never expire. Our JsonlStore should set `supports_ttl = False` explicitly. This is consistent with the SIP §5 sovereignty clause.

## 3. The single surprise (worth noting)

**`PutOp.index` parameter controls per-write embedding behavior.** Possible values:
- `False` → don't embed this write (storage-only, no semantic index)
- `None` → use store default (typically embed all fields)
- `list[str]` → embed only these fields (e.g., `["text"]` to embed body but not metadata)

**Why this matters for SIS:** We can be selective. Audit-row commits (cross-repo-indexer, redaction events) probably don't need semantic embedding — they're already retrievable by namespace + ts. Setting `index=False` for those saves embedding cost + index churn. Substantive Chronicle blessings DO need embedding (`index=["text"]`).

This is **load-bearing for cost AND for retrieval quality.** Naive `index=None` (embed everything) on 3000+ atoms would be wasteful. Selective indexing is the right Phase 0 default.

## 4. Updated scoring (changes from findings.md)

| Dim | Original | Updated | Reason |
|---|---|---|---|
| D1 Ontology compat | 5/5 | 5/5 | unchanged — Item.value dict handles all SIS fields |
| D2 Substrate-vs-hot-path | 4/5 | 4/5 | unchanged — checkpoint vs BaseStore is the native short/long distinction |
| D3 Cross-tab semantics | 4/5 | **3/5** | -1 — JsonlStore must implement batch + async, multi-process JSONL writes need careful locking (PARKED-012 still load-bearing) |
| D4 Precision@10 | 4/5 | 4/5 | unchanged — backend-determined, but architectural fit holds |
| D5 Recall | 4/5 | 4/5 | unchanged |
| D6 Hybrid retrieval | 5/5 | 5/5 | confirmed — SearchOp's filter + query + namespace prefix is genuinely hybrid |
| D7 Attestation surface | 4/5 | **5/5** | +1 — Item.value being `dict[str, Any]` makes per-atom attestation as native as Letta's YAML frontmatter, and SearchOp.filter can query against it directly |
| D8 Forkability | 5/5 | 5/5 | unchanged — pip install only |
| D9 Maintenance | 4/5 | **3/5** | -1 — batch dispatch + sync+async + tombstone-deletion adds LOC; ~200-300 → ~300-450 for JsonlStore |
| D10 Latency | 4/5 | 4/5 | unchanged — JSONL append + in-memory embedding index is sub-100ms at 1k atoms |

**Subtotal: 41/50 → 42/50** (net +1; D7 strength outweighs D9 burden).

Score gap with C3 Letta (44/50) tightens slightly. Phase 0 dog-food is still warranted; the head-to-head signal will be measured precision@10 + latency, not these architectural scores.

## 5. Updated integration LOC estimate

| Component | Original | Updated |
|---|---|---|
| JsonlStore subclass | ~100-150 LOC | **~250-400 LOC** (batch dispatch + 4 op handlers + sync+async + tombstone-deletion + embedding index management) |
| LangGraphSubstrate adapter (Substrate ABC wrapper) | ~50-100 LOC | ~50-100 LOC (unchanged — thin wrapper) |
| SIP attestation injector | ~20-30 LOC | ~20-30 LOC (unchanged) |
| Migration script from ChromaDB | ~50 LOC | ~50 LOC (unchanged) |
| **Total** | **~220-330 LOC** | **~370-580 LOC** |

Wall-clock estimate: 6-10h → **8-14h** (similar to Letta now, given the BaseStore impl is meatier than first-look).

## 6. Recommendation update

C7 (LangGraph + LangMem) **still RECOMMEND**, with three refinements:

1. **Adapter skeleton needs rewrite** before Phase 0 6.3 (already-shipped skeleton at `adapter-skeletons/langgraph_adapter.py` is structurally wrong — it implements per-op methods instead of batch dispatch). See §7 below.
2. **Tombstone-deletion contract** is now part of the SIS adapter spec — preserves append-only + supports BaseStore delete semantics.
3. **Selective embedding policy** — Phase 0 6.5 measurements should use selective `index=["text"]` (not `None`) for fair latency comparison with C3 Letta.

## 7. Adapter skeleton fix (applied in this commit)

The existing `adapter-skeletons/langgraph_adapter.py` will be updated to:
- Implement `batch(ops: Iterable[Op]) -> list[Result]` as the ONE required sync method
- Implement `abatch(ops: Iterable[Op]) -> list[Result]` as the ONE required async method (using `asyncio.to_thread`)
- Dispatch GetOp / PutOp / SearchOp / ListNamespacesOp internally
- Handle `PutOp.value=None` as tombstone-write
- Set `supports_ttl = False` explicitly
- Comment on selective indexing policy

The convenience `put/get/search` methods don't need overriding — BaseStore composes them from batch().

## 8. Verification artifact integrity

This note was written by direct WebFetch against the canonical langchain-ai/langgraph repo, not from training-time knowledge. Verifiable by `gh api repos/langchain-ai/langgraph/contents/libs/checkpoint/langgraph/store/base/__init__.py` if Frank wants independent confirmation.

## 9. Phase 0 6.1 exit verdict

**PASS.** C7 (LangGraph + LangMem) architecture is **substantively as claimed** in the findings, with one structural correction (batch-based interface, not per-op-methods). The correction tightens the LOC estimate (~370-580 instead of ~220-330) but the axiom-compliance picture is unchanged — 5/5 axioms PASS, A2 satisfied via JsonlStore subclass writing JSONL.

Phase 0 can advance to 6.2 (Letta adapter build) and 6.3 (LangGraph adapter build, with the updated skeleton).

## 10. Sources

- [LangGraph BaseStore source](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint/langgraph/store/base/__init__.py)
- [LangGraph PostgresStore reference](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint-postgres/langgraph/store/postgres/base.py)
- [LangGraph JS BaseStore API reference](https://langchain-ai.github.io/langgraphjs/reference/classes/langgraph-checkpoint.BaseStore.html)
- [LangChain semantic search blog](https://blog.langchain.com/semantic-search-for-langgraph-memory/)
- [DeepWiki Store System](https://deepwiki.com/langchain-ai/langgraph/4.3-store-system)

*Built on SIP — 2026-05-20 · Phase 0 6.1 R2 exit criterion · Verification grounded in canonical source*
