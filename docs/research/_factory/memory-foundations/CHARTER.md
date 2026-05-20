# Memory Foundations — Research Charter

**Slug:** `memory-foundations`
**Chartered:** 2026-05-20
**Tier:** Substrate (`/starlight-board` required before publish)
**Rubric:** `../../_methodology/memory-rubric.md` (locks at Board pre-pass)
**Status:** In-Progress

---

## 1. The decision this research must answer

> "What retrieval+evaluation engine should SIS adopt as memory foundation, given
> (a) 6-vault canon ontology is fixed,
> (b) SIP attestation is non-waivable,
> (c) cross-tab must work,
> (d) cross-model is desired-but-sovereign,
> (e) mempalace fork must be resolved (see `MEMORY-DRIFT-RESOLUTION-2026-05-20.md`)?"

## 2. The decision this research must NOT answer

- Visualization design (separate thread — `premium-3d-memory-palace-survey-2026-05-17.md` is the active one)
- Cross-model bridge engineering (acknowledged unsolved industry-wide; future research)
- Voice operator memory hot-path (operational tier, different rubric)

Scope discipline matters. If a sub-agent drifts into these, redirect.

## 3. Candidates (per rubric §4)

1. **C1 — mempalace-current** (custom atoms.jsonl + vectors.npy)
2. **C2 — mem0** (production memory layer)
3. **C3 — Letta** (was MemGPT; agent state hierarchy)
4. **C4 — Cognee** (KG + vector hybrid)
5. **C5 — Zep** (long-term + temporal graph)
6. **C6 — Anthropic Memory API** (Claude-native; eval'd for comparison, expected to fail A5)

## 4. Sub-agent assignments

| Agent | Candidate | Output |
|---|---|---|
| Research-1 | C1 — mempalace honest baseline | `candidates/mempalace/findings.md` |
| Research-2 | C2 — mem0 | `candidates/mem0/findings.md` |
| Research-3 | C3 — Letta | `candidates/letta/findings.md` |
| Research-4 | C4 — Cognee | `candidates/cognee/findings.md` |
| Research-5 | C5 — Zep | `candidates/zep/findings.md` |
| Research-6 | C6 — Anthropic Memory API | `candidates/anthropic-memory/findings.md` |
| Synthesis | all | `synthesis.md` + recommendation |

Each sub-agent receives: this charter + the rubric. Each writes ONE file at the path above.

## 5. Scope guardrails for each sub-agent

- **Time-box** — current state (2025-2026), no historical archaeology
- **Source bar** — official docs + GitHub + 1-2 practitioner case studies. No marketing blogs.
- **Rubric scoring** — every dimension scored with rationale. No dimension skipped.
- **Falsifier required** — what would change the score?
- **Integration cost estimate** — concrete LOC + hours for SIS adoption path

## 6. Synthesis sub-agent's specific job

- Read all 6 candidate findings.md files
- Build decision matrix (candidates × dimensions)
- Recommend ONE foundation choice + integration path
- Identify cross-cutting findings (e.g., "no candidate handles cross-model — defer to future research")
- Write Board memo skeleton (synthesis.md + draft of `docs/boards/2026-05-20-memory-foundation-spawn.md`)

## 7. Publication path

1. Synthesis → `docs/research/_factory/memory-foundations/synthesis.md`
2. Board pre-pass → `docs/boards/2026-05-20-memory-foundation-spawn.md`
3. On Board PROCEED → move to `docs/research/published/memory-foundations-2026-05.md`
4. Site route renders from `published/` → `starlightintelligence.org/research/memory-foundations`
5. `/bless` ratifies into Chronicle

## 8. Falsifier for the charter itself

This charter is wrong if:
- A 7th major candidate emerges during research that we missed (e.g., Mastra memory, LangGraph memory, Microsoft Semantic Kernel memory)
- The rubric's axioms turn out to be partially incompatible with the SIP §5 sovereignty clause in ways we didn't anticipate
- Board issues REVISE on the methodology (vs. on the recommendation)

If any of these surface, charter gets an addendum, not silent expansion.

---

*Built on SIP — 2026-05-20 · Charter is locked; rubric is locked; candidates locked; only findings remain open*
