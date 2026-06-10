# Install — Mem0

> The per-agent memory abstraction. Mem0 sits *above* the Markdown vault and *below* every agent that asks "what do we already know about this person / project / decision?" It is the index layer that turns the raw `~/captures/` exhaust into per-agent recall — Concierge remembers Frank's onboarding shorthand, the Orchestrator remembers which IS each intent routed to last time, the People Intelligence sub-stack remembers per-client case histories. **Mem0 is a derived index, never source of truth. The Markdown vault is canonical.**

**Role in the stack:** Capture Stack · L2 (memory abstraction) · per-agent semantic recall over `~/captures/` + `Arcanea/wiki/` + `Starlight-Intelligence-System/memory/`
**Why Mem0 over alternatives:** open-source, MIT-licensed, supports per-agent and per-user namespaces natively, ships with a clean Python API, has a vector backend pluggable to Supabase pgvector (matches L2 of `STACK.md`). Letta / MemGPT is heavier and opinionated about agent loop. Zep is fine but commercial-leaning. Pinecone-only setups violate sovereignty.
**Source:** https://github.com/mem0ai/mem0
**License:** Apache-2.0
**Status in substrate:** unsurfaced → **scaffolded** (this install moves it to `live` once the smoke test confirms a query against ingested capture data returns a coherent memory)

## Prerequisites

- **OS:** Windows 11 (primary). Mem0 is pure Python — runs anywhere.
- **Hardware:** memory budget on Lenovo (16GB total, audited tight per Risk Register § 12). Mem0 idle: ~150MB. Embedding inference: ~1-2GB depending on model. **Use cloud embeddings (Groq or Voyage) on Lenovo to keep RAM free; local embeddings on Acer if/when it gets dedicated.**
- **Disk:** ~1-3 GB for the vector store after a few months of captures.
- **Required tools:**
  - **Python 3.11** (same pin as meetscribe — share the toolchain)
  - `pip` and `venv`
  - **Postgres with pgvector** — preferred backend, matches `STACK.md` L2. Two paths:
    - Cloud: existing Supabase project (recommended — Frank already runs Supabase per STACK.md L4)
    - Local: Postgres 16 + pgvector via Docker Desktop or `winget install PostgreSQL.PostgreSQL`
  - Optional: Qdrant (local vector DB) as fallback if Postgres is overkill for first install
- **API keys:**
  - **Required:** Groq API key (already in place for meetscribe — reuse)
  - **Required:** OpenAI key OR Voyage AI key for embeddings (Voyage preferred — cheaper, sovereignty-clean)
  - **Required:** Supabase service role key (if using Supabase pgvector)
  - All in `~/.starlight/secrets/.env`. Never in the Mem0 install dir.

## Install steps

### 1. Pick a venv home

Mem0 is a library, not a service. The cleanest pattern is a dedicated `starlight-memory` Python project that owns Mem0 + Graphiti + the ingestion scripts.

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\tools\starlight-memory"
cd "$HOME\tools\starlight-memory"
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

### 2. Install Mem0

```powershell
pip install "mem0ai[all]"
# Pin a specific version once smoke test passes — record the exact version in MEMORY.md
pip show mem0ai
```

If `[all]` brings in too many heavy deps for Lenovo, install minimal + the embedding backend you chose:

```powershell
pip install mem0ai openai voyageai pgvector psycopg[binary]
```

### 3. Provision the vector backend

**Option A — Supabase pgvector (recommended):**

```powershell
# Verify pgvector extension is enabled in your Supabase project
# Dashboard → Database → Extensions → search 'vector' → enable
# Capture the connection string (Project Settings → Database → URI):
#   postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

Add to `~/.starlight/secrets/.env`:

```
MEM0_VECTOR_STORE=pgvector
MEM0_PGVECTOR_URL=postgresql://postgres:...@db.[project].supabase.co:5432/postgres
MEM0_EMBEDDING_PROVIDER=voyage
VOYAGE_API_KEY=...
MEM0_LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...
```

**Option B — Local Qdrant via Docker (fallback if Supabase is unavailable):**

```powershell
docker run -d --name qdrant -p 6333:6333 -v "$HOME\captures\.mem0\qdrant:/qdrant/storage" qdrant/qdrant
```

```
MEM0_VECTOR_STORE=qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333
```

### 4. Create the Mem0 config

Mem0 is library-driven, so "config" lives in a Python module the orchestrator and ingestion scripts both import. Create `~/tools/starlight-memory/starlight_memory/config.py`:

```python
# ~/tools/starlight-memory/starlight_memory/config.py
import os

