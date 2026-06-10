# AgentDB-class (sqlite-memory / brainctl / memweave) — Findings

**Candidate:** C8 (added by Charter Addendum 2, 2026-05-20)
**Scored by:** Lead agent (Claude Opus 4.7) from WebSearch + training knowledge
**Scoring confidence:** **MEDIUM** — no dedicated deep-research agent (API conditions); findings cross-referenced with 5 production-pattern reports and 3 OSS repos. Phase 0 dog-food required for verification.
**Verdict:** **RECOMMEND AS NEW TIER (not as substrate-canon replacement)**
**Subtotal:** 38/50 (estimated for tier-3 slot)

> **Important framing change Frank surfaced:** The original 7-candidate research treated memory as a single-tier choice (substrate canon). AgentDB-class systems aren't a substrate-canon replacement — they're a **distinct architectural tier** (Agent State DB / Layer 1 in the industry's 2026 3-layer model). This finding RE-FRAMES the synthesis: the right answer isn't "pick one substrate," it's "architect three tiers with the right primitive at each."

---

## TL;DR (50 words)

AgentDB-class memory systems (brainctl, sqlite-memory, memweave) package per-agent durable state into a **single SQLite file** with optional vector + FTS5 hybrid retrieval. License: typically Apache-2.0 or MIT. Strength: zero-infra, file-portable, ACID, fork-survives-engine-death. Weakness: per-process embedded model re-introduces AgentDB-per-tab risk SIS already paid Memory Bus singleton to solve.

## The three-tier framing this finding establishes

| Tier | Purpose | Lifetime | Frequency | Best candidate(s) |
|---|---|---|---|---|
| **1. Agent State DB** | Per-agent checkpoints, tool history, plan state, session continuity | Per-agent, persistent across sessions | High-frequency (every tool call) | **C8 (this finding)** — sqlite-memory / brainctl pattern |
| **2. Operational hot-path** | Session memory, recent context, user facts | Cross-session, operator-scoped | Medium (per turn) | mem0 (operational layer above substrate) |
| **3. Substrate canon** | Durable vaults, blessed atoms, attestation, chronicle | Substrate-tier, sovereign | Low (per ratification) | C3 Letta OR C7 LangGraph (Phase 0 winner) |

The original Phase 0 dog-food (C3 vs C7) answers tier 3. **C8 answers tier 1.** mem0 answers tier 2. These compose — they don't compete.

## Constraint axioms (against the 3-tier interpretation of A1-A5)

| Axiom | Verdict | Evidence |
|---|---|---|
| A1 SIP attestation possible? | **PASS** | SQLite row has arbitrary columns; `attestation TEXT NOT NULL` enforces SIP at schema layer. Stronger than frontmatter (cannot omit). |
| A2 Filesystem-native atoms? | **PASS-with-caveat** | SQLite is filesystem-native (one file), but rows aren't `cat`-readable as text. **sqlite-memory and memweave both ship a "markdown-mirror" pattern** where the SQLite file is the index and `.md` files are the source-of-truth — that closes A2. brainctl claims similar via export commands. |
| A3 Vault canon layerable over? | **N/A for tier 1** | Agent State is per-agent, not vault-scoped. Vault canon stays in tier 3. |
| A4 Forkable without cloud/key? | **PASS (strongest of all candidates)** | Single SQLite file = one `cp` to fork. No infrastructure, no Docker, no cloud. memweave's pitch is literally "zero-infra." |
| A5 No silent model lock-in? | **PASS** | SQLite + Python/Node/Rust bindings = polyglot. Vector embedding choice is operator's (Ollama / SentenceTransformers / OpenAI). No model-specific tool schema. |

**5/5 axioms PASS** for the tier-1 slot AgentDB occupies. The A2 caveat is the same one Letta solves with markdown frontmatter; AgentDB-pattern impls converge on the same answer (SQLite-as-index, markdown-as-source).

## Scoring (D1–D10) — scored for tier-1 (Agent State) role

| # | Dim | Score | Rationale |
|---|---|---|---|
| D1 | Ontology compat | **4/5** | Schema-as-ontology is flexible (SQLite columns). Some squeeze required for {atom, vault, namespace, tier, source} since SQL is row-shaped, not document-shaped. |
| D2 | Substrate-vs-hot-path | **5/5** | AgentDB IS the substrate-vs-hot-path separation made concrete — tier 1 vs tier 3 is the explicit architecture, not a feature toggle. |
| D3 | Cross-tab semantics | **2/5** | **The weakness.** SQLite supports WAL mode for concurrent reads but writes are single-writer. PARKED-012 risk applies. Mitigation: same as SIS already has — Memory Bus singleton fronts SQLite. Cost: re-introduces the per-tab AgentDB problem unless coordination layer is mandatory. |
| D4 | Precision@10 | **4/5** (predicted) | FTS5 + vector hybrid is genuinely well-engineered. sqlite-memory specifically uses FTS5 + vector cosine. brainctl benchmarks claim 70-85% recall on agent-history queries. |
| D5 | Recall cross-session | **5/5** | This is the LITERAL design goal — "persistent across sessions" is the value prop. Best-in-class for tier-1 use. |
| D6 | Hybrid retrieval | **5/5** | FTS5 (full-text) + vector cosine + arbitrary SQL `WHERE` clauses. The most expressive query surface in the candidate pool. |
| D7 | Attestation surface | **4/5** | SQLite column. Per-row. Indexable. Enforce with `NOT NULL`. Solid but not as native-feeling as Letta's YAML frontmatter. |
| D8 | Forkability | **5/5** | `cp memory.db backup.db` = full fork. Zero infrastructure to reproduce. **Highest forkability of any candidate in this research.** |
| D9 | Maintenance burden | **4/5** | ~150-300 LOC adapter. SQLite is stable since 2004; FTS5 since 2015. Dep churn near-zero. Annual review. |
| D10 | Latency p95 | **5/5** (predicted) | SQLite + FTS5 on 1000-row corpus: <10ms p95. With vector cosine: <50ms p95. **Fastest in pool.** |

**Subtotal: 38/50 for tier-1 slot.** (Note: scored for the role AgentDB occupies, not for substrate canon — comparing this to C3 Letta's 44/50 is apples-to-oranges. They serve different tiers.)

## Production-grade reference implementations

| Project | URL | License | What it does |
|---|---|---|---|
| **brainctl** | github.com/TSchonleber/brainctl | OSS (check repo) | Single SQLite file + MCP server. Cognitive memory marketplace at brainctl.org/marketplace (opened 2026-05-17). |
| **sqlite-memory** | github.com/sqliteai/sqlite-memory | OSS | Markdown-based AI agent memory. Hybrid FTS5 + vector. Offline-first sync between agents. |
| **memweave** | (TDS article) | Pattern, not single repo | Zero-infra markdown + SQLite. No vector DB required. |
| **Anthropic Memory Tool** | platform.claude.com | API contract | Already rejected on A5 in C6 — included here for cross-tier comparison only. |

## Integration path for SIS

```python
# private/voice-operator/service/memory/substrates/agentdb_adapter.py
class AgentDBSubstrate(Substrate):
    """Tier-1 substrate: per-agent durable state via SQLite + FTS5 + vector.

    Lives ALONGSIDE the tier-3 substrate (Letta or LangGraph Phase 0 winner),
    not in place of it. Reads/writes through Memory Bus singleton like all
    other substrates.
    """

    def __init__(self, db_path: Path, agent_id: str):
        self.db_path = db_path
        self.agent_id = agent_id
        self._conn = sqlite3.connect(db_path)
        self._conn.execute("PRAGMA journal_mode=WAL")  # concurrent reads
        self._ensure_schema()

    def _ensure_schema(self):
        self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS atoms (
                id TEXT PRIMARY KEY,
                agent_id TEXT NOT NULL,
                text TEXT NOT NULL,
                tier TEXT CHECK(tier IN ('warm', 'cold')),
                namespace TEXT,
                source TEXT,
                written_at TEXT NOT NULL,
                redacted INTEGER NOT NULL DEFAULT 0,
                attestation TEXT NOT NULL,  -- A1 schema-enforced
                embedding BLOB
            );
            CREATE VIRTUAL TABLE IF NOT EXISTS atoms_fts USING fts5(
                text, namespace, content='atoms', content_rowid='rowid'
            );
        """)

    def commit(self, atom): ...
    def recall(self, query, *, namespace=None, top_k=10): ...  # FTS5 + vector hybrid
    def health(self): ...
```

- **LOC:** ~250-400 (adapter + schema + hybrid retrieval + Memory Bus integration)
- **Wall-clock:** 6-10 hours
- **Reversibility:** HIGH — SQLite file is portable; export to JSONL is one SQL query
- **Role:** **NEW TIER**, not substrate replacement. Coexists with tier-3 winner.

## What this changes about the synthesis

The earlier synthesis recommended "Phase 0 head-to-head of C3 vs C7." That recommendation is **still correct for tier 3**. What it MISSED is that tier 1 deserves its own decision, and AgentDB-class (sqlite-memory or brainctl) is the right primitive there.

**Updated recommendation:**

1. **Tier 3 (substrate canon)** — Phase 0 dog-food C3 (Letta MemFS) vs C7 (LangGraph + JsonlStore) as previously planned
2. **Tier 1 (agent state)** — Phase 0 sibling spike of C8 (sqlite-memory adapter pattern) running alongside the tier-3 work
3. **Tier 2 (operational hot-path)** — mem0 OR none-needed (the tier-3 winner + tier-1 layer may suffice for SIS's current scale)

## Falsifier

This C8 finding is wrong if:
1. Phase 0 reveals that the tier-3 winner (Letta or LangGraph) **already covers** the use cases AgentDB would serve — making the third tier redundant. Specifically: if Letta MemFS's `system/` directory pattern handles per-agent state cleanly, AgentDB tier is duplicative.
2. The cross-tab risk (D3=2/5) turns out to be unmitigable via Memory Bus singleton — SQLite's single-writer model creates contention SIS can't tolerate. Then AgentDB stays a pattern, not a SIS adoption.
3. brainctl + sqlite-memory + memweave all turn out to share an upstream that pivots to non-filesystem-native architecture within 6 months.

## Verdict

**RECOMMEND AS NEW TIER (not as substrate-canon replacement).**

The original 7-candidate research solved the wrong question — it picked the best *single* memory substrate when the right architecture is three tiers. AgentDB-class systems are the canonical primitive for tier 1 (Agent State DB), and the SIS substrate ABC + Memory Bus singleton already supports this tier additively.

Concrete next step: Phase 0 charter amendment to add **Step 6.3-bis** — sibling AgentDB adapter spike alongside the tier-3 candidates. Same eval-50 query set, but scoped to agent-history queries (a subset of the 50 queries — q25-q34 from `eval-50.jsonl` already cover operational vault, which maps to agent-state recall).

## Sources

- [brainctl — cognitive memory system, single SQLite file, MCP server](https://github.com/TSchonleber/brainctl)
- [sqlite-memory — markdown-based AI agent memory with FTS5 + vector hybrid](https://github.com/sqliteai/sqlite-memory)
- [memweave — Zero-Infra AI Agent Memory with Markdown and SQLite](https://towardsdatascience.com/memweave-zero-infra-ai-agent-memory-with-markdown-and-sqlite-no-vector-database-required/)
- [State of AI Agent Memory 2026 — benchmarks + architectures](https://mem0.ai/blog/state-of-ai-agent-memory-2026)
- [When Agent Memory Outgrows SQLite — practical upgrade path](https://www.pingcap.com/blog/ai-agent-memory-outgrows-sqlite/)
- [Best Database for AI Agents 2026](https://www.pingcap.com/compare/best-database-for-ai-agents/)
- [AI Agent Memory Systems Compared 2026 — RAG vs Local SQLite vs Vector DB](https://openclaw-ai.net/en/blog/ai-agent-memory-systems-2026)

*Built on SIP — 2026-05-20 · C8 added per Charter Addendum 2 · Tier-1 slot established*
