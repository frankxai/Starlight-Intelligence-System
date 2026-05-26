# Madrid 2026-05-28 — 5-Minute Demo Runbook

> Pull-out-the-laptop runbook for Madrid networking. Use only if a Google person says "show me." Default posture is verbal pitch + URL handoff (see `MADRID-2026-05-28-NETWORKING-PACK.md`).
>
> **Tier:** operational.
> **Built on SIP.**

---

## 0. The fork in the room

If asked "can you show me something":

| Their interest | Demo to open | Time |
|---|---|---|
| Research / substrate / memory | **Browser → `starlightintelligence.org/research/memory-foundations`** | 2 min |
| Agent architecture / multi-agent | **Browser → `starlightintelligence.org/architecture`** + verbal walk-through of the 47-agent registry | 3 min |
| Three-lane AI portfolio (Vercel / Claude / ADK) | **Browser → `starlightintelligence.org/verticals`** + reference workshop | 3 min |
| "Show me the actual system running" | **Cockpit local (last resort — see § 2)** | 5 min |
| Gemini multimodal pipeline | **Open last NB2 generation in `memory/` or hand off URL** | 2 min |

Default to the browser-based demos. They're robust, demonstrate live deployed surfaces, and don't depend on local machine state.

---

## 1. The browser demo path (default — works on any laptop or phone)

**URL stack (memorize these three):**

```
starlightintelligence.org/research/memory-foundations
starlightintelligence.org/architecture
frankx.ai/workshops/build-first-ai-agent
```

**Script (90 seconds):**

> *"This is the substrate — Starlight Intelligence System. Public research surface at /research. Most recent artifact is the memory foundations review — I scored seven memory candidates, ran a self-Board to gate publish, and shipped Phase 0 dog-food this past month."* [scroll the page]
>
> *"The architecture page shows the ten Intelligence Systems — Self, Wealth, Family, Business, Creator, Second Brain, Code, Voice-Video, Brand, plus an orchestrator. Each one's a vertical with its own substrate, voice, and agents."* [click architecture]
>
> *"The workshop is the audience-facing surface — ADK on the enterprise lane, alongside Vercel AI SDK and Claude Agent SDK."* [click workshop link in new tab]

**Why this works:** zero local dependencies. Works from any device. Shows live deployed substrate. Survives Wi-Fi quality issues at the venue (pages cache cleanly).

---

## 2. The cockpit local demo path (last resort)

Use only if the conversation requires "the actual system on my laptop." High risk — local state has known footguns.

### Known footgun 1 — port :3007 hold

Per memory `feedback_cockpit_holds_3007`: cockpit auto-start can lock :3007 even when stopped.

**Diagnostic:**

```pwsh
netstat -ano | findstr :3007
```

If something is holding the port:

```pwsh
Stop-Process -Id <PID-from-netstat> -Force
Remove-Item -Recurse -Force C:\Users\frank\Starlight-Intelligence-System\cockpit\.next
# then restart cockpit normally
```

### Known footgun 2 — GEMINI_API_KEY format

Per global `~/.claude/CLAUDE.md` Doctrine 4: `GEMINI_API_KEY` value is suspect. Valid Gemini key = 39 chars starting with `AIza`. OpenRouter key (which may have been mis-pasted) = 73 chars starting with `sk-or-v1-`.

**Pre-flight check (run Wednesday 2026-05-27):**

```pwsh
! pwsh -Command "$key = [Environment]::GetEnvironmentVariable('GEMINI_API_KEY','User'); if ($key.Length -eq 39 -and $key.StartsWith('AIza')) { 'Format OK: valid Gemini key' } elseif ($key.Length -eq 73 -and $key.StartsWith('sk-or-v1-')) { 'WARNING: OpenRouter key in GEMINI_API_KEY slot - need real Gemini key' } else { 'UNKNOWN format: length=' + $key.Length } "
```

