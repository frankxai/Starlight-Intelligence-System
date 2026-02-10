# Parallel Execution

> *"Why do one thing when you can do three?"*

## When This Skill Activates

- Running multiple independent tasks concurrently
- Keywords: "parallel", "concurrent", "simultaneously", "batch"
- Default for: Starlight Orchestrator

## What This Skill Does

Manages parallel execution of independent tasks across agents, tools, and systems. Ensures thread safety, proper result collection, and efficient resource usage.

## Procedures

### Procedure 1: Parallelization Analysis

1. List all tasks to be executed
2. Build dependency graph
3. Identify independent tasks (no dependencies on each other)
4. Group independent tasks for parallel execution
5. Sequence dependent tasks after their prerequisites
6. Calculate resource requirements for parallel batch

### Procedure 2: Parallel Dispatch

1. Confirm all parallel tasks are truly independent
2. Limit concurrent agents to 3 (token budget constraint)
3. Dispatch tasks to assigned agents simultaneously
4. Monitor all tasks for completion or failure
5. Collect results as each task completes
6. Handle failures without blocking other parallel tasks

### Procedure 3: Result Collection

1. Wait for all parallel tasks to complete
2. Collect all results
3. Check for conflicts in results
4. If conflicts: resolve using Synthesis Protocol
5. Merge into unified output
6. Report any failed tasks separately

## Integration Points

- **Vault:** Operational Vault (execution metrics)
- **Agents:** Orchestrator (primary), up to 3 concurrent agents
- **Engine:** Orchestration Engine (parallel pattern)

## Quality Criteria

- Were only truly independent tasks run in parallel?
- Were results properly collected and merged?
- Were failures handled gracefully?
- Was the concurrent agent limit respected?
