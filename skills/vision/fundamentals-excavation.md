---
name: vision/fundamentals-excavation
domain: vision
description: Excavate the founder's actual vision (not the pitch) across 30/10/3-year + annual + quarterly horizons. Each horizon produces a named artifact. Ladders are tested for drift. Powers /define-vision and the Visionary agent.
triggers:
  keywords: ["vision", "where am I going", "30-year", "10-year", "3-year", "purpose", "why", "north star", "long-term", "legacy", "founder vision", "axis", "trajectory", "horizon"]
  agents: ["starlight-visionary", "starlight-navigator"]
  intents: ["vision-excavation", "horizon-laddering", "founder-trajectory"]
priority: high
load_level: core
---

# Fundamentals Excavation

> *"The pitch is what you tell investors. The vision is what you'd still be building if no investor existed. Start there."*

## Purpose

Most founders have never separated the pitch from the vision. They draft ten-year plans in the language of quarterly OKRs and call it strategy. They write "change the world" into a deck and call it purpose. The result is decisions that scatter instead of compound — every quarter a new shiny thing, every year a new positioning statement, every three years a full rebrand because nothing settles into an axis.

Vision excavation installs the axis. Not by asking "what's your why" — that question has been destroyed by a decade of bad coaching — but by working a ladder: 30-year → 10-year → 3-year → annual → quarterly. Each horizon produces a *named artifact* that must exist at that horizon for the next-smaller horizon to make sense. The 30-year is the world the person wants to exist because they lived. The 10-year is the person's life if that world is becoming real. The 3-year is what must be true to stay on the 10-year arc. The annual is what ships this year. The quarterly is what ships this quarter. No gap. No drift.

The skill does not invent vision. It surfaces what the person already knows but has not been asked in the right order. When the person cannot answer a horizon, the skill does not fill the silence — it sits in it. A blank 30-year is more honest than a fabricated one. The person comes back to it.

## Activation

**Fires when:**
- `/define-vision` is invoked
- A user with a Genius Profile asks for vision, brand, or long-horizon work
- Keywords above appear in a session where a Vision Architecture has not yet been generated
- A user describes drift: "every quarter I pivot", "I don't know what I'm building toward", "I've had five different 10-year plans"

**Does NOT fire when:**
- No Genius Profile exists → halt and route to `/discover-genius` first. Vision without genius is fantasy; route upstream.
- Single-decision support ("should I take this meeting?") — out of scope; use `/navigate` instead.
- User explicitly rejects long-horizon work ("I only plan one quarter ahead") — honor sovereignty. Offer annual + quarterly only, skip the upper horizons.

## Protocol

### Step 1 — Ground in genius

Load `genius/profile-<slug>.md` and `genius/freedom-path-<slug>.md`. If neither exists, halt with:

> *"Before we name where you're going, we name what only you uniquely see. Run /discover-genius first — vision without genius is fantasy."*

Never excavate vision without genius upstream. The person's voice samples, frameworks, and cross-domain synthesis are the soil the vision roots in. Without them, every horizon becomes a generic founder-template answer.

### Step 2 — 30-year horizon excavation

Ask once, precisely:

> *"In 30 years — you're 60, 70, 80, whatever age that is for you — what world do you want to exist because you lived? Not your company's world. Not the market's world. The world."*

Wait. If the person answers immediately with rehearsed language, press: *"That sounds like a deck answer. What's the one under it?"* If the person cannot answer, sit. A blank 30-year is not a failure — it is a signal the person has not yet sovereign-owned their trajectory. Do not fill the blank. Return to it later.

Capture in their register. Produce a **30-year artifact**: a one-paragraph description of the world they want to have contributed to, named in their voice.

### Step 3 — 10-year horizon

> *"Ten years from now — if that 30-year world is becoming real — what does your life look like? Where do you live, what are you working on, who's around you, what's the weekly shape of your time?"*

This is the horizon most founders can actually answer. It is concrete enough to be real and far enough to be honest. Capture: location, primary work, team shape, audience shape, revenue shape, personal-life shape. Produce a **10-year artifact**: a one-page "life snapshot" of the person at the 10-year horizon.

