---
name: crypto-res-tokenomics
description: Audit token value-accrual, circulating supply, dilution schedules, and upcoming vesting cliffs.
allowed-tools: Read, Write
argument-hint: <token-symbol>
vertical: crypto-intelligence
house: res
tier: Domain Sub-Stack Tier
---

# /crypto-res-tokenomics

## Input

$ARGUMENTS — token-symbol

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Tokenomics Audit — <token-symbol> — <yyyy-ww>

> [R5 non-advisory clause]

## Supply Schedule
* Circulating Supply: <supply>
* Maximum Supply: <supply>
* **Annual Inflation Rate (AIR):** <percentage>%

## Vesting & Cliff Schedule
* Next Major Cliff Date: <YYYY-MM-DD>
* Shard Released to Team: <percentage>%
* Shard Released to Investors: <percentage>%

---
**Built on SIP** — Crypto / House of Research · tokenomics-audit · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-res-tokenomics · v0.2 · SIP v1.1.1
