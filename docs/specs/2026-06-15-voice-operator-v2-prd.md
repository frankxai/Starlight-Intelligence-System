# Voice Operator v2 — PRD + Final Architecture

> **Status:** Draft for review (2026-06-15). Supersedes the optimistic state in
> `2026-06-15-jarvis-voice-operator-state-snapshot.md` (Antigravity export) where the two disagree.
> **Core decision (Frank, 2026-06-15):** harden `starlight-voice` as the engine; pull deepagents/LangGraph in as the
> *workflow/loop engine behind* the operator — not a re-foundation.
> **Tier:** Operational (Front-Door). **Voice:** Frank DNA. Built on SIP.

---

## 0. Why this doc exists

The voice stack has been described as "Jarvis-grade and e2e," but the **ground truth on disk contradicts that**:

- `starlight-voice/README.md` says verbatim: *"This repo is portable but not finished."*
- **There is no STT→LLM→TTS voice loop yet.** Text-mode intent routing works; the realtime audio path is unbuilt.
- Pipecat is **not installed** in the local Python env; ElevenLabs/Picovoice keys are **not populated**.

So "shitty bad latency / not properly e2e" is accurate — and it is **not a tuning problem**. You cannot tune a loop that
isn't closed. This PRD's #1 job is to close that loop, measured against a latency SLA, before adding sophistication.

---

## 1. Problem statement

Frank runs 5+ parallel coding sessions while mobile. He needs a **voice cockpit** that:
1. Hears him (push-to-talk now, ambient later) and responds in **conversational time** (sub-second first audio).
2. Classifies intent and either answers, captures to memory, or **dispatches executable work to the right coding agent**.
3. Runs **multi-step workflows and loops** (morning brief, evening handover, file triage) — not just one-shot replies.
4. Understands his **domains/repos/projects** and **proposes actions proactively** (overnight analysis → morning surfacing).
5. Gates risky actions behind approval tiers; never acts irreversibly without ack.

## 2. Goals / Non-goals

**Goals (v2)**
- G1. **Close the realtime voice loop** with a measured P50 first-audio ≤ 800ms, P95 ≤ 1500ms.
- G2. **One canonical engine** (`starlight-voice`) that is `git clone` + one-command installable on a second laptop.
- G3. **Workflow engine** (deepagents/LangGraph) behind the operator for durable loops + human-in-the-loop.
- G4. **Coding-agent dispatch** driven by `CODING_AGENTS_REGISTRY.md` routing protocol.
- G5. **Proactive layer**: overnight repo/domain analysis → a spoken morning brief of suggested actions.
- G6. **Documented provider choices** (STT/TTS/runtime) with the selected default + rationale + fallback.

**Non-goals (v2)**
- N1. Re-founding on OpenCode-at-core (evaluated, deferred — see §9).
- N2. Ambient room hardware (ReSpeaker array) — Phase 5, hardware-dependent.
- N3. Cloud-managed/hosted agent fleet — long-horizon; v2 is local-first.
- N4. Multi-user / community SaaS. Sovereign-by-design, single operator.

## 3. Personas & primary user flows

**Persona:** Frank — operator, often mobile, hands occupied, low tolerance for hedging/latency.

**Flow A — Command (answer or act):**
`PTT press → speak → STT → router classifies → {answer via TTS | build handoff packet → approval gate → dispatch}`

**Flow B — Capture (zero friction):** `"Starlight, note: …" → STT → memory vault write → ≤1 sentence confirm.`

**Flow C — Workflow/loop:** `"run the morning brief" → workflow engine executes multi-step graph → spoken 45s summary.`

**Flow D — Proactive (the Jarvis differentiator):**
`overnight cron → analyze git/repos/calendar/open loops → rank suggested actions → at session-start, speak top 3 + offer to dispatch.`

**Flow E — Coding dispatch:** `"refactor the auth module in FrankX" → packet → route to Claude Code (complexity 7-8) → Tier-B ack → execute → spoken receipt.`

## 4. Final architecture

