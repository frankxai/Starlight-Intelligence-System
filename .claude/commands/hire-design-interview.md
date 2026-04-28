---
name: hire-design-interview
description: Generate the structured interview architecture for a role — per-slot interviewer briefs, dimensions, question stems with rationale, behavioral anchors at 1/3/5, time allocation, and the cognitive-ability or work-sample slot per Schmidt & Hunter's validity bundle. Refuses unstructured interviews and personality-as-primary. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: role-slug (required, ICP must exist) + --slot-count <3|4|5|6> + --include-cognitive <yes|no|work-sample-substitute> + optional context paragraph on loop constraints (timezones, panel fatigue concerns)
---

# /hire-design-interview

This is part of the People Intelligence reference vertical. Composes with Genius Profile + Vision/Brand for company-as-candidate framing.

Load `SIP.md`, `VOICES.md`, `agents/starlight-hiring.md`, `skills/people-intelligence/structured-hiring.md`, the existing ICP at `people-intelligence/hiring/icp-<role-slug>-*.md`, and if present the company's Genius Profile (`genius/profile-<company-slug>.md`). Produce a **Structured Interview Architecture**. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**Hiring decisions touch employment law and protected-class considerations. This is system architecture, not legal advice. Question stems must be reviewed by qualified counsel for jurisdiction-specific compliance before the loop runs.**

This command produces the instrument. Legal counsel signs off on jurisdiction-specific question wording. The interviewer briefs run in the practitioner's voice via the Genius Profile when available — they are tools for the interviewer, not scripts the candidate sees.

## Input
$ARGUMENTS

## Flags

- `--slot-count <3|4|5|6>` — number of interview slots in the loop. 3 for entry/junior, 4 for mid, 4-5 for senior IC, 5-6 for senior leadership. More slots ≠ better signal — beyond 6 slots, marginal information drops below interviewer/candidate cost.
- `--include-cognitive <yes|no|work-sample-substitute>` — cognitive ability assessment. Per Schmidt & Hunter, cognitive ability is the single strongest predictor for cognitively-loaded roles. For non-cognitive-loaded roles, work-sample-substitute replaces it with a role-realistic task.

## Process

1. **Disclaim.** Open the output with the non-waivable disclaimer.

2. **Locate.** Confirm role-slug. Read the ICP file. If no ICP exists, halt and route to `/hire-icp <role>` first. Confirm slot-count and cognitive-flag.

3. **Map ICP dimensions to interview slots.** Each ICP behavioral signal must be assessed in at least one slot. Cognitive requirements get their own slot (or work-sample substitute). Culture-add hypothesis is assessed across multiple slots, not in a dedicated "culture" slot (which collapses into vibe-check).

4. **Per-slot design.** For each slot:
   - Interviewer name / role assignment
   - Time allocation (typically 45-60 min)
   - Dimensions assessed (5-7 per slot, drawn from ICP)
   - Question stems (3-5 per dimension), with rationale for each
   - Behavioral anchors at scale points 1, 3, and 5 for every dimension
   - Probe questions (when initial answer is shallow)
   - Red-flag patterns (what would shift the score down)

5. **Cognitive-ability slot (or work-sample substitute).** Per Schmidt & Hunter, this is non-negotiable for senior or cognitively-loaded roles. Options:
   - Cognitive ability assessment (validated, role-relevant)
   - Work sample (case study, strategy doc, code take-home) graded against pre-committed rubric
   - Role-play work sample (sales call, customer conversation, design review) for customer-facing roles

6. **Loop sequence + decision-fatigue mitigation.**
   - Max 4 panels per day per interviewer
   - No post-lunch decision panels (1-3pm window)
   - Front-load high-stakes slots
   - If multi-day loop, alternate cognitively-heavy and conversationally-heavy slots
   - Schedule a 60-minute calibration session BEFORE day 1 of the loop (separate command: `/hire-calibrate`)

