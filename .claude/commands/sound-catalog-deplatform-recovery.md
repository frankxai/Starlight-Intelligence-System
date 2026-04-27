---
name: sound-catalog-deplatform-recovery
description: Resilience protocol for the day a release is removed from a DSP — preservation, pattern recognition, re-release plan, audience communication, legal-counsel hand-off. Not legal advice; copyright disputes route to music attorney.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <release-slug> + --event <copyright-dispute|account-suspension|territorial-dispute|AI-flag|false-positive|account-hack>
---

# /sound-catalog-deplatform-recovery

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-catalog.md`, `skills/sound-intelligence/catalog-systems.md`. Activate **Deplatform Recovery Protocol**.

## Disclaimer (non-waivable)
**Copyright disputes and account-suspension events route to music attorney. This protocol coordinates the substrate-side response; it does not adjudicate the dispute.**

## Process
1. **Disclaim.** Hard hand-off named for legal-side disputes.
2. **Event triage.** Pattern recognition: copyright dispute / account suspension / territorial / AI flag / false-positive / account hack.
3. **Preservation status check.** Master files off-cloud (local + secondary)? Metadata off-platform? Splits documentation off-DDEX?
4. **Re-release plan.** Different distributor / account / territory / alternate-version that resolves dispute.
5. **Audience communication plan.** When to tell list / public / patrons / peers; what to disclose vs. hold.
6. **Legal hand-off.** Music attorney engaged for dispute adjudication.
7. Save: `sound-intelligence/catalog/deplatform-<release-slug>-<YYYY-MM-DD>.md`.

## Output format

```markdown
# Deplatform Recovery — <Release> — <YYYY-MM-DD>

> **Copyright disputes and account-suspension events route to music attorney. This protocol does not adjudicate.**

## Event
- **Type:** <copyright-dispute / account-suspension / territorial / AI-flag / false-positive / account-hack>
- **Platform:** <Spotify / Apple / etc.>
- **Date detected:** <date>
- **What was removed:** <track(s)>
- **Notice received:** <copy of DSP / claimant notice if available>

## Preservation status
- Master files off-cloud: <yes / GAP — recovery action: ...>
- Metadata off-platform: <yes / GAP>
- Splits documentation off-DDEX: <yes / GAP>
- Source files reconstructable: <yes / no>

## Pattern recognition
- Most likely cause: <hypothesis with reasoning>
- Similar past events: <reference if any>

## Re-release plan
- Alternate distributor: <name>
- Alternate account: <if applicable>
- Alternate version that resolves dispute: <e.g., re-recorded sample / removed sample / cleared sample>
- Target re-release date: <date>

## Audience communication
- **List communication:** <draft message + send timing>
- **Public statement:** <whether / when / what>
- **Patron-only context:** <deeper context for patrons>
- **Peer network:** <reach out for solidarity / reference if pattern recurring>

## Legal hand-off
- Music attorney engaged: <yes — name + date>
- Documentation provided to attorney: <list>
- Next legal step: <attorney-defined>

## Lessons-back-to-system
- What does this event teach the catalog architecture?
- Updates to deplatform-recovery protocol going forward?

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
```

## Rules
- Disclaimer at top; legal-side route named.
- Preservation gaps surfaced.
- Re-release plan named.
- Audience communication discipline.
- Music attorney engagement non-negotiable for legal disputes.
- "Built on SIP" attestation.

— Sound Catalog Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
---
