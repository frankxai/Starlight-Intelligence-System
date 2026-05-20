# mem0 — Findings

**Candidate:** C2
**Scored by:** Research sub-agent (general-purpose, 2026-05-20)
**Verdict:** **VIABLE** (with caveats — fails A2 for substrate canon)
**Subtotal:** 31/50

---

## TL;DR (50 words)

mem0 is an Apache-2.0 production memory layer (56.3k stars, mem0ai/mem0) that wraps an LLM-extraction pipeline over pluggable vector stores (Qdrant default, 20+ backends) + SQLite history + optional Neo4j graph. Headline strength: managed memory ops with strong namespacing. Headline weakness: DB-resident memory, LLM-extraction-by-default — not filesystem-native canon.

## Constraint axioms

- **A1 SIP attestation possible?** — **Yes (via custom metadata).** `metadata={"attestation": "Built on SIP — <hash>"}` is first-class on every `add()` call and persisted with the memory; filterable on `search()`. Not native field but indistinguishable in practice.
- **A2 Filesystem-native atoms?** — **No.** Memories live in Qdrant/Postgres+pgvector + SQLite history DB. Plain-text export via API only — without engine running you cannot `cat` an atom. **Load-bearing failure for SIS canon.**
- **A3 Vault canon layerable over?** — **Partial.** Vault becomes a metadata tag, not a structural axis. mem0's dedup/consolidation operates orthogonally to vault namespace.
- **A4 Forkable without cloud/key?** — **Yes (self-hosted).** Docker compose stack (FastAPI + Postgres+pgvector + Neo4j); `pip install mem0ai` + local Qdrant + Ollama possible. Standup ceremony non-trivial but offline-capable.
- **A5 No silent model lock-in?** — **Yes but defaults lock-in.** Default LLM = `gpt-5-mini` (lib) / `gpt-4.1-nano-2025-04-14` (server); embeddings = `text-embedding-3-small`. Configurable to Anthropic/Gemini/Ollama. Extraction step is irreducibly LLM-dependent unless `infer=False` (which then degrades to raw-storage no-dedup).

**Axiom verdict:** A2 = FAIL for SIS substrate canon. Others pass with caveats.

## Scoring (D1–D10)

| # | Dim | Score | Rationale |
|---|---|---|---|
| D1 | Ontology compat | **3/5** | `user_id`/`agent_id`/`run_id` give 3 namespace axes; custom metadata covers attestation/tier/source. Vault is metadata tag not native namespace. |
| D2 | Substrate-vs-hot-path | **2/5** | One memory bucket per `(user_id, agent_id)` namespace. No native durable-canon vs session-memory distinction. Promotion protocol is your job. |
| D3 | Cross-tab semantics | **4/5** | Self-hosted server is a singleton HTTP endpoint; all tabs talk to one FastAPI + one Postgres. Solves AgentDB-per-tab footgun cleanly. |
| D4 | Precision@10 | **3/5** | LoCoMo independent ~58% (self-reported ~66%). Hybrid retrieval (semantic + BM25 + entity) genuinely well-engineered. LLM-extraction step may lossy-summarize markdown-heavy decision docs. |
| D5 | Recall cross-session | **3/5** | Multi-signal retrieval; cross-`run_id` recall via namespace fanout. Estimated 60-75%. |
| D6 | Hybrid retrieval | **4/5** | Vector + BM25 + entity + metadata filter. No filesystem-path linkage (no filesystem). Strong vector+symbolic, weak filesystem+chronicle. |
| D7 | Attestation surface | **3/5** | Metadata-as-attestation persists but it's a tag not a structural primitive. Possible via adapter, not native. |
| D8 | Forkability | **3/5** | Docker compose stack works offline. ~30-60 min standup. Requires LLM provider choice. Not "clone and run." |
| D9 | Maintenance burden | **3/5** | ~200-400 LOC adapter. mem0 has high dep churn (2190 commits, 319 releases ≈ release every 2 days). Monthly review likely. |
| D10 | Latency p95 | **3/5** | Retrieval 100-300ms on 1000-atom corpus. Write-path LLM-extraction 500-2000ms. |

**Subtotal: 31/50**

## Integration path for SIS

- **LOC:** ~250-400 (FastAPI client + vault→metadata mapping + attestation embedder + Obsidian sync writer to keep filesystem mirror alive)
- **Wall-clock:** 12-20 hours
- **Reversibility:** Medium. API exports JSON; round-trip mechanical. Operating against mem0 namespace semantics for weeks makes walkback 2-4 days.
- **Replace vs augment:** Replaces `memory/mempalace/atoms.jsonl` + `vectors.npy` entirely. A2 failure means 6-vault canon no longer filesystem-readable without engine.

## Falsifier

Reverses if (a) mem0 ships filesystem-backend mode (no roadmap commitment), (b) SIP file-contract relaxes A2 (vanishingly unlikely; encoded-self amendment v1.1.1 reinforced it), or (c) Frank decides Obsidian-mirror decorative not load-bearing (contradicts Mirror Foundation work).

## Verdict

**VIABLE.** Mature, production-grade memory layer with strong retrieval and clean cross-tab semantics. For operational hot-path (voice operator session memory, agent run-state) it slots in with ~300 LOC adapter. **But FAILS A2** — DB-resident memory is wrong shape for substrate. Recommend AGAINST as foundation; recommend FOR consideration as operational hot-path tier *under* a sovereign substrate engine.

## Sources

- https://github.com/mem0ai/mem0
- https://docs.mem0.ai/open-source/overview
- https://docs.mem0.ai/core-concepts/memory-operations
- https://deepwiki.com/mem0ai/mem0/5-vector-stores
- https://deepwiki.com/mem0ai/mem0/12-self-hosted-server
- https://mem0.ai/blog/self-host-mem0-docker
- https://qdrant.tech/documentation/frameworks/mem0/

*Built on SIP — 2026-05-20*
