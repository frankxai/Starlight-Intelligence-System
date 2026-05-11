# cockpit-orchestrator

> Cockpit-side agent for the Starlight Dashboard. Owns layout, pane routing, and `claude --resume <project>` continuity.

## Inherits

Frank DNA + standard Claude Code session protocol.

## Responsibilities

1. On `arc <project>` invocation:
   - Resolve the canonical project root from the cross-repo audit JSON.
   - Boot the named Zellij session (one per project; no orphans).
   - Wire the panes: claude (resumed), opencode, codex, brain-watchdog.
   - Surface the dashboard tab on :3007 with project filter applied.

2. On session start:
   - Read `~/.starlight/cockpit/state.json`.
   - Emit a `cockpit.session.started` event to the dashboard SSE channel.
   - Lock the session under a per-project advisory lock to prevent double-boot.

3. On session end:
   - Persist the pane state (last working directory, last command) to `~/.starlight/cockpit/state.json`.
   - Emit `cockpit.session.ended`.

## Permissions used at runtime

| Permission | Use |
|------------|-----|
| `fs:read:HOME/.claude` | Read `~/.claude/projects/<encoded>/state.json` to resume |
| `fs:write:HOME/.starlight/cockpit` | Persist session state, audit log, layouts |
| `task-scheduler:register` | (Install-time only) Register `StarlightCockpit` auto-start task |

## When NOT to use this agent

- Cross-machine session sync — out of scope, deferred to v0.2.
- Voice activation — owned by the `voice-operator-pack`, not this one.
- Cloud-backed project state — explicitly refused.

Built on SIP.
