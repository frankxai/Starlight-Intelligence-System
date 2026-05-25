# Starlight Cockpit Agent Visual Plan

Date: 2026-05-16
Owner: Starlight Intelligence System
Pickup for: Claude Code / Codex / local agent sessions

## Context

Frank asked for a visual way to see all Claude tabs, subagents, stale sessions, active sessions, repo state, and pickup points later. The local investigation found that this is already conceptually Starlight Cockpit, but the current implementation is mostly a continuity and rehydration substrate, not yet the full visual command center.

Current local pieces:

- `C:\Users\frank\Starlight-Intelligence-System\cockpit`
  - Session manifest, snapshot, rehydrate, doctor, status, GC.
  - MCP server with `cockpit_status`, `cockpit_snapshot`, `cockpit_query_sessions`, `cockpit_rehydrate`, workspace save/load, recent events.
  - Safety model: read-only by default; rehydrate is dry-run unless confirmed.
  - Architecture docs state GUI is not in scope yet; status TUI is roadmap.
- `C:\Users\frank\Starlight-Intelligence-System\cockpit-zellij`
  - Workspace and layout launcher for SIS, Arcanea, FrankX, arcanea-flow, and related projects.
  - Useful for reopening workspaces, but not enough as a visual cockpit.
- `C:\Users\frank\Arcanea\packages\peak-performance`
  - Best current operational scanner.
  - `pp tabs` detects active and stale Claude project folders from `~/.claude/projects`.
  - `pp audit` reports machine pressure.
  - `pp radar` reports disk consumers.
- `C:\Users\frank\Arcanea\ARCANEA_AGENTHUB_MASTER_PLAN.md`
  - Product vision for AgentHub / Swarm Cockpit.
  - Describes visual control plane for agents, tasks, repos, branches, token burn, drift, and live state.

Decision: Starlight Cockpit should be the source-of-truth control plane. Peak Performance should feed health and stale-session intelligence into it. AgentHub is the product vision and UX target.

## External Benchmarks

These are worth benchmarking, but should not become the source of truth:

- Cogpit: local dashboard for Claude Code sessions, tool calls, file edits, subagents, branches, cost.
- CLD CTRL: terminal dashboard for Claude sessions, costs, launcher, session detail.
- ccboard: open-source Rust TUI/web dashboard for Claude sessions, costs, hooks, agents, MCP.
- cltop: top-style TUI for Claude Code / Claude app sessions with idle, blocked, runaway detection.
- clawview: local web dashboard over Claude JSONL history in `~/.claude/projects`.
- Claude Code Agent Manager VS Code extension: useful UX reference for browsing sessions and subagents from VS Code.
- AgentsRoom: commercial/fleet-style subagent orchestration reference.

## Target Architecture

Build `Starlight Cockpit v1` as a local-first agent control plane.

### Collectors

1. Cockpit manifest collector
   - Source: `~/.starlight/cockpit/sessions.jsonl`
   - Purpose: terminal pane, agent, session ID, PID, cwd, project key, resume state.

2. Peak Performance collector
   - Source: `pp tabs`, `pp audit`, `pp radar`
   - Purpose: active/stale session folders, process count, RAM, disk pressure, cleanup candidates.
   - Required improvement: add or verify stable `--json` output for each command.

3. Claude transcript collector
   - Source: `~/.claude/projects/**`
   - Purpose: transcript tail, last activity, tool calls, subagent/task invocations where inferable.
   - Must keep transcript content local.

4. Agent definition collector
   - Sources:
     - `.claude/agents`
     - `~/.claude/agents`
     - `.agents/skills`
     - project skills and commands
   - Purpose: known agents, skills, commands, ownership, missing docs.

5. Repo and worktree collector
   - Sources: local Git repos, `git worktree list`, `git status`, `git branch -vv`
   - Purpose: dirty state, ahead/behind, active branches, stale branches, risky untracked dirs.

