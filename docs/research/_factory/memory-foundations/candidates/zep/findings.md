# Zep (Graphiti) — Findings

**Candidate:** C5
**Scored by:** Research sub-agent (general-purpose, 2026-05-20)
**Verdict:** **VIABLE** (4/5 axioms PASS, 1 FAIL-soft on A2; structural conflict with Wisdom Vault)
**Subtotal:** 36/50 raw

---

## TL;DR (50 words)

Zep's managed platform (cloud, sub-200ms SLA) is API-dependent and deprecated its OSS Community Edition. **Graphiti** is the Apache-2.0 self-hostable temporal knowledge graph engine underneath. Strength: bi-temporal model + custom Pydantic entity types + Ollama-compatible. Weakness: facts get auto-invalidated when newer ones arrive — **structurally conflicts with SIS's "wisdom is timeless" vault**.

## Constraint axioms

| Axiom | Verdict | Evidence |
|---|---|---|
| A1 SIP attestation possible? | PASS | Custom Pydantic entity/edge types support arbitrary fields. `attestation: str` rides on every node/edge. |
| A2 Filesystem-native atoms? | FAIL-soft | Graphiti requires a graph database backend — Neo4j 5.26 / FalkorDB 1.1.2 / Kuzu 0.11.2 / Amazon Neptune. Kuzu is the only embedded option (file-based). Atoms NOT plain-text-readable without engine running. Obsidian mirror requires DIY export. |
| A3 Vault canon layerable over? | PASS-with-tension | Developer-defined Pydantic entity and edge types are first-class. But Graphiti's **bi-temporal invalidation** (every fact has `valid_at` + `invalid_at`; newer facts auto-invalidate older ones) **structurally conflicts** with the Wisdom Vault canon. A "wisdom_immutable" flag would have to be retrofitted at adapter layer. |
| A4 Forkable without cloud/key? | PASS (Graphiti only) | Graphiti self-hostable, runs offline with Ollama for LLM + embeddings. Zep managed platform is cloud-only. |
| A5 No silent model lock-in? | PASS | Graphiti supports OpenAI, Azure OpenAI, Google Gemini, Anthropic, and Ollama (via OpenAIGenericClient). User chooses at config time. |

**Overall: 4/5 PASS, 1 FAIL-soft on A2.** A2 failure is the killer — Graphiti is graph-DB-native, not filesystem-native.

## Scoring (D1–D10)

### Architecture fit (15 pts)

- **D1 Ontology compat — 4/5** — Pydantic entity/edge types cover {atom, namespace, vault, attestation, source}. Tier (warm/cold) doesn't map cleanly because Graphiti's temporal model is `valid_at`/`invalid_at`, not warm/cold lifecycle.
- **D2 Substrate-vs-hot-path — 3/5** — Bi-temporal model conceptually distinguishes "current state" vs "history," but it's one undifferentiated graph with temporal filters. No explicit substrate/operational tier.
- **D3 Cross-tab — 4/5** — Neo4j/FalkorDB are server-mode; multiple Claude tabs can connect to a single graph DB instance. First-class shared backend. Kuzu (embedded) re-introduces the agentdb-per-tab problem.

### Retrieval quality (15 pts)

- **D4 Precision@10 — 4/5** (predicted) — Semantic + BM25 + graph-based search with result fusion. 90% latency reduction + 98% fewer tokens vs traditional RAG in benchmarks. Untested on SIS corpus.
- **D5 Cross-session recall — 4/5** (predicted) — Strong on temporal queries ("what did we know in v7.5?"). DMR benchmark: 94.8% vs MemGPT's 93.4%. LongMemEval: up to 18.5% improvement. Untested on SIS corpus.
- **D6 Hybrid retrieval — 5/5** — Native vector + BM25 + graph traversal with result fusion. Best-in-class hybrid signal.

### Sovereignty (10 pts)

