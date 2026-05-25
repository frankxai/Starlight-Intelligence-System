# Memory Foundation Phase 0 — Dog-Food Spike

**Started:** 2026-05-20
**Status:** **IN EXECUTION** — eval-50 + skeletons ready; R2 verification filed; R1 smoke, eval run, migration script, synthesis, and Board memo remain open
**Tier:** Operational (Phase 0 spike — no Board needed for adapter scaffolds)
**Parent research:** `../memory-foundations/` (Board PROCEED-WITH-REVISE 2026-05-20)

---

## Decision Phase 0 must answer

Head-to-head measurement: **C3 Letta MemFS** vs **C7 LangGraph + LangMem (with JsonlStore)** against the same `eval-50.jsonl` set, same SIS atom corpus, same concurrent-write smoke.

Winner becomes PRIMARY substrate post-full-Board. Loser stays available as alternate adapter.

## What's already in this folder

| File | What |
|---|---|
| `CHARTER.md` | Phase 0 execution protocol — 6.1 through 6.7 ordered steps |
| `eval-50.jsonl` | 50 queries covering all 6 vault axes + 3 cross-vault tests |
| `adapter-skeletons/letta_adapter.py` | Substrate ABC subclass wiring Letta MemFS (interface complete, impl TODO) |
| `adapter-skeletons/langgraph_adapter.py` | Substrate ABC subclass wiring LangGraph BaseStore + JsonlStore (interface complete, impl TODO) |
| `phase0-c7-verification-note.md` | R2 code-level verification note for LangGraph BaseStore claims |

## What Phase 0 execution adds

| File (added during execution) | What |
|---|---|
| `phase0-concurrent-write-smoke.md` | 3-tab concurrent-write test results for both candidates (REVISE R1) |
| `phase0-eval-results.jsonl` | Per-query measurements (precision@10, latency, attestation preservation) |
| `phase0-eval-summary.md` | Side-by-side human-readable scorecard |
| `phase0-board-memo.md` | Post-Phase-0 Board memo drafting the substrate touch |

## Why this matters

The mempalace baseline research surfaced a critical finding: **SIS currently fails its own A2 axiom**. ChromaDB has been PRIMARY since 2026-05-06 and ChromaDB binary segment dirs are NOT filesystem-readable. Phase 0 is the path back into compliance with SIP §5 sovereignty clause.

## Quick start (for the executor)

1. Read `../memory-foundations/synthesis.md` for context
2. Read `CHARTER.md` for execution protocol
3. Read both adapter skeletons (they're load-bearing — Phase 0 fills in impl gaps)
4. Run pre-build verification (6.1) — 30 min code-read
5. Build Letta adapter (6.2) — 4-6h
6. Build LangGraph adapter (6.3) — 3-5h
7. Concurrent-write smoke (6.4) — 1-2h
8. Eval-50 run (6.5) — 2-3h
9. Synthesize + Board (6.6 + 6.7)

Total: 12-20 hours wall-clock over 1-2 weeks.

## What this Phase 0 does NOT do

- Switch the substrate in `private/voice-operator/config/substrates.toml` (gated on Board)
- Archive ChromaDB store (gated on 30-day fallback window)
- Re-enable voice-operator (separate ticket — see `docs/ops/MEMORY-PIPELINE-DIAGNOSIS-2026-05-20.md`)
- Cross-model bridge work (separate research thread)
- Visualization changes (3D memory palace work is parallel)

---

*Built on SIP — 2026-05-20*