6. SIS memory collector
   - Sources: SIS memory vaults and handover docs.
   - Purpose: pickup notes, previous decisions, blocked work, next session summaries.

### State Store

Use a two-layer local state model:

- Raw append-only JSONL events for auditability.
- SQLite index for fast dashboard queries.

Recommended locations:

- Raw events: `~/.starlight/cockpit/events/*.jsonl`
- SQLite: `~/.starlight/cockpit/state.db`

Never use cloud services for transcript content by default.

### Normalized Entities

Initial schema targets:

- `AgentSession`
  - id, agent, session_id, cwd, project_key, pid, terminal_id, status, started_at, last_seen_at, resume_command.
- `SessionActivity`
  - session_id, event_type, timestamp, source, summary, related_files.
- `SubagentInvocation`
  - parent_session_id, subagent_type, task_summary, status, started_at, ended_at, transcript_ref.
- `RepoState`
  - path, repo_name, branch, dirty_count, ahead, behind, worktrees, last_commit, risk_level.
- `HealthSnapshot`
  - timestamp, disk_free_gb, ram_used_percent, claude_process_count, node_process_count, warnings.
- `PickupNote`
  - project_key, session_id, summary, next_actions, blockers, created_at, source.
- `StorageCandidate`
  - path, size_gb, category, safety_level, reason, dry_run_command, apply_command.

### MCP/API Layer

Keep Cockpit's current safe-by-default design.

Read-only tools:

- `cockpit_status`
- `cockpit_snapshot`
- `cockpit_query_sessions`
- `cockpit_recent_events`
- `cockpit_repo_state`
- `cockpit_health`
- `cockpit_pickup_queue`

Gated tools:

- `cockpit_rehydrate`
- `cockpit_kill_stale_session`
- `cockpit_archive_transcripts`
- `cockpit_delete_cache_candidate`
- `cockpit_write_handoff`

Rules:

- Snapshot and status are always read-only.
- Kill, delete, archive, and rehydrate require explicit confirmation.
- Cleanup tools must produce a dry-run plan first.
- Never delete nested `.git` directories without read-only audit.
- Never auto-resolve or overwrite `~/.claude` state.

## Visual Product

Build a local dashboard inside the Starlight repo, not FrankX public site.

Likely location:

- `C:\Users\frank\Starlight-Intelligence-System\console`

or, if the existing console is not the right host:

- `C:\Users\frank\Starlight-Intelligence-System\site\app\cockpit`

Views:

1. Mission Control
   - All sessions, tabs, agents, status chips.
   - Active, stale, orphan, blocked, dirty, resumable.

2. Session Detail
   - Resume command.
   - Last transcript tail.
   - Last files touched.
   - Subagent invocations.
   - Related repo state.

3. Agent Graph
   - Parent sessions to subagents.
   - Agents by project.
   - Stale or failed subagent branches.

4. Repo Board
   - FrankX, Arcanea, SIS, oh-my-arcanea, arcanea-flow, forks.
   - Branch, dirty count, ahead/behind, worktree state.
   - Warnings for high-risk archives or uncommitted work.

5. Storage and Health
   - Disk, RAM, process count, pnpm/npm stores, build caches.
   - Safe cleanup candidates with dry-run proof.

6. Pickup Queue
   - What can be resumed now.
   - What needs handoff.
   - What is stale.
   - What should be closed.

7. Archive Review
   - Archive folders with active counterpart comparison.
   - Commit comparison.
   - Safe/stale/unknown/work-not-in-active verdicts.

## Implementation Plan

### Phase 0: Stabilize the Existing Cockpit

- Run `arc doctor`, `arc status`, and a dry-run snapshot.
- Verify SessionStart hook writes to `~/.starlight/cockpit/sessions.jsonl`.
- Verify hooks do not block Claude startup.
- Confirm existing MCP server still exposes Cockpit tools.
- Check current dirty state in SIS before edits. The repo is currently dirty, so do not overwrite unrelated user or agent work.