MEM0_CONFIG = {
    "version": "v1.1",
    "embedder": {
        "provider": os.environ["MEM0_EMBEDDING_PROVIDER"],
        "config": {
            "model": "voyage-3" if os.environ["MEM0_EMBEDDING_PROVIDER"] == "voyage" else "text-embedding-3-small",
        },
    },
    "llm": {
        "provider": os.environ["MEM0_LLM_PROVIDER"],
        "config": {
            "model": "llama-3.1-70b-versatile",
            "temperature": 0.1,
        },
    },
    "vector_store": {
        "provider": os.environ["MEM0_VECTOR_STORE"],
        "config": {
            "url": os.environ.get("MEM0_PGVECTOR_URL"),
            "host": os.environ.get("QDRANT_HOST"),
            "port": int(os.environ.get("QDRANT_PORT", 6333)),
            "collection_name": "starlight",
        },
    },
}

# Per-agent namespaces — one row per Starlight agent
AGENT_NAMESPACES = [
    "starlight-orchestrator",
    "starlight-prime",
    "starlight-architect",
    "starlight-navigator",
    "starlight-sentinel",
    "starlight-weaver",
    "starlight-sage",
    "starlight-genius",
    "starlight-business",
    "starlight-secondbrain",
    "starlight-embodiment",
    "starlight-voice-operator",
    "concierge",
    "envoy",
    # People Intelligence sub-stack
    "people-hire",
    "people-perf",
    "people-train",
    "people-culture",
    "people-talent",
    "people-org",
]
```

Pin Mem0 to use **only** these namespaces. Do not let agents auto-create new namespaces — every agent that needs memory enters this list explicitly.

## Configuration

**Config file location:** `~/tools/starlight-memory/starlight_memory/config.py` (Python module — version-controlled in the SIS repo under `core/orchestrator/memory/` once the install stabilizes).

**Substrate-pinned values:**
- **Embedding provider:** Voyage (sovereignty-clean, cheaper, Anthropic-recommended).
- **LLM for memory operations:** Groq Llama 3.1 70B (fast, free-tier-acceptable for memory ops).
- **Vector store:** Supabase pgvector (matches `STACK.md` L2).
- **Namespaces:** declared explicitly in `AGENT_NAMESPACES`. No auto-creation.
- **Retention:** **infinite at the index level** — Mem0 keeps everything. Pruning is the vault's job, not Mem0's. If a vault entry is deprecated, the corresponding Mem0 entries are tombstoned, not deleted, so historical reasoning still works.

**Integration with `~/captures/`:**

Mem0 does NOT poll `~/captures/`. It receives writes via an ingestion script (`scripts/ingest_captures.py`) that runs on a schedule:

```python
# Pseudo-code — full script lands in core/orchestrator/memory/ingestion/
from mem0 import Memory
from starlight_memory.config import MEM0_CONFIG

m = Memory.from_config(MEM0_CONFIG)

# Per meeting summary
m.add(
    messages=summary_text,
    user_id="frank",
    agent_id="starlight-orchestrator",
    metadata={
        "source": "meetscribe",
        "meeting_id": meeting_id,
        "participants": participants,
        "consent_confirmed": True,
        "started_at": started_at,
    },
)

# Per significant screenpipe event (NOT every frame — only marked events)
m.add(
    messages=event_summary,
    user_id="frank",
    agent_id="starlight-secondbrain",
    metadata={"source": "screenpipe", "frame_id": frame_id, "ts": ts},
)
```

**Ingestion cadence:**
- Meeting summaries: ingested immediately on meetscribe `process` completion (hook into meetscribe's post-process).
- Screen captures: NOT all of them. Only `mark-mattered` events (Phase 2 voice command) and OCR-detected high-signal patterns (decisions, names, deadlines) get promoted to Mem0.
- Vault writes: `Arcanea/wiki/` and `Starlight-Intelligence-System/memory/vaults/` watched via fswatch / chokidar; on save, ingest as `source: vault, canonical: true`.

## Smoke test

```powershell
# Activate venv
cd "$HOME\tools\starlight-memory"
.\.venv\Scripts\Activate.ps1

# Source env
Get-Content "$HOME\.starlight\secrets\.env" | ForEach-Object {
    if ($_ -match "^(.+?)=(.+)$") { Set-Item -Path "env:$($matches[1])" -Value $matches[2] }
}

# Run a Python REPL test
python -c @"
from mem0 import Memory
from starlight_memory.config import MEM0_CONFIG

m = Memory.from_config(MEM0_CONFIG)

# Write
result = m.add(
    messages='Frank decided 2026-04-25: Starlight Orchestrator is the canonical name. Killed: Jarvis (brand), SIS Conductor.',
    user_id='frank',
    agent_id='starlight-orchestrator',
    metadata={'source': 'smoke-test', 'date': '2026-04-25'},
)
print('WRITE:', result)

