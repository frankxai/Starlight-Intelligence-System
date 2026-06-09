# Handover — 2026-04-29 (Jarvis cockpit live)

> Cold-start briefing. Reader has zero context from the prior conversation.
> Folds in two prior session docs (untracked, in this same folder):
> `HANDOVER-COGNITION-CLI-COMPLETE-2026-04-29.md` and
> `HANDOVER-AUTONOMOUS-COCKPIT-LIVE-2026-04-29.md`.

## Situation

**Project:** Starlight Intelligence System (SIS) at `C:\Users\frank\Starlight-Intelligence-System`. Two-layer repo: SIP substrate (public) + private operational instance (`private/` is gitignored).

**Goal of this session (started as Tab 3 of a 3-tab parallel push):** Complete the cognition layer's CLI backend matrix (codex/gemini/opencode mirroring claude-code-cli) and migrate the voice-mode pipeline from legacy AgentClient to the unified CognitionRouter. Then user pivoted to "build the full Jarvis-grade voice cockpit, lead autonomous, build excellence."

**State at end of session:** Three local surfaces live and auto-start on Windows logon. Cognition router is unified across text-mode and voice-mode. JARVIS orb speaks (text-input mode; mic blocked by Windows permission). Speed-tuned (3x faster than initial Sonnet+Turbo build). 341 tests passing in voice-operator. Nothing shipped to git for the operational layer because `private/` is gitignored.

---

## What's Done

### Tab 3 cognition CLI completion + voice pipeline migration

In `private/voice-operator/` (gitignored):
- `service/cognition/backends/codex_cli.py` — `codex --json` via stdin (NEW)
- `service/cognition/backends/gemini_cli.py` — `gemini --output-format json -p <prompt>` (NEW)
- `service/cognition/backends/opencode_cli.py` — `opencode --no-tui --prompt` (NEW)
- `service/cognition/_json.py::extract_first_json_object` — robust JSON extractor handling markdown fences + trailing prose using `json.JSONDecoder.raw_decode` (NEW). Wired into all 4 cognition backends.
- `service/cognition/router.py` — `build_router_from_env` extended with `enable_codex_cli` / `enable_gemini_cli` / `enable_opencode_cli` flags + `primary_backend_override` param (auto-enables matching CLI). Halt resolution now validates explicit `halt_backend_name` against registered backends and falls back to a candidate walk if invalid (`anthropic-direct` → `claude-code-cli` → `openrouter`). The 3 new CLIs are excluded from automatic halt selection.
- `service/config.py` — 4 new fields: `enable_codex_cli`, `enable_gemini_cli`, `enable_opencode_cli`, `cognition_primary_backend`. `load()` precondition relaxed: zero-API-key path is valid when `COGNITION_PRIMARY_BACKEND` names a CLI backend.
- `service/text_mode.py` — passes the new flags through to `build_router_from_env`.
- `service/pipeline.py` — **migrated**. `PipelineComponents.agent: AgentClient` → `cognition: CognitionRouter`. `run_one_turn` uses `components.cognition.route(text, history=[])`, handles `direct_action` capture path. `from .agent_client import AgentClient` removed. Voice-mode precondition error rewritten to list all valid configurations.
- `service/doctor.py` — new `cognition keys` accepts the CLI-primary path; new `COGNITION_PRIMARY_BACKEND=<x>` check validates the matching CLI is on PATH.
- Pre-existing `tests/test_smoke_e2e.py` fixture fixed (`monkeypatch.delenv` was overridden by `load_dotenv`; switched to empty-string env override).
- New tests: `test_cognition_codex_cli.py` (6) · `test_cognition_gemini_cli.py` (6) · `test_cognition_opencode_cli.py` (6) · `test_cognition_router.py` +6 · `test_pipeline_voice.py` (2) · `test_doctor.py` +2 · `test_cognition_json_utils.py` (11). Total Tab 3 contribution: +39 tests.
- Tab 1 + Tab 2 shipped their work in parallel: `_browser_session.py` + `dispatch_browser.py` + `brain_graph.py` + `brain_watchdog.py` + 5 dashboard Three.js components + `/brain` route + `/api/brain` endpoint. **341 tests passing** (was 245 baseline, +39 mine, +57 from tabs 1+2).

