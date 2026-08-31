# Starlight Foundry Plugin

Skills-first capability compilation for portable Agent Plugin hosts, ChatGPT/Codex, and Claude Code.

## Included skills

- `$skill-forge` — compile reusable workflows into portable skills;
- `$agent-forge` — justify and compile persistent actors;
- `$system-forge` — compile bounded swarms, verticals, and plugins;
- `$taste-engine` — turn qualitative intent into executable evaluation.

## Package surfaces

| Path | Purpose |
|---|---|
| `plugin.json` | Closed portable Agent Plugins 1.0.0 manifest |
| `skills/*/SKILL.md` | Shared canonical skill sources |
| `.codex-plugin/plugin.json` | OpenAI/Codex compatibility overlay |
| `.claude-plugin/plugin.json` | Claude Code compatibility overlay |

This checked-in v0.1 package is intentionally skills-only. It does not declare a remote MCP server or claim marketplace publication, verified installation, or vendor support.

## Codex local install

From a clone of Starlight Intelligence System:

~~~bash
codex plugin marketplace add .
codex plugin add starlight-foundry@starlight-local
~~~

Start a new thread after installation so the skill catalog refreshes.

## Claude Code development load

~~~bash
claude --plugin-dir ./plugins/starlight-foundry
~~~

Use a disposable host profile for release evidence. A successful local load is compatibility evidence, not proof of a public marketplace listing.

## Validation

~~~bash
npm run foundry:plugin:check
npm run test:foundry
~~~

The parity check proves bundled skill files remain byte-identical to `skills/foundry/*`. Foundry tests validate local package and receipt invariants. Pinned upstream Agent Plugins validation and Claude native strict validation are the next release gates and must pass before a `verified` claim.

Official packaging references:

- https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md
- https://developers.openai.com/plugins/build/plugins
- https://code.claude.com/docs/en/plugins-reference
