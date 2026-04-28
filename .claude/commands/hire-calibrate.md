---
name: hire-calibrate
description: Run the pre-loop calibration session — 60 minutes with ≥3 raters, review the rubric, score 2 anchor candidates the team has previously seen, surface inter-rater drift, agree on hire-bar examples. The calibration session itself is the deliverable. Without it, the loop runs on uncalibrated rulers. Per Project Oxygen — cross-rater alignment beats rater quality. Not legal advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: role-slug (required, ICP and interview architecture must exist) + --rater-count <3|4|5|6+> + optional context paragraph on team's prior calibration history
---

# /hire-calibrate

This is part of the People Intelligence reference vertical. Composes with Genius Profile + Vision/Brand for company-as-candidate framing.

Load `SIP.md`, `VOICES.md`, `agents/starlight-hiring.md`, `skills/people-intelligence/structured-hiring.md`, the existing ICP (`people-intelligence/hiring/icp-<role-slug>-*.md`) and interview architecture (`people-intelligence/hiring/interview-<role-slug>-*.md`). Produce a **Calibration Session Script** — a facilitator-ready 60-minute agenda. Hand off to running the actual loop.

## Disclaimer (non-waivable)

**Hiring decisions touch employment law and protected-class considerations. This is system architecture, not legal advice. The calibration session itself does not surface legal questions; question stems must already have been reviewed by counsel before this session runs.**

This command produces the script. The facilitator runs the live session. The team enters the loop calibrated, not running on instinct.

## Input
$ARGUMENTS

## Flags

- `--rater-count <3|4|5|6+>` — number of raters in the calibration session. Minimum 3 (per Project Oxygen, cross-rater alignment requires ≥3 reference points). 4-5 is the sweet spot. 6+ creates discussion drag.

## Process

1. **Disclaim.** Open with the non-waivable disclaimer.

2. **Locate.** Confirm role-slug. Read the ICP and interview architecture. If either is missing, halt and route to upstream command.

3. **Identify anchor candidates.** Two candidates the rater team has previously interviewed for similar roles — one retrospective hire-yes (worked out), one retrospective hire-no (or worked out poorly). The calibration session scores these against the new rubric. Their actual outcomes are the calibration anchor.

4. **Build the 60-minute agenda.**
   - **0:00 - 0:05 (5 min) — Frame the session.** Why calibration matters. Project Oxygen finding: cross-rater alignment beats rater quality. Decision: this team will not run an uncalibrated loop.
   - **0:05 - 0:20 (15 min) — Rubric walk-through.** Each rater paraphrases what 1, 3, and 5 mean for each dimension. Surface mismatched paraphrases. Agree on language.
   - **0:20 - 0:40 (20 min) — Anchor candidate scoring.** Each rater independently scores the two anchor candidates against the new rubric (8 min independent). Then surface scores in plenary (12 min). Where did raters disagree by ≥2 points on any dimension? Discuss those specifically.
   - **0:40 - 0:55 (15 min) — Hire-bar agreement.** What does a 3-on-this-dimension look like in our actual team? What does a 5-on-this-dimension look like? Agree on examples for each load-bearing dimension.
   - **0:55 - 1:00 (5 min) — Question stem commitment.** Each rater commits to using the agreed first-question stems verbatim. This kills divergent question framing across raters.

5. **Surface bias-pattern primer.** Before the loop runs, name the bias patterns the facilitator will flag in the debrief: halo, similarity-attraction, first-impression, recency, contrast effect, confirmation bias. Raters do not have to self-diagnose; the facilitator names patterns out loud.

6. **Decision-rule pre-commitment.** Pre-commit:
   - Hire-or-no-hire decision rule (median score ≥4 on ≥75% of dimensions, ≥3 on all dimensions, or whatever this team agrees to)
   - Tie-breaks default to hire-no
   - Inter-rater dispersion ≥2 points on a load-bearing dimension triggers re-interview, not vibes-resolution

7. **Save.** Write `people-intelligence/hiring/calibration-<role-slug>-<YYYY-MM-DD>.md`.

8. **Hand off.** Run the loop. After the loop, run `/hire-debrief <candidate>`.

