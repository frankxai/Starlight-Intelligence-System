# Substrate Matrix

Every memory substrate SIS knows about. Pick by tier + use case + privacy posture.

## Table of contents

1. Filesystem markdown (cold tier, default)
2. JSONL knowledge-graph (warm tier, default)
3. mempalace (warm/hot, recommended for semantic recall)
4. Letta / MemGPT (hierarchical agent memory)
5. Mem0 (memory-as-a-service for agents)
6. AgentDB (vector + ReasoningBank, embedded)
7. Qdrant (local Docker vector DB)
8. screenpipe (continuous capture)
9. Memory Bus daemon (multi-tab arbitrator)
10. SQLite + jsonpath (escape hatch)

---

## 1. Filesystem markdown (cold tier, default)

| | |
|---|---|
| **Path** | `memory/vaults/*.md`, `memory/voice-sessions/*.md`, `memory/intake/*.md` |
| **Best for** | Long-form notes, daily capture logs, human-readable archive |
| **Latency** | n/a (file read) |
| **Footprint** | ~1 byte/char of content |
| **License** | Filesystem; user-owned |
| **Leak posture** | Plain text on disk; encryptable with age (opt-in) |
| **Already in SIS** | Yes |

Use as the canonical persistent layer. Other substrates index it.

---

## 2. JSONL knowledge-graph (warm tier, default)

| | |
|---|---|
| **Path** | `memory/knowledge-graph/index.jsonl` |
| **Best for** | Append-only event log; brand × intent_class indexing; audit trail |
| **Latency** | ~10ms read for typical sizes (<100MB); slower as it grows |
| **Footprint** | One JSON line per capture/packet |
| **License** | Filesystem; user-owned |
| **Leak posture** | Plain text; PII risk if not redacted at write time |
| **Already in SIS** | Yes (auto-indexed in voice pipeline) |

Becomes slow past ~500k entries. Pair with mempalace or Qdrant for retrieval.

---

## 3. mempalace (warm/hot, recommended)

| | |
|---|---|
| **Repo** | https://github.com/mempalace/mempalace |
| **Best for** | Semantic search, episodic / semantic / procedural memory split, hot/warm/cold decay |
| **Latency** | ~50-100ms p50 typical (depends on embedding model) |
| **Footprint** | Embeddings cache + index files |
| **License** | Check upstream (assume permissive OSS until verified) |
| **Leak posture** | Local-first by default; embeddings should be local-model only |
| **Already in SIS** | No — install per SKILL.md "Mempalace install" section |

**Install** (canonical contract — verify against upstream README):

```bash
git clone https://github.com/mempalace/mempalace ~/.starlight/mempalace
cd ~/.starlight/mempalace
pip install -e .
```

**Register** in `private/voice-operator/config/substrates.toml`:

```toml
[substrates.mempalace]
enabled = true
path = "~/.starlight/mempalace"
embedding_model = "all-MiniLM-L6-v2"
tier = "warm"
```

**Contract assumptions** (Indexer/Retriever subagents target these — adjust if upstream differs):

```python
from mempalace import Memory
m = Memory(path="~/.starlight/mempalace/db")
m.write(text=..., type="episodic|semantic|procedural", metadata={...})
results = m.query(text=..., k=5, tier="hot|warm|cold|all")
```

If the upstream API differs, update the Indexer/Retriever wrappers in `private/voice-operator/service/memory/mempalace_adapter.py` (to be created on install).

---

## 4. Letta (formerly MemGPT)

| | |
|---|---|
| **Repo** | https://github.com/letta-ai/letta |
| **Best for** | Long-running agent sessions with self-editing memory; OS-of-the-agent pattern |
| **Latency** | ~100-500ms (round trip through agent) |
| **Footprint** | PostgreSQL or SQLite backend |
| **License** | Apache 2.0 |
| **Leak posture** | Local Postgres; supports multi-user with namespacing |

