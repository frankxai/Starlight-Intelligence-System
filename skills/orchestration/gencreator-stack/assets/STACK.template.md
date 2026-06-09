# STACK — {{REPO_NAME}}

> Per-repo manifest of which AI surfaces, coding agents, MCPs, and browser space serve this repo. Owned by `orchestration/gencreator-stack`. Edit via `python skills/orchestration/gencreator-stack/scripts/stack.py assign --repo {{REPO_PATH}}` — do not edit the matrix by hand.

**Brand:** {{BRAND}}
**Role:** {{ROLE}} <!-- production | development | private | docs | oss -->
**Last assigned:** {{ISO_TIMESTAMP}}
**Substrate:** Starlight Intelligence System (always — non-negotiable)

---

## Tier matrix

| Tier | Binding | Notes |
|---|---|---|
| Substrate | Starlight (locked) | Persistent context, attestation, memory vaults |
| Reasoning | {{REASONING_PICK}} | Long-form thinking, research, project-scoped chat |
| Coding (primary) | {{CODING_PRIMARY}} | Main agent for code work in this repo |
| Coding (secondary) | {{CODING_SECONDARY}} | Parallel / overnight / UI loops — may be empty |
| Research browser | {{BROWSER_SPACE}} | Arc Space / Chrome+CIC / Comet / Opera Workspace |

## Native MCPs

List every MCP this repo is configured to use (matches `.mcp.json`):

- {{MCP_LIST}}

## Custom GPTs / Gems / Spaces tied to this repo

- {{ASSISTANTS_LIST}}

## Why these picks (one line each)

- Reasoning: {{REASONING_RATIONALE}}
- Coding: {{CODING_RATIONALE}}
- Browser: {{BROWSER_RATIONALE}}

## Cross-repo links

Other repos in this brand's constellation:
- {{SIBLING_REPOS}}

## Change log

| Date | Tier touched | Change | Reason |
|---|---|---|---|
| {{ISO_TIMESTAMP}} | initial | Scaffolded | First manifest |

---

**Built on SIP** · STACK.md v1 · managed by `gencreator-stack`
