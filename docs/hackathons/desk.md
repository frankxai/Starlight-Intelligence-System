# The Desk

One question in. A cited brief and a signed receipt out.

Route `/desk` in `site/`. Engine in `site/src/lib/desk/`. Zero new dependencies:
the model calls are `fetch` against the OpenAI-compatible chat-completions
dialect, so there is nothing to install on the day and nothing in a lockfile to
break.

## The cascade

| Stage | Model | Why this one |
|---|---|---|
| retrieve | Tavily | sources arrive with their URLs, so a claim can be cited |
| extract | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | the work is mechanical; a small model does it and must quote |
| synthesize | `deepseek-ai/DeepSeek-V4-Flash-0731` | the work is judgment; the large model writes and cites |
| judge | `openai/gpt-oss-120b` | a different family scores the result, so the writer is not its own referee |

Grounding rate is computed from the brief's own text: the share of extracted
claims whose `[n]` marker survives into the writing. It is never asked of a
model. A number a model reports about itself is a number nobody should read out.

## Running it

```bash
cd site
NEBIUS_API_KEY=…            # Token Factory
TAVILY_API_KEY=…            # retrieval
SIS_SIGNING_KEY="$(cat .starlight/keys/sip-signing.key)"   # optional; unsigned without it
pnpm dev                    # then open /desk
```

Optional: `NEBIUS_BASE_URL` (defaults to the Token Factory endpoint),
`TAVILY_URL`, `DESK_ISSUER`.

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
| The cascade runs, drops uncitable claims, computes grounding, and issues a complete receipt | `pnpm test:desk` — 10 tests, every provider call mocked |
| A failed stage is recorded and the run still yields a readable receipt | same suite, `PARTIAL` verdict case |
| A throttled stage is retried once | same suite |
| The route refuses without keys, caps question length, and rate-limits room mode | `src/app/api/desk/run/route.ts` |
| The whole path works against a live provider | run against a local stub: `PASS`, grounding 1.0, judge 8.6, four stages timed, receipt signed |

Not yet proven: the browser path. This sandbox cannot upgrade the dev server's
HMR WebSocket, so React never hydrates here and no click reaches the console.
Smoke the page in a browser on the demo laptop before the day; that is Tuesday
check 10.

## A CSP bug this work found

`next.config.ts` sent the production Content-Security-Policy in development too,
and React's development build needs `eval()`. Every client component on the site
was inert under `pnpm dev`: the page rendered and nothing responded. Development
now gets `'unsafe-eval'` and the HMR websocket; production keeps the tight
policy. Without this the local fallback in the runbook's risk table was a dead
end.

Built on SIP.
