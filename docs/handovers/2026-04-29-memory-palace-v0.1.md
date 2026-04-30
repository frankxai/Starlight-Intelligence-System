---
handover: memory-palace-v0.1
date: 2026-04-29
session: cockpit thread (claude-opus-4-7, autonomous overnight)
package: "@starlight/memory-palace"
depends_on: "@starlight/cognitive-substrate@0.1.0 (must ship first)"
target_release: v7.7
status: SPEC + PLAN designed; depends on cognitive-substrate; awaiting Frank's ack
attestation: Built on SIP — package handover artifact
---

# Handover — `@starlight/memory-palace` v0.1

## Critical prerequisite

**This package cannot start implementation until `@starlight/cognitive-substrate@0.1.0` has shipped.** That's the lower-layer foundation. Palace consumes it.

If you arrived here without substrate v0.1 shipped: pause. Hand off to `docs/prompts/2026-04-29-cognitive-substrate-continuation.md` first. Return when:
- `npx starlight-bus status` returns RUNNING
- `tools/list` MCP call returns 16 substrate tools
- Phase 0 gates GREEN per `docs/boards/luminor-v77-memory-bus.md`

## State of work (2026-04-29 end of overnight session)

### What's done

| Artifact | Path | Status |
|---|---|---|
| Two-package boundary | `docs/superpowers/specs/2026-04-29-two-package-architecture.md` | DRAFT, defines palace's role in upper layer |
| Implementation plan | `docs/superpowers/plans/2026-04-29-memory-palace-v0.1.md` | DRAFT, 4 phases, 12-18h |
| Continuation prompt | `docs/prompts/2026-04-29-memory-palace-continuation.md` | /po-generated, ~2200 tokens |
| Absorption plan reference | `docs/attribution/memory-bus-absorption.md` | Palace inherits 6 of the 11 absorbed files |
| Luminor Board record | `docs/boards/luminor-v77-memory-bus.md` | REVISE applied; same gates apply to absorbed source |

### What's NOT done

- ❌ Zero TS written
- ❌ Zero commits (this package's tree doesn't exist yet)
- ❌ No mining run against Frank's `~/.claude/projects/` (Phase 3 work, post-substrate-ship)
- ❌ No AAAK spec drafted (Phase 3 work)
- ❌ No palace_* MCP tools written (Phase 4 work)
- ❌ Cognitive-substrate package not yet shipped — palace blocked

## What palace owns (vs substrate)

### Substrate concerns (NOT in palace)

- Daemon lifecycle, HTTP+SSE transport
- IBusStorage interface
- FileBackend (JSONL append-only)
- HNSW vector index
- Temporal KG layer
- SIP attestation primitives
- Tenant namespacing
- The 10 `sis_*` v6 backwards-compat tools
- 6 new `sis_*` substrate tools (vector_search, hybrid_search, kg_query, kg_add_fact, attest, subscribe)

### Palace concerns (HERE)

- **Wing** model — top-level grouping (per person, project, agent, sovereign)
- **Room** model — topic within wing
- **Drawer** model — verbatim content unit
- **Tunnel** model — cross-wing named bridge
- **Diary** model — per-agent self-write log
- **PalaceWalker** — graph traversal
- **ClaudeCodeMiner** — chunk `~/.claude/projects/*.jsonl` into 800-char exchange-pair drawers
- **FileMiner** — mine arbitrary files
- **WebMiner** — mine URLs
- **MineLock** — idempotency via mtime + sentinel
- **AAAK** — compression dialect spec + parser/serializer
- **VaultClassifier** — keyword + regex routing (absorbed)
- **StarlightVaults** — flagship 6-vault API (absorbed)
- **VaultManager** — lower-level engine (absorbed)
- **HorizonLedger** — append-only wishes ledger (absorbed)
- **Mem0Adapter** — Mem0-shape API (absorbed)
- **MemoryBridge** — sync to MEMORY.md (absorbed)
- 10 palace MCP tools (palace_get_taxonomy, list_wings, list_rooms, list_drawers, traverse, find_tunnels, create_tunnel, diary_write, diary_read, mine)

## Key boundary discipline

**Strict one-way: palace depends on substrate. Never the reverse.**

