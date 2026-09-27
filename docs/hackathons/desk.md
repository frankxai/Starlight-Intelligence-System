# The Desk

One question in. A cited brief, a receipt (signed once every price is dated),
and a vault that argues with the next run.

Route `/desk` in `site/`. Engine in `site/src/lib/desk/`. Zero new dependencies:
the model calls are `fetch` against the OpenAI-compatible chat-completions
dialect, so there is nothing to install on the day and nothing in a lockfile to
break.

## The cascade

| Stage | Model | Why this one |
|---|---|---|
| recall | none | keyword overlap over the vault's own lines; no model, no index, and with the file store no network, so the venue Wi-Fi cannot be what fails it |
| retrieve | Tavily | sources arrive with their URLs, so a claim can be cited |
| extract | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | the work is mechanical; a small model does it and must quote, and every quote is checked against its source |
| synthesize | `deepseek-ai/DeepSeek-V4-Flash-0731` | the work is judgment; the large model writes and cites |
| contradict | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | comparing two short claim lists is mechanical again |
| judge | `openai/gpt-oss-120b` | a different family scores the result, so the writer is not its own referee |
| remember | none | the run's claims append to the vault as beliefs the next run must face |

A stage is `ok` only when its output is usable. Synthesis fails unless the brief
carries the six sections as Markdown headings, each once and in order; a
section's name inside a sentence is not a heading. The note says which are
missing, or "out of order or repeated", and never quotes model text. The brief
still goes back to the caller and the judge still scores it, but the verdict
cannot be `PASS`. The vault is unaffected: remember
writes the verified claims, never the brief. Contradict fails on an answer that
is not JSON or has no `contradictions` list ("invalid contradiction response");
an empty list is a valid answer. The judge fails ("unparsable verdict") unless
its score is a number, or a plain numeric string, from 0 to 10; `null`, `false`
or `""` is no score rather than a 0, and 11 is no score rather than a 10.

Run and receipt ids carry the start time and a 64-bit random nonce
(`run_<ms base 36>_<hex>`, `rcpt_<ms>_<hex>`), so two runs in the same
millisecond, and the beliefs they write, never share an id.

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
  `UPSTASH_REDIS_REST_TOKEN` as fallbacks. The receipt names the list, never
  the URL or the token.

Every Redis key the Desk uses sits under one namespace: `DESK_NAMESPACE`, else
the older `DESK_VAULT_NAMESPACE`, else `default`. The vault is
`desk:<ns>:vault`; the per-address window `desk:<ns>:rl:<digest>:<window>`; the
daily run count `desk:<ns>:day:<date>`; the daily token meter
`desk:<ns>:tok:<date>`. Two Desks on one database with different namespaces
share no memory and no counters.

Memory belongs to a trusted identity (`memoryAccess` in `access.ts`, applied by
`vaultForRun` in `vault.ts`):

| Where | Who asks | Memory |
|---|---|---|
| Laptop (not Vercel) | anyone | the vault as configured: the owner is the only caller |
| Vercel | a request with a valid `DESK_ACCESS_TOKEN` | the Redis store; with no Redis the route does not run at all |
| Vercel | anyone else | none. Recall and remember record `skipped`, "anonymous run: memory is operator-only"; nothing is read or written and no vault is listed as evidence |

A deployed vault is shared by everyone who reaches the URL, so without this
rule one stranger's run could plant beliefs the next stranger's run is then
checked against. The page itself sends no token, so on a deployment the public
page runs stateless; recall and contradictions show up for runs made with the
token.

An operator run on a deployment with no durable store has no vault. It does not
write to `/tmp`, which on serverless is per instance and erased between
invocations; the recall and remember stages record `skipped` with the note "no
durable vault configured".

Recall uses keyword overlap rather than embeddings. That is the point: the pass
costs nothing, needs no index to rebuild, and still runs when the venue Wi-Fi
does not.

What memory is for here is not recalling agreement. It is the moment the Desk
says something the vault already said otherwise, and says so on screen with both
claims side by side. A contradiction is shown only when it names a belief that
was recalled and one of this run's own claims, matched after the same
normalization the quote check uses; the screen then shows the run's claim text,
not the model's wording. Any other entry is dropped.

