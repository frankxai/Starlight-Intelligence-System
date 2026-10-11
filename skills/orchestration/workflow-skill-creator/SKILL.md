---
name: workflow-skill-creator
description: >-
  Compatibility alias for the deprecated /workflow-skill-creator workflow. Route new requests through foundry/skill-forge for typed contracts, portable packaging, and receipt-based proof.
---

# Workflow Skill Creator — Deprecated Alias

Use `foundry/skill-forge` for all new work.

This alias remains only so explicit legacy invocations do not break. It must not require a brainstorming ceremony when the user has already supplied a complete brief.

## Compatibility flow

1. Translate `/workflow-skill-creator <brief>` to `/forge skill <brief>`.
2. Load `foundry/skill-forge`.
3. Discover existing capabilities before creating a duplicate.
4. Ask only for missing information that materially changes the package.
5. Compile and prove before promotion or registration.

## Migration

- Old: `/workflow-skill-creator "research brief workflow" ...`
- New: `/forge skill "research brief workflow" ...`
