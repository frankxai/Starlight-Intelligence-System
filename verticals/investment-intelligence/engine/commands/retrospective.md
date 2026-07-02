# /iis-retrospective

Close a thesis 90+ days after action. Score the call. Distill the lesson. Update agent calibration.

## Usage

```
/iis-retrospective <thesis_id>

Example:
/iis-retrospective morpho-yield-rotation-2026-W18
```

## What this command does

```
1. READ original session that opened the thesis
2. READ original portfolio_snapshot_ref + macro context at thesis open
3. READ current portfolio + macro context (for delta)
4. COMPUTE realized outcome:
   - Asset performance over the period
   - Realized yield (if yield-driven thesis)
   - Tax outcome (if tax-driven thesis)
   - Risk realized (drawdown, smart contract event, etc.)
5. SCORE thesis_held_up: confirmed | partially_confirmed | refuted
6. SCORE per-agent call quality: right | partially_right | right_for_wrong_reason | wrong | n/a
7. SCORE human verdict quality: good_call | mixed | poor_call (with rationale)
8. DISTILL primary_lesson (1-3 sentences max)
9. WRITE retrospectives/<thesis_id>.outcome.md (separate from session — append-only event)
10. WRITE trajectories/<thesis_id>.json (ReasoningBank-shaped)
11. UPDATE theses/index.yaml: status:closed + outcome_recorded + thesis_held_up
12. UPDATE agents/catalog.json: increment per-agent calibration counters
```

## Why retrospectives matter

The substrate's compounding value is the **learning loop**:

```
thesis → action → outcome (90 days) → lesson → next thesis's prior
```

Without retrospectives, the substrate is sophisticated theater. With them, your future weekly sessions have access to **your own past calibration data** — which agents to trust more, which biases recur in your verdicts, which input states correlate with bad outcomes.

After 30+ retrospectives, the chief-of-staff agent surfaces relevant past lessons during weekly sessions: "Last time you faced F&G > 75 and approved a rotation, the rotation underperformed by 3% — consider tighter sizing."

## Cadence

- **Mandatory:** Run within 1 week of `outcome_due` date in the thesis index
- **Recommended:** Batch retrospectives quarterly during Loop 4 review
- **Skip not allowed:** A skipped retrospective breaks the calibration; chief-of-staff will flag the gap on the next weekly session

## Output

Writes:
- `retrospectives/<thesis_id>.outcome.md` (human-readable retrospective)
- `trajectories/<thesis_id>.json` (machine-readable, schema in `trajectory.schema.json`)
- Updated `theses/index.yaml`
- Updated `agents/catalog.json` (calibration counters)

## Scoring honestly

The most important discipline: **score honestly, not flatteringly.**

- A "right_for_wrong_reason" call is a worse signal than a "wrong" call — the agent got lucky, and that pattern will fail when luck runs out.
- A "poor_call" verdict by you is the most valuable retrospective output — that's where you grow.

If you find yourself rationalizing retrospectives to make outcomes look better, you're losing the substrate's value. The point is unflattering truth.

## Example output

```
retrospectives/morpho-yield-rotation-2026-W18.outcome.md

Thesis: Rotate €25K into Morpho USDC at 5.8% APY
Opened: 2026-05-04
Closed: 2026-08-04 (90 days)
Held: 90 days

Realized:
  - Average APY: 4.2% (vs 5.8% expected)
  - Total yield: €262 (vs €362 expected)
  - No smart contract incident
  - Withdrawal completed within 4 hours

thesis_held_up: partially_confirmed
  Rationale: position generated yield safely but APY decayed faster than expected.
  Decay was visible in the 14-day rolling average by week 6 — the substrate's
  defi-yield agent didn't surface this as a flag.

Per-agent scoring:
  defi-yield: partially_right (high confidence on entry, missed APY decay signal)
  risk-manager: right (3% sizing was correct)
  tax-optimizer: n/a
  macro-risk: right (cash buffer at target was correct)

Lesson:
  Yield decay > 20% over 30 days should have been a defi-yield agent flag.
  Add to agents/personas/defi-yield.md: "monitor 14-day rolling APY trend; flag
  if decline > 15% from entry yield."

Calibration update:
  defi-yield: total scored 47 → 48 (right: 18, partially_right: 22, wrong: 3, rfwr: 5)
  Rolling hit rate (high confidence): 71%
```

## See also

- `architecture/05-memory-architecture.md` — full learning-loop spec
- `schemas/trajectory.schema.json` — trajectory structure
- `/weekly-strategy` — runs sessions that produce theses to retrospective
