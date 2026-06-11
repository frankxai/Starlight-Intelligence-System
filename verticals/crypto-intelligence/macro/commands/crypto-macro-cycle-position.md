---
name: crypto-macro-cycle-position
description: Evaluate current cycle position relative to halving epochs, stock-to-flow deviation, and long-term moving averages.
allowed-tools: Read, Write
argument-hint: [--epoch-halving 4th|5th]
vertical: crypto-intelligence
house: macro
tier: Domain Sub-Stack Tier
---

# /crypto-macro-cycle-position

## Input

$ARGUMENTS — optional `--epoch-halving` (default current)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Cycle Position Audit — <yyyy-ww>

> [R5 non-advisory clause]

## Halving Epoch Vector
* **Active Epoch:** <Epoch Number>
* **Days Since Last Halving:** <days>
* **Estimated Days to Next Halving:** <days>

## Long-term Valuation Channels
* Stock-to-Flow Deviation: <value>%
* 200-Week SMA Distance: <delta>%
* Pi Cycle Top Indicator Status: <status>

---
**Built on SIP** — Crypto / House of Macro · cycle-position · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-macro-cycle-position · v0.2 · SIP v1.1.1