```
 mic ─► [STT]  ─► [Intent Router]  ─► [Workflow Engine]  ─► [Approval Gate]  ─► [Executors] ─► [TTS] ─► speaker
        Whisper    starlight-voice     deepagents/          Tier A/B/C          arco / coding    ElevenLabs
        / Deepgram  cognition/router    LangGraph                                agents / browser  / Cartesia
                         │                    │                                   / memory vaults
                         └──── handoff-packet (YAML contract) ───────────────────┘
                         proactive cron ─► repo/domain analyzer ─► suggestion queue ─► morning brief
```

**Layer ownership:**
| Layer | Component (today) | v2 work |
|---|---|---|
| Audio I/O + PTT | (none) | Pipecat capture/playback + global hotkey over IPC |
| STT | (none wired) | `faster-whisper` large-v3 local default; Deepgram Nova-3 cloud fallback |
| Intent Router | `sidecar/.../cognition/router.py` ✅ | extend to emit handoff-packet; wire RRF memory recall |
| Workflow engine | (none) | deepagents/LangGraph graphs for loops/HITL/durable state |
| Approval gates | spec'd (Tier A/B/C) | implement Tier-B push/toast + ack wait |
| Executors | `arco` (coding), `browser.py` (dry-run) ✅ | live coding dispatch via registry; browser sandbox |
| TTS | (none wired) | ElevenLabs Turbo v2.5 streaming default; Cartesia Sonic-2 fallback |
| Shell | Tauri tray scaffold ✅ | sidecar lifecycle (pause/resume/quit), tray status |
| Proactive | (none) | overnight analyzer cron → suggestion queue → morning brief |

**Why harden starlight-voice (not re-found):** it already ships the router, IPC contract, machine-doctor, browser seam,
CI, and reproducible build — ~80% of the chassis. The missing 20% is the audio loop + workflow engine + proactive layer.
deepagents/LangGraph slot in *behind* the router as the loop engine, giving sophisticated workflows without discarding work.

## 5. Provider choices (documented — selected + alternatives)

| Stage | Selected default | Why | Fallback / alternatives considered |
|---|---|---|---|
| **STT** | faster-whisper large-v3 (local) | privacy, no per-min cost, ~80–300ms | Deepgram Nova-3 (cloud, fastest); whisper.cpp; Groq Whisper |
| **TTS** | ElevenLabs Turbo v2.5 (streaming) | best quality + streaming first-audio | Cartesia Sonic-2 (lowest latency); Groq/Orpheus (225ms, cheapest — see memory); Piper (offline) |
| **Wake/PTT** | PTT hotkey `Ctrl+Shift+Space` first | deterministic, no false fires | Picovoice Porcupine wake-word; 2-clap gesture (see `feedback_clap_over_wake_word`) |
| **LLM (router)** | Groq llama-4-scout (fast path) | <200ms routing | Opus 4.8 / Fable 5 deliberation path; OpenRouter gateway per global doctrine |
| **Workflow engine** | LangGraph + deepagents | durable graphs, HITL, sub-agents | raw asyncio loop (rejected: no durability); Dify (rejected: heavyweight, hosted-leaning) |

> Latency note: Groq Orpheus measured 225ms TTS vs ElevenLabs 5226ms in a prior cold test (memory
> `project_jarvis_intelligence_layer`). **Validate ElevenLabs *streaming* first-audio before locking the default** — the
> 5226ms figure was non-streaming. If streaming doesn't hit ≤800ms, default to Cartesia/Groq.

## 6. Coding-agent fleet & routing

Source of truth: `agents/CODING_AGENTS_REGISTRY.md` (complexity-based routing + `cl`/`cd`/`gr`/`opencode`/`dcode`/`agy` grid).

- Complexity 1–3 → OpenCode / Codex (speed, minimal cost)
- Complexity 4–6 → Cursor / Cline (interactive)
- Complexity 7–8 → **Claude Code** / Antigravity (autonomous, deep context)
- Complexity 9–10 → DeepAgent / Starlight Hive (sub-agent delegation)

