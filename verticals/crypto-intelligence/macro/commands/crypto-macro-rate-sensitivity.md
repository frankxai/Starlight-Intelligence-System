---
name: crypto-macro-rate-sensitivity
description: Analyze interest rate sensitivity profiles by tracking correlation vectors against US10Y and Federal Funds rates.
allowed-tools: Read, Write
argument-hint: [--rates-source FRED]
vertical: crypto-intelligence
house: macro
tier: Domain Sub-Stack Tier
---

# /crypto-macro-rate-sensitivity

## Input

$ARGUMENTS — optional `--rates-source` (default FRED)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Rate Sensitivity Audit — <yyyy-ww>

> [R5 non-advisory clause]

## Treasury Yield Curve Vector
* **US02Y Yield:** <yield>%
* **US10Y Yield:** <yield>%
* **Spread (10Y-2Y):** <spread> bps

## Sensitivity Score
* **Estimated Portfolio Duration Impact:** <High | Moderate | Low>
* **Systemic Rate Risk Rating:** <Risk Level>

---
**Built on SIP** — Crypto / House of Macro · rate-sensitivity · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-macro-rate-sensitivity · v0.2 · SIP v1.1.1
