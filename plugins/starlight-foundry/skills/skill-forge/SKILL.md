---
name: skill-forge
description: Forge a reusable, portable skill from a proven workflow or capability brief. Use when the work needs repeatable instructions, triggers, guardrails, and evidence tests but does not need a persistent autonomous identity.
---

# Skill Forge

## Outcome

Compile one narrow capability into a portable Agent Skills package with explicit activation boundaries and a proof receipt.

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
5. Compile.
   - Validate the Task Envelope and Skill Pack.
   - Run:

     ```bash
     node tools/foundry/cli.mjs forge \
       --envelope <task-envelope.json> \
       --pack <skill-pack.json> \
       --out <package-directory>
     ```

6. Prove.
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

Return the Task Envelope, Skill Pack, compiled package path, Evidence Receipt status, unresolved proof, and any dependency or permission decision.
