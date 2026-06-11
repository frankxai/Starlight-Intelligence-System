# Install — Graphiti

> The temporal-reasoning layer. Where Mem0 answers "what do I know about X?", Graphiti answers "what changed, when, and what led to what?" It is the substrate behind the Neural Constellation — the visualization that lights up nodes by `weight = recency × relevance × emotional_salience × strategic_importance`. Every meeting becomes a node, every decision an edge, every "this mattered" a salience boost. Graphiti is what turns Frank's exhaust into an architecture you can navigate.

**Role in the stack:** Capture Stack · L3 (temporal knowledge graph) · the engine for the Neural Constellation, Meeting Replay, and Depth Map views in `console/`
**Why Graphiti over alternatives:** Zep's open-source temporal graph engine, MIT-licensed, ships with bi-temporal model (event time + ingestion time) which is exactly what the edge-weight formula needs. Neo4j alone is a graph DB but not temporal-aware. LangGraph is workflow, not memory. NetworkX is a library, not a service. Graphiti is the only primitive that gives Frank time-aware edges out of the box.
**Source:** https://github.com/getzep/graphiti
**License:** Apache-2.0
**Status in substrate:** unsurfaced → **scaffolded** (this install moves it to `live` once the smoke test confirms a temporal query returns weighted edges)

## Prerequisites

- **OS:** Windows 11 (primary). Graphiti is Python — runs anywhere. Neo4j (its backing store) needs Docker on Windows.
- **Hardware:** memory-watch on Lenovo. Neo4j idle: ~500MB-1GB heap. Graphiti orchestration: ~300MB. Combined with Mem0, screenpipe, and meetscribe simultaneously ingesting, RAM pressure is the limiting factor on Lenovo (16GB total). **Mitigation:** run Neo4j with capped heap (`-Xmx2g`); pause screenpipe embeddings during heavy graph ingestion windows.
- **Disk:** 2-5 GB for Neo4j data after a few months of meetings + captures.
- **Required tools:**
  - **Python 3.11** (shared with meetscribe + Mem0)
  - **Docker Desktop** (for Neo4j) — `winget install Docker.DockerDesktop`
  - Existing Mem0 install (this playbook builds on it; see `docs/install/mem0.md`)
- **API keys:**
  - **Required:** the same Groq + Voyage keys already wired for Mem0 (Graphiti reuses them).
  - Stored in `~/.starlight/secrets/.env`. Do not duplicate.

## Install steps

### 1. Stand up Neo4j via Docker

```powershell
# Verify Docker Desktop is running
docker version

# Persist Neo4j data outside container so it survives upgrades
New-Item -ItemType Directory -Force -Path "$HOME\captures\.graphiti\neo4j\data"
New-Item -ItemType Directory -Force -Path "$HOME\captures\.graphiti\neo4j\logs"

docker run -d `
  --name starlight-neo4j `
  --restart unless-stopped `
  -p 7474:7474 -p 7687:7687 `
  -v "$HOME\captures\.graphiti\neo4j\data:/data" `
  -v "$HOME\captures\.graphiti\neo4j\logs:/logs" `
  -e NEO4J_AUTH=neo4j/replace-this-password `
  -e NEO4J_PLUGINS='["apoc"]' `
  -e NEO4J_server_memory_heap_max__size=2G `
  -e NEO4J_server_memory_pagecache_size=512M `
  neo4j:5
```

Confirm:

```powershell
docker ps --filter name=starlight-neo4j
# http://localhost:7474 should load the Neo4j browser
```

Add to `~/.starlight/secrets/.env`:

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=replace-this-password
```

### 2. Install Graphiti into the shared starlight-memory venv

```powershell
cd "$HOME\tools\starlight-memory"
.\.venv\Scripts\Activate.ps1

pip install graphiti-core
# Pin version; record in MEMORY.md
pip show graphiti-core
```

If `graphiti-core` resolves to a different package name on PyPI by install time, verify against latest README at https://github.com/getzep/graphiti — the install instructions in upstream docs are authoritative.

### 3. Initialize the graph schema

Create `~/tools/starlight-memory/starlight_memory/graph_init.py`:

```python
# ~/tools/starlight-memory/starlight_memory/graph_init.py
import asyncio, os
from graphiti_core import Graphiti

