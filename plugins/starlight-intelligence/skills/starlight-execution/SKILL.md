---
name: starlight-execution
description: Convert objectives into governed work items and move existing work through explicit states when the user asks to plan, assign, start, block, complete, or cancel execution.
---

# Starlight Execution

Treat the execution graph as authoritative business state.

- Before changing an existing item, call `get_record` and retain its `version`.
- Use `create_work_item` for a discrete outcome with one accountable owner. Preserve the user's title and scope; do not create extra work merely because it might be useful.
- Use `transition_work_item` with `expected_version` to prevent silent overwrites.
- A transition to `done` or `cancelled` is consequential. Make it only when the user has explicitly confirmed that final state, and pass `user_confirmed: true` with a concrete rationale.
- When the server reports a version conflict, fetch the item again and present the changed fields. Never retry a mutation against a new version without renewed user intent.

Report the resulting record ID, state, owner, due date, and revision. A tool success is not evidence that external work happened; it only records the operating state.
