---
name: crypto-alloc-rebalance
description: Audit current position sizes against target volatility bands to determine if rebalancing is required.
allowed-tools: Read, Write
argument-hint: [--threshold-sigma 2.0]
vertical: crypto-intelligence
house: alloc
tier: Domain Sub-Stack Tier
---

# /crypto-alloc-rebalance

## Input

$ARGUMENTS — optional `--threshold-sigma` (default 2.0)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Portfolio Rebalance Audit — <yyyy-ww>

> [R5 non-advisory clause]

## Asset Drift Matrix
| Asset | Target % | Current % | Volatility Band (2σ) | Status | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <asset-1> | <target> | <current> | <band> | <Within / Drifted> | <None / Rebalance> |
| <asset-2> | <target> | <current> | <band> | <Within / Drifted> | <None / Rebalance> |

## Fee Minimization Check
* Projected Transaction Fees: $<amount>
* Fee-to-Rebalance Value Ratio: <percentage>% (<1% is optimal)

---
**Built on SIP** — Crypto / House of Allocation · portfolio-rebalance · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-alloc-rebalance · v0.2 · SIP v1.1.1
