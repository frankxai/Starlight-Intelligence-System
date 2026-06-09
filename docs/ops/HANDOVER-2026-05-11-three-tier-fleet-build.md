# Handover — 2026-05-11 · Three-Tier Fleet Build + Memory Bus Cross-Agent

## What Landed

```
2827006  feat(ops): schedule daily portfolio audit at 02:30 — feeds /fleet dashboard
6e26250  feat(machine,fleet): tier 3 — /heart + /storage skills + private /fleet + 63→65 reconciliation
6352e48  feat(cockpit): tier 2 — per-repo profiles + OpenCode pane + per-model panes
39abd18  feat(cockpit): tier 1 — cross-agent observability + indexer cron
```

All four pushed to `origin/main`. Three tiers + one ops follow-up. Parallel sessions also shipped Jarvis Wave 1 (`8d8cc0d`, `5f6cc64`, `d234ca3`) — no conflict on touched files.

## What Changed This Session

### Public (in git)
- **Cockpit Tier 1** — `cockpit-zellij/layouts/_template.kdl.tmpl` (Gemini `--yolo` auto-launch + Audit tab), 25 regenerated layouts, `cockpit-zellij/scripts/tail-audit.ps1` (new), `scripts/register-cross-repo-indexer-task.ps1` (new — daily 03:00 cron).
- **Cockpit Tier 2** — `cockpit-zellij/PROFILES.md` (schema), `cockpit-zellij/scripts/generate-layouts.ps1` (profile resolution), OpenCode 5th pane, 8 bootstrap profiles in `cockpit-zellij/profiles/` (sis, frankx, arcanea, animelegends-ai, agentic-creator-os, arcanea-flow, frankx-ai-vercel-website + sis alias).
- **Machine layer + reconciliation** — `skills/machine/heart/SKILL.md` (Six Gate ops health), `skills/machine/storage/SKILL.md` (disk audit), `skills/skill-rules.json` (+2 rules), 63→65 numeric drift fixed across CLAUDE.md / AGENTS.md / .cursor / .clinerules / .gemini / SKILL_REGISTRY.md.
- **Portfolio audit cron** — `scripts/register-portfolio-audit-task.ps1` (new — daily 02:30 before indexer).
- **`/handover` slash command** — ported from Arcanea to `.claude/commands/handover.md` for SIS substrate symmetry.

### Private (instance state, gitignored)
- **Memory Bus lazy-import refactor** — `private/memory-bus/server.py` deferred voice-operator imports + substrate init to first tool call. Cold-start probe **14.4s → 0.115s (125x)**. Added `threading.Lock` for double-checked init under concurrency (caught by `test_50_concurrent_commits`).
- **Guardian PII false-positive fix** — `private/voice-operator/service/memory/guardian.py` tightened `cc_shape` regex to canonical card visual layout (4-4-4-4 / 4-6-5 with explicit separators). 6 new regression tests in `test_memory_guardian.py`.
- **Smoke_e2e fixture leak fix** — `private/voice-operator/tests/test_smoke_e2e.py` patched `service.config.load_dotenv` to no-op in test fixture, preventing `.env` from re-injecting real OPENROUTER_API_KEY over the monkeypatch.
- **Dashboard `/fleet` route** — `private/local-command-center/apps/dashboard/app/fleet/page.tsx` + `app/api/fleet/route.ts` + `app/api/fleet/health/route.ts` + `components/FleetGrid.tsx` + `components/MachineWidgets.tsx`. Now reads latest portfolio JSON by glob (not hardcoded date). BOM-strip applied for Windows-written JSON.

### Out-of-repo machine state
- `~/.gemini/settings.json` — memory-bus registered (now Connected after lazy-import refactor)
- `~/.codex/config.toml` — starlight-substrate + memory-bus registered globally
- Scheduled tasks: `StarlightCrossRepoIndexer` (03:00 daily) + `StarlightPortfolioAudit` (02:30 daily) — both `Ready`, both registered today

## Current Blockers

