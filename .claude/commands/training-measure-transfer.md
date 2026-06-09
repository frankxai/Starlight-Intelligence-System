---
name: training-measure-transfer
description: Kirkpatrick L3 (behavior) + L4 (results) measurement plan for a training program. Behavior observation protocol with sampling cadence, business-metric tracking, post-program reinforcement plan, redesign feedback loop. Refuses L1-only smile-sheet evaluation; refuses programs without baseline.
allowed-tools: Read, Write, Grep, Glob
argument-hint: program slug (required) + --post-window <30|60|90|180> + optional context paragraph
---

# /training-measure-transfer

Load `agents/starlight-training.md`, `skills/people-intelligence/learning-architecture.md`, the Curriculum Design, and the Program Design. Produce the **Transfer Measurement Plan** — the load-bearing artifact that determines whether the program can prove transfer.

## Input
$ARGUMENTS

## Flags

- `--post-window <30|60|90|180>` — required. The L3 measurement window closes at this point post-program-end. Default 90.
- `--baseline-method <observation|scenario-test|peer-rating|metric-snapshot|hybrid>` — required. The pre-program baseline mechanism. Without baseline, transfer cannot be claimed.

## Process

1. **Verify baseline exists.** If no baseline measurement was captured *before* program delivery, halt. The program cannot prove transfer. Options: (a) defer launch and capture baseline now; (b) launch with explicit caveat that no transfer claim will be made; (c) refuse.

2. **Refuse L1-only.** If the requester's measurement plan is "we'll send a survey at the end," refuse the framing. Smile-sheets are noise; they are not evaluation. Insist on L3 minimum.

3. **L3 design.** Behavior observation protocol:
   - **Rubric:** the L3 rubric from the Curriculum Design — observable behavioral indicators per L3 sub-behavior.
   - **Sampling:** who observes (manager + peer + sometimes self with behavioral examples), how often (30/60/90 minimum), how many instances per learner per checkpoint.
   - **Triangulation:** at least two observation sources per learner per checkpoint. Manager-only is biased; manager + peer is stronger; manager + peer + self-with-examples is strongest.
   - **Inter-rater reliability check:** for high-stakes programs, calibrate observers on the rubric before the first measurement window.

4. **L4 design.** Business-metric tracking:
   - **Metric source:** where the metric lives (engagement survey, retention dashboard, NPS pipeline, quality KPI system, etc.).
   - **Baseline value:** captured at T-0.
   - **Target value:** projected at T+post-window.
   - **Confounders:** explicit list — other initiatives, market factors, seasonality, org changes — that could move the metric independently of training. Acknowledge; do not over-claim causation.
   - **Comparison group (if feasible):** ideal but rarely available; if available, structure pre/post + comparison-group analysis.

5. **Post-program reinforcement plan.** Without reinforcement, transfer evaporates between checkpoints. Plan:
   - Manager observation cycles + coaching conversations at 30/60/90.
   - Peer cohort retrieval session at R3 (1 month post-program).
   - Refresher prompts at R4 (3 months) — light scenario or self-reflection.
   - Manager-of-managers visibility — the L3 transfer rate is reported up so reinforcement is institutionally noticed.

