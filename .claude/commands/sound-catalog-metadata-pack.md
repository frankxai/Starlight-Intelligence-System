---
name: sound-catalog-metadata-pack
description: Produce a complete Metadata Pack — ISRC + ISWC + splits + PRO IDs + instrumentation + sample clearance + AI disclosure + sync-availability + alternate-version mapping + discography position. Refuses release without complete pack. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <release-slug>
---

# /sound-catalog-metadata-pack

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-catalog.md`, `skills/sound-intelligence/catalog-systems.md`. Produce a complete **Metadata Pack** that gates release shipping.

## Disclaimer (non-waivable)
**Metadata pack is the substrate the catalog runs on. Royalty leakage starts here. This is system architecture, not legal advice.**

## Process
1. Disclaim.
2. **Per-track field completion** (DDEX-aligned where applicable).
3. **Splits totaling 100%** per track.
4. **Sample clearance status** per sample (never blank).
5. **AI-involvement disclosure** per track.
6. **Sync-availability flag** per track tied to vision boundaries.
7. **Alternate-version mapping** per track.
8. **Discography position** per track / release.
9. **DDEX validation pass.**
10. Save: `sound-intelligence/catalog/metadata-<release-slug>-<YYYY-MM-DD>.md`.
11. Hand off: distribution submission (actual flow) or master finalization.

## Output format

```markdown
# Metadata Pack — <Release> — <YYYY-MM-DD>

> **Royalty leakage starts here. This is system architecture, not legal advice.**

## Per-track metadata

### Track 1: <Title>
- **ISRC:** XX-XXX-YY-ZZZZZ
- **ISWC:** T-XXXXXXXXX-X
- **Splits (totaling 100%):**
  | Contributor | Role | PRO | PRO ID | % |
  |---|---|---|---|---|
  | ... | composer | ASCAP | XXX | 50 |
  | ... | producer | BMI | XXX | 30 |
  | ... | featured artist | SESAC | XXX | 20 |
- **Instrumentation tags (DDEX):** <list>
- **Sample clearance:**
  | Sample | Source | Status |
  |---|---|---|
  | ... | ... | cleared / public domain / practitioner-original / pending / refused-uncleared |
- **AI involvement:** <none | disclosed: <description>>
- **Sync-availability flag:** <yes / no / case-by-case> — rationale: <vision-boundary respect>
- **Alternate-version map:**
  | Version | ISRC | Diff from main |
  |---|---|---|
  | instrumental | ... | no vocals |
  | sync-grade | ... | PSR ≥ 12 dB master |
- **Language:** <code or instrumental>
- **Explicit:** <yes / no>
- **Genre:** primary / secondary
- **Key:** <musical key>
- **Tempo:** <BPM>
- **Mood tags:** <list — useful for sync brief-fit>
- **Discography position:** <follows X / sets up Y>

### Track 2: ...
[same structure]

## DDEX validation
- Pass: <yes — submitted for distribution | no — fix and resubmit: <list>>

## Refusal-check
- Metadata-as-marketing-only: refused
- Single-track-into-algorithm without discography position: refused
- Sample-clearance blank: refused

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
```

## Rules
- Splits totaling 100% non-negotiable.
- Sample-clearance never blank.
- AI involvement disclosed.
- Sync-availability tied to vision boundaries.
- DDEX validation pass.
- Discography position named.
- "Built on SIP" attestation.

— Sound Catalog Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
---
