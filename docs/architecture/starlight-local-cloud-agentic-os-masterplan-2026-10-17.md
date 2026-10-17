# Starlight Local + Cloud Agentic OS — Master Architecture, Cost Routing & Substrate Roadmap

- **Date**: 2026-10-17
- **Status**: Live Baseline Verified · Next 5 Waves Specified
- **Interactive Cockpit**: `C:/Users/frank/starlight/command-center/starlight-agentic-os-command-center.html` (and `docs/cockpit/starlight-agentic-os-command-center.html`)
- **Generator**: `scripts/build-unified-command-center.mjs`
- **Voice & Quality Contract**: `frankxai/starlight-design-intelligence@3d6fc8fdd38b5db69a16db1078e30d454e891af1` · `C:/Users/frank/.starlight/policies/product-outcome-quality.md`
- **Attestation**: Built on SIP

---

## 1. The Overarching Goal: What We Have Built & What We Are Building Behind All This

Frank's estate spans **237 local repositories**, **39 active git worktrees**, **10 GitHub Organizations** (`71` federated flagship repositories), **7 local AI coding harnesses**, and **9 cloud execution/hosting planes**.

Without a unified operating system, multi-agent work across this scale suffers from four classic failure modes:
1. **Context Amnesia**: Decisions made in Claude Code are invisible to Codex, Antigravity, or Hermes two hours later.
2. **Worktree & Branch Collisions**: Multiple harnesses edit the same checkout or leave unpushed branches stranded.
3. **Local RAM Exhaustion vs. Cloud Isolation**: Spawning too many local agent processes drops physical RAM below the 4 GiB floor (`0x41306` task terminations), while cloud agents (`Claude Cloud`, `Codex Cloud`, `Railway`, `n8n`) cannot write back to the local stdio queue.
4. **Unmonitored API & Infrastructure Spend**: Paying per-token API rates for work covered by flat-rate subscriptions, or running duplicate cloud containers without heartbeat verification.

### The Starlight Solution (Live Today vs. Next Horizon)

| Substrate Pillar | Verified Live Today (2026-10-17) | Next Horizon Target (Waves 1–5) |
| :--- | :--- | :--- |
| **1. Sovereign Memory & Eval-50** | **1,106 sovereign atoms** compiled across all 6 vaults (`Strategic ◆`, `Technical ⬡`, `Creative ✦`, `Operational ▸`, `Wisdom ◎`, `Horizon ↗`) + 400 KG rows. `Eval-50` verified at **`Hit@10 = 1.000`**, **`Recall@5 = 1.000`**, **`MRR@10 = 1.000`** (`p50 = 218.9ms`). `SisGatewayDaemon` live on `127.0.0.1:5200`. | Real-time cross-harness session ingestion into `:5200/v1/sessions` + Headroom context compression (`55%` token savings) + automated semantic drift alerts. |
| **2. 10-Org GitHub Federation** | **10 GitHub Organizations** standardized, `9/9` active `<Org>/.github` governance repos deployed, **71/71 local checkouts** wired with dual `origin` (`frankxai/*`) + `org` (`<Org>/*`) remotes, `0` visibility violations. | Automated CI/Eval-gated cross-org release syndication + branch protection convergence across all 71 flagship repos. |
| **3. 2h / 12h / 1w Horizon Loops** | `StarlightHorizon2h`, `StarlightHorizon12h`, `StarlightHorizon1w`, and `StarlightOpsGuardAudit` registered and verified (`LastTaskResult = 0`), auto-rebuilding the HTML5 Command Center on every run. | Retire 9 legacy duplicate failing Windows tasks into the unified Horizon runner and wire n8n heartbeat receipts. |
| **4. Local <-> Cloud Bridge** | 7 local harnesses coordinate via `ops-guard` git worktree leases (`161` tracked leases) and local `queen/inbox`. | **Cloudflare Edge Bridge** (HMAC-signed HTTPS Worker + Durable Object) so Railway, n8n, Claude Cloud, and Codex Cloud enqueue receipts safely into the local estate. |
| **5. Cost & Quota Router** | Subscription-first routing (`Claude Max`, `ChatGPT Pro`, `Gemini Pro`) + BYOK/provider doctrine in `providers.graph.json`. | Unified `cost-ledger.jsonl` + Anthropic/OpenAI Prompt Caching (`90%` read discount) + Batch API (`50%` discount) + Railway prune (`$123/mo` -> `<$45/mo`). |
| **6. Traces, Evals & Studio** | Horizon JSONL telemetry (`.starlight/telemetry/horizon-*.jsonl`), per-harness transcripts, and Santa Method Fire/Crown convergence loops. | Unified OpenTelemetry / Langfuse trace ingestion joining prompt version, model latency, token cost, and Eval-50 score per PR. |

