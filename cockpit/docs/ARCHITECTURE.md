# Cockpit Continuity — Architecture

## Design principles

1. **Passive over active.** The user never calls "save". Hooks fire automatically. The manifest is built as a byproduct of normal work.
2. **Append-only.** Manifest writes are atomic appends. Concurrent writes from N agents are safe without locking.
3. **Hooks never block the host.** A failing hook MUST exit 0 and log. Agents must not feel cockpit's existence.
4. **Adapters, not coupling.** Terminal-specific code (Windows Terminal, Zellij) lives behind an adapter interface. Adding tmux is "implement two functions."
5. **Schema-versioned everything.** Every JSON document carries a `schema` field. Forward compatibility via migration scripts.

## Three-layer architecture

```
┌─────────────────────────────────────────────────────┐
│ LAYER 3 — CLI                                       │
│   arc snapshot | rehydrate | status | doctor | gc   │
│   (cockpit/scripts/arc-cockpit.ps1)                 │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ LAYER 2 — Adapters                                  │
│                                                     │
│   Windows Terminal   Zellij      tmux (planned)     │
│   ─────────────────  ──────      ─────────────      │
│   capture.ps1        capture.ps1                    │
│   emit.ps1           emit.ps1                       │
│   (cockpit/adapters/<terminal>/)                    │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ LAYER 1 — Manifest primitives                       │
│   Write-CockpitSessionEvent                         │
│   Read-CockpitManifest                              │
│   Get-CockpitAliveSessions                          │
│   Invoke-CockpitManifestGC                          │
│   (cockpit/scripts/manifest.ps1)                    │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
              ~/.starlight/cockpit/sessions.jsonl
```

## Data flow — write path

```
Claude Code starts
       │
       │  Reads ~/.claude/settings.json hooks.SessionStart
       ▼
Spawns powershell.exe -File cockpit/hooks/claude-session-start.ps1
       │
       │  Hook reads JSON envelope from stdin (session_id, cwd, ...)
       │  Hook walks process tree to get parent PID chain
       │  Hook calls Write-CockpitSessionEvent
       ▼
Append-only write to ~/.starlight/cockpit/sessions.jsonl
       │
       ▼
Hook exits 0 (within 5s deadline). Claude continues startup.
```

If anything fails, the catch block writes to `~/.starlight/cockpit/hook-errors.log` and the hook still exits 0. **Claude is never blocked.**

## Data flow — read path (snapshot)

```
arc snapshot              (manual, or every 5 min via Task Scheduler,
                           or on shutdown event 1074)
       │
       ▼
scripts/snapshot.ps1
       │
       │  Detects active terminal (auto: WT, Zellij, both)
       │  Dispatches to adapter capture
       ▼
adapters/windows-terminal/capture.ps1
       │
       │  1. Get-Process WindowsTerminal → host PIDs
       │  2. Get-CimInstance Win32_Process → full PID tree
       │  3. For each WT host: walk descendants
       │  4. Find shells (pwsh, powershell, cmd, bash, wsl, zsh)
       │  5. For each shell: find descendant agent (claude, gemini, codex)
       │  6. Cross-reference shell PID + descendant chain against
       │     Get-CockpitAliveSessions(manifest)
       │  7. Build per-pane record
       ▼
last-snapshot.json (single document, overwritten)
```

## Data flow — rehydrate path

```
arc rehydrate
       │
       ▼
scripts/rehydrate.ps1
       │
       │  Reads last-snapshot.json
       │  Validates schema
       │  Mode check: -skip refuses if WT already alive
       ▼
adapters/windows-terminal/emit.ps1
       │
       │  Builds wt.exe arg array:
       │    -w 0 new-tab -d <cwd1> --title <t1> "pwsh -NoExit -Command 'claude --resume <id1>'"
       │    ; new-tab -d <cwd2> --title <t2> "pwsh ..."
       │    ; new-tab -d <cwd3> ...
       ▼
Start-Process wt.exe -ArgumentList $wtArgs
       │
       ▼
New WT window with N tabs, each running the recorded agent + session.
```

## Process-tree correlation

The hardest engineering problem in this project: **which Windows Terminal pane is which Claude session?**

