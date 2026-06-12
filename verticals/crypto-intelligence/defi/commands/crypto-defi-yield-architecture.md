---
name: crypto-defi-yield-architecture
description: Audit yield flows of a pool to mathematically separate fee revenue (real yield) from token inflation (emissions).
allowed-tools: Read, Write
argument-hint: <pool-address-or-slug>
vertical: crypto-intelligence
house: defi
tier: Domain Sub-Stack Tier
---

# /crypto-defi-yield-architecture

## Input

$ARGUMENTS — pool-address-or-slug

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Yield Architecture Review — <pool-address-or-slug> — <yyyy-ww>

> [R5 non-advisory clause]

## Yield Composition
* Total Pool APY: <total>%
* Real Yield (Swap Fees / Lending Interest): <fees>%
* Inflationary Emissions APY: <emissions>%

## Sustainability Metrics
* **Sustainability Index (SI):** <SI_value> (Real Yield / Total APY)
* **Dilution Vector Warning:** <Standard | Extreme | Critical>

---
**Built on SIP** — Crypto / House of DeFi · yield-architecture · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-defi-yield-architecture · v0.2 · SIP v1.1.1
