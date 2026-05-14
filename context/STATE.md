---
title: Starlight Intelligence — State of Ground Truth (covenant-era Phase 0)
date: 2026-05-14
author: Frank Riemer / Starlight Holding (peer architect: Claude Opus 4.7)
phase: Phase 0 — self-inventory before PLAN.md
purpose: Diagnostic snapshot of what already exists that serves the covenant-era architecture. Not a build plan. PLAN.md is the next artifact and is gated on Frank's review of this document.
covenant_dependency: COVENANT.md not present in this repo or sibling starlight-* repos as of this writing. L99 axioms used as proxy; full covenant required to finalize PLAN.md.
attestation: Built on SIP v1.1.1
---

# STATE.md — Starlight Intelligence covenant-era ground truth

> *A steward's record begins with a steward's inventory. This is the inventory.*

## §0 Purpose + framing

This document is **diagnostic, not directive.** It surfaces what already exists across Frank's ecosystem that can serve the post-covenant architecture, identifies what is scaffolding vs. production-ready, names the three highest-leverage primitives that would ship Console v0.1 fastest, and flags every sovereign-class fork that requires Frank's input before PLAN.md is written.

Five operating constraints from the L99 brief are treated as **load-bearing axioms**:

1. **SIP is MIT, free, irrevocable, no licensing tier ever.** No "Starlight Substrate License" SKU is allowed to exist; whitelabel-via-license is permanently closed. Compounding mechanism is attestation, not gating.
2. **Attestations are self-issued by adopters.** Starlight does not run a verification authority. Any "adopters" route is a *mirror*, not a registry of approved entities.
3. **Console is the DPI engine — managed tier paid, self-hosted free.** The paid surface lives in Console, not in the substrate. Open-core shape, Vercel/GitLab register, not WordPress/Drupal.
4. **Foundation transition deferred to late 2027.** Until then Starlight Holding is the steward; the foundation handover is a *future* milestone, not the current narrative.
5. **starlightintelligence.org is a steward's record.** Audience: Anthropic ecosystem, Trinity AI investors, protocol-literate adopters, future foundation board members. Voice: civic-infrastructure-grade. Reference set: Linux Foundation annual report, IETF RFC index, EFF.org, a16z portfolio — **not** Vercel.com / Linear.app / Framer.

Every section below is checked against these five axioms.

---

## §1 Repo portfolio inventory

### §1.1 Repos Frank named explicitly in L99

| Repo | Local path | Status | Covenant role |
|---|---|---|---|
| **frankxai/starlight** *(this repo, presumed)* | `C:/Users/frank/Starlight-Intelligence-System` | `production — v8.0` (substrate + site) | Source of truth for SIP, SIS, STACK, VERTICALS, all 107 substrate commands, the site, the agent registry, Console-candidate primitives. ⚠️ **Naming ambiguity flagged in §7-Q1.** |
| **agentic-creator-os (ACOS)** | `C:/Users/frank/agentic-creator-os/` | `production` — perfect mirror of SIS skill set per 2026-05-04 audit | Adopter case study. Demonstrates SIP composition at scale. Candidate for `/adopters` index. |
| **VibeClubs MCP** | `C:/Users/frank/vibeclubs.ai/` (DNS dark — 404 since pre-2026-05-04 audit) | `scaffolding / dark-deployed` | MCP-server adopter reference. Pattern: open-ended creator MCP. Cockpit layout exists (`cockpit-zellij/layouts/vibeclubs-ai.kdl`) — *some* assembly has happened locally. Needs dark-deploy investigation before reuse. |
| **oci-ai-architect** | **NOT in this user tree** | `unknown — out-of-tree` | Frank named it for skill-pack patterns. Either external (GitHub-only), at a path I haven't searched, or referenced from memory only. **Flagged §7-Q4.** |
| **Cancino Substrate** | **NOT in this user tree, no in-repo references** | `unknown — out-of-tree` | Zero references in SIS or sibling repos. Likely external/private. **Flagged §7-Q5.** |
| **frankx.ai** (production) | `C:/Users/frank/frankx.ai-vercel-website/` | `production — v1` (live at frankx.ai); 28 known CVEs, missing SIP attestation per 2026-05-04 audit | Founder vertical surface, not steward's record. Stays out of starlightintelligence.org scope. |
| **arcanea.ai** | `C:/Users/frank/Arcanea/` + `arcanea.ai/` (separate dir) | `production` (live); missing OG tags + SIP cross-link unresolved per 2026-05-04 audit | Canon vertical (CC-BY-NC). Stays out of steward's-record scope; may appear as a *cited adopter*. |
| **starlight-voice** | `C:/Users/frank/starlight-voice/` | `scaffolding — v3 MVR weeks 1-3 plan committed 2026-05-14 (ff0d54d)` (Tauri/Rust) | Voice cockpit primitive. Out-of-scope for starlightintelligence.org but a Console-candidate engine. |

