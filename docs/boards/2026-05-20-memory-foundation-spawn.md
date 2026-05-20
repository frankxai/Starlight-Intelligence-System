# Board Memo — Memory Foundation Spawn

**Date:** 2026-05-20
**Tier:** Substrate (per CLAUDE.md §49 — touches attestation rules + file-contract)
**Board:** `/starlight-board` (canon-free, functional vector names)
**Status:** LOCKED for pre-pass
**Author:** Claude (Opus 4.7, lead-with-authority)

---

## 1. The decision the Board must ratify

**Adopt Phase 0 dog-food protocol: head-to-head eval of C3 (Letta MemFS) + C7 (LangGraph + LangMem) as candidate substrates behind the existing Substrate ABC. Winner becomes PRIMARY substrate; current ChromaDB (`mempalace_upstream/`) demoted to fallback for 30-day migration window; frozen `mempalace/atoms.jsonl` archived to `_archive/`.**

This is a 2-step ratification:
1. **Today's Board:** ratifies the **decision protocol** (Phase 0 dog-food, not the substrate choice itself)
2. **Future Board** (post Phase 0): ratifies the **substrate choice** based on measured eval results

## 2. What ships if Board says PROCEED (today)

1. Synthesis moves to `docs/research/published/memory-foundations-2026-05.md`
2. Site `/research/memory-foundations-2026-05` route renders the artifact
3. `lib/research.ts` flips `memory-foundations-2026-05` status to "published"
4. `MEMORY.md` gets a project memory entry for this decision-protocol ratification
5. Phase 0 dog-food spike chartered → new research factory project under `_factory/memory-foundations-phase0/`
6. The retracted/corrected drift-resolution doc (v1 → v2) stays as the precedent record

NO substrate changes ship today. The substrate decision is gated on Phase 0 measurement.

## 3. Evidence the Board has

- **Rubric** (locked before candidates evaluated): `docs/research/_methodology/memory-rubric.md` — 5 axioms (non-negotiable) + 10 scoring dimensions (50 max)
- **Charter + Addendum 1**: `docs/research/_factory/memory-foundations/CHARTER.md` + `CHARTER-ADDENDUM-1.md`
- **7 candidate findings**: `docs/research/_factory/memory-foundations/candidates/{mempalace,mem0,letta,cognee,zep,anthropic-memory,langgraph-langmem}/findings.md`
- **Landscape scan**: 8 missed candidates ranked
- **Synthesis (final)**: `docs/research/_factory/memory-foundations/synthesis.md`
- **Drift-resolution v1 → v2 precedent**: `docs/ops/MEMORY-DRIFT-RESOLUTION-2026-05-20.md`

## 4. Pressure-vector pre-pass

| Vector | Probe | Pre-emptive answer |
|---|---|---|
| **Architecture** | Does Phase 0 break the Substrate ABC? | No. Both C3 and C7 adapters slot into existing 25-LOC ABC. Net code change during Phase 0: +200-300 LOC (one adapter per candidate during eval). |
| **Sovereignty** | Does Phase 0 risk vendor lock-in? | No. Both C3 and C7 are OSS (Letta Apache-2.0, LangGraph MIT). Both pass A4+A5. Phase 0 measures, doesn't commit. |
| **Compatibility** | Does Phase 0 break running systems? | No. ChromaDB stays PRIMARY during Phase 0. Eval adapters are disabled-by-default in `substrates.toml`. |
| **Operational** | Will dog-food eval add operational burden? | ~1-2 weeks of focused eval work. Bounded scope. Bencher harness already exists (currently refusing because `voice-sessions/` is empty — Phase 0 includes corpus regeneration). |
| **Future-fit** | Does Phase 0 leave room for cross-model bridge later? | Yes. C3 and C7 are both model-agnostic. Cross-model bridge is a separate research thread. |
| **Overseer** | Is the research method sound? | YES — rubric locked at charter time; falsifier sections present per candidate; CHARTER §8 falsifier triggered Addendum 1 (LangGraph) proving the process works. **AND** v1 drift-resolution was retracted via v2 when baseline agent caught the inversion — process working as designed. |

## 5. Anticipated REVISE items