async def main():
    g = Graphiti(
        uri=os.environ["NEO4J_URI"],
        user=os.environ["NEO4J_USER"],
        password=os.environ["NEO4J_PASSWORD"],
    )
    await g.build_indices_and_constraints()
    print("Graphiti indices + constraints built")
    await g.close()

if __name__ == "__main__":
    asyncio.run(main())
```

Run it once:

```powershell
python -m starlight_memory.graph_init
```

### 4. Declare the Starlight node + edge taxonomy

Create `~/tools/starlight-memory/starlight_memory/taxonomy.py` — this matches `MASSIVE_ACTION_PLAN.md` § 6 exactly:

```python
# Node types — 11 canonical, no auto-creation
NODE_TYPES = [
    "meeting", "person", "project", "repo", "idea",
    "decision", "task", "emotion-state", "brand", "artifact", "memory",
]

# Edge types — 10 canonical
EDGE_TYPES = [
    "discussed_with", "decided", "created", "referenced", "reacted_to",
    "belongs_to_brand", "led_to", "blocked_by", "inspired", "escalated_to",
]

# Edge weight formula (per § 6) — applied at query time, not at write time
# weight = recency × relevance × emotional_salience × strategic_importance
WEIGHT_FACTORS = {
    "recency": "1 / (1 + days_since_event / 30)",   # half-life ~30 days
    "relevance": "cosine_similarity(query_embedding, edge_context_embedding)",
    "emotional_salience": "0..1, default 0.5; mark-mattered → +0.3 burst (decays over 7 days)",
    "strategic_importance": "0..1, set by IS-routing — Wealth/Family bias higher",
}
```

## Configuration

**Config file location:** `~/tools/starlight-memory/starlight_memory/graphiti_config.py` — version-controlled in SIS under `core/orchestrator/memory/` once stable.

**Substrate-pinned values:**

```python
# graphiti_config.py
GRAPHITI_CONFIG = {
    "neo4j": {
        "uri": os.environ["NEO4J_URI"],
        "user": os.environ["NEO4J_USER"],
        "password": os.environ["NEO4J_PASSWORD"],
    },
    "llm": {
        # Groq Llama 3.1 70B for entity/edge extraction
        "provider": "groq",
        "model": "llama-3.1-70b-versatile",
        "temperature": 0.0,   # zero for extraction — no creativity
    },
    "embedder": {
        "provider": "voyage",
        "model": "voyage-3",
    },
    "bi_temporal": True,           # event_time + ingest_time both tracked
    "auto_summarize_episodes": True,
    "max_episode_length": 8000,
}
```

**Edge weight at query time:**

The weight formula is applied in the query layer, not stored on the edge. Each edge stores raw factor values; the query computes the composite. This lets Frank tune the formula without re-ingesting.

```python
# Composite query example
def edge_weight(edge, query_embedding, now):
    days = (now - edge.event_time).days
    recency = 1 / (1 + days / 30)
    relevance = cosine(query_embedding, edge.context_embedding)
    salience = edge.metadata.get("emotional_salience", 0.5)
    if (decay := edge.metadata.get("salience_burst_decay_until")) and now < decay:
        salience += 0.3 * (1 - (now - edge.metadata["salience_burst_at"]).days / 7)
    importance = edge.metadata.get("strategic_importance", 0.5)
    return recency * relevance * salience * importance
```

**Integration with `~/captures/`:**

Graphiti ingests via `add_episode()` calls from the same ingestion script that feeds Mem0. One write fans out to both:

```python
# Pseudo-code in core/orchestrator/memory/ingestion/ingest_meeting.py
from mem0 import Memory
from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType

mem = Memory.from_config(MEM0_CONFIG)
g   = Graphiti(**GRAPHITI_CONFIG["neo4j"])

