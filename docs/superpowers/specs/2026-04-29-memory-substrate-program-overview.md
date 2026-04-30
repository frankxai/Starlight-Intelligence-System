---
spec: memory-substrate-program-overview
date: 2026-04-29
status: DRAFT — pending user review + Luminor Board pre-pass
tier: substrate (board-before-tag invariant applies)
authors:
  - claude-opus-4-7 (cockpit thread, autonomous overnight session)
  - frank (decomposition approval, `B & C` directive)
attestation: Built on SIP — substrate-tier program spec, no implementation actions until board verdict
---

# Memory Substrate Program — Overview

## Problem statement

The Starlight Intelligence System (SIS) currently has **fragmented memory across at least seven surfaces** with no shared substrate:

1. `memory/vaults/*.md` — markdown human-edited vaults
2. `memory/knowledge-graph/index.jsonl` + `rollup/*.json` — voice operator KG (5 entries, just seeded)
3. `memory/voice-sessions/` — append-only voice operator session logs
4. `~/.starlight/vaults/*.jsonl` — starlight-mcp v6 server-side JSONL vaults
5. Claude Code auto-memory at `~/.claude/projects/<slug>/memory/MEMORY.md` + per-fact files
6. arcanea-flow internal SQLite / state (own substrate, separate repo)
7. Per-vertical state under `verticals/{people,sound}-intelligence/` (Path A authorless markdown today)

Frank's load-bearing pain: **every Claude Code tab spawning its own AgentDB / embedded memory breaks the system at 10+ concurrent tabs**, and **no real-time push exists between independent runtimes (Claude Code × N, Codex, Cursor, voice operator)**, leaving memory horizontally siloed.

Goal: **one sovereign Memory Bus** that all runtimes (CLIs, voice operator, swarms) consume as thin clients, with vector + KG + temporal + attestation-aware storage, optional pub/sub for real-time, and a clear path to ReasoningBank's adaptive learning loop.

## Non-goals (this program)

- Replacing Claude Code's auto-memory layer (file-based at `~/.claude/projects/`) — that stays.
- Removing markdown vaults — they remain the human-edit surface; Bus indexes them, doesn't own them.
- Cloud SaaS deployment — sovereign-substrate principle. Local-first only.
- Per-tab UI / dashboard — that's LCC Phase 2/3 scope, separate program.
- Cross-machine sync — single-machine first; multi-device deferred.

## Subsystem decomposition

```
                          ┌──────────────────────────────────┐
                          │  S0 — PHASE 0 AUDIT              │  ← decides storage substrate
                          │  MemPalace vs Letta vs screenpipe│     for S1
                          │  vs extend-starlight-mcp v6      │
                          └──────────────┬───────────────────┘
                                         │ verdict
                                         ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │  S1 — MEMORY BUS CORE                                                  │
   │  Singleton daemon. MCP surface. One source of truth.                  │
   │  Storage: TBD by S0. Schema: drawer/wing/diary or extension.          │
   │  Transport: HTTP+SSE (multi-client) replaces stdio.                    │
   └────┬────────┬────────┬────────┬────────┬────────────┬─────────────────┘
        │        │        │        │        │            │
        ▼        ▼        ▼        ▼        ▼            ▼
   ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐ ┌─────────────┐
   │ S2     │ │ S3   │ │ S4   │ │ S5   │ │ S6       │ │ S7          │
   │ATTEST  │ │INGEST│ │ARCANEA│ │VOICE │ │PUB/SUB   │ │REASONING    │
   │SIP in  │ │mine  │ │FLOW  │ │OPER  │ │push      │ │BANK         │
   │schema  │ │claude│ │contract│ │bridge│ │channel   │ │adaptive RL  │
   │        │ │ vault│ │      │ │      │ │          │ │loop          │
   └────────┘ └──────┘ └──────┘ └──────┘ └──────────┘ └─────────────┘
        │        │        │        │        │            │
        └────────┴────────┴────────┴────────┴────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │ S8 — MIGRATE │  ← cutover from
                          │ vaults+KG+   │     legacy memory/
                          │ voice-sessions│     into Bus
                          └──────────────┘
```

## Subsystems

