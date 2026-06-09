---
name: sound-composition-arrange
description: Produce an Arrangement Architecture for a song — instrumentation choices with reasoning, density curve across the song, contrast logic, automation foreshadowing, negative-space discipline. Refuses additive-only arrangement. Gates downstream production. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <song-slug> + --score <path-to-score-architecture> + --lyric <path-to-lyric-architecture-if-vocal> + optional reference-tracks
---

# /sound-composition-arrange

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-composition.md`, `skills/sound-intelligence/composition-architecture.md`, and the song's Score and Lyric architectures. Produce an **Arrangement Architecture**.

## Disclaimer (non-waivable)

**Arrangement decisions touch sample clearance and AI involvement disclosure for downstream Catalog and Sync. This is system architecture, not legal advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Read upstream.** Score architecture (form, key, motif). Lyric architecture (where vocal sits in the arrangement).
3. **Instrumentation choices** with reasoning per section. Refuse default ("acoustic guitar V1 because that's what we always do").
4. **Density curve.** Plot simultaneous-element count across each section. Default low V1 / med pre / peak chorus / lower V2 / higher pre / peak-plus chorus / lower bridge or new-element / peak-plus chorus 3 with foreshadow.
5. **Contrast logic.** Each section contrasts neighbors on at least one axis (timbral / dynamic / rhythmic / harmonic).
6. **Automation foreshadowing.** What gets introduced quietly in V1 to land at the bridge.
7. **Negative-space discipline.** What is removed in the final chorus to make the climax land.
8. **Sample / sound-source flags** — every audio source documented with clearance status. Hand-off to Catalog.
9. **Set-flexible vs. set-fixed tag** for downstream Performance.
10. **Save.** `sound-intelligence/composition/arrange-<song-slug>-<YYYY-MM-DD>.md`.
11. **Hand off.** Default: `/sound-composition-demo` (if demo not yet captured) or `/sound-production-mix-plan` (if demo done and ready for production).

## Output format

```markdown
# Arrangement Architecture — <Song Title> — <YYYY-MM-DD>

> **Arrangement decisions touch sample clearance and AI involvement disclosure. This is system architecture, not legal advice.**

## Context
- **Song:** <title>
- **Score referenced:** <path>
- **Lyric referenced:** <path | n/a-instrumental>
- **Reference tracks:** <2-3 reference tracks the arrangement is in conversation with — not to copy, to position>

## Section-by-section arrangement

| Section | Length | Instrumentation | Element count | Density rank | Contrast vs. previous |
|---|---|---|---|---|---|
| Intro | 8 bars | <list> | <n> | <low/med/high/peak> | <axis> |
| V1 | 16 bars | <list> | <n> | <rank> | <axis> |
| ... | ... | ... | ... | ... | ... |

## Density curve
<Sketch the density curve verbally and / or as a simple ASCII chart. Default: low V1 / med pre / peak chorus / lower V2 / higher pre / peak-plus chorus 2 / bridge low or new-element / peak-plus chorus 3 with foreshadow. Violations from default named with intent.>

## Automation foreshadowing
- **Element introduced quietly:** <e.g., synth pad enters at -18 dB in V1 bar 13>
- **Where it lands:** <e.g., same pad at 0 dB in bridge>
- **Why this foreshadow:** <expectation-and-reward grounding>

## Negative-space discipline
- **What is REMOVED in final chorus to make the climax land:** <e.g., drums drop out for first 4 bars of final chorus, vocal-and-piano-only, then return louder>
- **Other negative-space moves:** <list>

## Refusal-pattern check
- **"Fix it in the mix":** refused — upstream-defaultable failures fixed here
- **Additive-only arrangement:** refused — every section has both add and remove
- **Default instrumentation:** refused — every choice has reasoning

## Sample / sound-source flags (for Catalog clearance gate)
| Source | Type | Clearance status |
|---|---|---|
| <e.g., field recording from <location>> | sample | practitioner-original |
| <e.g., synth patch from <preset library>> | preset | licensed (library terms) |
| <e.g., vocal sample from <track>> | sample | pending — clearance required before mix-final |

## Set-flexibility tag (for Performance)
- **Set-flexible** (can be reordered live) | **Set-fixed** (set sequence depends on this song's exact tension-and-release positioning)

## Load-bearing next move

**`/sound-composition-demo <song-slug>`** if demo not captured; or **`/sound-production-mix-plan <song-slug>`** if demo done.

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
- Every instrumentation choice carries reasoning.
- Density curve plotted across the song.
- Contrast logic per section.
- Automation foreshadowing named.
- Negative-space discipline applied.
- "Fix it in the mix" refused.
- Sample / sound-source clearance flags surfaced for Catalog.
- Set-flexible vs. set-fixed tag for Performance.
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
