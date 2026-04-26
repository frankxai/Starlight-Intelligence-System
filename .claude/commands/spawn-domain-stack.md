---
name: spawn-domain-stack
description: Spawn a domain-specific intelligence sub-stack for a sovereign person. Analyzes their Genius Profile + Freedom Path KEEP bucket + named domain expertise, proposes 4-7 functional sub-systems with agent/skill/command structure, then scaffolds the full vertical scaffold under verticals/<vertical-slug>/. Generalizes the pattern proven by the HR Intelligence reference vertical. For sovereigns who want to productize their genius into a vertical with sub-system architecture.
allowed-tools: Read, Write, Grep, Glob, Bash
argument-hint: <person-name> <domain-name> [optional: --sub-systems "name1,name2,name3,..."] [optional: --auto-scaffold]
---

# /spawn-domain-stack

Load `SIP.md`, `SIS.md`, `VOICES.md`, `STACK.md`, `VERTICALS.md`, `genius/profile-<slug>.md` (REQUIRED — halt to `/discover-genius` if missing), `genius/freedom-path-<slug>.md` (REQUIRED — halt if missing). Load reference: `agents/starlight-hiring.md` (the prototype sub-system agent), `skills/hr-intelligence/structured-hiring.md` (the prototype sub-system skill), `templates/domain-stack-starter/` (the drop-in scaffold). The stack is grounded in this person's unique genius — generic domain stacks re-scatter what hasn't been gathered.

## Input
$ARGUMENTS

Parse `$ARGUMENTS` for:
- `<person-name>` — required. Slug = kebab-case of name.
- `<domain-name>` — required. Specific ("HR Intelligence", "Capital Intelligence", "Sound Intelligence"). Generic terms ("consulting", "coaching", "business") halt with rename request.
- `--sub-systems "n1,n2,..."` — optional. Pre-declares the sub-system list. If absent, the command proposes one from the Genius Profile.
- `--auto-scaffold` — optional. Skips the confirm-or-iterate gate. Use only when proposal is reviewed in advance.

## When this command fires

- Sovereign has completed `/discover-genius` and `/define-vision`, has a Genius Profile + Freedom Path on file, and named domain expertise (≥10 years lived practice, OR a credentialed multi-discipline synthesis edge).
- They want to productize the domain into a vertical — not a one-off consulting offer, not a single artifact, but a sub-system architecture they can compound into.
- They accept the sovereignty clause (SIP § 5): the spawned vertical is theirs; Starlight has no claim; attribution via "Built on SIP" is the only compounding mechanism.

## When this command does NOT fire

- No Genius Profile / Freedom Path → halt to `/discover-genius` first. Domain expertise without genius excavation produces generic stacks. The synthesis edge is what justifies productization; without it, you're scaffolding a commodity.
- Generic domain ("I do consulting") → halt with naming request. Sub-stack architecture demands a specific domain anchor.
- Single-domain artifact builder → `/vertical-spawn` is lighter. Domain sub-stacks are for sovereigns who will ship 4-7 sub-systems × 4-5 commands each, not single-purpose verticals.
- Substrate change proposal → `/luminor-board` → possibly contribute back to SIP itself.

## Process — 8 steps

### Step 1 — Validate prerequisites

Halt with explicit message if any condition fails. Do not soften.

- **Genius Profile present** at `genius/profile-<slug>.md`. If missing:
  > *"No Genius Profile on file for <person-name>. The domain stack composes around what only this person uniquely sees. Generic decomposition produces commodity sub-systems. Run `/discover-genius <person-name>` first."*
- **Freedom Path present** at `genius/freedom-path-<slug>.md`. If missing:
  > *"No Freedom Path on file. The KEEP bucket names which work this person uniquely owns — without it, sub-systems collapse into delegation territory. Run `/discover-genius <person-name>` to generate Path with Profile."*
- **Domain name is specific.** Reject "consulting", "coaching", "advisory", "business", "tech". Accept "HR Intelligence", "Clinical Intelligence", "Sound Intelligence", "Capital Intelligence", "Spatial Intelligence". Test: can you name 4-7 functional sub-systems within it without resorting to topic taxonomy?
- **≥3 frameworks in Genius Profile mappable to the domain.** Read the Profile's "frameworks I use repeatedly" section. If the domain doesn't intersect with their existing genius, halt — productization without lived practice produces generic content.
- **Vertical name + slug available.** Grep `VERTICALS.md` for collision; check `verticals/<slug>/` directory does not exist. Collision → halt, require rename.

