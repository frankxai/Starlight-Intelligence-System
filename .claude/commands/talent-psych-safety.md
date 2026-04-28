---
name: talent-psych-safety
description: Measure psychological safety on a team using Edmondson's 7-question scale (anonymous, longitudinal, team-by-team) plus interpretation rubric and intervention design. Cites Project Aristotle. Refuses "psychological safety training" as primary intervention without leader behavior change. Refuses single-snapshot scoring. Sub-system 5 of 6 in the HR Intelligence reference vertical.
allowed-tools: Read, Write, Grep, Glob
argument-hint: team identifier (required) + --baseline-or-followup <baseline|followup> + --prior-survey-date <YYYY-MM-DD or none> + optional context paragraph describing observed signals or what triggered the measurement
---

# /talent-psych-safety

Load `SIP.md`, `VOICES.md`, `agents/starlight-talent.md`, `skills/people-intelligence/people-dynamics.md`, prior team-dynamics audits if any (`hr-intelligence/talent/team-dynamics-*`), and Culture artifact for system-context (`hr-intelligence/culture/`). Produce a **Psychological Safety Measurement Plan** plus interpretation rubric plus intervention design (if measuring follow-up). Hand off to exactly one next move.

## Disclaimer (non-waivable)

**This is HR system architecture, not clinical advice. When safety signals reveal individual distress crossing into clinical territory, refer that individual to a qualified mental health clinician. Not legal advice — patterns of fear-based silence around harassment, discrimination, or retaliation require jurisdiction-specific compliance and qualified counsel; this command does not resolve such legal matters.**

## Input
$ARGUMENTS

## Flags

- `--baseline-or-followup <baseline|followup>` — first measurement establishes baseline; subsequent measurements track shift. Single-snapshot psych-safety scoring is refused — the construct is longitudinal.
- `--prior-survey-date <YYYY-MM-DD or none>` — when was the last measurement, if any. Use to assess shift if followup.
- Optional context: what triggered the measurement (manager observation, recent silence pattern, post-reorg check, quarterly cadence).

## Process

1. **Disclaim.** Open the output with the non-waivable disclaimer. Structurally first.

2. **Cite the research foundation.** Edmondson 1999 onward: psychological safety as the shared belief that the team is safe for interpersonal risk-taking. Project Aristotle (Google, 2012-2015): psychological safety the #1 predictor of team performance, above tenure, talent density, and tooling. Team-by-team variance is enormous within a single company; aggregate is misleading.

3. **Edmondson 7-question scale** — administered anonymously, individually, with no individual identifiers traceable. Items (worded as common in published research; phrasing may be light-adapted to context but construct must be preserved):

   1. If you make a mistake on this team, it is often held against you. *(reverse-scored)*
   2. Members of this team are able to bring up problems and tough issues.
   3. People on this team sometimes reject others for being different. *(reverse-scored)*
   4. It is safe to take a risk on this team.
   5. It is difficult to ask other members of this team for help. *(reverse-scored)*
   6. No one on this team would deliberately act in a way that undermines my efforts. *(positive)*
   7. Working with members of this team, my unique skills and talents are valued and utilized.

   Each item scored 1-7 (or 1-5; either is defensible — pick one and stick with it across longitudinal). Reverse-scored items are reverse-coded before aggregation.

4. **Administration protocol.**
   - **Anonymous.** No individual identifiers. Free-text comments encouraged but explicitly noted as anonymous.
   - **Team-by-team.** Aggregate to team level only; team-of-N where N <5 has anonymity risk — flag and consider not surveying alone, or pair with peer team.
   - **Manager not in the team being surveyed sees results, not before discussion.** Results land with the manager 24-48 hours before the team conversation, never months later.
   - **Frequency:** quarterly minimum; semi-annual if team is stable and high-trust. Single-snapshot measurements are refused for primary use.
   - **Time cost:** ≤7 minutes per respondent. Longer surveys collapse response rate.

