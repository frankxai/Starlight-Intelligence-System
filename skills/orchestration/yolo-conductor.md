---
name: yolo-conductor
description: Drives the /yolo Hive session loop — open, parallel council scan, Prime synthesis, present moves, execute selected move with substrate gate + subagent QA + verification, persist, loop. Activates on /yolo command invocation.
type: orchestration
domain: orchestration
substrate-tier: true
attached-to: starlight-orchestrator
---

# yolo-conductor Skill — Session Loop Driver

## Activation

Auto-activates when `/yolo` command runs. Attached to `starlight-orchestrator` agent (the conductor role per spec §3.1). Composed by `yolo-scan` (called per council agent in parallel) + `/starlight-board` (substrate gate) + `pr-review-toolkit:code-reviewer` + `pr-review-toolkit:silent-failure-hunter` (QA gates).

## Pre-conditions

1. `yolo-scope.json` exists at repo root and validates against schema (see test/v81-yolo.test.ts).
2. Git working tree clean OR Frank explicit ack of dirty tree.
3. Memory Bus reachable (test via `mcp__memory-bus__memory_health`). Soft-fail if unreachable — log warning, persist to vault only.
4. `memory/_audit/yolo/` directory — gitignored, runtime-created. Conductor mkdir's it at session open if absent.

## Session loop

```
on_open:
  session_id = ISO-timestamp (YYYY-MM-DD-HHMMSS)
  audit_log_path = memory/_audit/yolo/${session_id}.jsonl
  ensure_dir(memory/_audit/yolo)
  scope = load_yolo_scope()

  # Phase-in gate (Board REVISE-2)
  if scope.phase_in.unlock_status == "closed":
    repos = [scope.phase_in.phase_in_repo]
  else:
    repos = scope.repos.map(r => r.name)

  # Phase-In Review prompt (after session 3)
  if scope.phase_in.session_count >= 3 and not scope.phase_in.unlock_review_passed:
    surface_phase_in_review_packet_to_frank()
    if frank_unlocks: scope.phase_in.unlock_status = "open"; scope.phase_in.unlock_review_passed = true
    elif frank_extends: continue with phase_in_repo only
    elif frank_pauses: end session for spec revision

  # Bidirectional drift detection (Board REVISE-2)
  drift_post = read_prior_drift_log()  # from prior session's post-close drift
  drift_open = scan_for_drift_since_prior_close()  # git changes since prior session that weren't in audit
  if drift_post + drift_open > 0:
    surface_to_frank("Drift detected since last session", drift_post + drift_open)

scan_and_propose:
  packets = parallel_dispatch_via_Task_tool(
    [architect, sentinel, sage, navigator, weaver, prime, orchestrator],
    yolo-scan_skill,
    {repos, domain_per_agent, budget_ms: 60000}
  )
  ranked_moves = prime_synthesize(packets, max=5)
  user_pick = ask_user_question(ranked_moves + ["rescan", "exit"])
  if user_pick == "exit": invoke /yolo-exit
  if user_pick == "rescan": loop to scan_and_propose
  execute_move(user_pick)
  loop to scan_and_propose

execute_move(move):
  audit_log_append({event: "move-picked", move})

  # Council-of-relevance (NOT all 7 — pick by domain match)
  council = pick_relevant_agents(move)  # see spec §4.2 examples
  plan = council.plan(move)
  audit_log_append({event: "plan-produced", plan})

  # Pre-action QA
  pre_qa = code_reviewer.review(plan)  # subagent dispatch
  if pre_qa.has_critical:
    ask_user(fix_and_retry | accept_with_rationale | abandon)

  for action in plan.actions:
    # Tripwires (spec §7.1)
    if action.class == "irreversible": ask_user
    if action.budget_breach: ask_user
    if action.alliance_touched: REFUSE (sovereignty hygiene)

    # Substrate gate
    if action.touches_substrate:
      board_verdict = invoke /starlight-board
      audit_log_append({event: "board-verdict", verdict: board_verdict})
      if board_verdict == "REVISE": surface_to_frank(fix_or_abandon)
      if board_verdict == "BLOCK": abandon move
      if board_verdict == "PROCEED" and action.class == "merge":
        # Board REVISE-1 sovereign re-ack rule (spec §7.3.1)
        # Even on PROCEED, substrate-class merges require fresh Frank-ack.
        # Session-grant does NOT propagate to substrate merges.
        re_ack = ask_user_question("Substrate merge ready (board PROCEED). Confirm fresh ack?")
        if not re_ack: abandon

    result = execute_action(action)

    # Verification before completion (Karpathy hygiene)
    evidence = capture_evidence(action)  # test output / CI response / deploy probe
    if not evidence.passed: surface_to_frank(fix_or_abandon)
    audit_log_append({event: "action", action, result, verification: evidence})

  # Final QA — full diff
  final_qa = code_reviewer.review(diff) + silent_failure_hunter.review(diff)
  if final_qa.has_critical: surface_to_frank

  # Ship per autonomy band
  ship(move)  # commit + push + PR + merge + deploy
  ship_verification = verify_ship(move)  # tests + smoke + deploy probe HTTP 200
  audit_log_append({event: "move-shipped", move, verification: ship_verification})

  # Persistence
  memory_bus_commit({kind: "yolo-move-shipped", move, session: session_id})

on_close (via /yolo-exit):
  follow persistence chain in commands/yolo-exit.md

on_abort (via /yolo-abort):
  follow halt sequence in commands/yolo-abort.md
```

