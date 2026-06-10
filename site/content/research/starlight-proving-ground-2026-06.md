# The Starlight Proving Ground

> Built on SIP — Starlight Intelligence Protocol.
> Status: **living artifact** (v0.1). Board verdict 2026-06-10: PROCEED-WITH-REVISE.
> Public mirror: the `starlight-evals` repo. This page is the source-of-truth surface.

Most AI shops publish a model benchmark. Almost none publish a **whole-system** eval —
their memory recall, their harness integrity, their dataset provenance — with the
weaknesses named and dated. The Starlight Proving Ground does. It is the standing
discipline that measures the entire Starlight Intelligence System across seven lanes,
run by evaluator agents that hold the Luminor kernel mindset — Precision, Wisdom,
Transcendence — and renders its verdict through the Starlight Board. It exists because
a system you can't measure is a system you're only hoping works, and because the
patterns that separate a real intelligence substrate from a demo are only visible when
you put numbers next to them and refuse to round up.

## Why a "Proving Ground" and not an "arena"

An arena ranks models — that lane exists and stays separate: the [Starlight Model Arena](/research/model-arena) runs head-to-head model rounds with its own receipts. The Proving Ground evaluates the *system the models run inside*:
the memory tiers, the retrieval path, the trust-contract harness, the substrate
symmetry, the datasets themselves. The model arena is one lane of seven.

## The seven lanes

| Lane | Measures | Composes |
|---|---|---|
| Model | capability + instruction compliance + behavioral safety | the model arena (R1 + R2) |
| Memory | recall@k, precision@10, latency | the memory bencher |
| Retrieval | BM25/FTS5 ranking quality | the retrieval eval |
| Harness | trust-contract + privacy + provenance (7 risk dims) | v01-evals |
| Substrate | symmetry invariants (docs↔code, registry coverage) | the v-series symmetry suite |
| Datasets | provenance + labeling honesty (no synthetic benchmarks) | dataset audit |
| System | the unifying scorecard + Overseer synthesis | the Proving Ground itself |

## First run — 2026-06-10 (v0.1)

Six lanes measured live. System verdict: **PROCEED-WITH-REVISE.**

| Lane | Verdict | Headline number | Named weakness |
|---|---|---|---|
| Model | PROCEED | parity + Fable 3/Opus 2 on stress | no cross-family judge; no agentic task yet |
| Memory | REVISE | **precision@10 = 0.20** | the system's weakest number; no cross-session recall |
| Retrieval | PROCEED | recall@5 = 100% (n=10) | ceiling unearned on a 10-query set |
| Harness | PROCEED | 34 pass / 0 fail / 7 todo | 7 unmeasured risk dimensions |
| Substrate | PROCEED | green **after catching a real orphan** | symmetry suite is load-bearing — never skip it |
| Datasets | PROCEED | 0 synthetic benchmarks | token-overlap ground truth is soft |

**The honest headline:** on its very first run, the substrate lane caught *this
release's own new agent* (`starlight-evaluator`) sitting unregistered in the agent
registry — flagged it, we fixed it same-run, re-ran green. The system policed its own
author. That's the whole point: a Proving Ground that can't catch its own builder is
theater.

**The load-bearing weakness** is memory: `precision@10 = 0.20`. A persistent-context
layer that surfaces the right memory one time in five is the exact gap between the
claim and the aspiration. It's published here, weakest-number-first, because a
leaderboard you can't audit is just marketing with decimals.

## What gets tested next (the falsifiers)

1. Fire real embeddings (PARKED-007) and re-measure memory precision@10 — the
   falsifier for the entire memory-substrate thesis.
2. Add a cross-family judge (GPT-5 via OpenRouter) and re-run the model stress card —
   removes the only standing bias caveat.
3. Author a cross-session recall eval — the memory gap no current lane covers.

## Anti-Goodhart

These numbers describe the system. They are not targets. The moment a metric becomes
something to optimize *to*, it stops measuring and we retire it. Read the scorecard to
understand the system's real shape — then go build your own, and measure it honestly.

## Reproduce / fork

The discipline is a usage pattern plus a scorecard contract, not a black box. Spec,
lane registry, evaluator disposition, and every scorecard live in the repo under
`tools/proving-ground/`. The public mirror (`starlight-evals`) packages it to fork.

---

Built on SIP — Starlight Intelligence Protocol.
