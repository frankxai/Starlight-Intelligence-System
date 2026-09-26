# Handover: get the Desk and the receipt layer into main, at production quality

Written 2026-09-26. Everything below was verified against the repositories on
that date. Treat any claim here as stale once you have read the files yourself.

---

## The situation in six lines

- `frankxai/Starlight-Intelligence-System` PR **#189** — open, **still a draft**,
  53 files, +9,212 / -5, 19 commits, head `910c7ed`, CI green, last touched
  2026-09-22. It is **5 commits behind main** (main is now `515e6c0`).
- `frankxai/starlight-intelligence-web` PR **#54** — open, **still a draft**,
  63 files, +4,125 / -47, head `642e0a8`, `mergeable_state: clean`.
- `frankxai/starlight-intelligence-web` issue **#55** (add the signing key to
  `lib/trusted-keys.ts`) — open, untouched. The registry is empty, so a receipt
  scanned on a phone answers NOT VERIFIED.
- Both PRs are drafts, and `site/scripts/should-deploy.sh` skips the Vercel build
  for draft pull requests, so **there is no `/desk` preview URL** and no
  post-deploy evidence for either.
- The hackathon these were built for was 2026-09-23. It has passed. Do not write
  as if it is upcoming, and do not assume what happened there.
- Nothing in either PR is substrate-tier except the protocol schema. See
  **Governance** below before you touch it.

## What you are being asked to do

Get this work into `main` in both repositories as a set of changes a senior
reviewer would merge without flinching, and raise the engineering where the
current implementation is a hackathon-grade floor. Merging it as-is is the wrong
outcome. So is rewriting it from scratch.

## Read these first, in this order

1. `CLAUDE.md` at the repo root — layer routing (substrate vs operational) and
   the Karpathy hygiene rules. They bind you.
2. `docs/hackathons/desk.md` — what the Desk is, the cascade, the vault, the
   evidence table, and the two known defects.
3. `site/src/lib/desk/` — `cascade.ts` is the spine; `vault.ts`, `pricing.ts`,
   `provider.ts`, `retrieve.ts`, `edge-meter.ts`, `run-receipt.ts` around it.
4. `docs/receipts.md` and `src/run-receipt.ts` — the proof layer. Note that
   `src/run-receipt.ts` (this repo) and `lib/run-receipt.ts` (the web repo) are
   **byte-identical on purpose**. Change one and you must change both or the
   signatures stop agreeing. There is a pinned share-link vector in both test
   suites for the same reason.
5. `docs/strategy/2026-09-21-convergence-v3.md` — why any of this exists.

## Skills to load, and when

| When | Skill |
|---|---|
| Before touching anything under `site/src/app/**` or any UI file | `web-release-gate` — it is load-bearing and sequences the rest. Three committed hooks in `.claude/hooks/` enforce it. |
| Inside that gate, as it directs | `web-design-guidelines`, `ui-ux-pro-max`, `core-web-vitals`, `visual-proof` |
| Before declaring any task done, and before every push | `verification-loop` (or `verification-quality`) |
| Before writing a new module, to check something existing already does it | `search-first` |
| On the API route, the rate limiter, and the secrets question | `security-auditor` |
| When splitting the PR and reviewing each slice | `/code-review`, then `/simplify` on what survives |
| Next.js 16 / React 19 specifics (this is not the Next.js in your training data) | `nextjs-expert`, plus `node_modules/next/dist/docs/` as `site/AGENTS.md` instructs |
| Only if you end up touching `SIP.md`, `SIS.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`, the attestation rules or the sovereignty clause | `/starlight-board` **before** the commit, never after |

Do not invoke `/yolo`. This work is scope-locked and reviewable; an autonomy
mode buys nothing here.

## Step 1 — split PR #189. It is not reviewable as one change.

One PR carrying the Desk, the receipt issuer, MCP tools, a protocol schema,
three strategy documents and a hackathon runbook is why it has sat in draft for
four days. Cut it into slices that each stand alone, each off current `main`:

