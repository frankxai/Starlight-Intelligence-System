---
name: starlight-so
description: Codex-native Starlight /so orchestrator for Queen-enabled dispatch, durable packets, explicit fanout, verification plans, swarm loops, and multi-lane Starlight coordination. Use when prompts mention /so, the installed /so prompt shortcut, mobile alias so:, starlight so, Starlight Orchestrator, Queen role, orchestrator dispatch, Starlight Swarm, multi-agent routing, multi-lane dispatch, durable handoff packet, dispatch verification, or /so --fanout.
---

# Starlight SO

Use this skill for Codex-native `/so` behavior: Starlight Orchestrator dispatch with Queen posture, route/measure/learn/ratify/ledger thinking, durable packets, swarm-loop planning, and explicit multi-lane verification.

When the local prompt shortcut is installed, `/so` expands into this skill. On mobile or remote ChatGPT surfaces where slash commands are unavailable, treat `so:` or `starlight so` at the start of a prompt as `/so`.

## Operating Rules

1. Read repo-local `AGENTS.md` before editing or dispatching.
2. Packet first. Emit the plan, lanes, verification gates, and receipt target before execution.
3. Do not launch fanout from ambient routing or prompt shortcuts. Execution requires explicit wording such as `/so --fanout`, `run fanout`, `dispatch`, or `verify across lanes`.
4. Keep default dispatch read-only unless Frank asks for implementation.
5. For mobile prompts, keep responses compact and executable from the connected host.
6. For swarm work, route through a single coordinator and split workers by capability lane, repo boundary, validation evidence, and handoff format.

## Relationship To /si

- `/si` chooses the best local lane or tool.
- `/so` orchestrates a multi-step or multi-lane execution plan and verifies the outcome.
- If the task only needs one lane, route back to `$starlight-activation-router:starlight-si`.
- If the task needs creator/content operations, route to `$starlight-activation-router:acos-router`.
- If the task needs multi-agent worker waves, route to the installed Starlight Swarm skill and keep `/so` responsible for synthesis and risk decisions.

## Loop Design

Use this loop for non-trivial orchestration:

```text
ROUTE -> PACKET -> DISPATCH -> VERIFY -> SYNTHESIZE -> LEDGER
```

- ROUTE: choose the coordinator, lanes, repo boundaries, and whether execution is authorized.
- PACKET: give each worker input context, artifact target, allowed tools, stop condition, and handoff format.
- DISPATCH: run only when explicit wording authorizes fanout or cross-agent execution.
- VERIFY: collect tests, receipts, diffs, evals, or read-only audit evidence.
- SYNTHESIZE: one coordinator resolves conflicts and decides next action.
- LEDGER: update the durable work item or receipt path for cross-repo work.

## Safe Commands

Prefer existing Starlight scripts and explicit receipts:

```powershell
pwsh "$HOME\Starlight-Intelligence-System\scripts\si-dispatch.ps1" -Repo . -Task "<task>" -Json
pwsh "$HOME\Starlight-Intelligence-System\scripts\si-council.ps1" -Mode audit -Repo . -Json
Invoke-SiFanout -Task "<task>" -RepoKey sis -Lanes codex,grok -Json
Invoke-SiCouncil -Mode audit -RepoKey sis -Json
```

## Packet Shape

```json
{
  "command": "/so",
  "intent": "orchestrate|fanout|verify|packet|council",
  "repo": "detected repo",
  "lanes": ["codex"],
  "readOnly": true,
  "packet": "single-paragraph task packet",
  "verification": ["concrete check"],
  "receiptPath": "path if execution is requested"
}
```

## Output Standard

State the orchestration decision, the lanes, the verification gate, and whether execution is authorized by the prompt. Do not imply that a fanout ran unless a command actually ran.