6. **Redesign feedback loop.** After the first cohort completes the L3+L4 cycle:
   - What transferred (which behaviors showed up at 90 days)?
   - What evaporated (which behaviors didn't survive past R3)?
   - What got reinforced (which managers reinforced effectively, which didn't)?
   - What was forgotten (which content is missing from R3/R4 that should have been there)?
   - Curriculum + Program redesign for cohort 2.

7. **Save.** Write `people-intelligence/training/<program-slug>/transfer-plan-<program-slug>-<YYYY-MM-DD>.md`.

8. **Hand off.** Default: launch the program (no further design needed). Exceptions:
   - If TtT incomplete and SME is delivering → `/training-coach-trainer <program-slug>`
   - If scenario library is incomplete → `/training-scenarios <skill-domain>`

## Output format

```markdown
# Transfer Measurement Plan — <Program Name> — <YYYY-MM-DD>

> *Most "training ROI" claims fail because L3 was never measured. L3 (behavior at 30/60/90) is the load-bearing layer. Smile-sheets are noise.*

## Anchor

- **Program:** `people-intelligence/training/<slug>/program-design-<slug>-<date>.md`
- **L3 behavior:** <pulled from curriculum>
- **L4 outcome:** <pulled from curriculum>
- **Post-window:** <30|60|90|180> days
- **Baseline method:** <observation|scenario-test|peer-rating|metric-snapshot|hybrid>
- **Cohort size:** <N>

## Baseline (T-0)

- **L3 baseline measurement:** <method, who measures, when, what's captured>
- **L4 baseline metric value:** <metric + value + measurement date>
- **Baseline status:** <captured | not yet captured | refused>

If baseline is not captured, the program cannot prove transfer. Either defer launch or proceed with explicit "no transfer claim" caveat.

## L3 measurement design (behavior — load-bearing)

### Rubric
| L3 sub-behavior | Observable indicator | Scoring (1-5) |
|-----------------|----------------------|---------------|
| <sub-behavior 1> | <specific observable> | 1=never observed, 5=consistently observed |
| ... | ... | ... |

### Sampling
- **Observers per learner per checkpoint:** ≥2 (manager + peer minimum)
- **Sampling cadence:** 30, 60, 90 days post-program
- **Instances per learner per checkpoint:** ≥3 observations per sub-behavior
- **Inter-rater reliability calibration:** <yes/no — calibration session before first window>

### Triangulation
- **Manager observation:** primary
- **Peer observation:** triangulation
- **Self-report with behavioral examples:** triangulation; flag the bias

### Reporting
- L3 transfer rate: % of cohort exhibiting target behavior at criterion at 90 days.
- Manager reinforcement rate: % of managers completing all three observation cycles.

## L4 measurement design (results)

- **Metric:** <name>
- **Source:** <where the metric lives>
- **Baseline value (T-0):** <value + date>
- **Target value (T+<post-window>):** <value + confidence interval>
- **Comparison group (if available):** <yes — describe; or no — flag>
- **Confounders explicitly acknowledged:**
  - <confounder 1: e.g., new product launch in same window>
  - <confounder 2: e.g., seasonal effect>
  - <confounder 3: e.g., other initiative running in parallel>
- **Strongest honest claim:** "Pre/post metric move + L3 transfer rate + qualitative evidence from manager observations."

## Post-program reinforcement plan

| Window | Activity | Owner | Mechanism |
|--------|----------|-------|-----------|
| R3 (1 month post) | Cohort retrieval session | Facilitator | 30-min cohort discussion + mini-simulation |
| 30 days | Manager L3 observation cycle 1 | Manager | Rubric-based 1:1 sampling |
| 60 days | Manager L3 observation cycle 2 | Manager | Rubric-based 1:1 sampling |
| 90 days | Manager L3 observation cycle 3 + L4 metric snapshot | Manager + L&D | Rubric + metric pull |
| R4 (3 months post) | Self-reflection + light scenario | Learner | Async via LMS or email |

## Redesign feedback loop (after cohort 1 closes)

After 90-day window closes, run the retrospective:

1. **What transferred?** Which sub-behaviors showed up at criterion? Why?
2. **What evaporated?** Which sub-behaviors decayed between 30 and 90 days? Why?
3. **What got reinforced?** Which managers reinforced effectively? Pattern?
4. **What was missing?** What did learners report needing that the curriculum didn't provide?
5. **Cohort 2 redesign:** specific changes to Curriculum + Program based on (1)-(4).

This is the cycle that improves programs over time. Programs without this cycle plateau at cohort 1 quality.

## Compliance separation (if applicable)

If this program bundles compliance-mandated content (legal cover), separate the measurement:

- **Compliance component:** completion-record only. No L3 measurement (it's not a learning program; it's a legal artifact).
- **Learning component:** measured as in this plan.

If pure learning program: write "N/A — no compliance overlap."

## Refusals

This plan refuses:
- L1-only evaluation (smile-sheets only) — not evaluation.
- L2-only evaluation (quiz pass = transfer claim) — not evaluation.
- L3 measurement without baseline — cannot prove transfer.
- Self-report-only L3 — biased; require triangulation.
- Fabricated ROI multipliers — honest metric move only.

## Load-bearing next move

**Launch the program** with this measurement plan attached. The plan is the artifact reviewers will check at 90 days.

Alternative next moves (only if a gap surfaces):
- `/training-coach-trainer <program-slug>` — if SME facilitator is not yet TtT-ready
- `/training-scenarios <skill-domain>` — if scenario library is incomplete
- `/training-curriculum <program-slug>` — if curriculum gaps surface during measurement design

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (People Intelligence Domain Sub-Stack, sub-system 3 — Training Intelligence)
- Generated: <ISO date>
---
```

## Rules

- **No baseline → halt.** Either defer launch and capture baseline, or proceed with "no transfer claim" caveat.
- **L1-only refused.** Smile-sheets are not evaluation.
- **L3 requires triangulation.** ≥2 observers per learner per checkpoint.
- **Confounders acknowledged.** Honest causal claims only.
- **Redesign loop required.** Programs without it plateau.
- **Compliance separated.** Mandated-for-legal-cover is not measured as learning.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (People Intelligence Domain Sub-Stack, sub-system 3)
- Generated: 2026-04-24
---