1. **"Eval-50 query set must be diverse"** — REVISE: query set should cover all 6 vault namespaces, not just Frank's recent transcript questions. ACK pre-emptively: Phase 0 charter will require coverage across {strategic, technical, creative, operational, wisdom, horizon}.
2. **"Attestation preservation must be tested"** — REVISE: Phase 0 must verify SIP attestation survives the migration from ChromaDB to chosen candidate. ACK: Phase 0 adapter spec must include attestation-preservation smoke test as mandatory pre-Board exit criterion.
3. **"Cross-tab semantics under 3+ tab load"** — REVISE: PARKED-012 (multi-process safety) must be addressed during Phase 0 not deferred. ACK: Phase 0 charter includes 3-tab concurrent-write smoke test as exit criterion.

If Board issues these REVISE items: address them in Phase 0 charter, re-submit. No substrate change shipped meanwhile.

## 6. Anticipated BLOCK conditions

This Board memo should be BLOCKED if:

1. Synthesis recommends adopting Anthropic Memory API as substrate (would violate SIP §5). *Not the case — synthesis REJECTS Anthropic on A5.*
2. Synthesis recommends archiving `memory/mempalace_upstream/` immediately (would delete live writes). *Not the case — Phase 0 keeps ChromaDB PRIMARY throughout.*
3. Synthesis recommends a substrate that fails ≥1 axiom. *Not the case — both Phase 0 candidates pass all 5.*
4. The retraction of v1 drift-resolution doc is not acknowledged in the precedent record. *Acknowledged: v2 explicitly retracts v1, lesson logged as `feedback_verify_runtime_not_presence.md`.*

## 7. Falsifier for the Board pass itself

The PROCEED here is wrong if:
- Phase 0 dog-food reveals both candidates' precision@10 < 0.6 on SIS-specific queries → REVERT to pgvector+JSONL baseline (300 LOC, 5/5 sovereignty)
- Within 30 days of Phase 1 (winner adoption), three or more sub-agents hit cross-tab corruption under normal write load → REVERT via same Board protocol
- The chosen candidate's upstream pivots away from filesystem-native architecture within 6 months → REVERT to incumbent + re-Board

In all cases, REVERT via same Board protocol (substrate-tier change, board-before-rollback).

## 8. Precedent recorded

This memo is the first Board pass under the "wrong-v1-retracted-via-v2" pattern:

> **Precedent — v1 of `MEMORY-DRIFT-RESOLUTION-2026-05-20.md` had the substrate direction inverted; the mempalace baseline research sub-agent caught it during deep code-read before any irreversible action.** v2 retracted and corrected. Lesson saved as `feedback_verify_runtime_not_presence.md`. The substrate-tier process — Board-before-tag + parallel research agents + axiom-checking rubric — collectively prevented a destructive ship. The Board should acknowledge this precedent as evidence the process is working as designed, not as evidence of process failure.

## 9. Sovereignty clause check (SIP §5)

Does any part of this Phase 0 protocol waive or weaken the sovereignty clause? **No.**
- Both candidates pass A4 (forkable without cloud/key) and A5 (no model lock-in).
- Phase 0 adapters run offline.
- Both stores remain filesystem-native after migration (resolves the current A2 violation).
- No vendor key required for Phase 0 if Ollama is used as embedding model.

The decision enhances sovereignty, doesn't dilute it.

## 10. Cost estimate

| Phase | Work | Time | Confidence |
|---|---|---|---|
| Phase 0 — Dog-food eval | Build 2 adapters + 50-query corpus + side-by-side measurement | 1-2 weeks | High (bounded scope) |
| Phase 1 — Adapter ships disabled | Winner adapter wired in, `substrates.toml` stanza added | 1-2 days | High |
| Phase 2 — Flip to PRIMARY | substrates.toml change + monitoring | 1 day | High |
| Phase 3 — Deprecate ChromaDB | 30 days of dual-write, then archive | 30 days wall-clock | Medium (depends on retrieval quality holding) |
| Phase 4 — Board ratify + /bless | Final Board + Chronicle entry | 1 day | High |

Total ~6 weeks from Board PROCEED to final ratification.

---

## Verdict request

Board, ratify this **decision protocol**:

1. **PROCEED** Phase 0 dog-food of C3 (Letta MemFS) + C7 (LangGraph + LangMem) as substrate candidates
2. **ACK** the v1→v2 drift-resolution precedent as process-working-as-designed
3. **DEFER** substrate-choice ratification to post-Phase-0 Board pass with measured eval results

---

*Built on SIP — 2026-05-20 · Board memo locked · Substrate change is GATED on Phase 0, not approved today*
