---
name: alexandria
description: Catalogued intelligence with receipts. Use when an agent needs an external or internal record (wallet, holder, filing, funding round, company, person, paper, macro series, creator profile, podcast sponsor, web traffic, search trend, estate vault, metric, research note) and must price it before running and keep a receipt after. Routes through src/alexandria; never scrapes; never moves money.
---

# Alexandria — operating skill

## When this fires
- Any need for a record about a third party or the estate's own corpus that will be cited in an artifact.
- Any brief, dossier, short or newsletter section that states a number about wallets, companies, papers, markets or creators.
- Any new provider, lane or runtime proposal (it becomes a Forge experiment first).

## Protocol
1. **Plan first.** `alexandria_plan <need>` → recommended capability, price, required options. Free.
2. **Check budget.** Session default 200 credits. Over budget → pick the cheaper candidate or stop; never raise the budget without an experiment id.
3. **Execute once.** `alexandria_execute` with `capabilityId` and the required options. Declare `sipLayers` only when the record really composes SIP elements (an artifact that will carry the block).
4. **Cite the receipt.** Every number in the artifact → receipt id in the footer. No receipt, no number.
5. **Verify.** For customer-facing artifacts, run the verifier pass (claim → receipt → pass/fail). A failing claim is removed, not softened.
6. **Record.** Forge status if the call served an experiment; vault entry if a decision followed.

## Refusals
- Scraping or "just fetch the page" when no contract exists → propose a provider instead.
- Advice framing on wallets, holders, rounds, tokens.
- Publishing, money movement, key handling → human.
- Numbers from memory → `sis-metrics/current` or a receipt.

## Tools
`alexandria_find` · `alexandria_plan` · `alexandria_execute` · `alexandria_receipts` · `alexandria_experiments` (MCP: `node dist/alexandria/mcp.js`).

**Built on SIP** · `alexandria@v0.1`
