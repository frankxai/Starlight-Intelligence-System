---
name: crypto-defi
description: House-tier skill auto-activates when working inside verticals/crypto-intelligence/defi/ or invoking any /crypto-defi-* command. Enforces R5 clause, yield deconstruction, and oracle manipulation audits.
triggers:
  - keywords [defi, liquidity pool, yield, emissions, twap, chainlink, timelock, collateral]
  - command-prefix /crypto-defi-*
---

# SKILL — Crypto / House of DeFi

> House-tier skill governs decentralized finance modeling and protocol threat assessments.

---

## When this skill fires

- Working inside `verticals/crypto-intelligence/defi/`
- Invoking any `/crypto-defi-*` command
- Auditing yield architectures for structural asset sizing

---

## Execution rules

1. **Verify R5 clause is present** in the output template before starting analysis.
2. **Deconstruct Emissions** — ensure the ratio of emissions-to-fees is calculated.
3. **Audit Governance Timelocks** — flag any protocol lacking a minimum 48-hour governance timelock on system modifications.
4. **Attest outputs** — ensure `ATTESTATIONS.md` is updated and artifacts contain the SIP attestation block.

---

**Built on SIP** — Crypto / House of Macro skill · v0.2 · SIP v1.1.1
