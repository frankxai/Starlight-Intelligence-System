# Gemini CLI harness — allowlisted tools

> Permission policy for Gemini CLI when operating as the Starlight Orchestrator long-context harness. Read this as an executable policy, not narrative — every tool listed here is allowed; every tool *not* listed requires explicit per-session unlock and is **default-denied** for the long-context role.

**Harness role:** long-context document grokking, modernization passes, large-repo summarization.
**Default load:** 1M-context jobs, multi-repo cross-references, codebase-wide refactor planning, cross-vertical canon reconciliation.
**Write posture:** READ-ONLY across substrate. Single allowed write surface: `core/orchestrator/intel/<date>-gemini-<topic>.md`.

---

## Tool allowlist

| Tool | Allowed | Use for | Constraint / rationale |
|---|---|---|---|
| `Read` | yes | All file reads — substrate, vaults, verticals, memory, board records, integrations, console, etc. | No constraint — long-context read is the core capability |
| `Glob` | yes | File-name pattern search across substrate | No constraint; use aggressively for breadth-first reading |
| `Grep` | yes | Content search across substrate; multi-line mode allowed | No constraint; use for cross-reference completeness |
| `WebFetch` | yes | External documentation, vendor canon, registry queries | When cross-referencing substrate against external standards (e.g. SIP spec at starlightintelligence.org/protocol) |
| `Write` | conditional | Only `core/orchestrator/intel/<date>-gemini-<topic>.md` summary + structural-diff outputs | Any other path → DENIED. This is the harness's single write surface. |
| `Skill` | yes (read-relevant skills only) | `iterative-retrieval`, `search-first`, `acos-meta`, `arcanea-meta`, `starlight-intelligence`, `superintelligence`, `skill-stocktake` | Auto-activation per `skills/skill-rules.json`; long-context-relevant skills only |
| `ToolSearch` | yes (read-only MCP discovery) | Discover MCP read-only tool schemas | When cross-system long-context work needs Linear/Notion/GitHub read access |

---

## Tool denylist (default-denied for long-context role)

| Tool | Denied | Reason |
|---|---|---|
| `Edit` | yes (denied) | Surgical edits route to Claude Code primary |
| `Bash` | yes (denied by default) | Per-session unlock for `git log` / `git diff` / `gh` read-only commands only; destructive operations always denied |
| `Task` (Agent dispatch) | yes (denied) | Long-context is single-headed; sub-agent dispatch routes through Claude Code primary |
| `NotebookEdit` | yes (denied) | No write surface beyond intel/ |
| `EnterWorktree` / `ExitWorktree` | yes (denied) | Worktrees imply pending writes; not long-context scope |
| `Monitor` | yes (denied by default) | Long-context turns are synchronous; background processes route to Claude Code primary |
| `WebSearch` | yes (denied by default) | Codex handles external research; Gemini works against the loaded substrate |

---

## Bash unlock — per-session, read-only commands only

When long-context work requires git or shell read access, the following Bash patterns become available. Anything outside this list requires explicit user approval for that single command.

| Pattern | Use for |
|---|---|
| `git log [...]` | Commit history breadth-read |
| `git diff [base]...[head]` | Cross-version structural diff |
| `git show <sha>` | Specific commit context |
| `git status` (no `-uall`) | Working tree state for context |
| `git ls-files` | Substrate path inventory |
| `gh repo view`, `gh pr list`, `gh pr view`, `gh pr diff`, `gh release list`, `gh release view` | Multi-repo read |
| `gh api <read-endpoint>` | Read-only GH API queries |
| `wc -l`, `find ... -type f` | Substrate-size inventory (rare; prefer Glob) |

Explicitly **denied** Bash patterns even under unlock:

- `rm`, `mv`, `cp` (any FS mutation)
- `git push`, `git commit`, `git add`, `git reset`, `git checkout` to non-current branch
- `npm install`, `npm publish`, `npm run`
- `gh pr create`, `gh pr merge`, `gh pr close`, `gh release create`
- Anything writing outside `core/orchestrator/intel/`
- Anything touching secrets

---

## Task-scoped MCP tools (read-only mirror)

