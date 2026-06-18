---
name: workflow-skill-creator
description: Distills a completed user interaction or multi-step workflow into a reusable agent skill (SKILL.md + helper script), registering it in skill-rules.json and SKILL_REGISTRY.md.
allowed-tools: Read, Write, Grep
argument-hint: <workflow-summary> --name=<skill-slug> --domain=<domain> [--code=true/false] [--path=...]
---

# /workflow-skill-creator

Analyze a completed workflow, extract its logical steps, and package them as a reusable agent skill.

## Parameters

- `<workflow-summary>`: A text summary or log/transcript reference of the workflow to package.
- `--name`: The slug of the skill (e.g., `alphafold-fetch`, `onchain-trace`).
- `--domain`: The domain folder under `skills/` (e.g., `intelligence`, `orchestration`, `memory`, `safety`).
- `--code`: Boolean flag indicating whether the skill requires helper CLI scripts. Defaults to `true` if API calls, file parsing, or calculations are detected.
- `--path`: Optional path to write the skill folder (for modular sub-repository directory, defaulting to local `skills/`).

## Execution Steps

1.  **Brainstorming Check:** Verifies that a brainstorming dialog (Phase 1) has been initiated with the user.
2.  **Existing Skill Sweep:** Checks if any installed skill already covers these steps (Rule 1: reuse and depend instead of duplicating).
3.  **File Scaffolding:**
    -   Creates `skills/<domain>/<name>/SKILL.md` following the mandatory structure (overview, dependencies, quick start, commands/workflow, rate limits, common mistakes).
    -   If `--code` is true, generates a Python helper script using the `references/cli_script_template.py` template, implementing rate limiting (Rule 2) and file-output routing (Rule 4).
4.  **Registry Insertion:**
    -   Appends the skill row in `skills/SKILL_REGISTRY.md`.
    -   Registers the auto-activating rule in `skills/skill-rules.json` (trigger keywords and file globs).
5.  **Validation Check:** Runs `npm test test/v77-skill-rules.test.ts` and `test/v78-skill-registry.test.ts` to verify skill frontmatter integrity and check for orphans or phantoms.

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, skill-registry]
