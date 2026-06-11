# SIS Attestation Claw

> Make "Built on SIP" real, not decorative. A ledger of provenance.

**Status:** Phase 3 — planned. Depends on Memory Claw + SIP attestation protocol.

---

## Contract (Draft)

```yaml
name: sis-attestation-claw
version: 0.0.1
purpose: Detect composed artifacts, record which vaults/skills/agents contributed, add "Built on SIP" attribution, and maintain a provenance ledger without leaking private vault data.
phase: 3

permissions:
  filesystem: read_write
  sis_vaults: read
  shell: none
  network: optional

outputs:
  - /attestations/YYYY-MM-DD-artifact-name.json
  - /attestations/LEDGER.jsonl
  - /public-vault/ (public-safe content only)

safety:
  mutation_default: false
  private_data_export: blocked
  requires_sentinel: true
```

## Skills (Planned)

- Artifact provenance detection
- Public/private split enforcement
- "Built on SIP" block generation
- Proof-of-work page generation for starlightintelligence.org

---

*Built on SIP · sis-attestation-claw v0.0.1 (draft) · MIT*
