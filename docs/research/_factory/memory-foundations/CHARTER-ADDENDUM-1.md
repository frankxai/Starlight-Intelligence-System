# Charter Addendum 1 — Late candidate addition

**Parent charter:** `CHARTER.md`
**Date:** 2026-05-20 (same-day as parent)
**Trigger:** CHARTER §8 falsifier — major missed candidate surfaced during landscape scan

---

## What changed

The landscape-scan sub-agent (assignment 4 of original charter) surfaced **LangGraph + LangMem (langchain-ai)** as a major candidate the original charter missed. Per CHARTER §8 falsifier: "If any of these surface, charter gets an addendum, not silent expansion."

This is the addendum.

## Why this candidate is added (and others aren't)

LangGraph's `BaseStore` abstraction with namespaced JSON document storage + pluggable filesystem backends + model-agnostic loop = closest production-grade match to SIS's actual ontology (vaults = namespaces, atoms = JSON documents, A5 passes natively). It is *not* a memory product opinionated in the way mem0 or Letta are — it is the memory primitive a framework hands its agents. This shape is uniquely relevant to the SIS substrate decision.

Other candidates from the landscape scan are explicitly NOT added because:
- **pgvector + JSONL** — baseline reference, not a candidate. Synthesis reasons about it directly without dispatching an agent. Saves a turn.
- **MemOS / MemCube** — research-grade maturity + Linux-first. Defer to v2 of this research thread.
- **Mastra, MIRIX** — pattern-extract only. Not foundations.
- **Claude Code memory model** — constraint, not candidate.
- **A2A / Semantic Kernel** — out of scope (cross-model bridge / wrong ecosystem).

## C7 — LangGraph + LangMem

| Field | Value |
|---|---|
| Repo | https://github.com/langchain-ai/langmem |
| Framework docs | https://docs.langchain.com/oss/python/langchain/long-term-memory |
| License | MIT |
| Output path | `_factory/memory-foundations/candidates/langgraph-langmem/findings.md` |
| Agent | dispatched 2026-05-20 (background, general-purpose subagent) |
| Same format | YES — TL;DR + axioms + D1-D10 + integration + falsifier + verdict + sources |

## Updated candidate count

| # | Candidate | Status |
|---|---|---|
| C1 | mempalace-current | In progress (mempalace-baseline agent) |
| C2 | mem0 | **Complete** — VIABLE, 31/50, fails A2 |
| C3 | Letta | **Complete** — RECOMMEND, 44/50, passes all axioms |
| C4 | Cognee | In progress (Cognee+Zep agent) |
| C5 | Zep | In progress (Cognee+Zep agent) |
| C6 | Anthropic Memory API | **Complete** — REJECT on A5, 20/50 |
| C7 | LangGraph + LangMem | **Added — agent dispatched** |

7 candidates total. Synthesis cannot publish until all 7 complete.

## Falsifier for the addendum itself

This addendum is wrong if:
- C7 turns out to be the SAME shape as already-evaluated candidates (no novel signal added). Then withdraw.
- The synthesis agent finds C7's score-card cannot be compared apples-to-apples because the rubric needs revision. Then we issue Addendum 2 with rubric refinement.

## Effect on Board pre-pass

None. Board sees the synthesis once all 7 complete. Addendum is mechanical, not decisional.

---

*Built on SIP — 2026-05-20 · Addendum 1 of 1 (none expected) · Sovereignty clause §5 holds — late additions follow the same protocol as initial additions*
