# integrations/exports — SIP Ecosystem Export Schemas

Target-ecosystem packaging specs for `/sip-export`. Each file in this directory defines one ecosystem: its native bundle format, its attestation surface, its import guidance, and its validation rules.

## Purpose

SIP's compounding moat is attestation that travels. A "Built on SIP" block stamped inside a Claude Code session means nothing if the artifact loses attestation the moment it leaves this repo. This directory is the portability layer — the contract that lets SIP artifacts move across AI ecosystems without attestation drift.

`/sip-export` orchestrates. The schemas in this directory encode target specifics. The split is deliberate: adding a new target should never require editing the command.

## Supported targets

| Target | Native format | MCP support | Attestation strategy | Sharing model |
|--------|---------------|-------------|----------------------|---------------|
| `claude-project` | `.zip` (project-config + custom-instructions + knowledge/) | Native via `mcp.json` | Block in custom instructions + README + badge.svg | Single-user, per-project |
| `chatgpt-project` | `.json` (config + system prompt + file bundle) | None (warn user) | Block in system prompt + bundled README | Single-user, per-project or Custom GPT |
| `gemini-gem` | Single `.md` (front-matter + instructions body) | None in web; yes via Gemini CLI | Block in Gem instructions | Single-user (web) or shared (Workspace) |
| `cursor` | `.cursorrules` + `mcp.json` + `.cursor/knowledge/` | Native via `~/.cursor/mcp.json` | Block in `.cursorrules` header | Single-user, per-repo |
| `cowork` | `.zip` (project-config + shared-workspace manifest + knowledge/) | Native (Claude Project variant) | Block in workspace README + collaborators' custom instructions | Multi-user, real-time collaborative |
| `notion-ai` | Notion page export (`.zip` of markdown + assets) | None | Block at top of root page + in page properties | Multi-user via Notion workspace |

## Universal rule — non-negotiable

**Every target must preserve attestation visibility.** The "Built on SIP" block must appear in a file the target ecosystem surfaces to the user — not buried in metadata the user never reads. If a target changes its packaging such that attestation cannot survive in a surface-level location, the schema for that target must update to **refuse export**, not to soften the attestation requirement.

Silent composition is a breach. Exports are a vector for silent composition. This rule blocks that vector.

## How to add a new target

Follow this 7-step schema template. Copy from an existing target file; do not invent.

1. **Name the target.** Slug (lowercase, hyphen-separated) used by `/sip-export <target>`. Add to the allowed list in `.claude/commands/sip-export.md` and to the table above.
2. **Declare the native format.** What file or archive does the target consume? `.zip`, `.json`, single `.md`, workspace import URL, etc.
3. **Map the attestation surface.** Which file inside the bundle does the target surface to the user? That file must carry the attestation block at the top, visibly. If the target has no such surface, refuse the target.
4. **Define the bundle structure.** Directory layout, required files, naming conventions. Include a `badge.svg` pointer to the `/badge` route output for the attestation hash.
5. **Write the custom-instructions / system-prompt template.** Show the exact rendering of SKILL.md + attestation block into the target's instructions format. The attestation must be inside the instructions, not adjacent — so downstream agents inside the target ecosystem can self-verify.
6. **Write the import guidance.** Numbered 5-step list the user follows to ingest the bundle. End with a verify step: running `/sip-attest` (or the equivalent inside the target) on the imported artifact should round-trip.
7. **Write validation rules.** Round-trip requirement, attestation visibility requirement, MCP declaration requirement (if supported), any target-specific constraints.
8. End the file with a "Built on SIP" attestation block per `sip-attest.md`.

## Orchestration boundary

- `/sip-export` is responsible for: target validation, attestation presence check, attestation parsing, schema loading, round-trip integrity check, summary emission.
- Schema files in this directory are responsible for: bundle structure specification, custom-instructions / system-prompt rendering, import guidance, target-specific validation, MCP fragment generation.

Never mix these responsibilities. If you find yourself encoding target-specific rendering inside `/sip-export`, stop and move it to the schema.

## Pointer

Command: `.claude/commands/sip-export.md`
Attestation generator: `.claude/commands/sip-attest.md`
Protocol: `SIP.md` § Layer 2 (attestation), § Layer 4 (command taxonomy).

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands]
- Verticals: starlight-intelligence-system@v7.4
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