### §1.2 The ~10-dir FrankX cluster

`FrankX/` · `frankx.ai-vercel-website/` · `frankx-fix-ci/` · `frankx-prod-ai-coe-live/` · `frankx-prod-deploy/` · `frankx-prod-libos3/` · `frankx-prod-sync/` · `frankx-ship-gai/` · `studio-frankx/` · `vibeclubs.ai/`

Per the 2026-05-04 audit, the production one is `frankx.ai-vercel-website`. The other eight `frankx-prod-*` / `studio-frankx` dirs are likely scratch or experimentation — **archive candidates**, but not load-bearing for the covenant build. Flagged §7-Q6 for batch review.

### §1.3 Full sibling enumeration in `C:/Users/frank/`

5 `starlight-*` sibling repos confirmed: `starlight-agent-lab` (frameworks + benchmarks), `starlight-horizon-dataset`, `starlight-intelligence.ai` (a separate Next.js project — **purpose unknown, possibly old positioning attempt**, flagged §7-Q7), `Starlight-Intelligence-System` (this repo), `starlight-voice`. Plus 60+ other repos across the `arcanea-*`, `frankx-*`, `claude-code`, `agentic-*`, `library-os`, `cline`, `kiloclaw` clusters. **None contains COVENANT.md.**

**Per the 2026-05-04 audit:** 68 repos · 24 active · 36 stale · 39 dead (not archived) · 26 open PRs · 7 with failing CI.

---

## §2 Substrate surface inventory (grouped by L99 layer taxonomy)

### §2.1 Agents — 42 total

| Layer | Agents | Notes |
|---|---|---|
| **Substrate-layer** (any-adopter) | 7 council (Orchestrator, Prime, Architect, Navigator, Sentinel, Weaver, Sage) + 7 Council Archetypes (Elder Father/Mother, Sage-seat, Builder-Elder, Shadow Witness, Divine Neutral Witness, Future Self at 90) + 2 Front-Door (Concierge, Envoy) + 1 Excavation (Genius) + 1 Voice Operator | The full set is substrate-tier — works for any adopter on SIP. Council Archetypes shipped 2026-05-11 as v0.1 Friday demo. |
| **Vertical-layer** (Frank-specific or named vertical) | 5 IS-tier (Business, Visionary, Embodiment, Second Brain, Relational) + 6 People Intelligence + 6 Sound Intelligence + 7 Music IS (Curator, Archivist, Persona Keeper, Producer, Distributor, Amplifier, Royalty Architect) | People + Sound are reference verticals (forkable). Music IS is Frank-operated. IS-tier are universal-IS owners. |
| **Tooling-layer** (developer accelerators, not user-facing) | — | No dedicated tooling agents; tooling lives in skills + commands. The `prompt-*` and `vercel-*` etc. agents listed in this Claude Code instance are **plugin agents**, not SIS substrate. Excluded from this count. |

**Full registry:** `agents/AGENT_REGISTRY.md`.

### §2.2 Skills — 60+ active rules in `skills/skill-rules.json`

| Layer | Domains | Skill count (approx) |
|---|---|---|
| **Substrate-layer** | intelligence (5), orchestration (8), memory (6), integration (8), vision (3), machine (2) | 32 |
| **Vertical-layer** | people-intelligence (6), sound-intelligence (6), music-is (9), energy-intelligence (7), health (2), relational (2), business (2) | 34 |
| **Tooling-layer** | None inside this repo — Claude Code plugin skills (frontend-design, claude-api, vercel-*, etc.) are externally loaded | 0 in-repo |

