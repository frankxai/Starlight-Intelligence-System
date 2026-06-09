---
name: hire-icp
description: Define an Ideal Candidate Profile (ICP) for a role — cognitive requirements, behavioral signals, work-history patterns, culture-add hypothesis, and a DOES-NOT-MATTER list (the anti-criteria). Replaces vibe-based "we'll know it when we see it" with a calibrated profile the interview loop can actually score against. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: role title (required) + --jurisdiction <US-state|EU-country|UK|other> + --team-size <n> + --stage <pre-seed|seed|series-a|series-b+|established> + optional context paragraph on the gap this role unlocks
---

# /hire-icp

This is part of the People Intelligence reference vertical. Composes with Genius Profile + Vision/Brand for company-as-candidate framing.

Load `SIP.md`, `VOICES.md`, `agents/starlight-hiring.md`, `skills/people-intelligence/structured-hiring.md`, and if present the company's Genius Profile (`genius/profile-<company-slug>.md`) and Vision Architecture (`vision/vision-<company-slug>.md`). Produce an **Ideal Candidate Profile** for the named role. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Hiring decisions touch employment law and protected-class considerations. This is system architecture, not legal advice. Validate jurisdiction-specific compliance with qualified counsel before publishing the role description or running interviews.**

This command organizes thinking before you write the JD or run the loop. It does not replace legal review. It does not replace your recruiter. It produces a calibrated profile so the loop is precise and the debrief is rubric-anchored.

## Input
$ARGUMENTS

## Flags

- `--jurisdiction <US-state|EU-country|UK|other>` — primary jurisdiction the role operates in. Affects compliance flag (e.g., NYC pay-transparency, CA salary-history bans, EU GDPR for candidate data, UK right-to-work). If multi-jurisdictional, pass primary and flag in context paragraph.
- `--team-size <n>` — current team size. Drives culture-add gap analysis (a 5-person team vs. 50-person team has very different gap profiles).
- `--stage <pre-seed|seed|series-a|series-b+|established>` — company stage. Drives ramp-time tolerance, ambiguity tolerance, and breadth-vs-depth weighting in the ICP.

## Process

1. **Disclaim.** Open the output with the non-waivable disclaimer. Structurally first.

2. **Locate.** Confirm role title, jurisdiction, team size, stage. Confirm whether Genius Profile and Vision Architecture exist for the company. If not, flag — but do not block.

3. **Read.** If Genius Profile exists, note the company's voice signature (will inform candidate-facing materials downstream). If Vision Architecture exists, note 3-year and 10-year horizons (will inform "what is this team building?" framing in outreach).

4. **Outcome the role unlocks.** Single sentence. What does this role do that the team currently cannot? If the answer is fuzzy, the role is fuzzy and the ICP will be fuzzy. Sharpen here or stop.

5. **Team gap analysis.** What does the team currently lack? Skill gap, perspective gap, energy gap, lived-experience gap. This is the foundation of the culture-add hypothesis.

6. **Cognitive requirements.** What cognitive load does this role carry? Pattern recognition under ambiguity? Quantitative reasoning? Verbal reasoning? Synthesis across domains? Be specific. "Smart" is not a cognitive requirement.

7. **Behavioral signals.** 5-7 named behaviors that predict success in this specific role. Each signal is a behavior, not a trait. ("Drives clarity in 1:1s with executives" is a behavior; "executive presence" is a trait dressed in HR language.)

8. **Work-history patterns.** What career patterns predict success? Be honest about ramp-time vs. years-of-experience. A senior hire at a Series A often performs better with 8 years of varied scope than 15 years in one large company.

9. **Culture-add hypothesis.** What does this candidate ADD that the team currently does not have? Refuses culture-fit framing. If the hypothesis collapses to "someone like the team but better," restart — that is similarity-attraction, not culture-add.

10. **DOES-NOT-MATTER list.** The anti-criteria. What would otherwise leak in as bias?
    - School prestige (when irrelevant)
    - Years-of-experience-floor (when ramp-time matters more)
    - "Executive presence" (when role is IC)
    - Industry pedigree (when domain is learnable)
    - Big-company experience (when the role is scrappy)
    - Always-on availability (illegal in many jurisdictions; bias signal regardless)

11. **Compliance flag.** Per jurisdiction: pay-transparency requirements, salary-history bans, right-to-work, candidate-data retention rules. Surface what legal counsel needs to confirm before the JD goes live.

12. **Save.** Create `people-intelligence/hiring/` directory if missing. Write `people-intelligence/hiring/icp-<role-slug>-<YYYY-MM-DD>.md`.

13. **Hand off.** Default: `/hire-design-interview <role-slug>`. Alternative only if upstream gap (e.g., role design itself unclear → loop in Org Architecture sub-system).

## Output format