7. **Voice composition.** Interviewer briefs should sound like the practitioner (the company's Genius Profile fingerprints), not generic HR-tech. Warm-precise. "Here is what we're trying to learn in this slot" beats "Assess the candidate's competency in X."

8. **Compliance review flag.** Forward all question stems to legal counsel for jurisdiction-specific review before the loop runs. Non-negotiable.

9. **Save.** Write `people-intelligence/hiring/interview-<role-slug>-<YYYY-MM-DD>.md`.

10. **Hand off.** Default: `/hire-calibrate <role-slug>`. The calibration session must run before the loop.

## Output format

```markdown
# Structured Interview Architecture — <Role Title> — <YYYY-MM-DD>

> **Hiring decisions touch employment law and protected-class considerations. Question stems must be reviewed by qualified counsel for jurisdiction-specific compliance before the loop runs.**

## Context

- **Role:** <title>
- **ICP file:** `people-intelligence/hiring/icp-<role-slug>-<date>.md`
- **Slot count:** <3 | 4 | 5 | 6>
- **Cognitive component:** <ability assessment | work sample | role-play | none — flagged>
- **Voice signature:** <referenced from Genius Profile / generic — flagged>

## Loop overview

<Visual / textual map of the loop. e.g.:>

- **Slot 1 — Initial structured behavioral (45 min)** — Interviewer A
- **Slot 2 — Work sample / cognitive ability (60 min)** — Interviewer B + structured grading
- **Slot 3 — Domain-deep structured behavioral (60 min)** — Interviewer C
- **Slot 4 — Cross-functional structured behavioral (45 min)** — Interviewer D
- **Slot 5 — Senior leadership structured behavioral (45 min)** — Interviewer E (senior roles only)

**Decision-fatigue mitigations applied:**
- No more than 4 panels per day per interviewer
- High-stakes slots (e.g., domain-deep) front-loaded
- Cognitive / work-sample slot scheduled in cognitive-peak window
- No interviewer panels in 1-3pm post-lunch window

## Slot 1 — <Slot Name>

**Interviewer:** <name / role>
**Time:** <e.g., 45 min — 5 min open + 35 min structured + 5 min candidate Qs>
**Format:** <structured behavioral / work sample / cognitive / role-play>

### Dimensions assessed

1. **<Dimension name>** (drawn from ICP signal #X)
2. **<Dimension name>** (drawn from ICP signal #Y)
3. **<Dimension name>**
4. **<Dimension name>**
5. **<Dimension name (5-7 total per slot)>**

### Question stems with rationale

**Dimension 1: <name>**

- **Q1.1:** "<Question stem>"
  - **Rationale:** <what this surfaces; why it predicts the dimension>
  - **Probe if shallow:** "<probe question>"
  - **Red-flag pattern:** <what answer would shift score down>

- **Q1.2:** "<Question stem>"
  - **Rationale:** <...>
  - **Probe if shallow:** "<probe>"
  - **Red-flag pattern:** <...>

- **Q1.3:** "<Question stem>"
  - **Rationale:** <...>
  - **Probe if shallow:** "<probe>"
  - **Red-flag pattern:** <...>

(Repeat for each dimension. 3-5 question stems per dimension.)

### Rubric — Dimension 1: <name>

| Score | Behavioral anchor |
|-------|-------------------|
| **5 — Strong hire signal** | <Concrete observable behavior. e.g., "Articulated trade-offs across 3+ stakeholder groups in <4 minutes; named the load-bearing constraint; asked a clarifying question that reframed the problem."> |
| **4** | <Slightly below 5 anchor — partial reach.> |
| **3 — Bar** | <The bar. Concrete observable behavior at the level we hire.> |
| **2** | <Below bar — partial fail.> |
| **1 — Strong no-hire signal** | <Concrete observable behavior. e.g., "Surfaced trade-offs only when explicitly asked; did not name load-bearing constraint; conflated stakeholder groups."> |

(Rubric for every dimension. Behavioral anchors at 1, 3, and 5 are non-negotiable. Never "rate 1-5" without anchors.)

---

## Slot 2 — <Slot Name>

(Same structure as Slot 1. Repeat for every slot.)

---

## Cognitive ability / work sample slot

**Format chosen:** <ability assessment / work sample / role-play>

### If ability assessment:
- Instrument: <validated assessment, role-relevant>
- Time: <as specified by instrument>
- Scoring: <pre-committed cutoff or band>

### If work sample:
- **Prompt:** "<the actual work-sample prompt the candidate receives>"
- **Time allocation:** <e.g., 90-min take-home with 24-hour return window>
- **Grading rubric:** <pre-committed dimensions with behavioral anchors at 1/3/5>
- **Rationale:** <why this work sample predicts on-the-job performance>

### If role-play (customer-facing roles):
- **Scenario:** "<the scenario the candidate is asked to navigate>"
- **Counterpart brief:** <how the interviewer plays the role>
- **Grading rubric:** <pre-committed dimensions with behavioral anchors>

---

## Question stems — compliance review flag

**The following question stems must be reviewed by qualified counsel for jurisdiction-specific compliance before the loop runs:**

- All stems above (full list).
- Specific compliance touchpoints to flag for counsel:
  - <e.g., "Tell me about a time you balanced family obligations with a tight deadline" — DO NOT USE; protected-class touchpoint>
  - <e.g., Salary expectations questions — review against jurisdiction salary-history bans>
  - <e.g., Citizenship / right-to-work — review for legal phrasing>

**Action: forward this entire architecture to legal counsel before scheduling the loop.**

## Voice composition note

Interviewer briefs (the prep document each interviewer reads before their slot) are written in <company voice from Genius Profile, when referenced — warm-precise, neuroscience-grounded; or generic if no Profile, flagged>. The briefs are tools for the interviewer; the candidate sees the conversation, not the brief.

## Load-bearing next move

**`/hire-calibrate <role-slug>`** — run the pre-loop calibration session with all interviewers (60 min, ≥3 raters) before the loop runs. The calibration session is non-negotiable; without it, the loop runs on uncalibrated rulers.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.** Hiring touches employment law.
- **No interview architecture without an ICP.** Halt and route to `/hire-icp` if missing.
- **Behavioral anchors at 1, 3, and 5 for every rubric dimension.** Non-negotiable.
- **Cognitive ability or work sample is required for senior / cognitively-loaded roles.** Per Schmidt & Hunter validity bundle.
- **Personality assessments are not allowed as primary signal.** Tertiary only, flagged as such.
- **Unstructured slots are not allowed.** Replace with structured behavioral or remove.
- **Decision-fatigue mitigations in the schedule.** Max 4 panels/day; no post-lunch decision panels; front-load high-stakes.
- **Compose with Genius Profile.** Interviewer briefs in the practitioner's voice when available.
- **All question stems reviewed by counsel before the loop runs.** Surface this in compliance review section.
- **One hand-off at close.** `/hire-calibrate`.

— Hiring Intelligence — part of the People Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: 2026-04-24
---
