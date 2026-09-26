# The Desk

One question in. A cited brief, a signed receipt, and a vault that argues with
the next run.

Route `/desk` in `site/`. Engine in `site/src/lib/desk/`. Zero new dependencies:
the model calls are `fetch` against the OpenAI-compatible chat-completions
dialect, so there is nothing to install on the day and nothing in a lockfile to
break.

## The cascade

| Stage | Model | Why this one |
|---|---|---|
| recall | none | keyword overlap over the vault's own lines; no model, no index, no network, so this stage cannot be the one that fails |
| retrieve | Tavily | sources arrive with their URLs, so a claim can be cited |
| extract | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | the work is mechanical; a small model does it and must quote |
| synthesize | `deepseek-ai/DeepSeek-V4-Flash-0731` | the work is judgment; the large model writes and cites |
| contradict | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | comparing two short claim lists is mechanical again |
| judge | `openai/gpt-oss-120b` | a different family scores the result, so the writer is not its own referee |
| remember | none | the run's claims append to the vault as beliefs the next run must face |

## Memory

`src/lib/desk/vault.ts` puts one interface, `VaultStore`, in front of two stores.

- **The file store**, the default on a laptop: one JSONL line per belief,
  append-only, readable with `cat`, portable with `cp`. No database to run,
  nothing to migrate, and the founder can read their own memory without asking
  anyone for access. `DESK_VAULT_PATH` sets the file; otherwise it is
  `.starlight/desk-vault.jsonl`.
- **The Redis store**, for a deployment: the same JSON lines in one Redis list
  over the Upstash REST API, called with `fetch`. It is chosen when
  `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set (the names Vercel's
  Marketplace injects), with `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` as fallbacks. `DESK_VAULT_NAMESPACE` separates
  vaults. The receipt names the list, never the URL or the token.

A deployed Desk with neither has no vault. It does not write to `/tmp`, which on
serverless is per instance and erased between invocations; the recall and
remember stages record `skipped` with the note "no durable vault configured".

Recall uses keyword overlap rather than embeddings. That is the point: the pass
costs nothing, needs no index to rebuild, and still runs when the venue Wi-Fi
does not.

What memory is for here is not recalling agreement. It is the moment the Desk
says something the vault already said otherwise, and says so on screen with both
claims side by side. A contradiction naming a belief that was not recalled is
dropped rather than shown.

Every write is best-effort by design: a vault that refuses the write records a
failed stage, the verdict turns `PARTIAL`, and the run still hands over its brief
and its receipt. Memory is worth having and worth nobody's demo.

Grounding rate is computed from the brief's own text: the share of extracted
claims whose `[n]` marker survives into the writing. It is never asked of a
model. A number a model reports about itself is a number nobody should read out.

## Running it

```bash
cd site
NEBIUS_API_KEY=…            # Token Factory
TAVILY_API_KEY=…            # retrieval
SIS_SIGNING_KEY="$(cat .starlight/keys/sip-signing.key)"   # optional, local only; unsigned without it
pnpm dev                    # then open /desk
```

Optional: `NEBIUS_BASE_URL` (defaults to the Token Factory endpoint),
`TAVILY_URL`, `DESK_ISSUER`.

## Deployed

The route spends money on every run, so it decides who may run before anything
is spent (`src/lib/desk/access.ts`, a pure function with its own tests).

| Configuration | Who runs | Counted by |
|---|---|---|
| Redis configured | everyone | Redis: six runs a minute per address (the address is stored only as a sha256 digest) and one ceiling per UTC day across everyone, `DESK_DAILY_RUN_LIMIT`, default 200 |
| Laptop (not Vercel) | everyone | the same rules in memory |
| Vercel, no Redis | only a request carrying `authorization: Bearer <DESK_ACCESS_TOKEN>` | nothing; everyone else gets 503 |

A wrong token gets 401. A valid token skips the per-address window, so an
operator is not throttled by a room sharing one address, and still counts
against the daily ceiling. A counter that cannot be reached fails closed with
503. The daily count happens after the request is validated, so malformed
requests cannot use up the day.

**Signing.** A key on a host is a key the host's operators can use.
`src/lib/desk/signing.ts` signs with `DESK_SIGNING_KEY`, a separate Ed25519 key
that speaks for this Desk only and whose public half is registered as the
Desk's. On Vercel the personal `SIS_SIGNING_KEY` is never read. With no Desk
key the receipt ships as an unsigned draft.

Without a signing key the run still produces a receipt, as an unsigned draft:
a record of the run rather than a proof of it. With the key the route returns a
DSSE envelope whose keyid matches the registry entry, so the same receipt
verifies at `starlightintelligence.ai/verify` from a phone.

## Prices

`src/lib/desk/pricing.ts` ships with every price null. A null price means the
Desk reports tokens and seconds and withholds euros. Nothing estimates. Day-prep
step F4 fills the table from the Token Factory console and dates each entry;
from that moment every euro on screen is a figure a person checked, and the edge
meter can put the closed-API baseline beside it.

## What is proven, and where

| Claim | Evidence |
|---|---|
| The cascade runs, drops uncitable claims, computes grounding, and issues a complete receipt | `pnpm test:desk`: 58 tests, every provider and Redis call mocked and asserted |
| A failed stage is recorded and the run still yields a readable receipt | same suite, `PARTIAL` verdict case |
| A throttled stage is retried once | same suite |
| A run writes its claims to the vault and the next run reads them back, contradicts one, and keeps both | same suite, two runs against one temporary vault |
| An unwritable vault costs the run its memory and not its brief | same suite, `PARTIAL` verdict with the brief intact |
| The route refuses without keys, caps question length, and rate-limits room mode | `src/app/api/desk/run/route.ts` |
| The access policy, the durable counters, the Redis vault and the key choice behave as the table above says | `access.test.mjs`, `run-limit.test.mjs`, `vault.test.mjs`, `signing.test.mjs` in the same suite |
| The whole path works against a live provider | run against a local stub: `PASS`, grounding 1.0, judge 8.6, seven stages timed, 2 beliefs recalled, 1 contradiction, 3 written, receipt signed |
| The browser path works, hydrates, and fits a phone | production build served locally, a full run driven through the UI: zero page errors and zero horizontal overflow at 1440 and 375. Screenshots in `evidence/` |

The one caveat: `next dev` in a sandbox whose WebSocket cannot upgrade never
hydrates, which is how the CSP bug below was found. The production path is
proven; still open the page once on the demo laptop (Tuesday check 10).

## The edge meter

`src/lib/desk/edge-meter.ts` prices the same run twice: the cascade's own euros
against what those identical token counts would cost on a closed API at its
published list price, plus rubric, seconds, and the share of claims that reached
the brief. Both sides stay "unpriced" until the console numbers land, and the
multiple is withheld rather than guessed.

## Room mode

A QR of the page, large enough to scan from the back of a room. Every question
the room asks runs the same stages and leaves the same receipt, so anyone
watching can check what their own answer cost.

## A CSP bug this work found

`next.config.ts` sent the production Content-Security-Policy in development too,
and React's development build needs `eval()`. Every client component on the site
was inert under `pnpm dev`: the page rendered and nothing responded. Development
now gets `'unsafe-eval'` and the HMR websocket; production keeps the tight
policy. Without this the local fallback in the runbook's risk table was a dead
end.

Built on SIP.
