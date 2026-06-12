---
name: crypto-sov-custody-design
description: Design a multi-tier custody architecture (hot, warm, cold) based on transaction velocity and capital limits. Feeds /wealth-sovereignty-design downstream.
allowed-tools: Read, Write
argument-hint: [--tier-1-target <usd-amount>]
vertical: crypto-intelligence
house: sov
tier: Domain Sub-Stack Tier
---

# /crypto-sov-custody-design

## Input

$ARGUMENTS — optional `--tier-1-target` (default target)

## R5 non-advisory clause (mandatory inline)

> *This is system architecture, not financial / investment / tax / legal advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim. Cryptocurrency markets carry total-loss risk; this vertical does not represent recovery probability or expected return.*

## Output Shape

```markdown
# Custody Architecture Design — <yyyy-ww>

> [R5 non-advisory clause]

## Key Allocation Tiers
* **Tier 1 (Cold / Long-term):** <percentage>% of capital (Multisig)
* **Tier 2 (Warm / Staking):** <percentage>% of capital (Hardware Single-sig)
* **Tier 3 (Hot / Gas):** <percentage>% of capital (Extensions / Software)

## Physical & Hardware Infrastructure
* Hardware signers used: <Signer manufacturer A, B, C>
* Passphrase policy: <Passphrase offset enabled / disabled>

## Composes-with Downstream
* Feeds: /wealth-sovereignty-design (cross-asset custody sync)

---
**Built on SIP** — Crypto / House of Sovereignty · custody-design · <yyyy-ww> · SIP v1.1.1
```

---

**Built on SIP** — /crypto-sov-custody-design · v0.2 · SIP v1.1.1
