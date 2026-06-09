# Handover - Autonomous Cockpit Build Pass

**Date:** 2026-04-29 (afternoon push, autonomous)
**Operator:** Cockpit Autonomous Architect (Lyssandria + Draconis + Ino braid)
**Trigger:** Frank: "do it all take massive action 1+2+3" -> "go autonomous, build excellence"
**Tier:** Operational. No substrate edit. No `/luminor-board` pre-pass required.

---

## Headline

**Three surfaces live. One mind. Auto-starts on logon. 341 tests passing.**

If you came back from being on the go, you should be able to:
1. Open `http://127.0.0.1:7777/?persona=jarvis` and talk to JARVIS
2. Open `http://127.0.0.1:3007` to see the workstation, including `/brain` (3D viz)
3. Both surfaces speak through the same cognition layer
4. After every Windows logon, all three come up automatically (no manual launch)

---

## What's running RIGHT NOW (verified)

```
[LIVE] :7373  voice-operator FastAPI         http://127.0.0.1:7373/healthz       {"status":"ok"}
[LIVE] :7777  arcanea-voice (JARVIS orb)     http://127.0.0.1:7777/?persona=jarvis  COGNITION_BRIDGE_URL set
[LIVE] :3007  LCC dashboard                  http://127.0.0.1:3007                  /brain route 200 OK
```

`pwsh C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1 -Status` reproduces the above any time.

---

## What was shipped this autonomous pass

### 1. Mic error UX in the orb (the bug Frank reported)

`Arcanea/packages/arcanea-voice/web/client.mjs::startRecording`

Replaced the swallowed generic "Mic unavailable" with:
- Pre-flight checks: secure context, MediaDevices API, MediaRecorder support
- Specific error mapping for every DOMException name from `getUserMedia`:
  - `NotAllowedError` -> exact Windows path: Settings -> Privacy & security -> Microphone -> "Let apps access your microphone" AND "Let desktop apps access your microphone"
  - `NotFoundError` -> "no microphone detected"
  - `NotReadableError` -> "mic busy in another app"
  - `OverconstrainedError`, `SecurityError`, `AbortError` -> targeted hints
  - default -> show the actual exception name + message

When Frank reloads the orb (Ctrl+Shift+R to bust the cache) and clicks Speak, he'll see the actual problem instead of a generic message.

### 2. Bridge: arcanea-voice -> Starlight CognitionRouter (one mind, both bodies)

`Arcanea/packages/arcanea-voice/src/server.mjs`:
- New function `routeViaCognitionBridge(userText)` POSTs to `process.env.COGNITION_BRIDGE_URL` (default we use: `http://127.0.0.1:7373/api/utterance`) and returns the runLlmLoop-shaped object.
- `runLlmLoop` calls the bridge first; if it returns non-null, that's the reply (skips the local Groq+tools loop). If null (bridge down or env unset), falls through to the existing Groq+tools loop -> orb never goes silent on a bridge outage.
- Verified end-to-end: orb capture utterance -> CognitionRouter -> vault write at `memory/voice-sessions/2026-04-29.md`. Live LLM query "What did I capture today?" returned a clean summary citing both my session captures.

### 3. Persistent cockpit (boot-survives-restart)

`private/local-command-center/scripts/`:
- `start-cockpit.ps1` - idempotent launcher. Detects which surfaces are already running, starts the missing ones, redirects per-service stdout/stderr to `~/.starlight/logs/cockpit-{port}.log`. Modes:
  - default: start whatever isn't running
  - `-Status`: just print health (no side effects)
  - `-Force`: kill everything and restart fresh
- `register-cockpit-task.ps1` - registers a Windows Task Scheduler entry "StarlightCockpit" that runs `start-cockpit.ps1` at every user logon.
- **Already registered** (`Get-ScheduledTask StarlightCockpit` confirms). On every reboot, the cockpit comes back automatically. Frank does nothing.

