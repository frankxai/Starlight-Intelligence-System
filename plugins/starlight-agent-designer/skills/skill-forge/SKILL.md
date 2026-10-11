---
name: skill-forge
description: Forge a reusable, portable skill from a proven workflow or capability brief. Use when the work needs repeatable instructions, triggers, guardrails, and evidence tests but does not need a persistent autonomous identity.
---

# Skill Forge

## Outcome

Design one narrow capability as a portable Agent Skills package with explicit activation boundaries, then compile and prove it when a Foundry runtime is available.

## Use this skill when

- A successful workflow should become reusable.
- A user asks to create, improve, or package a skill.
- A repeated task needs stable instructions, tools, guardrails, or evaluation.
- The capability should work in ChatGPT, Codex, or a skills-based plugin.

Do not use it when the work requires persistent decision rights, a distinct durable memory scope, or an ongoing trigger owned by an autonomous actor. Use `$agent-forge` only after proving one of those boundaries.

## Procedure

1. Define the decision contract.
   - Capture the objective, audience, deliverables, stakes, reversibility, permissions, constraints, and completion tests.
   - Ask only for missing information that materially changes the capability.
2. Discover before creating.
   - Inspect the capability graph and existing skills.
   - Reuse or depend on an existing capability when it already owns the behavior.
   - Record required, preferred, and forbidden capabilities explicitly.
3. Bound activation.
   - Write concrete positive triggers and at least one negative trigger.
   - Keep one skill responsible for one coherent outcome.
   - Avoid broad adjectives as requirements; translate them into observable gates.
4. Author the Skill Pack.
   - Give every procedure step a proof obligation.
   - Declare inputs, outputs, dependencies, tool policy, memory policy, deployment targets, and optional taste profile.
   - Keep `SKILL.md` frontmatter limited to `name` and `description`.
5. Select the execution mode.
   - **Foundry runtime available:** use this mode only when `tools/foundry/cli.mjs` and `foundry/contracts/` exist in the current workspace. Validate the Task Envelope and Skill Pack, then run:

     ```bash
     node tools/foundry/cli.mjs forge \
       --envelope <task-envelope.json> \
       --pack <skill-pack.json> \
       --out <package-directory>
     ```

   - **Portable skills-only install:** read `references/portable-contracts.md`, then author the Task Envelope, Skill Pack, and proposed `SKILL.md` directly with those field names. Mark compilation and proof `pending-runtime`; do not invent paths, commands, or receipts. Give the operator the command above as an optional handoff for a later SIS workspace run.

6. Prove.
   - Run this step only in Foundry runtime mode.
   - Run static and artifact checks first.
   - Execute command tests only when the Task Envelope permits the executable.
   - Keep manual and judge tests pending until independent evidence exists.
   - Run:

     ```bash
     node tools/foundry/cli.mjs prove <package-directory>
     ```

7. Promote only from receipts.
   - `validated`: every required lane passed.
   - `experimental`: required evidence is still pending.
   - `revise`: a required test failed.
   - `rejected`: a critical security test failed.

## Quality gates

- The skill is narrower than an agent and more reusable than a one-off prompt.
- Trigger examples distinguish when to use and when not to use it.
- The procedure is executable without hidden context.
- Claims about research, tests, writes, or deployment have receipts.
- The producer is not the sole judge for a required taste lane.

## Return

Return the Task Envelope, Skill Pack, proposed skill, execution mode, and unresolved proof. Include a compiled package path and Evidence Receipt only when those artifacts were actually produced.
