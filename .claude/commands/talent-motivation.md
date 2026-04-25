---
name: talent-motivation
description: Build a per-person motivation map from observed behavior using Self-Determination Theory + dopamine-anticipation analysis. Output is a motivation hypothesis plus 1-2 leverage interventions, never a personality profile. Refuses engagement-survey-as-data; refuses generic "you should be more motivating." Sub-system 5 of 6 in Ana's HR Intelligence Domain Sub-Stack.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name (required) + --role <ic|manager|exec|customer-facing|other> + --signal-window <weeks> + optional context paragraph describing the observed pattern
---

# /talent-motivation

Load `SIP.md`, `VOICES.md`, `agents/starlight-talent.md`, `skills/hr-intelligence/people-dynamics.md`, and if present prior motivation maps for this person and the team's culture artifact (`hr-intelligence/culture/`) for system-context. Produce a **Motivation Map**. Hand off to exactly one next move.

## Disclaimer (non-waivable)

**This is HR system architecture, not clinical advice. When a person's distress crosses into active depression, anxiety disorder, eating disorder, or addiction, refer to a qualified mental health clinician. This is also not legal advice. ADA accommodations and protected-class considerations require jurisdiction-specific compliance and individualized interactive process — validate with qualified counsel.**

## Input
$ARGUMENTS

## Flags

- `--role <ic|manager|exec|customer-facing|other>` — role tier shapes which SDT dimension is most predictive. ICs: autonomy + competence dominant. Managers: relatedness rises. Execs: autonomy + relatedness dominant; competence assumed. Customer-facing: relatedness + competence dominant.
- `--signal-window <weeks>` — how many weeks of observable signal are available. Less than 8 weeks: flag confidence cost; recommend longer window before high-stakes intervention. 12+ weeks: high confidence. Required input — single-snapshot motivation maps are refused.
- Optional context paragraph: the observed pattern in plain language ("She used to drive the roadmap conversations and now she's the last to speak in them" beats "she seems checked out").

## Process

1. **Disclaim.** Open the output with the non-waivable disclaimer. Structurally first.

2. **Locate.** Confirm role-tier from `--role`. Confirm signal-window from `--signal-window`. Surface the manager's hypothesis (if any) but bracket it — the diagnostic should not pre-confirm the manager's frame.

3. **Read.** If a Culture artifact exists for this team (`hr-intelligence/culture/`), read it for system context. If a Genius Profile exists for the person's manager (rare but possible in Ana's instance), note voice for the recommended manager-conversation script.

4. **Gather observed signals across the window.** Sentiment trajectory, workload pattern, relational signal, behavioral artifacts — all observed, not self-reported. Surface what is unknown explicitly; do not invent.

5. **SDT lens.** For each of autonomy / competence / relatedness, score from observed behavior on a 1-5 anchored scale:
   - **Autonomy:** Does this person have meaningful control over how the work gets done? Are they being micromanaged? Is the scope of decision-making shrinking?
   - **Competence:** Is the work calibrated to current skill (not too easy, not over-stretched into chronic-failure)? Is mastery visible?
   - **Relatedness:** Is there real connection to colleagues, manager, mission? Or are they working alongside people they barely know?
   Anchor each score to specific observed behavior — never "feels like 3."

6. **Dopamine-anticipation overlay.** Where is progress visible to this person? Where is it invisible? When did they last experience a clearly-named win? What is the next milestone they can see and reach? Flat dopamine-anticipation is the most common motivation collapse mode for high-performers — the work has stopped signaling progress.

7. **Motivation hypothesis.** Synthesize SDT scores + dopamine analysis into ONE load-bearing hypothesis (not three competing hypotheses). Examples:
   - "Autonomy collapse — scope narrowed in last reorg without naming why, dopamine-anticipation flat because no next milestone visible."
   - "Relatedness deficit — new manager 5 months ago, no real 1:1 connection formed, mission detachment growing."
   - "Competence mismatch — promoted into a role 6 months ago that requires skills she doesn't yet have, no calibrated growth path, frustration trending toward cynicism (flag for burnout monitoring)."

8. **Per-person context.** Life stage, role-fit, growth trajectory, recent transitions, relational context. Surface what shifts the hypothesis — never generalize before contextualizing.

9. **Leverage interventions (1-2 max).** Smallest credible intervention, largest measurable shift. Match to the hypothesis. Cite SDT direction. Each intervention is named specifically — not "have a conversation" but "manager-led 30-minute scope-and-autonomy conversation, structured around three questions [named], scheduled within 7 days."

10. **Measurement plan.** What will shift if the intervention works? Behavioral signals to watch (named). Reassessment cadence (4 weeks, 12 weeks). What would suggest the hypothesis was wrong and a different frame is needed.

11. **Clinical-boundary check.** If observed signals include severe withdrawal, suicidality language, eating-pattern disruption, persistent severe sleep disturbance, or substance-use patterns — flag clinical referral pathway as the load-bearing next move, not the motivation intervention.

12. **Save.** Create `hr-intelligence/talent/` directory if missing. Write `hr-intelligence/talent/motivation-<person-slug>-<YYYY-MM-DD>.md`.

