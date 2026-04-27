---
name: sound-catalog-release-plan
description: Produce a Release Plan — single/EP/album decision, release date, distribution channel, sync-availability flag, audience-warming sequence, version-map plan. Refuses single-track-into-algorithm. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <release-slug> + --tracks <track-list> + --target-date <YYYY-MM-DD>
---

# /sound-catalog-release-plan

Load `verticals/sound-intelligence/SKILL.md`, `agents/starlight-sound-catalog.md`, `skills/sound-intelligence/catalog-systems.md`, MEMORY.md vision boundaries. Produce a **Release Plan**.

## Disclaimer (non-waivable)

**Release planning touches contractual obligations to distributors, PROs, and any contributor splits. This is system architecture, not legal advice.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.**
2. **Rights-and-clearance gate.** Sample clearance, AI-vocal-license, contributor splits — all must be 100% complete before plan finalization.
3. **Release type decision.** Single (one moment) / EP (thesis, 3-7 tracks) / album (body of work, 8+).
4. **Release date.** Audience-warming runway (typically 4-8 weeks); sync-pipeline-window awareness (3-9 months for film/TV); DSP-playlist consideration cycle (4-6 weeks).
5. **Distribution channel.** Distrokid (owner-keeps-rights flat-fee) / The Orchard / FUGA (label-tier) / CD Baby / TuneCore / AWAL / Stem.
6. **Sync-availability flag** per track; read MEMORY.md vision boundaries.
7. **Audience-warming sequence.** Pre-release ritual cadence (compose with Audience).
8. **Version-map plan.** Which versions ship at release vs. catalog-extension later.
9. **Save.** `sound-intelligence/catalog/release-plan-<release-slug>-<YYYY-MM-DD>.md`.
10. **Hand off.** `/sound-catalog-isrc-mint`.

## Output format

```markdown
# Release Plan — <Release Title> — <YYYY-MM-DD>

> **Release planning touches contractual obligations. This is system architecture, not legal advice.**

## Context
- Release type: <single | EP | album>
- Target date: <YYYY-MM-DD>
- Tracks: <list>
- Discography position: <follows X / sets up Y / closes Z>

## Rights-and-clearance status
- Sample clearance: <100% complete | INCOMPLETE — release-plan blocked>
- AI-vocal-license: <none | disclosed | INCOMPLETE>
- Contributor splits: <complete totaling 100% per track | INCOMPLETE>

## Release type rationale
<Why single vs. EP vs. album for this release.>

## Release-date rationale
- Audience-warming runway: <weeks>
- Sync-pipeline-window consideration: <relevant or n/a>
- DSP-playlist consideration: <submit by date>
- Calendar context: <holidays / festival timing / album-cycle of comparable artists>

## Distribution channel
- Choice: <distributor> with rationale: <why>
- Service tier: <flat-fee / label-services / specific-tier>

## Sync-availability flag (per track)
| Track | Sync-availability | Rationale (vision-boundary respect) |
|---|---|---|
| Track 1 | yes / no / case-by-case | <reasoning> |
| ... | ... | ... |

## Audience-warming sequence
- T-8 weeks: <ritual / drop>
- T-4 weeks: <ritual>
- T-2 weeks: <ritual>
- T-1 week: <ritual>
- Release day: <ritual>
- T+1 week: <ritual>
- T+1 month: <ritual>

## Version-map plan
- At release: <main + which alternates>
- Catalog-extension later: <which alternates and when>

## Refusal-check
- Single-track-into-algorithm without discography-position: refused
- Distribution requiring master-rights flip without justified services: refused
- Release without audience-warming: refused

## Load-bearing next move

**`/sound-catalog-isrc-mint <release-slug>`** to mint per-version ISRCs.

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
---
```

## Rules

- Disclaimer at top.
- Clearance gate non-negotiable.
- Release type with rationale.
- Discography-position named.
- Sync-availability respects vision boundaries.
- Audience-warming sequence compose with Audience.
- "Built on SIP" attestation.

— Sound Catalog Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — SIP v1.1.0 · Sound Intelligence — Catalog · 2026-04-26
---
