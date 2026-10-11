---
name: agent-creator
description: >-
  Compatibility alias for the deprecated /agent-creator workflow. Route new agent requests through foundry/agent-forge so persistent autonomy must be justified and independently proven.
---

# Agent Creator — Deprecated Alias

Use `foundry/agent-forge` for all new work.

This alias remains only so explicit legacy invocations do not break. It must not scaffold an agent directly.

## Compatibility flow

1. Translate `/agent-creator <brief>` to `/forge agent <brief>`.
2. Load `foundry/agent-forge`.
3. Apply the durable autonomy-boundary gate.
4. If no persistent decision, memory, tool, ownership, or trigger boundary exists, return a Skill Pack route.
5. Compile and prove before registry changes.

## Migration

- Old: `/agent-creator research-director ...`
- New: `/forge agent research-director ...`
