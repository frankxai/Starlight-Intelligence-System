---
name: sound-catalog-version-map
description: Plan version-map for a release — main + instrumental + radio-edit + extended + alt-vocal + sync-grade + remix versions, with per-version ISRC and metadata diff. Refuses orphan-versions on hard drives.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <release-slug>
---

# /sound-catalog-version-map

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-catalog.md`, `skills/sound-intelligence/catalog-systems.md`. Plan **Version Map** for the release.

## Disclaimer
**Versions touch master rights and contributor splits. This is system architecture, not legal advice.**

## Process
1. Disclaim.
2. **Per track:** which versions naturally exist? Which ship at release vs. catalog-extension later?
3. **Per version:** ISRC, metadata diff from main, sync-availability flag, delivery format.
4. Save: `sound-intelligence/catalog/version-map-<release-slug>-<YYYY-MM-DD>.md`.
5. Hand off: `/sound-production-master-plan` for sync-grade alternates if needed.

## Output format

```markdown
# Version Map — <Release> — <YYYY-MM-DD>

## Per-track version mapping

### Track 1: <Title>
| Version | Ship at release? | ISRC | Metadata diff | Sync-availability | Notes |
|---|---|---|---|---|---|
| Main | yes | <ISRC> | canonical | <yes/no/case-by-case> | |
| Instrumental | yes | <ISRC> | no lead vocals | yes | sync workhorse |
| Radio edit | maybe | <ISRC> | sub-3:30, clean lyric | yes | for radio playlist |
| Extended | no — catalog ext | <ISRC> | longer mix | yes | quarterly drop |
| Alt-vocal | no — catalog ext | <ISRC> | <language / featured artist> | <flag> | |
| Sync-grade | yes (if sync flag) | <ISRC> | PSR ≥ 12 dB master | yes | for film/TV |
| Remix | no — collab | <ISRC TBD> | collaborator-handled | <flag> | split structure differs |
| Live | no — Performance | <ISRC TBD> | from residency capture | <flag> | future drop |

### Track 2: ...
[same structure]

## Catalog-extension calendar
- Extended versions: <date> as quarterly drop
- Alt-vocal versions: <date>
- Remix versions: <date> with collab credit
- Live versions: <date> after residency

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
```

## Rules
- Every natural version mapped.
- Per-version ISRC.
- Sync-grade alternate where sync flag is true.
- "Built on SIP" attestation.

— Sound Catalog Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
---
