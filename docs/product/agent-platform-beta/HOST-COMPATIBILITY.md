# Host compatibility contract v0.1

`planned` is not `verified`. This matrix is an acceptance checklist, not a statement of production support.

| Host | Source projection | Tool enforcement | Local beta action | Cloud claim |
| --- | --- | --- | --- | --- |
| Claude Code | `.claude/agents/<id>.md` from Foundry | `tools` frontmatter plus host policy; verify actual behavior | Preview and explicit repo-scoped install candidate | Committed repo files may be available in cloud sessions; exercise before claiming support |
| Codex | Agent Skills / repo instructions, host-specific | Repo instructions alone do not enforce a tools allowlist | Discovery and preview only until a supported permission adapter passes tests | Unsupported until exercised |
| GitHub Copilot | Agent profile/skill projection | Host profile and repository policy | Future adapter | Unsupported until exercised |
| Claude Managed Agents / Agents API | Versioned managed configuration | Host API and sandbox policy | Future adapter with explicit credentials | Unsupported in this beta |

Every host adapter needs a fixture for discovery, exact bytes, tool denial, context budget, interrupted install, uninstall, and a fresh session. Live tests must report model/provider, region, cost, and retention boundary. Never promise cross-host parity from syntactically valid files alone.
