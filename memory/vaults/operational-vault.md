---
type: vault
vault: operational
retention: rolling-90d
writers:
- orchestrator
- prime
readers: all
last_consolidated: '2026-05-11'
---

# Operational Vault

> *"Know the current state. Navigate from here."*

**Vault Type:** Operational State & Metrics
**Retention:** Rolling (90 days active, then archived)
**Primary Writers:** Starlight Orchestrator, Starlight Prime
**Access:** All agents (read), Orchestrator + Prime (write)

---

## Vault Index

| Date | Entry | Category | Confidence |
|------|-------|----------|------------|
| 2026-02-10 | System Initialization State | system-state | 1.0 |
| 2026-02-10 | Ecosystem Connection Status | ecosystem-state | 0.90 |
| 2026-05-06 | Starlight Ascension (E2E Upgrade) | ecosystem-state | 1.0 |
| 2026-05-08 | v8.0 Build Repair + Verification | quality-state | 1.0 |
| 2026-05-11 | SIS v0.1 Build Handoff + Memory Health Gate | execution-state | 1.0 |
| 2026-05-12 | v0.1 Event Spine Operator Surface | execution-state | 1.0 |
| 2026-05-13 | Overnight Deep Ship — Codex v01 integration + v84 symmetry + MEMORY.md compaction | execution-state | 1.0 |
| 2026-05-20 | Site + Agent Harness Review — adapter drift and environment gate failures | quality-state | 0.95 |

---

## Entries

### [2026-05-20] Site + Agent Harness Review — adapter drift and environment gate failures

**Category:** quality-state
**Confidence:** 0.95
**Source:** Codex / in-depth review pass
**Related:** AGENTS.md, CLAUDE.md, README.md, .gemini/GEMINI.md, .antigravity/instructions.md, scripts/check-agent-harness.mjs, test/v80-platform-prompts.test.ts, site/src/app/page.tsx, transmissions/channels/acos-channel.md, context/repo-contexts/acos-context.md

Review found the buildable surfaces are strong but not fully trustworthy as published truth. Root `npm run lint`, site lint, site build, and v80 platform symmetry all pass, but `npm run agents:harness-check` fails because it still expects 68 skills while canonical rules now report 71. `npm run test:operational` fails only at `better-sqlite3` native ABI mismatch (node module 137 vs runtime 115), repeating the prior rebuild fragility. v80 symmetry has a blind spot: it does not include `.antigravity/instructions.md`, and its tier-context blacklist can skip global agent-count drift such as 35/42-agent claims. Public site builds, but homepage and rendered HTML still publish 35 agents while repo reality includes newer agent surfaces; architecture page omits Antigravity from platform chips. ACOS channel/context are stale from 2026-02-10 while ACOS repo is now v11.0.0 and ahead of origin by three commits; ACOS harness health points to `pnpm test` even though its package has no test script.

Priority repair order: update harness expectations from static regex to canonical parsed counts; include Antigravity in v80 prompt inventory; tighten global/local claim extraction; reconcile public site counts/platform chips; refresh ACOS transmission/context; rebuild native deps under the active Node runtime before full verify.

### [2026-05-13] Overnight Deep Ship — Codex v01 integration + v84 symmetry + MEMORY.md compaction

**Category:** execution-state
**Confidence:** 1.0
**Source:** Claude Opus 4.7 (1M context) — single extended turn under sovereign-class authorization
**Related:** src/modules.ts, src/cli.ts, src/mcp-server-v01.ts, src/ledgers.ts, test/v84-modules.test.ts, test/_lib/repo.ts, skills/orchestration/gencreator-stack/, MEMORY.md (auto-memory)

Three commits to main (`542076c`, `6f9703c`, `e8a0219`) under directive "continue all night, deliver end outcome after hours of well thought out decisiveness, deep action, engineering and design world class may 2026." Substrate-side ship of Codex's parallel-session Track A v0.1 WIP + the substrate symmetry-test cascade it triggered + auto-memory hygiene.

