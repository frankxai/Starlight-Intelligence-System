---
title: /yolo Hive — Cross-Repo Lead Command (Approach C)
status: DESIGN (pre-board)
tier: substrate
date: 2026-05-11
author: starlight-architect (driving for Frank)
related:
  - CLAUDE.md (substrate-tier governance gate)
  - agents/AGENT_REGISTRY.md
  - skills/skill-rules.json
  - memory/vaults/strategic-vault.md
parked-sketches:
  - W2: Cost & API Control Plane
  - W3: Finance & Business IS
  - W4: Web3 IS
attestation: Built on SIP — sovereign-spawned, attestation-aware
---

# /yolo Hive — Cross-Repo Lead Command

## 1. Purpose

`/yolo` is a session-mode top-tier command that puts Claude in the conductor seat across Frank's 24 active sovereign repos. On open, the full council (7 agents) scans in parallel through their domain lens, Prime synthesizes 3–5 ranked moves, Frank picks one, and Claude executes end-to-end — committing, opening PRs, running `/starlight-board` on substrate touch, merging, deploying, and verifying — gated by subagent QA and structural autonomy tripwires. `/yolo-exit` closes the session with operational + strategic vault writes.

The framing is **Claude leads, Frank ships**. Sibling of `/starlight`, `/superintelligence`, `/starlight-board`. Inspired by Gemini's yolo-mode but Claude-led with subagent QA + board pass as the structural gate (per "Lead with authority — Frank delegates the whole ship" memory).

## 2. Scope decisions (locked in brainstorming)

| Dimension | Decision |
|---|---|
| Operating shape | **Session mode** (`/yolo` enters, `/yolo-exit` returns) |
| Default repo scope | **24 active sovereign repos** (from 2026-05-04 audit) |
| Autonomy band | **Aggressive** — gate = subagent QA + `/starlight-board` |
| Opening move | **Scan + propose 3–5 ranked moves** |
| Cross-session memory | **Full vault integration** (audit + Memory Bus + operational vault + strategic vault on substantive decisions) |
| Agent topology | **Hive (Approach C)** — parallel council scan + Prime synthesis |

## 3. Architecture overview

```
                          ┌─────────────────────┐
                          │      /yolo          │
                          │   session opens     │
                          └──────────┬──────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │     Council scan (parallel × 7)      │
                  └──────────────────┬──────────────────┘
                                     │
                  [ARCH] [SENT] [SAGE] [NAV] [WEAV] [PRIME] [ORCH]
                     │     │      │     │     │      │       │
                     └─────┴──────┴─────┴─────┴──────┴───────┘
                                     │
                  ┌───────────▼───────────┐
                  │  Synthesizer (Prime)  │
                  │  dedupe + rank 3–5    │
                  └───────────┬───────────┘
                              │
                  [ User picks one move (1–5 or rescan) ]
                              │
                  ┌───────────▼───────────┐
                  │   Execution loop      │
                  │  - council-of-relevance (subset)
                  │  - subagent QA gate
                  │  - /starlight-board on substrate
                  │  - ship per autonomy band
                  │  - verify (tests + smoke + deploy probe)
                  └───────────┬───────────┘
                              │
                  ┌───────────▼───────────┐
                  │   Persistence layer   │
                  │   audit + Memory Bus  │
                  │   + vault writes      │
                  └───────────┬───────────┘
                              │
                       loop → scan-or-propose
                       (until /yolo-exit)
```

### 3.1 Agent topology (no new agents)

| Role | Agent | Source |
|---|---|---|
| Conductor / executor coordinator | `starlight-orchestrator` + new `yolo-conductor` skill | existing |
| Synthesizer | `starlight-prime` | existing |
| Council scanners (× 7) | `starlight-orchestrator`, `starlight-prime`, `starlight-architect`, `starlight-navigator`, `starlight-sentinel`, `starlight-weaver`, `starlight-sage` | existing |
| QA gate | `pr-review-toolkit:code-reviewer` + `pr-review-toolkit:silent-failure-hunter` | existing |
| Substrate gate | `/starlight-board` command (existing) | existing |

