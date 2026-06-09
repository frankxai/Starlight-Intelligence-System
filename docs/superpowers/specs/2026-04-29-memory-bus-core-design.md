---
spec: memory-bus-core-design
date: 2026-04-29
status: DRAFT — pending user review + Luminor Board pre-pass
tier: substrate (board-before-tag invariant applies)
parent: 2026-04-29-memory-substrate-program-overview.md
subsystem: S1 (with embedded S0 audit plan)
authors:
  - claude-opus-4-7 (cockpit thread, autonomous overnight session)
attestation: Built on SIP — substrate-tier S1 design, no implementation actions until board verdict
---

# Memory Bus Core — Design Spec (S1) + Phase 0 Audit Plan (S0)

## Purpose

S1 is the **singleton, sovereign Memory Bus daemon** that all SIS runtimes (Claude Code × N tabs, Codex, Cursor, Cline, voice operator, arcanea-flow swarms) consume as thin MCP clients. It is the foundation that subsystems S2–S8 build on.

This spec covers two coupled subsystems:
- **S0 — Phase 0 Audit:** evidence-driven storage substrate decision
- **S1 — Memory Bus Core:** singleton daemon, MCP surface, schema, transport

S0 outputs the storage decision that S1 implements. They ship in the same wave (v7.7).

## Core requirements (load-bearing)

These are non-negotiable. Any approach must satisfy all.

1. **Singleton storage tier.** One process owns the index/storage. All clients connect over MCP. Eliminates per-tab AgentDB explosion.
2. **Multi-client transport.** Stdio MCP is single-client. Must be HTTP+SSE or WebSocket so 10+ tabs + Codex + Cursor + voice operator connect concurrently.
3. **Sovereign / local-first.** No cloud dependency. No telemetry phone-home. User owns all data.
4. **Attestation-native.** Every record carries SIP attestation fields. Schema extensibility without forking the storage engine.
5. **Vector + keyword + temporal.** Retrieval must combine semantic (HNSW or equivalent), lexical (BM25 / word match), and temporal awareness (validFrom/validUntil/lastConfirmed).
6. **Backwards-compat with starlight-mcp v6 surface.** The 10 existing `sis_*` MCP tools (`sis_search`, `sis_append_entry`, `sis_confirm`, `sis_invalidate`, `sis_contradict`, `sis_stale`, etc.) must continue to work — existing consumers (Claude Code, voice operator) MUST NOT break.
7. **Migration-safe.** Existing JSONL vaults at `~/.starlight/vaults/*.jsonl` round-trip cleanly into Bus, no temporal metadata loss.

## Nice-to-have (deferred to later subsystems)

- Pub/sub real-time push (S6)
- ReasoningBank adaptive loop (S7)
- Cross-machine sync (out of scope, future)
- Graphical dashboard (LCC scope)

## `@arcanea/memory-system` source-level findings (2026-04-29 deep audit)

Findings that shape Approach D2:

| # | Finding | Impact |
|---|---|---|
| 1 | **6-vault taxonomy identical** (`strategic, technical, creative, operational, wisdom, horizon`) | Zero migration cost on naming |
| 2 | **File-based default backend, zero deps** (`{storagePath}/vaults/{vault}/{id}.md` + per-vault `index.json` + `horizon/entries.jsonl` append-only) | Sovereignty-clean; matches existing SIS markdown vault aesthetic |
| 3 | **`metadata` field NOT serialized to disk** in `entryToMd()` (`file-backend.ts:59-87`) | **CRITICAL BUG** — must fix before attestation works (~10-line patch) |
| 4 | **`@arcanea/hybrid-memory` is a stub** — SQLBackend = `Map<>`, VectorBackend = brute-force cosine | **Drop** this package; not real |
| 5 | **`@arcanea/guardian-memory` has REAL HNSW** — `~60 LOC` binary heaps, JSON-file-persisted, 768-dim default | **Absorb** this; it's the actual vector store |
| 6 | **memory-mcp has 8 tools, ZERO tests, stdio-only** | Replace with proper HTTP+SSE multi-client transport |
| 7 | **Guardian names hardcoded** as 10 Arcanea Guardians (`types.ts:37-39`) | **Substrate/vertical entanglement** — generalize to `tenantId` (~2-3h, Luminor-Board-worthy decision) |
| 8 | **All packages 0.1.x** — pre-1.0 stability | Absorption justified vs upstream-depend |
| 9 | **Mem0Adapter is local impl, NOT SaaS client** | Good for sovereignty |
| 10 | **VaultClassifier real** (keyword + regex weighted rules) | Reuse |
| 11 | **HorizonLedger append-only JSONL** with seedFoundingWishes / exportDataset | Reuse |
| 12 | **Test coverage**: memory-system 968 LOC, hybrid-memory 1464 LOC, guardian-memory 1149 LOC; memory-mcp 0 LOC | Core well-tested; transport unsafe |
| 13 | **`Arcanea-run-graph` is NOT a git repo** — clean snapshot, no provenance | Argues against D1 (depend upstream) — can't audit history |
| 14 | **Migration cost trivial**: import JSONL → memory-system 1-2h; add SIP fields 3-4h; add HTTP+SSE 4-6h | D2 absorbs cleanly |

