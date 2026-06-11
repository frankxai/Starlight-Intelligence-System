---
name: crypto-alloc-sizing
description: Calculate volatility-adjusted, cycle-aware position sizes for an asset. Feeds Wealth DPI ledger downstream.
allowed-tools: Read, Write
argument-hint: <asset-slug> [--conviction 0.0-1.0]
vertical: crypto-intelligence
house: alloc
tier: Domain Sub-Stack Tier
---

# /crypto-alloc-sizing

## Input

$ARGUMENTS — asset-slug and `--conviction` (default 0.5)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Position Sizing Audit — <asset-slug> — <yyyy-ww>

> [R5 non-advisory clause]

## Sizing Profile
* Target Conviction: <conviction>
* **Active Macro Regime Discount:** <D_regime> (from House of Macro)
* **Maximum Volatility-Adjusted Size:** <percentage>% of portfolio

## Liquidity Alignment
* Compatible Custody Tier: <Tier 1 / Tier 2 / Tier 3>
* Target Liquidity Window: <days>

## Composes-with Downstream
* Feeds: /wealth-portfolio-fit (DPI concentration metrics)

---
**Built on SIP** — Crypto / House of Allocation · position-sizing · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-alloc-sizing · v0.2 · SIP v1.1.1