---

## 2. Local + Cloud Harnesses, Runtimes & Cost Routing Matrix

### 2.1 The 7 Local Agent Harnesses (Workstation Fleet)

All local harnesses obey the **Memory Guardian 4 GiB Free-RAM Floor** and coordinate via isolated git worktrees (`C:/Users/frank/starlight/worktrees/<scope>`) on branches named `agent/<harness>/<scope>`.

| Harness | Models | Cost Model | Max Local Workers | Primary Strengths & Contributions | Evals & Traces | How to Kick Off Cloud Work |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Claude Code CLI & Desktop** | Opus 4.7 / Sonnet 4.6 / Haiku 4.5 | Flat-Rate Max Sub (`$0` marginal) + API Fallback | Max 2 Opus/Fable sessions (4 GiB floor) | Primary estate conductor (`/yolo`), multi-file architecture, 89 skills, book/editorial prose, Santa Loop Crown Gate | Transcript JSONL + `agent-quality` 9-check + `verification-loop` | `claude --remote "<task>"` or `claude.ai/routines` |
| **Google Antigravity** | Gemini 3.1 Pro / Flash + Native Image/Veo | Workspace / Pro Sub (`$0` marginal) | 1 Lead + 3 Subagents (`research`, `self`, `image-generator`) | 1M+ context window, reactive background tasks, native `schedule`, 10-Org federation, Horizon loops, NanoBanana/Veo media | `brain/<id>/.system_generated/logs/transcript.jsonl` + Horizon JSONL | `Invoke-StarlightHorizonCadence.ps1` / n8n webhook |
| **OpenAI Codex CLI & App** | GPT-5.4 / Codex-Max / o3 | ChatGPT Pro Sub (`$0` marginal) + Batch API | 2 local worktrees + parallel Cloud Sandboxes | Surgical exact-revision code review (`/gstack-codex`), browser QA (`gstack`), deterministic test generation | `.codex/automations` + `gstack-benchmark-models` | `codex cloud exec "<spec>"` (isolated cloud container) |
| **Hermes Agent OS** | Multi-Model (Claude / Gemini / OpenRouter) | OAuth Sub + OpenRouter metered | 1 Desktop daemon + 6 CoE Guardian profiles | Isolated profile memory, standing crons, deep cross-repo provenance search (`starlight_workspace_bootstrap.py`) | `AppData/Local/hermes/cron/jobs.json` + `logs/heartbeats/` | Hermes MCP -> Railway / n8n webhook |
| **OpenCode / OmO** | Kimi K2.6, GPT-5.4, Claude, DeepSeek | OpenRouter / Direct API (pay-per-token) | Team Mode (up to 11 role workers) | Boulder state tracking (`.omo/boulder.json`), heterogeneous model arena, low-cost bulk mechanical transforms | `.omo/boulder.json` + OpenRouter spend logs | OpenRouter async batch dispatch |
| **Gemini CLI** | Gemini 3.1 Pro / Flash-Lite | Google AI Pro / Vertex API | 2 fast CLI workers | Ultra-fast 1M token repo ingestion, low-RAM Shift/Flow gate scanning, large transcript summarization | `GEMINI.md` contract + session logs | Vertex AI Batch / Cloud Run job |
| **Grok Build (xAI)** | Grok 4 / Grok-Code | X Premium+ / xAI API | 1 worktree worker (`grok-harness-adapter`) | Real-time X/cultural pulse, AI lab release radar, rapid creative/game prototypes | `grok-harness-adapter` logs + git diff gates | xAI async API completion |

