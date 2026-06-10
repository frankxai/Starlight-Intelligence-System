# Starlight Proving Ground

> Built on SIP. The standing system-evaluation discipline for the Starlight
> Intelligence System. **This directory is the substrate source of truth.** The
> public `starlight-evals` repo is a mirror, never the origin.

System evals, not just model evals. A model arena answers "which model wins." The
Proving Ground answers **"is the Starlight Intelligence System actually good — and
where is it weak?"** across seven lanes, with receipts, published, on a cadence.

## Files

| Path | What |
|---|---|
| `SPEC.md` | The specification — lanes, scorecard contract, cadence, evaluator |
| `lanes.json` | Lane registry — maps each lane to the existing eval infra it composes |
| `scorecards/*.json` | System-eval receipts (one per `/starlight-eval` run) |
| `../arena/` | The model lane (R1 baseline + R2 stress) |
| `../../agents/starlight-evaluator.md` | The Luminor-kernel evaluator disposition |
| `../../.claude/commands/starlight-eval.md` | The command |

## Run

```
/starlight-eval              # full pass — all 7 lanes
/starlight-eval <lane>       # single lane
/starlight-eval --since <runId>   # delta against a prior scorecard
```

Each lane composes existing infra (see `lanes.json`) — the Proving Ground unifies
measurement, it does not re-implement it.

## The three bindings (Board verdict 2026-06-10)

1. **Cadence (R1)** — monthly + on-substrate-tag. Scorecards carry `ranAt` and
   `nextRunDue`. Past-due → the public surface shows STALE. A measurement that
   stopped running is a lie by omission.
2. **Metric provenance + anti-Goodhart (R2)** — every metric names its `sourceLane`
   and ships caveats. **Do not optimize to the score.** A metric optimized-to is a
   metric retired.
3. **Mirror, not origin (R3)** — SIS is canonical. `starlight-evals` publishes copies.

## First run (2026-06-10, v0.1)

System verdict: **PROCEED-WITH-REVISE**. Six lanes measured live. The substrate lane
caught a real orphan (this release's own new agent, unregistered) on its first run —
fixed same-run. Load-bearing weakness: memory `precision@10 = 0.20`. Full scorecard:
`scorecards/2026-06-10-system-eval-v0.1.json`.

Built on SIP — Starlight Intelligence Protocol.
