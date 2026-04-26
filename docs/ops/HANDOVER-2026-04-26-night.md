# Handover — 2026-04-26 (overnight autonomous build)

> Continuation of the same-day v7.5 ship. Frank gave autonomous all-night authorization to build out the Voice Operator stack across all phases that don't require API keys or hardware.

---

## TL;DR

Phases 0.5 through 4 are **code-complete**. **59/59 tests passing.** Install scaffold is sitting in `private/voice-operator/`, gitignored per privacy framework. Frank can use **text-mode chat tonight with only an Anthropic API key** — no ElevenLabs, no Picovoice, no microphone. Everything else (full voice, phone, file watcher, dashboard) is one `install.ps1` away.

---

## What shipped tonight

| Phase | What | Status | Tests |
|------|------|--------|-------|
| 0.5  | Text-mode CLI (`voice-operator chat`) — full pipeline minus mic/STT/TTS | shipped | covered by E2E suite |
| 1    | PC voice cockpit — wake/STT/agent/gate/router/TTS/tray | code complete; needs install + keys | unit tests with mocks |
| 2    | FastAPI server + WebSocket + phone PWA + Cloudflare Tunnel doc | shipped | server smoke-loads |
| 3    | Cockpit dashboard (HTML/JS, served by service) — sidebar + per-brand panels + approvals | shipped (Tauri upgrade later) | renders against live API |
| 4    | File watcher organize daemon — 7-step storage doctrine | shipped | 11 tests |
| 5    | Ambient room mode | deferred (hardware-dependent) | n/a |

| Layer | What's tested | Coverage |
|-------|---------------|----------|
| Packet schema | 18 tests — every invariant (versioning, sentence count, target ambiguity, approval coherence, serialization) | full |
| Approval gate | 6 tests — Tier A/B/C, queue persistence, list filtering | full |
| Packet router | 9 tests — unknown / memory / shell / claude-code (+timeout) / concierge / prompt rendering | full |
| Agent client | 7 tests — system prompt loading, JSON parsing, packet construction, error paths, prompt caching | full |
| Storage doctrine | 11 tests — inventory, classify, dedupe, dry-run, execute, backup, cap | full |
| End-to-end | 8 tests — capture / build Tier A / Tier B pending / Tier C halt / unknown target / shell / schema invariants / session history | full |

**Total: 59 tests, all passing in 5 seconds.**

---

## What Frank actually does next (in order)

### Tonight (zero hardware, ~10 min)

```powershell
cd C:\Users\frank\Starlight-Intelligence-System\private\voice-operator

# 1. Install minimum deps for text mode (no audio stack)
pip install pydantic anthropic typer rich python-dotenv pyyaml fastapi "uvicorn[standard]" watchdog httpx pillow

# 2. Add Anthropic key to .env
copy .env.template .env
notepad .env   # paste ANTHROPIC_API_KEY value

# 3. Try text mode — exercises agent + packet + gate + router. No mic, no TTS.
python -m service.main chat
```

Then say things like:
- *"Capture this thought: voice operator validates tonight."*
- *"Prepare a Claude Code packet for SIS to add a comparison table to the FrankX pricing page."*
- *"What needs my approval?"* → `/pending`
- *"Edit SIP.md."* → should produce Tier C halt

If text mode behaves, the cognitive layer is real. Validation done.

### Tomorrow (full Phase 1 install, ~15 min including model download)

```powershell
# 1. Get Picovoice access key + train custom Starlight wake-word
#    https://console.picovoice.ai → Porcupine → Custom Keyword "Starlight" → Windows
#    Save .ppn as private/voice-operator/models/porcupine/Starlight.ppn

# 2. Add ElevenLabs key
notepad .env   # paste ELEVENLABS_API_KEY, PICOVOICE_ACCESS_KEY

# 3. Run install
.\install.ps1
# → installs uv, syncs dep tree, downloads Whisper large-v3 (~3 GB), smoke-tests TTS

# 4. Run service
.\run.ps1
# → tray icon green, listening for "Starlight"
```

### Phase 2 (phone, ~10 min)

