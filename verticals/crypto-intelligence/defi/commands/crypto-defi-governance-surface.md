---
name: crypto-defi-governance-surface
description: Assess a protocol's voting system and token concentration to evaluate hostile takeovers or governance attack surfaces.
allowed-tools: Read, Write
argument-hint: <protocol-slug>
vertical: crypto-intelligence
house: defi
tier: Domain Sub-Stack Tier
---

# /crypto-defi-governance-surface

## Input

$ARGUMENTS — protocol-slug

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Governance Attack Surface — <protocol-slug> — <yyyy-ww>

> [R5 non-advisory clause]

## Voting Dynamics
* Voting Token: <symbol>
* Top 10 Voters Hold: <percentage>%
* Voting Quorum: <percentage>%

## Parameter Attack Risks
* Flash Loan Attack Feasibility: <High / Moderate / Low>
* Governance timelock: <hours>

---
**Built on SIP** — Crypto / House of DeFi · governance-surface · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-defi-governance-surface · v0.2 · SIP v1.1.1
