# Cockpit Continuity — Contracts

> Authoritative schemas + hook contracts. Every component reads from here.
> If you change a schema, bump the version field and update all consumers.

---

## 1. Session Manifest (`sessions.jsonl`)

**Location:** `~/.starlight/cockpit/sessions.jsonl` (override via `COCKPIT_HOME` env var).

**Format:** newline-delimited JSON. Append-only. Atomic writes via OS-level append (no read-modify-write).

**Row schema (v1):**

```json
{
  "schema": "cockpit.session/v1",
  "ts": "2026-05-07T03:14:22.123Z",
  "event": "start",
  "agent": "claude",
  "session_id": "abc-123-def-456",
  "cwd": "C:\\Users\\frank\\Starlight-Intelligence-System",
  "wt_session": "{...uuid...}",
  "wt_window": null,
  "wt_pane": null,
  "pid": 12345,
  "parent_pid": 12340,
  "ppid_chain": [12345, 12340, 9876],
  "host": "FRANK-DESKTOP",
  "user": "frank",
  "project_key": "sis"
}
```

**Field semantics:**

- `schema` — version pin. Consumers MUST validate.
- `ts` — ISO-8601 UTC, millisecond precision.
- `event` — one of: `start`, `stop`, `heartbeat`, `crash`.
- `agent` — one of: `claude`, `gemini`, `codex`, `opencode`, `cursor`, `cline`.
- `session_id` — agent-native session identifier (Claude UUID, Gemini tag, etc.).
- `cwd` — absolute path at session start. Backslash-preserved on Windows.
- `wt_session` — value of `$env:WT_SESSION` at hook fire (Windows Terminal pane GUID), or null if not in WT.
- `wt_window` — Windows Terminal window GUID if discoverable, else null.
- `wt_pane` — pane GUID within window, else null.
- `pid` — agent process PID.
- `parent_pid` — immediate parent (typically the shell).
- `ppid_chain` — full chain up to `WindowsTerminal.exe` or session root, for correlation.
- `host` — `$env:COMPUTERNAME`.
- `user` — `$env:USERNAME`.
- `project_key` — derived from `Get-StarlightProject` lookup against audit JSON, else `Split-Path -Leaf $cwd`.

---

## 2. Snapshot (`last-snapshot.json`)

**Location:** `~/.starlight/cockpit/last-snapshot.json` (overwritten on each snapshot).

**Format:** single JSON document.

**Schema (v1):**

```json
{
  "schema": "cockpit.snapshot/v1",
  "snapshot_at": "2026-05-07T03:14:22.123Z",
  "host": "FRANK-DESKTOP",
  "user": "frank",
  "terminal": "windows-terminal",
  "windows": [
    {
      "guid": "{window-guid}",
      "title": "Starlight Cockpit",
      "tabs": [
        {
          "index": 0,
          "title": "sis",
          "active": true,
          "panes": [
            {
              "guid": "{pane-guid}",
              "cwd": "C:\\Users\\frank\\Starlight-Intelligence-System",
              "agent": "claude",
              "session_id": "abc-123",
              "rehydrate_command": "claude --resume abc-123",
              "shell": "pwsh",
              "alive": true
            }
          ]
        }
      ]
    }
  ]
}
```

**Field semantics:**

- `terminal` — one of: `windows-terminal`, `zellij`, `tmux`, `unknown`.
- `windows[].tabs[].panes[].rehydrate_command` — exact command-line to spawn the agent on resume. May be `null` for panes with no resumable agent (plain shell).
- `alive` — true if PID was alive at snapshot time. Stale entries are kept for diagnostic purposes but `arc rehydrate` skips them.

---

## 3. Hook Contract — Claude Code SessionStart

**Trigger:** Claude Code fires SessionStart hooks per `~/.claude/settings.json`.

**Hook payload (passed via stdin as JSON):**

Claude Code passes a JSON envelope with at least:
- `session_id`
- `cwd`
- `transcript_path`

**Hook responsibility:**

1. Read stdin, parse JSON.
2. Build a `cockpit.session/v1` row with `event: "start"`.
3. Append to `~/.starlight/cockpit/sessions.jsonl`.
4. Exit 0 within 5000ms. NEVER block Claude Code startup.

**Hook script:** `cockpit/hooks/claude-session-start.ps1`.

**Failure mode:** swallow all errors. The hook's failure must NEVER prevent Claude from starting. Log to `~/.starlight/cockpit/hook-errors.log` and exit 0.

---

## 4. Hook Contract — Claude Code Stop

**Trigger:** Claude Code fires Stop hook when session ends.

**Hook responsibility:**

1. Append a `cockpit.session/v1` row with `event: "stop"`.
2. Exit 0 within 5000ms.

**Hook script:** `cockpit/hooks/claude-session-stop.ps1`.

---

## 5. CLI Surface — `arc`

