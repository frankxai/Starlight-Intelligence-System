# /starlight-eval

Run a **Starlight Proving Ground** pass — evaluate the whole Starlight Intelligence
System across seven lanes, render per-lane and system verdicts with the Luminor
kernel mindset, and write a scorecard receipt.

Spec: `tools/proving-ground/SPEC.md` · Lanes: `tools/proving-ground/lanes.json`
Evaluator disposition: `agents/starlight-evaluator.md`

## Usage

```
/starlight-eval              # full pass — all 7 lanes
/starlight-eval <lane>       # single lane: model | memory | retrieval | harness | substrate | datasets | system
/starlight-eval --since <tag-or-runId>   # delta against a prior scorecard
```

## What it does

1. **Load** `lanes.json`. For each requested lane, run or read its entrypoint
   (compose existing infra — do NOT re-implement measurement):
   - `model` → run an arena round (`tools/arena/`) or read the latest receipt.
   - `memory` → run `bencher.py` if corpus ≥ 50, else read last `memory/benchmarks/`.
   - `retrieval` → run `test/retrieval-eval.test.ts`.
   - `harness` → run `tools/run-v01-evals.mjs`.
   - `substrate` → run `npm run test:substrate`.
   - `datasets` → audit dataset provenance (verdict, not metric).
   - `system` → synthesize lanes 1-6.
2. **Evaluate** each lane with the Luminor kernel mindset (Precision / Wisdom /
   Transcendence). Per lane: a board verdict (PROCEED / REVISE / STOP), the metrics
   with `sourceLane` + `baseline` + `delta`, caveats, and the **named weakness** the
   passing numbers hide (Wisdom layer — required, never omit).
3. **Render** the system verdict via the Starlight Board pressure-test
   (`/starlight-board`) over the composed lane results.
4. **Write** the scorecard to `tools/proving-ground/scorecards/<runId>.json` with
   `ranAt`, `nextRunDue`, `cadence`, and the `antiGoodhart` warning (R1+R2 bindings).
5. **Attest** — embed "Built on SIP" in the scorecard. If publishing, the artifact
   is Board-gated before it reaches `/research`.

## Rules

- **Compose, never duplicate.** Every metric traces to an existing lane entrypoint.
- **Mechanically verified beats judged.** Prefer asserts/ground-truth; when a judge
  is unavoidable, use a blind non-contestant (cross-family judge preferred) and say so.
- **Name the weakness.** A lane verdict without a named weakness is incomplete — the
  Wisdom layer is the point, not the score.
- **Do not optimize to the score.** The scorecard describes the system; it is not a
  target. State this in every published artifact (anti-Goodhart, R2).
- **Staleness is visible.** `nextRunDue` past today → the public surface shows STALE.
- This command is substrate-tier: a `/starlight-eval` pass is part of board-before-tag
  for substrate releases.

## Composes with

- `/starlight-board` — renders the system verdict; this command feeds it.
- `/superintelligence` — execution mode for running the lanes; does not displace the board.
- `/sip-attest` — attests the published scorecard artifact.

---
**Built on SIP** · Starlight Proving Ground · introduced 2026-06-10