**Implemented:**
- Codex Track A v0.1 module/lifecycle WIP integrated + committed (`6f9703c`) — 7 new CLI subcommands, 5 new sis.* MCP tools, 11-module runtime registry, 49+ new conformance tests.
- 9th substrate symmetry test shipped (`e8a0219`) — `test/v84-modules.test.ts` locks `src/modules.ts` against drift from STACK.md 10-IS + verticals/ dir + privacy invariants. EXEMPT_MODULES empty (goal state).
- Test-infra + skill registration ship (`542076c`) — gencreator-stack skill properly slotted into `skill-rules.json` + `SKILL_REGISTRY.md`; walker normalization (assets/ exemption) in `test/_lib/repo.ts`; 5 platform-prompt files reconciled (CLAUDE.md, AGENTS.md, .cursor, .clinerules, .gemini) bumped 67 → 68 skills.
- Auto-memory compaction — MEMORY.md 30,322 → 13,916 bytes (54% reduction). All 85 entries preserved, each tightened to <150 char index hook.
- Infrastructure unblock — `npm rebuild better-sqlite3` fixed Node-24 NODE_MODULE_VERSION 115→137 mismatch; unblocked `RetrievalIndex.rebuildFromVaults` which had been silently failing.
- Pre-commit hook updated — substrate test count 8 → 9.

**Verification:** TypeScript build clean. Full `npm test` 0 failures across 144+ tests in 18+ suites. 86 substrate symmetry tests green in pre-commit hook (~1.9s wall-clock). 34 Track D risk-dimension evals green. EXEMPT_MODULES + EXEMPT_DRIFT + EXEMPT_PHANTOMS all empty (goal state). MEMORY.md auto-load budget 13.9 KB / 24.4 KB.

