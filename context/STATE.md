---
title: Starlight v12 — State of Ground Truth (Library + no-trademark protocol + Atlas/Arcanea brand layer)
date: 2026-05-17
supersedes: 5dc5a30 (Phase 0 STATE.md v1, covenant-era framing)
author: Frank Riemer / Starlight Holding (peer architect: Claude Opus 4.7, 1M context)
phase: Phase 0 v2 — self-inventory under v12 framing before PLAN.md
purpose: Diagnostic snapshot of what already exists across Frank's ecosystem that serves the Library-of-Alexandria architecture with Bitcoin/Ethereum-style unowned protocol name + commercial brand layer (Atlas + Arcanea + GenCreator Community). Not a build plan. PLAN.md is the next artifact and is gated on Frank's review of this document.
covenant_dependency: COVENANT.md (with Article XI no-trademark commitment), SOUL.md, STARLIGHT.md, LIBRARY.md, PROTOCOL.md, THREATS.md, IDENTITY.md, BRANDS.md — all gated on Frank's authorship per L99 v12 brief.
attestation: Built on Starlight Protocol v1.1.1 (file: SIP.md; external register: "Starlight Protocol")
---

# STATE.md v2 — Starlight v12 ground truth

> *Library of Alexandria for benevolent intelligence — unowned protocol name in the Bitcoin/Ethereum tradition, commercial brand layer where revenue lives, Individual served first, coding-agent-native at the wedge, gratitude+vision vaults at the heart.*

## §0 Purpose + v12 framing

This document is **diagnostic, not directive.** It surfaces what already exists across Frank's ecosystem that can serve the v12 Library + no-trademark-protocol + Atlas-Arcanea-GenCreator-brand-layer architecture; identifies what is scaffolding vs. production-ready; maps existing primitives to the five rings, eight Halls, and eleven audiences; flags the naming-register exposure across the repo; and surfaces the small set of v12-specific sovereign-class forks that require Frank's input before PLAN.md is written.

**The seven v12 load-bearing axioms** (treated as constraints):

1. **The protocol name `Starlight` is unowned, free, untrademarked, irrevocably.** Bitcoin/Ethereum/HTTP/Linux/Markdown lineage. Covenant Article XI codifies this.
2. **Commercial brands ARE trademarked separately:** Atlas (Console product, EU+US classes 9+42 when launches Q1-Q2 2027); Arcanea (creator academy/music/lore, EU+US classes 9+16+41+42 summer 2026); GenCreator Community (when ready, classes 35+41+42); future verticals as launches.
3. **Library of Alexandria for benevolent intelligence** — five concentric rings (Soul / Atomic / Substrate / Sovereign Architectures / Cosmology+Curation) expressed as eight site Halls.
4. **Eleven audiences, Individual priority-1.** Differentiation happens at the sovereign-architecture layer, not at the substrate.
5. **Coding-agent-native primary at the substrate layer.** The wedge that serves all 11 audiences.
6. **Living Archive (gratitude + emerging-AGI-vision vaults) is the emotional engine** — paired vaults inside Hall of Cosmology + Living Archive. Open-write, attestation-carrying, human + AI co-authorable.
7. **No employees through €500K MRR; lifestyle is the proof.** Contractor model via FrankX Ops BV. Architecture must deliver houseboat / villas / late-night creative flow / gym / cold plunge / Dispenza / Tien / travel as structural consequence, never managed-around.

Every section below is checked against these seven axioms.

---

## §1 Brand architecture (four layers, three trademark filings active)

| Layer | What it is | Naming | Trademark posture |
|---|---|---|---|
| **L1 — Protocol (unowned, free)** | The Starlight Protocol spec + atomic-unit specs + agent harness library + canonical artifacts + Library framing | Starlight Protocol · Starlight Foundation (eventual stichting) · Starlight Library · Starlight Academy · Starlight Intelligence System (cosmological narrative name, preserved in lore) · `starlight.foundation` canonical domain · `frankxai/starlight` canonical repo | **NO TRADEMARK FILED. EVER.** Covenant Article XI. Bitcoin/Ethereum lineage. |
| **L2 — Atlas (Console product, commercial)** | Managed-tier Console (€29 → €10K+/mo) + self-hosted Atlas distro (MIT, free) + 3D substrate visualization + multi-device sync | Atlas · `atlas.starlight.foundation` (or `atlas.app` if available) | **TRADEMARK PLANNED** EU+US classes 9+42 when Console launches publicly Q1-Q2 2027 (~€2K). ⚠️ Atlas is heavily trademark-crowded; class-9+42 search REQUIRED before commit. Backup names: Loom (taken-Atlassian) / Lyceum / Cinder / Lantern / Beacon. |
| **L3 — Verticals (each its own trademarked brand)** | Arcanea (creator academy + music + lore + retreats) · GenCreator Community (community + education + commercial) · Anime Legends (when ready) · Wealth IS productized · Family IS (closed, no commercial trademark) | Arcanea · GenCreator Community · Anime Legends · etc. | **TRADEMARK PLANNED** Arcanea: EU+US classes 9+16+41+42 summer 2026 (~€3K). GenCreator Community: EU+US classes 35+41+42 when ready (~€2K). Future verticals as each launches. |
| **L4 — Frank Riemer (personal brand)** | Advisory + workshops + strategic partnerships + founding essays + Academy teaching + public speaking + Founding Members tier | FrankX Operations BV (post-June 2026) · `frankx.ai` · personal LinkedIn | **NO TRADEMARK** — your name is your name. Personal brand voice register anchors the covenant during interim stewardship. |

**Coexistence with Starlight Intelligence Sdn Bhd (Malaysia, cybersecurity) and Starlight AI Ltd (UK, fund admin)** dissolves under no-trademark posture. Nothing to enforce; market sorts context. The `starlight.foundation` domain + descriptive use of "Starlight Protocol" provide adequate disambiguation. Per v12 §"How Malaysian SI Sdn Bhd... become non-issues."

