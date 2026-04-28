---
name: training-curriculum
description: Outcome-back curriculum design for a single program or module. Starts from the L3 job behavior change and L4 business outcome; works backward through capability requirements, sequencing, spaced retrieval, cognitive-load chunking, encoding-context simulation, and per-module evaluation rubric. Refuses content-first design.
allowed-tools: Read, Write, Grep, Glob
argument-hint: program name (required) + --behavior "<L3 behavior change>" + --outcome "<L4 business metric>" + --audience <role/cohort> + --duration <weeks> + optional context paragraph
---

# /training-curriculum

Load `agents/starlight-training.md`, `skills/people-intelligence/learning-architecture.md`, and if present any upstream Performance Intelligence behavior-gap report or Hiring rubric for the role. Produce a **Curriculum Design** for the program. Hand off to exactly one next command.

## Required reading at activation

- The L3 behavior change must be named, observable, and on-job. If the request is "we want training on X" without a named L3 behavior — halt. Ask once. If still not named, refuse and route upstream to `/performance-review` or the Org/Culture sub-system.
- The L4 business outcome must be named. "Engagement will go up" is not L4; "1:1 quality score on Q3 engagement survey lifts ≥0.5 vs Q2 baseline" is L4.

## Input
$ARGUMENTS

## Flags

- `--behavior "<observable on-job behavior change>"` — required. Kirkpatrick L3.
- `--outcome "<business metric tied to behavior>"` — required. Kirkpatrick L4.
- `--audience <role | cohort>` — required. e.g. `people-managers`, `IC-engineers-L4-L5`, `customer-success-team-EMEA`.
- `--duration <N weeks>` — required. The curriculum spans this window inclusive of spacing checkpoints.
- `--cohort-size <N>` — optional. Affects modality mix (cohort-based vs self-paced).
- `--prereq <slug>` — optional. Links to a prior program whose curriculum is prerequisite knowledge.

## Process

1. **Verify outcome inputs.** If `--behavior` or `--outcome` is missing or vague, halt and ask once. Do not generate curriculum from "general topic" framing. Outcome-first or refuse.

2. **Reverse-engineer capability.** From the L3 behavior, list the sub-skills required. From sub-skills, list the prerequisite knowledge. From prerequisite knowledge, identify what the audience already has vs. what must be loaded. The capability map is the spine of the curriculum.

3. **Sequence the spine** per the protocol in `learning-architecture.md`:
   - Concept introduction (light)
   - Application practice (with feedback)
   - Spaced retrieval at R1 (1d), R2 (1w), R3 (1m), R4 (3m)
   - Simulation in performance-context
   - On-job application (with manager reinforcement)
   - Measurement (L3 at 30/60/90; L4 at 90+)

4. **Cognitive-load map.** For each module, list the chunks (≤4 per working-memory load). Mark prerequisite chunks pre-loaded in earlier modules. Flag any module where chunks exceed 4 and split the module.

5. **Encoding-context match.** For each module, name the simulation context — what tools, vocabulary, pressure conditions resemble the on-job performance context. If a module is pure-concept with no simulation, flag and add simulation or move it to pre-work.

6. **Spaced retrieval schedule.** Build the R1-R4 schedule explicitly. Name the retrieval mechanism per checkpoint (Slack prompt, scenario response, peer-discussion prompt, manager observation).

7. **Per-module evaluation rubric.** L2 (learning) per module — can the learner demonstrate the sub-skill in scenario? L3 (behavior) per module group — does the on-job application happen? Build the rubrics now, before delivery.

8. **Save.** Create `hr-intelligence/training/<program-slug>/` if missing. Write `curriculum-<program-slug>-<YYYY-MM-DD>.md`.

9. **Hand off.** Default: `/training-program-design <program-slug>` to wrap the curriculum into a deliverable program (cadence, trainer brief, manager engagement plan, ROI projection).

## Output format

