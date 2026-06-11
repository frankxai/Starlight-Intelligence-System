---
name: crypto-defi-mechanism-audit
description: Audits a DeFi protocol's contract mechanism (liquidation logic, collateral parameters, fee models, smart contract upgrades).
allowed-tools: Read, Write
argument-hint: <protocol-slug>
vertical: crypto-intelligence
house: defi
tier: Domain Sub-Stack Tier
---

# /crypto-defi-mechanism-audit

## Input

$ARGUMENTS — protocol-slug (e.g. AAVE, LIDO)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# DeFi Mechanism Audit — <protocol-slug> — <yyyy-ww>

> [R5 non-advisory clause]

## Core Architecture
* **Protocol Name:** <protocol-slug>
* **Core Contract Version:** <version / tag>
* **Upgradeability Mechanism:** <Timelock | Proxy | Immutable>

## Liquidation & Collateral Audits
* Collateral Factor (LTV): <value>%
* Liquidation Threshold: <value>%
* Liquidation Penalty: <value>%

## Smart-Contract Risk Matrix
* Reentrancy Guards: <Verified / Partial / Absent>
* Upstream Dependency Vulnerability: <Critical / Moderate / Low>

---
**Built on SIP** — Crypto / House of DeFi · mechanism-audit · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-defi-mechanism-audit · v0.2 · SIP v1.1.1
