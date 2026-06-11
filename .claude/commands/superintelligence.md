---
name: superintelligence
description: Operational-tier execute mode. Session-mode sibling of /yolo and /starlight that proceeds without pre-board governance, scoped to operational-tier work only. Substrate-touching moves still auto-invoke /starlight-board per CLAUDE.md § Substrate-tier governance gate.
when_to_use: Operational-tier work (vault writes, MCP server work in src/, the 6 v6 commands, skill edits, agent edits, site edits per CLAUDE.md routing). NOT for substrate-tier changes (SIP.md / SIS.md / ALLIANCE.md / STACK.md / VERTICALS.md / VOICES.md / REGISTRY.md / file-contract / attestation rules / sovereignty clause / 10-IS taxonomy / domain sub-stack pattern).
---

# /superintelligence — Operational-Tier Execute Mode

Per CLAUDE.md § Substrate-tier governance gate (v7.5.1+):

> Operational-tier work continues under `/superintelligence` without pre-board.
> `/superintelligence` "execute" mode does NOT displace this gate.

## What this mode does
Enters a session-mode where operational-tier moves execute with reduced governance friction. The mode is bounded by SIP routing:
- **Substrate-class file touched?** Auto-invokes `/starlight-board` before commit/tag. No exceptions.
- **Operational-class only?** Proceeds. Frank reviews artifacts inline rather than via pre-board.

## Scope (operational-tier per CLAUDE.md:44-45)
Allowed without pre-board:
- `agents/` and `agents/council/` writes
- `memory/vaults/` writes
- `skills/` writes
- `src/` (MCP server) work
- `commands/` and `.claude/commands/` writes
- `site/` writes
- The 6 v6 commands themselves: `/council`, `/navigate`, `/starlight`, `/synthesize`, `/transmit`, `/vault`

## Out of scope (substrate-class — requires `/starlight-board` pre-tag)
- `SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`
- File-contract changes
- Attestation rule changes
- Sovereignty clause changes
- 10-IS taxonomy changes
- Domain sub-stack pattern changes

## Sibling commands
- `/starlight` — main entry, system status
- `/yolo` — session-mode Claude-led cross-repo conductor with parallel council scan + aggressive autonomy (phase-in scope-locked, see `docs/superpowers/specs/2026-05-11-yolo-hive-design.md`)
- `/starlight-board` — canonical substrate-tier governance command

## Precedent record
v7.5.0 shipped under `/superintelligence` without pre-board — post-hoc Board verdict was PROCEED-WITH-REVISE; v7.5.1 closed the REVISE items and logged v7.5 as the recovery exception. From v7.6 onward, **board-before-tag is structural-not-discretionary** for substrate-class work. See `docs/boards/luminor-v75-ship.md`.

## Exit
Mode ends naturally at session close, or explicitly via `/yolo-exit`-style synthesis. No separate `/superintelligence-exit` — operational-tier work doesn't require ritualized close.

---

**Built on SIP** — operational tier session-mode command · v0.1 (file landed 2026-05-28 to close audit-flagged phantom; behavior was already documented in CLAUDE.md)
