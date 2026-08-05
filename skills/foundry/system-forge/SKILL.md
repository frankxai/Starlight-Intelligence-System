---
name: system-forge
description: Compile a multi-capability system as a swarm, vertical, or plugin. Use when several skills or agents need explicit topology, shared state, conflict resolution, termination, deployment adapters, and cross-surface packaging.
---

# System Forge

## Outcome

Compile a bounded system whose topology, authority, shared state, and proof obligations are visible before execution.

## Choose the smallest system shape

- **Skill composition:** one actor can perform the work sequentially.
- **Swarm:** independent or specialized workers need explicit coordination.
- **Vertical:** domain rules, audiences, taste, and evaluation recur across several capabilities.
- **Plugin:** a set of validated skills and optional MCP connectivity must be distributed to ChatGPT Work and Codex.

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
7. Compile the appropriate pack.

   ```bash
   node tools/foundry/cli.mjs forge \
     --envelope <task-envelope.json> \
     --pack <swarm-pack.json|vertical-pack.json|plugin-pack.json> \
     --out <package-directory>
   ```

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

Return the system-shape decision, topology, capability resolution, pack, compiled artifacts, Evidence Receipt, and the smallest blocked next step.
