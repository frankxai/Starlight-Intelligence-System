---
name: mempalace-obsidian-bridge
description: Bridge MemPalace recalls into curated Obsidian notes. Activates when the user asks to recall, curate, or persist a thought into the vault. Closes the gap between automated capture (MemPalace) and human-readable knowledge (Obsidian).
domain: memory
priority: high
load_level: core
---

# MemPalace ↔ Obsidian Bridge

## What this skill does

The Starlight memory stack has two layers:

- **MemPalace** (chroma + memory-bus MCP) — automated verbatim capture. Every voice, dispatch, and session event lands here. Good for "what was said." Search via `mcp__memory-bus__memory_recall`.
- **Obsidian vault** (`memory/`) — human-readable, hand-curated, graph-linkable. Good for "what matters."

This skill instructs you to close the loop: when you recall from MemPalace, **offer** to curate the answer into a structured Obsidian note. Never auto-write — always confirm with the user first, because curated notes are durable and the user is the editor-in-chief.

## Activation

Fire when:
- The user invokes `/curate-recall` (slash command)
- The user asks "recall X" or "what do we have on X"
- The user explicitly asks for an Obsidian note from a memory query
- A long agent run produced recalls that are worth keeping (offer at end of session)

## How to use

### Path A — slash command (preferred)

```
/curate-recall "voice operator v2 plan"
```

The command writes `memory/curated/<slug>.md` using `tools/memory-bridge/curate-recall.mjs`. The note has frontmatter, `[[atom-id]]` backlinks (so Obsidian graph view picks them up), and one blockquote per atom.

### Path B — inline curation during a session

When you call `mcp__memory-bus__memory_recall` during normal work and the result is materially interesting:

1. Surface a one-line summary to the user.
2. Offer: *"Want me to write this as an Obsidian note in memory/curated/?"*
3. If yes: use the `Write` tool to create `memory/curated/<slug>.md` following the format below.

### Note format

```markdown
---
title: <slug>
source: <command or "inline-curation">
query: "<the recall query>"
recalled_at: <ISO timestamp>
atom_count: <N>
tags: [curated, mempalace, recall]
---

# <slug>

> Recalled from MemPalace on <date> for query `<query>`. N atoms.

*Built on SIP — mempalace-obsidian-bridge*

## [[atom-id-1]]
*namespace: `default` · score: `0.812`*

> Atom text here.

## [[atom-id-2]]
...
```

## Why backlinks matter

`[[atom-id]]` syntax tells Obsidian's graph view to draw an edge. The atom IDs become *nodes* in the Obsidian graph — even though they live in MemPalace, not in `memory/`. Over time the curated notes form a meta-graph: human intent (note titles) wraps machine-captured atoms (`[[atom-id]]` leaves).

## Don't

- Don't auto-curate every recall. The vault is high-signal because it's hand-curated.
- Don't curate atoms that look ephemeral (single-line capture stubs, retry chatter).
- Don't bury the curated file in a deep tree. `memory/curated/` is the canonical landing zone.

## Cross-platform

The bridge is a Node script (`curate-recall.mjs`) that spawns the python memory-bus MCP via stdio. It runs from any environment that has `python` on PATH — Claude Code, Codex, Cursor, plain shell, Grok TUI. The Obsidian vault is filesystem-native; no daemon needed.

**Grok 4.3 note:** When the active harness is Grok, the bridge offers an additional visual palace card (image_gen of the curated atoms as infographic or 3D memory palace slice) alongside the Obsidian note. Use gstack or subagents for high-signal atom selection before curation. Ties into weekly Palace Review ritual (docs/chronicle/).
