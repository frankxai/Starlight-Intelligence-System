---
name: agent-creator
description: >-
  Scaffold a new agent profile under agents/ or verticals/, register it in AGENT_REGISTRY.md and AGENTS.md, and run conformance validation tests.
---

# Agent Creator

## Overview

This skill allows the agent to dynamically create and register new specialist agents inside the Starlight Intelligence System (or custom vertical sub-stacks) while ensuring that the repository's strict symmetry tests remain fully green.

## Dependencies

- `orchestration/workflow-design`
- `memory/vault-management`

## Quick Start

To create a new agent:
1. Validate that the agent name matches lowercase + hyphen syntax (e.g., `space-orbit-tracker`).
2. Write the profile to `agents/starlight-{name}.md` (or vertical sub-path) using the standard agent template.
3. Append the agent metadata row to `agents/AGENT_REGISTRY.md` and root `AGENTS.md`.
4. Run `npm test test/v76.test.ts` to ensure no phantoms or orphans are introduced.

## Template Standard

Every agent profile markdown file must contain:
- YAML frontmatter with `name: starlight-{slug}`, `tier: specialist`, `domain`, and `voice`.
- Mission statement (explaining their primary purpose).
- Active skills list.
- Trigger activation keywords.

## Common Mistakes

- **Incorrect frontmatter keys:** Forgetting `tier:` or `voice:` will break the validation parser.
- **Phantom references:** Registering an agent in `AGENT_REGISTRY.md` without writing the markdown file to disk.
- **Unformatted filenames:** Naming files without the `starlight-` prefix for core agents.
