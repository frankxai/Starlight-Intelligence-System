# R5 — Deep-Reasoning Lane: Pre-Registration

> Built on SIP. Written **before any R5 data was collected.** Nothing in this
> document is a result. It is the design, the prediction, and the rule that
> decides in advance what would falsify it.

**Design date:** 2026-08-28 · **Status at time of writing:** specified, unrun
**Harness:** `tools/arena/deep-reasoning.mjs` · **Tasks:** `tools/arena/fixtures/deep-reasoning/`
**Doctrine:** `ROUTING-DOCTRINE.md` (A1 autonomy boundary, A2 sample floor, A3 ledger)

---

## 1. Why this round exists

`routing-table.json` routes the `deep-reasoning` class to Opus with
`confidence: "low"`, `rounds: 0`, and this evidence field:

> Doctrine, NOT yet measured — no arena card has a deep-reasoning lane where Opus
> ceiling would show. R4 must build it before this hardens.

Quoted verbatim. It says "R4" because that is what the field said — the round it
was asking for landed as R5, for the reason given in the correction at the end of
this document. An earlier revision of this file renumbered the text *inside* this
quotation; that was wrong and is restored here.

R3 named the same gap as its own weakness: its card "measures COMPLIANCE, not
CAPABILITY CEILING." Every other class in the routing table has at least one
receipt. This one has a hunch.

The hunch is now more expensive to get wrong. On the current price list, Fable 5
is **$10 / $50 per MTok** against Opus 5 at **$5 / $25** — 2x per token in both
directions. Routing deep reasoning to the wrong tier is a 2x error either way,
and on a subscription it burns weekly allowance at 2x. "Reserve the expensive
tiers for where they win" is only a cost lever if you have measured where they
win.

## 2. Hypothesis

> **H1.** On multi-step reasoning tasks where a single wrong intermediate step
> propagates to a wrong final answer, the more expensive tier produces materially
> fewer wrong-answer runs than the cheaper tier, by a margin large enough to
> justify its price multiple.

H1 is falsifiable in three distinct directions, and §8 states in advance what
each direction would mean for the routing table. The null — that the tiers are
indistinguishable on this card — is the outcome R3 already produced on an easier
card, and §4 treats it as a design failure rather than a finding.

**H1 is a claim about cost per *correct* answer, not about capability.** A tier
that passes one more task while costing four times as much has not supported H1.

## 3. Contestants

| Key | Model ID | Input $/MTok | Output $/MTok | Context |
|---|---|---|---|---|
| `fable` | `claude-fable-5` | 10.00 | 50.00 | 1M |
| `opus` | `claude-opus-5` | 5.00 | 25.00 | 1M |
| `sonnet` | `claude-sonnet-5` | 2.00 | 10.00 | 1M |
| `haiku` | `claude-haiku-4-5` | 1.00 | 5.00 | 200K |

Exact model IDs, never date-suffixed. Note that R1–R4 ran `claude-opus-4-8`;
R5 contests `claude-opus-5`, so R5 is **not** a continuation of the R1–R4 Opus
series and must not be pooled with it.

## 4. The critical design constraint: this card must not saturate

R3's finding was capability **saturation**. All four tiers passed the coding task
and the grounding task, and the routing table records why that is worth almost
nothing: *"PASS by all 4 on ONE trivial task (palindrome) — saturation on an easy
distribution."* A card that everything passes ranks nothing.

R5's entire job is a task distribution hard enough to separate the tiers.
Designing against ceiling effects is the primary constraint, above elegance and
above coverage.

**Pre-registered expected spread.** Per-task predictions live in each fixture's
`prediction` field. Summed across the six tasks:

| Tier | Predicted pass count (of 6) |
|---|---|
| `fable` | 6 |
| `opus` | 6 |
| `sonnet` | 3 |
| `haiku` | 0 |

The card is built to include tasks Haiku is expected to fail. A predicted Haiku
score of 0/6 is deliberate: if Haiku scores well here, either the card is too
easy or the routing table's cheap-tier bias is better founded than anyone
thought — both are informative, and both are recorded rather than explained away.