## Output format

```markdown
# Calibration Session Script — <Role Title> — <YYYY-MM-DD>

> **Hiring decisions touch employment law and protected-class considerations. Question stems must already have been reviewed by qualified counsel before this session runs.**

## Context

- **Role:** <title>
- **ICP file:** `people-intelligence/hiring/icp-<role-slug>-<date>.md`
- **Interview architecture file:** `people-intelligence/hiring/interview-<role-slug>-<date>.md`
- **Rater count:** <3 | 4 | 5 | 6+>
- **Facilitator:** <name — typically the hiring manager or an HR partner>
- **Anchor candidates selected:** <yes — names redacted in this artifact / no — flagged>

## Why this session

Per Project Oxygen and the multi-rater research literature: cross-rater alignment matters more than individual rater quality. A team with mediocre raters but tight calibration produces better hire signal than a team with star raters running on individual instinct. We are not running this loop until we are calibrated.

## 60-minute agenda

### 0:00 - 0:05 — Frame the session (5 min)

**Facilitator opens:**

> "We are not running an uncalibrated loop. Calibration is the difference between a rubric and a vibe scale wearing numbers. The next 55 minutes are the highest-leverage 55 minutes of this entire hire — they prevent the drift that produces miss-hires. We will:
> 1. Walk the rubric and surface where we paraphrase it differently.
> 2. Score two candidates we've all seen against the new rubric.
> 3. Discuss where we disagree.
> 4. Pre-commit to question stems and the decision rule.
>
> Three rules: structured scores before discussion always. Tie-breaks default to hire-no. The facilitator names bias patterns in real time so no one has to self-diagnose."

### 0:05 - 0:20 — Rubric walk-through (15 min)

For each load-bearing dimension in the rubric:

1. **Read the dimension aloud.**
2. **Each rater (in order) paraphrases what a 5 looks like, what a 3 looks like, what a 1 looks like.** ~30 seconds per rater.
3. **Surface mismatched paraphrases.** Where did Rater A's "5" sound different from Rater B's "5"?
4. **Agree on language.** The agreed language goes into the calibration record.

Dimensions to walk (drawn from interview architecture):

- **<Dimension 1 name>** — agreed paraphrase: <fill in during session>
- **<Dimension 2 name>** — agreed paraphrase: <fill in during session>
- **<Dimension 3 name>** — agreed paraphrase: <fill in during session>
- **<Dimension 4 name>** — agreed paraphrase: <fill in during session>
- **<Dimension 5 name>** — agreed paraphrase: <fill in during session>

(Continue for all load-bearing dimensions — typically 5-7.)

### 0:20 - 0:40 — Anchor candidate scoring (20 min)

**0:20 - 0:28 (8 min, independent):** Each rater independently scores Anchor Candidate 1 and Anchor Candidate 2 against the new rubric. Silent. No discussion. Scores written before discussion.

**Anchor Candidate 1: <e.g., "the senior engineer we hired in 2025 who became indispensable">**

(Each rater fills in independently:)

| Dimension | Rater A | Rater B | Rater C | Rater D |
|-----------|---------|---------|---------|---------|
| <Dim 1>   | _ | _ | _ | _ |
| <Dim 2>   | _ | _ | _ | _ |
| <Dim 3>   | _ | _ | _ | _ |
| <Dim 4>   | _ | _ | _ | _ |
| <Dim 5>   | _ | _ | _ | _ |

**Anchor Candidate 2: <e.g., "the senior engineer we hired in 2024 who left at month 7">**

| Dimension | Rater A | Rater B | Rater C | Rater D |
|-----------|---------|---------|---------|---------|
| <Dim 1>   | _ | _ | _ | _ |
| <Dim 2>   | _ | _ | _ | _ |
| <Dim 3>   | _ | _ | _ | _ |
| <Dim 4>   | _ | _ | _ | _ |
| <Dim 5>   | _ | _ | _ | _ |

**0:28 - 0:40 (12 min, plenary):** Surface scores. Where did raters disagree by ≥2 points on any dimension? Discuss those specifically. Anchor every claim to the rubric, not to memory ("I scored Anchor 1 a 4 on Dim 2 because [behavior I observed]" — not "I felt strong on Dim 2 with that one").

**Drift surfaced:** <fill in during session — list the dimensions where ≥2-point disagreement appeared>

### 0:40 - 0:55 — Hire-bar agreement (15 min)

For each load-bearing dimension, agree on:

- **What does a 3 look like in our actual team?** (The bar — the level we hire.)
- **What does a 5 look like in our actual team?** (Strong hire signal.)
- **What does a 1 look like?** (Strong no-hire signal — pattern we've seen before.)

| Dimension | "3" anchor (the bar) | "5" anchor (strong hire) | "1" anchor (strong no-hire) |
|-----------|----------------------|---------------------------|-----------------------------|
| <Dim 1>   | <agreed>            | <agreed>                  | <agreed>                    |
| <Dim 2>   | <agreed>            | <agreed>                  | <agreed>                    |
| <Dim 3>   | <agreed>            | <agreed>                  | <agreed>                    |
| <Dim 4>   | <agreed>            | <agreed>                  | <agreed>                    |
| <Dim 5>   | <agreed>            | <agreed>                  | <agreed>                    |

### 0:55 - 1:00 — Question stem commitment (5 min)

Each rater commits to using these question stems verbatim for the FIRST question of each dimension. (Subsequent probes can flex; the opening anchors the conversation.)

| Dimension | Committed first-question stem |
|-----------|-------------------------------|
| <Dim 1>   | "<from interview architecture>" |
| <Dim 2>   | "<from interview architecture>" |
| <Dim 3>   | "<from interview architecture>" |
| <Dim 4>   | "<from interview architecture>" |
| <Dim 5>   | "<from interview architecture>" |

## Bias-pattern primer (facilitator script for the debrief)

The facilitator will name these patterns out loud during the debrief — raters do not have to self-diagnose:

- **Halo:** "Just flagging — this candidate's strong technical answer may be inflating non-technical scores. Let's anchor each dimension independently."
- **Similarity-attraction:** "This candidate has a similar background to several of us. Naming it. Which dimension is actually driving the score, vs. the familiarity?"
- **First-impression:** "If anyone's score on Dim 1 is driving their score on Dim 5, let's separate."
- **Recency:** "We saw this candidate yesterday and the previous candidate three days ago. Let's anchor each to the rubric, not to each other."
- **Contrast effect:** "Strong candidate just before this one. Their score doesn't change this candidate's score. Anchor to rubric."
- **Confirmation bias:** "First-impression drove question selection. Let's review whether the questions actually surfaced what we needed, vs. confirming what we already thought."

## Decision-rule pre-commitment

- **Hire rule:** Median score across raters ≥4 on ≥75% of dimensions AND ≥3 on every dimension.
- **No-hire rule:** Anything below the hire rule is no-hire.
- **Tie-breaks default to hire-no.** False negatives cost less than false positives.
- **Inter-rater dispersion ≥2 points on a load-bearing dimension** triggers a re-interview for that specific dimension, not a vibes-resolution in the room.
- **All raters submit structured scores BEFORE debrief discussion.** Non-negotiable. Discussion-first contaminates scoring.

## Load-bearing next move

**Run the loop.** Then `/hire-debrief <candidate>` after each candidate's loop completes.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.**
- **Minimum 3 raters in the calibration session.** Fewer than 3 cannot triangulate; the calibration is theater.
- **Anchor candidates must be people the rater team has actually seen.** Fictional anchors do not produce calibration; they produce abstraction.
- **Structured scores before discussion in the calibration itself.** The calibration models the debrief discipline.
- **The calibration session itself is the deliverable.** Without it, the loop runs uncalibrated. Refuse to advance to the loop without confirmation that the session ran.
- **Compose with Genius Profile.** Facilitator script in the practitioner's voice when available.
- **One hand-off at close.** Run the loop. Then `/hire-debrief`.

— Hiring Intelligence — part of the People Intelligence reference vertical —

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — Hiring sub-system)
- Generated: 2026-04-24
---
