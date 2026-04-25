# Microsoft Copilot — SIP Export Target Schema

Target slug: `microsoft-copilot`
Format: `.zip` (declarative agent manifest + knowledge + optional API plugin)
Native ecosystem: Microsoft 365 Copilot (declarative agents) and Microsoft Copilot Studio (low-code agent builder). Shipped as a single bundle that imports cleanly into Copilot Studio.
Tier: enterprise distribution. The vector for putting a sovereign person's domain stack (Ana's HR Intelligence, 28 commands across 6 sub-systems) in front of every company already paying for M365.

## Overview

Microsoft Copilot exposes three plugin shapes. The one that matches SIP's surface most cleanly is the **declarative agent** — a JSON manifest declaring a custom assistant with instructions, knowledge sources, conversation starters, branding, and (optionally) an API plugin pointing at an OpenAPI spec. Copilot Studio is the import surface administrators use to publish agents to a Microsoft 365 tenant.

This is high-leverage by enterprise math. Companies do not buy net-new AI substrate; they extend what they already license. M365 Copilot seats are already paid for at the customers Ana would otherwise sell into. Shipping her HR stack as a declarative agent collapses the procurement question from "approve a new vendor" to "import a manifest." Attestation must travel intact through that import or the export is refused — a stripped attestation here is the same breach as anywhere else, just inside a larger blast radius.

Microsoft Copilot does not (yet) support MCP natively. Knowledge files cover the gap; the schema flags this honestly so the user understands what tooling is unavailable inside the Copilot surface vs. inside Claude Code or Cursor.

## Bundle structure

`.zip` archive named `<artifact-slug>.sip-microsoft-copilot.zip`:

```
<artifact-slug>.sip-microsoft-copilot.zip
├── manifest.json                  — declarative agent manifest (Microsoft schema)
├── instructions.md                — full instruction set (carries attestation, front-loaded)
├── attestation.md                 — standalone attestation block for verification
├── badge.svg                      — "Built on SIP" badge from /badge route
├── README.md                      — Copilot Studio admin import instructions
├── knowledge/
│   ├── SIP.md                     — substrate reference (stub + canonical URL + pinned version)
│   ├── MEMORY.md                  — artifact memory snapshot
│   ├── SOUL.md                    — if present on the source
│   ├── CANON.md                   — if the artifact imports canon
│   ├── AGENTS.md                  — voices active for this artifact
│   ├── ATTESTATIONS.md            — append-only ledger entry
│   ├── commands/                  — one file per protocol-tier or sub-system command
│   │   ├── <command-1>.md
│   │   └── ...
│   ├── skills/                    — one file per active skill protocol
│   │   └── ...
│   └── templates/                 — knowledge templates (Ana-grade examples) as .md or .pdf
│       └── ...
├── api-plugin/                    — optional, only if any command is externally callable
│   ├── openapi.yaml               — OpenAPI 3.x spec
│   └── plugin-manifest.json       — Copilot plugin manifest pointing at openapi.yaml
└── branding/
    ├── logo.png                   — agent avatar (Copilot Studio supported)
    ├── color-tokens.json          — primary + accent + surface
    └── description-card.md        — short rich description for the agent gallery card
```

