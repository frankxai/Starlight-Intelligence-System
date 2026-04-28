---
name: org-reorg-trauma-audit
description: Pre-reorg trauma audit and sequencing plan. Opens with the 70%+ reorg-failure honesty, runs trauma history + threat-activation forecast (SCARF), produces a wave-based sequencing plan, communication architecture grounded in Kotter + Bridges, per-team mitigation, and post-reorg Talent IS monitoring cadence. Refuses cosmetic, surprise, and flat-as-default reorgs. Will route upstream to vision work if vision-fit is the real issue.
allowed-tools: Read, Write, Grep, Glob
argument-hint: org name (required) + --reorg-scope <team|department|division|company-wide> + --proposed-timeline <weeks|months> + optional context paragraph describing the proposed reorg
---

# /org-reorg-trauma-audit

Load `SIP.md`, `agents/starlight-org.md`, `skills/people-intelligence/org-architecture.md`. Read any prior `hr-intelligence/org/` outputs and any Talent IS signals available. Produce a **Reorg Trauma Audit + Sequencing Plan**. May refuse the reorg outright. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Reorgs implicate severance, role classification, protected-class concentration in cuts (age, gender, race, disability, parental status, tenure), and jurisdictional employment-law variation. This document is structural thinking architecture, not legal advice. Real reorg decisions require qualified employment counsel before any communication or action.**

## The number you must hear first (non-negotiable)

**McKinsey-class research consistently finds 70%+ of organizational reorganizations fail to deliver their promised outcomes. Roughly half create more dysfunction than they solve. This is not a hedge or a footnote. It is the design constraint this audit operates under.**

The implication: if your reorg's case is shaky on its merits, the base rate says it will fail. The audit's job is to honestly tell you which side of that 70/30 your specific reorg sits on, and what would have to be true for it to land in the 30%.

## Input
$ARGUMENTS

## Flags

- `--reorg-scope <team|department|division|company-wide>` — how much of the org the change touches. Larger scope = exponentially higher trauma cost.
- `--proposed-timeline <weeks|months>` — proposed announce-to-live window. Weeks = high-threat (closer to surprise). Months = sequencing room.

## Process

1. **Lead with the 70%+ failure rate.** First thing the user reads. Not buried.

2. **Vision-fit pre-check.** Before any audit work, ask: is the underlying issue actually a vision problem? Symptoms suggesting yes: "we're not aligned," "teams are working at cross purposes," "we don't know what we are anymore," "the strategy keeps shifting." If yes, **refuse to proceed with reorg sequencing** and route to `/define-vision` or substrate-level vision work. Reorg cannot fix vision drift; it amplifies it. Name this honestly even if the user pushes back.

3. **Trauma history audit.**
   - List structural changes in the last 3 years (reorgs, layoffs, leadership changes, M&A, RTO mandates)
   - For each: scope, timeline, perceived success/failure, residual trust impact
   - **Cumulative trauma score:** 0 changes = baseline; 1 change in 3 years = low; 2 changes = moderate; 3+ = high (next reorg has 2-3x baseline cost)

4. **Current state read.**
   - Trust level (Talent IS engagement / safety signals if available)
   - Burnout signals (Talent IS)
   - Recent attrition pattern (voluntary / involuntary; concentration in any team or demographic)
   - Open performance issues that might get bundled into reorg decisions (red flag for protected-class concentration)

5. **Threat-activation forecast (SCARF).** For the proposed reorg, score 1-5 on each dimension:
   - **Status** — does this change perceived rank, title, scope of authority? Higher score = higher threat.
   - **Certainty** — how clear is the future state, the timeline, individual outcomes? Less clarity = higher threat.
   - **Autonomy** — does this reduce decision-making latitude or freedom? Reduction = higher threat.
   - **Relatedness** — does this disrupt team relationships, trusted colleagues, identity-belonging? Disruption = higher threat.
   - **Fairness** — is the process perceived as fair? Are decisions transparent? Lack = highest-cost dimension.
   - **Aggregate threat score** = sum (5-25). Interpretive bands: 5-10 low / 11-15 moderate / 16-20 high / 21-25 critical.

6. **Conway's Law check.** This reorg will reshape the systems / products the org produces. What is likely to change in product or system architecture as a downstream consequence? Flag.

7. **Refuse if any of these are true:**
   - **Cosmetic** — renaming boxes / redrawing lines without redesigning decision rights or accountabilities → refuse and explain trust-erosion cost
   - **Surprise** — announce-to-live <2 weeks, no prior signaling → refuse and explain SCARF cost
   - **Flat-as-default** — eliminating management layers because "we're a modern company," not because of specific design constraints → refuse and require structural argument
   - **Vision drift dressed as structure** — already caught in step 2; reaffirm refusal here if user pushed past

