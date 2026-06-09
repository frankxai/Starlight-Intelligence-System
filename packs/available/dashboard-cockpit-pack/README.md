# Dashboard Cockpit Pack

> Starter pack for any sovereign fork that wants the Starlight cockpit-style session management — `arc <project>` → Zellij layout + Claude Code resume + cockpit dashboard, auto-starting at logon.

## What's inside

- `content/agent.md` — the cockpit-orchestrator agent definition; drops into `~/.claude/agents/` or your platform-equivalent.
- `content/install.ps1` — Windows install: registers the `StarlightCockpit` scheduled task, lays down `~/.starlight/cockpit/` config, sets `arc` alias.
- `content/install.sh` — POSIX install (macOS / Linux): registers a launchd / systemd-user service for the cockpit, lays down `~/.starlight/cockpit/`.
- `content/uninstall.ps1` / `content/uninstall.sh` — clean removers.
- `content/cockpit-layouts/default.kdl` — Zellij layout (panes: claude, opencode, codex, brain-watchdog).
- `content/arc.ps1` — `arc <project>` cross-platform launcher (PowerShell flavour).

## Permissions

Declared in `manifest.json`:

- `fs:read:HOME/.claude` — to read existing Claude project state and resume sessions.
- `fs:write:HOME/.starlight/cockpit` — to write the cockpit config, layouts, audit log.
- `task-scheduler:register` — to register the Windows `StarlightCockpit` task / launchd plist / systemd unit.

The pack installer will refuse to run unless the user explicitly acknowledged these via `permissions_acked: true` in the install call. The pack-runtime enforces this gate — there is no opt-out flag.

## What it does NOT do

- Does not write outside `~/.claude` (read-only) or `~/.starlight/cockpit/` (read-write).
- Does not modify shell rc files unless the user runs `install.ps1 -EnableAlias` explicitly.
- Does not phone home. Cockpit telemetry stays local.

## License

MIT.

Built on SIP.
