---
name: <SLUG>-<verb>
description: <One-sentence description of what this command produces. Load-bearing — this is the command discoverability layer.>
allowed-tools: Read, Write, Grep, Glob, Bash
argument-hint: <argument shape — e.g., "<role> [--optional-flag value]">
sub-system: <SUB-SYSTEM>
domain: <DOMAIN>
---

# /<SLUG>-<verb>

> One sub-system command stub. Each sub-system typically ships 4-5 commands (one file per command); copy this file per command, rename, fill. Reference shape: `.claude/commands/hire-icp.md`, `.claude/commands/perf-feedback-rehearsal.md`, etc.

---

## Load sequence

Load in order:
1. `SIP.md` (substrate)
2. `verticals/<vertical-slug>/SKILL.md` (this vertical's voice + invariants)
3. `verticals/<vertical-slug>/SOUL.md` (drift anchor)
4. `verticals/<vertical-slug>/<sub-system-slug>/agent.md` (this sub-system's agent)
5. `verticals/<vertical-slug>/<sub-system-slug>/skill.md` (this sub-system's protocol)
6. `verticals/<vertical-slug>/<sub-system-slug>/knowledge.md` (research grounding + sovereign's <EXAMPLE>)
7. `<any cross-sub-system dependencies — e.g., another sub-system's agent.md when composition is load-bearing>`

If any REQUIRED load item is missing, halt with explicit message. Do not soften.

---

## Input

`$ARGUMENTS`

Parse `$ARGUMENTS` for:
- `<primary-arg>` — required. `<what it is>`
- `<secondary-arg>` — optional. `<what it is, default if absent>`
- `--<flag>` — optional. `<what it does>`

Validation: `<what the command checks on input. Halt conditions named.>`

---

## When this command fires

- `<condition 1>`
- `<condition 2>`
- `<condition 3>`

## When this command does NOT fire

- `<condition 1 — route elsewhere>`
- `<condition 2 — halt>`
- `<condition 3 — redirect to sister command>`

---

## Process — 7 steps

### Step 1 — `<Phase>`

`<What happens. What input is gathered. What preconditions are checked. Halt conditions if precondition fails.>`

### Step 2 — `<Phase>`

`<...>`

### Step 3 — `<Phase>`

`<...>`

### Step 4 — `<Phase>`

`<...>`

### Step 5 — `<Phase>`

`<...>`

### Step 6 — `<Phase>`

`<...>`

### Step 7 — Ship artifact

Write the artifact to:

```
verticals/<vertical-slug>/<sub-system-slug>/artifacts/<artifact-type>-<context>-<YYYY-MM-DD>.md
```

Artifact contains:
- Disclaimer block (if applicable — legal / clinical / jurisdictional)
- `<artifact-specific structure — see Output format below>`
- Named hand-off (one)
- "Built on SIP" attestation footer

---

## Output format

```
# <SUB-SYSTEM> — <artifact name>
## Context
<scope / date / sovereign / stakeholder>

## Disclaimer (if applicable)
<boundary language>

## <Artifact core — named sections per the sub-system's protocol>
<...>

## Hand-off
<exactly one named next move — not a menu>

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: <vertical-slug>@v0.1 (<DOMAIN> Domain Sub-Stack — <SUB-SYSTEM> sub-system)
- Generated: <ISO date>
---
```

---

## Rules

1. **Halt conditions are explicit.** Missing Genius Profile / missing Vision / missing calibration precondition → halt, do not soften.
2. **Disclaimer non-waivable** where applicable (legal / clinical / jurisdictional).
3. **Research citations required where claims are made.** Direction, not invented numbers.
4. **One hand-off at close.** No menus.
5. **Built on SIP attestation on every artifact.** Sovereignty clause non-waivable.
6. **`<command-specific rule 1>`**
7. **`<command-specific rule 2>`**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: domain-stack-starter sub-system command template · v7.4.1
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
