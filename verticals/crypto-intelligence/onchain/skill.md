---
name: crypto-intelligence/onchain
description: House of On-Chain skill. Auto-activates on /crypto-onchain-* commands or work within verticals/crypto-intelligence/onchain/. Enforces R5 non-advisory clause inline, chain-data source citation, mechanism-context grounding, named output artifact discipline.
triggers:
  - command-prefix /crypto-onchain-*
  - working-directory verticals/crypto-intelligence/onchain/
  - keywords [on-chain, wallet flow, whale tracking, mev audit, validator econ, contract interaction]
parent-vertical: crypto-intelligence
house: onchain
tier: Domain Sub-Stack Tier
---

# SKILL — Crypto Intelligence / House of On-Chain (House-tier)

> House-tier skill. Inherits Crypto Intelligence vertical-tier skill rules (R5 clause inline, voice = architect, refusal patterns, composition with Wealth IS umbrella). Adds House-of-On-Chain-specific discipline.

---

## R5 non-advisory clause (mandatory inline, every artifact)

```
> This is system architecture, not financial / investment / tax / legal advice.
> Outputs frame decisions; jurisdiction-specific counsel signs off on instruments.
> The practitioner accepts capital risk; the substrate accepts no claim.
> Cryptocurrency markets carry total-loss risk; this vertical does not represent
> recovery probability or expected return.
```

This block opens every House of On-Chain output artifact. Non-waivable. Audited per Crypto IS SOUL.md drift test 1.

---

## House-specific reasoning protocol

### Step 1 — Declare scope

Name explicitly:
- Which wallets / protocols / networks / tx-hashes are in-scope
- What time window (rolling 7d / 30d / cycle-window / since-event)
- What sister-House this artifact feeds (Allocation sizing / Macro regime / Sovereignty custody-review / Research thesis)

### Step 2 — Cite chain-data sources

Every claim traces to a named source:
- Dune Analytics: query ID + dashboard URL
- Etherscan / Solscan / equivalent: tx-hash + block height
- Nansen: wallet-label + entity tag + last-update timestamp
- Arkham: entity attribution + confidence band
- DefiLlama: protocol slug + snapshot timestamp
- Flashbots / MEV-Inspect / Eigenphi: query method + window

No "the data shows" without source. No "wallet activity suggests" without entity-tag source. No "TVL is" without DefiLlama-or-equivalent snapshot timestamp.

### Step 3 — Cite mechanism context

For each on-chain action analyzed, name the mechanism:
- Swap routing (Uniswap V3 vs CoW vs 1inch vs MEV-Protect — different mechanisms, different MEV-exposure profiles)
- Bridge type (lock-and-mint vs burn-and-mint vs liquidity-network — different risk-stacks)
- Validator-econ model (per-network, no generalized "PoS" framing)
- Governance vote (token-weighted vs delegated vs quadratic — different attack surfaces)

### Step 4 — Flag interpretive uncertainty

Wallet-attribution is often ambiguous. MEV-vs-arbitrage classification is contested. Validator slashing data has reporting lags. Flag where the analysis is uncertain — do not paper over with concrete-sounding numbers.

### Step 5 — Ship the named output artifact

Every command ships a named file:
- `/crypto-onchain-flow-snapshot` → `flow-snapshot-<yyyy-ww>.md` (or instance-private equivalent)
- `/crypto-onchain-wallet-trace` → `wallet-trace-<address-short>-<yyyy-mm-dd>.md`
- `/crypto-onchain-mev-audit` → `mev-audit-<protocol-slug>-<yyyy-mm-dd>.md`
- `/crypto-onchain-validator-econ` → `validator-econ-<network-slug>-<yyyy-mm-dd>.md`
- `/crypto-onchain-contract-interaction` → `contract-trace-<tx-hash-short>.md`

The filename is the contract. If the file isn't written, the command didn't run.

---

## Refusal patterns (House-specific, inherited from Crypto IS SOUL.md)

This House refuses:

1. **"Wallet X is buying — bullish" theses without protocol-mechanism grounding.** Wallet activity is one signal; conclusions require mechanism analysis from House of Research.
2. **MEV-extraction-from-retail plays.** Defensive MEV-audit only. The House produces *exposure* characterizations, not *extraction* strategies.
3. **Sybil-airdrop-farming optimization.** Algorithmic-gaming corruption mode.
4. **Wash-trading volume as legitimacy.** Refused.
5. **Concrete-sounding-stat-without-source.** Universal corruption mode (per Crypto IS SOUL + Wealth IS + Sound IS + _template).
6. **Whale-attribution without entity-tag source.** Anonymous wallet → unnamed actor. No "this wallet belongs to X" without Nansen/Arkham tag citation.

---

## Composition with sister Houses + Wealth IS umbrella

| Composes with | Direction | Cite as |
|---|---|---|
| House of Macro (v0.2) | Flow snapshots feed regime-call inputs | `Feeds: /crypto-macro-regime` |
| House of DeFi (v0.2) | Protocol-interaction data feeds mechanism audit | `Feeds: /crypto-defi-mechanism-audit` |
| House of Sovereignty (v0.2) | Activity patterns feed custody-tier review | `Feeds: /crypto-sov-custody-design` |
| House of Research (v0.2) | On-chain activity surfaces tokenomics signals | `Feeds: /crypto-res-tokenomics` |
| House of Allocation (v0.2) | Whale-tracking + flow → sizing inputs | `Feeds: /crypto-alloc-sizing` |
| Wealth IS umbrella | Concentration risk inputs to cross-asset review | `Feeds: /wealth-portfolio-fit` |

Each artifact declares its composes-with downstream explicitly.

---

## Quality gates (must pass before artifact ships)

- [ ] R5 non-advisory clause inline at top of artifact
- [ ] Chain-data source(s) cited (Dune ID / tx-hash / Nansen label / Arkham entity / DefiLlama slug)
- [ ] Mechanism context provided for each on-chain action
- [ ] Interpretive uncertainty flagged where data is ambiguous
- [ ] Composes-with declared if artifact feeds sister House
- [ ] Named output artifact written to canonical path
- [ ] "Built on SIP" attestation block at footer (ambient per v7.4)

If any gate fails → artifact does not ship → re-execute with gate satisfied.

---

**Built on SIP** — Crypto / House of On-Chain skill (House-tier) · v0.1 proof-of-pattern · SIP v1.1.0