| MCP server | Allowed when loaded | Use for | Hard boundary |
|---|---|---|---|
| `mcp__claude_ai_Linear__list_*` | Alliance / cycle reconciliation | Issue / cycle / project / comment reads across teams | Never `save_*` |
| `mcp__claude_ai_Linear__get_*` | Alliance / cycle reconciliation | Specific record reads | Same |
| `mcp__claude_ai_Notion__notion-fetch` | Cross-page pattern surfacing | Page / block reads | Never `notion-create-*` / `notion-update-*` |
| `mcp__claude_ai_Notion__notion-search` | Cross-page pattern surfacing | Workspace search | Same |
| `mcp__claude_ai_Slack__slack_search_*` | Comms history grokking | Cross-channel search | Never `slack_send_*`, `slack_create_*`, `slack_update_*` |
| `mcp__claude_ai_Slack__slack_read_*` | Comms history grokking | Channel / thread / canvas reads | Same |
| `mcp__claude_ai_Google_Drive__read_file_content` | Vault parity audit | Drive mirror reads | Never `create_file` |
| `mcp__claude_ai_Google_Drive__search_files` | Vault parity audit | Drive discovery | Same |
| `mcp__claude_ai_Google_Drive__list_recent_files` | Vault parity audit | Recent activity scan | Same |
| `mcp__claude_ai_Vercel__list_deployments` | Cross-deploy historical pattern | Deploy history breadth-read | Never `deploy_to_vercel` |
| `mcp__claude_ai_Vercel__list_projects` | Multi-project audit | Project inventory | Same |
| `mcp__claude_ai_Figma__get_metadata` | Cross-design audit | Design context across files | Never write tools |
| `mcp__claude_ai_Linear__search_documentation` | Linear docs grokking | Documentation search | None |

**Rule:** Any MCP tool whose name does not begin with `list_`, `get_`, `read_`, `search_`, `fetch`, `view`, or similar read-only verb is **default-denied** for the Gemini harness.

---

## Escalation rules — when the tool boundary is hit

**Want to write a fix:**
- Don't. Land the structural diff at `core/orchestrator/intel/<date>-gemini-<topic>.md`; Claude Code primary writes the fix.
- Exception: only the intel/ output file. There is no other exception.

**Find a contradiction across repos:**
- Route to `/luminor-board` before any reconciliation commit. Cross-repo contradictions are governance-tier; they get pre-pass. Surface to the board, not directly to Claude Code primary.

**Multi-repo refactor proposal lands:**
- Output as structural diff at `core/orchestrator/intel/`. Never ship the refactor; Claude Code primary implements what you scoped.

**Find a security or sovereignty concern in your read:**
- Route to Codex harness for adversary pressure-test, then `/openclaw-audit` if Codex confirms.

**Find vault-vs-derived divergence:**
- Vault wins (per `MASSIVE_ACTION_PLAN.md` § 5 architectural principle). Surface as intel file for Claude Code to reconcile (regenerate Mem0/Graphiti from vault, never the reverse).

**Need a destructive operation to verify a structural claim:**
- Don't run it. Surface the verification gap as an intel item; Claude Code primary runs the verification under primary's allowlist.

**Need a secret to test cross-system integration:**
- Don't request it. Gemini never touches secrets at this harness tier.

**Hit ambiguity on whether something is your scope:**
- Default to "scope it, don't ship it." You are the reader, not the writer.

**Latency-bound or low-stakes question lands here by mistake:**
- Route to OpenCode harness. Long-context is not the right tool for "yes / no / which-of-three" — it is over-budget for those.

---

## Read this section before any output

Your value as the long-context harness is breadth that no other CLI can match. If your output reads like Claude Code primary output (single-file diff, surgical edit), you have under-used your leverage. The signature of a good Gemini turn is "I read these 47 files end-to-end, here is the structural pattern, here is the gap, here is what Claude Code should do next."

The signature of a bad Gemini turn is "I read three files, here is a fix" — that is Claude Code primary's job, not yours.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: core/orchestrator/harnesses/gemini
- Generated: 2026-04-26
- Policy posture: this file is executable permission policy for Gemini CLI when running as Starlight Orchestrator long-context harness.
