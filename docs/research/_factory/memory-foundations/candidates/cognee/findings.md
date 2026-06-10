# Cognee — Findings

**Candidate:** C4
**Scored by:** Research sub-agent (general-purpose, 2026-05-20)
**Verdict:** **RECOMMEND**
**Subtotal:** 35/50 · All 5 axioms PASS

---

## TL;DR (50 words)

Cognee is an Apache-2.0 KG+vector hybrid memory engine built around a Pydantic `DataPoint` schema with optional RDF/OWL ontology grounding. Defaults are filesystem-native (SQLite + LanceDB + Kuzu, zero infra). Backed by topoteretes ($7.5M seed). Strength: schema sovereignty + local-first defaults. Weakness: community thinner than mem0/Zep; ontology grounding is LLM-extraction-mediated.

## Constraint axioms

| Axiom | Verdict | Evidence |
|---|---|---|
| A1 SIP attestation possible? | PASS | Custom `DataPoint` Pydantic models allow arbitrary fields including `attestation: str`. Metadata declares `index_fields`; non-indexed fields ride along untouched. No engine-side coercion. |
| A2 Filesystem-native atoms? | PASS | Default stack is SQLite + LanceDB + Kuzu — all embedded, file-based. Per-workspace LanceDB directory on disk. DataPoints serialize via Pydantic; raw rows inspectable without running the engine. |
| A3 Vault canon layerable over? | PASS (strong) | `cognify(graph_model=YourSchema)` accepts user-defined Pydantic schema; LLM extracts to that schema. OWL ontology grounding via RDFLib (RDF/XML, Turtle, N-Triples, JSON-LD) maps extracted entities to canonical URIs with 80% fuzzy match. 6-vault ontology expressible as OWL classes; Cognee tags every node `ontology_valid: True/False`. |
| A4 Forkable without cloud/key? | PASS-with-caveat | Defaults run on local SQLite+LanceDB+Kuzu — no Neo4j, no Postgres. But cognify pipeline requires LLM API key (OpenAI default; Ollama supported for full local). Clone, set `LLM_API_KEY`, run. Fully sovereign if Ollama. |
| A5 No silent model lock-in? | PASS | LLM provider config-driven (OpenAI default; Anthropic, Gemini, Ollama, Groq supported). No hard-coded model. |

**5/5 axioms PASS.**

## Scoring (D1–D10)

| # | Dim | Score | Rationale |
|---|---|---|---|
| D1 | Ontology compat | **5/5** | Atom/namespace/vault/attestation/tier/source all modelable native via custom Pydantic fields; OWL grounding for canonical class membership. |
| D2 | Substrate-vs-hot-path | **3/5** | Persistent + session memory + workspace isolation. No first-class promotion protocol; operator DIY. |
| D3 | Cross-tab semantics | **3/5** | Embedded LanceDB/Kuzu has same per-process lock risk as SIS agentdb-per-tab footgun. Mitigated by workspace isolation. Coordinated singleton requires Postgres+Neo4j backend swap. |
| D4 | Precision@10 | **4/5** (predicted) | Hybrid graph + vector + ontology canonicalization collapses "memory stance"/"architecture"/"foundation" to one URI. Untested. |
| D5 | Cross-session recall | **4/5** (predicted) | KG edges link episode to chronicle entry; multi-hop traversal via Kuzu. Untested. |
| D6 | Hybrid retrieval | **5/5** | Vector + symbolic (Kuzu graph + ontology URI + workspace namespace + Pydantic field filters). |
| D7 | Attestation surface | **4/5** | Per-DataPoint custom field carries SIP attestation natively. No per-edge slot (relationships inherit from endpoints). |
| D8 | Forkability | **4/5** | Clone + `pip install` + LLM_API_KEY, ~5 min. Ollama lifts the key requirement. |
| D9 | Maintenance burden | **3/5** | Real framework (~7,500 commits, $7.5M seed). <500 LOC adapter. Practitioner reviews flag thin docs for advanced cases + production cloud less battle-tested than mem0/Zep. |
| D10 | Latency p95 | **4/5** (predicted) | Embedded LanceDB+Kuzu sub-100ms on thousand-atom corpora. LLM cognify is ingest-only. |

**Subtotal: 35/50.**

## Integration path for SIS

```python
class SISAtom(DataPoint):
    content: str
    vault: Literal["strategic","technical","creative","operational","wisdom","horizon"]
    namespace: str
    attestation: str   # "Built on SIP — <hash>"
    tier: Literal["warm","cold"]
    source: str
    blessed_at: Optional[datetime]
    metadata: dict = {"index_fields": ["content","namespace"]}
```

Plus `vault-ontology.owl` (~50 lines, 6 OWL classes).

- **LOC:** ~400-600 (adapter + OWL + retrieval wrappers + migration from atoms.jsonl)
- **Wall-clock:** 12-20 hours over 2-3 sessions
- **Reversibility:** HIGH — DataPoints to JSONL via `.model_dump()`. LanceDB = parquet. Kuzu exports CSV. Worst case: 1 day to rebuild atoms.jsonl.
- **Replaces:** custom vectors.npy, custom KG canvas, ad-hoc namespace filters.
- **Augments:** chronicle linkage (graph edges), multi-hop cross-session retrieval, OWL-grounded vault dedup.
- **Keeps:** Obsidian mirror, Memory Bus singleton (Cognee runs inside it).

## Falsifier

1. Cognee community shrinks (issue response >7 days, breaking changes between minor versions)
2. Ontology grounding is validation-only not enforcement — Cognee accepts unblessed DataPoints; can post-hoc tag but not refuse-on-write
3. Multi-tab contention on embedded LanceDB/Kuzu corrupts state → forces Postgres+Neo4j → kills sovereignty
4. Cleaner candidate beats on axioms

If (1)-(3) land, demote to VIABLE.

## Verdict

**RECOMMEND.** Cognee passes all 5 axioms and scores 35/50. OWL grounding + custom Pydantic DataPoint schemas map directly onto SIS's 6-vault canon — the only candidate where the engine's schema layer natively expresses the locked taxonomy without adapter contortion. Defaults preserve SIP §5 forkability. Integration ~400-600 LOC, fully reversible. Open risks testable in Phase 0 dog-food before Board lock.

## Sources

- https://github.com/topoteretes/cognee
- https://docs.cognee.ai/guides/custom-data-models
- https://www.cognee.ai/blog/deep-dives/grounding-ai-memory
- https://www.cognee.ai/blog/deep-dives/ontology-ai-memory
- https://www.lancedb.com/blog/case-study-cognee
- https://deepwiki.com/topoteretes/cognee/1.1-installation-and-setup
- https://docs.cognee.ai/setup-configuration/overview
- https://atlan.com/know/mem0-alternatives/
- https://vectorize.io/articles/zep-vs-cognee

*Built on SIP — 2026-05-20*
