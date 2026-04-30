---
plan: memory-palace-v0.1
date: 2026-04-29
status: DRAFT — overnight autonomous, awaiting Frank's morning ack
package: "@starlight/memory-palace"
depends_on: "@starlight/cognitive-substrate@0.1.0"
parent_specs:
  - 2026-04-29-memory-substrate-program-overview.md
  - 2026-04-29-memory-bus-core-design.md
  - 2026-04-29-two-package-architecture.md
parent_board: docs/boards/luminor-v77-memory-bus.md
target_release: v7.7
attestation: Built on SIP — implementation plan, no code touched until cognitive-substrate ships
---

# Implementation Plan — `@starlight/memory-palace` v0.1

## Goal

Build the **upper-layer experience** on top of `@starlight/cognitive-substrate`: the wings/rooms/drawers/diaries/tunnels metaphor (MemPalace-inspired UX), the mining pipeline (Claude Code transcripts + files + web), the AAAK-equivalent compression dialect, and ~10 palace-flavored MCP tools.

The substrate is the foundation; the palace is how humans and agents *experience* memory as navigable space.

## Success criteria (all must hold)

- [ ] Wings / Rooms / Drawers data model implemented on top of `IBusStorage`
- [ ] Per-agent diaries (each agent gets a wing)
- [ ] Cross-wing tunnels (explicit named bridges)
- [ ] Mining pipeline ingests `~/.claude/projects/*.jsonl` transcripts (idempotent, mempalace-mine-style chunking)
- [ ] File mining (`palace_mine ~/path`)
- [ ] Web URL mining (`palace_mine <url>`)
- [ ] AAAK-equivalent compressed dialect spec + parser
- [ ] 10 palace-flavored MCP tools (palace_traverse, palace_find_tunnels, palace_create_tunnel, palace_diary_write, palace_diary_read, palace_mine, palace_get_taxonomy, palace_list_wings, palace_list_rooms, palace_list_drawers)
- [ ] StarlightVaults flagship API (absorbed from `@arcanea/memory-system`) sits on top of substrate cleanly
- [ ] HorizonLedger (append-only) reuses substrate file-backend; sub-package owns the semantic
- [ ] VaultClassifier (keyword + regex) routes content to correct wing/room
- [ ] Test coverage > 70% on memory-palace package

## Dependencies (gates in)

- ✅ Spec written + Frank's morning ack
- ⏸ `@starlight/cognitive-substrate@0.1.0` shipped (blocks Phase 1+)
- ⏸ Same Phase 0 gates as substrate (provenance, metadata test, HNSW smoke) inherited

## Phasing (4 phases over ~2-3 days focused)

### Phase 0 — Inherits substrate Phase 0

This package's Phase 0 is the substrate's Phase 0. No additional gates here.

### Phase 1 — Package scaffold (~0.25 day)

| Task | Output |
|---|---|
| 1.1 — Create `packages/memory-palace/` with `package.json` (depends `@starlight/cognitive-substrate`) | Package skeleton |
| 1.2 — vitest + node:test wiring | Test runner config |
| 1.3 — esbuild/tsup build config | Build config |
| 1.4 — CI workflow | `.github/workflows/memory-palace.yml` |

### Phase 2 — Absorption + adaptation from `@arcanea/memory-system` (~1 day)

Per `docs/superpowers/specs/2026-04-29-memory-bus-core-design.md` absorption plan, palace gets the experience-layer source:

| Task | Source → Target |
|---|---|
| 2.1 — Absorb `starlight-vaults.ts` (flagship 6-vault class) | `memory-palace/src/StarlightVaults.ts` |
| 2.2 — Absorb `vault-manager.ts` | `memory-palace/src/VaultManager.ts` |
| 2.3 — Absorb `horizon-ledger.ts` | `memory-palace/src/HorizonLedger.ts` |
| 2.4 — Absorb `mem0-adapter.ts` | `memory-palace/src/Mem0Adapter.ts` |
| 2.5 — Absorb `vault-classifier.ts` | `memory-palace/src/VaultClassifier.ts` |
| 2.6 — Absorb `memory-bridge.ts` (sync to MEMORY.md) | `memory-palace/src/MemoryBridge.ts` |
| 2.7 — Apply provenance headers per attribution doc | All absorbed files |
| 2.8 — Generalize Guardian-specific assumptions where they leak into experience layer | Refactor |

**Acceptance:** all absorbed code compiles against `@starlight/cognitive-substrate@0.1.0` API; existing test patterns adapted and pass.

### Phase 3 — Palace-native code (~1.5 days)

