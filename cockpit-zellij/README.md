# cockpit-zellij/

Zellij terminal-multiplexer cockpit — root layout + PowerShell aliases that wrap a multi-project terminal cockpit (SIS + Arcanea + arcanea-onchain) into a single `arc` command.

## Why this lives here

Originally at repo root as `dashboard/`, which collided with `private/local-command-center/apps/dashboard/` (the Next.js cockpit on `:3007`). Renamed to `cockpit-zellij/` 2026-04-30 to break the naming collision and signal what this actually is — terminal cockpit, not web dashboard.

## What's here

| Path | Purpose |
|---|---|
| `layouts/starlight-orchestrator.kdl` | Zellij layout — 4 tabs (Orchestrator / Files / Status / Debug). Top dispatcher pane (30% height) + 3 worker panes (Claude / Codex / Gemini). |
| `scripts/zellij-aliases.ps1` | PowerShell functions — `arc`, `arc-attach`, `arc-kill`, `arc-list`, `arc-layout`. |

## Install (one-time)

```powershell
notepad $PROFILE
```

Add this line, save, close:
```powershell
. "$HOME\Starlight-Intelligence-System\cockpit-zellij\scripts\zellij-aliases.ps1"
```

Then in current session:
```powershell
. $PROFILE
```

After that, `arc` from any directory opens the Starlight terminal cockpit.

## Relationship to the other cockpit surfaces

- **`cockpit-zellij/`** (this directory) — terminal cockpit (Zellij). Multi-CLI orchestration. CLI-native.
- **`private/local-command-center/apps/dashboard/`** — Next.js web cockpit on `:3007` (`/`, `/cockpit`, `/brain`).
- **`private/local-command-center/apps/phone/`** — phone PWA on `:3008` (`/record`, `/approve`).
- **`private/local-command-center/scripts/start-cockpit.ps1`** — Windows-native PowerShell launcher that starts the FastAPI cognition layer + orb + dashboard + brain_watchdog daemon.

The four surfaces compose. They do not overlap.

---
**Built on SIP** — operational-tier scaffolding · 2026-04-30
