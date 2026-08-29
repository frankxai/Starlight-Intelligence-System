---
name: capability-graph-architecture
description: Model a role, curriculum, repository, or practice as a provenance-carrying capability graph that binds capabilities to missions, artifacts, evaluators, evidence, and opportunities.
---

# Capability Graph Architecture

## Outcome

Produce a versioned capability graph and coverage report whose consequential nodes and edges can be traced to sources or clearly marked hypotheses.

## Use this skill when

- A role, academy, curriculum, repository, or expert practice must become an executable learning graph.
- Existing courses or skills need to be reconciled into prerequisites, missions, artifacts, and proof.
- A team needs to see what a learner or agent can actually demonstrate, not only what content exists.

Do not use it when:

- The request is only for a system dependency graph, GraphRAG index, graph-database selection, or decorative diagram.
- The source material is unavailable and the user expects authoritative capability claims rather than a labeled hypothesis graph.

## Inputs

- Target role, domain, or outcome
- Source curricula, repositories, standards, job evidence, or expert artifacts
- Learner stage and constraints
- Graph owner, version, license, and release boundary

## Procedure

1. Freeze the graph contract: decision owner, audience, domain boundary, learner outcome, release status, license, and excluded concerns.
   - Proof: A written graph contract with explicit exclusions.
2. Build a claim ledger from inspectable sources. Classify every proposed node or edge as sourced, derived, or hypothesized; never smooth those states together.
   - Proof: Each consequential graph claim has provenance or a hypothesis marker.
3. Normalize stable nodes for capabilities, knowledge, techniques, tools, missions, artifact types, evidence types, rubrics, roles, and opportunities.
   - Proof: Unique stable identifiers, definitions, lifecycle state, and stage exist for every node.
4. Bind execution edges so each active capability resolves to a mission, expected artifact, evaluator or rubric, and acceptable evidence type.
   - Proof: The coverage matrix contains no unexplained active capability.
5. Validate references, duplicate edges, prerequisite cycles, orphan nodes, contradictory claims, license compatibility, and private/public boundaries.
   - Proof: A machine-readable validation report with blocking and non-blocking findings.
6. Publish only the consented public projection. Return gaps and proposed patches separately from the accepted graph.
   - Proof: Versioned graph, coverage report, source ledger, and unresolved patch queue are distinct artifacts.

## Outputs

- `competency-graph.json`
- Capability-to-mission-to-evidence coverage matrix
- Claim and provenance ledger
- Blocking defects and proposed patch queue

## Guardrails

- A graph is a derived projection of signed or inspectable records, never an unreviewed mutable truth database.
- Do not infer credential status, ownership, reputation, or economic entitlement from graph position.
- Do not publish private learner evidence, raw telemetry, hidden evaluations, signing material, or live holdouts.
- A syntactically valid graph is not evidence that its educational claims are true.

## Completion

Return the graph version, coverage, validation checks actually run, sourced versus hypothesized claims, and unresolved authority decisions.
