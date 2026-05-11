# Cockpit Continuity

> Your terminal workspace, persistent across reboots — without saving anything manually.

Cockpit Continuity is a passive session-manifest layer that turns "10 tabs of various AI agents" into a deterministic, restartable workspace. It captures what you have open, knows which agent session belongs to which tab, and rebuilds the whole thing on demand — with zero manual save calls.

Built on the Starlight Intelligence Protocol (SIP) substrate. MIT-licensed.

[![Tests](https://github.com/frankxai/cockpit-continuity/actions/workflows/test.yml/badge.svg)](https://github.com/frankxai/cockpit-continuity/actions/workflows/test.yml)
![Tests passing: 82](https://img.shields.io/badge/smoke_tests-82_passing-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![Built on SIP](https://img.shields.io/badge/built_on-SIP-purple)

---

## The problem

You're running 10 terminal tabs across multiple folders. Some have Claude Code with a UUID-keyed session. Some have Gemini in a chat. Some have plain shells. You need to reboot — for an OS update, for a power cut, or just to clear memory.

Naïvely "open last window" only restores the **shells**. The agent sessions die. When you reopen the same folder, `claude --resume` shows you a picker of every session you ever started in that folder. You don't know which one was tab 3.

**Cockpit Continuity solves this by passively recording (terminal pane → agent session ID) the moment each session starts — via a SessionStart hook that fires automatically. You never call "save". On rehydrate, it spawns the exact same tab grid with `claude --resume <known-id>` per pane. Deterministic.**

---

## What's new in v0.2

- **Workspaces**: `arc save morning`, `arc save deep-work`, `arc save research` — switch between named cockpits without losing any.
- **Cross-platform**: Linux/macOS via tmux. POSIX hooks + tmux capture/emit + bash installer.
- **MCP server**: Cockpit becomes queryable from any MCP client. Eight tools so Claude/Cursor/etc can ask "what was I working on yesterday?" and even rebuild your cockpit on your behalf.
- **`arc tui`**: live ANSI dashboard. Sessions + last snapshot + recent events + workspaces, all updating live. Pure ANSI, no deps.
- **`arc undo`**: restore previous snapshot from rotating archive.
- **Atomic writes** + **JSON Schema validation** + **structured event log** — production hardening.
- **Performance benchmarks** with regression detection. Hook write p50 down from 2300ms → ~150ms via process-tree caching.

See [CHANGELOG.md](./CHANGELOG.md) for the full v0.2 manifest.

---

## Quick start

### Windows

```powershell
git clone https://github.com/frankxai/cockpit-continuity.git
cd cockpit-continuity
pwsh ./scripts/install.ps1
arc doctor
```

### Linux / macOS

```bash
git clone https://github.com/frankxai/cockpit-continuity.git
cd cockpit-continuity
bash ./scripts/install.sh
source ~/.bashrc   # or ~/.zshrc
```

### MCP server (optional, but recommended)

```bash
cd cockpit/mcp
npm install
```

Add to your Claude Code `settings.json`:
```json
{
  "mcpServers": {
    "cockpit": {
      "command": "node",
      "args": ["/path/to/cockpit/mcp/server.js"]
    }
  }
}
```

See [docs/MCP-INTEGRATION.md](./docs/MCP-INTEGRATION.md) for the full guide.

---

## Commands

### Core

| Command | Purpose |
|---------|---------|
| `arc snapshot` | Capture current terminal state |
| `arc rehydrate` | Rebuild last snapshot |
| `arc rehydrate -DryRun` | Show what would spawn, without spawning |
| `arc status` | Table of alive agent sessions |

### Workspaces (named cockpit profiles)

| Command | Purpose |
|---------|---------|
| `arc save <name>` | Save current state under a name |
| `arc load <name>` | Rebuild a named workspace |
| `arc workspaces` | List saved workspaces |
| `arc rm-workspace <name>` | Delete a workspace |

### History + recovery

| Command | Purpose |
|---------|---------|
| `arc history` | List last 10 snapshots |
| `arc undo` | Restore the previous snapshot |

### Observability

| Command | Purpose |
|---------|---------|
| `arc tui` | Live dashboard (sessions + events + doctor) |
| `arc events [-Tail N]` | Tail structured event log |

### Lifecycle

| Command | Purpose |
|---------|---------|
| `arc install` | Register hooks + Task Scheduler triggers |
| `arc uninstall [-PurgeData]` | Remove |
| `arc doctor` | 10-point install verification |
| `arc gc [-RetentionDays N]` | Compact manifest |

---

## How it works (one screen)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Live cockpit (10 WT/tmux tabs, each running an agent)               │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │ Tab 1       │  │ Tab 2       │  │ Tab 3       │  ...             │
│  │ Claude /sis │  │ Claude /arc │  │ Gemini /...│                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
│         │                │                │                          │
│         │ SessionStart   │ SessionStart   │ /chat save              │
│         │ hook fires     │ hook fires     │ on exit (gem wrapper)   │
│         ▼                ▼                ▼                          │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  ~/.starlight/cockpit/sessions.jsonl                    │        │
│  │  (append-only, atomic, schema-versioned, auto-rotated)  │        │
│  └────────────────────────┬────────────────────────────────┘        │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            │  arc snapshot  (manual / periodic / on-shutdown)
                            ▼
                ┌──────────────────────────────────┐
                │ ~/.starlight/cockpit/            │
                │ last-snapshot.json   (current)   │
                │ snapshots/snapshot-*.json (last 10)│
                │ workspaces/*.json    (named)     │
                └────────────────┬─────────────────┘
                                 │
                                 │  arc rehydrate | arc load <name>
                                 ▼
                ┌──────────────────────────────────┐
                │ wt.exe / tmux: spawn N panes,    │
                │ each running                     │
                │ claude --resume <id>             │
                └──────────────────────────────────┘
                                 │
                                 ▼
                  Cockpit restored, deterministic.
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full design.

---

## Supported agents

| Agent | Auto-track | Auto-resume |
|-------|------------|-------------|
| Claude Code | Yes — SessionStart/Stop hooks | Yes — `claude --resume <id>` |
| Gemini CLI | Yes — via `gem` wrapper | Partial — surfaces saved tag at launch |
| OpenCode | Stubbed | Manual |
| Codex | Stubbed | Manual |

Adding a new agent = drop a hook script under `agents/<name>/` that calls `Write-CockpitSessionEvent` (PowerShell) or appends to `$COCKPIT_HOME/sessions.jsonl` (POSIX). See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Supported terminals

| Terminal | Capture | Emit | Status |
|----------|---------|------|--------|
| Windows Terminal | Yes (process-tree walk) | Yes (`wt.exe new-tab`) | Production |
| Zellij | Yes (`zellij list-sessions`) | Yes (`arc-attach`) | Production |
| tmux | Yes (`tmux list-panes`) | Yes (`tmux new-session`/`new-window`/`split-window`) | v0.2 — beta |
| iTerm2 | Planned | Planned | Roadmap |

---

## Tests + CI

```powershell
# Smoke (unit)
pwsh ./test/smoke.ps1     # 82 assertions

# E2E integration
pwsh ./test/e2e.ps1       # 13 phases

# Performance benchmark
pwsh ./test/bench.ps1     # 4 metrics, regression-checked
```

CI runs all three on Windows + Linux on every push to `main`. See [.github/workflows/test.yml](./.github/workflows/test.yml).

---

## Privacy

Manifest contains: cwd, project name, agent type, opaque session UUIDs, PIDs, hostname. **No transcript content, no prompts, no tool outputs, no secrets, no file contents.**

`~/.starlight/cockpit/` is local-only, never synced.

---

## License

MIT. See [LICENSE](LICENSE).

This project is built on the Starlight Intelligence Protocol substrate. See [NOTICE](NOTICE) for the "Built on SIP" attestation convention.

---

## Status

**v0.2.0** — production hardening + cross-platform + MCP + workspaces + TUI.

Runs on:
- Windows 10/11 with PowerShell 5.1+
- Linux (Ubuntu 20.04+, Debian 11+, Fedora 36+) via PowerShell + bash hooks
- macOS 12+ via PowerShell + bash hooks

---

## Built on SIP

```
{
  "schema": "sip-attestation/v1",
  "substrate": "Starlight Intelligence Protocol",
  "tier": "tooling",
  "license": "MIT"
}
```
