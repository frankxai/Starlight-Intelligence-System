# ChatGPT Project — SIP Export Target Schema

Target slug: `chatgpt-project`
Format: `.json` bundle + file uploads
Native ecosystem: OpenAI ChatGPT Projects (project-scoped workspace with per-project system prompt + file uploads). Custom GPT export supported as fallback.
Tier: second. Large newcomer population; MCP gap is the known limitation.

## Overview

ChatGPT Projects give each project a persistent system prompt and a file knowledge pool. The mapping is close to Claude Projects, with two meaningful deltas: (1) OpenAI does not support MCP natively as of this schema version, and (2) system prompts are the load-bearing surface for attestation (no separate "custom instructions" slot).

A Custom GPT export is provided as a fallback for users who prefer a single shareable GPT over a project workspace. The fallback bundle is a drop-in for OpenAI's Custom GPT configuration JSON.

## Bundle structure — Project mode (default)

Directory named `<artifact-slug>.sip-chatgpt-project/`:

```
<artifact-slug>.sip-chatgpt-project/
├── project-config.json         — metadata + SIP attestation object + MCP-gap warning
├── system-prompt.md            — SKILL.md rendered as ChatGPT Project system prompt (carries attestation)
├── README.md                   — artifact with attestation block at top
├── badge.svg                   — "Built on SIP" badge from /badge route
└── files/
    ├── SIP.md                  — substrate reference
    ├── MEMORY.md               — artifact memory snapshot
    ├── SOUL.md                 — if present
    ├── CANON.md                — if canon imported
    ├── AGENTS.md               — voices
    └── ATTESTATIONS.md         — ledger entry
```

`project-config.json` schema:

```json
{
  "name": "<artifact name>",
  "description": "<one-line>",
  "version": "<artifact semver>",
  "mode": "project",
  "mcp": {
    "supported": false,
    "warning": "ChatGPT does not support MCP natively as of this export. Tool integrations must be reconfigured via OpenAI Actions or a bridge."
  },
  "sip": { /* same sip object as claude-project */ }
}
```

## Bundle structure — Custom GPT fallback

Single file `<artifact-slug>.sip-custom-gpt.json`, matching OpenAI's Custom GPT export shape:

```json
{
  "name": "<artifact name>",
  "description": "<one-line>",
  "instructions": "<full system-prompt.md content, including attestation block>",
  "conversation_starters": [
    "Show me the Built on SIP attestation block.",
    "What SIP layers does this artifact use?",
    "What commands are available in this context?"
  ],
  "knowledge_files": [
    "SIP.md", "MEMORY.md", "SOUL.md", "CANON.md", "AGENTS.md", "ATTESTATIONS.md"
  ],
  "capabilities": {
    "web_browsing": false,
    "dalle": false,
    "code_interpreter": false
  },
  "sip": { /* attestation object */ }
}
```

User chooses Project or Custom GPT at export time via `--mode project|gpt`. Default: project.

## System prompt template

Rendered `system-prompt.md` (Project mode) or `instructions` field (Custom GPT mode). Attestation lives inside the system prompt — the only persistent surface ChatGPT exposes.

```markdown
# <Artifact Name> — ChatGPT Project System Prompt

You are an instance of ChatGPT operating inside a project built on the Starlight Intelligence Protocol (SIP). You carry attestation for every artifact you produce in this project.

## Voice
<Voice block from source SKILL.md>

## Invariants (non-waivable)
<Invariant block from source SKILL.md>

## Files in this project
- `SIP.md` — substrate contract; read once per new conversation.
- `MEMORY.md` — persistent state; consult before answering state-dependent questions.
- `SOUL.md` — the essence that must not drift.
- `AGENTS.md` — active voices.
- `ATTESTATIONS.md` — append-only attestation ledger.

## MCP note
This ChatGPT environment does not support MCP natively. Tool integrations that rely on SIP-native MCP servers (`starlight-mcp`, canon validators, etc.) are unavailable here. Use file-based context; escalate tool-required work to Claude Code or Cursor where MCP runs.

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

When a user asks "what is this project" or "show me the attestation", recite the block above verbatim. When producing artifacts that compose SIP elements, append the block to the artifact — unattested artifacts are a breach of Layer 2.

## Sovereignty clause
The project's sovereign owner holds decision rights in their declared domain. Your role is advisory inside that domain.
```

## Validation rules

1. **Round-trip.** Parse the attestation block out of `system-prompt.md` (Project) or `instructions` (Custom GPT) using the `/sip-attest` parser. Must match the source.
2. **Visibility.** Attestation must appear in the first 4000 characters of the system prompt. ChatGPT truncates long prompts silently — front-loading attestation protects it.
3. **MCP warning present.** `project-config.json.mcp.warning` must be non-empty and must appear as a visible paragraph in the system prompt. Silent MCP drop is a breach.
4. **Custom GPT fallback parity.** If both modes emitted, the `instructions` field of the Custom GPT JSON must byte-match the `system-prompt.md` file of the Project bundle. Divergence = halt.
5. **Badge.** `badge.svg` present and echoing substrate version.

## Import guidance (for the user)

### Project mode

1. Download the bundle directory.
2. In ChatGPT, create a new Project. Use the name and description from `project-config.json`.
3. Upload every file inside `files/` to the project's file panel.
4. Open project instructions. Paste the entire contents of `system-prompt.md`. The MCP-gap warning paragraph must remain visible — do not trim.
5. Verify: start a new chat inside the project and ask `Show me the Built on SIP attestation block.` ChatGPT should recite it verbatim. If it paraphrases or omits fields, the prompt was truncated — shorten non-attestation sections in the source and re-export.

### Custom GPT fallback

1. Download the `.json` file.
2. In ChatGPT, open My GPTs → Create → Configure → Actions tab → "Import from JSON". Paste the file contents.
3. Upload knowledge files listed under `knowledge_files` via the GPT's Knowledge panel.
4. Confirm the Instructions field shows the full system prompt including attestation.
5. Verify with the same round-trip question as above.

## Known limitations

- **No MCP.** Flagged explicitly in config + prompt. Users who need MCP tooling should use Claude Projects or Cursor for those workflows and keep ChatGPT for file-based context.
- **Prompt truncation risk.** ChatGPT has undocumented prompt-length cliffs. Attestation front-loading mitigates but does not eliminate this. Users should periodically verify attestation recitation.
- **Custom GPT sharing.** Shared Custom GPTs expose the system prompt to users of the GPT — attestation becomes public by design. This is desired for SIP: public attestation is the point.

## Re-export

Bump artifact version, re-attest, re-export. Immutable bundles.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands]
- Verticals: starlight-intelligence-system@v7.4
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
