# SIP — Starlight Intelligence Protocol

**The contract that lets sovereign parties compose intelligence systems without losing sovereignty.**

Canonical URL: `starlightintelligence.org/protocol`
Source of truth: `frankxai/Starlight-Intelligence-System` (this repo), file `SIP.md`.
Version: `v1.1.1`

## Scope

SIP defines *how* intelligence systems are built, attested, and composed across sovereign parties. It does not define *what* is built. It is the minimum viable shared contract.

## Layer 1 — File contract

Every SIP-compliant repository carries these files at the root or inside `.<vertical>/`:

| File | Purpose | Required |
|------|---------|----------|
| `SKILL.md` | Behavior definition — what the AI adopts when this context is loaded | yes |
| `AGENTS.md` | Voices / agent definitions | yes if >1 agent |
| `MEMORY.md` | Durable state, commitments, open forks | yes |
| `CANON.md` | Archetypes, world rules, domain constants | optional |
| `SOUL.md` | Founder or vertical essence — the thing that must not drift | optional but recommended |
| `STACK.md` | Adopted stack choices (may inherit from Starlight's) | optional |
| `.claude/commands/*.md` | Slash-command contracts | as needed |

File extensions beyond markdown:

- `.arc` — agent configuration (JSON or YAML, schema TBD v1.1).
- `.nea` — narrative / world / canon configuration (JSON or YAML).
- `.skill` — compact skill descriptor for embedding into larger skill packs.

## Layer 2 — Attestation protocol

Every artifact that composes ≥1 SIP element carries a "Built on SIP" block. The block is emitted via `/sip-attest`, which refuses to emit without real contribution. Attribution does not mean credit *transfer* — it means credit *compounding* across every adopter.

Minimum block:

```
---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v<semver>
- Verticals: [<list>]
- Canon: [<list or "none">]
- Nodes: [<list of sovereign contributors>]
Generated: <ISO date>
---
```

Pinning rules:

- Substrate is pinned by SemVer.
- Vertical contributions are pinned by commit SHA where available.
- Canon is pinned by canon version tag (Arcanea canon is versioned separately in `arcanea-ecosystem`).
- Unpinnable contributions are marked `@unpinned`, never fabricated.

## Layer 3 — MCP registry standard

MCP servers that expose SIP-native tools declare themselves via `mcp.json` in their repo root:

```json
{
  "name": "arcanea-mcp",
  "sip_version": "1.0.0",
  "provides": ["arcanea.canon", "arcanea.guardians", "arcanea.veltara"],
  "requires": [],
  "attestation": { "built_on_sip": true }
}
```

The registry itself is a flat file at `starlight/REGISTRY.md` (v1.1 will promote to a queryable MCP).

## Layer 4 — Command taxonomy

Four command tiers, each with a naming convention and decision-rights rule:

| Tier | Prefix / location | Owner | Example |
|------|-------------------|-------|---------|
| **Protocol** | `/sip-*` | Starlight (Frank) | `/sip-attest` |
| **Alliance** | `/alliance-*` | shared across alliance nodes | `/alliance-reflect` |
| **Vertical** | `/<vertical>-*` | vertical owner | `/arcanea-canon`, `/wealth-dpi` |
| **Sovereign** | `/<name>-*` | individual sovereign node | `/sovereign-signal`, `/openclaw-audit` |

Commands in lower tiers may depend on higher-tier commands. Higher-tier commands never depend on lower-tier ones.

## Layer 5 — Sovereignty + attribution clause

Non-negotiable social contract. Every party that adopts SIP accepts:

1. **Sovereignty.** Each party retains full decision rights inside its declared domain. Advice ≠ override.
2. **Attribution.** Every shared artifact carries the "Built on SIP" block. Silent composition is a breach.
3. **Reciprocity of canon.** Using another party's canon requires the canon's license terms (default CC-BY-NC for Arcanea canon).
4. **Commitment shape.** Cross-party commitments name artifacts and dates, never intentions.
5. **Fork resolution.** Disagreements route through `/alliance-decide`. One node owns each fork per declared domain; others advise.
6. **Exit.** Any party can leave the composition. Attribution history remains immutable.
7. **Encoded-self forkable boundary.** The substrate pattern (agents, skills, commands, methods, governance) is forkable under each component's license. Encoded-self artifacts — founder voice clones, identity vectors, personal canon, vault-specific paths, and any artifact that fingerprints a sovereign — are non-licensable and non-transferable. Forks may inherit the pattern, never the person. *Encoded-self definition is grounded in 2026 norms; revisits quarterly starting 2026-W30 (2026-07-20) as voice-cloning and identity-vector technology shifts. Operational test for pattern-vs-encoded-self is `scripts/audit-authorlessness.ts`.*

## Layer 6 — Archetype extension (optional)

Verticals may adopt or extend canonical archetypes. The foundational archetype set (Arcanea's Guardians / Vel'Tara / Hz grounding) is licensed CC-BY-NC by Arcanea BV. Verticals may:

- **Adopt whole** — import the full archetype set with attribution.
- **Extend** — add new archetypes in their own namespace without renaming existing ones.
- **Decline** — use their own archetype layer or none at all.

Archetypes are not required for SIP compliance. Protocol, attestation, and sovereignty are. Archetypes are canon-layer compounding, adopted where the vertical benefits.

## Versioning

- SIP versions are SemVer.
- Breaking changes require a major bump and a 90-day deprecation window.
- Canonical changelog: `starlightintelligence.org/protocol/changelog`.

## License

- **This spec (SIP.md):** MIT.
- **Reference command implementations (`.claude/commands/*`):** MIT.
- **Arcanea canon (if adopted):** CC-BY-NC 4.0, © Arcanea BV.
- **Per-vertical content:** owned by the vertical entity.

---

**Built on SIP** · v1.1.1 · Authored by Frank Riemer (Starlight Holding BV) · MIT
- v1.1.1 (2026-05-06): adds § 5 item 7 (encoded-self forkable boundary) per Luminor Board v8 REVISE #4 + Starlight Board 2026-05-06 wording-tightening REVISE
- v1.1.0 — initial multi-vertical contract
