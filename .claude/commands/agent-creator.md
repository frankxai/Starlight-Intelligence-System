---
name: agent-creator
description: Scaffolds a new agent profile under agents/ or verticals/ and registers it in the agent registries (AGENT_REGISTRY.md / AGENTS.md), keeping the file contract and test suite green.
allowed-tools: Read, Write, Grep
argument-hint: <agent-name> --domain=<domain> --voice=<voice-specialist> [--skills=...] [--path=...]
---

# /agent-creator

Generate a new agent profile markdown file, register it in the canonical registries, and verify that the symmetry checks remain green.

## Parameters

- `<agent-name>`: Name of the agent (e.g., `marine-acoustics`, `space-orbit`).
- `--domain`: Core domain slug (e.g., `marine-intelligence`, `space-cosmos`, `longevity`).
- `--voice`: Voice profile from `VOICES.md` (e.g., `specialist`, `architect`, `synthesizer`).
- `--skills`: Comma-separated list of initial active skills.
- `--path`: Optional target folder path (for writing to a modular sub-repository directory, defaulting to `agents/`).

## Execution Steps

1.  **Format Verification:** Ensures the agent name matches lowercase + hyphen syntax (`[a-z][a-z0-9-]*`).
2.  **Duplicate Check:** Scans `AGENTS.md` and `agents/` directory to prevent naming collisions. If a collision is found, suggests suffix and prompts.
3.  **Template Generation:** Scaffolds the markdown file using the canonical agent template, injecting YAML frontmatter (name, tier, domain, voice), mission statement, active skills, reasoning protocols, and quality gates.
4.  **Registry Append:** Appends the agent metadata row and file link to `agents/AGENT_REGISTRY.md` and root `AGENTS.md`.
5.  **Validation Check:** Automatically executes `tsc --noEmit` and `npm test test/v76.test.ts` to ensure agent registry symmetry is preserved.

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, agent-registry]
