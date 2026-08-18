# Contributing to Starlight Intelligence System

Thanks for your interest. SIS lives at the unusual intersection of a
protocol (SIP) and a reference operational build that runs on top of it.
That two-layer shape changes how contribution works compared to a
single-codebase project, so please read the brief overview below before
opening your first PR.

> **TL;DR:** Operational-tier changes (vault writes, MCP server, skills,
> agents, site, the 7 reference commands) follow normal OSS rules.
> Substrate-tier changes (anything touching `SIP.md`, `SIS.md`,
> `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`,
> sovereignty clause, 10-IS taxonomy) need a `/starlight-board`
> pre-pass before merge.

---

## Code of Conduct

By participating, you agree to uphold the [Code of Conduct](./CODE_OF_CONDUCT.md)
(Contributor Covenant v2.1).

Reports to the conduct contact in `CODE_OF_CONDUCT.md`. Security issues
go to `SECURITY.md` (separate channel).

---

## Before you start

### 1. Read the two-layer split

See `README.md` § "Two layers, one repo" or `SIP.md` § 1.1. Knowing
whether your change is substrate or operational saves a round-trip in
review.

### 2. Get the dev environment up

```bash
git clone https://github.com/frankxai/Starlight-Intelligence-System.git
cd Starlight-Intelligence-System
npm install
npm test       # 256+ tests should pass
```

See `SETUP.md` for the full operator onboarding (private/ templates,
Infisical, cockpit, cron). For pure contribution you don't need the
operator state — the substrate + operational tests run against
fixtures only.

### 3. Pre-commit hook (recommended)

`npm install` runs `git config core.hooksPath tools/git-hooks` for you,
which wires up the substrate symmetry test pre-commit gate. The hook
runs v76 → v83 (currently ~77 tests, ~1s) on commits that touch
substrate files; it skips for pure-doc commits.

To opt out: `git config --unset core.hooksPath` after `npm install`.
We don't recommend opting out, but we won't surprise you with it
either.

---

## Operational-tier contributions

If your change touches **only** the reference build (not `SIP.md` or the
file-contract files listed above), follow the normal flow:

1. Fork → branch → PR against `main`.
2. Keep the diff scoped — one feature or fix per PR.
3. Add tests for new behavior (`node --import tsx --test path/to/file.test.ts`).
4. Run `npm test` locally before pushing — must be 100% green.
5. Run `npm run lint` (which is `tsc --noEmit`) — must be 0 errors.
6. Squash-merge once CI is green and reviewers are happy.

### Coding conventions

- **TypeScript everywhere** in `src/`, strict mode, no `any` without
  comment justifying it.
- **No unused imports/exports** — `noUnusedLocals` is on; the build
  will fail on dead code.
- **Tests via `node:test`** — no Jest, no Mocha. See existing patterns
  in `src/**/*.test.ts`.
- **Conventional Commits** — `feat:`, `fix:`, `refactor:`, `docs:`,
  `chore:`, `design:`, `plan:`. Add a scope when meaningful:
  `feat(yolo): ...`.
- **Co-authorship** — when AI assistance contributed materially,
  include the appropriate `Co-Authored-By:` trailer.

---

## Substrate-tier contributions

Changes that touch any of these files are substrate-tier:

`SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`,
`VOICES.md`, `REGISTRY.md`, `MEMORY.md`, `SKILL.md`, `agents/AGENT_REGISTRY.md`,
`skills/skill-rules.json`, anything in `.claude/commands/`,
file-contract / attestation / sovereignty / 10-IS taxonomy.

These need a `/starlight-board` pre-pass before merge.

### The board pre-pass

Open an issue or draft PR with a brief proposal document at
`docs/superpowers/board-pre-passes/YYYY-MM-DD-<topic>.md`. We'll run
the 5-pressure-vector board (Sovereign / Seer / Harmonizer / Strategist
/ Verifier + Overseer) and reply with PROCEED / REVISE / BLOCK.

