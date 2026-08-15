---
schema: starlight.agents_file.v1
system_id: replace-with-system-id
version: 0.1.0
status: draft
human_owner: replace-with-accountable-owner
---

# Multi-Agent System Contract

## Mission

State one bounded outcome, the intended user, the acceptance threshold, the budget, the deadline, and what is explicitly out of scope.

## Human authority

The human owner retains mission changes, veto, credentials, production promotion, public sends, spend, destructive actions, permissions, legal/IP decisions, and final accountability.

## Active swarm

Keep the active council as small as the mission permits. For each agent, link one `agent-card.v1` profile and name:

- Unique responsibility.
- Inputs and expected artifact.
- Tools and data scope.
- Memory scope and retention.
- Stop and escalation conditions.
- Evaluation suite and current evidence state.
- Fallback owner when unavailable.

## Topology and routing

Declare the coordination pattern: conductor + specialists, pipeline, parallel council, shared blackboard, or builder–critic loop. Name every directed handoff and shared-state owner.

## Task packets

Every handoff carries a bounded `starlight.task_packet.v1`: objective, context references, inputs, output contract, constraints, acceptance, privacy class, budget, and expiry.

## Tools, data, and memory

- Allow only the smallest sufficient tool set.
- Separate read, write, send, spend, permission, credential, and destructive capabilities.
- Never move private memory through a public handoff.
- Treat absent authority or evidence as a hold.

## Verification

The independent verifier records checks, failures, cost, duration, artifacts, rollback, and verdict in `starlight.run_receipt.v1`. Structural tests and live model evaluations remain distinct.

## Evolution

Every capability increase publishes `starlight.evolution_release.v1` with version delta, compatibility, migrations, eval comparison, lineage, rollback, deprecation, and retirement notes.

## Public truth boundary

Profiles and packs describe a system. They do not grant runtime authority, credentials, private memory, or production admission.

