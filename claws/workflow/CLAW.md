# SIS Workflow Claw

> Load, sequence, and execute IS workflow definitions. Bridges workflow specs to swarm execution, vault writes, and named output artifacts.

---

## Contract

```yaml
name: sis-workflow-claw
version: 0.1.0
purpose: Load the appropriate workflows/{is-name}/WORKFLOW.md for a task, execute steps sequentially or in parallel, invoke Hermes Claw for swarm steps, write outputs to vault atoms, and produce named artifacts per the workflow spec.
phase: 1

permissions:
  filesystem: read_write    # reads WORKFLOW.md, writes output artifacts
  sis_vaults: delegated     # Memory Claw executes vault atoms; Workflow Claw prepares packets
  shell: none
  network: none             # all external calls routed through Hermes Claw

inputs:
  - workflow_id (string: IS name or explicit workflow path, e.g. "business", "workflows/business/WORKFLOW.md")
  - task (string: natural language task or command driving the workflow)
  - step_filter (array: optional subset of steps to run, default: all)
  - execution_mode (enum: sequential | parallel | auto, default: auto)

outputs:
  - /workflow-runs/SESSION_ID/run-log.md
  - /workflow-runs/SESSION_ID/artifacts/   # named per workflow spec
  - Memory Claw vault atom packets

commands:
  - /workflow-run
  - /workflow-status
  - /workflow-list
  - /workflow-step

skills:
  requires:
    - safety/permission-gate
  activates:
    - orchestration/workflow-design
    - orchestration/hermes-swarm
    - orchestration/multi-agent-coordination
    - memory/vault-management
    - memory/knowledge-synthesis

mcp:
  required:
    - filesystem-mcp
    - sis-memory-mcp
  optional:
    - github-mcp

agents:
  primary: starlight-orchestrator
  supporting:
    - starlight-hermes
    - starlight-architect
    - starlight-sentinel

safety:
  mutation_default: false
  artifact_writes: session_scoped
  requires_sentinel: false    # Sentinel Claw invoked only for substrate-class workflows
```

---

## Identity

Workflow Claw is the execution layer that turns IS workflow definitions into real outcomes. It reads a `WORKFLOW.md` spec, sequences or parallelizes the steps, delegates swarm execution steps to Hermes Claw, accumulates outputs into named artifacts, and hands vault write packets to Memory Claw. It owns the run log and artifact directory; it does not own vault state.

---

## Capabilities

| Capability | What it does |
|-----------|-------------|
| **Workflow Loading** | Resolves `workflow_id` to `workflows/{id}/WORKFLOW.md`; validates schema |
| **Step Sequencing** | Reads step dependency graph; determines sequential vs parallel ordering |
| **Hermes Delegation** | For any step tagged `execution: swarm`, invokes Hermes Claw with step context |
| **Artifact Management** | Creates `artifacts/` directory per run; writes named outputs per workflow spec |
| **Vault Packet Assembly** | Packages step outputs into Memory Claw vault atom format |
| **Run Logging** | Appends timestamped step results to `run-log.md` throughout execution |
| **Step Filter Support** | Executes only specified steps; skips dependencies cleanly with status note |

---

## Execution Protocol

### Step 1: Workflow Resolution

```
1. Accept workflow_id (IS name, path, or command trigger)
2. Resolve to workflows/{is-name}/WORKFLOW.md
3. Parse workflow schema: steps, dependencies, artifacts, vault targets
4. Validate: required inputs present, referenced agents exist in registry
5. Report: workflow loaded, step count, estimated artifact count
```

### Step 2: Dependency Analysis

```
1. Build step DAG from workflow spec
2. Identify parallelizable step groups (no shared outputs, no dependency edges)
3. Identify critical path
4. Apply step_filter if provided
5. Output execution plan (steps, order, mode) — confirm before proceeding
```

### Step 3: Step Execution

```
For each step (or parallel group):
  - If execution: swarm → delegate to Hermes Claw (/hermes-swarm --task <step-task> --is <step-domains>)
  - If execution: local → run directly with primary agent
  - Collect step output
  - Append to run-log.md
  - Write named artifact if step produces one
  - Mark step: completed | failed | skipped
```

### Step 4: Artifact Assembly

```
1. Collect all step artifacts into /workflow-runs/SESSION_ID/artifacts/
2. Verify artifact completeness against workflow spec
3. Report any missing artifacts
4. Do NOT write to vaults — assemble vault packets only
```

### Step 5: Vault Handoff

```
1. Package step outputs as Memory Claw vault atom packets
2. Tag each packet: vault target, IS domain, workflow_id, session_id
3. Pass to Memory Claw for execution
4. Confirm vault write receipts; log to run-log.md
```

---

## Commands

| Command | Usage | What it does |
|---------|-------|-------------|
| `/workflow-run` | `--workflow <id> --task <str> [--steps <list>] [--mode sequential\|parallel\|auto]` | Execute a full workflow or subset of steps |
| `/workflow-status` | `[--session <id>]` | Show status of current or specified run |
| `/workflow-list` | `[--domain <is-name>]` | List all available workflows; optional domain filter |
| `/workflow-step` | `--workflow <id> --step <name>` | Execute a single named step in isolation |

---

## Integration Points

| Claw | Relationship |
|------|-------------|
| **Hermes Claw** | Receives delegation for all `execution: swarm` steps |
| **Memory Claw** | Receives vault atom packets after step execution |
| **Sentinel Claw** | Invoked for substrate-class or high-mutation workflows |
| **Architect Claw** | May trigger Workflow Claw for system design execution |
| **Genius Claw** | Workflow Claw executes multi-step genius excavation workflows |
| **OpenClaw Registry** | Registers available workflows; run status queryable externally |

---

## Quality Gates

1. **Schema validation** — workflow must pass schema check before any step executes.
2. **Dependency integrity** — no step runs before its dependencies complete.
3. **Artifact completeness** — workflow is not marked complete until all spec artifacts exist.
4. **Vault packet integrity** — each packet must include workflow_id, session_id, vault target.
5. **Run log continuity** — every step transition appended; log is the audit trail.

---

*Built on SIP · sis-workflow-claw v0.1.0 · MIT*
