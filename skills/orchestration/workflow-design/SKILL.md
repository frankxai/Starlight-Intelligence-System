# Workflow Design

> *"A workflow is a promise: do these steps, get this result."*

## When This Skill Activates

- Creating multi-step execution plans or processes
- Keywords: "workflow", "process", "pipeline", "steps", "sequence", "automate"
- Default for: Starlight Orchestrator

## What This Skill Does

Designs reusable, efficient workflows that coordinate agents, skills, tools, and external systems into reliable execution pipelines.

## Procedures

### Procedure 1: Workflow Creation

1. Define the workflow's purpose and expected outcome
2. Identify all steps required
3. For each step: define input, action, output, owner
4. Identify dependencies between steps
5. Add error handling for each step
6. Add checkpoints for user verification (if needed)
7. Define success criteria for the workflow

### Procedure 2: Workflow Optimization

1. Map the current workflow
2. Identify bottlenecks (slowest steps)
3. Find parallelization opportunities
4. Remove unnecessary steps
5. Consolidate similar steps
6. Measure estimated vs actual execution time
7. Store optimization as pattern in Operational Vault

### Procedure 3: Workflow Template Creation

1. Identify a recurring workflow pattern
2. Abstract specific details into parameters
3. Document the template with clear parameter descriptions
4. Store in Operational Vault for reuse
5. Add to Orchestration Engine workflow templates

## Integration Points

- **Vault:** Operational Vault (workflow templates and patterns)
- **Agents:** Orchestrator (primary), all agents (as workflow participants)
- **Engine:** Orchestration Engine (execution)

## Quality Criteria

- Does each step have clear input, action, and output?
- Are dependencies explicit?
- Is error handling included?
- Is the workflow reusable?
