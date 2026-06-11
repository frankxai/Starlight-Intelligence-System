---
name: crypto-defi-oracle-risk
description: Audit price feed mechanisms and manipulation vulnerability profiles of a protocol's oracle stack.
allowed-tools: Read, Write
argument-hint: <protocol-slug>
vertical: crypto-intelligence
house: defi
tier: Domain Sub-Stack Tier
---

# /crypto-defi-oracle-risk

## Input

$ARGUMENTS — protocol-slug

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Oracle Risk Stack — <protocol-slug> — <yyyy-ww>

> [R5 non-advisory clause]

## Price Feed Mechanics
* Primary Oracle: <Chainlink / Pyth / Uniswap TWAP / etc.>
* Fallback Oracle: <Oracle Type / None>
* Heartbeat Latency: <seconds>

## Threat Vulnerability
* Manipulation Vector Rating: <Vulnerability Level>
* Liveness Risk: <High / Moderate / Low>

---
**Built on SIP** — Crypto / House of DeFi · oracle-risk · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-defi-oracle-risk · v0.2 · SIP v1.1.1
