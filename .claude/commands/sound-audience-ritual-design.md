---
name: sound-audience-ritual-design
description: Design audience rituals across five cadences (daily / weekly / monthly / quarterly / annual) that build belonging without depending on algorithms. Each ritual neuroscience-grounded — names which SCARF dimensions it activates and which cohort it serves. Refuses one-off campaigns dressed as rituals.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <practitioner-slug> + --cohort-map-ref <path-to-cohort-map> + optional context paragraph on existing rhythm
---

# /sound-audience-ritual-design

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-audience.md`, `skills/sound-intelligence/audience-architecture.md`, the practitioner's cohort map (if present), and Genius Profile. Produce a **Ritual Architecture** across five cadences. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Audience rituals depend on consent and durable list infrastructure. CAN-SPAM / GDPR / CASL apply where applicable. This is system architecture, not legal or marketing advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Read cohort map.** If absent, halt and route to `/sound-audience-cohort-map`. Rituals are cohort-aware; without the map they degrade to broadcast.
3. **Daily cadence.** If practitioner has daily rhythm, name it (daily voice memo to patrons; daily lyric snippet to engaged-list; daily nothing — daily is not mandatory). For each: cohort served, SCARF dimension activated, sustainable cost (≤10 min/day or refused).
4. **Weekly cadence.** Often the load-bearing one. Friday list-letter / Sunday studio-update / Tuesday-night listening party. Per ritual: cohort, SCARF, content shape, anti-rhythm refusal (engagement-bait, "5 things this week" listicle, etc.).
5. **Monthly cadence.** Monthly milestone — first-of-the-month patron-only drop, monthly long-form essay, end-of-month catalog-state share. Per ritual: cohort, depth-of-content, monetization integration (if any).
6. **Quarterly cadence.** Quarterly arc — recording-quarter / release-quarter / touring-quarter / recovery-and-writing-quarter. Each quarter has its theme; rituals adapt to the quarter without losing the underlying cadence.
7. **Annual cadence.** Yearly retrospective, year-in-listening, end-of-year thank-you to patrons, annual show or annual residency. Per ritual: cohort, milestone-marker function, what would erode if skipped.
8. **Anti-ritual audit.** Surface current "rituals" that erode rather than build — performative all-hands-style updates, recognition systems that reward visibility over contribution, opt-in pathways that feel like traps.
9. **SCARF integration.** Every kept ritual names its activated SCARF dimension (Status / Certainty / Autonomy / Relatedness / Fairness) and the belonging mechanism it serves.
10. **Save.** Write to `sound-intelligence/audience/ritual-architecture-<practitioner-slug>-<YYYY-MM-DD>.md`.
11. **Hand off.** Name exactly one next move:
    - Patron-tier-active → `/sound-audience-fan-stay-interview` for the patron cohort.
    - Multi-cohort with no segmentation → `/sound-audience-list-architecture` for segmentation work.
    - Stable list, growth-oriented → `/sound-audience-sovereign-publish`.

## Output format

```markdown
# Ritual Architecture — <Practitioner Name> — <YYYY-MM-DD>

## Cohort map referenced
<path>

## Five-cadence rhythm

| Cadence | Ritual | Cohort served | SCARF activated | Sustainable cost | Anti-ritual replaced (if any) |
|---|---|---|---|---|---|
| Daily | <named, or "intentional none"> | <cohort> | <S/C/A/R/F> | <≤10 min/day> | <named or none> |
| Weekly | <named — load-bearing> | <cohort> | <SCARF> | <named cost> | <named or none> |
| Monthly | <named milestone> | <cohort> | <SCARF> | <named cost> | <named or none> |
| Quarterly | <named arc> | <cohort> | <SCARF> | <named cost> | <named or none> |
| Annual | <named milestone-marker> | <cohort> | <SCARF> | <named cost> | <named or none> |

## Anti-rituals removed
- <named pattern, e.g., "Friday-listicle as engagement-bait — replaced with single-track listening-letter">

## Belonging mechanism per cadence
- <one sentence per cadence describing the belonging-mechanism it serves>

## Reassessment cadence
**Quarterly review** of ritual architecture. Rituals erode silently; cadence audit catches drift.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.3 (Sound Intelligence — Audience sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Refuse one-off campaigns dressed as rituals.** Rituals are weekly / monthly / quarterly recurrences that compound. Annual events are spikes, not architecture.
- **Refuse content-calendar substitutes.** A content calendar lists what gets posted; a ritual architecture names which cohort each rhythm serves and the belonging mechanism activated.
- **Anti-ritual detection non-optional.** Every audit names current anti-rituals (performative updates, engagement-bait listicles) and recommends removal.
- **Cohort awareness required.** No ritual ships without naming the cohort it serves.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