| Slice | Contents | Tier |
|---|---|---|
| A. Receipt core | `src/run-receipt.ts`, `src/receipt-share.ts`, `src/qrcodegen.ts`, their tests, `docs/receipts.md` | operational |
| B. Issue path | `scripts/receipts/**`, the MCP tools in `src/mcp-server-v01.ts`, the ledger | operational |
| C. The Desk | everything under `site/` | operational |
| D. Protocol schema | `protocol/run-receipt.v1.schema.json` and any SIP wording | **substrate — Board first (issue #193)** |
| E. Documents | `docs/strategy/**`, `docs/hackathons/**`, the HTML prototypes | operational |

A merges first because C depends on the copy of it. D does not merge at all until
`/starlight-board` returns a verdict; park it and say so in the PR.

Keep #189 open as the tracking PR until its last slice lands, or close it with a
comment pointing at the slices. Do not force-push over its history.

## Step 2 — bring the branches current

Main moved five commits (`a54cc70`, `cf3d25c`, `2b94523`, `6cbfd9a`, `515e6c0`),
two of them security patches. The only file both sides touch is
`site/package.json`, where main repinned dependencies and this branch added a
`test:desk` script. Merge main in, resolve that one file by keeping both
intentions, and regenerate `site/pnpm-lock.yaml` with the repo's own tooling
rather than by hand. Do not rebase or force-push a branch someone else may have
checked out.

Note `foundry/validators/toolchain.lock.v1.json` pins the root `package.json`
hash. It does not cover `site/package.json`. If your change makes it disagree,
fix the lock through the foundry's own command, never by editing the hash.

## Step 3 — the engineering that has to improve before this is production

These are the real gaps. Each is a judgement call; make it explicitly and write
the reasoning into the PR body.

1. **The vault will not survive production as written.** `site/src/lib/desk/vault.ts`
   appends to a JSONL file and falls back to `/tmp` when `VERCEL` is set. On
   serverless that is per-instance and erased between invocations, so deployed
   memory is a demo, not a feature. Introduce a small `VaultStore` interface with
   two implementations: the existing file store (local, sovereign, unchanged in
   behaviour) and a durable one for the deployed path. Supabase is already in the
   wider stack; Vercel Blob or a Postgres table are both defensible. Whatever you
   pick, keep the local-first property intact — the customer must still be able
   to hold their own memory as a file they can read with `cat`.
2. **Recall is Jaccard overlap on stopword-filtered tokens.** That was chosen so
   the contradiction pass works with no network and no index, and that floor
   should stay as the fallback. Above it, add embedding recall (pgvector or the
   provider's embeddings endpoint) behind the same `findRelated` signature, with
   the keyword path as the documented degradation.
3. **`/api/desk/run` is an unauthenticated route that spends money.** Its rate
   limiter is an in-memory `Map`, which on serverless means one bucket per
   instance and effectively no limit. A public Desk needs a durable counter, a
   hard daily spend ceiling, and probably a challenge or an allowlist. Decide
   whether the public route stays public at all.
4. **Server-side signing contradicts the sovereignty story.** Putting
   `SIS_SIGNING_KEY` in Vercel's environment means the private key lives on a
   host. Either the deployed Desk issues unsigned drafts and signing stays local,
   or it signs with a clearly separate "Desk" key that is not Frank's personal
   key. This is a decision to surface, not to make quietly in a commit.
5. **Prices are all null**, so every euro figure reads "unpriced" and the edge
   meter withholds its multiples. Only Frank can fill
   `site/src/lib/desk/pricing.ts` from the Token Factory console, with a
   `verifiedAt` date per entry. Do not estimate a price. Do not let the table
   ship half-dated.
6. **`pnpm build` in `site/` is blocked locally.** The `build` script runs
   `test:vault-fetch`, and `src/lib/github-content.test.mjs` hangs on Node 22:
   the test relies on `AbortSignal.timeout`, which is unref'd, so the loop drains
   and the runner cancels five of six tests. Nothing in CI runs it, which is why
   it went unnoticed. Fix the test (keep a ref'd handle alive for the duration),
   and consider whether a network-shaped unit test belongs in the build gate at
   all.
7. **Two test runners.** `site/` runs `node --test` with
   `--experimental-strip-types` and a hand-written resolver hook at
   `site/scripts/test/ts-resolve-hooks.mjs`. It works and has no dependency cost,
   which is why it exists. If you are modernising, moving the desk suites to the
   runner the rest of the repo uses is a legitimate cleanup — but only as its own
   commit, with the test count before and after in the message.
8. **The #189 body is stale.** It says fifteen tests and four stages. There are
   25 tests and seven stages — `recall`, `retrieve`, `extract`, `synthesize`,
   `contradict`, `judge`, `remember`. Fix the body of whichever slice carries the
   Desk.

## Step 4 — the quality bar for each PR you open

- `npx tsc --noEmit` clean, `pnpm lint` no new errors (there is one pre-existing
  error in `site/src/app/field-notes/page.tsx`, an `<a>` where a `Link` belongs;
  it is not yours, and fixing it is a separate commit if you choose to).
- `pnpm test:desk` green, with the count stated.
- `pnpm build` green — which means defect 6 above has to be fixed first.
- For anything touching UI: the `web-release-gate` finish line, which is audit
  findings plus before and after captures at 375, 768 and 1440. Never a
  self-assigned score. Existing captures live in `docs/hackathons/evidence/`.
- Every claim in the PR body traceable to a command someone else can run.
- Commit messages in the repo's register: what changed, why, and what it costs.
  No model identifiers anywhere in a pushed artifact.

## Step 5 — what only Frank can do

Do not attempt these, and do not treat their absence as a blocker for the
slices that do not need them:

- Generate the signing key on his machine (`node protocol/sign.mjs keygen .starlight/keys`).
  The private key never enters git, a chat, or a shared folder.
- Open and merge the registry PR in the web repo (issue #55) with
  `node scripts/add-trusted-key.mjs <pub> --owner "Frank Riemer"`.
- Mark #189's slices and #54 ready for review, and merge them.
- Fill the Token Factory prices.

Everything else is yours.

## What not to do

- Do not push to `main` in either repository.
- Do not force-push any branch you did not create.
- Do not edit `SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`,
  `VOICES.md` or `REGISTRY.md` without `/starlight-board` first.
- Do not change `src/run-receipt.ts` without making the identical change to
  `lib/run-receipt.ts` in the web repo, and do not break the pinned share-link
  vector in either suite.
- Do not weaken the honesty properties to make a demo smoother: claims that
  cannot quote a source are dropped, grounding is computed from the brief's own
  text and never asked of a model, unpriced models report no euros, and a vault
  that cannot be written records a failed stage rather than a silent success.

