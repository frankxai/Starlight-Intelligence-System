---
name: hire-debrief
description: Run the post-loop decision debrief — facilitator script for the 45-60 minute session. Surface inter-rater drift, anchor every claim to the rubric, name bias patterns out loud, render the hire-or-no-hire decision per the pre-committed rule, and capture learning for the next loop. Structured scores submitted BEFORE discussion (kills loud-voice halo). Tie-breaks default to hire-no. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: candidate-slug (required) + role-slug (required) + --rater-count <3|4|5|6+> + optional context paragraph on which slots produced the strongest signal
---

# /hire-debrief

This is part of Ana's HR Intelligence sub-stack. Composes with Genius Profile + Vision/Brand for company-as-candidate framing.

Load `SIP.md`, `VOICES.md`, `agents/starlight-hiring.md`, `skills/hr-intelligence/structured-hiring.md`, the ICP, the interview architecture, the calibration session record, and (if present) the fit assessment for this candidate. Produce the **Debrief Facilitation Script + Decision Record**. Hand off to onboarding architecture (if hire-yes) or learning capture (if hire-no).

## Disclaimer (non-waivable)

**Hiring decisions touch employment law and protected-class considerations. Decision rationale must be rubric-anchored, not feel-anchored, and must not reference protected-class characteristics. This is system architecture, not legal advice. Decision documentation must be retained per jurisdiction-specific requirements; validate with qualified counsel.**

This command produces the script + the decision record. The facilitator runs the live session. The decision is rubric-anchored, written down, and retained.

## Input
$ARGUMENTS

## Flags

- `--rater-count <3|4|5|6+>` — number of raters who interviewed this candidate. Should match calibration session.

## Process

1. **Disclaim.** Open with the non-waivable disclaimer.

2. **Locate.** Confirm candidate-slug and role-slug. Read the ICP, interview architecture, calibration record, and fit assessment if present.

3. **Pre-debrief — collect structured scores.** Before the session, every rater submits structured scores via shared doc/tool. **Scores are submitted before discussion. Non-negotiable.** Loud-voice halo and conformity drift are killed by structure-first.

4. **Build the 45-60 minute agenda.**
   - **0:00 - 0:05 — Frame.** Decision rule reminder, bias-pattern primer, structured-scores-before-discussion confirmation.
   - **0:05 - 0:15 — Surface dispersion.** Where did raters disagree by ≥2 points? Those dimensions get the discussion oxygen.
   - **0:15 - 0:35 — Discuss high-dispersion dimensions.** Anchor every claim to rubric. Facilitator names bias patterns out loud as they appear.
   - **0:35 - 0:45 — Read fit assessment (if present).** Supplement to rubric, not replacement.
   - **0:45 - 0:55 — Apply decision rule.** Hire-or-no-hire per the pre-committed rule. Write the rationale.
   - **0:55 - 1:00 — Learning capture.** What worked in the loop? What drifted? Feed back into next calibration.

5. **Bias-pattern flagging.** The facilitator names patterns out loud as they appear. Raters do not have to self-diagnose:
   - Halo, similarity-attraction, first-impression, recency, contrast effect, confirmation bias.

6. **Apply decision rule.**
   - Hire: median ≥4 on ≥75% of dimensions AND ≥3 on every dimension. (Or whatever the calibration session pre-committed to.)
   - No-hire: anything else.
   - **Tie-breaks default to hire-no.** False negatives cost less than false positives.
   - Inter-rater dispersion ≥2 points on a load-bearing dimension that cannot resolve via rubric anchoring → re-interview that specific dimension, not vibes-resolution.

7. **Decision rationale.** Written down. Rubric-anchored. Specific. "Hire — median 4.2 across raters, ≥4 on Dimensions 1-3 (load-bearing), ≥3 on Dimension 4. Fit assessment confirms culture-add via perspective gap closure. No bias patterns surfaced that survived facilitator naming."

8. **Learning capture.** What did this loop reveal about the rubric, the calibration, the decision rule? Feed forward into the next loop's calibration session.

9. **Save.** Write `hr-intelligence/hiring/debrief-<candidate-slug>-<YYYY-MM-DD>.md`.

10. **Hand off.**
    - If hire-yes: produce 90-day onboarding architecture (inline below or via separate `/hire-onboard` if specified).
    - If hire-no: feed learning into next calibration session; close the candidate communication loop with timely, specific feedback (where compliant with jurisdiction).

## Output format

