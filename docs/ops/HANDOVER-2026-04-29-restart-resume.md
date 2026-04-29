# Handover — 2026-04-29 (restart-resume)

> Cold-start brief for the post-machine-restart session. Reader: any agent.
> Frank restarted to free disk + reset. This handover supplements `HANDOVER-2026-04-29.md` (cockpit overnight) and `EOD-2026-04-29.md` (day recap) — read those first if you're new to the day; this doc is *the resume slice*.

## Situation

Frank just restarted his machine after:
1. Shipping v7.6.0 People Intelligence rename (8-phase commit chain `4ee6c54..596ad4a`, tag pushed to origin)
2. Pivoting to unblock voice-operator install for Master Plan v8 Phase 0
3. Hitting a 100% disk-full block during `pip install -e ".[dev]"`
4. Freeing space + resuming pip (exit 0, deps installed clean)
5. Hitting an `install.ps1` parser bug (em-dash UTF-8 issue, fixed by sed sweep)

Goal of resume: run `install.ps1 -TextMode`, validate cognition keys, advance into Master Plan v8 Phase 0 P0 deliverables.

## What's Done (this thread, post-v7.6.0)

- `private/voice-operator/install.ps1` — patched at `61f...?` working tree state (NOT YET COMMITTED on this thread):
  - `param([switch]$TextMode)` added; `-TextMode` skips Picovoice + Whisper + TTS smoke
  - Cognition validator accepts EITHER `OPENROUTER_API_KEY` OR `ANTHROPIC_API_KEY` (was hard-require both)
  - Helper function `Get-EnvValue` replaces fragile regex with line-by-line scan
  - All em-dashes (`—` U+2014) replaced with hyphens (`-`) — PS5.1 reads UTF-8 as cp1252 and breaks 3-byte sequences inside strings, causing parser to see mismatched braces
