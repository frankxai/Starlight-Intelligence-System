---
name: curate-recall
description: Recall atoms from MemPalace and write a curated Obsidian note. Bridges automated capture (memory-bus) to human-readable graph (memory/ vault).
usage: /curate-recall "<query>" [--slug=name] [--k=N] [--namespace=NS]
---

# /curate-recall

Curate a MemPalace recall into a structured Obsidian note.

## What it does

1. Calls `mcp__memory-bus__memory_recall` with the user's query.
2. Renders the matched atoms as a markdown note with frontmatter, `[[atom-id]]` backlinks (so Obsidian graph view picks them up), and one blockquote per atom.
3. Writes the note to `memory/curated/<slug>.md`.

## Two execution paths

### A. Via the Node CLI (terminal-native, sharable, scriptable)

```
node tools/memory-bridge/curate-recall.mjs "voice operator v2 plan"
```

Optional args:
- `--slug=voice-v2-recall` — output filename (default: query slug)
- `--k=12` — number of atoms to recall (default 8)
- `--namespace=voice-sessions` — restrict to a namespace

### B. Via Claude (inline, conversational)

When invoked as `/curate-recall "<query>"`, Claude should:

1. Call `mcp__memory-bus__memory_recall` with the query.
2. Parse the returned atoms.
3. Use the `Write` tool to create `memory/curated/<slug>.md` with the standard format (see `skills/memory/mempalace-obsidian-bridge.md`).
4. Report the file path to the user.

Path B is preferred when the user is mid-session and wants the note in context; Path A is preferred for batch curation or non-Claude environments.

## Output location

`memory/curated/` is the canonical landing zone. The folder is part of the Obsidian vault (`memory/` is the vault root), so the note appears immediately in Obsidian's file browser and graph view.

## Cross-platform

Works from Claude Code, Codex, Cursor, or plain shell — the Node script spawns the python memory-bus MCP via stdio. No daemons, no API keys.

## See also

- `skills/memory/mempalace-obsidian-bridge.md` — the activation skill
- `tools/memory-bridge/curate-recall.mjs` — the CLI implementation
- `docs/integrations/obsidian-mcp-setup.md` — optional official Obsidian MCP (REST-based)

*Built on SIP — curate-recall v0.1*