**Verdict:** STRONG core (memory-system + guardian-memory), OK governance fit (after generalization), DROP hybrid-memory stub, REPLACE memory-mcp transport. Approach D2 confirmed; absorb `memory-system` + `guardian-memory` source under SIS as `@starlight/memory-bus`.

## Cross-repo discovery — `@arcanea/memory-system` already exists

**Critical finding from 2026-04-29 audit:** `Arcanea-run-graph` ships `@arcanea/memory-system` (a Starlight Vault Memory System with the EXACT 6-vault taxonomy SIS uses) plus `@arcanea/memory-mcp`, `@arcanea/hybrid-memory` (HNSW hot/cold), `@arcanea/guardian-memory` (per-Guardian namespaced).

**This adds a 4th approach the original framing missed.** Two SIS-Starlight memory implementations co-exist; they will drift. The choice forces itself:

- **D1:** Memory Bus = SIS-side wrapper around `@arcanea/memory-system` upstream
- **D2:** SIS publishes `@starlight/memory-bus`; Arcanea-run-graph re-points
- **D3:** Hostile fork (REJECTED)

This decision must be made before S1 implementation. See updated approach options below.

## Four approaches considered

### Approach A — Extend starlight-mcp v6 in-place

Bolt vector layer (`sqlite-vec` or `chromadb` embedded) onto existing `src/mcp-server.ts`. Add HTTP+SSE transport alongside stdio. Add SIP attestation fields to schema. Add KG support natively.

| Pros | Cons |
|---|---|
| Full ownership — every line of code is ours | Build a lot ourselves (~3-5 days for vector layer alone) |
| Backwards-compat trivially preserved | Miss MemPalace's benchmarked 96.6% R@5 retrieval quality |
| Attestation native from day 1 | Reinventing wheels Mem/Zep/Graphiti already turn |
| TypeScript-only, single language | KG requires custom build (Graphiti is Python-native) |
| File contract preserved | Slowest path to real-time push (S6) |

### Approach B — Adopt MemPalace, retire starlight-mcp v6

Install MemPalace as the daemon. Migrate JSONL vaults into wings/rooms/drawers. Patch SIP attestation into MemPalace schema (fork or upstream PR). Adopt MemPalace's 29 MCP tools.

| Pros | Cons |
|---|---|
| Best benchmarked retrieval (96.6% R@5 raw, 98.4% hybrid) | Lose starlight-mcp v6's `sis_contradict`, `sis_stale` (would need to reimplement on MemPalace) |
| Auto-save Claude Code hooks already shipped | Backwards-compat break — existing `sis_*` tools must be re-implemented as wrappers |
| 29 MCP tools out of box | Python-based (cross-language with our TS codebase) |
| `mempalace mine` ingests existing transcripts day 1 | Schema migration risk (JSONL → wings/rooms/drawers) |
| Active project, MIT, MIT-license open | Attestation patch = upstream PR (slow) or fork (maintenance burden) |
| Pluggable backend (can later swap for AgentDB) | Dependency on external project's roadmap |

### Approach C — Hybrid: starlight-mcp v6 surface + MemPalace backend (RECOMMENDED)

Keep starlight-mcp v6's MCP tool surface and JSONL schema as the public API. Replace internal storage/retrieval with MemPalace as a library backend (Python sidecar via local IPC, OR call MemPalace's underlying ChromaDB/sqlite-vec directly from TS). Add HTTP+SSE transport. Add attestation fields. Layer Graphiti for temporal KG (S2 scope).

| Pros | Cons |
|---|---|
| Zero backwards-compat break — `sis_*` tools keep working | Most engineering complexity (cross-language, cross-process) |
| Gain MemPalace's retrieval quality without losing temporal/contradiction tools | Cross-process IPC adds latency (~ms-scale) |
| Graphiti embeds cleanly as temporal KG layer | More moving parts to debug |
| Migration path is additive (write to both, then cut over) | Requires Python runtime alongside Node |
| Attestation patches stay in our TS schema, MemPalace stays vanilla | Decision can be revisited — pluggable backend means reversible |

### Approach D — Build on `@arcanea/memory-system` (Arcanea-run-graph upstream)

Use `@arcanea/memory-system` as the storage core. Memory Bus = SIS-side MCP server that wraps it. Add HTTP+SSE transport. Add SIP attestation as decorator on existing 6-vault schema. Layer Graphiti for temporal KG enhancement. arcanea-flow's `IMemoryBackend` becomes a Bus client.