The existing `arc <project>` command in `cockpit-zellij/scripts/zellij-aliases.ps1` is preserved. Cockpit Continuity adds these subcommands via `cockpit/scripts/arc-cockpit.ps1`:

| Command | Purpose | Output |
|---------|---------|--------|
| `arc snapshot` | Walk current terminal state, write `last-snapshot.json` | Path to snapshot + count of panes captured |
| `arc rehydrate` | Read `last-snapshot.json`, spawn windows/tabs/panes | Spawn count + any skipped (stale) sessions |
| `arc status` | List alive sessions in manifest | Table: agent, project, cwd, session_id, age |
| `arc install` | Register hooks in `~/.claude/settings.json`, register Task Scheduler shutdown trigger | Confirmation + uninstall hint |
| `arc uninstall` | Remove hooks and scheduled tasks | Confirmation |
| `arc doctor` | Verify install: hook present, sessions.jsonl writable, Task Scheduler trigger active | Pass/fail per check |
| `arc gc` | Compact sessions.jsonl (drop `stop` rows older than N days, default 30) | Bytes reclaimed |

The shorter `arc <project>` form (existing) and the new cockpit subcommands are disambiguated by checking whether arg-1 is a known subcommand.

---

## 6. Configuration (`config.json`)

**Location:** `~/.starlight/cockpit/config.json`.

**Schema (v1):**

```json
{
  "schema": "cockpit.config/v1",
  "manifest_path": "~/.starlight/cockpit/sessions.jsonl",
  "snapshot_path": "~/.starlight/cockpit/last-snapshot.json",
  "auto_snapshot": {
    "on_shutdown": true,
    "periodic_minutes": 5
  },
  "rehydrate": {
    "on_login": false,
    "terminal": "auto"
  },
  "gc": {
    "stop_event_retention_days": 30
  },
  "agents": {
    "claude": { "enabled": true },
    "gemini": { "enabled": true, "auto_save_on_exit": true },
    "codex":  { "enabled": false }
  }
}
```

Defaults are inlined in `cockpit/config/default.json`. `arc install` copies that to `~/.starlight/cockpit/config.json` if absent.

---

## 7. Failure Semantics (HARD CONTRACT)

- A failing hook NEVER breaks the agent it's attached to. All hook errors → log, exit 0.
- `arc snapshot` is read-only on the running system. NEVER kills processes, NEVER modifies live tabs.
- `arc rehydrate` NEVER overwrites a live tab. If a window already exists for the saved layout, prompt or skip per `--mode {merge,skip,replace}`.
- Manifest writes use append-only mode. Concurrent writes from multiple agents are safe (POSIX append is atomic up to PIPE_BUF; on Windows, file open with FILE_APPEND_DATA gives same guarantee).

---

## 8. Privacy

- Manifest contains: cwd, project name, agent type, session_id (opaque UUID), PID, hostname, username.
- Manifest does NOT contain: transcript content, prompts, tool outputs, secrets, file contents.
- `cockpit/` directory in repo is public; `~/.starlight/cockpit/` instance state is local-only and excluded from any cross-repo sync.

---

## 9. Versioning

This contract is `cockpit-contracts/v1`. Schema bumps require:
1. New `schema` value (e.g. `cockpit.session/v2`).
2. Consumer updates all read sites.
3. Migration script in `cockpit/scripts/migrate-vN-to-vN1.ps1`.

---

## 10. Umwelt Manifest (`env.json`)

**Location:** `~/.starlight/umwelt/env.json` (override via `COCKPIT_HOME` env var).

**Format:** Single JSON document representing the local host's tool capabilities.

**Schema (v1):**
```json
{
  "schema": "umwelt.capability/v1",
  "ts": "2026-05-07T03:14:22.123Z",
  "os": {
    "platform": "win32",
    "release": "10.0.22631",
    "arch": "x64"
  },
  "shell": {
    "type": "pwsh",
    "version": "7.4.2"
  },
  "tools": {
    "git": "2.45.0",
    "node": "20.12.2",
    "bun": "1.1.4",
    "uv": "0.1.39",
    "mise": "2024.5.1",
    "bat": "0.24.0",
    "lazygit": "0.42.0",
    "agy": "0.1.0",
    "grok": "0.1.0",
    "claude": "0.1.0"
  }
}
```

---

## 11. Machine Telemetry

**Location:** `~/.starlight/machine/` (override via `COCKPIT_HOME` env var).

**Files:**
- `capacity.json` (v1) — Hardware capacity specifications.
- `telemetry.jsonl` (v1) — Resource usage watchdog logs.

**Capacity Schema (v1):**
```json
{
  "schema": "machine.capacity/v1",
  "ts": "2026-05-07T03:14:22.123Z",
  "cpuCores": 16,
  "totalMemoryGb": 32,
  "disks": [
    {
      "drive": "C:",
      "totalGb": 1024,
      "freeGb": 450
    }
  ]
}
```
