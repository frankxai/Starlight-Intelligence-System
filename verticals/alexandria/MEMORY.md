# MEMORY — Alexandria vertical

## Declared identity
- **Vertical name:** Starlight Alexandria
- **Slug:** `alexandria`
- **Tier:** Sovereign domain sub-stack under Second Brain IS; composes with Wealth IS (Crypto IS Houses), Creator IS, Code IS, Starlight Orchestrator
- **Spawned:** 2026-10-08 (v0.1 runtime-first scaffold)
- **Reference repo:** `verticals/alexandria/` + `src/alexandria/` in `frankxai/Starlight-Intelligence-System` (extraction target when the Exchange experiment proves: `github.com/frankxai/starlight-alexandria`)

## Domain & ICP
- **Domain:** catalogued intelligence with receipts — typed capabilities, price-before-run, receipt-after-run, earned attestation, signed resale.
- **ICP:** the estate's own agents first; then allocators, founders and creators who pay for data and cannot trust the brief on top of it; then builders who want a budget-gated pass-through.
- **Open boundary (MIT):** catalogue shape, router, receipts, experiment registry, MCP server, House cards, docs.
- **Closed boundary:** paid briefs, client ledgers, signing keys, allocator pipeline, credit balances, partnership terms.

## Commitments
1. No transport call without a prior price check and budget gate.
2. No public number without a receipt id or a `METRICS_TRUTH` entry.
3. The "Built on SIP" block is earned per receipt, never blanket.
4. No agent in this vertical moves money, publishes or handles keys.
5. Catalogue prices are reconciled against Firecrawl's catalogue digest; `reconciledAt` is bumped on every reconcile.

## Anti-scope
- Not a scraper, not a data vendor, not advice, not a trading or payment engine.

## Open reconciliation
- `similarweb/traffic/overview` and `firecrawl-trends/trends/interest` capability paths are placeholders: the live contract fetch returned "provider agreements unavailable" on 2026-10-08. Reconcile before first execution; the Library validator does not know a path is placeholder, the catalogue note does.

- A `./alexandria` entry in root `package.json` `exports` and a `test:alexandria` script are deferred: `package.json` is in the Foundry OpenAI preflight digest closure (`tools/foundry/lib/openai-preflight.mjs` → `foundry/validators/toolchain.lock.v1.json`), and relocking is an independently reviewed step. Until then: tests run through `.github/workflows/alexandria.yml`, the MCP server through `node dist/alexandria/mcp.js`, and in-repo imports through `dist/alexandria/index.js`.

## Changelog
- **2026-10-08 — v0.1.** Runtime (`src/alexandria/`: types, catalog, transport, receipts, router, experiments, mcp), catalogue (19 providers, 44 capabilities, 24 connectors), five Forge experiments, six House cards, seven-file contract plus ARCHITECTURE / SDLC / SWARM / REVENUE / CAPITAL / SUB-SYSTEMS / PROPOSAL, `test/v93-alexandria.test.ts`, `/alexandria` command, Board record. No revenue, no partnership, no pilot claimed.

**Built on SIP** · `alexandria@v0.1`