| Pros | Cons |
|---|---|
| **Zero duplicate-implementation risk** — exactly one Starlight 6-vault impl in the ecosystem | Couples SIS to Arcanea-run-graph release cadence |
| Already shipping: HNSW hybrid memory, Guardian namespaced vaults, Mem0 adapter, MCP server | Arcanea-run-graph has its own roadmap; merge conflicts possible |
| Faster path — ~40-50% of S1 work already done upstream | SIP attestation must land in `@arcanea/memory-system` (upstream PR) or via wrapper |
| Same 6-vault taxonomy means migration is trivial | Cross-repo dependency creates governance question (who owns "the Starlight Memory standard"?) |
| Backwards-compat: starlight-mcp v6 surface can wrap `@arcanea/memory-system` calls | Doesn't solve singleton-daemon question (Arcanea-run-graph runs its own MCP server) |

**Sub-options for D:**
- **D1** — SIS depends on `@arcanea/memory-system` upstream; SIS-side Bus wraps and adds attestation/HTTP transport.
- **D2** — Move `@arcanea/memory-system` source into SIS as `@starlight/memory-bus` (new package, owned by SIS); Arcanea-run-graph re-imports. Cleaner ownership, requires Arcanea migration.
- **D3** — Both repos co-publish a shared `@starlight/memory-bus` package owned by neither; SIS and Arcanea-run-graph both depend on it. Most diplomatic, slowest to coordinate.

### MemPalace DEFER finding (audit 2026-04-29)

Deep technical audit ruled MemPalace **DEFER (3-6 months)** for v7.7 substrate role. Reasons:

