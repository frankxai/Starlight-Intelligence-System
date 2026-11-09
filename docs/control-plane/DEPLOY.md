# Deploying the control plane with cf-review

What this covers: creating the Cloudflare resources (queue, D1, Workers AI binding, AI Gateway,
Workers Logs), registering the GitHub App from `services/starlight-control-plane/app/manifest.json`,
storing secrets without printing them, and how the two review tiers work.

Status as of 2026-11-09: code and tests only. Nothing here has been deployed, and the Workers AI
call shape has not been run against a live binding from this Worker (see "Not verified" below).

Run every command from the repo root. Each `wrangler` call uses `--config` so no `cd` is needed.

```bash
W="npx wrangler --config services/starlight-control-plane/wrangler.jsonc"
```

## 1. Cloudflare resources

```bash
# Review queue plus a dead-letter queue for reviews that kept throwing (GitHub errors, not model errors).
npx wrangler queues create starlight-review
npx wrangler queues create starlight-review-dlq

# D1 for review_runs. Copy the printed database_id into wrangler.jsonc (d1_databases[0].database_id).
npx wrangler d1 create starlight-reviews
$W d1 migrations apply starlight-reviews --remote
```

AI binding: `"ai": { "binding": "AI" }` is already in `wrangler.jsonc`. Workers AI needs no extra
resource, only an account with Workers AI enabled.

AI Gateway: create a gateway with id `starlight-review` in the dashboard (AI > AI Gateway > Create
Gateway). Every review request goes through it, via `env.AI.run(model, input, { gateway: { id: 'starlight-review' } })`,
so its logs show each request, latency, token counts and errors such as 3046 (timeout) or 8008.
Turn on gateway logging; leave caching off unless you want identical diffs answered from cache.

Workers Logs: `"observability": { "logs": { "enabled": true } }` is set. Each review logs one
`cf-review` line with PR, SHA, tier and verdict (never the comment body or any secret).

## 2. GitHub App from the manifest

`app/manifest.json` requests: contents read, pull_requests write, issues write, checks write,
metadata read; events pull_request, issues, check_suite, workflow_run, issue_comment. Replace
`CONTROL-PLANE-HOST.example` in `hook_attributes.url` and `redirect_url` with the Worker's route
first.

One-click flow: GitHub creates the App when a form POSTs the manifest to it. Save this as a local
file, open it in a browser, and click the button (use `https://github.com/settings/apps/new` for a
personal account):

```html
<form action="https://github.com/organizations/ORG/settings/apps/new?state=starlight" method="post">
  <input type="hidden" name="manifest" id="manifest">
  <button type="submit">Create starlight-control-plane</button>
</form>
<script>
  fetch('manifest.json').then((r) => r.text()).then((t) => { document.getElementById('manifest').value = t; });
</script>
```

GitHub redirects to `redirect_url?code=...&state=starlight`. The code is single use and expires in
an hour. Exchange it and pipe each secret straight into `wrangler secret put` without printing it:

```bash
umask 077
CONV="$(mktemp)"
gh api -X POST "app-manifests/$CODE/conversions" > "$CONV"
# GitHub hands out PKCS#1 ("BEGIN RSA PRIVATE KEY"); WebCrypto reads only PKCS#8.
jq -r .pem "$CONV" | openssl pkcs8 -topk8 -nocrypt | $W secret put GITHUB_APP_PRIVATE_KEY
jq -r .id "$CONV" | $W secret put GITHUB_APP_ID
jq -r .webhook_secret "$CONV" | $W secret put GITHUB_WEBHOOK_SECRET
jq -r .slug "$CONV"   # not secret: the bot login is <slug>[bot]
shred -u "$CONV" 2>/dev/null || rm -f "$CONV"
```

The webhook route refuses a secret shorter than 32 characters. If the generated one is shorter,
generate one (`openssl rand -hex 32`) into your password manager, paste it into the App settings,
and pipe it from the password manager's CLI into `$W secret put GITHUB_WEBHOOK_SECRET`.

Existing App with a downloaded key instead:
`openssl pkcs8 -topk8 -nocrypt -in app.pem | $W secret put GITHUB_APP_PRIVATE_KEY`.

Install the App on the repos it should act on, then add them to `ROUTING.repos` and put
`<slug>[bot]` in `ROUTING.selfLogins`.

## 3. Secrets and vars