**⚠ Correction required before this registry is trusted at runtime:** its model IDs are stale
(`claude-3-5-sonnet`, `gpt-4o`, `grok-2`, `gemini-1.5-pro`, `llama-4-scout`). June-2026 reality per `~/.claude/CLAUDE.md`:
Claude Code = Opus 4.8 / Fable 5; GPT-5; Grok-4; Gemini 3; OpenRouter model strings are canonical. Update before the
router reads it programmatically (`routing-table.json`).

## 7. Proactive layer (the Jarvis differentiator)

Overnight cron (~04:30, after existing StarlightSecretScan):
1. Scan active repos for uncommitted/unpushed/diverged state, open loops, stale branches.
2. Pull calendar + pending Tier-B approvals.
3. Rank into a **suggestion queue** (`memory/suggestions-<date>.json`).
4. At first session of the day / on "morning brief", speak top 3 + offer one-tap dispatch.

This reuses the exact audit pattern that just found your real portability gaps (claude-code-config divergence,
awesome-jarvis no-remote, arcanea-opencode archived) — productize that audit into the overnight run.

## 8. Phased buildout (verifiable definition-of-done)

| Phase | Scope | Done means (checkable) | Est |
|---|---|---|---|
| **P0 Portability** | sync repos, commit registry+docs, fix install | `git clone starlight-voice` + 1 cmd → tests green on a 2nd machine | 0.5d |
| **P1 Voice loop** | Pipecat + PTT + STT + TTS round-trip | press hotkey, speak, hear reply; **P50 first-audio ≤800ms** logged | 1–2d |
| **P2 Router→packet** | router emits handoff-packet + RRF recall | utterance → valid YAML packet w/ correct intent_class + tier | 1d |
| **P3 Workflow engine** | LangGraph graphs; morning-brief + evening-handover | "run morning brief" → spoken 45s summary from real git/cal data | 2d |
| **P4 Coding dispatch** | live dispatch via registry + Tier-B ack | voice → packet → Claude Code edits file → spoken receipt | 1–2d |
| **P5 Proactive** | overnight analyzer → suggestion queue | morning brief speaks top-3 suggested actions unprompted | 1d |
| **P6 Ambient** | room mic array + wake word | hands-free room activation (hardware-gated) | later |

## 9. Open decisions / risks (need Frank or a guardian)

1. **`claude-code-config` divergence (ahead 4 / behind 5)** — NOT auto-merged. Real conflicts likely on the
   starlight-arcanea command layer + live uncommitted edits in `~/.claude`. **This is the #1 reason your two laptops
   are out of sync.** Needs: explicit "merge, prioritize local" or a manual reconcile pass.
2. **`arco` orchestrator not cleanly installable** — `@arcanea/orchestrator` is npm-linked to the Arcanea monorepo
   build, not a publishable package. Second-laptop install needs clone+build+link. See install guide (P0).
3. **`arcanea-opencode` remote is archived (read-only)** — 2 local commits stranded. Un-archive or re-point remote.
4. **GEMINI_API_KEY is an OpenRouter-format key** (73 chars) in the Gemini slot — no live Gemini/NB2/Veo until rotated
   to a real 39-char `AIza…` key (see memory `feedback_gemini_key_slot_check_first`).
5. **Provider keys** (ElevenLabs, Picovoice) must be populated in `private/voice-operator/config/components.toml` before
   P1 can run live; verify `private/` push-safety first (it is NOT gitignored — secrets must not be committed).
6. **Registry model IDs stale** (§6) — correct before programmatic routing.

## 10. Validation / test strategy

- **P1 gate:** latency harness logs first-audio per turn; fail the phase if P50 > 800ms.
- **P2 gate:** packet schema validation (the YAML contract) on a fixture set of 20 utterances across all 7 intent classes.
- **P3/P4 gate:** workflow runs against *real* git/calendar state, output diffed vs expected; `@integrity-guard` on any
  publish-class action; subagent-authored code → `/code-review` before ship (memory `feedback_subagent_code_needs_review_before_ship`).
- **Machine:** run `/pp fix` to GREEN before any parallel-agent research/build phase (RED zone blocks swarm today).

