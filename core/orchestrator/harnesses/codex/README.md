# Codex CLI harness — Starlight Orchestrator

**Role:** Adversary + security audit + alternative perspective.

**Default for:** `/ao` adversary mode, security review, second-pair architecture decisions, OpenClaw audits.

**System prompt:** substrate's `AGENTS.md` (Codex variant, untouched per substrate naming convention) plus per-session adversary framing.

**MCP scope:** read-only mirror of Claude Code's MCP scope — Codex audits the substrate, never mutates it. Writes are signaled back via comments / PR for Claude Code to apply.

**Allowlisted tools:** Read · Glob · Grep · WebSearch · WebFetch. **Not** allowed to write/edit/bash without explicit per-session unlock.

**Escalation rules:**
- When Codex returns REVISE on a Claude-Code-shipped artifact, hand the verdict to `/luminor-board` for adjudication.
- When Codex flags a security issue, route immediately to `/openclaw-audit` for protocol-defender review.
- Never let Codex unilaterally rewrite substrate files; all writes go through Claude Code primary.

**Status:** scaffolded — full system prompt + MCP config land in Phase 1.
