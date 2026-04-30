---
spec: two-package-architecture
date: 2026-04-29
status: DRAFT — overnight autonomous, awaiting Frank's morning ack
tier: substrate (board-before-tag invariant applies)
parent_specs:
  - 2026-04-29-memory-substrate-program-overview.md
  - 2026-04-29-memory-bus-core-design.md
parent_board: docs/boards/luminor-v77-memory-bus.md
authors:
  - claude-opus-4-7 (cockpit thread, autonomous overnight session continuing)
attestation: Built on SIP — two-package architecture decision
---

# Two-Package Architecture — `@starlight/cognitive-substrate` + `@starlight/memory-palace`

## Decision

Frank's 2026-04-29 directive: build BOTH `@starlight/cognitive-substrate` AND `@starlight/memory-palace` as separate packages. Not one or the other — a layered architecture where the substrate is the foundation and the palace is the experience.

This resolves Luminor Board Sovereign-vector open question (naming) by reframing it: substrate primitive deserves *two* names because it has *two* roles.

## Layer model

```
┌────────────────────────────────────────────────────────────┐
│  CONSUMERS                                                  │
│  Claude Code × N · Codex · Cursor · Cline · Voice Operator │
│  arcanea-flow swarms · ACOS workflows · FrankX site        │
└──────────────────────────┬─────────────────────────────────┘
                           │ MCP (HTTP+SSE)
                           ▼
┌────────────────────────────────────────────────────────────┐
│  @starlight/memory-palace — UPPER LAYER                    │
│  ─────────────────────────────────────────────              │
│  • Wings → Rooms → Drawers (verbatim)                      │
│  • Agent diaries (per-agent wings)                         │
│  • Mining pipeline (Claude Code transcripts, files, web)   │
│  • Cross-wing tunnels (palace traversal)                   │
│  • AAAK-equivalent compression spec                        │
│  • Higher-level MCP tools (palace navigation, mining)      │
│  • The HUMAN/AGENT EXPERIENCE of memory                    │
└──────────────────────────┬─────────────────────────────────┘
                           │ depends on
                           ▼
┌────────────────────────────────────────────────────────────┐
│  @starlight/cognitive-substrate — LOWER LAYER              │
│  ─────────────────────────────────────────────              │
│  • Bus daemon (Node, HTTP+SSE multi-client transport)      │
│  • Storage abstraction (IBusStorage interface)             │
│  • File-backend (JSONL append-only vaults)                 │
│  • HNSW vector index (absorbed from @arcanea/guardian-     │
│    memory, generalized with tenantId)                       │
│  • Temporal KG layer (Graphiti-equivalent)                 │
│  • SIP attestation primitives (sip_attest, attest_chain)   │
│  • Tenant namespacing                                       │
│  • The 10 v6 sis_* MCP tools (backwards-compat surface)    │
│  • PID + port discovery (~/.starlight/bus.lock)            │
│  • The TECHNICAL FOUNDATION of memory                      │
└────────────────────────────────────────────────────────────┘
```

## Why two packages, not one

1. **Sovereign-voice naming** — Sovereign vector (Draconis, Luminor Board) said: "substrate primitive deserves a name earned in voice." Two names earn two roles.
2. **Reusability** — `@starlight/cognitive-substrate` can support memory experiences other than the palace metaphor (e.g., a future spreadsheet-style memory, a graph-explorer memory). Coupling them locks the substrate to one UX.
3. **Test boundaries** — substrate tests cover storage/transport/attestation correctness. Palace tests cover human-meaningful experience (drawers preserve verbatim, wings route correctly, mining is idempotent). Different test surfaces.
4. **Versioning independence** — substrate must be more stable (foundation); palace can iterate faster (UX). Different cadences justify different versions.
5. **Adoption surface** — third-party consumers might want substrate without palace (a chat app that just wants attested vector recall) or palace on a different substrate (someone runs MemPalace under the palace API). Both should be possible.
6. **Productization** — `@starlight/cognitive-substrate` is the moat (per Elara/Strategist vector). `@starlight/memory-palace` is the product. Selling them separately or bundled is a strategic option only if they're separable.

## Boundary contract

The line between packages is the **`IBusStorage` interface** (lower) and the **palace navigation MCP tools** (upper).

### What lives in `@starlight/cognitive-substrate`