---

## 11. v2.1 — Validated architecture (research swarm wf_33ae075a-60a, 2026-06-15)

13-agent best-of-breed research + adversarial verify + synthesis. All 6 layer recommendations held *with corrections*.
The corrections changed two load-bearing things in §4–§5 above — this section supersedes them where they conflict.

### 11.0 CLOUD-FIRST decision (2026-06-15, supersedes the local-first default below)
The research defaulted local-first (privacy + zero per-min cost). **Frank's call: cloud-first.** On the GTX 1650
(4GB, no Tensor cores) cloud is *faster*, frees the GPU for parallel sessions, and removes the multi-GB CUDA install.
Verified live keys (OpenRouter, Groq, OpenAI, ElevenLabs) make a full cloud loop runnable **today with no new keys**:
- **STT** = Groq `whisper-large-v3-turbo` via OpenRouter `/audio/transcriptions`
- **LLM** = OpenRouter, FAST tier pinned to Cerebras *through* OpenRouter (no direct Cerebras key needed)
- **TTS** = ElevenLabs Flash v2.5 streaming (Cartesia Sonic-3.5 when a key is added)

Local engines (faster-whisper / Kokoro / Piper) remain selectable as an **optional offline/private tier** via env vars
+ the `voice-local` extra. Cloud-first makes the install LIGHT (`pipecat-ai` + `pyaudio`, no CUDA) — the only missing
dep on Frank's machine is now `pipecat` itself. The §11.2 table below lists the local choices as the *fallback* tier;
the cloud rows are the **default**.

### 11.1 Architecture flip — audio runs IN-PROCESS, not over IPC
The v2 diagram (§4) had audio crossing the stdio IPC. **Wrong.** `ipc.py` and `pipeline.py` are fully *synchronous*
request/response; the realtime loop is async. So: **run the whole Pipecat graph in-process inside the Python sidecar**
(PyAudio/WASAPI mic→STT→LLM→TTS→speakers), and let Rust/Tauri do **only** PTT hotkey + tray + lifecycle. This avoids
the sync→async IPC rewrite and the persistent-piped-child `sidecar.rs` rewrite (the two riskiest seams) for the MVP.

### 11.2 Validated stack
| Layer | Choice | Fallback |
|---|---|---|
| Framework | **Pipecat 1.0+** in-process (new async `voice_loop.py`) | hand-rolled async loop reusing `CognitionRouter`; not LiveKit/Vocode |
| Turn/barge-in | **LocalSmartTurnAnalyzerV3** (ONNX, CPU, ~12–65ms) | Silero VAD |
| STT default | **faster-whisper large-v3-turbo INT8** (CUDA) | base/small INT8, or CPU if VRAM-bound |
| STT cloud lane | **Groq whisper-large-v3-turbo** via OpenRouter `/audio/transcriptions` (not chat) | Deepgram Nova-3 WS |
| LLM | **OpenRouter streaming, FAST tier provider-PINNED to Cerebras** (`order`/`only` in request body, in `llm.py`) | other colocated fast provider; cloud S2S as deliberation-only |
| TTS default | **Kokoro-82M** (kokoro-onnx, Apache-2.0) — *gated on on-device latency+VRAM bench* | promote Cartesia; Piper (CPU) always-works |
| TTS cloud tier | **Cartesia Sonic 3.5** streaming (Sonic-2 is deprecated, cutover passed) | ElevenLabs Flash v2.5 (tightest IQR) |
| Workflow engine | **deepagents 0.6.10** on LangGraph 1.x + SqliteSaver, behind router for non-audio tiers only | raw LangGraph 1.x |
| Proactive + dispatch | **plain Python** (httpx + ulid-py); NO LangGraph for MVP | git+approval-scan only if MCP OAuth flaky |

### 11.3 Corrections folded in (these were wrong in v2 / the brief)
- `config.py` has **no Settings schema** — only `load_local_env()`. A `Settings` schema must exist *before* anything
  can select STT/TTS engine. **Build it first.**
