---
name: sound-intelligence/sync-licensing
description: Designs the sync placement instrument — brief fit, placement thesis, license economics, rights pack, sync stay-interview — using music-supervision and licensing-economics direction. Refuses sync placements that contradict declared vision boundaries and refuses master-rights-flip-for-an-advance. Use when evaluating a sync brief, modeling license economics, building a rights pack, preparing a placement thesis, or running a sync stay-interview with a music supervisor. Sub-system 6 of 6 in the Sound Intelligence reference vertical.
---

# Skill: sound-intelligence/sync-licensing

> Designs the sync placement instrument — brief fit, placement thesis, license economics, rights pack, sync stay-interview — using music-supervision and licensing-economics direction. Refuses sync placements that contradict declared vision boundaries and refuses master-rights-flip-for-an-advance. Sub-system 6 of 6 in the Sound Intelligence reference vertical.

**Domain:** Sound Intelligence
**Vertical:** Sound Intelligence (sub-system: Sync)
**Voice:** the practitioner's voice — warm, business-precise, refuses casual rights language.
**Disclaimer:** Sync decisions touch contracts, licensing law, copyright, and AI-and-rights frontier (rapidly evolving 2024-2026). This skill produces system architecture, not legal advice. Validate every specific deal with qualified music counsel and the practitioner's PRO.

---

## Activation Triggers

**Keywords:** sync, synchronization, sync license, sync placement, music supervision, music supervisor, music library, production library, Musicbed, Marmoset, Songtradr, Audiosocket, MassiveMusic, Universal Production Music, APM, Position Music, TV, film, commercial, advertising campaign, trailer, promo, spot, brief, placement, cue sheet, master use, publishing share, MFN, most favored nations, exclusivity, territory, term.

**Agents:** `starlight-sound-sync` (primary), `starlight-sound-catalog` (rights structure), `starlight-sound-production` (sync-grade alternate-master), `starlight-business` (entity treatment).

**Intents:** brief-fit-evaluation, placement-thesis, license-economics, rights-pack-delivery, sync-stay-interview.

**Commands:** `/sound-sync-brief-fit`, `/sound-sync-placement-thesis`, `/sound-sync-license-economics`, `/sound-sync-rights-pack`, `/sound-sync-stay-interview`.

---

## Research grounding

- **Music supervision literature** (Eshun, Knakkergaard, plus practitioner-trade publications like *MusicSupervisor.com* / Production Music Association).
- **Sync licensing economics direction** — Songtradr / Musicbed / Marmoset / Universal Production Music public data. Placement economics range widely (TV cable indie: low four figures; major-network primetime: mid-five figures; major film: variable per scene; commercial campaign: variable per usage). Specific figures shift; the directional structure is stable.
- **Krasilovsky & Shemel — *This Business of Music*:** practitioner-grade reference for licensing structures.
- **Public-domain and sample-clearance literature** (Blanchard, Boucher, others).
- **AI-and-rights frontier research** (rapidly evolving 2024-2026): doctrine on AI-generated and AI-trained-on-corpus work shifts; the vertical cites direction not invented case law.

This skill cites direction. Specific placement fees, deal terms, and AI-rights doctrine shift; the architecture (four-axis brief-fit gate; vision-boundary defense; license-economics surfacing; rights-pack completeness; stay-interview cadence) is stable.

---

## Protocol — 7 steps

### Step 1: Sort sync stage

Brief-incoming / brief-evaluating / pitch-in-progress / negotiating / closing / closed-delivering / post-placement-monitoring / stay-interview-cycle.

### Step 2: Vision-boundary gate

Pull MEMORY.md vision boundaries. Brief is checked against active boundaries first. Contradiction = refusal. Non-waivable.

Common boundaries (per-practitioner the list varies):

- Refuses-political-campaign-sync
- Refuses-violence-soundtrack
- Refuses-extractive-fossil-fuel-brand
- Refuses-AI-vocal-impersonation-license-out
- Refuses-children's-content-without-curated-fit

The practitioner does not exception-make under deal pressure. If the boundary needs revision, revise it deliberately at the MEMORY.md level — outside the deal context.

### Step 3: Brief-fit four-axis check

| Axis | Check |
|---|---|
| **Catalog match** | Does the practitioner have tracks that fit the brief (mood, tempo, instrumentation, emotional arc)? |
| **Master availability** | Does master state allow placement? Rights structure permits? Sync-availability flag is true? Alternate-master available if needed? |
| **Rights structure** | Splits documented? Sample clearances complete? AI involvement disclosed? |
| **Vision-boundary respect** | Does brief contradict any active vision boundary in MEMORY.md? |

Pass all four → proceed. Fail any → refuse and document.

### Step 4: Placement thesis

When brief-fit passes, name the 3-7 tracks that fit. Per track:

- ISRC reference
- Version (main / instrumental / sync-grade-dynamic-range alternate-master)
- Reference cues from the brief that this track matches (mood / tempo / instrumentation / emotional arc)
- Clearance flags (samples, AI involvement, contributor-split status)

