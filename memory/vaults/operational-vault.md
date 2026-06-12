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

---

## Entries

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

### [2026-06-11] Substrate MCP Registry Parser Fixed

**Category:** mcp-maintenance
**Confidence:** 0.95
**Source:** Codex CLI session
**Related:** `src/starlight-mcp.ts`, `test/starlight-substrate-mcp-smoke.test.ts`

Fixed `starlight_registry_query` parser drift: it was reading every `###` heading in `REGISTRY.md`, causing Claw Registry headings (`Schema`, `Active`, `Planned`) to appear as phantom MCP servers. Parser now scopes to the `## Active servers` section only. Added an end-to-end stdio MCP regression test and wired it into `npm run test:substrate`.

Verification: `npm run build`, focused operational MCP smoke, focused substrate MCP smoke, and full `npm run test:substrate` passed. Note: any already-running MCP server process may continue serving the old parser until the host session/server restarts.

---

### [2026-06-11] Memory Hybrid Retrieval + Concurrency Gate

**Category:** memory-architecture
**Confidence:** 0.93
**Source:** Codex CLI session
**Related:** `src/vault-memory.ts`, `src/memory.ts`, `src/jsonl-lock.ts`, `src/mcp-server-v01.ts`, `test/phase0-concurrent-write-smoke.test.ts`, `test/v01-mcp-tools.test.ts`

SIS remains the primary sovereign memory layer. The repo is not treated as a full MemPalace fork; MemPalace, mem0, and Graphiti are benchmark/harvest sources rather than replacement architecture.

Implemented a zero-dependency memory hardening slice: JSONL append/save operations now use a portable advisory lock, vault search defaults to hybrid lexical + deterministic semantic RRF ranking, private memory is hidden unless explicitly requested, and MCP v0.1 exposes `sis.memory.health` plus `sis.memory.eval` so memory state can be inspected and scored from the tool surface.

Verification: `npm run build`, `node --import tsx --test test/v01-mcp-tools.test.ts`, `node --import tsx --test test/phase0-concurrent-write-smoke.test.ts`, `node --import tsx --test test/mcp-server-smoke.test.ts`, and full `npm run test:substrate` passed.

---

### [2026-06-12] Memory Control Plane Unified Across CLI + MCP

**Category:** memory-observability
**Confidence:** 0.94
**Source:** Codex CLI session
**Related:** `src/memory-health.ts`, `src/cli.ts`, `src/mcp-server-v01.ts`, `test/core-regressions.test.ts`, `test/v01-mcp-tools.test.ts`

Extended SIS memory health from a surface checklist into a control-plane report. `starlight vault health` and `sis.memory.health` now share one inspector that states the architecture verdict, canonical source, optional/derived substrates, sovereign-vs-frozen corpus drift, memory-bus launcher/private-path status, eval readiness, concurrency gate, retrieval gate, and privacy-by-default posture.

Live finding: sovereign corpus is aligned or ahead of frozen MemPalace rows (`556/520`, coverage `1.069`), eval-50 and concurrency/retrieval gates are present, but vault consolidation stamps are stale and `private/memory-bus` is absent in this checkout despite launcher/docs references. Memory-bus remains the right singleton mediator pattern, but the current connected implementation must either be restored from private state or replaced by the now-hardened SIS MCP memory tools.

Verification: `npm run build`, focused core + MCP tests, `node dist/cli.js vault health`, full `npm run test:operational`, and full `npm run test:substrate` passed.

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

## 2026-06-11 — Starlight Cosmos v1 shipped (operational)