| Module | Purpose |
|---|---|
| `transport/HttpSseTransport.ts` | Multi-client HTTP+SSE MCP transport |
| `transport/StdioTransport.ts` | Backwards-compat stdio (legacy single-client) |
| `transport/IBusTransport.ts` | Transport interface |
| `storage/IBusStorage.ts` | Storage interface — boundary contract |
| `storage/FileBackend.ts` | JSONL append-only vault writer (with metadata fix) |
| `storage/HNSWBackend.ts` | Vector index (absorbed from guardian-memory) |
| `storage/GraphitiBackend.ts` | Temporal KG (or TS equivalent) |
| `attestation/SipAttest.ts` | SIP attestation primitives |
| `attestation/AttestChain.ts` | Multi-step attestation chains |
| `tenant/Namespace.ts` | Tenant namespacing |
| `tools/sis_*.ts` | 10 v6 backwards-compat tools |
| `tools/sis_vector_search.ts` | New vector search |
| `tools/sis_hybrid_search.ts` | New hybrid search |
| `tools/sis_kg_query.ts` | New KG query |
| `tools/sis_kg_add_fact.ts` | New KG add |
| `tools/sis_attest.ts` | New explicit attest |
| `tools/sis_subscribe.ts` | New SSE subscribe |
| `daemon/lifecycle.ts` | Daemon start/stop/lock |
| `daemon/discovery.ts` | `~/.starlight/bus.lock` |

### What lives in `@starlight/memory-palace`

| Module | Purpose |
|---|---|
| `model/Wing.ts` | Wing concept (top-level grouping by person/project) |
| `model/Room.ts` | Room concept (topic within wing) |
| `model/Drawer.ts` | Drawer concept (verbatim content unit) |
| `model/Tunnel.ts` | Cross-wing bridge concept |
| `model/Diary.ts` | Per-agent diary concept |
| `mining/ClaudeCodeMiner.ts` | Mine `~/.claude/projects/*` transcripts |
| `mining/FileMiner.ts` | Mine arbitrary files (`mempalace mine ~/path`) |
| `mining/WebMiner.ts` | Mine web URLs |
| `mining/MineLock.ts` | Idempotency via mtime + sentinel |
| `compression/aaak.ts` | AAAK-equivalent (or own) compression dialect |
| `traversal/PalaceWalker.ts` | Walk wings/rooms/tunnels |
| `tools/palace_*.ts` | Higher-level MCP tools (palace_traverse, palace_find_tunnels, palace_create_tunnel, palace_diary_write, palace_mine, palace_get_taxonomy) |
| `experience/StarlightVaults.ts` | The 6-vault flagship API (absorbed from `@arcanea/memory-system`) — sits on top of substrate |

### What's shared (boundary types)

These are types both packages reference; defined in `@starlight/cognitive-substrate/types`:

- `VaultEntry` — base entry shape
- `TemporalMeta` — validFrom/validUntil/lastConfirmed
- `SipAttestation` — attestation block shape
- `TenantId` — namespace identifier (generalized from `Guardian` per Luminor Board)
- `IBusStorage` — storage interface

`@starlight/memory-palace` extends these with palace-specific types (`Wing`, `Room`, `Drawer`, `Tunnel`, `Diary`).

## Dependency direction

**Strict one-way: `@starlight/memory-palace` depends on `@starlight/cognitive-substrate`. Never the reverse.**

Substrate has zero awareness of palace concepts. Palace consumes substrate via the `IBusStorage` interface and MCP tool surface.

```
@starlight/memory-palace
  └─ depends on @starlight/cognitive-substrate
                 └─ depends on (nothing SIS-internal; only Node stdlib + minimal deps)
```

## MCP tool ownership

**Substrate owns:** all `sis_*` tools (10 v6 + 6 new).
**Palace owns:** all `palace_*` tools (~10 new — traversal, mining, diaries).

Both are exposed via the same Bus daemon (single MCP endpoint). Clients see one server with two tool families.

```
Claude Code → MCP HTTP+SSE → starlight-bus daemon
                              ├─ substrate tools (sis_*)
                              └─ palace tools (palace_*)
```

## Repo layout