A vault line is read as a belief only when every field (`id`, `kind`,
`question`, `claim`, `quote`, `url`, `confidence`, `receiptId`, `at`) is present
with its type; any other line is skipped. A missing vault file reads as empty;
a file that exists but cannot be read (a directory, no permission, an I/O
error) fails recall with the note "vault could not be read".

Every write is best-effort by design: a vault that refuses the write records a
failed stage, the verdict turns `PARTIAL`, and the run still hands over its brief
and its receipt. Memory is worth having and worth nobody's demo.

## Quotes, and what the cited share means

Retrieved text can try to steer the extract model, so a claim is not trusted
because the model returned it. A claim survives only if its quote, normalized,
is a substring of the normalized text of the source whose URL it names: the
same text the extract stage was given. Normalization is Unicode NFKC, straight
quotes for curly ones, one hyphen for every dash, soft hyphens and zero-width
characters removed, lower case, whitespace collapsed. A quote shorter than 20
normalized characters is dropped. So is a real URL with an invented quote, and
a quote from one source filed under another's URL. Dropped claims never reach
the writer, the vault, or a citation; the extract stage's note counts them.

The extract prompt also wraps each source in `<source>` tags and says text
inside them is material to quote, never instructions. That is defence in depth;
the deterministic check above is the control.

The cited share (`groundingRate` in the code and the API) is computed from the
brief's own text: the share of verified claims whose `[n]` marker reached the
brief. It is never asked of a model. It says a checked quote stands behind each
cited claim. It does not show that the brief's sentences follow from those
quotes; nothing in the Desk tests that entailment.

On the page, the References list under the brief is built from the claims
(`referenceList` in `src/lib/desk/references.ts`): entry n is claim n, with its
quote and the title and URL of the source it quotes, so `[n]` in the brief and
`[n]` in the list always name the same thing. Retrieved sources are listed
separately and unnumbered.

## Running it

```bash
cd site
NEBIUS_API_KEY=…            # Token Factory
TAVILY_API_KEY=…            # retrieval
SIS_SIGNING_KEY="$(cat .starlight/keys/sip-signing.key)"   # optional, local only; unsigned without it
pnpm dev                    # then open /desk
```

Optional: `NEBIUS_BASE_URL` (defaults to the Token Factory endpoint),
`TAVILY_URL`, `DESK_ISSUER`, `DESK_NAMESPACE`, `DESK_DAILY_RUN_LIMIT`,
`DESK_DAILY_TOKEN_BUDGET`, `DESK_RUN_DEADLINE_MS`.

Tests: `pnpm run test:desk` (144 tests, every provider and Redis call mocked)
runs on Node 20 and 22 with no flag: `site/scripts/test/ts-resolve-hooks.mjs`
turns TypeScript into JavaScript with the site's own `typescript`
devDependency. `.github/workflows/desk-tests.yml` runs it, `test:vault-fetch`
and `tsc --noEmit` on a Node 20 and 22 matrix for every pull request that
touches the Desk. It deploys nothing.

## Deployed

The route spends money on every run, so it decides who may run before anything
is spent (`src/lib/desk/access.ts`, a pure function with its own tests).

| Configuration | Who runs | Counted by |
|---|---|---|
| Redis configured | everyone | Redis: six runs a minute per address (the address is stored only as a sha256 digest), one run ceiling per UTC day across everyone (`DESK_DAILY_RUN_LIMIT`, default 200), and one token budget per UTC day (below) |
| Laptop (not Vercel) | everyone | the same rules in memory |
| Vercel, no Redis | nobody, token or not | 503: a run nobody can meter is a run with no spend ceiling |

A wrong token gets 401. A valid token skips the per-address window, so an
operator is not throttled by a room sharing one address, and still counts
against the daily run ceiling and the token budget. A counter that cannot be
reached fails closed with 503. The daily counts happen after the request is
validated, so malformed requests cannot use up the day.

