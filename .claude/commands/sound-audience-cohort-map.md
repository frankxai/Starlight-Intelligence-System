---
name: sound-audience-cohort-map
description: Map fanbase as cohorts segmented by entry-point + depth + channel. Refuses follower-count-as-audience and broadcast-to-everyone-the-same. Output is a per-cohort communication matrix, not a marketing funnel.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <practitioner-slug> + --catalog-window <last-N-releases> + optional context paragraph on entry-point patterns observed
---

# /sound-audience-cohort-map

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-audience.md`, `skills/sound-intelligence/audience-architecture.md`, and the practitioner's Genius Profile if present. Produce a **Cohort Map**. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Audience cultivation touches consent law (CAN-SPAM, GDPR, CASL where applicable). This is system architecture, not legal advice. Validate jurisdiction-specific compliance with qualified counsel before any list-acquisition or list-sharing decision.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Open with the non-waivable disclaimer.
2. **Sort audience stage.** Pre-list / Early-list (<500) / Growing-list (500-5000) / Mature-list (5000+) / Patron-tier-active / Multi-tier (list + patrons + peers).
3. **Read vision boundaries.** Pull MEMORY.md vision boundaries — refusals around upsell-aggression, paywall-of-basic, list-rental, etc. The cohort map respects these.
4. **Entry-point axis.** For each release / placement / show / collaboration in the catalog window, name the entry-points it produced — the channel each cohort first encountered the practitioner through (sync placement, listening-room residency, DSP playlist, peer recommendation, accidental-algorithmic, label release).
5. **Depth axis.** Within each entry-point cohort, segment by depth: casual (algorithmic listener; never opted in) / engaged (opted into list; opens occasionally) / patron (paid tier; consistent engagement) / collaborator (creative or operational relationship).
6. **Channel axis.** For each depth tier, name where this cohort is reachable: list (sovereign), Bandcamp (semi-sovereign), Patreon (semi-sovereign), DSP (algorithmic), Discord / Geneva / private community (semi-sovereign).
7. **Cross-axis matrix.** Produce the entry × depth × channel matrix; populate with rough counts where known, flagged-as-unknown where not. The matrix is the basis for differentiated communication; broadcast-to-everyone-the-same is refused after this command runs.
8. **Cohort signatures.** Per cohort: the typical expectation (a sync-entered fan expects different output than a residency-entered fan); the typical engagement pattern; the load-bearing communication channel for this cohort.
9. **Refusal flags.** Identify follower-count-success-without-list-success cohorts (high TikTok / Spotify monthly-listeners with no list capture); flag explicitly as algorithmic dependency, not audience.
10. **Save.** Write to `sound-intelligence/audience/cohort-map-<practitioner-slug>-<YYYY-MM-DD>.md`.
11. **Hand off.** Name exactly one next move:
    - Pre-list / Early-list → `/sound-audience-list-architecture` (build the load-bearing layer first).
    - Growing-list / Mature-list → `/sound-audience-ritual-design` (cadence is now the leverage).
    - Multi-tier → `/sound-audience-fan-stay-interview` for the deepest cohort.

## Output format

```markdown
# Cohort Map — <Practitioner Name> — <YYYY-MM-DD>

## Audience stage
**Stage:** <pre-list | early-list | growing-list | mature-list | patron-active | multi-tier>

## Vision boundaries that constrain this cohort map
- <named refusal from MEMORY.md, e.g., "refuses upsell-aggression">

## Entry × Depth × Channel matrix

| Entry-point | Casual | Engaged | Patron | Collaborator | Primary channel |
|---|---|---|---|---|---|
| <release / show / placement> | <N or unknown> | <N> | <N> | <N> | <list / Bandcamp / Patreon / DSP / community> |

## Cohort signatures
- **<cohort>** — typical expectation: <named>; typical engagement: <named>; load-bearing channel: <named>.

## Algorithmic-dependency flags
- <cohort with metrics-success-without-depth-success — explicitly flagged>

## Recommended next move
**`/<command>`** — <one-line rationale>.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.3 (Sound Intelligence — Audience sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Refuse follower-count-as-audience-metric.** TikTok / Spotify monthly-listeners are downstream metrics, not relationships.
- **Refuse broadcast-to-everyone-the-same.** The matrix exists to enable differentiated communication.
- **Honor vision boundaries.** Cohort architecture respects practitioner's declared refusals around monetization patterns.
- **Three-axis matrix, never one-axis.** Single-axis fan segmentation (just by depth, just by channel) under-models the practitioner's audience.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
