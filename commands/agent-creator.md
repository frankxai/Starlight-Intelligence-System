# /agent-creator Command

> *"Scaffold a new agent profile, register it in the registry, and wire its initial skills."*

**Primary Agent:** Starlight Architect
**Skills Activated:** workflow-design, pattern-recognition

---

## Subcommands

### /agent-creator <agent-name> --domain=<domain> --voice=<voice> [--skills=...]

Creates a new agent markdown profile, adds it to `agents/AGENT_REGISTRY.md` and root `AGENTS.md`, and runs the conformance verification tests.

#### Examples:

- `/agent-creator space-orbit --domain=space-cosmos --voice=specialist --skills=orbit-math`
- `/agent-creator marine-acoustics --domain=marine-intelligence --voice=specialist --path=verticals/marine-intelligence/`

---

## Template Structure

The command generates a file with the following Markdown template:

```markdown
---
name: starlight-{name}
tier: specialist
domain: {domain}
voice: {voice}
---
# Starlight Specialist: {Name}

## Mission
{Mission statement}

## Active Skills
- {skills}

## Interaction Trigger Rules
Activated when prompt context contains {keywords}.
```

---

## Symmetry Checks

After creation, the tool executes `npm test test/v76.test.ts` to ensure:
1. No orphaned agent files exist on disk.
2. No phantom agent references are declared in the registries.
3. Frontmatter follows the mandatory standard.

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, agent-registry]
