---
name: crypto-res-ecosystem-map
description: Maps the interdependencies of a protocol within its ecosystem (bridges, collateral wrappers, underlying networks).
allowed-tools: Read, Write
argument-hint: <protocol-slug>
vertical: crypto-intelligence
house: res
tier: Domain Sub-Stack Tier
---

# /crypto-res-ecosystem-map

## Input

$ARGUMENTS — protocol-slug

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Ecosystem Interdependency Map — <protocol-slug> — <yyyy-ww>

> [R5 non-advisory clause]

## Upstream Dependencies
* Layer 1 / Execution Chain: <chain>
* Price feed Oracle Dependency: <oracle name>
* Native bridge utilized: <bridge name / type>

## Contagion Risk Vector
* Systemic Collateral Dependency: <e.g. wrapped tokens, collateral pools>
* Risk Score: <High / Moderate / Low>

---
**Built on SIP** — Crypto / House of Research · ecosystem-map · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-res-ecosystem-map · v0.2 · SIP v1.1.1
