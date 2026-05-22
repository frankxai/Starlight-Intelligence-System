# Overnight Plan — 2026-05-22 (Claude Opus 4.7)

**Author:** Claude (Opus 4.7, 1M context) — autonomous overnight session
**Mandate:** Frank ask — "write to files Claude later picks up, see what claude is working on support it, work on rest of whole ecosystem ensure best quality, research data foundations metrics, first principles top notch, multiple hours best intelligence skills subagents, fix add enrich build"
**Session ID:** overnight-2026-05-22

---

## Sibling work I'm NOT touching

Per `feedback_sibling_tab_stage_immediately.md` + observed working-tree state, another Claude session is mid-Harness-Excellence-Pass with uncommitted work in:

- `DELIVERY.md`, `ONBOARDING.md`, `MEMORY.md` (root), `context/STATE.md`
- `site/content/explainer.md`, `site/src/lib/sip.ts`, `site/src/app/page.tsx`, `site/src/app/architecture/page.tsx`, `site/src/app/badge/`, `site/src/app/layout.tsx`, `site/src/app/verticals/[slug]/page.tsx`
- `console/src/components/SubstrateScene.tsx`, `console/package.json`
- `scripts/check-agent-harness.mjs`, `.agent-harness.json`
- `agents/AGENT_REGISTRY.md`, `skills/SKILL_REGISTRY.md`, `skills/skill-rules.json`
- `transmissions/channels/acos-channel.md`, `context/repo-contexts/acos-context.md`
- `test/v80-platform-prompts.test.ts`, `package.json`, `README.md`
- Possibly `src/dreaming.ts` if their work touches the pipeline

**Rule for tonight:** Stage by filename only (never `git add -A`). Read those files only for context, never modify.

## My non-overlapping scope

| Path | What I may write |
|---|---|
| `phase0/` | Path A sovereign substrate + AgentDB adapter + embedding sidecar + eval-50 runner |
| `docs/research/_factory/memory-foundations-phase0/` | Phase 0 execution artifacts (eval results, decision doc, smoke results) |
| `docs/research/_factory/memory-foundations/` | New candidate findings if needed |
| `docs/ops/OVERNIGHT-*.md` | This plan + handover |
| `docs/ops/HANDOVER-2026-05-22-*.md` | Final handover |
| `test/phase0-*` and `test/dreaming-*` | New tests (BUT NOT modifying sibling-touched test/v80-platform-prompts.test.ts) |
| `~/.claude/projects/.../memory/` | Auto-memory atoms (mine, not in repo) |
| Mermaid + research markdown only | No site/src/* edits (sibling-active) |
| `phase0/.gitignore` | Phase 0 isolation |

## Six-phase overnight execution

### Phase A — Path A sovereign spike (substrate decision proof)

**Goal:** Prove the contrarian Path A — JsonlStore without LangGraph dep — works equally well. Closes the "do we need LangGraph?" question with running code.

- A.1 — Strip BaseStore inheritance, inline op dispatch (~30 LOC change)
- A.2 — Re-run smoke (expect 6/6 PASS)
- A.3 — Write `phase0/PATH-A-vs-PATH-B-decision.md` documenting tradeoffs with measured LOC + dep cost

### Phase B — AgentDB tier-1 adapter (running code)

**Goal:** Complete the 3-tier picture. AgentDB (SQLite + FTS5) for per-agent durable state.

- B.1 — `phase0/agentdb_substrate.py` (~300 LOC) — sqlite3 stdlib, FTS5 virtual table, attestation column with NOT NULL constraint
- B.2 — `phase0/agentdb_smoke.py` — mirror of langgraph smoke pattern (6 tests)
- B.3 — Verify both substrates can co-exist (same dispatching ABC pattern)

### Phase C — Embedding sidecar (first measured semantic retrieval EVER)

**Goal:** SIS has never had measured semantic retrieval numbers. Wire a lightweight embedding model + cosine search.

- C.1 — `phase0/embedding_sidecar.py` — sentence-transformers (all-MiniLM-L6-v2, 384-dim) OR fallback to ChromaDB ONNX. In-memory numpy index.
- C.2 — Extend JsonlStore + AgentDB SearchOp handlers to use embedding sidecar when `op.query` is provided
- C.3 — Smoke test: semantic search retrieves correct atom from 50-atom corpus

### Phase D — Eval-50 first measurement (the gate to substrate decision)

**Goal:** Run a subset of `eval-50.jsonl` against ≥1 adapter. Produce the FIRST actual measured retrieval numbers for SIS.

- D.1 — `phase0/eval_runner.py` — reads eval-50.jsonl, runs each query against substrate, scores hit-rate via `expected_match` substring match in top-10 results
- D.2 — Run against JsonlStore + AgentDB
- D.3 — Write `phase0/eval-results-2026-05-22.md` — first-measurement scorecard

### Phase E — Calibration fixes (Fix C + audit-day vault)

**Goal:** Close the two known dreaming pipeline gaps. CONSOLIDATION_LOG goes from "compounding but partial" to "compounding fully."

- E.1 — Read `src/contradiction.ts` to understand the similarity function
- E.2 — Fix C: adjust threshold OR algorithm so cross-vault similarity actually fires
- E.3 — Audit-day vault fix: change `extractInsights` rule so audit-day summaries go to "operational" not "creative"
- E.4 — Tests for both fixes
- E.5 — Re-run dreaming pipeline, expect promotions > 0

### Phase F — Handover + memory updates

**Goal:** Make the work resumable.

- F.1 — `docs/ops/HANDOVER-2026-05-22-overnight-excellence.md`
- F.2 — Auto-memory atoms for each substantive shift
- F.3 — Updated must-do reflecting overnight progress
- F.4 — Multiple commits + push to GitHub (no SSO surprises)

## Subagent usage policy

API has 529'd before on dispatched agents. Tonight's policy: **dispatch agents ONLY for genuine deep-research that I can't do directly.** Candidate: Cognee OWL exploration if E.2 reveals SIS needs ontology-grounded dedup. Otherwise direct work.

## Quality gates

Every phase ends with:
- Receipt printed (test pass count, smoke result, eval number)
- Acknowledged open items in the artifact
- No silent fail (if I can't ship a phase, the handover names why)

## Falsifier for the overnight plan

This plan is wrong if:
- Sibling session commits collide with my phase0/ scope (impossible — they're not in phase0/)
- API conditions block `pip install sentence-transformers` (fallback to ChromaDB ONNX embeddings via existing install)
- Phase 0 6.4 smoke harness reveals corruption under load that Path A introduces (fall back to LangGraph)
- One of my fixes breaks 90 substrate symmetry tests (pre-commit hook will catch it)

## Estimated wall-clock

| Phase | Estimated hours |
|---|---|
| A — Path A spike | 0.5–1h |
| B — AgentDB impl + smoke | 2–3h |
| C — Embedding sidecar | 1–1.5h |
| D — Eval-50 first measurement | 1–1.5h |
| E — Calibration fixes | 1–2h |
| F — Handover + push | 0.5h |
| **Total** | **6–9.5h** |

Realistic ship-to-Frank-in-morning target: **A + B + D minimum. C + E + F stretch.**

---

*Built on SIP — 2026-05-22 · overnight-2026-05-22 session · resumable by any sibling agent*