| Name | Kind | What |
|---|---|---|
| `GITHUB_APP_ID` | secret | App id from the conversion |
| `GITHUB_APP_PRIVATE_KEY` | secret | PKCS#8 PEM |
| `GITHUB_WEBHOOK_SECRET` | secret | 32+ characters |
| `AGENT_TOKENS` | secret | sha256(token) to identity table (`scripts/mint-tokens.mjs`) |
| `ROUTING` | var | repos, selfLogins, `reviewRule` (`cf-review` default, `codex` for the old `@codex review` comment) |
| `STARLIGHT_REVIEW_MODELS` | var | comma list of Workers AI model ids; no Claude or Anthropic id is accepted |
| `STARLIGHT_GATE_MODELS` | var | models trusted to sign; empty by default |
| `STARLIGHT_REVIEW_GATEWAY` | var | AI Gateway id, default `starlight-review` |
| `STARLIGHT_REVIEW_TIMEOUT_MS` | var | longest wait for the first streamed chunk and between chunks, default 120000 |
| `STARLIGHT_REVIEW_BUDGET_MS` | var | whole review, default 720000 (the consumer has 15 minutes) |
| `STARLIGHT_REVIEW_MAX_TOKENS` | var | `max_completion_tokens`, default 32000 (reasoning counts against it) |
| `STARLIGHT_REVIEW_CHUNK_BYTES` | var | largest request, default 98304 (96 KB), still split per file |
| `STARLIGHT_REVIEW_CONCURRENCY` | var | chunks in flight per model, default 3 |
| `STARLIGHT_REVIEW_KNOBS` | var | JSON `{"<model id or suffix>": {"reasoning_effort": "low"}}` merged over the defaults below; `messages`, `stream`, `response_format` and `model` are refused |

Then deploy: `$W deploy`.

## 4. How cf-review runs

1. A `pull_request` event (opened, reopened, synchronize, ready_for_review, not a draft) on an
   `agent/*`, `codex/*` or `cf-*` branch in a routed repo becomes a `cf_review` outbox row.
2. The outbox sends `{owner, repo, number, sha, branch}` to the `starlight-review` queue.
3. The queue consumer fetches the PR with the App token, skips closed, draft, fork and moved heads,
   and skips a SHA that already has a `review_runs` row or a comment with its
   `<!-- starlight-cf-review:<sha> -->` marker.
4. The diff is split per file into chunks of at most 96 KB (a large file by hunk, then by line).
   A file GitHub returns no patch for, a truncated file list, or one line over the ceiling is a block.
5. Every model reviews every chunk with the prompt and strict JSON shape from
   `frankxai/starlight-estate` `tools/cross-review.mjs` at df48a91, called as
   `env.AI.run(model, { messages, stream: true, max_completion_tokens: 32000, temperature: 0, ...knobs }, { gateway: { id } })`.
   No `response_format` is sent. The model may reason first and must end with one JSON object; the
   last balanced `{"verdict"...}` object is validated as exactly `{"verdict","findings"}`. Anything
   else is a block, and `finish_reason: "length"` with no complete object is a block with reason
   `truncated`. Workers AI 3046, 3040, 429, 503, 8008 and timeouts get up to 3 attempts with
   backoff (2 s, 4 s); every other error blocks at once. One model's chunks run at most 3 at a time
   and at most 20 request starts per minute per model.

   Default knobs, matched on the end of the model id:

   | Model | Knobs |
   |---|---|
   | `deepseek-v4.1-flash-1017` | `reasoning_effort: "low"` |
   | `glm-5.3` | `reasoning_effort: "low"` |
   | `qwen3.8-27b` | `reasoning_effort: "low"` |
   | `gpt-oss-120b` | `reasoning_effort: "high"` |
6. The head is re-read; if it moved, nothing is posted. Otherwise one comment is posted and a
   `review_runs` row written. `GET /v1/reviews?repo=owner/name&pr=N&sha=<prefix>&limit=50` (any
   agent token) lists them.

`@codex review` stays available behind `"reviewRule": "codex"` in `ROUTING`. Codex quota is out as
of 2026-11-09, which is why cf-review is the default.

## 5. Two tiers