# Mem0 — semantic per-agent
mem.add(messages=summary, user_id="frank", agent_id="starlight-orchestrator", metadata=meta)

# Graphiti — temporal, multi-entity
await g.add_episode(
    name=f"meeting:{meeting_id}",
    episode_body=summary,
    source=EpisodeType.text,
    source_description="meetscribe meeting summary",
    reference_time=meeting_started_at,   # event_time, not now
)
```

Graphiti's LLM extractor reads the episode and proposes node + edge creations against the declared taxonomy. Reject any node/edge whose type is not in `NODE_TYPES` / `EDGE_TYPES`.

## Smoke test

```powershell
cd "$HOME\tools\starlight-memory"
.\.venv\Scripts\Activate.ps1

# Source env
Get-Content "$HOME\.starlight\secrets\.env" | ForEach-Object {
    if ($_ -match "^(.+?)=(.+)$") { Set-Item -Path "env:$($matches[1])" -Value $matches[2] }
}

python -c @"
import asyncio, os
from datetime import datetime, timezone
from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType

async def smoke():
    g = Graphiti(
        uri=os.environ['NEO4J_URI'],
        user=os.environ['NEO4J_USER'],
        password=os.environ['NEO4J_PASSWORD'],
    )

    await g.add_episode(
        name='smoke-test-meeting',
        episode_body=(
            'On 2026-04-25, Frank and a collaborator discussed the Starlight Orchestrator '
            'naming. Frank decided to kill Jarvis as a brand and lock Starlight '
            'Orchestrator as canonical. This led to MASSIVE_ACTION_PLAN.md being '
            'committed.'
        ),
        source=EpisodeType.text,
        source_description='smoke test',
        reference_time=datetime(2026, 4, 25, tzinfo=timezone.utc),
    )

    results = await g.search('What did Frank decide about naming?')
    for r in results:
        print(r)

    await g.close()

asyncio.run(smoke())
"@
```

If the search returns at least one node referencing Frank, the collaborator, or the decision (with timestamps), Graphiti is live. Open http://localhost:7474, log in with neo4j/your-password, and run:

```cypher
MATCH (n) RETURN n LIMIT 25
```

You should see person, decision, meeting nodes with edges between them.

## Integration with the Starlight Orchestrator

Graphiti is **the engine behind the daily brief and the Neural Constellation**.

**Data flow:**
```
Vault + ~/captures/  ──► ingestion script ──► Mem0 (semantic per-agent)
                              │
                              └──► Graphiti (temporal, multi-entity)
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │ Starlight Orchestrator  │
                          │   ├── daily brief       │
                          │   ├── voice intent ctx  │
                          │   └── routing decisions │
                          └─────────────────────────┘
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │ Console (Next.js)       │
                          │   ├── Constellation     │
                          │   ├── Meeting Replay    │
                          │   └── Depth Map         │
                          └─────────────────────────┘
```

**Three views on top of Graphiti** (per `MASSIVE_ACTION_PLAN.md` § 6):
1. **Constellation** — force-directed; node glow ∝ composite weight; default time-window: last 30 days.
2. **Meeting Replay** — single meeting unfolded over a timeline with energy spikes from emotion metadata.
3. **Depth Map** — three layers stacked: raw captures → structured episodes → meaning (high-weight decisions + ideas).

These ship in Phase 4 (`docs/install/` does not include them — they are app code in `console/src/views/`).

**Daily brief query** (Phase 1 § 1.7 verifies this end-to-end):

```python
# Pseudo — full version lands in core/orchestrator/briefs/daily_brief.py
async def daily_brief(g: Graphiti, since: datetime) -> str:
    # Top-N high-weight nodes since `since`
    top_nodes = await g.search_nodes_by_weight(since=since, limit=20)
    # New decisions
    decisions = await g.search_edges(edge_type="decided", since=since)
    # Open tasks
    open_tasks = await g.search_nodes(node_type="task", state="open")
    return render_brief(top_nodes, decisions, open_tasks)
