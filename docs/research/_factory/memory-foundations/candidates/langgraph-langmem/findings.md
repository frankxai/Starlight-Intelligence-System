# LangGraph + LangMem — Findings

**Candidate:** C7 (added by Charter Addendum 1)
**Scored by:** Lead agent (Claude Opus 4.7) from landscape-scan findings + LangGraph public docs
**Scoring confidence:** **MEDIUM** — no dedicated deep-research agent (two attempts hit 529 Overloaded). Findings below are sourced from the landscape-scan sub-agent's research + Claude's training-time knowledge of LangGraph + cross-referenced with LangChain official docs. Dog-food required in Phase 0 to confirm scores before final Board ratification.
**Verdict:** **RECOMMEND** (provisional — pending Phase 0 verification)
**Subtotal:** 41/50 (estimated)

---

## TL;DR (50 words)

LangGraph (MIT, langchain-ai) ships `BaseStore` — a namespaced JSON-document memory primitive with pluggable backends (`InMemoryStore`, `PostgresStore`, `RedisStore`). LangMem adds memory managers (extract/update/forget) over the store. Model-agnostic by design. Strength: framework primitive matching SIS ontology (namespace=vault, document=atom). Weakness: no filesystem backend ships out-of-box — ~50-100 LOC to write `JsonlStore`.

## Constraint axioms

| Axiom | Verdict | Evidence |
|---|---|---|
| A1 SIP attestation possible? | **PASS** | `BaseStore` documents are arbitrary JSON dicts. `attestation: "Built on SIP — <hash>"` rides as a top-level field. Indexed via metadata config (`index_fields` parameter). |
| A2 Filesystem-native atoms? | **PASS (conditional on writing JsonlStore)** | Out-of-box: `InMemoryStore` (volatile), `PostgresStore` (binary), `RedisStore` (binary). No filesystem backend ships. BUT — `BaseStore` is an explicit abstract class designed for backend pluggability; ~50-100 LOC `JsonlStore` subclass satisfies the contract and gives plain-text atoms.jsonl. **Whether this counts as "PASS" depends on whether you count "we have to write 100 LOC" as a pass or partial.** Marking PASS because the architecture invites it. |
| A3 Vault canon layerable over? | **PASS (strong)** | `namespace` is a *tuple*, not a flat string. `("strategic", "decisions")` maps onto 6-vault canon natively: outer tuple element = vault, inner elements = sub-categories. LangMem's memory managers operate within namespace — they extract/update/forget within a vault, not across. Composition is clean. |
| A4 Forkable without cloud/key? | **PASS** | LangGraph is MIT-licensed, runs entirely offline. The JsonlStore subclass requires no cloud. Embedding model is operator's choice (Ollama, local SentenceTransformers, etc.). LangMem same. `pip install langgraph langmem` ≈ 60s offline if wheels cached. |
| A5 No silent model lock-in? | **PASS (strongest of all candidates)** | LangGraph is explicitly designed as a model-agnostic agent runtime. Memory is passed in/out of the agent loop as a *parameter*, not via vendor-specific tool schemas. Works identically with Claude, GPT, Gemini, Llama, DeepSeek-R1 — same code path. LangMem's extraction managers are LLM-driven but pluggable to any provider via LangChain's `BaseChatModel`. |

**5/5 axioms PASS** (with the A2 caveat: requires ~100 LOC JsonlStore subclass).

## Scoring (D1–D10)

| # | Dim | Score | Rationale |
|---|---|---|---|
| D1 | Ontology compat | **5/5** | `namespace` (tuple) maps to vault hierarchy. JSON document body holds {content, tier, source, attestation, blessed_at}. All 6 SIS fields land cleanly without ceremony. |
| D2 | Substrate-vs-hot-path | **4/5** | LangGraph distinguishes **short-term** (within thread, checkpointed) vs **long-term** (cross-thread, BaseStore-backed). That IS substrate-vs-operational, native. Promotion = move atom between thread checkpoint → BaseStore. Less explicit than Letta's `system/` directory convention but equally functional. |
| D3 | Cross-tab semantics | **4/5** | `PostgresStore` is a singleton DB endpoint; multiple Claude tabs share one Postgres. For JsonlStore backend, we'd inherit SIS Memory Bus singleton coordination. Cleaner than Letta's git-worktree concurrent-write pattern at high parallelism, slightly more setup. |
| D4 | Precision@10 | **4/5** (predicted) | LangMem's memory managers use LLM-extraction + semantic + namespace filters. Untested on SIS corpus, but architecture-equivalent quality to mem0's hybrid pipeline. Estimate 70-80% on substrate canon queries. |
| D5 | Recall cross-session | **4/5** (predicted) | Cross-thread store is purpose-built for cross-session continuity. LangMem's "memory manager" pattern auto-extracts atoms from agent runs — passive recall reinforcement. Estimate 75-85%. |
| D6 | Hybrid retrieval | **5/5** | Vector (embedding-based `search()`) + namespace-tuple filter + arbitrary metadata filter + (in JsonlStore impl) filesystem-path linkage. Native hybrid. |
| D7 | Attestation surface | **4/5** | Per-document field, indexed if declared in `index_fields`. Not as native as Letta's frontmatter (where every file IS attested by structure) but equivalent in practice. |
| D8 | Forkability | **5/5** | MIT, pip-installable offline, ~100 LOC custom code (JsonlStore + LangMem config). Lower bar than Letta (Docker-required) or Cognee (Pydantic+LLM-key bootstrap). Highest forkability score. |
| D9 | Maintenance burden | **4/5** | Adapter LOC: ~150-250 total (JsonlStore + LangMem config + SIP attestation injector). LangChain ecosystem has high release cadence but BaseStore interface is stable since LangGraph 0.2. Quarterly review. |
| D10 | Latency p95 | **4/5** (predicted) | JsonlStore over 3000 atoms with FAISS or in-memory index: 50-150ms p95. PostgresStore: <100ms p95 with HNSW. Comparable to Cognee, slightly faster than mem0's LLM-extraction write path. |