```powershell
# 1. Install Cloudflare tunnel
winget install Cloudflare.cloudflared

# 2. Generate auth token, add to .env
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N").Substring(0,16)
# add as VOICE_OPERATOR_AUTH_TOKEN=...

# 3. Start server (separate from voice service — both can run)
.\.venv\Scripts\Activate.ps1
voice-operator serve

# 4. In another terminal:
cloudflared tunnel --url http://127.0.0.1:7373

# 5. Open the printed URL on your phone:
#    https://abc-def-ghi.trycloudflare.com/phone#token=<token>
#    Add to home screen.
```

Full doc: `private/voice-operator/scripts/setup-cloudflare-tunnel.md`

### Phase 4 (organize daemon, no extra setup)

```powershell
# Dry run on Downloads
voice-operator organize scan ~\Downloads
# → writes plan, prints classification summary

# When you trust the plan:
voice-operator organize execute <plan-id>
# → asks Tier B confirmation, backs up, moves, verifies, logs
```

---

## Architecture — what's actually in `private/voice-operator/`

```
private/voice-operator/
│  README.md            operator docs
│  install.ps1          idempotent Windows install
│  run.ps1              start voice service
│  stop.ps1             stop voice service
│  pyproject.toml       uv-managed deps
│  .env.template        API keys template (gitignored .env)
│  .gitignore
│
├─ service/  (17 modules, 2,252 LOC)
│   __init__.py
│   config.py            .env + components.toml loader
│   packet.py            Pydantic v1 schema + validators + JSON log
│   agent_client.py      Anthropic SDK + agent.md as cached system prompt
│   approval_gate.py     Tier A/B/C + ntfy push + queue file
│   packet_router.py     agent: / shell: / mcp: / memory / file targets
│   memory_writer.py     vault writes via SIS skills
│   text_mode.py         (Phase 0.5) text-mode chat command
│   server.py            (Phase 2/3) FastAPI + WebSocket + static
│   organize.py          (Phase 4) storage doctrine — 7-step + watcher
│   wake_word.py         Picovoice Porcupine "Starlight"
│   stt.py               faster-whisper local + Deepgram fallback
│   tts.py               ElevenLabs Turbo v2.5 streaming
│   pipeline.py          mic → wake → STT → agent → gate → router → TTS
│   tray.py              pystray + global hotkey + approval menu
│   smoke_tts.py         install-time TTS verifier
│   main.py              typer CLI: run/chat/serve/approvals/approve/reject/organize
│
├─ tests/  (6 modules, 755 LOC, 59 passing)
│   conftest.py          fixtures: tmp_log_dir, sample_packet_dict, mock_anthropic, patched_paths
│   test_packet_schema.py    18 tests — schema invariants
│   test_approval_gate.py    6 tests — gate behavior
│   test_packet_router.py    9 tests — router happy/sad paths
│   test_agent_client.py     7 tests — agent JSON parsing
│   test_organize.py         11 tests — storage doctrine
│   test_smoke_e2e.py        8 tests — end-to-end pipeline
│
├─ config/
│   components.toml      runtime tuning
│   routing.toml         custom shell handlers
│   workflows/  (9 YAMLs)
│       morning-brief.yaml
│       evening-handover.yaml
│       weekly-recap.yaml
│       organize-downloads.yaml
│       inbox-zero-captures.yaml
│       approval-sweep.yaml
│       deploy-prep.yaml
│       handover-now.yaml
│       state-save.yaml
│
├─ client/  (5 phone files + 2 dashboard files, 766 LOC)
│   phone/
│       index.html       PWA shell, dark mode, mic button + text input
│       app.js           WebSocket loop, browser STT, on-device TTS, approval inline
│       manifest.webmanifest
│       icon-192.svg
│       icon-512.svg
│   dashboard/
│       index.html       sidebar (Today/Approvals/Inbox/Brands/Workflows/Vault/Settings)
│       app.js           live-polling brand panels, packet list, approval actions
│
├─ scripts/
│   setup-cloudflare-tunnel.md
│
├─ models/porcupine/.gitkeep    (Frank's Starlight.ppn drops here)
└─ logs/                         (gitignored — packet audit trail)
```

---

## CLI surface (after install)

```
voice-operator run                       full voice service (mic + tray)
voice-operator chat                      text mode (no audio deps)
voice-operator chat --once "<text>"      one-shot
voice-operator chat --replay <file>      replay utterances for regression
voice-operator serve                     HTTP + WebSocket server (phone + dashboard)
voice-operator approvals                 list pending Tier B/C packets
voice-operator approve <id>              approve a pending packet
voice-operator reject <id>               reject a pending packet
voice-operator organize scan <path>      inventory + classify (dry-run)
voice-operator organize execute <plan>   apply approved plan (Tier B)
voice-operator organize watch            daemon: watch all inbox surfaces
```

