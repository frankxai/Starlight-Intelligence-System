---
description: Graceful close of /yolo Hive session — persists operational + strategic vault writes, finalizes audit log, commits Memory Bus session-summary atom.
substrate-tier: false
---

# /yolo-exit — Graceful Session Close

Close the current /yolo session cleanly. Run only when no action is in flight (if one is, use `/yolo-abort` instead).

## Persistence chain

1. **Operational vault append** (`memory/vaults/operational-vault.md`):
   - Session timestamp + duration
   - Moves picked + outcomes
   - Repos touched
   - $ spent
   - Drift flags surfaced

2. **Strategic vault append** (`memory/vaults/strategic-vault.md`) — only if any move was strategic-class per spec §8.4:
   - New repo creation (vertical spawn, domain sub-stack)
   - New business decision (entity, revenue stream, alliance)
   - Tax / legal-class action
   - Substrate amendment
   - Brand-register decision

3. **Memory Bus session-summary atom** via `mcp__memory-bus__memory_commit`:
   ```json
   {
     "kind": "yolo-session-summary",
     "session_id": "<from audit log>",
     "moves": [...],
     "duration_ms": ...,
     "ts": "<ISO>"
   }
   ```

4. **Cross-Repo Indexer re-index** of session audit log (idempotent via sidecar state file).

5. **Audit log finalize**: append `{"event": "session-close", "ts": "..."}` and checksum the file.

6. **Drift detection (post-session pass)**: diff committed-this-session against audit-log proposed actions. Any committed change not in audit log → append to `memory/_audit/yolo/_drift.jsonl` for next session to surface.

7. **Phase-in counter**: increment `private/yolo-scope.json::phase_in.session_count`. If `session_count >= 3 && unlock_review_passed === false`, mark `pending_phase_in_review: true` so the next `/yolo` opens with a Phase-In Review prompt (spec §14.1).

8. **Monthly roll-up trigger**: if this is the first /yolo session of the calendar month closing (check operational vault for prior-month entries), produce the monthly digest per spec §8.3 (sessions count, $ spent, moves shipped, drift events, board verdicts, repos most-touched) and append to operational vault.

## Output

Final message: session ID + duration + move count + $ spent + persistence chain status (each step ✓ or ✗) + drift flag count + phase-in counter status.

---

**Built on SIP** · `/yolo-exit` · v1.0.0
