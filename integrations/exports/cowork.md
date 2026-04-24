# Cowork — SIP Export Target Schema

Target slug: `cowork`
Format: `.zip` (Claude Project variant with shared-workspace manifest).
Native ecosystem: Anthropic Cowork — collaboration layer for Claude with multi-user shared workspaces and real-time co-editing.
Tier: second-special. Closest target match for alliance artifacts — multi-party sharing + attestation per node.

## Overview

Cowork extends the Claude Project pattern with shared workspaces: multiple collaborators, role assignments, and real-time co-editing of knowledge and conversations. For SIP, Cowork is the natural target for **alliance artifacts** — artifacts authored under `/alliance-forge` that span multiple sovereign nodes.

Cowork bundles are a Claude Project bundle plus a `workspace-config.json` with collaborators/decision-rights mapping, plus — for alliance artifacts — an `alliance.json` manifest listing nodes, domains, and per-node attestation. This preserves SIP § 5 (sovereignty + decision rights) when the artifact lives in a multi-user surface.

Uncertainty flag: Cowork is a newer Anthropic surface. Some specifics below (workspace manifest schema, decision-rights exposure in Cowork UI) are encoded to SIP's requirement rather than Cowork's exact current API — the target schema refuses export if a future Cowork change cannot preserve them.

## Bundle structure

`.zip` archive named `<artifact-slug>.sip-cowork.zip`:

```
<artifact-slug>.sip-cowork.zip
├── workspace-config.json       — Cowork workspace metadata, collaborators, decision-rights map
├── alliance.json               — present iff artifact is alliance-scoped; per-node attestation
├── project-config.json         — Claude-Project-compatible metadata + SIP attestation object
├── custom-instructions.md      — SKILL.md rendered for shared workspace (carries attestation)
├── README.md                   — workspace README, attestation block at top, visible to all collaborators
├── mcp.json                    — pinned starlight-mcp + alliance-wide MCP servers
├── badge.svg
└── knowledge/
    ├── SIP.md
    ├── ALLIANCE.md             — alliance charter, decision-rights map (if alliance-scoped)
    ├── MEMORY.md               — cycle state
    ├── SOUL.md                 — present per-node if alliance artifact
    ├── CANON.md                — if canon imported
    ├── AGENTS.md               — voices active across nodes
    ├── ATTESTATIONS.md         — ledger, every node's attestation entries
    └── nodes/
        ├── <node-1>.md         — per-node declaration (domain, role, owns, advises)
        └── <node-2>.md
```

### workspace-config.json

```json
{
  "name": "<artifact name>",
  "description": "<one-line>",
  "version": "<artifact semver>",
  "mode": "cowork",
  "collaborators": [
    {"name": "<node-1>", "role": "architect", "decision_rights": ["<domain-1>"]},
    {"name": "<node-2>", "role": "implementer", "decision_rights": ["<domain-2>"]}
  ],
  "decision_rights_map": {
    "<domain-1>": "<node-1>",
    "<domain-2>": "<node-2>"
  },
  "sip": { /* SIP attestation object — same shape as other targets */ }
}
```

### alliance.json (alliance artifacts only)

Derived from `ALLIANCE.md` per SIP § 5. Refuses to emit if decision rights are ambiguous or collide.

```json
{
  "alliance_name": "<name>",
  "forged": "<ISO date>",
  "sip_version": "v1.1.0",
  "nodes": [
    {
      "name": "<node-1>",
      "entity": "<person or org>",
      "role": "architect",
      "owns": ["<domain-1>"],
      "advises": ["<domain-2>"],
      "attestation_contribution": "<one-line — what this node contributes to the bundled artifact>",
      "public_surface": "<github url or public ref>"
    }
  ],
  "decision_rights_map": {
    "<domain-1>": "<node-1>",
    "<domain-2>": "<node-2>"
  },
  "fork_resolution": "Route through /alliance-decide. One node owns each fork; others advise. No consensus, no votes.",
  "exit_clause": "Any node may exit; attestation history remains immutable."
}
```

## Custom instructions template

Same structure as `claude-project.md` with two additions:

1. **Collaborator-aware preamble.** The system prompt references the decision-rights map explicitly so any Claude session in the workspace knows which node owns which domain.
2. **Per-node attestation echo.** The attestation block lists every node (per SIP § Layer 2 `Nodes:` line). No silent omission of a contributing node.