**Activation:** auto-fires by keyword / agent / intent triggers per `skills/skill-rules.json`.
**Skill ecosystem health:** 31/56 SIS skills have frontmatter per 2026-05-04 audit. 25 SKILL.md files still missing FM — known debt, S2 sweep recommended.

### §2.3 Slash commands — **107 substrate commands in `.claude/commands/`**

Per SIP § 4 four-tier taxonomy:

| Tier | Prefix | Count | Examples |
|---|---|---|---|
| **Protocol** | `/sip-*` | 6 | sip-attest, sip-attest-{audio,image,video}, sip-compose-modality, sip-export |
| **Alliance** | `/alliance-*` | 3 | alliance-forge, alliance-reflect, alliance-decide |
| **Vertical** | `/<vertical>-*` | ~80 | hire-*, perf-*, training-*, culture-*, talent-*, org-* (28 People IS); sound-{composition,production,catalog,performance,audience,sync}-* (30 Sound IS); music-{release,canvas,persona,song,suno-prompt,sync-pitch,amplify,label-board} (8 Music IS); arcanea-canon, define-vision, build-brand-kit, capture-daily, design-regimen, energy-audit, discover-genius, reclaim-knowledge, train-executor, creator-pipeline, compose-stack, spawn-domain-stack, tax-sanity, architect-entity, model-revenue, etc. |
| **Sovereign** | `/<name>-*`, plus session-mode top-tier | ~18 | starlight-board, luminor-board, openclaw-audit, sovereign-signal, sovereign-spawn, handover, process-inbox, intake, content-systemize, map-relationships, orchestrate-brain, design-alliance-readiness, distill-insights, align-voice, /yolo (session-mode, via `orchestration/yolo-conductor`) |

### §2.4 MCP surface

| Server | Location | State | Covenant role |
|---|---|---|---|
| `starlight-mcp` | `src/starlight-mcp.ts` + `src/mcp-server.ts` + `src/mcp-server-v01.ts` | **production** — three implementations co-existing (v0, v01, named-canonical) | Console v0.1 substrate engine. Exposes vault, modules, workpackets, events. |
| `memory-bus` | `src/memory.ts` + `src/memory-health.ts` (singleton stdio MCP per `[project_memory_bus_v01]` memory) | **production** — v0.1 shipped 2026-05-03, 24 tests | Solves AgentDB-per-tab constraint. Console primitive for memory. |
| `friend-starter` MCP pack | `integrations/starter-packs/friend-starter/mcp.json` | **scaffolding** — v0.5 starter for non-technical adopters | Adopter onboarding primitive — composes into Console "install in your Claude project" flow. |
| `core/orchestrator/harnesses/claude/mcp-config.json` | `core/orchestrator/harnesses/` | **scaffolding** — orchestrator harness config | Console-tier orchestrator integration. |

### §2.5 Site surface — Next.js 16 / React 19 / Tailwind v4 at `site/src/`

**21 current routes:** `/` · `/architecture` · `/badge` · `/badge/[version]` · `/benediction` · `/cockpit` · `/cockpit/spec-trace` · `/docs` · `/explainer` · `/featured` · `/protocol` · `/protocol.md` · `/quickstart` · `/sip.md` · `/sitemap` · `/robots` · `/vaults` · `/vaults/[slug]` · `/vaults/[slug]/[category]` · `/verticals` · `/verticals/[slug]` · `/yolo` · `/api/vaults/*`.

**6 components:** `BrainHero` · `CategoryNav` · `EntryCard` · `Footer` · `Header` · `VaultCard`.
**4 lib modules:** `accents.ts` · `sip.ts` · `vault.ts` · `verticals.ts`.
**SEO/AEO surface:** sitemap.ts, robots.ts, llms.txt, JSON-LD Organization+WebSite+SoftwareSourceCode, CSP+security headers, raw-markdown citation endpoints (`/sip.md`, `/protocol.md`).

**Gap to covenant route set (`/`, `/covenant`, `/protocol`, `/adopters`, `/console`, `/steward`):**

