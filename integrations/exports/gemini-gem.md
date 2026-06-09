# Gemini Gem — SIP Export Target Schema

Target slug: `gemini-gem`
Format: single `.md` with YAML front matter (Gems Web) or `.zip` (Gemini CLI).
Native ecosystem: Google Gemini Gems (persistent instruction profiles in Gemini Advanced). Gemini CLI is treated as a richer co-target.
Tier: third. Large reach via Google Workspace; weakest file-support layer of the mainstream targets.

## Overview

Gemini Gems are persistent instruction profiles — a name, a description, and a block of instructions. They do not natively support file uploads on the Web UI; knowledge must live either inline in the instructions or be referenced externally (Google Drive via a user's own Drive MCP if available).

Gemini CLI users get a richer export — the CLI supports MCP and file access, matching Claude Code capabilities. `/sip-export gemini-gem --mode cli` emits the richer bundle; default `--mode web` emits the single-file Gem.

## Bundle structure — Web mode (default)

Single file `<artifact-slug>.sip-gemini-gem.md`:

```markdown
---
name: <artifact name>
description: <one-line>
version: <artifact semver>
sip:
  substrate_version: v1.1.0
  layers: [file-contract, attestation, commands, ...]
  verticals:
    - name: <vertical>
      pin: <sha or version>
  canon: [...]
  nodes: [...]
  attestation_generated: <ISO date>
  attestation_surface: instructions_body
  mcp_support: false
  file_upload_support: false
  drive_integration_suggested: true
---

# <Artifact Name>

[Full rendered instructions body follows — see template below]
```

No directory, no knowledge folder. Everything travels in one file by necessity of the Gems Web format.

## Bundle structure — CLI mode

Directory `<artifact-slug>.sip-gemini-cli/`:

```
<artifact-slug>.sip-gemini-cli/
├── gem-config.json             — Gemini CLI gem config
├── instructions.md             — instructions body (same as Web mode)
├── mcp.json                    — MCP servers for Gemini CLI
├── badge.svg
└── knowledge/
    ├── SIP.md
    ├── MEMORY.md
    ├── SOUL.md
    ├── CANON.md
    ├── AGENTS.md
    └── ATTESTATIONS.md
```

CLI mode is a near-parity analog of `claude-project` — use it for any workflow that needs tool access, not just instruction context.

## Instructions body template

Used in both modes. Attestation block lives inline because Gems have no adjacent metadata surface Gemini will read.

```markdown
# <Artifact Name> — Gemini Gem Instructions

You are Gemini running as a Gem configured for a Starlight Intelligence Protocol (SIP) artifact. You carry attestation for work produced under this Gem's context.

## Voice
<Voice block from source SKILL.md>

## Invariants (non-waivable)
<Invariant block from source SKILL.md>

## Knowledge access

This Gem has no native file-upload surface. Knowledge lives in three places:
1. Inline below — compressed essentials (SIP overview, MEMORY headline state, SOUL one-liner).
2. Google Drive (if the user has connected Drive integration) — full files accessible by filename.
3. External — canonical URLs for substrate and canon (read-only references).

### Inline knowledge
<Compressed digest of MEMORY.md, SOUL.md, and any required canon.>

### External references
- Substrate: https://starlightintelligence.org/protocol (version pinned below)
- Full memory file: `<drive-path-or-github-url>`
- Full soul file: `<drive-path-or-github-url>`

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

## MCP note (Web mode)
Gemini Web does not support MCP. Tool-requiring work escalates to Gemini CLI, Claude Code, or Cursor. This Gem is for instruction and context only.

## Sovereignty clause
The Gem's sovereign owner retains decision rights in their declared domain.
```

## Validation rules

1. **Round-trip.** Re-parse the attestation block from the file using the `/sip-attest` parser. Must match source.
2. **Visibility.** Attestation must appear in the body within the first 3500 characters. Gems have soft instruction-length limits — front-load.
3. **Front-matter echo.** The YAML `sip.substrate_version` must match the attestation block. Parsers on the Google side and downstream audits rely on both.
4. **MCP flag accuracy.** `sip.mcp_support` must be `false` in Web mode, `true` in CLI mode. Never invert.
5. **CLI mode parity.** If CLI mode emitted, `instructions.md` body must byte-match the body of the Web-mode file (if both emitted). Divergence = halt.

## Import guidance (for the user)

### Web mode

1. Download the `.md` file.
2. In Gemini Advanced, go to Gems → Create new Gem.
3. Set `Name` from the YAML `name` field; paste `description` into the description.
4. Paste the entire body (everything below the front matter, including the attestation block) into the Instructions field. Do not trim.
5. Verify: start a conversation with the Gem and ask `Recite your Built on SIP attestation.` Gemini should reproduce the block. If paraphrased, the instruction was truncated — compress inline knowledge in source and re-export.

### CLI mode

1. Unzip the directory.
2. In your Gemini CLI config, register the Gem by pointing at `gem-config.json`.
3. Configure MCP from `mcp.json`.
4. Upload or symlink `knowledge/` files to the CLI's working context.
5. Verify round-trip as in Web mode.

### Drive integration (optional, Web mode)

If the user has a Google Drive MCP or Drive-connected Gem capability, upload the `knowledge/` files from a CLI-mode export (or from the source repo) into a dedicated Drive folder and reference them by filename in the Gem instructions under `External references`.

## Known limitations

- **No file uploads on Web.** Compressed inline knowledge only. The "full" artifact lives elsewhere.
- **No MCP on Web.** Flagged in instructions.
- **Instruction length is opaque.** Google does not publish the Gem instruction cap. Front-load attestation; periodically verify recitation.
- **Gem sharing scope.** Shared Gems (inside Workspace) expose instructions to co-workers — attestation public by design.

## Re-export

Bump artifact version, re-attest, re-export.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands]
- Verticals: starlight-intelligence-system@v7.4
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