- **D7 Attestation surface — 4/5** — Per-node and per-edge Pydantic fields support `attestation`. Better edge-attestation slot than Cognee (edges are first-class Pydantic models in Graphiti).
- **D8 Forkability — 3/5** — Clone Graphiti, set up Neo4j/FalkorDB/Kuzu, set LLM key (or Ollama), run. Higher friction than Cognee.

### Operational (10 pts)

- **D9 Maintenance burden — 4/5** — Actively maintained (v0.29.0, 194 releases, 17.4k+ stars). ~300-500 LOC adapter. Quarterly review prudent.
- **D10 Latency p95 — 5/5** (predicted) — Zep managed platform targets sub-200ms; Graphiti benchmark 90% latency reduction. With Kuzu/FalkorDB on local hardware, expect <100ms for 1000-atom corpus.

**Subtotal: 36/50 raw.** (Numerically higher than Cognee but A2 axiom FAIL-soft is structural.)

## Integration path for SIS

```python
from graphiti_core.nodes import EntityNode

class AtomEntity(EntityNode):
    content: str
    vault: Literal["strategic","technical","creative","operational","wisdom","horizon"]
    namespace: str
    attestation: str
    source: str
    blessed_at: Optional[datetime]
    # graphiti adds valid_at, invalid_at automatically
```

Plus a **wisdom-vault immutability adapter** — wraps Graphiti writes so `vault == "wisdom"` atoms get `invalid_at = None` permanently + custom retrieval filter never returns invalidated wisdom atoms.

- **LOC:** ~500-800 (adapter + entity types + immutability wrapper + Kuzu/Neo4j setup + migration script + Obsidian export adapter for A2 mitigation)
- **Wall-clock:** 20-30 hours over 3-4 sessions
- **Reversibility:** MEDIUM. 2-3 days vs Cognee's 1 day.
- **Replaces:** vectors.npy + KG canvas + namespace filters + chronicle-linkage queries.
- **Augments:** temporal queries, bi-temporal forensics on substrate evolution.
- **Conflicts with:** Wisdom Vault timelessness — requires retrofit. Filesystem-native fork — requires Obsidian export adapter.

## Falsifier

1. Bi-temporal invalidation turns out to be opt-out-able per-entity-type — A3 tension lifts
2. Kuzu backend matures to support concurrent multi-tab writes safely — closes A2 gap with embedded backend
3. SIS adopts Graphiti's temporal model as a feature (chronicle evolution forensics) — reframes A3 conflict as strength
4. mempalace honest baseline beats Graphiti on the eval-50 query set despite Graphiti's headline benchmarks

If (1)+(2) both land, upgrade to RECOMMEND.

## Verdict

**VIABLE.** Graphiti is technically excellent (36/50 raw, best hybrid retrieval in the candidate pool, actively maintained, sovereign-deployable with Ollama+Kuzu) but has **two structural tensions with SIS canon**: (i) bi-temporal auto-invalidation conflicts with Wisdom Vault timelessness — fixable with a per-vault immutability wrapper but adds adapter complexity, (ii) requires a graph DB backend rather than plain filesystem — A2 axiom failure unless Kuzu + Obsidian export adapter is built. Higher integration cost than Cognee (20-30h vs 12-20h) and lower reversibility. Keep in synthesis matrix as the "temporal-graph-first" alternative; if Frank later wants chronicle-evolution forensics as a feature, Graphiti is the upgrade path.

**Note: do NOT adopt Zep managed platform — A4 fails on cloud dependency, A2 fails on filesystem-native, A5 fails on opaque routing.**

## Sources

- https://github.com/getzep/graphiti
- https://github.com/getzep/zep
- https://www.getzep.com/product/open-source/
- https://blog.getzep.com/graphiti-knowledge-graphs-for-agents/
- https://arxiv.org/abs/2501.13956 — Zep paper (DMR + LongMemEval benchmarks)
- https://help.getzep.com/graphiti/configuration/llm-configuration
- https://github.com/getzep/graphiti/blob/main/mcp_server/README.md
- https://pypi.org/project/graphiti-core/
- https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/

*Built on SIP — 2026-05-20*