| Covenant route | Current state | Gap |
|---|---|---|
| `/` | exists as substrate marketing (BrainHero hero) | **Reframe** — voice shifts from "premium creator-tech" to "steward's record." Hero copy + visual register both need rework. |
| `/covenant` | **does not exist** | New route. Depends on COVENANT.md (gated on Frank). |
| `/protocol` | exists at `site/src/app/protocol/page.tsx` + mirrors SIP.md | **Keep + tighten** — voice/positioning shift; content largely correct. |
| `/adopters` | **does not exist** | New route. Mirror of self-issued attestations from adopter repos. Mechanism flagged §7-Q2. |
| `/console` | partial — `/cockpit` + `/cockpit/spec-trace` are Frank's private cockpit, not the public Console waitlist | **Reframe + new route** — `/cockpit` is operator's internal surface; `/console` is the public managed-tier waitlist. Distinct concerns. |
| `/steward` | **does not exist** | New route. Annual report / decision log / governance posture. Hardest to write because it sets the steward's voice. |
| Existing extras to cull/relocate | `/benediction`, `/featured`, `/yolo`, `/vaults/*`, `/verticals/*`, `/architecture`, `/explainer`, `/quickstart`, `/docs` | All are substrate-marketing-era. Per covenant axiom 5, several should move out of starlightintelligence.org entirely (to frankx.ai or arcanea.ai), be archived, or be reframed as steward-tier evidence. **Decision matrix needed — flagged §7-Q3.** |

---

## §3 Console v0.1 primitive scan

For each primitive: location, current state, covenant role, ship-readiness signal.

