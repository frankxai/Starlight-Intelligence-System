# Memory Foundations — Landscape Scan

**Date:** 2026-05-20
**Author:** Research sub-agent (landscape-scan)
**Purpose:** Identify candidates the charter missed; rank "include in next cycle" priority

---

## Ranked findings

### 1. LangGraph + LangMem (langchain-ai) — **HIGH PRIORITY, ADD AS C7**

- **URL:** https://github.com/langchain-ai/langmem · https://docs.langchain.com/oss/python/langchain/long-term-memory
- **License:** MIT
- **What it is:** LangGraph ships a `BaseStore` abstraction with namespaced JSON document storage, plus pluggable backends (`InMemoryStore`, `PostgresStore`, `RedisStore`). `LangMem` (separate package on PyPI) adds memory managers that extract/update/forget atoms automatically and prompt-optimizer primitives that refine system prompts based on conversation history. Namespace-as-tuple, search-by-content, decoupled from any specific LLM provider.
- **Why it might matter to SIS:** **Closest production-grade match to SIS's actual ontology.** Namespaces map to vaults. JSON documents map to atoms. Pluggable backends mean we keep filesystem-native (A2) by writing a `JsonlStore` over `memory/mempalace/atoms.jsonl`. **Model-agnostic by design** — LangGraph passes memory in/out of the agent loop, not via Anthropic-specific tool schemas. A5 passes natively. Postgres-backed for production scale-out, in-memory for tests. LangMem's "memory manager" pattern is exactly what we'd want for chronicle promotion (operational → substrate). Sits between mempalace-current and Letta in abstraction level, with much better cross-model story than any other commercial offering.
- **Include in next cycle?** **YES — added to this cycle as C7. Full eval dispatched 2026-05-20.**

### 2. pgvector + JSONL — null-hypothesis baseline

- **URL:** https://github.com/pgvector/pgvector
- **License:** PostgreSQL License (permissive, BSD-style)
- **What it is:** Not a memory product — a **non-product**. Postgres extension adding `VECTOR` column type with HNSW + IVFFlat indexes for similarity search. Combined with append-only JSONL for source-of-truth atoms: full ACID, SQL joins across atoms/vaults/chronicles/attestations, hybrid retrieval (`WHERE vault = 'strategic' AND embedding <-> $1 < 0.3`), Postgres backup/restore tooling, cross-OS support, every major cloud has managed pgvector. Boring, proven, sovereign.
- **Why it might matter to SIS:** The **honest baseline below mempalace-current**. If we built the simplest possible thing that satisfies the rubric, it would be ~300 LOC of "JSONL writer + pgvector reader + filesystem mirror." Forkability is maximal (any operator can run Postgres). Cross-model is trivial (embedding model decoupled from agent model). Attestation is a column. Sovereignty total. Latency at 3000 atoms sub-100ms with HNSW. Risk: **maintenance** — we own the schema, the indexes, the embedding pipeline.
- **Include in next cycle?** **Referenced in synthesis as "what does NOT using a memory product cost?" floor.** No separate agent dispatched — pgvector is well-understood; the synthesis can reason about it from known properties.

### 3. MemOS / MemCube (MemTensor) — defer with watch-list

- **URL:** https://github.com/MemTensor/MemOS
- **License:** Apache 2.0
- **What it is:** 2025 research-academic OSS project (UCSD/NYU/Tsinghua adjacent). Core abstraction is the **MemCube** — standardized memory primitive that tracks provenance, supports fusion across heterogeneous backends, enables cross-task skill reuse. Two arXiv papers (May 2025 short, July 2025 full). Claims 35.24% token savings + SOTA on memory benchmarks. Linux-ready, Windows/macOS in development.
- **Why it might matter to SIS:** MemCube is conceptually closest to our atom-with-attestation primitive. Native provenance tracking is a sovereignty win. "OS for memory" framing matches SIS's substrate-vs-operational layering. Risk: academic-grade maturity, Linux-first (we're Windows-primary), and "self-evolving" claims need verification.
- **Include in next cycle?** **Defer to v2 of this research thread.** Worth a 4-hour eval next cycle, not this one.

### 4. Mastra memory (mastra.ai) — pattern-extract only

- **URL:** https://mastra.ai/docs/memory/overview
- **License:** Apache 2.0
- **What it is:** TypeScript-native agent framework. Memory has three modes: **Observational Memory** (background agent compresses raw history into dense observation log), **Working Memory** (persistent structured user data), **Semantic Recall** (vector-search past messages).
- **Why it might matter:** Observational Memory is genuinely novel — instead of indexing every turn, compress to dense observation log. Maps onto SIS's chronicle-promotion idea: index ~300 chronicled observations distilling 3000 atoms.
- **Include in next cycle?** **MAYBE — low-medium priority.** 1-hour pattern-extract on Observational Memory in synthesis; don't adopt framework.

