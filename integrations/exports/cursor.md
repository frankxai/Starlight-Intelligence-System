# Cursor — SIP Export Target Schema

Target slug: `cursor`
Format: directory drop into a Cursor repo root.
Native ecosystem: Cursor IDE (AI-first code editor, rules via `.cursorrules`, MCP via `~/.cursor/mcp.json` or project `.cursor/mcp.json`).
Tier: third. Developer-first target; native MCP support; clean mapping to SIP file contract.

## Overview

Cursor's rules system (`.cursorrules` at repo root) is the attestation surface. MCP is first-class — servers declared in `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project-scoped as of 2025+) — so SIP's MCP layer round-trips cleanly. Knowledge files live as regular repo files; Cursor reads them through its codebase indexing.

This export produces a drop-in bundle a developer unpacks at the root of an existing or fresh repo.

## Bundle structure

Directory `<artifact-slug>.sip-cursor/`:

```
<artifact-slug>.sip-cursor/
├── .cursorrules                — SKILL.md rendered as Cursor rules (carries attestation)
├── .cursor/
│   ├── mcp.json                — project-scoped MCP config, pins starlight-mcp + vertical MCPs
│   └── knowledge/
│       ├── SIP.md
│       ├── MEMORY.md
│       ├── SOUL.md
│       ├── CANON.md
│       ├── AGENTS.md
│       └── ATTESTATIONS.md
├── README.md                   — artifact with attestation block at top
├── badge.svg                   — "Built on SIP" badge
└── sip-config.json             — metadata + attestation object (machine-readable)
```

User drops these into their repo root (merging, not overwriting). `.cursorrules` goes to root; `.cursor/` merges with any existing `.cursor/` directory; `sip-config.json` lives at root as a provenance marker.

## .cursorrules template

Cursor reads `.cursorrules` on every AI interaction in the repo. Attestation lives inside it.

```
# <Artifact Name> — Cursor Rules (Built on SIP)

You are Cursor's AI assistant operating in a repository built on the Starlight Intelligence Protocol (SIP). Every artifact you help produce in this repo inherits SIP attestation.

## Voice
<Voice block from source SKILL.md>

## Invariants (non-waivable)
<Invariant block from source SKILL.md>

## Repository context
- Substrate reference: `.cursor/knowledge/SIP.md`
- Durable state: `.cursor/knowledge/MEMORY.md`
- Essence: `.cursor/knowledge/SOUL.md` (if present)
- Voices: `.cursor/knowledge/AGENTS.md`
- Attestation ledger: `.cursor/knowledge/ATTESTATIONS.md`

Read these before making non-trivial changes. They are not optional context.

## MCP servers
Pinned in `.cursor/mcp.json`:
- starlight-mcp @ <version> — substrate-native tools
- <vertical-mcp> @ <version> — if applicable

Use these tools over ad-hoc scripting when the task matches their surface.

## Commands
Protocol-tier commands available (via user trigger):
- /sip-attest — attach attestation to a new artifact
- /sip-export — package for another ecosystem
- <vertical or sovereign commands if bundled>

## Attestation (do not remove — SIP integrity depends on this block surviving)

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v<semver>
- Layers used: [<list>]
- Verticals: [<list with pins>]
- Canon: [<list or "none">]
- Nodes: [<list with roles>]
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---

## Sovereignty clause
The repo's sovereign owner retains decision rights in their declared domain. Your role is advisory.
```

## .cursor/mcp.json template

```json
{
  "mcpServers": {
    "starlight-mcp": {
      "command": "npx",
      "args": ["-y", "@arcanea/starlight-mcp@<pinned-version>"]
    }
  }
}
```

Additional servers from the source artifact's `REGISTRY.md` merged in.

## Validation rules

1. **Round-trip.** Parse the attestation block from `.cursorrules` using the `/sip-attest` parser. Must match source.
2. **Visibility.** Attestation must appear in `.cursorrules` within the first 3500 characters — Cursor has a rules length budget in practice; front-load.
3. **MCP pin.** `.cursor/mcp.json` must pin every server to a concrete version. `latest` = halt.
4. **Knowledge present.** Every file listed in `.cursorrules` § Repository context must exist inside `.cursor/knowledge/`. Dangling references = halt.
5. **Config echo.** `sip-config.json` substrate version must match the attestation block in `.cursorrules`.

## Import guidance (for the user)

1. Unzip or copy the bundle directory into your repo root. Merge `.cursor/` if you already have one; do not overwrite existing entries without review.
2. Confirm `.cursorrules` lands at repo root. If you already have one, back it up, then concatenate (SIP attestation block must remain intact — do not interleave it with other rule sections).
3. Open the repo in Cursor. Cursor auto-loads `.cursorrules` and `.cursor/mcp.json` — no manual settings step needed.
4. Verify MCP: Cursor status bar should show `starlight-mcp` connected. If not, check the pinned version is installed.
5. Verify attestation: ask Cursor's AI `Show me this repo's Built on SIP attestation block.` It should recite from `.cursorrules` verbatim. If paraphrased, the rules file was truncated by Cursor — shorten non-attestation sections at source and re-export.

## Known edge cases

- **Pre-existing `.cursorrules`.** Attestation must live in its own block; do not mix with foreign rule blocks. If merging is unclear, halt the import and let the user resolve manually — attestation shape is sacred.
- **Global vs project MCP.** If the user runs Cursor with a global `~/.cursor/mcp.json` that conflicts with the bundled project `.cursor/mcp.json`, project-scoped wins in Cursor's recent builds. Document this in the import step.
- **Cursor rules length.** Cursor will silently truncate very long `.cursorrules` files. Attestation is front-loaded for this reason; periodically verify recitation after major source edits.

## Re-export

Bump artifact version, re-attest, re-export. Bundle filename carries the new version.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, mcp-registry, commands]
- Verticals: starlight-intelligence-system@v7.4
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