**New surface to ship:**
- 3 commands: `/yolo`, `/yolo-exit`, `/yolo-abort`
- 1 skill: `yolo-conductor` (drives the session loop)
- 1 skill: `yolo-scan` (council-shared, parameterized by domain)
- Audit log directory: `memory/_audit/yolo/`
- Vault-write protocol amendment (operational + strategic)

## 4. Session lifecycle

### 4.1 Open

```
1. User: /yolo
2. Conductor verifies preconditions:
   - git working tree clean OR explicit dirty-tree ack
   - 24-repo registry loaded from yolo-scope.json (or audit fallback)
   - Memory Bus reachable
3. Conductor dispatches parallel council scan via Task tool
   (all 7 agents in single message — established parallel pattern)
4. Each agent runs yolo-scan skill through its domain lens
5. Agents return structured packets (JSON, not prose)
6. Conductor hands packets to Prime
7. Prime synthesizes → 3–5 ranked moves
8. Conductor presents moves to user via AskUserQuestion (numbered)
```

### 4.2 Execute (per move picked)

```
1. Conductor classifies move:
   - touches substrate? (per file-contract scan)
   - touches alliance/3rd-party? → tripwire
   - estimated $ spend? → budget check
   - irreversible class? → ASK gate
2. Council-of-relevance dispatched (typically 2–3 agents, not all 7). Relevance = move's primary domain lens + adjacent guardrails. Examples:
   - infra/code move → Architect (primary) + Sentinel (security guardrail)
   - creative/brand move → Weaver (primary) + Prime (synthesis with strategy)
   - strategic move → Navigator (primary) + Prime (synthesis)
   - memory/vault move → Sage (primary) + Architect (file-contract guardrail)
3. Planning subagent produces action list with verification checkpoints
4. Pre-action: subagent QA reads the plan, flags issues
5. Execute actions one-by-one:
   - each action runs in subagent for isolation
   - audit log entry per action
   - post-action verification (test/smoke/deploy probe per action class)
6. If substrate touched: /starlight-board pre-pass
   - PROCEED → continue
   - REVISE → halt, present items to user
   - BLOCK → abandon move, return to scan-or-propose
7. Final QA: code-reviewer + silent-failure-hunter on full diff
8. Ship: push + PR + merge + deploy per autonomy band
9. Verify ship: live probe (HTTP 200, deploy URL ack)
10. Persist: audit log close + Memory Bus atom + vault delta
11. Return to scan-or-propose
```

### 4.3 Close

```
1. User: /yolo-exit
2. Conductor writes session snapshot to operational vault
3. If any move was strategic-class: write to strategic vault
4. Memory Bus: commit session-summary atom
5. Cross-Repo Indexer: re-index session log
6. Audit log: finalize + checksum
7. Session closed
```

## 5. Council scan protocol

### 5.1 The `yolo-scan` skill (shared)

Each council member invokes the same skill, parameterized by `domain`:

```yaml
input:
  domain: <architect|sentinel|sage|navigator|weaver|prime|orchestrator>
  repos: <list of 24 sovereign repo paths>
  signals_dir: ~/.claude/projects/*/memory/  # Cross-Repo Indexer corpus
  budget_ms: 60000

output_schema:
  moves:
    - title: string
      repo: string  # primary repo
      cross_repo: [string]  # other repos affected
      leverage_score: 1-10
      blast_radius: low|med|high|substrate
      est_effort: hours
      rationale: string  # why this matters now
      domain_lens: string  # which domain saw it
  drift_flags: [string]  # stuff that's wrong but not actionable now
  idle_signals: [string]  # stale work, dropped threads
```

### 5.2 Domain lenses

| Domain | Looks for |
|---|---|
| Architect | infra, scaling, file-contract drift, repo structure, dep gaps |
| Sentinel | security, vuln, secret leak, supply chain, governance gap |
| Sage | memory drift, vault staleness, knowledge consolidation needs |
| Navigator | strategic priority, roadmap drift, trade-off windows |
| Weaver | creative/narrative, brand-register drift, missed surface |
| Prime | synthesis opportunities, conflicting decisions to reconcile |
| Orchestrator | workflow gaps, automation opportunities, dispatch wins |

