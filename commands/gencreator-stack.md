---
description: Cross-brand stack catalog. Verbs — audit (constellation) · scaffold (drop STACK.md) · assign (bind tiers) · diff (surface drift). Substrate-tier only when editing Starlight's own STACK.md; otherwise vertical-tier.
substrate-tier: false
auto-board-on-substrate: true
---

# /gencreator-stack — Cross-Brand Stack Catalog + Drift Sentinel

Invoke the `orchestration/gencreator-stack` skill. Default agent: `starlight-architect`.

## Usage

```
/gencreator-stack audit
/gencreator-stack scaffold <repo-path>
/gencreator-stack assign <repo-path>
/gencreator-stack diff
```

If no verb is supplied, default to `audit`.

## Behavior

1. **Parse verb.** One of `audit`, `scaffold`, `assign`, `diff`.
2. **Run the underlying script** via Bash:
   ```bash
   python /sessions/<session>/mnt/Starlight-Intelligence-System/skills/orchestration/gencreator-stack/scripts/stack.py <verb> [--repo <path>]
   ```
   (Adjust the path prefix per the active session mount.)
3. **Read and summarize** the generated artifact (`context/stack-constellation.md` for audit, `context/stack-drift-<ISO>.md` for diff) inline. For `diff`, name the top 3 drift sources by severity and report the GREEN / YELLOW / RED counts.
4. **For `scaffold`:** confirm target repo path via `AskUserQuestion` if ambiguous. Refuse to overwrite without explicit Frank-ack (`--force`).
5. **For `assign`:** read the target repo's `STACK.md`, walk Frank through each of the five tiers via `AskUserQuestion`, write back with a timestamped change-log entry. Do not edit the markdown table by hand — use the prompt loop.

## Substrate gate

Editing Starlight Intelligence System's own `STACK.md` (which defines the universal IS taxonomy) is substrate-tier work. In that one case only, auto-invoke `/starlight-board` before commit. All other repos are vertical-tier — commit freely.

## Scheduled cadence

`diff` runs weekly via scheduled task at **Sun 08:30 UTC** (before `/vault-atlas` at 08:45). If exit code is non-zero (any RED status), the scheduler appends a `stack-drift-alert` Memory Bus atom for Monday cockpit surfacing.

## Composes with

- `orchestration/gencreator-stack` — the skill itself (full spec lives there)
- `integration/repo-bridge` — when a drift fix needs cross-repo coordination
- `intelligence/decision-framework` — when `assign` faces a contested tool binding
- `vision/voice-anti-slop` — when the generated STACK.md prose must pass voice gate
- `/starlight-board` — substrate gate for Starlight's own STACK.md only

## When NOT to use

- Single-repo architecture decision → `engineering:architecture` (ADR pattern)
- Spawning a new domain vertical → `/spawn-domain-stack` + `integration/domain-stack-architecture`
- Per-repo MCP debugging → use the repo's own tools, not this catalog