- `router.decide()` does **not** select engine/provider and must not — it only classifies tier. Provider-pin-by-tier
  lives in `llm.py`; TTS engine selection is a separate function.
- **`ctranslate2>=4.8.0` is mandatory** — the cp313 Windows wheel only landed 2026-06-06; older pins fail to install on
  Python 3.13. Needs cuDNN 9 / CUDA 12.3+.
- deepagents **silently defaults to Anthropic** unless the model is explicitly constructed as
  `ChatOpenAI(base_url=OpenRouter, api_key=OPENROUTER_API_KEY)`. RCE fix lives in `langgraph-checkpoint(-sqlite)`, not core.
- Registry model IDs were **never actually staged** — fixed fresh this session (Fable 5 takes the 7–10 seat; Gemini CLI
  dies 2026-06-18 → `agy`).

### 11.4 The #1 risk — the SLO is tight, so bench FIRST
P50 ≤800ms first-audio is **achievable but not comfortable** on the GTX 1650 (Turing, 4GB, no Tensor cores). Realistic
summed latency can reach ~1100ms once OpenRouter TTFT variance (~640ms observed) stacks on local STT+TTS GPU contention,
and **Whisper INT8 + Kokoro do not comfortably co-reside in 4GB VRAM** (plan to put one on CPU). Therefore the
**first deliverable is the on-device e2e first-audio probe** (`benchmarks/` + a `voice` subcommand), measured to
*playable* audio (past WAV/Ogg/ID3 container headers that falsely report ~50ms). Prove the number before building the
full graph against it.

### 11.5 Implementation sequence (validated)
1. **Bench-first gate:** `voice` subcommand + e2e first-audio probe. *(foundation laid this session)*
2. `config.py` **Settings** schema. *(this session)*
3. `pyproject.toml` deps: pipecat-ai≥1.0, pyaudio, ctranslate2≥4.8.0, cuDNN9, faster-whisper, kokoro-onnx, piper. *(this session)*
4. `adapters/stt.py` + measure **peak** VRAM.
5. `adapters/llm.py` with explicit Cerebras provider-pin for FAST.
6. `adapters/tts.py`: Kokoro first; measure first-chunk under Whisper contention; Piper fallback.
7. `voice_loop.py`: in-process Pipecat graph wrapping `CognitionRouter` as a FrameProcessor. **Closes P1.**
8. `ipc.py` async migration (or run runner in a thread) + server-push notifications (contract-safe).
9. Rust `hotkey.rs` + `autostart.rs`; `tauri-plugin-global-shortcut`. **[P1 complete]**
10. Proactive `analyzer.py` + `StarlightMorningBrief` 04:30. **[P2]**
11. Dispatch `fleet.py` + `dispatch.py`; replace `pipeline.py:52` CLI_AGENT stub. **[P2]**
12. Workflows: deepagents behind DELIBERATION/WORKFLOW tiers. **[P3]**

> Full machine-readable synthesis (dependency manifest, reuse list, build_new list, open_risks) archived at
> `docs/specs/2026-06-15-voice-operator-research-synthesis.json`.

---

### 11.6 Build status (2026-06-15, cloud-first)
SHIPPED + tested (starlight-voice, 32/32 green): Settings schema · adapter seams · `voice_loop.py`
in-process cloud graph (assembles, verified vs pipecat 1.3.0) · `voice --selftest|--run` · first-audio
bench gate · **dispatch** (`cognition/fleet.py`+`dispatch.py`, handoff-packet v1, approval tiers,
`dispatch` CLI, wired into pipeline) · **proactive** (`proactive/analyzer.py`, ranked brief, `brief` CLI).
REMAINING (need on-device / heavy install — handed off): live mic run + first-audio latency bench
(`voice --run`) · Rust `hotkey.rs` PTT (needs cargo) · deepagents P3 workflows (heavy install, deferrable)
· `StarlightMorningBrief` 04:30 task registration · `settings=` API migration + provider-pin wire-check.

*Built on SIP. v2.1 validated by adversarial research swarm. Bench-first: prove P50≤800ms on the 1650 before scaling.*
