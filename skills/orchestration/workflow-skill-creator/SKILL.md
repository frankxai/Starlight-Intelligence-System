---
name: workflow-skill-creator
description: >-
  Distill a completed user interaction or multi-step workflow into a reusable agent skill (SKILL.md + helper script), registering it in skill-rules.json and SKILL_REGISTRY.md.
---

# Workflow Skill Creator

## Overview

This skill enables the agent to package successful SAGE workflows or human interactions into reusable, config-driven agent skills under `skills/` or vertical domains.

## Dependencies

- `orchestration/workflow-design`
- `orchestration/agent-handoff-packet`

## Quick Start

To package a workflow:
1. Conduct Phase 1 (Brainstorming) with the user to refine inputs, outputs, rate limits, and approaches.
2. Search existing skills to see if any steps are already implemented (Rule 1: reuse and depend instead of duplicating).
3. Scaffold `SKILL.md` under `skills/<domain>/<name>/`.
4. If code is needed (API calls, data processing), generate a Python helper script using the `references/cli_script_template.py` template, incorporating rate limiting (Rule 2) and file-based output (Rule 4).
5. Append the skill in `skills/SKILL_REGISTRY.md` and add the trigger rule to `skills/skill-rules.json`.
6. Run `npm test test/v77-skill-rules.test.ts` to verify skill rule validity.

## Common Mistakes

- **Skipping Brainstorming:** Creating a skill without Socratic user alignment leads to rigid or incorrect parameter scopes.
- **Console Bloat (Rule 4 violation):** Printing huge API payloads to stdout instead of routing the output to local files, which consumes the agent's context window.
- **API Rate Violations:** Forgetting to implement cross-process rate limits (defaulting to 1 req/sec if undocumented).