If WARNING or UNKNOWN: get a fresh Gemini key from Google AI Studio (`https://aistudio.google.com/apikey`) BEFORE leaving for Madrid. The pre-flight checklist in the networking pack flags this.

### Cockpit boot (clean state)

```pwsh
cd C:\Users\frank\Starlight-Intelligence-System
pnpm run cockpit          # or whatever the canonical start command is per current cockpit/README
```

Open `http://localhost:3007/` in browser. Wait for SSE stream to come live. If brain visualization (`/brain`) is part of the demo, allow ~10s for the r3f scene to initialize.

### Demo script (cockpit version, 3 minutes)

> *"This is the local cockpit. The brain view shows live memory activity — every retrieval, every promotion through the dreaming pipeline lights up a halo state."* [show /brain]
>
> *"The dispatch pane routes intent across Claude Code, Codex CLI, Gemini CLI, OpenCode. Each lane is recorded with attestation — every output carries 'Built on SIP'."*  [show /dispatch if asked]
>
> *"Memory is canonical at the substrate. We just flipped sovereign — Path A, stdlib-only JSONL — to primary two days ago. Eighteen days of axiom-pressure resolved."* [reference /architecture page]

**Falsifier:** if cockpit doesn't boot in 60 seconds, abort. Pivot to browser demo (§ 1).

---

## 3. The Gemini multimodal demo path (specialist case)

Only if the engineer is DeepMind / Gemini and wants to see daily-delivery patterns.

### Quick screenshot story

Pre-cache 2-3 NB2-generated hero images from recent work. Saved at e.g. `memory/recordings/.../hero-*.png`.

**Script:**

> *"These came out of the daily image pipeline. Each one — mimeType-derived extension, never hardcoded .png. The substrate caught a regression doing that in April; I keep the discipline because the substrate-tier test enforces it now."* [show 2-3 images]
>
> *"For book covers I route through `/arcanea-book-cover` skill — NB2 with deep prompt thinking. The skill loads cover-design principles, then routes through Higgsfield with NB Pro at 2K image size."* [reference workflow]

### Live generation (if Wi-Fi is solid AND GEMINI_API_KEY is valid)

```pwsh
cd C:\Users\frank\Starlight-Intelligence-System
# Use a pre-tested Higgsfield skill command — has all the prompt scaffolding
# Equivalent of: /higgsfield-generate with NB2, but verify the skill works pre-Madrid
```

**Falsifier:** if live gen fails for any reason, pivot to pre-cached screenshots (above).

---

## 4. The post-demo handoff

Every demo ends with: *"Want me to send you the URLs?"*

If yes — pull out phone, send the email template from `MADRID-2026-05-28-NETWORKING-PACK.md` § 4 right there. Don't wait until back at the hotel.

URLs sent in-room are 10x more likely to be opened than URLs sent the next day.

---

## 5. Pre-flight Wednesday 2026-05-27 (checklist)

- [ ] Wednesday morning: run the GEMINI_API_KEY format check (§ 2)
- [ ] Wednesday afternoon: open all three browser URLs (§ 1) — confirm they render, screenshot if any are broken
- [ ] Wednesday afternoon: boot cockpit once locally, confirm :3007 holds nothing on shutdown
- [ ] Wednesday evening: pre-cache 2-3 NB2 hero images in a `madrid-demo/` folder for offline access
- [ ] Pack laptop charger + USB-C hub (HDMI for projection if asked to share screen)

---

## 6. Failure mode log (post-event)

If any demo path failed live in Madrid, capture here:

```
[date / time] - [path tried] - [what broke] - [pivot used] - [lesson]
```

Used to update this runbook for the next event.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
*Generated 2026-05-26 · Companion to `MADRID-2026-05-28-NETWORKING-PACK.md` · Falsifier: if any of the 3 default browser URLs returns non-200 on Wednesday, treat as P0 pre-event fix.*