8. **Sequencing plan in waves.**
   - **Wave 0 (pre-announce, weeks 1-4):** finalize role designs (run `/org-role-design` per affected role); finalize legal review; finalize coalition (Kotter step 2 — guiding coalition must be visible and unanimous before announce); finalize comms architecture
   - **Wave 1 (announce + role clarity, weeks 4-8):** all-hands announce with full context (Kotter steps 1, 3, 4 — urgency, vision, communicate); per-team follow-up sessions within 48 hours; written role designs distributed; one-on-one conversations for highest-impact individuals
   - **Wave 2 (span / reporting-line changes, weeks 8-14):** structural moves go live; new manager-report 1:1s within 48 hours of go-live; weekly cadence check-ins
   - **Wave 3 (role transitions, weeks 14-20, if applicable):** any promotions, lateral moves, or exits handled with separate communication and full employment-law review per individual
   - **Wave 4 (aftercare, months 5-12):** Talent IS monitoring at week 4 / 8 / 12 / 24 / 36 post-live; Performance system criteria updated; Culture rituals/recognition updated to match

9. **Communication architecture (Kotter + Bridges).**
   - **Kotter scaffolding:** urgency (why now, honestly — including the 70% failure rate and what makes this specific case different) → coalition (named, visible, unanimous) → vision (concrete future state, not abstract) → communicate (over-communicate by 10x; the message that lands is the one repeated) → empower (remove blockers; name them) → wins (visible, named, celebrated) → consolidate (no early victory declarations) → institutionalize (rituals/recognition/criteria updated)
   - **Bridges transitions overlay:** Ending phase — explicitly acknowledge what is being lost (roles, identities, relationships, certainty); make space for grief; do not skip this. Neutral zone — normalize the in-between (productivity drops, anxiety peaks, ambiguity is the work right now); do not try to skip it; communicate weekly. New beginning — only after the neutral zone; do not declare prematurely.
   - **Per-team customization:** baseline + per-team additions matched to that team's threat profile

