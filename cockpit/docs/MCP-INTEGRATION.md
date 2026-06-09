# Cockpit Continuity — MCP Integration

The Cockpit MCP server exposes cockpit state and operations as **tools** that any MCP-compatible AI client can invoke. This means **Claude Code (or Cursor, or another Claude instance) can ask cockpit questions about your workspace and even rebuild it on your behalf.**

---

## Why this matters

Without MCP:
- You run `arc status` to see your sessions.
- You run `arc rehydrate` to rebuild your cockpit.
- The AI has no awareness of your terminal state.

With MCP:
- "Claude, what was I working on yesterday in the SIS project?" → Claude calls `cockpit_query_sessions` and reads your history.
- "Claude, save my current setup as 'morning-standup'." → Claude calls `cockpit_save_workspace` with that name.
- "Claude, dry-run rebuilding my workspace." → Claude calls `cockpit_rehydrate` with `confirm=false` and shows you the plan.
- "Claude, are any of my Gemini sessions still alive?" → Claude calls `cockpit_status` filtered by `agent=gemini`.

All read operations + dry-run safe by default. Write/spawn ops require explicit `confirm=true` from the AI, which Claude shows you as a tool call you approve.

---

## Install

```bash
cd cockpit/mcp
npm install
```

The MCP server has one runtime dependency: `@modelcontextprotocol/sdk`.

---

## Configure (Claude Code)

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "cockpit": {
      "command": "node",
      "args": ["C:/Users/you/path/to/cockpit/mcp/server.js"]
    }
  }
}
```

On Linux/macOS the path uses POSIX separators. The server is platform-agnostic — Node.js handles the rest.

Restart Claude Code. The cockpit tools will now appear in Claude's tool list.

---

## Configure (Cursor)

Add to Cursor's MCP settings (`Settings -> Cursor Settings -> Features -> MCP`):

```json
{
  "cockpit": {
    "command": "node",
    "args": ["/path/to/cockpit/mcp/server.js"]
  }
}
```

---

## Configure (other MCP clients)

The server speaks standard stdio MCP. Any client that supports MCP servers via stdio can use it. Pass the absolute path to `server.js`.

---

## Tool reference

All tools return structured JSON. Tools that *spawn or modify* state default to dry-run; pass `confirm=true` to execute.

### `cockpit_status`

List currently alive agent sessions.

```json
{ "agent": "claude" }   // optional filter
```

Returns: `{ count, cockpit_home, sessions: [...] }`. Each session has `agent`, `project_key`, `cwd`, `session_id`, `pid`, `started_ts`, `wt_session`, `tmux_pane`.

### `cockpit_query_sessions`

Search the manifest history.

```json
{
  "project_key": "sis",
  "agent": "claude",
  "cwd_contains": "Arcanea",
  "event": "start",
  "since_iso": "2026-05-01T00:00:00Z",
  "before_iso": "2026-05-08T00:00:00Z",
  "include_archives": false,
  "limit": 50
}
```

All filters optional; combine freely. Returns `{ total_matched, returned, filters_applied, rows }`.

### `cockpit_snapshot`

Capture the current terminal workspace.

```json
{ "terminal": "auto" }   // or windows-terminal, zellij, tmux, both
```

### `cockpit_rehydrate`

Plan or execute rebuilding the workspace.

```json
{ "confirm": false, "mode": "skip" }
```

Default is dry-run. `confirm=true` actually spawns. `mode` is one of `merge` | `skip` | `replace`.

### `cockpit_save_workspace`

Save current state under a name.

```json
{ "name": "morning-standup", "description": "Daily review tabs" }
```

### `cockpit_load_workspace`

Load a named workspace.

```json
{ "name": "morning-standup", "confirm": false, "mode": "merge" }
```

### `cockpit_list_workspaces`

List all saved workspaces.

### `cockpit_recent_events`

Tail the structured event log.

```json
{ "tail": 20, "kind_filter": "session.event", "status_filter": "ok" }
```

---

## Privacy in MCP context

The MCP server only exposes the same data cockpit already records: cwd, project name, agent type, opaque session UUIDs, PIDs, hostname. **It does NOT expose:** transcript content, prompts, tool outputs, secrets, file contents.

When an AI calls `cockpit_query_sessions`, it sees the *fact* that a session existed in /sis at 2026-05-07T09:00 — not what was discussed in that session.

If you want to share session transcripts with an AI, that's a separate concern (Claude Code has its own transcript-replay tooling at `~/.claude/projects/<encoded-cwd>/`).

---

## Troubleshooting

### "Tool not found" in Claude

Did you restart Claude Code after editing settings.json? MCP servers are loaded at startup.

### MCP server boot errors

```bash
cd cockpit/mcp
node server.js
```

Should print `cockpit-continuity MCP v0.2.0 ready (cockpit_home=...)` on stderr within 2s. If it errors, check Node version (requires >=18) and `npm install` completion.

### Tools return errors

Check `cockpit_recent_events` for the underlying issue. Most "tool returned error" cases trace back to:
- `~/.starlight/cockpit/` not initialized → run `arc install` first
- PowerShell scripts not found → MCP server expects cockpit to live at `<this-server>/../scripts/` (default repo layout)
- COCKPIT_HOME env mismatch → server uses `process.env.COCKPIT_HOME` if set, else `~/.starlight/cockpit/`

---

## Roadmap

- `cockpit_replay_session` — return last N events for a session_id (read-only transcript pointer)
- `cockpit_attach_session` — invite the AI to be aware of which cockpit session it's running inside
- `cockpit_subscribe_events` — long-lived stream of events (requires SSE/streaming MCP, not yet stable)