## 6. Synthesis + selection (Prime)

### 6.1 Ranking algorithm

```
rank_score = (leverage_score × repo_activity_30d × strategic_alignment)
             / (blast_radius_weight × est_effort_hours)

where:
  blast_radius_weight = {low: 1, med: 2, high: 4, substrate: 6}
  strategic_alignment = matches against strategic-vault.md horizons
  repo_activity_30d = commit count last 30 days
```

### 6.2 Conflict resolution

- Multiple agents flag same move → merge into one with unanimity badge
- Lone-wolf moves (only one agent saw it) → labeled `[only-flagged-by-X]`
- Hard conflict (Architect says ship, Sentinel says block) → Prime presents both, user arbitrates

### 6.3 Output

Top 3–5 moves presented as:

```
1. [unanimity ×5] Ship Cost Control Plane Phase 1 — Infisical foundation
   ↳ leverage 9 · blast med · ~6h · repo: SIS + cost-plane (new)
   ↳ rationale: unblocks W2/W3/W4 subsystems; secrets are everywhere

2. [only-flagged-by-Sage] Vault consolidation — 5d stale on operational
   ↳ leverage 4 · blast low · ~1h · repo: SIS
   ↳ rationale: memory pipeline observable but not running consistently
...
```

## 7. Execution + autonomy

### 7.1 Action classes + autonomy

| Action | Default | Trigger to ASK |
|---|---|---|
| read/grep/glob | AUTO | never |
| write local file | AUTO | never |
| run tests/lint/build | AUTO | never |
| `git commit` | AUTO | never |
| `git push` to feature branch | AUTO | never |
| open PR | AUTO | never |
| run `/starlight-board` | AUTO | never |
| merge PR | AUTO after green CI + QA pass | substrate REVISE pending |
| deploy non-prod | AUTO | never |
| deploy prod | AUTO after green CI + QA + post-deploy smoke probe (HTTP 200 from prod URL) | smoke probe fails — never auto-retry, always escalate |
| spend external API $ | AUTO under $20/session | over $20 cumulative |
| force-push any branch | ASK | always |
| force-push main | NEVER without explicit ack | always |
| `rm -rf` any path | ASK | always |
| drop DB / destructive DB op | NEVER without explicit ack | always |
| secret rotation | ASK | always |
| touch 3rd-party/alliance repo | NEVER (per `alliance_touched: true` flag in yolo-scope.json) | always — hard refuse, not ASK |
| web3 mainnet send | NEVER without explicit ack | always |
| web3 testnet send | ASK | always |

### 7.2 Subagent QA gate

Two-pass review pre-merge:
1. `pr-review-toolkit:code-reviewer` — adherence to project guidelines, style, patterns
2. `pr-review-toolkit:silent-failure-hunter` — error handling, fallback misuse, swallowed exceptions

Both must return high-confidence PASS or the merge is blocked. Failure path:
- Present findings to user via AskUserQuestion
- Options: fix-and-retry / accept-with-rationale / abandon-move

### 7.3 Substrate gate

A move touches substrate if it modifies any of:
- `SIP.md` / `SIS.md` / `ALLIANCE.md` / `STACK.md` / `VERTICALS.md` / `VOICES.md` / `REGISTRY.md`
- file-contract / attestation rules / sovereignty clause
- 10-IS taxonomy / domain sub-stack pattern
- CLAUDE.md / AGENTS.md governance sections
- `agents/AGENT_REGISTRY.md` / `skills/skill-rules.json`

On detection: `/starlight-board` auto-invokes BEFORE commit. Verdicts:
- PROCEED → board second-opinion clears, **then sovereign re-ack required** (see 7.3.1) before merge
- PROCEED-WITH-REVISE → REVISE items presented to user, fix-then-re-board-then-re-ack
- REVISE → halt, fix, re-board
- BLOCK → abandon move

### 7.3.1 Sovereign re-ack on substrate merges (per Board REVISE-1, 2026-05-11)