## Parallel council dispatch pattern

In Claude Code, the `Task` tool dispatches subagents. Per Frank's established `parallel-agent-pattern` memory: send all 7 council `Task` calls in a SINGLE message so they run concurrently. Each call uses the same `yolo-scan` skill but with a different `domain` parameter (architect | sentinel | sage | navigator | weaver | prime | orchestrator).

## Substrate touch detection

A move touches substrate if its file changes include any of (per spec §7.3):

- `SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`
- `CLAUDE.md`, `AGENTS.md` governance sections
- `agents/AGENT_REGISTRY.md`, `skills/skill-rules.json`
- Any file in `commands/` (new top-tier command = substrate)
- File-contract / attestation / sovereignty / 10-IS taxonomy / domain sub-stack files

Detection: pre-action diff scan via `git diff --name-only HEAD`.

## Phase-in lockout (Board REVISE-2)

If `scope.phase_in.unlock_status === "closed"`, conductor refuses to scan or operate on any repo not equal to `scope.phase_in.phase_in_repo`. This is a hard gate — it does NOT respect override flags or per-action arguments. Frank must explicitly unlock via Phase-In Review at session 4.

## Drift detection cadence (Board REVISE-2)

**Post-session** (in `/yolo-exit`): diff committed-this-session against audit-log proposed actions. Any committed change not in audit log → drift event to `memory/_audit/yolo/_drift.jsonl`.

**Session-open** (here, on every /yolo): read prior session's `_drift.jsonl` AND scan the repo state for git changes since prior session close (`git log --since=<prior-close-ts>` filtered to non-/yolo commits). Surface drift to Frank as part of opening scan output.

## Composes with

- `yolo-scan` — each council agent invokes this skill in parallel (single-message dispatch)
- `/starlight-board` — substrate gate (auto-invoked on substrate file touch)
- `pr-review-toolkit:code-reviewer` + `pr-review-toolkit:silent-failure-hunter` — QA gates (pre-action + final)
- `mcp__memory-bus__memory_commit` / `mcp__memory-bus__memory_recall` — atom persistence
- `cockpit-zellij` workspaces — every /yolo session opens a named workspace (Cockpit Continuity v0.2 integration)

---

**Built on SIP** · `yolo-conductor` skill · v1.0.0