**When to choose over mempalace:** when the memory needs to MUTATE itself during long agent runs (Letta's core feature). For pure capture+retrieve, mempalace is simpler.

**Install:** `pip install letta` then `letta server start` (runs at :8283 by default).

---

## 5. Mem0

| | |
|---|---|
| **Repo** | https://github.com/mem0ai/mem0 |
| **Best for** | Drop-in agent memory layer; works with any LLM |
| **Latency** | ~50-200ms |
| **Footprint** | Vector store + graph store |
| **License** | Apache 2.0 |
| **Leak posture** | Cloud option exists — for SIS, use ONLY the self-hosted variant |

**SIS posture:** acceptable IF self-hosted. Cloud Mem0 ships data to their infra — block it.

---

## 6. AgentDB

| | |
|---|---|
| **Repo** | (per skills/agentdb-* — appears to be Frank's existing tooling) |
| **Best for** | Embedded vector + ReasoningBank; sub-50ms recall |
| **Latency** | ~10-30ms p50 |
| **Footprint** | Embedded SQLite + HNSW |
| **License** | Per Frank's tooling |
| **Leak posture** | Local file; same as SQLite |

**Hard constraint:** spawns one process per connecting tab. Past ~10 connections, system breaks. **MUST front through singleton daemon** (Memory Bus or voice-operator FastAPI). Per `project_agentdb_singleton_constraint.md`.

---

## 7. Qdrant (local Docker vector DB)

| | |
|---|---|
| **Repo** | https://github.com/qdrant/qdrant |
| **Best for** | Pure vector retrieval, scale 1M+ vectors, gRPC API |
| **Latency** | ~10-50ms p50 |
| **Footprint** | Single Docker container, ~500MB RAM idle |
| **License** | Apache 2.0 |
| **Leak posture** | Localhost only; gRPC bound to 127.0.0.1; no external traffic |

**Install** (one-shot):
```bash
docker run -d --name qdrant -p 6333:6333 -p 6334:6334 \
  -v ${USERPROFILE}/.starlight/qdrant:/qdrant/storage \
  qdrant/qdrant
```

Combine with sentence-transformers for embeddings — fully sovereign vector path.

---

## 8. screenpipe

| | |
|---|---|
| **Repo** | https://github.com/mediar-ai/screenpipe |
| **Best for** | Continuous screen + audio capture as ambient context |
| **Latency** | n/a (background indexer) |
| **Footprint** | Heavy (continuous OCR / Whisper) — disk grows GB/day |
| **License** | MIT |
| **Leak posture** | DANGER — captures everything on screen including secrets, other apps, browser. Privacy Guardian must aggressively filter screenpipe output before any LLM ingest. |

**SIS posture:** opt-in only, with explicit privacy review per workflow that uses it.

---

## 9. Memory Bus daemon (multi-tab arbitrator)

Per `project_agentdb_singleton_constraint.md`. The architectural pattern, not a substrate itself:

- Single FastAPI / MCP server fronts ALL multi-process memory access
- Tabs / agents talk to it via HTTP or stdio (MCP)
- Backend can be any of the above (mempalace / Qdrant / AgentDB / etc.)
- Eliminates the per-tab process explosion

**Status:** voice-operator FastAPI :7373 is currently the de facto Memory Bus for the cognition loop. Future: extract a dedicated `memory-bus` service.

---

## 10. SQLite + jsonpath (escape hatch)

| | |
|---|---|
| **Best for** | When you want SQL semantics + JSON flexibility, no vectors needed |
| **Latency** | ~1ms |
| **Footprint** | Single file |
| **License** | Public domain |
| **Leak posture** | Local file |

The boring-and-it-works option. Use when "just store and recall by structured fields" is enough.

---

## Decision flowchart

```
Capture or query?
│
├── Capture → vault MD (cold) + KG JSONL (warm) ALWAYS
│              ↓
│              Privacy Guardian redacts → Auditor attests
│              ↓
│              Optional: also write to mempalace (for semantic recall later)
│
└── Query
      ↓
      Tier 0 (deterministic pattern) — see service/cognition/deterministic.py
      ↓ (no match)
      Tier 1 (filesystem grep + KG scan, fastest)
      ↓ (insufficient)
      Tier 2 (mempalace semantic OR Qdrant vector)
      ↓ (still insufficient)
      Tier 3 (LLM-augmented synthesis from top-k slices)
```

The Substrate Selector subagent picks the tier based on query intent.
