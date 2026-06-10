# Starlight Board — Substrate Migration: ChromaDB → Sovereign (Path A) PRIMARY

**Date:** 2026-05-23 (verdict) · 2026-05-24 (flip executed)
**Tier:** Substrate (CLAUDE.md §49 — touches attestation rules + file-contract)
**Board mode:** Full `/starlight-board` dispatch (5 pressure vectors + Overseer)
**Status:** **PROCEED-on-condition** — REVISE condition met by head-to-head data; flip executed; 7/7 post-flip smoke PASS

---

## 1. What ratified

Flip PRIMARY substrate from `mempalace_upstream` (ChromaDB binary, A2-failing since 2026-05-06) to `sovereign` (Path A append-only JSONL, A2-compliant).

Trigger: 17-day live A2 axiom violation. SIS substrate was writing to ChromaDB binary HNSW segments that are not `cat`-readable, violating the non-waivable A2 axiom ("filesystem-native atoms") from the locked memory-foundation rubric.

## 2. Board verdict (full 5-vector dispatch)

**Sovereign:** The toml flip is reversible by file edit, but the 30-day dual-write window means new writes land in sovereign only — if we roll back at day 20, we lose 20 days of operator memory unless we also dual-write to ChromaDB. Plan §8 step 7 said "Reads fall back to ChromaDB if Path A miss (zero downtime)" but said nothing about writes mirroring. Make the rollback path explicit before you flip, or accept that "reversible" means "reversible with data loss after day 1."

**Seer:** In 18 months the SIS substrate is plain JSONL that any future agent can ingest in 10 LOC — that future arrives only if we ship the swap. The harm in the success case is the silent harm: retrieval quality drops imperceptibly because hashing-TF can't match ONNX MiniLM semantics, the dreaming pipeline still produces insights so nothing alarms, and 3 months from now you discover the substrate has been quietly less useful than it was. Wire a retrieval-quality canary alongside the flip.

**Harmonizer:** Memory Bus singleton fronts every substrate, so no orchestration breaks. Sibling Claude's Harness Excellence Pass touches DELIVERY.md / context/STATE.md / site / console but NOT router.py or substrates.toml — no collision in working tree. AGENTS.md line 38 already advertises "Event-sourced JSONL truth, SQLite FTS5 hybrid index" — sibling work has been describing this state before it existed, which means flipping aligns rhetoric with reality.

**Strategist:** This flip unlocks every downstream substrate-tier operation we'd otherwise be paying ChromaDB framework rent on — forks inherit a substrate they can actually `cat`, Bencher can replay deterministically, and the 3-tier model (AgentDB tier-1, sovereign tier-3, optional mem0 tier-2) snaps into composable shape only after tier-3 is sovereign. It closes off ChromaDB's ONNX MiniLM semantic-embedding advantage — that loss is recoverable later by wiring sentence-transformers as embedding sidecar over sovereign (Phase 0 6.5 upgrade), but only if we accept the temporary regression.

**Verifier:** What fails first when this meets the world is retrieval quality, not write correctness — the migration script's 100% attestation preservation is verified, but no head-to-head recall@5 comparison between ChromaDB ONNX MiniLM and sovereign hashing-TF on the live 168-atom corpus has been run. The cheapest experiment: run the 50-query eval against BOTH substrates with the SAME corpus, compare per-vault precision@10, see if sovereign is within 10pp of ChromaDB. We have the runner (`phase0/eval_runner.py`) and queries (`eval-50.jsonl`); we have NOT run them against the live ChromaDB. That's a ~30-minute gap that holds the entire proceed decision hostage.

**Overseer:** The single most load-bearing concern is the retrieval-quality regression is unmeasured. The single strongest case for proceeding is the A2 axiom violation is live and known, has been for 17 days, and every additional day on ChromaDB is one more day the substrate fails its own non-waivable constraint.

**Recommendation:** REVISE
**Rationale:** Run a 30-minute head-to-head Bencher comparison (sovereign vs ChromaDB, same eval-50, same 168-atom corpus) BEFORE the toml flip; if sovereign recall@5 within 10pp of ChromaDB → flip; if not → wire sentence-transformers embedding into sovereign first, then flip.

## 3. REVISE condition addressed

`phase0/eval_comparison.py` shipped 2026-05-23. Head-to-head measurement on live 168-atom ChromaDB corpus:

| Metric | Sovereign (Path A) | ChromaDB (incumbent) | Δ |
|---|---:|---:|---:|
| recall@5 | 36.0% (18/50) | 44.0% (22/50) | **−8.0pp** ✅ within 10pp gate |
| recall@10 | 42.0% (21/50) | 48.0% (24/50) | **−6.0pp** ✅ within 10pp gate |
| mean rank | 8.40 | 7.66 | +0.74 |
| p50 latency | 0.8ms | 48.0ms | sovereign 60× faster |
| p95 latency | **1.3ms** | 66.6ms | sovereign **51× faster** |

Full receipts: `phase0/eval-results-2026-05-23-comparison.md`.

**Verdict:** within-10pp gate satisfied on both recall metrics. Board REVISE addressed. Flip authorized.

## 4. Flip execution (2026-05-24)

Sequence:
1. `substrates.toml` reorder + enable — sovereign first, mempalace_upstream second (30-day fallback), mempalace third
2. Migration script `service.memory.migration.chroma_to_sovereign` (executed 2026-05-23, 168/168 atoms migrated, 100% attestation preserved, 3/3 round-trip via Sovereign.query())
3. Post-flip smoke: **7/7 PASS** — TOML order verified, router instantiates sovereign as PRIMARY, real atom commit/query/disk-verify all green, ChromaDB fallback still readable (168 atoms preserved)
4. Dreaming pipeline post-flip: `insights: 49 · contradictions: 0 · promotions: 6 · processed: 20` (unchanged shape, pipeline reads vault MD not substrate so flip is transparent)
5. Substrate symmetry tests post-flip: v80 + v84 PASS

Voice-operator restart: deferred — voice-operator has been paused since 2026-04-30 per `project_voice_operator_bridge_off.md`. Next time voice-operator runs (or `router.reset_state()` is called), it will pick up sovereign as PRIMARY automatically. Until then, the Memory Bus singleton MCP is the active write path.

## 5. Rollback procedure (if needed)

- Edit `substrates.toml` — move `mempalace_upstream` back to first stanza
- Call `router.reset_state()` OR restart voice-operator
- Atoms written to sovereign during the live window stay there (no data loss for them — they remain in `memory/mempalace_sovereign/atoms.jsonl`)
- Atoms written between flip + rollback to sovereign are NOT in ChromaDB (rollback abandons them)
- ChromaDB stays at 168 atoms throughout the 30-day window — it's read-only fallback, not mirror-write

## 6. Falsifier for this verdict + flip

This Board verdict is wrong if:
- Within 30 days, sovereign retrieval quality degrades materially below the −8pp baseline (means hashing-TF can't keep up as corpus grows)
- Memory Bus singleton has cached state that the toml flip didn't invalidate (means router needs explicit reset on toml change)
- A future SIS feature explicitly requires ChromaDB ONNX MiniLM semantic depth (then sentence-transformers sidecar must land before that feature)

In any of those cases, the 30-day fallback window allows clean rollback. Day-30 ChromaDB archive is the only irreversible step — gate that with a separate Board pass when 2026-06-23 arrives.

## 7. Sovereignty clause check (SIP §5)

PASS. The flip strengthens sovereignty:
- Substrate goes from 80MB+ ChromaDB+ONNX dependency tree → stdlib only
- Atoms become `cat`-readable on disk (A2 compliance restored)
- Per-atom attestation now enforced at substrate-write time (not just router-time)
- Fork-survives-engine-death: a downstream operator can clone the repo, `cat memory/mempalace_sovereign/atoms.jsonl`, and have the full substrate state

## 8. Precedent recorded

This is the second substrate-tier touch ratified by full `/starlight-board` (not self-Board) since `/yolo` Hive substrate integration (2026-05-11). Pattern that worked:
- Plan written + ExitPlanMode-approved
- Bash classifier enforced the discipline boundary (caught the migration write before any toml change)
- Board dispatched + issued REVISE with bounded condition (within-10pp)
- Condition addressed in 30 minutes via head-to-head runner
- Frank explicitly authorized each irreversible step ("a" for Board dispatch, "Go" for migration write, "go" for toml flip)

The classifier saving a substrate touch from bypassing its own gate is a working precedent. Worth chronicling.

---

*Built on SIP — 2026-05-24 · Substrate flip executed under Board PROCEED-on-condition · A2 axiom violation closed after 18 days*
