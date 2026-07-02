---
name: <filename-stem — MUST equal this file's name without .md>
tier: <core | universal | council | excavation | domain-vertical | partner-adapter>
domain: <one concrete domain, e.g. defi, sleep, orbit-mechanics>
voice: <one of: architect | sovereign-creator | protocol-defender | implementer | overseer>
role: <one line: what this agent actually does, in plain words>
---
# <Agent Display Name>

> <One sentence a newcomer understands: what this agent does and when you'd want it.>

---

## Identity

**Tier:** <tier, human-readable>
**Domain:** <domain>
**Activates:** <the concrete situations — not "context relates to X">

---

## Activation Triggers

- <3-6 REAL trigger phrases an operator would actually type>
- <file patterns or events, if any>

---

## What this agent knows (domain playbook)

<THE SECTION THAT MAKES THE AGENT REAL. 4-8 numbered, domain-specific moves.
Each move names concrete objects of the domain (protocols, metrics, thresholds,
failure modes, tools) — knowledge a generic assistant would NOT produce.
If you cannot write this section with real domain content, the agent should
not exist. Never use the words "Domain Assessment", "Context Compilation",
"Execution Routing", "Validation Check" as move names.>

1. **<Move name>** — <what it inspects/produces, with domain-specific specifics>
2. ...

---

## Reasoning Protocol

<A SHORT protocol IN THE DOMAIN'S TERMS — not the generic
INGEST/ANALYZE/FORMULATE/EXECUTE/VERIFY/COMMIT ladder. 3-5 steps, each stating
what evidence is consulted and what artifact is produced.>

---

## Boundaries (what it will NOT do)

- <1-3 explicit refusals or hand-offs — e.g. "No trade execution; emits
  analysis only", "Defers medical interpretation to a clinician", "Escalates
  legal conclusions to counsel". Every agent has at least one.>

---

## Vault Access

| Vault | Access |
|-------|--------|
| <only the vaults this agent genuinely needs; justify Read/Write in one clause> |

---

## Skill Activations

| Skill | When |
|-------|------|
| <real skills from skills/skill-rules.json that exist — verify the path> |

---

## Quality Gates

- <2-4 checks specific to this domain's failure modes — not generic formatting checks>

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@<current version>
- Generated: <yyyy-mm-dd>
---

<!--
TEMPLATE RULES (enforced by test/v92-agent-quality.test.ts for every agent not
in the legacy ledgers):
1. frontmatter `name` MUST equal the filename stem.
2. frontmatter `voice` MUST be one of the five VOICES.md archetypes; the old
   free-text description belongs in `role:`.
3. The four generic scaffold capability names are BANNED — their presence marks
   an agent as thin.
4. The playbook section must exist and carry domain-specific content.
-->
