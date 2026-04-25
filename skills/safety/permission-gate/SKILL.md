# Permission Gate

> Every mutation request passes through this gate. No Claw bypasses it.

## When This Skill Activates

- Any Claw attempts to write files, execute shell commands, or export data
- Keywords: "write", "move", "delete", "execute", "export", "send", "upload"
- Always active when Sentinel Claw is running
- Default for: Starlight Sentinel

## What This Skill Does

Evaluates permission requests from Claws against their declared permission surface in `CLAW.md`, the user's workspace contract, and the active safety posture. Issues a programmatic APPROVE or DENY with logged reasoning.

## Procedures

### Procedure 1: Permission Evaluation

1. Receive permission request: `{ claw_id, action_type, target, declared_reason }`
2. Load the requesting Claw's `CLAW.md` permission block
3. Check: is the requested action within the Claw's declared `permissions.*` surface?
4. Check: is the target path within the declared workspace?
5. Check: does the Claw's `mutation_default` allow this action without explicit approval?
6. If `mutation_default: false` → escalate to Procedure 2 (Mutation Approval Request)
7. If within permissions + `mutation_default: true` → APPROVE, log, return
8. If outside permissions → DENY, log reason, return

### Procedure 2: Permission Boundary Violation

1. Action requested is outside declared permission surface
2. Log violation: `{ timestamp, claw_id, requested_action, declared_surface, verdict: DENY }`
3. Present violation to user in plain language
4. Offer: "Update Claw contract to include this permission?" or "Proceed as one-time exception?"
5. Never auto-approve boundary violations

### Procedure 3: Permission Log Write

1. Every decision (APPROVE or DENY) writes to `~/.starlight/logs/permission.jsonl`
2. Entry includes: timestamp, claw_id, action_type, target (sanitized), decision, reason
3. Log is append-only — no entry is ever modified or deleted

## Integration Points

- **Vaults:** Reads Wisdom vault for security principles
- **Agents:** Primary agent is Starlight Sentinel
- **Claws:** Called by every Claw with `requires_sentinel: true`
- **Skills:** Composes with `mutation-approval` for interactive approval flows

## Quality Criteria

- Every mutation is logged before it executes
- Boundary violations are surfaced to the user, never silently resolved
- DENY decisions include a human-readable reason
- Log entries are parseable JSON (not freeform text)
