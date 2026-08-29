# Research Basis — 2026-08-29

This release treats Graph Engineering as a systems discipline, not a synonym for GraphRAG, a graph database, or “more agents.” Its working definition is the design and proof of explicit graphs for task organization, agent coordination, and evolving runtime state.

## Primary sources

- [Graph Engineering in the Era of LLM Agents](https://arxiv.org/abs/2608.21156) frames Graph Engineering around explicit, dynamic structures for tasks, agents, and system state. This plugin adopts that three-part frame while adding Starlight authority, privacy, and human-decision constraints.
- [From Agent Loops to Structured Graphs](https://arxiv.org/abs/2604.11378) models agent execution through scheduler theory and proposes an immutable-plan DAG with separate planning, execution, and recovery layers. The paper is a position and design proposal rather than production evidence; this release therefore treats its implications as hypotheses to test.
- [From Agent Loops to Deterministic Graphs](https://arxiv.org/abs/2605.06365) evaluates execution lineage: artifact-producing computations with explicit dependencies and identity-based replay. Its controlled tasks motivate stable intermediate artifacts, selective recomputation, and maintained-state tests here; they do not establish universal graph superiority.
- [AIP: A Graph Representation for Learning and Governing Agent Skills](https://arxiv.org/abs/2606.04781) reports improved results from compiling prose skills into typed execution graphs on a 27-task sample. This release keeps human-readable Agent Skills canonical while making deterministic steps, typed I/O, and node-level evaluation explicit where they materially improve reliability.
- [Awesome Graph Engineering](https://github.com/DEEP-JLU/Awesome-Graph-Engineering) is the companion source index for the emerging field. It is discovery material, not evidence that a listed method is production-ready.

## Design consequences

1. Start with a deterministic workflow, a single bounded loop, or sequential skills; require a written justification before introducing an execution graph.
2. Separate node semantics from executor choice. A task, router, join, gate, checkpoint, or terminal may bind to a deterministic tool, skill, temporary worker, persistent agent, or human.
3. Make dependencies, data flow, authority transfer, approvals, recovery, compensation, termination, and budgets inspectable.
4. Treat intermediate artifacts and decisions as versioned lineage. Do not persist hidden chain-of-thought as runtime state.
5. Compare the graph against the simplest viable baseline. Missing behavioral, recovery, authority, provenance, economic, or independent-review evidence keeps the system experimental.
6. Keep the learner capability graph, execution graph, and economic/resource graph separate. No edge between them may silently confer credential, ownership, reputation, or payment rights.

## Evidence posture

The field is new and the cited results have different scopes. Starlight therefore uses these sources to define testable design hypotheses, not to claim settled consensus or guaranteed outcomes. Promotion requires local conformance evidence, adversarial fixtures, independent review, and transparent failure reports.
