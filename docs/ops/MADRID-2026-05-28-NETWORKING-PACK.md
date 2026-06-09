# Madrid 2026-05-28 — Google AI Live Networking Pack

> Attendee + networking pack. No on-stage demo, no scheduled pitch. Goal: every Google person Frank shakes hands with walks away with a working URL and a reason to remember him.
>
> **Tier:** operational (event-prep, not substrate).
> **Voice:** Frank DNA — direct, technical, warm, playful.
> **Built on SIP.**

---

## 0. The 30-second pitch (rehearse once on the plane)

> "Frank Riemer. I run two things — FrankX, where I publish AI architecture content to about 7,000 EMEA architects, and Arcanea BV, the entity behind Starlight Intelligence System — a sovereign agentic memory substrate I dog-food daily. Gemini 3.1 Flash Image is in my daily multimodal pipeline, ADK + A2A is the enterprise lane in my workshop, and I'm pursuing Cloud Partner Advantage. Came to Madrid to meet the people behind the surfaces I ship every day."

Variations:

- **If they ask "what's an intelligence system":** *"Ten layers — Self, Wealth, Family, Business, Creator, Second Brain, Code, Voice-Video, Brand, plus an orchestrator that routes the other nine. I built it because I got tired of using AI as a tool and wanted to become a system."*
- **If they're DeepMind / Gemini:** *"I derive file extensions from inlineData.mimeType — never hardcode .png. Caught a regression in my own substrate last month doing that. Want to compare notes on NB2 patterns?"*
- **If they're ADK / A2A:** *"I wrote a wire-level A2A implementation guide — Agent Cards, JSON-RPC, task lifecycle. Happy to send it. Curious where the TypeScript ADK story is heading."*

---

## 1. Live URLs Frank can hand out (verified 2026-05-26)

These work today. Memorize the top 3.

### Substrate home
- **`starlightintelligence.org`** — the substrate site. 10-IS map, SIP protocol, /research surface.
- **`starlightintelligence.org/research/memory-foundations`** — most recent research artifact, gated by self-Board. Shows up well for research-heavy Google folk.
- **`starlightintelligence.org/architecture`** — system architecture overview.
- **`starlightintelligence.org/protocol`** — SIP (Starlight Intelligence Protocol) v1.1.1 spec.
- **`starlightintelligence.org/verticals`** — 10 Intelligence System layers.
- **`starlightintelligence.org/changelog`** — release log (v8.1.0 currently).

### FrankX (audience-side) — all LIVE
- **`frankx.ai`** — root.
- **`frankx.ai/guides/agent-card-a2a-spec`** — wire-level A2A protocol implementation guide (Agent Card schema, JSON-RPC task lifecycle). **The killer Google-facing artifact.**
- **`frankx.ai/partnerships/google`** — Cloud Partner Advantage pursuit page (5 collaboration modes, 12-month compounding model). Hand this to Partner Advantage team contacts.
- **`frankx.ai/workshops/build-first-ai-agent`** — 90-min workshop, ADK enterprise lane documented.
- **`frankx.ai/guides`** — guides catalog (14+ guides).

### Social
- **`linkedin.com/in/frankxai`** — 7,000-strong EMEA AI architect audience.

---

## 2. URL audit correction (2026-05-27)

The 2026-05-26 first-pass audit reported the A2A guide and `/partnerships/google` as 404. **That was wrong** — it audited the wrong deploy repo (`frankx.ai-vercel-website` instead of the live `frankx-prod-sync` linked to Vercel project `prj_NHVIKZ...`). Both URLs return **HTTP 200** on production today (verified 2026-05-27 via `curl -sL`).

| URL | Status (2026-05-27) | Use confidently? |
|---|---|---|
| `frankx.ai/guides/agent-card-a2a-spec` | **HTTP 200** ✅ | Yes — this is the killer Google-facing artifact |
| `frankx.ai/partnerships/google` | **HTTP 200** ✅ | Yes — hand to Partner Advantage contacts |
| `frankx.ai/workshops/build-first-ai-agent` | **HTTP 200** ✅ | Yes — workshop landing |
| `frankx.ai/ai-architecture` | Live but content last refreshed 2026-03-23, no ADK reference yet | Use cautiously — flag as "ADK reference coming" if asked |

**Lesson for this pack:** the audit that surfaced "404" was reading `C:/Users/frank/frankx.ai-vercel-website` (apparently stale fork or dev copy). Live deploy is from `C:/Users/frank/frankx-prod-sync/` — Vercel-linked. When in doubt, `curl -sL https://www.frankx.ai/<path>` from the laptop is the binary truth.