**Subtotal: 41/50** (estimated)

## Integration path for SIS

```python
from langgraph.store.base import BaseStore, Item
from langmem import create_memory_manager

class JsonlStore(BaseStore):
    """Filesystem-native SIS substrate. Atoms = JSONL lines.
    
    Each line is a JSON dict with: namespace (tuple), key (uuid),
    value (dict with content + tier + source + attestation),
    created_at, updated_at.
    """
    def __init__(self, path: str = "memory/mempalace/atoms.jsonl"):
        self.path = path
        self._cache = self._load()
    
    def put(self, namespace, key, value):
        value["attestation"] = current_sip_attestation()  # auto-inject
        # append to JSONL, update in-memory index, vector embed
        ...
    
    def search(self, namespace, query, *, limit=10, filter=None):
        # hybrid: namespace-prefix filter + vector similarity + metadata filter
        ...

# Wire LangMem on top
manager = create_memory_manager(
    store=JsonlStore(),
    llm="ollama:llama3.3:70b",  # model-agnostic; user's choice
    namespace_prefix=("substrate",),
)
```

- **LOC:** ~150-250 (JsonlStore + LangMem adapter + SIP attestation injector + migration script from current ChromaDB)
- **Wall-clock:** 6-10 hours (~50% faster than Cognee/Letta because no Docker, no separate DB)
- **Reversibility:** **HIGHEST.** JSONL atoms are SIS native format already. Walking away = stop using LangGraph; files remain unchanged. <30 min revert.
- **Replaces:** the current substrate adapter (ChromaDB upstream). Substrate ABC unchanged.
- **Augments:** chronicle-linkage via LangMem managers; cross-thread promotion is built-in (substrate-vs-hot-path tier).
- **Keeps:** Obsidian mirror (JSONL+frontmatter-readable), Memory Bus singleton (LangGraph runs inside it), all attestation per-atom.

## Distinction vs C3 (Letta MemFS)

The two file-shaped candidates differ on three dimensions:

| Dimension | Letta MemFS | LangGraph + LangMem |
|---|---|---|
| **File format** | Markdown per atom (`memory/atom-id.md`) | JSONL with one row per atom |
| **Coordination** | Git worktrees + merge | PostgresStore singleton OR JsonlStore + Memory Bus |
| **Framework opinionation** | Agent runtime included (high) | Library primitive (low) |
| **Setup cost** | Docker + Letta install | `pip install` only |
| **Reversibility** | Files survive but git is mandatory | JSONL is already SIS native; near-zero exit cost |
| **Obvious win for** | "Frank wants markdown files I can edit in Obsidian directly" | "Frank wants a primitive he composes, not a framework he inherits" |

**Letta wins** if SIS wants the markdown-per-atom mental model (each atom is its own file you can edit).
**LangGraph wins** if SIS wants minimum framework opinionation + maximum integration with the existing JSONL substrate.

## Falsifier

This verdict reverses if:
1. Dedicated deep-research agent (when API recovers) reveals LangMem's memory manager LLM extraction is more brittle than scored — particularly if it overwrites attestation fields silently
2. BaseStore abstract interface turns out to mandate behaviors that conflict with SIS's substrate-vs-hot-path separation
3. Phase 0 dog-food shows precision@10 < 0.6 on SIS-specific queries
4. JsonlStore concurrent-write semantics under 3-tab parallel load corrupts atoms.jsonl line boundaries (PARKED-012 risk)

## Verdict

**RECOMMEND (provisional)** with the following caveats:
- Score is from landscape-scan + Claude's training-time knowledge + public docs cross-reference, NOT from a dedicated deep-research agent. Two attempts hit 529 Overloaded. Phase 0 dog-food is **mandatory** before this becomes a final recommendation.
- 41/50 estimated; if confirmed, this is the highest forkability + lowest framework opinionation in the candidate pool.
- The honest comparison with Letta: LangGraph + JsonlStore is the **library** version of the same idea; Letta MemFS is the **product** version. Both pass all 5 axioms; both are filesystem-native; both are model-agnostic. The choice is between minimum framework opinionation (LangGraph) and convergent product-shape (Letta).

**My recommendation pending Board:** Phase 0 dog-food BOTH C3 (Letta) and C7 (LangGraph + LangMem) against the same 50-query eval set. The 3-point score gap (44 vs 41) is within measurement noise; the real differentiator surfaces only under load.

## Sources

- https://langchain-ai.github.io/langgraph/concepts/persistence/ (BaseStore architecture)
- https://docs.langchain.com/oss/python/langchain/long-term-memory (long-term memory pattern)
- https://github.com/langchain-ai/langmem (LangMem package)
- Landscape scan findings: `docs/research/_factory/memory-foundations/landscape-scan.md` §1 (LangGraph + LangMem analysis)
- Cross-reference: Letta findings.md (file-shaped comparison)

*Built on SIP — 2026-05-20 · Scored without dedicated deep agent · Phase 0 dog-food required for final Board ratification*
