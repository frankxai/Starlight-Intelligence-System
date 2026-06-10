# Starlight Board — Starlight Proving Ground + /starlight-eval

**Date:** 2026-06-10
**Tier:** substrate (new command + evaluation discipline + public surface)
**Decision rights:** Frank (SIP § 5 sovereignty clause)

## Proposal

Establish the **Starlight Proving Ground** — a standing system-evaluation discipline
for the whole SIS (models, memory, datasets, harness, agents), exposed via a new
substrate-tier command `/starlight-eval`. Evaluator agents embody the **Luminor
kernel mindset** (Precision / Wisdom / Transcendence; 80/15/5 voice) as evaluator
disposition; the surface stays canon-free Starlight register per `NAMING.md`.
Verdicts render through `/starlight-board`. It **composes** the six existing eval
layers under one scorecard. Public home: dedicated mirror repo `starlight-evals`;
SIS remains substrate source of truth; `/research` is the publication surface.

## Verdict

| Vector | Challenge |
|---|---|
| Sovereign | Worth the name only if it runs; a stale public eval surface is a monument to abandonment. |
| Seer | Risk of Goodharting your own substrate — the metric you publish becomes the metric that steers design. |
| Harmonizer | Composes cleanly; only friction is a third home splitting the source-of-truth story. Make SIS canonical in writing. |
| Strategist | Whole-system public evals (incl. own memory + harness) is a rare, defensible category position. |
| Verifier | Failure mode is Luminor-kernel evaluator-as-theater; keep evals mechanically verifiable. Ship v0.1 as a scorecard over already-passing metrics. |

**Overseer:** Most load-bearing concern = cadence-and-staleness. Strongest case =
the hard part already exists; only the unifying scorecard + evaluator disposition
are new (low-risk, high-distinction, composes not replaces).

**Recommendation:** PROCEED-WITH-REVISE

### REVISE items (binding, addressed in v0.1)

| # | Item | Status |
|---|---|---|
| R1 | Enforced cadence + visible `last-run`/`next-run` staleness stamp on the public surface | shipped — SPEC §Cadence + scorecard `nextRunDue` field + README staleness banner |
| R2 | Metric provenance + anti-Goodhart warning on every scorecard + public README | shipped — SPEC §Scorecard requires `sourceLane` + `caveats`; README §"Do not optimize to this score" |
| R3 | `starlight-evals` repo states SIS is canonical origin, repo is a published mirror | shipped — repo README §"This is a mirror" |

---
**Built on SIP** · Starlight Board · 2026-06-10