### Step 2 — Domain analysis

Read the Genius Profile and Freedom Path end-to-end. Output the analysis as part of the proposal:

- **Domain anchor.** One sentence — what this domain is in this person's hands (not the textbook definition). Example: "HR Intelligence in the practitioner's hands is psychologist + neuroscientist + MBA + ten years of HR-room practice — not generic people-ops".
- **Frameworks-in-domain.** From the Profile, the 3-7 frameworks the person already uses that belong inside this domain. Cite framework names verbatim from the Profile.
- **Cross-domain synthesis edge.** The unique combination that justifies productization. NAME IT. If you cannot name it in one sentence, halt — without a synthesis edge, the domain stack is commodity. Examples:
  - HR Intelligence: "psychology × neuroscience × MBA × HR-decade — sees both cognitive failure modes AND the neural mechanisms behind them"
  - Doctor: "internal medicine × narrative competence × longitudinal care — protocol decisions that hold across decades, not visits"
  - Architect: "structural engineering × phenomenology × regulatory navigation — buildings that hold the body's experience AND clear permitting"
- **KEEP-bucket overlap.** From the Freedom Path, which KEEP-bucket items live inside this domain? These are the highest-leverage sub-system targets — the things only this person can do, that compound when systematized.

### Step 3 — Sub-system proposal

From frameworks-in-domain + functional decomposition of the domain + KEEP-bucket overlap, propose **4-7 sub-systems**.

**Decomposition principles** (non-waivable):
- **Functional, not topical.** Hiring is functional (a system that produces hire-or-no-hire decisions); "talent acquisition strategy" is topical (a content area). The test: can each sub-system ship a named output artifact per command? If not, it's topical.
- **4-7 sweet spot.** <4 = stack is thin (use `/vertical-spawn` instead). >7 = over-decomposed (sub-systems will collapse into each other on first use).
- **Each sub-system: 4-5 candidate commands.** <4 = stub (merge with sibling). >5 = should split.
- **Total domain stack:** 20-35 commands, 4-7 agents, 4-7 skills.
- **Cross-domain synthesis edge appears in ≥3 sub-systems.** If the synthesis edge only shows up in one sub-system, it's a feature, not a stack — the rest is commodity. Halt and re-decompose.

For each proposed sub-system, declare:

| Field | Content |
|-------|---------|
| **Name** | e.g., "Hiring", "Performance", "Composition", "Allocation" |
| **Slug** | Short prefix for commands (≤10 chars) — e.g., `hire`, `perf`, `compose`, `alloc` |
| **Scope** | One paragraph — what this sub-system owns, what it refuses |
| **Commands (4-5)** | Named with verb pattern — e.g., `/<slug>-icp`, `/<slug>-design-X`, `/<slug>-calibrate`, `/<slug>-debrief` |
| **Research grounding** | What field literature / lived practice grounds this — cite the synthesis edge contribution if relevant |
| **Composes-with** | Which sister sub-systems compose with this one + how (Hiring composes with Performance for calibration patterns; with Talent for motivation-fit; with Org for role design) |

### Step 4 — Architecture proposal output

Write the proposal to `verticals/<vertical-slug>/PROPOSAL.md`. Format:

```
# <DOMAIN> — Domain Sub-Stack Architecture Proposal
## Sovereign: <person-name>
## Generated: <ISO date> — SIP v1.1.0

## Domain anchor
<one sentence>

## Cross-domain synthesis edge
<one sentence — load-bearing, must be named>

## Frameworks-in-domain (from Genius Profile)
- <framework 1>
- <framework 2>
- ...

## KEEP-bucket overlap (from Freedom Path)
- <KEEP item 1>
- <KEEP item 2>
- ...

## Proposed sub-systems (<n>)

### Sub-system 1 — <Name>
- **Slug:** `<slug>`
- **Scope:** <paragraph>
- **Commands:** /<slug>-<v1>, /<slug>-<v2>, /<slug>-<v3>, /<slug>-<v4> [, /<slug>-<v5>]
- **Research grounding:** <field lit + synthesis edge contribution>
- **Composes-with:** <sister sub-systems + how>

### Sub-system 2 — <Name>
...

[repeat for 4-7 sub-systems]

## Stack totals
- Sub-systems: <n>
- Total commands: <n>
- Total agents: <n>
- Total skills: <n>

## Synthesis-edge presence check
Sub-systems where the synthesis edge appears load-bearingly: <list> — must be ≥3.

## Iteration notes
This proposal is iterable. Reply with:
- "rename <X> to <Y>"
- "merge <X> and <Y>"
- "split <X> into <Y> and <Z>"
- "add command <name> to <sub-system>"
- "remove <sub-system>"
- "approve" — proceed to scaffold

— Built on SIP v1.1.0 —
```

### Step 5 — Confirm-or-iterate gate

Halt and surface the proposal. Do not proceed to scaffolding without:
- Explicit user "approve" or equivalent confirmation, OR
- `--auto-scaffold` flag was passed in the original invocation.

If iteration requested, update `PROPOSAL.md` with new version block (`## v2 — <date>`) and re-surface. Iterate up to 3 times before requiring full re-run.

### Step 6 — Scaffold the vertical

Once approved, generate the file structure under `verticals/<vertical-slug>/`. Create the directory if it doesn't exist.

```
verticals/<vertical-slug>/
├── README.md                    — vertical overview, sub-system map, getting started
├── SKILL.md                     — vertical-tier skill (loads when working in this vertical)
├── SOUL.md                      — what must not drift (essence prompt — to be filled)
├── AGENTS.md                    — maps the 5 SIP voice archetypes to this vertical's sub-system agents
├── MEMORY.md                    — instance state template (cycle 0, sub-system roadmap)
├── STACK.md                     — inherited or overridden
├── CANON.md                     — adopt or decline (default: decline unless domain demands)
├── PROPOSAL.md                  — the architecture proposal (already written)
│
├── <sub-system-1-slug>/
│   ├── agent.md                 — `starlight-<sub-system>` style agent stub (frontmatter + skeleton)
│   ├── skill.md                 — `<domain-slug>/<sub-system>.md` skill stub
│   ├── knowledge.md             — knowledge template for this sub-system (research grounding placeholders)
│   └── commands/
│       ├── <slug>-<v1>.md       — command stub with frontmatter + Process skeleton
│       ├── <slug>-<v2>.md
│       ├── <slug>-<v3>.md
│       ├── <slug>-<v4>.md
│       └── [<slug>-<v5>.md]
│
├── <sub-system-2-slug>/
│   └── ...
│
[repeat for each sub-system]
```

Use `templates/domain-stack-starter/` as the source. Each file includes:
- Frontmatter populated from the proposal (name, description, triggers)
- Skeleton sections (Premise, Activation, Capabilities, Reasoning Protocol, Quality Gates) with `<TODO>` placeholders for substantive fill
- "Built on SIP" attestation footer
- Tier declaration: **"Domain Sub-Stack Tier"** for sub-system agents (matches `starlight-hiring.md` precedent)

### Step 7 — Register the vertical

Append to `VERTICALS.md` under section `## Sovereign domain sub-stacks`. Create the section if it doesn't exist (insert above `## Registry rules`). Entry shape:

```
### <Domain Name>
- **Class:** sovereign domain sub-stack
- **Domain:** <one-line>
- **Owner:** <person-name>
- **Status:** `scaffolded — v0.1`
- **Primary repo:** `verticals/<vertical-slug>/` (in this SIS instance) or `<sovereign-repo>` if forked
- **Sub-systems:** <Sub-1> · <Sub-2> · <Sub-3> · <Sub-4> · <Sub-5> [· <Sub-6> · <Sub-7>]
- **Synthesis edge:** <one-line>
- **Total commands:** <n>
- **SIP commands:** /<slug-1>-* · /<slug-2>-* · ... (one entry per sub-system slug)
- **Spawned:** <ISO date>
```

### Step 8 — Emit next-step brief

One-page brief surfaced as final command output. Sections:

