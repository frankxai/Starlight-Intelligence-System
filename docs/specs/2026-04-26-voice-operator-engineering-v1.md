---
spec: voice-operator-engineering-v1
status: scaffolded — Phase 0.5/1/2/3-html/4 code complete, 59/59 tests passing. Awaiting Frank's API keys + .ppn for live install.
date: 2026-04-26
last_updated: 2026-04-26 (overnight autonomous build)
tier: operational (instance-config; binds public Voice Operator agent to Frank's actual hardware)
substrate-touch: none
related: docs/specs/2026-04-26-voice-operator-v1.md, agents/starlight-voice-operator.md, skills/orchestration/agent-handoff-packet.md, docs/ops/HANDOVER-2026-04-26-night.md
---

# Spec — Voice Operator Engineering v1

> *"Highest quality, top notch, state of the art — installed, configured, owned end-to-end."*

This spec converts the Voice Operator agent definition + Handoff Packet skill into a concrete install + runtime + dashboard architecture for Frank's actual machine (Windows 11, this PC). It picks components, names trade-offs, phases the work, and identifies what Frank must approve before install.

The Voice Operator agent is **brand-, surface-, and frontend-agnostic** by design. This spec is the **first instance-binding**: which STT, which TTS, which orchestration framework, which dashboard, which phone client. Future sovereign-spawn instances pick their own.

---

## 1. Decisions to make (you approve, I install)

Three architectural choices are load-bearing. The rest cascade from these.

### Decision 1 — STT (speech to text)

| Option | Latency | Accuracy | Privacy | Cost | Verdict |
|--------|---------|----------|---------|------|---------|
| **faster-whisper (local, large-v3)** | 200–500ms | 95%+ EN | local-only | $0 (uses your GPU/CPU) | **Recommended primary** |
| Deepgram Nova-3 (cloud) | 80–150ms | 96% | cloud | ~$0.004/min | Recommended fallback |
| OpenAI Whisper API (cloud) | 200–400ms | 95% | cloud | $0.006/min | Skip — Deepgram faster |
| Groq Whisper Turbo | 100–200ms | 95% | cloud | ~$0.001/min | Strong alt; lock-in concern |

**Recommendation:** local-first hybrid — `faster-whisper large-v3` runs on your machine, Deepgram fires only when local confidence < 80% or for live transcripts >2min. Privacy default; cloud cost only on edge cases.

**You need to approve:** Deepgram account (free tier covers ~7,500 min/month) — only if you want the fallback. Otherwise local-only.

### Decision 2 — TTS (text to voice)

| Option | Latency | Naturalness | Voice clone | Cost | Verdict |
|--------|---------|-------------|-------------|------|---------|
| **ElevenLabs Turbo v2.5** | ~75ms TTFB | Excellent | Yes | $22/mo Creator tier (100k chars/mo) | **Recommended** — you already mentioned |
| Cartesia Sonic-2 | ~90ms | Excellent | Yes | $49/mo | Strong alt — newer, faster streaming |
| Coqui XTTS-v2 (local) | ~500ms | Good | Yes | $0 | Skip — latency kills cockpit feel |
| Edge TTS (free, MS) | ~200ms | Robotic | No | $0 | Fallback only |

**Recommendation:** ElevenLabs Turbo v2.5 + custom voice clone (your own voice, ~30 sec sample). Edge TTS as offline fallback when ElevenLabs unreachable.

**You need to approve:** ElevenLabs account ($22/mo). Voice clone is optional for v1; default voice ships fine.

### Decision 3 — Voice agent runtime / orchestration

| Option | Sovereignty | Speed-to-ship | Multi-device | Verdict |
|--------|-------------|---------------|--------------|---------|
| **Pipecat (Daily) + custom Python service** | High (open source) | Medium (1 week) | Add via WebRTC later | **Recommended** |
| LiveKit Agents | High | Medium | Native multi-device WebRTC | Strong alt; heavier infra |
| Vapi (managed SaaS) | Low | High (1 day) | Yes | Skip — not sovereign |
| Custom from scratch | Total | Slow | Hard | Skip — re-inventing |

**Recommendation:** Pipecat for v1 (Phase 1 single-device PC), upgrade to LiveKit transport in Phase 2 when phone client lands. Pipecat's pipeline abstraction matches the Voice Operator core loop almost 1:1.

**You need to approve:** Python 3.11+ on this machine (likely already there), 4GB GPU VRAM minimum for local Whisper (your machine has it).

---

## 2. State-of-art component stack (2026)

Locked-in choices given Decisions 1–3 above:

```
LAYER             COMPONENT                       LICENSE / COST
─────────────────────────────────────────────────────────────────
Wake-word         Picovoice Porcupine             Free (personal)
                  custom "Starlight" model         + $0 access key
                                                  (free tier)
─────────────────────────────────────────────────────────────────
Mic capture       sounddevice (PyAudio wrapper)   MIT, $0
                  + voice-activity-detection      MIT, $0
                  (Silero VAD)
─────────────────────────────────────────────────────────────────
STT primary       faster-whisper (large-v3)       MIT, $0
                  CTranslate2 backend             local GPU
─────────────────────────────────────────────────────────────────
STT fallback      Deepgram Nova-3 (cloud)         ~$0.004/min
                  (only if local conf < 80%)      free tier 7.5k min
─────────────────────────────────────────────────────────────────
Voice Operator    Claude Sonnet 4.6 via API       Anthropic API
agent             (Opus 4.7 for complex packets)  ~$3-15/M tokens
                  System prompt = agents/         (cached after 1st)
                  starlight-voice-operator.md
─────────────────────────────────────────────────────────────────
Handoff packet    Pydantic schema validator       MIT, $0
                  + JSON Schema export            (for v2 multi-frontend)
─────────────────────────────────────────────────────────────────
Routing layer     Python dispatch table           $0
                  (target_system → MCP server,
                   subprocess, or HTTP call)
─────────────────────────────────────────────────────────────────
Memory writes     Existing SIS skills             $0
                  (memory/capture-discipline
                   etc.) via local file ops
─────────────────────────────────────────────────────────────────
Approval gates    Toast (PC) via win10toast       MIT, $0
                  Push (phone) via ntfy.sh        MIT, $0
                                                  self-hosted free
─────────────────────────────────────────────────────────────────
TTS               ElevenLabs Turbo v2.5           $22/mo Creator
                  (streaming)
─────────────────────────────────────────────────────────────────
Audio output      sounddevice                     MIT, $0
─────────────────────────────────────────────────────────────────
Pipeline glue     Pipecat                         BSD-2, $0
─────────────────────────────────────────────────────────────────
PC frontend       System tray (Tauri v2 / pystray) MIT, $0
                  + global hotkey                 (toggle mic)
─────────────────────────────────────────────────────────────────
Phone frontend    PWA (Phase 2)                   $0
                  served from local Cloudflare
                  Tunnel on quick.starlight.frank
─────────────────────────────────────────────────────────────────
Dashboard         Tauri v2 desktop app            MIT, $0
                  (Phase 3) or Notion fallback    (existing)
─────────────────────────────────────────────────────────────────
File watcher      watchdog (Python)               Apache-2, $0
(Organize daemon) + storage doctrine impl
─────────────────────────────────────────────────────────────────
```

**Total recurring cost:** ~$22/mo (ElevenLabs) + Anthropic API usage (~$50-150/mo at active usage) + optional Deepgram (~$0-30/mo). Everything else open-source / free tier.

**One-time:** $0. All components installable via pip/cargo/winget.

---

## 3. Phased build plan

Each phase ships standalone value. Stop at any phase = working system at that capability level.

### Phase 1 — PC cockpit (this week, ~4–6 hours focused)

**Outcome:** mic on PC → wake-word → Whisper → Voice Operator (Claude API) → handoff packet → ElevenLabs TTS speaks back. Single device. No phone yet. No dashboard yet.

**Deliverables:**

```
private/voice-operator/
├── service/
│   ├── main.py                     # Pipecat pipeline entry
│   ├── pipeline.py                 # wake → VAD → STT → agent → TTS
│   ├── agent_client.py             # Claude API wrapper, loads agent.md as system prompt
│   ├── packet_builder.py           # Pydantic schema for handoff packets
│   ├── packet_router.py            # target_system dispatch
│   ├── approval_gate.py            # Tier A/B/C enforcement + toast/push
│   ├── memory_writer.py            # vault writes via SIS skills
│   └── tray.py                     # system tray icon + global hotkey
├── config/
│   ├── components.toml             # API keys, model paths, hotkey
│   ├── routing.toml                # target_system → handler map
│   └── workflows/                  # YAML workflow definitions
│       ├── morning-brief.yaml
│       ├── evening-handover.yaml
│       └── organize-downloads.yaml
├── models/
│   └── porcupine/Starlight.ppn     # custom wake-word
├── logs/
│   └── packets/<date>/             # one file per packet (audit trail)
├── install.ps1                     # idempotent Windows install
├── run.ps1                         # start service
└── README.md                       # operator docs
```

**Install script does:**
1. Verify Python 3.11+, install if missing (winget)
2. Create venv at `private/voice-operator/.venv/`
3. `pip install` the stack: pipecat-ai, faster-whisper, anthropic, elevenlabs, pvporcupine, silero-vad, watchdog, pydantic, pystray, win10toast, ntfy
4. Download Whisper large-v3 to local model cache (~3GB)
5. Validate API keys present in env / config
6. Register Windows Task Scheduler entry for autostart on logon
7. Smoke test: synthesize "Starlight ready" via TTS, play it back

**Acceptance:**
- Say *"Starlight, what's the date today?"* → spoken answer in <3s end-to-end
- Say *"Starlight, capture this. The voice operator is online."* → vault entry written, spoken confirm
- Say *"Starlight, prepare a Claude Code packet for SIS to update the README."* → packet logged to `logs/packets/`, spoken "Packet prepared. Awaiting your hand to dispatch to Claude Code."

### Phase 2 — Phone client + multi-device (next week, ~6 hours)

**Outcome:** speak from phone, get spoken response from phone. Same backend.

**Deliverables:**
- Cloudflare Tunnel → exposes local service at `voice.frank.tunnel.dev` (no port-forward needed)
- PWA at that URL — uses WebRTC mic + browser TTS playback (or native ElevenLabs stream)
- WebSocket protocol: phone → service → phone. Minimal UI: mic button, transcript stream, packet list.
- Auth: pre-shared key + device fingerprint (only Frank's phone authorized)

**Acceptance:** speak the same 19 canonical phrases from phone, identical backend behavior.

### Phase 3 — Per-business dashboard (~8 hours)

**Outcome:** unified Tauri desktop app with sidebar per business. Click brand → see active packets, recent vault entries, pending approvals, KPI snapshot, recent commits / deploys.

**Sidebar layout:**
```
┌─────────────────────────────────────────────────────┐
│ Starlight Cockpit                          ● online │
├──────────┬──────────────────────────────────────────┤
│ FrankX   │  [Active Packets]                        │
│ Arcanea  │  • #017 Build pricing comparison table   │
│ SIS      │    target: agent:claude-code  Tier A     │
│ Library  │    spoken_update: "Routing to Claude..." │
│ ACOS     │                                           │
│ Music    │  [Pending Approval]                      │
│ Visuals  │  • #019 Send LinkedIn post draft         │
│ ──────── │    Tier B  [Approve] [Edit] [Reject]     │
│ Inbox    │                                           │
│ Vault    │  [Recent Vault]                          │
│ Approval │  • strategic-vault.md updated 14:33      │
│ Workflows│  • technical-vault.md updated 13:02      │
│          │                                           │
│ Settings │  [Today's Activity]                      │
│          │  3 commits · 12 packets · 1 deploy       │
└──────────┴──────────────────────────────────────────┘
```

**Per-brand panel content:**
- **FrankX** — active content packets, recent posts, traffic snapshot (Plausible/Vercel Analytics API), Stripe MRR tile
- **Arcanea** — canon updates, world-build packets, ongoing books, music tracks in production
- **SIS** — substrate health, board verdicts pending, agent registry diff, skill auto-activation hits
- **Library OS** — book ingest queue, quote synthesis pipeline, recent reading
- **ACOS** — productivity tasks, creator workflow status
- **Inbox** — unprocessed captures awaiting classification
- **Approval** — every Tier B/C packet awaiting Frank
- **Workflows** — named workflows + last-run status

**Stack:** Tauri v2 (Rust backend + web frontend) → reuses the Python service via local IPC. Frontend in React + Tailwind. Single binary, ~12 MB.

### Phase 4 — Storage doctrine daemon (~4 hours)

**Outcome:** the seven-step protocol runs as a background daemon. New downloads, screenshots, and arbitrary files in `~/Downloads/`, `~/Desktop/`, `~/Documents/` get classified into the storage graph automatically. Tier B approval required for every move.

**Trigger:** file watcher detects new file → classification packet built → Voice Operator suggests destination per storage graph → toast + push notification → Frank approves → move executes → log written.

**Plus:** voice phrase *"Starlight, organize my downloads, dry run only."* → returns spoken summary of what *would* move, no execution.

### Phase 5 — Ambient room mode (later, hardware-dependent)

**Outcome:** dedicated mic + speaker setup for hands-free room operation. Wake-word fires from across the room. Spoken responses from room speaker.

**Hardware options:** ReSpeaker 4-mic array (~$80) or Matrix Voice (~$70). USB connection to PC. Same Pipecat pipeline; just a different audio source/sink.

---

## 4. Central workflows

Workflows are named procedures the Voice Operator can invoke by phrase. Each is a sequence of handoff packets with dependencies. Stored as YAML.

### Canonical v1 workflows

| Workflow | Trigger phrase | What it does |
|----------|---------------|--------------|
| `morning-brief` | *"Starlight, run the morning brief."* | (1) Pull last 24h git activity across all brands. (2) Pull today's calendar. (3) Pull pending Tier B/C approvals. (4) Pull yesterday's evening-handover. (5) Synthesize via Claude into 3-paragraph brief. (6) Speak it (≤45s) + show in dashboard. |
| `evening-handover` | *"Starlight, run the evening handover."* | (1) Today's commits per brand. (2) Today's packets + verification status. (3) Open loops (drafted-not-sent, prepared-not-executed, queued-not-shipped). (4) Energy-check question (1 of 5 from `/energy-audit`). (5) Write `docs/ops/HANDOVER-<date>.md` per existing handover skill. |
| `weekly-recap` | *"Starlight, run the weekly recap."* | Wraps existing `/weekly-recap` agent + speaks the highlights. |
| `organize-downloads` | *"Starlight, organize my downloads."* | Storage doctrine 7-step. Dry run unless `, execute` appended. |
| `inbox-zero-captures` | *"Starlight, clear the capture inbox."* | Reads all unclassified captures from last 7 days, classifies via Voice Operator, routes to vault namespaces, surfaces ambiguous ones for Frank. |
| `approval-sweep` | *"Starlight, what needs my approval?"* | Lists every pending Tier B/C packet sorted by age + risk. Speaks count + top 3. |
| `deploy-prep` | *"Starlight, prepare the deploy."* | (1) Identify target brand from context. (2) Run tests. (3) Build. (4) Vercel preview deploy. (5) Smoke-test preview URL. (6) Speak status, request Tier B approval for prod. |
| `handover-now` | *"Starlight, create a handover."* | Run the existing `handover` skill, capture session state, write doc. |
| `state-save` | *"Starlight, stop and save state."* | Persist all in-flight packets, log session, terminate streams cleanly. |

### Workflow file shape

```yaml
# config/workflows/morning-brief.yaml
name: morning-brief
trigger_phrase: "Starlight, run the morning brief."
description: 3-paragraph brief covering activity, calendar, approvals, last handover.
steps:
  - id: pull-git
    target: shell
    command: scripts/git-activity-last-24h.sh
    output: $.activity
  - id: pull-calendar
    target: mcp:google-calendar
    operation: list_events
    args: { day: today }
    output: $.calendar
  - id: pull-approvals
    target: agent:starlight-voice-operator
    operation: list_pending_approvals
    output: $.approvals
  - id: pull-handover
    target: file
    path: docs/ops/HANDOVER-${yesterday}.md
    output: $.handover
  - id: synthesize
    target: agent:claude
    model: claude-sonnet-4-6
    prompt: morning-brief.md
    inputs: [$.activity, $.calendar, $.approvals, $.handover]
    output: $.brief
  - id: speak
    target: tts
    text: $.brief
    max_duration_seconds: 45
  - id: show
    target: dashboard
    panel: today
    content: $.brief
verification:
  done_means: brief_spoken AND dashboard_updated
approval: { required: false, tier: A }
```

Workflows are first-class artifacts. Editing one is editing a YAML file in `config/workflows/`. Voice Operator hot-reloads on change.

---

## 5. Per-business dashboard architecture

### Why a single unified dashboard, not virtual desktops

Windows 11 virtual desktops are good for *visual context separation*, weak for *cross-brand pattern recognition*. Frank's edge is seeing patterns across FrankX + Arcanea + SIS + Library + ACOS simultaneously. A unified cockpit with quick brand-switch (Cmd-K palette) preserves that. Virtual desktops can layer on top — keep one virtual desktop dedicated to "deep work" (full-screen Claude Code) and the cockpit lives on the home desktop.

### Data sources per brand

| Brand | KPIs source | Activity source | Asset source |
|-------|-------------|----------------|--------------|
| FrankX | Plausible / Vercel Analytics + Stripe MRR | git: frankx-site repo | `Brands/FrankX/` |
| Arcanea | (TBD — what KPIs matter?) | git: arcanea repos | `Brands/Arcanea/` |
| SIS | this repo's substrate health (test harness pass rate, board verdicts) | git: this repo | `Brands/SIS/` |
| Library OS | (TBD) | git: library-os repo | `Brands/LibraryOS/` |
| ACOS | (TBD) | git: ACOS repo | `Brands/ACOS/` |
| Music | Suno track count, recent releases | git: music projects | `Brands/[brand]/music/` |
| Visuals | Recent generations, brand-color compliance | n/a | `Assets/images/` filtered |

**Open question for you:** what KPIs matter for Arcanea / Library OS / ACOS? Once named, dashboard panel design is mechanical.

### Dashboard implementation phasing

- **Phase 3a (~3h):** Panel scaffold — sidebar + per-brand panel component. Reads from local files only. No external APIs yet.
- **Phase 3b (~3h):** Wire git activity. `simple-git` + parsed log.
- **Phase 3c (~2h):** Wire external APIs (Plausible, Stripe, Vercel) — one brand at a time. FrankX first since data exists.
- **Phase 3d (~2h):** Workflow trigger UI. Click a workflow, run it.

---

## 6. Memory + knowledge graph

The "business knowledge graph" surface in the constitution is real but not v1. v1 routes memory writes through existing SIS skills (`memory/capture-discipline`, `memory/insight-distillation`). The knowledge graph itself is a future spec.

**Interim mapping:**

- "Personal memory" → existing vaults under `memory/vaults/` + Voice Operator session log under `memory/voice-sessions/<date>.md`
- "Business knowledge graph" → for v1, file-based. Brand-tagged frontmatter on every capture. Real graph DB (Neo4j, AgentDB, or Memgraph) is v2.
- "People graph" → out of scope for v1. CRM-class concern; address when relational sub-system needs it.

---

## 7. What needs your hand or approval before install

| Item | Why | Cost |
|------|-----|------|
| **ElevenLabs account + API key** | Required for TTS | $22/mo Creator |
| **Anthropic API key** (you have this) | Voice Operator agent runs against Claude | usage-based ~$50–150/mo |
| **Picovoice access key** | Wake-word "Starlight" | Free (personal) |
| **Deepgram account** (optional) | STT fallback | Free tier 7.5k min |
| **Cloudflare Tunnel account** (Phase 2) | Phone access | Free |
| **ntfy.sh account or self-hosted** | Push notifications to phone | Free / self-hosted |
| **Microphone choice** | Built-in PC mic OK for v1; ReSpeaker 4-mic array for Phase 5 | $0 / $80 later |
| **Voice clone sample** (optional) | 30s of your voice for ElevenLabs custom voice | $0 |

**Component lock-in approval:** confirm Pipecat (vs LiveKit Agents) for v1. If you want full WebRTC native from day one, switch to LiveKit; adds ~4h to Phase 1 but removes Phase 2 transport refactor.

---

## 8. Risk + Luminor Board pre-check

Before install, three risks worth surfacing for board pressure-test if you want one:

1. **Anthropic API as the agent runtime** — every voice utterance hits the Claude API. Latency, cost, and dependency. Mitigation: aggressive prompt caching (Voice Operator system prompt cached after first call), Haiku 4.5 for simple Capture/Search classifications, Sonnet for Build/External, Opus reserved for complex packets.

2. **Local-first STT vs cloud fallback boundary** — if local Whisper is wrong but confident, no fallback fires. Mitigation: ship dual-mode for first 2 weeks, log every classification; tune confidence threshold from real data.

3. **Approval-gate fatigue** — if Tier B fires too often, Frank starts approving without reading. Mitigation: instrument approval-rate-per-day; if >10/day, surface to recalibrate which actions are Tier A vs B.

Recommendation: **proceed without a board session**. These are tunable parameters, not architectural commitments. The architectural commitments (sovereignty-clean, packet-first, Voice in Front-Door tier, no parallel substrate) already cleared the board last round.

---

## 9. Definition of done

### Phase 1 done means:
- `private/voice-operator/install.ps1` ran successfully on this machine
- System tray icon shows ● online
- Three smoke utterances behave correctly (date / capture / packet)
- Logs in `private/voice-operator/logs/packets/` for every utterance
- ElevenLabs voice plays back in <3s for a 1-sentence response

### Phase 2 done means:
- Phone PWA loads at tunnel URL
- Same three smoke utterances work from phone
- Approval push notification arrives on phone for Tier B packet

### Phase 3 done means:
- Tauri dashboard launches, sidebar shows all brands
- Each brand panel shows ≥3 real data points
- One workflow runs from a dashboard button

### Phase 4 done means:
- File dropped in `~/Downloads/` triggers classification packet within 5s
- Tier B approval flow round-trips correctly

### Phase 5 done means:
- Wake-word fires from 3m across the room with <2% false-positive rate
- Spoken response audible from room speaker

---

## 10. Sequence of execution (your action list)

To go from here to Phase 1 done:

1. **You approve component lock-in:** Pipecat + ElevenLabs + faster-whisper. (Or override.)
2. **You provision API keys:** ElevenLabs ($22/mo), Picovoice (free). Drop into `private/voice-operator/config/components.toml` (template I'll write).
3. **I write the install script + service code.** ~4–6 hours of focused work. I commit to `private/voice-operator/`.
4. **You run `private/voice-operator/install.ps1`.** Tier B operation — your hand on the trigger.
5. **We smoke-test.** I produce three utterances; you verify they behave. Any failure → I fix.
6. **Phase 1 ships.**

Phases 2–5 follow the same shape: I write, you approve install, we test.

---

**Built on SIP** · voice-operator-engineering-v1 · 2026-04-26