5. **Interpretation rubric — anchored to behavior, not to vibes.**

   | Score band | Interpretation | Behavioral signature |
   |------------|----------------|----------------------|
   | High (5.5-7 or 4-5 on 1-5 scale) | Healthy psychological safety | Members challenge each other; mistakes surface in retros; novel ideas voiced; help-asking is routine; conflict surfaces and resolves |
   | Moderate (4-5.5 or 3-4 on 1-5 scale) | Mixed; pockets of safety | Some members open, others reserved; certain topics discussable, others avoided; manager-dependent (safe with current manager but precarious) |
   | Low (<4 or <3 on 1-5 scale) | Fear-based silence | Mistakes hidden; novel ideas suppressed; meetings are performative; help-asking penalized; "everything is fine" pattern |

   **Item-level patterns matter as much as aggregate.** Item 4 ("safe to take a risk") low + item 1 ("mistakes held against you") high is a particular pattern (punishment culture). Item 3 ("rejection for being different") low is a different pattern (homogeneity pressure). Item 7 ("skills valued") low is yet another (feeling unseen).

6. **Triangulation with observed behavior.** Survey scores are noisy without behavioral triangulation. Cross-reference:
   - Are mistakes surfaced in retros, or do retros stay surface-level?
   - Does anyone challenge the manager publicly?
   - Is silence in meetings concentrated in certain people?
   - Are help-requests visible, or routed only to 1:1s and DMs?
   - Are minority-opinion voices in the team heard, or steamrolled?

7. **Intervention design (for low or moderate teams).**

   **Primary intervention: leader behavior change.** Sustained over 6+ months.
   - **Manager-as-vulnerability-modeler:** the manager publicly admits mistakes, names what they don't know, asks for help in front of the team. This is the single highest-leverage intervention; most other interventions fail without it.
   - **Structured listening rituals:** structured "round-robin" inputs (each member speaks 60-90 seconds before discussion); written-first then verbal; "what concerns do you have about this plan that we haven't heard yet?" as standard close.
   - **Error-as-learning ritual:** monthly "what did we learn from a mistake or near-miss this month?" — modeled by manager going first, sharing their own mistake.
   - **Pre-mortem rituals on important decisions:** "imagine this fails — why did it fail?" surfaces concerns that "do you have concerns?" never elicits.

   **Refused interventions:**
   - Psychological safety training as primary intervention. Training without sustained leader behavior change has zero effect. *Training is at best a complement to behavior change, never a substitute.*
   - "Trust falls" / off-site team-building exercises. They produce no durable shift in psych safety.
   - Anonymous suggestion boxes. They fail to address the underlying fear of speaking; people who don't feel safe in meetings won't write to the box either.
   - One-off culture statements ("we value psychological safety"). Statements without structural change produce cynicism.

8. **Reassessment cadence.**
   - Quarterly survey at minimum.
   - 12 weeks for early-signal shift.
   - 6 months for cultural shift to be measurable.
   - Annual review of intervention effectiveness with leadership.

9. **Save.** Write to `hr-intelligence/talent/psych-safety-<team>-<YYYY-MM-DD>.md`. If baseline, save the survey instrument as a reusable artifact for follow-ups.

10. **Hand off.** Name exactly one next move:
    - Baseline measurement designed → administer survey within 2 weeks; results land with manager.
    - Followup measurement showing low scores → primary intervention is manager-coaching loop on vulnerability-modeling + structured listening rituals; reassess in 12 weeks.
    - Followup showing moderate scores with item-level pattern → targeted intervention to that pattern.
    - High scores sustained → light-touch protection; do not over-intervene.
    - Fear-based silence touching harassment / discrimination / retaliation territory → route to qualified counsel; this command does not resolve legal matters.

## Output format

