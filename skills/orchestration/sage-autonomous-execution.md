---
name: orchestration/sage-autonomous-execution
description: Auto-activates SAGE autonomous goal execution loops for long-running /goal tasks, managing checkpointing, git rollback, context compression, and Sentinel audits.
---

# SAGE Autonomous Execution Skill

## Premise
When a user launches a long-running, multi-step `/goal` or request, the agent loop uses the **SAGE (Starlight Autonomous Goal Execution)** engine to track checklists, save checkpoints, compress context, and verify integrity via adversarial audits.

## Invariants
1. **Never declare victory early**: SAGE loops require an explicit local Sentinel audit check outputting `LGTM-SIS` before the agent can output `<!-- GOAL_COMPLETE -->`.
2. **Git Checkpointing**: Create a checkpoint branch (`sage/checkpoint-N`) before any code modification. If tests fail, run `starlight goal rollback` or equivalent to restore the workspace.
3. **Checklist Discipline**: Track every subtask status (`pending` -> `in-progress` -> `completed`) inside `.starlight/goal-state.json`.
4. **Context Compression**: When token count approaches 80% limits, extract patterns to Technical/Operational vaults, write strategic milestone summary, reset session history, and boot clean from the summary.

## Action Protocol
- **Init**: `starlight goal init "<intent>" --checklist="task1,task2..."`
- **Progress**: Update status with `starlight goal update <task-id> completed` and log with `starlight goal log "<message>"`.
- **Checkpoint**: Run `starlight goal checkpoint` before making edits.
- **Audit & Sentinel Check**: Run `starlight goal audit` (npm test + secret scanning).
- **Rollback**: Run `starlight goal rollback` if checks fail.
- **Compress**: Run `starlight goal compress --findings="..." --summary="..."` if approaching context limits.