The first benchmark (2026-11-09, PR #96's diff, 106 KB in 5 chunks) is invalid and says nothing
about the models. The harness sent non-streaming requests with `response_format: json_object` and
default reasoning effort:

- AI Gateway's request timeout counts until the first chunk, so long non-streamed reasoning calls
  hit Workers AI 3046 and 8008. Cloudflare recommends `stream: true` for large and reasoning models.
- JSON Mode does not support streaming and is listed only for small legacy models.
- `@cf/deepseek-ai/deepseek-v4.1-flash-1017` reasons at `high` effort by default; its 12k-token
  budget was consumed entirely by reasoning.

`@cf/deepseek-ai/deepseek-v4.1-flash-1017` and `@cf/zai-org/glm-5.3` (Cloudflare's frontier
recommendations, 1M context) are gate-tier candidates once `scripts/review-benchmark.mjs` shows
them catching a seeded defect on a real diff. Until then `STARLIGHT_GATE_MODELS` stays empty.

Run the benchmark from the repo root on a real PR diff with one defect seeded into it:

```bash
gh pr diff 96 > /tmp/pr96.diff   # then add one real defect to a hunk in /tmp/pr96.diff
CLOUDFLARE_ACCOUNT_ID=<account id> CLOUDFLARE_API_TOKEN=<Workers AI token> \
  node services/starlight-control-plane/scripts/review-benchmark.mjs \
    --diff /tmp/pr96.diff \
    --models @cf/deepseek-ai/deepseek-v4.1-flash-1017,@cf/zai-org/glm-5.3 \
    --gateway starlight-review
```

It prints, per model: verdict, findings, completion tokens, reasoning chars, seconds and
`finish_reason`. It never prints the token. It calls
`POST https://api.cloudflare.com/client/v4/accounts/<id>/ai/v1/chat/completions` with the same
streaming, knob, retry and parse code as the Worker (imported from `src/review.ts`); `--gateway` is
recorded in the output, not routed. A candidate qualifies when it blocks the seeded defect with a
high or critical finding on it, with no errors and no `truncated`.

The rule:

- **Gate tier**: every model that ran is listed in `STARLIGHT_GATE_MODELS`, none is the maker's
  family (gpt-ci cannot sign `codex/*` or other OpenAI-made branches), every chunk answered, and
  all models passed with no high or critical finding. Only then is the first line
  `starlight-signoff: harness=<family>-ci verdict=pass sha=<40-hex>`, posted as the App bot.
- **Triage tier**: anything else. The comment is advisory, lists findings and errors, says it is
  not a sign-off, and carries no trailer. Findings are flattened and the word `starlight-signoff`
  is defused, so model output cannot smuggle a trailer in.

With `STARLIGHT_GATE_MODELS` empty (the default), cf-review never signs. A block is always posted
as advisory; it does not post a `verdict=block` trailer.

GLM and DeepSeek ids are refused outright in the Worker today: the family map copied from the
estate knows kimi, qwen, grok and gpt only. Add a family there and in `tools/lib/harness-identity.mjs`
first. The benchmark CLI skips that check, because it measures and never signs.

For a gate-tier sign-off to count in pr-gate (`frankxai/starlight-estate` `tools/pr-gate.mjs`), the
App's bot login `<slug>[bot]` must be in the gate's `STARLIGHT_SIGNOFF_BOTS`: `-ci` harness names are
accepted only from an allowlisted bot, never from an OWNER, MEMBER or COLLABORATOR account.

## Not verified

- No deploy, no live `env.AI.run` from this Worker, and no live run of
  `scripts/review-benchmark.mjs`. The stream reader accepts OpenAI-style `choices[].delta`
  (`content`, `reasoning_content`, `reasoning`) and Workers AI `{response}` events, and still reads a
  non-streamed `{response}`, `choices` or Responses API `output` answer. The exact event shape each
  model streams and the error payload inside a stream are inferred from Cloudflare docs, not observed.
- Whether `reasoning_effort` is accepted by `glm-5.3`, `qwen3.8-27b` and `gpt-oss-120b`. A model that
  rejects it fails closed with a non-retryable error; drop the knob with `STARLIGHT_REVIEW_KNOBS`.
- Whether the manifest conversion's `webhook_secret` is 32+ characters.
- `wrangler types` / `tsc` were not run; the TypeScript is exercised only through node's type
  stripping in the test suite.
- The `review` rule in `src/events.ts` reads `pull_request_review` events, which the manifest does
  not subscribe to. Add that event if you switch `reviewRule` back to `codex`.