```markdown
# Ideal Candidate Profile — <Role Title> — <YYYY-MM-DD>

> **Hiring decisions touch employment law and protected-class considerations. This is system architecture, not legal advice. Validate jurisdiction-specific compliance with qualified counsel.**

## Context

- **Role:** <title>
- **Jurisdiction:** <US-state | EU-country | UK | other>
- **Team size:** <n>
- **Company stage:** <pre-seed | seed | series-a | series-b+ | established>
- **Multi-jurisdictional exposure:** <yes — list / no>
- **Genius Profile referenced:** <yes — voice signature noted / no — flagged for downstream voice work>
- **Vision Architecture referenced:** <yes — 3yr/10yr horizons noted / no — flagged for company-as-candidate framing>

## Outcome the role unlocks

<Single sentence. What does this role do that the team currently cannot?>

## Team gap analysis

The team currently lacks:

- **Skill gap:** <specific skill the role needs to bring>
- **Perspective gap:** <perspective the team is missing — domain, lived experience, functional background>
- **Energy gap:** <kind of energy the team needs more of — generative, structuring, integrating, defending>
- **Lived-experience gap (if relevant):** <e.g., scaled a similar org, managed through a similar transition>

## Cognitive requirements

<5-bullet list. Each bullet is a specific cognitive load this role carries. Avoid "smart"; be specific about WHAT KIND of cognition.>

- <e.g., Synthesis across 3+ stakeholder groups under time pressure>
- <e.g., Pattern recognition across qualitative + quantitative inputs>
- <e.g., Verbal reasoning to translate technical concepts to non-technical executives>
- <e.g., Strategic abstraction — moving from tactical surface to root cause>
- <e.g., Cognitive flexibility under shifting priorities (relevant for early-stage)>

## Behavioral signals

5-7 named behaviors that predict success in THIS role. Each is observable and rubric-able.

1. **<Behavior name>:** <one-sentence description of the behavior in action>
2. **<Behavior name>:** <one-sentence description>
3. **<Behavior name>:** <one-sentence description>
4. **<Behavior name>:** <one-sentence description>
5. **<Behavior name>:** <one-sentence description>
6. **<Behavior name (if applicable)>:** <one-sentence description>
7. **<Behavior name (if applicable)>:** <one-sentence description>

## Work-history patterns

What career trajectory predicts success? Be specific. Be honest about ramp-time vs. years.

- **Pattern A:** <e.g., 8-12 years across 3-4 companies including at least one early-stage scaling>
- **Pattern B:** <e.g., domain-adjacent expertise + demonstrable rapid-ramp capability>
- **Pattern C (if applicable):** <e.g., functional depth + cross-functional breadth>

## Culture-add hypothesis

This candidate ADDS to the team what the team currently does not have:

- **Adds:** <specific contribution — skill, perspective, lived experience, energy>
- **Bridges what gap:** <which team gap from above this candidate closes>
- **Tension this surfaces (honest):** <where this addition will create useful productive tension; e.g., "Adds rigorous-process orientation to a team that has run on fast-and-loose; useful tension at a stage where process should be hardening">

## DOES-NOT-MATTER list (anti-criteria)

These would otherwise leak in as bias. They do not predict success in this role and we will not weight them.

- [ ] <e.g., School prestige — does not correlate with this role's outcomes>
- [ ] <e.g., Years-of-experience floor — ramp-time and pattern match are stronger signals>
- [ ] <e.g., "Executive presence" — this is an IC role; presence is irrelevant>
- [ ] <e.g., Big-company pedigree — we are scrappy; large-org muscle memory may even cut against us>
- [ ] <e.g., Industry pedigree — domain is learnable inside 90 days for the right candidate>
- [ ] <Add others specific to this role>

## Compliance flag — for legal counsel review

- **Pay transparency:** <jurisdictional requirement — e.g., NYC requires salary range in JD; CA pay-transparency rules; EU pay-transparency directive>
- **Salary history:** <jurisdictional bans — e.g., CA, NY, MA, others ban asking salary history>
- **Right-to-work:** <jurisdictional requirements — e.g., UK right-to-work check>
- **Candidate data retention:** <e.g., GDPR Article 6 lawful basis + retention period>
- **Protected-class touchpoints:** <flag any ICP element that requires legal review — e.g., "always-on availability" implication; physical-presence requirements; language requirements>

**Action: forward this section to legal counsel before publishing JD.**

## Load-bearing next move

**`/hire-design-interview <role-slug>`** — translate this ICP into a structured interview architecture (loop slots, rubric, behavioral anchors, work-sample design).

Alternative next moves (only if upstream gap surfaced):
- Org Architecture redesign — if the role itself should be redrawn
- Vision excavation — if the company-as-candidate framing is undefined and the role is senior

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.** Non-waivable. Hiring touches employment law.
- **Never advise on protected-class questions.** Surface them in the compliance flag for legal counsel.
- **Refuse culture-fit framing.** Culture-add only. If the hypothesis reads "someone like us but better," restart.
- **Every ICP carries a DOES-NOT-MATTER list.** This is the load-bearing anti-bias element.
- **Behavioral signals are behaviors, not traits.** "Drives clarity in 1:1s with executives" passes. "Executive presence" fails.
- **Compose with Genius Profile when available.** Voice signature carries forward into outreach copy.
- **Compose with Vision when available.** Senior roles especially benefit from company-as-candidate framing.
- **One hand-off at close.** Default: `/hire-design-interview`. Alternatives only on real upstream gap.

— Hiring Intelligence — part of the People Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: 2026-04-24
---
