---
name: crypto-alloc
description: House-tier skill auto-activates when working inside verticals/crypto-intelligence/alloc/ or invoking any /crypto-alloc-* command. Enforces R5 clause, Kelly-derived sizing, and concentration stress-testing.
triggers:
  - keywords [sizing, rebalance, allocation, kelly criterion, exit discipline, drawdowns]
  - command-prefix /crypto-alloc-*
---

# SKILL — Crypto / House of Allocation

> House-tier skill governs allocation sizing, exit triggers, and rebalancing parameters.

---

## When this skill fires

- Working inside `verticals/crypto-intelligence/alloc/`
- Invoking any `/crypto-alloc-*` command
- Syncing allocation profiles to the Wealth IS DPI ledger

---

## Execution rules

1. **Verify R5 clause is present** in the output template before starting analysis.
2. **Apply Sizing Discount** — dynamically discount Kelly-sizing by at least 50% (fractional Kelly) for crypto assets to account for extreme volatility.
3. **Audit Exit Trigger Status** — evaluate the distance of key assets from their exit trigger bounds during weekly reviews.
4. **Attest outputs** — ensure `ATTESTATIONS.md` is updated and artifacts contain the SIP attestation block.

---

**Built on SIP** — Crypto / House of Allocation skill · v0.2 · SIP v1.1.1
