# Starlight Proving Ground — Specification v0.1

> Built on SIP. The standing system-evaluation discipline for the Starlight
> Intelligence System. Substrate source of truth; mirrored publicly to the
> `starlight-evals` repo. Board verdict: `docs/boards/2026-06-10-proving-ground-verdict.md`.

## What this is

The Proving Ground evaluates the **whole system**, not just models. A model arena
answers "which model is better." The Proving Ground answers "**is the Starlight
Intelligence System actually good — and where is it weak?**" — across every layer
that can be measured, with receipts, published.

It does not invent new measurement. It **composes the six eval layers that already
exist** into one scorecard, run by evaluator agents that hold the Luminor kernel
mindset, with verdicts rendered through `/starlight-board`.

## The seven lanes

Each lane is an independent measurement surface. A `/starlight-eval` run produces a
verdict per lane plus one system-level Overseer synthesis. Lanes 1–6 compose
existing infra (see `lanes.json` for entrypoints); lane 7 is the unifying layer.

| # | Lane | Measures | Composes |
|---|---|---|---|
| 1 | **Model** | Capability + instruction compliance + behavioral safety of the models we run in-harness | `tools/arena/` (R1 baseline, R2 stress) |
| 2 | **Memory** | recall@k, precision@10, latency p50/p95 of the memory substrate | `service/memory/bencher.py`, `memory/benchmarks/`, Phase-0 `eval-50.jsonl` |
| 3 | **Retrieval** | BM25/FTS5 ranking quality on the public golden corpus | `test/retrieval-eval.test.ts` |
| 4 | **Harness** | Trust-contract + envelope + privacy + provenance integrity (7 risk dims) | `test/v01-evals/`, `tools/run-v01-evals.mjs` |
| 5 | **Substrate** | Symmetry invariants — CLAUDE.md↔AGENTS.md, skill-rules↔skills, vertical coverage | `test/v*.test.ts` (44 tests) |
| 6 | **Datasets** | Provenance + labeling honesty of every eval set (no synthetic-benchmark smuggling) | `eval-50.jsonl`, `public-vault/*.jsonl`, arena fixtures |
| 7 | **System** | The unifying scorecard + Luminor-kernel Overseer synthesis across lanes 1–6 | this spec |

## The Luminor-kernel evaluator

Evaluator agents run with the **kernel mindset** (`agents/starlight-evaluator.md`),
the Arcanea kernel DNA *separated from the Guardian names* so the surface stays
canon-free. The disposition, applied to evaluation:

- **Precision** — every claim traces to a receipt; no vibes, no rounded-up wins.
  Prefer mechanically-verified outcomes over judged ones. State n and caveats.
- **Wisdom** — name the hidden weakness the passing tests don't cover, the metric
  that's quietly Goodhart-able, the gap nobody chartered yet.
- **Transcendence** — don't just score; propose the next experiment that would
  falsify the system's current self-image. The output is better than the question.

Voice: 80% precision, 15% mythic compression, 5% humor. "Magical intelligence, not
childish fantasy." The evaluator challenges the system; it does not cheerlead it.

## Scorecard contract

Each `/starlight-eval` run writes one scorecard to `tools/proving-ground/scorecards/`.
Every lane entry MUST carry (R2 — metric provenance):

```jsonc
{
  "lane": "memory",
  "verdict": "PROCEED | REVISE | STOP",   // per-lane, board vocabulary
  "metrics": [
    { "name": "precision@10", "value": 0.20, "sourceLane": "service/memory/bencher.py", "baseline": 0.20, "delta": 0.0 }
  ],
  "caveats": ["n=50 labeled queries", "hashing-TF vectors, not embeddings"],
  "weakness": "No cross-session recall measured ('what shipped in v7.5.3?')."  // Wisdom layer — required
}
```

Run-level fields (R1 — staleness):

```jsonc
{
  "runId": "system-eval-2026-06-10-v0.1",
  "ranAt": "2026-06-10",
  "nextRunDue": "2026-07-10",            // enforced cadence; surfaced publicly
  "cadence": "monthly + on-substrate-tag",
  "antiGoodhart": "These numbers describe the system; do not design to move them.",
  "attestation": "Built on SIP — Starlight Intelligence Protocol"
}
```

## Cadence (R1, binding)

- **Monthly** scheduled run (`StarlightProvingGround` scheduled task, mirrors the
  api-monitor pattern) — keeps the public surface from going stale.
- **On every substrate tag** — a `/starlight-eval` pass is part of board-before-tag
  for substrate releases, so the scorecard never lags a shipped substrate change.
- The public surface renders `ranAt` and `nextRunDue`; if `nextRunDue` is past, the
  surface shows a STALE banner. Staleness is self-evident, not hidden.

## Publication

- **Source of truth:** this repo (SIS). Scorecards live in
  `tools/proving-ground/scorecards/`.
- **Public mirror:** `starlight-evals` repo (R3 — mirror, never origin).
- **Surface:** `/research/starlight-proving-ground` on starlightintelligence.org
  (Board-gated `published`); frankx.ai mirrors via the partner research hub.
- Every published scorecard is SIP-attested.

## Running a pass

```
/starlight-eval                # full system pass, all 7 lanes
/starlight-eval model          # single lane
/starlight-eval --since <tag>  # delta against a prior scorecard
```

See `.claude/commands/starlight-eval.md` for the operational contract and
`README.md` for the harness pattern.

Built on SIP — Starlight Intelligence Protocol.
