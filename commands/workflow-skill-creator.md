# /workflow-skill-creator Command

> *"Distill a completed interaction or multi-step workflow into a reusable, structured skill."*

**Primary Agent:** Starlight Prime
**Skills Activated:** workflow-skill-creator, pattern-recognition

---

## Subcommands

### /workflow-skill-creator <workflow-summary> --name=<skill-slug> --domain=<domain> [--code=true/false]

Analyzes the workflow, structures its steps, scaffolds the skill folder, and registers it in `skills/skill-rules.json` and `skills/SKILL_REGISTRY.md`.

#### Examples:

- `/workflow-skill-creator "fetched alphafold pdb files and ran sequence alignment" --name=alphafold-align --domain=science`
- `/workflow-skill-creator "scrapes domain list and checks trademarks" --name=trademark-check --domain=safety --code=true`

---

## Execution Rules

1.  **Iterative Brainstorming:** The agent must conduct Socratic brainstorming before compiling the skill folder.
2.  **CLI Script Pattern:** If code is needed, helper scripts must follow the canonical `argparse` python template.
3.  **File-First Output:** Scripts must print short status messages to stdout and write primary data to files, preventing context overflow.
4.  **Registry Validation:** The command automatically executes `test/v77-skill-rules.test.ts` and `test/v78-skill-registry.test.ts` to ensure the skill rule is completely valid.

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, skill-registry]
