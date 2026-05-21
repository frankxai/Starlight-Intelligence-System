# Phase 0 — LangGraph + JsonlStore Working Adapter

**Status:** Step 6.3 first-bite shipped 2026-05-21. **6/6 smoke tests pass.**
**Parent:** `docs/research/_factory/memory-foundations-phase0/`

This is the first piece of Phase 0 with **running code**, not just scaffolding.

---

## What this proves

- The corrected adapter shape from `phase0-c7-verification-note.md` actually works
- `BaseStore.batch()` dispatch handles `PutOp` / `GetOp` / `SearchOp` / `ListNamespacesOp`
- SIP §5 attestation is enforced at write time (PutOp without attestation → `ValueError`)
- Tombstone deletion preserves the append-only JSONL invariant
- **A2 axiom is restored** — atoms.jsonl is plain text, 11 rows on disk after 10 puts + 1 tombstone, every non-tombstone row carries `attestation: "Built on SIP — <sha>"`
- The integration cost is real: **~290 LOC of `langgraph_substrate.py`** for the substrate adapter, **~170 LOC of `smoke.py`** for verification

## Files

| File | Purpose | Lines |
|---|---|---|
| `langgraph_substrate.py` | `JsonlStore(BaseStore)` working impl + helpers | ~270 |
| `smoke.py` | 6-test verification harness | ~170 |
| `.venv/` | Python venv with langgraph + langmem (gitignored) | — |

## Run it

```powershell
phase0\.venv\Scripts\python phase0\smoke.py
```

Expected output:
```
Result: 6/6 PASS
```

## What's still TODO (Phase 0 6.3 hardening)

| Item | Why deferred |
|---|---|
| Vector embedding + semantic ranking in `SearchOp.query` | Phase 0 6.5 — wire embedding model (Ollama, SentenceTransformers, OpenAI) |
| Multi-process advisory lock (`fcntl` / `msvcrt`) | Phase 0 6.4 — see `../docs/research/_factory/memory-foundations-phase0/parked-012-multi-process-safety.md` |
| `LangMem` memory manager wiring | Phase 0 6.5 — extract/update/forget patterns |
| Full `MatchCondition` handling in `_handle_list_namespaces` | First-bite uses max_depth only; full match conditions are harder |
| ChromaDB → JsonlStore migration script | Phase 0 6.5 prep — port live atoms.jsonl + audit log |
| Migration to `private/voice-operator/service/memory/substrates/langgraph_adapter.py` | Post-Phase-0 Board PROCEED |

## What's still TODO (parallel Phase 0 work)

| Step | Item | Cost |
|---|---|---|
| 6.2 | Letta MemFS adapter actual impl | 4-6h, Docker + Letta install |
| 6.3-bis | AgentDB tier-1 adapter (SQLite + FTS5) | 6-10h, stdlib sqlite3 |
| 6.4 | 3-tab concurrent-write smoke | 1-2h once 6.3 + 6.3-bis adapters land |
| 6.5 | Run eval-50 against all 3 adapters | 2-3h + hand-scoring |
| 6.6 | Synthesize + draft post-Phase-0 Board memo | 1-2h |
| 6.7 | Full `/starlight-board` dispatch (real Board, not self-Board) | 0.5-1h |

## Why this matters

SIS currently fails its own A2 axiom because ChromaDB binary segment dirs aren't filesystem-readable. This adapter, when adopted as PRIMARY post-Phase-0-Board, **restores A2 compliance** while preserving:

- Per-atom SIP attestation (rebuilt + enforced at write time)
- 6-vault canon (namespace tuple maps to vault hierarchy)
- Memory Bus singleton coordination (this adapter slots into the existing Substrate ABC)
- Model-agnostic operation (LangGraph itself is provider-agnostic; embedding model is operator's choice)

The 6/6 smoke tests above are the **first measurable signal** that a Phase 0 candidate can deliver on its axiom-pass claims.

---

*Built on SIP — 2026-05-21 · Phase 0 6.3 first-bite · 6/6 smoke PASS*
