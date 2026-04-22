# CANON — Substrate Canon Posture

> Optional per SIP § Layer 1. This file declares whether the substrate defines canon, imports canon, or declines canon.

## Decision: substrate **declines** canon at the protocol layer.

The Starlight substrate is the *protocol* layer. Canon (archetypes, world rules, domain constants) lives at the *vertical* layer. Conflating the two would force every SIP adopter to inherit Frank's specific canon, which destroys sovereignty.

## Where canon lives

- **Arcanea canon** — Guardians, Vel'Tara, Hz grounding, lore. Defined by the Arcanea vertical at `frankxai/arcanea-ecosystem`. Licensed CC-BY-NC 4.0 © Arcanea BV. Available for any SIP vertical to compose under attribution.
- **Per-vertical canon** — each vertical may define its own canon in its own `CANON.md`. Anime Legends extends Arcanea canon for anime archetypes. Wealth IS does not need canon. GenCreator Community does not need canon. Per-vertical choice.
- **Reference instances** — alliance examples (Trinity, EpicWays) may reference canon by attribution; they do not own it.

## Composition rules (per SIS.md)

1. Canon is imported, not merged. A vertical using Arcanea canon imports with attribution; it does not fork and rename.
2. Every composition is attestation-carrying. "Built on SIP + Arcanea canon" is the full block. No silent canon usage.
3. Canon license terms travel with the canon. CC-BY-NC means non-commercial use only; commercial use requires explicit license from Arcanea BV.
4. Verticals may decline canon entirely. Substrate compliance does not require canon adoption.

## Why this distinction matters

Substrate compounds via protocol attribution at scale. Canon compounds via IP licensing at scale. Two compounding curves, two different license shapes (MIT for substrate, CC-BY-NC for canon), two different governance shapes (open PRs vs Arcanea BV approval). Mixing them collapses both.

## How to invoke canon validation

When working with Arcanea canon: `arcanea-mcp.canon-validate` checks Guardian / Vel'Tara / Hz references resolve. See `REGISTRY.md` for the MCP server entry. Out-of-canon references in artifacts that claim canon attribution are protocol breaches — `/sip-attest` will refuse to emit if canon validation fails (when integration ships in v1.2).

---

**Built on SIP** · v1 · MIT
