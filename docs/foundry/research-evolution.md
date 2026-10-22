# Research-guided harness experiments

Turn a paper-derived change into a comparison someone else can inspect. The
`evolve-research` command extends the existing Foundry evolution path with an
offline research allocator and a supplied-results evaluator. It writes a review
proposal; it never edits the harness, moves a champion pointer, or executes code.

## Decision and source

This is an original implementation of selected mechanisms from Yang et al.,
[Learning from Research: Toward Lifelong Agent Harness Evolution](https://arxiv.org/abs/2609.40169v1),
sections 3.2–3.4 and appendix C. It is not the authors' implementation or a benchmark
reproduction. On 22 October 2026 the authors' linked
[ScholarEvolve repository](https://github.com/UCSB-NLP-Chang/ScholarEvolve) was empty;
no upstream code or code license was available to reuse.

SIS already routes receipt failures through `tools/foundry/lib/evolve.mjs`.
Keep that behavior intact. Add a separate experiment input rather than making
external papers executable instructions or building a second agent platform.
Scope is operational Foundry tooling; SIP rules, identities, permissions, runtime
memory, production services, and existing champion artifacts are unchanged.

## Run the included demonstration

```bash
node tools/foundry/cli.mjs evolve-research \
  foundry/examples/research-evolution.campaign.json \
  --out /tmp/starlight-research-report.json
node --test test/research-evolution.test.mjs
```

The example contains invented tasks, scores, revisions, and digests. Its abstract
field contains one exact sentence from the source abstract. It must stay
`evidenceMode: synthetic`. Output is `demo-only`, with no recommended candidate.
Changing that label cannot turn the example into evidence about a real harness.
Use a fresh output filename for each run; existing paths, including symlink and
hardlink aliases, are rejected to preserve campaign inputs and previous reports.

The new path uses Node built-ins and the existing Foundry schema validator. Host
validators, compiler and prover load only when their own CLI commands run.
CI runs the synthetic suite in the existing portable job, including draft PRs.

## Campaign contract

The authoritative shape is
[`research-campaign.schema.json`](../../foundry/contracts/research-campaign.schema.json).
Unknown fields fail closed. The evaluator also checks semantic relationships.
Use explicit `--schema research-campaign` with the existing `validate` command for
structural validation; `evolve-research` performs both structural and semantic checks.

| Input | Responsibility |
| --- | --- |
| `papers` | Supplied title, abstract, source URL, publication date, stable ID |
| `blueprints` | One module, primary mechanism topic, abstract excerpt, source ID, adaptation, interface, termination, novelty screening and rationale |
| `splits` | Unique, mutually disjoint evolution, validation and held-out task IDs |
| `champion` | Exact source revision, fixed model/settings identity in `backbone`, evaluation protocol digest, frozen artifact digest and evolution source IDs, validation rows |
| `candidates` | Same measurement fields plus blueprint IDs and supplied health/security/permission/test gates |
| `budget` | Research allocation, evaluated candidate count, crossover shortlist, mean episode cost and latency limits |
| `selection` | Minimum task count, minimum average gain, maximum observed task regression, bootstrap samples, seed and nominal alpha |

Each validation row has `taskId`, `trialId`, reward in [0,1], total episode cost in
USD and total episode latency in milliseconds. Include auxiliary model/tool usage.
Use the same task/trial keys for every candidate and the champion. Store artifacts
and scorer/configuration manifests separately; the digests identify their expected
bytes. Persistent artifacts may use only evolution tasks and must remain frozen
during evaluation. Task IDs must represent independent tasks, not renamed trials.

The report embeds selected paper and blueprint records and fingerprints its parsed
input. All measurements, health flags, source revisions and artifact digests are
**supplied and unattested**. No files are fetched from source URLs; the tool does
not independently verify execution, digest closure, scorer integrity, task-family
independence, or that a declared artifact stayed frozen. Independent review and
Foundry `/prove` remain required. Do not place secrets or private traces in campaigns.

## Selection behavior

1. Screen mechanisms already present in each module and deduplicate normalized paper
   titles within that module. Visit mechanism clusters in descending size and allocate
   papers round robin, preserving retrieval order within a cluster. The input taxonomy
   and novelty judgments are supplied by the research author, not inferred by this tool.
2. Pair every task/trial with the champion. Average trials inside each task, then
   bootstrap task-level gains with a fixed seed. Require the two-sided interval's
   lower endpoint to exceed zero and the average gain to meet the configured minimum.
   Divide alpha by the number of candidates in the supplied batch to reduce selection
   optimism. This is a conservative addition to the paper's described retention rule.
3. Block candidates that fail supplied executable/hard gates, exceed mean episode
   cost or latency limits, or exceed the allowed observed task regression. Rank remaining
   confirmed candidates by measured average gain, then cost, then ID.
4. Rank unmeasured combinations of single-module candidates by additive gain, retaining
   a base choice for every module. These are experiment suggestions only. A supplied
   combination competes only on its actual paired joint measurements. Duplicate
   configurations and multiple mutations to one module are rejected.
5. Emit `review-candidate` or `retain-champion` for measured inputs. The report always
   carries `apply: false`, `requiresReview: true`, source/artifact IDs and evidence trust.

Limits: 5 MB file input, at most four selected papers per module, 64 evaluated
candidates, 20 crossover suggestions, 10,000 bootstrap replicates and 20 million
task draws. The finite Monte Carlo interval is approximate, especially at corrected
tail probabilities. It is not a generalization guarantee. Repeated adaptive search
over one validation set can overfit despite the within-batch correction. Preserve
a separate lockbox, predeclare search budgets, and freeze all selection decisions
before held-out evaluation. Held-out rewards are not accepted by this input contract.

## Runtime work still required

Paper retrieval, failure auditing, TopicGPT-style taxonomy induction, automated
blueprint generation, isolated coding/repair, benchmark execution, authenticated
evidence capture and champion deployment are not implemented here. Connect existing
research agents and the proving ground to produce this contract; first measure one
real context or memory mutation against the existing harness. Review official code
and its license again when the authors release it. This change establishes no live
agent improvement, benchmark gain, scheduled process or model expenditure.

Rollback: revert this operational change or stop invoking `evolve-research`; the
legacy `evolve` command and current runtime remain available.
