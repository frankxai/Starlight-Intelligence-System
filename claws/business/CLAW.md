# SIS Business Claw

> Turn the user's intelligence into an offer architecture.

**Status:** Phase 3 — planned. Depends on Genius Claw output.

---

## Contract (Draft)

```yaml
name: sis-business-claw
version: 0.0.1
purpose: Extract services/products from the Genius Profile, map recurring expertise into productized offers, define pricing logic, and produce workshop and sales assets.
phase: 3

permissions:
  filesystem: read_write
  sis_vaults: read_write
  shell: none
  network: none

outputs:
  - /business/OFFER_MAP.md
  - /business/PRODUCT_LADDER.md
  - /business/ICP.md
  - /business/SALES_ASSETS.md
  - /business/WORKSHOP_BLUEPRINT.md

safety:
  mutation_default: false
  private_data_export: blocked
  requires_sentinel: true
```

## Skills (Planned)

- Offer architecture extraction
- ICP (Ideal Customer Profile) synthesis
- Product ladder design
- Workshop blueprint generation
- Landing page copy generation
- Revenue hypothesis tracking

---

*Built on SIP · sis-business-claw v0.0.1 (draft) · MIT*
