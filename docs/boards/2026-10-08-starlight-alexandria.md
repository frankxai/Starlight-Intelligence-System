# Starlight Board — Starlight Alexandria (domain sub-stack v0.1)

Pressure-tested before commit, per the board-before-tag invariant (`CLAUDE.md` v7.5.1+). Touches `VERTICALS.md` (append-only registry entry) and the Domain Sub-Stack pattern (fourth reference vertical; first with runtime shipped before commands). Does not touch `SIP.md`, `STACK.md` taxonomy, attestation rules or the sovereignty clause.

**Proposal:** add `verticals/alexandria/` + `src/alexandria/` — a catalogued-intelligence layer: provider catalogue with real per-call prices (Firecrawl Alexandria + native corpus), deterministic router with a fail-closed budget gate, append-only receipts with earned SIP attestation, an experiment registry with a status machine that refuses verdicts without receipts, and a five-tool MCP server. Six Houses scaffolded (Library · Scribe · Synthesis · Exchange · Forge · Treasury). Revenue and capital documents list streams as working positions bound to five open experiments; no revenue, partnership or pilot is claimed.

**Sovereign:** Worth the name: the estate's agents currently cite data they never receipt, and this makes that structurally impossible on the path it governs. Reversible: everything is additive (new directory, new `src/` subtree, one registry entry, one test list entry); deleting the directory restores the prior state. The name "Alexandria" collides with Firecrawl's catalogue name; the README states that Firecrawl's catalogue is one transport and the vertical is the door, so the collision is a feature only as long as that sentence stays true.

**Seer:** In 18 months the receipt ledger is either the moat or a JSONL nobody reads. The success case harms providers if the Exchange resells rows outside their terms; the catalogue carries attribution and per-record pricing, and the Exchange House refuses unsigned or out-of-terms resale, but enforcement is a House rule, not code, until the Exchange ships. Second-order: a fourth reference vertical with 24 planned commands and one shipped risks the "declared live, not authored" debt v79 was written to expose; the vertical ships the 7-file contract and tests on day one so the debt is visible rather than hidden.

**Harmonizer:** Resistance comes from Crypto IS: its On-Chain House already names Dune, Nansen and Arkham as inputs, and Alexandria routes to GMGN and DefiLlama instead. No commitment breaks (Crypto IS treats analytics tools as inputs, not identity), but `SUB-SYSTEMS.md` must say Alexandria *feeds* Crypto IS commands rather than replacing their inputs — it does. The monetization-tiers ladder (service → template → community → platform) is respected: the Exchange is listed as an experiment, not a platform launch.

**Strategist:** This unlocks one thing nothing else in the estate can: a record that can be resold because a stranger can re-check it, which is the §1 compounding curve applied to data instead of docs. It closes off nothing; it adds a budget gate every harness must pass, which is the point. Option value is highest if `protocol/sign.mjs` is wired into the Exchange path before any resale, so that the "verifiable" claim is never ahead of the code.

**Verifier:** What fails first: two catalogue entries (Similarweb, Firecrawl Trends) carry placeholder capability paths because the live contract fetch returned "provider agreements unavailable"; a first execution against them will error, and the validator cannot tell a placeholder from a real path. `MEMORY.md` records this as open reconciliation and the entries say so in their descriptions. Cheapest proving experiment: `exp-2026-10-08-catalogue-recall` costs zero credits and decides whether lexical routing survives. The tests cover routing, budget, receipts, attestation, the status machine and the MCP surface without network, so CI proves the contract, not the providers.

**Overseer:** The load-bearing concern is drift between what the docs promise (verifiable resale, six Houses, 24 commands) and what the code ships (router, receipts, one command): the vertical mitigates it by stating status per artifact and binding every promise to a falsifier, but the Exchange's resale rules must become code before the first paid call. The strongest case for proceeding is that the budget gate and receipt discipline are already enforced in code and tests on day one, which is more than any prior vertical shipped at v0.1.

**Recommendation:** PROCEED
**Rationale:** Additive, reversible, tested, and honest about its placeholders; the only substrate touch is an append-only registry entry.

Conditions carried into `MEMORY.md`:
1. Reconcile the two placeholder capability paths before any execution against them.
2. Wire `protocol/sign.mjs` into the Exchange path before the first resale; until then the Exchange is an experiment, not a product.
3. Close or re-date every experiment by its `closesBy`; an overdue experiment at the next board is a REVISE item.

---
**Built on SIP** · Starlight Board · 2026-10-08
