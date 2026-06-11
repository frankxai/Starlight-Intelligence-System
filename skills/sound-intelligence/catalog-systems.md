---
name: sound-intelligence/catalog-systems
description: Designs the catalog operating instrument — release plan, ISRC mint, metadata pack, version map, deplatform recovery — using metadata-as-infrastructure discipline. Refuses metadata-as-marketing-only and refuses single-track-into-the-algorithm. Use when building a release plan, minting ISRCs, auditing catalog metadata, architecting version control for a track catalog, or preparing deplatform recovery. Sub-system 3 of 6 in the Sound Intelligence reference vertical.
---

# Skill: sound-intelligence/catalog-systems

> Designs the catalog operating instrument — release plan, ISRC mint, metadata pack, version map, deplatform recovery — using metadata-as-infrastructure discipline. Refuses metadata-as-marketing-only and refuses single-track-into-the-algorithm. Sub-system 3 of 6 in the Sound Intelligence reference vertical.

**Domain:** Sound Intelligence
**Vertical:** Sound Intelligence (sub-system: Catalog)
**Voice:** the practitioner's voice — warm, operationally precise, refuses casual rights language.
**Disclaimer:** Catalog decisions touch rights, contracts, and royalty-collection infrastructure. This skill produces system architecture, not legal advice. Validate jurisdiction- and PRO-specific compliance with qualified music counsel and the practitioner's PRO.

---

## Activation Triggers

**Keywords:** release, release date, single, EP, album, ISRC, ISWC, metadata, contributor splits, splits, PRO, ASCAP, BMI, SESAC, GMR, PRS, PPL, GEMA, SACEM, JASRAC, MLC, neighboring rights, mechanical royalties, publishing, distribution, distributor, Distrokid, TuneCore, CD Baby, The Orchard, Stem, FUGA, AWAL, DSP, Spotify, Apple Music, Bandcamp, DDEX, deplatform, takedown, copyright dispute, sample clearance, version map, radio edit, instrumental, alternate version.

**Agents:** `starlight-sound-catalog` (primary), `starlight-sound-production` (master gate), `starlight-sound-sync` (sync-availability flag), `starlight-business` (entity decisions).

**Intents:** release-planning, ISRC-architecture, metadata-discipline, version-mapping, deplatform-recovery.

**Commands:** `/sound-catalog-release-plan`, `/sound-catalog-isrc-mint`, `/sound-catalog-metadata-pack`, `/sound-catalog-version-map`, `/sound-catalog-deplatform-recovery`.

---

## Research grounding

- **IFPI / RIAA / IRMA standards** for ISRC structure and minting authority.
- **IFPI for ISWC** (composition identifier, distinct from ISRC).
- **Music Modernization Act (US, 2018):** created the MLC for mechanical-licensing collection; relevance for US-jurisdictional practitioners.
- **DDEX standards** for digital music supply chain; metadata-validation per DDEX.
- **The Music Producers Guild:** metadata best practices direction.
- **Industry research direction (cited not invented):** substantial royalty losses occur from poor metadata across the industry. Specific figures vary by report; the directional finding is stable.

This skill cites direction. Specific royalty figures shift; the architecture (ISRC per version, ISWC per composition, splits documented at release time, deplatform-recovery protocol in place) is stable.

---

## Protocol — 7 steps

### Step 1: Sort release stage

Pre-planning / plan-in-progress / plan-locked-needs-metadata / metadata-done-needs-distribution / released-needs-monitoring / deplatform-event.

### Step 2: Rights-and-clearance gate

Before any release-plan finalization: sample clearance status for every track; AI-vocal-license status for every track; contributor splits documentation status. Any open status blocks release-plan finalization.

### Step 3: Release type decision

| Type | Rationale |
|---|---|
| **Single** | One moment, low risk, fast pacing. Useful between EPs/albums; useful for sync-pipeline visibility. |
| **EP (3-7 tracks)** | A thesis. 6-8 month arc. Useful for cohort-deepening between albums. |
| **Album (8+ tracks)** | A body of work. 12-18 month arc. Catalog-defining. |

Match to practitioner's catalog stage and audience expectations.

### Step 4: ISRC architecture

ISRC format: country code (2 chars) + registrant code (3 chars) + year (last 2 digits) + designation (5 chars sequential per registrant per year).

- **Per-version ISRC:** every alternate version gets its own ISRC. Main release / instrumental / radio edit / extended / alt-vocal / sync-grade-dynamic-range / live / remix.
- **ISWC per composition:** registered with practitioner's PRO. Distinct from ISRC. Covers the song independent of any specific recording.
- **Per-PRO registration:** composition with publishing-society. Recording with neighboring-rights society where applicable (PPL in UK, SoundExchange in US for digital performance).

### Step 5: Metadata pack

Per-track metadata fields:

- ISRC
- ISWC
- Contributor splits with each contributor's PRO ID and percentage (must total 100%)
- Instrumentation tags (DDEX-aligned)
- Sample clearance status per sample (cleared / public domain / practitioner-original / pending / refused-uncleared — never blank)
- AI-involvement disclosure (any AI in any stage)
- Sync-availability flag (yes / no / case-by-case with rationale tied to vision boundaries)
- Alternate-version mapping (each alternate version's ISRC plus diff from main version)
- Language tag (lyric language; instrumental tracks tagged as such)
- Explicit-content tag (yes / no / clean-version-also-available)
- Genre tags (primary + secondary, DDEX-taxonomy-aware)
- Key (musical key — useful for sync brief-fit)
- Tempo (BPM — useful for sync brief-fit)
- Mood tags (useful for sync brief-fit)
- Discography-position field (this release follows X / sets up Y / closes Z)

DDEX validation pass before submission.

### Step 6: Version map

Versions designed as catalog extensions, not as orphans-on-hard-drives. Per-version: ISRC, metadata diff from main, sync-availability flag, delivery-format spec.

- **Main release** — canonical version.
- **Instrumental** — no lyrics; useful for sync, fan covers, practitioner's own film/podcast use.
- **Radio edit** — sub-3:30 typically; clean lyric if applicable.
- **Extended** — longer mix; common for electronic/dance.
- **Alt-vocal** — sometimes different language; sometimes featured-artist version.
- **Sync-grade-dynamic-range master** — alternate-master from Production with PSR ≥ 12 dB.
- **Remix versions** — collaborator-handled; split structure differs.
- **Live versions** — from Performance recordings.

### Step 7: Deplatform-recovery protocol

Resilience for the day a release is removed from a DSP.

- **Preservation protocol:** master files preserved off-cloud (local + secondary backup); metadata preserved off-platform (own-database / spreadsheet-of-truth); contributor splits documentation preserved off-DDEX.
- **Pattern recognition:** copyright dispute on sample / on melody / on name; account suspension; territorial dispute; AI-content flag; false-positive; account hack.
- **Re-release plan:** different distributor; different account; alternate-version that resolves the dispute.
- **Audience communication:** when to tell the list; when to tell the public; what to disclose vs. hold.
- **Legal-counsel hand-off:** copyright-dispute deplatform routes to music attorney.

---

## Rules

1. **Disclaimer at top of every artifact touching rights.**
2. **Sort release stage before applying commands.**
3. **Rights-and-clearance gate non-negotiable.** Sample-uncleared = release-plan-not-finalized. AI-vocal-impersonation = release-refused.
4. **ISRC discipline per-version.** Every alternate version gets its own ISRC.
5. **ISWC registered per composition.** PROs cannot collect what is not registered.
6. **Contributor splits totaling 100% per track.** Documented at release, not later.
7. **PRO registration confirmed for every contributor.** Royalty leakage prevention.
8. **Sync-availability flag set with reasoning tied to vision boundaries.**
9. **Sample clearance status documented per sample (never blank).**
10. **AI-involvement disclosed per track.**
11. **DDEX validation pass at submission.**
12. **Discography-position named per release.** No orphan releases.
13. **Single-track-into-algorithm refused.** Catalog-as-body-of-work discipline.
14. **Master-rights-flip-for-an-advance refused unless services justify.**
15. **Deplatform-recovery protocol in place BEFORE deplatform event.** Preservation off-cloud, off-platform, off-DDEX.
16. **Every artifact ends with "Built on SIP" attestation.**

---

## Output Artifacts

| Artifact | Command | Storage |
|----------|---------|---------|
| Release plan | `/sound-catalog-release-plan` | `sound-intelligence/catalog/release-plan-<release-slug>-<date>.md` |
| ISRC mint | `/sound-catalog-isrc-mint` | `sound-intelligence/catalog/isrc-<release-slug>-<date>.md` |
| Metadata pack | `/sound-catalog-metadata-pack` | `sound-intelligence/catalog/metadata-<release-slug>-<date>.md` |
| Version map | `/sound-catalog-version-map` | `sound-intelligence/catalog/version-map-<release-slug>-<date>.md` |
| Deplatform recovery | `/sound-catalog-deplatform-recovery` | `sound-intelligence/catalog/deplatform-<release-slug>-<date>.md` |

---

## Related Skills

- `intelligence/decision-framework` — release-type, distributor selection, sync-availability decisions
- `intelligence/systems-thinking` — catalog-as-body-of-work; metadata-as-infrastructure
- `intelligence/pattern-recognition` — discography-position recognition; deplatform-cause patterns
- `memory/knowledge-synthesis` — composing the per-release record across plan / ISRC / metadata / version-map / recovery

---

— Sound Catalog Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Catalog sub-system)
- Generated: 2026-04-26
---