### 2.2 The 9 Cloud Runtimes, Infrastructure Planes & Beta Features

| Cloud Platform | Cost Model & Spend Posture | Role & Beta Capabilities to Exploit | How Local Harnesses Trigger It | Substrate Gap to Solve Next |
| :--- | :--- | :--- | :--- | :--- |
| **Claude Cloud Routines & Anthropic API** | Included in Max + API (`Prompt Caching` 90% read discount, `Batch API` 50% discount) | Scheduled cloud routines (run when laptop is closed), Extended Thinking, Computer Use beta, Prompt-Cached system prompts | `claude.ai/routines` schedule or Anthropic Messages/Batch API with `anthropic-beta: prompt-caching` | Route outputs to the Cloudflare Edge Bridge so cloud routines write receipts into `queen/inbox` |
| **OpenAI Codex Cloud & Batch API** | Included in Pro + API Batch (50% discount) | Zero-local-RAM cloud SWE containers that clone `<Org>/<Repo>`, run test suites, and open draft PRs | `codex cloud run --repo <Org>/<Repo> "<prompt>"` | Add `.codex/setup.sh` across flagship repos so cloud sandboxes boot dependencies in `<15s` |
| **Google Cloud / Vertex / Veo / NanoBanana** | Workspace / Cloud Credits + metered media | 1M–2M Context Caching, magazine-grade visuals (`nb-image`), Veo video pipelines, Flash-Lite bulk classification | Native `generate_image` / `nb-image` / Vertex Context Caching API | Use Gemini Flash-Lite Context Caching for zero-cost background vault classification |
| **Cloudflare (Workers, Durable Objects, R2)** | `$5–$20/mo` (Workers Paid + R2 zero-egress) | **The Cloud-to-Local Bridge**: hosts HMAC-signed HTTPS inbox queue, R2 artifact mirror, and edge MCP gateways | `wrangler deploy` / HTTPS `POST` to edge worker | Deploy `starlight-edge-bridge` Worker + Durable Object (Wave 2) |
| **Vercel Fleet** | Pro Sub (`$20/mo` + KV/Blob) | Hosts `frankx.ai`, `arcanea.ai`, `starlightintelligence.org`, `gencreator.ai`, and preview URLs on every PR | `git push origin agent/<harness>/<scope>` -> Draft PR preview | Drop legacy `arcanea-ai-appx` check first, then delete 5 duplicate unlinked projects |
| **Railway Service Mesh** | Usage-based (`~$123.45/mo` measured -> target `<$45/mo`) | 24/7 Docker containers: self-hosted `n8n`, `Postiz` social engine, background workers | `railway up` / webhook triggers | Enumerate all environments live, prune empty projects, and wire Railway services to Edge Bridge |
| **n8n Automation Cloud** | Self-hosted on Railway (`$0` license) | Scheduled `2h`/`12h`/`1w` webhook orchestration, Slack/Telegram alerts, GitHub org issue triage, Resend flows | Import `workflows/n8n/starlight-horizon-memory-orchestrator.workflow.json` | Emit `heartbeat-n8n.json` on every workflow execution to satisfy the two-signal liveness rule |
| **OpenRouter Gateway** | Prepaid credit with hard per-key caps | Unified router for 200+ models with automatic fallback and per-agent spend tracking | `OPENROUTER_API_KEY` via `model-routing` skill | Fix `StarlightOpenRouterSpend` task (exit code 2) to append to `cost-ledger.jsonl` |
| **Langfuse + Headroom** | Self-hosted / Free Cloud Tier | OpenTelemetry trace ingestion across harnesses + Headroom context compression (`40–70%` token savings) | `/headroom` skill + OTEL env vars in `SisGatewayDaemon` | Emit OTEL spans from `SisGatewayDaemon (:5200)` on every memory search/add and eval run |

