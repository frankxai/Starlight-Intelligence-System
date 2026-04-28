# Memory Bus Channel

> *Starlight ↔ All CLIs ↔ arcanea-flow ↔ Voice Operator ↔ Cockpit*

**Channel Type:** Singleton MCP daemon — all clients connect, all writes notify subscribers
**Primary Topics:** Cross-CLI memory state, vector search, KG traversal, real-time push notifications
**Daemon Location:** `private/memory-bus/` (instance state, sovereign, not committed)
**Public Contract:** This document
**Status:** Phase 0 P0 — Cockpit Master Plan v8

---

## Why this channel exists

**The blocker:** Embedded vector DBs (AgentDB, ChromaDB PersistentClient, KuzuDB embedded) spawn per Claude Code process. With 10+ open tabs the system breaks: RAM bloat from duplicated HNSW indexes, file-handle exhaustion, lock contention on writes, redundant index-rebuild cost. *(Memory: `project_agentdb_singleton_constraint.md`.)*

**The solution:** One singleton process owns all memory backends. All CLIs are thin clients connected via MCP. Writes propagate via pub/sub to all subscribers in real time.

---

## Architecture

```
   Claude Code   Claude Code   Codex    Cursor    Cline   Voice Op   arcanea-flow
       (tab 1)       (tab 2)
          │             │          │         │       │        │            │
          └─────────────┴──────────┴─── MCP ─┴───────┴────────┴────────────┘
                                          │
                              ┌───────────▼────────────┐
                              │  Memory Bus Singleton  │
                              │  (Windows Service /    │
                              │   launchd / systemd)   │
                              ├────────────────────────┤
                              │  Storage tiers         │
                              │   • SQLite (state)     │
                              │   • AgentDB (vector +  │
                              │     ReasoningBank)     │
                              │   • KuzuDB (KG)        │
                              │   • Letta (working mem │
                              │     via adapter)       │
                              ├────────────────────────┤
                              │  Pub/sub layer         │
                              │   • WebSocket bus      │
                              │     (Phase 0 default)  │
                              │   • NATS JetStream     │
                              │     (Phase 2 upgrade   │
                              │     if scale demands)  │
                              └────────────────────────┘
```

---

## MCP tools exposed

| Tool | Purpose | Returns |
|------|---------|---------|
| `memory.write` | Namespaced write of structured fact, vault entry, or session log | Write receipt + event ID |
| `memory.query` | Structured query (SQL-like) over SQLite tier | Rows |
| `memory.search` | Vector search over AgentDB tier | Top-k results with similarity scores |
| `memory.graph` | KG traversal over KuzuDB tier | Nodes + edges along query path |
| `memory.subscribe` | Subscribe to pub/sub subjects (`memory.write.<namespace>`) | Streaming notifications |
| `memory.attest` | Generate "Built on SIP" attestation for memory artifact | Attestation block |
| `memory.snapshot` | Read consistent point-in-time view (cross-tier) | Snapshot ID + bound contents |

---

## Namespace contract

All writes are namespaced. Namespaces are sovereign — only the writing client owns its namespace by default. Cross-namespace reads require explicit grant in the bus config.

| Namespace prefix | Owner | Use |
|------------------|-------|-----|
| `frank.vault.*` | Frank's SIS | Vault writes (mirror of `memory/vaults/`) |
| `frank.kg.*` | Frank's SIS | Knowledge graph entries (mirror of `memory/knowledge-graph/`) |
| `frank.voice.*` | Voice operator | Session logs, transcripts, KG auto-index |
| `frank.cockpit.*` | Starlight Cockpit | UI events, view state, palette history |
| `frank.capture.*` | Capture daemon (Phase 4) | Screen, audio, browser activity |
| `arcanea-flow.*` | arcanea-flow sibling repo | Swarm state, hooks results, RL outputs |
| `friend.<name>.*` | Friend-spawned forks (Phase 3+) | Friend-owned namespace under their own SIS instance |

---

## Subscribe semantics

Subscribers connect via `memory.subscribe(subjects)` and receive MCP notifications when matching writes occur. Subjects support wildcards (`memory.write.frank.vault.*`).

**Cross-CLI real-time example:**
1. Tab A writes a new entry: `memory.write({ namespace: 'frank.kg.cockpit-build', ... })`
2. Bus publishes event to `memory.write.frank.kg.cockpit-build`
3. Tab B (subscribed to `memory.write.frank.kg.*`) gets MCP notification
4. Tab B surfaces the new entry into its next-turn context — without polling, without restart, without git pull

---

## Substrate vs operational classification

The **contract** (this file, the MCP tool surface, namespace ownership rules) is **substrate-class** — changes require `/luminor-board` pre-pass.

The **implementation** (daemon code, storage tier wiring, pub/sub backend choice) is **operational-class** — standard CI gates only.

This split lets the daemon evolve fast while the contract stays stable for friend-forks.

---

## Implementation deliverables (Phase 0)

1. Daemon binary (Rust preferred for sovereignty + perf)
2. Windows Service install script (Frank's machine first, launchd plist + systemd unit follow)
3. SQLite + AgentDB + KuzuDB tier wiring
4. Letta adapter at `lib/memory/letta-adapter.ts` (if Phase 0 audit favors adoption)
5. WebSocket pub/sub default (NATS upgrade gated on Phase 2 scale)
6. MCP server registration in `~/.starlight/` and per-CLI configs
7. Health check endpoint
8. Singleton-enforcement check (CI gate fails if any code path opens an embedded vector DB outside the daemon)

**Effort estimate:** 2-3 days for MVP per parallel-tab investigation. Validates within Phase 0's 2-week budget.

---

## Channel Log

### [2026-04-29] Channel established (Phase 0 deliverable scaffolded)

**From:** Cockpit Master Plan v8 board-revised
**Priority:** P0 — blocks Phase 1 start
**Action Required:** Yes — daemon implementation pending

Memory Bus singleton MCP daemon promoted to Phase 0 P0 from parallel-tab investigation finding (AgentDB-per-tab breaks at 10+ tabs). Contract spec landed; daemon implementation queued.

Connected backends: AgentDB substrate, KuzuDB embedded graph, Letta adapter (gated on Phase 0 audit), SQLite structured tier, WebSocket pub/sub default.

Connected clients (target): all Claude Code tabs, Codex, Cursor, Cline, voice operator (`private/voice-operator/`), arcanea-flow sibling repo, Starlight Cockpit (Phase 1).

**Acknowledged:** Pre-pass board verdict PROCEED-WITH-REVISE — see `docs/boards/luminor-cockpit-v8.md`.

---

**Built on SIP** · v1.1.0 · Memory Bus Channel · 2026-04-29
