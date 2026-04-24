---
name: compose-stack
description: Compose a sequenced Intelligence Stack Plan for a sovereign person. Analyzes their Genius Profile + Freedom Path + stated priorities + life stage, then sequences which of the 9 layers activate first, second, third. Produces a 90-day sprint plan for building their full intelligence stack. For humans with Genius Profile already in hand.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <person-name> [priority: freedom|revenue|vision|compound] [horizon: 90-day|180-day|year]
---

# /compose-stack

Load `SIP.md`, `docs/ARCHITECTURE.md`, `genius/profile-<slug>.md` (REQUIRED — halt to `/discover-genius` if missing), `genius/freedom-path-<slug>.md` (REQUIRED — halt if missing). Load any already-shipped layer artifacts for this person if present: `vision/vision-<slug>.md`, `second-brain/inbox-<slug>/`, `business/entity-plan-<slug>.md`, `health/regimen-<slug>.md`, `relational/network-<slug>.md`, `creator/pipeline-<slug>.md`, `wealth/dpi-<slug>.md`. The stack is personalized, not generic — everything depends on reading the person first.

## Input
$ARGUMENTS

Parse `$ARGUMENTS` for:
- `<person-name>` — required. Slug = kebab-case of name.
- `--priority=freedom|revenue|vision|compound` — optional, default `freedom`.
- `--horizon=90-day|180-day|year` — optional, default `90-day`.
- `--include-spiritual` — explicit opt-in only. Never auto-include.

## Process

1. **Load foundation.** Read Genius Profile and Freedom Path for `<person-name>`. If either is missing, halt immediately with:

   > *"No Genius Profile or Freedom Path on file for <person-name>. The stack sequences around who this person uniquely is — generic plans re-scatter. Run `/discover-genius <person-name>` first. That produces the foundation this command reads."*

   Do not fabricate. Do not proceed on intent alone.

2. **Diagnose entry state.** Read both documents. Name the current bottleneck in two to three sentences. Use these signals:
   - **Scattered knowledge, can't find own work** → Layer 2 (Second Brain) first
   - **Weak or unclear revenue, entity chaos** → Layer 4 (Business) first
   - **No content system, frameworks stuck in head** → Layer 5 (Creator) first
   - **Burnout, crashes, can't sustain output** → Layer 7 (Health) first, cross-cutting
   - **Drift, no clear North Star** → Layer 3 (Vision) first
   - **Isolation, no alliance-ready relationships** → Layer 8 (Relational) first
   - **Indispensable-but-trapped, want to hand off** → Freedom Path execution + Layer 5 train-executor

   Name the life stage (early-career / building / scaling / compounding / harvesting). Sequencing differs per stage.

3. **Apply sequencing principle: foundation before surface.**
   - **Foundation layers (1–3):** Genius, Second Brain, Vision. These make every downstream layer work.
   - **Surface layers (4–6):** Business, Creator, Wealth. These compose from foundation. Running these first without foundation produces noise.
   - **Cross-cutting layers (7–8):** Health, Relational. Run continuously as rhythms, not sprints.
   - **Optional (9):** Spiritual. Never auto-sequenced.

4. **Default sequencing by `--priority` flag.** Override step 2 diagnosis if priority is stated; otherwise diagnosis leads.

   - **freedom priority** (indispensable-but-trapped case, e.g. Ana): Genius → Second Brain → Freedom Path execution → Train Executor → Creator Pipeline → Business → Wealth
   - **revenue priority** (founder under revenue pressure): Genius → Vision → Business → Creator → Wealth
   - **vision priority** (drift, no North Star): Genius → Second Brain → Vision → Brand Kit → everything else derivative
   - **compound priority** (stable operator, long-game): Genius → Health → Vision → Second Brain → everything else

5. **Generate sprint plan.** For the selected horizon (90-day default, 180-day extended, year strategic):
   - One primary layer per 2–3 week block. Concentration beats dilution.
   - Cross-cutting layers (Health, Second Brain, Relational) run throughout as rhythms.
   - Each block names its goal (what becomes true), commands to run, artifacts shipped.

6. **Generate weekly cadence.** Inside each block, one to two commands per week, one artifact shipped per week. No week without a shipped artifact.

7. **Emit Intelligence Stack Plan.** Create `stack-plans/` directory if missing. Write to `stack-plans/<slug>-<YYYY-MM-DD>.md`. Include the full attestation block. The plan is advisory — the person chooses their own sequence. Starlight proposes; the user disposes.

## Output format