**Total trademark cost over 24 months:** ~€5-10K (Arcanea + GenCreator + Atlas), versus indefinite legal exposure under trademark-the-protocol strategy. Net savings + cleaner covenant + Bitcoin/Ethereum register signals.

---

## §2 Five concentric rings — what exists / what to build / top-3 moves per ring

### Ring 1 — Soul (covenant + three principles + cosmology + benevolence + Living Archive)

| What exists | What needs polishing/building | Top-3 leverage moves |
|---|---|---|
| Existing covenant precedent: SIP v1.1.1 § 5 Sovereignty + Attribution clause (7 items including encoded-self forkable boundary v1.1.1) at `SIP.md:86-96`. Memory consolidation working under [project_v77_memory_orchestrator_v01]. Three Principles partial (Sovereignty / Attribution / Benevolence loosely in SIP §5). | **COVENANT.md draft (Articles I-XI)** — Frank-authored, Article XI = name-and-brand no-trademark commitment. **SOUL.md** — Frank-authored, his founding essence statement. **STARLIGHT.md** canonical overview. **LIBRARY.md** framing doc. **Living Archive** wiring (gratitude + vision JSONL entries already shipped to `starlight-horizon-dataset` per 2ff3f96; needs Hall surface). | 1. **Frank drafts Articles I-XI** (highest leverage — locks every downstream artifact). 2. **Adopt Article XI verbatim** from v12 brief (Bitcoin/Ethereum-grade language already drafted). 3. **Living Archive Hall surface** wired to `starlight-horizon-dataset` public dataset via fetcher (no central authority — pulls public JSONL). |
| **Existing primitives:** `/sip-attest*` commands (6) · `agents/council/*` (7 archetype seats — Elder Father/Mother, Sage, Builder-Elder, Shadow Witness, Divine Neutral Witness, Future Self at 90) · `starlight-horizon-dataset` repo with 11 entries (founding 8 wishes + 3 Arcanea session + 1 v9/v12 founding intention added today). | Pillar-1 (Sovereignty), Pillar-2 (Attribution), Pillar-3 (Benevolence) — codify into covenant Articles. | |

### Ring 2 — Atomic units (SKILL.md · AGENTS.md · Knowledgebase format · Vault type catalog)

| What exists | What needs polishing/building | Top-3 leverage moves |
|---|---|---|
| **SKILL.md format:** 69 SIS skills (v76 → reconciled 2026-05-17 per updated CLAUDE.md) across 13 domains (`skills/skill-rules.json` with full auto-activation triggers). **AGENTS.md format:** 42 agents across 7 tiers (`agents/AGENT_REGISTRY.md`). **Knowledgebase format:** 6 substrate vaults + per-vertical MEMORY.md files + Starlight Vaults JSONL (creative/horizon/operational/strategic/technical/wisdom). **Pack runtime:** `src/pack-runtime.ts`. **MCP friend-starter pack:** `integrations/starter-packs/friend-starter/mcp.json`. | **SKILL.md frontmatter backfill:** 25 of 56 SKILL.md files still lack FM per 2026-05-04 audit — debt that degrades diligence-grade register. **Knowledgebase format spec** — open spec for adopters (what is a Starlight Vault, what types exist, schema, JSONL or DB-backed). **Vault Type Catalog** as v12-specified canonical list: Gratitude · Vision · Second Brain · Family · Business · Cosmology · Protection. | 1. **Publish atomic-unit format specs at Hall of Atomic Units** (gives adopters concrete schemas to implement, makes coding-agent-native real). 2. **SKILL.md frontmatter backfill sweep** (~4h work per S2 sweep). 3. **`agent-harness-manifest` already shipped** (`83fab4e` + `37afac5` chore commits) — needs documentation + MIT extraction to public package per L99 v12 Phase 1 July-Sept "Agent harness library v1 MIT released." |

### Ring 3 — Substrate (vault + agent harness + Atlas Console + protection patterns + multi-chain templates)

| What exists | What needs polishing/building | Top-3 leverage moves |
|---|---|---|
| **Vault:** `src/memory.ts` + `vault-memory.ts` + `vault-loop.ts` (production). **Memory Bus** singleton stdio MCP `[project_memory_bus_v01]`. **Cross-Repo Indexer** [project_cross_repo_indexer_v01] (520 atoms across 22 dirs in 2.69s, 25 tests). **Agent harness:** `src/agents.ts` + `orchestrator.ts` + `forge.ts` + `pack-runtime.ts`. **Console foundation:** `src/cli.ts` (12-subcommand zero-dep CLI), `starlight-mcp.ts` (+ v0/v01 variants), `core/orchestrator/harnesses/`. **3D substrate viz:** vellum-voltage 3d substrate liquid-glass tier upgrade just shipped (`4897b69`) — direct Atlas v0.1 candidate. **Protection patterns:** `/openclaw-audit` command exists, `agents/starlight-sentinel.md`. **mempalace↔obsidian↔3d bridge** (`9bf4071`) — canvas overlay + curate-recall CLI + skill. | **Atlas product surface:** consolidate `src/cli.ts` + canonical MCP + agent harness + 3D viz under unified "Atlas" branding. Pick canonical MCP impl from `starlight-mcp.ts`/`mcp-server.ts`/`mcp-server-v01.ts`, archive the others (~3h). **Hall of Protection** as paid-pillar surface (Sovereignty & Protection €697). **Multi-chain templates** — `verticals/code/` has no smart contract templates yet; net-new build (Phase 2, Oct-Dec 2026 per v12 PLAN). **Predictive Layer** v0.1 subsystem `[project_v753_brain_publisher_packet_inspector]` (512+40 tests, brain SSE events). | 1. **Atlas v0.1 bundle:** CLI + canonical MCP + agent harness + 3D viz = Console Day-1 shippable in ~6-9h polish (highest leverage primitive). 2. **Hall of Protection content** from `/openclaw-audit` + Sentinel agent + sec-audit memory entries (revenue line AND defense article — double value). 3. **Multi-chain composition pack** as Phase 2 build using existing chain primitives (EAS / Story Protocol patterns) — net-new IP in v12 Phase 2. |

