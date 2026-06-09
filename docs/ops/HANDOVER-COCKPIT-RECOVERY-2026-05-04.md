# Handover — Cockpit Recovery (2026-05-04)

**Status:** ALL GREEN — cockpit healthy, scheduled task viable on next logon.
**Operator:** Claude Opus 4.7 (1M)
**Trigger:** Laptop rebuild overnight; `StarlightCockpit` Windows Task ran 14:55:22 today and failed with `-2147024894` (`0x80070002 ERROR_FILE_NOT_FOUND`). Daily-ops surface dark.

---

## Diagnosis (root cause)

**`pwsh.exe` (PowerShell 7) was missing from the rebuilt machine.**

The scheduled task definition (verified via `schtasks /Query /TN "StarlightCockpit" /FO LIST /V`) invokes:

```
pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1"
```

On the rebuilt machine, only `powershell.exe` (Windows PowerShell 5.1) was present. `pwsh.exe` was nowhere on PATH and not at the canonical `C:\Program Files\PowerShell\7\pwsh.exe`. Task Scheduler's `0x80070002` is the OS reporting "the binary you asked me to launch does not exist" — it never reached the script, which is why no `cockpit-launcher.log` lines were written for today's logon attempt.

The script itself, the working dirs, Python 3.13, Node 20, and npm were all intact from the rebuild. The single bottleneck was the missing PS7 runtime.

## Fix applied

1. Installed PowerShell 7.6.1 via winget (Microsoft Store package):
   - `winget install --id Microsoft.PowerShell --source winget --silent --accept-package-agreements --accept-source-agreements`
   - Resolved to: `C:\Users\frank\AppData\Local\Microsoft\WindowsApps\pwsh.exe` (Store app-execution-alias, on default user PATH so Task Scheduler will resolve `pwsh.exe` cleanly).
   - Confirmed `& pwsh.exe -NoProfile -Command ...` returns `7.6.1`.

2. No edits to source files. No new directories. No API keys touched. No git operations.

3. Manually invoked the launcher to validate end-to-end:
   - `pwsh.exe -NoProfile -ExecutionPolicy Bypass -File C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1`

Files touched: **none in repo** (only system-level `pwsh.exe` install).
Files read for diagnosis (no edits):
- `C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1`
- `C:\Users\frank\Arcanea\packages\arcanea-voice\package.json`
- `C:\Users\frank\.starlight\logs\cockpit-launcher.log` (last entry was 2026-04-30 12:18:02 — confirms today's logon never reached the script)

## Verification (16:32–16:33 local + 25s stability re-check)

Launcher output confirmed all four surfaces came up in dependency order:

| Surface | Port | TCP | HTTP probe | Notes |
| --- | --- | --- | --- | --- |
| voice-operator FastAPI | 7373 | TcpTestSucceeded=True | `GET /healthz` -> **200** | `Wait-Ready` confirmed in 1s |
| arcanea-voice (JARVIS orb) | 7777 | TcpTestSucceeded=True | `GET /?persona=jarvis` -> **200** | started ~1s after :7373 |
| LCC dashboard | 3007 | TcpTestSucceeded=True | `GET /` -> **200** | took ~6s (Next.js cold) |
| brain-watchdog daemon | (none) | n/a | n/a | pid=6148, `Win32_Process` matched `service.brain_watchdog` |

After 25s stability re-check: all three ports still listening, brain-watchdog still pid=6148.

`*.log.err` review:
- `cockpit-7777.log.err` — empty.
- `cockpit-brain.log.err` — empty.
- `cockpit-7373.log.err` — uvicorn startup banner only + benign warning `halt_backend_name 'anthropic-direct' not in registered backends ['openrouter'] — falling back to candidate walk` (cognition router fallback path; pre-existing, not caused by recovery).
- `cockpit-3007.log.err` — Next.js advisory warnings only:
  - `experimental.typedRoutes has been moved to typedRoutes` (config nit; doesn't break dev server).
  - Multiple-lockfile warning (selected `C:\Users\frank\pnpm-lock.yaml` as workspace root). Pre-existing tree state.

No actual errors emitted in first 30 seconds.

## BOM check on `start-cockpit.ps1`

```
first 3 bytes: ef bb bf
BOM: PRESENT (UTF-8 BOM preserved)
```

UTF-8 BOM intact per the v7.5.3 invariant in MEMORY.

## Left for Frank

**Nothing blocking.** The cockpit is live and the scheduled task will succeed on next logon now that `pwsh.exe` is installed. Action items, in order of relevance:

1. **`~/.starlight/.env` is absent.** All four surfaces still came up cleanly without it (voice-operator has its own colocated `private\voice-operator\.env` which loads on import). If the orb's full Groq+ElevenLabs pipeline depends on env vars sourced from `~/.starlight/.env` (per "v7.5.3 Jarvis cockpit live" memory line referencing Picovoice .ppn + Brian voice + temp 0.5), Frank should reapply API keys when ready. Recovery did **not** inject any keys.

2. **PS7 came in via the Microsoft Store / app-execution-alias.** That's how winget delivers PowerShell on Windows 11 by default. It works for Task Scheduler (the alias is on user PATH), but it is *not* the `C:\Program Files\PowerShell\7\` MSI install. If Frank prefers the system MSI for stability under SYSTEM-account scheduled tasks, swap with: `winget install --id Microsoft.PowerShell --source winget --scope machine`. Current Store-alias install is sufficient for the existing task (logon trigger, Run As `frank`, Interactive only).

3. **`Arcanea\packages\arcanea-voice\node_modules` is absent.** Confirmed not a problem — the package declares `"dependencies": {}` and the orb came up green. Leave alone.

4. **Pre-existing warnings** (cognition `halt_backend_name` fallback + Next.js typedRoutes config + multi-lockfile detection) are not new and were not introduced by this recovery. They predate the rebuild.

## Recovery sequence (replayable)

```powershell
# 1. install pwsh
winget install --id Microsoft.PowerShell --source winget --silent --accept-package-agreements --accept-source-agreements

# 2. verify
pwsh.exe -NoProfile -Command '$PSVersionTable.PSVersion'

# 3. bring cockpit up
pwsh.exe -NoProfile -ExecutionPolicy Bypass -File C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1

# 4. confirm
pwsh.exe -NoProfile -ExecutionPolicy Bypass -File C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1 -Status
```

---

*Recovery complete 2026-05-04 ~16:33 local. Daily-ops surface restored.*