| Primitive | Location | State | Covenant role | Ship-readiness signal |
|---|---|---|---|---|
| **Vault primitives** (CRUD, search, namespacing) | `src/memory.ts`, `src/vault-memory.ts`, `src/vault-loop.ts` | **production** | Console's memory layer. The "what holds now" per STACK.md L2. | Used daily by Frank; battle-tested through 542+ substrate tests. |
| **MCP server** | `src/starlight-mcp.ts` (+v0/v01 variants) | **production**, three co-existing impls | Console's standard tool surface. Composes with Claude Code, ChatGPT projects, Gemini Gems, Cursor. | Three impls is **debt** — pick canonical before Console v0.1, archive others. |
| **Agent harness** | `src/agents.ts`, `src/orchestrator.ts`, `src/pack-runtime.ts`, `src/forge.ts` | **production** | Console's agent layer. Composes the 42 substrate agents into runtime sessions. | Already drives 7-agent `/yolo` hive sessions. Production. |
| **Module registry + workpacket lifecycle** | `src/modules.ts`, `src/types.ts`, `src/score.ts`, `src/ledgers.ts` (v01 shipped 6f9703c, refined 3fa7458) | **production — Track A v0.1** | Console's "what's installed / what's in flight" view. | v01 evals green; review findings closed 2026-05-13. |
| **Active healing / dreaming / temporal subsystems** | `src/active-healing.ts`, `src/dreaming.ts`, `src/temporal.ts`, `src/temporal.test.ts` | **scaffolding — v0.1** | Console's "system maintains itself" pillar. Differentiator vs. generic agent frameworks. | Tests exist but light; needs polish before public Console. |
| **Predictive Layer / brain event bus** | `prediction.error` event schema + brain SSE (per `[project_v753_brain_publisher_packet_inspector]`) | **scaffolding — v0.1 substrate buildout** | Console's "system anticipates" pillar. Differentiator. | 512+40 tests green; events fire on real dispatches. Visualization exists at `/brain` (separate dashboard). |
| **CLI** | `src/cli.ts` (zero-dep, Node parseArgs, 12 subcommands) | **production** | Console's terminal entry: `starlight init`, `starlight vault {list,get,set,search}`, `starlight orchestrate`, `starlight project {register,list,sync-all}`. | Already Frank's daily tool. Could ship as `npx @starlight/cli` immediately. |
| **BrainHero** (10-IS topology) | `site/src/components/BrainHero.tsx` | **production** | Console's "see your stack" hero visual. Covenant-era reframe: same primitive, different copy. | Shipped e60fff8. Strong design. |
| **SpecTraceClient + daemon** | `site/src/app/cockpit/spec-trace/*` + `tools/spec-trace-daemon/` | **production — v0.1 Phase 2** | Console's observability pillar. Real-time spec-evidence trace. | Daemon + cockpit page + observability + board closure shipped 8dc5fc5. |
| **Built on SIP badge generator** | `site/src/app/badge/page.tsx` + `[version]/route.ts` | **production** | Adopter primitive — self-issue an SVG attestation. Direct support for `/adopters` route. | Shipped 73376d4. Versioned per SIP. |
| **`/sip-attest` command + audio/image/video variants** | `.claude/commands/sip-attest*.md` (5 commands) | **production** | Adopter attestation tooling. Self-issuance per covenant axiom 2. | Adopted across all v8 substrate ships. Ambient since v7.4. |
| **Cross-Repo Indexer** | per `[project_cross_repo_indexer_v01]`, indexes 22 `~/.claude/projects` dirs in 2.69s | **production — v0.1** | Console's "what does this adopter have" inventory primitive. | 25 tests green. |
| **Cockpit-Zellij layouts** | `cockpit-zellij/layouts/*.kdl` + `cockpit-zellij/profiles/*.json` | **production** | Self-hosted Console UI (per `[project_cockpit_continuity_v01]`). 9.2x perf win, 112/112 green, extract-ready. | Frank's daily driver. Console self-hosted candidate. |
| **Voice Operator (v77 A1+B+C)** | `agents/starlight-voice-operator.md` + `starlight-voice/` Tauri shell | **production (cockpit) + scaffolding (Tauri v3 MVR weeks 1-3 plan committed 2026-05-14)** | Console's voice interface — managed tier differentiator. | Cockpit version: 542/542 green. Tauri version: spec + plan only. |
| **Adopter starter pack** | `integrations/starter-packs/friend-starter/mcp.json` + scaffolding | **scaffolding — v0.5** | Adopter onboarding primitive. Non-technical front-door (per [`integration-creator-path`] skill). | Used by Concierge → Envoy handoff today. |
| **Soul editor** | **MISSING** | not built | Covenant primitive — SOUL.md per SIP § 1 file contract. Console needs editor for it. | Substrate spec exists; tool to author + version SOUL.md does not. |
| **Substrate visualization** | partially via BrainHero + `memory/atlases/system-architecture-v8.canvas` | **scaffolding** | Console's "your substrate, rendered" view. | Canvas exists for Frank's instance; generic adopter version missing. |
| **Attestation mirror** | **MISSING** | not built | The `/adopters` page engine — pulls self-issued attestations from adopter repos, renders the index, no central authority. | Per covenant axiom 2 this is purely a *fetcher + renderer*, not a verifier. Spec needed. |
| **Steward's-record content engine** | **MISSING** | not built | The `/steward` annual-report shape. MDX + signed-commit log? Decision log? Voice unsettled. | Hardest authorial problem in the build. |
| **Console waitlist + paid-tier signup** | **MISSING** | not built | `/console` route's commerce surface. | Standard Vercel/Resend/Stripe-link primitive once Console v0.1 scope is signed. |

---

## §4 Top-3 highest-leverage primitives (for fastest premium-grade Console v0.1)

Selection criterion: **maximum covenant-era leverage per hour of polish, without sacrificing the diligence-grade quality bar.** Each is already production or near-production, and unlocks one of the three covenant route categories (steward / adopter / Console).

### Pick 1 — `src/cli.ts` + MCP server + agent harness as the *self-hosted Console foundation*

**Why:** The free-tier Console (per covenant axiom 3) needs to be *real and shippable* the day the covenant publishes — otherwise the "managed paid / self-hosted free" promise reads as vaporware. The CLI already gives Frank `vault`, `orchestrate`, `project`, `stats`. The MCP server already exposes those over standard protocol. The agent harness already runs the 42 agents. Bundled and documented as a single `npx @starlight/cli` + `npm install @starlight/mcp` story, this is **the self-hosted Console v0.1 in everything but name.**

