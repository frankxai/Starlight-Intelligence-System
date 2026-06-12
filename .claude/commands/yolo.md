---
description: Enter /yolo Hive session — Claude leads cross-repo work via parallel council scan, Prime synthesis, aggressive autonomy. Phase-in locked to single repo for sessions 1-3.
substrate-tier: true
auto-board-on-substrate: true
---

# /yolo — Session Mode (Hive)

Load if present `private/yolo-scope.json`. Invoke the `yolo-conductor` skill. Use `Read`, `Glob`, `Grep`, `Bash`, `Edit`, `Write`, and the `Task` tool with parallel subagent dispatch for council scans.

## Behavior

1. **Open session.** Read `private/yolo-scope.json`. If `phase_in.unlock_status === "closed"`, scope is locked to `phase_in.phase_in_repo` only. Increment `phase_in.session_count`. Read prior session's `memory/_audit/yolo/_drift.jsonl` if exists; surface accumulated drift as part of opening output.

2. **Council scan (parallel, single-message dispatch).** Use `Task` tool to invoke the 7 council agents in parallel, each running the `yolo-scan` skill with their domain lens: `starlight-architect` (infra), `starlight-sentinel` (security), `starlight-sage` (memory/vault), `starlight-navigator` (strategy), `starlight-weaver` (creative/brand), `starlight-prime` (synthesis), `starlight-orchestrator` (workflow). Each returns a structured JSON packet per the schema in `skills/orchestration/yolo-scan.md`.

3. **Synthesis (Prime).** Hand all 7 packets to `starlight-prime`. Prime dedupes overlapping moves, ranks by `(leverage × repo_activity × strategic_alignment) / (blast_radius_weight × est_effort)`, returns top 3-5 moves.

4. **Present to Frank via `AskUserQuestion`.** Numbered options 1-5, plus "rescan" and "exit" choices.

5. **Execute selected move** — see `skills/orchestration/yolo-conductor.md` Execution Loop section for full protocol (council-of-relevance dispatch, subagent QA gate, substrate gate, verification, persistence).

6. **Persist + loop** back to step 2 (rescan) until `/yolo-exit` or `/yolo-abort`.

## Tripwires (hard ASK or REFUSE — see spec §7.1)

- Spend > `budget.session_threshold_usd` cumulative → ASK
- Spend > `budget.action_threshold_usd` per action → ASK
- Force-push any branch → ASK
- Force-push main → REFUSE without explicit ack
- `rm -rf` any path → ASK
- Drop DB or destructive DB op → REFUSE without explicit ack
- Secret rotation → ASK
- Touch any repo with `alliance_touched: true` → REFUSE (sovereignty hygiene)
- Web3 mainnet send → REFUSE without explicit ack

## Substrate gate

Before any merge that touches substrate files (per spec §7.3 enumeration), auto-invoke `/starlight-board`. Per Board REVISE-1 (spec §7.3.1): even on PROCEED verdict, require fresh Frank-ack via `AskUserQuestion` before merge. Session-grant does NOT propagate to substrate-class merges.

## Verification (Karpathy hygiene)

Every ship action must capture concrete evidence: tests command output, CI green response, deploy probe HTTP 200. No "I think it shipped" — only "here's the proof." Evidence appends to the audit log entry.

## Audit log

Append one JSONL line per action to `memory/_audit/yolo/<YYYY-MM-DD-HHMMSS>.jsonl`. Schema per spec §8.1. Directory is gitignored — conductor must mkdir at session open if absent.

## Phase-in (Board REVISE-2)

Sessions 1-3 scope-locked to `yolo-scope.json::phase_in.phase_in_repo`. Conductor refuses to scan beyond that repo until `unlock_status === "open"`. After session 3, conductor surfaces Phase-In Review packet at next /yolo open — Frank decides unlock / extend / pause for revision.

## Composes with

- `/yolo-exit` — graceful close + vault writes
- `/yolo-abort` — immediate halt + rollback
- `/starlight-board` — substrate gate (auto-invoked on substrate touch)
- `pr-review-toolkit:code-reviewer` + `pr-review-toolkit:silent-failure-hunter` — pre-merge QA
- `mcp__memory-bus__memory_commit` / `mcp__memory-bus__memory_recall` — atom persistence

---

**Built on SIP** · `/yolo` Hive · v1.0.0 (2026-05-11, Board REVISE applied)