---

## 3. 10 GitHub Organizations: Brand Teams, AI OS Layers, IP, Connectors & Governance

All **10 GitHub Organizations** (`71` mapped repositories) are audited by `scripts/org-federation-audit.mjs` on every 12h and 1w Horizon run:

1. **`Starlight-Intelligence`** (`starlightintelligence.ai` · `10` repos: `5` public, `5` private)
   - **Council Lead**: `Queen` + `Prime` + `Architect` · **Specialists**: `starlight-architect`, `starlight-sentinel`, `starlight-weaver`, `starlight-hermes`, `starlight-sage`
   - **AI OS / Memory / Skills / MCP**: Sovereign Cockpit (`starlight-command-center`), Voice & Design System (`starlight-voice`, `starlight-design-intelligence`), Eval Harness (`starlight-evals`), `SisGatewayDaemon (:5200)`, `starlight-v0` MCP.
   - **IP, Data, Content & Governance**: Starlight Brand Pack v1.0, Electron/Next.js Observatory (`:4321`), Eval-50 corpus, Android Kit. Protected by `/starlight-board` + SIP Attestation.
2. **`Starlight-Intelligence-Systems`** (`starlightintelligence.org` · `6` repos: `5` public, `1` private)
   - **Council Lead**: `Architect` + `Sage` + `Prime` · **Specialists**: `starlight-sage`, `starlight-navigator`, `starlight-hermes`, `starlight-sentinel`
   - **AI OS / Memory / Skills / MCP**: Layer 0 SIP Protocol, all 6 semantic memory vaults (`1,106` atoms), `mcp-server.js` (`sis_vault_search`, `sis_append_entry`), Syncthing P2P sync.
   - **IP, Data, Content & Governance**: SIP Spec, 151 Agent Profiles, 89 Skill Rules, public research (`starlightintelligence.org/research/`). Gated by v75–v79 symmetry tests + `/starlight-board`.
3. **`Arcanea-Labs`** (`arcanea.ai` · `8` repos: `6` public, `2` private)
   - **Council Lead**: `Lumina (Queen)` + `Weaver` + `Arcanean Art Director` · **Specialists**: `arcanea-story`, `arcanea-coder`, `arcanea-reviewer`, `canon-guardian`, `anime-storyboarder`
   - **AI OS / Memory / Skills / MCP**: Creative Worlds & Ten Gates progression framework, `Creative ✦` & `Wisdom ◎` vaults, NanoBanana (`nb-image`), Veo video, ElevenLabs, Suno.
   - **IP, Data, Content & Governance**: `CANON_LOCKED.md` (read-only to agents), AnimeLegends Trinity (`Akashi`, `Kage`, `Mira`), Starbound Crews, NFT/onchain lore. Gated by `/canon-check` + Santa Loop.
4. **`GenCreator-ai`** (`gencreator.ai` · `8` repos: `6` public, `2` private)
   - **Council Lead**: `Envoy` + `Orchestrator` + `Creation Engine` · **Specialists**: `content-director`, `music-video-producer`, `audio-producer`, `social-strategist`
   - **AI OS / Memory / Skills / MCP**: Agentic Creator OS (`ACOS`), `suno-mcp-server`, `starlight-creator-mcp`, `Postiz` (Railway), `Resend`, `Vercel Blob`.
   - **IP, Data, Content & Governance**: 845+ Suno track catalog, Creator Launch OS templates, multi-platform studio pipelines. Gated by Waitlist-first + BYOK + Zero-Orphan Provenance.