**What polishing requires:**
- Pick canonical MCP impl from the three co-existing (`starlight-mcp.ts` vs `mcp-server.ts` vs `mcp-server-v01.ts`), archive the others. ~3h.
- Document the three together as a "Self-host Console v0.1 in 10 minutes" guide. ~2h.
- npm-publish under `@starlight/*` namespace (DNS-style, future-foundation-clean). Requires Frank's decision on org name. ~1h.

**Total to ship-ready: 6h. Highest leverage primitive in the inventory.**

### Pick 2 — `BrainHero` + `SpecTraceClient` + `Built on SIP badge` as the *visual evidence layer*

**Why:** A steward's record without visual evidence is a wiki. A managed Console without visual differentiation is a CRUD app. These three primitives together — topology viz + real-time spec-trace + self-issued attestation badge — are the *premium-grade visual register* that justifies the price differential between managed and self-hosted tiers, *and* gives the steward's record its civic-infrastructure register. BrainHero shipped e60fff8 with strong design taste. SpecTraceClient is production. Badge is production.

**What polishing requires:**
- Extract BrainHero into a reusable component that takes a generic stack object (not hardcoded 10-IS) — enables adopter rendering on `/adopters/<slug>`. ~4h.
- Polish SpecTraceClient for public consumption (Frank-private cockpit → diligence-readable view). ~3h.
- Versioned-badge state machine: badge SVG should encode adopter's claimed `sip_version`, `verticals`, `canon` per SIP § 2. Already partially done at `/badge/[version]`. ~2h.

**Total to ship-ready: 9h.**

### Pick 3 — `integrations/starter-packs/friend-starter` + Cross-Repo Indexer + `/sip-attest` as the *adopter onboarding flywheel*

**Why:** The `/adopters` route's whole point is to demonstrate compounding adoption — and adoption only compounds if onboarding has the lowest possible friction. The starter pack + indexer + attest-command triad is already in place. Composed correctly, it becomes: *"Drop this MCP config into your Claude project → run `/sip-attest` → your repo now self-issues attestations → starlightintelligence.org/adopters fetches them on the next build."* No verification authority. Pure self-issued. Per covenant axiom 2.

**What polishing requires:**
- Define the attestation-mirror fetch protocol (where adopters declare their attestation URL, how often the site rebuilds, what schema). ~4h spec + 6h impl.
- Polish the friend-starter pack: MIT LICENSE + NOTICE + onboarding README + 5-minute video. ~4h.
- Wire `/sip-attest` to output a canonical JSON-LD next to the human-readable block, so the mirror has structured data to fetch. ~2h.

**Total to ship-ready: 16h. Highest covenant-symbolic leverage — this primitive *is* the substrate's compounding mechanism.**

**Combined Console-v0.1-shippable bundle: ~31h of polish across three primitives, with zero ground-up new construction required for the Day-1 ship.**

---

## §5 Site as-built vs covenant 6-route map — recommended disposition

| Current route | Recommended disposition | Reason |
|---|---|---|
| `/` | **Keep + reframe.** New copy, BrainHero stays as hero. | Anchor of the steward's record. |
| `/protocol` + `/protocol.md` + `/sip.md` | **Keep.** Tighten copy. Add a small "Built on SIP" badge link to `/badge`. | Covenant axiom 1 — SIP is the protocol; this is its canonical page. |
| `/architecture` | **Fold into `/protocol`.** Architecture explanation is a section, not a route. | Reduces surface. Diligence readers expect protocol pages, not arch pages. |
| `/explainer` | **Move to frankx.ai/explainer.** | Storytelling voice, not steward's voice. Belongs in founder vertical. |
| `/quickstart` | **Fold into `/console` (self-hosted section).** | Quickstart = "how to self-host," not steward content. |
| `/docs` | **Audit each entry; relocate technical docs to the npm-published packages' READMEs, retire the rest.** | Steward's record doesn't host doc-site content. |
| `/verticals` + `/verticals/[slug]` | **Move to `/adopters` as case-study seed.** Frank's verticals (Arcanea, FrankX, etc.) become the first cited adopters of his own protocol. | Eats own dogfood. Reframes verticals as evidence, not marketing. |
| `/vaults` + `/vaults/[slug]` + `/vaults/[slug]/[category]` + `/api/vaults/*` | **Retire from public site.** Move to a `private/` build target served at `vault.starlight.internal` or via Console only. | Vault contents are Frank-state, not steward's-record-state. Covenant axiom 5. |
| `/cockpit` + `/cockpit/spec-trace` | **Retire from public site OR move to `/console/preview`.** | Frank's private operator surface. If we want a public taste, it goes inside `/console`. |
| `/yolo` | **Retire from public site.** | Session-mode tool; not steward content. |
| `/featured` | **Retire from public site or relocate to frankx.ai.** | Curation surface; not steward voice. |
| `/benediction` | **Retire from public site.** | Belongs at frankx.ai. Premium personal voice, not civic register. |
| `/badge` + `/badge/[version]` | **Keep.** Attestation primitive — directly supports adopter self-issuance. | Covenant axiom 2. |
| `/covenant` | **NEW — author from COVENANT.md once it lands.** | Required by L99. |
| `/adopters` | **NEW — attestation mirror engine + first-adopter seed.** | Required by L99. Most architecturally novel route. |
| `/console` | **NEW — managed-tier waitlist + self-hosted quickstart.** | Required by L99. |
| `/steward` | **NEW — annual report shape + decision log + governance posture.** | Required by L99. Voice unsettled — needs Frank input. |