```markdown
# Psychological Safety Measurement — <Team Name> — <YYYY-MM-DD>

> **HR system architecture, not clinical advice. Refer individuals to qualified clinician when distress crosses into clinical territory. Not legal advice — fear-based silence touching harassment / discrimination / retaliation requires qualified counsel.**

## Context

- **Team:** <name>
- **Team size:** <N> (flag anonymity risk if <5)
- **Phase:** <baseline | followup>
- **Prior survey date:** <YYYY-MM-DD or none>
- **What triggered this measurement:** <manager observation / recent silence pattern / post-reorg / quarterly cadence>

## Research foundation

This measurement uses Edmondson's 7-question psychological safety scale, validated across 25+ years of research. Project Aristotle (Google, 2012-2015) found psychological safety to be the #1 predictor of team performance, above tenure, talent density, and tooling. Team-by-team variance dwarfs company-aggregate; aggregate is misleading.

## Survey instrument (Edmondson 7-question scale)

Score each item 1-7 (or 1-5 — pick one and hold it across longitudinal measurements). Reverse-scored items marked.

1. If you make a mistake on this team, it is often held against you. *(reverse-scored)*
2. Members of this team are able to bring up problems and tough issues.
3. People on this team sometimes reject others for being different. *(reverse-scored)*
4. It is safe to take a risk on this team.
5. It is difficult to ask other members of this team for help. *(reverse-scored)*
6. No one on this team would deliberately act in a way that undermines my efforts.
7. Working with members of this team, my unique skills and talents are valued and utilized.

**Optional free-text:** "Anything you'd want this team to be safer about that the questions above didn't capture?" — explicitly anonymous.

## Administration protocol

- **Anonymity:** no individual identifiers. <If team <5 — flag risk and consider waiting, pairing, or skipping.>
- **Distribution:** <when, by whom, how>
- **Response window:** 5-7 days.
- **Aggregation:** team-level only.
- **Result delivery:** <manager-of-the-team> receives results 24-48 hours before team conversation.
- **Time cost per respondent:** ≤7 minutes.

## Results (FOR FOLLOWUP MEASUREMENTS — leave blank for baseline design phase)

| Item | Mean (current) | Mean (prior) | Shift |
|------|----------------|--------------|-------|
| 1. Mistakes held against you (reverse) | <N> | <N> | <Δ> |
| 2. Bring up problems and tough issues | <N> | <N> | <Δ> |
| 3. Reject for being different (reverse) | <N> | <N> | <Δ> |
| 4. Safe to take a risk | <N> | <N> | <Δ> |
| 5. Difficult to ask for help (reverse) | <N> | <N> | <Δ> |
| 6. No one undermines | <N> | <N> | <Δ> |
| 7. Skills valued and utilized | <N> | <N> | <Δ> |

**Aggregate score:** <N> (current) vs <N> (prior). **Band:** <high / moderate / low>.

**Item-level pattern:** <named — punishment culture / homogeneity pressure / unseen / etc.>

## Behavioral triangulation

- Are mistakes surfaced in retros, or stay surface-level? <observed>
- Does anyone challenge the manager publicly? <observed>
- Is silence concentrated in certain people? <observed — name carefully>
- Are help-requests visible, or routed to 1:1s only? <observed>
- Are minority-opinion voices heard or steamrolled? <observed>

## Intervention design (if low or moderate)

### Primary: leader behavior change (sustained 6+ months)

1. **Manager-as-vulnerability-modeler.** <named specific behavior — when, where, what>
2. **Structured listening ritual.** <named — round-robin, written-first, pre-mortem>
3. **Error-as-learning ritual.** <named — monthly "what did we learn from a mistake/near-miss" session, manager goes first>

### Refused interventions (named explicitly)

- Psych safety training as primary — training without sustained leader behavior change has zero effect.
- Off-site team-building exercises — no durable shift.
- Anonymous suggestion boxes — fails to address underlying fear of speaking.
- One-off culture statements — produces cynicism without structural change.

## Reassessment cadence

- **Quarterly survey** minimum.
- **12 weeks** for early-signal shift.
- **6 months** for cultural shift to be measurable.
- **Annual** intervention-effectiveness review with leadership.

## Clinical / legal escalation flags

- Individual distress signals in free-text or follow-up: <yes/no — if yes, route to clinician>
- Patterns suggesting harassment / discrimination / retaliation: <yes/no — if yes, route to qualified counsel>

## Load-bearing next move

**`<one command or specific intervention>`** — `<one-line rationale>`.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always — clinical and legal both, non-waivable.**
- **Cite Edmondson + Project Aristotle.** Research foundation is named.
- **Anonymous, longitudinal, team-by-team.** Three non-negotiable conditions for valid measurement.
- **REFUSE single-snapshot psych-safety scoring as primary diagnostic.** Construct is longitudinal.
- **REFUSE psych-safety training as primary intervention.** Training without sustained leader behavior change is theatre.
- **REFUSE generic team-building / trust-falls / off-sites as psych-safety interventions.** No durable shift.
- **REFUSE anonymous suggestion boxes as psych-safety solution.** Doesn't address underlying fear.
- **Manager-as-vulnerability-modeler is the load-bearing intervention.** Most other interventions fail without it.
- **Item-level patterns interpreted, not just aggregate.** Different patterns require different interventions.
- **Behavioral triangulation required.** Survey scores without behavioral cross-reference are noise.
- **Anonymity risk flagged when team <5.**
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: 2026-04-24
---
