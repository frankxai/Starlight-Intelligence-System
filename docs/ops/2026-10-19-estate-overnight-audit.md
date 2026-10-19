# Estate overnight audit — 2026-10-18/19

Operator: Antigravity (`/goal`). Evidence files: `docs/ops/jules-backlog-2026-10-19.json` (cards) and the scan scripts named below. Every number here was measured during this session; anything not measured is marked unverified.

## What was measured

| Scope | Result |
|---|---|
| GitHub owners scanned | `frankxai` + 10 orgs (Arcanea-Labs, FrankX-AI, AI-Architect-Academy, oci-ai-architects, Starlight-Intelligence-Systems, Starlight-Intelligence, GenCreator-ai, Life-Commons, AI-Architect-Studio, Agentic-Income) |
| Repos | 496 total, 408 active (not archived, not fork), 394 pushed in the last 120 days, 72 cloned locally |
| Default-branch CI | 28 failing, 163 with no workflows |
| Basics | 174 without a license, 77 with package.json but no `test` script, 16 without README |
| Security | 33 repos with open Dependabot alerts (arcanea-platform 830, arcanea 628, vibeclubs 39, ai-architect-academy 30, starlight-memory 30) |
| Review debt | ~200 open PRs on `frankxai/*`, ~140 drafts. Highest: agentic-ops 26, agentic-ops-hub 20, gencreator.ai 18 (33 drafts at dispatch time), SIS 17 |
| Jules | 417 repos connected to Jules |

## Findings that need Frank

1. **GitHub Actions budget is exhausted for private repos.** 17 of the 28 "failing" repos are private, and their jobs are `skipped` with zero duration: gencreator.ai, agenticincome, go-agenticincome, agenticpassiveincome, FrankX, starlightintelligence.ai, starlight-memory, agentic-ops, arcanea-platform, gencreator-community, AnimeLegends, gemini-arcanea, arcanea-lobechat-labs, digital-product-forge, ai-music-academy, starlight-command-center, GenCreator-ai/gencreator.ai. This is a spending decision. Money fails closed, so nothing was changed. Until it's resolved, no private-repo PR can show green checks, which means none can pass the land gate. Options: raise the Actions budget, move heavy CI to public repos or self-hosted runners, or cut CI minutes (path filters, concurrency cancel).
2. **Two-laptop sync (Syncthing) is stopped on DESKTOP-1B4ICID.** Configured devices: `DESKTOP-1B4ICID` and `yogabook`. Shared folder: `~/.starlight/swarm-bus`. Syncthing isn't running and has no autostart. The last swarm-bus write was 2026-10-14 13:25, the same minute `heartbeats/quarantine/` was created. That folder holds `invalid-heartbeat-c940-written-from-yogabook`, `c940-...-wrong-identity` and a sync-conflict file. It reads as a deliberate stop after an identity collision (yogabook wrote heartbeats under this desktop's identity). **Not restarted.** Before restarting, give each machine a distinct heartbeat identity so this desktop never writes `yogabook.json`, and vice versa.
3. **Org migration is a mirror, not a move.** 66 repo names exist under both `frankxai/` and an org. 64 pairs sit at the identical head commit, and the org copy has GitHub Actions disabled. `frankxai/*` is the canonical source: CI, Jules and PRs all live there. Real divergence:
   - `saas-ai-architect-academy`: the AI-Architect-Academy copy is one commit (13 min) newer than frankxai.
   - The 10 org `.github` profile repos differ by design.
   Decision needed: keep `frankxai` canonical with org mirrors (and document which direction they sync), or transfer and archive. Repo transfer and archival are Frank's calls.
4. **Draft-PR debt is the binding constraint, not Jules capacity.** Merging requires an independent-seat PASS at the exact head SHA, plus green checks. ~140 drafts are waiting. New Jules output only becomes value after review.

## Jules overnight distribution

- **Backlog:** 249 evidence-backed cards in `jules-backlog-2026-10-19.json`. They were generated deterministically from repo trees, Dependabot alerts, failed-run logs and open-PR titles, then deduped and validated with the conductor's own `isBounded` (1–12 files, 40–4000 chars). Each card names its evidence, the exact files, acceptance criteria and a verification command that exists in that repo.
  - By type: test 53, a11y 46, dx 81 (error boundaries, `.env.example`), seo 28, dep-security 30, docs 5, ci-fix 3, plus 3 SIS knowledge-base cards.
  - By community: arcanea 54, starlight 35, agentic-income 29, gencreator 18, academy 14, life-commons 14, frankx 13, internal 72.
- **Tonight's tranche (up to 60):** only contained-blast-radius cards: tests, a11y, error/not-found boundaries, docs, SEO. Rules:
  - Max 4 per repo.
  - Repos with ≥15 open drafts skipped: gencreator.ai, SIS, starlightintelligence.ai.
  - Money-adjacent modules (Polar, affiliate, shop, offers) held.
  - Vendored LobeChat fork excluded.
  - Paced in waves of 8 every 15 minutes.
  - Dispatch respects the conductor's capacity gate (4 GiB RAM, 50 GiB disk).
  
  Sent sessions are written into `tools/jules-conductor/state/ledger.json` with their track token, so `conductor tick` records each PR.
- **Held for review-gated release:** dependency bumps (lockfiles), `.env.example`, CI workflow edits and anything touching auth, payments, deploy or agent instruction files. Release them one repo at a time after the current drafts clear.

## Knowledge base, loops and graph engineering

The graph canon (`frankxai/starlight-graph-engineering/CONTRACT.md`, `starlight.graph-engineering.v1`) already fixes the four allowed layers: workflow/loop, memory/truth, code, world. It forbids per-agent and per-skill graphs. The recommendations below stay inside it: no new graph store, only hardening the layers that exist.

- **Memory/truth (layer B): contradiction detection is untested and has two defects** (cards `res-sis-contradiction-001/002`):
  - `src/contradiction.ts` L102–L109 applies `limit` before sorting, so `scanVaults` returns the first matches it finds, not the most similar.
  - L18 lists `"do"` as a positive directive, so questions get a +0.25 opposing-polarity boost.
- **Retrieval evaluation is untested.** `src/memory-eval.ts` (`runMemoryEval`, `readSovereignAtoms`, `readEvalQueries`) has no tests (card `res-sis-memory-eval-001`). The loop and work graph (`loop-engine`, `loop-graph`, `work-graph`) and retrieval do have tests.
- **Loop design (layer A): add backpressure from review debt.** The conductor today gates dispatch on concurrency and machine capacity only. Add a per-repo open-draft ceiling, the same rule this run used (`MAX_OPEN_DRAFTS = 15`), so dispatch slows when reviewers fall behind. This touches `tools/jules-conductor/`, which is a policy path, so it is proposed here rather than changed.

## Machine actions taken

- Stopped one stale `next dev` server (port 3467, frankx.ai worktree `ship-2026-guides`, started 2026-10-16, clean tree, no connections) to bring free RAM above the dispatch floor. Restart with `next dev --port 3467` in that worktree if needed.
- Nothing else was killed, restarted, merged or pushed to `main`.

## Unverified

- A subagent reported that `ubuntu-latest` moves to a new Ubuntu image on 2026-10-19. Not verified; check the GitHub changelog before relying on it.
- Jules plan daily limits were not measured. The dispatcher stops on the first quota error.

*Built on SIP*
