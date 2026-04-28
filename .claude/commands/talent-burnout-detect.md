---
name: talent-burnout-detect
description: Run a burnout detection protocol on a person or team. Maslach 3-dimensional assessment (emotional exhaustion + cynicism + reduced personal accomplishment) plus root-cause hypothesis plus intervention plan plus reassessment cadence. Cynicism is the diagnostic. Hard clinical-boundary escalation when signals cross into clinical territory. Refuses "burnout = tired" framing. Sub-system 5 of 6 in the People Intelligence reference vertical.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person or team identifier (required) + --target <person|team> + --signal-window <weeks> + optional context paragraph describing observable signals (sentiment, workload, behavior)
---

# /talent-burnout-detect

Load `SIP.md`, `VOICES.md`, `agents/starlight-talent.md`, `skills/people-intelligence/people-dynamics.md`, and any prior motivation maps for this person (`people-intelligence/talent/motivation-*`) and team-context (`people-intelligence/culture/`). Produce a **Burnout Detection Protocol**. Hand off to exactly one next move — clinical referral if applicable, otherwise system + individual intervention.

## Disclaimer (non-waivable)

**This is HR system architecture, not clinical advice. Burnout co-occurs with depression, anxiety, and other clinical conditions but is distinct from them. When signals suggest active depression, anxiety disorder, eating disorder, addiction, or suicidality, refer to a qualified mental health clinician — that referral is the load-bearing next move, not an HR intervention. This is also not legal advice. ADA accommodations and protected-class considerations require jurisdiction-specific compliance and individualized interactive process — validate with qualified counsel.**

## Input
$ARGUMENTS

## Flags

- `--target <person|team>` — individual or team-level burnout detection. Team-level uses aggregate Maslach signal across the unit; still flags any individual-level clinical signal that surfaces.
- `--signal-window <weeks>` — observable signal window. <8 weeks: low confidence, flag explicitly. 12+ weeks: high confidence. Single-snapshot burnout detections are refused — burnout is longitudinal by definition.
- Optional context: observable signals in plain language — workload pattern, recent transitions, relational withdrawal, manager observations.

## Process

1. **Disclaim.** Open the output with the non-waivable disclaimer. Structurally first. Clinical boundary clearly stated.

2. **Locate target.** Person or team. Recent transitions (reorg, layoff, scope change, bereavement, new manager). Current workload context. If team-level: cohort size, role mix, manager structure.

3. **Gather longitudinal signals across the window.**

   - **Workload pattern:** hours, calendar density, project count, after-hours messaging, weekend work, vacation use (or refusal of vacation — strong signal).
   - **Sentiment trajectory:** 1:1 notes, written communication tone, sarcasm trending up, "fine" replacing real updates, public-meeting affect.
   - **Relational withdrawal:** canceled 1:1s, withdrawn from voluntary collaborations, performative-only output, declining offers to lead, opt-out of social events that used to attend.
   - **Cognitive signals:** error rate trending up, decision latency increasing, missed details that used to be caught, over-reliance on simple tasks.
   - **Body signals (where observable):** appearance changes, sleep references, "I just can't sleep" comments, frequent illness, declining energy.

4. **Maslach 3-dimensional assessment.** For each dimension, score 1-5 anchored to observed behavior:

   - **Emotional exhaustion:** depleted at start of week / drained even after rest / "running on empty" pattern. Anchor: "Used to come back from weekend recharged; now reports fatigue starting Monday morning, sustained through Friday."
   - **Cynicism / depersonalization:** protective withdrawal of caring; "doesn't matter" tone; sarcasm about mission; treating users / colleagues / customers as objects rather than people. **The diagnostic dimension.** Anchor: "Used to advocate strongly for user impact in roadmap discussions; now responds with 'whatever ships ships' or doesn't engage at all."
   - **Reduced personal accomplishment:** sense of ineffectiveness; "what's the point" pattern; loss of pride in completed work; can't name a recent win they're proud of. Anchor: "Used to celebrate ship moments; recent ships pass without acknowledgment from them."

   **Critical interpretation:** exhaustion alone is acute stress. Reduced-accomplishment alone may be skill-fit or growth-arc issue. The burnout SYNDROME requires elevation across the three dimensions, with cynicism as the diagnostic anchor. A person scoring high exhaustion + high accomplishment + low cynicism is overworked, not burned out. A person scoring moderate exhaustion + moderate accomplishment + high cynicism is more concerning than the first.

