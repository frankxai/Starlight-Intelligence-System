# /so Command

Starlight Orchestrator dispatch surface.

Load `skills/orchestration/cli-tool-router.md` and `skills/orchestration/agent-handoff-packet.md` when fanout or a durable packet is needed.

Use `/so` for tasks that need decomposition, multi-CLI routing, repo-specific wrappers, image generation routing, or a durable handoff packet.

Behavior:

1. Classify the task.
2. Pick the smallest adequate lane.
3. Execute directly only when the current surface has the right tool and permission.
4. Otherwise emit a handoff packet with command/tool, repo, context, constraints, and verification.

Guardrails:

- Do not route `~/Business` through dangerous autonomous wrappers.
- Do not claim another laptop is configured without synced evidence or fresh verification.
- Use native image tools for image requests unless the user explicitly asks for a text CLI.
