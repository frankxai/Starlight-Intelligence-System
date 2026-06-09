---
type: sprint-ship-note
ship: cockpit-unification
date: 2026-05-04
sprint: 2026-W19
queen: SIS-tab
tier: operational (Tier 5b-adjacent)
status: shipped
---

# Ship — Cockpit Unification (2026-05-04 overnight)

> Single `arc <project>` PowerShell command opens the right Zellij layout for any project, with `claude --resume <project>` discipline baked in. Closes the "5 cockpit surfaces, 2 launchers, no project-scoped sessions" friction Frank named at session open. Operational-tier ship.

## What shipped

| File | Purpose |
|---|---|
| `cockpit-zellij/lib/projects.ps1` | Audit-JSON loader (`Get-StarlightProjects`, `Get-StarlightProject`) |
| `cockpit-zellij/layouts/_template.kdl.tmpl` | Parameterized Zellij layout template |
| `cockpit-zellij/layouts/sis.kdl` | SIS substrate cockpit layout (generated) |
| `cockpit-zellij/layouts/arcanea.kdl` | Arcanea constellation cockpit (generated) |
| `cockpit-zellij/layouts/frankx.kdl` | FrankX flagship cockpit (generated) |
| `cockpit-zellij/layouts/energy-is.kdl` | Energy IS authoring cockpit (generated, matches dispatched tab) |
| `cockpit-zellij/scripts/generate-layouts.ps1` | Regenerator script (idempotent, deterministic) |
| `cockpit-zellij/scripts/zellij-aliases.ps1` (extended) | `arc`, `arc-attach`, `arc-kill`, `arc-list`, `arc-layout`, `arc-list-projects` (NEW), `arc-resume` (NEW) |
| `cockpit-zellij/test/smoke.ps1` | Read-only verification harness (14 assertions) |
| `cockpit-zellij/README.md` | Documented convention + commands |
| `private/local-command-center/cockpit/Arcanea.kdl` | DELETED (superseded; was gitignored, deletion silent in repo) |

## Verification

`pwsh cockpit-zellij/test/smoke.ps1` — **14/14 PASS** (all assertions green).

## Bugs caught + fixed during build

1. **PowerShell variable shadowing in smoke harness** — `Test-Assert` function param `$Name` shadowed the foreach loop variable `$name`, causing closures to capture the wrong value. Fixed by renaming loop var to `$layoutKey` + using `.GetNewClosure()` to snapshot. Test-driven discovery; no fix without smoke.

## Commands now available globally (after `. $PROFILE`)

```powershell
arc                  # legacy default (starlight-orchestrator)
arc sis              # SIS substrate cockpit
arc arcanea          # Arcanea constellation
arc frankx           # FrankX flagship
arc energy-is        # Energy IS authoring tab
arc-list-projects    # show all available layouts
arc-resume <project> # re-attach OR fresh-open if no session
```

## ChatGPT proposal status

The ChatGPT proposal Frank cited at session open ("Zellij + Claude --resume + thin Starlight wrapper") is now **first-class shipped**. Specifically:

- ✅ Per-project Zellij named sessions (e.g., `--session sis`)
- ✅ Layout-driven cockpit per project
- ✅ Audit-JSON-driven canonical paths (no hard-coded paths)
- ✅ `arc <project>` thin wrapper
- ✅ `claude --resume <project>` discipline documented + supported by session naming
- ✅ Smoke-test harness (verifies layouts + aliases without spinning Zellij)
- ✅ Documentation in `cockpit-zellij/README.md`

## Composes with

- **Repo Portfolio Audit** (commit `ab997e7`) — JSON consumed for canonical paths
- **Energy IS handover packet** (commit `cf0342b`) — `arc energy-is` opens the dispatched-tab workspace
- **Existing `start-cockpit.ps1`** — terminal cockpit (this ship) is complementary to the web stack (orb / dashboard / FastAPI)

## Open work

- **Layout customization per project** — current layouts are template-uniform (4 tabs, 4 panes). Future passes could add project-specific tabs (e.g., FrankX `gh issue list`, Arcanea `arcanea-status`). Out of scope for this ship.
- **24 active projects, only 4 have layouts** — `pwsh cockpit-zellij/scripts/generate-layouts.ps1 -All` generates the rest as needed.
- **`claude --resume` enforcement** — discipline documented, not yet a hard CLAUDE.md rule. Promotion candidate for next sprint.
- **Parallel-session note (`memory/sprints/2026-W19.md` modifications)** — another session has been editing the sprint doc with S1-S6 sweep work + cockpit-patcher subagent in flight. This ship is a separate file (`memory/sprints/ships/cockpit-unification-2026-05-04.md`) to stay out of that lane. Cross-checking via Cross-Repo Indexer / Memory Bus on next session.

## Final commits this overnight session (queen-bound)

| Commit | What |
|---|---|
| `ab997e7` | Repo audit tool + 68-repo report |
| `53bc0cb` | Audit-hypothesis correction #1 |
| `cf0342b` | Energy IS handover packet + master prompt |
| `2ced7cb` | Energy IS 7 skill stubs |
| `a5061d5` | Cockpit unification plan + W19 standup |
| `<this commit>` | Cockpit unification implementation (8 tasks shipped) |

---

*Built on SIP — operational tier · Sprint W19 ship #1 · 2026-05-04 overnight*
