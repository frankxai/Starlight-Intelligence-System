---
name: crypto-alloc-concentration
description: Stress-test the portfolio's concentration profile under extreme simulated asset drawdowns and correlation spikes.
allowed-tools: Read, Write
argument-hint: [--drawdown-scenario 50%|80%]
vertical: crypto-intelligence
house: alloc
tier: Domain Sub-Stack Tier
---

# /crypto-alloc-concentration

## Input

$ARGUMENTS — optional `--drawdown-scenario` (default 80%)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Concentration Stress Test — <yyyy-ww>

> [R5 non-advisory clause]

## Drawdown Simulation Vector
* Active Scenario: <drawdown-scenario> drop in primary holding
* Systemic Altcoin Correlation Shift: <r_simulated> (converges to 1.0)

## Simulated Estate Valuation Impact
* Max Drawdown Impact: -<percentage>%
* High Concentration Warnings: <Asset name - Exceeds 30% concentration bounds>

---
**Built on SIP** — Crypto / House of Allocation · concentration-test · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-alloc-concentration · v0.2 · SIP v1.1.1
