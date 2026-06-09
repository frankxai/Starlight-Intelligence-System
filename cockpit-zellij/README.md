# cockpit-zellij/

Zellij terminal-multiplexer cockpit. Per-project layouts + the `arc` PowerShell wrapper.

## What this gives you

A single command opens a complete operator workspace for any project:

```powershell
arc sis        # opens SIS substrate cockpit
arc arcanea    # opens Arcanea constellation cockpit
arc frankx     # opens FrankX flagship cockpit
arc energy-is  # opens Energy IS authoring cockpit
arc            # no-arg: legacy starlight-orchestrator default
```

Each cockpit auto-spawns 4 tabs (Orchestrator / Files / Status / Debug). The Orchestrator tab has a 4-pane layout (Dispatcher + Claude + Codex + Gemini panes), all `cwd`'d to the project.

Combined with `claude --resume <project>` discipline (run inside the Dispatcher pane), every project becomes a named, persistent conversation that survives sleeps and reboots.

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

## Commands

| Command | What it does |
|---|---|
| `arc` | Opens the legacy `starlight-orchestrator` default layout (no project context) |
| `arc <project>` | Opens the per-project layout. Session is named `<project>` so re-attach finds it. |
| `arc-attach <project>` | Re-attaches to existing session, or opens fresh if none |
| `arc-resume <project>` | Alias for `arc-attach`. Reads naturally with `claude --resume`. |
| `arc-list` | Lists running Zellij sessions |
| `arc-list-projects` | Lists available per-project layouts |
| `arc-kill` | Kills all Zellij sessions cleanly |
| `arc-layout <name>` | Opens a specific layout by name (advanced) |

## How layouts are organized

```
cockpit-zellij/
├── layouts/
│   ├── _template.kdl.tmpl          (parameterized template)
│   ├── starlight-orchestrator.kdl  (legacy default, no-arg)
│   ├── sis.kdl                     (Starlight-Intelligence-System)
│   ├── arcanea.kdl                 (Arcanea constellation)
│   ├── frankx.kdl                  (FrankX flagship)
│   └── energy-is.kdl               (Energy IS authoring tab)
├── lib/
│   └── projects.ps1                (audit-JSON loader)
├── scripts/
│   ├── zellij-aliases.ps1          (the arc functions)
│   └── generate-layouts.ps1        (regenerate layouts from template + audit)
├── test/
│   └── smoke.ps1                   (read-only verification harness)
└── README.md                       (this file)
```

## Generating new layouts

The audit JSON at `memory/_audit/repo-portfolio-2026-05-04.json` is the canonical-paths source. To generate a layout for any audit-identified active project:

```powershell
pwsh cockpit-zellij/scripts/generate-layouts.ps1 -Only <project-key>
```

Or regenerate the default 4 layouts (sis, arcanea, frankx, energy-is):

```powershell
pwsh cockpit-zellij/scripts/generate-layouts.ps1
```

To regenerate ALL active projects (24 from audit + 2 alias keys):

```powershell
pwsh cockpit-zellij/scripts/generate-layouts.ps1 -All
```

## Per-project session naming convention

When you open `arc <project>`, the Zellij session is named `<project>`. This composes with Claude Code's `--resume` flag for full conversation persistence:

```powershell
# In the Dispatcher pane after arc opens:
claude --resume <project>
```

Future re-attaches find both the Zellij workspace AND the Claude conversation. State survives sleep, reboot, and tab-close.

The convention:
```
Zellij session name = project key (e.g., sis, arcanea, frankx)
Claude session name = same project key
Git branch          = the actual deliverable
```

## Verification

```powershell
pwsh cockpit-zellij/test/smoke.ps1
```

Expected: ALL PASS, exit 0.

## Relationship to the other cockpit surfaces

- **`cockpit-zellij/`** (this directory) -- terminal cockpit. Multi-CLI orchestration via Zellij. CLI-native.
- **`private/local-command-center/apps/dashboard/`** -- Next.js web cockpit on `:3007` (`/`, `/cockpit`, `/brain`).
- **`private/local-command-center/apps/phone/`** -- phone PWA on `:3008` (`/record`, `/approve`).
- **`private/local-command-center/scripts/start-cockpit.ps1`** -- Windows-native launcher (FastAPI cognition + orb + dashboard + brain_watchdog daemon).

The four surfaces compose. They do not overlap.

## History

- **2026-04-30** — initial scaffold (`starlight-orchestrator.kdl` + basic `arc` function)
- **2026-05-04** — cockpit unification — per-project layouts, audit-JSON-driven canonical paths, `arc <project>` extended commands, smoke-test harness, consolidation of duplicate `Arcanea.kdl` from `private/local-command-center/cockpit/`

---
**Built on SIP** -- operational-tier scaffolding · 2026-04-30 (initial) · 2026-05-04 (unification)