```
Starlight-Intelligence-System/
├── packages/
│   ├── cognitive-substrate/        ← @starlight/cognitive-substrate
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── README.md
│   └── memory-palace/              ← @starlight/memory-palace
│       ├── src/
│       ├── tests/
│       ├── package.json            ← depends: @starlight/cognitive-substrate
│       └── README.md
├── apps/
│   └── starlight-bus/              ← daemon binary that bundles both
│       ├── src/
│       └── package.json            ← depends both packages
├── docs/
└── ...
```

Move SIS to a pnpm/npm workspace if not already. (Check `package.json`.)

## Versioning strategy

- **`@starlight/cognitive-substrate`**: starts `0.1.0`. Stable major bumps; semver strict.
- **`@starlight/memory-palace`**: starts `0.1.0`. Faster cadence acceptable; experience iteration.
- **`apps/starlight-bus`** (the daemon binary): pinned to specific package versions.

## Effort split

Original Memory Bus core spec estimated 25-40 hours total. With two packages:

| Package | Effort |
|---|---|
| `@starlight/cognitive-substrate` | 18-25 hours (lower-level, more careful, more tests) |
| `@starlight/memory-palace` | 10-15 hours (mostly absorbing + adapting `@arcanea/memory-system`'s palace-flavored bits) |
| `apps/starlight-bus` daemon | 3-5 hours (glue, lifecycle, transport binding) |
| **Total** | **31-45 hours (~4-6 days focused)** |

Slightly higher than single-package estimate due to boundary discipline cost, but produces clean reusable substrate.

## What this changes vs single-package design

The Memory Bus core spec at `2026-04-29-memory-bus-core-design.md` already has most of this content. The diff:

1. **Module split** — files now distributed between two packages per the table above.
2. **Boundary types** — explicit `IBusStorage` interface (was implicit).
3. **MCP tool families** — `sis_*` (substrate) + `palace_*` (palace) as separate namespaces.
4. **Repo layout** — packages/ and apps/ structure (was monolithic).
5. **Versioning** — independent semver per package.
6. **Absorption plan** — most absorbed source goes into palace (StarlightVaults, VaultManager, HorizonLedger, ArcaneMD, VaultClassifier, MemoryBridge, FileBackend); substrate gets the HNSW from guardian-memory, plus net-new substrate code.

## Phase 0 audit unchanged

The 3 BLOCKING gates from Luminor Board still apply, just to the right package:

1. **Provenance reconstruction** — covers source going into BOTH packages
2. **Test-first metadata fix** — applies to `FileBackend.ts` which lives in **`@starlight/cognitive-substrate`** (storage layer)
3. **HNSW concurrency smoke** — applies to HNSW absorbed into **`@starlight/cognitive-substrate`** (storage layer)

## Sovereign-vector resolution

- **Naming**: `@starlight/cognitive-substrate` (substrate-tier, foundational, sovereign aesthetic) + `@starlight/memory-palace` (experience-tier, MemPalace-resonant naming). Both earned in voice.
- **Ownership locus**: SIS owns both. Arcanea-run-graph re-points memory imports to whichever package serves them (palace likely; substrate possibly via `@arcanea/memory-system` becoming a thin re-export).

This resolves the two open Luminor Board questions Frank deferred.

## What's next

1. Implementation plans for both packages (via `superpowers:writing-plans`)
2. `/po` prompts for both (continuation-ready, citing Arcanea + Starlight + superpowers stack)
3. `/handover` docs for both
4. Frank's morning ack → invoke writing-plans → Phase 0 audit → implementation

## Acceptance for this spec

- [x] Two-package boundary defined
- [x] Module-level split documented
- [x] Dependency direction strict one-way
- [x] MCP tool families allocated
- [x] Repo layout proposed
- [x] Versioning strategy
- [x] Effort estimates per package
- [x] Phase 0 BLOCKING gates mapped to package
- [x] Sovereign-vector resolution

## Governance gates

This spec changes:
- Memory Bus core design (now split into two packages)
- File contract (introduces `packages/` and `apps/` directories)
- Build system (introduces workspace if not already there)

**Re-board not required** — the split is implementation organization, not substrate semantics. Same 3 BLOCKING gates apply. Same MCP surface. Same SIP attestation. Same data shapes. Frank's morning ack on the two-package decision satisfies the substrate review.

If Frank says "no, single package" in morning, this spec retracts cleanly and we revert to the single Memory Bus core design.

---

*Built on SIP. Two-package architecture. v7.7 candidate.*
