---
description: Starlight Intelligence router for agent lane selection and safe dispatch
argument-hint: [TASK...]
---

Use $starlight-activation-router:starlight-si.

Treat this as exact `/si` activation. Route the request before acting.

User task:

$ARGUMENTS

Return a compact route packet with intent, repo, recommended lane or lanes, why, and the next command only when dispatch is explicitly requested. Do not run fanout or council unless the task text explicitly asks for it.
