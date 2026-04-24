---
name: sip-export
description: Export a SIP artifact into a target ecosystem's native packaging while preserving "Built on SIP" attestation. Targets — claude-project, chatgpt-project, gemini-gem, cursor, cowork, notion-ai. Refuses any target that strips attestation.
allowed-tools: Read, Write, Grep, Glob, Bash
argument-hint: <target> <artifact-path> [--output <dir>]
---

# /sip-export

Load `SIP.md`, the artifact at `<artifact-path>`, and the target-specific schema at `integrations/exports/<target>.md`. Package the artifact into the target ecosystem's native format without losing attestation integrity.

## Input
$ARGUMENTS

## Load sequence

1. `SIP.md` — Layer 2 attestation rules, Layer 4 command taxonomy.
2. Artifact at `<artifact-path>` — parse in full, including trailing attestation block.
3. `integrations/exports/<target>.md` — target ecosystem schema (bundle structure, custom-instructions template, validation rules).
4. `integrations/exports/README.md` — universal integrity rule.

## Allowed targets

`claude-project` · `chatgpt-project` · `gemini-gem` · `cursor` · `cowork` · `notion-ai`

Anything else halts at step 1.

## Process

1. **Validate target.** Parse first positional arg. If not in the allowed list, halt. Emit: `Target "<arg>" not supported. Allowed: claude-project, chatgpt-project, gemini-gem, cursor, cowork, notion-ai. Unsupported targets fail loud by design.` Do not silently fall back.

2. **Validate attestation.** Scan the artifact for a "Built on SIP" block matching the format in `sip-attest.md` § Output format. If absent or malformed, halt. Emit: `Artifact has no valid "Built on SIP" block. Run /sip-attest <artifact-path> first. Exporting unattested artifacts would decorate the ecosystem with hollow claims — refused.` Do not proceed.

3. **Parse attestation.** Extract:
   - Substrate version (SemVer)
   - Layers used (array)
   - Verticals (with commit pins)
   - Canon (with license)
   - Nodes (with roles)
   - Generated date
   Retain as a structured object used by every downstream step.

4. **Load target schema.** Read `integrations/exports/<target>.md`. This document owns the target's bundle structure, custom-instructions template, MCP strategy, and validation rules. `/sip-export` orchestrates; it does not encode target specifics.

5. **Generate bundle.** Produce the target-native packaging per the schema. The attestation block must appear at minimum twice in every bundle:
   - Visibly at the top of the primary artifact file (README.md, system prompt, custom instructions, or equivalent).
   - In the bundle's metadata/config file as a structured field.
   Optional: embed in a `badge.svg` copied from the `/badge` route for the attestation hash.

6. **Integrity check.** Re-parse the emitted bundle:
   - Round-trip: unpack the bundle, locate the artifact, run the same attestation parser from step 2 against it. It must parse identically to step 3.
   - Visibility: confirm the attestation block appears in the file the target ecosystem surfaces to the user (custom instructions for Claude Projects, system prompt for ChatGPT, Gem instructions for Gemini, `.cursorrules` for Cursor, workspace README for Cowork, page body for Notion AI).
   - Version echo: confirm substrate version in the bundle metadata matches step 3.
   If any check fails, halt. Do not emit. Report which check failed and why. Re-run after fix.

7. **Emit summary.** Structured block with bundle path, attestation integrity result, and post-export checklist.

## Output shape

```
# SIP Export — <target>

## Source
- Artifact: <artifact-path>
- Substrate pin: v<semver>
- Attestation generated: <ISO date>

## Bundle
- Path: <output-path>
- Format: <zip / json / md / dir>
- Attestation visibility: <file(s) where the block appears>
- Integrity check: PASS

## Post-export checklist (user)
1. <target-specific step 1 from schema>
2. <target-specific step 2>
3. <target-specific step 3>
4. Verify attestation block survived by running /sip-attest on the imported artifact inside the target ecosystem.
5. Register the export in starlight/ATTESTATIONS.md under § Exports.

## Reciprocity
Exported artifacts remain attested to SIP. Target ecosystem does not acquire ownership. Attribution compounds across every ecosystem the artifact travels through.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands]
- Verticals: starlight-intelligence-system@v7.4
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never** export an artifact without a valid "Built on SIP" block. `/sip-attest` is the prerequisite; softening this is protocol-corroding.
- **Never** allow a target exporter to strip, minimize, or bury attestation. Integrity check halts emit on violation — no override.
- **Never** silently fall back on unsupported targets. Fail loud, list the allowed set.
- **Never** encode target specifics in `/sip-export`. Each target's schema lives in its own file under `integrations/exports/`. Orchestration here, details there.
- **Always** round-trip the bundle before emitting. If a bundle cannot be re-parsed, it cannot travel — it is already broken.
- **Always** pin the substrate version in the bundle metadata. Imports on the other side must be able to detect version drift.
- Exports are **immutable** once generated. Re-export requires bumping the artifact version first (touch `MEMORY.md` or the artifact's version header, re-run `/sip-attest`, then re-export). This prevents silent drift between identical bundle names.
- If a target ecosystem later changes its packaging such that attestation cannot survive, update the target's schema to refuse export, not to soften attestation.
- Attestation is compounding. Every ecosystem the artifact reaches without losing attestation is a node on the trust graph.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
