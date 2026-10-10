# Portable Agent Forge contracts

Use this reference when the SIS schemas are unavailable. It defines a stable authoring shape, not a validated or deployed agent.

## Task Envelope

Use the Task Envelope groups `schemaVersion`, `id`, `kind: agent`, `objective`, `deliverables`, `context`, `stakes`, `autonomy`, `constraints`, `evidencePolicy`, `permissions`, `capabilitySelection`, `tasteProfile`, `completionTests`, and `deployment.targets`. Make tool, memory, external-write, destructive-action, budget, approval, and termination limits explicit.

## Agent Pack

Return one object with:

- `schemaVersion`, `kind: agent`, matching `id`, semantic `version`, and `description`;
- `necessity.rationale` plus booleans for `persistentDecisionRights`, `distinctMemoryScope`, `constrainedToolBoundary`, `ownershipTransfer`, and `ongoingTrigger`; at least one must be true;
- nonempty `decisionRights` and existing `skills`;
- `toolPolicy.allow` and `toolPolicy.deny`;
- `memoryContract.read`, `memoryContract.write`, and `retention` (`turn`, `session`, or `durable`);
- `handoffs` with `when` and `target`;
- `termination.conditions` and a hard `maxTurns` ceiling;
- requested `deployment.targets` only.

Keep decision rights and permissions within the envelope. In portable mode return `runtimeStatus: pending-runtime`; do not invent a registered agent id, compiled path, live schedule, deployment, or Evidence Receipt.