```

**Vault stays canonical:**
- Graphiti is regenerable. If the Neo4j volume corrupts, drop the container, re-create it, re-run `graph_init`, and re-ingest from vault + captures.
- Vault entries that reference graph IDs (`meeting:abc123`) must continue to resolve after a regeneration. This means **deterministic episode naming** — the ingestion script derives `episode.name` from a hash of source + canonical ID, not a timestamp. Re-ingestion produces the same names; references stay valid.

## Refusal patterns

**Graphiti must never:**
- Be queried for cross-user data. Each sovereign user runs their own Neo4j instance against their own SIS fork (per `/sovereign-spawn`). No shared graph.
- Auto-create node or edge types outside the declared taxonomy. The LLM extractor will try; the ingestion wrapper rejects.
- Treat emotion as fact. Per Risk Register § 12, emotion is metadata only — `emotional_salience` is a confidence-weighted attribute on edges, never a node type that asserts "Frank felt X." A node `emotion-state` exists only as a *self-reported or screenpipe-derived* observation linked to a moment, not a verdict on a person.
- Sync its Neo4j volume across machines via Syncthing. Regenerable from vault + captures; one canonical instance per user. The Acer can run its own Neo4j as a hot mirror by re-ingesting independently.
- Persist raw audio or screen frames as node properties. Only summaries, IDs, and references. Frames live in `~/captures/screen/data/` (machine-local), referenced by ID from the graph.

**This install does NOT:**
- Build the Constellation UI — that is Phase 4 in `console/src/views/constellation/`.
- Auto-ingest captures — the ingestion script is a separate Phase 1 § 1.5b follow-up.
- Replace Mem0 — Mem0 is per-agent semantic, Graphiti is temporal-relational. Both are needed.
- Replace the Markdown vault. Vault is canonical. Graphiti is derived.

## Troubleshooting

| Symptom | Likely cause | Remediation |
|---|---|---|
| `docker run` fails with port conflict on 7474 or 7687 | Old Neo4j container or another graph DB running | `docker ps -a`; `docker rm -f starlight-neo4j` and retry; or change `-p` mapping and update `NEO4J_URI` |
| Graphiti `add_episode` hangs | LLM rate limit or wrong API key | Check Groq dashboard for rate-limit status; verify `GROQ_API_KEY` in env; reduce concurrent ingestion |
| Neo4j heap OOMs on Lenovo | Default heap too high relative to free RAM | Confirm `NEO4J_server_memory_heap_max__size=2G` is honored; for tight RAM windows drop to 1G; verify with `docker stats starlight-neo4j` |
| Extracted nodes have wrong type | LLM proposing types outside taxonomy | Wrap `add_episode` in a post-processor that rejects + logs out-of-taxonomy nodes; raise an alert in next daily brief |
| Search returns zero after ingest | Indices not built or wrong reference_time | Re-run `graph_init.py`; confirm `reference_time` was passed (not None — Graphiti silently skips weight calc without it) |

## Phase 1 status after install

**Capability lit:**
- Time-aware knowledge graph over captures + vault (Phase 1 § 1.5 ✓ — both Mem0 and Graphiti now live).
- Foundation for the daily brief (Phase 1 § 1.7).
- Foundation for the Neural Constellation (Phase 4).
- The Orchestrator can now answer questions like "what changed in [project] this week?" and "what did we decide with [person] last month?" with weighted, timestamped evidence.

**Next install in dependency order:** **Syncthing** — last piece of Phase 1. With capture sources writing, Mem0 indexing, and Graphiti graphing on Lenovo, Syncthing replicates the right slices to the Acer mirror so a Lenovo failure doesn't lose the substrate.

**Phase 1 progression after this install:**
- 1.3 screenpipe ✓
- 1.4 meetscribe ✓
- 1.5 Mem0 + Graphiti ✓ (this install completes 1.5)
- 1.6 Syncthing — next
- 1.7 First daily brief generated — gated on Syncthing being live so Acer is consistent

---

**Built on SIP** — install playbook · v7.5
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, temporal-graph]
- Phase: 1.5b (capture stack — temporal graph)
- Generated: 2026-04-26
