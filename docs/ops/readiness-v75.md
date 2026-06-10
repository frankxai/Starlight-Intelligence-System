# Readiness v7.5 — Phase 1+ gap audit

> Luminor Board v7.5 verdict, Item 8 (P2 horizon). Single-source surface for "what's declared in the substrate vs. what actually runs." Reconciles `MASSIVE_ACTION_PLAN.md` (Phases 0–4) against on-disk state at `C:\Users\frank\Starlight-Intelligence-System\` on 2026-04-26.

**One-sentence frame:** v7.5 reconciled the *taxonomy* (10-IS); it has not yet reconciled the *capability* (Phase 1 capture stack, Phase 2 voice room, Phase 3 spine surfaces). This document names that delta explicitly so it stops being implicit in the plan-only.

**Status legend:**
- `live` — ships and works end-to-end on this machine today.
- `scaffolded` — declared, files exist, contract holds, not yet operational (no runtime, no install, no I/O).
- `staged` — partially in place; some primitives operational, the integrated surface not yet callable.
- `unsurfaced` — named in `MASSIVE_ACTION_PLAN.md` or downstream docs, no declared file/agent/command/install playbook on disk yet.

**Discipline:** `live` requires that I can describe a real artifact the system produces today on real input without manual gluework. Anything less is `scaffolded` at best.

---

## Phase 0 — Spine lock (Apr 25 – Apr 30)

| Deliverable | Declared (where) | Functional (does it run) | Status | Blocking gap | Owner |
|---|---|---|---|---|---|
| 0.1 MASSIVE_ACTION_PLAN accepted | `MASSIVE_ACTION_PLAN.md` § header (status: ACCEPTED 2026-04-25) | Committed to main; referenced by `STACK.md` § 1, `docs/ARCHITECTURE.md` § header, `core/orchestrator/README.md` | `live` | — | Frank |
| 0.2 STACK + VERTICALS reflect 10-IS | `STACK.md` § "The 10 Intelligence Systems"; `docs/ARCHITECTURE.md` § Reconciliation note (v7.5) | Both files updated; 10-IS table canonical | `live` | — | Claude Code |
| 0.3 `core/orchestrator/` directory + README | `core/orchestrator/README.md` (full spec, two operating modes, routing chain) | Directory exists; README points back to plan § 4 + § 10 | `live` | — | Claude Code |
| 0.4 `verticals/_template/` + stub `verticals/{code,voice-video}/` | `verticals/_template/{AGENTS,CANON,MEMORY,README,SKILL,SOUL,STACK}.md`; `verticals/code/README.md`; `verticals/voice-video/README.md` | Template is a 7-file file-contract scaffold; code + voice-video each have a lone README at `v0.1 scaffolded` | `scaffolded` | Code IS and Voice & Video IS each have only a README — no AGENTS/SKILL/SOUL/STACK/CANON/MEMORY files yet, so the vertical-tier file contract isn't actually applied to them. They borrow agents/commands from elsewhere; the wrapper is pure positioning. | Claude Code |
| 0.5 `verticals/relational` → `verticals/family` rename | `verticals/family/README.md` (status: scaffolded v0.1, "renamed from Relational IS, 2026-04-26") | Family directory exists with a single README. `relational/` not present at top level. Underlying `starlight-relational` agent + `/map-relationships` + `/design-alliance-readiness` remain operational. | `scaffolded` | Same vertical-wrapper gap as 0.4 — only README, no full file contract. The agent/commands are `live` independent of the wrapper. | Claude Code |
| 0.6 Memory entry: spine locked | `MEMORY.md` referenced (parent context lists `project_v74_beta_9layer.md` etc.); v7.5 spine-locked entry not yet visible in checked auto-memory | Auto-memory persists v7.4.1 alpha state; v7.5 spine-locked entry is the next write | `staged` | Memory entry naming the v7.5 spine-lock + Jarvis killed + 10-IS canonical not yet visible in the surfaced auto-memory window. May exist; not verified at this audit. | Claude Code |
| 0.7 Slack/Notion announcement | n/a (Frank's hand) | n/a | `unsurfaced` | Frank-owned, outside this audit's scope. | Frank |

---

## Phase 1 — Capture stack + harness extension (Apr 30 – May 14)

| Deliverable | Declared (where) | Functional (does it run) | Status | Blocking gap | Owner |
|---|---|---|---|---|---|
| 1.1 `arcanea-orchestrator` → `@starlight/orchestrator`, npm v0.2.0 | `core/orchestrator/README.md` § Implementation status (audited 2026-04-25; v0.1.0 local, NOT on npm); `MASSIVE_ACTION_PLAN.md` § 4 | Local `arcanea-orchestrator/` not present at repo root; the on-disk substrate has `src/orchestrator.ts` + `orchestrator.test.ts` (TypeScript MCP-side). No npm publish. | `staged` | The "promote and publish" path is not bridged on disk. `src/orchestrator.ts` is the runtime; `arcanea-orchestrator/` repo expected by the plan is not co-located. Promotion requires either co-locating or pointing the plan at `src/orchestrator.ts`. | Codex CLI (per plan) |
| 1.2 `harnesses/{claude,codex,gemini,opencode}/` system prompts + MCP scope | `core/orchestrator/harnesses/{claude,codex,gemini,opencode}/` exists as four directories | Claude harness: `README.md` + `system-prompt.md` + `mcp-config.json` + `allowlisted-tools.md` (4 files). Codex/Gemini/OpenCode: README only, each ending "Status: scaffolded — full system prompt + MCP config land in Phase 1." | `staged` | 1 of 4 harnesses materially populated. Codex/Gemini/OpenCode need their system prompt + MCP config + allowlisted-tools to graduate from README-only. | Claude Code |
| 1.3 screenpipe install + `~/captures/screen/` | `docs/install/screenpipe.md` (just landed by parallel install-playbook agent) | Playbook present on disk; `~/captures/` directory does **not** exist on this machine (`ls ~/captures/` → No such file or directory) | `staged` | Playbook exists; install hasn't been executed. Frank's hands required (Tier B per voice-operator install pattern). No capture file has ever appeared. | Frank executes; Claude Code provides script |
| 1.4 meetscribe / Meetily install | `docs/install/meetscribe.md` (parallel agent) | Playbook present; no install run; `~/captures/meetings/` absent | `staged` | Same as 1.3 — playbook landed, hands haven't. Plus: meetscribe vs Meetily choice not yet locked in the playbook (per plan § 5 "or"). | Frank executes |
| 1.5 Mem0 + Graphiti install + `~/captures/` + `Arcanea/wiki/` | `docs/install/mem0.md` (parallel agent); **Graphiti playbook absent** — `ls docs/install/` returns only `meetscribe.md`, `mem0.md`, `screenpipe.md` | Mem0 playbook exists, not run. **Graphiti has no install playbook on disk** and no adapter for the Markdown vault. | `unsurfaced` (Graphiti) / `staged` (Mem0) | Graphiti install playbook missing. No Markdown-vault → Graphiti adapter exists; without it, the 33-atom `Arcanea/wiki/` cannot ingest into the temporal graph. The "neural constellation" Console view in Phase 4 has nothing to render. | Claude Code (write Graphiti playbook + adapter); Frank executes install |
| 1.6 Syncthing on Lenovo + Acer + phone | `MASSIVE_ACTION_PLAN.md` § 7; **no `docs/install/syncthing.md` on disk** | Not installed; no folder pairs configured | `unsurfaced` | Syncthing install playbook missing. Folder-pair recipe (`Starlight-Intelligence-System/`, `Arcanea/wiki/`, `Arcanea/.arcanea/`, `FrankX/content/`, `FrankX/data/`, `Business/`, `~/captures/`) needs to land as a sibling of the other install docs. Phone setup is GUI-only. | Claude Code (write playbook); Frank executes |
| 1.7 First daily brief from Graphiti → `~/captures/briefs/YYYY-MM-DD.md` | `MASSIVE_ACTION_PLAN.md` § 10 Phase 1 row 1.7 | Cannot run — depends on 1.5 (Graphiti) and 1.3 (screenpipe) | `unsurfaced` | Daily brief generator code does not exist. Spec for the brief output schema does not exist. Trigger / cron / scheduler not defined. | Claude Code (post-1.5 ingestion working) |
| 1.8 Memory entry: Phase 1 shipped | n/a | Cannot fire until 1.7 verifies | `unsurfaced` | Gates on 1.7. | Claude Code |

---

## Phase 2 — Voice room + workspace switching (May 14 – May 28)

| Deliverable | Declared (where) | Functional (does it run) | Status | Blocking gap | Owner |
|---|---|---|---|---|---|
| 2.1 HavenCore-style local room as service | `agents/starlight-voice-operator.md`; `private/voice-operator/` (install scaffold); `docs/specs/2026-04-26-voice-operator-v1.md` + `docs/specs/2026-04-26-voice-operator-engineering-v1.md` | `private/voice-operator/` has full Python service — `service/{wake_word,stt,tts,pipeline,packet,packet_router,approval_gate,agent_client,memory_writer,server,tray,main}.py` + `install.ps1` / `run.ps1` / `stop.ps1` + `tests/` (7 test files) + `config/{components.toml,routing.toml,prompts/,workflows/}` | `scaffolded` | Voice-operator parallel work has shipped a meaningful Python service scaffold, far past README-only. Not yet running as Windows service on Lenovo. Frank-hand required for install + Picovoice "Starlight" wake-word training + API-key provisioning. Wake-word `.ppn` not yet trained. (Credit: `agents/starlight-voice-operator.md` + the `docs/specs/2026-04-26-voice-operator-*.md` spec; this audit only references — does not claim.) | Voice-operator parallel agent owns scaffold; Frank installs |
| 2.2 Groq Whisper STT, <1s round-trip | `private/voice-operator/service/stt.py` exists (referenced in service tree) | Code path present; benchmark not run | `scaffolded` | Bench harness not in repo at known path; Groq API key not provisioned. | Voice-operator scaffold + Frank's keys |
| 2.3 ElevenLabs TTS wired | `private/voice-operator/service/tts.py` + `smoke_tts.py` | Code path present; smoke test exists; not executed end-to-end on this machine | `scaffolded` | ElevenLabs API key not provisioned. | Voice-operator scaffold + Frank's keys |
| 2.4 Vercel room at `room.starlight.systems`, passkey auth | `MASSIVE_ACTION_PLAN.md` § 8 + § 10 Phase 2 row 2.4 | No deployed URL; no auth scaffold; no Cloudflare Tunnel config visible | `unsurfaced` | Cloud twin scaffolded only as Phase 2 plan in `core/orchestrator/README.md` § Implementation status ("Phase 2 = phone PWA + Cloudflare Tunnel"). No site code, no Vercel project, no passkey wiring. | Codex CLI (per plan) |
| 2.5 Five voice command primitives (brief / what-changed / route-to / capture / mark-mattered) | Voice-operator engineering spec lists routing.toml; primitives not enumerated as five separate commands on disk | `private/voice-operator/config/routing.toml` exists; specific 5 intent-fingerprints not verified to be wired | `scaffolded` | Each of the five primitives needs an explicit handler + Memory Graph read path. "brief" depends on Phase 1.7 (which is unsurfaced). "mark-mattered" depends on emotional-salience metadata schema (not yet defined). | Claude Code + voice-operator scaffold |
| 2.6 Windows virtual desktops + `Switch-Workspace.ps1` + AutoHotkey | `MASSIVE_ACTION_PLAN.md` § 9 | No `Switch-Workspace.ps1` on disk; no AutoHotkey config; no `~/.starlight/profiles/{brand}.toml` | `unsurfaced` | Workspace-switching script + per-brand profile files + hotkey bindings none-existent. Acer mirror sequence depends on Syncthing (also unsurfaced). | Claude Code (write); Frank installs |

---

## Phase 3 — Spine surfaces (May 28 – Jun 18)

> BV cash gap (Jun 1) intersects this phase. Revenue-stake phase.

| Deliverable | Declared (where) | Functional (does it run) | Status | Blocking gap | Owner |
|---|---|---|---|---|---|
| 3.1 FrankX Intelligence Score quiz at `frankx.ai/score` | `MASSIVE_ACTION_PLAN.md` § 1 + § 10 Phase 3 row 3.1 | Lives in **FrankX repo**, not this repo. No code / no URL / no analytics scaffold visible from this audit. | `unsurfaced` | 10-dimension instrument not yet designed. 6-archetype mapping not yet defined. Score result card template not in `assets/marketing/` (which doesn't exist at this path). Email-capture wiring not built. | Claude Code on FrankX repo (cross-repo task); Frank distribution |
| 3.2 Arcanea Guardian Passport at `arcanea.ai/passport` | `MASSIVE_ACTION_PLAN.md` § 10 Phase 3 row 3.2 | Lives in **Arcanea repo**. 10-Guardians taxonomy referenced in `/arcanea-canon` command but no passport flow / no first-quest wiring on disk in this repo. | `unsurfaced` | Guardian-to-Passport mapping not codified. First-quest assignment logic absent. Arcanea repo state outside this audit. | Claude Code on Arcanea repo |
| 3.3 Starlight Agent Cards at `starlight.systems/cards` | `MASSIVE_ACTION_PLAN.md` § 10 Phase 3 row 3.3 | `site/src/app/` has `architecture/`, `protocol/`, `vaults/`, `quickstart/`, `featured/`, `badge/` — **no `cards/` route**. 50-card content not authored (5 cards × 10 IS). | `unsurfaced` | Cards page route absent. Card content (5 per IS = 50 total) absent. Filter UI absent. | Claude Code on this repo's `site/` |
| 3.4 10 Intelligence Systems overview at `starlight.systems/systems` | `MASSIVE_ACTION_PLAN.md` § 10 Phase 3 row 3.4 | `site/src/app/architecture/` exists (related but not equivalent); no `/systems` route | `unsurfaced` | The architecture page may overlap; the 10-IS systems page as the spine-funnel destination is not yet built. | Claude Code on `site/` |
| 3.5 Premium audit landing at `starlight.systems/private` | `MASSIVE_ACTION_PLAN.md` § 10 Phase 3 row 3.5 | No `/private` route in `site/src/app/` | `unsurfaced` | Calendly/Cal.com booking not integrated. Pricing / scope / commitment posture not authored on the site. | Claude Code on `site/` |
| 3.6 First 100 quiz completions + first audit booking | n/a (distribution metric) | Cannot fire until 3.1–3.5 ship | `unsurfaced` | Gates on every prior 3.x. | Frank distribution |

---

## Phase 4 — Memory Graph UI + Neural Constellation (Jun 18 – Jul 15)

| Deliverable | Declared (where) | Functional (does it run) | Status | Blocking gap | Owner |
|---|---|---|---|---|---|
| 4.1 Constellation view in `console/` (force-directed, weighted glow) | `console/src/components/SubstrateGraph2D.tsx` + `SubstrateScene.tsx` + `SubstrateSceneClient.tsx` + `SubstrateViewSwitcher.tsx`; `console/src/data/substrate.ts`; `console/src/app/substrate/page.tsx` | Console renders a substrate graph with 2D + 3D scene switcher. **Reads from `substrate.ts` (static data), not from live Graphiti.** No `console/src/views/{constellation,meeting-replay,depth-map}/` (the path the plan specifies). | `staged` | Graph viz exists but is fed by static substrate data. No Graphiti adapter. No edge-weight formula (`recency × relevance × emotional_salience × strategic_importance`). No emotional-salience metadata anywhere upstream. | Claude Code (post-Phase-1.5) |
| 4.2 Meeting Replay view (timeline + energy spikes) | `MASSIVE_ACTION_PLAN.md` § 6 + § 10 Phase 4 row 4.2 | Not built. No `meeting-replay/` directory in `console/src/`. | `unsurfaced` | Depends on meetscribe ingestion (unsurfaced) + energy-prosody scoring (unsurfaced) + diarization metadata. None of the upstream feeders exist yet. | Claude Code |
| 4.3 Depth Map view (raw → structured → meaning) | `MASSIVE_ACTION_PLAN.md` § 6 + § 10 Phase 4 row 4.3 | Not built. | `unsurfaced` | Three-layer schema (raw/structured/meaning) not defined. Toggle UI not in Console. | Claude Code |
| 4.4 Public Neural Constellation at `starlight.systems/constellation` | `MASSIVE_ACTION_PLAN.md` § 10 Phase 4 row 4.4 | No `/constellation` route in `site/src/app/`. The standalone `arcanea-brain-3d.html` referenced in plan § 6 is in Arcanea/Cowork artifacts, not this repo. | `unsurfaced` | Public 3D HTML artifact not co-located. Marketing-grade no-auth view not built. | Claude Code on `site/` |
| 4.5 Premium artifact set (10-IS Map, Score Card, Passport Card, Agent Card Deck, Orchestrator Diagram, Office Mockup, Founder Codex Mockup, Family Archive Mockup) | `MASSIVE_ACTION_PLAN.md` § 10 Phase 4 row 4.5 | `assets/marketing/` does not exist at repo root. | `unsurfaced` | All 8 marketing-asset files missing. Weaver agent not yet briefed for the visual production pass. | Weaver agent + Frank (aesthetic veto) |

---

## 10-IS layer composition — declared vs. functional snapshot

This is the table the plan most needs as a single source of truth.

| # | IS Layer | Declared (substrate locator) | Functional (today) | Status |
|---|---|---|---|---|
| 1 | Self / Genius IS | `agents/starlight-genius.md`; `/discover-genius`, `/reclaim-knowledge`; `verticals/_template/` reference but **no `verticals/self/`** | Genius excavation runs end-to-end via `/discover-genius` → `/reclaim-knowledge` → `/train-executor`. First-test-case dogfood example shipped in v7.4.1 alpha. | `live` (agent + commands); `unsurfaced` (vertical wrapper) |
| 2 | Wealth IS | `/wealth-dpi` command; **no `verticals/wealth/`** | Single-command DPI ledger / thesis engine runs on input. | `live` (command); `unsurfaced` (vertical wrapper, no `starlight-wealth` agent) |
| 3 | Family IS | `verticals/family/README.md`; `agents/starlight-relational.md`; `/map-relationships`, `/design-alliance-readiness` | Agent + 2 commands run. Family vertical wrapper is README-only. Multi-generational `/family-agreement` `/succession-architect` `/legacy-transfer` not yet built (named as "future" in README). | `scaffolded` (wrapper); `live` (underlying agent + 2 commands) |
| 4 | Business IS | `agents/starlight-business.md`; `/architect-entity`, `/model-revenue`, `/tax-sanity`; **no `verticals/business/`** | Agent + 3 commands run. | `live` (agent + commands); `unsurfaced` (vertical wrapper) |
| 5 | Creator IS | `/creator-pipeline`, `/content-systemize`, `/train-executor`; "no dedicated agent — composes Genius + Visionary"; **no `verticals/creator/`** | 3 commands run. Composition pattern works because both upstream agents are live. | `live` (commands); `unsurfaced` (vertical wrapper) |
| 6 | Second Brain IS | `agents/starlight-secondbrain.md`; `/capture-daily`, `/distill-insights`, `/orchestrate-brain`; **no `verticals/secondbrain/`** | Agent + 3 commands run. Capture-daily routes to vault namespaces but no automated daily runner; ritual is manual. | `live` (agent + commands); `unsurfaced` (vertical wrapper + automated daily ritual) |
| 7 | Code IS | `verticals/code/README.md` (v0.1 scaffolded); `/arco`, `/ao` referenced but `/arco`, `/ao`, `/sync-repos` are **external command surfaces**, not in this repo's `.claude/commands/` per Phase 0 ls | Code IS as a wrapper exists as one README. Underlying coding agents (Claude Code primary; Codex / Gemini / OpenCode harnesses) are 1 of 4 materially populated. `mcp-builder`, `mcp-2025-patterns` skills auto-activate. | `scaffolded` (wrapper); `staged` (underlying harness) |
| 8 | Voice & Video IS | `verticals/voice-video/README.md` (v0.1 scaffolded); `/sip-attest-audio`, `/sip-attest-video`, `/sip-compose-modality` (all `live` per v7.3.1 ship); `agents/starlight-voice-operator.md`; `private/voice-operator/` Python service scaffold | Modality attestation commands run. Voice operator service is scaffolded with full Python tree but not running. Video factory / Remotion / Veo / Runway / Sora orchestration not built. | `scaffolded` (wrapper + voice room); `live` (3 modality-attestation commands) |
| 9 | Brand IS | `agents/starlight-visionary.md`; `/define-vision`, `/build-brand-kit`, `/align-voice`; **no `verticals/brand/`** | Agent + 3 commands run. | `live` (agent + commands); `unsurfaced` (vertical wrapper) |
| 10 | Starlight Orchestrator | `core/orchestrator/README.md` (full spec); 4 harness directories (1 of 4 populated); `src/orchestrator.ts` runtime; `agents/starlight-orchestrator.md` | Orchestrator README + 1 of 4 harnesses + TypeScript runtime in `src/`. Voice/text intent → IS routing → Memory Graph fetch chain not end-to-end runnable (Memory Graph upstream is `unsurfaced`). | `staged` |
| (cross-cut) | Health IS | `agents/starlight-embodiment.md`; `/design-regimen`, `/energy-audit`; **no `verticals/health/`** | Agent + 2 commands run. Cross-cutting positioning means no top-level vertical expected. | `live` (agent + commands); positioning per `STACK.md` § 1 |
| (private) | Spiritual IS | `private/spiritual/` namespace; no public agent / commands / skills | Private founder layer; explicitly outside public substrate. | `live` (in the sense that absence is the design) |

**Domain Sub-Stack Tier (separate from the 10-IS):**

| Vertical | Declared | Functional | Status |
|---|---|---|---|
| People Intelligence | `verticals/people-intelligence/{AGENTS,CANON,MEMORY,README,SKILL,SOUL,STACK,SUB-SYSTEMS}.md`; 6 sub-system agents (`starlight-{hiring,performance,training,culture,talent,org}.md`); 28 commands (`/hire-*`, `/perf-*`, `/training-*`, `/culture-*`, `/talent-*`, `/org-*`); `skills/people-intelligence/` skills directory | Full file contract present; agents + 28 commands callable; reference vertical (Path A authorless; renamed from HR Intelligence at v7.6.0). | `live` |
| Sound Intelligence | `verticals/sound-intelligence/README.md` only; `skills/sound-intelligence/` directory exists but **empty** (no .md skill files) | Wrapper README only; no sub-system agents, no commands. Parallel-agent in-flight per task brief. | `scaffolded` (per disk state at audit time; may advance during/after this audit) |

---

## § Critical readiness gaps — top 5 blocking Phase 1 from starting

### 1. Graphiti install playbook + Markdown-vault adapter — `unsurfaced`
The temporal memory graph is the load-bearing primitive for daily brief (Phase 1.7), Constellation view (Phase 4.1), Meeting Replay (Phase 4.2), and the five voice command primitives (Phase 2.5 — "what changed", "brief me"). `docs/install/graphiti.md` does not exist; no `Arcanea/wiki/` → Graphiti adapter exists; the edge-weight formula `recency × relevance × emotional_salience × strategic_importance` is named in `MASSIVE_ACTION_PLAN.md` § 6 but has no schema, ingestion path, or emotional-salience field anywhere upstream. **Without this, four downstream phases stay blocked.**

### 2. Syncthing install playbook + folder-pair recipe — `unsurfaced`
`MASSIVE_ACTION_PLAN.md` § 7 names seven folders to sync (`Starlight-Intelligence-System/`, `Arcanea/wiki/`, `Arcanea/.arcanea/`, `FrankX/content/`, `FrankX/data/`, `Business/`, `~/captures/`); none of this is in a callable install script. The Acer hot-mirror dependency (risk register § "Single point of failure on Lenovo") gates on Syncthing being live. Phone capture (Phase 1.6) gates on it too.

### 3. Phase 1.7 daily brief generator — code does not exist
The "first daily brief from Graphiti, saved to `~/captures/briefs/YYYY-MM-DD.md`" is the verification step for Phase 1 itself. Schema for the brief, the cron/scheduler that triggers it, and the Graphiti read path are all undefined. Without 1.7 working, Phase 1 cannot be marked shipped, which means Phase 2 cannot begin per the plan's gating rule.

### 4. Vertical-wrapper file contract not applied to 5 of 10 IS layers
`verticals/{wealth,business,creator,secondbrain,brand,self}/` directories do not exist. `verticals/{code,voice-video,family}/` exist but contain only a README — they have not received the 7-file wrapper that `verticals/_template/` and `verticals/people-intelligence/` apply (AGENTS, CANON, MEMORY, README, SKILL, SOUL, STACK). This means the 10-IS taxonomy is consistent at `STACK.md` § 1 + `docs/ARCHITECTURE.md` but **inconsistent in the file system itself.** A sovereign adopter forking the repo cannot find the substrate-tier wrapper for 5 of 10 layers — they have to read the agent files and infer the layer.

### 5. Codex / Gemini / OpenCode harnesses are README-only
`core/orchestrator/harnesses/{codex,gemini,opencode}/` each have a README ending "Status: scaffolded — full system prompt + MCP config land in Phase 1." Without these, the multi-CLI orchestration narrative in `MASSIVE_ACTION_PLAN.md` § 4 is single-CLI in practice. The `starlight` shell-alias wrapping the four CLIs (plan § 4) cannot be functionally tested.

---

## § Where each gap closes

| # | Gap | Closes in | Who owns | Honest dependency |
|---|---|---|---|---|
| 1 | Graphiti install + adapter | Phase 1.5 | Claude Code writes playbook + adapter; Frank executes install (Tier B per voice-operator pattern) | Mem0 install (in-flight via parallel agent) closes first; Graphiti playbook is the immediate next ship. The vault-adapter is novel code — not lifted from any reference. |
| 2 | Syncthing install + folder-pair recipe | Phase 1.6 | Claude Code writes playbook; Frank executes (phone is GUI-only) | Sibling to Mem0 / screenpipe / meetscribe install playbooks. Should land in `docs/install/syncthing.md` — the same parallel agent could absorb it. |
| 3 | Daily brief generator | Phase 1.7 | Claude Code | Gates on 1 (Graphiti). The brief is downstream of the graph being fed. Cannot ship in parallel. |
| 4 | Vertical-wrapper file contract for 5 missing layers | Could close at any time; not currently scheduled in any phase | Claude Code | Pure positioning work — copy `verticals/_template/` 7 times into `verticals/{self,wealth,business,creator,secondbrain,brand}/` and customize. Roughly 0.5–1 day of focused work. **The plan does not name this as a deliverable**; that is itself a gap in the plan. |
| 5 | Codex / Gemini / OpenCode harnesses materially populated | Phase 1.2 | Claude Code | Each requires a system prompt (~300 lines), MCP config, allowlisted-tools spec. Pattern is set by the Claude harness which is `live`. Roughly 1 day per harness. |

**Third-party readiness items (not Claude Code's hands):**
- Microsoft Copilot Studio runtime test for SIP attestation survival (item 5 from v7.4.1 board verdict) — needs MS Copilot Studio account access + a test artifact running through their pipeline. Not in any Phase 0–4 row of `MASSIVE_ACTION_PLAN.md`. **Currently homeless** — should be added to a Phase 1 or Phase 3 row.
- Picovoice "Starlight" wake-word `.ppn` file — Frank trains his voice 3 sessions × 30s (per voice-operator README + plan § 15); no automation possible.
- ElevenLabs / Anthropic / Groq / Deepgram API keys — Frank provisions; can be done parallel to other Phase 1 work.
- Vercel project for `room.starlight.systems` (Phase 2.4) — Codex CLI per plan; depends on domain provisioning + passkey identity setup.

---

## § The honest mismatch

The 10-IS taxonomy is canonical in `STACK.md` § 1 and `docs/ARCHITECTURE.md`. It is referenced from `core/orchestrator/README.md`, `MASSIVE_ACTION_PLAN.md`, and every recent handover doc. As a *taxonomy*, it is locked.

As a *file-system architecture*, it is half-built. Five of ten IS layers — Self, Wealth, Business, Creator, Brand — have **no `verticals/<layer>/` wrapper at all**. Three more (Family, Code, Voice & Video) have only a `README.md` with a "scaffolded v0.1" status, where the substrate's own template (`verticals/_template/`) declares a 7-file file contract (AGENTS, CANON, MEMORY, README, SKILL, SOUL, STACK). The only IS-tier vertical that actually runs the wrapper substrate it preaches is the domain sub-stack at `verticals/people-intelligence/`, which is *not even a 10-IS layer* — it's a domain-tier wrapper one tier down.

What that means in practice: **5 of 10 IS layers have no executable surface beyond a README + the underlying agent + commands.** The agents and commands are real (`/discover-genius`, `/wealth-dpi`, `/architect-entity`, `/creator-pipeline`, `/capture-daily`, `/define-vision` all run today on real input). The IS *as a coherent intelligence layer with its own SKILL/SOUL/CANON/MEMORY/STACK files* is not coherent — it is positioning by reference rather than positioning by substrate.

Per Lyssandria's strategist read: **Code IS and Voice & Video IS specifically risk staying positioning rather than capability.** I confirm that read. Code IS is a README pointing at existing `/arco` and `/ao` external commands plus four harness directories where 3 of 4 are README-only; the wrapper exists, the wrapped runtime is one CLI of four. Voice & Video IS is a README pointing at three modality-attestation commands (which work) plus a Python voice service scaffold (which is well-built but never run on this machine) plus a video-factory promise that has zero code. If a sovereign adopter forked the repo tomorrow expecting Code IS or Voice & Video IS to be a callable IS surface, they would find positioning, not capability. The risk is not hypothetical — it is what the disk state actually shows.

The plan's Phase 1 fixes capture stack and harness depth. The plan does **not** schedule the vertical-wrapper file-contract work that would make the 10-IS file system as coherent as the 10-IS taxonomy. That is the gap most invisible because the plan itself doesn't name it.

---

## Summary

**Status counts (35 deliverables across Phase 0–4 + 10-IS layer audit):**

| Status | Count |
|---|---|
| `live` | 9 (Phase 0 spine-lock items where the plan only required positioning, plus Genius / Wealth / Family-agent / Business / Creator / Second Brain / Brand / Health agents+commands, Voice & Video modality attestation, People Intelligence vertical) |
| `staged` | 7 (orchestrator promotion path, claude harness alone, screenpipe playbook, meetscribe playbook, mem0 playbook, console graph viz, orchestrator-as-IS) |
| `scaffolded` | 6 (vertical wrappers for code / voice-video / family, voice-operator service, voice-operator stt, voice-operator tts, voice-operator routing primitives) |
| `unsurfaced` | 13 (graphiti, syncthing, daily brief, workspace switching, vercel room, voice primitives wiring, all of Phase 3 spine surfaces, all of Phase 4 except 4.1, vertical wrappers for 5 IS layers, sound-intelligence sub-systems pending parallel agent) |

**Top 5 critical gaps blocking Phase 1:**
1. Graphiti install playbook + Markdown-vault adapter — code novel, no upstream playbook.
2. Syncthing install playbook + 7-folder pair recipe — sibling to other install docs, not yet written.
3. Daily-brief generator (Phase 1.7) — gates Phase 1 → Phase 2 transition.
4. Vertical-wrapper file contract missing for 5 of 10 IS layers — invisible because the plan doesn't schedule it.
5. Codex / Gemini / OpenCode harnesses README-only — the multi-CLI promise is single-CLI in practice.

**Is the system ready for the first sovereign adopter to fork it tomorrow?**
**No.** They could fork the substrate, the SIP attestation, and the People Intelligence reference vertical and get real value. They could not fork "the 10-IS Intelligence System" and get ten coherent IS surfaces — they would get ten positioning statements, eight working agents, and approximately twenty working commands distributed across ten layers without a unified vertical wrapper for five of them. Honest answer: the system is ready for **a sovereign adopter who is also a builder**. It is not yet ready for a sovereign adopter who expects ten file-contract-coherent IS layers off the shelf.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, command-tiers]
- Vertical: starlight-intelligence-system@v7.5 readiness audit
- Generated: 2026-04-26