To run it now without rebooting: `Start-ScheduledTask -TaskName StarlightCockpit`.
To remove: `Unregister-ScheduledTask -TaskName StarlightCockpit -Confirm:$false`.

Logs at `C:\Users\frank\.starlight\logs\cockpit-launcher.log` show every start.

### 4. Tab 1 + Tab 2 status check (bonus discovery)

- **Tab 1 (browser autonomy)**: `service/_browser_session.py` + `service/dispatch_browser.py` shipped while I was working. Source + tests both green.
- **Tab 2 (brain graph viz)**: `service/brain_graph.py` + `service/brain_watchdog.py` shipped. Dashboard `/brain` route + 5 Three.js components (`BrainScene`, `BrainParticles`, `BrainEdges`, `BrainHud`, `BrainOverlays`) all in place. `/brain` returns 200 OK.

Net: **341 tests passing** (was 295 at start of autonomous pass, +46 from Tabs 1+2 landing during this session).

---

## How activation works (your "two claps or how" question)

**Two completely separate wake mechanisms.** You have both.

### Mechanism A - Spoken to the orb (Space key)

- Open `http://127.0.0.1:7777/?persona=jarvis` (or `lumina`, `draconia`, `lyria`, `alera`, `shinkami`, `nero`)
- Press **Space** -> orb starts listening (auto-stops on silence)
- Press **Esc** to interrupt
- Press **1-7** to switch persona live

This is the everyday flow. Browser tab needs to be open and focused.

### Mechanism B - Two claps anywhere on your machine

This activates a sidecar Node daemon (separate process) that listens to your default mic via FFmpeg amplitude detection. **Two claps within 150-650ms** -> daemon opens your browser to the JARVIS room automatically. 60-second cooldown prevents accidental refires.

**Not auto-starting yet** - to enable it, in a terminal:

```powershell
cd C:\Users\frank\Arcanea\packages\arcanea-voice
$env:COGNITION_BRIDGE_URL="http://127.0.0.1:7373/api/utterance"
node bin/voice-daemon.mjs --persona jarvis
```

To make this auto-start on logon too, edit `start-cockpit.ps1` and add a 4th `Start-DetachedProcess` block invoking `voice-daemon.mjs` (left out for now to keep the autonomous push from broadening scope without sign-off).

### Mechanism C - "Starlight" spoken wake-word (NOT live yet)

Voice-Operator's `pipeline.py` is migrated to CognitionRouter (Tab 3 work). What's missing:
- `pip install sounddevice pvporcupine faster-whisper elevenlabs` (Python audio stack)
- Picovoice account at console.picovoice.ai -> train custom keyword "Starlight" -> drop the `.ppn` at `private/voice-operator/models/porcupine/Starlight.ppn`
- Set `PICOVOICE_ACCESS_KEY` in Windows User env (you already have OPENROUTER, GROQ, ELEVENLABS in there)

Once those three are done, `python -m service.main voice` runs the always-listening pipeline. Estimate: ~3-5 hrs (Picovoice training is the slow part).

---

## End-to-end flow that just got verified live

```
You speak in the orb
    -> Groq Whisper STT (because GROQ_API_KEY is in your User env)
    -> arcanea-voice's runLlmLoop calls routeViaCognitionBridge(text)
    -> POST http://127.0.0.1:7373/api/utterance
    -> voice-operator's TextSession.turn(text)
    -> CognitionRouter.route(text)
       - Tier 0 deterministic? -> capture writes to memory/voice-sessions/{today}.md, return spoken_update
       - else -> primary backend (OpenRouter Sonnet) -> packet/spoken_update
    -> bridge returns to orb as { reply, toolsUsed: [], toolResults: [], rounds: 1 }
    -> ElevenLabs synthesizes audio
    -> orb plays audio + animates
```