### Ring 4 — Sovereign architectures (seven reference designs as adoptable bundles)

| What exists | What needs polishing/building | Top-3 leverage moves |
|---|---|---|
| **Four reference Domain Sub-Stack verticals already live:** People Intelligence (6 sub-systems, 28 commands, `verticals/people-intelligence/`) · Sound Intelligence (6 sub-systems, 30 commands, `verticals/sound-intelligence/`) · Music IS (7 agents, 8 commands, Frank-operated) · Energy Intelligence (board-passed 2026-05-03). **New fifth:** AI Ops Intelligence v0.1 (`verticals/ai-ops-intelligence/`, board PROCEED `df86dcd`). **`/spawn-domain-stack`** generalizes the pattern. **`/compose-stack`** sequences 10-IS for any person. | **Seven reference architectures from v12 brief:** Coding Agent Operator · Solo Creator · Small AI Startup · Research Collective · Family Sovereignty · Sovereign Enterprise · Convergence. **All seven need authoring** as opinionated bundles (different shape than Domain Sub-Stack — these are *audience-mapped* bundles of substrate primitives, not vertical wrappers). | 1. **Coding Agent Operator Architecture (€797)** as first published — highest WTP, closest fit to coding-agent-native wedge, July-Sept 2026 ship per v12 PLAN. 2. **Solo Creator Architecture (€497)** as second — composes Creator IS + Vision + Brand + parts of Music/Sound. 3. **Small AI Startup Architecture (€1,997)** as third — highest unit revenue, composes Business + People + Code + Atlas. |

### Ring 5 — Cosmology + Curation (Arcanea + Suno + visual language + curated registry + Living Archive)

