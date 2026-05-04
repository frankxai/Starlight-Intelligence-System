---
name: Swarm Queen Sprint Architecture
description: Multi-tab multi-repo coordination architecture for Frank's portfolio. SIS-tab queens substrate + cross-repo packet-based handovers; sibling-repo tabs run their own work.
type: design-spec
date: 2026-05-04
status: approved-by-frank-2026-05-04
sprint: 2026-W19
---

# Design Spec — Swarm Queen Sprint Architecture

## Context

Frank operates at portfolio scale: 76 local repos, 200+ GitHub repos, 3 active product surfaces (FrankX, Arcanea, Starlight ecosystem), 12-repo Oracle work cluster (dormant), creator pipeline across multiple `frankx.*` and `arcanea-*` properties. Single-tab orchestration cannot cover this surface area; AgentDB-per-tab failure mode means parallel Claude sessions need a coordination protocol that doesn't depend on shared in-process memory.

His directive 2026-05-04 (verbatim): *"you lead and do things, but consider you lead SIS, other tabs working on the other repos, you can either give me prompts or if you can ensure handover land in right places for next agent to pickup you add prompts and what you see priorities to the other folders or repos."*

## Approach selected

**SIS-tab as queen + handover-packet pattern across sibling repos.**

The SIS-tab (this Claude session) maintains the sprint plan, owns substrate-tier work, and publishes handover packets into each sibling repo's `docs/ops/` directory. When Frank opens a Claude tab in a sibling repo, that tab finds the packet, runs the workstream, and writes a return packet which the Cross-Repo Indexer (already shipped 2026-05-03, 520 atoms across 22 memory dirs) auto-surfaces back to SIS.

## Why this beats alternatives

| Alternative | Why rejected |
|---|---|
| Prompt-paste pattern (queen gives Frank prompts, Frank pastes into sibling tabs) | Loses context across pastes; no return path; doesn't survive session crashes |
| Single-tab orchestration with subagent fan-out | AgentDB-per-tab constraint; embedded vector DBs spawn per-process; 10+ tabs breaks system |
| Shared MCP server for cross-tab state | Phase 0 P0 work, not yet shipped — Memory Bus v0.1 is the foundation, but cross-tab coordination layer above it isn't built yet |
| Linear / Notion as central surface | Vendor lock-in; violates sovereignty principle; duplicates infrastructure already in `memory/` Obsidian vault |

The handover-packet pattern leverages infrastructure already shipped:
- **Cross-Repo Indexer** (2026-05-03) — surfaces sibling repo memory dirs to SIS
- **Memory Bus v0.1** (2026-05-03) — singleton stdio MCP solves AgentDB constraint
- **Mirror Foundation** (2026-05-01) — `memory/` is Obsidian-friendly vault with frontmatter validator
- **Brain viz** at `:3007/brain` — visual dispatch tracker
- **`/process-inbox` skill** + `.intake/` workflow (2026-05-03) — pattern for incoming work in a repo

## System decomposition

### Layer 1 — Queen (SIS-tab, this session)

Owns:
- Sprint plan at `memory/sprints/2026-W19.md`
- Daily standup at `memory/sprints/standup/<date>.md`
- Weekly recap at `memory/sprints/reviews/<week>-review.md`
- Substrate-tier work (Tier 2, Tier 3 of sprint)
- Cross-repo coordination (publishing handover packets)
- Brain viz integration (dispatches publish to `/brain` SSE)

Communicates via:
- File writes to sibling repo `docs/ops/`
- Memory Bus queries to surface sibling returns
- GitHub Projects board (operational mirror) — read-only from queen's perspective

### Layer 2 — Sibling-repo tabs

Each sibling tab is a Claude session opened in a specific repo. On open it scans `docs/ops/` for `HANDOVER-FROM-SIS-QUEEN-<date>.md` files newer than its last seen, runs the workstream, writes return packet at `HANDOVER-TO-SIS-QUEEN-<date>.md`.

Active sibling tabs this sprint: Arcanea, FrankX, frankx.ai-vercel-website, AnimeLegends.ai, gencreator.ai, dpi, arcanea-flow, agentic-creator-os.

### Layer 3 — Specialist agents (per sibling tab as needed)

Each sibling tab can dispatch its own specialist subagents (code-reviewer, accessibility-auditor, etc.). Specialists report back to their own tab, not directly to the queen — keeps the coordination tree shallow.

## Data flow