| Task | Output |
|---|---|
| 3.1 — `Wing` model — top-level grouping (per person, project, agent, sovereign) | `memory-palace/src/model/Wing.ts` |
| 3.2 — `Room` model — topic within wing | `memory-palace/src/model/Room.ts` |
| 3.3 — `Drawer` model — verbatim content unit | `memory-palace/src/model/Drawer.ts` |
| 3.4 — `Tunnel` model — cross-wing named bridge | `memory-palace/src/model/Tunnel.ts` |
| 3.5 — `Diary` model — per-agent self-write log | `memory-palace/src/model/Diary.ts` |
| 3.6 — Wing/Room/Drawer hierarchy traversal | `memory-palace/src/traversal/PalaceWalker.ts` |
| 3.7 — `ClaudeCodeMiner` — chunk `~/.claude/projects/*.jsonl` into 800-char exchange-pair drawers | `memory-palace/src/mining/ClaudeCodeMiner.ts` |
| 3.8 — `FileMiner` — mine arbitrary files into drawers | `memory-palace/src/mining/FileMiner.ts` |
| 3.9 — `WebMiner` — mine URLs into drawers | `memory-palace/src/mining/WebMiner.ts` |
| 3.10 — `MineLock` — idempotency via mtime + sentinel | `memory-palace/src/mining/MineLock.ts` |
| 3.11 — AAAK-equivalent compression dialect spec | `memory-palace/docs/aaak-spec.md` |
| 3.12 — AAAK parser/serializer | `memory-palace/src/compression/aaak.ts` |

**Acceptance:** unit tests > 80% on each module; integration test mines 100 transcript files idempotently.

### Phase 4 — Palace MCP tools (~1 day)

| Task | Output |
|---|---|
| 4.1 — `palace_get_taxonomy` (wing→room→drawer count tree) | `memory-palace/src/tools/palace_get_taxonomy.ts` |
| 4.2 — `palace_list_wings` | `tools/palace_list_wings.ts` |
| 4.3 — `palace_list_rooms` | `tools/palace_list_rooms.ts` |
| 4.4 — `palace_list_drawers` | `tools/palace_list_drawers.ts` |
| 4.5 — `palace_traverse` (walk graph from a room) | `tools/palace_traverse.ts` |
| 4.6 — `palace_find_tunnels` (cross-wing bridges) | `tools/palace_find_tunnels.ts` |
| 4.7 — `palace_create_tunnel` (explicit cross-wing link) | `tools/palace_create_tunnel.ts` |
| 4.8 — `palace_diary_write` (agent self-diary in AAAK) | `tools/palace_diary_write.ts` |
| 4.9 — `palace_diary_read` | `tools/palace_diary_read.ts` |
| 4.10 — `palace_mine` (ingest external corpus) | `tools/palace_mine.ts` |
| 4.11 — Tool registry binding to substrate's MCP server | `memory-palace/src/tools/registry.ts` |
| 4.12 — Smoke: `mempalace mine ~/.claude/projects/` equivalent works on Frank's Windows 11 | tests/e2e/mining-smoke.test.ts |

**Acceptance:** Each tool has 3+ unit tests; mining smoke ingests Frank's actual `~/.claude/projects/` without errors.

## Risks + mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Mining `~/.claude/projects/*.jsonl` files have schema variation | Med | Test against multiple session types; graceful degradation on unknown shapes |
| AAAK compression spec ambiguity | Low | Skip AAAK in v0.1 if effort grows; mark NOT_YET_IMPLEMENTED |
| Wing/Room/Drawer abstraction leaks into substrate | High | Strict review: any cognitive-substrate code that mentions Wing/Room/Drawer is a bug |
| StarlightVaults absorbs Guardian-specific defaults | Med | Migration step: replace Guardian defaults with tenantId-parameterized config |
| Mining idempotency breaks if user edits source files | Low | mtime+content-hash check; re-chunk on hash change |

## Test strategy

- Unit tests per model + miner + tool
- Integration tests for mining flow (Claude Code transcripts → drawers → vault writes)
- E2E test: full palace lifecycle (mine → write → traverse → query)
- Smoke against Frank's actual `~/.claude/projects/` corpus

## Acceptance for v0.1 ship

- All 4 phases complete
- All success criteria met
- Coverage > 70%
- Mining smoke passes against Frank's real corpus
- README + API docs written
- Published to private npm registry as `@starlight/memory-palace@0.1.0`
- `apps/starlight-bus/` binary now bundles both packages

## Post-ship

- Voice operator round-3 migrates from `memory/knowledge-graph/` to palace mining (S5)
- Existing `memory/vaults/*.md` files imported via mining pipeline (S8)
- ACOS bridge writes Genius Profile / Brand Kit summaries to palace
- `MEMORY.md` updated

## Estimated total: 12-18 hours focused (~2-3 days)

Phase 0: shared with substrate
Phase 1: 2h
Phase 2: 6h
Phase 3: 8h
Phase 4: 6h
Buffer: 2h

---

*Built on SIP. Implementation plan v0.1. v7.7 candidate.*