# Read
results = m.search(
    query='What did Frank decide about the orchestrator name?',
    user_id='frank',
    agent_id='starlight-orchestrator',
    limit=3,
)
print('READ:', results)
"@
```

If the read returns the smoke-test memory with a non-zero score and the metadata round-trips intact, Mem0 is live.

## Integration with the Starlight Orchestrator

Mem0 is **bidirectional** with the Orchestrator.

**Data flow:**
```
~/captures/screen, /meetings    Markdown vault (canonical)
        │                              │
        ▼                              ▼
   ingestion script ─────────────► Mem0 (derived, per-agent)
                                       │
                                       ▼
                          Starlight Orchestrator
                          (queries Mem0 on every voice intent
                           to fetch per-agent context)
                                       │
                                       ▼
                          Graphiti (next install)
```

**The vault stays canonical — non-negotiable:**
- Every Mem0 entry carries `source` metadata. If `source: vault`, it is canonical-derived and may be cited directly. If `source: meetscribe` or `screenpipe`, it is raw-derived and must be promoted to vault before being treated as truth.
- `Memory.reset()` is a recovery operation — if Mem0 corrupts, regenerate the entire index by re-ingesting from vault + captures. The vault never depends on Mem0.

**Per-agent namespaces matter:**
- `starlight-orchestrator` namespace: cross-cutting context, IS routing history, decision log.
- `concierge` namespace: newcomer interactions, intake routing.
- `people-hire` namespace: People Intelligence hiring case histories (sovereign-user scoped).
- The Orchestrator queries the namespace of the agent it is routing to, NOT a global namespace. This prevents cross-contamination between sovereign users (when SIS productizes per § Domain Sub-Stack Tier).

## Refusal patterns

**Mem0 must never:**
- Be treated as source of truth. The vault is canonical. Mem0 is derived. Period.
- Auto-create namespaces from agent_id strings the orchestrator passes in. Namespaces are declared in `AGENT_NAMESPACES`. Unknown agent_id → log + reject.
- Persist secrets, API keys, or wallet seeds. Pre-write redaction filter must scrub `[A-Za-z0-9]{32,}` patterns adjacent to keywords like `key`, `secret`, `seed`, `password`. (Imperfect, but a floor.)
- Be queried for cross-user data. SIS productization (per `verticals/people-intelligence/`) implies multiple sovereign users in the future. Each user runs their own Mem0 instance against their own pgvector schema. No shared memory.
- Sync its vector DB across machines via Syncthing. Mem0 is regenerable from vault + captures; sync is wasteful and creates split-brain risks. Each machine ingests independently against the **same** Supabase pgvector backend.

**This install does NOT:**
- Replace the Markdown vault. Vault is canonical.
- Build the temporal graph — that is Graphiti's job. Mem0 is per-agent semantic; Graphiti is temporal-relational.
- Configure auto-ingestion hooks for meetscribe/screenpipe. Those are separate scripts under `core/orchestrator/memory/ingestion/` (Phase 1 § 1.5 follow-up).

## Troubleshooting

| Symptom | Likely cause | Remediation |
|---|---|---|
| `mem0ai` install fails on Windows | Native deps for chromadb or hnswlib missing | Install Build Tools for Visual Studio (C++ workload) via `winget install Microsoft.VisualStudio.2022.BuildTools`; alternatively avoid the `[all]` extra and pin Postgres backend |
| Embedding API returns 429 | Voyage / OpenAI rate limit | Add exponential backoff in ingestion; throttle to 5 req/s; consider local embeddings (sentence-transformers) for bulk vault re-ingestion |
| `m.search` returns empty for known content | Wrong agent_id / user_id namespace | Verify the exact strings match `AGENT_NAMESPACES`; case-sensitive |
| pgvector connection times out | Supabase IP allowlist or pooled connection limit | Use the **session pooler** URL not the direct URL on Supabase; verify the password has no shell-meta chars |
| Memory entries cite hallucinated sources | LLM extracting facts that were never in the source text | Drop `temperature` to 0.0 for ingestion LLM; review extracted facts before promoting to vault |

## Phase 1 status after install

**Capability lit:**
- Per-agent semantic recall over captures + vault (Phase 1 § 1.5 partial — Mem0 half done).
- Foundation for Graphiti ingestion (Mem0's metadata flows into Graphiti node creation).
- First intelligent voice query becomes possible: "Starlight, what do I already know about this person?" — the Orchestrator queries Mem0 across `concierge` + `starlight-orchestrator` namespaces and returns a synthesis.

**Next install in dependency order:** **Graphiti** — temporal layer on top of Mem0. Graphiti reads Mem0's metadata (timestamps, participants, decisions) and constructs the time-aware knowledge graph that powers the Neural Constellation view.

**Phase 1 progression after this install:**
- 1.3 screenpipe ✓
- 1.4 meetscribe ✓
- 1.5a Mem0 ✓ (this install)
- 1.5b Graphiti — next

---

**Built on SIP** — install playbook · v7.5
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, memory-derived]
- Phase: 1.5a (capture stack — memory abstraction)
- Generated: 2026-04-26