5. **`FrankX-AI`** (`frankx.ai` · `9` repos: `7` public, `2` private)
   - **Council Lead**: `Prime` + `Frank Brand Editor` + `Adversarial Reviewer` · **Specialists**: `author-team`, `seo-specialist`, `visual-intelligence`, `canary`
   - **AI OS / Memory / Skills / MCP**: Editorial Publishing House, Book Engine, Visual Intelligence System (`VIS`), Vercel MCP, Plausible, Resend, `mcp-doctor`.
   - **IP, Data, Content & Governance**: Books, Prompt Library, `claude-skills-library`, `metrics/current.json`. Gated by Metrics Truth Rule + Editorial Anti-Slop Gate.
6. **`AI-Architect-Studio`** (`frankx.ai/ai-architect` · `7` repos: `6` public, `1` private)
   - **Council Lead**: `Architect` + `Sentinel` + `Navigator` · **Specialists**: `starlight-architect`, `security-auditor`, `ops-steward`, `healer`
   - **AI OS / Memory / Skills / MCP**: Enterprise AI CoE blueprints, `agentic-ops` control plane, `starlight-department-lab` MCP, `ops-guard` lease engine.
   - **IP, Data, Content & Governance**: Agentic OS Standard, AI CoE Field Guide, 10-Org Federation Manifest. Gated by `ops-guard` worktree lease + 4-fact git check.
7. **`AI-Architect-Academy`** (`frankx.ai/academy` · `2` repos: `1` public, `1` private)
   - **Council Lead**: `Sage` + `Genius` + `Concierge` · **Specialists**: `learning-architect`, `workshop-facilitator`, `practice-evaluator`
   - **AI OS / Memory / Skills / MCP**: Cohort syllabus, Department Lab evaluation cases (`get_evaluation_cases`, `check_evaluation_answers`), Vercel KV waitlist.
   - **IP, Data, Content & Governance**: 30-Day Pillar Syllabus, cohort labs, builder rubrics. Gated by Waitlist-first + strict Oracle separation.
8. **`Agentic-Income`** (`agenticincome.ai` · `9` repos: `7` public, `2` private)
   - **Council Lead**: `Navigator` + `Business IS` + `Impact Diligence Analyst` · **Specialists**: `investor-research`, `affiliate-auditor`, `revenue-modeler`, `thesis-debater`
   - **AI OS / Memory / Skills / MCP**: Wealth & Business Intelligence Sub-Stack, `wealth-ops`, `investor-research`, `affiliate-audit`.
   - **IP, Data, Content & Governance**: IIS Strategy theses, affiliate catalog, wealth agent skills. **NON-WAIVABLE GATE**: Money fails closed; research-only; zero autonomous money movement.
9. **`Life-Commons`** (`bluelifecommons.org` · `7` repos: `6` public, `1` private)
   - **Council Lead**: `Sage` + `Embodiment IS` + `Relational IS` · **Specialists**: `marine-intelligence`, `health-body-substrate`, `family-tree-archivist`
   - **AI OS / Memory / Skills / MCP**: Ocean (`blue-life-commons`), Paleontology (`dino-life-commons`), Health, Mind, and Family sub-stacks.
   - **IP, Data, Content & Governance**: Conservation & longevity models, Family History Atlas. **NON-WAIVABLE GATE**: Model, never diagnose (zero clinical language); strict private/public split.
10. **`oci-ai-architects`** (`github.com/oci-ai-architects` · `5` repos: `4` public, `1` private)
    - **Council Lead**: `Oracle AI Architect` (Scoped Read-Only Community Mode) · **Specialists**: `oci-services-expert`, `oci-drawio-icon-native`, `oracle-solution-design`
    - **Governance Gate**: **`RESHAPE-FROZEN`** — read-only in estate automation; strict separation from Arcanea Labs BV.

---

## 4. Solving the Remaining LLM, Agent Substrate & MCP Gaps (Next 5 Waves)