**Void rule (binding).** If the spread between the best and worst tier is **0
tasks** — every tier scores identically, whether 6/6 or 0/6 — the round is
**VOID**. A void round yields no routing evidence, does not count toward the A2
two-round floor, and does not change `routing-table.json`. The harness computes
this itself and stamps `verdict: "VOID"`; it is not a judgment call made after
seeing the numbers. A void round means the card was wrong and must be redesigned
before R6.

A spread of 1 task is weak separation and should be reported as such rather than
narrated into a finding.

## 5. Task families

Six tasks, one fixture file each, spanning the five families that actually
separate reasoning tiers.

| ID | Family | Separation mechanism |
|---|---|---|
| `d1-deduction-trap-ledger` | multi-step deduction with a trap intermediate step | Nine ordered rules over two quantities. Treating 1 as prime raises the running balance from 672 to 682, which crosses a threshold of 680 and **flips a conditional branch** — the wrong intermediate step changes the arithmetic path, not just the total. A second trap punishes applying R7 before R6. |
| `d2-attractor-random-reveal` | plausible-but-wrong attractor | The random-reveal variant of the three-door problem. Surface-identical to the classic puzzle whose memorized answer is 2/3; because the auditor is uninformed and selects uniformly, the correct posterior is **1/2**. Recall produces the wrong answer; only conditioning produces the right one. |
| `d3-longctx-reconcile` | long-context synthesis across distant facts | Two needles at sections 17 and 288 of a 300-section handbook, neither usable alone, among ~298 same-shaped schedule facts. A **live decoy** at section 12 (a retired compaction job, never explicitly ruled out) yields a fully self-consistent wrong answer. |
| `d4-multifile-idempotency-bug` | subtle multi-file bug | Four files, none wrong in isolation. A retry wrapper re-invokes a callable that mints a fresh idempotency key per attempt, so the gateway's dedupe never engages. Option F is a near-miss whose premise is **true** and whose fix is wrong. |
| `d5-architecture-slo-tradeoff` | architecture trade-off | Three constraints (latency, cost, durability); exactly one option satisfies all three. The attractor is both the fastest and the cheapest option, and fails only the constraint a model skips if it optimises the two salient numbers. |
| `d6-constraint-backtrack-assignment` | constraint satisfaction requiring backtracking | 5x3 grid, ten constraints, no constraint pinning a cell directly; one constraint compares two lanes by alphabetical rank, forcing a partial assignment to be revisited. Uniqueness **verified by exhaustive search** over all 14,400 grids, not asserted. |

Each fixture carries its own prompt, answer format, ground truth **with the full
derivation**, accepting regexes, pre-registered attractors, and per-tier
prediction. A third party can read a fixture and check the ground truth without
running anything.

### Context-window fairness

`claude-haiku-4-5` has a 200K context window against 1M for the other three. The
long-context task is assembled at roughly 18.5K tokens, well inside Haiku's
window, so a Haiku failure on `d3` is a reasoning failure and not an inability to
be asked the question. **Do not grow `d3` past ~150K tokens** without either
dropping Haiku from that task or recording it as N/A — a task the cheap tier
cannot physically receive is not a measurement of the cheap tier.

## 6. Scoring

**Mechanical, binary, no partial credit.**

- Every task instructs the model to end its reply with a single `ANSWER:` line in
  a stated form. The harness takes the **last** such line, normalises it
  (strip markdown decoration and a trailing period; then the per-task steps —
  collapse whitespace, uppercase, strip commas, strip currency), and tests it
  against the fixture's `accept` regexes.
- **PASS** = a match. **FAIL** = no match. **FAIL-ATTRACTOR** = no match against
  `accept` but a match against a pre-registered attractor, recorded with the
  attractor's label so a near-miss is distinguishable from noise.
  **NO-ANSWER** = no `ANSWER:` line was emitted. **ERROR** = the call failed.
- **Ties:** a task on which every contestant passes is recorded as
  `tie (n-way) — saturated` and contributes nothing to separation. Ties are not
  broken by style, speed, or cost; per-tier cost is reported separately and never
  used to convert a tie into a win.
