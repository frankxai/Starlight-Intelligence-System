# Multi-Agent Coordination

> *"Many minds, one mission. Coordination is the multiplier."*

## When This Skill Activates

- Tasks requiring multiple agents to collaborate
- Keywords: "coordinate", "agents", "parallel", "team", "collaborate"
- Default for: Starlight Orchestrator

## What This Skill Does

Manages the coordination of multiple Starlight agents working on related tasks. Handles agent selection, task decomposition, dependency management, and result aggregation.

## Procedures

### Procedure 1: Agent Selection

1. Analyze the task for domain requirements
2. Match domains to agent expertise (see Agent Registry)
3. Assess if agents need to work in parallel or sequence
4. Calculate total token budget for all agents
5. Confirm agent selection is minimal (no unnecessary agents)
6. Brief each agent with their specific sub-task

### Procedure 2: Task Decomposition

1. Break the main task into discrete sub-tasks
2. For each sub-task, identify: owner agent, dependencies, expected output
3. Create dependency graph
4. Identify critical path
5. Optimize for parallel execution where possible
6. Set checkpoints for progress monitoring

### Procedure 3: Result Aggregation

1. Collect outputs from all agents
2. Check for conflicts or contradictions
3. Apply the Synthesis Protocol (see core/SYNTHESIS_PROTOCOL.md)
4. Merge into unified response
5. Ensure no agent's contribution is lost
6. Present coherent result to user

## Integration Points

- **Vault:** Operational Vault (coordination patterns)
- **Agents:** Orchestrator (primary), Prime (council mode)
- **Engine:** Orchestration Engine (core/ORCHESTRATION_ENGINE.md)

## Quality Criteria

- Were the minimum necessary agents used?
- Were dependencies correctly identified?
- Were parallel opportunities exploited?
- Was the final output coherent, not fragmented?
