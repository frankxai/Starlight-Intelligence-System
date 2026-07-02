---
schema_version: 1.0.0
trajectory_id: morpho-yield-rotation-2026-W18
type: thesis_arc
opened: "2026-05-04"
closed: "2026-08-04"
duration_days: 90
input_state:
  macro_regime: late-cycle-risk-on
  fear_greed: 72
  btc_dominance: 54.0
  yield_curve_2_10: -0.30
  portfolio_drift: "+1% crypto, +1% equities, -1% cash"
agent_debate:
  macro-risk:
    stance: "Tighten cash buffer; recession amber"
    confidence: medium
  crypto-dca:
    stance: "Continue DCA, no rotation"
    confidence: high
  defi-yield:
    stance: "Rotate to Morpho USDC at 5.8% APY — top of opportunity set"
    confidence: high
  fundamentals:
    stance: "Equity multiples expanded; not earnings-supported"
    confidence: medium
  technical:
    stance: "Equities at upper Bollinger band; mean-reversion bias"
    confidence: low
  risk-manager:
    stance: "3% sizing within tolerance; correct constraint"
    confidence: high
    counter_to: "fundamentals (no action at this drift)"
  tax-optimizer:
    stance: "243 days to Jan 1; no tax actions urgent"
    confidence: high
  regulatory-risk:
    stance: "Exchange concentration < 30%; no flags"
    confidence: high
human_verdict: approve
modification: null
outcome:
  realized_outcome: "Position generated 4.2% APY (vs 5.8% expected). No smart contract incident. Withdrawal completed within 4 hours. Underlying USDC stable throughout."
  realized_yield_pct: 4.2
  expected_yield_pct: 5.8
  total_yield_eur: 262
  expected_yield_eur: 362
  smart_contract_incident: false
  withdrawal_friction: low
  thesis_held_up: partially_confirmed
  primary_lesson: "Morpho APY decayed 30% over 90 days. Decay was visible in 14-day rolling APY trend by week 6 — the defi-yield agent did not surface this as a flag. Add to defi-yield agent prompt: monitor 14-day rolling APY trend; flag if decline > 15% from entry yield."
verdict_quality:
  agent_call_quality:
    macro-risk: right
    crypto-dca: right
    defi-yield: partially_right
    fundamentals: n/a
    technical: n/a
    risk-manager: right
    tax-optimizer: n/a
    regulatory-risk: right
  human_verdict_quality: good_call
  rationale: "Approving the rotation was correct (yield generated safely, no incident). Modifying size from defi-yield's 5% suggestion down to risk-manager's 3% was the right discipline; saved EUR ~210 in over-exposure. The miss was process: should have set a 14-day APY-decay alert, which the substrate did not provide."
calibration_update:
  defi-yield:
    trajectories_scored_before: 47
    trajectories_scored_after: 48
    new_partially_right: 22
    rolling_hit_rate_high_confidence_before: 73
    rolling_hit_rate_high_confidence_after: 71
    note: "High-confidence calls now at 71% hit rate over 48 trajectories. Yield-decay blindness pattern recurs (3 of last 5 yield theses had > 15% APY decay; 2 surfaced no flag)."
  human_verdict:
    good_call_count_before: 41
    good_call_count_after: 42
    note: "Verdict modification (size 3% not 5%) compounds verdict-quality calibration."
substrate_improvement_proposed:
  - file: iis/agents/personas/defi-yield.md
    change: "Add explicit 14-day rolling APY trend check to system prompt. Flag if decline > 15% from entry yield."
  - file: iis/architecture/05-memory-architecture.md
    change: "Document the yield-decay-blindness lesson as a substrate-level pattern (not Marcus-specific)."
---

# Retrospective — Morpho Yield Rotation Thesis (2026-W18)

**Closed:** 2026-08-04 (90 days post-action)
**Held:** 90 days
**Operator:** marcus-archetype (fictional)

## What was approved

On 2026-05-04 (Sunday Strategy Session 2026-W18), the operator approved a thesis to rotate €25,000 (3% of portfolio) from personal cash buffer into Morpho USDC lending at 5.8% APY. Risk-manager's modification reduced suggested size from defi-yield agent's 5% to 3%. Tax-optimizer flagged no urgent actions (243 days to Jan 1).

