---
name: orchestration-multi-agent-coordination
description: "Use when multiple Starlight agents need to collaborate on a related task — handles agent selection, task decomposition, dependency management, and result aggregation across the council. Default skill for Starlight Orchestrator."
---

# Multi-Agent Coordination & Swarm Orchestration

> *"Many minds, one mission. High autonomy, bounded consensus, verifiable convergence."*

## When This Skill Activates

- Workflows requiring multiple specialized agents or subagents to collaborate.
- Keywords: "coordinate", "agents", "swarm", "parallel", "team", "collaborate", "council", "/ultracode", "/ultrawork", "/ultraworld"
- Default for: Starlight Orchestrator, Starlight Prime

## What This Skill Does

Orchestrates multi-agent swarms using the 3-Gate Santa Method, strictly enforced consensus sizing ($\le 7$ agents), dynamic model routing, and memory guardian boundaries. Prevents context dilution, namespace collisions, and runaway token consumption.

## Core Rules & Invariants

1. **The $\le 7$ Consensus Sizing Rule**: Active deliberation and consensus loops MUST be capped at a maximum of 7 agents per council. Sizing beyond 7 causes coordinate deadlocks, latency spikes, and context dilution.
2. **Dynamic Model Routing**:
   - *Scout / Research / File Scan*: Fast lightweight models (`flash` / `flash_lite` / `haiku`).
   - *Drafting / Implementation*: Capable code models (`inherit` / `sonnet`).
   - *Crown Review / Unity Synthesis*: Deep reasoning models (`pro` / `thinking: high` / `o3` / `opus`).
3. **Memory Guardian Protection**: When spawning parallel subagents, verify working memory and context boundaries to prevent OOM errors in containerized and local environments.

## Procedures

### Procedure 1: Task Decomposition & Topology Selection

1. **Classify Workflow Shape**:
   - *Conductor / Hierarchical*: Orchestrator delegates to isolated workers and synthesizes.
   - *Pipeline / Sequential*: Stage A (Research) $\to$ Stage B (Design) $\to$ Stage C (Implementation) $\to$ Stage D (QA).
   - *Adversarial Santa Loop*: Worker drafts $\to$ Reviewer critiques $\to$ Worker refines $\to$ Consensus.
2. **Decompose into Discrete Sub-Tasks**:
   - Define for each agent: clear single responsibility, strict input context, explicit artifact deliverable, and acceptance criteria.
3. **Draft-First Workspace Isolation**: Subagents run with isolated context and communicate asynchronously via structured message packets.

### Procedure 2: The Adversarial Santa Loop (3-Gate Execution)

```
┌────────────────────────────────────────────────────────┐
│                   THE SANTA METHOD                     │
│                                                        │
│  [Fire Gate]       →    [Crown Gate]     →  [Unity]   │
│  Rapid Generation       Adversarial Review   Synthesis│
│  (Builder Agent)        (Sentinel/Reviewer)  (Prime)  │
└────────────────────────────────────────────────────────┘
```

1. **Fire Gate (Generation)**: Builder agent implements the initial code or artifact against technical specs.
2. **Crown Gate (Review)**: Independent reviewer subagent audits the draft against `TASTE.md`, test suites, security invariants, and design canons.
3. **Iterative Refinement**: If flaws are identified, feed targeted diffs back to the builder until all critical gates pass.
4. **Unity Gate (Synthesis)**: Prime or Conductor merges validated artifacts into a unified output.

### Procedure 3: Context Compression & Handoff Protocol

1. **Serialize Intermediate State**: Long-running swarms write milestones to `findings.md` or `task.md`.
2. **Structured Handoff Packet**:
   ```yaml
   handoff:
     from_agent: <agent-name>
     to_agent: <agent-name>
     task_id: <id>
     completed_work: [<items>]
     artifacts_created: [<paths>]
     decisions_locked: [<decisions>]
     next_actions: [<actions>]
     verification_criteria: [<checks>]
   ```
3. **Context Truncation Guard**: Discard raw exploration logs and pass only compressed essential context to downstream agents.

## Integration Points

- **Vaults**: Operational Vault (coordination receipts), Technical Vault (architecture patterns)
- **Harnesses**: Antigravity native `define_subagent` / `invoke_subagent`, Claude Code fanout, Codex cascading agents
- **Engine**: SAGE Autonomous Execution, Orchestration Engine (`core/ORCHESTRATION_ENGINE.md`)

## Quality Criteria

- Did the active consensus loop stay within the $\le 7$ agent boundary?
- Were fast models used for broad scans and deep reasoning models for reviews?
- Did the Santa Loop achieve verifiable consensus before user presentation?
- Are all intermediate artifacts cleanly persisted in project memory?
