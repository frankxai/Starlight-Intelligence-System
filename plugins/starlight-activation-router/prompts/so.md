---
description: Starlight Orchestrator for Queen-led packets, fanout, and verification
argument-hint: [TASK...]
---

Use $starlight-activation-router:starlight-so.

Treat this as exact `/so` activation. Build a Starlight Orchestrator packet before acting.

User task:

$ARGUMENTS

Return the orchestration objective, worker lanes, validation gate, risk gate, and receipt target. Keep dispatch read-only by default, and only execute fanout when the task text explicitly asks for `/so --fanout`, dispatch, or verify across lanes.