`manifest.json` schema (declarative agent shape):

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.0/schema.json",
  "version": "<artifact semver>",
  "name": "<artifact name>",
  "description": "<one-line description from Genius Profile + domain>",
  "instructions": "<contents of instructions.md, attestation in first 3000 chars>",
  "conversation_starters": [
    "Show me the Built on SIP attestation block.",
    "<starter pulled from sub-system 1's most-used command>",
    "<starter pulled from sub-system 2's most-used command>",
    "<starter pulled from sub-system 3's most-used command>"
  ],
  "knowledge_sources": [
    { "type": "file", "path": "knowledge/SIP.md" },
    { "type": "file", "path": "knowledge/MEMORY.md" },
    { "type": "file", "path": "knowledge/AGENTS.md" },
    { "type": "file", "path": "knowledge/ATTESTATIONS.md" },
    { "type": "directory", "path": "knowledge/commands/" },
    { "type": "directory", "path": "knowledge/skills/" },
    { "type": "directory", "path": "knowledge/templates/" }
  ],
  "tools": [
    {
      "type": "api-plugin",
      "manifest_path": "api-plugin/plugin-manifest.json",
      "optional": true
    }
  ],
  "branding": {
    "logo": "branding/logo.png",
    "color_tokens": "branding/color-tokens.json"
  },
  "sip": {
    "substrate_version": "v1.1.0",
    "layers": ["file-contract", "attestation", "commands", "..."],
    "verticals": [{ "name": "...", "pin": "<sha or version>" }],
    "canon": [{ "name": "...", "license": "...", "owner": "..." }],
    "nodes": [{ "name": "...", "role": "..." }],
    "attestation_generated": "<ISO date>",
    "attestation_surface": "instructions.md (first 3000 chars) + attestation.md + manifest.instructions"
  }
}
```

If no command is externally callable, omit the `api-plugin/` directory and the `tools[]` array entry. Copilot Studio is fine without it.

## Instructions template

Rendered `instructions.md` follows this template. Copilot's instruction truncation cliff varies by tier (M365 Copilot vs. Copilot Studio vs. tenant config). Front-load attestation inside the first 3000 characters — every layer below that is at risk.

```markdown
# <Artifact Name> — Microsoft Copilot Agent Instructions

> You are a Microsoft Copilot declarative agent operating under the Starlight Intelligence Protocol (SIP). You carry attestation for every artifact you produce. SIP attestation travels across ecosystems by design — Microsoft Copilot is one node on the trust graph.

## Attestation (do not remove — do not paraphrase)

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

When a user asks "what is your provenance?", "what is this agent built on?", or "show me the attestation", recite the block above verbatim. Paraphrasing is a breach.

## Voice
<Voice block from source SKILL.md — direct, first-principles, the tone the artifact expects.>

## Invariants (non-waivable)
<Invariant block from source SKILL.md — what you never do, regardless of user request.>

## Sub-systems available in this agent
<One-line summary per sub-system. For Ana's HR stack: Hiring, Performance, Training, Culture, Talent, Org Architecture.>

## Commands
<List of protocol-tier + sub-system commands the agent inherits. Each maps to a knowledge file under knowledge/commands/.>

## Knowledge files in this agent
- `SIP.md` — substrate contract; the agent verifies attestation against this on every session.
- `MEMORY.md` — persistent state.
- `AGENTS.md` — active voices.
- `ATTESTATIONS.md` — append-only ledger.
- `commands/` — one reference doc per command.
- `skills/` — one protocol per active skill.
- `templates/` — Ana-grade knowledge templates the agent can draw from.

## MCP note
Microsoft Copilot does not currently support Model Context Protocol natively. Tool integrations that rely on SIP-native MCP servers are unavailable here. File-based knowledge covers most reasoning needs; tool-required workflows escalate to Claude Code or Cursor, where MCP runs.