**The token budget.** A run count is not a spend ceiling: one run can cost far
more than another. `DESK_DAILY_TOKEN_BUDGET` (default 2,000,000; `0` closes the
Desk; anything unparsable falls back to the default) needs no prices. It works
as a reservation, in `run-limit.ts`:

- **Reserve, before any paid work.** One Redis `EVAL` reads the day's total and,
  in the same atomic step, either refuses with 429 and changes nothing (when the
  total plus one run's worst case would pass the budget), or adds that worst
  case to the total and refreshes the key's expiry. Every run reserves before it
  spends, so runs arriving at once cannot together pass the budget.
- **Give it back when no paid work happens.** If the daily run ceiling then
  refuses the request, or its counter cannot be reached, the reservation is
  returned before the refusal.
- **Reconcile, only on known usage.** After the run, when every model call ran
  once and reported both token counts, a second `EVAL` replaces the reservation
  with the tokens actually used; a reported zero counts as zero. Otherwise,
  meaning usage missing or malformed, a retry, or a reconcile call that fails,
  the full worst case stays charged, so spend the Desk cannot count is counted
  at its ceiling.

The worst case is a constant, `WORST_CASE_RUN_TOKENS` in `cascade.ts`, about
396,000 tokens. Every input a prompt can carry is capped: the question at 400
characters, 8 sources, 2,400 characters of text per source, titles at 200,
URLs at 512 (a longer one is dropped, since a cut URL cannot be cited), 12
claims of at most 400 characters in the prompts that carry them, 6 recalled
beliefs, 16,000 characters of brief for the judge, and a `max_tokens` on every
model call (2,048, 3,000, 800, 800). Each stage's bound is computed by building
its prompt with the run's own functions from inputs larger than every cap, at
three tokens per UTF-16 code unit (a byte-level tokenizer emits at most one
token per UTF-8 byte), plus 256 tokens of chat template, doubled for the one
retry. Real runs use a small fraction of it. A test sends a run oversized
multibyte inputs and checks every request fits its stage's bound.

**The deadline.** A run has one deadline, `DESK_RUN_DEADLINE_MS` (default
55,000, clamped to 5,000 to 55,000), counted from the start of the request. One
`AbortController` carries it to every provider, retrieval and vault call. A
stage not started when it passes records `skipped` "deadline reached"; a stage
it cuts off records `failed` "deadline reached" and is not retried; the run
still returns its receipt. The route exports `maxDuration = 60`, which leaves
room after the deadline for the token record (3 s timeout) and signing.

**Signing.** A key on a host is a key the host's operators can use.
`src/lib/desk/signing.ts` signs with `DESK_SIGNING_KEY`, a separate Ed25519 key
that speaks for this Desk only and whose public half is registered as the
Desk's. On Vercel the personal `SIS_SIGNING_KEY` is never read. With no Desk
key the receipt ships as an unsigned draft.

A run that is not cost-complete (see Prices) is never signed, key or no key.
The v1 receipt must state a euro total and cannot say "unknown", so signing it
would assert a total that leaves out unpriced paid work. The route returns the
draft with `signed: false` and `unsignedReason` "cost-incomplete: signing would
assert a total the Desk cannot vouch for".

An unsigned draft records the run; it proves nothing about who ran it. With the
key and a cost-complete run the route returns a DSSE envelope whose keyid
matches the registry entry, so the same receipt verifies at
`starlightintelligence.ai/verify` from a phone.

## Prices

`src/lib/desk/pricing.ts` ships with every price null, Tavily's per-call price
included. A null price means the Desk reports tokens and seconds and withholds
euros. Nothing estimates. Day-prep step F4 fills the table from the Token
Factory and Tavily consoles and dates each entry; from that moment every euro on
screen is a figure a person checked, and the edge meter can put the closed-API
baseline beside it. A price counts only when its rates are finite and zero or
more and its date is a real `YYYY-MM-DD` date; a negative, `NaN` or undated
entry stays unpriced.

A run is cost-complete only when every stage that did paid work carries a euro
figure: each model stage that ran, and retrieval. A model stage gets a figure
only when its call reported both token counts on every attempt. A missing or
malformed usage report, a failed attempt before a retry, or a call cut off by
the deadline all leave its usage unknown, and it gets no figure, however the
price table reads. Explicit zero counts are a known zero only when one
completed attempt reported both. Retrieval gets a figure only when its number
of billable calls is known; a failed retrieval is "call count unknown", since a
per-call price does not make an unknown count a total. When a run is not
cost-complete:

- each gap has no `costEur` and a note ending "unpriced", "usage unreported"
  or "call count unknown";
- the receipt carries one evidence entry per reason, such as `{ kind:
  "cost-incomplete", ref: "usage unreported: <stages>" }`;
- the unsigned reason names the unaccounted stages, and nothing secret;
- the receipt records a policy decision, `{ gate: "sign", decidedBy: "policy",
  outcome: "rejected" }`, whose note says `totals.costEur` is the subtotal of
  priced stages only, because v1 cannot say "unknown" in that field;
- the route returns `draft: true` and `costEurMeaning: "priced-stage subtotal"`;
- the page shows "unpriced" or "subtotal", never a bare total;
- the receipt is not signed.

With the shipped table that is every run until F4 is done.

## What is proven, and where

| Claim | Evidence |
|---|---|
| The cascade runs, drops uncitable claims, computes the cited share, and issues a complete receipt | `pnpm test:desk`: 144 tests, every provider and Redis call mocked and asserted, on Node 20 and 22 |
| A quote that is not in the source its URL names is dropped before the brief, the vault and the citations | same suite: fabricated quote, quote filed under the wrong URL, short quote, whitespace and quote-style differences that still pass, a source that tries to close its own delimiter |
| A failed stage is recorded and the run still yields a readable receipt | same suite, `PARTIAL` verdict case |
| A throttled stage is retried once | same suite |
| A run writes its claims to the vault and the next run reads them back, contradicts one, and keeps both | same suite, two runs against one temporary vault |
| An unwritable vault costs the run its memory and not its brief | same suite, `PARTIAL` verdict with the brief intact |
| A deployed anonymous run touches no memory | same suite, a vault whose fetch fails the test if called |
| No request exceeds its stage's share of the worst case, and the token meter refuses and records as described | same suite, oversized multibyte run; `run-limit.test.mjs` against a recorded fetch |
| The deadline stops the run and the receipt still ships | same suite, a provider that hangs until its signal aborts |
| An unpriced paid stage makes the receipt cost-incomplete and unsigned | same suite, with the shipped table, models priced but Tavily not, and everything priced |
| The route refuses without keys, caps question length, and rate-limits room mode | `src/app/api/desk/run/route.ts` |
| The access policy, the durable counters, the Redis vault and the key choice behave as the tables above say | `access.test.mjs`, `run-limit.test.mjs`, `vault.test.mjs`, `signing.test.mjs` in the same suite |
| The whole path works against a live provider | run against a local stub before the quote check, token meter, deadline and cost-complete rule landed: `PASS`, cited share 1.0, judge 8.6, seven stages timed, 2 beliefs recalled, 1 contradiction, 3 written, receipt signed. Not yet re-run; with today's null prices the same run would ship unsigned |
| The browser path works, hydrates, and fits a phone | production build served locally, a full run driven through the UI: zero page errors and zero horizontal overflow at 1440 and 375, before this change. Screenshots in `evidence/` |

The one caveat: `next dev` in a sandbox whose WebSocket cannot upgrade never
hydrates, which is how the CSP bug below was found. The production path is
proven; still open the page once on the demo laptop (Tuesday check 10).

## The edge meter

`src/lib/desk/edge-meter.ts` prices the same run twice: the cascade's own euros
against what those identical token counts would cost on a closed API at its
published list price, plus rubric, seconds, and the cited share. The Desk's own
euros show only for a cost-complete run. Both sides stay "unpriced" until the
console numbers land, and the multiple is withheld rather than guessed. When a
model call did not report its token counts, the baseline shows "usage
unreported" instead of a figure priced from partial counts. The multiple reads
"cheaper", "more expensive" or "same cost", whichever way the numbers point.

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
