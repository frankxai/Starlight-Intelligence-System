---
name: sound-composition-lyric
description: Produce a Lyric Architecture for a song — premise, perspective, persona, structural form, prosody check, refrain design, and specific imagery vs. generic-pretty refusal — grounded in music-language cognition (Patel) and refrain research (Margulis). Composes with Genius for lyric voice. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <song-slug> + --score <path-to-score-architecture-if-any> + --genius <path-to-genius-profile-if-any> + optional context on lyric direction
---

# /sound-composition-lyric

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `agents/starlight-sound-composition.md`, `skills/sound-intelligence/composition-architecture.md`, and Genius Profile if present (non-optional for voice). Produce a **Lyric Architecture**.

## Disclaimer (non-waivable)

**Lyric work that touches identifiable real persons (real-name references, specific events) carries defamation, privacy, and right-of-publicity exposure. This is system architecture, not legal advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Genius voice load.** If no Genius Profile, flag as voice-uncalibrated; lyric will be more template-shaped than ideal.
3. **Premise.** The one sentence the song is about. If it cannot be said in one sentence, the song does not yet have a premise.
4. **Perspective.** First / second / third / mixed. With rationale.
5. **Persona.** Same as practitioner / constructed persona.
6. **Structural form.** AABA / verse-chorus / through-composed / list / narrative.
7. **Prosody check (Patel).** Stresses of lyric line align with melodic stresses, or fight them with intent. Mismatches without intent reduce both.
8. **Refrain design (Margulis).** The line that earns the seventh repetition.
9. **Specific imagery.** Named-thing replaces vague-pretty. Generic-pretty refused.
10. **Rights-adjacent flags.** Real-person references; sample-of-text; AI involvement in lyric drafting.
11. **Save.** `sound-intelligence/composition/lyric-<song-slug>-<YYYY-MM-DD>.md`.
12. **Hand off.** Default: `/sound-composition-arrange` (if score+lyric set) or revisions if prosody fails.

## Output format

```markdown
# Lyric Architecture — <Song Title> — <YYYY-MM-DD>

> **Lyric work touching identifiable real persons (real-name references, specific events) carries defamation, privacy, and right-of-publicity exposure. This is system architecture, not legal advice.**

## Context
- **Song:** <title>
- **Score architecture referenced:** <path | none>
- **Genius Profile referenced:** <yes — voice samples loaded | no — flagged for voice-uncalibrated>

## Premise (one sentence)
<The one sentence this song is about. If it cannot be said in one sentence, restart — the song does not yet have a premise.>

## Perspective
- **Perspective:** <first | second | third | mixed>
- **Rationale:** <why this perspective for this premise>

## Persona
- **Persona:** <same as practitioner | constructed>
- **If constructed:** <one paragraph on the persona — who they are, what they want, what's at stake>

## Structural form
- **Form:** <AABA | verse-chorus | through-composed | list | narrative>
- **Section-by-section structure:** <V1 / pre-chorus / chorus / V2 / etc. with one-line description of each>

## Prosody check
<Pick 4-6 lyric lines from key sections. Mark stresses. Cross-check against melodic stresses. Flag mismatches; either fix or commit to the intentional fight with rationale.>

| Line | Lyric stress pattern | Melodic stress pattern | Aligned? |
|---|---|---|---|
| <line> | <e.g., DUM-da-da-DUM-da> | <e.g., DUM-da-da-DUM-da> | yes |
| ... | ... | ... | ... |

## Refrain design
- **Refrain line:** <the line>
- **Why it earns the seventh repetition:** <Margulis framework — what makes this line load-bearing through return>

## Specific imagery audit
<Pick 3-5 imagery moments from the lyric. Each one: is the imagery a specific named-thing (a chair in a specific room) or a vague-pretty (a sad place)? Flag generic-pretty for revision.>

## Rights-adjacent flags (for downstream Catalog + Sync)
- **Real-person references:** <named with consent / fictional / metaphorical>
- **Sample-of-text:** <quoted material from another work — clearance status>
- **AI involvement:** <none / disclosed in this stage>

## Load-bearing next move

**`/sound-composition-arrange <song-slug>`** if score + lyric are set; or revisions if prosody check failed.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Composition sub-system)
- Generated: <ISO date>
---
```

## Rules

- Disclaimer at top, always.
- Genius voice composition non-optional for fan-facing lyric.
- Premise as one sentence; restart if longer.
- Prosody check non-negotiable.
- Refrain design names why it earns repetition.
- Specific imagery over generic-pretty.
- Rights-adjacent flags surfaced.
- One hand-off at close.
- Every artifact ends with "Built on SIP" attestation.

— Sound Composition Intelligence — part of the Sound Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Composition sub-system)
- Generated: 2026-04-26
---
