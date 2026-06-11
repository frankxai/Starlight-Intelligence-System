# SIS Memory + Persistence Architecture Recommendation — 2026-05-11

## Position

SQLite is the right v0 local operational database for SIS. AgentDB, Mem0, Graphiti, Chroma, and future vector/agent-memory systems should not replace it. They should sit beside it as derived or optional substrates behind stable SIS contracts.

The core rule:

> Markdown and event logs are the canonical memory record. SQLite is the local operating index. Specialist memory engines are derived indexes or optional adapters.

## Current Repo Reality

Live or scaffolded surfaces in this repo:

- `memory/vaults/` — six semantic Markdown vaults. Human-readable institutional memory.
- `memory/_audit/` — JSONL audit logs, operator-private and gitignored.
- `memory/knowledge-graph/index.jsonl` — JSONL knowledge graph index, gitignored runtime artifact.
- `memory/knowledge-graph/_brain-cache.json` — derived brain graph cache, gitignored runtime artifact.
- `memory/mempalace/` — local atom store and vector matrix, gitignored runtime artifact.
- `memory/mempalace_upstream/` — Chroma/SQLite upstream vector store, operator-private runtime artifact.
- `private/memory-bus/` — singleton MCP memory mediator over the voice-operator memory substrate.
- `private/voice-operator/service/` — command, packet, dispatch, memory, KG, brain graph, and agent routing services.
- `docs/install/{mem0,graphiti,syncthing}.md` — install playbooks for optional semantic, temporal, and P2P sync layers.
- `dist/*mcp*.js` — built MCP server surfaces for agent access.

## Recommended Layering

### L0 — Git + Markdown Canon

Canonical, portable, inspectable:

- Protocol and public substrate docs.
- Agents, skills, commands, packs, templates.
- Vault entries that are safe to version.
- Install docs and migration docs.

Do not commit:

- PII-heavy audit logs.
- Raw captures.
- Vector indexes.
- Chroma/SQLite runtime stores.
- Secret configs.
- Agent scratch state.

### L1 — Append-Only Event Log

Use JSONL for:

- `AgentEvent`
- `WorkPacket` lifecycle
- `Decision` events
- vault write receipts
- MCP tool invocations
- cost records
- permission approvals

Why: append-only logs are debuggable, replayable, sync-friendly, and survive schema evolution.

### L2 — SQLite Operational Database

Use SQLite for the local dashboard and MCP query layer:

- work packets
- agent runs
- agent events
- decisions
- artifacts
- packs
- permissions
- vault entry metadata
- graph nodes and edges
- cost telemetry
- local FTS5 indexes

SQLite should be the local read model built from Markdown + JSONL events. It may be rebuilt from canonical sources.

Operational settings:

- Enable WAL for read-heavy dashboard + daemon workloads.
- Keep one writer path per database process.
- Use migrations checked into git.
- Treat `*.db-wal` and `*.db-shm` as runtime state, not source docs.

### L3 — Memory Bus

Use `private/memory-bus/` as the singleton cross-agent write mediator.

All coding agents should write memory through one of:

- MCP memory bus tools.
- SIS MCP tools.
- Voice Operator packet router.
- CLI commands that call the same underlying memory functions.

Avoid direct writes from each agent into vector stores. That causes divergent indexes and race conditions.

### L4 — Specialist Derived Indexes

Use these as accelerators, not canonical truth:

- mempalace: local atom/vector recall.
- Chroma: existing vector substrate under `memory/mempalace_upstream/`.
- Mem0: per-agent semantic memory abstraction.
- Graphiti: temporal knowledge graph and change reasoning.
- AgentDB: optional remote/serverless agent database for ephemeral project DBs or templates.
- DuckDB: optional analytics over event logs and cost telemetry.

Each adapter must implement:

- `commit(memory_event)`
- `recall(query, filters)`
- `health()`
- `rebuild_from_canon()`
- `export_manifest()`

## SQLite vs AgentDB

Use SQLite when:

- data must be local-first;
- dashboard needs fast local reads;
- no cloud dependency is allowed;
- installability matters;
- source of truth can be rebuilt locally;
- the user owns the repo and machine.

Use AgentDB when:

- an agent needs a fast throwaway or project-specific database;
- remote MCP access matters more than local sovereignty;
- database templates reduce schema-discovery overhead;
- sharing an isolated DB with external agents is useful;
- DuckDB-style analytics are wanted without local setup.

They can work together:

- SQLite remains the local operating database.
- AgentDB becomes an optional adapter/export target.
- Pack templates can generate either SQLite migrations or AgentDB templates.

Do not make AgentDB required for SIS v0.

## Cross-Agent Awareness

The target state:

1. Every agent action writes an `AgentEvent`.
2. Every `AgentEvent` goes through the event bus.
3. The dashboard subscribes to the event bus or tails the event log.
4. Memory Bus receives approved memory writes.
5. SQLite read models update from events.
6. Graph and vector indexes update asynchronously.
7. Claude Code, Codex, Gemini, OpenCode, browser-use, and Voice Operator all read the same MCP resources.

Current state is partial:

- CLI/MCP surfaces exist.
- Memory Bus exists.
- Voice Operator dispatchers exist.
- Brain graph watchdog/cache exists.
- Full WorkPacket/AgentEvent dashboard loop is the next build target.

## Multi-Machine Persistence

Portable by git:

- code
- docs
- schemas
- migrations
- prompts
- packs
- public-safe vault summaries

Portable by backup/Syncthing, not public git:

- private vaults
- audit logs
- mempalace atoms/vectors
- Chroma/SQLite stores
- captures
- local daemon state

Portable by regeneration:

- SQLite read-model database
- brain cache
- FTS indexes
- graph layout caches

Install contract for a new machine:

1. Clone repo.
2. Install Node/pnpm/Python/Docker.
3. Run package install/build.
4. Restore private runtime bundle from encrypted backup or Syncthing.
5. Run `starlight doctor`.
6. Run `starlight vault health`.
7. Rebuild derived indexes if missing.

## Modularity Of Intelligence Systems

Each IS should be packaged as a module with:

- `MODULE.yaml`
- enable/disable flag
- commands
- agents
- skills
- schemas
- migrations
- dashboard views
- permissions
- packs
- evals
- docs

The core should know only the module manifest and contracts. Business IS, Second Brain IS, Code IS, Voice/Video IS, Wealth IS, People IS, Music IS, MIS, RIS, and Sensory Companion must plug into the same event, memory, permission, and dashboard contracts.

No IS should own the global memory database. Each contributes typed records to the shared substrate.

## Architecture Principles

- Boring core, magical edge.
- Canon first, indexes second.
- Local first, cloud optional.
- Events before dashboards.
- Schemas before agents.
- Permissions before tools.
- Rebuildable indexes over opaque state.
- One write bus; many read surfaces.
- Human-readable memory must survive every vendor.
- Spiritual/private systems stay module-scoped, not hardwired into core execution.

## Immediate Next Builds

1. Create the v0 SQLite schema and migrations.
2. Add append-only event log files for `WorkPacket`, `AgentEvent`, `Decision`, `Artifact`, `CostRecord`, and `ApprovalGate`.
3. Wire MCP tools to write events first, then update SQLite.
4. Make dashboard read from SQLite plus live event tail.
5. Route all agent memory writes through Memory Bus or SIS MCP.
6. Add `.md` voice-session promotion into vault/mempalace pipeline.
7. Add `starlight memory rebuild` to regenerate SQLite/FTS/graph/vector indexes from canonical sources.
8. Add an install/export manifest that declares which runtime state is git, backup, Syncthing, or rebuildable.