## What happened

- Position deployed Wednesday 2026-05-07 after due diligence (TVL trend, audit history, withdrawal mechanics confirmed)
- 30-day APY: 5.6% (close to expected 5.8%)
- 60-day APY: 4.8% (decayed 14% from entry)
- 90-day APY: 4.2% (decayed 28% from entry)
- Total yield realized: €262 (vs €362 expected; 28% underperformance)
- No smart contract incident
- Withdrawal completed in 4 hours, no friction
- USDC peg held throughout (no de-pegging events)

## What the agents called

| Agent | Stance | Confidence | Outcome scoring |
|---|---|---|---|
| macro-risk | Tighten cash; recession amber | medium | **right** — recession indicators stayed amber; cash discipline was correct |
| crypto-dca | Continue DCA, no rotation | high | **right** — DCA discipline held; no panic, no chase |
| defi-yield | Rotate to Morpho 5.8% APY | high | **partially_right** — position was safe, but high-confidence APY claim was systematically wrong by 28%; agent did not surface 14d APY decay |
| risk-manager | 3% size, not 5% | high | **right** — saved approximately €210 of over-exposure |
| tax-optimizer | No urgent actions | high | **right** — no NL Box 3 actions emerged |
| regulatory-risk | Exchange concentration OK | high | **right** — no platform restrictions surfaced |

## What the operator's verdict deserved

**good_call** — Approving the rotation was correct (no incident, yield generated). Modifying size from 5% to 3% was the right discipline.

The miss was **process**: the substrate should have surfaced the 14-day rolling APY decay by week 6 (when decay was already 14%), and triggered an ad-hoc thesis-debate on whether to exit early. It did not. That's a substrate-improvement opportunity, not an operator failure.

## Primary lesson

> **Yield decay > 15% over 30 days should be a defi-yield agent flag.**

This decay pattern recurs (3 of last 5 yield theses; 2 surfaced no flag). Add to defi-yield agent system prompt:

```
Monitor 14-day rolling APY trend on any active yield position.
If APY decline > 15% from entry yield, flag in next weekly Strategy Session
under risk_flags as "yield decay alert: <protocol> <decline%>".
```

## Calibration impact

- **defi-yield agent** rolling hit rate (high confidence): 73% → 71% over 48 trajectories. Yield-decay blindness pattern is now visible enough to act on.
- **human verdict quality**: 42nd good_call out of 48 verdict-tracked retrospectives. Discipline holding.

## Substrate improvements proposed

1. `iis/agents/personas/defi-yield.md` — add 14-day APY decay check to system prompt
2. `iis/architecture/05-memory-architecture.md` — document yield-decay-blindness as a substrate-level pattern (not operator-specific)

These will be incorporated in the next substrate version.

## What I would do differently

If facing the same input state today:
- Approve the rotation (still the right call given the state)
- Set explicit exit conditions: "exit if 14d rolling APY < 4.5% sustained 2 weeks"
- Schedule mid-thesis check at day 45 (not just day 90)
- Size at 2-2.5% not 3% if substrate had surfaced the decay-pattern lesson at thesis open

## What I would NOT do differently

- The thesis itself was sound; this is a substrate-improvement story, not a thesis-rejection story
- The size modification (5% → 3%) was correct discipline regardless of outcome
- The macro context (F&G 72, late-cycle) was read correctly — risk-on persisted as predicted
- The retrospective scoring is honest: "partially_right" not "wrong" because the position was safe; the issue was expected-vs-realized yield, not capital risk

## Loop closing

This retrospective writes to:
- `iis-private/retrospectives/morpho-yield-rotation-2026-W18.outcome.md` (this file)
- `iis-private/trajectories/morpho-yield-rotation-2026-W18.json` (machine-readable)
- `iis-private/theses/index.yaml` (status: closed)
- `iis-private/agents-calibration.json` (defi-yield counters updated)
- Substrate PR proposing prompt update to `iis/agents/personas/defi-yield.md`

The corpus has one more closed thesis. The defi-yield agent has one more data point. The substrate gains one substrate-level pattern. The loop is closed.
