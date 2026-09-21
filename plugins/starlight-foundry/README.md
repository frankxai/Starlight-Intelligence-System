# Starlight Foundry Plugin

Skills-first capability design for portable Agent Plugin hosts, ChatGPT/Codex, and Claude Code, with optional compilation in an SIS Foundry runtime.

## Included skills

- `$skill-forge` — design reusable workflows as portable skills;
- `$agent-forge` — justify and design bounded persistent actors;
- `$system-forge` — design bounded swarms, verticals, and plugins;
- `$taste-engine` — turn qualitative intent into executable evaluation.

## Package surfaces

| Path | Purpose |
|---|---|
| `plugin.json` | Closed portable Agent Plugins 1.0.0 manifest |
| `skills/*/SKILL.md` | Shared canonical skill sources |
| `.codex-plugin/plugin.json` | OpenAI/Codex compatibility overlay |
| `.claude-plugin/plugin.json` | Claude Code compatibility overlay |

This checked-in v0.1 package is intentionally skills-only. In a marketplace install it designs source contracts and marks compiler proof `pending-runtime`; inside an SIS workspace it may hand off to the checked-in Foundry CLI. It does not declare a remote MCP server or claim Platform upload, host verification, directory publication, or vendor support.

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
npm run foundry:toolchain:install # isolated native validators; requires Node.js >=22
npm run foundry:plugin:check
npm run foundry:conformance
npm run foundry:submission:check
npm run foundry:loader:codex
npm run foundry:validator:claude
npm run test:foundry
~~~

The parity check proves bundled skill files remain byte-identical to `skills/foundry/*`. Portable conformance uses byte-pinned Agent Plugins 1.0.0 schemas and Ajv 8.20.0. The OpenAI submission check applies freshness-bounded, docs-derived rules and validates the pending preflight gate profile. The pinned official Codex 0.152.0 loader smoke uses a disposable home for add, discovery, install, list, removal, and cleanup. Claude Code 2.1.252 runs its official strict native validator. OpenAI Platform bundle upload and skill safety/security scan, real ChatGPT behavior, Claude installation/runtime, cryptographic attestation, and human review remain separate gates before a strong claim.

The current candidate has no custom UI, so it carries no submission screenshots. See `docs/runbooks/openai-plugin-submission.md` for the release, evidence, commerce, and human-gate workflow.

Official packaging references:

- https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md
- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/deploy/submission
- https://code.claude.com/docs/en/plugins-reference