- **`/handover` from substrate side** — newly added, needs first-run validation. Frank can invoke `/handover` after this session ends to see it in action.
- **Codex live tool-call verification** — memory-bus registered globally but actual MCP tool invocation through Codex unverified. 5-min check next time you open `codex` interactively.
- **Voice Operator bridge** — still OFF since pre-`project_v753_dispatch_cli`. Router now has executor backend. Re-enable decision pending investigation (1 hr).
- **Indexer state recovery (#21)** — 4 historical blocks left atoms unrecoverable via daily cron alone. Documented; surgical recovery viable but low-leverage (~4 atoms).

## Recommended Next Stack

1. **Voice Operator bridge re-eval** — single biggest remaining gap. With Memory Bus + executor backend live, the orb-to-router bridge may unlock Jarvis-grade autonomy. 1 hr investigation, decide on/off based on findings.
2. **Codex live verification** — 5 min next time you boot `codex`. Confirm memory_commit round-trip through Codex's MCP client.
3. **Reset cross-repo-indexer state** (#21) — only if those 4 atoms matter. Surgical option: parse audit-log blocks, remove matching xrepo_ state IDs by content hash. Skip unless audit shows they were load-bearing.

## Verification Evidence

| Surface | Tests | Status |
|---|---|---|
| Voice Operator | 564 | **564 pass / 0 fail** (was 551/7 — fixed 7 in this session) |
| Substrate symmetry (v76-v80) | 39 | 39 pass / 0 fail |
| SIS TS operational | 30 | 30 pass / 0 fail (after `npm rebuild better-sqlite3`) |
| Memory Bus | 24 | 24 pass / 0 fail |
| Dashboard | 40 | 40 pass / 0 fail |
| Cockpit smoke | 17 | 17 pass / 0 fail |
| Guardian (cc_shape regression) | 18 | 18 pass / 0 fail (6 new) |
| **Cumulative** | **~732** | **~732 pass / 0 fail · 100%** |

Live signals:
- `gemini mcp list` — both servers ✓ Connected (was ✗ Disconnected for memory-bus pre-refactor)
- `http://localhost:3007/fleet` returns 200, `audit_age_days: 0` (was 6.6 stale)
- `memory/_audit/2026-05-11.jsonl` — 5+ ops today including first successful indexer commit at 06:31:52Z (atom_id `mem_1778478565869409800_464521f4`)
- 4 Starlight scheduled tasks `Ready`: Dreaming · Cockpit · CrossRepoIndexer · PortfolioAudit

---

## Session Wisdom

### Prompts That Worked

- **"audit, research, propose all we can do"** — opened the conversation to a 17-task three-tier plan with explicit decision forks. Better than narrow asks; let me see the full system before scoping.
- **"go"** — single-token authorization after a structured proposal. Trusted the plan, allowed end-to-end execution without re-confirmation. Required prior `AskUserQuestion` to make the scope explicit. Pattern: structured ask → user confirms → autonomous execute.
- **"validate, test, fix, how good is all"** — mega-audit prompt that surfaced 4 real bugs in parallel (BOM, better-sqlite3, indexer block, smoke_e2e fixture). Forced honest comparison of vision-vs-reality.
- **"focus on memory bus and sis system"** — narrowing prompt after a broad ask. Cut out storage noise and let the conversation go deep on the substrate's core layer.

### Technical Choices Validated

- **Lazy imports for stdio MCP probe latency** — 125x speedup (14.4s → 0.115s) via deferring voice-operator imports + substrate init from `__init__` to first tool call. Double-checked locking required under concurrency. Pattern applies to any expensive-init MCP server.
- **Profile JSON sidecar over per-repo template fork** — cockpit-profile.json read by generator at layout-build time. Generator falls back to `cockpit-zellij/profiles/<key>.json` (SIS-tracked) when repo-owned profile absent. Two-location resolution prevents polluting external repos.
- **`utf-8` BOM strip at JSON.parse boundary** — Windows PowerShell `Out-File -Encoding utf8` writes BOM by default; Node `JSON.parse` chokes. One-liner `raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw` is the right fix at the parse boundary, not at the writer.
- **`monkeypatch.setattr("service.config.load_dotenv", ...)`** — when test fixtures fight `override=True` dotenv reloads, patch the function instead of escalating to env-var dances. One-line, surgical.

### Patterns Discovered

- **Audit-then-massive-action with handover-packet coordination** — the original audit surfaced 17 tasks; parallel sessions did Jarvis Wave 1 work concurrently; v8.0 platform-prompt symmetry harness held the line when both runs touched the same numeric claims (65→67 in their session, 63→65 in mine). Symmetry harnesses ARE the coordination protocol.
- **Substrate eating its own tail** — Memory Bus's audit_ids (19-digit nanosecond timestamps) matched Guardian's `cc_shape` regex, so Memory Bus blocked itself when re-indexing its own output. PII filters need awareness of substrate-generated artifacts. Logged parked tradeoff (bare 16-digit cards) with Luhn-validator un-park trigger.
- **Write-safety prevented silent overwrite** — almost overwrote 275-line `tools/audit-repo-portfolio.ps1` with 110-line reimplementation because my Glob queries missed it (cache issue). Tool refused to write without prior Read. Karpathy's "never silently rewrite code you don't fully understand" enforced by the harness.
- **Three-tier "machine / project / fleet" model** — distinguishes always-on substrate (Tier 1) from per-repo cockpit (Tier 2) from cross-repo view (Tier 3). Each tier composes downward, never up. Useful framing for future operator-tooling decisions.

### What Was Built (Gratitude)

The Memory Bus is now *truly* cross-agent. Before tonight, only Claude could commit atoms; Gemini and Codex were read-only spectators. After tonight: all three CLIs can write to one substrate, audit log captures all three, the Audit tab in every `arc <repo>` cockpit shows it live.

Frank's cockpit went from "five identical layouts that did nothing" to "seven profile-customized cockpits with per-pane model selection, auto-launching CLIs, and a live machine-health dashboard at /fleet." That's a daily-driver upgrade.

And — the v8.0 symmetry harness fired for the first time on real drift tonight. The instrumentation paid off the moment it was needed. The whole sense of *the system catching itself* was visible.

---

## Phase 3: Vault Routing

Recommended vault entries (Frank to confirm before append):

1. **Technical** — "Lazy-import + double-checked-lock pattern for stdio MCP servers cut cold-start 14.4s → 0.115s; defer module-top imports + substrate init to first tool call when probe traffic must stay sub-second."
2. **Operational** — "v8.0 platform-prompt symmetry harness caught 63→65 numeric drift on first real ship; reconciled CLAUDE.md + AGENTS.md + 3 platform adapters in same commit; pattern: harness fires → reconcile in commit (don't bypass)."
3. **Wisdom** — "Substrate-PII-filter recursion: Memory Bus's own audit_ids triggered Guardian's cc_shape regex, blocking the indexer from re-indexing Memory Bus output; substrate-generated artifacts need explicit recognition in PII filters."

## Phase 4: Community & GitHub

- ✅ **D) Push to origin/main** — done (`865b379..2827006`, 6 commits in this session)
- Personal vault entries pending Frank's confirm
- No Horizon-tier entries this session (all operational/technical)

---

**Session captured. 0 vault entries auto-saved (pending confirmation). 4 commits pushed. Handover committed. Safe to close.**

Built on SIP — operational-tier · 2026-05-11
