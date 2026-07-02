# Cloud autonomy

Before this pass, scheduling in this repo was Windows-machine-bound
(`scripts/dreaming-cron.ps1`, `scripts/register-dreaming-task.ps1`), CI never
built `site/` or `console/`, `npm publish` was a manual step (the registry
went two majors stale once because of it), and Vercel auto-deploy silently
skipped without secrets set. This page is the index of every workflow that
closes one of those gaps, plus the exact commands to arm the ones that are
dormant until a secret is set.

## Workflow index

| Workflow | Trigger | What it does | Arms on |
|---|---|---|---|
| `harness-check.yml` | PR + push to `main` | `harness` job: lint, build, `agents:harness-check` drift guard, `validate-agents.mjs` conformance, full test suite. `web` job (parallel): builds the root package, then `site/` and `console/` with pnpm. | Nothing — runs unconditionally. |
| `content-drift-check.yml` | PR + push (path-filtered) | Regenerates `site/content/explainer.md` from its source and fails if it drifts. | Nothing — runs unconditionally. |
| `voice-operator-tests.yml` | PR + push (path-filtered) | Validates Voice Operator agent structure, handoff-packet skill contract, `skill-rules.json` registration, registry + cross-references. | Nothing — runs unconditionally. |
| `vercel-deploy.yml` | push to `main` (path-filtered), PR (path-filtered, build-check only), `workflow_dispatch` | `pr-build-check` job: `next build` on every PR touching `site/`, no secrets needed. `preflight` + `deploy` jobs (push/dispatch only): builds and deploys `site/` to Vercel production. | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| `nightly-metrics.yml` | `cron: 17 3 * * *`, `workflow_dispatch` | Runs `node scripts/sync-metrics.mjs`, and if `README.md` / `metrics/current.json` drift, opens or updates a PR on branch `bot/metrics-refresh`. Never pushes to `main` directly. | Nothing — runs unconditionally using the built-in `GITHUB_TOKEN`. |
| `weekly-dreaming.yml` | `cron: 43 4 * * 1`, `workflow_dispatch` | Runs `node --import tsx scripts/dreaming-run.ts` against the committed `memory/vaults/` surfaces (no operator `~/.starlight` home dir exists on a fresh runner, so it falls back there) and opens or updates a PR on branch `bot/dreaming`. Never pushes to `main` directly. | Nothing — runs unconditionally using the built-in `GITHUB_TOKEN`. |
| `registry-drift.yml` | `cron: 29 5 * * *`, `workflow_dispatch` | Compares `npm view @arcanea/starlight-intelligence-system version` to `package.json`'s version. On mismatch (or on `npm view` failure — e.g. unpublished package), opens or updates a single deduped GitHub issue titled "npm registry drift". Never fails the run on an `npm view` error. | Nothing — runs unconditionally using the built-in `GITHUB_TOKEN`. |
| `release.yml` | push of tag `v*` | `preflight` job checks for `NPM_TOKEN`; if absent, exits 0 with a `::notice::` and the manual publish command, publish job does not run. `publish` job (only if the secret is present): verifies the tag matches `package.json`'s version, `npm ci`, build, `npm run test:substrate`, then `npm publish --access public`. | `NPM_TOKEN` |
| `sip-starter-release.yml` | push of tag `v*.*.*`, `workflow_dispatch` | Packages and publishes the SIP starter as a GitHub Release asset. Unrelated to npm publish. | Nothing — uses the built-in `GITHUB_TOKEN`. |

## Arming the dormant workflows

Each command below must be run once per repo, by someone with admin access,
using the [GitHub CLI](https://cli.github.com/) (`gh`) authenticated against
`frankxai/Starlight-Intelligence-System`.

### Vercel auto-deploy (`vercel-deploy.yml`)

```bash
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

Get the values from `vercel whoami` / `vercel link` inside `site/`, or from
the Vercel dashboard project settings. Until these are set, the `deploy` job
is skipped (green, not red) — `pr-build-check` still catches breakage on
every PR, and a manual deploy remains available:

```bash
cd site && pnpm dlx vercel deploy --prod --yes
```

### npm publish (`release.yml`)

```bash
gh secret set NPM_TOKEN
```

Use an npm [automation or granular access token](https://docs.npmjs.com/creating-and-viewing-access-tokens)
scoped to publish `@arcanea/starlight-intelligence-system`. Until it is set,
`release.yml` no-ops with a notice on every tag push. Manual publish remains
available:

```bash
npm ci && npm run build && npm run test:substrate && npm publish --access public
```

## What never needs a secret

`nightly-metrics.yml`, `weekly-dreaming.yml`, and `registry-drift.yml` only
read the repo, open issues, and open pull requests against branches
`bot/metrics-refresh`, `bot/dreaming`, and (for the drift issue) no branch at
all — all of which the default `GITHUB_TOKEN` can do under this workflow's
`permissions: contents: write, pull-requests: write` (or `issues: write` for
the drift check). None of them ever push to `main` directly; a human merges
every PR they open.

---

Built on SIP — Starlight Intelligence Protocol.