The /yolo session-open grant does NOT propagate to substrate-class merges. Even after a PROCEED verdict from `/starlight-board`, substrate-touching merges require fresh explicit Frank-ack via AskUserQuestion before the merge runs. The board verdict is necessary but not sufficient — Claude orchestrates both sides of the board call, so a Frank-side ack closes the adversarial loop. Rationale: substrate changes have permanent effects on every downstream vertical; session-grant overreach into sovereign-class decisions would collapse the adversarial-second-opinion design intent.

Non-substrate merges remain AUTO under the autonomy band — re-ack applies only to the substrate class enumerated above.

### 7.4 Verification before completion (Karpathy)

Every ship action must produce concrete verification evidence before being marked done:
- Tests passing: command output captured in audit log
- CI green: GitHub Actions API call response captured
- Deploy probe: HTTP 200 from production URL captured
- No "I think it shipped" — only "here's the proof"

## 8. State + persistence

### 8.1 Audit log

Per-session JSONL at `memory/_audit/yolo/<YYYY-MM-DD-HHMMSS>.jsonl`. One line per action:

```json
{"ts": "2026-05-11T14:32:17Z", "session": "abc123", "phase": "execute",
 "action": "git_commit", "move_id": "ship-cost-plane-p1",
 "args": {"message": "...", "files": [...]},
 "result": "ok", "verification": {"tests": "542/542", "elapsed_ms": 1240}}
```

### 8.2 Memory Bus atoms

Per substantive event, commit atom via `mcp__memory-bus__memory_commit`:
- Session open atom (proposals presented)
- Move pick atom (which move + why)
- Ship atom (what shipped + verification)
- Session close atom (summary + vault deltas)

Atoms are searchable via `mcp__memory-bus__memory_recall` across all 22 project memories.

### 8.3 Operational vault

`memory/vaults/operational-vault.md` — append on `/yolo-exit`:
- Session timestamp + duration
- Moves picked + outcomes
- Repos touched
- $ spent
- Drift flags surfaced

**Monthly roll-up (per Board sharpen, 2026-05-11):** on the first /yolo session of each calendar month, conductor produces a roll-up of the prior month's audit logs — total sessions, $ spent, moves shipped, drift events, board verdicts, repos most-touched — and appends to operational vault as a single human-readable digest. Closes the Seer concern about JSONL audit logs being unsearchable in aggregate.

### 8.4 Strategic vault

`memory/vaults/strategic-vault.md` — append only when move = strategic-class:
- New repo creation (vertical spawn, domain sub-stack)
- New business decision (entity, revenue stream, alliance)
- Tax/legal-class action
- Substrate amendment (SIP, STACK, VERTICALS, VOICES)
- Brand-register decision

Each entry: decision + rationale + reversibility + downstream implications.

### 8.5 Cross-Repo Indexer

On session close: session log indexed into Cross-Repo Indexer corpus (idempotent via sidecar state file per existing pattern).

## 9. Failure modes + kill switch

### 9.1 Kill switches

| Command | Behavior |
|---|---|
| `/yolo-abort` | Immediate halt mid-action. In-flight git operations rolled back where possible. Partial state saved. Audit log finalized with abort flag. |
| `/yolo-exit` | Graceful close. Full persistence chain runs. |
| Ctrl-C / session terminal close | Auto-checkpoint to operational vault + audit log on next session open. |

### 9.2 Drift detection

Post-session: diff committed changes against audit-log proposed actions. Any committed change not in audit log = drift event. Logged to `memory/_audit/yolo/_drift.jsonl` + surfaces in next session's scan as `drift_flags`.

### 9.3 Subagent QA failure

If code-reviewer or silent-failure-hunter blocks merge:
1. Present findings to user (AskUserQuestion)
2. Options:
   - Fix-and-retry: conductor remediates, re-runs QA
   - Accept-with-rationale: user explicitly ack, written to audit + strategic vault
   - Abandon-move: roll back, return to scan-or-propose

### 9.4 Board REVISE

Substrate move halted on REVISE. Items listed. User picks remediate-or-abandon. Remediation runs through same execute loop with REVISE items as the move spec.

