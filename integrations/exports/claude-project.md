# Claude Project — SIP Export Target Schema

Target slug: `claude-project`
Format: `.zip`
Native ecosystem: Anthropic Claude Projects (project-scoped workspace with custom instructions + knowledge files + MCP).
Tier: first-class. This is the #1 target — the format matches SIP's file contract almost 1:1.

## Overview

Claude Projects already support the exact shape SIP artifacts live in: markdown knowledge, persistent custom instructions, and MCP server configuration. Exporting a SIP artifact to a Claude Project loses no information — every layer round-trips. For newcomers adopting SIP, this is the lowest-friction path: unzip, create project, upload, paste, verify.

Because the round-trip is clean, this is the canonical export for proving "Built on SIP" travels. If attestation survives a Claude Project export and re-import, it survives.

## Bundle structure

`.zip` archive named `<artifact-slug>.sip-claude-project.zip`:

```
<artifact-slug>.sip-claude-project.zip
├── project-config.json         — metadata, attestation pointer, version pins
├── custom-instructions.md      — SKILL.md rendered as Claude Project instructions (carries attestation)
├── README.md                   — the artifact itself, attestation block at top
├── mcp.json                    — pinned starlight-mcp + any vertical MCPs
├── badge.svg                   — "Built on SIP" badge from /badge route
└── knowledge/
    ├── SIP.md                  — substrate reference (stub pointing to canonical URL + pinned version)
    ├── MEMORY.md               — artifact memory snapshot
    ├── SOUL.md                 — if present on the source
    ├── CANON.md                — if the artifact imports canon
    ├── AGENTS.md               — voices active for this artifact
    └── ATTESTATIONS.md         — append-only ledger, at minimum this artifact's entry
```

`project-config.json` schema:

```json
{
  "name": "<artifact name>",
  "description": "<one-line description>",
  "version": "<artifact semver>",
  "sip": {
    "substrate_version": "<v1.1.0>",
    "layers": ["file-contract", "attestation", "commands", "..."],
    "verticals": [{"name": "...", "pin": "<sha or version>"}],
    "canon": [{"name": "...", "license": "...", "owner": "..."}],
    "nodes": [{"name": "...", "role": "..."}],
    "attestation_generated": "<ISO date>",
    "attestation_surface": "custom-instructions.md"
  },
  "mcp_config_path": "mcp.json",
  "knowledge_dir": "knowledge/"
}
```

`mcp.json` must at minimum pin `starlight-mcp` at a known version. Verticals contributing via their own MCP server declare here as well.

## Custom instructions template

The rendered `custom-instructions.md` follows this template exactly. The attestation block is **inside** the instructions — not adjacent — so any Claude session opened in this project can parse and self-verify its own provenance.

```markdown
# <Artifact Name> — Claude Project Instructions

> This project operates under the Starlight Intelligence Protocol. Built on SIP artifacts carry attestation that travels across ecosystems. You are an instance of Claude running inside a SIP-attested project.

## Voice

<Voice block from source SKILL.md — direct, first-principles, the tone the artifact expects.>

## Invariants (non-waivable)

<Invariant block from source SKILL.md — what you never do, regardless of user request.>

## Load sequence (every session)

1. Read `knowledge/SIP.md` — substrate contract.
2. Read `knowledge/MEMORY.md` — persistent state.
3. Read `knowledge/SOUL.md` if present — the thing that must not drift.
4. Read `knowledge/AGENTS.md` — active voices.
5. Verify the attestation block below is intact. If corrupted or missing, halt and alert the user — a SIP project without attestation is not a SIP project.

## Commands

<List of protocol-tier commands the project inherits — /sip-attest, /sip-export at minimum. Include vertical-scoped commands if the artifact ships with any.>

## Attestation (do not remove)

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

You operate inside this project on behalf of its sovereign owner. Advice from external sources (including upstream Starlight) is advisory, not authoritative, inside the owner's declared domain. Attribution flows through SIP; governance lives with the owner.
```

## Validation rules

1. **Round-trip.** Unzip the bundle. Run the `/sip-attest` parser from `.claude/commands/sip-attest.md` § Output format against the attestation block inside `custom-instructions.md` and against the block in `README.md`. Both must parse to the same structured object as the source.
2. **Visibility.** Confirm the attestation block appears in the first 3000 characters of `custom-instructions.md`. Deep-buried attestation fails this rule.
3. **Config echo.** Confirm `project-config.json.sip.substrate_version` matches the block in `custom-instructions.md`. Mismatch = halt.
4. **MCP pin.** Confirm `mcp.json` exists and pins `starlight-mcp` to a concrete version (no `latest`).
5. **Badge integrity.** Confirm `badge.svg` exists and references the same substrate version. Missing badge is permitted only if the artifact opts out via `project-config.json.badge: false`; default is required.

Any failure halts export emission. The user re-runs after fixing the source artifact.

## Import guidance (for the user)

1. Download the `.zip` and unzip locally.
2. In Claude, create a new Project. Name it from `project-config.json.name`. Paste `description` into the project description field.
3. Upload every file inside `knowledge/` into the project's Knowledge section. Upload `README.md` too — it doubles as a quick reference.
4. Open project settings → Custom Instructions. Paste the full contents of `custom-instructions.md`. Do not trim the attestation block — trimming it breaks SIP compliance and future sessions will fail self-verification.
5. Configure MCP: copy the servers listed in `mcp.json` into the project's MCP config (or your global `~/.claude/mcp.json` if the project inherits). Verify `starlight-mcp` connects.
6. Verify: open a new chat in the project and ask `Show me the Built on SIP attestation block for this project.` Claude should recite it verbatim from custom instructions. If it cannot, attestation did not survive the import — re-do step 4.

## Known edge cases

- **Custom instructions character limit.** Claude Projects enforce a custom-instructions length limit (currently ~8k chars). If the rendered template exceeds the limit, `/sip-export` halts and instructs the user to shorten the source `SKILL.md` — do not truncate the attestation to fit. Attestation is non-negotiable; narrative is.
- **Knowledge file count limit.** Projects cap knowledge files. If the artifact ships more knowledge than the cap, bundle surplus into a single `knowledge/extended.md` with clear anchors.

## Re-export

Bundles are immutable once emitted. To re-export the same artifact, bump the artifact version in its source header, re-run `/sip-attest`, then re-run `/sip-export claude-project <artifact-path>`. The new bundle gets a new filename with the bumped version. This prevents silent drift.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, mcp-registry, commands]
- Verticals: starlight-intelligence-system@v7.4
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