If REVISE: apply the items, re-open for a re-pass.
If PROCEED: ship as normal PR.
If BLOCK: discussion — maybe a different shape, maybe the change
needs to wait.

See past pre-passes at `docs/superpowers/board-pre-passes/` for the
format and tone we use.

### Why the gate exists

Substrate changes have 18-month consequences for everyone composing
above SIP. The board catches load-bearing design problems before they
become irreversible. It's not bureaucracy — it's the same kind of
care you'd want a protocol amendment to have.

---

## Tests we run

| Suite | When | Speed |
|---|---|---|
| `npm run test:substrate` | pre-commit hook + CI | ~1s — substrate symmetry only |
| `npm run test:operational` | CI on operational changes | ~10s |
| `npm test` | full run (substrate + operational + v01-evals) | ~30s |
| `npm run lint` | every PR | ~3s |
| `npm run build` | release pipeline | ~3s |
| `npm run verify` | nuclear option (lint + test + build for root + site + console) | ~2-3 min |

CI uses GitHub Actions — see `.github/workflows/`.

---

## Filing a good bug

1. **What you ran** — exact command.
2. **What you expected** — quick sentence.
3. **What happened** — exact output (paste, don't paraphrase).
4. **Environment** — OS, Node version (`node --version`), npm version,
   git SHA (`git rev-parse HEAD`).
5. **Reproduction** — minimal steps from a fresh clone if possible.

If the bug touches `private/` state we can't see, that's fine — describe
the shape of the data without the values.

---

## Filing a good feature request

State the operator need first, the proposed shape second. The most
useful proposals come with a 5-line scenario ("I'm in a /yolo session
and X happens; today I have to Y; if Z existed I could..."). Substrate
features go through the board pre-pass; operational features go to
the issue tracker.

---

## Horizon Vault and public gardens

Horizon is the public, append-only values vault. Agents cannot write it
directly. Local `~/.starlight/vaults/` is never a contribution.

### A. Canonical letter

Append one entry to `memory/vaults/horizon-vault.md` using the template
in that file. PR title: `horizon: {Your Title}`. Include hope **and**
reasoning. See also `docs/starlight-note-spec.md`.

### B. Public wish ledger

Append one JSONL line in
[frankxai/starlight-horizon-dataset](https://github.com/frankxai/starlight-horizon-dataset)
under `entries/YYYY-MM/`. There is no published CLI.

### C. Your own public garden

1. Copy `templates/public-vault/` to `public-vault/` in your fork (or
   point the registry at another public repo).
2. Replace placeholders. Empty category files are fine.
3. Add one row to `vault-registry.json` (`slug` is a person, not a
   vault name — `/vaults/horizon` will 404).
4. Run `node scripts/validate-public-vault.mjs`.
5. PR title: `vault: add {slug}`.

The site fetches GitHub files listed in the registry. Mark signed
future-facing Horizon entries `"benediction": true` to appear on
`/benediction`.

---

## What we won't merge

- Changes that introduce hardcoded operator-specific paths (the Tier 2
  portability pass de-hardcoded them; don't reintroduce).
- Private operator memory (`~/.starlight/`) pasted into `public-vault/`.
- Changes that put instance state at repo root (use `private/` per the
  privacy-split contract).
- Test fixtures with real secrets in shape-recognized formats (build
  prefixes piecewise — see `feedback_test_fixtures_secret_safe` in
  the memory rules).
- Substrate-tier changes that didn't go through the board pre-pass.
- "While I'm here" refactors bundled into bug fixes — keep PRs focused.
- Anything that bypasses the sovereignty clause for `alliance_touched`
  repos.

---

## Where to ask

- General questions → GitHub Discussions (if enabled) or issue tagged
  `question`.
- Substrate philosophy → re-read `SIP.md` and `SIS.md` first, then ask.
- Operational onboarding → `SETUP.md`.

---

**Built on SIP** · `CONTRIBUTING.md` v1.0 · MIT
