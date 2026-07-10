---
name: starlight-si
description: Codex-native Starlight Intelligence /si router for choosing local agent lanes, building handoff packets, and running explicit read-only fanout or council dispatch across Codex, Claude, Grok, Antigravity, OpenCode, DeepAgent, and image tools. Use when prompts mention /si, the installed /si prompt shortcut, mobile alias si:, starlight si, route, dispatch, fanout, council, which agent/tool, local CLI lanes, or Starlight multi-agent orchestration.
---

# Starlight SI

Use this skill for Codex-native `/si` behavior: lane selection, dispatch packet design, explicit fanout/council execution, and handoffs between Starlight agent wrappers.

When the local prompt shortcut is installed, `/si` expands into this skill. On mobile or remote ChatGPT surfaces where slash commands are unavailable, treat `si:` or `starlight si` at the start of a prompt as `/si`.

## Operating Rules

1. Read repo-local `AGENTS.md` before editing or dispatching.
2. Route first. Produce a compact lane recommendation or dispatch packet before running any cross-agent action.
3. Do not launch fanout from ambient routing or prompt shortcuts. Fanout requires explicit wording such as `/si fanout`, `run fanout`, `dispatch`, `council`, or `smoke test`.
4. Keep default dispatch read-only unless Frank asks for implementation.
5. Save or report receipts for any fanout/council run, including command, repo, lanes, and output path.
6. For mobile prompts, keep output compact and command-ready. Mobile can steer the connected host, but local shell execution still happens on that host.
7. If the request wants a swarm, route to the Starlight Swarm lane and require a coordinator, worker inputs, expected artifacts, stop conditions, evidence, and handoff format before execution.

## Lane Defaults

- Codex: repo edits, tests, validation, installs, and implementation.
- Claude: long-form reasoning, docs, planning, and large context review.
- Grok: fast external critique, media routing, and alternate review.
- Antigravity: high-autonomy repo/task runs through existing Starlight wrappers.
- DeepAgent/OpenCode: specialized repo execution when already configured.
- Motion/image tools: visual, media, animation, or design-polish work.

## Safe Commands

Prefer existing Starlight wrappers and scripts:

```powershell
pwsh "$HOME\Starlight-Intelligence-System\scripts\si-dispatch.ps1" -Repo . -Task "<task>" -Json
pwsh "$HOME\Starlight-Intelligence-System\scripts\si-council.ps1" -Mode audit -Repo . -Json
Invoke-SiFanout -Task "<task>" -RepoKey sis -Lanes codex,grok -Json
Invoke-SiCouncil -Mode audit -RepoKey sis -Json
```

For a dry route without execution, return:

```json
{
  "intent": "audit|implement|design|research|deploy|ops",
  "repo": "detected repo",
  "lanes": ["codex"],
  "readOnly": true,
  "why": "short reason",
  "nextCommand": "only if explicit dispatch was requested"
}
```

## Verification

For implementation work, run local fast checks first. For Vercel-connected web apps, prefer preview verification before production promotion. Do not leave local dev servers running.
