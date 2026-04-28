---
name: talent-retention
description: Retention architecture for a high-performer cohort. Stay-interview script (the practitioner's voice), per-person leverage analysis (1-2 changes that would make this person 5x more likely to stay another 24 months), aggregate pattern across the cohort, system redesign recommendations. Cites stay-interview research (Beverly Kaye). Refuses exit-interview-as-strategy. Sub-system 5 of 6 in the HR Intelligence reference vertical.
allowed-tools: Read, Write, Grep, Glob
argument-hint: cohort identifier (required) + --cohort-size <N> + --org-context <consultancy|product-co|agency|other> + optional context paragraph describing recent attrition signals or what triggered the retention review
---

# /talent-retention

Load `SIP.md`, `VOICES.md`, `agents/starlight-talent.md`, `skills/people-intelligence/people-dynamics.md`, prior motivation maps and burnout detections (`hr-intelligence/talent/`), Culture artifact for system context, Performance artifacts for calibration context, Genius Profile for voice samples in the stay-interview script. Produce a **Retention Architecture** — stay-interview script + per-person leverage + aggregate pattern + system redesign request. Hand off to exactly one next move.

## Disclaimer (non-waivable)

**This is HR system architecture, not clinical advice. When stay interviews surface individual distress crossing into clinical territory, refer that individual to a qualified clinician. Not legal advice — retention conversations touching compensation, promotion, ADA accommodations, or protected-class considerations require jurisdiction-specific compliance and qualified counsel.**

## Input
$ARGUMENTS

## Flags

- `--cohort-size <N>` — number of high-performers in the cohort. Realistic upper bound for one retention review: 5-15 people. Larger cohorts run as multiple smaller reviews.
- `--org-context <consultancy|product-co|agency|other>` — shapes which retention drivers tend to dominate. Consultancies: utilization + travel + project variety. Product cos: scope + technical autonomy + growth path. Agencies: client variety + creative autonomy + craft growth.
- Optional context: recent attrition signals, recent voluntary departures, or what triggered the review.

## Process

1. **Disclaim.** Open the output with the non-waivable disclaimer. Structurally first.

2. **Cite the research foundation.** Beverly Kaye's stay-interview research ("Love 'Em or Lose 'Em") + retention-driver meta-analyses. The structural finding: engagement surveys correlate weakly with actual retention. The real predictors are manager relationship quality, growth trajectory visibility, sense-of-fairness (SCARF), commute/flexibility fit, and life-stage fit. Stay interviews predict retention; exit interviews lag the decision and the leverage is gone.

3. **Define the high-performer cohort.** Anchored to performance signals (recent calibration, sustained delivery, leadership signal), not to tenure or cost. Most retention work over-protects expensive seniors and under-protects high-leverage mid-career people.

4. **REFUSE exit-interview-as-strategy.** Exit interviews are useful for pattern triangulation across past departures, never as a primary intervention. By the time someone is exiting, the leverage is gone. The artifact may reference past exit signals as data; the strategy is stay-interview-driven.

5. **Stay-interview script (in the practitioner's voice).** Quarterly cadence. 30-45 minutes per high-performer. Manager-led, with HR design support but not HR-led. The two structural questions:

   **Question 1 — what would make you leave?**
   - "If you were going to leave in the next 18 months, what would have to happen — or stop happening — for that to feel like the right move?"
   - Follow-up: "What's the soonest version of that?"
   - Follow-up: "What would I, as your manager, see first if that started to be true?"

   **Question 2 — what keeps you?**
   - "What's keeping you here right now? Specifically — not the polite version."
   - Follow-up: "If [specific thing they named] went away, what's left?"
   - Follow-up: "What would make this the place you stay another two years even if a strong recruiter call came in?"

   **Voice rules (the synthesis edge):** direct, warm, refuses small-talk-opening, refuses "rate your engagement 1-10," refuses scripted sales pitch about company benefits. The script asks open questions, lets silence sit, and writes down specific phrases for follow-up.

   **Confidentiality protocol:** what's said in the stay interview stays with the manager + 1-up unless the person explicitly authorizes broader sharing. Aggregate patterns can be shared without attribution. Specific quotes only with consent.

6. **Per-person leverage analysis.** For each high-performer in the cohort, identify the 1-2 changes that would make this specific person 5x more likely to stay another 24 months.

   Leverage candidates (anchored to research):
   - **Manager relationship quality.** Number one retention predictor. If the relationship is weak, no amount of comp adjustment compensates.
   - **Growth trajectory visibility.** Is the next role / scope / skill-acquisition visible and credible? "I can see what year three looks like for me here" is the test.
   - **Status / Certainty / Autonomy / Relatedness / Fairness (SCARF).** Specific dimensions where the person feels under-rewarded or threatened.
   - **Commute / flexibility / life-stage fit.** Is the work-life integration sustainable for THIS person at THIS stage?
   - **Craft growth.** For senior ICs especially: am I getting better at my craft here, or am I plateauing?
   - **Mission attachment.** Does the work matter to the person, or is it a paycheck?
   - **Comp.** Last consideration, not first. Comp adjustments rarely save engaged-but-leaving; they're table stakes for fairness.

   For each person, name the 1-2 leverage points. Defend with stay-interview signals (when available) or behavioral observations (when stay interviews not yet run).

7. **Aggregate pattern.** Across the cohort, where does leverage compound? If 6 of 10 high-performers cite "manager-relationship clarity on next-role" as their top leverage, that is a system-redesign signal, not 6 individual conversations.

   Common aggregate patterns:
   - Growth-path opacity (manager doesn't have a clear story for the next role for 60%+ of cohort) → system fix is manager calibration on growth-path conversations.
   - Calibration unfairness (perceived inequity in promotion or comp) → system fix is `/perf-review-redesign`.
   - Chronic overload (high-performers carrying disproportionate load because system rewards it) → system fix to Org Architecture + Culture.
   - Commute / flexibility friction (return-to-office fights, or remote-work isolation) → system policy review.
   - Mission detachment (the work has lost narrative coherence) → system fix to Vision + Culture.

8. **Retention-system redesign recommendations.** Based on aggregate pattern. 1-3 system changes, each with named owner and timeline. Composes with sister sub-systems (Culture, Performance, Org Architecture).

9. **Quarterly stay-interview rhythm.** The retention plan is not a one-off. Initiate quarterly cadence:
   - Q1: full cohort interviewed; per-person leverage updated; aggregate pattern surfaced.
   - Q2: light-touch check-in (15 min) on the leverage interventions named in Q1.
   - Q3: full cohort interviewed; pattern shift assessed.
   - Q4: annual retention review with leadership; system-redesign decisions.

10. **Save.** Write to `hr-intelligence/talent/retention-<cohort>-<YYYY-MM-DD>.md`. Save stay-interview script as reusable artifact for managers.

11. **Hand off.** Name exactly one next move:
    - Stay interviews not yet run → schedule first-cohort stay interviews within 4 weeks; managers receive script + protocol.
    - Stay interviews run, leverage clear, aggregate pattern surfaced → system-redesign request to relevant sister sub-system; per-person leverage interventions assigned to managers.
    - Pattern is calibration unfairness → `/perf-review-redesign`.
    - Pattern is growth-path opacity → manager-coaching loop on growth-path conversations.
    - Pattern is chronic overload → `/org-role-design` + Culture review.

## Output format

```markdown
# Retention Architecture — <Cohort Name> — <YYYY-MM-DD>

> **HR system architecture, not clinical advice. Refer individuals to a qualified clinician when distress crosses into clinical territory. Not legal advice — retention conversations touching compensation, promotion, ADA accommodations, or protected-class considerations require qualified counsel.**

## Context

- **Cohort:** <name>
- **Cohort size:** <N>
- **Org context:** <consultancy | product-co | agency | other>
- **Recent attrition signals:** <past 12 months — voluntary departures, near-misses>
- **What triggered this review:** <named>

## Research foundation

This retention architecture is grounded in stay-interview research (Beverly Kaye) and retention-driver meta-analyses. Engagement surveys correlate weakly with actual retention. Real predictors: manager relationship quality, growth trajectory visibility, SCARF (status/certainty/autonomy/relatedness/fairness), commute / flexibility fit, life-stage fit. Stay interviews predict retention; exit interviews lag the decision.

**Refused approach:** exit-interview-as-strategy. Exits are useful for pattern triangulation; they are not the leverage point.

## Stay-interview script (the practitioner's voice)

**Cadence:** quarterly. **Duration:** 30-45 minutes. **Lead:** manager, with HR design support.

### Question 1 — what would make you leave?

> "If you were going to leave in the next 18 months, what would have to happen — or stop happening — for that to feel like the right move?"

Follow-ups:
- "What's the soonest version of that?"
- "What would I, as your manager, see first if that started to be true?"

### Question 2 — what keeps you?

> "What's keeping you here right now? Specifically — not the polite version."

Follow-ups:
- "If [specific thing they named] went away, what's left?"
- "What would make this the place you stay another two years even if a strong recruiter call came in?"

### Voice rules

- Direct, warm, no small-talk opening.
- Refuse "rate your engagement 1-10" framings.
- Refuse scripted sales pitch about company benefits.
- Open questions, let silence sit.
- Write down specific phrases for follow-up.

### Confidentiality protocol

- What's said stays with manager + 1-up unless the person explicitly authorizes broader sharing.
- Aggregate patterns can be shared without attribution.
- Specific quotes only with consent.

## Per-person leverage analysis

| Person | Stay drivers (top 2) | Leave triggers (top 2) | Leverage intervention (1-2) | Owner | By when |
|--------|----------------------|------------------------|------------------------------|-------|---------|
| <pseudonym> | <named, anchored to interview or observation> | <named> | <named, specific> | <manager / 1-up> | <date> |
| ... | ... | ... | ... | ... | ... |

## Aggregate pattern

Across <N> high-performers, leverage compounds at:

1. **<dominant pattern — e.g., growth-path opacity>** — <count of cohort citing it; specific signal>.
2. **<second pattern>** — <count; signal>.
3. **<third pattern>** — <count; signal>.

This pattern is a **system-redesign signal**, not <N> individual conversations.

## Retention-system redesign recommendations (1-3 system changes)

### Change 1: <named>

- **Owner:** <name / role>
- **Composes with:** <sister sub-system + command — e.g., /perf-review-redesign, /culture-design, /org-role-design>
- **Timeline:** <weeks>
- **Success signal:** <observable, in 6-12 months>

### Change 2 (if warranted): <named>

- **Owner:** <name / role>
- **Composes with:** <sister sub-system>
- **Timeline:** <weeks>
- **Success signal:** <observable>

## Quarterly stay-interview rhythm

- **Q1:** full cohort interviewed; per-person leverage updated; aggregate pattern surfaced.
- **Q2:** light-touch check-in (15 min) on the leverage interventions named in Q1.
- **Q3:** full cohort interviewed; pattern shift assessed.
- **Q4:** annual retention review with leadership; system-redesign decisions.

## Clinical / legal escalation flags

- Individual distress signals in stay interviews: <yes/no — if yes, route to clinician with consent>
- Patterns suggesting compensation inequity along protected-class lines: <yes/no — if yes, route to qualified counsel>
- Patterns suggesting harassment / retaliation driving departures: <yes/no — if yes, route to qualified counsel>

## Load-bearing next move

**`<one command or specific action>`** — `<one-line rationale>`.

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
- **REFUSE exit-interview-as-strategy.** Exits triangulate past departures; stay interviews drive future retention.
- **Stay interviews are the load-bearing data.** Quarterly cadence. Two structural questions. Manager-led.
- **Cite Beverly Kaye stay-interview research.**
- **Per-person leverage required for every cohort member.** Generic "the team is happy" is not retention work.
- **Aggregate pattern + system redesign required.** Individual interventions without system redesign are theatre — the system that produced the leak will produce more leaks.
- **Manager relationship quality is the #1 retention predictor.** Anchor leverage interventions accordingly.
- **Comp is last consideration, not first.** Comp adjustments rarely save engaged-but-leaving; they're table stakes for fairness.
- **Confidentiality protocol explicit.** Stay interviews are confidential; aggregate patterns are shareable without attribution.
- **Voice composes with the practitioner's Genius Profile** for the stay-interview script.
- **Quarterly rhythm initiated, not one-off.**
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: 2026-04-24
---