5. **Risk level.**

   - **Low (early-stage):** one dimension elevated, no cynicism, recent acute stressor visible. Intervention: load adjustment + short recovery + monitor.
   - **Moderate (developing burnout):** two dimensions elevated, cynicism present but not dominant, sustained over 8+ weeks. Intervention: structural load change + recovery cycle + manager-conversation + 4-week reassessment.
   - **High (full burnout syndrome):** all three dimensions elevated, cynicism dominant, sustained 12+ weeks, relational withdrawal pronounced. Intervention: extended recovery (vacation / sabbatical / leave depending on jurisdiction and severity) + structural redesign + clinical-referral path explicitly offered (not mandated; offered with named pathway). Reassessment in 8 weeks.
   - **Severe / clinical territory:** any signal of suicidality, self-harm, severe depression (persistent low mood + loss of pleasure + sleep / appetite / cognition disruption sustained), substance-use pattern, eating-pattern disruption. **Load-bearing next move is referral pathway, not HR intervention.** The artifact still ships, but as a referral artifact, not a burnout intervention plan.

6. **Root-cause hypothesis.** Burnout is rarely one input. Surface 1-3 of these as likely root causes (cite which signals support each):

   - **Chronic overload** — workload exceeds sustainable capacity for extended period.
   - **Value-misalignment** — the work conflicts with the person's values; "this isn't who I want to be" undertone.
   - **Lack-of-control** — work is high-pressure but person has no autonomy over how / when / scope.
   - **Unfairness** — perceived inequity in compensation, recognition, advancement, or treatment relative to peers.
   - **Social-isolation** — disconnection from colleagues, manager, mission; remote-work loneliness; peer conflict.
   - **Reward-mismatch** — effort is high, recognition or compensation does not track.

