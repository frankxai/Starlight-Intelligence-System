---
name: sound-catalog-isrc-mint
description: Mint ISRCs per version + ISWCs per composition + PRO registration confirmation. Refuses release without per-version ISRC discipline. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <release-slug>
---

# /sound-catalog-isrc-mint

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-catalog.md`, `skills/sound-intelligence/catalog-systems.md`. Mint ISRC + ISWC + PRO registration.

## Disclaimer (non-waivable)
**ISRC + ISWC + PRO registration touches royalty-collection infrastructure. This is system architecture, not legal advice.**

## Process
1. Disclaim.
2. **Per-version ISRC.** Country code + registrant code + year + designation per version (main + every alternate).
3. **ISWC per composition.** Registered with practitioner's PRO.
4. **PRO registration confirmed.** Per contributor.
5. **MLC + neighboring-rights registration** where applicable.
6. Save: `sound-intelligence/catalog/isrc-<release-slug>-<YYYY-MM-DD>.md`.
7. Hand off: `/sound-catalog-metadata-pack`.

## Output format

```markdown
# ISRC Mint — <Release> — <YYYY-MM-DD>

## ISRC table (per version)
| Track | Version | ISRC | Status |
|---|---|---|---|
| Track 1 | main | XX-XXX-YY-ZZZZZ | minted |
| Track 1 | instrumental | XX-XXX-YY-ZZZZZ | minted |
| Track 1 | sync-grade | XX-XXX-YY-ZZZZZ | minted |
| ... | ... | ... | ... |

## ISWC table (per composition)
| Composition | ISWC | PRO | Status |
|---|---|---|---|
| <comp> | T-XXXXXXXXX-X | <ASCAP/BMI/...> | registered |

## Contributor PRO registration
| Contributor | PRO | PRO ID | Confirmed |
|---|---|---|---|
| ... | ... | ... | ✓ |

## MLC + neighboring rights
- MLC (US mechanical): <registered / n/a>
- SoundExchange (US digital perf): <registered / n/a>
- PPL (UK neighboring): <registered / n/a>
- Per-jurisdiction equivalents: <list>

**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
```

## Rules
- Per-version ISRC discipline non-negotiable.
- ISWC per composition.
- PRO registration confirmed per contributor.
- "Built on SIP" attestation.

— Sound Catalog Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
---