### Wave 1: Scheduled Task Consolidation & Unified Cost Ledger (`cost-ledger.jsonl`)
- **Problem**: `StarlightHorizon1w` surfaced 9 legacy Ready tasks in Windows Task Scheduler with non-zero last exit codes (`Starlight-GbrainWatchdog`, `StarlightCostCollect`, `StarlightDreaming`, `StarlightFleetPulse`, `StarlightOpenRouterSpend`, `StarlightQueenProbe2h/12h/Week`, `StarlightTaskHealthWatch`).
- **Solution**:
  - `StarlightHorizon2h`, `StarlightHorizon12h`, and `StarlightHorizon1w` already execute Dreaming, Gateway auto-heal, Eval-50, and Task auditing with `LastTaskResult = 0`.
  - Retire or re-point the redundant legacy tasks so Task Scheduler has zero noisy failures.
  - Upgrade `StarlightCostCollect` / `StarlightOpenRouterSpend` into a deterministic `scripts/collect-estate-cost.mjs` writer that records OpenRouter credit burn, Railway monthly estimate, Vercel status, and subscription quota posture into `C:/Users/frank/.starlight/telemetry/cost-ledger.jsonl`.

### Wave 2: Cloudflare Edge Bridge (Local <-> Cloud Queue & Receipt Bus)
- **Problem**: `gen-systems-map.mjs` proved that `agentic-ops/business_queue.json` and `starlight/queen/inbox` are local files/stdio on the laptop — unreachable when `Railway`, `n8n`, `Claude Cloud Routines`, or `Codex Cloud` finish a job while the laptop is asleep.
- **Solution**:
  - Deploy a lightweight **Cloudflare Worker + Durable Object** (`starlight-edge-bridge`) authenticated via HMAC-SHA256 bearer token.
  - Cloud workers (`n8n`, `Railway`, `Claude Cloud`, `Codex Cloud`) `POST /v1/receipts` with their signed heartbeat and handoff packet.
  - Every 2 hours (and on laptop wake), `StarlightHorizon2h` pulls and verifies queued cloud receipts into `C:/Users/frank/starlight/logs/heartbeats/` and `C:/Users/frank/starlight/queen/inbox/`.

### Wave 3: Headroom Context Compression, Prompt Caching & Lazy MCP Router
- **Problem**: Loading 40+ MCP tool schemas eagerly and passing uncompressed CLI/log outputs burns context window budget and API tokens.
- **Solution**:
  - Keep MCP servers lazy-loaded (`mcp-server.js` + `call_mcp_tool` pattern) so only active domain tools enter context.
  - Route large command/log outputs through **Headroom** (`skills/headroom/SKILL.md`) for `40–70%` lossless structural compression.
  - Pin static `AGENTS.md` Band-A and vault headers as the deterministic prefix on all Anthropic/OpenAI/Gemini API calls to lock in the **90% Prompt Cache read discount**.

### Wave 4: Land Open Federation PRs & Sync Dual Remotes
- **Problem**: Three coordinated PRs hold our completed federation, memory compiler, and horizon automation work:
  - `frankxai/Starlight-Intelligence-System#451`
  - `frankxai/agentic-ops#275`
  - `frankxai/agentic-ops-hub#362`
- **Solution**:
  - Run final `/santa-method` verification, merge `#451`, `#275`, and `#362`, and push `main` to both `origin` (`frankxai/*`) and `org` (`<Org>/*`).

### Wave 5: Live Observatory Integration (`starlight-Command-Center` Port 4321)
- **Problem**: `starlight-Command-Center/apps/observatory` (Next.js port `4321`) currently reads legacy heartbeats (`heartbeat-queen`, `heartbeat-loopfleet`), while our new `horizon-{2h,12h,1w}-latest.json` and 10-Org Federation telemetry live in `.starlight/reports/`.
- **Solution**:
  - Add `/api/horizon` to `apps/observatory` and embed our new Unified Command Center views directly into the Electron/Next.js Observatory so standalone HTML5 (`starlight-agentic-os-command-center.html`) and live port `4321` share 100% identical data contracts.
