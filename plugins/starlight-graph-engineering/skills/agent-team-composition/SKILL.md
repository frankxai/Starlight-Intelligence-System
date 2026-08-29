---
name: agent-team-composition
description: Compose the minimum human-accountable agent team for a learning mission with pinned builds, least-privilege tools, consented memory, budgets, evaluations, escalation, and termination.
---

# Agent Team Composition

## Outcome

Produce an Agent Team Manifest or a documented decision that a skill, deterministic tool, or temporary worker is sufficient.

## Use this skill when

- A mission requires several recurring agent roles with distinct permissions or memory scopes.
- A learner or institution needs an inspectable team manifest rather than an opaque swarm.
- Agent execution must be bounded by budget, data residency, consent, and accountable handoffs.

Do not use it when:

- A single skill or temporary task worker can produce the outcome.
- The requested agent exists only as a persona, title, or promise of intelligence without a durable authority boundary.

## Inputs

- Mission Contract and target capability subgraph
- Available skill and agent registry
- Tool, memory, budget, data, and residency constraints
- Accountable human, ombuds, escalation, and kill-switch policy

## Procedure

1. Run the agent necessity gate for each proposed role: persistent decision rights, distinct memory, constrained tools, ownership transfer, or ongoing trigger.
   - Proof: Each retained agent has at least one durable boundary; rejected roles are downgraded.
2. Bind every retained role to registered skills and a distinct output or policy boundary.
   - Proof: No role duplicates a skill procedure or another agent's authority.
3. Pin build, capability attestation, delegation, tool scopes, data scopes, autonomy, spend ceiling, parallelism, and runtime environment.
   - Proof: The manifest fails closed when a reference is missing, revoked, expired, unresolved, or outside scope.
4. Define manager, shared-state policy, handoffs, conflict owner, maximum rounds, recovery, escalation, and kill switch.
   - Proof: No unbounded loop or silent shared-state overwrite is possible.
5. Red-team prompt injection, data exfiltration, graph poisoning, confused-deputy actions, self-dealing, excessive autonomy, and credential/payment escalation.
   - Proof: Required security cases pass before activation.
6. Issue a draft manifest and activation receipt. Keep persistent agents inactive until behavioral, security, and drift lanes pass.
   - Proof: Activation status and unresolved evidence are machine-readable.

## Outputs

- Agent Team Manifest
- Necessity and downgrade ledger
- Permission and authority matrix
- Security, evaluation, escalation, and termination plan

## Guardrails

- No agent receives graph merge, public release, credential status, signing-key, unrestricted installation, financial commitment, or permission-expansion authority.
- An agent may propose a graph patch; only named human governance may accept and publish it.
- Learner memory is purpose-bound, consented, revocable, and partitioned from public commons state.
- Prefer skills-only plugin release until a real authenticated endpoint and tested runtime exist.

## Completion

Return the topology, necessity verdicts, manifest, unresolved proof, and the exact human activation decision.
