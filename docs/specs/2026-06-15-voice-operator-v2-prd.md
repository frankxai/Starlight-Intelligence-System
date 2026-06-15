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

*Built on SIP. Review this doc, resolve §9, then P0→P1 execution begins.*
