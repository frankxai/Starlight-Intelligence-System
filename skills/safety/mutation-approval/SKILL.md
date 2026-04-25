# Mutation Approval

> Plans are free. Changes cost a confirmation. That's the contract.

## When This Skill Activates

- Any Claw with `mutation_default: false` is about to execute a file operation
- A destructive or irreversible operation is about to run (delete, overwrite, move)
- Keywords: "move", "delete", "overwrite", "rename", "apply changes", "execute plan"
- Default for: Starlight Sentinel
- Activated by: Reclamation Claw, Bootstrap Claw, Memory Claw (on decay), Architect Claw

## What This Skill Does

Intercepts mutations before they execute. Presents a clear human-readable summary of what will change, requires explicit confirmation, records the approval, and passes control back to the requesting Claw. No mutation is silent. No mutation is irreversible without a logged confirmation.

## Procedures

### Procedure 1: Pre-Mutation Briefing

1. Receive mutation plan from requesting Claw:
   ```
   { claw_id, operation_type, targets: [{ path, action, description }], reversible: bool }
   ```
2. Render a human-readable summary:
   ```
   Reclamation Claw wants to make 14 changes:
   - Move 8 files from ~/Documents/old/ to ~/Documents/projects/
   - Move 3 files to ~/Documents/archive/
   - Import 3 items into SIS vaults

   Reversible: Yes (move log will be saved)
   Type "I confirm" to proceed, or "cancel" to abort.
   ```
3. Wait for user response — no timeout, no auto-proceed
4. If "I confirm" (case-insensitive): log approval, return APPROVED
5. If anything else: log cancellation, return DENIED

### Procedure 2: Partial Approval

1. User wants to approve some operations but not others
2. Present individual operations for line-by-line approval
3. Mark each as APPROVED or SKIPPED
4. Return approved subset to Claw for execution
5. Log all decisions

### Procedure 3: Irreversible Operation Gate

For operations flagged `reversible: false` (e.g., permanent deletes):

1. Add extra confirmation layer:
   ```
   ⚠️  This action cannot be undone.
   Memory Claw wants to permanently delete 4 archived vault entries.

   Type the exact phrase "delete permanently" to confirm, or "cancel" to abort.
   ```
2. Accept only the exact confirmation phrase
3. Log with full entry content in the audit trail before executing

### Procedure 4: Batch Rollback

If a mutation batch fails mid-execution:

1. Halt remaining operations
2. Execute rollback for completed operations in reverse order
3. Report: what succeeded, what failed, what was rolled back
4. Write full rollback log to `~/.starlight/logs/mutation-rollback.jsonl`

## Integration Points

- **Vaults:** No direct vault access — operates on mutation proposals only
- **Agents:** Starlight Sentinel (primary)
- **Skills:** Composes with `permission-gate` (authorization check runs first)
- **Claws:** Reclamation (file moves), Bootstrap (directory creation), Memory (decay), Architect (scaffolding)

## Quality Criteria

- User always reads a plain-language summary before confirming
- Confirmation phrase must be explicit — no ambiguous Y/n prompts for destructive ops
- Every approval is logged with timestamp, claw, operation count, and user phrase
- Rollback is always attempted on failure — never leave a half-executed plan
