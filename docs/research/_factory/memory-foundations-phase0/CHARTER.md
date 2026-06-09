# Phase 0 — Memory Foundation Dog-Food Charter

**Parent:** `docs/research/_factory/memory-foundations/CHARTER.md` (Phase -1 — candidate evaluation)
**Date chartered:** 2026-05-20
**Trigger:** Board verdict `docs/boards/2026-05-20-memory-foundation-verdict.md` (PROCEED-WITH-REVISE)
**Scope:** Side-by-side measurement of **C3 Letta MemFS** vs **C7 LangGraph + LangMem (with JsonlStore)** as candidate SIS substrates
**Tier:** Operational (Phase 0 spike — no Board needed for adapter scaffolds; Board fires on post-Phase-0 substrate touch)
**Status:** **CHARTERED — ready to execute**

---

## 1. The decision Phase 0 must answer

> "Which of the two file-shaped candidates (Letta MemFS, LangGraph + LangMem) achieves higher precision@10, lower latency p95, and cleaner attestation preservation when run against the real SIS atom corpus, AND survives 3-tab concurrent-write smoke testing?"

Phase 0 produces evidence. Post-Phase-0 Board ratifies the substrate touch.

## 2. Three REVISE items to address (per parent Board verdict)

| REVISE | What | Where addressed |
|---|---|---|
| R1 | 3-tab concurrent-write smoke test as exit criterion | §6.4 |
| R2 | C7 architectural claims need code-level verification | §6.1 (mandatory code-read step) |
| R3 | Eval-50 query set must be committed BEFORE adapters built | §3 (already drafted alongside this charter as `eval-50.jsonl`) |

## 3. Eval-50 query set (delivered alongside this charter)

Location: `docs/research/_factory/memory-foundations-phase0/eval-50.jsonl`

Distribution across SIS substrate ontology (all 6 vault axes covered per REVISE-1):
- 10 strategic vault queries (decisions, alliances, brand register)
- 8 technical vault queries (architecture, patterns, infra)
- 6 creative vault queries (ideas, design inspiration)
- 10 operational vault queries (state, metrics, current sprint)
- 8 wisdom vault queries (timeless principles)
- 8 horizon vault queries (long-arc questions)

Plus 3 cross-vault queries that test namespace traversal.

Each query has fields: `id`, `vault`, `query_text`, `expected_atom_ids[]` (ground-truth), `query_class` (recall|disambig|cross-vault).

## 4. Adapter scaffold deliverables

Reference implementations under `docs/research/_factory/memory-foundations-phase0/adapter-skeletons/` — public, MIT, fork-survives.

- `letta_adapter.py` — Substrate ABC subclass + MemFS path mapping + frontmatter validator + attestation injector
- `langgraph_adapter.py` — Substrate ABC subclass + JsonlStore (BaseStore subclass) + namespace tuple mapper + attestation injector

These are SKELETONS (interface + docstrings + commented impl gaps). Phase 0 execution fills them in.

## 5. Out of scope for Phase 0

- Substrate switch in `substrates.toml` (gated on Board post-Phase-0)
- ChromaDB archival (gated on Phase 0 winner adoption)
- Voice-operator re-enable (separate ticket per memory pipeline diagnosis)
- Cross-model bridge work (separate research thread)
- Visualization layer changes (3D memory palace research is parallel thread)

## 6. Phase 0 execution protocol (in order)

### 6.1 — Pre-build verification (R2)
**Required before any adapter coding starts.**

- 30-min code-read of LangGraph BaseStore source: `langgraph/store/base.py`, `langgraph/store/memory.py`, `langgraph/store/postgres.py`
- Verify the claims in `candidates/langgraph-langmem/findings.md` against actual source
- Write 5-bullet note: confirmations + corrections + any axiom-relevant surprises
- File: `phase0-c7-verification-note.md`

### 6.2 — Build Letta adapter
- Implement `letta_adapter.py` skeleton against current Substrate ABC
- Docker pull `letta/letta:latest`; verify it runs offline w/ Ollama
- Ingest current ChromaDB corpus (~3000 atoms) via dump → migration script
- Smoke test: 10 random queries return non-empty results

### 6.3 — Build LangGraph + JsonlStore adapter
- Implement `langgraph_adapter.py` skeleton + `JsonlStore(BaseStore)` subclass
- `pip install langgraph langmem`
- Ingest same corpus into a fresh `atoms-phase0.jsonl`
- Smoke test: 10 random queries return non-empty results

### 6.4 — Concurrent-write smoke (R1)
**Required before any score is final.**

- 3 simulated Claude tabs each calling `substrate.commit()` 100 times in parallel
- Both candidates undergo identical test
- PASS criteria: zero corrupted lines, zero audit-log gaps, latency p95 < 500ms
- File: `phase0-concurrent-write-smoke.md`

### 6.5 — Run eval-50
- Both candidates against same `eval-50.jsonl`
- Measure: precision@10, recall@10, mean rank of correct answer, latency p50, latency p95, attestation-preservation rate
- Hand-score borderline results
- File: `phase0-eval-results.jsonl` (machine-readable) + `phase0-eval-summary.md` (human-readable scorecard)

### 6.6 — Synthesize + write post-Phase-0 Board memo
- Side-by-side scorecard
- Recommendation: winner OR tie → Board ratifies dual-substrate-pluggable forever
- Falsifier: what would reverse this recommendation in 30 days?

### 6.7 — Full `/starlight-board` dispatch (NOT self-Board this time)
- Substrate touch IS on the table → real Board required
- 5 vector agents + 1 overseer per `/starlight-board` skill
- PROCEED → ship adapter; REVISE → address; BLOCK → defer + escalate

## 7. Phase 0 success criteria (exit gates)

Phase 0 produces a Phase-1-ready proposal when ALL of:
- [ ] R1 concurrent-write smoke PASS for both candidates
- [ ] R2 verification note filed (C7 claims confirmed or corrected)
- [ ] R3 eval-50 committed before adapter build (verified by git log)
- [ ] Eval results show clear winner OR tie within ±2%
- [ ] Migration script (ChromaDB → winner format) exists + passes attestation-preservation test
- [ ] Synthesis recommendation written + Board memo drafted

## 8. Phase 0 falsifier

Phase 0 itself is invalid if:
- The eval-50 set turns out to systematically favor file-shaped candidates over DB-resident ones (regression-test against mempalace incumbent baseline)
- The concurrent-write smoke can't be reliably reproduced (depends on filesystem semantics that vary by OS)
- 30 minutes of LangGraph code-read reveals a structural mismatch that wasn't in the public docs (e.g., BaseStore mandates a behavior that violates SIS attestation model)

In those cases, pause + escalate; do not push adapters into production decision.

## 9. Estimated effort

| Step | Hours |
|---|---|
| 6.1 Pre-build verification | 0.5h |
| 6.2 Letta adapter | 4-6h |
| 6.3 LangGraph adapter | 3-5h |
| 6.4 Concurrent-write smoke | 1-2h |
| 6.5 Run eval-50 | 2-3h (+ hand-scoring) |
| 6.6 Synthesize | 1-2h |
| 6.7 Full Board | 0.5-1h (Board fires; agents do the work) |
| **Total wall-clock** | **12-20 hours over 1-2 weeks** |

## 10. Owner

Frank (or sub-agent delegate). Each step is bounded scope.

---

*Built on SIP — 2026-05-20 · Phase 0 chartered · Board (post-Phase-0) is the gate on substrate touch*