**Not touched (scope boundary):** ULTRAPLAN Phase 0 items 0.1, 0.2, 0.3, 0.5, 0.6, 0.7 all live in `private/` (gitignored). Item 0.4 lives in `C:\Users\frank\Arcanea\`. None were in SIS substrate scope. Status matrix in `docs/ops/PHASE-0-EXECUTION-LOG-2026-05-13.md`. Forward dispatch pointer: run `/code-review` on `6f9703c`, then ship Phase 0.1+0.6+0.7 (private/, ~15 min total), then investigate Phase 0.5 KG indexer starvation (13× brain-data gap per ULTRAPLAN Gap 2).

**Documentation shipped:**
- `docs/superpowers/plans/2026-05-13-overnight-deep-ship.md` — the night's plan doc per writing-plans skill
- `docs/ops/PHASE-0-EXECUTION-LOG-2026-05-13.md` — Phase 0 honest status matrix
- `docs/ops/HANDOVER-2026-05-13-overnight-deep-ship.md` — full handover with session wisdom + Karpathy checks + falsifiers

### [2026-05-12] v0.1 Event Spine Operator Surface

**Category:** execution-state
**Confidence:** 1.0
**Source:** Codex / Plan implementation pass
**Related:** src/ledgers.ts, src/cli.ts, src/mcp-server-v01.ts, src/modules.ts

The SIS v0.1 spine was extended from static ledger primitives into operator-addressable lifecycle controls. JSONL remains canonical, SQLite remains a rebuildable shadow index, and the LCC/dashboard/MCP surfaces can now consume the same WorkPacket and AgentEvent lifecycle.

**Implemented:**
- WorkPacket lifecycle transition helper emits AgentEvent and appends a new WorkPacket snapshot.
- CLI surface added for `events tail`, `memory rebuild`, `workpacket next/start/block/complete`, and `modules list/enable/disable`.
- MCP v0.1 surface added for `sis.events.tail`, `sis.workpacket.next`, `sis.workpacket.complete`, `sis.memory.rebuild`, and `sis.module.list`.
- Module registry scaffold established for Code IS, Second Brain IS, Business IS, Wealth IS, Voice/Video IS, People IS, Music IS, Sound IS, MIS, RIS, and Sensory Companion.
- Rebuild now tolerates legacy snake_case Decision rows while keeping new typed writes strict.

**Verification:** TypeScript no-emit passed. `test/v01-ledgers.test.ts`, `test/v01-mcp-tools.test.ts`, and `npm run test:operational` passed. `starlight memory rebuild` rebuilt `agent-ops.sqlite` from current JSONL ledgers.

---

### [2026-05-11] SIS v0.1 Build Handoff + Memory Health Gate

**Category:** execution-state
**Confidence:** 1.0
**Source:** Codex / Operational lead pass
**Related:** docs/ops/prompts/starlight-v01-vision.md, docs/ops/prompts/starlight-v01-build-now.md

Frank's expanded SIS v0.1 vision was converted into a two-layer Claude Code handoff: one persistent vision file and one bounded build-now file. The split preserves the full civilization-scale architecture while giving the coding agent a Friday-demo scope: monorepo skeleton, Dashboard Lite, MCP local tools, SQLite/schema persistence, WorkPacket flow, AgentEvent ledger, Decision ledger, Pack Registry, Council review, Vault entry, Brain Graph, and demo script.

**Local action completed:**
- Added a repo-local memory health inspector and surfaced it through `starlight doctor` and `starlight vault health`.
- Added `starlight vault refresh` / `vault consolidate` to run the existing dreaming pass, stamp all six vaults, and print memory surface health.
- Refreshed all six vault consolidation stamps to 2026-05-11.
- Verified typecheck and operational regression coverage after rebuilding the native `better-sqlite3` binding.

**Known gap:** the current dreaming pass processed 0 items because the active voice-session surface is Markdown-first. Future work should add first-class `.md` voice-session promotion into the vault/mempalace pipeline instead of treating freshness stamps as full semantic consolidation.

---

### [2026-05-08] v8.0 Build Repair + Verification

**Category:** quality-state
**Confidence:** 1.0
**Source:** Codex / Post-Gemini repair pass
**Related:** Technical Vault - Core Regression Harness Pattern

Gemini's v8.0 work landed in the correct SIS repo and included real architecture changes, but the repo was not shippable because `npm run build` failed on public API drift between `src/cli.ts` and `src/index.ts`.

**Repair completed:**
- Restored `StarlightIntelligence.generateContext()`, `routeTask()`, and `orchestrate()` as documented library/CLI API.
- Updated `StarlightIntelligence.remember()` to accept the documented object form while preserving vault classification.
- Fixed file-style `memoryPath` handling so `.starlight/memory.json` resolves to the intended JSONL directory, not `.starlight/memory.json/memory.jsonl`.
- Added a focused regression in `test/core-regressions.test.ts` covering the documented API and JSONL path behavior.

**Verification:** `npm run verify` passed on 2026-05-08: root typecheck, operational tests, substrate tests, package build, site lint/build, and console lint/build.

---

### [2026-05-06] Starlight Ascension (E2E Upgrade)

**Category:** ecosystem-state
**Confidence:** 1.0
**Source:** Starlight Central Command / Machine-Wide Audit
**Related:** Strategic Vault - Centralized Command Refactor

Comprehensive machine-wide upgrade performed to establish **Starlight Central Command** as the primary machine-level operator.

**Key Structural Changes:**
- **Central Authority**: Sworn in Starlight (via Gemini CLI) as the global orchestrator.
- **Unified AI Grid**: Synchronized `cl/cd/g/oa/cur/st` shortcuts across PowerShell and Bash.
- **Protocol Alignment**: Standardized `GEMINI.md` and `MEMORY.md` across 8 core repositories.
- **Autonomous Mode**: Enforced `--yolo` as the default mandate for high-velocity AI Ops.

**Repository Connectivity Status:**
| Repository | Status | Harness | AI-Ready |
| :--- | :--- | :--- | :--- |
| Arcanea | [STABLE] | ao-init | YES |
| SIS | [PRIMARY] | - | YES |
| FrankX | [STABLE] | - | YES |
| GenCreator | [STABLE] | - | YES |
| Vibeclubs | [STABLE] | - | YES |
| AnimeLegends | [STABLE] | - | YES |
| DPI | [STABLE] | - | YES |
| Business | [STABLE] | - | YES |

All sectors operational. Swarm Command Center active.

### [2026-02-10] System Initialization State

**Category:** system-state
**Confidence:** 1.0
**Source:** Starlight Orchestrator / System Initialization
**Related:** Strategic Vault - Architecture Decision

Starlight Intelligence System v1.0.0 initialized with:

- **Agents:** 7 (Prime, Architect, Orchestrator, Sentinel, Sage, Weaver, Navigator)
- **Skills:** 16 across 4 categories (Intelligence, Orchestration, Memory, Integration)
- **Vaults:** 5 (Strategic, Technical, Creative, Operational, Wisdom)
- **Commands:** 6 (starlight, vault, transmit, synthesize, council, navigate)
- **Transmission Channels:** 4 (ACOS, Arcanea, AI-Ops, Broadcast)
- **Hooks:** 4 categories (pre-task, post-task, on-error, on-sync)

All systems nominal. Ready for intelligence operations.

---

### [2026-02-10] Ecosystem Connection Status

**Category:** ecosystem-state
**Confidence:** 0.90
**Source:** Starlight Orchestrator / Ecosystem Assessment
**Related:** Strategic Vault - Ecosystem Integration Strategy

Connected repositories and status:

| Repository | Channel | Status | Last Sync |
|-----------|---------|--------|-----------|
| agentic-creator-os | ACOS Channel | Connected | 2026-02-10 |
| arcanea | Arcanea Channel | Connected | 2026-02-10 |
| ai-ops | AI-Ops Channel | Connected | 2026-02-10 |

Context files maintained for each repo in `context/repo-contexts/`.

---


## Voice capture 2026-05-10T20:41:06.300157+00:00

- Packet: 01H4R9N6XK6ZWXK9X6N6XK7G2XF
- Utterance: Okay Jarvis, tell me which CLIs do you have access to?
- Task: List accessible CLIs and their functions.

---

### [2026-05-11] Local Command Center Extended With Cursor + GitHub Control Plane

**Category:** orchestration-state
**Confidence:** 0.95
**Source:** Codex CLI session
**Related:** LCC dispatch router, GitHub Copilot CLI, Dependabot operations

Added operational dispatch surfaces for Cursor Agent, GitHub Copilot CLI, and GitHub CLI repository operations inside the private voice-operator LCC router.

- New intent classes: `ide-agent`, `github-agent`, `repo-ops`, `ci-debug`.
- New dispatchers: `cursor` via `cursor agent --print`, `copilot` via `gh copilot`, `github` via read-first `gh` commands.
- GitHub adapter is deliberately read-first: repo metadata, PRs, issues, releases, Actions runs, and Dependabot alerts. Mutating GitHub actions should be explicit subcommands later.
- Machine capability registry now writes `~/.starlight/agent-capabilities.json`.
- Verification: focused router/CLI tests passed, 52/52. Dry-runs route Dependabot to `github`, Cursor tasks to `cursor`, and GitHub Copilot CLI tasks to `copilot`. Live read-only `gh repo view` smoke passed for `frankxai/Starlight-Intelligence-System`.

---

### [2026-05-12] Jarvis-Grade LCC Slice: Browser Routing + Safer Launcher Defaults

**Category:** orchestration-state
**Confidence:** 0.95
**Source:** Codex CLI session
**Related:** `docs/ops/PLANNING-WITH-FILES-2026-05-12-JARVIS-GRADE-ORCHESTRATOR.md`, `docs/ops/ULTRAPLAN-2026-05-12.md`

Implemented a focused operational slice toward the Jarvis-grade Starlight setup.

- Added file-backed execution plan: local-first Next.js LCC remains primary, Windows/Tauri shell becomes lifecycle wrapper later, Vercel is read-mostly demo/approval mirror, Starlight Orchestrator owns routing/policy.
- Promoted Browser Use + Playwright to a first-class orchestrator dispatcher: new `browser` intent class routes browser/site/app navigation and inspection tasks to `BrowserDispatcher`.
- Updated routing TOML and setup template so browser, Cursor, GitHub Copilot CLI, GitHub CLI, Codex, Gemini, OpenCode, and Claude are one dispatch fleet.
- Made Arcanea voice orb cognition bridge opt-in via `STARLIGHT_ENABLE_COGNITION_BRIDGE=1`; default launcher path keeps orb-native voice faster while Starlight executor loop matures.
- Added dashboard `/api/orb/health` proxy and switched `CockpitOrbFrame` to local API health probing instead of browser-side opaque CORS probing.
- Verification: 79/79 focused Python tests passed; dashboard `npm run test` passed 239 tests; dashboard `npm run type-check` passed. Live probes: LCC `:3007/api/status` reachable, orb `:7777/api/health` reachable, FastAPI `:7373/healthz` reachable.

---

### [2026-05-12] Arcanea.ai Funnel Foundation Rebuilt

**Category:** cross-repo-delivery
**Confidence:** 0.95
**Source:** Codex CLI session
**Related:** Arcanea channel, Vercel/Next.js production surface

Rebuilt `C:\Users\frank\arcanea.ai` from thin landing shell into a committed Next.js 16 App Router funnel foundation on branch `main`.

- Commit: `7526ea6 feat: rebuild Arcanea funnel foundation`.
- Added premium responsive landing, application page, `/about`, `/retreats`, `/locations`, `/journal`.
- Added `POST /api/applications` with Zod validation, Supabase/Resend production wiring, and local JSONL fallback for development only.
- Added Vercel Analytics and Speed Insights hooks, loaded Google fonts through `next/font`, modern ESLint flat config, lockfile, and Turbopack root pin.
- Verification passed: `npm run lint`, `npm run typecheck`, `npm run build`.
- Deployment not executed because the repo has no Vercel project link or git remote configured locally.

---

### [2026-05-20] SIS + ACOS Harness Excellence Pass

**Category:** cross-repo-harness-state
**Confidence:** 0.95
**Source:** Codex CLI session
**Related:** ACOS channel, platform adapter prompts, agent harness symmetry, site/console verification

Reconciled Starlight's operational truth across harness, docs, platform adapters, site copy, and ACOS context.

- SIS canonical counts now derive from source: 47 agent files, 71 skill rules, 6 memory vaults. `scripts/check-agent-harness.mjs` no longer hardcodes stale agent/skill totals.
- Platform prompt symmetry now covers Antigravity in addition to Cursor/Cline/Gemini surfaces, closing a false-pass gap in `test/v80-platform-prompts.test.ts`.
- Site and console quality gates were tightened: site lint warnings removed, console ESLint flat config added, and both Next builds pass inside the root verify chain.
- ACOS v11 harness health now points at a real command, `npm run build:all`; all seven MCP workspaces build on Windows through esbuild, including the fixed website MCP dependency object.
- Verification passed: SIS `npm run verify`, `npm run agents:harness-check`, `node --import tsx --test test/v80-platform-prompts.test.ts`; ACOS `npm run build:all`.

### [2026-05-20] Expanded Harness Excellence Pass

**Category:** cross-repo-harness-state
**Confidence:** 0.96
**Source:** Codex CLI session
**Related:** `docs/ops/HARNESS-EXCELLENCE-PASS-2026-05-20.md`, ACOS installer, SIS site/console verify

Second pass expanded from repair into operations hardening.

- ACOS now has a real `npm run verify` gate: harness check plus all MCP workspace builds.
- ACOS harness checks v11 identity, platform adapter docs, Codex/Gemini/Antigravity/OpenCode installer routes, Windows-safe esbuild build scripts, and LF line endings for `install.sh`.
- ACOS installer smoke passed for Codex (`AGENTS.md`), Gemini (`GEMINI.md`), Antigravity (`.antigravity/instructions.md`), and OpenCode (`AGENTS.md` + `opencode.json`).
- ACOS dependency audit is clean: `npm audit --json` reports zero vulnerabilities after upgrading direct vulnerable packages and applying audit fixes.
- SIS live onboarding/delivery/explainer/context surfaces were brought forward to SIP v1.1.1, v8.0.0, 47 agents, and 71 skill rules.
- Verification passed: SIS `npm run verify`; ACOS `npm run verify`; ACOS `npm audit --json`.

### [2026-05-21] 2026-05-21 Quality Bar: Audit-Gated Verify

**Category:** cross-repo-harness-state
**Confidence:** 0.97
**Source:** Codex CLI session
**Related:** `docs/ops/HARNESS-EXCELLENCE-PASS-2026-05-20.md`, SIS package scripts, site/console package locks, ACOS verify

Raised the active excellence bar from build/test green to harness + audit + build green.

- SIS root `npm run verify` now includes `agents:harness-check` and `audit:all` before TypeScript, tests, site build, and console build.
- SIS `audit:all` covers root, `site`, and `console`.
- Added lockfiles for `site` and `console` so audits are deterministic.
- Upgraded site and console to `next@16.2.6`; added an override for Next's nested `postcss` to `8.5.10`; refreshed installed subapp dependencies with `npm ci --ignore-scripts`.
- ACOS `npm run verify` now includes harness check, `npm audit`, and all MCP workspace builds.
- Verification passed: SIS `npm run verify`; ACOS `npm run verify`; root/site/console/ACOS audits all report zero vulnerabilities.

### [2026-05-22] Claude Support + Ecosystem Quality Ledger

**Category:** cross-repo-harness-state
**Confidence:** 0.94
**Source:** Codex CLI session
**Related:** `docs/ops/CODEX-CLAUDE-PICKUP-2026-05-22.md`, `docs/ops/ECOSYSTEM-QUALITY-LEDGER-2026-05-22.md`, ACOS pickup doc

Supported active Claude work by writing durable handoff files and fixing safe, high-leverage drift in SIS + ACOS without touching likely active FrankX/Arcanea work.

- SIS live docs corrected: `AGENTS.md` skill-rule count, `docs/ARCHITECTURE.md` Crypto Intelligence vertical, `docs/ops/readiness-v75.md` Graphiti/Syncthing status, Phase 0 memory-foundation schema/status, and memory consolidation calibration gate.
- ACOS red harness gate fixed: `install.sh` restored after patch failure, normalized to LF, guarded by `.gitattributes`, and verified by `npm run harness:check`.
- ACOS OpenCode install now generates repo-local `opencode.json` paths from `PROJECT_DIR` instead of copying stale FrankX absolute paths.
- Added handoff/pickup docs for Claude in SIS and ACOS plus an ecosystem quality ledger with next gates.
- Verification passed: ACOS `npm run verify`; SIS `npm run verify` after removing only test-created temp directories under `%TEMP%` that caused an initial `ENOSPC` failure. Targeted checks also passed: SIS `npm run agents:harness-check`, SIS `node --import tsx --test test/v80-platform-prompts.test.ts`, ACOS `bash -n install.sh`.