7. **Intervention plan — individual + system level.**

   **Individual level:**
   - Recovery cycle (named — vacation, sabbatical, reduced-load period).
   - Manager-conversation script (research-anchored, in the practitioner's voice if Genius Profile available).
   - Specific load reduction (which projects come off; which stay; for how long).
   - Reassessment cadence.

   **System level (REQUIRED — most "individual" burnout has system roots):**
   - Which root-cause is structural?
   - What system change request goes to which sister sub-system?
     - Chronic overload → Org Architecture (`/org-role-design`, `/org-span`)
     - Value-misalignment → Culture (`/culture-design`, `/culture-values-ops`)
     - Lack-of-control → Culture + Org Architecture
     - Unfairness → Performance (`/perf-review-redesign`) + comp review
     - Social-isolation → Culture (`/culture-rituals`)
     - Reward-mismatch → Performance + comp review

   Most burnout interventions fail because they only address the individual. The system that produced the burnout will produce it again in the next person.

8. **Reassessment cadence.** Burnout recovery is months, not weeks.
   - Low: 4-week reassessment.
   - Moderate: 4 / 8 / 12 weeks.
   - High: 4 / 8 / 12 weeks for early signal; 3-6 months for full recovery.
   - Severe / clinical: clinician-led; HR follows clinician guidance.

9. **Save.** Write to `people-intelligence/talent/burnout-<person-or-team>-<YYYY-MM-DD>.md`.

10. **Hand off.** Name exactly one next move:
    - Severe / clinical signal → referral pathway named explicitly with jurisdiction-specific resource list.
    - High burnout, structural root → system-change request to relevant sister sub-system, plus individual recovery plan.
    - Moderate burnout, individual leverage → manager-conversation + load reduction; 4-week reassessment.
    - Low / early-stage → manager-led monitoring + small intervention; 4-week reassessment.
    - Team-level burnout pattern → request to Org Architecture / Culture for structural review.

## Output format

```markdown
# Burnout Detection Protocol — <Person or Team Name> — <YYYY-MM-DD>

> **HR system architecture, not clinical advice. When signals suggest active depression, anxiety disorder, eating disorder, addiction, or suicidality, refer to a qualified clinician — that referral is the load-bearing next move, not an HR intervention. Not legal advice — ADA accommodations and protected-class considerations require jurisdiction-specific compliance.**

## Context

- **Target:** <person | team>
- **Signal window:** <N weeks>
- **Confidence:** <high | medium | low>
- **Recent transitions:** <reorg / layoff / scope change / bereavement / new manager / promo / non-promo>
- **Current workload context:** <quarter shape / launch crunch / steady-state>

## Longitudinal signals

| Category | Observed | Trend |
|----------|----------|-------|
| Workload pattern | <hours, calendar density, after-hours, vacation use> | <trend> |
| Sentiment trajectory | <1:1 tone, written communication, sarcasm, "fine" pattern> | <trend> |
| Relational withdrawal | <1:1 cancellations, voluntary collab, declining to lead, opt-out> | <trend> |
| Cognitive signals | <error rate, decision latency, missed details> | <trend> |
| Body signals (where observable) | <appearance, sleep references, illness frequency> | <trend> |

## Maslach 3-dimensional assessment

| Dimension | Score (1-5) | Anchor observation |
|-----------|-------------|---------------------|
| Emotional exhaustion | <N> | <specific observed pattern> |
| Cynicism / depersonalization (DIAGNOSTIC) | <N> | <specific observed pattern> |
| Reduced personal accomplishment | <N> | <specific observed pattern> |

## Risk level

**`<low | moderate | high | severe-clinical>`**

Reasoning: <which dimensions are elevated; whether cynicism is dominant; sustained across what window>

## Root-cause hypothesis

Surfaced root causes (with supporting signals):

1. **<chronic overload | value-misalignment | lack-of-control | unfairness | social-isolation | reward-mismatch>** — <signals supporting>.
2. **<second cause if applicable>** — <signals supporting>.
3. **<third cause if applicable>** — <signals supporting>.

Most burnout has 2-3 root causes compounding. One-cause burnout exists but is rare.

## Intervention plan

### Individual level

- **Recovery cycle:** <named — vacation N days / sabbatical N weeks / reduced-load period / leave>
- **Manager-conversation:** <when, structured around what — script reference if the practitioner's voice available>
- **Specific load reduction:** <which projects off / which stay / for how long>
- **Reassessment:** <cadence per risk level>

### System level (required)

- **Structural root cause:** <named>
- **System-change request:** to **`<sister sub-system>`** via **`<command>`** — `<one-line rationale>`.
- **Why this and not just individual intervention:** <the system that produced this burnout will produce it again — the next person, the next quarter — without structural change.>

## Reassessment cadence

- **4 weeks:** <what to check>
- **8 weeks:** <what to check>
- **12 weeks:** <what to check>
- **3-6 months (high-risk only):** <what full recovery looks like>

## Clinical-boundary check

- Suicidality / self-harm signals: <yes/no, with detail if yes>
- Severe depression signals (persistent low mood + loss of pleasure + sleep/appetite/cognition disruption sustained): <yes/no>
- Anxiety disorder signals (persistent uncontrollable worry, panic attacks, avoidance): <yes/no>
- Eating-pattern disruption: <yes/no>
- Substance-use pattern: <yes/no>

**If any yes:** This artifact ships as a REFERRAL artifact, not a burnout intervention plan. Named clinical referral pathway: <jurisdiction-specific — EAP, primary care referral, mental-health-specific resource list, employer health-insurance pathway>. The load-bearing next move is that referral.

## Load-bearing next move

**`<one command, manager action, or referral pathway>`** — `<one-line rationale>`.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always — clinical and legal both, non-waivable.**
- **CLINICAL ESCALATION is the load-bearing next move when severe signals are present.** Do not bury referral inside an HR plan. Severe-clinical risk level reframes the entire artifact as a referral artifact.
- **Cynicism is the diagnostic dimension.** A person tired but not cynical is overworked, not burned out.
- **Single-snapshot burnout detections are refused.** Minimum 8 weeks of signal; flag confidence cost if shorter.
- **Refuse "burnout = tired" framing.** Burnout is the three-dimensional syndrome, not a synonym for fatigue.
- **System-level intervention required on every artifact.** Most "individual" burnout has system roots. Failing to address the system reproduces the burnout in the next person.
- **Reassessment cadence required and matched to risk level.**
- **Vacation use (or refusal) is a strong signal.** Track explicitly.
- **Per-person context required.** Recent transitions, life stage, role-fit shift the interpretation.
- **Built on SIP attestation at end of every artifact.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Talent sub-system)
- Generated: 2026-04-24
---
