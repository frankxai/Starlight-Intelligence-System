# Starlight Orchestrator / Queen Foundation

Status: v0.1 local machine foundation
Date: 2026-06-17

## Doctrine

Starlight Orchestrator is the master routing layer in SIS. Starlight Queen is the high-autonomy coordinating persona that advances work, evaluates reports, and routes workers. AO is a replaceable execution substrate, not the sovereign identity.

The system should optimize for massive action with strong boundaries:

- high autonomy for reversible work
- strict gates for irreversible work
- durable memory through SIS
- auditability through reports, branches, and SIP provenance
- least privilege across CLIs and MCP servers

## Foundation Stack

```text
SIP
  -> SIS memory and governance
    -> Starlight Orchestrator / Queen
      -> AO process runtime
        -> Claude / Codex / Gemini / Grok / OpenCode / Antigravity
      -> report ingestion
      -> evaluator and sentinel gates
      -> SIS memory updates
```

## Role Boundaries

| Layer | Owns | Must Not Own |
| --- | --- | --- |
| SIS | memory, SIP, attestation, taxonomy, governance | worker subprocess control |
| Starlight Orchestrator | routing, policy, escalation, evaluation | direct unchecked execution |
| Starlight Queen | continuous loop, reports, next prompts, stream coordination | irreversible human decisions |
| AO | process runtime, worktrees, dashboard, session lifecycle | memory truth or strategy truth |
| Workers | scoped implementation/research/media tasks | cross-stream authority or final approval |

## Required Gates

Autonomous work may branch, edit, test, report, and draft. It may not deploy, publish, merge, spend, delete broadly, change secrets, or send external messages without human approval.

Every task above trivial risk should produce a report with:

- task id
- agent
- repo
- branch
- files changed
- commands run
- tests
- risks
- SIS memory updates needed
- next prompt
- evidence

## Security Baseline

- Least privilege by default.
- No token passthrough across MCP boundaries.
- Exact command visibility for local MCP server installs.
- Scope-minimized MCP tools.
- Worktree isolation before edits.
- Protected-branch / PR review before merge.
- Deterministic checks before model review.
- Fail closed on missing policy, malformed reports, unknown permissions, or unexpected secrets.

## Local Machine Receipts

On `STARLIGHT` as of 2026-06-17:

- AO dashboard is running at `http://127.0.0.1:4200`.
- `StarlightFleetSupervisor` Windows Scheduled Task exists.
- AO config uses `runtime: process`.
- `zellij` and `tmux` are optional visual/runtime layers, not requirements.
- `mcp-doctor audit --quick` runs.
- `arco status` reports AO daemon running.

## Best-Practice Sources

- MCP security best practices: https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices
- OWASP MCP Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html
- GitHub Copilot coding agent risks/mitigations: https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations
- Claude Code security: https://code.claude.com/docs/en/security
- Codex Security: https://developers.openai.com/codex/security
