# Memory Foundation Rubric

**Active research:** `_factory/memory-foundations/`
**Authored:** 2026-05-20
**Lock status:** **DRAFT** — locks at Board pre-pass, then becomes immutable for this research cycle

> Rubric written BEFORE candidates evaluated. Per `feedback_audit_metrics_vs_cause.md` —
> "Audit outlier = hypothesis prompt, not diagnosis." Build the rubric first or the research sprawls.

---

## 1. Constraint axioms (non-negotiable — failures here = candidate rejected)

A candidate **must** satisfy these. No score; pass/fail.

| Axiom | Test | Why |
|---|---|---|
| **A1 — SIP attestation** | Can each atom carry `attestation: "Built on SIP — <hash>"`? | Sovereignty clause §5, non-waivable |
| **A2 — Filesystem-native** | Are durable atoms readable as plain text without running the engine? | Obsidian mirror, diff-friendly, fork-survives-engine-death |
| **A3 — Vault canon preserved** | Does the engine layer OVER the 6-vault ontology rather than replacing it? | 10-IS taxonomy locked at v7.5; vaults are canon |
| **A4 — Forkable** | Can a downstream operator inherit + run without our cloud / our key? | SIP §5; "encoded-self amendment" v1.1.1 |
| **A5 — No silent model lock-in** | Does the engine work across Claude / GPT / Gemini *or* explicitly refuse cross-model in a sovereign way? | Cross-model bridge is desired-but-sovereign; silent lock-in is rejected |

## 2. Scoring dimensions (0-5 each, 50 max)

### Architecture fit (15 points)

| # | Dimension | 0 | 3 | 5 |
|---|---|---|---|---|
| D1 | **Ontology compat** — supports {atom, vault, namespace, attestation, tier(warm/cold), source} | doesn't | 3 of 5 modeled | all 5 modeled native |
| D2 | **Substrate-vs-hot-path separation** — durable canon distinct from session memory | one undifferentiated bucket | two tiers, separate APIs | explicit substrate/operational layers w/ promotion protocol |
| D3 | **Cross-tab semantics** — singleton or coordinated; no AgentDB-per-tab footgun (per `project_agentdb_singleton_constraint.md`) | breaks past 5 tabs | works via shared filesystem | first-class singleton or session-aware coordination |

### Retrieval quality (15 points)

| # | Dimension | 0 | 3 | 5 |
|---|---|---|---|---|
| D4 | **Precision@10 on substrate canon** — top-10 results for "what's our memory architecture stance?" | misses canonical decision | finds it ≤rank 5 | finds it at rank 1 with chronicle context |
| D5 | **Recall on cross-session work** — "what shipped in v7.5.3?" finds the relevant atoms | <40% | 60-80% | >90% |
| D6 | **Hybrid retrieval** — vector + symbolic (namespace, tier, attestation, source) | vector-only | vector + tag filter | vector + filesystem path + chronicle linkage |

### Sovereignty (10 points)

| # | Dimension | 0 | 3 | 5 |
|---|---|---|---|---|
| D7 | **Attestation surface** — per-atom SIP attestation w/o adapter glue | impossible | possible via adapter | native field |
| D8 | **Forkability** — downstream operator inherits in <30 min, no permissions | requires our infra | requires our keys | runs offline from clone |

### Operational (10 points)

| # | Dimension | 0 | 3 | 5 |
|---|---|---|---|---|
| D9 | **Maintenance burden** — custom code + dep update cadence | >2000 LOC custom + monthly breakage | <500 LOC + quarterly | <100 LOC adapter + annual review |
| D10 | **Latency p95** — recall on 1000-atom corpus | >2s | 200-500ms | <100ms |

## 3. Eval protocol

### 3.1 Corpus
- **Substrate corpus** — all of `memory/mempalace/atoms.jsonl` (~3000 atoms as of 2026-05-20)
- **Vault canon** — `memory/vaults/*.md` (6 files)
- **MEMORY.md index** — `~/.claude/projects/.../memory/MEMORY.md`

### 3.2 Query set (held-out, 50 questions)
Drawn from real Frank questions in transcripts (2026-04-20 → 2026-05-20). Examples:
- "What did we ship in v7.5.3?"
- "Why is mempalace forked?"
- "What's the board-before-tag rule?"
- "Show me all crypto IS work."
- "Find the decision about layer routing."
- "What's the difference between /starlight-board and /luminor-board?"

Full query set: `_factory/memory-foundations/queries/eval-50.jsonl` (to be drafted by lead sub-agent).

### 3.3 Per-candidate procedure
1. Ingest substrate corpus (whatever format the candidate accepts; document mapping cost)
2. Run 50 queries
3. Hand-rate each result top-10 against ground-truth canonical answer
4. Compute: precision@10, recall@10, mean rank of correct answer
5. Measure: p50, p95 latency, lines-of-integration code, license, lock-in surface

### 3.4 Sub-agent assignment
One sub-agent per candidate. Sub-agents run in parallel. Each produces:
- `_factory/memory-foundations/candidates/{name}/findings.md` (against this rubric)
- `_factory/memory-foundations/candidates/{name}/score-card.json` (machine-readable)

Plus 1 synthesis sub-agent that:
- Reads all 6 score-cards
- Writes `_factory/memory-foundations/synthesis.md` (decision matrix + recommended foundation + integration path)

## 4. Candidates (locked at charter time)

| # | Candidate | Why on list |
|---|---|---|
| C1 | **mempalace-current** (atoms.jsonl + vectors.npy) | Incumbent; honest baseline measurement |
| C2 | **mem0** | Production memory layer; OSS + cloud option |
| C3 | **Letta** (was MemGPT) | Stateful agent memory hierarchy; OSS |
| C4 | **Cognee** | KG + vector hybrid; schema-driven |
| C5 | **Zep** | Long-term memory w/ temporal graph |
| C6 | **Anthropic Memory API** | Claude-native memory (released late 2025); rejected on A5 but eval'd for comparison |

Out of scope this cycle: Pinecone, Weaviate, Qdrant (pure vector DBs, no memory semantics). Could become storage backends *under* the chosen engine.

## 5. Output requirements

The synthesis sub-agent produces:

1. **Decision matrix** — candidates × dimensions table, totals, axiom pass/fail
2. **Recommendation** — single foundation choice, with integration path
3. **Falsifier** — "what observation would reverse this recommendation in 6 months?"
4. **Migration cost** — concrete LOC + hours to move current corpus to recommended engine
5. **Cross-model bridge stance** — explicit sovereign refusal OR concrete bridge design

## 6. What this rubric does NOT score

- Visualization (separate research thread; see `docs/research/premium-3d-memory-palace-survey-2026-05-17.md`)
- Cross-model bridge engineering (acknowledged unsolved industry-wide; out of scope for foundation choice)
- Cost (TCO) — added in v2 of rubric after v1 ships; foundation decision is pre-cost

## 7. Falsifier (when this rubric is wrong)

If post-research Board surfaces a constraint axiom we missed (e.g., "GDPR right-to-erasure incompatible with append-only attestation"), rubric is incomplete and Board issues REVISE. We update axioms, NOT scores.

---

*Built on SIP — 2026-05-20 · Rubric authored before candidates eval'd · Locks at Board pre-pass*
