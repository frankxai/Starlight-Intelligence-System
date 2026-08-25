---
name: orchestration-sage-autonomous-execution
description: "Auto-activates SAGE autonomous goal execution loops for long-running /goal tasks, managing checkpointing, git rollback, context compression, and Sentinel audits."
---

# SAGE Autonomous Goal Execution (SAGE Engine)

> *"Execute with relentless autonomy. Verify with adversarial rigor. Never declare victory without empirical proof."*

## When This Skill Activates

- Long-running autonomous tasks, overnight execution waves, or complex refactors triggered with `/goal` or `--yolo`.
- Keywords: "/goal", "autonomous", "overnight", "self-healing", "checkpoint", "rollback", "sentinel audit", "SAGE"
- Default for: Starlight Orchestrator, Starlight Sentinel, Sage

## What This Skill Does

Drives the **SAGE (Starlight Autonomous Goal Execution)** engine. Manages state serialization, deterministic git checkpointing, automated rollback on audit failure, dynamic context compression, and Sentinel test-suite verification.

## Core Invariants

1. **Anti-Premature Completion**: SAGE loops prohibit declaring completion until all verification tests pass green and Sentinel emits an explicit verification verdict.
2. **Deterministic Checkpointing**: Every mutation wave takes a git checkpoint (`sage/checkpoint-N` or stash/commit checkpoint) before executing changes.
3. **Automated Rollback on Test Failure**: If a change breaks tests or introduces lint/type errors that cannot be fixed within 2 attempts, automatically rollback to the last known good checkpoint.
4. **Context Window Guardian**: At 75% context capacity, extract learnings to `findings.md`, serialize goal state to `.starlight/goal-state.json`, compress context, and resume with a fresh context window.

## Procedures

### Procedure 1: Goal Initialization & Checklist Setup

1. **Analyze User Intent**: Break high-level goal into atomic, sequentially verifiable milestones.
2. **Initialize Goal State**:
   ```bash
   starlight goal init "<intent>" --checklist="task1,task2,task3..."
   ```
   Or write structured state to `.starlight/goal-state.json`:
   ```json
   {
     "goal": "<description>",
     "status": "in-progress",
     "active_task": 1,
     "tasks": [
       {"id": 1, "name": "Task 1", "status": "in-progress", "tests": ["test-cmd"]}
     ]
   }
   ```
3. **Establish Initial Git Checkpoint**: Record `HEAD` commit hash or create working branch.

### Procedure 2: Execution & Verification Loop

```
┌────────────────────────────────────────────────────────┐
│                   SAGE EXECUTION LOOP                  │
│                                                        │
│  [1. Checkpoint] → [2. Execute Edit] → [3. Verify Test]│
│         ▲                                    │         │
│         │                                    ▼         │
│   [5. Rollback]  ←── (Test Failed) ──── [4. Gate Check]│
│                                              │         │
│                                         (Test Passed)  │
│                                              ▼         │
│                                         [6. Next Task] │
└────────────────────────────────────────────────────────┘
```

1. **Take Checkpoint**: Run `starlight goal checkpoint` or create local commit checkpoint.
2. **Execute Surgical Change**: Implement code, config, or asset updates.
3. **Execute Automated Verification**: Run targeted unit tests, lints, and typechecks.
4. **Evaluate Result**:
   - *If Green*: Mark task completed (`starlight goal update <id> completed`), commit progress.
   - *If Red*: Attempt 1 targeted fix. If fix fails, execute rollback (`starlight goal rollback`) and re-evaluate approach.

### Procedure 3: Context Compression & Persistence

1. When context approaches limits or across task boundaries:
   - Append confirmed discoveries to `findings.md`.
   - Update goal state in `.starlight/goal-state.json`.
   - Commit decisions to Operational Vault (`memory/vaults/operational/`).
2. Wipe transient logs and resume execution with clean focus on the next pending checklist item.

### Procedure 4: Final Sentinel Audit & Completion Gating

1. Run full test suite across all touched files.
2. Run security & secret scan (ensure no private keys, secrets, or PII exposed).
3. Validate memory vault updates.
4. Once all gates pass green, output completion receipt:
   ```markdown
   ## SAGE Execution Complete
   - **Goal**: <summary>
   - **Tasks Completed**: <list>
   - **Verification**: All tests passed green (0 errors).
   - **Memory Updated**: Operational/Technical vaults updated.
   <!-- GOAL_COMPLETE -->
   ```

## Integration Points

- **Ledger**: AgentOps Ledger (`src/ledgers.ts`)
- **Vaults**: Operational Vault (execution logs), Technical Vault (validated patterns)
- **Harnesses**: Antigravity, Claude Code, Codex, Grok, OpenCode

## Quality Criteria

- Were all checklist items executed and validated without early termination?
- Were git checkpoints taken before risky modifications?
- Did automated test verification run after each change?
- Is context cleanly preserved across the entire execution life-cycle?