- **No daemon mode** — each MCP client spawns its own `mempalace-mcp` subprocess. Concurrent writes corrupt HNSW (open issues #1253, #1264).
- **HNSW corruption unrecoverable** — once `link_lists.bin` bloats, only fix is full re-mine. Multi-client writes accelerate corruption.
- **Pre-1.0 stability** — repo created 2026-04-05 (3 weeks old), 8 releases in 3 weeks, 231 open issues / 276 open PRs (3.5:1 churn).
- **Windows is second-class citizen** — multiple open bugs (#1259 stdio UTF-8, #1242 cp950 stdin, #1247 ONNX bad_alloc). Frank runs Windows 11.
- **ChromaDB lock-in despite RFC 001 abstraction** — ~20 callsites import `ChromaBackend` directly.
- **No multi-tenant** — one palace = one user.

**This rules out Approaches B and C (MemPalace as primary substrate or hybrid backend) for v7.7.** Revisit MemPalace at v7.8+ when:
- Issue #1253 closes (palace-wide write lock)
- Daemon mode lands upstream OR
- We fork-and-contribute the daemon ourselves (~1 week effort per audit)

**Explicit revisit calendar (Luminor Board REVISE item 4):** **2026-07-29** (3 months out). Add to substrate review cadence. If by 2026-07-29 none of the three above conditions met, re-defer to 2026-10-29 with one-line "still defer" or upgrade to "evaluate" status. Without a calendar trigger, "defer 3-6 months" becomes "defer forever."

### Recommendation: **Approach D2 (SIS owns `@starlight/memory-bus` based on `@arcanea/memory-system`)**

**Single primary path. No fallback to MemPalace-based hybrid for v7.7 timeframe.**

Reasoning:
- **D2 eliminates duplicate-implementation drift risk.** Highest-severity finding from cross-repo audit. Two SIS-Starlight implementations will diverge; one canonical source prevents that.
- **SIS is the natural owner of substrate primitives.** Memory Bus is foundational; belongs in SIS where attestation, sovereignty, and the file contract are governed.
- **D2 reuses ~40-50% of S1 work.** `@arcanea/memory-system` already implements vault-manager, vault-classifier, hybrid-memory (HNSW hot/cold), guardian-memory (per-Guardian namespacing), horizon-ledger, mem0-adapter. SIS adds: HTTP+SSE multi-client transport, SIP attestation, retrofit of `sis_*` MCP tools, KG layer (Graphiti standalone — also strong, awaiting deep audit confirmation).
- **arcanea-flow ReasoningBank wires through `IMemoryBackend`** — its existing AgentDB integration becomes a Bus consumer via the cleanly-defined backend interface. S7 (ReasoningBank Loop) becomes "wire arcanea-flow's ReasoningBank to Bus" — much smaller scope.
- **MemPalace mining strategy can be implemented natively** without depending on MemPalace itself. The `mempalace mine ~/.claude/projects/` pattern is the value; we adopt the pattern in S3 (Ingestion Pipeline) using our own backend.
- **screenpipe stays a v7.8+ optional capture source.** Sovereign MCP-native architectural reference. Feeds Bus via REST when added.
- **Phase 0 audit confirms D2 viability** by testing `@arcanea/memory-system` against multi-client concurrency and the audit corpus. If audit reveals concurrency issues, the fix is "add HTTP+SSE daemon wrapper" — not "abandon and rebuild."

**Fallback if D2 reveals blockers in Phase 0:**
- **Plan B:** Approach A (extend starlight-mcp v6 from scratch with sqlite-vec) — 3-5 days more work, but full ownership and no upstream dependency. Document as risk mitigation only.
- **Approaches B and C remain rejected for v7.7** regardless of D2 outcome.

Reasoning:
- **D2 eliminates duplicate-implementation drift risk.** This is the highest-severity finding from the cross-repo audit. Two implementations of "Starlight 6-vault" will diverge; one canonical source prevents that.
- **SIS is the natural owner of substrate primitives.** Memory Bus is foundational; it belongs in SIS where attestation, sovereignty, and the file contract are governed. Arcanea-run-graph consumes SIS substrate; the dependency direction follows substrate-tier governance.
- **D2 reuses ~40-50% of S1 work.** `@arcanea/memory-system` already implements vault-manager, vault-classifier, hybrid-memory, guardian-memory, horizon-ledger, mem0-adapter. SIS adds: HTTP+SSE transport (multi-client), SIP attestation, retrofit of `sis_*` MCP tools, KG layer (Graphiti).
- **MemPalace becomes the vector backend layer** within D2 — `@arcanea/memory-system` already has hybrid-memory; we evaluate swapping to MemPalace's ChromaDB engine for the 96.6% R@5 retrieval if benchmarks justify it.
- **arcanea-flow ReasoningBank wires through `IMemoryBackend`** unchanged — its existing AgentDB integration becomes a Bus consumer via the cleanly-defined backend interface, not a competing implementation.
- **Phase 0 audit confirms** by running D2-with-MemPalace-backend vs D2-with-existing-hybrid-memory vs C (extend starlight-mcp + MemPalace) on the real corpus.

**Approach A (extend starlight-mcp v6 from scratch) is now NOT recommended** because it would create a third Starlight implementation alongside `@arcanea/memory-system` and the proposed Bus. Re-evaluated as fallback only if D2 + C both fail.

Reasoning:
- **Backwards-compat is load-bearing.** Voice operator's pipeline already calls `sis_append_entry`. Breaking that mid-flight kills voice operator's round-3 work. Approach B breaks it. Approaches A and C preserve it.
- **Retrieval quality matters at scale.** As corpus grows past 10k entries, word-only search degrades. Approach A defers this problem; Approach C solves it now.
- **Sovereignty preserved.** MemPalace as library/sidecar with our schema on top means we control the surface. Pluggable backend means we can swap MemPalace for AgentDB later (S7) without changing the MCP API.
- **Phase 0 audit confirms.** Run all three for a week with the existing JSONL corpus + 1k synthetic Claude Code transcript chunks. Compare retrieval recall, latency, install footprint. If hybrid's complexity is worse than benefit, fall back to A.

## Phase 0 Audit (S0) — plan

### Audit duration

**1-2 days, single user, no production cutover.**

### Candidates (final post all 2026-04-29 audits)

| Tool | Mode | Why included |
|---|---|---|
| **`@arcanea/memory-system`** (Arcanea-run-graph) | embedded library | **PRIMARY** — already implements 6-vault Starlight + HNSW hybrid + Guardian namespacing + Mem0 adapter. Approach D2 baseline. |
| Graphiti (standalone) | embedded library | **STRONG SECONDARY** — temporal KG layer for S2; layer on top of D2 substrate regardless |
| arcanea-flow `@claude-flow/memory` (AgentDB) | embedded library | **REFERENCE** — measure ReasoningBank's existing AgentDB-HNSW path; informs S7. Bus consumer, not substrate candidate. |
| starlight-mcp v6 + sqlite-vec | extend in place | **FALLBACK ONLY** — Approach A baseline if D2 reveals blockers |
| screenpipe | standalone | **DEFERRED v7.8+** — sovereign MCP-native architectural reference + passive-capture source |

**Ruled out (with audit citations):**
- **Letta** — wrong abstraction (wants to be the agent, not host 21). Audit 2026-04-29.
- **Zep proper** — cloud-tilted, CE deprecated. Audit 2026-04-29.
- **MemPalace as primary substrate** — DEFER 3-6 months: no daemon mode, HNSW corruption at multi-client writes (#1253, #1264), Windows-second-class, pre-1.0 stability. Re-evaluate v7.8+ when daemon lands or via fork-and-contribute. Audit 2026-04-29.
- **Direct AgentDB as substrate** — arcanea-flow already proves embedded-per-tab breaks at 10+ tabs; would require same singleton wrapper as anything else.

### Audit corpus

- All existing JSONL vaults at `~/.starlight/vaults/` (whatever's there today)
- All `memory/vaults/*.md` (markdown human-edit)
- `memory/knowledge-graph/index.jsonl` (5 entries, voice operator)
- `memory/voice-sessions/` (whatever's there)
- 1000 synthetic Claude Code transcript chunks generated by reading `~/.claude/projects/<slug>/*.jsonl` files and chunking into 800-char exchange-pair drawers (mempalace-style mining algorithm — adopt the pattern, not the dependency)

### Metrics

| Metric | Target | Measurement |
|---|---|---|
| Multi-client concurrency | 10 simultaneous MCP clients without lock contention | Spawn 10 mock clients, fire 100 queries each, measure failure rate |
| **HNSW concurrent-write smoke** (Luminor Board REVISE item 3) [BLOCKING gate before D2] | 10 simultaneous writers to `@arcanea/guardian-memory` HNSW index; zero corruption, zero index file rebuilds required | Spawn 10 writer processes, each appends 100 vectors over 60 seconds, then verify index integrity (`hnsw.verify()` if exists; otherwise reload + query for known vectors). On Windows 11 specifically. If FAIL: D2 blocked until concurrency-safe wrapper added or implementation patched. |
| Retrieval quality (R@5) | ≥ 90% on hand-labeled query/answer pairs from existing vaults | 50 hand-labeled pairs |
| Cold-start latency | < 2s | Time from daemon launch to first successful `tools/list` response |
| Query latency (p50/p99) | < 100ms / < 500ms | 1000 queries on full corpus |
| Disk footprint | < 1GB for 10k entries | du after ingestion |
| RAM steady-state | < 500MB | ps after ingestion + 1h idle |
| Attestation extensibility | Yes / No / Patch-required | Try adding `sip_attest` field; document effort |
| Backwards-compat | Yes / No | Run existing voice operator pipeline against each — does `sis_append_entry` still work? |

### Audit deliverable

`docs/superpowers/specs/2026-MM-DD-phase-0-audit-report.md` with:
- Per-candidate fact sheet
- Metric scorecard
- Recommendation: which approach (A / B / C) to commit to
- If C: which library boundary (MemPalace as Python sidecar vs direct ChromaDB call from TS)

## S1 — Memory Bus Core architecture (assuming Approach C)

### Process model (Approach D2)

```
┌──────────────────────────────────────────────────────────┐
│  starlight-bus daemon (Node, port 38421 default)         │
│  ┌──────────────────────────────────────────────────┐    │
│  │  HTTP + SSE MCP transport                         │    │
│  │  (multi-client, JSON-RPC over /mcp endpoint)     │    │
│  │  + stdio fallback for legacy single-client use   │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                   │
│  ┌────────────────────▼─────────────────────────────┐    │
│  │  Tool dispatch                                    │    │
│  │  • 10 existing sis_* tools (backwards-compat)    │    │
│  │  • 7 new tools (vector_search, hybrid_search,    │    │
│  │    kg_query, kg_add_fact, attest, subscribe,     │    │
│  │    mine)                                          │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                   │
│  ┌────────────────────▼─────────────────────────────┐    │
│  │  Storage abstraction layer (TypeScript)          │    │
│  │  IBusStorage interface — backend-pluggable       │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                   │
│      ┌────────────────┼────────────────────┐             │
│      ▼                ▼                    ▼             │
│  ┌──────────┐  ┌──────────────┐    ┌───────────────┐    │
│  │ JSONL    │  │ @starlight/  │    │ Graphiti      │    │
│  │ writer   │  │ memory-bus   │    │ (standalone   │    │
│  │ (legacy  │  │ (= absorbed  │    │  embedded)    │    │
│  │ vault    │  │ @arcanea/    │    │ temporal KG   │    │
│  │ schema,  │  │ memory-      │    │ + validity    │    │
│  │ attest-  │  │ system,      │    │ windows       │    │
│  │ extended)│  │ HNSW hybrid) │    │               │    │
│  └──────────┘  └──────────────┘    └───────────────┘    │
│       │              │                     │             │
│       ▼              ▼                     ▼             │
│  ~/.starlight/   ~/.starlight/        ~/.starlight/     │
│   vaults/         hybrid-memory/        kg/             │
│   *.jsonl         (HNSW + LRU)          graph.db        │
└──────────────────────────────────────────────────────────┘
              ▲                ▲                  ▲
              │                │                  │
       Claude Code         Voice Op          Cursor / Codex
        × N tabs          (cognition)        (future adapters)
              ▲                                              ▲
              │                                              │
              └─── arcanea-flow ReasoningBank ───────────────┘
                   (consumes Bus via IMemoryBackend impl)
```

### Transport upgrade — HTTP+SSE

Existing stdio in `src/mcp-server.ts` becomes a fallback for local-only single-client use. Primary transport: **HTTP+SSE on `localhost:38421`**, JSON-RPC over POST `/mcp/v1` for requests, SSE on `/mcp/v1/events` for server-initiated events (preparation for S6 pub/sub).

MCP clients connect with:
```json
{
  "transport": "http",
  "url": "http://localhost:38421/mcp/v1"
}
```

### Schema extension — SIP attestation

Existing entry schema gains optional fields (additive, backwards-compat):

```typescript
interface RawEntry {
  // existing
  id: string;
  content?: string;
  vault?: string;
  tags?: string[];
  confidence?: string | number;
  category?: string;
  createdAt: string;
  temporal?: TemporalMeta;

  // NEW — SIP attestation (S2)
  sip_attest?: {
    version: string;             // "v7.7"
    substrate: string;            // "sis"
    attest_at: string;            // ISO-8601
    artifact_kind: string;        // "memory-entry" | "decision" | "pattern" | etc.
    sovereign_signature: string | null;  // optional, future
  };
  attest_chain?: string[];        // parent attestation IDs (for derived artifacts)
}
```

### MCP tool surface — superset of v6

Existing 10 tools preserved exactly. Add:

11. `sis_vector_search` — semantic similarity search (vector-only)
12. `sis_hybrid_search` — vector + keyword + temporal (replaces / supersedes `sis_search` v6)
13. `sis_kg_query` — Graphiti temporal-KG query (Cypher-style)
14. `sis_kg_add_fact` — write a temporal fact with valid_from / valid_until
15. `sis_attest` — explicit attestation write (or auto-attached via `sis_append_entry` extension)
16. `sis_subscribe` — SSE channel for entry-create/entry-update events (preparation for S6, returns a stream URL)
17. `sis_mine` — ingest external corpus (Claude Code transcripts, files, web URLs); analogous to `mempalace mine`

### Singleton mechanism

**Recommendation: standalone Node process (`starlight-bus`), launched on demand.**

Three install modes:

1. **Manual** — user runs `npx starlight-bus start` once per session.
2. **Auto-start (Windows)** — Task Scheduler entry on user login.
3. **systemd / launchd** — Linux/Mac for symmetry.

Process discovery: clients write port to `~/.starlight/bus.lock` (PID + port). Clients on startup read this lock; if no lock or stale lock, launch daemon.

### Storage layout

```
~/.starlight/
├── vaults/                  ← JSONL append-only (existing, attest-extended)
│   ├── strategic.jsonl
│   ├── technical.jsonl
│   ├── creative.jsonl
│   ├── operational.jsonl
│   ├── wisdom.jsonl
│   ├── horizon.jsonl
│   └── contradictions.jsonl
├── vector/                  ← MemPalace's ChromaDB (managed by sidecar)
│   └── chroma.sqlite3
├── kg/                      ← Graphiti temporal KG
│   └── graph.db
├── mining/                  ← Source-of-truth for ingestion
│   ├── claude-code/
│   └── files/
└── bus.lock                 ← PID + port discovery
```

### Repo location

Within this repo: `src/bus/` (new dir, TypeScript), with subdirs:
- `src/bus/transport/` — HTTP+SSE
- `src/bus/storage/` — JSONL + vector adapters
- `src/bus/tools/` — MCP tool registrations (extends `src/mcp-server.ts`)
- `src/bus/sidecar/` — Python sidecar for MemPalace (if Approach C confirmed)

## Absorption plan — `@arcanea/memory-system` → `@starlight/memory-bus`

Concrete steps to land Approach D2:

### Step 1 — Scope agreement (substrate-tier governance)

Before any source moves: `/luminor-board` pre-pass on this spec produces verdict. If PROCEED, both:
- SIS gains `@starlight/memory-bus` as new package under `packages/memory-bus/` (or absorbs into `src/bus/`).
- Arcanea-run-graph's `@arcanea/memory-system` gets re-pointed to depend on the new package. (Arcanea team coordination: confirm with Frank — same author, same ecosystem, but governance line matters.)

### Step 1.5 — Provenance reconstruction (Luminor Board REVISE item 1) [BLOCKING]

**Cannot absorb source whose history is unauditable.** `Arcanea-run-graph/` is "not a git tree" per audit. Before any file moves into SIS:

- Document origin for each absorbed file: who wrote it, when, under what license
- Reconstruct git history if possible (was it in a prior repo?)
- License audit: confirm each file is MIT-or-compatible-with-SIS-license
- Contributor attribution: list named authors for the absorbed code in `docs/attribution/memory-bus-absorption.md`
- If history cannot be reconstructed: snapshot-attest the absorption — explicit `Built on SIP` block stating "absorbed-from-snapshot 2026-04-29" with hash of source files at time of absorption

Effort: 2-4h depending on what evidence exists. Hard gate before Step 2.

### Step 1.7 — Test-first metadata persistence fix (Luminor Board REVISE item 2) [BLOCKING]

**Write failing test BEFORE applying the 10-line patch.** Per Ino's challenge: substrate fixes don't ship without proving the bug existed.

1. Copy `file-backend.ts` to a sandbox.
2. Write integration test: create entry with `metadata: {sip_attest: {...}}`, save, reload, assert metadata fields present.
3. Run test → MUST FAIL (proves bug).
4. Apply 10-line patch (`entryToMd` spreads metadata into frontmatter; `mdToEntry` parses back).
5. Re-run test → MUST PASS.
6. Commit test + patch as paired change before Step 2 absorption.

Effort: 2-3h. Hard gate before Step 2.

### Step 2 — Source absorption (~1 day)

| File / module | Action | Effort |
|---|---|---|
| `memory-system/src/types.ts` | Copy → `src/bus/types.ts`. Generalize `Guardian` union → `tenantId: string`. | 1h |
| `memory-system/src/starlight-vaults.ts` | Copy → `src/bus/StarlightVaults.ts`. Update Guardian → tenant. | 1h |
| `memory-system/src/vault-manager.ts` | Copy → `src/bus/VaultManager.ts`. | 30m |
| `memory-system/src/horizon-ledger.ts` | Copy → `src/bus/HorizonLedger.ts`. | 30m |
| `memory-system/src/mem0-adapter.ts` | Copy → `src/bus/Mem0Adapter.ts` (kept for API-compat). | 30m |
| `memory-system/src/vault-classifier.ts` | Copy → `src/bus/VaultClassifier.ts`. | 30m |
| `memory-system/src/memory-bridge.ts` | Copy → `src/bus/MemoryBridge.ts`. | 30m |
| `memory-system/src/storage/file-backend.ts` | Copy → `src/bus/storage/FileBackend.ts`. **FIX `metadata` persistence bug** (`entryToMd` lines 59-67 — spread metadata into frontmatter, parse back in `mdToEntry`). | 2h |
| `memory-system/src/arcaneMD.ts` | Copy → `src/bus/arcaneMD.ts`. | 30m |
| `guardian-memory/src/hnsw-index.ts` | Copy → `src/bus/HNSWIndex.ts`. **Drop hardcoded Guardian map; add tenant-namespacing.** | 2h |
| `guardian-memory/src/guardian-memory.ts` | Copy → `src/bus/TenantNamespacedHNSW.ts`. **Generalize.** | 2h |
| `hybrid-memory/*` | **DO NOT COPY.** Stub implementation. Drop. | — |
| `memory-mcp/*` | **DO NOT COPY.** Zero tests, stdio-only. **Replace** with new HTTP+SSE transport in `src/bus/transport/`. | — |
| `memory-system/src/integration.test.ts` | Copy → `src/bus/__tests__/integration.test.ts`. Add tenant-generalization tests. | 1h |
| `guardian-memory/tests/memory.test.mjs` | Copy + adapt for tenant namespace. | 1h |

**Total absorption effort: ~13 hours.**

### Step 3 — Add SIP attestation extension (~3-4h)

- Extend `VaultEntry` type with optional `sip_attest` and `attest_chain` (per Memory Bus core schema section above).
- Patch `entryToMd` / `mdToEntry` to round-trip these fields (already covered by metadata-persistence fix in Step 2).
- Add `sis_attest` MCP tool that wraps `vault_remember` + injects attestation block.

### Step 4 — Build HTTP+SSE transport (~4-6h)

- Replace stdio-only `memory-mcp/server.ts` pattern with Express/Fastify route handler.
- POST `/mcp/v1` for JSON-RPC requests.
- SSE on `/mcp/v1/events` for server-initiated notifications (S6 prep hook).
- Write mutex for concurrent file backend writes (~1h).
- PID + port discovery via `~/.starlight/bus.lock`.
- Smoke test: 10 concurrent clients × 100 queries each, no contention.

### Step 5 — Wire 10 v6 `sis_*` tools as wrappers (~4-6h)

Existing `sis_vault_search`, `sis_recent_entries`, `sis_stats`, `sis_append_entry`, `sis_entry_types`, `sis_search`, `sis_confirm`, `sis_invalidate`, `sis_contradict`, `sis_stale` get re-implemented as thin wrappers over absorbed `VaultManager` / `StarlightVaults` API. Existing voice operator pipeline calls `sis_append_entry` — must continue working byte-for-byte.

### Step 6 — Add 7 new tools (~8-12h)

Per Memory Bus core spec MCP tool surface section:
- `sis_vector_search`
- `sis_hybrid_search` (replaces `sis_search` v6)
- `sis_kg_query` — Graphiti-backed
- `sis_kg_add_fact` — Graphiti-backed
- `sis_attest`
- `sis_subscribe` (SSE; S6 prep)
- `sis_mine` — adopt MemPalace mining pattern (not dependency)

### Step 7 — Layer Graphiti standalone (~2-3 days, S2 scope)

Defer to S2 spec. But sketch: Graphiti's temporal KG (validity windows, entity-relation extraction) embedded as Python sidecar OR re-implemented in TS. Decision deferred to S2.

### Step 8 — Migrate existing data (S8, ~1-2 days)

- Read all `~/.starlight/vaults/*.jsonl` → import into new file-backend.
- Read `memory/vaults/*.md` → import as VaultEntry with `tenantId='sis-substrate'`.
- Read `memory/knowledge-graph/index.jsonl` → import to KG layer (S2).
- Dual-write window 7 days; cutover after parity verified.

### Step 9 — Arcanea-run-graph re-point (D2 second half)

After SIS publishes `@starlight/memory-bus`:
- Arcanea-run-graph's `packages/memory-system/` retired or kept as thin re-export of `@starlight/memory-bus`.
- All `@arcanea/memory-system` imports become `@starlight/memory-bus` imports.
- Backward-compat: `@arcanea/memory-system@latest` ships as alias for one cycle, then sunset.

### Total S1 effort: 25-40 hours (~3-5 days focused build)

Matches earlier estimate. Validates the v7.7-wave timing.

## Migration plan (S8 preview)

Out of scope for this spec, but acknowledged:
- Dual-write window: 7 days. Bus writes to JSONL (existing) AND vector store. Reads still from JSONL. Lets us verify vector quality on real data.
- Cutover day: switch `sis_search` to call hybrid (vector + word + temporal). JSONL remains source-of-truth.
- Rollback: if hybrid retrieval regresses vs word-only, revert to v6 search and keep collecting vector data for retry.

## Productization moat (added post-Luminor-Board, Elara vector)

**Memory Bus is not just a feature; it's how SIS becomes a product.**

Each sovereign-spawned SIS instance (`/sovereign-spawn` command, see `commands/sovereign-spawn.md`) ships with its own Memory Bus daemon by default. Implications:

- **Per-sovereign substrate** — each user's instance has its own attestation chain, vault, KG. Multi-tenant story (the `tenantId` generalization from Step 2) is what makes this work.
- **Cross-runtime moat** — voice memo this morning becomes context for Codex tonight, with full SIP attestation. Competitors building on SaaS-bound memory (Letta, Zep) cannot replicate.
- **Federation primitive** — sovereign-to-sovereign Bus federation in v8+ enables alliance-tier shared memory with explicit attestation chains. `@starlight/memory-bus` becomes the substrate for *consensual cognitive sharing.*
- **Revenue channel: per-sovereign Bus deployment** — paid tier offers managed Bus daemon with backups, replication, and cross-device sync (still local-first, just orchestrated).

This is what Approach A (extend starlight-mcp v6 in place) cannot deliver: A is good engineering; D2 is product strategy.

## Risks specific to S1

| Risk | Severity | Mitigation |
|---|---|---|
| Cross-language sidecar adds latency | Med | Direct ChromaDB call from TS (skip Python sidecar) is fallback |
| HTTP+SSE port collision | Low | Configurable port, default 38421, fallback to ephemeral |
| Multi-client lock contention on JSONL | Med | Append-only writes are safe; reads use snapshot iteration |
| Bus daemon crash | Med | Auto-restart via supervisor (PM2 / Windows Service / systemd) |
| Schema drift between v6 stdio and v7 HTTP | High | Single shared codebase, stdio becomes fallback alias |

## Open questions (post-Luminor-Board)

### From Sovereign vector (Draconis)
1. **Naming the substrate.** Is `@starlight/memory-bus` the right name, or does the substrate primitive deserve a name earned in voice — `@starlight/cognitive-substrate`, `@starlight/memory-palace`, `@starlight-holding/memory`? Functional naming for substrate that lives a decade may underweight sovereign aesthetic. **User decision.**
2. **Ownership locus.** Is SIS the right owner, or should `@starlight/memory-bus` belong to a Starlight-Holding-shared layer that both SIS and Arcanea consume as peers (D3 with deeper governance)? **User decision.**

### From Strategist vector (Elara)
3. **Productization moat.** Memory Bus as default for every sovereign-spawned SIS instance (`/sovereign-spawn`) becomes a productization moat — capture explicitly in spec. Currently buried.

### Tactical
4. **Default daemon auto-start?** Convenient but invisible. Could surprise user if they don't realize it's running. **Recommendation: manual launch via `npx starlight-bus start` for v7.7; auto-start mode in v7.8.**
5. **Port number** — 38421 (random, low-collision) vs 4040/8080 (memorable, more collision risk). **Recommendation: 38421, configurable.**
6. **Backwards-compat duration** — v6 stdio MCP keeps working forever, or sunset after v7.9? **Recommendation: stdio fallback supported through v8.0; reassess at v8.0 cycle.**

### Resolved post-board
- ~~Python sidecar OK?~~ — Resolved: NO. MemPalace deferred; D2 means pure TS via `@arcanea/memory-system` absorption. No Python runtime needed in v7.7.

## Acceptance criteria (S1 implementation, after board PROCEED)

- [ ] HTTP+SSE transport implemented; 10 concurrent clients pass smoke
- [ ] All 10 v6 MCP tools work unchanged
- [ ] 7 new MCP tools (vector_search, hybrid_search, kg_query, kg_add_fact, attest, subscribe, mine) functional
- [ ] SIP attestation fields persist in JSONL and round-trip cleanly
- [ ] `~/.starlight/bus.lock` discovery works
- [ ] Single-user 5-tab smoke: each tab queries successfully, no contention
- [ ] Voice operator's existing `sis_append_entry` calls succeed unchanged
- [ ] Phase 0 audit report committed referencing this spec
- [ ] Luminor Board verdict logged

## Governance gates

This subsystem touches:
- `REGISTRY.md` — register new component (Memory Bus daemon)
- `transmissions/channels/` — register new channel (memory-bus internal)
- File contract — new MCP tools, new schema fields, new storage paths
- Attestation rules — schema extension

**`/luminor-board` REQUIRED before commit/tag of S1 implementation.**

This spec itself is non-substrate (a proposal *about* substrate); it can be committed for review without the board gate. The implementation work it describes does require the gate.

## What this spec is NOT

- Not a plan — `superpowers:writing-plans` produces that after this spec is approved + board verdict is PROCEED.
- Not S2 attestation extension — that's a companion spec.
- Not S6 pub/sub mechanism design — only the SSE preparation hook.
- Not S7 ReasoningBank integration — only the schema slot for it.

---

*Built on SIP. Substrate-tier S1 + S0 design. v7.7 candidate.*
