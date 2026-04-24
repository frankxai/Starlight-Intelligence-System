---
name: define-vision
description: Excavate the founder's Vision Architecture — 30-year + 10-year + 3-year + annual + quarterly horizons, each producing a named artifact. Generates drift tests. Grounded in Genius Profile. For humans, not agents.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name, or <person-name> --from-profile (loads existing Genius Profile)
---

# /define-vision

Load `SIP.md`, `VOICES.md`, `agents/starlight-visionary.md`, `skills/vision/fundamentals-excavation.md`. Excavate the person's vision across five horizons. Produce the Vision Architecture. Hand off to exactly one downstream command.

## Input
$ARGUMENTS

## When this command fires

- A Genius Profile exists for the person at `genius/profile-<slug>.md`
- The person is ready to name the axis their decisions rotate around
- Brand work is needed downstream, but brand without vision is fantasy — vision is the gate

## When this command does NOT fire

- No Genius Profile → halt and route to `/discover-genius`
- Single-decision support → use `/navigate` instead
- The person explicitly wants quarterly-only planning → honor sovereignty, skip the upper horizons, note that future brand work will need the upper horizons later

## Process

1. **Ground in genius.**
   - Resolve `<person-slug>` from `<person-name>` (lowercase, hyphenated).
   - Load `genius/profile-<slug>.md` and `genius/freedom-path-<slug>.md`.
   - If not present, halt:

   > *"Before we name where you're going, we name what only you uniquely see. Run /discover-genius first — vision without genius is fantasy."*

2. **30-year horizon excavation.** Ask once, precisely:

   > *"In 30 years — you're 60, 70, 80, whatever age that is for you — what world do you want to exist because you lived? Not your company's world. Not the market's world. The world."*

   Wait. Do not fabricate. If the person cannot answer, note the blank and continue. Do not return a Vision Architecture with a fabricated 30-year.

3. **10-year horizon.** Ask:

   > *"Ten years from now — if that 30-year world is becoming real — what does your life look like? Where do you live, what are you working on, who's around you, what's the weekly shape of your time?"*

   Capture: location, primary work, team shape, audience shape, revenue shape, personal-life shape. Produce a one-page "life snapshot."

4. **3-year horizon.** Ask:

   > *"Three years from now — what must be true for you to still be on that 10-year arc? What's shipped, what's running, what's behind you?"*

   Capture: revenue, team size, flagship artifacts shipped, market position. Name 3–5 deliverables that must exist at year 3.

5. **Annual horizon.** Ask:

   > *"This year — if the 3-year is honest — what must ship? Not wish-list. Must."*

   Capture 3–5 named ships for the year.

6. **Quarterly horizon.** Ask:

   > *"This quarter — what must be done so the annual stays real?"*

   Capture 2–4 concrete ships for the quarter, each mapped to an annual ship.

7. **Coherence check (ladder).** Walk bottom-up: does the quarterly serve the annual? Annual the 3-year? 3-year the 10-year? 10-year the 30-year? Any gap is drift. Name it in the output. Do not paper it over.

8. **Drift tests.** Generate 5–7 questions the person asks themselves when a decision does not feel aligned. Specific to them — not generic. Examples tailored to their horizons.

9. **Save.** Create `vision/` directory if missing. Write to `vision/vision-<slug>.md` using the output format below. Ship with "Built on SIP" block. Personal vision data lives in the person's instance only — do not write to any public vault.

10. **Hand off.** Name exactly one next move. Typical: `/build-brand-kit <person>` — brand kit derived from the just-excavated vision. Never two.

## Output format

```
# Vision Architecture — <Person Name> — <YYYY-MM-DD>

## 30-year horizon — the world
<1-paragraph description of the world the person wants to exist because they lived. In their voice, not template language. Concrete, not abstract. If blank, say so: "Not yet named. To return to.">

## 10-year horizon — the life
<1-page life snapshot: location, primary work, team shape, audience shape, revenue shape, weekly time shape. Specific.>

## 3-year horizon — the state
<1-paragraph state-of-the-founder at year 3.>

**Named deliverables that must exist at year 3:**
1. <deliverable>
2. <deliverable>
3. <deliverable>
(3–5 items)

## Annual horizon — this year's ships
1. <ship> — <1-line rationale tied to 3-year>
2. <ship>
3. <ship>
(3–5 items)

## Quarterly horizon — this quarter's deliverables
1. <deliverable> — serves annual ship #<N>
2. <deliverable> — serves annual ship #<N>
3. <deliverable>
(2–4 items)

## Ladder check
- Quarterly → Annual: <aligned | GAP — describe>
- Annual → 3-year: <aligned | GAP>
- 3-year → 10-year: <aligned | GAP>
- 10-year → 30-year: <aligned | GAP | 30-year-blank>

## Drift tests — ask yourself when a decision doesn't feel clean
1. <specific question referencing this person's horizons>
2. <question>
3. <question>
4. <question>
5. <question>
(5–7 items, each specific to the person's horizons — generic "is this aligned with my values" questions do not pass)

## Named next move
`/build-brand-kit <person>` — <1-line rationale>

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (VBIS alpha)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never fabricate a vision.** If the person cannot answer a horizon, leave it blank and return to it. A blank horizon is honest; an invented one is a liability that corrodes every downstream decision.
- **Genius Profile is upstream and non-optional.** No Profile → halt and route to `/discover-genius`.
- **Every horizon produces a named artifact.** "Change the world" is not a horizon. Specific world description + specific life snapshot + specific deliverables is a horizon.
- **Horizons must ladder — or the gap must be named.** Do not ship a Vision Architecture that silently breaks the ladder. Name the gap and let the person decide whether to return to it.
- **Drift tests are specific.** Generic drift questions ("is this aligned with my values?") fail. Tests reference the person's actual horizons.
- **Sovereignty is non-waivable.** The person owns their Vision. Starlight retains no private vision data in public vaults — it lives in the person's instance only. Attribution via "Built on SIP" is the sole compounding mechanism.
- **Hand off to exactly ONE next command.** Typical: `/build-brand-kit`. Optionality re-scatters what the Vision just aligned.
- **Non-technical users.** Vision excavation happens in conversation, not a terminal. Ana-grade: works in Claude Desktop + Cowork with no CLI. Accept free-form answers.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (VBIS alpha)
- Generated: 2026-04-24
---