13. **Hand off.** Name exactly one next move:
    - Burnout signals overlap with motivation map → `/talent-burnout-detect`
    - Hypothesis is structural → request to Org Architecture (`/org-role-design`)
    - Hypothesis is system-level reward-mismatch → request to Performance (`/perf-review-redesign`)
    - Hypothesis is system-level value-misalignment → request to Culture (`/culture-design`)
    - Hypothesis is clean individual + leverage is named → manager runs the named intervention; reassess in 4 weeks
    - Clinical signals present → referral pathway, not motivation work

## Output format

```markdown
# Motivation Map — <Person Name> — <YYYY-MM-DD>

> **HR system architecture, not clinical advice. Refer to a qualified clinician when distress crosses into active depression, anxiety disorder, eating disorder, or addiction. Not legal advice — ADA accommodations and protected-class considerations require jurisdiction-specific compliance.**

## Context

- **Role tier:** <ic | manager | exec | customer-facing | other>
- **Signal window:** <N weeks of observable data>
- **Confidence:** <high | medium | low — flag if window <8 weeks>
- **Manager's hypothesis (bracketed):** <what the manager thinks is going on, held separately from the diagnostic>
- **Culture artifact referenced:** <yes / no — and key system context if yes>

## Observed signals across the window

| Dimension | Observation | Trend |
|-----------|-------------|-------|
| Sentiment trajectory | <specific observed pattern> | <improving / flat / declining> |
| Workload pattern | <hours / project count / context-switch density> | <trend> |
| Relational signal | <1:1 cancellations / voluntary collab participation / public-meeting affect> | <trend> |
| Behavioral artifacts | <PR tone / deal urgency / response latency / revision count> | <trend> |

What is unknown: <explicit list — never invented>

## SDT scores (anchored to observed behavior)

| Dimension | Score (1-5) | Anchor observation |
|-----------|-------------|---------------------|
| Autonomy | <N> | <specific behavior — "scope narrowed from leading X to executing X, no consultation in last 8 weeks"> |
| Competence | <N> | <specific behavior — "work calibrated to skill / over-stretch / under-stretch"> |
| Relatedness | <N> | <specific behavior — "real connection to manager / peer relationships / mission attachment"> |

## Dopamine-anticipation analysis

- **Where is progress visible:** <specific moments / artifacts / rituals>
- **Where is progress invisible:** <where the work has stopped signaling forward motion>
- **Last clearly-named win:** <when, what, who acknowledged>
- **Next visible milestone:** <named, or flagged as absent>
- **Pattern:** <healthy anticipation cycle / flat-wanting / collapsed anticipation>

## Motivation hypothesis (load-bearing, single)

<One sentence — what is the dominant SDT + dopamine pattern driving the observed behavior. Specific. Falsifiable.>

## Per-person context

- **Life stage:** <new parent / caregiving / single / late-career / etc.>
- **Role-fit:** <pulling up / sideways / down / mismatched>
- **Growth trajectory:** <visible next / no next visible 18+ months / recent move>
- **Recent transitions:** <new manager / reorg / scope change / promo or non-promo>
- **Relational context:** <strong manager / new manager / toxic peer / new team>
- **What this shifts in the hypothesis:** <named explicitly>

## Leverage interventions (1-2 max)

### Intervention 1: <named specifically>

- **Targets SDT dimension:** <autonomy / competence / relatedness>
- **Why this:** <research direction cited — e.g., "SDT autonomy literature: meaningful control over how, not just what, drives intrinsic motivation">
- **Specific action:** <who does what, by when, with which structure>
- **What success looks like in 4 weeks:** <observable, falsifiable>

### Intervention 2 (if warranted): <named specifically>

- **Targets:** <dimension>
- **Why this:** <research direction>
- **Specific action:** <named>
- **What success looks like:** <observable>

## Measurement plan

- **Behavioral signals to watch:** <named list — 3-5 items>
- **Reassessment cadence:** 4 weeks (early signal), 12 weeks (sustained shift)
- **Hypothesis-falsification signals:** <what would suggest the diagnostic was wrong and a different frame is needed — burnout / team dynamics / safety / retention / clinical>

## Clinical-boundary check

<Explicit yes/no on each: severe withdrawal? suicidality language? eating disruption? persistent severe sleep disturbance? substance-use pattern? — if any yes, the load-bearing next move is referral, not motivation intervention.>

## Load-bearing next move

**`<one command or one specific manager action>`** — `<one-line rationale>`.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.** Clinical and legal both. Non-waivable.
- **Refuse engagement-survey-as-primary.** Tertiary at best. The load-bearing data is observed behavior across a window.
- **Refuse single-snapshot motivation maps.** Minimum 8 weeks of signal; flag confidence cost if shorter.
- **Refuse personality-profile substitute.** This is a motivation map, not a Big-Five report.
- **One load-bearing hypothesis, not three.** Decision-first.
- **Anchor every SDT score to specific observed behavior.** Never "feels like 3."
- **1-2 interventions max.** Over-design dilutes leverage.
- **Reassessment cadence required.** No cadence = not real.
- **Clinical-boundary check required on every artifact.**
- **Per-person context surfaced before generalizing.**
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: 2026-04-24
---