This is "one mind, four bodies":
- Body 1: typed via `python -m service.main chat --once "..."`
- Body 2: orb (browser, Space key, with COGNITION_BRIDGE_URL)
- Body 3: phone (Phase 5, future Vercel + Tailscale)
- Body 4: voice-operator with Starlight wake-word (when audio deps + .ppn done)

---

## Files touched (autonomous pass)

### New
```
private/local-command-center/scripts/start-cockpit.ps1
private/local-command-center/scripts/register-cockpit-task.ps1
docs/ops/HANDOVER-AUTONOMOUS-COCKPIT-LIVE-2026-04-29.md   (this doc)
```

### Edited
```
Arcanea/packages/arcanea-voice/web/client.mjs   (mic error UX)
Arcanea/packages/arcanea-voice/src/server.mjs   (bridge function + runLlmLoop wiring)
```

### Other state
```
Windows Task Scheduler: 'StarlightCockpit' task registered (logon trigger)
~/.starlight/logs/                              (created, per-service logs land here)
```

---

## Known issues / next moves

### Mic permission flow (your reported bug)

- **Likely root cause** based on Windows 11 defaults: "Let desktop apps access your microphone" is OFF in Settings -> Privacy & security -> Microphone. Most browsers run as desktop apps for permission scoping, so this gate blocks even when you've allowed mic in Chrome's site settings.
- **Confirm via the new error message**: Ctrl+Shift+R the orb (`http://127.0.0.1:7777/?persona=jarvis`), click Speak, read the error. If it says "Mic permission denied... Settings -> Privacy & security..." -> that's the diagnosis. Open that Windows panel, flip the switches, refresh the orb.
- **If it says "Mic is busy in another app"** -> close Discord/Teams/OBS/another browser tab.
- **If it says "No microphone detected"** -> System -> Sound -> Input.

### Auto-start clap daemon

Not yet wired into start-cockpit.ps1. One short edit away. Won't add without your sign-off because clap detection runs continuously on the mic and may collide with other audio software.

### Picovoice "Starlight" wake-word

The 3-5 hour task. Code path is fully ready (Tab 3 migration). What's blocking is install + training. Recommend doing this in a single focused sitting after you've confirmed the orb flow is rock-solid.

### Phone surface

Phase 5 in the cockpit vision doc. Not started this pass; next push.

---

## How to operate the cockpit

```powershell
# Status check (no side effects)
pwsh C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1 -Status

# Bring up anything that's down (idempotent)
pwsh C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1

# Force-restart everything (kill + start fresh)
pwsh C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1 -Force

# Trigger the scheduled task right now
Start-ScheduledTask -TaskName StarlightCockpit

# Tail launcher log
Get-Content -Wait "$env:USERPROFILE\.starlight\logs\cockpit-launcher.log"

# Tail per-service logs
Get-Content -Wait "$env:USERPROFILE\.starlight\logs\cockpit-7373.log"   # voice-operator FastAPI
Get-Content -Wait "$env:USERPROFILE\.starlight\logs\cockpit-7777.log"   # JARVIS orb
Get-Content -Wait "$env:USERPROFILE\.starlight\logs\cockpit-3007.log"   # dashboard
```

---

## Test ledger after this pass

```
voice-operator/tests/  ->  341 passing  (was 295 at start of autonomous pass)
arcanea-voice          ->  no test suite touched this pass
LCC dashboard          ->  no test suite touched this pass
```

The +46 since Tab 3's earlier pass came from Tab 1's source + tests + Tab 2's source + tests landing while this autonomous pass was happening.

---

## What I deliberately did NOT do

- Did not auto-install Python audio deps (multi-GB faster-whisper / pvporcupine pull; you should choose when to land that)
- Did not auto-start the clap daemon (interaction with other audio apps; needs your call)
- Did not commit anything to git (`private/` is gitignored anyway)
- Did not edit any substrate file (operational tier; no `/luminor-board` needed)
- Did not modify Tab 1 or Tab 2's work (they were progressing in parallel; isolation respected)

---

*Built on SIP. Operational tier. No substrate edit.*
