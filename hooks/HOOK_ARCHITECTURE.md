# Starlight Hook Architecture

> *"Hooks are the nervous system's reflexes - automatic responses to system events."*

---

## Overview

Starlight Hooks are lifecycle callbacks that fire at specific points during system operations. They enable automatic behaviors like context loading, vault writes, error handling, and cross-system synchronization without explicit invocation.

---

## Hook Categories

### Pre-Task Hooks
Fire before any task begins execution.

| Hook | Trigger | Action |
|------|---------|--------|
| `context-load` | Any task starts | Assemble relevant context from vaults and notes |
| `skill-activate` | Any task starts | Auto-activate matching skills from skill-rules.json |
| `session-restore` | New session begins | Restore context from most recent Session Note |
| `state-check` | Any task starts | Verify system health before proceeding |

### Post-Task Hooks
Fire after task completion.

| Hook | Trigger | Action |
|------|---------|--------|
| `vault-write` | Task produces insight/decision | Store results in appropriate vault |
| `note-create` | Significant work completed | Create appropriate note type |
| `transmission-send` | Cross-system relevant result | Send transmission to relevant channels |
| `metrics-update` | Any task completes | Update Operational Vault with metrics |

### On-Error Hooks
Fire when errors or failures occur.

| Hook | Trigger | Action |
|------|---------|--------|
| `error-log` | Any error | Log error details in Operational Vault |
| `fallback-route` | Agent fails | Route to backup agent or escalate to Prime |
| `context-save` | Critical error | Emergency context preservation |
| `alert-send` | Critical error | Send Critical transmission |

### On-Sync Hooks
Fire during ecosystem synchronization.

| Hook | Trigger | Action |
|------|---------|--------|
| `channel-check` | Sync event | Check all channels for new transmissions |
| `context-refresh` | Sync event | Update repo context files |
| `state-sync` | Sync event | Synchronize ecosystem state |
| `consolidation-check` | Sync event | Check if memory consolidation is needed |

---

## Hook Execution Order

```
PRE-TASK HOOKS (sequential)
  1. state-check
  2. session-restore (if new session)
  3. context-load
  4. skill-activate

TASK EXECUTION

POST-TASK HOOKS (can be parallel)
  1. vault-write (if applicable)
  2. note-create (if applicable)
  3. transmission-send (if applicable)
  4. metrics-update

ON-ERROR (replaces post-task on failure)
  1. error-log
  2. context-save
  3. fallback-route OR alert-send
```

---

## Hook Configuration

Hooks are configured in `hooks.json` with the ability to enable/disable individual hooks and set conditions.

---

## Custom Hooks

New hooks can be added by:

1. Defining the hook in `hooks.json`
2. Specifying trigger condition
3. Specifying action (which skill/agent to invoke)
4. Setting priority (determines execution order within category)

---

*"Good hooks are invisible. You only notice them when they're missing."*