### 9.5 Budget breach

Hit $20 session threshold → session pauses → user ack required to continue. Pause includes the proposed action that would cross the threshold.

### 9.6 Hallucinated repo/file

Pre-action subagent re-verifies via Read/Glob before any write. If verification fails → action blocked + drift flag.

## 10. Spec boundaries

### 10.1 In W1 ship (this spec)

- `/yolo`, `/yolo-exit`, `/yolo-abort` commands
- `yolo-conductor` skill (drives session loop, attached to Orchestrator agent)
- `yolo-scan` skill (council-shared, domain-parameterized)
- Audit log directory + schema
- Memory Bus integration (commit + recall)
- Vault write protocols (operational + strategic)
- Substrate-gate auto-invocation
- Subagent QA pattern integration
- Drift detection post-session pass
- `yolo-scope.json` registry (24 active sovereign repos, curated)
- Tests: substrate symmetry test (v81: yolo command + skills + agent profile coverage)

### 10.2 Deferred

- Per-invocation directive mode (`/yolo <goal>`) — W1.1 if requested
- Daemon mode — not in scope per session-mode decision
- Auditor agent upgrade (Approach B) — only if drift observed in practice
- Web3 / on-chain action handling — waits on web3 subsystem spec
- Cost-plane budget tracking integration — waits on cost-plane subsystem
- Cross-CLI dispatch within /yolo (sibling CLIs codex/opencode/gemini) — opt-in per move in W1; richer integration W1.2
- Voice Operator integration (cockpit voice mode trigger of /yolo) — W2+

## 11. Decisions made (flag if wrong)

| ID | Decision | Reasoning |
|---|---|---|
| D1 | Conductor role = Orchestrator agent + new yolo-conductor skill, NOT new agent | Keeps agent count flat (35 → 35), reuses existing role |
| D2 | Synthesizer role = Prime agent (existing), NOT Orchestrator | Prime's existing role is "synthesis of conflicting perspectives" — exact fit |
| D3 | Council scan returns structured JSON, not prose | Required for dedupe + ranking |
| D4 | yolo-scan is ONE shared skill, parameterized by domain | One skill, 7 invocation profiles. Avoids 7× skill maintenance burden |
| D5 | Strategic vault write fires only for: new repo / new business / tax-legal / substrate amendment | Operational vault catches everything else; keeps strategic vault signal-dense |
| D6 | Cockpit Continuity integration: every session opens named workspace + log | Reuses v0.2 plumbing |
| D7 | Conductor uses Task tool for parallel dispatch (single-message, 7 calls) | Established pattern in your memory (parallel-agent-pattern) |
| D8 | Budget threshold = $20/session default, configurable in yolo-scope.json | Tunable; first reasonable cap |
| D9 | Drift detection runs post-session, not real-time | Real-time adds latency; post-session catches what matters |
| D10 | Verification before completion is hard structural rule, not best-effort | Per Karpathy hygiene + verification-before-completion skill |

## 12. Parked next-up sketches (not designed yet)

### W2 — Cost & API Control Plane

- Foundation: Infisical for centralized secrets
- Read-only Phase 1: Vercel / Cloudflare / Kong / Langfuse / Tailscale / AI gateway cost telemetry
- Likely new "Infrastructure IS" vertical via `/spawn-domain-stack`
- Daily cost-watch loop (already partial via `vercel-cost-watch` skill)
- Spec opens after /yolo ships → /yolo drives the build

### W3 — Finance & Business IS

- Business-entity registry (Starlight Holding, Arcanea BV, others TBD)
- Revenue / cost / tax / runway dashboards
- Accounting workflow integration
- Reuses cost-plane primitives from W2
- Business IS deepening (universal layer extension), not new vertical

### W4 — Web3 IS

- **PREREQUISITE: name the use case** before spec opens
  - Payments (USDC settlement, invoice settlement)
  - On-chain SIP attestation (NFT-stamped sovereign decisions)
  - Treasury (multisig holdings management)
  - Token-gating (access control to SIS assets)
  - Identity (sovereign DID, wallet-as-identity)
  - All of the above (heaviest, slowest)
