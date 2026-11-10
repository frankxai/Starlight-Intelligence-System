# Claude Code + Codex Power Pack (€49 / $54)

> High-velocity multi-harness orchestration scripts, worktree isolation harnesses, and local daemon architectures for power developers.
> Built on SIP — Commercial Product Tier

---

## 1. Product Summary & Value Proposition

- **Target Audience:** Developers and technical teams running daily CLI agent swarms across Claude Code and OpenAI Codex CLI who want multi-branch concurrency without git merge conflicts or context pollution.
- **Price Point:** **€49.00** (one-time purchase, instant download + GitHub template repository access).
- **Core Value:** Unlock true parallel agent execution on your existing flat-rate subscriptions:
  1. Isolated branch worktrees for every subagent (`.git/worktrees/agent-<id>`).
  2. Automatic context compaction and memory pruning scripts.
  3. Seamless MCP bridges connecting local SQLite vaults directly to Claude Code and Codex.

---

## 2. Included Architecture & Code Assets

### Asset A: Git Worktree Multi-Agent Manager (`bin/agent-worktree.sh` & `.ps1`)
- Automatically spawns isolated working directories for each agent thread.
- Guarantees zero file contention between simultaneous Claude Code and Codex sessions.
- Automatically merges clean agent branches back into `main` after Sentinel verification passes.

### Asset B: Subagent Context Hygiene & Pruner (`scripts/context-cleaner.mjs`)
- Solves the documented 2.6x parent context inflation issue in long-horizon coding tasks.
- Prunes unreferenced tool execution logs, dead stack traces, and repetitive compiler outputs before feeding context back to the parent reasoning model.

### Asset C: Dual-Harness MCP Memory Connector (`mcp-harness-bridge/`)
- Unified Model Context Protocol server exposing:
  - `vault_search`: High-speed vector & FTS5 search across your local project memory.
  - `vault_append`: Automatic persistence of verified coding patterns and architectural decisions.
  - Native support for both Claude Code (`~/.claude/mcp.json`) and Codex CLI (`~/.codex/mcp.json`).

### Asset D: Rate-Limit Failover Watchdog Daemon (`daemons/agent-watchdog.mjs`)
- Monitors CLI exit codes in real-time.
- Automatically detects HTTP 429 rate limits or rolling-window exhaustion on Claude Code.
- Seamlessly transfers open goal checklists to Codex CLI or Antigravity without losing progress.

---

## 3. Storefront Copy & Technical Specs

- **Headline:** Run 5 Parallel Coding Agents Without Merge Collisions
- **Subheadline:** Production-grade worktree automation, memory context hygiene, and automatic rate-limit failovers for Claude Code and Codex CLI.
- **Polar.sh Direct Product ID:** `prod_claude_codex_power_49eur`
- **Whop Storefront URL:** `whop.com/frankx/claude-codex-power`
- **License:** Individual commercial license (use in unlimited commercial and personal projects).

---

*Attested: Built on SIP · Commercial Tier*
