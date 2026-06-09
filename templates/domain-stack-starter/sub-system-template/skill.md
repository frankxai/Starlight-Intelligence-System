---
name: <domain-slug>/<sub-system-slug>
description: The <SUB-SYSTEM> skill inside the <DOMAIN> Domain Sub-Stack. Loads when any /<SLUG>-* command fires or when <SUB-SYSTEM> keywords are detected. Carries the research-grounded protocol this sub-system runs.
auto-activate:
  - on command: /<SLUG>-*
  - on keyword: <comma-separated keyword list>
  - on agent: starlight-<SLUG>
---

# <SUB-SYSTEM> Skill (inside <DOMAIN>)

---

## Purpose

<One paragraph. What this skill does. What instrument it carries. What research grounds it. What artifacts it produces. Not a restatement of the agent's Identity — the skill is the *how*, the agent is the *who*.>

---

## Activation

This skill fires when:
- Any `/<SLUG>-*` command is invoked
- Keywords match: `<keyword list>`
- The `starlight-<SLUG>` agent is active
- `<other activation signals>`

The skill does NOT fire when:
- The request is substrate-level (use Starlight's SKILL.md)
- The request belongs to a sister sub-system (defer to sister)
- The request is outside `<DOMAIN>` entirely

---

## Protocol

This is the 7-step protocol this skill runs. Matches the agent's Reasoning Protocol but framed as skill-level operational steps.

### Step 1 — `<Phase name>`

<What happens in this step. What input is required. What output is produced. What refusals fire if preconditions are missing. Cite research direction where load-bearing.>

**Required input:** `<input>`
**Output:** `<output>`
**Halt condition:** `<when this step refuses to proceed>`

### Step 2 — `<Phase name>`

<...>

**Required input:** `<input>`
**Output:** `<output>`
**Halt condition:** `<...>`

### Step 3 — `<Phase name>`

<...>

### Step 4 — `<Phase name>`

<...>

### Step 5 — `<Phase name>`

<...>

### Step 6 — `<Phase name>`

<...>

### Step 7 — Ship artifact + attest

Every artifact ships with:
- `<DOMAIN>`-specific disclaimer block at the top (legal / clinical / jurisdictional)
- Research citations where claims are made (direction, not invented numbers)
- Named hand-off (one, not a menu)
- "Built on SIP" attestation footer

Path convention: `verticals/<vertical-slug>/<sub-system-slug>/<artifact-type>-<context>-<YYYY-MM-DD>.md`

---

## Rules

1. **`<domain-specific rule 1 — e.g., "Never ship without disclaimer when jurisdictional territory is touched">`**
2. **`<domain-specific rule 2>`**
3. **`<domain-specific rule 3>`**
4. **Research grounding required where claims are made.** Cite direction of evidence. Do not invent effect sizes or specific percentages.
5. **One hand-off at close.** No menus. Named command or named real-world move.
6. **Built on SIP attestation on every artifact.** Sovereignty clause non-waivable.

---

## Composition

This skill composes with:
- `<sister sub-system skill>` — `<how>`
- `intelligence/decision-framework` — `<when option-collapse is load-bearing>`
- `intelligence/pattern-recognition` — `<when longitudinal / multi-signal pattern reading is load-bearing>`
- `memory/knowledge-synthesis` — `<when composing artifact from multiple protocol-step outputs>`

Does NOT compose with:
- `<skills that would drift this one out of scope>`

---

**Built on SIP** — domain-stack-starter sub-system skill template · v7.4.1 · SIP v1.1.0