---

## v7.5 alignment + privacy framework

- `private/voice-operator/` — gitignored. Instance state per Frank's privacy framework.
- `agents/starlight-voice-operator.md` — public substrate. Source of truth for agent identity. Loaded as Anthropic system prompt with caching.
- `skills/orchestration/agent-handoff-packet.md` — public substrate. The contract.
- `core/orchestrator/README.md` — voice room reference added (layer 10 master).
- `verticals/voice-video/README.md` — local voice room reference added (Voice & Video IS layer 8).
- Memory entry: `project_voice_operator_v1.md` indexed in `MEMORY.md`.

**Substrate-tier governance gate:** Per the new v7.5.1 rule (`feedback_board_before_tag.md`), substrate-touching changes require `/luminor-board` BEFORE commit. Tonight's work is **operational-tier only** (private/ scaffold + agent/skill that already cleared the board on 2026-04-26 morning). No new substrate touch.

---

## Component decisions locked

| Layer | Component | Why |
|-------|-----------|-----|
| Wake-word | Picovoice Porcupine | Offline, custom-keyword, free personal tier |
| STT primary | faster-whisper large-v3 | Local-first, 95%+ accuracy, $0 |
| STT fallback | Deepgram Nova-3 | When local conf < 80% |
| Agent | Claude Sonnet 4.6 default; Opus 4.7 complex; Haiku 4.5 fast | Caching makes it cheap after first call |
| TTS | ElevenLabs Turbo v2.5 | ~75ms TTFB, voice clone optional |
| Pipeline | Custom Python (Pipecat-shaped, no Pipecat dep) | ~150 LOC, debuggable; can swap to Pipecat in Phase 2 if needed |
| Phone client | Browser PWA + WebSocket | $0, no native build, install via Add-to-Home-Screen |
| Phone tunnel | Cloudflare Tunnel | $0, no router config, custom-domain optional |
| Dashboard | HTML/JS served by FastAPI | Phase 3 ships now; Tauri is Phase 3 v2 if needed |
| File watcher | watchdog (Python) | Cross-platform, dependency-light |
| Push | ntfy.sh | Self-hostable, $0, simple |
| State | Local JSON files | No DB needed for v1 |

---

## What's deliberately NOT done

- **`agent:claude` (non-CLI) dispatch** — Phase 1 supports `agent:claude-code` (subprocess) and `agent:starlight-concierge` (intake brief). Other named agents return queued status. Phase 2 can wire them to MCP servers.
- **MCP server dispatch (`mcp:*` targets)** — stub exists, returns "Phase 2".
- **Real KPI feeds for brand dashboards** — Phase 3a renders mock structure; Phase 3c wires Plausible/Stripe/Vercel APIs per brand.
- **Voice clone** — default ElevenLabs voice ships fine; Frank can record 30s sample and swap voice_id when ready.
- **Ambient room mic (Phase 5)** — needs hardware (ReSpeaker 4-mic ~$80).
- **Memory graph (Neo4j/AgentDB)** — out of scope for v1; file-based capture writes are sufficient.

---

## Risks I deliberately took

1. **Custom Pipecat-shaped pipeline instead of Pipecat itself.** ~150 LOC of Python instead of pulling Pipecat. Cleaner debug, no Pipecat-version drift, but means we lose Pipecat's WebRTC pipeline if/when needed. Easy to swap if Phase 5 demands.

2. **HTML dashboard now, Tauri later.** Tauri would have eaten 4+ hours of build setup tonight. The HTML approach is dependency-free, runs from the same FastAPI service, and reads identically to a Tauri webview. If Frank wants native window chrome later, Tauri swap is straightforward.

3. **Single-file approval queue.** No SQLite, no Redis. JSON file with file lock semantics. Fine for single-user v1; rebuild as durable queue if multi-user or fan-out scale becomes real.

4. **Heuristic file classifier as Phase 4 default.** Real classification via Claude is a one-line swap (replace `step2_classify_heuristic` with an agent call) but heuristic ships zero-API-cost organize. Frank can flip the switch in `service/organize.py` once he wants the agent classifying.

---

## What `git status` shows when Frank wakes up

