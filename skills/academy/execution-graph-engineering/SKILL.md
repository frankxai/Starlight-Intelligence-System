---
name: execution-graph-engineering
description: Design the smallest justified execution graph for a human-agent system with typed nodes and edges, explicit authority, bounded state, recovery, termination, and independent proof.
---

# Execution Graph Engineering

## Outcome

Produce a versioned execution-graph contract and proof plan, or a documented decision that a single loop, deterministic workflow, or sequential skill composition is sufficient.

## Use this skill when

- A multi-stage human-agent system needs explicit task dependencies, branches, joins, handoffs, approval gates, or recovery paths.
- Different nodes require distinct capabilities, permissions, data scopes, budgets, or independent verification.
- A long-running workflow must localize failure, resume from a valid frontier, and preserve artifact and decision provenance.

Do not use it when:

- A single bounded skill, deterministic function, or sequential loop can produce and verify the result.
- The request is for a capability graph, knowledge graph, GraphRAG index, graph database, dependency visualization, or decorative diagram.
- The system lacks a named objective, accountable human, observable completion condition, or enforceable authority boundary.

## Inputs

- Task Envelope, objective, beneficiary, constraints, and accountable human
- Required capabilities, available skills, tools, temporary workers, and attested agent builds
- Input, output, state, event, policy, budget, and data-classification contracts
- Required behavioral, recovery, security, economic, and independent-evaluation lanes

## Procedure

1. Choose the smallest system shape by comparing a deterministic workflow, one agent loop, sequential skill composition, and an execution graph.
   - Proof: A system-shape decision records why graph structure is necessary or rejects it without implementation theater.
2. Model task semantics independently from executor choice. Define task, router, join, gate, checkpoint, and terminal nodes with typed inputs, outputs, capabilities, side effects, and completion conditions.
   - Proof: Every node owns one coherent result or policy boundary and every reference resolves.
3. Type dependency, control, data, handoff, approval, recovery, and compensation edges. Make projections and delegation explicit; authority must attenuate rather than silently widen across an edge.
   - Proof: All nodes are reachable, joins are deterministic, handoffs are bounded, and consequential actions traverse the required human gate.
4. Define runtime state, checkpoints, idempotency, retry classes, replay frontier, compensation, termination, maximum rounds, wall time, parallelism, and spend.
   - Proof: Cycles are bounded, non-idempotent work is not blindly retried, and every failure class reaches recovery, escalation, or a terminal state.
5. Bind each node to the least-powerful viable executor: deterministic tool, reusable skill, temporary worker, persistent agent, or human. Require an Agent Team Manifest and unexpired capability attestation only where persistence is justified.
   - Proof: Capability coverage is complete, permissions are least-privilege, and false agent boundaries are downgraded.
6. Prove the graph against the simplest viable baseline with structural, behavioral, recovery, authority, provenance, economic, and independent-defense lanes.
   - Proof: Frozen fixtures and results support `validated`, `experimental`, `revise`, or `rejected`; the builder is not the sole judge for a required lane.

## Outputs

- `execution-graph.yaml`
- System-shape decision and rejected-complexity ledger
- Node, edge, capability, authority, state, and budget contracts
- Failure, recovery, observability, and evaluation plan
- Proof receipt with unresolved evidence and promotion status

## Guardrails

- Do not create graph structure merely to increase agent count or visual complexity.
- Human approval remains mandatory for money, publication, external communication, credential status, destructive action, sensitive data, and residual-risk acceptance.
- Persistent agents require a durable autonomy boundary, pinned build, narrow delegation, constrained tools and memory, budget, evaluation, escalation, and termination.
- Chain-of-thought is not graph state. Persist only inspectable inputs, outputs, decisions, events, and provenance permitted by policy.
- Prefer versioned files and relational edge projections; require measured traversal constraints before adding a specialist graph database.
- A passing execution graph proves bounded system behavior, not human competence, credential status, truth, originality, or legal recognition.

## Completion

Return the system-shape verdict, graph version, topology, authority and recovery boundaries, tests actually run, baseline comparison, proof status, and exact human decisions still required.
