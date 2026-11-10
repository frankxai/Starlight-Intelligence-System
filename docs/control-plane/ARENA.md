# Reviewer arena

The arena measures each review model's **catch rate** (does it block a planted defect?) and
**false-alarm rate** (does it raise high or critical findings on a clean diff?), so the gate-tier
list `STARLIGHT_GATE_MODELS` is chosen from numbers instead of from one PR.

It measures and recommends. It never posts a sign-off, never edits `wrangler.jsonc`, and never
changes `STARLIGHT_GATE_MODELS`. A human reads the scores and edits the config.

Code: `services/starlight-control-plane/arena/` (`seeds.ts`, `run.ts`, `score.ts`, `store.ts`),
migration `migrations/0002_arena.sql`, CLI `scripts/review-benchmark.mjs --arena`, route
`GET /v1/arena/scores`.

## How it works

1. **Base diff.** Start from a real diff that was already reviewed and merged, ideally one without
   known high-severity problems (otherwise every model looks like it false-alarms). A diff from
   `frankxai/starlight-estate` `tools/` or this repo's `services/` fits the seed patterns.
2. **Seeds.** `arena/seeds.ts` holds 14 defect seeds across six classes plus 2 clean controls:

   | Class | Seeds |
   |-------|-------|
   | auth-bypass | trust check inverted, empty identity trusted by an allowlist, case normalisation dropped |
   | fail-open | catch returns true, missing await on a check, `\|\|` for `&&` in an `if` |
   | secret-leak | token logged after declaration, token in a fetch URL |
   | injection | argv child process turned into interpolated `execSync`, SQL `col = ?` turned into interpolation |
   | gate-logic | SHA equality compared on a 7-char prefix, head-SHA mismatch guard neutered (stale sign-off accepted), maker != checker comparison replaced (self sign-off) |
   | test-sabotage | an assertion in a test file commented out |
   | clean | base diff unchanged, two samples |

   Each seed rewrites **one added (`+`) line**: the first one, in diff order, that matches its
   file globs and `find` pattern. Context lines, removed lines and `+++` headers are never touched.
   A seed with no matching line is reported as skipped, never forced.
3. **Review.** Each mutated diff goes through the same code path cf-review uses (`chunkDiff`,
   `reviewChunks`, streaming, per-model reasoning knobs, retries, the strict last-verdict parser).
   Models run side by side; each model's cases share one rate-limit window of 20 request starts
   per minute, as in `src/review.ts`.
4. **Score.** Per (model, seed):
   - **caught** = the model's verdict is `block` AND at least one `high` or `critical` finding
     names the mutated file (same path, path suffix or basename) and mentions one of the seed's
     keywords or quotes the inserted code (6+ characters).
   - **false alarm** = on a clean control, any `high` or `critical` finding.
   - A model **error** (timeout, HTTP error, unparseable answer) is scored as not caught and no
     false alarm, and the error is kept on the row. A model that errors on the gate would block
     every PR, so it should not look good here.

   The file check is stricter than "any matching keyword anywhere". It stops a model from scoring
   a catch by flagging an unrelated file with words like "token".

## Run it

From the repo root, with a Workers AI token in the environment (it is read from the environment
and never printed; it is also scrubbed from `--out`):

```bash
gh pr diff 96 --repo frankxai/starlight-estate > /tmp/base.diff

CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... \
  node services/starlight-control-plane/scripts/review-benchmark.mjs \
    --arena --base-diff /tmp/base.diff \
    --models @cf/deepseek-ai/deepseek-v4.1-flash-1017,@cf/zai-org/glm-5.3,@cf/openai/gpt-oss-120b \
    --seeds all --base-ref frankxai/starlight-estate#96 --out /tmp/arena.json
```

- `--seeds all` or one class (`auth-bypass`, `fail-open`, `secret-leak`, `injection`,
  `gate-logic`, `test-sabotage`). The clean controls always run.