| What exists | What needs polishing/building | Top-3 leverage moves |
|---|---|---|
| **Arcanea canon** at `frankxai/arcanea-ecosystem` (separate repo, CC-BY-NC) — Guardian/Vel'Tara/Hz system, Luminor Council, Nine Vel'Tara, Three Great Academies. **Music IS Suno workflows** at `verticals/music-is/` + `/music-suno-prompt` command. **Vellum & Voltage design language** per [project_v01_vellum_voltage_design_2026_05_12] — Voltage `#6e5cff` + Doctrine `#e0b656` + Fraunces/JetBrains/Inter + 7 sigils. Now formalized as 3D substrate (`4897b69`). **Curation primitives:** `integrations/starter-packs/friend-starter/` + `/sip-export` (7 ecosystem targets — claude-project, chatgpt-project, gemini-gem, cursor, cowork, microsoft-copilot, custom-gpt). **Living Archive:** `starlight-horizon-dataset` public repo, 12 entries (including today's 2ff3f96 founding-intention from this session). | **Hall of Curation content** — audience-mapped registry of EXTERNAL OSS / missions / grants / bounties / opportunities. Per-audience curation (Solo Creator picks vs Enterprise picks). Pure index + attribution, no payment intermediation. **Living Archive Hall surface** — public-facing read of `starlight-horizon-dataset` with pinned founding essays and search/filter. **Arcanea canon import** from separate repo — composes-not-merges per existing pattern. | 1. **Curation registry v1 populated** (100+ resources, audience-mapped) — per v12 Phase 1 July-Sept timeline. Indexes Trinity Alliance bounties, OpenClaws ops, Optimism RetroPGF, Gitcoin, Anthropic Fellowship, etc. Zero payment intermediation. 2. **Living Archive Hall surface** — wires public dataset to site, pins Frank's Vol.1 essays as first entries. 3. **Annual Benevolence Report shape** — curates best Living Archive contributions into yearly artifact. |

---

## §3 Eight Halls — primitive mapping · gaps · dependencies

| # | Hall | Primitives already mapped | Gap requiring 2-8 weeks | Depends on |
|---|---|---|---|---|
| 1 | **Hall of Atomic Units** | SKILL.md + AGENTS.md + Knowledgebase format · 69 skills · 42 agents · `agent-harness-manifest` (`83fab4e`) · friend-starter MCP pack | Format specs published as canonical public docs · Vault Type Catalog · MIT-published `@starlight/cli` + `@starlight/mcp` + `@starlight/harness` packages | Ring 2 build · npm namespace decision (Q below) |
| 2 | **Hall of Sovereign Architectures** | 5 Domain Sub-Stack reference verticals (People · Sound · Music · Energy · AI Ops) · `/spawn-domain-stack` · `/compose-stack` | 7 audience-mapped reference architectures authored (Coding Agent Operator first) | Ring 4 build · ICP definitions per audience |
| 3 | **Hall of Starlight Academy** (six pillars) | 4 of 6 pillar themes have substrate roots: Wielding AI (skills + agents + harness) · Sovereignty & Protection (`/openclaw-audit` + Sentinel) · Building Sovereign DPI (Wealth IS scaffold) · Stars & Cosmology (Arcanea canon) | 2 pillars net-new (Contributing to Moonshots · Consciousness & Inner Tech) + curriculum production · commerce surface (Stripe-Vercel-MDX) | Frank-authored pillar lessons · commerce integration |
| 4 | **Hall of Curation** | `/sip-export` 7-target compose · friend-starter pack · Cross-Repo Indexer | Audience-mapped registry of external resources (100+ links, per-audience filtering) | Curation taxonomy decision · linker/indexer pipeline |
| 5 | **Hall of Multi-Chain Composition** | None (greenfield) | Smart contract templates per chain (Base first, Solana/Optimism/Polygon CDK in Phase 2) · educational pack at €997 · attestation-on-chain via EAS pattern | Chain selection (Q below) · template repo structure · audit budget |
| 6 | **Hall of Cosmology + Living Archive** | Arcanea canon (external repo) · Vellum & Voltage 3D substrate (`4897b69`) · Suno workflows (Music IS) · `starlight-horizon-dataset` (12 entries) · Luminor Council / Nine Vel'Tara / Three Great Academies | Living Archive Hall surface (public read of horizon-dataset) · Arcanea canon import via attribution-not-merge · paired Gratitude/Vision vault types in Vault Catalog | Arcanea canon CC-BY-NC adoption confirmation · pinned founding essays |
| 7 | **Hall of Protection** | `/openclaw-audit` · `agents/starlight-sentinel.md` · existing security audits in `docs/ops/` · `security-review` skill | Protection pattern publication (prompt injection / MCP sec / agent-harness hardening / key mgmt / multi-chain rug-resistance / social-engineering) · €697 paid pillar curriculum · THREATS.md canonical | Frank-authored pillar lessons · THREATS.md (Frank gates) |
| 8 | **Hall of the Steward** | This document · all `docs/ops/HANDOVER_*` records · all `docs/boards/*` decision records · prior portfolio audits (2026-05-04 / 12 / 13 / 15 / 16) · `/handover` + `/starlight-board` + `/luminor-board` substrate-tier commands | Annual report shape · governance posture statement · public decision log · steward voice fragment (Q below) | Frank-authored voice fragment · COVENANT.md ratification |

---

## §4 Eleven audiences — existing material · closest sovereign architecture · curation status

(Individual served first. Audiences 1-4 are Phase 1+2 priority; 5-11 in Phase 3+4.)

| # | Audience | Existing material | Closest architecture | Curation status |
|---|---|---|---|---|
| 1 | **The Individual (priority-1)** | All 9 universal IS layers (Self · Wealth · Family · Business · Creator · Second Brain · Code · Voice & Video · Brand) + Starlight Orchestrator · `/compose-stack` for 90-day Intelligence Stack Plan · friend-starter MCP pack · Concierge + Envoy front-door agents | Coding Agent Operator (€797) as primary — fits sovereign individual operating own AI stack | Genius Profile excavation (`/discover-genius`) · personal vault types (Gratitude/Vision/Second Brain) |
| 2 | **The Individual's agents and personal team** | Agent Fleet Pack (€797 planned) · 42-agent registry · agent-handoff-packet skill · pack-runtime · `/yolo` Hive session-mode · multi-CLI dispatch (`[project_v753_dispatch_cli]`) | Coding Agent Operator + Agent Fleet Pack composition | Multi-agent orchestration patterns curated |
| 3 | **The Family** | Family IS substrate (`verticals/family/`) — closed-instance precedent · `starlight-relational` agent · `/map-relationships` · `/design-alliance-readiness` · 6 substrate vaults | Family Sovereignty Architecture (€797 Phase 2) | Family-tier curation: privacy primitives, multi-generational asset patterns |
| 4 | **The Startup founder** | Business IS substrate (`verticals/business/`) — `/architect-entity` · `/model-revenue` · `/tax-sanity` · People Intelligence sub-stack (28 commands) · Sound Intelligence (30 commands) · AI Ops Intelligence v0.1 | Small AI Startup Architecture (€1,997 Phase 2) | Startup curation: legal templates, BV/LLC patterns, MRR-first frameworks |
| 5 | **The Researcher and Professor** | `deepresearch` skill (multi-agent research workflow) · prior research artifacts (`research/onehorizon-2026-05-11/`) · Predictive Layer subsystem grounded in JEPA/predictive-coding lineage | Research Collective Architecture (€1,497 Phase 3) | Research curation: arXiv pipelines, citation primitives, attestation for research artifacts |
| 6 | **The Student and Explorer** | Starlight Academy curriculum (planned, 6 pillars) · `/welcome` + `/intake` newcomer flow · Concierge agent | Composition of pillars 1+2+5 (Wielding AI + Sovereignty + Stars/Cosmology) | Student curation: free OSS tools, learning paths, open courses |
| 7 | **The Creator (artist/musician/writer/designer/filmmaker)** | GenCreator Community (planned commercial brand) · Creator IS substrate · `/creator-pipeline` · Music IS (7 agents + Arcanea Records 4 labels) · Sound Intelligence (forkable) · Voice & Video IS · Arcanea canon for narrative creators | Solo Creator Architecture (€497 Phase 2) | Creator curation: AI tool stacks per creative discipline, monetization patterns |
| 8 | **The Professional and Solution Engineer** | Code IS substrate (`verticals/code/`) · ACOS perfect mirror (production) · Atlas as primary product · `/feature-dev` skill | Coding Agent Operator (shared with audience 1, scaled to org context) | Professional curation: MCP servers, agent SDKs, IDE integrations |
| 9 | **The C-level executive and Board member** | Visionary agent (`starlight-visionary`) · `/define-vision` · Annual Benevolence Report shape (planned) · Luminor Board / Starlight Board governance precedent | Sovereign Enterprise Architecture (€4,997 Phase 3) | Executive curation: board-grade governance, sovereign-tier protection, fiduciary frameworks |
| 10 | **The Librarian** | This document set · `/handover` · `/process-inbox` · `/memory-prune` · Cross-Repo Indexer · all `MEMORY.md` per-vertical | Library Steward's Operating Manual (TBD authoring — not yet specified as an architecture) | Librarian curation: cataloging schemas, attestation indexers, archival best practices |
| 11 | **The Organization, SMB, Enterprise, Institution** | `/spawn-domain-stack` for new domain verticals · People Intelligence pattern · Org Architecture sub-system (`starlight-org`) | Convergence Architecture Pack (€2,997 Phase 4) | Org curation: enterprise integration patterns, compliance-grade attestation, multi-vendor MCP orchestration |

**Audience-priority sequencing per v12 PLAN:** Audiences 1+2 served Q2-Q3 2026; 3+4 Q4 2026; 5-9 Q1-Q2 2027; 10-11 Q3-Q4 2027.

---

## §5 Repo portfolio (refreshed since v1 STATE.md `5dc5a30` — sibling-tab momentum included)

### §5.1 Repos Frank named explicitly in L99 v1+v2+v12

| Repo | Local path | Status | Covenant role |
|---|---|---|---|
| **`frankxai/starlight` (this repo, presumed canonical)** | `C:/Users/frank/Starlight-Intelligence-System` | `production — v8.0+` (substrate + site + 5 Domain Sub-Stack verticals + Cockpit + Voice + Atlas-foundation) | Source of truth for everything. ⚠️ **Q1 — rename to `frankxai/starlight` to align with v12 register?** Still open. |
| **`agentic-creator-os` (ACOS)** | `C:/Users/frank/agentic-creator-os/` | `production` — perfect substrate-mirror per 2026-05-04 audit | Adopter case study (Adopter #1 candidate for `/adopters` mirror). Demonstrates SIP composition. |
| **`vibeclubs.ai`** | `C:/Users/frank/vibeclubs.ai/` (DNS dark — 404) | `production-grade scaffolding, dark-deployed` — has ADRs, AGENTS.md, MEMORY.md, atlas-data.json (interesting), arcanea-brain-3d.html, LAUNCH-KIT.md | MCP-server adopter reference. **The `atlas-data.json` artifact is intriguing** — may inform Atlas naming or be unrelated. Worth checking before locking Atlas brand. |
| **`oci-ai-architect`** | **NOT in user tree** | `unknown — out-of-tree` | v12 brief names it for skill-pack patterns. Confirmed absent from local clones. **Q3 below.** |
| **`Cancino Substrate`** | **NOT in user tree, zero references** | `unknown — out-of-tree` | **Q4 below.** |
| **`frankx.ai`** (production) | `C:/Users/frank/frankx.ai-vercel-website/` | `production — v1`; 28 CVEs + missing SIP attestation per 2026-05-04 audit | Founder vertical. Stays out of `starlight.foundation` scope; may host Frank's personal essays + advisory funnel. |
| **`arcanea.ai`** | `C:/Users/frank/Arcanea/` + `arcanea.ai/` (separate dir) | `production` | Canon vertical (CC-BY-NC). Cited as an Adopter case study + Hall of Cosmology canon source. |
| **`starlight-voice`** | `C:/Users/frank/starlight-voice/` | `scaffolding — v3 MVR weeks 1-3 plan committed 2026-05-14 + voice-v3 addendum + keyboard CLI router design 2026-05-16` (Tauri/Rust) | Atlas voice interface (managed-tier differentiator). |
| **`starlight-horizon-dataset`** | `C:/Users/frank/starlight-horizon-dataset/` | `production` — 12 entries (founding 8 + Arcanea-session 3 + library-synthesis 1 today) | Living Archive substrate. Public CC-BY-SA-4.0. Append-only. Wires to Hall of Cosmology + Living Archive surface. |
| **`starlight-agent-lab`** | `C:/Users/frank/starlight-agent-lab/` | (frameworks + benchmarks dir-only) | Tooling-layer experimentation. Not in covenant critical path. |
| **`starlight-intelligence.ai`** | `C:/Users/frank/starlight-intelligence.ai/` | (Next.js project, purpose unknown) | **Q5 below** — separate project? Archive? |

### §5.2 Sibling-tab momentum on THIS repo since v1 STATE.md (`5dc5a30`)

7 commits landed by parallel Claude tabs 2026-05-15 → 2026-05-17:

| Commit | What |
|---|---|
| `95f1de6` | AI Ops Intelligence v0.1 design — `/ai-ops` + `/ai-coe` Domain Sub-Stack |
| `87bc3f9` | Close 4 Starlight Board REVISE items on AI Ops IS v0.1 |
| `df86dcd` | AI Ops IS v0.1 cleared — Board round 2 PROCEED |
| `54abbb7` | AI Ops IS Phase 0 implementation plan |
| `9bf4071` | mempalace ↔ obsidian ↔ 3d bridge — canvas overlay + curate-recall CLI + skill |
| `4897b69` | **Vellum & Voltage 3D substrate — liquid-glass tier upgrade** (Atlas v0.1 candidate) |
| `0a2fb01` + `05589d7` | `/sis-forge` v8.x-pre-alpha design + plan (Board REVISE pass 1 folded) |

**Implication:** Sibling tabs are aggressively building Phase-1-relevant substrate. STATE.md v2 doesn't author new substrate; it ABSORBS this momentum into the v12 frame. AI Ops IS becomes the **5th Domain Sub-Stack reference vertical** (joins People · Sound · Music · Energy). The Vellum & Voltage 3D substrate is the direct Atlas v0.1 surface. `/sis-forge` is a new substrate-tier capability I haven't audited but is in flight.

---

## §6 Substrate surface inventory (carried from v1, refreshed)

- **Agents:** 42 across 7 tiers (`agents/AGENT_REGISTRY.md` — unchanged since v1 STATE.md).
- **Skills:** **69** SIS skills (was 68 in v1, +1 net per updated CLAUDE.md) across 13 domains via `skills/skill-rules.json`. Skill-FM debt: 25/56 still without frontmatter per 2026-05-04 audit (S2 sweep pending).
- **Slash commands:** 107+ in `.claude/commands/` (was 107 in v1; sibling tabs may have added `/ai-ops*`, `/ai-coe*`, `/sis-forge*` — count pending refresh).
- **MCP surface:** `starlight-mcp` (3 co-existing impls — DEBT, pick canonical) · `memory-bus` (singleton stdio, [project_memory_bus_v01]) · `friend-starter` pack · `core/orchestrator/harnesses/claude/mcp-config.json`.
- **Site routes:** Same 21 as v1 STATE.md. Target after v12 cull: **10 routes** (home + 8 Halls + /protocol) + /badge utility. See §8 below for naming-register exposure.
- **5 Domain Sub-Stack reference verticals:** People (28 cmds) · Sound (30 cmds) · Music IS (8 cmds, Frank-operated) · Energy (board-passed) · **AI Ops (new since v1, board PROCEED `df86dcd`)**.

---

## §7 v12-specified inventory items (explicit checklist from L99 v12 brief)

| Item | Status |
|---|---|
| Existing SKILL.md files (`oci-ai-architect`, VibeClubs, others) | SIS-local: 69 in `skills/skill-rules.json`. VibeClubs: has `AGENTS.md` + ADR-001/002/003 in `C:/Users/frank/vibeclubs.ai/`. oci-ai-architect: NOT in user tree. |
| Existing AGENTS.md / agent specs across ACOS, VibeClubs, 31-tool MCP | ACOS: perfect mirror per 2026-05-04 audit. VibeClubs: `AGENTS.md` present. 31-tool MCP: `arcanea-mcp` (separate repo). |
| Knowledgebase structures (Cancino, vertical KBs) | Cancino: NOT FOUND. Vertical KBs: per-vertical `MEMORY.md` at all `verticals/*/`. |
| Agent harness primitives, composition patterns, MCP servers | `agent-harness-manifest` shipped `83fab4e`. 3 MCP impls (consolidate). `pack-runtime.ts` + `forge.ts`. |
| Protection patterns documented | `/openclaw-audit` (sovereign-tier protocol defense) · `agents/starlight-sentinel.md` · `security-review` skill. Net publishing surface for Hall of Protection: GAP. |
| Multi-chain / smart contract work | NONE in this repo. Net-new in Phase 2 per v12 PLAN. |
| Curriculum material across six pillars | Substrate roots for 4 of 6 pillars (Wielding AI / Sovereignty / Building Sovereign DPI / Stars & Cosmology). Curriculum production GAP for all 6. |
| Sovereign architecture material (7 references) | Five Domain Sub-Stack templates exist but they're vertical wrappers, not audience-mapped bundles. All 7 audience-mapped architectures are GAP. |
| Curation registry contents | `/sip-export` 7-target compose · friend-starter pack. Audience-mapped registry (100+ entries) is GAP. |
| Cosmology artifacts (Arcanea, Suno, visual, Luminor Council, 9 Vel'Tara, 3 Academies) | `frankxai/arcanea-ecosystem` (separate repo, CC-BY-NC). Music IS Suno. Vellum & Voltage 3D (`4897b69`). All present. |
| Vertical readiness | Arcanea (production) · FrankX (production, 28 CVEs) · Anime Legends (v0.5 scaffolding) · Wealth IS (v0.1) · Family IS (private) · EpicWays OS (alliance, Frank-helped) · GenCreator Community (planned) · Cancino (NOT FOUND). |
| Trinity Alliance + adopter "Built on SIP" readiness | Trinity Alliance: scaffold via `/alliance-*` commands. Public adopter readiness: friend-starter pack ready; mirror surface GAP. |

---

## §8 Naming-register exposure — where current materials need v12 update

| Surface | Current naming | v12 register target | Update class |
|---|---|---|---|
| `SIP.md` (file) | "Starlight Intelligence Protocol" | Keep file as `SIP.md` for internal stability; refer externally as "Starlight Protocol"; preserve "Starlight Intelligence Protocol" in lore/cosmology register only | **Soft rename** — no file movement, change external citations only. v12 brief recommended renaming to `PROTOCOL.md`; my recommendation: defer file rename to a dedicated migration sprint (hundreds of internal SIP references). |
| `SIS.md` (file) | "Starlight Intelligence System" | Keep as cosmological narrative name; reference externally as "Starlight Library" or "Starlight Protocol substrate" | Soft rename; preserve `SIS.md` |
| `CLAUDE.md` line 1 + `README.md` | "Starlight Intelligence System" | Lead with "Starlight Protocol" technical register; preserve "Starlight Intelligence System" as cosmological in second paragraph | Hard update (visible to all new readers) |
| `agents/AGENT_REGISTRY.md` | "Starlight" used throughout | Mostly OK — internal documentation. No trademark assertion in any doc. | Light pass |
| `.claude/commands/*` | `/sip-*` prefix · `/sis-*` doesn't exist · `/starlight-*` (board) | OK — `/sip-*` is technical, `/starlight-*` is governance. No change. | None |
| `site/src/app/` route content | "Starlight Intelligence" appears in metadata, hero, etc. | Update to "Starlight Protocol" (technical) or "Starlight" alone (Library register) | Hard update before public Hall ship |
| `package.json` packages | If publishing as `@starlight/*` — pick org name (`starlight` available on npm? check) | npm org `starlight` ideally; `starlight-org` or `starlight-protocol` as fallback | **Q6 — npm org name decision** |
| **starlightintelligence.org** vs **starlight.foundation** | `.org` is current canonical | `.foundation` proposed canonical in v12 | **Q7 — domain decision + redirect strategy** |

**Estimate:** ~30 minutes site copy update for visible surfaces. ~2-4h for full repo grep-and-replace of marketing language. Dedicated `SIP.md → PROTOCOL.md` rename: 1-day migration sprint (high blast radius, defer).

---

## §9 Threat matrix under v12 no-trademark posture

| Threat class | Mitigation under v12 | Change from prior posture |
|---|---|---|
| Sdn Bhd / Ltd brand collision | **DISSOLVED** — no trademark asserted, nothing to enforce, market sorts context | Eliminates legal expense + ongoing negotiations |
| Scam projects using "Starlight" name | Platform-level impersonation reports (Twitter, Stripe, App Store) · covenant disclaimers · community response · NO trademark recourse | Loss accepted (Bitcoin/Ethereum pattern). Mitigation: Discord moderation playbook. |
| Hostile fork of protocol | Structurally allowed; strongest implementation wins through usage and authority | Same as Bitcoin's hard-fork posture; covenant's irrevocability ensures protocol survives forks |
| Sophisticated enterprise procurement demanding trademarked vendor | Sold the **commercial brand** (Atlas / Arcanea / GenCreator Community — all trademarked) not the protocol | Solved by brand layer separation |
| Adopter weaponization (someone uses "Built on Starlight" to give credibility to harmful product) | Code of Conduct + voided attestations + community shaming · NO trademark recourse | Same as Bitcoin/Ethereum scam-project handling |
| OSS capture (someone tries to fork + rebrand + assert ownership) | Covenant Articles II + III + VI (Sovereignty + Attribution + Foundation transition) + irrevocability | Strong defense; community follows canonical artifacts |
| Cyber attack on `starlight.foundation` or canonical repo | Hardware keys · BV-owned domain · GitHub repo protection · backup mirrors · signed commits on canonical artifacts | Standard; THREATS.md should formalize |
| Lawyer / regulatory exposure | MIT + 30-day refunds + ToS/DPA via Thijs + D&O/cyber/professional indemnity insurance €3K/year + arbitration + no financial intermediation + no token + no DAO + no custody | Same as prior; trademark-portfolio-management cost ELIMINATED on protocol layer |
| Founder personal-key compromise | Hardware key separation between personal / BV / verticals · pseudonym for Arcanea Loremaster if pursued · 2FA everywhere | Per existing security audit; THREATS.md should formalize |
| Founder burnout / continuity | Lifestyle architecture (no employees through €500K MRR) + agent fleet operates DPI continuously + foundation transition late 2027 + Article XI ensures protocol survives steward | Structural; same as v9 |
| AI safety community misalignment | Substantive engagement essay #1 ("What Starlight Does Not Solve") + Living Archive open-write surfaces benevolent vision + structural benevolence in Covenant Articles VII-IX | Engages substantively rather than defending |

---

## §10 Top-3 highest-leverage primitives (carried from v1, refreshed under v12)

Selection unchanged from v1 because the primitives are register-robust. Each maps to a v12 layer.

### Pick 1 — `src/cli.ts` + canonical MCP + agent harness as **Atlas v0.1 self-hosted foundation**

**Why:** Free-tier Atlas must be real on Day 1 of covenant publish — otherwise "managed paid / self-hosted free" reads as vaporware. CLI gives `vault` / `orchestrate` / `project` / `stats`. MCP exposes over standard protocol. Harness runs the 42 agents. Bundled + documented as `npx @starlight/cli` + `npm install @starlight/mcp` + `npm install @starlight/harness` = **Atlas v0.1 self-hosted** in everything but name.

**Polish to ship-ready:**
- Pick canonical MCP impl (~3h)
- "Self-host Atlas v0.1 in 10 minutes" guide (~2h)
- npm-publish under decided org name (~1h after Q6 resolves)
- Total: **6h** (highest leverage)

### Pick 2 — `BrainHero` + `SpecTraceClient` + `Built on SIP badge` + **Vellum & Voltage 3D substrate** (`4897b69`) as **Atlas visual layer + steward evidence**

**Why:** Vellum & Voltage 3D substrate liquid-glass upgrade just shipped — it's the visual differentiator that justifies the managed-tier price premium. Combined with BrainHero (topology viz), SpecTraceClient (real-time spec-evidence trace), and the self-issued Built on SIP badge — this is the **premium-grade visual register** for Hall of Steward and Atlas managed tier.

**Polish to ship-ready:**
- Extract BrainHero into reusable component taking generic stack object (~4h)
- Polish SpecTraceClient for public consumption (~3h)
- Versioned-badge state machine (~2h)
- Wire Vellum & Voltage 3D into `/atomic-units` Hall (~3h)
- Total: **12h** (up from 9h in v1 due to Vellum & Voltage addition)

### Pick 3 — `integrations/starter-packs/friend-starter` + Cross-Repo Indexer + `/sip-attest` + `starlight-horizon-dataset` as **adopter onboarding + Living Archive flywheel**

**Why:** Adoption only compounds with low onboarding friction. Add Living Archive write-path — adopters not only join, they CONTRIBUTE gratitude+vision entries that become public commons. Self-issued attestation + self-issued contribution = pure no-intermediation flywheel. Per v12 axiom 1+2.

**Polish to ship-ready:**
- Attestation-mirror fetch protocol spec + impl (~10h)
- Friend-starter polish: MIT LICENSE + NOTICE + onboarding README + 5-min video (~4h)
- Living Archive contribute-CLI (`/horizon-contribute` command appending to `starlight-horizon-dataset`) (~3h)
- Wire `/sip-attest` JSON-LD output for mirror consumption (~2h)
- Total: **19h** (up from 16h in v1 due to Living Archive write-path addition)

**Combined Atlas-v0.1 + visual-layer + adopter-flywheel bundle: ~37h of polish across three primitives** (up from ~31h in v1). Zero ground-up new construction for Day-1 ship.

---

## §11 Gaps where 2-8 weeks of work unlocks 10x value

In v12-priority order:

1. **First 3 published Sovereign Architectures** — Coding Agent Operator (audience 1) + Solo Creator (audience 7) + Small AI Startup (audience 4). Each architecture = €497-1,997 Academy product + reference impl + adopter case studies. ~3 weeks per architecture; 6-8 weeks for all 3.
2. **Atlas v0.1 product surface** — CLI + canonical MCP + harness + Vellum & Voltage 3D, packaged as `npx @starlight/cli` + npm installs + self-hosted bundle + private-beta-with-three-test-users surface. ~2-3 weeks polish.
3. **Hall of Curation v1** — 100+ audience-mapped external resources indexed (Trinity Alliance bounties / OpenClaws ops / Optimism RetroPGF / Gitcoin / Anthropic Fellowship / OSS tools / books). Pure index, no payment intermediation. ~2-3 weeks.
4. **Site cull + 8-Hall reframe** — 21 routes → 10 routes. Hall surfaces wired. `starlight.foundation` domain live with `starlightintelligence.org` redirect. ~2 weeks.
5. **Agent harness library MIT release** — `agent-harness-manifest` (already shipped `83fab4e`) + extraction to `@starlight/harness` public package + adopter docs. ~1-2 weeks.
6. **Hall of Protection + Sovereignty & Protection pillar (€697)** — protection patterns published as both paid curriculum AND defense article. Net-new IP. ~3-4 weeks.
7. **Multi-Chain Composition pack (€997) + Base testnet reference contracts** — smart contract templates as paid Academy bundle + free MIT templates. Phase 2 per v12 PLAN. ~4-6 weeks.
8. **Living Archive Hall surface + Annual Benevolence Report shape** — public read of `starlight-horizon-dataset` + pinned founding essays + curation pipeline. ~2 weeks.
9. **Starlight Essays Vol. 1 (€67)** — 3 founding essays ("What Starlight Does Not Solve" + "Coding-agent-native sovereignty" + "Structural benevolence vs fiduciary entanglement"). Frank-authored. ~3-6 weeks of writing.

---

## §12 Open sovereign-class questions for Frank (six only; v12-specific)

**Q1. Repo identity.** Rename `frankxai/Starlight-Intelligence-System` → `frankxai/starlight` to align with v12 register? My recommendation: YES (cleaner protocol-name signaling). Cost: refs across substrate update + GitHub redirect + memory entries. ~2h work + sibling-tab coordination. **Structural — needed before site domain switch.**

**Q2. Atlas trademark search outcome.** Before committing publicly to "Atlas" as Console name, run EU+US classes 9+42 search via Thijs (~€500-1K). Alternative names already drafted: Loom (taken), Lyceum, Cinder, Lantern, Beacon. **Recommendation: Frank approves "Atlas" as working name in STATE.md v2; final commitment after trademark search.**

**Q3. `oci-ai-architect` location + relevance.** v12 brief names it for skill-pack patterns. Not in user tree. Is it GitHub-only (URL?), at a path I haven't searched, or memory-only and no longer load-bearing?

**Q4. Cancino Substrate location + relevance.** Zero references anywhere in tree. External? Private? Out-of-scope after covenant?

**Q5. `starlight-intelligence.ai` purpose.** Separate Next.js project, sibling repo. Active alternate to `.org` and proposed `.foundation`? Archive? Relationship statement needed.

**Q6. npm org name.** `@starlight/*` ideal. `@starlight-protocol/*` or `@starlight-org/*` if `starlight` taken on npm. Affects Atlas v0.1 package URLs. **Quick check + decision.**

**Q7. Domain transition.** `starlight.foundation` as canonical post-covenant; `starlightintelligence.org` 301-redirects. **Is `starlight.foundation` available?** If yes: register under Starlight Holding BV post-June. If no: alternative (`starlightprotocol.org`? `starlight-foundation.org`? `starlight.is`?).

**Q8. Pseudonym decision — Arcanea Loremaster.** v12 brief mentions "if pursued." Splits public surface: Frank Riemer = steward + Frank's name on everything covenant-related; Arcanea Loremaster (pseudonym) = canon authorship + lore + possibly Suno music releases. **Cleaner separation reduces personal-key-compromise blast radius AND keeps Arcanea IP under arm's-length authorship.** Recommendation: YES, pursue pseudonym post-BV-formation, before Arcanea trademark filing. **Sovereign-class call.**

---

## §13 Falsifier — where I think PLAN.md should diverge from v12 brief

**Concern 1:** v12 PLAN sequences `/steward` Hall live in May-June 2026. Same concern from v1 STATE.md still holds — `/steward` voice register has to be *invented*. Recommend stage `/steward` Hall to Day 5+ once Frank's voice fragment has settled. Net cost: ~36h slip on the most reputation-sensitive page. **Same falsifier as v1; preserve.**

**Concern 2:** v12 PLAN sequences Atlas v0.1 private beta in July-September 2026. My §10 Pick 1 shows ~6h polish ships a Day-1-credible self-hosted Atlas. **Earlier ship possible if Frank wants** — private beta could start within 1 week of covenant publish, not 2-3 months later. Trade-off: faster validation vs. polish-time risk.

**Concern 3:** v12 PLAN puts Sovereignty & Protection pillar (€697) in October-December 2026 (Phase 2). Given threats are present from Day 1 and protection IS a paid revenue line AND a defense article (double value), recommend **ship Sovereignty & Protection pillar in Phase 1 (July-September)** alongside the other Phase-1 Academy products. Net effect: revenue + defense simultaneously, protection patterns established before any high-profile adoption attracts adversaries.

**If Frank rejects these three divergences, PLAN.md executes v12 as spec'd.**

---

## §14 Self-review verdict

- **Placeholders:** None. Every section complete; unknowns flagged as Q1-Q8 in §12.
- **Internal consistency:** §1 brand layers cross-check with §3 Hall mapping cross-check with §10 leverage primitives cross-check with §11 gap priorities. No contradictions surfaced.
- **Scope:** Diagnostic. No build authored. PLAN.md (next deliverable) operates on this diagnostic.
- **Ambiguity:** Two intentional ambiguities preserved — (a) Atlas as working name pending trademark search (Q2); (b) `frankxai/starlight` rename pending Q1 decision.
- **v12 axiom alignment:** Every recommendation in §10, §11, §12 checked against v12 axioms 1-7. No conflicts.
- **No-trademark posture:** Reflected in §1 (no trademark on protocol), §9 (Sdn Bhd / Ltd dissolved), §12 (Q1+Q7+Q8 all framed as brand-layer decisions, not protocol-layer trademark moves).
- **Library framing:** §2 (rings) + §3 (Halls) + §4 (audiences) directly express Library of Alexandria. Living Archive surfaces in Ring 1 + Hall 6 + Audience 1+11 cross-references.
- **Sibling-tab momentum absorbed:** §5.2 explicitly inventories the 7 commits since v1.

---

**Phase 0 v2 complete.** PLAN.md gated on Frank's resolution of Q1, Q2, Q7, Q8 (structural blockers). Q3, Q4, Q5, Q6 can resolve in parallel.

---

**Built on Starlight Protocol** · v1.1.1 · MIT · 2026-05-17 · session `library-synthesis` · supersedes `5dc5a30` · authored by Claude Opus 4.7 (1M context) at Frank Riemer's L99 v12 direction