- **Partial credit: none.** A task is passed or it is not. `d6` in particular is
  all-or-nothing across ten cells, which is the point — a single propagated error
  fails the task, and propagation is the property under measurement.

### No LLM judge on this card

R1 used a blind non-contestant judge (`sonnet`) because only two tiers were
contesting. **R5 contests all four Claude tiers, so no Claude model is a
non-contestant** and the R1 arrangement cannot be reproduced honestly. Rather
than use a contestant to judge its own rivals, R5 is fully mechanical: the
architecture task was converted from a rubric-scored task into one with a
determinate answer (§5, `d5`).

The rubric-judged variant is **deferred to R6**, gated on the cross-family judge
already on the doctrine roadmap (`ROUTING-DOCTRINE.md`, roadmap item 2: GPT-5 via
OpenRouter as a bias-free judge). Until that exists, R5 measures what can be
measured without a judge, and says so.

## 7. Effort as a controlled variable

Effort (`output_config.effort`) changes both quality and spend inside a single
model. A cheap tier at `xhigh` may beat an expensive tier at `low`, which would
change the routing conclusion entirely, so the choice must be explicit.

**Decision: hold effort constant at `high` for R5. Do not sweep.**

Justification:

1. `high` is the API default (equivalent to omitting the parameter), so it is the
   setting the routing rule will actually apply to in production. A round run at
   a non-default effort would measure a configuration nobody runs.
2. A sweep multiplies the cell count by the number of levels. With n=1 per cell
   already the dominant weakness, spending the budget on a second **round** (the
   A2 floor) buys more than spending it on a second effort level within one round.
3. **The sweep cannot be run symmetrically anyway.** `claude-haiku-4-5` does not
   accept `output_config.effort` — the API rejects it. A "sweep across all four
   contestants" is not available; only a three-tier sweep is, and a three-tier
   sweep answers a different question than the four-tier comparison.

**Stated asymmetry, not hidden.** The harness sends no effort flag for
`claude-haiku-4-5` and records `effortApplied: null` on its rows. Haiku therefore
runs at the harness default while the other three run at an explicit `high`. This
is a real confound and it is recorded in the receipt's `caveats`. It cannot be
removed without either dropping Haiku or sending a parameter the API rejects.

**What this round therefore does NOT establish:** the cost-adjusted effort
frontier. "Is Sonnet at `xhigh` cheaper per correct answer than Opus at `high`?"
is a live and valuable question that R5 does not answer. It is the natural R7.

## 8. Cost accounting

Per run, the harness records `inputTokens`, `outputTokens`, `costUSD`,
`durationMs`, and wall-clock. Per tier it reports totals and
**`costPerPassedTaskUSD`** — total spend divided by tasks passed, `null` when the
tier passed nothing.

Cost is attributed from the CLI's own `modelUsage[<model id>]` entry for the
contestant, which excludes the background Haiku call the CLI makes on every
invocation. The default CLI system prompt is replaced with a minimal one, which
drops per-call harness overhead from roughly 27,300 tokens to roughly 250 —
without that, harness overhead would dominate the cost column and the
cost-adjusted finding would be an artifact of the transport.

`costPerPassedTaskUSD` is the number the routing decision turns on. Capability
alone cannot answer "is the expensive tier worth its multiple."

## 9. Falsification criteria (pre-registered)

Stated before the data exists. `S` = pass count out of 6.

| Result | Reading | Routing consequence |
|---|---|---|
| Spread = 0 | **VOID.** The card failed to separate. | No change. Redesign the card. Does not count toward the A2 floor. |
| `S(opus) >= S(fable)` **and** `S(opus) - max(S(sonnet), S(haiku)) >= 2` **and** `costPerPassedTask(opus) < costPerPassedTask(fable)` | H1 supported, Opus is the efficient tier | **Keep `route: "opus"`.** Confidence low -> medium. Still `autoApply: false`; the A2 floor needs a second round. |
| `S(fable) - S(opus) >= 2` **and** the extra passes are tasks Opus failed | Fable's 2x price buys capability Opus lacks | **Change to `route: "fable"`**, confidence medium, `autoApply: false`, pending R6. Record the specific tasks in the evidence field. |
| `max(S(sonnet), S(haiku)) >= S(opus)` | Saturation across tiers, same as R3's coding result | **Down-route** to the cheapest tier that matched, per the doctrine's core rule: "when a task-class is capability-saturated across tiers, route to the cheapest passing tier." Confidence medium at most. |
| `S(opus) - max(S(sonnet), S(haiku)) == 1` | Weak separation | Report as weak. **Do not change the route on one task of difference at n=1.** |
| Any tier with `errors > 0` | Incompletely measured | That tier's row is not usable for a routing change. |

