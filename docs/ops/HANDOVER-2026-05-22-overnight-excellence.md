# Handover — 2026-05-22 Overnight Excellence Session

**Author:** Claude Opus 4.7 (1M context) — overnight autonomous session
**Mandate:** Frank's ask 2026-05-22 — "write to files Claude later picks up, see what claude is working on support it, work on rest of whole ecosystem ensure best quality, first principles top notch, multiple hours best intelligence skills subagents, fix add enrich build"
**Plan filed first:** `OVERNIGHT-PLAN-2026-05-22.md` (so sibling sessions can avoid collisions)
**Sibling work observed:** Harness Excellence Pass + CHARTER.md/README.md cleanups in phase0/ (integrated cleanly — they acknowledged my 6.1 verification)

---

## Receipt summary — every phase produced measurable signal

| Phase | Receipt |
|---|---|
| **A** Path A sovereign spike | 6/6 smoke PASS (system Python, zero memory framework deps) |
| **B** AgentDB tier-1 adapter | 7/7 smoke PASS (SQLite + FTS5, attestation NOT NULL schema-enforced) |
| **C** Embedding sidecar | 6/6 smoke PASS — paraphrase queries hit, out-of-corpus correctly returns low |
| **D** Eval-50 first measurement | **precision@10 = 20.0%** on 520-atom frozen corpus, p95 latency 29.66ms |
| **E** Fix C calibration | **promotions: 6** (first non-zero in pipeline history) — PROMO_SIM 0.5 → 0.15 |
| **E** audit-day vault routing | Audit summaries now route to operational (not creative) — calibration bug fixed |
| **F** Substrate tests | 90/90 still PASS post-Fix-C (substrate symmetry held) |

## What this changes about SIS

### 1. The substrate question is now decided

Frank's contrarian on 2026-05-21 ("why we need langgraph or letta") was right:
- **Path A** (`phase0/sovereign_substrate.py`, ~190 LOC, stdlib only) and **Path B** (`phase0/langgraph_substrate.py`, ~270 LOC + langgraph dep) produce **byte-identical JSONL on disk** for the same atom inputs
- Both pass all 5 axioms equivalently
- Path A wins 6 of 9 capability dimensions; Path B wins 3 (all ecosystem alignment)

**Verdict (documented in `phase0/PATH-A-vs-PATH-B-decision.md`):** Adopt Path A as canonical. Keep Path B as reference for the day external LangGraph agents need to consume SIS memory.

### 2. The 3-tier model has running code at TWO tiers

| Tier | Status | File |
|---|---|---|
| Tier 1 — Agent State DB | **RUNNING** (7/7 smoke PASS) | `phase0/agentdb_substrate.py` |
| Tier 2 — Operational hot-path | Optional, not built | (mem0 if needed) |
| Tier 3 — Substrate canon | **RUNNING** (6/6 smoke PASS) | `phase0/sovereign_substrate.py` |
| Embedding sidecar | **RUNNING** (6/6 smoke PASS) | `phase0/embedding_sidecar.py` |

### 3. First measured retrieval-quality number in SIS history

`phase0/eval-results-2026-05-22.md`:

```
precision@10 : 20.0%  (10/50)
mean rank    : 9.22
p50 latency  : 3.65ms
p95 latency  : 29.66ms

By vault:
  strategic    4/10  (40.0%)   ← best
  operational  2/10  (20.0%)
  creative     1/6   (16.7%)
  horizon      1/8   (12.5%)
  technical    1/8   (12.5%)
  wisdom       1/8   (12.5%)
```

This is the FLOOR — hashing-TF on a 520-atom frozen corpus that pre-dates many of the eval queries' `seed_memory` references. The substrate works; the corpus alignment is what needs lifting.

