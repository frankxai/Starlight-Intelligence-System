---
name: <vertical-slug>-<verb>
description: <one-line — what this command does, who owns it>
allowed-tools: Read, Write, Grep, Glob
argument-hint: <hint>
---

# /<vertical-slug>-<verb>

Load `verticals/<vertical-slug>/SKILL.md`, `verticals/<vertical-slug>/MEMORY.md`, `verticals/<vertical-slug>/SOUL.md`. <One sentence on what this command produces.>

## Input
$ARGUMENTS

## Process

1. **<Step 1>** — <what happens>
2. **<Step 2>** — <what happens>
3. **<Step 3>** — <what happens>
4. **Attestation check** — if this command produces a cross-party or cross-vertical artifact, route to `/sip-attest` before emit. Otherwise auto-embed "Built on SIP" footer.

## Output format

```
<artifact structure — name the headings, name what each section must contain, name what the practitioner fills vs what the command auto-fills>
```

## Rules

- <rule 1 — domain-specific invariant the practitioner inherits when forking this vertical>
- <rule 2 — refusal pattern this command refuses by design>
- Sovereignty is non-waivable. This command does not override decision rights inside other domains or other verticals.
- Silent composition is a breach. Every artifact carries "Built on SIP".
- Legal/clinical/financial sensitivity, where applicable to this domain, opens with the appropriate disclaimer.

---

**Built on SIP** — `<vertical-slug>` command template · v7.5

Practitioner forks copy this file into their `verticals/<their-slug>/.claude/commands/` and rename to match their command surface. The vertical wrapper SKILL.md auto-loads when any of these commands fires.
