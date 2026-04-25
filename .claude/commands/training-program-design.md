---
name: training-program-design
description: Full program architecture for a multi-week or multi-month training program. Wraps a Curriculum Design with cadence (synchronous + asynchronous + on-job), trainer brief, learner journey, manager-engagement plan (mandatory — without manager reinforcement, transfer evaporates), measurement plan, and ROI projection. Refuses programs without manager engagement.
allowed-tools: Read, Write, Grep, Glob
argument-hint: program slug (required, from /training-curriculum) + --cohort-size <N> + --budget <amount> + --start-date <YYYY-MM-DD> + optional context paragraph
---

# /training-program-design

Load `agents/starlight-training.md`, `skills/hr-intelligence/learning-architecture.md`, and the Curriculum Design at `hr-intelligence/training/<program-slug>/curriculum-<program-slug>-*.md`. If no curriculum exists for this program, halt and route to `/training-curriculum`. Produce a **Program Design** wrapping curriculum into deliverable.

## Input
$ARGUMENTS

## Flags

- `--cohort-size <N>` — required. Affects facilitator load, modality mix, and scenario debrief logistics.
- `--budget <amount>` — optional but recommended. Drives modality mix (synchronous-heavy = higher cost; asynchronous-heavy = lower cost but lower transfer unless paired with cohort touchpoints).
- `--start-date <YYYY-MM-DD>` — required. Anchors the spaced-retrieval schedule and measurement cadence.
- `--facilitator-type <internal-SME | external-vendor | hybrid>` — required. Affects whether `/training-coach-trainer` must precede launch.

## Process

1. **Load curriculum.** Read the latest `curriculum-<program-slug>-*.md`. Verify L3 + L4 anchors, spaced-retrieval schedule, cognitive-load map. If missing, halt and route to `/training-curriculum`.

2. **Cadence design.** Convert the module sequence into a cadence calendar. Mix:
   - **Synchronous (cohort-based):** kickoff, simulation/role-play sessions, debriefs, R3 cohort retrieval. Highest transfer, highest cost.
   - **Asynchronous (self-paced):** concept introduction, light reading, R1 micro-prompts. Lowest cost, lowest transfer unless paired.
   - **On-job:** application assignments between modules; manager observation; R4 behavior observation. Required.

3. **Trainer brief.** Produce a brief the facilitator can deliver from. Includes voice/tone, key talking points per module, common learner failure modes, scenario answer keys, debrief discussion prompts. If `--facilitator-type internal-SME`, halt and require `/training-coach-trainer` before delivery.

4. **Learner journey.** Map the learner's experience week-by-week from kickoff to 90-day post: what they receive, what they do, what they're observed on, what they get back as feedback.

5. **Manager engagement plan.** Mandatory. Without manager reinforcement, transfer evaporates. Includes:
   - **Pre-program brief** for managers (1 page) — what their direct reports will learn, what they should expect to observe, what behavior to reinforce.
   - **In-program checkpoints** — manager-as-observer at one or two simulation sessions; weekly check-in prompt with their direct report.
   - **Post-program reinforcement protocol** — specific behaviors managers observe at 30/60/90 days against the L3 rubric; how they coach when behavior slips.

6. **Measurement plan summary.** L3 cadence (30/60/90), L4 cadence (90+), rubric, sampling. Detailed plan lives in `/training-measure-transfer`; here, summarize and link.

7. **ROI projection.** Honest unit-economics view. Total program cost (facilitator, learner-time, opportunity cost, manager-time) against L4 metric improvement (target value × business value of improvement). Acknowledge confounders. Refuse to fabricate ROI multipliers; project the metric, not a multiplier.

8. **Save.** Write `hr-intelligence/training/<program-slug>/program-design-<program-slug>-<YYYY-MM-DD>.md`.

9. **Hand off.** Default depends on `--facilitator-type`:
   - `internal-SME` → `/training-coach-trainer <program-slug>` (mandatory before launch)
   - `external-vendor` → `/training-measure-transfer <program-slug>` (build the measurement plan before launch)
   - `hybrid` → `/training-coach-trainer <program-slug>` for the SME side first

## Output format