- `private/voice-operator/pyproject.toml` — pin `win10toast-click>=0.1.3` → `>=0.1.2` (0.1.3 doesn't exist on PyPI; latest is 0.1.2)
- `private/voice-operator/.env` — written from `.env.template` with shell-env-sourced keys: OPENROUTER_API_KEY (73 chars) ✓, ELEVENLABS_API_KEY (51) ✓, GROQ_API_KEY (56) appended
- `private/voice-operator/` Python package — `pip install -e ".[dev]"` succeeded; `starlight-voice-operator-0.1.0` + 26 deps installed
- `docs/superpowers/plans/2026-04-28-people-intelligence-rename.md` — full rename plan saved (untracked, may stay as-is or commit later)

## What's Not Done

- **install.ps1 -TextMode has not yet run successfully end-to-end.** Parser bug fixed; first real run is the resume action.
- **Picovoice account approval pending** (Frank has request in review). Voice-mode (wake-word + Whisper + TTS smoke) blocked until approval.
- **`ANTHROPIC_API_KEY` not set.** Cognition router uses OpenRouter as primary. Both should be set per Frank's earlier decision ("use both Anthropic and OpenRouter for other"). Add when convenient.
- **No commit yet for install.ps1 + pyproject.toml fixes.** Working tree changes only. Commit + push after resume validates the install runs.
- **PowerShell SecretManagement vault populated by Frank manually** — keys live in shell env AND in `.env` file. Vault is the long-term source-of-truth (per Frank's decision earlier in session); load-secrets.ps1 wrapper not yet built (deferred to Phase 0 alongside adapter abandonment test framework).
- **Disk pressure** — 3.2GB free at last check. Phase 0 deliverables (Whisper 3GB, mempalace+letta+screenpipe audits, Memory Bus daemon) need ~20GB headroom. More cleanup needed.

## Critical Context

- **Master Plan v8 just landed** at `docs/cockpit/MASTER-PLAN.md` (commits `4b3e65e` + `68e6537`). 24-week, 6-phase plan. Phase 0 begins now (2026-04-29 → 2026-05-12). Six P0 deliverables gate Phase 1 start: Memory Bus MVP + arcanea-flow connect + `/openclaw-audit` triple (mempalace/letta/screenpipe) + adapter abandonment test (`tests/adapters/abandonment.test.ts`) + authorlessness CI gate (`scripts/audit-authorlessness.ts`) + SIP § 5 amendment ("encoded-self forkable, not licensable").

- **3 parallel jarvis worktrees active** at `C:\Users\frank\jarvis-{1-browser,2-brain,3-cognition}` (branches `feature/{browser-bridge,brain-viz,cognition-cli-complete}`). They share base `d70b99a`. Don't touch their lanes (cognition-router internals, brain-viz, browser-bridge). Stay in: voice-operator, secret-store, Memory-Bus-daemon stub, audits.

- **Substrate-tier governance gate (CLAUDE.md):** any change touching SIP/SIS/ALLIANCE/STACK/VERTICALS/VOICES/REGISTRY/file-contract/attestation/sovereignty/10-IS-taxonomy/domain-sub-stack-pattern requires `/luminor-board` PRE-pass before commit/tag. SIP § 5 amendment for v8 Phase 0 needs its own pre-pass.

- **8 commits ahead of origin/main** at HEAD `71e2a82` (EOD doc). Push when stable point reached. v7.6.0 tag is at `596ad4a` and already pushed.

- **Em-dash + PS5.1 trap:** never use `—` (U+2014) inside strings in `.ps1` files. The repo has UTF-8 without BOM as default; PS5.1 default code page is cp1252. 3-byte em-dash sequences break string parsing. Use `-` or `--` in PS files. Comments are safer but still risky. Fix already applied to install.ps1.

- **Encoded-self forkable, not licensable** (SIP § 5 amendment in flight per board) — substrate doctrine: friend-forks inherit the *pattern*, never the *person*. Authorlessness CI gate enforces structurally.

## Next Actions (ordered)

1. **Run `install.ps1 -TextMode`** to validate cognition keys + smoke check the install:
   ```
   ! cd /c/Users/frank/Starlight-Intelligence-System/private/voice-operator && powershell.exe -ExecutionPolicy Bypass -File install.ps1 -TextMode
   ```
   Expected: cognition keys pass, voice-mode warned-skipped, dependencies installed message, optional Task Scheduler prompt.

2. **Commit install.ps1 + pyproject.toml fixes** with message like:
   ```
   fix(voice-operator)(v7.6.x): TextMode flag + em-dash parser fix + win10toast pin

   - install.ps1: -TextMode skips Picovoice/Whisper/TTS smoke; accepts OPENROUTER as cognition substitute
   - install.ps1: em-dashes (U+2014) replaced with hyphens (PS5.1 cp1252 trap)
   - pyproject.toml: win10toast-click >=0.1.3 → >=0.1.2 (0.1.3 doesn't exist on PyPI)

   Built on SIP.
   ```
   Stage explicitly: `git add private/voice-operator/install.ps1 private/voice-operator/pyproject.toml`. NOT `git add -A` (untracked files include music-is/ vertical, dashboard/, knowledge-graph/ etc. — likely belong to other parallel sessions).

3. **Free more disk space** to reach 20GB+ free for Phase 0:
   - Run `pp` (Peak Performance system audit) command to score machine health holistically
   - Or use WinDirStat: `! winget install WinDirStat.WinDirStat -e` then GUI scan
   - Likely culprits: `C:\Windows\WinSxS`, hibernation file, Ollama models, old node_modules in inactive repos, Windows Update cache

4. **Push v7.6.0 commit chain to origin** if not already there, plus the install.ps1 fix:
   ```
   ! git push origin main
   ```
   Verify with `git log --oneline origin/main..HEAD` shows zero diff.

5. **Begin Phase 0 P0 deliverables** per `docs/cockpit/MASTER-PLAN.md` § 4. Read `v8-architecture.md` § 2 (Memory Bus contract) before scaffolding the daemon. Order suggested in master plan: Memory Bus MVP → arcanea-flow connect → audits triple → adapter abandonment test → authorlessness CI gate → SIP § 5 amendment.

6. **Get `ANTHROPIC_API_KEY` when convenient.** Anthropic direct backend is faster + cheaper for Claude calls than OpenRouter passthrough. Frank's decision was to use both. Add to vault via `Set-Secret -Name anthropic-api-key -Vault Starlight` then sync to `.env`.

7. **Picovoice approval watch.** When Frank's request approves, run `install.ps1` (no `-TextMode`) to complete voice-mode setup. Train the `Starlight.ppn` wake-word at console.picovoice.ai, save to `private/voice-operator/models/porcupine/Starlight.ppn`.

## Files to Read First

- `docs/ops/HANDOVER-2026-04-29.md` — comprehensive 547-line cockpit overnight handover (read this if cold-start)
- `docs/ops/EOD-2026-04-29.md` — day recap with smoke acceptance results (5/7 pass, 341 tests)
- `docs/cockpit/MASTER-PLAN.md` — 24-week plan, 6 phases, 6 P0 deliverables for Phase 0
- `docs/cockpit/v8-architecture.md` § 2 — Memory Bus daemon contract (P0 priority)
- `docs/boards/luminor-cockpit-v8.md` — v8 board pre-pass verdict + 6 REVISE items
- `docs/boards/openclaw-v76-audit.md` — v7.6.0 ship audit (zero CRITICAL/HIGH/MEDIUM, all 3 LOW closed by Phase 8 release commit)
- `private/voice-operator/install.ps1` — current state of patched script (verify still parses clean)
- `private/voice-operator/.env` — keys present, gitignored (do not commit)
- `CLAUDE.md` § "Substrate-tier governance gate" — board-before-tag invariant rules

## Repo Map

| Repo | Purpose | State |
|---|---|---|
| `Starlight-Intelligence-System` (main thread) | Substrate + reference operational layer; v7.6.0 tagged at `596ad4a` | HEAD `71e2a82`, 8 ahead of origin/main, working tree has install.ps1 + pyproject.toml unstaged + 20+ untracked dirs/files from other sessions |
| `jarvis-1-browser` worktree | feature/browser-bridge | At `d70b99a`, partial — half done per EOD |
| `jarvis-2-brain` worktree | feature/brain-viz | At `d70b99a`, fully shipped per EOD (3D particle viz live at `/brain`) |
| `jarvis-3-cognition` worktree | feature/cognition-cli-complete | At `d70b99a`, fully shipped per EOD (router + 4 backends + audit log) |
| `arcanea-flow` sibling | Swarm/hooks/RL execution; bridge contract via Memory Bus | At `C:\Users\frank\arcanea-flow`, connect-not-absorb pattern (per memory `project_arcanea_flow_connect_not_absorb.md`) |

## Memory pointers (relevant for next agent)

- `project_v76_people_rename.md` — v7.6.0 rename ship complete (this session) ← still authoritative
- `project_v753_cognition_lcc.md` — Cognition refactor + LCC + 4-surface cockpit
- `project_agentdb_singleton_constraint.md` — AgentDB-per-tab breaks at 10+ tabs; Memory Bus is now Phase 0 P0
- `project_arcanea_flow_connect_not_absorb.md` — sibling repo bridge pattern
- `reference_mempalace_oss_memory.md` — Phase 0 audit candidate alongside Letta + screenpipe
- `feedback_board_before_tag.md` — substrate-class changes invoke `/luminor-board` BEFORE commit/tag
- `feedback_parallel_agent_pattern.md` — 3 background agents + main thread for substrate work pattern

---
**Built on SIP** · /handover · 2026-04-29
