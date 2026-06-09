# Changelog

All notable changes to Cockpit Continuity will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-05-07

### Added — major
- **Workspaces**: named cockpit profiles via `arc save <name>` / `arc load <name>` / `arc workspaces` / `arc rm-workspace <name>`. Workspaces let you switch between contexts ("morning", "deep-work", "research") without losing any.
- **Cross-platform support**: Linux/macOS via tmux. New POSIX hook scripts (`claude-session-start.sh`, `claude-session-stop.sh`), tmux capture/emit adapter (`adapters/tmux/`), and `scripts/install.sh` installer.
- **MCP server**: Cockpit becomes queryable from any MCP client (Claude Code, Cursor, etc.). Eight tools: `cockpit_status`, `cockpit_query_sessions`, `cockpit_snapshot`, `cockpit_rehydrate`, `cockpit_save_workspace`, `cockpit_load_workspace`, `cockpit_list_workspaces`, `cockpit_recent_events`. All tools dry-run-safe by default; spawn ops require explicit `confirm=true`.
- **`arc tui`**: live ANSI dashboard showing alive sessions + last snapshot + recent events + saved workspaces. No external dependencies. Hot-keys for refresh, snapshot, help.
- **`arc undo`**: restore previous snapshot from rotating archive. Last 10 snapshots auto-archived to `~/.starlight/cockpit/snapshots/`.
- **`arc history`**: list recent snapshots with age + pane count.
- **`arc events`**: tail the structured event log (NDJSON).

### Added — robustness
- **Atomic snapshot writes** via temp+rename. Crash-safe; readers never see partial files.
- **JSON Schema validation** for all schema'd documents (`Test-CockpitSessionSchema`, `Test-CockpitSnapshotSchema`). Invalid snapshots are refused before write rather than silently corrupting.
- **Manifest auto-rotation** at 5 MB threshold. Keeps last 3 archives, drops older. Rotation is transparent — readers get full history via `Read-CockpitManifest -IncludeArchives`.
- **Hook rate-limiting** at 10 events/agent/sec. Prevents misbehaving agents from flooding the manifest.
- **Structured event log** (`events.log`, NDJSON). Separate from manifest source-of-truth, enables observability without polluting the canonical record. Every hook fire, snapshot, GC, workspace op writes a structured event.
- **Snapshot history** (`snapshots/snapshot-*.json`). Every `arc snapshot` archives a copy; last 10 retained for `arc undo`.

### Added — productization scaffold
- **GitHub Actions CI** (`.github/workflows/test.yml`): smoke tests on Windows + Linux, bash parse + run check, MCP server syntax + boot check, ShellCheck on all `.sh` files.
- **CHANGELOG.md** (this file).
- **CONTRIBUTING.md**, **CODE_OF_CONDUCT.md**, **ISSUE_TEMPLATE.md**.

### Changed
- `Read-CockpitManifest` now contracts callers to wrap in `@(...)` for array semantics. Documented in function comment. Avoids PowerShell single-element-array auto-unwrap bug.
- `Get-CockpitProcessChain` is no-op on non-Windows (no CIM); preserves cross-platform compat.
- `cockpit version` returns dynamic `cockpit-continuity v$(Get-CockpitVersion)`, single source of truth.
- Manifest rows now include `tmux_pane` (POSIX equivalent of `wt_session`) and `cockpit_version`.

### Fixed
- `$Pid` is a PowerShell read-only constant — renamed param to `$RootPid` in `Get-CockpitProcessChain`.
- `Resolve-CockpitAgentForShell` rejected empty-array `[Parameter(Mandatory)]` — added `[AllowEmptyCollection()]` and explicit empty-handling.
- `Read-CockpitManifest` returned auto-unwrapped scalar when only one row present — replaced with `Write-Output` per row, callers wrap in `@()`.

### Tests
- Smoke harness expanded from 50 to ~70 assertions (sandbox-isolated via `$env:COCKPIT_HOME`).
- New layers: workspaces (8 assertions), v0.2 hardening (8), cross-platform shells (5), TUI parse (1), MCP (3).
- Existing `cockpit-zellij/test/smoke.ps1` regression: 17/17 still green.

### Added — full automation (later in v0.2)
- **Auto-rehydrate-on-login** Task Scheduler trigger. After install, simply log in after a reboot — Windows Terminal opens with the previous cockpit. Skip-mode: no-op if WT already alive (so re-logging in mid-day doesn't duplicate tabs). Disable with `arc install -NoAutoRehydrate`.
- **Daily auto-save** at 09:00 (`auto-morning-YYYYMMDD`) and 17:00 (`auto-evening-YYYYMMDD`). Builds rolling history of workspace topology without you doing anything.
- **Weekly GC** every Sunday at 03:00. Compacts `sessions.jsonl` (drops `stop` rows older than 30 days) and removes auto-* workspaces older than 30 days. Manual workspaces (no `auto-` prefix) are NEVER auto-deleted.
- `arc install -Minimal` skips the three above (advanced users who want only the manifest layer).

### Workflow change
- v0.1 / early v0.2: install registers periodic + shutdown snapshot. User runs `arc save`/`arc load`/`arc rehydrate` manually.
- **v0.2 final: install registers ALL automation. User never runs anything.** The `arc save`/`arc load` commands remain as escape hatches for ad-hoc workspace management; they're no longer the primary interface.

### Known limitations
- Linux/macOS auto-rehydrate-on-login: not yet ported (cron + bash equivalent on roadmap).
- Linux/macOS TUI: not yet ported (PowerShell-only); the bash environment uses `arc-status`/`arc-snapshot`/`arc-events` aliases.
- Multi-window WT snapshot: still treats each shell as its own tab (lossy for split-pane layouts).

---

## [0.1.0] — 2026-05-06/07

### Added
- Initial release.
- PowerShell-only, Windows Terminal + Zellij adapters.
- 22 files: manifest primitives + capture/emit adapters + CLI dispatcher + Claude Code SessionStart/Stop hooks + Gemini wrapper + install/uninstall/doctor.
- 50/50 smoke tests sandboxed via `$env:COCKPIT_HOME`.
- README + CONTRACTS + QUICKSTART + ARCHITECTURE + HOW-IT-WORKS + LICENSE (MIT) + NOTICE (Built on SIP).
- Commands: `arc snapshot|rehydrate|status|install|uninstall|doctor|gc|help|version`.
- Designed for `git subtree split --prefix=cockpit/` extraction into standalone repo.
