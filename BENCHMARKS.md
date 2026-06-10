# Benchmarks — measured receipts

> Built on SIP. Benchmarks are claims with provenance: every number below comes from a
> measurement artifact checked into this repo, cited as `path @ commit`. Nothing here is
> estimated, projected, or rounded for marketing. Where a number is weak, it says so —
> the anti-Goodhart rule from the proving-ground scorecard applies: *these numbers
> describe the system; do not design to move them.*

---

## Retrieval quality

First measured retrieval-quality eval in SIS history (2026-05-22). Sovereign Path A
substrate (`JsonlSovereign` + hashing-TF/IDF embedding sidecar, 1024-dim), 520-atom
frozen corpus, 50 labeled queries across six vaults.

| Metric | Value | Receipt |
|---|---:|---|
| precision@10 | **20.0%** (10/50) | `phase0/eval-results-2026-05-22.md` @ `ec6365c` |
| mean rank (miss = 11) | 9.22 | same |
| p50 / p95 query latency | 3.65 ms / 29.66 ms | same |

**Caveat:** 20% is a baseline floor, not a brag — hashing-TF vectors, no transformer
embeddings, single run. The receipt itself reads "FLOOR, not a ceiling" and lists the
upgrade path. The 2026-06-10 scorecard grades this lane REVISE: "the system's single
weakest published number" (`tools/proving-ground/scorecards/2026-06-10-system-eval-v0.1.json` @ `ca64c15`).

MCP-layer keyword retrieval (BM25/FTS5, separate harness): recall@1 = recall@5 = 1.0 on
n=10 labeled queries over a 108-entry public-vault corpus (`test/retrieval-eval.test.ts`,
graded in the same scorecard — small sample, ceiling unearned until the labeled set grows).

## Substrate latency — JSONL vs vector head-to-head

Run 2026-05-23 to satisfy a Starlight Board REVISE gate before flipping the PRIMARY
substrate from ChromaDB to sovereign append-only JSONL. Same 168-atom live corpus,
same 50 queries, both substrates.

| Metric | Sovereign (Path A JSONL) | ChromaDB (vector) | Δ |
|---|---:|---:|---:|
| recall@5 | 36.0% (18/50) | 44.0% (22/50) | **−8.0pp** |
| recall@10 | 42.0% (21/50) | 48.0% (24/50) | −6.0pp |
| p50 latency | 0.77 ms | 48.00 ms | ~60× faster |
| p95 latency | 1.32 ms | 66.64 ms | **51× faster** |

Receipts: `phase0/eval-results-2026-05-23-comparison.md` and the Board record
`docs/boards/2026-05-23-substrate-migration-sovereign.md` (both @ `7ceae2c`).
The vector store **won both recall metrics**; the flip shipped anyway because the −8pp
delta sat inside the Board's 10pp gate and the JSONL substrate satisfies the non-waivable
filesystem-native axiom. Migration: 168/168 atoms, 100% attestation preserved, 7/7
post-flip smoke. Honest trade, recorded as one.

## Model Arena — Fable 5 vs Opus 4.8

Head-to-head LLM rounds run natively in Claude Code via per-agent model overrides;
every round writes a JSON receipt to `tools/arena/runs/`. Harness doc:
`tools/arena/README.md` @ `50ffb1e`.

| Round | Date | Tally | Headline | Receipt @ commit |
|---|---|---|---|---|
| 1 — baseline | 2026-06-09 | Fable 1 · Opus 0 · tie 2 · split 1 | Correctness parity; Fable's edge is instruction compliance / output discipline | `tools/arena/runs/2026-06-09-fable5-vs-opus48.json` @ `5ffee7f` |
| 2 — stress | 2026-06-09 | Fable 3 · Opus 2 | Fable = constraint precision but executed a governance-gated edit; Opus = situational judgment but leaks output-shape violations | `…/2026-06-09-r2-stress-fable5-vs-opus48.json` @ `50ffb1e` |
| 3 — hard capability | 2026-06-09 | Fable 2 · Opus 0 · tie 2 | Only Fable solved the no-tools reasoning task (Opus: 814 vs ground truth 33) | `…/2026-06-09-r3-true-challenge.json` @ `049258d` |
| 3b — 4-way lineup | 2026-06-10 | Fable 4/4 · Sonnet 3/4 · Haiku 3/4 · Opus 2/4 | Capability saturated across the lineup; output-constraint discipline is the only discriminator | `…/2026-06-10-r3-lineup-4way.json` @ `ca64c15` |
| 4 — work samples | 2026-06-10 | Fable 1 · Opus 1 | Premium work split by domain; Fable's first contract violation on record | `…/2026-06-10-r4-work-samples.json` @ `e6a0a2f` |

**Caveats (from the receipts):** n=1 per task — directional, not statistical; judge is
Claude-family where judged at all; results measure model-in-harness, not raw API.

## Harness scale

| Metric | Value | Receipt |
|---|---:|---|
| Test suite (2026-06-10 audit) | 967/968 green — 183 operational + 750 substrate + 34 evals; sole failure was AGENTS.md agent-count drift, fixed same day | `docs/strategic/2026-06-10-world-class-plan.md` @ `31ae0fd` |
| Test suite (post-fix, re-run 2026-06-10) | full `npm test` green: 941 node:test passes + 34 eval-harness passes, **0 failures** (count methodology differs slightly from the audit doc's 968 total) | local run, this file's authoring session |
| Cross-Repo Indexer v0.1 | 520 atoms across 22 `~/.claude/projects` memory dirs in **2.69 s** (`elapsed_seconds: 2.69`); idempotent re-run: 0 committed / 519 skipped | `docs/ops/HANDOVER-2026-05-03-indexer-shipped.md` @ `283007c` |

## How to reproduce

From the repo root (scripts verified against `package.json`):

```bash
npm test              # operational + substrate + v0.1 eval suites
npm run eval:retrieval  # MCP-layer retrieval eval (test/retrieval-eval.test.ts)
npm run verify        # lint + test + build, plus site and console builds
```

The phase-0 retrieval evals are Python: runner `phase0/eval_runner.py`, head-to-head
`phase0/eval_comparison.py`, queries `docs/research/_factory/memory-foundations-phase0/eval-50.jsonl`.
Arena rounds are run live from a Claude Code session per `tools/arena/README.md`
("Running a round") — each run writes a fresh receipt to `tools/arena/runs/`.

---

*Built on SIP — Starlight Intelligence System. Numbers without receipts are stories;
these are receipts.*