- **What**: /cosmos (hub + gallery + 19-card knowledge library) + /asteroids (live NeoWs + mining lens) live on starlightintelligence.org. Commit f5da2b1; deployed via `vercel --prod` from site/ (GHA still manual).
- **Pattern confirmed**: registry + content/*.md + ISR + committed fallback snapshots = external-data pages that cannot go dark. DEMO_KEY rate-limited during build (10 req/hr measured) and the fallback rendered exactly as designed; production flipped to live data on Vercel.
- **Dead upstream**: api.spacexdata.com (522; repo archived 2026-06-06) → Launch Library 2 is the launch feed now.
- **Next**: card population each session (19 → 100+), cosmos MCP v0.1 in starlight-cosmos-engine (S+2), asteroid-economics engine (S+3 — Asterank frozen since ~2013, open lane). Spec: docs/superpowers/specs/2026-06-11-starlight-cosmos-design.md
- **Note**: vault entry left uncommitted intentionally — sibling session has pending edits in this file; next ops commit sweeps it.

## 2026-06-11 — Voice / Orchestrator Portability Audit

- `starlight-voice` is clean on `origin/main` at `624444d`; repo is GitHub-portable but still a scaffold/MVR plan, not a complete one-command daily-driver install.
- `@arcanea/orchestrator` source lives in `Arcanea/packages/orchestrator`, tracked by `frankxai/arcanea-ai-app` on `chore/models-opus-4-7`; npm latest is `1.2.1`, but the CLI hardcoded version still reports `1.2.0`.
- Global Claude Code config at `C:\Users\frank\.claude` is not portable as-is: many commands/skills, including `commands/ao.md`, are untracked in `frankxai/claude-code-config`.
- `/ao` command docs are stale: they point at nonexistent `C:\Users\frank\arcanea-orchestrator`; current installed `arco` links to `C:\Users\frank\Arcanea\packages\orchestrator`.

### Follow-up shipped same session

- `frankxai/starlight-voice@f0161d8`: added README + second-laptop install guide; cleaned Tauri scaffold warnings; `cargo build --release -p starlight-voice-tauri` passes.
- `frankxai/arcanea-ai-app@b5b580f` on `chore/models-opus-4-7`: fixed `arco --version` to report `1.2.1`; `pnpm --filter @arcanea/orchestrator test` passes; pushed branch to GitHub.
- `frankxai/claude-code-config@508cc82`: updated `/ao` to point at `@arcanea/orchestrator` / `arco`, documented second-laptop bootstrap, ignored local runtime/auth files, removed `mcp-needs-auth-cache.json` from Git tracking, restored `starlight-queen` skill.

### Starlight Voice foundation upgrade

- `frankxai/starlight-voice@f05b462`: added Python sidecar package, JSON-lines IPC (`health`, `utterance`, `browser.task`), cognition router tiers, browser-use dry-run adapter seam, benchmark smoke scripts, GitHub Actions CI, `docs/ARCHITECTURE.md`, and `docs/NEXT-BEST-STANDARD.md`.
- Tauri shell now performs a non-fatal Python sidecar health probe at startup; failure degrades to a warning until the bundled sidecar lands.
- Verification: `cargo build --release -p starlight-voice-tauri`; `PYTHONPATH=sidecar/src python -m pytest sidecar/tests` (11 passed); `python benchmarks/run.py --probe router --n 25`; `python benchmarks/run.py --probe browser-dry-run --n 25`.

### Starlight Voice operationalization pass

- `frankxai/starlight-voice@6092e0d`: added `docs/USAGE.md`, `docs/CAPABILITIES.md`, `docs/FLOWS.md`, `scripts/doctor.ps1`, `scripts/smoke-sidecar.ps1`, `scripts/test-local.ps1`, and a sidecar `doctor` command.
- Machine truth: Python 3.13, uv, Rust/Cargo, Node/npm, PowerShell 7, Claude Code, Codex, OpenCode, `arco`, browser-use, Anthropic SDK, OpenAI SDK, and sounddevice are present. Gemini CLI and Pipecat are missing.
- Verification: `pwsh -File scripts/smoke-sidecar.ps1`; `PYTHONPATH=sidecar/src python -m pytest sidecar/tests` (12 passed); `pwsh -File scripts/doctor.ps1`; `pwsh -File scripts/test-local.ps1`.

### Starlight Voice provider dashboard

- `frankxai/starlight-voice@a7ca825`: added a local provider-options dashboard for choosing/rating the Starlight Voice architecture path.
- Dashboard runs with `pwsh -File scripts/open-dashboard.ps1` and serves `http://127.0.0.1:8765` from `dashboard/server.py`.
- Options shown: Hybrid Starlight, ElevenLabs Agent, OpenAI Realtime, and OSS Experiment Stack. Recommendation remains hybrid: Tauri local shell + provider-neutral sidecar/Pipecat lane + ElevenLabs for voice beauty + OpenAI Realtime for unified realtime/tool flows + browser-use for browser execution + `arco`/Codex/Claude/OpenCode lanes for engineering execution.
- Ratings save locally to `dashboard/ratings.jsonl`; file is gitignored so Frank's preference log stays local.
- Verification: `pwsh -File scripts/test-local.ps1` passed after dashboard addition: 12 Python tests, router benchmark, browser dry-run benchmark, and Rust/Tauri release build.

### Starlight Voice spoken cockpit upgrade

- `frankxai/starlight-voice@595081d`: upgraded the dashboard into a spoken workflow cockpit with browser-native speech synthesis, voice picker, cool-factor control, Arcanea Business / Starlight Systems / Builder Ops briefings, and four predefined workflow previews.
- Predefined workflows: Arcanea Business Update, Starlight Intelligence Check, Browser Builder Run, and Voice Provider Bakeoff.
- `frankxai/starlight-voice@2fbf4c1`: hardened `scripts/open-dashboard.ps1` so repeated launches reuse an existing local dashboard server instead of spawning a duplicate.
- Recommendation preserved: hybrid architecture first, with OpenAI Realtime as low-latency browser voice lane, ElevenLabs as premium voice-beauty lane, browser-use gated behind explicit approval/audit logs, and Pipecat as the next provider-neutral voice orchestration install.
- Verification: `python -m py_compile dashboard/server.py`; `pwsh -File scripts/test-local.ps1` passed; `agent-browser` opened `http://127.0.0.1:8765`, confirmed content rendered, no framework overlay, 13 buttons, 4 workflows, `speechSynthesis` available, and workflow/briefing interactions updated text correctly.

### Starlight Voice secrets setup

- `frankxai/starlight-voice@47e4ce7`: added local provider key setup via `pwsh -File scripts/set-secrets.ps1`, refreshed `.env.example`, and documented the local `.env.local` / LiteLLM / Infisical strategy in `docs/SECRETS.md`.
- Secret policy: do not paste keys into chat. Use `.env.local` for this laptop now; use LiteLLM later for model/provider routing; use Infisical before multi-machine sync, production, audit, or rotation requirements.
- `frankxai/starlight-voice@ffb155f`: added dependency-free sidecar `.env.local` / `.env` loading and redacted doctor key readiness booleans. Process env wins over file values.
- Verification: PowerShell script parses; focused Python tests passed; `pwsh -File scripts/test-local.ps1` passed with 13 Python tests, router benchmark, browser dry-run benchmark, and Rust/Tauri release build.

### [2026-06-12] Antigravity + Grok Shortcut Grid and `/si` `/so` Router

**Category:** orchestration-state
**Confidence:** 0.96
**Source:** Codex CLI session
**Related:** `scripts/agy-tools.ps1`, `commands/si.md`, `commands/so.md`, `skills/orchestration/cli-tool-router.md`, `skills/skill-rules.json`

Extended the local engineer grid so Antigravity and Grok mirror the repo shortcut posture used by `clsis` / `cdsis` / sibling CLI commands. Antigravity now exposes `agyarc` plus legacy `agya`, `agysis`, `agyfx`, `agyg`, `agyvc`, `agyani`, and `agydpi`. Grok now exposes `grarc`, `grsis`, `grfx`, `grg`, `grvc`, `grani`, and `grdpi`. `Test-AgentGridCli` verifies both binaries and all repo targets.

Added `/si` and `/so` command surfaces plus `orchestration/cli-tool-router` so operator requests can route across Claude, Codex, Gemini, OpenCode, Cursor, Antigravity, Grok, or native image generation tools. Image requests route to native image tooling first unless the operator explicitly asks for a text CLI. Skill rule count is now 77.

Verification: `node --import tsx --test test/v77-skill-rules.test.ts` passed; `skills/skill-rules.json` parses; PowerShell no-profile load confirms all new wrapper functions resolve; `Test-AgentGridCli` confirms `agy.exe`, `grok.exe`, and all seven repo paths exist locally.

## 2026-06-12 — SIS branch integration and memory control-plane hardening

**Category:** orchestration-state
**Confidence:** 0.97
**Source:** Codex CLI integration session
**Related:** `src/vault-memory.ts`, `src/jsonl-lock.ts`, `src/mcp-server-v01.ts`, `agents/AGENT_REGISTRY.md`, `verticals/crypto-intelligence/`, `verticals/music-is/`, `core/orchestrator/`, `core/telemetry/`

Integrated the outstanding SIS session work onto `main` from the remote mainline, the music intelligence context branch, and the drift-fixes capability branch. The resulting build now carries the v9 memory/gateway control plane, session store, hybrid retrieval, privacy-locked gateway search, Antigravity/Grok adapters, swarm runtime, `/yolo` command docs, Energy Intelligence agents, expanded crypto-intelligence sub-systems, music catalog/workflows, telemetry schemas, harness docs, and portfolio audit history.

Conflict policy: hot core files favored the newer local/mainline memory and gateway implementation while preserving additive branch capabilities. Count surfaces were reconciled to the derived truth: 56 agents and 77 skill rules. Energy Intelligence was registered as a first-class sub-stack.

Windows hardening pattern confirmed: directory-lock contention can surface as transient `EPERM`/`EACCES`, not only `EEXIST`. `src/jsonl-lock.ts` now treats those lock-acquisition codes as retryable so multi-process JSONL appends pass the Phase 0 concurrent-write smoke on Windows.

Verification passed: `npm run build`; `npm run test:operational`; `npm run test:substrate`; focused `test/phase0-concurrent-write-smoke.test.ts`; focused v76, v80, and v87 harnesses during repair.

## 2026-06-12 — Main governance pass and approval-gated swarm planner

**Category:** orchestration-state
**Confidence:** 0.95
**Source:** Codex CLI session
**Related:** `src/swarm.ts`, `src/cli.ts`, `commands/starlight-swarm.md`, `test/swarm.test.ts`, `/starlight-board`, Antigravity CLI

Ran a Starlight Board pass for pushing the integrated SIS `main` plus the new `/starlight-swarm` planner. Board recommendation: PROCEED, bounded by keeping swarm v1 as dry-run packet planning only, with no repo mutation or live external provider calls.

Added `starlight starlight-swarm` CLI support and command docs. The planner inspects the v1 repo ring, checks provider availability, emits approval-gated packets, and writes audit JSONL under `private/voice-operator/logs/swarm.jsonl`. It preserves the existing real `runSwarm` executor while adding a safer planning surface for multi-CLI orchestration.

Antigravity was invoked for input using non-interactive `agy --print`; it authenticated silently but returned no usable review text before print-mode timeout. Local verification therefore remained the deciding gate.

Verification passed: `npm run build`; `node --import tsx --test test/swarm.test.ts`; `npm run test:operational`; `npm run test:substrate`; `node dist/cli.js starlight-swarm status`; `node dist/cli.js starlight-swarm providers`.
