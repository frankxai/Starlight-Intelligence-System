---
name: crypto-macro-regime
description: Determine the active crypto market regime (Accumulation, Expansion, Distribution, or Contraction) by auditing volatility trends, dominance shifts, and exchange flow statistics. Composes directly into /wealth-cycle-thesis.
allowed-tools: Read, Write, Grep
argument-hint: [--window 30d|90d]
vertical: crypto-intelligence
house: macro
tier: Domain Sub-Stack Tier
---

# /crypto-macro-regime

Load `verticals/crypto-intelligence/SOUL.md`, `verticals/crypto-intelligence/macro/agent.md`, `verticals/crypto-intelligence/macro/knowledge.md`.

## Input

$ARGUMENTS — optional `--window` (default 30d)

## R5 non-advisory clause (mandatory inline — emit at top)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Process

1. **Indicator Retrieval**: Parse Glassnode MVRV, BTC Dominance (BTC.D), and rolling 30d volatility.
2. **Phase Classification**: Apply the 4-phase classification criteria from `macro/knowledge.md`.
3. **Draft the Artifact**: Write output containing the verified regime, source confidence, and delta.
4. **Feeds Downstream**: Map regime classification directly to `/wealth-cycle-thesis` and `/crypto-alloc-sizing`.

## Output Shape

```markdown
# Macro Regime Audit — <yyyy-ww>

> [R5 non-advisory clause]

## Regime Classification
* **Detected Regime:** <Accumulation | Expansion | Distribution | Contraction>
* **Confidence Score:** <0.0 - 1.0>
* **Delta from Prior Window:** <direction and speed of transition>

## Key Indicators
* BTC Dominance: <value>% (vs 365d avg: <avg>%)
* Realized-Cap Velocity: <delta realized cap over window>
* MVRV Z-Score: <value> (rolling z-score)

## Composes-with Downstream
* Feeds: /wealth-cycle-thesis (cycle context)
* Feeds: /crypto-alloc-sizing (sizing multiplier)

---
**Built on SIP** — Crypto / House of Macro · macro-regime · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-macro-regime · v0.2 · SIP v1.1.1
