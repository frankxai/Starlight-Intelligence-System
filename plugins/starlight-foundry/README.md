# Starlight Foundry Plugin

Skills-first capability compilation for ChatGPT Work and Codex.

## Included skills

- `$skill-forge` — compile reusable workflows into portable skills;
- `$agent-forge` — justify and compile persistent actors;
- `$system-forge` — compile bounded swarms, verticals, and plugins;
- `$taste-engine` — turn qualitative intent into executable evaluation.

This v0.1 release is intentionally skills-only. It does not declare a remote MCP server or claim a published Workspace Agent.

## Codex local install

From a clone of the Starlight Intelligence System:

```bash
codex plugin marketplace add .
codex plugin add starlight-foundry@starlight-local
```

Start a new thread after installation so the skill catalog refreshes.

## Validation

```bash
node scripts/sync-foundry-plugin.mjs --check
python3 <plugin-creator-skill>/scripts/validate_plugin.py plugins/starlight-foundry
```

The bundled skill files are byte-identical to `skills/foundry/*` and protected by `test/v92-foundry.test.ts`.
