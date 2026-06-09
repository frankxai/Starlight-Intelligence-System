# Starlight Voice v3 — First-Principles Redesign

**Date:** 2026-05-14
**Tier:** substrate (touches cross-repo contracts, SIS↔Arcanea boundary, install/autostart layer, voice-loop architecture)
**Author:** Claude Opus 4.7 (1M ctx) — autonomous lead per `feedback_lead_with_authority`
**Governance:** `/starlight-board` pre-pass required before commit/tag of any starlight-voice repo content that touches SIS substrate (the migration scripts, the legacy-task killer, the cross-repo MCP contract changes). Implementation of starlight-voice itself is operational-tier inside its own repo.
**Status:** DRAFT — awaiting Frank review
**Built on SIP** — sovereign-repo extraction with cross-repo MCP-only contracts; SIS substrate consumed by host, not absorbed.

---

## 1. Executive summary

The current voice operator stack — `private/voice-operator/` (Python service in SIS) plus `Arcanea/packages/arcanea-voice` (Node MJS in Arcanea monorepo) plus a 12-scheduled-task auto-start surface plus six entry points — is genuinely architecturally muddy. Frank's frustration is empirically justified: visible terminals and browsers at logon, two competing voice surfaces (persona=jarvis vs. persona=lumina), dashboard auto-start that locks `:3007`, six bespoke CLI dispatchers, 2025-era latency stack, and a "bridge" between SIS and Arcanea that papers over duplication rather than naming a clean boundary.

**Starlight Voice v3** extracts the voice operator into a new sovereign repo (`starlight-voice`), positions it as the open-source reference impl of a Jarvis-grade personal voice operator, and rebuilds the runtime from first principles using the 2026-converged pattern: **Tauri (Rust) tray shell + Python sidecar with Pipecat pipeline**, PTT global hotkey as primary activation with clap as opt-in ambient mode, MCP as the universal tool layer, and a four-pillar performance design (in-process SDKs + pre-warmed dispatcher pool + browser-use first-class + deliberation lane) targeting sub-800ms full-loop hot-path SLA with C-tier deliberation for substrate-grade reasoning.

Scope envelope: **B-velocity, C-outcome.** Ship MVR core in ~3 weeks (kills chaos, daily-driver works), full B-tier surfaces by week 6, C-tier excellence layered across weeks 7-12. No on-device wake-word — explicit Frank exclusion. SIS Python + Arcanea Node implementations archived (90-day grace) then deleted.

## 2. Background — current pain (audit findings)

Audit conducted 2026-05-14 across four parallel investigation agents. Full findings in Appendix A. The five load-bearing findings:

1. **Auto-start surface = 12 scheduled tasks + 7 Run-key/Startup entries from 6 different registrars.** No single owner. Visible windows from `Arcanea24x7` (cmd.exe flash + WSL Ubuntu shell), Startup folder `Comet.lnk` + `arcanea-voice-daemon.lnk` (which competes with cockpit's orb — persona=lumina vs. persona=jarvis), HKCU\Run Warp terminal with no hidden-window flag. The existence of `tools/fix-hide-task-windows.ps1`, `tools/diag-cockpit-tasks.ps1`, etc. in the current `git status` proves Frank is firefighting this *as the redesign is being requested*.

2. **SIS ↔ Arcanea = parallel implementations of the same stack at different generations.** Voice operator, TTS/STT, cognition routing, workflow execution, vector memory, orb visual UI — all exist in both repos. The B3-lite SSE bridge from Arcanea (`server.mjs:625-641`) to SIS (`:3007/api/brain/inject`) is a band-aid, not a boundary. Two memory stacks (Memory Bus + memory-mcp/guardian-memory/hybrid-memory). Two orbs (SIS dashboard brain viz + Arcanea `presence` Lumina orb).

3. **Six activation entry points** into one pipeline (tray, hotkey, clap, Porcupine wake-word, dashboard, phone PWA, text-mode CLI). Modern reference impls ship one or two.

4. **Latency stack is 2025-era.** ElevenLabs Flash measured 5226ms in `project_jarvis_intelligence_layer` memory. Whisper-large local. Vs. May 2026 leaders: Cartesia Sonic-2 (~90ms TTFA), Deepgram Nova-3/Flux (<300ms streaming STT), Cerebras Llama-4 (160ms TTFT @ 520 TPS).

5. **Architectural premise is from a different era.** Multi-surface cockpit with terminals + orbs + dashboards auto-launching at logon was a 2024 thought-leader pattern. May 2026 winners (Pipecat, LiveKit Agents, isair/jarvis, Thoth, Wispr Flow, OpenClaw at 210k stars Jan 2026) converged on: single tray binary, no terminals, no browser at logon, PTT global hotkey for desktop power-users, wake-word retreating to ambient contexts, MCP-first tools, hybrid local-STT + cloud-LLM/TTS.

## 3. Goals & non-goals

**Goals:**
- Eliminate auto-start chaos: zero visible windows at logon, single hidden scheduled task, no `cmd.exe` flashes, no auto-spawned browsers, no auto-spawned terminals.
- Sub-800ms full-loop hot path (mic close → first speaker audio, P50, measured).
- Top-notch CLI agent triggering: <300ms cold, <100ms warm dispatch to claude-code / codex / gemini / opencode.
- First-class browser automation via browser-use MCP (~2s cold, <500ms warm navigation).
- Tier 2.5 Deliberation lane for substrate-grade reasoning (Claude 4.7 extended thinking, 8-32K thinking-token budget).
- Single `.exe` (or `.dmg`/`.deb`) installer alliances can double-click. No Python install required for end-users.
- MCP-only cross-repo contracts: no SSE hacks, no `:3007/api/brain/inject` POSTs.
- 53 SIS Python tests preserved as contract.

**Non-goals:**
- Multi-user / cloud-hosted SaaS version (sovereignty principle: local-first, single-user).
- On-device wake-word (Porcupine, OpenWakeWord) — explicit Frank exclusion.
- Voice clone of Frank's voice (optional anytime, not in v3 scope).
- New cognition models beyond what's already in field (no fine-tuning).
- Replacing SIP / SIS substrate. Voice is a host, not a substrate layer.

## 4. Constraints (decisions locked during brainstorming)

| # | Decision | Locked by |
|---|---|---|
| C1 | Voice operator lives in new sovereign repo `starlight-voice` (not SIS, not Arcanea) | Frank, 2026-05-14 |
| C2 | PTT global hotkey is primary activation; clap is opt-in ambient mode; no wake-word | Frank, 2026-05-14 |
| C3 | Tauri (Rust) tray shell + Python sidecar with Pipecat pipeline | Frank, 2026-05-14 |
| C4 | Scope: B-velocity (~6 weeks to feature-complete B-tier), C-outcome (excellence axes layered into roadmap), no wake-word | Frank, 2026-05-14 |
| C5 | Performance is a first-class pillar: fast CLI triggering, browser-use, top-notch thinking | Frank, 2026-05-14 |
| C6 | MCP is the only cross-repo contract; no SSE bridges, no shared file mailboxes | this spec |
| C7 | Public MIT-licensed repo; positioned as OSS reference impl from day 1 | this spec |

## 5. Architecture

```
                  ┌──────────────────────────────────────┐
                  │   starlight-voice (Tauri/Rust)       │ ← single .exe installer
                  │                                       │   tray icon, hotkey, autostart-hidden
                  │   • Global PTT hotkey (Ctrl+⇧+Space) │   OS integration only
                  │   • System tray (pause/quit/config)  │
                  │   • Autostart-as-hidden-service       │   NO console, NO browser at logon
                  │   • Hotkey-to-mic toggling           │
                  │   • Spawns Python sidecar (stdio)    │
                  └────────────────┬─────────────────────┘
                                   │ stdio JSON-RPC
                                   │ (frame events, control)
                                   ▼
              ┌────────────────────────────────────────────────┐
              │   Python sidecar (Pipecat pipeline)            │ ← bundled in installer
              │                                                │   PyInstaller-frozen or conda-pack
              │   ┌──────────────────────────────────────┐    │
              │   │ Silero VAD → Deepgram Flux STT       │    │   2026 latency stack
              │   │ → Cognition Router → Cartesia Sonic-2│    │
              │   └──────────────────────────────────────┘    │
              │   • Pipecat frame graph (Wave 2 middleware)    │
              │   • Cognition: Cerebras/Groq/Claude/CLI       │
              │   • MCP client → 10 MCP servers               │
              │   • Memory Bus singleton                       │
              │   • In-process: Anthropic/OpenAI/Gemini SDKs   │
              │   • Pre-warmed pool: codex/opencode CLIs       │
              └────────────────────┬───────────────────────────┘
                                   │ MCP-over-stdio (local) / MCP-over-HTTP (phone)
                ┌──────────────────┴──────────────────┐
                │ MCP universe (the substrate calls)  │
                │  • starlight-mcp (SIS substrate)    │
                │  • memory-bus (singleton vector DB) │
                │  • cross-repo-indexer (520+ atoms)  │
                │  • arcanea-mcp (canon/worlds)       │
                │  • cockpit-mcp (8 cockpit tools)    │
                │  • browser-use-mcp (NEW)            │
                │  • claude-code-cli-mcp              │
                │  • codex-cli-mcp                    │
                │  • gemini-cli-mcp                   │
                │  • opencode-cli-mcp                 │
                └─────────────────────────────────────┘
```

**Repo workspace shape:**
```
starlight-voice/
├── Cargo.toml                      # Rust workspace
├── tauri/                          # Tray shell, hotkey, autostart
│   ├── src/main.rs                 # tray icon, global hotkey via tauri-plugin-global-shortcut
│   ├── src/autostart.rs            # tauri-plugin-autostart (single Windows scheduled task)
│   └── src/sidecar.rs              # spawn + stdio JSON-RPC to Python
├── sidecar/                        # Python Pipecat sidecar
│   ├── pyproject.toml              # uv-managed
│   ├── src/starlight_voice/
│   │   ├── pipeline.py             # Pipecat frame graph
│   │   ├── activation.py           # PTT events from Rust; clap ambient (opt-in)
│   │   ├── cognition/router.py     # SALVAGED from private/voice-operator/
│   │   ├── mcp/client.py           # MCP-over-stdio universal client
│   │   ├── dispatch/pool.py        # pre-warmed subprocess pool for CLIs
│   │   ├── deliberation.py         # Tier 2.5 extended-thinking lane
│   │   └── adapters/               # Deepgram, Cartesia, Cerebras, ElevenLabs (fallback)
│   └── tests/                      # 53 SALVAGED tests + new Pipecat-frame + benchmark tests
├── installer/                      # Tauri bundler config; signs + ships .exe/.dmg/.deb
├── benchmarks/                     # latency CI gate, sub-800ms SLA enforcement
└── docs/
    ├── ARCHITECTURE.md             # this design, productized
    ├── INSTALL.md                  # one-page friend/alliance install
    └── PORTING_FROM_SIS.md         # migration guide for Frank's own machine
```

## 6. Activation layer

- **Primary: PTT global hotkey** — `Ctrl+Shift+Space` (configurable in tray menu). Press-and-hold to talk, release to end utterance. Wispr Flow pattern. Zero false-trigger rate, zero idle CPU consumption, zero privacy leak. Implemented in Rust via `tauri-plugin-global-shortcut`. Hotkey events sent over stdio to sidecar.
- **Secondary: clap ambient mode (opt-in)** — toggled from tray menu. When enabled, sidecar runs `clap_detector.py` (salvaged from `private/voice-operator/service/clap_detector.py`) on a low-priority audio thread. 2-clap pattern within 800ms with 200ms refractory fires utterance capture identical to PTT. Default: **off**. Frank turns on when away from keyboard or hands occupied.
- **Wake-word retires entirely.** Porcupine code archived. The 16 wake-word tests archive; the 8 clap tests port forward.
- **Text-mode CLI** for developer/debug: `starlight-voice say "..."` bypasses STT and goes straight to cognition router. Not user-facing surface.

## 7. Cognition pipeline (Pipecat frame graph)

```
mic frame  →  SileroVADAnalyzer (90ms turn detection)
           →  DeepgramFluxSTT      (~250ms streaming, integrated turn detection)
           →  CognitionRouter      (multi-tier — see §7.1)
           →  MCP tool execution   (function calls dispatched through MCP client)
           →  CartesiaSonic2TTS    (~90ms TTFA, streaming audio frames)
           →  audio frame back to Rust → speakers
```

### 7.1 Cognition router tiers

The salvaged `cognition/router.py` ports into a Pipecat `FrameProcessor`. Tier structure preserved + extended:

| Tier | Backend | TTFT target | Use case |
|---|---|---|---|
| 0 | Deterministic regex / classifier | <10ms | Immediate-known intents (e.g., "pause", "resume") |
| 1 (hot) | Cerebras Llama-4 Scout | ~160ms | Default fast path, 90% of utterances |
| 2 (warm) | Groq Kimi-K2 or Anthropic Claude 4.7 (direct SDK) | ~500ms | Substrate-keyword detected, code generation |
| **2.5 (deliberation, NEW)** | Claude Sonnet 4.6 / Opus 4.7 + extended thinking | 5-30s | Substrate reasoning, hard refactors, "think hard about..." |
| 3 (cold) | CLI subprocess (claude-code, codex, gemini, opencode) | <300ms cold / <100ms warm (pre-warmed pool) | Multi-file refactors, long-context CLI workflows |

Tier 0 routes any utterance starting with "think hard about", containing SIP/STACK/vertical keywords, or flagged by classifier into Tier 2.5. Voice UX: Tier 2.5 emits an immediate "Let me think on that..." utterance before deliberation runs.

### 7.2 Tool layer (MCP)

The sidecar maintains a single MCP client that connects to 10 MCP servers (stdio for local, HTTP for cross-machine). All tools surface to the LLM through a unified capability registry. **Smart tool selection** (only expose 12-20 most-relevant tools per turn) prevents context rot — 2026 winning pattern from isair/jarvis and Thoth.

| MCP server | Purpose | Source |
|---|---|---|
| `starlight-voice-mcp` (published) | Drive starlight-voice from outside (utterance injection, control, state) | This repo |
| `starlight-mcp` | SIS substrate operations (vault read/write, IS query) | SIS, already shipped |
| `memory-bus` | Singleton vector memory daemon | SIS, shipped 2026-05-03 |
| `cross-repo-indexer` | 520+ atoms across 22 projects | SIS, shipped 2026-05-03 |
| `arcanea-mcp` | Canon, world, character ops | Arcanea, existing |
| `cockpit-mcp` | 8 cockpit-continuity tools | SIS, existing |
| `browser-use-mcp` | Headless browser automation (NEW) | starlight-voice bundles |
| `claude-code-cli-mcp` | claude-code CLI as MCP server (pre-warmed) | starlight-voice bundles |
| `codex-cli-mcp` | codex CLI as MCP server (pre-warmed) | starlight-voice bundles |
| `gemini-cli-mcp` | gemini CLI as MCP server (pre-warmed) | starlight-voice bundles |
| `opencode-cli-mcp` | opencode CLI as MCP server (pre-warmed) | starlight-voice bundles |

## 8. Surfaces

| Surface | When | Always-on? | Auto-started at logon? |
|---|---|---|---|
| **Tray icon** (Tauri) | Daily-driver, the One True Surface | Yes | Yes (one hidden scheduled task) |
| **PTT hotkey** | Whenever `Ctrl+Shift+Space` pressed | Background daemon | N/A — hotkey is global |
| **Clap ambient** | Opt-in via tray menu | When toggled on | No |
| **Phone PWA** (post-MVP, week 4-6) | Off-machine, WebRTC over LAN/tunnel | On-demand | No |
| **Brain viz web app** | Opt-in, intentional open from tray menu | No | **No — NEVER at logon** |
| **Text-mode CLI** | Developer/debug | No | No |

**Key UX change:** Brain viz becomes a separate Next.js app (salvaged from Arcanea `presence` package's Lumina orb GLSL) that user opens from tray menu ("Show Brain") when they want postmortem of recent dispatches. Closes on "Hide Brain". Never blocks boot, never holds a port at idle. Closes the `feedback_cockpit_holds_3007` issue.

## 9. Boot / install / autostart discipline — THE chaos kill

The installer (signed Tauri `.exe`) does all of this:

1. **Creates exactly ONE Windows scheduled task:** `StarlightVoice-Tray` — `AtLogOn`, `WindowStyle=Hidden`, runs `tauri-binary.exe --hidden`. Hidden window enforced by `tauri-plugin-autostart` (battle-tested across Cursor, Comet, Warp). The Tauri binary is GUI-subsystem-flagged — Windows never allocates a console.
2. **Removes all 11+ legacy scheduled tasks** with one confirmation dialog listing them:
   - `Arcanea24x7`, `StarlightCockpit`
   - `Cockpit-Auto-Rehydrate-On-Login`, `Cockpit-Auto-Save-Morning`, `Cockpit-Auto-Save-Evening`, `Cockpit-Periodic-Snapshot`, `Cockpit-Shutdown-Snapshot`, `Cockpit-Weekly-GC`
   - `Starlight Dreaming`, `StarlightCrossRepoIndexer`, `StarlightPortfolioAudit`, `StarlightSubstrateBackup`
3. **The daily/weekly jobs they ran (consolidate, backup, audit, indexer) move INTO the Tauri sidecar** as in-process scheduled jobs (APScheduler or equivalent), gated by config. One process owns all scheduling. One log. One debug surface.
4. **Startup folder cleanup:** `arcanea-voice-daemon.lnk` (persona=lumina, competing with orb) archived to `Startup\_archive\`. `Comet.lnk` left alone (not voice's concern; Frank's call). Warp warning shown if its visible-window pattern is causing terminal-flash pain.
5. **No console window at any point during install or run.** No `cmd.exe /c` actions in any task. No `pwsh` spawns from the scheduled task. The death of `tools/fix-hide-task-windows.ps1` is the signal that the new architecture worked.
6. **Uninstall is symmetric:** removes the one scheduled task, restores any archived shortcuts, leaves data dirs intact (configurable).

## 10. Migration path

### 10.1 Salvage from SIS (`private/voice-operator/`)

- `service/cognition/router.py` → Pipecat `CognitionRouter(FrameProcessor)`. Multi-tier logic preserved.
- `service/clap_detector.py` → straight port. Tests port.
- `service/text_mode.py` `_execute_packet()` → MCP-aware dispatch handler.
- `service/wake_word.py` → archived (no wake-word in v3).
- `config/routing.toml`, `components.toml`, `mcp-servers.toml` → new repo config.
- 11 workflow YAMLs → port as-is.
- `tests/` (53 files) → port as contract.
- `tray.py` (128 LoC) → archived; replaced by Tauri Rust tray.

### 10.2 Salvage from Arcanea (`Arcanea/packages/arcanea-voice/`)

- `src/workflows.mjs` (newer workflow shapes from 2026-05-06+) → port to YAML.
- `src/server.mjs:routeViaCognitionBridge` wire pattern → archive as design reference.
- `packages/presence/` Lumina orb GLSL → salvaged into opt-in brain viz web app.
- Voice/STT/TTS code: **discarded**; Pipecat + Deepgram/Cartesia covers it better.

### 10.3 Archive (90-day grace, then delete)

- SIS: `mv private/voice-operator private/voice-operator-archive-2026-05-14/` + README pointing to new repo.
- Arcanea: tag `arcanea-voice` + `arcanea-voice-agent` packages as `"deprecated": true` in `package.json`; remove from monorepo builds; physical deletion after Q3 2026.

### 10.4 Delete immediately (at end of week 1)

- 11+ legacy scheduled tasks (`uninstall-legacy-tasks.ps1` one-shot script).
- `arcanea-voice-daemon.lnk` from Startup folder (with backup).
- `tools/fix-hide-task-windows.ps1`, `tools/diag-cockpit-tasks.ps1`, `tools/diag-scheduled-tasks.ps1`, `tools/diag-post-reboot.ps1`, `tools/diag-probe.ps1`.
- `COGNITION_BRIDGE_URL` env var (disabled-since-2026-04-30; purpose now native).

## 11. Cross-repo bridges — MCP-only

**No SSE hacks. No `:3007/api/brain/inject` POSTs. No shared file mailboxes. No named pipes.**

- **starlight-voice publishes 1 MCP server:** `starlight-voice-mcp` — others can drive it (utterance injection, control commands, state queries, event log subscription).
- **starlight-voice consumes 10 MCP servers** (listed in §7.2).
- **SIS substrate placement:** starlight-voice is **not** added to STACK.md's 10-IS. It is a **host** that consumes the substrate — peer to Claude Code, Cursor, Codex CLI. The 10-IS taxonomy stays clean. Voice & Video IS (#8 in STACK.md) remains a content-production framing, not a runtime.
- **Arcanea perspective:** Arcanea monorepo deprecates its voice packages; consumes starlight-voice via `starlight-voice-mcp` for any creative-workflow voice triggering.

## 12. Performance & speed — four pillars

### 12.1 Fast CLI triggering — pre-warmed dispatcher fleet

- **In-process SDK paths** for providers with Python SDKs: Anthropic (`anthropic`), OpenAI (`openai`), Google (`google-generativeai`). Zero subprocess overhead. TTFT = pure provider latency (~160ms Cerebras, ~500ms Anthropic with prompt caching).
- **Pre-warmed subprocess pool** for CLI-only paths (`codex`, `opencode`, future external CLIs). Sidecar spawns 1 persistent process per CLI at boot, idle, listening on stdin. Dispatch becomes a stdin write + stdout read, not a `Popen()` cold start.
- **Health-check heartbeat** every 60s. Dead subprocesses respawned proactively.
- **Routing tier** picks in-process SDK (hottest) → pre-warmed subprocess (warm) → one-shot fallback (cold) based on intent class.
- **Result:** voice command → CLI agent acting in **<300ms cold, <100ms warm**.

### 12.2 Browser use — first-class MCP server

- Bundle [browser-use](https://github.com/browser-use/browser-use) (2026 leader for LLM-driven browser automation) as built-in MCP server (`browser-use-mcp`).
- Headless Chromium pre-warmed at sidecar boot. Single instance reused across calls.
- Voice "open arxiv and find the latest Llama 4 Scout paper" → `browser_use.search_and_extract()` → page text + screenshot in ~2s cold.
- Warm navigation: <500ms.
- Capabilities: page navigation, content extraction, form fill, screenshot, link click — typical agentic browser pattern.

### 12.3 Top-notch thinking — Tier 2.5 Deliberation mode

- **Trigger:** explicit voice request ("think hard about this..."), substrate-keyword detection (anything matching SIP / STACK / vertical-naming), or Tier 0 classifier flag.
- **Backend:** Claude Sonnet 4.6 / Opus 4.7 with **extended thinking enabled**. Thinking budget: 8K–32K tokens.
- **Voice UX:** sidecar emits immediate "Let me think on that..." utterance, then runs deliberation in background. Returns spoken answer in 5–30s.
- **Co-exists with Tier 1** (Cerebras hot path). ~5-10% of utterances hit deliberation; ~90% stay on hot path.

### 12.4 Sub-800ms full-loop SLA + CI benchmark gate

Per-stage P50 budgets (mic-close to first speaker output):

| Stage | Target P50 | Provider |
|---|---|---|
| VAD turn detection | 90ms | Silero VAD (CPU) |
| STT first partial | <300ms | Deepgram Flux (streaming, integrated turn) |
| LLM first token | <200ms | Cerebras Llama-4 (Tier 1) |
| TTS first audio | <100ms | Cartesia Sonic-2 |
| **Total mic-close → first audio** | **<800ms** | hot path |
| Tier 2 (substrate code) | <2s | — |
| Tier 2.5 (deliberation) | 5-30s | extended thinking |

`benchmarks/` directory contains end-to-end latency probes. PR CI gate fails build if any stage exceeds P50 budget by >20%. Nightly runs against real providers with cost cap.

## 13. Phased rollout — B-velocity, C-outcome

### Weeks 1-3: MVR core — kill chaos, daily-drive new

- Tauri tray + PTT hotkey + autostart-hidden (single scheduled task)
- Python sidecar with Pipecat pipeline
- Deepgram Flux + Cerebras Llama-4 + Cartesia Sonic-2 (2026 stack)
- In-process Anthropic/OpenAI/Gemini SDK paths (eliminates subprocess cold-start)
- 3 MCP servers wired: starlight-mcp, memory-bus, claude-code-cli-mcp
- Legacy-task killer one-shot script
- 53 SIS tests ported as contract
- Benchmark CI gate active
- **Frank dogfoods daily start of Week 2**

### Weeks 4-6: B-tier surfaces

- Clap ambient mode (opt-in)
- Browser-use MCP bundled
- Tier 2.5 Deliberation mode wired
- 5 more MCP servers: cross-repo-indexer, arcanea-mcp, cockpit-mcp, codex/gemini/opencode pre-warmed
- Phone PWA over LAN (WebRTC)
- Brain viz as opt-in standalone web app (Lumina orb salvaged)
- Signed installers: `.exe` + `.dmg` + `.deb`

### Weeks 7-12: C-tier excellence

- Pipecat frame middleware: PII redaction, tool-call observability, retry budgets
- WebRTC for phone with Cloudflare tunnel
- Continuous benchmark CI enforcement; sub-800ms SLA hard gate
- Sovereign-spawn validator (Ana one-shot installer)
- OSS public launch: README, demo video, contributor guide, INSTALL.md
- Positioned as "the open-source reference impl of a Jarvis-grade personal voice operator"

## 14. Testing strategy

- **Contract:** 53 SIS Python tests ported; any test that should still hold must hold against new impl.
- **New tests:**
  - Tauri integration: tray-icon-visible, hotkey-fires-globally, autostart-hidden-window-verified
  - MCP client: tool-registry, smart-tool-selection-per-turn, MCP-overhead-under-50ms
  - Pre-warmed pool: cold vs warm dispatch latency
  - Deliberation: "Let me think on that..." utterance fires immediately, extended-thinking gated correctly
  - Browser-use: navigation, extract, screenshot
  - Benchmark CI: per-stage P50 budget enforcement (auto-fail on >20% regression)
- **Integration:** full mic→audio-out loop with mocked + real providers (real gated on cost).
- **Smoke:** nightly real-provider runs against staging API keys.

## 15. Error handling

- **Provider failure:** auto-failover (Deepgram → Whisper-local, Cerebras → Groq → Claude-direct, Cartesia → ElevenLabs Flash). Voice operator never silent. Degraded mode always available.
- **MCP server crash:** auto-restart with exponential backoff. Tool unavailable → graceful "I can't reach <tool> right now."
- **Sidecar crash:** Tauri shell auto-respawns. Audio buffer preserved through restart.
- **Hotkey conflict:** detected at boot, user prompted to choose alternative; suggestion list ranked by likelihood of conflict.
- **Audio device change:** live re-detection. USB BRIO unplugged → fallback to built-in mic with notification.
- **Network offline:** clear degraded indicator; prefer local Whisper + Ollama (post-MVP) if installed.

## 16. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tauri sidecar IPC overhead dominates latency budget | Low | High | Benchmark sidecar IPC in week 1; fallback to shared-memory ring buffer if stdio insufficient |
| Pre-warmed subprocess pool consumes too much idle RAM | Medium | Medium | Configurable pool size; default 1 per CLI; idle-evict after 30min |
| Pipecat framework breaking changes during 12-week build | Medium | Medium | Pin Pipecat version; vendor-bump explicitly with CI verification |
| Browser-use cold-start exceeds 3s | Medium | Low | Lazy-start on first browser intent, not at boot; warn user once |
| Deliberation lane misroutes hot-path utterances → user waits unnecessarily | Medium | High | Tier 0 classifier accuracy testing; allow runtime override ("answer fast") |
| MCP server fleet startup time exceeds 5s | High | Medium | Lazy-start MCP servers on first tool call from each server |
| Migration scripts delete legacy tasks that user wants to keep | Low | High | Confirmation dialog with list before deletion; auto-backup of scheduled-task XML |
| Cartesia API pricing makes daily use cost-prohibitive | Low | Medium | Fallback to ElevenLabs Flash; configurable budget cap |
| Frank's existing PowerShell automation breaks when scheduled tasks removed | Medium | Medium | Document task removal in INSTALL.md; provide one-shot restore script |
| OSS launch reveals security issues in voice-loop | Low | High | Pre-launch security review pass; `/openclaw-audit` before public README |

## 17. Open questions / future work

- **Naming:** Working name `starlight-voice`. Final call before first commit. Alternatives surfaced during brainstorming: `jarvis`, `oracle-voice`, `sovereign-voice`, `frankx-voice`.
- **macOS / Linux parity:** spec focuses on Windows (Frank's daily-driver). Tauri delivers cross-platform but installer-discipline details (no `cmd.exe` flash) are Windows-specific. macOS uses LaunchAgents, Linux uses systemd user units — pattern is identical, names differ. Out-of-scope for v3 MVR; in-scope for week 7-12.
- **On-device Ollama integration** for fully-offline mode: not in v3 scope but architecturally trivial via in-process router tier. Decision deferred.
- **Memory consolidation pattern** for ambient mode: when clap-ambient is on for 8h+, what's the rolling buffer policy? Defer to v3.1.
- **Phone PWA auth model:** bearer token (existing) vs. mTLS vs. Tailscale. Defer to week 4-6.
- **/starlight-board pre-pass:** required before any commit/tag that touches SIS substrate files (migration scripts, legacy-task killer, cross-repo MCP contracts). Implementation of starlight-voice itself proceeds without pre-board (operational-tier inside its own repo).

## 18. Success criteria (falsifiable)

| # | Criterion | Verification |
|---|---|---|
| SC1 | At logon: zero visible terminals, zero visible browsers, single hidden tray icon | Boot, count visible windows, verify only StarlightVoice tray icon present |
| SC2 | PTT hotkey works globally within 200ms of boot completion | `time-to-hotkey-ready` benchmark |
| SC3 | Full mic-close → first speaker audio P50 <800ms over 50 utterances | `benchmarks/run.py --probe e2e-hot-path --n=50` |
| SC4 | CLI dispatch (claude-code) cold <300ms, warm <100ms | `benchmarks/run.py --probe cli-dispatch` |
| SC5 | Browser-use navigation cold <2s, warm <500ms | `benchmarks/run.py --probe browser-use` |
| SC6 | Deliberation mode emits "Let me think on that..." within 500ms of activation | Tier 2.5 utterance log timestamp |
| SC7 | 53 SIS Python tests green against new impl | `pytest sidecar/tests/` exit 0 |
| SC8 | Legacy 11+ scheduled tasks all removed; zero `cmd.exe` flashes at logon | `Get-ScheduledTask` returns only `StarlightVoice-Tray` |
| SC9 | Ana installs and runs starlight-voice on her own machine with <30min Frank touch | First sovereign-spawn dogfood |
| SC10 | OSS repo public, MIT-licensed, README + INSTALL.md + demo video shipped | GitHub repo public + first non-Frank star |

## 19. Appendix A — audit findings (2026-05-14)

Detailed findings from the four parallel investigation agents are preserved in this conversation's transcript and should be read alongside this spec. Key tables:

### A.1 Auto-start surface — 12 scheduled tasks + 7 Run-key/Startup entries

Logon-triggered: `Arcanea24x7`, `StarlightCockpit`, `Cockpit-Auto-Rehydrate-On-Login` (disabled).
Time/event: `Cockpit-Auto-Save-Morning`, `Cockpit-Auto-Save-Evening`, `Cockpit-Periodic-Snapshot`, `Cockpit-Shutdown-Snapshot`, `Cockpit-Weekly-GC`, `Starlight Dreaming`, `StarlightCrossRepoIndexer`, `StarlightPortfolioAudit`, `StarlightSubstrateBackup`.
Startup folder: `arcanea-voice-daemon.lnk`, `Comet.lnk`.
HKCU\Run: `Warp` (no hidden flag), 2× Comet entries.

Visible-window sources at logon: `Arcanea24x7` cmd.exe flash, WSL Ubuntu shell, `Comet.lnk`, `Warp`.

### A.2 SIS ↔ Arcanea overlap

| Concern | SIS owns | Arcanea owns | Verdict |
|---|---|---|---|
| Voice activation | `private/voice-operator/` (Python) | `Arcanea/packages/arcanea-voice/` (Node MJS) | Duplicated |
| TTS / STT | Python `:7373` | Node `:7777` | Duplicated |
| Cognition routing | LCC `cognition-router` (6 backends) | `arcanea-voice-agent` + `orchestrator` | Duplicated |
| Workflow execution | `workflow_runner.py` | `flow-engine` + `swarm-coordinator` | Duplicated |
| Memory / vector | Memory Bus v0.1 | `memory-mcp` + `guardian-memory` + `hybrid-memory` | Duplicated |
| Orb / visual UI | Dashboard `:3007` brain-viz | `presence` Lumina orb (GLSL) | Two orbs |
| MCP servers | `starlight-mcp`, Memory Bus | `arcanea-mcp`, `memory-mcp`, `arcanea-registry-mcp` | Functional overlap |

### A.3 World-class 2026 reference impls

- **Pipecat** (~30k stars, weekly commits) — dominant 1:1 voice-assistant framework; pipeline mental model wins on DX.
- **LiveKit Agents** (~10k+) — production scale, tight media routing.
- **isair/jarvis** — 100% local, name-detection-in-stream, unlimited MCP tools.
- **OpenClaw** — 9k→210k stars Jan 2026, local-first, viral on "personal sovereignty."
- **Thoth** — Ollama-first tray app, Kokoro TTS, one-click installer.
- **Wispr Flow** — dictation reference; PTT hotkey + cloud STT.
- **Open Interpreter `01`** — pivoted from hardware to phone-driving-desktop (key signal: dedicated AI hardware lost).

### A.4 2026 latency leaders

- STT: Deepgram Nova-3 / Flux <300ms streaming; ElevenLabs Scribe v2 + AssemblyAI Universal-3 competitive.
- LLM TTFT: Cerebras Llama 4 70B 0.16s P50 / 520 TPS; Groq Llama-4-Scout 0.6s TTFT / 446-460 t/s.
- TTS: Cartesia Sonic-2 ~90ms TTFA (40ms Turbo); ElevenLabs Flash v2.5 sub-100ms TTFB; Groq Orpheus emotional tier.
- End-to-end target: <800ms mic→audio-out is the 2026 Jarvis bar.

---

**Next step after Frank reviews this spec:** invoke `writing-plans` skill to produce week-by-week implementation plan.
