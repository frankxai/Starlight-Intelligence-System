---
name: sound-composition-transition
description: Design transitions for a song — section-to-section moves named explicitly (drop, build, breakdown, modulation, instrumental hand-off, lyrical pivot, false-end, tag-out). Refuses fade-in/fade-out as default. Grounded in Huron's expectation-and-reward framework. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <song-slug> + --arrange <path-to-arrangement-architecture>
---

# /sound-composition-transition

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-composition.md`, `skills/sound-intelligence/composition-architecture.md`, and the song's Arrangement architecture. Produce a **Transition Design**.

## Disclaimer (non-waivable)

**Transitions involving samples or AI-tool involvement touch rights. This is system architecture, not legal advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Read arrangement.** Section map + density curve.
3. **Per section boundary:** name the transition move explicitly.

Transition moves available:

- **Drop** — sudden density reduction
- **Build** — additive density
- **Breakdown** — extended low-density
- **Modulation** — key change at structural moment
- **Instrumental hand-off** — motif passes between instruments
- **Lyrical pivot** — perspective or mode shifts at section boundary
- **False-end** — apparent ending followed by return
- **Tag-out** — final chorus extends and fragments

4. **Per transition:** name its role in the expectation-and-reward arc (Huron framework). Does it create surprise, satisfaction, or set up future surprise/satisfaction?
5. **Refusal check.** Fade-in / fade-out as default refused. If used, named as deliberate with rationale.
6. **Save.** `sound-intelligence/composition/transition-<song-slug>-<YYYY-MM-DD>.md`.
7. **Hand off.** Default: revisions to arrangement if transition design surfaces gaps; otherwise downstream production.

## Output format

```markdown
# Transition Design — <Song Title> — <YYYY-MM-DD>

> **Transitions involving samples or AI-tool involvement touch rights. This is system architecture, not legal advice.**

## Context
- Arrangement reference: <path>

## Section-by-section transitions

| Boundary | Move | Mechanic | Expectation-and-reward role |
|---|---|---|---|
| Intro → V1 | <move> | <one-line on the technical mechanic — what fades / enters / drops at what bar> | <Huron — surprise / satisfaction / setup-future> |
| V1 → Pre | <move> | <mechanic> | <role> |
| Pre → Chorus | <move> | <mechanic> | <role> |
| Chorus → V2 | <move> | <mechanic> | <role> |
| V2 → Pre | <move> | <mechanic> | <role> |
| Pre → Chorus 2 | <move> | <mechanic> | <role> |
| Chorus 2 → Bridge | <move> | <mechanic> | <role> |
| Bridge → Chorus 3 | <move> | <mechanic> | <role> |
| Chorus 3 → Outro | <move> | <mechanic> | <role> |

## Refusal check
- **Fade-in / fade-out as default:** <none used | used at <boundary> for <named rationale>>
- **Default-because-it's-easy transitions:** none

## Load-bearing next move

If transition design surfaces gaps in arrangement → revisions to `/sound-composition-arrange`. Otherwise → downstream production.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Composition sub-system)
- Generated: <ISO date>
---
```

## Rules

- Every section boundary has a named transition move.
- Mechanic and expectation-and-reward role both named.
- Fade-in / fade-out as default refused.
- "Built on SIP" attestation.

— Sound Composition Intelligence — part of the Sound Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Composition sub-system)
- Generated: 2026-04-26
---
