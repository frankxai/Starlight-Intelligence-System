---
name: sip-attest
description: Generate "Built on SIP" attestation block for any artifact. Primary foundation-layer attribution command. Refuses to emit if composition is not real.
allowed-tools: Read, Grep, Glob, mcp__github
argument-hint: path to the artifact, or paste contents
---

# /sip-attest

Load `SIP.md` and `VERTICALS.md`. Attach Starlight Intelligence Protocol attestation to the artifact.

## Artifact
$ARGUMENTS

## Process

1. **Scan for SIP elements.**
   - File contract markers: presence of `SKILL.md`, `AGENTS.md`, `MEMORY.md`, `.claude/commands/*`, `.arc`, `.nea`, `.<vertical>/` directories.
   - Canon references: Guardian names, Vel'Tara names, Hz frequencies — validate via `arcanea-mcp.canon-validate` if available.
   - MCP dependencies: check for `mcp.json` or explicit tool calls.
   - Command usage: trace any `/sip-*`, `/alliance-*`, `/<vertical>-*`, `/<sovereign>-*` invocation.
   - Cross-party contribution: scan commit history across repos listed in `VERTICALS.md` or `MEMORY.md`.

2. **Enforce reality.** If no SIP elements are actually used, refuse. Emit: `Cannot attest — no SIP composition detected. Attestation would be decorative, which corrodes the protocol.` Do not proceed.

3. **Classify the composition.**
   - Which substrate layers (file contract, attestation, MCP, commands, sovereignty, archetype) are invoked?
   - Which verticals contribute?
   - Which canon (if any) is imported? Verify license compatibility.
   - Which sovereign nodes (if alliance artifact) contribute?

4. **Pin versions.**
   - Substrate: pin by SemVer from `SIP.md` header.
   - Vertical repos: pin by commit SHA via `mcp__github` where available.
   - Canon: pin by canon version tag.
   - Unpinnable: mark `@unpinned` rather than fabricate.

5. **Emit block.** Append per `SIP.md` § Layer 2 format.

## Output format

```
---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v<semver>
Layers used: [file-contract, attestation, commands, …]

Verticals:
- <vertical-name>@<commit-sha-or-version> · <one-line contribution>
- …

Canon:
- <canon-name> v<version> · license: <CC-BY-NC / none> · © <entity>

Nodes (if alliance artifact):
- <node-name> · role: <architect/creator/defender/implementer> · <one-line contribution>
- …

Generated: <ISO date>
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- If only one vertical and one node contributed, still emit the block — the attestation is to SIP itself, not just to collaborators.
- If canon is imported but license terms are incompatible with the artifact's distribution, emit a LICENSE-CONFLICT warning in the block and halt.
- Never use "Built on SIP" on artifacts that do not use SIP elements. Enforcement is the protocol's integrity.
- The block format is stable across versions. Changes require SIP major version bump.
