# Jarvis Wave 3 — Real-Time Presence (Design Stub)

**Date:** 2026-05-11
**Tier:** substrate (touches voice-loop architecture, context envelope, privacy boundary)
**Status:** DESIGN-STUB — not yet implementation-ready
**Predecessor:** `2026-05-11-jarvis-grade-design.md` (commit d234ca3) cluster C
**Wave 1+2 shipped:** D1, A3, D2, C1, A1, A2, B1, B2 (this session)

---

## Why "stub" and not full design

Wave 3 is the biggest engineering of the three waves. Two sub-projects:
- **C2 — ambient listening** (always-on STT, VAD gate, clap-activation becomes "explicit mode" not "only mode")
- **C3 — multi-modal context envelope** (screen state, active app, calendar, recent commits, open files)

Each is its own design conversation. This document stages the WAVE 3 frame so future sessions know what's parked, what's un-park-triggered, and where to start.

Per the brainstorming-skill flow (which this entire 3-wave program followed), each Wave-3 sub-project gets:
1. Its own design doc (single spec, scope-decomposed)
2. Its own `/starlight-board` pre-pass
3. Its own implementation plan via `writing-plans`

---

## C2 — Ambient listening

**Symptom Frank felt:** Clap-activation is reactive only. Jarvis-Iron-Man is ambient — Tony talks, Jarvis answers without invocation.

**Current state:** Clap-activation shipped 2026-05-06 (per memory `project_v77_voice_operator_a1_b_c_shipped`). Wake-word fallback exists (Porcupine .ppn). VAD (Voice Activity Detection) not in the voice-operator pipeline today.

**Design dimensions (un-resolved):**
1. **Always-on STT cost:** Browser Web Speech API is free but cloud-dependent; local Whisper costs CPU. Privacy: does mic stream leave the machine? Frank's preference unknown.
2. **VAD gate:** When does "ambient listening" become "captured utterance"? End-of-speech detection with timeout window (1.5s of silence after speech). Need to handle: TV in background, phone calls, family conversation.
3. **Explicit-mode vs ambient toggle:** Clap stays as "explicit invocation" — wake jarvis to act on a NAMED task. Ambient = jarvis hears everything but only ACTS when intent classification crosses threshold.
4. **Privacy boundary:** Ambient listening hears EVERYTHING in the room — captures get redacted before vault? Or skip-write on sensitive content?

**Un-park trigger:** Frank says "ship ambient" OR voice-operator captures show patterns of "I wish jarvis had heard that automatically."

**Estimated scope:** 1-2 days. Touches: STT pipeline (`service/stt.py`), VAD module (new), `clap_detector.py` (mode toggle), redact rules (`config/redact.toml`), privacy gate (`service/guards.py`).

---

## C3 — Multi-modal context envelope

**Symptom Frank felt:** Voice agent doesn't *see* what he sees. Iron-Man Jarvis knows what's on screen, what file is open, what meeting is next.

**Current state:** Voice-operator's context envelope is `{utterance, history, recalls}` (after Wave 2 A1). No screen state, no calendar, no file system awareness.

**Design dimensions:**
1. **Screen state — privacy boundary critical.** Window title + active URL only, NEVER pixel content or transcript. Matches cockpit privacy invariant per memory `project_cockpit_continuity_v01`. Source: Windows `Get-Process | Where-Object MainWindowTitle` + `Get-Window-By-Foreground`.
2. **Calendar.** Google Calendar MCP already connected (per `claude mcp list` 2026-05-11). Wire into voice-operator's pre-cognition context build. Today's events + next event ≤ 4 hours out.
3. **Recent commits.** `git log --oneline -5` from the active project. Active project derived from cockpit's session manifest (after D1 install — now live).
4. **Open files.** From Claude Code's session — `cockpit/` v0.2 MCP server exposes this (after wire-MCP step deferred from HANDOVER-COCKPIT-V02).
5. **Token budget.** Context envelope can't bloat. Hard cap: 1500 tokens for the multi-modal block. Truncation strategy: prioritize calendar > active file > recent commits > screen state.

**Un-park trigger:** Frank says "ship multi-modal" OR after Wave 3 C2 ships (ambient + multi-modal are the "Iron-Man closer" pair).

**Estimated scope:** 2-3 days. Touches: `service/text_mode.py` (context build), new module `service/context_envelope.py`, MCP wire-in (Google Cal, cockpit), token-budget enforcement.

---

## Risks to flag upfront (so future-sessions don't re-discover)

| Risk | Mitigation |
|---|---|
| Ambient listening = privacy attack surface | Default OFF. Explicit opt-in. Redact rules expanded. Audit log lists every ambient capture. |
| Multi-modal envelope leaks sensitive info into cognition prompts | Same as A1's privacy concern (Seer challenge 2026-05-11) — namespace isolation needs audit pass before C3 ships. |
| Always-on STT = bandwidth + CPU drain | Local Whisper preferred for privacy; needs CPU benchmark on Frank's machine before commit. |
| Calendar + commits + files = ~500-1000 tokens added per utterance | Token budget cap = hard 1500. Anything over truncates by priority. Cognition latency budget bumped from "fast" to "warm" tier. |
| C2+C3 together = significant new failure modes | Ship sequentially, not parallel. C2 first (ambient gating), C3 after (context build). Each has its own board pre-pass. |

---

## What Wave 3 does NOT include

- **Real-time presence "telepathy" — agent speaks unprompted.** Not Wave 3. Wave 4 if ever (and likely never; that's an Iron-Man-fantasy not a sovereignty-aligned feature).
- **Cross-machine sync.** Cockpit's Pro-tier path per HANDOVER-COCKPIT-V02 — separate scope.
- **Email integration.** Gmail MCP is connected but routing email into context envelope is a productivity-tax decision, not a Jarvis-grade question.

---

## Next-session entry point

When Frank says "Wave 3":
1. Pick C2 or C3 first (recommend C2 — smaller scope, foundation for C3's "ambient" framing)
2. Run brainstorming skill scoped to JUST that sub-project
3. Surface privacy boundary as the first clarifying question
4. Design doc → `/starlight-board` → writing-plans → implement → audit

Until then: this stub parks. The Wave-3 fight is real but not urgent — Wave 1+2 closed the highest-felt UX gaps, and an honest assessment of Wave 3 is "this is the polish, not the foundation."

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation]
- Verticals: voice-and-video
- Generated: 2026-05-11
- Tier: substrate (design stub; pre-pre-board)