### 5. Claude Code's own memory model (CLAUDE.md + Auto Memory + Skills MEMORY.md)

- **URL:** https://code.claude.com/docs/en/memory
- **License:** N/A (product, not library) — but the pattern is public
- **What it is:** Four-layer file-based memory: (1) static `CLAUDE.md` rule files at user/project/managed/local scope, recursively loaded, (2) **Auto Memory** — Claude writes own notes about user prefs, feedback, project context, (3) Claude Skills with per-skill `MEMORY.md`, (4) session-transcript JSONL store. Frank already uses this pattern heavily.
- **Why it might matter:** Not a foundation candidate — a **convention SIS is already inside.** Any foundation must coexist (can't replace `CLAUDE.md`, must layer over). Right framing: Claude Code's model is the **operational hot-path** for Claude sessions; SIS substrate sits underneath. Foundation must promote atoms from Claude Code's auto-memory into substrate canon cleanly.
- **Include in next cycle?** **NOT as a candidate — as a constraint.** Add section to synthesis.md documenting the coexistence contract.

### 6. A2A / ADK Event Compaction (Linux Foundation) — defer

- **URL:** https://a2aproject.org · https://github.com/a2aproject/A2A
- **License:** Apache 2.0
- **What it is:** Google's Agent-to-Agent protocol (April 2025, LF June 2025, 150+ org adopters by April 2026). Agent Cards + Tasks + JSON-RPC 2.0 transport. ADK 1.0 Event Compaction: sliding window + summarization. 38% token reduction + 18% latency.
- **Why it might matter:** Not a memory protocol — an agent-coordination protocol with memory-management primitives attached. Could become the wire format SIS uses to communicate with non-Claude alliance agents. **Cross-model bridge** (out of scope this cycle) might eventually land here.
- **Include in next cycle?** **NO — defer to future cross-model bridge research thread.** Watch-list only.

### 7. MIRIX (multi-agent memory research, 2025) — pattern-extract only

- **URL:** https://github.com/Mirix-AI/MIRIX
- **License:** Apache 2.0
- **What it is:** UCSD/NYU research (July 2025 arXiv). Six structured memory types — Core, Episodic, Semantic, Procedural, Resource, Knowledge Vault — coordinated by multi-agent controller. ScreenshotVQA 35% higher accuracy than RAG, 99.9% storage reduction. Multimodal-native.
- **Why it might matter:** Six-memory-type taxonomy is **suggestive but not aligned with our 6-vault canon** — different ontology. Multimodal-first might overlap with voice/video work. Research-grade maturity.
- **Include in next cycle?** **NO — too research-grade for foundation choice.** 30-min pattern-extract worth doing on the six-type taxonomy and how it composes with our six-vault model.

### 8. Microsoft Semantic Kernel Vector Stores — skip

- **URL:** https://learn.microsoft.com/en-us/semantic-kernel/concepts/vector-store-connectors/
- **License:** MIT
- **What it is:** Microsoft's pluggable vector-store abstraction. Connectors for In-Memory, Postgres/pgvector, SQLite, Qdrant, Redis, Azure AI Search. C#/Python/Java first-party. Currently **Preview**.
- **Why it might NOT matter:** C#-first (weak match for our TS/Python/PowerShell substrate), Preview status = breakage risk, vector-only semantics (no chronicle/attestation primitives). Better fit as a *backend* under chosen engine than as engine itself.
- **Include in next cycle?** **NO — skip.** Adds noise to matrix without adding signal. Could revisit if SIS spawns a .NET vertical.

---

## Summary table

| Rank | Candidate | Action this cycle |
|---|---|---|
| 1 | **LangGraph + LangMem** | **Add as C7 — agent dispatched 2026-05-20** |
| 2 | pgvector + JSONL | Reference in synthesis as null-hypothesis floor |
| 3 | MemOS / MemCube | Defer to v2 |
| 4 | Mastra Observational Memory | Pattern-extract in synthesis (1h) |
| 5 | Claude Code memory model | Coexistence constraint section in synthesis |
| 6 | A2A / ADK Event Compaction | Watch-list (cross-model bridge thread) |
| 7 | MIRIX | Pattern-extract on six-type taxonomy (30 min) |
| 8 | Semantic Kernel | Skip |

---

*Built on SIP — 2026-05-20 · Landscape scan satisfies CHARTER §8 falsifier — addendum is the correct move, not silent expansion*