10. **Per-team mitigation plans.** For each affected team, name:
    - Specific threats this team faces (which SCARF dimensions concentrate here)
    - Who delivers the message (the team's own leader, not a remote exec)
    - What support is provided (career coaching, severance counsel, role-finding support if applicable)
    - First-30-day structural support (1:1 cadence, ambiguity-resolution channels)

11. **Aftercare monitoring cadence.**
    - Talent IS pulse at week 4 / 8 / 12 / 24 post-live (mandatory)
    - Pause-and-diagnose trigger: if any unit's engagement drops >15% or burnout signals concentrate, halt next wave and diagnose before continuing
    - 12-month review: did the reorg deliver the promised outcomes? Honest answer, not slide-deck answer. Cited against the original case.

12. **Save.** Write to `hr-intelligence/org/reorg-audit-<YYYY-MM-DD>.md`.

13. **Hand off.** Exactly one next move:
    - `/luminor-board` — pressure-test the audit before commit (default for high-threat reorgs)
    - `/define-vision` — if vision-fit is the real issue (refusal route)
    - `/org-role-design` for each affected role (Wave 0 prerequisite)
    - Qualified employment counsel — if protected-class concentration or jurisdictional questions surfaced

## Output format

```markdown
# Reorg Trauma Audit + Sequencing Plan — <Org Name> — <YYYY-MM-DD>

## The number you are operating against

**70%+ of reorgs fail to deliver their promised outcomes. Roughly half create more dysfunction than they solve.** Your reorg's job is to land in the 30%. The rest of this audit tells you what would have to be true for that to happen.

## Disclaimer

Reorgs implicate severance, classification, protected-class concentration, and jurisdictional employment-law variation. This document is structural thinking architecture, not legal advice. Engage qualified employment counsel before any communication or action.

## Vision-fit pre-check

<Honest assessment: is this actually a structure problem, or is the underlying issue vision drift dressed as structure? If vision drift, REFUSE the reorg and route upstream. State this explicitly.>

## Trauma history (last 3 years)

| Date | Change | Scope | Outcome | Residual trust impact |
|------|--------|-------|---------|----------------------|
| <date> | <change> | <scope> | <succeeded / failed / mixed> | <high / moderate / low / none> |
| ... | ... | ... | ... | ... |

**Cumulative trauma score:** <baseline | low | moderate | high>
**Implication:** <multiplier on next-reorg cost — if high, the case for proceeding now is much weaker>

## Current state read

- **Trust level (Talent IS):** <green / yellow / red — describe>
- **Burnout signals:** <where concentrated, how severe>
- **Recent attrition:** <voluntary/involuntary, demographic concentration if any>
- **Open performance issues at risk of being bundled:** <list — protected-class red flag>

## SCARF threat-activation forecast

| Dimension | Score (1-5) | Why this score |
|-----------|-------------|----------------|
| Status | <N> | <reasoning> |
| Certainty | <N> | <reasoning> |
| Autonomy | <N> | <reasoning> |
| Relatedness | <N> | <reasoning> |
| Fairness | <N> | <reasoning> |

**Aggregate threat score:** <N> / 25 — <low | moderate | high | critical>

## Conway's Law forecast

<2-4 sentences: how this reorg will likely reshape the systems / products the org produces. Flag any unintended consequences.>

## Refusal check

- [ ] **Cosmetic?** <PASS — substantive redesign / FAIL — refused>
- [ ] **Surprise?** <PASS — multi-week sequencing / FAIL — refused>
- [ ] **Flat-as-default?** <PASS — structural argument given / FAIL — refused>
- [ ] **Vision drift dressed as structure?** <PASS — structural problem / FAIL — refused, route to /define-vision>

If any FAIL, the reorg is refused as designed. Restructure the proposal before resuming.

## Sequencing plan — waves

### Wave 0 — Pre-announce (weeks 1-4)
- Finalize role designs: `/org-role-design` per affected role
- Legal review: <named counsel, scope>
- Coalition: <named members, unanimous>
- Communications architecture: drafted and reviewed

### Wave 1 — Announce + role clarity (weeks 4-8)
- All-hands announce: <date>
- Per-team follow-up: within 48 hours
- Written role designs: distributed at announce
- 1:1 conversations: <list of highest-impact individuals>

### Wave 2 — Span / reporting-line changes (weeks 8-14)
- Effective date: <date>
- New manager-report 1:1s: within 48 hours of effective date
- Weekly cadence check-ins: through week 14

### Wave 3 — Role transitions (weeks 14-20, if applicable)
- Promotions / lateral moves / exits: separate communication, full counsel review per individual

### Wave 4 — Aftercare (months 5-12)
- Talent IS pulse: week 4, 8, 12, 24, 36 post-live
- Performance criteria updated by month 4
- Culture rituals/recognition updated by month 6
- 12-month honest review against original case

## Communication architecture

### Kotter scaffolding
- **Urgency:** <why now, including the 70% honesty>
- **Coalition:** <named, visible, unanimous>
- **Vision:** <concrete future state>
- **Communicate:** <cadence, channels, repeat-rate>
- **Empower:** <blockers named, removed>
- **Wins:** <criteria for visible early wins>
- **Consolidate:** <no early-victory declaration before week N>
- **Institutionalize:** <rituals, recognition, performance criteria updated>

### Bridges transitions overlay
- **Ending phase (weeks 4-8):** what is being lost — <list>; how grief is held; ritual closures.
- **Neutral zone (weeks 8-14):** the productive-but-uncomfortable middle; weekly comms; ambiguity-resolution channels.
- **New beginning (week 14+):** declared only after neutral zone; what marks the actual transition.

## Per-team mitigation

| Team | Concentrated SCARF threats | Message delivered by | Support provided | First-30-day structural support |
|------|---------------------------|---------------------|------------------|------------------------------|
| <team> | <e.g., Status + Certainty> | <name — should be team's own leader> | <career coaching / severance counsel / role-finding> | <1:1 cadence, ambiguity-resolution channel> |
| ... | ... | ... | ... | ... |

## Aftercare monitoring

- **Talent IS pulse cadence:** week 4 / 8 / 12 / 24 / 36 post-live
- **Pause-and-diagnose trigger:** any unit engagement drops >15% OR burnout signals concentrate → halt next wave, diagnose before continuing
- **12-month honest review:** outcomes vs original case, cited; this is a Luminor Board agenda item, not a slide-deck closeout

## Composes with

- **Talent IS:** primary monitoring partner during waves 1-4; pause-trigger authority
- **Performance:** criteria updated to match new accountabilities by month 4
- **Culture:** rituals / recognition / decision-norms updated to reinforce new structure by month 6
- **Hiring:** any new roles need ICP via `/org-role-design` → Hiring
- **Vision:** if pre-check failed, this is the upstream route

## Load-bearing next move

**`<one command or one action>`** — `<one-line rationale>`.

Default: **`/luminor-board`** — pressure-test the audit before commit. High-threat reorgs always pass through Luminor Board.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 6 of 6)
- Generated: <ISO date>
---
```

## Rules

- **70%+ failure rate disclosed up front.** Non-negotiable. First thing.
- **Vision-fit pre-check before any sequencing.** If vision drift, refuse and route upstream.
- **Refuse cosmetic / surprise / flat-default reorgs.** Name the refusal explicitly.
- **Trauma history is cumulative.** Read it honestly.
- **SCARF scoring grounded in research, not invented.** Five dimensions, 1-5 each, aggregate band interpretation.
- **Sequencing in waves over months, not weeks.** Surprise is the highest-cost design.
- **Kotter + Bridges, not invented frameworks.** Cite the source.
- **Aftercare monitoring + Performance + Culture parallel updates.** Without these, structure reverts.
- **Employment counsel review for severance / protected-class / jurisdictional questions.** Architect the structural decision; counsel resolves the legal one.
- **Per-instance only.** Write to `hr-intelligence/org/`.
- **Default hand-off is `/luminor-board`** for high-threat reorgs. Pressure-test before commit.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 6 of 6)
- Generated: 2026-04-24
---
