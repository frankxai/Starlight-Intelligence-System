# Cockpit Continuity — How It Works (10-minute read)

This is the field guide. Read `README.md` first for the elevator pitch; read `ARCHITECTURE.md` if you want the design rationale. This doc walks through what actually happens when you use cockpit, end to end.

---

## The mental model

Think of cockpit as **three passive ledgers + two active orchestrators**:

**Ledgers (always-on, never need user action):**
1. `sessions.jsonl` — every agent session start/stop/heartbeat
2. `last-snapshot.json` — the most recent workspace topology
3. `hook-errors.log` — anything that went sideways (should stay empty)

**Orchestrators (you call these explicitly):**
1. `arc snapshot` — read terminal state, write snapshot
2. `arc rehydrate` — read snapshot, spawn workspace

Everything else is plumbing.

---

## Walkthrough — a typical day

### 09:00 — boot up the laptop

You log in. Windows Terminal opens (because you have it set as a startup app, or because the previous Cockpit-Shutdown-Snapshot fired and you ran `arc rehydrate`).

If `arc rehydrate` runs at login (you can wire this via Task Scheduler — see below), the WT window comes back with the same 10 tabs you had at shutdown, each in the right cwd, each with `claude --resume <id>` already executing.

### 09:01 — Claude Code SessionStart fires

Each tab's `claude` command boots. Before it accepts your first prompt, Claude Code runs the hooks declared in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command",
            "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"C:/.../cockpit/hooks/claude-session-start.ps1\"",
            "timeout": 5000 }
        ]
      }
    ]
  }
}
```

The hook script:

1. Reads stdin (Claude passes `{ "session_id": "...", "cwd": "...", "transcript_path": "..." }`)
2. Walks the parent PID chain via `Get-CimInstance Win32_Process`
3. Builds a v1 row:
   ```json
   {
     "schema": "cockpit.session/v1",
     "ts": "2026-05-07T09:01:13.42Z",
     "event": "start",
     "agent": "claude",
     "session_id": "abc-123-...",
     "cwd": "C:\\Users\\frank\\Starlight-Intelligence-System",
     "wt_session": "{121c3017-...}",
     "pid": 31732,
     "ppid_chain": [31732, 6380, 36972, 16372, ...],
     "host": "DESKTOP-1B4ICID",
     "user": "frank",
     "project_key": "sis"
   }
   ```
4. Appends it to `~/.starlight/cockpit/sessions.jsonl`
5. Exits 0 within ~80ms

You don't see any of this. The hook is silent. Claude shows its prompt and you start working.

### 10:30 — open three more tabs in the same project folder

Each new Claude tab has its own session_id. The hook fires three more times. The manifest now has separate rows for each pane, all with the same `cwd` but different `session_id`s and different `pid`s. **This is the key**: when you later `arc rehydrate`, each tab gets its own resumed session, not a picker.

### 11:00 — open Gemini in another tab

You run `gem` (the cockpit wrapper) instead of `gemini`:

```
gem
[cockpit] Gemini session tag: cockpit-mydir-121c3017
[cockpit] To resume prior chat: /chat resume cockpit-mydir-121c3017
[cockpit] To save before exit:  /chat save cockpit-mydir-121c3017
```

The wrapper:
- Derived a deterministic tag from `(cwd-leaf, WT_SESSION-prefix)` — same tag will be regenerated next time you `gem` from this same pane.
- Wrote a `start` row to the manifest (so `arc status` shows it).
- Now invokes `gemini`. When you exit (Ctrl+C or `/exit`), the wrapper writes a `stop` row.

When you reopen this tab tomorrow, `gem` regenerates the same tag and prints "to resume: `/chat resume cockpit-mydir-121c3017`". You type that command into Gemini. Done.

### 13:00 — periodic snapshot fires

The Task Scheduler `Cockpit-Periodic-Snapshot` task runs every 5 minutes. It calls `pwsh scripts/snapshot.ps1`. Snapshot:

1. Detects active terminal (auto: WT, since `WindowsTerminal.exe` is running).
2. Builds the process index (one `Get-CimInstance Win32_Process` call).
3. For each WT host process, walks descendants to find shells.
4. For each shell, finds descendant agent (claude, gemini, codex).
5. Cross-references against `Get-CockpitAliveSessions` to grab session_id + cwd + rehydrate command.
6. Writes the topology to `last-snapshot.json` (overwrites previous).

Cost: ~250ms total. Idempotent.

### 17:30 — laptop reboots for Windows Update

Windows fires Event ID 1074 (system shutdown). The Task Scheduler `Cockpit-Shutdown-Snapshot` task triggers on that event and runs `snapshot.ps1` one final time. `last-snapshot.json` reflects the workspace as of moments before shutdown.

Update completes. Laptop reboots.

### 17:45 — you're back

Two options:

**A. Auto-rehydrate on login** (opt-in via Task Scheduler trigger `AtLogon`):
WT opens with the saved topology automatically. You're back in business.

**B. Manual rehydrate** (default):
```powershell
arc rehydrate
```

Either way, `rehydrate.ps1`:

1. Reads `last-snapshot.json`.
2. Validates schema.
3. Mode check: with `-Mode skip` (default), refuses if WT is already running. Pass `-Mode merge` to add tabs to the existing window.
4. Dispatches to `adapters/windows-terminal/emit.ps1`.
5. Builds the `wt.exe` argument array.
6. Runs `Start-Process wt.exe -ArgumentList $wtArgs`.

The `wt.exe` invocation looks like:

```
wt -w 0 \
  new-tab -d C:\Users\frank\Starlight-Intelligence-System --title sis "pwsh -NoExit -Command \"claude --resume abc-123-...\"" \
  ; new-tab -d C:\Users\frank\Arcanea --title arcanea "pwsh -NoExit -Command \"claude --resume def-456-...\"" \
  ; new-tab -d C:\Users\frank\frankx --title frankx "pwsh -NoExit -Command \"claude --resume ghi-789-...\"" \
  ; new-tab ...