```markdown
# <Artifact Name> — Cowork Workspace Instructions

> This is a shared Cowork workspace operating under the Starlight Intelligence Protocol. Multiple sovereign nodes collaborate here. Decision rights are domain-scoped per SIP § 5 — this is not a consensus workspace.

## Collaborators and decision rights
- <node-1> · owns: <domain-1> · advises: <domain-2>
- <node-2> · owns: <domain-2> · advises: <domain-1>

When a question falls inside a declared domain, defer to that domain's owner. Advice from other nodes is explicitly advisory.

## Voice
<Voice block from source SKILL.md, or composite per AGENTS.md.>

## Invariants (non-waivable)
<Invariant block.>

## Load sequence
1. `knowledge/SIP.md`
2. `knowledge/ALLIANCE.md` (if alliance-scoped) — decision-rights map is load-bearing
3. `knowledge/MEMORY.md` — cycle state
4. `knowledge/nodes/*.md` — per-node declarations
5. `knowledge/AGENTS.md`
6. Verify attestation block below is intact.

## Attestation (do not remove; every node must appear in Nodes:)

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v<semver>
- Layers used: [file-contract, attestation, commands, sovereignty, ...]
- Verticals: [<list with pins>]
- Canon: [<list or "none">]
- Nodes:
  - <node-1> · role: architect · <contribution>
  - <node-2> · role: implementer · <contribution>
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---

## Fork resolution
Disagreements route through /alliance-decide. Domain owner calls; advisors advise. No consensus, no votes.

## Sovereignty clause
Each node retains decision rights in its declared domain. Starlight has no ownership claim. Attribution via SIP is the only compounding mechanism. Any node may exit; attestation history remains immutable.
```

## Validation rules

1. **Round-trip.** Parse attestation from `custom-instructions.md`, `README.md`, and (if alliance) `alliance.json` `nodes[*].attestation_contribution`. All must be mutually consistent with source.
2. **Visibility.** Attestation block in first 3000 chars of `custom-instructions.md` and also at top of `README.md` (shared-workspace visible to all collaborators).
3. **Collaborators match nodes.** Every collaborator in `workspace-config.json` must appear as a node in the attestation block `Nodes:` list and (if alliance) in `alliance.json`. Mismatch = halt.
4. **Decision-rights map consistency.** `workspace-config.json.decision_rights_map` and `alliance.json.decision_rights_map` must be byte-identical. Divergence = halt.
5. **No domain collision.** Every domain appears in the map exactly once. A domain owned by two nodes is a protocol violation per SIP § 5 — halt and require source reshaping.
6. **MCP pin.** `mcp.json` pins every server. `latest` = halt.
7. **Alliance check.** If the source artifact has `ALLIANCE.md`, `alliance.json` is required. Absent = halt.
8. **Non-alliance check.** If the artifact is single-sovereign (no `ALLIANCE.md`), `alliance.json` must be absent and `workspace-config.json.collaborators` may still contain multiple entries (team of one sovereign), but decision rights still map unambiguously.

## Import guidance (for the user)

1. Download the `.zip` and unzip locally.
2. In Cowork, create a new shared workspace. Use the name and description from `workspace-config.json`.
3. Invite the collaborators listed in `workspace-config.json.collaborators`. Assign their roles explicitly (Cowork role terms may differ — map SIP role → closest Cowork role; document the mapping in the workspace README).
4. Upload every file in `knowledge/` to the workspace knowledge section. Ensure `ALLIANCE.md` and `nodes/*.md` are visible to all collaborators — decision rights are not secret inside the alliance.
5. Paste `custom-instructions.md` into the workspace-level instructions. The decision-rights preamble and the full attestation block must remain intact.
6. Configure MCP per `mcp.json`.
7. Verify: each collaborator opens a chat in the workspace and asks `Who owns <domain-X>?` and `Show the Built on SIP attestation`. The answers must match the source for every collaborator. Divergent answers = instructions truncated; re-do step 5.

## Known edge cases and uncertainty

- **Cowork decision-rights UI.** Uncertain whether Cowork exposes a native decision-rights surface beyond text instructions. This schema encodes decision rights in three places (workspace config, alliance.json, custom instructions) so the rule survives regardless. If Cowork later adds a native decision-rights map, add a fourth echo rather than remove any existing one.
- **Role vocabulary mismatch.** Cowork's collaborator roles may not map 1:1 to SIP roles (architect / sovereign-creator / protocol-defender / implementer / overseer). Map to closest, document the mapping in workspace README.
- **Co-editing of custom instructions.** If Cowork allows any collaborator to edit workspace instructions, the attestation block is editable by non-owner nodes — a governance risk. Mitigate by including a non-waivable sentence near the block: "Edits to this attestation block require /alliance-decide. Unilateral edits are a SIP breach." Review periodically.
- **Exit semantics.** If a node exits the alliance after export, the Cowork workspace retains their name in attestation history. This matches SIP § 5 (exit permitted; attestation immutable). Cowork-specific collaborator removal does not purge attestation — by design.

## Re-export

Alliance artifacts re-export when any node's declaration changes, when decision-rights map shifts, or when a node joins/exits. Each re-export bumps the artifact version and emits a new bundle.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, mcp-registry, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