1. **Identity recap** — sovereign, domain, sub-systems, synthesis edge, total commands.
2. **First sub-system to fill (highest leverage).** Pick the sub-system whose KEEP-bucket overlap is densest AND whose synthesis edge is most load-bearing. This is where compounding starts.
3. **Command-fill order within the first sub-system.** Start with the command that produces the broadest reusable artifact (typically the "design / architect / map" command, not the "review / debrief" command — the latter depends on the former's output).
4. **Estimated time per sub-system.** 2-4 hours per sub-system if material exists in vault / corpus to draw from. 6-10 hours if starting from scratch. The full domain stack at substantive fill: 20-40 hours of focused work, distributed across cycles.
5. **Sovereignty writeback (non-waivable):**

```
Sovereignty clause acknowledged:
- The spawned domain stack is yours. Starlight has no ownership claim.
- Attribution via SIP is the only compounding mechanism.
- You may take the stack private or fork it out of this SIS at any time.
- Advice ≠ override. Frank's input is advisory, not authoritative, inside your declared domain.
```

## Output shape

```
# Domain Sub-Stack Spawned — <Domain Name>

## Identity
- Sovereign: <person-name>
- Domain: <domain-name>
- Synthesis edge: <one-line>
- Vertical slug: `<slug>`
- SIP pin: v1.1.0
- Spawned: <ISO date>

## Sub-systems (<n>)
1. <Name> (`<slug>`) — <scope-one-line>
2. <Name> (`<slug>`) — ...
[...]

## Stack totals
- Commands: <n>
- Agents: <n>
- Skills: <n>

## Scaffold summary
- Directory: `verticals/<vertical-slug>/`
- Files written: <n>
- Registry updated: VERTICALS.md § Sovereign domain sub-stacks

## First fill recommendation
- Sub-system: <name> (highest KEEP-overlap × synthesis-edge density)
- First command: /<slug>-<verb> (broadest reusable artifact)
- Estimated time: <2-4h or 6-10h depending on existing material>

## Next moves
1. Fill `SOUL.md` for the vertical. Drift anchor for the entire stack.
2. Fill the first sub-system's first command. Ship one calibrated artifact.
3. Run `/sip-attest` on the artifact. Add to `ATTESTATIONS.md`.
4. Re-run with --sub-systems flag if you want to add a sub-system mid-cycle.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, mcp-registry, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4.1 (domain sub-stack spawner) · <domain-name>@v0.1 (spawned)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Halt without Genius Profile + Freedom Path.** Domain expertise without genius excavation produces generic stacks. The synthesis edge is what justifies productization; without it, the result is commodity content.
- **Halt without a named cross-domain synthesis edge.** "I have ten years of experience" is not a synthesis edge. The synthesis edge names the unique combination — discipline × discipline × lived-practice — that produces signal where most produce noise.
- **Halt if proposed sub-systems < 4.** Use `/vertical-spawn` for thinner verticals.
- **Halt if proposed sub-systems > 8.** Re-decompose; the domain is over-fragmented.
- **Halt if synthesis edge appears load-bearing in <3 sub-systems.** A one-feature synthesis edge is a feature, not a stack.
- **Halt if vertical name + slug collides.** Grep `VERTICALS.md` and `verticals/` before scaffolding.
- **Halt if domain name is generic.** "Consulting", "coaching", "business" are not domains. They are billing categories.
- **Sovereignty is non-waivable.** The spawned vertical is the person's. Starlight has no claim. Attribution via "Built on SIP" on shipped artifacts is the only compounding mechanism. Do not write any clause to the contrary into the scaffold.
- **Sub-system tier declaration.** Every spawned sub-system agent declares "Domain Sub-Stack Tier" in its frontmatter, matching the `starlight-hiring.md` precedent. Universal layers (Excavation, Vision, Business, Leadership) are NOT this tier — they compose across verticals; sub-systems compose only within the vertical owner.
- **Functional decomposition only.** Topical decomposition (chapters of a book; areas of expertise) is rejected. Each sub-system must produce named output artifacts per command.
- **One stack per domain per sovereign.** Re-running `/spawn-domain-stack` for the same domain re-iterates the proposal; it does not create a second parallel stack.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4.1 (HR Intelligence sub-stack reference)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
