# Claude Code harness — Starlight Orchestrator

**Role:** Primary CLI. Substrate edits, architecture, long-form code, agent orchestration.

**Default for:** any task touching SIS, brand-critical writes, or > 200 LOC changes.

**System prompt:** the substrate's `CLAUDE.md` is the source of truth. Per-task instructions compose on top of it; never replace it.

**MCP scope:** `~/.claude/settings.json` `mcpServers` — `starlight-substrate` (canonical), `arcanea-mcp` (when canon work), plus task-scoped MCPs declared per session.

**Allowlisted tools:** Read · Write · Edit · Glob · Grep · Bash (with surgical staging) · Agent (parallel dispatch up to 5-8 in flight per the 2026-04-25 pattern).

**Escalation rules:**
- Substrate-level edits → architect voice + SIP attestation footer + memory entry.
- Operational-level edits → Frank DNA voice + ambient attestation.
- Cross-party / brand-critical → Luminor Board pressure-test before push.
- Adversarial security review → handoff to Codex harness.

**Status:** active. Default harness for v7.5 work.
