---
name: system-forge
description: Design a multi-capability system as a swarm, vertical, or plugin; compile it only when a Foundry runtime is available. Use when several skills or agents need explicit topology, shared state, conflict resolution, termination, deployment adapters, and cross-surface packaging.
---

# System Forge

## Outcome

Design a bounded system whose topology, authority, shared state, and proof obligations are visible before execution, then compile it when a Foundry runtime is present.

## Choose the smallest system shape

- **Skill composition:** one actor can perform the work sequentially.
- **Swarm:** independent or specialized workers need explicit coordination.
- **Vertical:** domain rules, audiences, taste, and evaluation recur across several capabilities.
- **Plugin:** a set of validated skills and optional MCP connectivity must be distributed to ChatGPT and Codex.

Do not create a swarm merely to make a workflow sound advanced. Parallelism is justified only for genuinely separable work, independent evaluation, latency reduction, or permission isolation.

## Procedure

1. Start with a Task Envelope.
   - Include deliverables, stakes, autonomy, capability selection, permissions, required evidence lanes, and deployment targets.
2. Resolve capabilities.
   - Prefer registered skills and agents.
   - Treat lexical graph suggestions as discovery hints, never silent routing decisions.
3. Choose topology.
   - `manager-workers`: one owner decomposes and synthesizes.
   - `handoff`: ownership moves between specialists.
   - `agents-as-tools`: one agent retains control and invokes bounded specialists.
   - `parallel-merge`: separable outputs join under a deterministic merge.
   - `debate-synthesize`: independent hypotheses are judged and synthesized.
4. Define authority and state.
   - Give every role non-overlapping decision rights.
   - Choose manager-only, append-only, or partitioned shared-state writes.
   - Name the conflict owner and evidence-based resolution method.
5. Define termination before dispatch.
   - Write success conditions, stop conditions, maximum rounds, cost or latency ceilings, and escalation points.
6. Keep builder, critic, and verifier separate when stakes or ambiguity justify it.
7. Select the execution mode.
   - **Foundry runtime available:** only when `tools/foundry/cli.mjs` and `foundry/contracts/` exist in the current workspace, compile the appropriate pack:

   ```bash
   node tools/foundry/cli.mjs forge \
     --envelope <task-envelope.json> \
     --pack <swarm-pack.json|vertical-pack.json|plugin-pack.json> \
     --out <package-directory>
   ```

   - **Portable skills-only install:** read `references/portable-contracts.md`, then author the Task Envelope and chosen pack with those field names. Mark compilation and proof `pending-runtime`; do not invent emitted host artifacts or an Evidence Receipt. Provide the command above as an optional handoff for a later SIS workspace run.

8. Prove static structure before live orchestration.
   - Validate topology, capabilities, permissions, state policy, termination, and plugin shape.
   - Run behavioral and economic lanes before increasing autonomy or fan-out.

## Plugin rule

A skills-only plugin is a valid first release. Add an MCP server only when a real deployed endpoint, authentication model, privacy contract, and tool-level tests exist. Never invent a future endpoint in the manifest.

## Quality gates

- Every role owns a distinct output or policy boundary.
- The synthesizer is named.
- Conflict resolution is explicit.
- Shared-state writes cannot silently overwrite another role.
- Termination and budget ceilings are machine-readable.
- Deployment claims match surfaces that were actually packaged and tested.

## Return

Return the system-shape decision, topology, capability resolution, pack, execution mode, and the smallest blocked next step. Include compiled artifacts and an Evidence Receipt only when they were actually produced.
