# Obsidian Integration — Two Paths

The Starlight memory stack treats `memory/` as an Obsidian vault. Two integration patterns are supported, each with different trade-offs.

## Path A — Filesystem-native (recommended, default)

**No daemons. No plugins. No API keys.**

The `memory/` folder is already a valid Obsidian vault. Claude Code's built-in `Read`, `Write`, `Glob`, and `Grep` tools operate on it natively. The bundled skills handle vault grammar:

| Skill | Purpose | Location |
|---|---|---|
| `obsidian-cli` | Read/write notes, search vault, list folders | `~/.agents/skills/obsidian-cli/` |
| `obsidian-markdown` | Note frontmatter, wikilinks, callouts, embeds | `~/.agents/skills/obsidian-markdown/` |
| `obsidian-bases` | Bases (Obsidian's structured-data view) syntax | `~/.agents/skills/obsidian-bases/` |
| `json-canvas` | `.canvas` file editing (mind maps, flowcharts) | `~/.agents/skills/json-canvas/` |

**You already have all four installed.** No further setup needed.

When you open Obsidian against `memory/` as a vault, every note Claude writes appears live. The graph view picks up `[[wikilinks]]` automatically.

## Path B — Live REST plugin (optional polish)

If you want agents to query Obsidian's *runtime state* — Dataview queries, plugin-rendered views, the current graph — you need the **Local REST API** plugin running inside the Obsidian app.

### One-time setup (Frank-side)

1. **Install the plugin** in Obsidian:
   - Settings → Community plugins → Browse → search "Local REST API" (by Adam Coddington) → Install → Enable.
2. **Generate an API key**:
   - Settings → Local REST API → copy the API key.
3. **Confirm the port**: default `27124` (HTTPS) or `27123` (HTTP).
4. **Register the MCP server** by appending to `~/.claude/settings.json` under `mcpServers`:

   ```json
   "obsidian": {
     "command": "npx",
     "args": ["-y", "obsidian-mcp-server"],
     "env": {
       "OBSIDIAN_API_KEY": "<paste-key-here>",
       "OBSIDIAN_HOST": "https://127.0.0.1:27124"
     }
   }
   ```

5. Restart Claude Code. New tools appear: `mcp__obsidian__search_notes`, `mcp__obsidian__read_note`, `mcp__obsidian__append_to_note`, etc.

### When Path B is worth it

- You want agents to **execute Dataview queries** (computed views over the vault).
- You want agents to **read plugin-rendered output** (Excalidraw, Kanban, etc.).
- You want a **second-screen Obsidian app** to live-update as Claude writes notes (Path A writes work in Obsidian too, but only on file-system polling — Path B emits events).

### When Path A is sufficient

- You only need to **read** and **write** notes (95% of use cases).
- You want **headless** operation (servers, CI, automation without a GUI).
- You want **zero attack surface** (no extra port, no API key in env).

## Bridge between MemPalace and Obsidian

Regardless of path, the **MemPalace→Obsidian curation bridge** runs the same way:

```
/curate-recall "voice operator v2 plan"
```

It calls memory-bus (the SIS MCP, your custom layer over MemPalace), recalls atoms, and writes a structured note to `memory/curated/`. See `commands/curate-recall.md`.

## Cross-platform sync verification

If you commit an atom via memory-bus on machine A and recall it on machine B, the round-trip works because memory-bus stamps every commit with `source=...#via=memory-bus` in the audit log. To verify:

```
# After any agent writes to memory-bus
mcp__memory-bus__memory_audit_tail (n=5)
```

The most recent entries should include the new atom. If they don't, check that all your agents are pointed at the same memory-bus instance (single python process, singleton enforced).

*Built on SIP — obsidian-mcp-setup v0.1*
