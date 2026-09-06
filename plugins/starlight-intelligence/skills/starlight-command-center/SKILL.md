---
name: starlight-command-center
description: Inspect a venture portfolio, identify operating pressure, and render a Starlight command center when the user asks for status, priorities, risks, or a visual operating view.
---

# Starlight Command Center

Use the MCP tools as a decoupled data-to-render flow.

1. Call `get_portfolio_snapshot`. Narrow by venture only when the user names one.
2. Interpret the returned state before rendering. Distinguish evidence from inference and surface the smallest set of constraints that could change the portfolio outcome.
3. Call `render_command_center` with the same `venture_ids` and `include_closed` filters. The server re-reads authoritative data for rendering; caller snapshots are ignored. If its revision changed since your analysis, inspect the newer state before drawing conclusions.
4. Lead the response with the portfolio posture, then the binding constraint, then the next irreversible decision.

Do not create or transition work during a status request. Do not infer completion from prose, activity, or missing evidence. When the snapshot is stale or internally inconsistent, state that explicitly instead of smoothing it over.