**Ceiling on any outcome.** Under A2, one round sets `confidence` to at most
`medium` and leaves `autoApply: false`. **R5 cannot harden the deep-reasoning
rule no matter how clean the result is.** R5 is round 1 of at least 2.

## 10. How R6 replicates this

R5 is designed so R6 is a clean replication rather than a new experiment.

- **Same fixtures, unchanged.** Every task is deterministic: fixed prompts, and
  `d3` assembled by index arithmetic with no RNG and no clock, so the document is
  byte-identical between runs.
- **Same command:** `npm run eval:deep-reasoning`.
- **Change exactly one thing at a time.** If R6 changes the contestant set, the
  effort level, or the transport, it is a different experiment and the two rounds
  are not concordant — they are two n=1 rounds of different things.
- **Concordance** means the same routing consequence fires in §9 in both rounds,
  not that the pass counts are numerically identical.
- Only after two concordant rounds may `deep-reasoning` move to
  `confidence: "high"`, and `autoApply` stays `false` regardless: the class is
  `stakes: "medium"`, and per A1 only the low-stakes classes auto-route.

## 11. Known weaknesses of this design

Named up front, because a design that hides its weaknesses is not a
pre-registration.

1. **n=1 per cell.** Six tasks, one run each per tier. A single lucky or unlucky
   sample moves a tier by one task. This is the dominant weakness and it is not
   fixed by R5; it is why the A2 floor exists.
2. **Model-in-harness.** Runs go through the `claude` CLI, not the raw API. The
   system prompt is replaced to keep cost attributable, but this still measures
   the model as the CLI runs it. R1–R4 carry the same caveat.
3. **The Haiku effort asymmetry** (§7) is a real confound that cannot be removed.
4. **Six tasks is a small distribution.** The families were chosen because they
   are known to separate reasoning tiers, which is a designed bias toward
   separation — the mirror image of R3's bias toward compliance. R5 does not
   measure the tiers on average work; it measures them where reasoning depth is
   the binding constraint. That is the right target for this routing class and
   the wrong target for any other.
5. **Attractor coverage is incomplete.** Pre-registered attractors capture the
   wrong answers that were anticipated. An unanticipated wrong answer scores
   FAIL, which is correct but less informative.
6. **`d2` may be contaminated by training exposure.** The random-reveal variant is
   discussed in the literature. If a tier has memorised the *variant* rather than
   the classic puzzle, `d2` measures recall, not reasoning — in the opposite
   direction from the one intended. Nothing in this design can distinguish those
   two cases.

## 12. Reproducing this round

```bash
npm run eval:deep-reasoning -- --dry-run     # assemble every prompt, spend nothing
npm run eval:deep-reasoning                  # full card, 6 tasks x 4 tiers, effort=high
npm run eval:deep-reasoning -- --tasks d2,d6 --models opus,haiku    # subset
```

The harness writes a run-local receipt to `tools/arena/out/`. It never writes to `tools/arena/runs/`;
promoting a run into a published receipt is a reviewed human step, per the repo
rule that a published receipt is never edited after the fact.

If the `claude` CLI is absent or unauthenticated, the harness emits an **UNRUN**
receipt with zero result rows and says so in a banner. That is the correct
output. An empty honest result is worth more than an invented number, because
the artifact this lane feeds — `routing-table.json` — is only worth anything if
every number in it is real.

Built on SIP — Starlight Intelligence Protocol.

---

## Postscript — added 2026-08-28, after the round ran

**Nothing above this line was changed after data existed.** This section records
the outcome and is not part of the pre-registration.

