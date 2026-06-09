---
name: sound-audience-sovereign-publish
description: Design publishing-as-architecture across the depth pyramid (peers-only / patrons-only / list-only / public-canonical). Refuses content-calendar-as-strategy and refuses platform-distribution-as-primary-channel.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <practitioner-slug> + --quarter <YYYY-Q#> + optional context on existing publish rhythm
---

# /sound-audience-sovereign-publish

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-audience.md`, `skills/sound-intelligence/audience-architecture.md`, cohort map / ritual architecture / list architecture if present, and Genius Profile. Produce a **Sovereign Publish Architecture** — depth-pyramid map + per-layer content shape + per-layer rhythm + algorithmic-refusal layer. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Sovereign publishing assumes consent-based audience relationships. CAN-SPAM / GDPR / CASL apply where applicable. This is system architecture, not platform strategy advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Read upstream.** Cohort map (who) + ritual architecture (when) + list architecture (where). Without these, sovereign-publish degrades to platform-roulette.
3. **Depth pyramid layers (largest reach → smallest depth at top; smallest reach → deepest at bottom):**
   - **Public-canonical** — what the practitioner would publish anyway as part of the work; release on DSPs, performance video on YouTube, long-form essay on personal site. Largest reach, smallest depth.
   - **List-only** — unreleased song shared with engaged list; studio-process video; long-form essay on catalog arc; first-listen of next release.
   - **Patrons-only** — alternate-take; unfinished demo; pre-mixed stem-pack; access to residency multi-track recording; quarterly state-of-the-catalog letter.
   - **Peers-only** — technical session detail; production-detail walk-through; collaboration invitation; honest financial-state share with chosen peers.
4. **Per-layer content shape.** What gets published at each layer; what does NOT cross layers (peers-only never becomes public; patrons-only stays patrons-only). Layer breaches erode trust.
5. **Per-layer rhythm.** Public-canonical follows release cadence; list-only weekly; patrons-only monthly milestone; peers-only quarterly. Rhythms do not duplicate content across layers.
6. **Algorithmic-refusal layer.** Where the practitioner explicitly does NOT publish. Algorithmic-only platforms that own the relationship (TikTok, Instagram if no list capture exists, Twitter/X if no list capture). Distribution that depends on platform algorithms is downstream metric, not relationship.
7. **Cross-layer integrity.** Layer boundaries enforced. A peers-only session leaking to public erodes trust. A list-only first-listen showing up in DSP playlist before list members hear it erodes trust. Integrity rules named.
8. **Vision-boundary integration.** Each layer respects MEMORY.md vision boundaries — refuses-political-soundtrack appears even at peers-only level if the practitioner has declared that boundary.
9. **Quarter map.** For the named quarter, populate the depth pyramid with specific planned publications.
10. **Save.** Write to `sound-intelligence/audience/sovereign-publish-<practitioner-slug>-<YYYY-Q#>.md`.
11. **Hand off.** Name exactly one next move:
    - Layer breach detected in current practice → architecture rebuild.
    - Algorithmic dependency detected → `/sound-audience-list-architecture` to rebuild sovereign layer first.
    - Architecture clean, ready for catalog scheduling → `/sound-catalog-release-plan`.

## Output format

```markdown
# Sovereign Publish Architecture — <Practitioner Name> — <Quarter> — <YYYY-MM-DD>

## Depth pyramid

| Layer | Reach | Depth | Content shape | Rhythm | This-quarter planned publications |
|---|---|---|---|---|---|
| Public-canonical | largest | smallest | <named: DSP releases, performance videos, long-form essays> | release cadence | <list> |
| List-only | medium | medium | <named: unreleased songs, studio process, catalog arc essays> | weekly | <list> |
| Patrons-only | small | high | <named: alt-takes, demos, stem-packs, state-of-catalog letters> | monthly milestone | <list> |
| Peers-only | smallest | deepest | <named: technical sessions, financial state, collab invites> | quarterly | <list> |

## Cross-layer integrity rules
- <named, e.g., "Peers-only never becomes public; quote-with-consent only">

## Algorithmic-refusal layer
**Platforms NOT used as primary distribution this quarter:** <named>
**Rationale:** <one sentence per platform>

## Vision-boundary respect at each layer
- <named refusal applied — e.g., "refuses-political-soundtrack — applies at all layers, not just public">

## Quarter publish-plan
**Public-canonical:** <named publications + dates>
**List-only:** <named + dates>
**Patrons-only:** <named + dates>
**Peers-only:** <named + dates>

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

- **Refuse content-calendar-as-strategy.** Calendars list publications; sovereign architecture names depth and rhythm per cohort.
- **Refuse algorithmic-only distribution as primary.** Platforms own the relationship; sovereign layers must dominate.
- **Cross-layer integrity non-waivable.** Layer breaches erode trust. Peers-only never becomes public.
- **Rhythms do not duplicate content across layers.** Same content at different depths erodes the depth claim.
- **Vision boundaries apply at all layers.** Boundary refusals are not just for public-canonical.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