**Net change: 21 routes → 6 routes.** A ~70% reduction in surface area. This is the move that makes the site read as steward's record, not creator portfolio.

---

## §6 Operational fragilities to surface before PLAN.md

These don't block STATE.md but will affect PLAN.md sequencing:

1. **GHA auto-deploy broken since 2026-04-10.** Per `[project_vercel_manual]` memory. Ship via `vercel --prod` from `site/` is the working path. PLAN.md ops section must either fix or document this.
2. **GitHub Pages-style external mirroring of adopter attestations** has no precedent in this codebase. Building the mirror is **net-new work**, not assembly.
3. **Three co-existing MCP-server implementations** in `src/` (`starlight-mcp.ts`, `mcp-server.ts`, `mcp-server-v01.ts`). Decision needed before npm publish; archive non-canonical.
4. **Skill frontmatter debt** — 25 SIS skills lack frontmatter per 2026-05-04 audit. Doesn't block site but degrades the "diligence-grade" register for any reader who clones the repo.
5. **Site security:** CSP + security headers shipped 865b379, but production deploy doesn't run a header check. Lighthouse-95 gate would catch regressions.
6. **Lockfile mismatches in sibling repos** (Arcanea, FrankX) still exist per 2026-05-04 audit — not blocking for site but blocking for "ACOS as Adopter #1" framing if we want clean adopter-side CI.
7. **No production monitoring** — uptime, Lighthouse regressions, broken links — outside of manual checks. Standard `vercel observability + better-stack` shape recommended; not yet built.

---

## §7 Open sovereign-class questions for Frank

Each requires Frank's input before PLAN.md is finalized. Numbered for response anchoring.