R5 ran on 2026-08-28. Receipt:
[`2026-08-28-r5-deep-reasoning.json`](2026-08-28-r5-deep-reasoning.json).
**Verdict: VOID-EQUIVALENT. The card saturated.**

- **Run 1:** every tier scored 6/6. Spread 0 — VOID by the §4 rule.
- **Run 2** (identical card, after a token-accounting fix in the harness):
  `opus` 6/6, `sonnet` 6/6, `fable` 5/6, `haiku` 5/6. Spread 1, but *both*
  non-PASS cells are non-reasoning — one transport error, one reply that omitted
  the required `ANSWER:` line. Every tier answered correctly on every task it
  answered.
- Across both runs, **46 of 46 answered cells were correct**, and **not one of
  the twelve pre-registered attractors was taken by any tier** — including
  `claude-haiku-4-5` on `d2` and `d3`.

The §4 predicted spread (fable 6, opus 6, sonnet 3, haiku 0) was wrong, and
wrong in the direction that matters: the prediction of a 0/6 Haiku was the
premise the card was built on, and Haiku answered everything correctly.

**Routing consequence: none.** `routing-table.json` keeps `route: "opus"`,
`confidence: "low"`, `rounds: 0`, `autoApply: false`. A void-equivalent round is
not evidence and does not count toward the A2 floor. The deep-reasoning class is
still unmeasured — the difference is that it is now unmeasured for a *known*
reason: on well-posed, ground-truth-checkable reasoning problems this lineup has
no ceiling left to find, Haiku included.

That result creates a bind for R6, recorded in the receipt's
`review.whatWouldActuallySeparate`: the tasks that plausibly still separate the
frontier are the ones with no mechanical ground truth, and §6 could not use a
judge because all four tiers were contestants. Building a harder *mechanical*
card is likely to saturate again.

### Correction — 2026-09-19: this round was renumbered R4 → R5, and the real R4 changes the conclusion

The arena's fourth round already existed when this card was designed:
[`runs/2026-06-10-r4-work-samples.json`](runs/2026-06-10-r4-work-samples.json), a
premium work-sample card run 2026-06-10. The design took its number from the
`starlight-evals` public mirror's `rounds/`, which stops at R3 and never received
arena R4 or the 2026-06-12 Grok/Composer model-lane run. That is exactly the drift
`AGENTS.md` warns about, and the reason this lane is registered here first. The
round is R5. Two consequences, both cutting against the paragraph above:

1. **A blind non-contestant judge was already available, and already used.** R4
   ran two Claude-family `sonnet` judges with per-task shuffled A/B labels over
   real production tasks, recording family bias as a stated caveat rather than a
   blocker. R6 is therefore **not gated on the cross-family judge existing** — that
   judge would reduce a known bias, not unlock the method. The better reason to be
   slow here is R4's own caveat: *"work-sample quality scores are single-judge
   taste; repeat before routing on them."*

2. **Real work already separated the tiers — on an axis this card does not
   measure.** R4's finding was not correctness but *discipline under load*:
   *"Fable 5 violated an output contract for the first time across four rounds —
   when the task itself is heavy, its constraint edge narrows,"* with Opus at 5 of
   7 structured-output tasks violated. R4's recorded routing implication was to
   enforce output contracts structurally regardless of model.

   That reframes run 2's `fable/d4` cell. The postscript above dismissed it as
   "non-reasoning" and therefore noise. Against R4 it is not noise: it is a third
   independent instance of the same measured behaviour, on the heaviest
   multi-file task of the card, from the exact tier R4 named. The *reasoning*
   verdict is unchanged — fable's chain was correct — but the cell is evidence on
   the output-discipline axis, not an absence of evidence.

So the cheap probe stands and a second joins it: hold this card fixed and sweep
effort **downward** — if every tier still passes at `effort: low`, the live
routing question is which effort, not which tier — and re-score the replies this
round already produced a second way, for **output-contract compliance** rather
than correctness. That is mechanical, needs no judge, costs nothing to re-run,
and tests the one axis four rounds now agree on.

**Do not tune these fixtures to manufacture separation.** The card saturating is
the result. Editing tasks until a tier fails and calling that a finding is the
exact failure mode this repo exists to avoid.
