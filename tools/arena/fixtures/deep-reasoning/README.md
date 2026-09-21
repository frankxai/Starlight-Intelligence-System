# R5 deep-reasoning task fixtures

> Built on SIP. The task set for the R5 deep-reasoning lane. Pre-registered
> design: [`../../R5-DESIGN.md`](../../R5-DESIGN.md). Runner:
> [`../../deep-reasoning.mjs`](../../deep-reasoning.mjs).

One JSON file per task, schema `r5-task v0.1`. Every fixture is self-contained:
a reader can check the ground truth without running anything.

| Field | Meaning |
|---|---|
| `id` | Stable task identifier; appears in every receipt row. |
| `family` | Which of the five reasoning families this task belongs to. |
| `why` | What this task is designed to separate, and by what mechanism. |
| `prompt` | The verbatim prompt. Absent on `d3`, which uses `assemble` instead. |
| `assemble` | Deterministic document recipe (`d3` only) — index arithmetic, no RNG, no clock, so the assembled document is byte-identical between runs. |
| `answerFormat` | The `ANSWER:` line shape the harness parses. |
| `groundTruth.answer` | The correct answer. |
| `groundTruth.derivation` | Every step. This is what makes the fixture auditable rather than assertable. |
| `verification.accept` | Regexes that score PASS, applied to the normalised final `ANSWER:` line. |
| `verification.attractors` | Pre-registered wrong answers, each with a label and why a solver lands there. A match scores FAIL-ATTRACTOR, so a near-miss is distinguishable from noise. |
| `prediction` | The per-tier pass/fail prediction, registered before the round ran. |

## Task set

| ID | Family | Ground truth |
|---|---|---|
| `d1-deduction-trap-ledger` | multi-step deduction with a trap intermediate step | `CREDITS=654 SLOTS=9` |
| `d2-attractor-random-reveal` | plausible-but-wrong attractor | `1/2` |
| `d3-longctx-reconcile` | long-context synthesis across distant facts | `04:50 YES` |
| `d4-multifile-idempotency-bug` | subtle multi-file bug | `C billing/charge.py:5` |
| `d5-architecture-slo-tradeoff` | architecture trade-off | `A 223 3960` |
| `d6-constraint-backtrack-assignment` | constraint satisfaction requiring backtracking | five agent assignments |

## Rules for changing these files

- **Do not tune a task because a tier failed it.** These fixtures describe the
  reasoning distribution; they are not targets. Editing a task after seeing a
  result and then re-running is how a card stops measuring anything.
- **Changing any fixture breaks replication.** R6 is a clean replication of R5
  only if the card is byte-identical. A changed card is a new experiment and its
  round is not concordant with R5 — it is a second n=1 round of something else.
- Ground truths for `d1`, `d5` and `d6` were produced by reference
  implementations rather than by hand; `d6`'s uniqueness was established by
  exhaustive search over all 14,400 candidate grids.
- Every fixture must parse as JSON — `npm run validate` checks this.

Built on SIP — Starlight Intelligence Protocol.
