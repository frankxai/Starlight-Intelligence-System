# SIS v6 — Engineering Spec

**Date:** 2026-04-09
**Status:** Approved, building overnight
**Principle:** JSONL files = truth. Everything else is a rebuildable index.

## Modules

### 1. Retrieval Layer (`src/retrieval.ts`)
- better-sqlite3 + better-sqlite3-vec for semantic search
- Auto-indexes all JSONL vaults on init / file change
- Hybrid: vector similarity + keyword FTS5 + vault-type weighting
- Rebuildable: `sis rebuild-index` regenerates from JSONL in <1s
- Embedding via local model or configurable provider

### 2. Temporal Metadata (`src/temporal.ts`)
- Extended entry fields: validFrom, validUntil, lastConfirmed, confidenceDecay
- Staleness scoring: entries not confirmed in 30d flagged
- Confidence auto-decay function
- `sis stale` CLI command to list stale entries

### 3. Platform Adapters (`src/adapters/`)
- claude-code.ts, cursor.ts, codex.ts, gemini-cli.ts, opencode.ts
- Shared AdapterInterface: inject context, format output, register tools
- Per-platform: prompt format, context window limits, MCP vs inline

### 4. MCP Server v2 (`src/mcp-server.ts`)
- Upgrade to MCP SDK 1.29+ with tool() API
- New tools: sis_search (semantic+keyword), sis_confirm, sis_invalidate, sis_contradict
- Keep existing: sis_append_entry, sis_recent_entries, sis_stats, sis_vault_search, sis_entry_types
- HTTP+SSE transport option alongside stdio

### 5. Dreaming Agent (`src/dreaming.ts`)
- Process session transcripts from ~/.starlight/evals/sessions/
- Extract insights → classify into vault categories
- Promote repeated patterns to Wisdom vault
- Detect contradictions → flag for human review
- Run as: `sis dream` CLI command (not background daemon)

### 6. Contradiction Detection (`src/contradiction.ts`)
- Cross-vault conflict detection using embedding similarity
- Flag entries with high similarity but opposing sentiment/content
- `sis contradict` CLI command
- MCP tool: sis_contradict

### 7. Tests
- Expand from 1,537 lines to cover all new modules
- Each module gets its own test file
- Node.js built-in test runner (existing pattern)

## Dependencies (new)
- better-sqlite3: SQLite binding
- (optional) sqlite-vec or better-sqlite3-vec: vector extension

## What does NOT ship
- No cloud sync
- No web UI (that's starlightintelligence.org)
- No graph database
- No multi-user