---

## 3. Conversation hooks per Google touchpoint

### Google Cloud Partner Advantage team

**Hook:** *"I'm pursuing Partner Advantage. ADK is in my workshop enterprise lane, Gemini in daily delivery, A2A protocol guide ready to publish. What's the fastest path?"*

**Ask:** Concrete next step toward partner membership. Specifically: the attendee-credit mechanic (workshop attendees get GCP credits) is higher leverage for Frank than commission.

**Land receipt:** Get the name + email of the Partner Advantage AI-track specialist for EMEA.

### Google DeepMind / Gemini team

**Hook:** *"Gemini 3.1 Flash Image is in my daily image pipeline. NB Pro at 2K for hero quality, mimeType-derived extensions. Veo and Imagen on the bench for when the brief calls for them."*

**Ask:** Roadmap signals for Gemini 4 family (mid-2026 rumored — Frank's planning content cycle).

**Land receipt:** What's the best channel for technical content collab — co-authored content, beta access, technical reviewer slot?

### ADK + A2A protocol team

**Hook:** *"I wrote a wire-level A2A implementation guide — Agent Cards JSON schema, JSON-RPC task lifecycle (tasks/send, tasks/get, tasks/cancel). It's ready to publish on frankx.ai/guides. Want a preview?"*

**Ask:** When does TypeScript ADK reach first-class parity? It's the friction point for Next-on-Vercel teams (Frank's audience).

**Land receipt:** Any non-Google reference servers in the wild yet? Anthropic / OpenAI / Vercel adoption signals?

### Vertex AI team

**Hook:** *"Three-lane portfolio in my workshop: Vercel AI SDK on the web lane, Claude Agent SDK on the reasoning lane, Google ADK on the enterprise lane. Vertex anchors the GCP-deploy reference."*

**Ask:** Agent Engine GA pricing — when does it settle? Will shape the production agent story significantly.

**Land receipt:** Anchor contact for enterprise GCP architecture deep-dives.

### Google AI Studio team

**Hook:** *"Daily user of the Gemini API via AI Studio. Multimodal pipeline writes back into the substrate vault."*

**Ask:** Any planned changes to the free tier or rate limits in the EMEA region?

### Local Madrid Google Cloud office

**Hook:** *"7,000 EMEA architects on LinkedIn. I'm a peer-architect voice for the Madrid / EU AI buildout."*

**Ask:** Introduction to the EMEA AI architecture team for collaborative content + event speaking slots.

### Antigravity team (if encountered)

**Hook:** *"I've been dog-fooding Antigravity since December 2025. Twelve project brains, last live session five days ago. Native operator, not waitlist."*

**Ask:** Direct feedback channel — what works for me, what I keep wishing was different, where the IDE-style install collides with the CLI-first ecosystem I live in.

**Land receipt:** Name + email of an Antigravity PM or eng lead. Confirm Frank's spot in the early-feedback cohort if such a channel exists.

**Land artifact:** Frank can pull up the IDE on his laptop and scroll through the May 22 brain if asked.

---

## 4. Email follow-up templates (3-5 hours after meeting)

### Template A — Partner Advantage / Cloud sales

```
Subject: Madrid follow-up — Cloud Partner Advantage path

[Name] —

Great meeting you at AI Live yesterday. As promised, the working surfaces:

- Substrate: https://starlightintelligence.org/research/memory-foundations
- Workshop (ADK enterprise lane): https://frankx.ai/workshops/build-first-ai-agent
- Audience: 7,000 EMEA architects on LinkedIn — https://linkedin.com/in/frankxai

The Partner Advantage pursuit is concrete: ADK in workshop curriculum, Gemini in
daily delivery, A2A protocol implementation guide ready to publish. The mechanic
that matters most to me is attendee credits — workshop participants get GCP credits
to apply learning. Higher leverage than commission for the kind of customer I serve.

What's the right next step from your side?

Frank
```

### Template B — DeepMind / Gemini engineer

```
Subject: Madrid follow-up — Gemini 3.1 Flash Image patterns

[Name] —

Quick follow-up from yesterday. I mentioned the mimeType-derived extension pattern —
here's the substrate-side regression that taught me that lesson (caught 2026-04-25):
[pattern detail].

Two artifacts you might find interesting:
- https://starlightintelligence.org/research — substrate research surface
- https://frankx.ai/guides — peer-architect technical content for EMEA audience

If there's a path to be useful — technical reviewer, beta tester, content
collaborator — I'm in. Talk soon.

Frank
```

