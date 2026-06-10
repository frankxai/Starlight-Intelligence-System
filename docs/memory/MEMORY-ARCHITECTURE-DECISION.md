# Memory Architecture — Decision Record (2026-06-10)

> Built on SIP. Answers the standing question: how should SIS memory actually work —
> markdown, embeddings, mem0/mempalace/Letta, or build-our-own? Grounded in the
> memory-foundations research (`docs/research/published/memory-foundations-2026-05.md`),
> the PARKED-007 head-to-head (`tools/proving-ground/scorecards/2026-06-10-memory-lane-parked007.json`),
> and fresh 2026 external research. Researched + decided by the Starlight Evaluator.

## The one-paragraph answer

Memory is **two layers, and conflating them is the mistake.** Layer 1 is the
**canonical memory** — `MEMORY.md`, `memory/vaults/*.md`, the Obsidian vault — and it
**stays markdown.** Markdown-as-source-of-truth is not a weakness to fix; it is the moat
the 2026 industry is independently converging on (Letta MemFS, memweave, memsearch/OpenClaw,
markdown-vdb all do exactly this). It is forkable, diffable, git-versioned, human-auditable,
and model-independent — every SIP axiom in one design. Layer 2 is the **retrieval index** —
a *derived, rebuildable* structure over the canon. That is the only place embeddings are
even a question, and the answer there is **hybrid (lexical + semantic), not embeddings-always.**

## The four questions, answered

### 1. Should memory be managed primarily with .md files? → YES.
The canon stays markdown. Delete the index and you rebuild it from the files; delete the
files and you've lost memory. Files are truth, index is shadow. Guardrail: keep writes
**single-process** (the Memory Bus singleton already enforces this). The documented
"scaling wall" of markdown memory is *concurrent multi-agent writes + ACID*, not markdown
itself — and SIS's `:7373` singleton sidesteps it. Do **not** move canon into a database.

### 2. Do we always need embeddings? → NO.
At 520 atoms, lexical retrieval (BM25/FTS5, or the current IDF+cosine) is a defensible
floor — the public-vault retrieval eval already hits 100% recall@5 on lexical alone, and
PARKED-007 showed model2vec embeddings improved recall only +3.5–6.9pp while precision@10
stayed flat at 0.155. Embeddings are **one signal**, best added as a *second channel* fused
with lexical (RRF), not a replacement. They compound with scale and earn their keep on
paraphrase/synonym queries — add them as augmentation, never as the sole index.

### 3. Absorb mempalace / mem0 / Letta as PRIMARY, build our own, or not worth it? → KEEP OUR OWN.
History (verified): SIS *did* absorb the real `mempalace` package (ChromaDB + MiniLM ONNX
under the hood) as `mempalace_upstream.py`, then **deliberately moved off it** to a
self-built `sovereign` JSONL substrate (PRIMARY since 2026-05-24) — stdlib-only, IDF+cosine,
**~51× lower p95 latency than the Letta baseline**, and it closes the A2 (filesystem-native)
axiom that ChromaDB's binary segments violated.

| Option | Verdict | Why |
|---|---|---|
| **`sovereign` (own JSONL)** | **KEEP as PRIMARY** | Passes all 5 axioms; ~300 LOC, zero deps; fastest. The null-hypothesis floor won on merit. |
| mem0 | reject as primary | A2 FAIL (DB-resident, LLM-extraction default); graph tier paywalled. Fine as optional hot-path only. |
| Letta MemFS | don't adopt engine | Scored highest (44/50) and is markdown-native — but bundles an agent runtime + Docker you don't need. **Steal the MemFS frontmatter discipline, not the package.** |
| Cognee / Zep-Graphiti | not now | GraphRAG / temporal-graph — adopt only if a vertical needs relationship-reasoning over time. |
| Anthropic Memory API | REJECT | A5 FAIL — Claude lock-in. |
| real `mempalace` (Chroma) | already left | It *is* the A2 violation we escaped. Don't go back. |

**Build our own further? No new engine.** The engine is done and correct. The work is
better *retrieval* and better *measurement*, not a new memory framework.

### 4. Highest-leverage next build → HYBRID retrieval + an honest ground-truth.
Un-park **PARKED-002 (RRF)**: add a model2vec semantic channel to `sovereign.py` and
RRF-fuse it with the existing IDF lexical channel — one substrate, two signals, one rerank.
This is the documented precision lever (the scorecard says so: precision@10 is bounded
*without* fusion). Pair it with a **non-lexical ground-truth** (30–50 LLM-judged or
hand-labeled relevance pairs) so precision@10 stops being structurally handicapped by a
lexical judge — "the measurement is the bottleneck as much as the embedder."

## ⚠ Migration-completeness gap (found 2026-06-10, must fix first)
The live `sovereign` store (`memory/mempalace_sovereign/atoms.jsonl`) holds **~24 atoms**,
while the frozen corpus (`memory/mempalace/atoms.jsonl`) holds 520. Every eval to date
scored the *frozen* corpus the router does **not** actually serve. Re-ingest the canon into
the sovereign store before any further memory eval, or the numbers describe a corpus nobody
queries. This is gated (a data operation on the memory substrate) — see recommendation.

## Patterns to steal (not packages to adopt)
- **Letta MemFS** — markdown + YAML frontmatter discipline for atoms.
- **Anthropic memory tool** — "view the memory directory first" retrieval prologue.
- **mem0** — extraction + consolidation heuristics (what's worth remembering).
- **Graphiti** — temporal edges, *if/when* a vertical needs time-aware facts.

Built on SIP — Starlight Intelligence Protocol.
