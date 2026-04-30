# Cockpit Demo Runbook — 2026-04-30

> Two essential meetings tomorrow. This runbook is the demo script + recovery paths. Read it once, run it twice as a dry-run, then go.

---

## Pre-flight (30 min before each meeting)

1. **Cold-start surfaces.** From any terminal:
   ```powershell
   pwsh C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1
   ```
   Expected: `:7373 ready`, `:7777 ready`, `:3007` (dashboard) reachable in browser.

2. **Verify status.**
   ```powershell
   pwsh C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1 -Status
   ```
   All three should read `[LIVE  ]`.

3. **Open the demo URL once.**
   `http://127.0.0.1:3007/cockpit` — overlay should appear (one-time per browser). Click "Begin" so it doesn't appear during the live demo.

4. **Mic check.** In the orb iframe, hold `Space`, say *"hello"*, release. Should hear Brian voice reply within 4–6 seconds total.

5. **Pre-warm draft folder.**
   ```bash
   ls ~/Desktop/jarvis-drafts/
   ```
   If empty, optionally seed a previous draft so the right-rail isn't blank in the opening shot.

---

## The 60-second cold open

Run this verbatim. Audience sees a single browser window: the cockpit at `:3007/cockpit`.

| t | Action | Audience sees | Recovery |
|---|--------|---------------|----------|
| 0:00 | Land on `/cockpit`. | Orb on left, live feed on right, drafts panel on far right. Idle pulse on the orb. | – |
| 0:05 | "Let me show you what runs my day." | Frame-set. | – |
| 0:10 | Hold Space in orb. Say: *"Jarvis, what's running on this machine right now?"* | Listening pulse. | If mic dies: press `T`, type same prompt. |
| 0:15 | Release. | Orb thinking → tool_call shell_run pops in feed → tool_result with stdout → reply with Brian voice. | If reply is slow: keep talking, don't apologize. |
| 0:25 | "Three services. All healthy." | Reinforce what audience just saw the agent say. | – |
| 0:30 | Press `2` in the orb. | Orb glow shifts gold → Lumina persona swap event in feed. | If hotkey doesn't fire: click orb tab first, retry. |
| 0:35 | Hold Space: *"Lumina, draft a one-pager about [meeting topic]."* | Tool_call file_write fires → drafts panel right-rail populates with new file → preview streams in. | If model doesn't write to ~/Desktop/jarvis-drafts: say *"write that one-pager to my desktop drafts folder."* |
| 0:55 | "Voice into a doc, in twenty seconds." | The walkaway phrase. | – |
| 1:00 | Optional encore: click `brain` in the top nav. | 3D thought-graph spins up. | If it hangs: stay on the cockpit page, don't show. |

**The walkaway line:** *"That wasn't a chatbot. That was an operator."*

---

## Capability map — what to mention if asked

| Capability | One-line answer |
|------------|----------------|
| Voice → Tool execution | "Groq Whisper for STT, Llama 3.3 for reasoning, ElevenLabs Brian for voice. Six tools allow-listed: shell, file_write, claude_prompt, claude_code_launch, open_url, linear_issue." |
| Brain viz | "Live thought-graph of every voice utterance, clustered by intent. Three.js + R3F." |
| Cockpit | "Single window. Orb left, live activity stream center, drafts streaming right." |
| Personas | "Seven voices. Press 1–7 mid-conversation. Each has a distinct system prompt and color." |
| Agent hand-off | "Claude_code_launch tool spawns a Claude Code window running the spoken prompt — voice becomes a hands-free dispatcher." |
| Privacy | "Runs entirely on this laptop. Groq + ElevenLabs over HTTPS for inference. Nothing in cloud storage." |

---

## Risks and live mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| ElevenLabs API rate-limit hit | Low | Falls through to Groq TTS automatically. |
| Groq Whisper STT empty (mic too quiet) | Medium | T-key text fallback. Demo same prompt typed. |
| Tool returns error (e.g. shell command rejected) | Low | Pivot to a different prompt — "what time is it?" always works. |
| Network blip mid-demo | Low | Local Groq has retry; one-second delay max. Talk through it. |
| Orb tab loses mic permission | Medium | Refresh orb tab once, allow mic, retry. |
| Audience asks about voice-operator (:7373) | – | "That's the memory backbone. Today's demo is the orb path; the operator pipeline is the next iteration." |
| Demo overlay re-appears | Very low | Click ✕ once. localStorage remembers across the session. |

---

## What changed tonight (2026-04-30, 03:00–05:30)

**New:**
- `app/cockpit/page.tsx` — unified demo command center, one window, three panels
- `components/LiveActivityHud.tsx` — SSE-driven live event stream (transcript / tool_call / tool_result / reply / persona_switch)
- `components/CockpitOrbFrame.tsx` — orb iframe + persona switcher
- `components/CockpitDrafts.tsx` — auto-polling drafts viewer
- `components/CockpitOverlay.tsx` — one-time demo onboarding
- `app/api/cockpit-feed/route.ts` — SSE proxy of orb feed (CORS-safe same-origin)
- `app/api/drafts/route.ts` — lists `~/Desktop/jarvis-drafts/*.md` with previews
- Orb server: `pushFeedEvent` ring buffer + `/api/cockpit-feed` SSE + `/api/persona-switch` notification
- Orb persona prompts: agent-not-chatbot rewrite, drafts-folder hint
- Orb CSS: status-pill idle breath animation, cockpit-link top-right, palette aligned with Starlight
- `tools.mjs`: `~` expansion bug fixed in `file_write` (was creating literal `~` directory)
- `CLAUDE.md`: appended `## Agent hygiene (Karpathy-distilled)` section (12 rules)

**Fixed earlier same day:**
- Cognition bridge disabled — orb runs native Groq + tools (was bypassing all 6 tools)
- Jarvis voice → ElevenLabs Brian (`nPczCjzI2devNBz1zQrb`)
- TTS model → `eleven_flash_v2_5` (~75ms first byte)
- Launcher npm.cmd / HEAD→GET probe bugs

---

## After the meeting

- Capture audience reactions in `memory/voice-sessions/2026-04-30.md` (auto-captured if you say *"capture this thought: ..."*)
- If demo was great, note it: *"the moment that landed was [X]"* — add to `memory/feedback_demo_what_works.md`
- If anything broke, log under `## Known issues` in this file

---

## Ports + URLs cheat-sheet

```
Orb (voice in/out):  http://127.0.0.1:7777/?persona=jarvis
Demo cockpit:        http://127.0.0.1:3007/cockpit
Brain viz:           http://127.0.0.1:3007/brain
Ops dashboard:       http://127.0.0.1:3007/
Voice-operator:      http://127.0.0.1:7373/healthz
Logs:                C:\Users\frank\.starlight\logs\
Drafts folder:       C:\Users\frank\Desktop\jarvis-drafts\
```

You're ready. Go land it.