The thesis is the pitch document the supervisor reads; rigor predicts placement.

### Step 5: License economics

Surface the trade.

| Term | What it is | Practitioner consideration |
|---|---|---|
| **Sync fee** | Right-to-synchronize master+composition with visual content | Varies by placement type, budget, exposure |
| **Master-use fee** | Sometimes folded into sync fee; sometimes separate | Watch for hidden discounting |
| **Publishing share** | % of sync fee that goes to publisher / publishing-society | Depends on deal and PRO |
| **Term** | Perpetuity vs. limited | Perpetuity costs more per dollar but compounds badly if placement underperforms |
| **Territory** | Worldwide / North America / specific regions | Narrower territory leaves room for separate placements elsewhere |
| **Exclusivity** | None / category / period / fully-exclusive | Reduces other-placement opportunities; price accordingly |
| **MFN clauses** | Most-favored-nations | Useful in package licensing |
| **Re-use options** | Permits derivative use without further license? | At what fee? |

Comparison to comparable placements where data is available.

### Step 6: Rights pack

Complete documentation delivered with every license.

- **Master rights:** practitioner-owned / label-owned / co-owned with split
- **Publishing rights:** practitioner-publishing / co-publishing / publisher-controlled with split
- **Sample clearances:** per sample, status documented
- **Contributor consents:** per contributor, consent for THIS specific placement documented
- **AI involvement disclosure:** any AI in any stage; AI-vocal-impersonation status verified as never
- **Delivery format:** broadcast WAV (24-bit / 48kHz typical for film/TV); alternate-master if specified; stems if deal allows / requires; instrumental version if applicable
- **Attestation:** every audio asset shipped carries `/sip-attest-audio` embedded EXIF/XMP plus rights-pack header

### Step 7: Sync stay-interview

The most-engaged supervisors / curators asked what they actually want.

- **Methodology:** extending fan-stay-interview research direction. Supervisors / library curators / brand-side music people who have placed or considered the practitioner's work.
- **Question framing:** specific narrow questions ("what brief class do you have a recurring shortage of?" "what's the most common reason you pass on tracks that almost fit?") produce better signal than open ones.
- **Pattern recognition:** ≥3-occurrence threshold for theme elevation. Feed Composition's idea bank.
- **Cadence:** quarterly minimum.

---

## Rules

1. **Disclaimer at top of every artifact.** Sync touches contracts and copyright; not legal advice.
2. **Sort sync stage before applying commands.**
3. **Vision-boundary gate non-waivable.** Practitioner does not exception-make under deal pressure.
4. **Brief-fit four-axis check before any pitch.** Catalog + master + rights + vision.
5. **Placement thesis with ISRC + version + reference-cue match per track.**
6. **License-economics surfacing complete:** sync fee + master-use fee + publishing share + term + territory + exclusivity + MFN + re-use options.
7. **Master-rights-flip-for-an-advance refused unless services-rendered justify.**
8. **AI-vocal-impersonation refused at brief-fit AND at rights-pack stages.**
9. **Rights pack completeness:** master + publishing + samples + contributors + AI disclosure.
10. **`/sip-attest-audio` on every audio asset shipped via rights pack.**
11. **Music-attorney sign-off named for every specific deal.**
12. **Cue sheets filed for broadcast placements within 30 days.**
13. **Stay-interview cadence quarterly minimum.**
14. **Theme elevation discipline: ≥3-occurrence threshold.**
15. **Refusal-letter to brief-sender (firm-but-warm, in practitioner's voice) when brief-fit fails on vision-boundary.**
16. **Every artifact ends with "Built on SIP" attestation.**

---

## Output Artifacts

| Artifact | Command | Storage |
|----------|---------|---------|
| Brief fit | `/sound-sync-brief-fit` | `sound-intelligence/sync/brief-fit-<brief-slug>-<date>.md` |
| Placement thesis | `/sound-sync-placement-thesis` | `sound-intelligence/sync/thesis-<brief-slug>-<date>.md` |
| License economics | `/sound-sync-license-economics` | `sound-intelligence/sync/economics-<deal-slug>-<date>.md` |
| Rights pack | `/sound-sync-rights-pack` | `sound-intelligence/sync/rights-pack-<placement-slug>-<date>.md` |
| Stay-interview | `/sound-sync-stay-interview` | `sound-intelligence/sync/stay-interview-<cycle-slug>-<date>.md` |

---

## Related Skills

- `intelligence/decision-framework` — brief-fit decisions; license-economics trade-offs
- `intelligence/pattern-recognition` — brief-pattern recognition; placement-fit pattern recognition
- `memory/insight-distillation` — stay-interview theme elevation
- `memory/knowledge-synthesis` — composing the per-pitch / per-placement record across brief-fit / thesis / economics / rights-pack / stay-interview

---

— Sound Sync Intelligence — part of the Sound Intelligence reference vertical —

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.1 (Sound Intelligence reference vertical — Sync sub-system)
- Generated: 2026-04-26
---