```
modified:
  CLAUDE.md                       (v7.5.1 board-before-tag clarification — already there)
  agents/AGENT_REGISTRY.md        (Voice Operator added to Front-Door Tier)
  core/orchestrator/README.md     (voice room cross-ref)
  skills/skill-rules.json         (handoff packet skill registered)
  verticals/voice-video/README.md (voice room cross-ref)

new:
  agents/starlight-voice-operator.md
  skills/orchestration/agent-handoff-packet.md
  docs/specs/2026-04-26-voice-operator-v1.md
  docs/specs/2026-04-26-voice-operator-engineering-v1.md
  docs/ops/HANDOVER-2026-04-26-night.md (this file)

private (gitignored):
  private/voice-operator/         (entire scaffold — 30+ files)
```

Memory entry `project_voice_operator_v1.md` indexed in `MEMORY.md`.

---

## How I'd commit this

```powershell
git add agents/starlight-voice-operator.md skills/orchestration/agent-handoff-packet.md docs/specs/2026-04-26-voice-operator-v1.md docs/specs/2026-04-26-voice-operator-engineering-v1.md docs/ops/HANDOVER-2026-04-26-night.md
git add agents/AGENT_REGISTRY.md core/orchestrator/README.md skills/skill-rules.json verticals/voice-video/README.md

git commit -m "feat(voice-operator): cockpit voice mode for Starlight Orchestrator (v0.1)

Substrate-clean placement (operational tier; private install scaffold gitignored):
- agents/starlight-voice-operator.md — Front-Door Tier sibling to Concierge/Envoy
- skills/orchestration/agent-handoff-packet.md — packet_version=1 frozen schema
- docs/specs/2026-04-26-voice-operator-v1.md — board-cleared spec (REVISE→remediated)
- docs/specs/2026-04-26-voice-operator-engineering-v1.md — components + phasing
- docs/ops/HANDOVER-2026-04-26-night.md — what shipped

Cross-references in orchestrator + voice-video readmes per v7.5 alignment.
Skill registered in skill-rules.json.

Operational install scaffold lives at private/voice-operator/ (gitignored): full
service code (17 modules, 2.2k LOC), pytest suite (6 modules, 755 LOC, 59 passing),
9 canonical workflow YAMLs, FastAPI server + phone PWA + cockpit dashboard,
storage doctrine impl, install.ps1, all under privacy framework.

No substrate touch. Board-before-tag does not apply (operational only)."
```

---

## Three smoke utterances Frank tries first (text mode, tonight)

```
voice-operator chat
```

```
>>> Capture this thought: voice operator scaffold validates tonight, ready for keys tomorrow.
[expect: spoken_update "Captured." + write to memory/voice-sessions/2026-04-26.md]

>>> Prepare a Claude Code packet for SIS to add a section to README about voice operator.
[expect: build packet, target_system agent:claude-code, Tier A or B,
 packet logged to private/voice-operator/logs/packets/2026-04-26/<id>.json,
 spoken_update "Routing to Claude Code…"]

>>> Edit SIP.md to add a new clause.
[expect: Tier C halt, "Surface to /luminor-board before proceeding."]
```

If those three behave, the cognitive layer is real and the rest is infrastructure.

---

## Deferred follow-ups (not blocking)

1. **Wire real `agent:claude` dispatch** beyond claude-code — Phase 2.
2. **MCP server dispatch** for `mcp:*` targets — Phase 2.
3. **Brand KPI panels** — Phase 3c (FrankX is mechanical with Plausible+Stripe; Arcanea/Library/ACOS need Frank to name the metrics).
4. **Voice clone** — anytime, 30s sample to ElevenLabs.
5. **Tauri upgrade for dashboard** — if Frank wants native window chrome.
6. **Ambient room mic (Phase 5)** — needs hardware purchase.
7. **Knowledge graph (Neo4j/AgentDB)** — Frank wanted a graph; v1 is file-based, real graph is v2.

---

## Test the cognitive layer right now without leaving this terminal

```powershell
cd C:\Users\frank\Starlight-Intelligence-System\private\voice-operator
python -m pytest tests/ -v
```

Expected: `59 passed in ~5s`. If that passes, the package is healthy on this machine — what's missing is just the audio stack and API keys, both of which `install.ps1` handles.

---

**Built on SIP** · voice-operator-v1 + engineering-v1 · 2026-04-26 overnight