Any palace code that:
- Mentions HTTP transport or daemon lifecycle → bug
- Reaches into `IBusStorage` internals → bug
- Bypasses substrate to write to `~/.starlight/vaults/` directly → bug
- Adds methods to `IBusStorage` interface → substrate-tier change, requires `/luminor-board`

If palace needs a primitive substrate doesn't expose, file as substrate task and pause palace. This is how dependency direction stays clean.

## Mining behavior contract

The mining pipeline is the palace's most user-visible feature. Three sub-miners share contracts:

1. **Idempotency** — re-running on same source produces zero new drawers if nothing changed (mtime + content-hash check via `MineLock`).
2. **Verbatim** — store source content exactly as found. NEVER summarize at write time. Compression is separate concern (AAAK or future tools).
3. **Schema flexibility** — Claude Code transcripts have format variation across model versions. Graceful degradation on unknown shapes; log + continue, don't crash.
4. **Atomicity** — partial mining failures don't corrupt state. Use `MineLock` to mark "in-progress" and resume cleanly.
5. **Provenance** — every drawer carries source path, mining timestamp, and `mined_by` agent.

## Open questions

1. **AAAK scope creep** — if AAAK design grows past 4h, mark NOT_YET_IMPLEMENTED and ship without. Palace v0.1 is useful without AAAK; agents can write plain-text diaries.
2. **Wing naming convention** — Frank's vault has 6 SIS vaults (strategic/technical/creative/operational/wisdom/horizon). Should each become a top-level Wing? Or are Wings per-sovereign-instance, with Vaults as Rooms inside? Recommend the latter — Wings = sovereign instances, Vaults = Rooms within a Wing.
3. **Migration of `memory/vaults/*.md`** — these are currently 6 markdown files in repo. Mining ingests them as drawers (Phase 3.7), but the markdown source remains. Ongoing: human edits the .md, palace re-mines? Or palace becomes source-of-truth and .md files are exports? Defer to S8 spec.
4. **Voice operator KG migration timing** — `memory/knowledge-graph/index.jsonl` (5 entries today) becomes palace mining target eventually. S5 spec timing — v7.7-late per Aiyami's REVISE item, after voice-operator round-3 stable.

## Risk register

| Risk | Severity | Mitigation status |
|---|---|---|
| Substrate API insufficient for palace needs | Med | Strict review during Phase 1; surface gaps before Phase 3 |
| Mining `~/.claude/projects/*.jsonl` schema variation | Med | Test against multiple session types; graceful degradation |
| AAAK scope-creep | Low | NOT_YET_IMPLEMENTED escape hatch |
| Wing/Vault vocabulary collision | Low | Documentation discipline; both terms survive |
| Palace mining corrupts substrate state | Low | Mining writes through `IBusStorage` only; substrate has its own write mutex |

## Suggested resume sequence

1. **Verify substrate v0.1 shipped** — `npx starlight-bus status` + 16 tools list
2. **Read `docs/prompts/2026-04-29-memory-palace-continuation.md`** — that's the /po prompt
3. **Phase 1 — scaffold** (~2h)
4. **Phase 2 — absorb experience layer** with provenance headers (~6h)
5. **Phase 3 — palace-native models + miners** (~8h)
6. **Phase 4 — palace MCP tools + mining smoke against Frank's `~/.claude/projects/`** (~6h)
7. **Ship `@starlight/memory-palace@0.1.0`**
8. **`apps/starlight-bus/` binary now bundles both packages**

## What to NOT do

- Do not start before substrate v0.1 ships
- Do not mention HTTP/daemon/IBusStorage internals in palace code
- Do not summarize at mining write time (verbatim discipline)
- Do not modify `Arcanea-run-graph/` source — only consume the API substrate exports
- Do not touch voice operator's KG (`memory/knowledge-graph/`) until S5 spec lands
- Do not auto-write MEMORY.md entries

## Memory entry to suggest (post-ship)

```
- [Memory Palace v0.1 (substrate consumer)](project_v77_memory_palace.md) — 2026-04-29 spec + plan. Wings/Rooms/Drawers/Diaries/Tunnels on top of @starlight/cognitive-substrate. Mining: Claude Code transcripts + files + URLs, idempotent. AAAK compression dialect.
```

Defer until ship + your discretion.

---

*Built on SIP. Memory palace handover. v7.7 candidate.*
