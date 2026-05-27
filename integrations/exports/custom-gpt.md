# Custom GPT — SIP Export Target Schema

Target slug: `custom-gpt`
Format: `.json` config + knowledge file bundle (drop-in for OpenAI's GPT Builder)
Native ecosystem: OpenAI ChatGPT Custom GPTs (shareable AI assistants in ChatGPT, available on Plus/Team/Enterprise tiers).
Tier: lowest-friction public distribution. ChatGPT's user base (100M+ weekly active) is the largest non-technical audience for an installable AI assistant. Custom GPT is the surface that meets them where they already are.

## Overview

Custom GPTs are configurable ChatGPT assistants — a name, description, instructions string, conversation starters, capability flags (web browsing, image generation, code interpreter), uploaded knowledge files (RAG over conversation), and Actions (OpenAPI specs for external API calls). They are shareable to anyone, a team, or kept private; Enterprise tenants can manage org-wide.

Two distinctions that matter for SIP. **First**, Custom GPT is not the same as ChatGPT Project (which is documented separately under `chatgpt-project.md`). Project is a multi-conversation workspace with a per-project system prompt; Custom GPT is a single shareable assistant published to ChatGPT's Custom GPT surface. They have different limits and different distribution models. **Second**, Custom GPT instruction strings are capped (currently ~8000 characters); knowledge files are capped (currently 20 files, 512MB total). Both caps require the export to compress aggressively while never compromising attestation.

This is the lowest-friction path to non-technical end users. A sovereign person ships their domain stack (e.g., People Intelligence) as a Custom GPT, the user adds it to their ChatGPT, and the substrate is now in their daily workflow without a single new login. Attestation must travel intact through that path or the export is refused.

## Bundle structure

Directory `<artifact-slug>.sip-custom-gpt/`:

```
<artifact-slug>.sip-custom-gpt/
├── gpt-config.json                — Custom GPT configuration (drop-in for GPT Builder)
├── instructions.md                — full instructions (8000-char limit, attestation in first 3000)
├── attestation.md                 — standalone attestation block for verification
├── conversation-starters.md       — 4 starter prompts (one per most-used sub-system or Freedom Path bucket)
├── badge.svg                      — "Built on SIP" badge from /badge route
├── README.md                      — GPT Builder import instructions
├── knowledge/                     — up to 20 files, 512MB total
│   ├── SIP.md                     — substrate reference (compressed: stub + canonical URL + pinned version)
│   ├── MEMORY.md                  — artifact memory snapshot (compressed)
│   ├── AGENTS.md                  — voices active for this artifact
│   ├── ATTESTATIONS.md            — append-only ledger entry
│   ├── commands-bundle.md         — every command's reference doc, concatenated with anchors
│   ├── skills-bundle.md           — every active skill's protocol, concatenated with anchors
│   ├── sub-systems-brief.md       — one-page brief per sub-system
│   ├── templates-bundle.md        — Ana-grade knowledge templates, concatenated with anchors
│   └── (room for up to 12 additional files within the 20-file cap)
├── actions/                       — optional, only if any command is externally callable
│   └── openapi.yaml               — OpenAPI 3.x spec for GPT Actions
└── assets/
    ├── logo.png                   — generated via NB2 (Gemini 3.1 Flash Image) or GPT Image 2, or hand-designed
    └── color-tokens.json          — brand surface tokens (informational; GPT Builder accepts logo only)
```

Knowledge file concatenation strategy: GPT's 20-file cap forces bundling. Concatenated files use clear `## <Anchor>` headings so the GPT's RAG retrieval can target by section. Never concatenate the attestation surface — `attestation.md` stays standalone.

`gpt-config.json` schema (drop-in for GPT Builder JSON import):

```json
{
  "name": "<artifact name>",
  "description": "<one-line description from Genius Profile + domain>",
  "instructions": "<contents of instructions.md, ≤ 8000 chars, attestation in first 3000>",
  "conversation_starters": [
    "Show me the Built on SIP attestation block.",
    "<starter pulled from sub-system 1's most-used command>",
    "<starter pulled from sub-system 2's most-used command>",
    "<starter pulled from sub-system 3's most-used command>"
  ],
  "knowledge_files": [
    "SIP.md", "MEMORY.md", "AGENTS.md", "ATTESTATIONS.md",
    "commands-bundle.md", "skills-bundle.md",
    "sub-systems-brief.md", "templates-bundle.md"
  ],
  "capabilities": {
    "web_browsing": false,
    "dalle": false,
    "code_interpreter": false
  },
  "actions": {
    "openapi_spec_path": "actions/openapi.yaml",
    "optional": true
  },
  "model_preference": "gpt-5",
  "sip": {
    "substrate_version": "v1.1.0",
    "layers": ["file-contract", "attestation", "commands", "..."],
    "verticals": [{ "name": "...", "pin": "<sha or version>" }],
    "canon": [{ "name": "...", "license": "...", "owner": "..." }],
    "nodes": [{ "name": "...", "role": "..." }],
    "attestation_generated": "<ISO date>",
    "attestation_surface": "instructions (first 3000 chars) + attestation.md + gpt-config.sip"
  }
}
```

If no command is externally callable, omit the `actions/` directory and set `actions.optional: true` with no `openapi_spec_path`.

Capability flags default off. Enable per-artifact intent: `web_browsing` if the agent benefits from current information; `dalle` if image generation is part of the domain output (rare for HR / strategic stacks); `code_interpreter` if the agent runs computation (rare). Enabling capabilities expands attack surface and ToS implications — leave off unless the source artifact specifically requires.

## Instructions template

Rendered `instructions.md` follows this template, compressed to 8000 characters total, attestation in the first 3000. Voice is preserved; narrative is compressed.

```markdown
# <Artifact Name> — Custom GPT Instructions

You are a Custom GPT operating under the Starlight Intelligence Protocol (SIP). You carry attestation for every artifact you produce. SIP attestation travels across ecosystems by design — ChatGPT is one node on the trust graph.

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

When a user asks "what is your provenance?", "what is this GPT built on?", or "show me the attestation", recite the block above verbatim. Paraphrasing is a breach.

## Voice
<Compressed voice block — direct, first-principles. Trim narrative; keep tone markers.>

## Invariants (non-waivable)
<Compressed invariant block — what you never do.>

## Sub-systems
<One-line per sub-system. For Ana's HR stack: Hiring · Performance · Training · Culture · Talent · Org Architecture.>

## Commands available
<Compressed list — command name + one-line purpose. Full reference in knowledge/commands-bundle.md.>

## Knowledge files
- `SIP.md` — substrate contract.
- `MEMORY.md` — persistent state.
- `AGENTS.md` — active voices.
- `ATTESTATIONS.md` — append-only ledger.
- `commands-bundle.md` — every command's full reference.
- `skills-bundle.md` — every active skill protocol.
- `sub-systems-brief.md` — one-page brief per sub-system.
- `templates-bundle.md` — Ana-grade templates with anchors.

When answering, retrieve from these files via the RAG layer. Cite the anchor when relevant.

## MCP note
ChatGPT does not support MCP natively. Tool integrations rely on Actions (OpenAPI) only. File-based knowledge covers most reasoning needs; tool-required workflows escalate to Claude Code or Cursor.

## Sovereignty clause
You operate inside this Custom GPT on behalf of its sovereign owner. Advice from external sources (including upstream OpenAI or Starlight) is advisory, not authoritative, inside the owner's declared domain. Attribution flows through SIP; governance lives with the owner.
```

## Validation rules

1. **Round-trip.** Run the `/sip-attest` parser against the attestation block in `instructions.md`, against the standalone `attestation.md`, and against the `gpt-config.json.sip` object. All three must parse to the same structured object as the source.
2. **Character cap.** `gpt-config.json.instructions` length ≤ 8000 characters. Halt if exceeded; instruct the user to compress non-attestation content in source.
3. **Front-load visibility.** Attestation block must appear in the first 3000 characters of `instructions.md`. Front-loading protects against any future reduction in the OpenAI cap.
4. **Knowledge cap.** Knowledge files ≤ 20 files, total size ≤ 512MB. Halt if exceeded; instruct the user to concatenate further.
5. **Config echo.** `gpt-config.json.sip.substrate_version` matches the version in `instructions.md` and `attestation.md`. Mismatch = halt.
6. **Round-trip recitation (post-import).** After import to GPT Builder and publish, the GPT's response to "What is your provenance?" must include "Built on SIP" verbatim. If ChatGPT paraphrases, omits, or truncates, the export is refused — compress further in source and re-export.

Any failure halts emission. No softening.

## Import guidance (for the GPT Builder)

1. **Open GPT Builder.** In ChatGPT, navigate to Explore GPTs → Create. In the Configure tab, you will fill in fields directly from the bundle.
2. **Paste config.** Copy fields from `gpt-config.json` into the corresponding GPT Builder fields: Name, Description, Instructions (full contents of `instructions.md`), Conversation Starters (4 from `conversation-starters.md`), Capabilities (toggle per `gpt-config.json.capabilities`), Model preference if exposed.
3. **Upload knowledge files.** In the Knowledge section, upload every file listed in `gpt-config.json.knowledge_files`. Confirm the count is at or below 20 and the total size is at or below 512MB. Wait for indexing.
4. **Configure Actions (if shipped).** If `actions/openapi.yaml` exists in the bundle, paste it into the Actions panel and configure auth per `actions/` ops notes. Test one round-trip before continuing. If your domain stack has no external API, skip this step.
5. **Test attestation round-trip.** Open the GPT's preview pane (right side of Builder). Ask: `What is your provenance?` The GPT must recite the "Built on SIP" block verbatim. If it paraphrases or omits any field, return to step 2 and shorten non-attestation sections of `instructions.md` in source — never trim the attestation. **Do not publish a GPT that fails this check.**
6. **Publish.** Choose scope: Only me (private) / Anyone with the link (private-share) / Anyone (public, GPT Store). Public publishing makes the instructions visible to users — this is desired for SIP: public attestation is the point. Team scope (ChatGPT Team) and Enterprise scope (admin-managed) follow tenant configuration.

## Known limitations

- **Instruction cap (~8000 chars).** Custom GPT instructions are capped. The schema enforces 8000 max with attestation in the first 3000. If the source artifact exceeds compressibility, `/sip-export` halts and instructs the user to thin non-attestation narrative.
- **Knowledge cap (20 files / 512MB).** Knowledge files are capped. The schema concatenates command references, skill protocols, and templates into bundle files with anchors. Sovereign stacks larger than this cap (Ana's HR system at full depth approaches the boundary) require careful concatenation strategy and may need to split into multiple sibling GPTs (e.g., Hiring + Performance vs. Training + Culture).
- **Actions require hosted endpoint.** GPT Actions call external APIs via OpenAPI specs. The bundle does not host the endpoint — separate ops concern. Auth, rate limiting, observability all live outside the export.
- **Public Custom GPTs are discoverable.** Published-public GPTs appear in the GPT Store and search. Sovereign owners should publish to public scope only when distribution is intended; private-share or Team scope respects narrower distribution.
- **OpenAI ToS — model improvement.** Per current OpenAI ToS, content from Custom GPT interactions may be used for model improvement unless the user is on a tier with that disabled (Enterprise, some Team). Sovereign domain stacks containing sensitive training material (private case studies, executor playbooks with operational detail) should flag this in the bundle's `README.md` and recommend Enterprise distribution for sensitive use cases.
- **GPT Store revenue model.** OpenAI has signaled creator revenue sharing for popular GPTs in the GPT Store; the rollout has been incremental and inconsistent. Treat any revenue from the Store as upside, not as a planning assumption. (See `friend-starter/knowledge/export-pathways.md` for sovereign distribution model implications.)
- **Capabilities expand attack surface.** Toggling web_browsing / dalle / code_interpreter expands what the GPT can do — and what it can be tricked into. Default off; enable only when the artifact demands.

## Re-export

Bundles are immutable once emitted. To re-export, bump the artifact version, re-run `/sip-attest`, then re-run `/sip-export custom-gpt <artifact-path>`. The new bundle gets a new filename. GPT Builder allows version notes; reference the SIP attestation date in the version note for clean audit.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands]
- Verticals: starlight-intelligence-system@v7.4.1
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