Windows Terminal exposes pane GUIDs only inside each pane via `$env:WT_SESSION`. There's no public API to enumerate panes from outside. So we work bottom-up:

1. Each Claude session, on startup, runs the SessionStart hook.
2. The hook captures the parent PID chain via `Get-CimInstance Win32_Process` (recursive `ParentProcessId` walk up to depth 10).
3. At snapshot time, we walk the process tree from each `WindowsTerminal.exe` host PID downward, finding shells and their agent descendants.
4. We match a manifest entry to a pane by checking if the manifest's `pid` or any element of `ppid_chain` appears in the descendant set of a particular shell.

This means a manifest entry that was written 2 minutes ago and whose PIDs match a still-alive process tree gets correlated with that pane. Stale entries (dead PIDs) are dropped from the alive view.

## Why JSONL + atomic append

Multiple Claude tabs can fire SessionStart hooks simultaneously. We need writes to be safe under concurrency without locking.

POSIX `O_APPEND` guarantees atomic appends up to PIPE_BUF size (4096 bytes on most platforms). Windows `FILE_APPEND_DATA` provides equivalent guarantees. PowerShell's `Add-Content` uses these primitives.

Each manifest row is well under 4 KB (typical: ~600 bytes). So concurrent writes never interleave.

JSONL is the natural format: append a single line per event, each line is independently parseable, recovery from corruption is line-local.

## Schema versioning

`cockpit.session/v1` and `cockpit.snapshot/v1` are pinned in CONTRACTS.md. Bumping requires:

1. Define `cockpit.session/v2` schema in CONTRACTS.md.
2. Add a reader branch in `Read-CockpitManifest` that recognizes both versions.
3. Ship `scripts/migrate-v1-to-v2.ps1` for one-shot conversion.
4. Document deprecation timeline.

## Privacy boundary

Manifest contains: cwd, project name, agent type, opaque session UUIDs, PIDs, hostname, username.

Manifest does NOT contain: transcript content, prompts, tool outputs, secrets, file contents.

This separation is intentional. The agent CLI is responsible for transcript persistence (Claude Code does this natively at `~/.claude/projects/`). Cockpit's job is to **know which transcript belongs to which pane**, not to duplicate transcript storage.

## Failure modes (designed for)

| Failure | Behavior |
|---------|----------|
| Hook script can't write to manifest | Logs to `hook-errors.log`, exits 0. Agent unaffected. |
| `~/.starlight/cockpit/` doesn't exist | `Initialize-CockpitHome` creates it. |
| Manifest file is corrupt | `Read-CockpitManifest` skips unparseable lines. |
| Agent process killed without Stop hook | Manifest still has `start` row but PID is dead — `Get-CockpitAliveSessions` filters it out. |
| Snapshot called when no terminal active | Returns empty `windows: []`. Rehydrate is a no-op. |
| Rehydrate called when WT already alive | Default `-Mode skip` refuses with warning. `-Mode merge` adds tabs. `-Mode replace` is reserved. |
| Schema mismatch on snapshot read | Warns, continues with best-effort interpretation. |
| Periodic Task Scheduler job fails | Doesn't affect manual `arc snapshot`. |

## Performance

- Hook adds ~50–100ms to Claude startup (process tree walk + JSON encode + append).
- `arc snapshot` walks Win32_Process once (~200ms for ~300 procs) + per-shell descendant lookups (cheap, indexed).
- `arc rehydrate` is a single `Start-Process wt.exe` invocation; WT itself takes ~1s to spawn.
- Manifest grows ~600 bytes per event. 100 events/day = 60 KB/month. GC drops old `stop` rows quarterly.

## What's NOT in scope (explicit)

- **Restoring Claude's in-RAM context.** Cockpit resumes the *session ID*, which Claude then re-loads from its own JSONL transcript. Cockpit doesn't snapshot agent memory.
- **Cross-machine sync.** `~/.starlight/cockpit/` is local-only by design.
- **Hibernate replacement.** If Windows hibernates, processes survive natively; cockpit isn't needed. Cockpit fills the **shutdown** gap.
- **GUI.** This is a CLI tool. A status TUI is on the roadmap.
