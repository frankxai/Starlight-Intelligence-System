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
| `STARLIGHT_REVIEW_TIMEOUT_MS` | var | per request, default 120000; one retry |
| `STARLIGHT_REVIEW_BUDGET_MS` | var | whole review, default 720000 (the consumer has 15 minutes) |
| `STARLIGHT_REVIEW_MAX_TOKENS` | var | default 16000 |
| `STARLIGHT_REVIEW_RESPONSE_FORMAT` | var | `json_object` (default), `json_schema`, or `off` |

Then deploy: `$W deploy`.

## 4. How cf-review runs

1. A `pull_request` event (opened, reopened, synchronize, ready_for_review, not a draft) on an
   `agent/*`, `codex/*` or `cf-*` branch in a routed repo becomes a `cf_review` outbox row.
2. The outbox sends `{owner, repo, number, sha, branch}` to the `starlight-review` queue.
3. The queue consumer fetches the PR with the App token, skips closed, draft, fork and moved heads,
   and skips a SHA that already has a `review_runs` row or a comment with its
   `<!-- starlight-cf-review:<sha> -->` marker.
4. The diff is split per file into chunks of at most 24 KB (a large file by hunk, then by line).
   A file GitHub returns no patch for, a truncated file list, or one line over 24 KB is a block.
5. Every model reviews every chunk with the prompt and strict JSON shape from
   `frankxai/starlight-estate` `tools/cross-review.mjs` at df48a91. Any error, timeout or answer
   that is not exactly `{"verdict","findings"}` is retried once, then counts as a block.
6. The head is re-read; if it moved, nothing is posted. Otherwise one comment is posted and a
   `review_runs` row written. `GET /v1/reviews?repo=owner/name&pr=N&sha=<prefix>&limit=50` (any
   agent token) lists them.

`@codex review` stays available behind `"reviewRule": "codex"` in `ROUTING`. Codex quota is out as
of 2026-11-09, which is why cf-review is the default.

## 5. Two tiers

Measured 2026-11-09 on PR #96's real diff (106 KB, 5 chunks) through gateway `starlight-review`:

| Model | Result |
|---|---|
| `@cf/openai/gpt-oss-120b` | 4 chunks passed with zero findings; 1 high finding that was a false positive |
| `@cf/qwen/qwen3.8-27b` | timed out (Workers AI 3046) on 4 of 5 chunks |
| `@cf/zai-org/glm-5.3` | timed out or returned 8008 on a 28 KB chunk |
| `@cf/deepseek-ai/deepseek-v4.1-flash-1017` | timed out or returned 8008 on a 28 KB chunk |

So Cloudflare-hosted open models are a triage tier, not gate-grade. The rule:

- **Gate tier**: every model that ran is listed in `STARLIGHT_GATE_MODELS`, none is the maker's
  family (gpt-ci cannot sign `codex/*` or other OpenAI-made branches), every chunk answered, and
  all models passed with no high or critical finding. Only then is the first line
  `starlight-signoff: harness=<family>-ci verdict=pass sha=<40-hex>`, posted as the App bot.
- **Triage tier**: anything else. The comment is advisory, lists findings and errors, says it is
  not a sign-off, and carries no trailer. Findings are flattened and the word `starlight-signoff`
  is defused, so model output cannot smuggle a trailer in.

With `STARLIGHT_GATE_MODELS` empty (the default), cf-review never signs. A block is always posted
as advisory; it does not post a `verdict=block` trailer.

GLM and DeepSeek ids are refused outright today: the family map copied from the estate knows kimi,
qwen, grok and gpt only. Add a family there and in `tools/lib/harness-identity.mjs` first.

For a gate-tier sign-off to count in pr-gate (`frankxai/starlight-estate` `tools/pr-gate.mjs`), the
App's bot login `<slug>[bot]` must be in the gate's `STARLIGHT_SIGNOFF_BOTS`: `-ci` harness names are
accepted only from an allowlisted bot, never from an OWNER, MEMBER or COLLABORATOR account.

## Not verified

- No deploy, and no live `env.AI.run` from this Worker. The input is chat-style `messages`; the
  answer parser accepts `{response}`, OpenAI `choices`, and Responses API `output`. If a model
  rejects `response_format`, set `STARLIGHT_REVIEW_RESPONSE_FORMAT=off`.
- Whether the manifest conversion's `webhook_secret` is 32+ characters.
- `wrangler types` / `tsc` were not run; the TypeScript is exercised only through node's type
  stripping in the test suite.
- The `review` rule in `src/events.ts` reads `pull_request_review` events, which the manifest does
  not subscribe to. Add that event if you switch `reviewRule` back to `codex`.
