# SUB-SYSTEMS — Starlight Alexandria

> Six Houses. Each ships named artifacts per command; a House that cannot name its artifact is a topic and gets collapsed (per `/spawn-domain-stack` functional-decomposition rule).

---

## Daily-5

| Command | House | Why first |
|---|---|---|
| `/alexandria` | Synthesis | plan → execute → receipt in one pass; the door everything else uses |
| `/alexandria-plan` | Library | price before run; most calls should end here |
| `/alexandria-brief` | Synthesis | the weekly receipted brief for the active line |
| `/alexandria-forge` | Forge | overdue experiments first; close or re-date today |
| `/alexandria-reconcile` | Library | monthly catalogue reconcile against Firecrawl's catalogue digest |

v0.1 ships `/alexandria` (`.claude/commands/alexandria.md`). The other four land on the first Forge proof-pass (`exp-2026-10-08-catalogue-recall`).

---

## House 1 — Library

- **Slug:** `library`
- **Agent:** `houses/library/agent.md`
- **Scope:** owns `catalog/providers.json` and `catalog/connectors.json`; validates, reconciles prices, maintains the tag vocabulary; answers "which capability, at what price".
- **Refuses:** guessed prices, providers without a published contract, scraping.
- **Artifacts:** plan (capability + price + required options) · catalogue diff · reconcile report · tag-vocabulary change.
- **Commands (v0.1 → v0.2):** `/alexandria-plan` · `/alexandria-find` · `/alexandria-reconcile` · `/alexandria-add-provider`
- **Composes with:** Second Brain IS (native providers), every other House (they call it).

## House 2 — Scribe

- **Slug:** `scribe`
- **Agent:** `houses/scribe/agent.md`
- **Scope:** ingests and normalises what the Library returns; materialises snapshots (R2) when a brief must re-render; runs long-context corpus passes (Gemini); maintains the native corpus (vaults, research extracts) as providers.
- **Refuses:** storing provider rows beyond provider terms; silent summarisation without the receipt id on the extract.
- **Artifacts:** snapshot (hash-named) · extract (with receipt id) · corpus index.
- **Commands:** `/alexandria-snapshot` · `/alexandria-extract` · `/alexandria-corpus-index` · `/alexandria-ingest`
- **Composes with:** Creator IS (extracts become pipeline inputs), Voice & Video IS.

## House 3 — Synthesis

- **Slug:** `synthesis`
- **Agent:** `houses/synthesis/agent.md`
- **Scope:** the Queen. Composes receipts into briefs, dossiers and answers; owns the session budget; signs the artifact's receipt footer. Runs on Claude managed agents; is verified by an OpenAI structured-output pass.
- **Refuses:** any number without a receipt id; advice framing; publishing.
- **Artifacts:** weekly brief · dossier · answer-with-receipts · verifier table (claim → receipt → pass/fail).
- **Commands:** `/alexandria` · `/alexandria-brief` · `/alexandria-dossier` · `/alexandria-verify`
- **Composes with:** Crypto IS Houses (On-Chain, Macro, Research), Wealth IS thesis engine, Brand IS for voice.

## House 4 — Exchange

- **Slug:** `exchange`
- **Agent:** `houses/exchange/agent.md`
- **Scope:** turns signed receipts into products: pass-through endpoint, brief subscription, entitlements, usage metering (Polar; Supabase), agent payments verify-only (x402 via payment-intelligence-system).
- **Refuses:** reselling unsigned receipts; any money movement; raw-row resale outside provider terms.
- **Artifacts:** product listing · endpoint spec (OpenAPI) · entitlement rule · usage report.
- **Commands:** `/alexandria-list-product` · `/alexandria-endpoint` · `/alexandria-entitlements` · `/alexandria-usage`
- **Composes with:** Business IS, Payment Intelligence System.

## House 5 — Forge

- **Slug:** `forge`
- **Agent:** `houses/forge/agent.md`
- **Scope:** owns `experiments/registry.json`; runs bakeoffs (models, generation lanes, planners); turns results into `proven` / `falsified` with receipt ids; the daily pulse.
- **Refuses:** verdicts without receipts; experiments without falsifiers; more than one metric per experiment.
- **Artifacts:** experiment entry · bakeoff table · verdict with receipts · overdue report.
- **Commands:** `/alexandria-forge` · `/alexandria-bakeoff` · `/alexandria-verdict` · `/alexandria-experiment-new`
- **Composes with:** Code IS, Foundry (`/prove`), ACOS self-modify gate.

## House 6 — Treasury

- **Slug:** `treasury`
- **Agent:** `houses/treasury/agent.md`
- **Scope:** allocator and partnership pipeline (`CAPITAL.md`); credits programmes; cost ledger across providers, models and cloud; quarterly review.
- **Refuses:** claiming a partnership without a dated artifact; revenue projections in public copy; any investment advice.
- **Artifacts:** pipeline snapshot · partnership record · cost ledger · quarterly review.
- **Commands:** `/alexandria-pipeline` · `/alexandria-partner` · `/alexandria-cost-ledger` · `/alexandria-quarter`
- **Composes with:** Wealth IS, Business IS, investment-banking skills.

---

## Stack totals (v0.2 target)

- Sub-systems: 6
- Commands: 24 (1 shipped at v0.1)
- Agents: 6 House agents (cards shipped) + runtime assignment in `SWARM.md`
- Skills: 1 wrapper (`SKILL.md`) + House skills on proof-pass

## Synthesis-edge presence

Load-bearing in Library (curation by the downstream operator), Synthesis (receipts as first-class), Exchange (verifiable resale), Forge (falsifier discipline inherited from the estate). Four of six; passes the ≥3 rule.

---

**Built on SIP** · `alexandria@v0.1` · SIP v1.1.1
