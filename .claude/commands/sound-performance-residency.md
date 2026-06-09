---
name: sound-performance-residency
description: Multi-night residency design — per-night focus, cumulative arc for return-attending audience, audience-return ritual, recording-the-residency plan. Refuses every-night-same-setlist.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <residency-slug> + --nights <n> + --venue <name>
---

# /sound-performance-residency

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-performance.md`, `skills/sound-intelligence/performance-design.md`. Design a **Multi-Night Residency**.

## Process
1. Per-night focus across N nights.
2. Cumulative arc for audience attending all nights.
3. Audience-return ritual (the moment that earns night N+1).
4. Recording-the-residency plan.
5. Save: `sound-intelligence/performance/residency-<residency-slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Residency Design — <Residency> — <YYYY-MM-DD>

## Context
- Nights: <n>
- Venue: <name>
- Dates: <range>

## Per-night focus
| Night | Focus | Setlist class | Audience expectation |
|---|---|---|---|
| 1 | Full-catalog overview | hits + breadth | newcomer-friendly |
| 2 | Deep cuts and unreleased | rare + new | returning loyalist-friendly |
| 3 | Collaborator night with guests | features + duets | event-night |
| 4 | Long-form arrangements | extended + improvisation | jam/listening crowd |
| 5 | Stripped-down acoustic | rearranged catalog | intimacy-night |

(Illustrative; practitioner shapes per residency)

## Cumulative arc
<For audience attending all nights, what arc do they trace? What thread runs through all five nights? What's the meta-arc the residency tells?>

## Audience-return ritual
- Night 1 → Night 2: <the unfinished song / unanswered question / thread>
- Night 2 → Night 3: <ritual>
- Night 3 → Night 4: <ritual>
- Night 4 → Night 5: <ritual>

## Recording-the-residency plan
- Multi-track capture: <yes / no — protocol>
- Mix-down protocol: <date / engineer>
- Live-album/EP release plan: <Catalog hand-off>
- Per-night ISRC architecture: <if applicable>
- Audio-quality target: <sync-grade / streaming / archival>

## Refusal-check
- Every-night-same-setlist: refused
- No audience-return ritual: refused
- Recording skipped on multi-night residency: usually refused (catalog asset opportunity)

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
```

## Rules
- Per-night focus differentiated.
- Cumulative arc named.
- Audience-return ritual designed.
- Recording plan in place.
- Catalog hand-off if recording becomes catalog asset.
- "Built on SIP" attestation.

— Sound Performance Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Performance · 2026-04-26
---