```markdown
# Curriculum Design — <Program Name> — <YYYY-MM-DD>

> *Outcome-back design. Spaced retrieval. Encoding-context match. Cognitive-load discipline.*

## Outcome anchor

- **L3 behavior change (on-job, observable):** <specific behavior>
- **L4 business outcome (metric tied to behavior):** <metric + baseline + target>
- **Audience:** <role/cohort>
- **Cohort size:** <N> (affects modality mix)
- **Duration:** <N weeks> (inclusive of R1-R4 spacing)
- **Prerequisites:** <prior knowledge required, where it's pre-loaded>

## Capability map

From L3 behavior → sub-skills → prerequisite knowledge.

| L3 sub-behavior | Required sub-skill | Prerequisite knowledge | Audience already has? |
|-----------------|---------------------|------------------------|------------------------|
| <e.g., "Manager observes specific behavior in 1:1"> | Behavioral observation skill | Difference between behavior and judgment | Partial — load in M1 |
| ... | ... | ... | ... |

## Module sequence

### Module 1 — <name> (<duration>)
- **L2 outcome:** <what the learner can demonstrate by end of module>
- **Chunks (≤4):** <chunk 1>, <chunk 2>, <chunk 3>, <chunk 4>
- **Activity mix:** <concept intro %> / <application practice %> / <simulation %>
- **Encoding context:** <tools, vocabulary, pressure conditions used>
- **Module evaluation rubric (L2):** <criteria + scoring>
- **Manager engagement (if applicable):** <pre-module brief, in-module checkpoint>

### Module 2 — <name> (<duration>)
... (same structure)

### Module N
... 

## Spaced retrieval schedule

| Checkpoint | Timing | Mechanism | Owner | Time required |
|------------|--------|-----------|-------|---------------|
| R1 | 1 day post-each-module | Quick scenario or short-answer prompt | Learner self-serve via LMS or Slack | 5-10 min |
| R2 | 1 week post-each-module | Application reflection + scenario response | Learner + peer pair | 15 min |
| R3 | 1 month post-program | Mini-simulation or peer-discussion prompt | Cohort facilitator | 30 min cohort |
| R4 | 3 months post-program | On-job behavior observation by manager (counts as L3) | Manager | 1:1 sampling |

## Cognitive-load map (audit)

| Module | Chunks loaded in this module | Chunks pre-loaded in prior module | Total active load | Pass (≤4)? |
|--------|------------------------------|------------------------------------|-------------------|-----------|
| M1 | 3 | 0 | 3 | yes |
| M2 | 4 | 1 | 4 | yes |
| ... | ... | ... | ... | ... |

If any module fails: split or pre-load.

## Encoding-context match (audit)

| Module | Performance context (the on-job situation this targets) | Simulation context (in-program) | Match score (1-5) | Action if <4 |
|--------|---------------------------------------------------------|----------------------------------|-------------------|---------------|
| M1 | <e.g., "1:1 feedback conversation"> | <e.g., "role-play in pairs with rubric"> | 4 | — |
| ... | ... | ... | ... | ... |

## Per-module evaluation rubric

For each module, name the L2 evaluation (in-module) and the contribution to the L3 evaluation (post-program).

- **M1 L2:** <pass criteria + scoring>
- **M1 L3 contribution:** <which on-job behavior this module enables; how it shows up at 30/60/90>
- ...

## Compliance flag (if applicable)

If any portion of this program is *legally mandated for compliance cover* (sexual harassment, data privacy, AML, jurisdiction-specific), flag here and split the curriculum:
- **Compliance-mandated component:** completion-record only; not measured as learning. Owner: <legal/compliance lead>.
- **Learning component:** measured as in this Curriculum Design.

If no compliance overlap: write "N/A — pure learning program."

## Load-bearing next move

**`/training-program-design <program-slug>`** — Wrap the curriculum into the deliverable program (cadence, trainer brief, manager engagement plan, ROI projection).

Alternative next moves (only if Curriculum surfaces a gap):
- `/training-coach-trainer <program-slug>` — if internal SMEs will deliver and TtT must precede launch
- `/training-scenarios <skill-domain>` — if scenarios are the bottleneck before program design
- `/training-measure-transfer <program-slug>` — if measurement plan needs detailed design before launch

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3 — Training Intelligence)
- Generated: <ISO date>
---
```

## Rules

- **Outcome anchor at top, always.** L3 + L4 are non-negotiable opening fields. No outcome → halt and refuse.
- **Spaced retrieval is structural.** R1-R4 schedule is mandatory. Re-read-only curricula are refused.
- **Cognitive-load map is mandatory.** Modules that exceed 4 chunks per load are split or pre-loaded.
- **Encoding-context match is mandatory.** Pure-concept modules without simulation are flagged or moved to pre-work.
- **Per-module evaluation rubric is mandatory.** L2 in-module + L3 contribution. Smile-sheets are not evaluation.
- **Compliance flag is explicit.** Mandated-for-legal-cover content is not measured as learning.
- **One hand-off at close.** Default is `/training-program-design`. Alternatives only if a specific gap surfaces.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (HR Intelligence Domain Sub-Stack, sub-system 3)
- Generated: 2026-04-24
---