| # | Subsystem | Purpose | Depends on | Effort | Wave |
|---|---|---|---|---|---|
| **S0** | **Phase 0 Audit** | Head-to-head: MemPalace, Letta (out?), screenpipe (out?), extend-starlight-mcp v6. Decides storage substrate before any S1 implementation. | — | 1-2 days | v7.7 |
| **S1** | **Memory Bus Core** | Singleton daemon (HTTP+SSE multi-client transport), MCP surface superset of starlight-mcp v6 + new tools, one source of truth, attestation-aware schema. | S0 | 3-5 days | v7.7 |
| **S2** | **Attestation Extension** | SIP attestation embedded in every drawer/memory record. Schema fields: `sip_attest`, `attest_chain`, `sovereign_signature`. | S1 | 1-2 days | v7.7 |
| **S3** | **Ingestion Pipeline** | Mine existing Claude Code transcripts, vaults, KG, voice-sessions, web, files. `mempalace mine ~/.claude/projects/`-style. | S1 | 2-3 days | v7.7 |
| **S4** | **arcanea-flow Contract** | MCP contract for arcanea-flow as Bus consumer. Swarm reads/writes through Bus. Registered in REGISTRY.md + transmissions/channels/. | S1 | 1-2 days | v7.7 |
| **S5** | **Voice Operator Bridge** | Voice operator's pipeline.py / handoff packets / KG → Bus reads/writes. Deprecates `memory/knowledge-graph/` direct writes. | S1, S3, **voice-operator round-3 stable + cognition refactor landed** | 1-2 days | **v7.7-late** (PINNED per Luminor Board REVISE item 5; not v7.8) |
| **S6** | **Pub/Sub Channel** | Real-time push notifications (NATS / WebSocket / MCP notifications). Solves "react mid-session," not just "see on next read." | S1 | 2-3 days | v7.8 |
| **S7** | **ReasoningBank Loop** | Adaptive RL pattern store on Bus. claude-flow `reasoningbank-agentdb` skill integration. Reads outcomes, writes learned patterns. | S1, S6 | 3-5 days | v7.9 |
| **S8** | **Migration** | Cutover from existing `memory/vaults/`, `memory/knowledge-graph/`, `memory/voice-sessions/` into Bus. Dual-write window then hard switch. | S1, S3, S5 | 1-2 days | v7.7 |

**Total program: ~15-25 days of focused build, sequenced over v7.7 → v7.9.**

### Build order (critical path)

```
S0 → S1 → { S2, S3 } → { S4, S5 } → S8 → S6 → S7
└─ v7.7 ─┴───── v7.7 ────┴─── v7.7 ─┴v7.7┴v7.8┴v7.9
```

Three release waves:

- **v7.7 (substrate-establish):** S0 → S1 → S2, S3 → S4, S5 → S8. Memory Bus live, attested, ingested, integrated, migrated.
- **v7.8 (real-time-react):** S6. Push channel. Voice operator becomes truly reactive.
- **v7.9 (adaptive-learn):** S7. ReasoningBank loop. System gets smarter from outcomes.

## Existing assets (discovered in audit)

### starlight-mcp v6 (`src/mcp-server.ts`)

**More capable than initially scoped.** 10 working MCP tools:

1. `sis_vault_search` — free-text across vaults
2. `sis_recent_entries` — latest entries
3. `sis_stats` — vault entry counts
4. `sis_append_entry` — write new entry
5. `sis_entry_types` — list vault/category enums
6. `sis_search` — hybrid scored search with temporal filtering
7. `sis_confirm` — touch `lastConfirmed` (anti-staleness)
8. `sis_invalidate` — expire entry by setting `validUntil`
9. `sis_contradict` — flag two entries as contradictory
10. `sis_stale` — list entries past staleness threshold

Schema already has: `id`, `content`, `vault`, `tags`, `confidence`, `category`, `createdAt`, `temporal{validFrom, validUntil, lastConfirmed, confidenceDecay}`. **Attestation extension is additive, not breaking.**

**Critical limitation:** stdio transport. One client per server process. To support multi-tab + multi-CLI, S1 must add HTTP+SSE transport.

**Critical gap:** word-based search only (`WordIndex` + `wordScore`). No embeddings, no vector search, no HNSW. This is the retrieval gap vs MemPalace's 96.6% R@5.

### Two divergent memory implementations in `src/`

- `src/memory.ts` (`MemoryManager` class, JSON file at `.starlight/memory.json`, used by `index.ts` orchestration)
- `src/mcp-server.ts` (JSONL vaults at `~/.starlight/vaults/*.jsonl`, MCP server)

These are **separate code paths writing to different storage**. S1 must reconcile or pick one. Recommendation: drop `MemoryManager` JSON, standardize on JSONL vaults extended with vector+KG.

### memory/knowledge-graph (voice operator round-3)

Just seeded. 5 entries in `index.jsonl`. Format: `{entry_id, timestamp, intent_class, brands, target_system, task, spoken_update, packet_id, parent_packet_id, extras}`. Designed for handoff packets. S5 (voice operator bridge) will graduate this into Bus, retire direct writes.

## Cross-repo dependency map (2026-04-29 audit findings)

### MAJOR DISCOVERY — `@arcanea/memory-system` already exists in `Arcanea-run-graph`