**Q1. Repo identity. Is `frankxai/starlight` (L99 reference) the same repo as `frankxai/Starlight-Intelligence-System` (this repo's GitHub remote), a rename target, or a *new slimmer repo* containing only public-facing covenant + protocol + site?** I've assumed the same repo for STATE.md. If you want a slimmer `frankxai/starlight` repo, PLAN.md's first action is the extraction.

**Q2. Attestation mirror protocol shape.** How do adopters declare their attestation URL? Options: (a) `mcp.json` in adopter repo carries a `sip_attestation_url` field that `/adopters` polls; (b) adopters PR a single-line entry to `frankxai/starlight/adopters.yaml`; (c) DNS TXT record under their domain; (d) hybrid — PR for onboarding + URL polling afterward. Recommend (a) for purity (no PR friction) with (b) as fallback for non-technical adopters. **Decision is structural for the `/adopters` route.**

**Q3. Public-site cull decision authority.** I've recommended a 21→6 route reduction in §5. Most cuts have clean rehoming (frankx.ai for personal voice, npm READMEs for technical docs). **The decisions that affect SEO live there — particularly `/vaults`, `/verticals`, `/explainer`. Confirm or counter-propose.**

**Q4. `oci-ai-architect` repo location + relevance.** L99 named it for skill-pack patterns; I can't find it in this user tree. Is it on GitHub-only (give me the URL), in a path I haven't searched, or a memory-only reference that's no longer load-bearing?

**Q5. Cancino Substrate work location + relevance.** Same — zero references in this repo or any sibling. External? Private? Out-of-scope after the covenant lands?

**Q6. The ~8 stale `frankx-*` dirs (frankx-fix-ci, frankx-prod-{ai-coe-live,deploy,libos3,sync}, frankx-ship-gai, studio-frankx).** Recommend archive batch — none load-bearing for the covenant build. Confirm or list which to preserve.

**Q7. `starlight-intelligence.ai` (the `.ai` Next.js sibling project — separate from this `.org` site).** Purpose? Old positioning attempt? Active alternate? If unused, archive; if active, the relationship to starlightintelligence.org needs an explicit statement.

**Q8. Console v0.1 scope ceiling.** L99 says "Console is the DPI engine — managed tier paid, self-hosted free." That's the *what*. The *scope* — does Console v0.1 ship as (a) CLI + MCP only, no GUI ("Console-as-tooling"), (b) CLI + MCP + the Cockpit-Zellij UI as a packaged self-hostable cockpit, (c) (b) + a hosted SaaS web Console at console.starlight.intelligence — needs a sovereign-class call before PLAN.md sequences Phase 3.

**Q9. Steward voice register.** `/steward` is the hardest route to author because the voice register has to be invented — somewhere between an EFF annual letter, a Linux Foundation status report, a Vitalik blog post, and an investor letter. Recommend you draft a 200-word **steward voice fragment** as the anchor sample before any code is written. That fragment trains every other steward-era artifact.

**Q10. Covenant draft availability.** STATE.md uses the five axioms you stated in L99 as proxy. PLAN.md will need to cite COVENANT.md verbatim for the `/covenant` route. **When does the draft land? Ideally before Day 1 ship target.**

---

## §8 Falsifier — where I think PLAN.md should diverge from L99

L99 specifies Day-1 = covenant + `/` + `/steward` live on prod. I have one structural concern with that order, and I'll propose the alternative in PLAN.md unless you push back here:

**Concern:** `/steward` is the route whose voice register has to be *invented*. Shipping it on Day 1 means inventing the steward voice under deadline pressure, before any of the other routes have stabilized the surrounding register. That risks an in-public iteration on the most reputation-sensitive page — exactly the page diligence readers will scrutinize hardest.

**Proposed alternative:** Day 1 = `/covenant` + `/` + `/protocol` (the three "constraint pages" that already have clear voice anchors). Day 2 = `/adopters` (mirror engine ships even if seed-list has just ACOS as Adopter #1). Day 3 = `/console` waitlist. Day 4 = ops scaffold + `/steward` *staging-only* with Frank's voice fragment as the lone artifact, public Day 5 once the fragment has settled. The shift adds ~36h to overall ship but protects the highest-reputation surface from a rushed voice-invention.

If you reject the alternative, I'll execute L99's order as-spec'd. **This is your call.**

---

## §9 Self-review verdict

- **Placeholders:** None. Every section is complete; unknowns are explicitly flagged with their own Q-numbers in §7.
- **Internal consistency:** §1 repo states match §4 primitive states match §5 route dispositions. Cross-checked once.
- **Scope:** Diagnostic only. No build plan, no code changes recommended in this document — those live in PLAN.md.
- **Ambiguity:** Two potential reading ambiguities — (i) `frankxai/starlight` identity, addressed by Q1; (ii) `/console` vs `/cockpit` distinction, addressed by Q8.
- **Covenant alignment:** Every recommendation in §3, §4, §5 is checked against the five covenant axioms. No conflicts surfaced.

---

**Phase 0 complete.** No PLAN.md will be written until Frank reviews this document and resolves at minimum Q1, Q2, Q3, Q8, Q9, Q10 (the structural / voice / scope-defining questions). Q4, Q5, Q6, Q7 can resolve in parallel.

---

**Built on SIP** · v1.1.1 · 2026-05-14 · Authored by Claude Opus 4.7 (1M context) at Frank Riemer's L99 direction · MIT