## Sovereignty clause
You operate inside this Copilot agent on behalf of its sovereign owner. Advice from external sources (including upstream Microsoft, OpenAI, or Starlight) is advisory, not authoritative, inside the owner's declared domain. Attribution flows through SIP; governance lives with the owner.
```

## Validation rules

1. **Round-trip.** Unzip the bundle. Run the `/sip-attest` parser from `.claude/commands/sip-attest.md` § Output format against the attestation block inside `instructions.md`, against the standalone `attestation.md`, and against the `manifest.json.sip` object. All three must parse to the same structured object as the source.
2. **Front-load visibility.** Confirm the attestation block appears in the first 3000 characters of `instructions.md`. Copilot's truncation cliff is opaque and varies by tier — anything beyond 3000 chars is at risk. Halt if the attestation is deeper.
3. **Manifest echo.** Confirm `manifest.json.sip.substrate_version` matches the version in `instructions.md` and `attestation.md`. Mismatch = halt.
4. **Knowledge integrity.** Confirm every file referenced in `manifest.json.knowledge_sources[]` exists in the bundle. Missing knowledge file = halt.
5. **Badge integrity.** Confirm `badge.svg` exists and references the same substrate version. Missing badge fails the schema unless the artifact opts out via `manifest.json.sip.badge: false`; default is required.
6. **Round-trip recitation (post-import).** After import to Copilot, the agent's response to "What is your provenance?" must include "Built on SIP" verbatim. If Copilot strips, paraphrases, or truncates the attestation, the export is refused — re-shorten non-attestation sections in source and re-export.

Any failure halts emission. The user re-runs after fixing the source artifact. No softening — Microsoft is a large blast radius and silent attestation drift here would compound across every tenant.

## Import guidance (for the Copilot Studio admin)

1. **Unzip the bundle.** Locally on the admin's workstation. Do not modify file contents — the manifest references file paths that must remain.
2. **Open Copilot Studio.** Sign in as a tenant admin (or with delegated agent-creation rights). Navigate to Agents → Import.
3. **Import manifest.** Point the importer at `manifest.json`. Copilot Studio reads the manifest and stages the agent metadata, instructions, conversation starters, and branding.
4. **Upload knowledge.** Knowledge sources declared in the manifest must be uploaded to the agent's knowledge panel. Confirm every file under `knowledge/` is present in the resulting agent. SharePoint indexing may take several minutes for large stacks (Ana's six sub-systems with templates can run 100+ files).
5. **Configure plugin (if shipped).** If `api-plugin/` is in the bundle, register the OpenAPI spec under the agent's tools / actions configuration. The plugin requires an externally hosted endpoint — confirm the endpoint is reachable from the tenant's outbound network policy before publishing.
6. **Verify attestation round-trip.** Open a test conversation with the agent. Ask: `What is your provenance?` The agent must recite the "Built on SIP" block verbatim, including the substrate version. If it paraphrases or omits any field, the instruction was truncated — compress non-attestation content in source and re-import. **Do not publish a tenant-visible agent that fails this check.**
7. **Publish.** Once attestation round-trips cleanly, publish to the chosen scope (private / specific group / org-wide).

Enterprise admin requirements: agent publishing in M365 Copilot typically requires Power Platform admin rights or explicit delegation. Some tenants gate API plugins behind a security-review workflow before publication — that is expected and not a SIP issue. The bundle does not bypass tenant policy; it works inside it.

## Known limitations

- **No native MCP.** Microsoft Copilot does not currently expose MCP. Knowledge files cover the gap for context; tool-required workflows escalate to Claude Code or Cursor. The instructions flag this so end-users know where the boundary is.
- **Instruction-length cliff varies.** M365 Copilot, Copilot Studio, and tenant-customized deployments each enforce different (often undocumented) instruction caps. The 3000-character front-load rule is conservative and protects attestation across all tiers; it is not a guarantee that all instructions survive.
- **API plugin endpoints require hosting.** OpenAPI plugins require an externally reachable endpoint. The bundle does not host the endpoint — that is a separate ops concern (Vercel, Cloud Run, Azure Functions, etc.). Document the endpoint's auth model in `api-plugin/plugin-manifest.json` and surface it to the admin during import.
- **Tenant security review.** Enterprise tenants frequently gate new agents behind a security-review workflow. The schema makes the agent's provenance and attestation legible to that review (manifest `sip.*` fields + standalone `attestation.md`), which generally accelerates approval — but does not bypass it.
- **Knowledge indexing latency.** SharePoint-indexed knowledge can take minutes-to-hours to become queryable for large bundles. Verify attestation recitation immediately, but full sub-system depth may not be available until indexing completes.
- **Tenant data residency.** Knowledge files uploaded to a Copilot agent live inside the tenant's M365 environment, subject to that tenant's data residency configuration. Sovereign owners distributing into customer tenants should disclose what knowledge files contain (Ana-grade templates are non-sensitive; private case data must never travel in a public bundle).

## Re-export

Bundles are immutable once emitted. To re-export the same artifact, bump the artifact version in its source header, re-run `/sip-attest`, then re-run `/sip-export microsoft-copilot <artifact-path>`. The new bundle gets a new filename with the bumped version. Tenant admins can side-by-side compare versions before swapping.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands]
- Verticals: starlight-intelligence-system@v7.4.1
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