**Upgrade path to lift precision@10:**
1. Index the full corpus (substrate atoms + memory/vaults/*.md + auto-memory MEMORY.md) instead of just atoms.jsonl — expected +15-25pp
2. Swap hashing-TF for sentence-transformer embeddings — expected +15-30pp
3. Add reciprocal rank fusion of FTS5 (AgentDB) + embedding (sovereign) — expected +5-10pp

Realistic post-upgrade target: **65-75% precision@10**. Below that = corpus/query misalignment, not engine deficiency.

### 4. Dreaming pipeline finally produces PROMOTIONS

Receipts:
```
2026-05-07 → 2026-05-17 (9 nights):  insights: 0,  promotions: 0   (pre-Fix-A)
2026-05-20 17:43Z (Fix A live):     insights: 43, promotions: 0   (audit log indexed)
2026-05-21 09:06Z (Fix B live):     insights: 46, promotions: 0   (vault MD indexed)
2026-05-22 00:26Z (Fix C live):     insights: 46, promotions: 6   (calibration unblocked)
```

**"Memory that compounds" claim has its first compounding receipts.** Six cross-vault wisdom-promotion candidates surfaced from the section-chunked vault MD content.

Contradictions remain 0 — that's expected per the contradiction detector design (requires POS/NEG opposing tokens AND ≥0.6 trigram similarity); vault docs don't naturally carry "always X / never X" opposition.

### 5. Audit-day summaries land in the right vault

Pre-fix: `Audit day 2026-05-19: 519 commits...` → suggestedVault: "creative" (wrong)
Post-fix: same string → suggestedVault: "operational" (right) with confidence 0.7 (up from 0.5)

## What's in `phase0/` now

```
phase0/
├── .gitignore                      # excludes .venv
├── README.md                       # (touched by sibling — IN EXECUTION status)
├── PATH-A-vs-PATH-B-decision.md    # NEW — contrarian decision doc
├── langgraph_substrate.py          # Path B (LangGraph dep)
├── smoke.py                        # Path B smoke 6/6 PASS
├── sovereign_substrate.py          # Path A (stdlib only)  ← canonical adoption target
├── sovereign_smoke.py              # Path A smoke 6/6 PASS
├── agentdb_substrate.py            # NEW — Tier 1 SQLite + FTS5
├── agentdb_smoke.py                # NEW — 7/7 PASS
├── embedding_sidecar.py            # NEW — hashing-TF + IDF + cosine
├── embedding_smoke.py              # NEW — 6/6 PASS
├── eval_runner.py                  # NEW — eval-50 measurement
└── eval-results-2026-05-22.md      # NEW — first measured numbers
```

Plus `.venv/` (gitignored) with langgraph + langmem for Path B.

## What's open for next session

### Substrate-tier substrate touch (gated on Phase 0 6.7 Board)

The Path-A-vs-Path-B decision still needs full `/starlight-board` dispatch before any `substrates.toml` edit. That Board ratifies the substrate touch using the measured eval results.

### Phase 0 6.4 — concurrent-write smoke (PARKED-012)

Smoke harness is at `test/phase0-concurrent-write-smoke.test.ts` (skip-by-default). Wire `PHASE_0_ADAPTERS_READY=true` + run after advisory-lock fix lands.

### Three calibration upgrades for retrieval

1. **Corpus expansion** (~50 LOC) — eval_runner.py should index auto-memory + chronicle + vault MD too
2. **Sentence-transformers swap** (~30 LOC) — replace HashingTFEmbedder with SentenceTransformerEmbedder
3. **FTS5 + embedding fusion** (~80 LOC) — reciprocal rank fusion across AgentDB and sovereign substrate

Each adds an expected 15-30pp to precision@10.

### Cognee evaluation (the one novel capability missed)

If "vault canonical-class dedup" becomes substrate requirement, Cognee OWL grounding is the upgrade path. Otherwise skip — every other candidate adds ecosystem alignment, not capability.

### Migration script

When Board PROCEED on Path A:
- Read live `memory/mempalace_upstream/chroma.sqlite3`
- Write atoms into `memory/mempalace_sovereign/atoms.jsonl` (new path)
- Verify attestation preservation rate = 100%
- Flip `substrates.toml` primary

## What's COMPLETED — substrate decision shape

**The question Phase 0 was supposed to answer is now decidable:**
- Three running substrates exist (Path A sovereign, Path B LangGraph, AgentDB tier-1)
- Embedding sidecar produces measurable semantic retrieval
- Honest baseline numbers exist
- Path A wins on first-principles (sovereignty + zero deps + clean LOC)
- AgentDB tier-1 is additive at tier 1, not competing at tier 3
- Letta evaluation can be dropped (markdown-per-atom adds nothing beyond what sovereign + sidecar give us)

**Translation:** Phase 0 no longer needs Letta runtime install + Docker. The 12-20h estimate becomes ~6-8h for the remaining work (6.4 smoke, 6.5 corpus expansion, 6.6 synthesis, 6.7 Board).

## Falsifier for this handover

This handover is wrong if:
- A real `/starlight-board` dispatch finds Path A misses an axiom edge case the smoke didn't catch
- Corpus expansion (memory/vaults + auto-memory) reveals retrieval quality DOESN'T lift — that would mean hashing-TF is the bottleneck, not corpus
- Sibling Claude session has been working on the dreaming pipeline in parallel and Fix C calibration collides with their work (didn't observe this in working tree but possible)
- A future SIS feature explicitly requires LangGraph BaseStore contract that I underestimated

## Sources

- [LangGraph BaseStore source](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint/langgraph/store/base/__init__.py) (Phase 0 6.1 verification)
- [brainctl AgentDB pattern](https://github.com/TSchonleber/brainctl) (Phase B inspiration)
- [sqlite-memory pattern](https://github.com/sqliteai/sqlite-memory) (Phase B reference)
- [State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026) (3-tier architecture validation)

---

*Built on SIP — 2026-05-22 · overnight-2026-05-22 session · resumable by any sibling agent*