```

Each new tab opens, runs pwsh, which runs `claude --resume <id>`. Claude reads its JSONL transcript at `~/.claude/projects/<encoded-cwd>/<id>.jsonl` and rehydrates the conversation state.

Total elapsed time from `arc rehydrate` to fully usable cockpit: ~3 seconds for 10 tabs.

---

## What you actually see vs. what's happening

| You do | What you see | What cockpit does |
|--------|-------------|-------------------|
| Open new Claude tab | Just Claude's prompt | Hook fires silently, manifest row appended |
| `arc status` | Table of alive sessions | Reads manifest, filters by alive PIDs, formats |
| `arc snapshot` | "Snapshot written: ..." | Walks WT process tree, writes snapshot.json |
| `arc rehydrate` | New WT window opens with N tabs | Reads snapshot, builds wt.exe args, spawns |
| Reboot Windows | Login screen → desktop | Cockpit-Shutdown-Snapshot fires; cockpit-periodic-snapshot resumes after login |
| Type `claude` directly (no hook) | Claude works normally | Hook fires regardless; you get persistence for free |
| Hook fails for some reason | Nothing visible | Logged to hook-errors.log; agent unaffected |

---

## The "10 tabs in one folder" problem, solved

Before cockpit:
- 10 Claude tabs all in `C:\proj`. You reboot.
- `claude --resume` from `C:\proj` shows you 10 sessions in a picker.
- You don't know which one was tab 3.

With cockpit:
- Each tab's session_id was recorded with its WT_SESSION GUID + parent PID chain.
- Snapshot maps (WT pane → Claude session_id) deterministically.
- Rehydrate spawns 10 tabs, each with `claude --resume <specific-id>`. No picker. No ambiguity.

---

## What can go wrong (and how cockpit handles it)

| Scenario | Cockpit response |
|----------|------------------|
| Manifest disk full | Write fails, hook logs, exits 0. Agent runs fine. |
| Snapshot taken mid-tab-close | Stale entry in snapshot. Rehydrate sees `alive: false` for that pane and skips it. |
| You manually delete sessions.jsonl | All future sessions start fresh recording. No retroactive recovery. |
| Two cockpit-snapshot tasks fire simultaneously | Both write to `last-snapshot.json`. Last writer wins. Idempotent enough — both see the same workspace. |
| You install on a machine without Claude | Hook never fires. Manifest stays empty. `arc status` reports no sessions. Nothing breaks. |

---

## Where to look when debugging

| Symptom | Where to look |
|---------|--------------|
| "Hook isn't firing" | `Get-Content ~/.claude/settings.json` — confirm SessionStart entry has cockpit's path |
| "Manifest is empty" | `arc doctor` → "manifest writable" check; `~/.starlight/cockpit/hook-errors.log` |
| "Rehydrate spawns wrong session" | `Get-Content ~/.starlight/cockpit/last-snapshot.json` — inspect the recorded session_ids |
| "Snapshot is wrong / stale" | Run `arc snapshot` manually; compare to `Get-Process -Name WindowsTerminal` |
| "Tasks aren't running" | `Get-ScheduledTaskInfo Cockpit-Periodic-Snapshot` — check LastRunTime + LastTaskResult |

---

## Roadmap

- [ ] tmux adapter (Linux/macOS parity)
- [ ] `arc tui` — live status dashboard
- [ ] `arc replay <session-id>` — open transcript in pager
- [ ] Multi-window snapshot (currently treats all WT panes as one window)
- [ ] iterm2 adapter (macOS)
- [ ] WSL bridge (record cockpit events from inside WSL2 sessions)

Contributions welcome. See `CONTRACTS.md` for schemas you'd extend.