```
Frank intent (voice/text) → SIS-tab
                                ↓
                          sprint plan
                                ↓
                  handover packet writes to:
                                ↓
        ┌──────────┬─────────┬─────────┬─────────┐
        ↓          ↓         ↓         ↓         ↓
   Arcanea/    FrankX/    site/    AnimeL/   etc.
   docs/ops/   docs/ops/  docs/    docs/
        ↓          ↓         ↓         ↓
   sibling tab opens, reads packet, works, writes return
        ↓          ↓         ↓         ↓
   HANDOVER-TO-SIS-QUEEN-<date>.md (committed or untracked)
        ↓          ↓         ↓         ↓
        └──────────┴─────────┴─────────┘
                                ↓
                Cross-Repo Indexer (already running)
                                ↓
                Memory Bus surfaces to SIS-tab
                                ↓
                        SIS daily standup
```

## Components

| Component | Path | Status |
|---|---|---|
| Sprint plan | `memory/sprints/2026-W19.md` | shipped this commit |
| Design spec | `docs/superpowers/specs/2026-05-04-swarm-queen-sprint-architecture-design.md` | this file |
| Sibling handover packets | `<repo>/docs/ops/HANDOVER-FROM-SIS-QUEEN-2026-05-04.md` (×8) | shipped this commit |
| Cockpit recovery handover | `docs/ops/HANDOVER-COCKPIT-RECOVERY-2026-05-04.md` | dispatched subagent in-flight |
| GitHub Projects board | `frankxai` org level, "SIS Sprint 2026-W19" | Frank to create (5min UI step) |
| Daily standup | `memory/sprints/standup/<date>.md` | queen writes daily starting 2026-05-05 |
| Weekly recap | `memory/sprints/reviews/2026-W19-review.md` | queen writes Friday |

## Error handling

| Failure mode | Handling |
|---|---|
| Sibling tab crashes mid-workstream | Handover packet on disk survives; next tab open re-reads; idempotent |
| Cross-Repo Indexer goes stale | Memory Bus query falls through to direct file glob; degrades gracefully |
| GitHub Projects out of sync with sprint plan | Sprint plan is source of truth; Projects is mirror; manual reconcile if drift detected at Friday recap |
| Substrate-tier change skips `/starlight-board` pre-pass | v76 conformance test catches at CI; recovery exception logged per `feedback_board_before_tag.md` |
| Sibling repo missing `docs/ops/` | Queen creates dir on first packet write (mkdir -p) |
| Handover-protocol filename collision (multiple packets same date) | Date-suffix collision impossible since standardized as `<date>` not `<datetime>`; second packet overwrites first by design (queen always writes most-recent) |

## Testing strategy

This architecture is operational-tier with no executable surface beyond markdown writes. Verification gates:

1. **Packet-write verification:** all 8 sibling repos have `docs/ops/HANDOVER-FROM-SIS-QUEEN-2026-05-04.md` after this commit
2. **Indexer pickup:** memory bus query for "HANDOVER-FROM-SIS-QUEEN" returns ≥8 hits within 24h
3. **Return-flow smoke test:** at least 1 sibling tab writes return packet by 2026-05-06; queen surfaces via memory bus query
4. **Friday gate:** weekly recap aggregates ≥6 sibling-tab returns

No code-level tests because no code shipped — pattern is markdown-and-conventions.

## Risks

| Risk | Mitigation |
|---|---|
| Frank doesn't open sibling tab and packets go unread | Acceptable — packet survives indefinitely; pattern is pull-based; Frank's call when to open which tab |
| Sibling tab agent doesn't follow handover-protocol return-format | Each packet includes the return-format template explicitly; degraded return still better than no return |
| Cross-Repo Indexer doesn't crawl new repos | Indexer already pointed at all 22 ~/.claude/projects/*/memory/ dirs; sibling repo `docs/ops/` not yet in scope — packet duplicated to repo's `memory/` if indexer integration matters |
| Sprint plan drifts from GitHub Projects | Friday recap reconciles; sprint plan wins as source of truth |

## Out of scope

- Cross-tab real-time messaging (Memory Bus is async/file-based)
- Auto-PR creation from queen (queen flags ready-to-ship; sibling tab or Frank creates PR)
- Subagent dispatching across tabs (each tab dispatches its own; queen doesn't reach into sibling tab's process tree)
- Linear / Notion integration (deferred per Frank's 2026-05-04 decision)
- Self-modifying sprint plan (queen edits in place; no automated re-prioritization)

## Approval

Frank approved 2026-05-04 verbatim: *"yes you lead and do things"* + selection of GitHub Projects + sovereignty/Obsidian-first hybrid.

## Next step

Per `superpowers:brainstorming` skill flow, transition to `superpowers:writing-plans` for each Tier 2 substrate workstream that involves code-level work (Energy IS agents, Code IS / Voice & Video IS / Family verticals authoring, skill registry implementation). Tier 1 (arcanea-ai-app) is owned by sibling tab — its handover packet contains its own action plan. Tier 4/5 are status-check workstreams not requiring full plans.

---

*Built on SIP — operational tier · design spec · 2026-05-04*
