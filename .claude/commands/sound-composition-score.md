---
name: sound-composition-score
description: Produce a Score Architecture for a song or instrumental — key, mode, harmonic motion class, form, tempo, time signature decisions, motif design, and motif-return logic — grounded in music-theory direction and the practitioner's catalog signature. Composes with Genius for compositional voice. Not legal advice; not a substitute for the practitioner's ear.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <song-slug> + --catalog-signature <reference-to-catalog-signature-file-if-any> + optional context paragraph on the song's intent
---

# /sound-composition-score

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-composition.md`, `skills/sound-intelligence/composition-architecture.md`, and the practitioner's Genius Profile if present. Produce a **Score Architecture** for the named song. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Composition decisions touch rights territory (sample clearance, AI-vocal license, co-writer splits). This is system architecture, not legal advice. Validate jurisdiction- and PRO-specific compliance with qualified music counsel.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Open with the non-waivable disclaimer.
2. **Sort song stage.** Idea / sketch / demo-ready / demo-done / in-production. Score work fits idea / sketch most often.
3. **Read catalog signature** (if reference passed) to ground compositional decisions in practitioner's recurring harmonic moves, characteristic intervals, motif tendencies.
4. **Name expectation-and-reward arc** (Huron framework). Where does tension peak? Where does prediction get violated and confirmed?
5. **Key and mode** with rationale. Not the DAW's default of C major just because.
6. **Harmonic motion class** — functional / modal / static-with-color / chromatic. Pick with intent.
7. **Form** — verse-chorus / through-composed / AABA / loop-based. Each carries different listener-expectation defaults.
8. **Tempo and time signature** with rationale.
9. **Motif design** — primary motif (the melodic / harmonic / rhythmic kernel), motif-return logic (where it appears, how it transforms).
10. **Rights-adjacent flags** — sample sources used, co-writer involvement, AI involvement.
11. **Save.** `sound-intelligence/composition/score-<song-slug>-<YYYY-MM-DD>.md`.
12. **Hand off.** Default: `/sound-composition-lyric` (if vocal song) or `/sound-composition-arrange` (if instrumental).

## Output format

```markdown
# Score Architecture — <Song Title> — <YYYY-MM-DD>

> **Composition decisions touch rights territory. This is system architecture, not legal advice. Validate jurisdiction- and PRO-specific compliance with qualified music counsel.**

## Context
- **Song:** <title>
- **Stage:** <idea | sketch | demo-ready | demo-done | in-production>
- **Catalog signature reference:** <path | none>
- **Genius Profile referenced:** <yes — voice signature noted | no>

## Expectation-and-reward arc
<Where does tension peak? Where does prediction get violated (surprise) and where does it get confirmed (satisfaction)?>

## Key + mode
- **Key:** <e.g., D dorian — not the default of C major because the modal ambiguity holds the song's lyrical question without resolving it>
- **Mode:** <named with rationale>

## Harmonic motion class
- **Class:** <functional | modal | static-with-color | chromatic>
- **Rationale:** <why this class>
- **Primary cadences / harmonic moves:** <e.g., i — VII — VI — VII as repeating frame; modulation to relative major at bridge>

## Form
- **Form:** <verse-chorus | through-composed | AABA | loop-based>
- **Section map:** <e.g., Intro 8 / V1 16 / PreChorus 8 / Chorus 16 / V2 16 / PreChorus 8 / Chorus 16 / Bridge 16 / Chorus 16 / Outro 8>

## Tempo + time signature
- **Tempo:** <BPM> — <rationale>
- **Time signature:** <e.g., 4/4 | 7/8 | 6/8> — <rationale>

## Motif design
- **Primary motif:** <melodic / harmonic / rhythmic kernel>
- **Motif-return logic:** <where it appears, how it transforms — verbatim, inverted, fragmented, rhythmically displaced, modulated>

## Catalog-signature alignment
<How this score relates to recurring patterns in practitioner's catalog. What this song does that prior work has not. What this song does that prior work has done before — intentionally or not.>

## Rights-adjacent flags (for downstream Catalog + Sync)
- **Sample sources used:** <list with clearance status — cleared / public domain / practitioner-original / pending / refused-uncleared / none>
- **Co-writer involvement:** <named with split discussion needed flag if applicable>
- **AI involvement:** <none / disclosed in this stage>

## Load-bearing next move

**`/sound-composition-lyric <song-slug>`** (if vocal song) or **`/sound-composition-arrange <song-slug>`** (if instrumental).

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
- Theory cited by direction; never invented numbers.
- Key and mode named with rationale; not DAW-default.
- Form named with section map.
- Tempo and time signature named with rationale.
- Motif design and return logic both named.
- Rights-adjacent flags surfaced for downstream sub-systems.
- Compose with Genius if available.
- One hand-off at close. Default: lyric or arrange depending on song type.
- "Fix it in the mix" refused at this stage.
- Every artifact ends with "Built on SIP" attestation.

— Sound Composition Intelligence — part of the Sound Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Composition sub-system)
- Generated: 2026-04-26
---
