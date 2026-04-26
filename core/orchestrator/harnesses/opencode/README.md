# OpenCode harness — Starlight Orchestrator

**Role:** Quick checks, research scratchpad, latency-bound queries. Free-tier (Groq Llama 4 Scout).

**Default for:** anything <30s round-trip, free-tier-acceptable, low-stakes routing decisions, research summaries with no side effects.

**System prompt:** brief and tactical. OpenCode is not used for substrate writes; it answers fast questions and feeds the result back to a higher-tier harness for any follow-on action.

**MCP scope:** none by default. OpenCode operates against text in/out; if structured data is needed, route to Claude Code primary.

**Allowlisted tools:** none. OpenCode is a thinking shortcut, not an executor.

**Escalation rules:**
- Anything OpenCode flags as ambiguous or > 30s of reasoning needed → route up to Sonnet (Claude Code) or Gemini.
- OpenCode never commits, never deploys, never touches secrets. If a session drifts toward those, abort and escalate.
- Cost dashboard: ≥50% of low-stakes routing should land here, not on a paid CLI. Tracked in `console/cost/` once Phase 2 ships.

**Status:** scaffolded — system prompt + Groq endpoint config land in Phase 1.
