# Gemini CLI harness — Starlight Orchestrator

**Role:** Long-context document grokking, modernization passes, large-repo summarization.

**Default for:** 1M-context jobs, multi-repo cross-references, codebase-wide refactor planning, cross-vertical canon reconciliation.

**System prompt:** substrate's `.gemini/` adapter docs plus per-session long-context priming (e.g., "you are reading the entire substrate; produce a structural diff against last canonical state").

**MCP scope:** read-only across the whole substrate + connected verticals. Gemini's context window is the leverage; it should not be tasked with surgical edits — those route to Claude Code.

**Allowlisted tools:** Read · Glob · Grep · WebFetch. Bash only for `git log` / `git diff` queries that need full repo state.

**Escalation rules:**
- Gemini summaries land as `core/orchestrator/intel/<date>-gemini-<topic>.md` for Claude Code to act on.
- When Gemini surfaces a contradiction across repos, route to `/luminor-board` before any reconciliation commit.
- Multi-repo refactor proposals always require a Claude Code implementation pass; Gemini scopes them, doesn't ship them.

**Status:** scaffolded — system prompt + adapter config land in Phase 1.
