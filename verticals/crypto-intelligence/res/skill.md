---
name: crypto-res
description: House-tier skill auto-activates when working inside verticals/crypto-intelligence/res/ or invoking any /crypto-res-* command. Enforces R5 clause, tokenomics auditing, and founder diligence.
triggers:
  - keywords [diligence, tokenomics, supply schedules, vesting, lockup, founder, git activity]
  - command-prefix /crypto-res-*
---

# SKILL — Crypto / House of Research

> House-tier skill governs protocol-mechanism analysis and ecosystem diligence tracking.

---

## When this skill fires

- Working inside `verticals/crypto-intelligence/res/`
- Invoking any `/crypto-res-*` command
- Feeding protocol-theses into the Wealth IS Thesis engine

---

## Execution rules

1. **Verify R5 clause is present** in the output template before starting analysis.
2. **Dilution Auditing** — calculate and highlight structural supply cliffs within the rolling 12-month horizon.
3. **Ecosystem Interdependency Check** — map all upstream protocol dependencies (e.g. underlying L1 liveness, bridge risk).
4. **Attest outputs** — ensure `ATTESTATIONS.md` is updated and artifacts contain the SIP attestation block.

---

**Built on SIP** — Crypto / House of Research skill · v0.2 · SIP v1.1.1
