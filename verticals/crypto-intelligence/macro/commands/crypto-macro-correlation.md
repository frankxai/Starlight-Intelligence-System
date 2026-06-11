---
name: crypto-macro-correlation
description: Audit rolling Pearson correlation coefficients between BTC, ETH, equities, and the DXY to identify liquidity regimes and beta drift.
allowed-tools: Read, Write
argument-hint: <asset-slug> [--window 30d|90d]
vertical: crypto-intelligence
house: macro
tier: Domain Sub-Stack Tier
---

# /crypto-macro-correlation

## Input

$ARGUMENTS — asset-slug (e.g. SOL, SPX, DXY) and `--window` (default 90d)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Correlation Audit — <asset-slug> — <yyyy-ww>

> [R5 non-advisory clause]

## Core Metrics
* **Asset:** <asset-slug>
* **Rolling 30d Correlation (vs BTC):** <r_30d>
* **Rolling 90d Correlation (vs BTC):** <r_90d>
* **365d Mean Correlation:** <r_365d>

## Structural Interpretation
* **Correlation Delta:** <delta in standard deviations from baseline>
* **Beta Drift Assessment:** <high | medium | low>

---
**Built on SIP** — Crypto / House of Macro · macro-correlation · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-macro-correlation · v0.2 · SIP v1.1.1
