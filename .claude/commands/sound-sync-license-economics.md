---
name: sound-sync-license-economics
description: Surface the trade between sync fee + master-use fee + publishing share + term + territory + exclusivity + MFN + re-use options. Comparison to comparable placements where data is available. Refuses casual rights language and refuses term-perpetuity-without-exclusivity-pricing.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <brief-slug> + --proposed-fee <amount> + --proposed-term <perpetuity|N-year|life-of-project> + --proposed-territory <worldwide|named-region> + --proposed-exclusivity <none|category|period|full>
---

# /sound-sync-license-economics

Load `verticals/sound-intelligence/SKILL.md`, `verticals/sound-intelligence/SOUL.md`, `verticals/sound-intelligence/MEMORY.md`, `agents/starlight-sound-sync.md`, `skills/sound-intelligence/sync-licensing.md`, brief-fit verdict, placement thesis, and prior license-economics records for comparable placements if present. Produce a **License Economics Audit** — trade analysis + comparable-placement reference + counter-proposal recommendation. Hand off to rights-pack on agreement.

## Disclaimer (non-waivable)

**License economics is system-architecture analysis, NOT legal counsel and NOT financial advice. Every specific term requires sign-off from the practitioner's qualified music attorney before signature. Specific dollar amounts in comparable placements vary widely by year, market, and undisclosed factors — directional only.**

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Non-waivable opener.
2. **Read upstream.** Brief-fit verdict (PROCEED) and placement thesis (track list) required.
3. **Map proposed deal terms.** Sync fee, master-use fee (sometimes folded), publishing share, term, territory, exclusivity, MFN clauses, re-use options.
4. **Sync fee analysis.** What does the proposed fee compare to for placement type? Direction-cited public data: TV indie cable placement (low four figures); major-network primetime (mid-five figures); major film (variable per scene); commercial campaign (variable per usage). Flag if proposed fee is below directional range; flag rationale (lower fee may be acceptable when exclusivity is none + term is short + practitioner gains supervisor relationship).
5. **Term analysis.** Perpetuity costs more per dollar of placement fee but compounds badly if placement underperforms. Limited terms (1-7 years) preserve future flexibility. If perpetuity proposed without exclusivity-pricing reflecting it, flag.
6. **Territory analysis.** Worldwide costs more than named-region. If territory worldwide proposed at named-region pricing, flag.
7. **Exclusivity analysis.** None (any-other-placement allowed) / category-exclusive (no other automotive sync, etc.) / period-exclusive (no other syncs for N months) / fully-exclusive (no other placements). Each reduces practitioner's other-placement opportunities; pricing must reflect.
8. **MFN clause check.** If multiple parties licensed in package deal, MFN ensures practitioner gets at least same rate as any other party. Recommend MFN inclusion when package deal.
9. **Re-use options.** Does placement permit re-use in DVD / streaming / sequel / ad-extension without further license? At what additional fee? Document.
10. **Comparable-placement reference.** Pull from prior license-economics records (if any) where comparable placements exist. Cite directionally; never quote specific deal numbers without explicit consent from prior practitioners.
11. **Counter-proposal recommendation.** Per axis where proposed terms are below market: named counter (specific fee adjustment, term adjustment, territory adjustment, exclusivity-vs-fee trade). Counter-proposals respect vision-boundary; never recommend trading vision for fee.
12. **Save.** Write to `sound-intelligence/sync/license-economics-<brief-slug>-<YYYY-MM-DD>.md`.
13. **Hand off.** Name exactly one next move:
    - Counsel review needed → route to practitioner's music attorney with this audit.
    - Counter-proposal accepted → `/sound-sync-rights-pack` (delivery package).
    - Negotiation deadlocked → walk-away analysis (compare expected revenue vs. opportunity cost).

## Output format

```markdown
# License Economics Audit — <Brief Slug> — <YYYY-MM-DD>

## Disclaimer
**System-architecture analysis, not legal counsel. Counsel sign-off required before signature.**

## Proposed deal summary
- **Sync fee:** $<amount>
- **Master-use fee:** <separate or folded>
- **Publishing share:** <%>
- **Term:** <perpetuity | N-year | life-of-project>
- **Territory:** <worldwide | named-region>
- **Exclusivity:** <none | category | period | full>
- **MFN clauses:** <yes / no>
- **Re-use options:** <list>

## Per-axis analysis

### Sync fee
- **Directional comparable:** <named placement type, fee range>
- **Verdict:** <below | in-range | above market for placement type>
- **Rationale:** <2-3 sentences>

### Term
- **Perpetuity-vs-limited tradeoff:** <named>
- **Verdict:** <pass | flag>

### Territory
- **Verdict:** <pass | flag — worldwide-at-region-pricing>

### Exclusivity
- **Other-placement opportunity cost:** <named>
- **Pricing reflects exclusivity:** <yes / no>
- **Verdict:** <pass | flag>

### MFN
- **Recommended:** <yes / no — if package deal>

### Re-use options
- **Documented:** <yes / no>
- **Re-use fees:** <named or "not addressed">

## Comparable-placement reference (directional)
- <named comparable, with directional-fee-range>

## Counter-proposal recommendation
| Axis | Proposed | Counter | Rationale |
|---|---|---|---|
| Sync fee | $<X> | $<Y> | <one line> |
| Term | <X> | <Y> | <one line> |
| Territory | <X> | <Y> | <one line> |
| Exclusivity | <X> | <Y at adjusted fee> | <one line> |

## Walk-away analysis (if negotiation deadlocks)
- **Expected revenue if accepted:** <amount>
- **Opportunity cost (other-placement, brand-association, vision-fit):** <named>
- **Walk-away verdict:** <accept | counter | walk>

## Recommended next move
**`/<command or specific action>`** — <one-line rationale>.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.5.3 (Sound Intelligence — Sync sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Counsel sign-off non-waivable.** This audit is architecture; signature is counsel.
- **Refuse trade-vision-for-fee.** Counter-proposals respect MEMORY.md vision boundaries.
- **Refuse perpetuity-without-exclusivity-pricing.** If perpetuity proposed without fee reflecting it, flag.
- **Refuse worldwide-at-region-pricing.** Territory matters.
- **Comparable-placement directional only.** Specific deal numbers from prior practitioners require explicit consent before citing.
- **Walk-away analysis on deadlock.** Expected revenue vs. opportunity cost named explicitly.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