### Phase 1: Machine-Readable Health

- Add or verify `--json` support for:
  - `pp tabs`
  - `pp audit`
  - `pp radar`
- Add a Starlight collector that shells out to those commands and stores normalized `HealthSnapshot` rows.
- Start with read-only collection only.

### Phase 2: Session Index

- Build a transcript indexer for `~/.claude/projects/**`.
- Track:
  - project path
  - last modified time
  - transcript count
  - latest session file
  - inferred active/stale status
  - rough size
- Do not ingest full transcript content into SQLite initially; store references and small summaries only.

### Phase 3: Repo Index

- Add local repo discovery from:
  - `C:\Users\frank\REPO-REGISTRY.md`
  - known repo roots under `C:\Users\frank`
  - active Cockpit cwd values
- For each repo, collect:
  - branch
  - dirty count
  - ahead/behind
  - worktrees
  - last commit date
  - untracked high-risk dirs

### Phase 4: Read-Only UI MVP

- Build the dashboard before adding control actions.
- Minimum viable UI:
  - Mission Control table.
  - Session detail page.
  - Repo board.
  - Health/storage panel.
- Status chips:
  - active
  - stale
  - orphan
  - dirty
  - resumable
  - blocked
  - cleanup-candidate

### Phase 5: Pickup Layer

- Add `cockpit_write_handoff`.
- Store pickup notes in SIS memory or `docs/ops/HANDOVER-*`.
- UI should show:
  - last known goal
  - current branch
  - dirty files
  - resume command
  - suggested next action

### Phase 6: Gated Control Actions

Only after read-only views are reliable:

- Rehydrate session/workspace.
- Kill stale session process after preflight.
- Archive old transcript folders after dry-run.
- Delete build caches after safety classification.
- Save and load named workspaces.

### Phase 7: Benchmark and Borrow UX

Install or inspect these only after disk pressure is stable:

- ccboard
- cltop
- clawview
- Cogpit
- CLD CTRL

Borrow useful UX patterns:

- top-style process pressure from cltop
- session browser from ccboard/clawview
- timeline/tool-call view from Cogpit
- launch/resume flow from CLD CTRL

Do not replace Starlight Cockpit's source-of-truth role.

### Phase 8: Hardening

- Add tests for parsers and collectors.
- Add fixture transcripts.
- Add privacy assertions: no secrets or full transcript export by default.
- Add performance budget: dashboard load under 2 seconds for current local history.
- Add hook budget: startup hook must stay non-blocking and under 5 seconds.

## Current Safety Notes

- Disk was critically low earlier on 2026-05-16. Claude cleanup recovered about 4.26 GB, bringing C: free space to about 4.34 GB.
- `C:\Users\frank\Arcanea\_archive\arcanea-code-2026-05-06-root` must not be deleted blindly. It contains WIP not present in active `arcanea-code`.
- Global `@arcanea/*` npm packages are mostly junctions into active local projects. Do not uninstall wholesale.
- `oh-my-arcanea` appears to be an active universal agent harness overlay.
- `@claude-flow/cli` is a candidate for review, not automatic removal.
- Current Starlight repo has dirty state. Inspect before editing.

## Recommended First Claude Task

Start with a read-only implementation plan, not UI coding:

1. Inspect `cockpit/README.md`, `cockpit/docs/ARCHITECTURE.md`, `cockpit/CONTRACTS.md`, and `cockpit/mcp/server.js`.
2. Inspect `Arcanea/packages/peak-performance/src/swarm/tabs.ts`.
3. Decide whether JSON output belongs in Peak Performance first or whether Starlight should wrap existing terminal output temporarily.
4. Propose a minimal `cockpit-core` collector interface.
5. Build only the first read-only collector and one JSON command.

Best first deliverable:

- `pp tabs --json`
- `cockpit_collect_sessions` read-only collector
- one static dashboard/table or CLI output proving active/stale/orphan sessions can be shown from normalized data

