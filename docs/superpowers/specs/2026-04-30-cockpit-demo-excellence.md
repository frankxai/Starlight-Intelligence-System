# Cockpit Demo Excellence — Design Spec

**Date:** 2026-04-30
**Author:** Claude (Opus 4.7) under Frank's "you lead, all night" mandate
**Trigger:** Two essential meetings tomorrow. Frank wants ultra-good capabilities that feel as good and complete as possible. No bloat, no slop, excellence.
**Status:** Approved — proceeding to implementation

---

## Why this exists

Frank's voice cockpit is three live surfaces (orb @ 7777, voice-operator @ 7373, dashboard @ 3007) that work but feel disconnected. Earlier today we (a) made the orb actually agentic by killing the tool-blind cognition bridge and (b) gave Jarvis a deep British voice (ElevenLabs Brian). Tomorrow's demos need the surfaces to feel like one premium product, not three prototypes. This spec is the focused 5–6 hour build that gets us there without bloat.

## Success criteria (binary, all must pass)

1. Cold-start to first "wow" moment in <90 seconds.
2. All four surfaces feel like one product — single design language, palette, typography.
3. Zero crashes / 405s / "starting server" screens during the demo path.
4. Voice → tool execution works live: *"check git status"* returns real output.
5. Persona swap mid-demo works (Brian Jarvis → Lumina).
6. Frank can recover gracefully from any single failure (every demo step has a backup path).
7. A demo script with timings, fallbacks, and one walkaway phrase exists in `docs/ops/`.

## Architecture (preserve > rebuild)

### Stays exactly as-is
- **Orb @ :7777** (`Arcanea/packages/arcanea-voice/`) — Three.js orb with chromatic aberration shader is gold-tier. Persona system, native Groq + 6-tool loop. Untouchable.
- **Voice-operator @ :7373** — FastAPI runs but is currently bypassed by the orb (no tool execution). Stays up as memory/logging spine; we won't make it execute tools tonight.
- **Dashboard @ :3007** — Next.js shell, brain viz at `/brain`, cockpit status, routing decisions feed. Solid foundation.

### Tier-0 — Demo stability (60 min)
| Item | Why | Where |
|------|-----|-------|
| Orb error pill → graceful retry copy | Raw red text reads amateur during a network blip | `arcanea-voice/web/style.css`, `client.mjs` |
| Status pill idle pulse | Static "Ready" reads dead; pulsing breath reads alive | `style.css` keyframes |
| Hotkey legend | Space/Esc/T/1-7 hidden in tiny footer; surface as kbd row | `index.html` + style.css |
| Brain scene retry-after-3s | Silent loading on slow `/api/brain` looks broken | `dashboard/app/brain/page.tsx` |
| Mic-permission graceful state | If Windows blocks mic, currently UI hangs | `client.mjs` |

### Tier-1 — Visual cohesion (45 min)
| Item | Why | Where |
|------|-----|-------|
| Unified Starlight palette | Orb gold/cyan vs dashboard purple/teal currently clash | `arcanea-voice/web/style.css` (orb adopts dashboard's `#0a0a0f` ink + `#7c5cff` accent) |
| Shared header on dashboard | Links to orb / brain / status as one nav | New `dashboard/components/CockpitNav.tsx` |
| Captures feed glass treatment | Currently bare; brings it to RoutingDecisions parity | `dashboard/components/CapturesFeed.tsx` |

### Tier-2 — Live Activity HUD (90 min) — the wow moment
- New SSE endpoint on the orb: `GET /api/cockpit-feed` (text/event-stream) emitting `{type, persona, text, tool, args, result, ms}` events for every voice turn.
- Orb's `runLlmLoop` and `executeTool` push events to an in-memory ring buffer; SSE drains it.
- New dashboard panel: `dashboard/components/LiveActivityHud.tsx` subscribing to the feed and rendering a vertical stream of:
  - `🎤 you said: "..."` (transcript)
  - `🔧 tool: shell_run({"cmd":"netstat ..."})`
  - `📤 result: 3 services healthy`
  - `🗣 jarvis: "..."` (spoken reply)
- This solves audit's biggest gap. Audience SEES the agent execute.

### Tier-3 — Karpathy hygiene (15 min)
- Pull `forrestchang/andrej-karpathy-skills` Karpathy CLAUDE.md fragment.
- Append the relevant rules (the LLM-pitfall observations) to `CLAUDE.md` under a new `## Agent hygiene (Karpathy)` heading.
- One-time leverage across every Claude Code session Frank runs.

### Tier-4 — Signature capability (60 min)
**"Draft a one-pager about X."** Voice → orb → tool chain (`file_write` to `~/Desktop/jarvis-drafts/`) → dashboard streams the file content live as it's written. Audience watches a doc materialize from voice. One memorable moment per demo.

### Out of scope tonight (no bloat)
- elevenlabs/ui `<Orb>` swap — custom orb already exceeds it per audit
- LiveKit barge-in port — high risk, low time budget
- Pipecat refactor — architectural lift
- Voice-operator tool executor backend — multi-day
- New API keys, new MCP servers, mobile PWA, auth, sync

## Demo script (60-second cold open)

```
[0:00] Open orb (http://127.0.0.1:7777/?persona=jarvis). Orb idle-pulses.
[0:05] Press Space: "Jarvis, what's running on this machine right now?"
[0:08] Brian voice replies. shell_run fires netstat. HUD lights up.
[0:15] Reply: "Three services healthy on 7373, 7777, 3007."
[0:20] "Show me the brain." → flip to dashboard /brain.
[0:30] 3D thought-graph spins. Frank narrates.
[0:45] Press 2 → orb glows gold → Lumina voice loads.
[0:50] "Lumina, draft a one-pager on [meeting topic]."
[0:55] file_write fires. Dashboard streams the doc.
[1:30] Done. Walkaway: "That wasn't a chatbot. That was an operator."
```

## Failure modes + mitigations

| Failure | Mitigation |
|---------|-----------|
| ElevenLabs Brian voice ID rejected | Sarah voice fallback already in code; revert one line |
| Mic permission blocked at OS level | T-key text input always works; legend now visible |
| Tool fires but returns error | claude_prompt (clipboard) is the always-works fallback |
| Voice-operator down | Doesn't matter — orb runs autonomously |
| Network blip during demo | Local Groq is sub-second; ElevenLabs cached for repeat words |
| Brain viz API hangs | Retry button after 3s, can skip section gracefully |

## Implementation order

1. Tier-0 stability fixes (parallelizable)
2. Tier-1 cohesion (parallelizable with Tier-2)
3. Tier-2 HUD (the long pole)
4. Tier-3 Karpathy
5. Tier-4 signature wow
6. End-to-end dry run + demo script handover doc

Estimated wall-clock: ~5.5 hours focused work.

## Out of band

- This spec lives in `docs/superpowers/specs/` (public substrate).
- No SIP attestation needed — operational-tier work, not substrate change.
- No Luminor Board pre-pass — same reason.
- Memory note saved at `memory/project_v76_cockpit_demo.md` post-build.
