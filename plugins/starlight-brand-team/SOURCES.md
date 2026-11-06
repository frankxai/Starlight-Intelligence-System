# Source and compatibility notes

Checked 30 October 2026. This starter is a scoped adaptation of the portable role/memory pattern; no private client source was copied into the package.

## Existing project material inspected
- scripts/package-sip-starter.mjs at base commit 7e4ca5b295e4c0097576045326762d278514e360.
- templates/domain-stack-starter/README.md and its file conventions at the same commit.
- integrations/starter-packs/friend-starter/custom-instructions.md at the same commit. Its broader discovery workflow is not included.
- plugins/starlight-intelligence/README.md at the same commit. Its hosted MCP implementation is a separate product and is not bundled or activated.

Repository: https://github.com/frankxai/Starlight-Intelligence-System
The broad SIP build and shell installation were exercised during preparation. Its installed target omitted INSTALL.md although its README directed users there. This smaller package uses its own tested installer and does not change the broad starter.

## Primary compatibility references
- Claude Code plugin manifest: https://code.claude.com/docs/en/plugins-reference
- Claude Code marketplace: https://code.claude.com/docs/en/plugin-marketplaces
- Codex project skills: https://developers.openai.com/codex/skills/
- OpenAI portable plugin packaging: https://developers.openai.com/plugins/guides/submit-claude-plugin
- Antigravity skills: https://antigravity.google/docs/skills
- OpenCode skills: https://opencode.ai/docs/skills

Use the common SKILL.md instruction package, with host-specific discovery metadata and paths. Do not assume a Claude manifest is an executable OpenCode JavaScript plugin or that a marketplace registration proves approval. Native host results belong in VALIDATION.md.