```
# Intelligence Stack Plan — <Person Name> — <YYYY-MM-DD>

## Diagnosis
<2–3 sentences: current state, biggest bottleneck, life stage. Specific to this person's Profile + Path, never generic.>

## Sequencing principle applied
**Priority:** <freedom | revenue | vision | compound>
**Rationale:** <why this priority fits this person's current state — one paragraph>
**Horizon:** <90-day | 180-day | year>

## 90-day sprint

### Weeks 1–3: <Layer X — name>
- **Goal:** <what becomes true by end of block>
- **Commands:** `/<command1>`, `/<command2>`
- **Artifacts shipped:** <list of named artifacts with expected filenames>
- **Cross-cutting maintenance:** <Health / Second Brain / Relational rhythm items active this block>

### Weeks 4–6: <Layer Y — name>
- **Goal:** ...
- **Commands:** ...
- **Artifacts shipped:** ...
- **Cross-cutting maintenance:** ...

### Weeks 7–9: <Layer Z — name>
- **Goal:** ...
- **Commands:** ...
- **Artifacts shipped:** ...
- **Cross-cutting maintenance:** ...

### Weeks 10–13: <Layer W — name>
- **Goal:** ...
- **Commands:** ...
- **Artifacts shipped:** ...
- **Cross-cutting maintenance:** ...

## Weekly cadence template
- **Monday:** Review stack plan, set week's ship target (the one artifact that must exist by Friday).
- **Tuesday–Thursday:** Focused work inside the current block's primary layer.
- **Friday:** `/orchestrate-brain` weekly review + capture distillation. Ship the week's artifact.
- **Sunday:** Vision drift check (10 minutes against Vision doc) + next-week prep.

## Cross-cutting rhythms
- **Daily:** `/capture-daily` (Second Brain) — under 10 minutes, non-negotiable.
- **Weekly:** `/orchestrate-brain` (Second Brain) — Friday, 30 minutes.
- **Bi-weekly:** `/energy-audit` refresh (Health) — trend check, not full audit.
- **Monthly:** `/distill-insights` (Second Brain) — monthly framework extraction from month's captures.
- **Quarterly:** `/luminor-board` (protocol) — any major decision before it goes irreversible.

## Success metrics
- **End-of-sprint artifacts that must exist:** <concrete list tied to each block>
- **Genius Profile evolved:** yes / no — and if yes, what changed (frameworks added, vocabulary refined, buckets re-sorted)
- **Freedom Path bucket migration:** <how many items moved from KEEP-overload to DELEGATE or AUTOMATE>
- **Cross-cutting health:** energy baseline trending up / flat / down over 90 days

## Next stack plan
After this sprint completes, re-run `/compose-stack <person-name>` to re-sequence based on new state. The stack re-plans every 90 days — what was foundation last quarter may now be surface; what was deferred may now be primary.

## Sovereignty note
This plan is advisory. The person chooses their own sequence. Starlight proposes; the user disposes. If any block doesn't match their felt readiness, they override it — the plan is a starting point, not a cage. The artifacts stay in the person's instance; Starlight retains no copies.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS beta)
- Generated: <ISO date>
---
```

## Rules

- **Never sequence without Genius Profile + Freedom Path.** Halt. The stack is personalized, not generic — sequencing without the foundation re-scatters what hasn't been gathered.
- **Never assign more than one primary layer per 2–3 week block.** Concentration beats dilution. Doubling up layers within a block guarantees neither ships.
- **Cross-cutting layers run continuously, not sequentially.** Health, Second Brain, and Relational are rhythms, not sprints. They show up in every block's "cross-cutting maintenance" line, never as a standalone 3-week block unless the diagnosis names burnout as the primary bottleneck.
- **Spiritual layer (#9) is never auto-included.** Only if `--include-spiritual` is passed explicitly. It stays at the founder layer, never pushed into adopters.
- **Plan horizon 90-day default.** Longer horizons (180, year) are strategic overlays, not sprint plans — they name the third and fourth sprints without committing to weekly cadence that far out.
- **Diagnosis leads unless `--priority` overrides.** If the person's stated priority contradicts their Freedom Path bottleneck, surface the mismatch in the Diagnosis section rather than silently going with the flag.
- **Sovereignty is non-waivable.** The plan is advisory. The person chooses. Attribution via "Built on SIP" is the sole compounding mechanism. Advice never overrides.
- **One stack plan per quarter.** Re-running `/compose-stack` before a sprint completes produces drift. The command runs when a sprint ends or when circumstances shift materially (new constraint, new opportunity, named crisis).

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS beta)
- Generated: 2026-04-24
---