- Base L2 + MetaMask + (likely) Safe multisig + (maybe) WalletConnect
- New "Web3 IS" vertical via `/spawn-domain-stack`
- Hardest blast-radius profile (irreversible on-chain)

## 13. Open questions for the board

These surface for `/starlight-board` pressure-test:

- Q1: Does Hive (parallel council scan every session) violate the spirit of "lead with authority"? (Frank delegates the ship — but the ship itself benefits from full-council input. Tension or alignment?)
- Q2: Is `yolo-scan` skill in scope under SIP file-contract, or does it need a new domain root?
- Q3: Does auto-merge of substrate-touching PRs (after PROCEED board) cross the sovereignty clause? (Substrate change is sovereign-class; even with PROCEED, does Frank need to be in the loop for the actual merge?)
- Q4: Should drift detection write to a dedicated drift vault, or fold into operational?
- Q5: Budget threshold ($20) — is this the right primitive? Or should it be per-action? Per-API? Daily?

## 14. Build sequence

1. Commit this design doc (after board REVISE applied — done 2026-05-11)
2. `/writing-plans` → produce implementation plan
3. W1 ship under `/yolo` itself once minimum scaffolding exists, OR ship via `/superintelligence` first session, then bootstrap from there
4. v81 substrate symmetry test added to pre-commit hook
5. Memory note + strategic vault entry on ship

### 14.1 Phase-in plan (per Board REVISE-2, 2026-05-11)

`/yolo` ships with a **single-repo-cold-start** policy. The yolo-scope.json file enforces it.

- **Sessions 1–3:** scope locked to ONE explicit repo (Frank picks at install time, written to yolo-scope.json as `phase_in_repo`). Council scan runs against this one repo. Synthesis quality, drift detection, audit log shape, and verification probes get validated on minimal blast radius.
- **Session 4 unlock check:** before session 4, conductor surfaces a Phase-In Review packet: scan packets quality (signal vs noise), synthesis ranking quality (did Frank pick top-3 moves or bottom-2?), drift events caught vs missed, audit log readability.
- **Session 4+:** full 24-repo scope unlocked IF Phase-In Review passes Frank's review. Otherwise extend phase-in by 3 more sessions OR pause for spec revision.

Phase-in state stored in `yolo-scope.json::phase_in.{repo, session_count, unlock_status}`. Hardcoded gate — conductor refuses to scan beyond `phase_in_repo` until `unlock_status: open`.

### 14.2 Drift detection cadence (per Board REVISE-2, 2026-05-11)

Drift detection fires at TWO points:
1. **Post-session** (existing spec): diff committed changes against audit-log proposed actions. Drift events logged to `_drift.jsonl`.
2. **Session-open** (added per REVISE-2): on every `/yolo` invocation, conductor reads the prior session's `_drift.jsonl` AND scans the repo state for changes since prior session close. If days have elapsed silently, drift accumulated outside any session surfaces here. Drift events presented to Frank in session-open scan as `drift_flags`.

---

## 15. Board verdict log

**2026-05-11 — Starlight Board verdict: REVISE**

Load-bearing concern: structural self-review collapse (Claude orchestrates both sides of the board gate; PROCEED verdicts never reach Frank's eyes on substrate-class merges).

Strongest case for proceeding: spec is honest about every gate; cheapest validation (single-repo phase-in) costs days not weeks.

REVISE items applied same-day:
- REVISE-1: Sovereign re-ack on substrate merges (spec §7.3.1)
- REVISE-2: Phase-in plan + bidirectional drift detection (spec §14.1, §14.2)

Optional sharpens applied:
- Monthly audit-log roll-up to operational vault (spec §8.3)
- Alliance-touched repo hard-refuse via yolo-scope.json flag (spec §7.1)

Board verdict log: PROCEED-after-REVISE-applied → ready for commit + /writing-plans.

---

*Spec status: post-board, REVISE applied, ready for commit.*

*Built on SIP — sovereign-spawned, attestation-aware.*