Check against the 30-year: does this 10-year actually build toward that 30-year? If no, the gap is named. Return to whichever horizon is less honest.

### Step 4 — 3-year horizon

> *"Three years from now — what must be true for you to still be on that 10-year arc? What's shipped, what's running, what's behind you?"*

The 3-year is the horizon where strategy starts to bind. Capture: revenue target, team size, flagship artifacts shipped (books, products, methodologies), market position. Produce a **3-year artifact**: a one-paragraph "state of the founder" three years out, with 3–5 named deliverables that must exist.

Check against the 10-year: does the 3-year feed the 10-year, or is it drifting?

### Step 5 — Annual horizon

> *"This year — if the 3-year is honest — what must ship? Not what you wish shipped. What must."*

The annual horizon is where vision meets calendar. Capture: 3–5 named ships for the year. Each is a concrete artifact — a book outline, a product launch, a hire, a first cohort, a certification earned. Produce an **annual artifact**: a one-page "ships this year" list with named deliverables.

Check: does the annual feed the 3-year?

### Step 6 — Quarterly horizon

> *"This quarter — what must be done so the annual stays real?"*

The quarterly is the execution horizon. Capture: the 2–4 concrete things that must ship this quarter. Produce a **quarterly artifact**: a checklist of quarterly deliverables, each mapped to the annual ship it serves.

Check: does the quarterly feed the annual?

### Step 7 — Coherence check (drift test)

Walk the ladder bottom-up: does the quarterly serve the annual? Annual serve the 3-year? 3-year serve the 10-year? 10-year serve the 30-year? Any gap is drift. Name it out loud. Return to the gap and re-excavate.

Generate **drift tests** — 5 to 7 questions the person asks themselves when a decision does not feel aligned. Examples:

- Does this serve the 10-year or just the 3-year?
- Does this sound like me, or like what I would have written at my last employer?
- Would the person I want to be in 10 years take this meeting?
- Is this a "yes" that steals from a bigger "yes"?
- If I ship this, does anyone who knows me recognize it as mine?

These become the person's private compass — the Vision Architecture's most portable artifact.

## Output Shape

One document — **Vision Architecture** — saved to `vision/vision-<slug>.md`. Full schema in `.claude/commands/define-vision.md`. Structure:

- 30-year artifact (world paragraph)
- 10-year artifact (life snapshot)
- 3-year artifact (state-of-the-founder + 3–5 deliverables)
- Annual artifact (ships-this-year list)
- Quarterly artifact (quarter deliverables)
- Ladder check (gaps named if any)
- Drift tests (5–7 questions)
- "Built on SIP" attestation block

## Rules

1. **Never fabricate a vision.** If the person cannot answer a horizon, sit with the silence. A blank horizon is honest; an invented one is a liability.
2. **No generic founder-template language.** "Change the world" is not a vision; "a world where HR is a practice of human flourishing, not compliance management" is a vision. Specificity is the test.
3. **Every horizon produces a named artifact.** Vague intent is not a horizon. If the person cannot name a concrete artifact that must exist at that horizon, the horizon is not excavated.
4. **Horizons must ladder.** Quarterly serves annual, annual serves 3-year, 3-year serves 10-year, 10-year serves 30-year. Any gap = drift. Do not ship a Vision Architecture with un-named gaps.
5. **Genius Profile is upstream and non-optional.** No Profile → halt and route to `/discover-genius`.
6. **Drift tests are the most portable output.** Ship 5–7 specific questions the person can carry around. Generic drift questions ("is this aligned with my values?") do not pass.
7. **Sovereignty is non-waivable.** The person owns their Vision. Starlight does not retain personal vision data in public vaults — it lives in the person's instance only.
8. **Non-technical users first.** Vision excavation happens in conversation, not in a terminal. Ana-grade test: would this work in Claude Desktop? If it requires CLI, it failed.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (non-waivable, enforced at Rule 7)
- File contract (`vision/` namespace, `vision-<slug>.md`)
- Attestation (every Vision Architecture ships with "Built on SIP" block)
- Voice archetypes (`VOICES.md`) — architect primary, sovereign-creator for framing

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (VBIS alpha)
- Generated: 2026-04-24
---
