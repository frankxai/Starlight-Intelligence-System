# Cockpit Continuity — Quick Start

## Prerequisites

- Windows 10/11
- PowerShell 5.1+ (PowerShell 7+ recommended)
- Windows Terminal (recommended; Zellij-only setups also supported)
- Claude Code CLI installed (`claude --version` works)
- Optional: Gemini CLI, Codex CLI

## Five-minute install

```powershell
cd C:\Users\you\Starlight-Intelligence-System\cockpit
pwsh ./scripts/install.ps1
```

Reload your shell:

```powershell
. $PROFILE
```

Verify:

```powershell
arc doctor
```

You should see all-PASS or PASS-with-WARN. Common WARN: "manifest has recent activity" — empty until you start your first Claude tab.

## Your first cockpit

1. Open a new Windows Terminal tab.
2. `cd` into a project: `cd C:\Users\you\Starlight-Intelligence-System`
3. Run `claude`. The SessionStart hook fires silently and writes a row to `~/.starlight/cockpit/sessions.jsonl`.
4. Open more tabs in different projects, repeat.
5. `arc status` — see all alive sessions:

   ```
   Agent  Project  Age  PID    SessionId  Cwd
   -----  -------  ---  ----   ---------  ---
   claude sis      3m   45120  abc-12...  C:\Users\you\Starlight-Intelligence-System
   claude arcanea  5m   45200  def-34...  C:\Users\you\Arcanea
   ```

6. `arc snapshot` — capture current state to `last-snapshot.json`. (You can skip this step manually; the periodic Task Scheduler job runs it every 5 min.)

## Reboot, then rehydrate

After Windows comes back up:

```powershell
arc rehydrate
```

A new Windows Terminal window opens with the same tab grid, each pane running the right `claude --resume <id>`. Done.

If WT is already open, rehydrate refuses by default to avoid duplicate tabs. Override:

```powershell
arc rehydrate -Mode merge   # add tabs to existing window
```

## Dry-run before rehydrating

If you want to see what `arc rehydrate` would do without spawning anything:

```powershell
arc rehydrate -DryRun
```

Output is the literal `wt.exe new-tab -d ... ; new-tab -d ...` command line.

## Gemini sessions

Gemini CLI doesn't auto-persist chats. Use the `gem` wrapper (loaded by default):

```powershell
gem
# [cockpit] Gemini session tag: cockpit-myproject-a1b2c3d4
# [cockpit] To resume prior chat: /chat resume cockpit-myproject-a1b2c3d4
# [cockpit] To save before exit:  /chat save cockpit-myproject-a1b2c3d4
```

The wrapper records the session in the manifest. The user still runs `/chat save <tag>` and `/chat resume <tag>` inside Gemini — that's a Gemini limitation, not cockpit's.

## Uninstall

```powershell
arc uninstall                    # remove hooks + tasks; keep data
arc uninstall -PurgeData         # also wipe ~/.starlight/cockpit/
```

## Troubleshooting

```powershell
arc doctor
```

Each FAIL has a `-> hint`. Common ones:

- **"Claude SessionStart hook registered" → FAIL**: re-run `arc install`. The installer is idempotent.
- **"Periodic snapshot task registered" → FAIL**: install ran with `-SkipScheduler`. Re-run install.
- **"manifest has recent activity" → WARN**: open a Claude tab and re-run.

Hook failures (which should never happen, but):

```powershell
Get-Content ~/.starlight/cockpit/hook-errors.log -Tail 20
```

## What gets persisted vs not

**Persisted:** workspace structure (windows, tabs, panes, cwd, agent type, session ID).

**Not persisted:** transcript content, prompts, tool outputs, secrets, file contents.

Agent transcripts are stored by the agent itself (e.g. Claude Code keeps full JSONL transcripts at `~/.claude/projects/<encoded-cwd>/`). Cockpit's job is to know **which transcript belongs to which tab**, not to copy the transcript.
