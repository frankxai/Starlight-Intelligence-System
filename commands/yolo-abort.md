---
description: Immediate halt of /yolo Hive session mid-action — partial state saved, in-flight git operations rolled back where possible, audit log finalized with abort flag.
substrate-tier: false
---

# /yolo-abort — Immediate Halt

Kill switch. Use when /yolo is mid-action and you need to stop NOW. Cleaner than Ctrl-C because it saves partial state and runs the safe-rollback path.

## Halt sequence

1. **Halt in-flight action** — if a Bash command is running, signal interrupt; if an Edit/Write is pending, drop the change.

2. **Roll back in-flight git where reversible**:
   - `git restore --staged .` if files were staged but not committed
   - `git reset HEAD~1 --soft` if a commit just landed but no push happened
   - Do NOT force-push to undo an already-pushed commit (per spec §7.1 NEVER rules) — record as drift instead

3. **Audit log finalize with abort flag**:
   ```json
   {"event": "session-abort", "ts": "<ISO>", "reason": "<from user or 'unspecified'>",
    "in_flight_action": "<from last audit line>",
    "rollback_status": "<success | partial | drift-recorded>"}
   ```

4. **Drift event recording**: if rollback was partial (e.g., commit was already pushed), write entry to `memory/_audit/yolo/_drift.jsonl` so next session-open surfaces it.

5. **Operational vault note**: append abort entry with timestamp + reason + rollback status. Strategic vault is NOT touched on abort — strategic-class decisions require a clean ship.

6. **Phase-in counter NOT incremented** on abort — aborted sessions don't count toward the 3-session phase-in unlock review.

## Output

Final message: abort reason + rollback summary + drift flag count + path to audit log file + any operator follow-up actions.

---

**Built on SIP** · `/yolo-abort` · v1.0.0