### Template C — ADK / A2A engineer

```
Subject: Madrid follow-up — A2A protocol implementation guide

[Name] —

Mentioned the A2A guide in Madrid — wire-level implementation, Agent Cards JSON
schema, JSON-RPC task lifecycle, deployment patterns. It's currently sitting in my
content repo waiting on the publish path.

I'll ping you the URL the moment it goes live (this week).

The TypeScript ADK story is the friction I keep hitting with Next-on-Vercel teams
in my workshop — would love to know what's possible to share publicly about the
roadmap there.

Frank
```

### Template D — Generic "nice to meet you"

```
Subject: Madrid follow-up — [topic you discussed]

[Name] —

Great connecting at AI Live. The substrate I mentioned lives at:
https://starlightintelligence.org/research

Workshop (the one with the ADK enterprise lane):
https://frankx.ai/workshops/build-first-ai-agent

If anything on either side could be useful to you, my DMs on LinkedIn are open —
https://linkedin.com/in/frankxai.

Frank
```

---

## 5. Asks register — what Frank wants out of Madrid

| # | Ask | From whom | Why it matters |
|---|---|---|---|
| 1 | Concrete next step toward Cloud Partner Advantage | Partner Advantage team | Attendee-credit mechanic is the asymmetric win |
| 2 | Technical content collab path | DeepMind / Gemini team | 7K architect audience + daily Gemini use = natural fit |
| 3 | TypeScript ADK roadmap signal | ADK team | Removes friction point for Next-on-Vercel workshop attendees |
| 4 | Agent Engine GA pricing signal | Vertex AI | Shapes production agent story Frank teaches |
| 5 | EMEA team intro | Madrid Cloud office | Speaking slots + content collab in-region |

Track outcomes in `notes/madrid-2026-05-28-outcomes.md` (create on landing back).

---

## 6. Failure mode register

Things to NOT do at Madrid:

- **Don't claim "Google Cloud partner"** without the program qualifier ("pursuing Partner Advantage"). Voice rule from partner-google skill.
- **Don't say "Google Agents CLI is a framework"** — it's a Python CLI + skills bundle for ADK, not a separate framework.
- **Don't hand out URLs that 404** — see § 2 above. The A2A guide URL is the most likely temptation.
- **Don't pitch the substrate as a product.** It's a sovereign substrate Frank dog-foods. The commercial offer is workshop + Concierge sprint + audit. Substrate is the credibility, not the SKU.
- **Don't pretend to be a Googler.** Peer-architect voice — operator-side, not employee-flavored. Frank uses Gemini daily; Google doesn't employ him. That's the position of strength.

---

## 7. Pre-flight checklist (Wednesday 2026-05-27)

- [ ] Battery + charger packed (laptop runs cockpit if asked to show)
- [ ] Phone fully charged with Google Calendar + LinkedIn app
- [ ] 30-second pitch rehearsed twice out loud
- [ ] Cross-repo deploy decision made (publish A2A + partnerships/google OR don't — see § 2)
- [ ] One real session with `starlightintelligence.org/research/memory-foundations` open in the browser so Frank can scroll-screenshot if asked
- [ ] Cockpit boots clean (per memory `feedback_cockpit_holds_3007` — diagnose port :3007 if it doesn't)
- [ ] `GEMINI_API_KEY` format verified (per global CLAUDE.md, current value suspect — may be OpenRouter format mis-pasted)
- [ ] Outcomes-log file pre-created at `notes/madrid-2026-05-28-outcomes.md`

---

## 8. Post-event protocol (Friday 2026-05-30)

- Capture every business card + LinkedIn add into `notes/madrid-2026-05-28-outcomes.md`.
- Send all email follow-ups within 48h of meeting (Saturday at the latest).
- File one handover doc `docs/ops/HANDOVER-2026-05-29-madrid-debrief.md` with:
  - Names + roles met (5 most material)
  - Asks landed vs. asks deflected
  - Surprises (always more signal than confirmations)
  - One sentence each on whether the cross-repo deploy decision (§ 2) needs revisiting

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [networking, attestation, distribution]
- Verticals: starlight-intelligence-system@v8.1.0, frankx-content
- Generated: 2026-05-26 (T-2 days)
- Falsifier: if zero of the 5 asks in § 5 land, the pack failed at routing Frank toward the right conversations. Iterate before next event.
