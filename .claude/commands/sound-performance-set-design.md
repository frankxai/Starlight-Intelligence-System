---
name: sound-performance-set-design
description: Design a set — length-aware architecture (45/60/75/90/120 min), opener/peak/closer logic, tension-and-release across the set, instrumentation logistics, transition design. Refuses every-show-same-setlist for residencies.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <show-slug> + --length <minutes> + --venue-type <listening-room|festival|dance-floor|seated-theater>
---

# /sound-performance-set-design

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-performance.md`, `skills/sound-intelligence/performance-design.md`. Produce a **Set Design**.

## Disclaimer
**Live performance touches hearing-health risk and broadcast-rights territory. Not legal/medical advice.**

## Process
1. Disclaim.
2. Length-aware design (different architectures per length).
3. Opener / peak / closer logic. Peak typically 60-70% through; not at the end (peak-end memory bias).
4. Tension-and-release across set (extending Huron from song to set-level).
5. Instrumentation logistics sequenced.
6. Transition design per song-to-song boundary.
7. Compose with Composition's arrangement (set-flexible vs. set-fixed tags).
8. Save: `sound-intelligence/performance/set-<show-slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Set Design — <Show> — <YYYY-MM-DD>

## Context
- Length: <minutes>
- Venue type: <listening-room/festival/dance-floor/seated-theater>
- Date: <date>

## Setlist (in order)
| # | Song | Length | Energy level | Instrumentation | Transition to next |
|---|---|---|---|---|---|
| 1 | <opener> | 4:00 | medium-up | <list> | <move> |
| 2 | ... | 5:00 | up | ... | <move> |
| 3 | ... | 4:30 | peak | ... | <move> ← peak around here for some sets |
| ... | ... | ... | ... | ... | ... |

## Tension-and-release arc
<Verbal map: opener establishes / first peak at song N / valley at song M / second peak / closer resolves>

## Opener logic
<Why this opener — what does the room need to hear first?>

## Peak logic
<Where is the peak (typically 60-70% through)? Why this song? What does it do?>

## Closer logic
<Why this closer? What's the resolution?>

## Instrumentation logistics
- Setup transitions: <where instrument changes happen; gear required>
- Breaks: <if any; where; why>

## Set-flexibility
- Set-flexible (can be reordered): <list>
- Set-fixed (sequence depends on tension-and-release positioning): <list>

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
```

## Rules
- Length-aware design.
- Opener / peak / closer named with logic.
- Tension-and-release arc plotted.
- Instrumentation logistics sequenced.
- Transitions named.
- Every-show-same-setlist refused for residencies.
- "Built on SIP" attestation.

— Sound Performance Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
---