```markdown
# Program Design — <Program Name> — <YYYY-MM-DD>

> *Curriculum is the spine. Program design is the body around the spine — cadence, trainer, manager engagement, measurement, ROI.*

## Program anchor

- **Curriculum:** `hr-intelligence/training/<slug>/curriculum-<slug>-<date>.md`
- **L3 behavior:** <pulled from curriculum>
- **L4 outcome:** <pulled from curriculum>
- **Audience:** <pulled from curriculum>
- **Cohort size:** <N>
- **Start date:** <YYYY-MM-DD>
- **End date (program close, before R4):** <YYYY-MM-DD>
- **R4 measurement window close:** <YYYY-MM-DD + 90 days>
- **Facilitator type:** <internal-SME | external-vendor | hybrid>
- **Budget:** <amount or "TBD">

## Cadence calendar

| Week | Synchronous events | Asynchronous load | On-job assignment | Retrieval checkpoint | Manager touchpoint |
|------|---------------------|--------------------|--------------------|----------------------|---------------------|
| W0 (pre) | Manager kickoff brief (30 min) | — | — | — | Pre-program brief |
| W1 | Cohort kickoff (90 min) | M1 concept (45 min self-paced) | M1 application (30 min) | R1 day-1 prompt | Manager observes 1 cycle |
| W2 | M1 simulation + debrief (90 min) | M2 concept (45 min) | M2 application | R1 day-1, R2 week-1 | Weekly check-in |
| ... | ... | ... | ... | ... | ... |

## Trainer brief

**Voice & tone:** <derived from facilitator-as-coach posture; specific to program>

**Per-module talking points:**
- M1: <key points + frame + common misconceptions>
- M2: ...

**Common learner failure modes:**
- <failure mode 1> — facilitator response: <coaching move>
- <failure mode 2> — ...

**Scenario answer keys:** see scenario library at `hr-intelligence/training/<slug>/scenarios-<slug>.md`

**Debrief discussion prompts:**
- After M1 simulation: "What did you notice about your pattern? What surprised you?"
- After M2 simulation: ...

## Learner journey

Week-by-week from learner POV:

**W0:** Receives welcome email + pre-work concept primer (15 min). Manager has briefed them on what to expect.
**W1:** Cohort kickoff — meets cohort, gets context, completes M1 self-paced load.
...
**W12 (R3 month-1 post-program):** Receives mini-simulation prompt; participates in 30-min cohort retrieval session.
**W24 (R4 month-3 post-program):** Manager observes specific behavior against L3 rubric; learner gets feedback.

## Manager engagement plan (mandatory)

Without manager reinforcement, transfer evaporates. This is not optional.

### Pre-program manager brief (1 page)
- What your direct reports will learn
- What behavior change you should expect to see at 30/60/90 days
- What to reinforce when you see it (specific phrasing examples)
- What to coach when it slips (specific phrasing examples)

### In-program checkpoints
- Manager observes one simulation session (W3 or W5)
- Weekly 5-min "what are you trying from training" check-in with each direct report

### Post-program reinforcement protocol
- 30-day: Manager runs first L3 observation against rubric. Coaches.
- 60-day: Second observation. Track delta from 30-day.
- 90-day: Final L3 observation. Inputs to L4 measurement.

## Measurement plan summary

- **L1 (reaction):** post-cohort survey, week 4. Tracked but not load-bearing.
- **L2 (learning):** per-module rubric scores. Captured in LMS.
- **L3 (behavior):** manager observation at 30/60/90 against rubric. Detailed in `/training-measure-transfer`.
- **L4 (results):** business metric review at T+90. Detailed in `/training-measure-transfer`.

Full plan: `/training-measure-transfer <program-slug>` — run before launch.

## ROI projection (honest)

### Costs
- Facilitator: <amount>
- Learner time: <N learners × N hours × loaded cost>
- Manager time: <N managers × N hours × loaded cost>
- Tooling/LMS: <amount>
- **Total program cost:** <sum>

### Projected L4 metric move
- Baseline: <metric value at T-0>
- Target: <metric value at T+90, with confidence interval>
- Business value of the move: <if X moves by Y, that translates to Z>
- **Confounders acknowledged:** <list — other things changing in the same window>

### Honest claim
"This program is designed to move <L4 metric> from <baseline> toward <target> at T+90, with manager reinforcement as the load-bearing mechanism. Confounders include <list>. We will not over-claim causation; we will report L3 transfer + L4 metric move + qualitative evidence as the strongest claim available."

We do not project an ROI multiplier. ROI multipliers in L&D are mostly invented.

## Compliance flag (if applicable)

<pulled from curriculum; if compliance-mandated component is bundled, list separately>

## Load-bearing next move

Default depends on `--facilitator-type`:

- **`internal-SME`** → `/training-coach-trainer <program-slug>` — TtT before launch is mandatory.
- **`external-vendor`** → `/training-measure-transfer <program-slug>` — measurement plan before launch.
- **`hybrid`** → `/training-coach-trainer <program-slug>` for SME side first.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3 — Training Intelligence)
- Generated: <ISO date>
---
```

## Rules

- **Curriculum prerequisite.** No curriculum → halt → route to `/training-curriculum`.
- **Manager engagement plan is mandatory.** A program without it is refused. Transfer literature is brutal on this point.
- **Internal-SME facilitator triggers TtT.** No SME deployment without `/training-coach-trainer` complete.
- **Honest ROI only.** No fabricated multipliers. Project the metric move; acknowledge confounders.
- **Compliance flag pulled from curriculum.** If compliance content is bundled, manage it as a separate category.
- **One hand-off at close.** Choice driven by facilitator type.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3)
- Generated: 2026-04-24
---