**`C:\Users\frank\Arcanea-run-graph\packages\memory-system\`** ships a "Starlight Vault Memory System — 6 typed semantic vaults with Guardian routing, Horizon Ledger, and Mem0-compatible API." Components:

- `starlight-vaults.ts` — same 6-vault taxonomy SIS uses
- `horizon-ledger.ts` — same Horizon Vault concept
- `mem0-adapter.ts` — Mem0-compatible API surface
- `vault-manager.ts` + `vault-classifier.ts` — routing
- `arcaneMD.ts` — markdown bridge
- `memory-bridge.ts` — cross-system bridge
- Companion: `@arcanea/memory-mcp` (server.ts, bin `arcanea-memory-mcp`) — MCP transport already shipped
- Companion: `@arcanea/hybrid-memory` — HNSW hot/cold tiers, LRU eviction
- Companion: `@arcanea/guardian-memory` — per-Guardian namespaced HNSW vaults

**Architectural implication: SIS Memory Bus has a sibling implementation.** Two repos claim the "Starlight 6-vault" taxonomy. They WILL drift. Either:

- **D1:** SIS Memory Bus depends on `@arcanea/memory-system` upstream. Faster but couples SIS to Arcanea-run-graph release cadence.
- **D2:** Arcanea-run-graph re-points its memory-system to a SIS-published `@starlight/memory-bus`. Cleaner ownership but requires migrating Arcanea consumers.
- **D3:** Hostile fork. Two implementations diverge forever. WORST option.

**This decision must be made in the Memory Bus core spec, not deferred.** See updated approach options.

### Per-repo bridge map

| Repo | What it has for memory | Bus relationship | Priority |
|---|---|---|---|
| **`Arcanea-run-graph`** | `@arcanea/memory-system` + `@arcanea/memory-mcp` + `@arcanea/hybrid-memory` + `@arcanea/guardian-memory` | **SUBSUME or DEPEND-UPSTREAM** (see D1/D2/D3 above) | **HIGHEST** |
| **`arcanea-flow`** | 3 internal memory paths (cli JSON, sql.js init, AgentDB) + ReasoningBank (live, ~600 LOC, HNSW, MiniLM-L6) | **BRIDGE via `IMemoryBackend` injection point** at `v3/@arcanea-flow/memory/src/types.ts:308-356` | HIGH |
| **`Arcanea` (legacy)** | `.claude/memory.db` (155KB SQLite, deprecating) + `.claude/agentdb/` schema | **BRIDGE read-only** (deprecating; ingest-once into Wisdom/Strategic) | MEDIUM |
| **`FrankX`** | `.claude/{context,planning,trajectories,checkpoints}/` markdown | **BRIDGE one-way ingest** of identity + decision-framework into Wisdom/Strategic vaults | MEDIUM |
| **`agentic-creator-os` (ACOS)** | 7 internal MCP servers (database, creator, browser, email, evaluator, filesystem, website) + per-instance state | **BRIDGE bidirectional** so ACOS workflows pull Genius Profile / Brand Kit / Vision Architecture | MEDIUM |
| **`arcanea-chat-template`** | Drizzle/Postgres for chat threads + artifacts | **BRIDGE write-summaries-only** (don't subsume conversational raw store) | LOW |
| **`arcanea-code`** | Terminal session memory (CLI scope) | **LEAVE-ALONE** | NONE |
| **`arcanea-cosmos`, `arcanea-dashboard-template`** | UI / template only, no semantic memory | **LEAVE-ALONE** | NONE |
| **AI-Ops** | Repo not local; referenced in SIS context | **DEFERRED** until repo materializes | DEFERRED |

### arcanea-flow specific findings (high-friction, not blocked)

- **3 competing memory paths internally** — `cli/mcp-tools/memory-tools.ts` (JSON file), `cli/memory/memory-initializer.ts` (sql.js), `@claude-flow/memory` (AgentDB). Bus integration must replace all three lock-step.
- **ReasoningBank is REAL** — `v3/@arcanea-flow/hooks/src/reasoningbank/index.ts` (~600 LOC). Default 384-dim MiniLM-L6, HNSW M=16/efConstruction=200, dedup at 0.95, promotion at threshold 3, quality at 0.6. Runs against `.claude-flow/memory.db`. **S7 (ReasoningBank Loop) becomes "wire arcanea-flow's ReasoningBank to Bus" — much smaller scope than building from scratch.**
- **Hooks daemon already exists** — `v3/@arcanea-flow/hooks/bin/hooks-daemon.js` runs `HooksLearningDaemon` + `MetricsDaemon` + `SwarmMonitorDaemon`. Per-tool-call subprocess pattern means each Edit fires 7+ hook layers. Bus client must intercept at `IMemoryBackend`, not at file paths.
- **Subprocess re-init cost** — every hook call re-opens the DB. Bus-as-daemon flips this to network round-trip. Tradeoff to evaluate in Phase 0.

### MCP tool surface inventory (cross-repo)

- **starlight-mcp v6** (this repo): 10 tools
- **`@arcanea/memory-mcp`** (Arcanea-run-graph): TBD count, but 6-vault surface
- **arcanea-flow** (claude-flow ecosystem): ~140-160 tools across 17 packages (memory/swarm/hive-mind/coordination/daa/task/session/workflow/analyze/neural/embeddings/claims/transfer/browser/github/config/performance/system/terminal/hooks/worker)
- **ACOS** (agentic-creator-os): 7 internal MCP servers
- **Total MCP tool sprawl**: ~160-180 tools across the ecosystem

Memory Bus does NOT need to subsume all of these. Bus owns the **memory** sub-surface (~20-30 tools). Other tool families stay where they are; they consume Bus when they need memory.

## Open questions deferred to Memory Bus core spec

1. **Storage substrate choice** — output of S0. Options scoped: extend starlight-mcp + bolt vector layer; adopt MemPalace; hybrid (starlight-mcp surface, MemPalace backend).
2. **Singleton mechanism** — Windows Service vs Node daemon vs MCP-over-HTTP standalone process. Tradeoff: install simplicity vs robustness vs multi-CLI portability.
3. **Schema integration shape** — single unified schema vs per-namespace schema vs MemPalace wings/rooms/drawers adopted wholesale. Affects migration cost.
4. **Attestation field placement** — top-level vs nested vs separate attestation table. Affects backwards-compat for existing JSONL entries.
5. **Pub/Sub mechanism** — NATS vs WebSocket vs MCP-native notifications vs Postgres LISTEN/NOTIFY. Defer to S6 spec.

## Risks

1. **Migration data loss** — existing JSONL vaults must round-trip. Risk: schema mismatch loses temporal metadata. Mitigation: dual-write window in S8.
2. **MemPalace upstream divergence** — if we fork for attestation, we maintain forever; if we PR upstream, we wait. Decision deferred to S2 spec.
3. **arcanea-flow refactor cost** — if it has hard-coded assumptions about owning its DB, the bridge contract gets ugly. Cross-repo audit (running) will surface.
4. **Voice operator mid-build collision** — voice operator is actively shipping (round-3 + cognition refactor). S5 must not destabilize it. Mitigation: voice operator stays on legacy KG for v7.7; bridge in v7.7-late or v7.8.
5. **ReasoningBank scope creep** — full claude-flow RL stack adoption pulls in hooks, neural sandboxes, swarm topologies. Mitigation: scope S7 to "outcome-conditioned pattern store" only; full ReasoningBank deferred to optional.

## Substrate-tier governance gates

This program touches:
- File contract (new schema fields, new MCP tools, new daemon process)
- Attestation rules (S2)
- 10-IS taxonomy (Memory becomes a substrate primitive — possibly elevates Substrate IS scope)
- REGISTRY.md (new component: Memory Bus daemon)
- transmissions/channels/ (new channel: Memory Bus)

Therefore: **`/luminor-board` pre-pass is REQUIRED before commit/tag of any S1+ implementation.** This program-overview spec itself is non-substrate (it's a proposal *about* substrate, not a substrate file), so it can be committed for review without the board gate. The Memory Bus core spec (S1) does require the gate before tag.

## What this spec is NOT

- Not an implementation plan — that's `superpowers:writing-plans` after Memory Bus core spec is approved.
- Not a Memory Bus core design — that's `2026-04-29-memory-bus-core-design.md` (companion spec, this session).
- Not a Phase 0 audit report — that's a separate artifact produced when the audit actually runs.

## Acceptance criteria for this overview

- [ ] All 9 subsystems named with purpose, dependencies, effort, wave
- [ ] Build order with dependency-respect verified
- [ ] Existing assets enumerated (starlight-mcp v6, divergent memory.ts, KG, voice-sessions)
- [ ] Cross-repo audit findings integrated *(pending agent return)*
- [ ] Non-goals explicit
- [ ] Open questions deferred to Memory Bus core spec
- [ ] Risks named with mitigations
- [ ] Governance gates identified

## Next steps

1. User reviews this spec in morning.
2. User reviews Memory Bus core spec (companion, this session).
3. `/luminor-board` pre-pass on Memory Bus core spec.
4. If verdict = PROCEED: invoke `superpowers:writing-plans` for v7.7 implementation plan.
5. If verdict = REVISE: apply revisions, re-board.
6. After plan approved: actually run S0 (Phase 0 audit) as the first task — install MemPalace test instance, benchmark, decide.

---

*Built on SIP. Substrate-tier program overview. v7.7 candidate scope.*