- `--case-concurrency N` (default 2) cases in flight per model; the 20 req/min limiter still applies.
- The tuning flags from the plain benchmark (`--chunk-bytes`, `--concurrency`, `--timeout-ms`,
  `--budget-ms`, `--max-tokens`) and `STARLIGHT_REVIEW_KNOBS` apply unchanged.
- Cost: one full review per model per case. 16 cases x 3 models on a 106 KB diff is 48 reviews.

The CLI writes JSON (`--out`); it does not write D1. To keep history in D1, load the rows with
`wrangler d1 execute` or a small script over `arena/store.ts` `recordArenaRows`. That load step
is not built yet.

## Read the scores

The CLI prints:

```
model                                            catch %   false alarm %  p50 s   n
@cf/openai/gpt-oss-120b                          92.9%     0.0%           41.3    16 (14 seeded, 2 clean)
```

(Example layout only; these numbers are not a measurement.)

- **catch %**: caught seeded cases / seeded cases that ran. Skipped seeds do not count.
- **false alarm %**: clean controls with a high/critical finding / clean controls.
- **p50 s**: median wall time of one case (all chunks of one diff) for that model.
- **n**: rows behind the numbers. A rate over n=2 is an anecdote; read n before the percentage.

`GET /v1/arena/scores` (bearer token, like `/v1/reviews`) returns the `arena_scores` view from D1
plus the recommendation below. The view and the CLI use the same definitions (`scoreRows` in
`arena/score.ts`, tested against the view on node:sqlite).

## Promotion rule

`recommendGateModels(scores, { minCatch: 0.9, maxFalseAlarm: 0.1, minN: 20 })` returns the models
that qualify and the reasons for every model. A model qualifies only when all of these hold:

1. at least `minN` seeded cases (default 20);
2. catch rate at or above `minCatch` (default 90%);
3. at least one clean control, with a false-alarm rate at or below `maxFalseAlarm` (default 10%);
4. the gate itself would accept it: a known reviewer family in `MODEL_FAMILIES` and not a
   Claude/Anthropic model. GLM and DeepSeek fail this today until the estate adds their families
   to `tools/cross-review.mjs` and `tools/lib/harness-identity.mjs`.

Thresholds are overridable with `STARLIGHT_ARENA_MIN_CATCH`, `STARLIGHT_ARENA_MAX_FALSE_ALARM`
(0 to 1) and `STARLIGHT_ARENA_MIN_N` (positive integer), for the Worker route and the CLI. A
malformed value is refused (503 on the route, an error in the CLI).

The output is a recommendation. Promoting a model means a human edits `STARLIGHT_GATE_MODELS` in
`wrangler.jsonc` and redeploys.

## Nightly run: disabled

`wrangler.jsonc` carries a commented-out nightly cron (`30 3 * * *`). It stays off until Frank
approves (estate rule: crons are off until Frank approves). Enabling it also needs a `scheduled()`
branch for that cron in `src/index.ts` and a source for the base diff; neither is built.

## First data point: 2026-11-09, n=1

Measured on `frankxai/starlight-estate` PR #96 (106 KB diff, one streamed call per model), with
one seed: an auth bypass in `trustSignoff`, `viaBot = login === '' || allowlist` (the shape of
`auth-empty-identity-trusted`).

| Model | Knobs | Caught the seed | False positives |
|-------|-------|-----------------|-----------------|
| DeepSeek V4.1 Flash | reasoning none | yes | none reported |
| GLM-5.3 | reasoning low | yes | none reported |
| gpt-oss-120b | reasoning high | yes | 1 (misread a guard inside `if (!valid.length)`) |

**n=1 per model.** This is one seed on one diff, measured before the arena existed. It says the
three models can see this defect. It says nothing about catch rate or false-alarm rate, and it
does not qualify any model under the promotion rule (needs n >= 20).

## Not verified

- No arena run against live Workers AI yet; the tests use stubbed models.
- `migrations/0002_arena.sql` is tested on node:sqlite (CTE, window functions and the view). It
  has not been applied to a real D1 database.
- The seed patterns were checked against a fixture diff shaped like estate `tools/` code, not
  against a corpus of real PR diffs; expect some seeds to be skipped on a given base diff.
