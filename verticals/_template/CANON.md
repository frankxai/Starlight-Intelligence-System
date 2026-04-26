# CANON — `<Vertical Name>`

> Per-vertical canon posture. Declares whether this vertical defines, imports, or declines canon at the SIP § Layer 6 boundary.

---

## Canon posture

- [ ] **Defines** — this vertical is the canonical source for `<domain>`. Other verticals may compose with attestation under `<license-terms>`.
- [ ] **Imports** — this vertical composes with `<source-vertical>`'s canon under `<license-terms>`. Pin: `<commit-sha or version>`.
- [ ] **Declines** — this vertical declines canon at the protocol layer. Practitioner forks may declare their own canon downstream.

---

## License-pinning details

If imports: pin the source canon's commit SHA or semver. Document the license terms (CC-BY-NC, MIT, custom).

If defines: declare the license terms this vertical's canon is offered under.

---

## Cross-canon composition (if multi-import)

If this vertical composes multiple canons (e.g., Hz from Arcanea + something from another sovereign canon), declare the composition rules and any precedence ordering.

---

**Built on SIP** — `<vertical-name>` CANON.md · v0.1 · SIP v1.1.0