### Live Jarvis cockpit (autonomous push)

Three surfaces running at end of session, auto-start on Windows logon:

| Surface | URL | Tech |
|---|---|---|
| voice-operator FastAPI | `http://127.0.0.1:7373/healthz` → `{"status":"ok"}` | Python · FastAPI · uvicorn · CognitionRouter live |
| arcanea-voice JARVIS orb | `http://127.0.0.1:7777/?persona=jarvis` | Node · Three.js orb · Groq Whisper STT · ElevenLabs Flash v2.5 TTS · `COGNITION_BRIDGE_URL` set |
| LCC dashboard | `http://127.0.0.1:3007` (and `/brain`) | Next.js 16 · React 19 · React Three Fiber · proxies to FastAPI |

In `private/local-command-center/scripts/`:
- `start-cockpit.ps1` — idempotent launcher (starts what isn't running). Modes: default / `-Status` / `-Force`. Per-service stdout/stderr to `~/.starlight/logs/cockpit-{port}.log`. Uses `Start-Process` with `RedirectStandardOutput` (PowerShell 5.1-compatible). UTF-8 with BOM (PowerShell decodes em-dashes correctly).
- `register-cockpit-task.ps1` — Windows Task Scheduler entry "StarlightCockpit" registered (Limited / Interactive logon trigger). **Already registered** (`Get-ScheduledTask StarlightCockpit` returns Ready).

In `Arcanea/packages/arcanea-voice/` (separate repo, gitignored from SIS):
- `src/server.mjs::routeViaCognitionBridge(userText)` — POSTs to `process.env.COGNITION_BRIDGE_URL` (currently `http://127.0.0.1:7373/api/utterance`), returns runLlmLoop-shaped object on success, null on failure (orb falls back to local Groq+tools loop). Wired into `runLlmLoop` first-line check.
- `src/server.mjs::handleText` — new `POST /api/text` endpoint. Skips Whisper STT, runs same downstream path (cognition bridge → ElevenLabs TTS). Returns audio + `x-voice-*` headers like `/api/converse`. Lets the orb work without mic.
- `web/index.html` — new text-input form (hidden until activated)
- `web/client.mjs::startRecording` — pre-flight checks (secure context / MediaDevices API / MediaRecorder support) + DOMException-name mapping (`NotAllowedError`, `NotFoundError`, `NotReadableError`, `OverconstrainedError`, `SecurityError`, `AbortError`) so mic failures surface actionable Windows-specific guidance instead of generic "Mic unavailable". Press **T** to open text input. Form submit calls `sendText()` → `/api/text` → plays returned audio via existing `playResponse()`.
- `web/style.css` — frosted glass styling for text input bar (bottom 7vh, 560px wide, accent ring on focus)

### Speed tuning (3x end-to-end)

In `private/voice-operator/.env`:
- `OPENROUTER_MODEL=meta-llama/llama-4-scout` (was `anthropic/claude-sonnet-4-6`) — Groq auto-routed
- `OPENROUTER_PROVIDER=` (empty — Cerebras pinning returned 404 for Frank's account; auto-route lands on Groq Llama-4-scout-17b-16e-instruct, ~1.8s for short replies)

In `start-cockpit.ps1`:
- `ARCANEA_VOICE_ELEVEN_MODEL=eleven_flash_v2_5` (was `eleven_turbo_v2_5`) — first-byte ~75ms vs 250-500ms

**Verified live (after speed swap):**

| Test | LLM | TTS | Wall-clock |
|---|---|---|---|
| 8-word reply ("Hello, how are you today I am ready") | 1.79s (was 8.6s) | 4.79s (was 13.4s) | 6.87s (was 22s+) |
| 12-word reply ("Confirmed, speed profile is active for you now.") | 2.94s | 5.94s | 9.5s |

### Handovers in `docs/ops/` from this session (untracked)

- `HANDOVER-COGNITION-CLI-COMPLETE-2026-04-29.md` — Tab 3 cognition + pipeline migration full record
- `HANDOVER-AUTONOMOUS-COCKPIT-LIVE-2026-04-29.md` — mic UX + bridge + persistent cockpit autonomous push

---

## What's Not Done

### Mic permission (BLOCKED on user)

Frank reports the orb says "Mic unavailable" even after granting permission. Likely cause: Windows 11 desktop-app mic privacy gate. The new error UX in `client.mjs` will show the exact `DOMException` name on next click — instructions are baked into the error message. **Action by user:** hard-refresh orb, click Speak, follow the displayed instruction. Most likely fix: Settings → Privacy & security → Microphone → "Let desktop apps access your microphone" → ON.

### Streaming TTS (THE big UX unlock — DEFERRED)

Current TTS path waits for the full audio file before playback (~6s for 12 words). ElevenLabs is already streaming the response server-to-server (uses `/stream` endpoint), but the orb client buffers via `await r.blob()` before creating the object URL. Implementing MediaSource API on the client side gets first sound to ~250-300ms regardless of reply length — the difference between "Jarvis-grade" and "wait-for-it".

Estimated 2-3 hours focused work. Deferred because it touches audio playback (Chrome MediaSource MP3 quirks) and the user was on the go. Should be done with user watching, not autonomously.

### Picovoice "Starlight" wake-word (NOT live)

`pipeline.py` is migrated; cognition is ready. What blocks live voice mode (other than mic permission):
1. `pip install sounddevice pvporcupine faster-whisper elevenlabs` (Python audio stack — multi-GB pull because of faster-whisper)
2. Picovoice account at console.picovoice.ai → train custom keyword "Starlight" → drop `.ppn` at `private/voice-operator/models/porcupine/Starlight.ppn`
3. Set `PICOVOICE_ACCESS_KEY` in Windows User env (Frank already has OPENROUTER, GROQ, ELEVENLABS in there)

Estimate 3-5 hrs (Picovoice training is the slow part).

### NVIDIA Parakeet STT (DEFERRED)

User asked about NVIDIA voice options. `fal-ai/parakeet-tdt` (top of OpenASR leaderboard) is the realistic drop-in for Groq Whisper. ~30 min wire-in via `arcanea-voice/src/transcribe.mjs`. Deferred until streaming TTS lands and mic works.

### Phone surface (Phase 5 — NOT STARTED)

Same Next.js dashboard, Vercel-deployed, Tailscale-tunnel, push for Tier B/C approvals. ~1 week per cockpit vision doc.

### Brain graph data freshness

`brain_graph.py` regenerates the cache from `memory/knowledge-graph/index.jsonl`. The brain-watchdog is **not part of `start-cockpit.ps1`**, so the cache only updates when the user explicitly hits POST `/api/brain`. Wiring brain-watchdog as a 4th auto-start daemon is a 30-min job.

---

## Critical Context (gotchas)

### `private/voice-operator/` and `private/local-command-center/` are gitignored

- The 39 tests + 9 source files I added are all in gitignored paths. **`git status` doesn't show them.** Don't be confused that the working tree looks empty for cognition work.
- Cross-tab parallelism via `git worktree` does NOT isolate `private/` — all three Tab worktrees share the same physical `private/voice-operator/`. We've operated against it without conflict so far, but coordinate before any mass refactor.
- The handovers in `docs/ops/HANDOVER-*-2026-04-29.md` ARE in-tree but uncommitted at session end.

### `start-cockpit.ps1` quirks

- Saved as **UTF-8 with BOM** — without the BOM, PowerShell 5.1 misreads em-dashes as broken ASCII and string-terminator parsing fails. If you edit, preserve the BOM (open with VS Code "UTF-8 with BOM" or use the Python script in the prior handover).
- Uses `Start-Process` with file redirection (NOT `[Process]::Start` with `ArgumentList`) because `ArgumentList` on `ProcessStartInfo` is .NET-Core only.
- The `-Force` mode kills + restarts everything but doesn't restart the dashboard cleanly on Windows because `npm` is a `.cmd` shim. Plain re-invocation works fine; `npm run dev` from the dashboard dir works.

### `COGNITION_BRIDGE_URL` env

- Set to `http://127.0.0.1:7373/api/utterance` in `start-cockpit.ps1`'s `EnvVars` hashtable for the orb process.
- Without it, arcanea-voice falls back to its local Groq+tools loop (different brain). With it, every orb turn flows through the SIS CognitionRouter — captures land in `memory/voice-sessions/`, packets go through the gate, halts route to Luminor Board.

### OpenRouter model slugs are unstable

- `meta-llama/llama-4-scout-17b-16e-instruct` (the slug in `cognition.toml` comment) returns 404. The current valid slug is `meta-llama/llama-4-scout`. Don't trust slug examples in older docs — query `https://openrouter.ai/api/v1/models` for current truth.
- `OPENROUTER_PROVIDER=Cerebras` returned 404 because Cerebras doesn't host that model on Frank's account. Empty provider + auto-route lands on Groq, which is also fast (250+ tok/s) and was the goal anyway.

### `cognition.toml` halt default points at `anthropic-direct`

- If `ANTHROPIC_API_KEY` isn't set, halt was a dead pointer (silent no-op). Router now logs a warning and falls through `_HALT_CANDIDATES = ("anthropic-direct", "claude-code-cli", "openrouter")` — the 3 new CLI backends are deliberately excluded from auto-halt selection (different model families lack Sonnet's refusal posture).

### Ports in use

```
:7373  voice-operator FastAPI (cognition + memory backend)
:7777  arcanea-voice (JARVIS orb)
:3007  LCC dashboard (Next.js)
:7000  reserved for orchestrator coordinator (not in use this session)
```

---

## Next Actions (ordered)

1. **User flips Windows 11 mic permission** — Settings → Privacy & security → Microphone → "Let desktop apps access your microphone" → ON. Hard-refresh `http://127.0.0.1:7777/?persona=jarvis` (Ctrl+Shift+R). Click Speak. New error UX will display the exact problem if it persists.
2. **Ship streaming TTS via MediaSource API on the orb client** (~2-3 hrs focused). The single biggest UX unlock — 6s wait → 300ms perceived first-sound. Scope: modify `client.mjs::handleRecordedBlob` and the new `sendText` to consume `r.body.getReader()` chunks and `appendBuffer` to a MediaSource, instead of `await r.blob()` then `URL.createObjectURL`. Keep the current path as fallback.
3. **Wire `service.brain_watchdog` as 4th daemon in `start-cockpit.ps1`** (~30 min). Brain graph stays fresh as captures arrive.
4. **Wire NVIDIA Parakeet via fal.ai as STT in `arcanea-voice/src/transcribe.mjs`** (~30 min). Drop-in for Groq Whisper; better accuracy + similar latency. Optional — only worthwhile after streaming TTS lands.
5. **Picovoice "Starlight" wake-word** (3-5 hrs). Audio deps install + console.picovoice.ai keyword training + `.ppn` file. Unlocks the "always listening" mode.
6. **Commit the handovers + scripts** to git (this skill's step 5 already does the commit for THIS handover). The two prior handovers + the cockpit scripts are in-tree and should be committed in a separate commit if not already.
7. **Phone surface scaffold (Phase 5)** — same Next.js, Vercel + Tailscale. ~1 week.
8. **Memory entry update** — append a one-liner to `MEMORY.md` for v7.5.3-jarvis-live (user discretion). Suggested:
   > `- [v7.5.3 Jarvis cockpit live](project_v753_jarvis_live.md) — 2026-04-29 autonomous push. 3 surfaces auto-start at logon (StarlightCockpit task). arcanea-voice ↔ CognitionRouter bridge live. Text-input fallback in orb. Speed: Llama-4-scout via Groq + ElevenLabs Flash = 3x. 341 tests passing. Streaming TTS deferred.`

---

## Files to Read First

- `docs/ops/HANDOVER-COGNITION-CLI-COMPLETE-2026-04-29.md` — full Tab 3 ship record + acceptance evidence
- `docs/ops/HANDOVER-AUTONOMOUS-COCKPIT-LIVE-2026-04-29.md` — autonomous cockpit assembly + mic UX details
- `private/local-command-center/scripts/start-cockpit.ps1` — the launcher; understand it before editing (BOM caveat)
- `private/voice-operator/service/cognition/router.py` — `build_router_from_env` is the contract everything else builds on
- `private/voice-operator/service/pipeline.py` — voice mode now mirrors text-mode's CognitionRouter usage
- `Arcanea/packages/arcanea-voice/src/server.mjs` — `routeViaCognitionBridge` (lines ~105) and `handleText` (after line ~430) are the orb-side bridge
- `private/voice-operator/.env` — has the speed-profile model selection; do NOT commit (gitignored)
- `docs/strategy/COCKPIT-VISION-v753-2026-04-28.md` — the strategic frame; phases 5-6 are the next horizons
- `MEMORY.md` (top-level + auto-memory) — Frank's role + project context (gitignored auto-memory at `~/.claude/projects/.../memory/MEMORY.md`)

---

## Repo Map

| Path | Purpose | State |
|---|---|---|
| `C:\Users\frank\Starlight-Intelligence-System` | Main SIS repo (substrate + reference operational layer) | branch `main`, ahead of `origin/main` by 9 (10 after this commit) |
| `C:\Users\frank\Starlight-Intelligence-System\private\voice-operator` | Operational voice cockpit + cognition layer | gitignored; 341 tests; FastAPI :7373 running |
| `C:\Users\frank\Starlight-Intelligence-System\private\local-command-center` | Persistent cockpit launcher + dashboard scaffold | gitignored except scripts/ which are NOT (they live here as in-tree code) |
| `C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\apps\dashboard` | Next.js 16 / React 19 dashboard at :3007 | running; `/brain` 3D viz live |
| `C:\Users\frank\Arcanea\packages\arcanea-voice` | Separate repo: Node JARVIS orb + double-clap daemon | running at :7777; bridge env set; text-input mode shipped |
| `C:\Users\frank\jarvis-1-browser` | Worktree for browser-bridge feature | source landed in private/, no in-tree commits |
| `C:\Users\frank\jarvis-2-brain` | Worktree for brain-viz feature | committed `ee7b074` to `feature/brain-viz` (Next 16 upgrade docs) + private/ source |
| `C:\Users\frank\jarvis-3-cognition` | Worktree for cognition-cli-complete | private/ work doesn't propagate; this session's code lives in main repo's private/ |

Memory entries from `~/.claude/projects/C--Users-frank-Starlight-Intelligence-System/memory/MEMORY.md` directly relevant to next agent's work:
- **`project_v753_cognition_lcc.md`** — cognition refactor + LCC v7.5.3 ship; this handover extends it
- **`project_voice_operator_v1.md` + `project_voice_operator_v1_round3.md`** — voice operator scaffold + round-3 expansion (244 tests baseline before Tab 3)
- **`project_agentdb_singleton_constraint.md`** — important architectural constraint: AgentDB-per-tab breaks at ~10 tabs, all memory must front through singleton daemon (relevant when adding Memory Bus / multi-process state)
- **`feedback_privacy_split.md`** — public substrate vs private/ for instance state (why my work isn't in git)
- **`feedback_parallel_agent_pattern.md`** — the 3-tab pattern this session followed

---

*Built on SIP. Operational tier. No substrate edit.*
