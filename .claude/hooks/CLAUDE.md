# Claude Code Hooks Configuration (Upgraded)

Portable / multi-harness hooks system (claude/codex/gemini/agy/grok).

## lib/hook-env.sh
Central portable env:
- `detect_harness()` → HARNESS=claude|codex|gemini|agy|grok|unknown
- Portable PROJECT_ROOT (git/env/cwd), AI_SESSIONS_LOG (auto WSL /mnt/c or $HOME/docs)
- GLOBAL_*_DIR per-harness (with .claude compat)
- `log_hook_activation`, `handle_precompact`, `handle_notification`
- Excellence wiring (calls excellence-hook.sh)

Source it: `source "$(dirname "$0")/lib/hook-env.sh"`

## Available Hooks (agnostic + ACOS ports)

| Hook | Purpose | Trigger(s) | Notes |
|------|---------|------------|-------|
| session-logger.sh | Global sessions to AI_GLOBAL_SESSIONS.md | UserPromptSubmit | Uses $AI_SESSIONS_LOG + $HARNESS |
| skill-activation-prompt.sh | Auto skill/agent activation from rules | UserPromptSubmit | Updated paths via env; .js/.ts |
| file-link-tracker.sh | Track edits to ~/LINKS_TODAY.md + github links | PostToolUse | Json+env input, portable open on WSL |
| pre-commit.sh | Lint staged (eslint/prettier) + quality | Pre-commit / manual | Wires quality-gate |
| pre-compact.sh | PreCompact stub + delegate to gsd/ACOS | PreCompact | |
| notification.sh | Notification stub | Notification | |
| quality-gate.sh | ACOS ported quality (biome/prettier/gofmt/ruff) | Pre/PostToolUse (Edit) | Shim + .js |
| gsd-*.sh (context-monitor, workflow-guard, statusline) | ACOS GSD context/guard/status | PostToolUse/Status | Shims + .js |
| mcp-health-check.sh | ACOS MCP health | PostToolUse | Shim |
| excellence-hook.sh | Wires Frank DNA, gates, gstack note | Any (internal) | Called by env |

## Global Log Location (portable)
`AI_GLOBAL_SESSIONS` env or auto:
- WSL: `/mnt/c/Users/$WINUSER/docs/AI_GLOBAL_SESSIONS.md`
- Else: `$HOME/docs/AI_GLOBAL_SESSIONS.md`

Override: `export AI_GLOBAL_SESSIONS=/path/to/log.md`

## Multi-Harness Support
- Detection prioritizes runtime env vars then dirs/cmds.
- .claude/ paths used as compat layer for skills/hooks across harnesses.
- For Grok: also seed .grok/hooks/ + GROK.md (see ACOS install).
- Register in `~/.claude/settings.json` (or equiv .grok / .codex config).

## Settings Example (excerpt)
See `claude-code-hooks/settings-example.json` for full with PreCompact/Notification + ACOS ports.

## Usage
```bash
# Manual
~/.claude/hooks/session-logger.sh

# Install portable to project
cd claude-code-hooks && ./install.sh --portable
```

## Excellence
All hooks call `log_hook_activation` which invokes excellence-hook.sh (Frank DNA, read CLAUDE/AGENTS, verification/santa/qa/cso gates, repo-mastery, gstack for any UI).

God 99. Use gstack for UI verification.

---
Updated 2026-06-02 via hook upgrade task.
