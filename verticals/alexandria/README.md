# Starlight Alexandria

> The catalogued-intelligence layer of the Starlight Intelligence System. Every data source the estate can call is a typed capability under a published contract; every call is priced before it runs and leaves a receipt; every synthesis points at receipts. Firecrawl's Alexandria catalogue is the first external transport. The estate's own vaults, metrics, research and registries are the first native providers.

**Tier:** Domain sub-stack (vertical) under Second Brain IS, composing with Wealth IS (Crypto IS Houses), Creator IS, Code IS and the Starlight Orchestrator. Fourth reference vertical for `/spawn-domain-stack`.
**License:** MIT for the catalogue shape, router, receipts and experiment registry. Instance content (paid briefs, client receipts, signing keys, allocator pipeline) stays private.
**Status:** `v0.1 — runtime + catalogue + MCP server shipped; six Houses scaffolded; five Forge experiments open; no revenue claimed`.

---

## What this vertical is

Agents are only as good as what they can look up and prove. Today the estate looks things up through forty ad-hoc tools and proves nothing: a brief cites "on-chain data" with no record, a claim about a company has no filing behind it, a research synthesis names papers nobody fetched. Alexandria replaces that with one door:

```
need ──▶ Library.plan() ──▶ price ──▶ budget gate ──▶ transport ──▶ records + receipt ──▶ ledger
```

- **Library** — `verticals/alexandria/catalog/providers.json`. Nineteen providers today: four native (vaults, metrics ledger, research notes, vertical registry) and fifteen from Firecrawl's Alexandria catalogue (on-chain trading, 13F and insider ownership, fund-letter theses, funding rounds, company and people enrichment, arXiv and Semantic Scholar, Federal Reserve series, Instagram/TikTok index, podcast advertising, web traffic, search trends). Each capability carries its real per-call credit price, its required options and a tag vocabulary the router scores against.
- **Router** — `src/alexandria/router.ts`. Resolves a need to a capability deterministically, checks required options, prices the call, refuses anything over the session budget *before* a transport is touched, and returns records plus a receipt.
- **Receipts** — `src/alexandria/receipts.ts`. sha256 over canonical JSON of the records, provider source, attribution, cost, and an earned "Built on SIP" block only when the caller declares the layers the record composed. Append-only JSONL ledger; the budget resumes from it.
- **Forge** — `verticals/alexandria/experiments/registry.json`. Every product line, provider and revenue claim starts as an experiment with one metric, one falsifier, a budget with a unit and a close date. `proven` and `falsified` require receipt ids.
- **MCP server** — `src/alexandria/mcp.ts`. Five tools (`alexandria_find`, `alexandria_plan`, `alexandria_execute`, `alexandria_receipts`, `alexandria_experiments`) over stdio, so Claude Code, Codex, Gemini CLI and managed agents all go through the same budget gate.

The vertical is decomposed into **six Houses** (Library · Scribe · Synthesis · Exchange · Forge · Treasury), each shipping named artifacts. See `SUB-SYSTEMS.md`.

---

## The synthesis edge

Data marketplaces sell rows. Research tools sell search. Agent frameworks sell orchestration. None of them sell *a record you can resell because someone can re-check it*. That is the gap, and it is the gap the estate is unusually placed to fill:

**Enterprise reference-architecture discipline × a working multi-vertical estate (Wealth, Crypto, Creator, Music, Code) that already consumes the records × a protocol (SIP) whose attestation layer was built for exactly this × a creator distribution surface that turns receipted research into audience.**

Applied here: (a) the catalogue is curated by someone who runs the downstream systems, so tags and routing reflect real needs, not a taxonomy; (b) receipts are first-class because the estate already refuses unreceipted claims (`METRICS_TRUTH.md`, SOUL files across verticals); (c) the same record feeds a whale brief, a creator short, a client estate and a Code IS eval, which is the compounding no single-domain tool gets.

---

## What this vertical is NOT

- **Not a data vendor.** Alexandria resells *receipted synthesis* and *pass-through calls under our budget discipline*; the underlying rows belong to their providers under their terms, and attribution rides every receipt (Similarweb's required attribution string is in the catalogue).
- **Not investment, trading, tax or legal advice.** Records about wallets, holders, rounds and filings organise thinking. The practitioner decides. No agent in this vertical moves money (payment-intelligence-system doctrine applies to the x402 rail).
- **Not a scraper.** Catalogued capabilities only. If a need has no contract, the answer is "add a provider" or "no", never "scrape it".
- **Not a replacement for Firecrawl, Clay, vidIQ or any connector.** They are transports and lanes. Alexandria is the door, the price gate and the receipt.
- **Not a promise of revenue.** `REVENUE.md` lists streams as working positions tied to Forge experiments. Nothing is a number until a receipt makes it one.

---

## How to use (v0.1)

```bash
# plan and execute from any MCP client
node --import tsx src/alexandria/mcp.ts          # or dist/alexandria/mcp.js after npm run build
# env: FIRECRAWL_API_KEY (optional), ALEXANDRIA_MAX_CREDITS (default 200), ALEXANDRIA_LEDGER
```

From code:

```ts
import { Alexandria, Library, NativeTransport, FirecrawlTransport, ReceiptLedger } from './dist/alexandria/index.js'; // package export deferred to the next Foundry toolchain relock

const alexandria = new Alexandria({
  library: Library.fromFile(),
  transports: [new NativeTransport(repoRoot), new FirecrawlTransport()],
  maxCredits: 100,
  ledger: new ReceiptLedger('~/.starlight/alexandria/receipts.jsonl'),
});
const plan = alexandria.plan('whale wallets on solana this week');
const { result, receipt } = await alexandria.execute({ capabilityId: plan.recommended!, options: { chain: 'sol' }, sipLayers: ['attestation'] });
```

Commands: `/alexandria` (plan → execute → receipt in one pass). House commands land per Forge proof-pass (see `SUB-SYSTEMS.md` § Daily-5).

Tests: `node --import tsx --test test/v93-alexandria.test.ts`.

---

## Composition

| House | Composes with | Direction |
|---|---|---|
| Library | Second Brain IS | Native providers *are* the second brain's public read surface |
| Synthesis | Crypto IS (On-Chain, Macro, Research Houses) | Receipted records feed `/crypto-onchain-flow-snapshot`, `/crypto-macro-regime`, `/crypto-res-protocol-thesis` |
| Synthesis | Wealth IS | Allocator and 13F records feed `/wealth-thesis-review` |
| Scribe | Creator IS, Voice & Video IS | Research briefs become `/creator-pipeline` inputs with receipts attached |
| Exchange | Business IS, Payment Intelligence System | Billing, entitlements, fail-closed agent payments |
| Forge | Code IS, Foundry | Experiments are Foundry-shaped: evidence receipts via `/prove` |
| Treasury | Wealth IS, Business IS | Allocator pipeline and partnership terms |

---

## Sovereignty clause (non-waivable per SIP § 5)

The spawned domain stack is yours. Starlight has no ownership claim. Attribution via "Built on SIP" on shipped artifacts is the sole compounding mechanism. You may take the stack private or fork it out of this SIS at any time.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1 · Layers used: [file-contract, attestation, commands] · `alexandria@v0.1`