```markdown
# Debrief + Decision Record — <Candidate Slug> — <Role> — <YYYY-MM-DD>

> **Hiring decisions touch employment law and protected-class considerations. Decision rationale must be rubric-anchored, not feel-anchored, and must not reference protected-class characteristics. Decision documentation must be retained per jurisdiction-specific requirements.**

## Context

- **Candidate:** <slug>
- **Role:** <title>
- **Rater count:** <n>
- **Calibration session:** `hr-intelligence/hiring/calibration-<role-slug>-<date>.md`
- **Interview architecture:** `hr-intelligence/hiring/interview-<role-slug>-<date>.md`
- **Fit assessment:** `hr-intelligence/hiring/fit-<candidate-slug>-<role-slug>-<date>.md` (if applicable)

## Pre-debrief — structured scores collected

All raters submitted structured scores BEFORE this debrief began. Non-negotiable. Loud-voice halo and conformity drift killed by structure-first.

| Dimension | Rater A | Rater B | Rater C | Rater D | Median | Min |
|-----------|---------|---------|---------|---------|--------|-----|
| <Dim 1>   | <n> | <n> | <n> | <n> | <m> | <min> |
| <Dim 2>   | <n> | <n> | <n> | <n> | <m> | <min> |
| <Dim 3>   | <n> | <n> | <n> | <n> | <m> | <min> |
| <Dim 4>   | <n> | <n> | <n> | <n> | <m> | <min> |
| <Dim 5>   | <n> | <n> | <n> | <n> | <m> | <min> |

**High-dispersion dimensions (≥2-point disagreement):** <list>

## 45-60 minute agenda

### 0:00 - 0:05 — Frame (5 min)

**Facilitator opens:**

> "Decision rule from calibration: median ≥4 on ≥75% of dimensions AND ≥3 on every dimension. Tie-breaks default to hire-no.
>
> Bias patterns I will name out loud as they appear: halo, similarity-attraction, first-impression, recency, contrast effect, confirmation bias. You don't have to self-diagnose.
>
> Structured scores are in. We're going to spend most of our time on dimensions where we disagreed by ≥2 points — that's where the signal lives. We're not re-litigating dimensions where we agreed."

### 0:05 - 0:15 — Surface dispersion (10 min)

Read out the high-dispersion dimensions. Each rater states their score in 30 seconds, anchored to the rubric. ("I scored a 4 on Dim 2 because [behavior observed]. Here's the moment in the interview that drove the 4.")

**Dispersion observed:**

- **<Dim X>:** Rater A scored 5, Rater C scored 2. 3-point dispersion. Discussion priority.
- **<Dim Y>:** Rater B scored 5, Rater D scored 3. 2-point dispersion. Discussion priority.

### 0:15 - 0:35 — Discuss high-dispersion dimensions (20 min)

For each high-dispersion dimension:

1. Each rater anchors their score to specific behavior observed.
2. Facilitator listens for bias patterns and names them as they appear.
3. Group discusses whether the rubric anchor language was applied consistently.
4. Either the dimension resolves (raters update scores based on shared anchor language) OR the dimension is flagged for re-interview (if dispersion remains and is load-bearing).

**Bias patterns named in this debrief:**

- <e.g., "Halo flagged on Dim 4 — strong technical answer in Slot 2 inflated Rater A's Dim 4 score. Re-anchored to the actual Dim 4 behavior observed.">
- <e.g., "Similarity-attraction flagged on Dim 5 — candidate's background closely mirrors Rater B's. Re-anchored to behavior, score adjusted from 5 to 4.">

**Dispersion resolution:**

- **<Dim X>:** Resolved. Re-anchored scores: <new spread>. Median: <new>.
- **<Dim Y>:** Unresolved. Flagged for re-interview on this dimension specifically.

### 0:35 - 0:45 — Read fit assessment (10 min)

If fit assessment exists, read it into the discussion. Supplement to rubric, not replacement.

**Fit assessment net finding:** <one sentence from the fit assessment>

**Does fit assessment shift the rubric-driven decision?** Almost always: no. Fit is supplement, not override. If fit is being used to override a strong rubric score, the bias to flag is similarity-attraction (or its inverse — over-correction).

### 0:45 - 0:55 — Apply decision rule (10 min)

**Final scores after dispersion resolution:**

| Dimension | Final median | Final min |
|-----------|--------------|-----------|
| <Dim 1>   | <m> | <min> |
| <Dim 2>   | <m> | <min> |
| <Dim 3>   | <m> | <min> |
| <Dim 4>   | <m> | <min> |
| <Dim 5>   | <m> | <min> |

**Decision rule applied:**
- Median ≥4 on ≥75% of dimensions: <yes / no>
- Min ≥3 on every dimension: <yes / no>
- Decision: **<HIRE | NO-HIRE | RE-INTERVIEW on Dim X>**

**Decision rationale (written, rubric-anchored, no protected-class references):**

<2-4 sentences. Specific. Rubric-anchored. e.g., "Hire. Median 4.2 across raters, ≥4 on Dimensions 1, 2, 3 (load-bearing) and ≥3 on Dimensions 4 and 5. Fit assessment confirms culture-add via perspective-gap closure (non-SaaS lived experience). Halo flagged on Dim 4 was named and re-anchored; final score holds. No protected-class references in any rater's rationale. Productive tension expected on process-orientation in weeks 2-4; hiring manager flagged and aligned.">

### 0:55 - 1:00 — Learning capture (5 min)

**What worked in this loop:**
- <e.g., "Calibration session caught the Dim 2 paraphrase mismatch before the loop ran — saved a debrief disaster.">
- <e.g., "Work-sample slot produced clearest signal on Dim 1; carry forward to next loop.">

**What drifted:**
- <e.g., "Slot 4 ran post-lunch despite calibration commitment to no post-lunch decision panels. Rater D's scores on that slot tracked lower across all candidates — likely decision fatigue, not signal. Adjust schedule for next loop.">
- <e.g., "Rubric anchor language on Dim 5 was ambiguous — resolved in debrief but should sharpen anchor language before next loop.">

**Feed forward to next calibration:**
- <specific updates to rubric language, schedule design, or question stems>

## Hire-yes path (only if decision is hire)

### 90-day onboarding architecture

**Day 1-7: Land**
- Day 1: Manager 1:1 (60 min) — confirm role, expectations, week 1 milestone.
- Day 2-3: Meet team — structured intros, not informal "go meet people."
- Day 4-5: First small ownership — a real decision, scoped small, with manager unblock available.
- Day 7: Manager 1:1 (30 min) — calibrate week 1 against expectations.

**Day 8-30: Learn**
- Weekly manager 1:1 (45 min) — calibrate expectations weekly.
- 30-day milestone: <specific deliverable that proves "I learned what this team does and how">.
- Day 30: Manager + skip-level + 2 peer feedback (structured, brief).

**Day 31-60: Contribute**
- Bi-weekly manager 1:1.
- 60-day milestone: <specific deliverable that proves "I contributed beyond what was expected at day 30">.
- Day 60: Manager 1:1 + peer feedback.

**Day 61-90: Own**
- Bi-weekly manager 1:1.
- 90-day milestone: <specific deliverable that proves "I own this scope and the team relies on me for it">.
- Day 90: Manager + skip-level + cross-functional feedback. Decision: confirmed, calibrate, or surface concern.

**Manager-side rituals:**
- Calibrate expectations weekly for 30 days, then bi-weekly.
- Front-load the energizing work (from Talent sub-system motivation patterns).
- Surface friction at week 4-6, not at month 3.

(Onboarding architecture is where retention is decided. Per the literature: 90-day onboarding predicts 12-month retention better than the entire interview process. Treat it as the actual hire.)

## Hire-no path (only if decision is no-hire)

- **Candidate communication:** Timely, specific, professional. Where compliant with jurisdiction (some jurisdictions limit specificity of feedback for legal exposure reasons; others require specific feedback). Validate with counsel.
- **Internal learning:** Did the loop catch this pre-offer? (Good.) Did the rubric surface the gap? (If not, sharpen.) Did any bias pattern surface that needs to feed forward into next calibration?
- **Candidate-pool:** Is this candidate a "no for this role, possibly yes for a different role"? If yes, route to recruiter notes. If no, close the loop cleanly.

## Load-bearing next move

- **If hire-yes:** Confirm offer details with hiring manager + recruiter. Onboarding architecture (above) operationalizes day 1.
- **If hire-no:** Close candidate loop. Feed learnings into next calibration session for this role.
- **If re-interview:** Schedule single-dimension re-interview within 1 week. Do not re-run the full loop.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.**
- **Structured scores submitted BEFORE discussion.** Non-negotiable. The order matters. Kills loud-voice halo and conformity drift.
- **High-dispersion dimensions get the discussion oxygen.** Don't re-litigate dimensions where raters agreed.
- **Bias patterns named out loud by facilitator.** Raters do not have to self-diagnose.
- **Decision rule pre-committed in calibration; applied in debrief.** Don't change the rule mid-debrief.
- **Tie-breaks default to hire-no.** Always.
- **Decision rationale rubric-anchored, written, and retained.** Per jurisdiction.
- **No protected-class references in any rationale.** Verified.
- **Hire-yes triggers 90-day onboarding architecture.** Onboarding is where retention is decided.
- **Learning captured for next calibration.** The loop improves loop-over-loop.
- **One hand-off at close.** Onboarding (hire-yes), candidate close (hire-no), or scoped re-interview.

— Hiring Intelligence — part of Ana's HR Intelligence Domain Sub-Stack —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: 2026-04-24
---
