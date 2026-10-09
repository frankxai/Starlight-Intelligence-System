---
name: agent-forge
description: Design an agent only when a durable autonomy boundary is justified; compile it only when a Foundry runtime is available. Use for persistent decision rights, distinct memory, constrained tools, ownership transfer, or an ongoing schedule, channel, or API trigger.
---

# Agent Forge

## Outcome

Design the smallest justified persistent actor, or deliberately downgrade the request to a skill or temporary worker. Compile it only when a Foundry runtime is present.

## Agent necessity gate

An agent must own at least one durable boundary:

- stable decision rights;
- a distinct memory scope;
- a constrained tool or permission boundary;
- genuine ownership transfer or handoff authority;
- an ongoing schedule, channel, or API trigger.

If none applies, stop and route to `$skill-forge`. A name, persona, or desire for “more intelligence” is not an agent boundary.

## Procedure

1. Build the Task Envelope.
   - Record the objective, deliverables, stakes, autonomy, permissions, evidence policy, and termination tests.
2. Prove necessity.
   - Mark each necessity-gate field true or false.
   - Explain the persistent boundary in operational language.
   - Compare the proposed agent against a skill, deterministic tool, and temporary task worker.
3. Define decision rights.
   - State what the agent may decide, what it may recommend, and what requires operator approval.
   - Exclude public release, financial commitment, destructive action, permission expansion, and substrate change unless explicitly authorized.
4. Define memory and tools.
   - Name readable and writable scopes separately.
   - Choose turn, session, or durable retention.
   - Allow only the minimum tools needed; list denied tools explicitly.
5. Define handoffs and termination.
   - Give every handoff a condition and target.
   - Set success conditions, stop conditions, and a hard turn or round ceiling.
6. Compose existing skills.
   - Agents orchestrate capabilities; they do not duplicate skill procedures inside a persona prompt.
7. Select the execution mode.
   - **Foundry runtime available:** only when `tools/foundry/cli.mjs` and `foundry/contracts/` exist in the current workspace, compile and prove:

   ```bash
   node tools/foundry/cli.mjs forge \
     --envelope <task-envelope.json> \
     --pack <agent-pack.json> \
     --out <package-directory>
   node tools/foundry/cli.mjs prove <package-directory>
   ```

   - **Portable skills-only install:** read `references/portable-contracts.md`, then author the Task Envelope and Agent Pack with those field names. Mark compilation and proof `pending-runtime`; do not invent an Evidence Receipt. Provide the commands above as an optional handoff for a later SIS workspace run.

8. Refuse false persistence.
   - If the boundary disappears during design, return a Skill Pack proposal instead of forcing agent creation.

## Quality gates

- At least one durable boundary is true and explained.
- Decision rights do not exceed the Task Envelope autonomy.
- Tool and memory permissions are least-privilege.
- Handoffs do not form an unbounded loop.
- The agent has explicit success and stop conditions.
- Behavioral, security, and drift evidence are required before production autonomy.

## Return

Return the necessity verdict, chosen topology, Agent Pack, execution mode, permissions requiring approval, and any downgrade recommendation. Include a compiled package path and Evidence Receipt only when they were actually produced.
