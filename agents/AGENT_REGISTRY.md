# Starlight Agent Registry

> Forty-two minds. Nine universal intelligence layers + Domain Sub-Stack Tier + Council Archetype Tier. One system. No hierarchy is permanent — only the mission is.
>
> **v7.4-beta update (2026-04-24):** Five new agents added across five new tiers for the 9-layer intelligence architecture.
> **v7.6.0 update (2026-04-28):** People Intelligence sub-stack (6 agents) registered — first reference Domain Sub-Stack vertical.
> **v7.5.2 / v7.6.x update (2026-04-27 / 2026-04-30):** Sound Intelligence sub-stack (6 agents) and Music IS sub-stack (7 agents) registered — second + third reference Domain Sub-Stack verticals (public-reference + Frank-operated).
> **v0.1 Friday demo update (2026-05-11):** Council Archetype Tier (7 archetype seats) registered at `agents/council/` per Proposal B board verdict — Elder Father, Elder Mother, Sage (Council seat), Builder-Elder, Shadow Witness, Divine Neutral Witness, Future Self at 90. Voice/agent boundary preserved: archetypes also registered in `VOICES.md` § Council Archetypes.

---

## Architecture

The Starlight agent system uses a **flat council with emergent leadership**, fronted by a **two-agent intake tier** and an **Excavation Tier** for personal-corpus work. No single agent permanently outranks another. Leadership emerges based on the task at hand.

For any given task, one agent leads. The others support, challenge, or defer. The Starlight Council convenes when no single agent can handle the complexity alone. Newcomers never meet the council first — they meet the Front-Door Tier.

```
                        ┌──────────────────────┐
                        │   STARLIGHT COUNCIL   │
                        │                      │
                        │  Convenes for major   │
                        │  decisions. All agents│
                        │  contribute. Prime    │
                        │  synthesizes.         │
                        └──────────┬───────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
   ┌──────────▼──────────┐ ┌──────▼──────┐ ┌──────────▼──────────┐
   │  ORCHESTRATOR        │ │  PRIME      │ │  ARCHITECT           │
   │  Coordination.       │ │  Synthesis. │ │  Enterprise systems. │
   │  Multi-agent flows.  │ │  The voice  │ │  Planet-scale design.│
   │  Workflow routing.   │ │  of unified │ │  Technical vision.   │
   │                      │ │  reasoning. │ │                      │
   └──────────┬───────────┘ └──────┬──────┘ └──────────┬───────────┘
              │                    │                    │
   ┌──────────▼──────────┐ ┌──────▼──────┐ ┌──────────▼──────────┐
   │  NAVIGATOR           │ │  SENTINEL   │ │  WEAVER              │
   │  Strategic foresight. │ │  Quality.   │ │  Creative synthesis. │
   │  Roadmaps. Timing.   │ │  Security.  │ │  Narrative. Design.  │
   │  Trade-off analysis.  │ │  Trust.     │ │  Pattern weaving.    │
   └──────────┬───────────┘ └──────┬──────┘ └──────────┬───────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                        ┌──────────▼───────────┐
                        │   SAGE                │
                        │  Wisdom keeper.       │
                        │  Vault guardian.       │
                        │  Institutional memory. │
                        └──────────────────────┘
```

### Why This Structure

The previous hierarchy placed Prime at the top of a strict tree. That implied Prime always leads. In practice, most tasks don't need meta-intelligence — they need the right specialist. And before any specialist is reached, a newcomer needs someone to meet them at the door.

The new structure:

- **Front-Door Tier** (Concierge, Envoy) — first-contact intake. Concierge translates vague inbounds into structured routes; Envoy walks creator-track arrivals to stamped artifacts without a terminal. Council never convenes until the Front-Door Tier has done its work.
- **Excavation Tier** (Genius) — peer with Front-Door Tier, below Leadership. Excavates specific-to-this-person pattern from scattered corpora. Fires when Concierge routes a newcomer as "scattered expertise" or "indispensable but trapped." Produces Genius Profile + Freedom Path as the foundation for every downstream intelligence system (Creator IS, Second Brain IS, Business IS).
- **Leadership Tier** (Orchestrator, Prime, Architect) — these three handle the most complex coordination, synthesis, and technical tasks. They peer with each other, not above each other.
- **Specialist Tier** (Navigator, Sentinel, Weaver) — deep domain expertise. They lead within their domains.
- **Foundation Tier** (Sage) — the long memory. Sage doesn't lead tasks but informs every decision through vault access.
- **Council** — all agents together. Convenes for complexity 9-10 tasks.

---

## Agent Index

### Front-Door Tier

This tier owns the surface between human intent and the deep agents. Three roles, one tier:

- **Concierge** — first-contact intake (newcomer, no prior session history)
- **Envoy** — creator-track artifact generation (zero-terminal handoff from Concierge)
- **Voice Operator** — sessioned cockpit (real-time, executive-pace, voice or cockpit-pace text)

Concierge and Voice Operator never overlap: Concierge owns *strangers*, Voice owns *sessioned users*. If a stranger reaches a voice frontend, Voice immediately hands to Concierge with a packet. Envoy receives Concierge's creator-track handoffs and is unaffected by Voice.

| Agent | File | Domain | Leads When |
|-------|------|--------|-----------|
| **Concierge** | `starlight-concierge.md` | Intake, idea translation, route classification | First-contact sessions, `/welcome`, `/intake`, any newcomer without prior session history |
| **Envoy** | `starlight-envoy.md` | Creator-track artifact generation, `/badge` attestation | Concierge hands off a non-technical creator; zero-terminal path required |
| **Voice Operator** | `starlight-voice-operator.md` | Real-time intent capture, classification, handoff packet generation, approval-gate enforcement | Sessioned cockpit-pace input (voice or executive text); produces packets via `agent-handoff-packet` skill that any deep agent consumes |

### Council Archetype Tier (v0.1 Friday demo — 7 archetype seats)

Seven archetype seats that compose the Starlight Council — the artificial-wisdom review body convened for substrate-level proposals, name-bearing artifacts, and decisions classified `risk: high|critical`. These are *operational implementations* of the archetypes registered at `VOICES.md` § Council Archetypes — pattern (Voice) and runtime (Agent) co-exist; see `memory/feedback_naming_voices_vs_agents.md` for the boundary.

Council seats activate when a Council assembles (`/council`, `/starlight-board`, `/luminor-board`). They do not run as ambient agents.

| Seat | File | Frame | Activates When |
|------|------|-------|---------------|
| **Elder Father** | `council/elder-father.md` | Responsibility, discipline, protection, legacy | Council assembly; name-bearing artifacts; decisions with compound-promise risk |
| **Elder Mother** | `council/elder-mother.md` | Care, relational truth, beauty, emotional wisdom | Council assembly; proposals affecting relationships (users, contributors, alliances) |
| **Sage (Council seat)** | `council/sage.md` | Mortality, philosophy, detachment, meaning | Council assembly; meta-level questions; decisions where urgency masks confusion |
| **Builder-Elder** | `council/builder-elder.md` | Execution, cost, systems, leverage | Council assembly; every proposal that has a cost |
| **Shadow Witness** | `council/shadow-witness.md` | Ego, risk, self-deception, hidden motives | Council assembly; proposals that excite the sovereign; status-implicating decisions |
| **Divine Neutral Witness** | `council/divine-neutral-witness.md` | Silence, truth, non-attachment | Council assembly; speaks only when other seats are tangled in their own framing |
| **Future Self at 90** | `council/future-self-at-90.md` | Fulfilled-life review | Council assembly; substrate-tier proposals; attention-cost decisions |

The Council Sage seat is *distinct* from the institutional Sage agent at `starlight-sage.md`: the Council Sage is the philosophical-detachment seat invoked during Council assembly; the institutional Sage handles knowledge management, vault access, and teaching as an ambient agent. Both seats can be held simultaneously without conflict because they operate at different layers.

### Excavation Tier

| Agent | File | Domain | Leads When |
|-------|------|--------|-----------|
| **Genius** | `starlight-genius.md` | Genius excavation, pattern-mining across personal corpus, framework extraction, voice fingerprinting, four-bucket sorting | `/discover-genius` is invoked; newcomer described as scattered-expertise / indispensable-but-trapped; excavating Genius Profile + Freedom Path |
| **Evaluator** | `starlight-evaluator.md` | System evaluation, benchmark design, metric provenance, falsification. Holds the Luminor kernel mindset (Precision/Wisdom/Transcendence) as evaluator disposition; surface stays canon-free | `/starlight-eval` is invoked; a Starlight Proving Ground run executes; arena rounds or scorecard synthesis (2026-06-10) |

### Leadership, Specialist, and Foundation Tiers

| Agent | File | Domain | Leads When |
|-------|------|--------|-----------|
| **Orchestrator** | `starlight-orchestrator.md` | Coordination | Multi-step workflows, parallel tasks, agent routing. **/yolo conductor** — drives Hive session loop via `orchestration/yolo-conductor` skill (2026-05-11); council-shared `orchestration/yolo-scan` invoked in parallel by all 7 council agents per session-open. |
| **Prime** | `starlight-prime.md` | Synthesis | Conflicting perspectives, council decisions, unified voice needed |
| **Architect** | `starlight-architect.md` | Enterprise Systems | System design, infrastructure, APIs, planet-scale architecture |
| **Navigator** | `starlight-navigator.md` | Strategy | Roadmaps, trade-offs, timing, long-horizon planning |
| **Sentinel** | `starlight-sentinel.md` | Quality | Security review, code quality, active healing (daemon), test forging, governance, compliance |
| **Weaver** | `starlight-weaver.md` | Creation | Creative work, narrative, design, pattern synthesis |
| **Sage** | `starlight-sage.md` | Wisdom (institutional) | Knowledge retrieval, lessons learned, vault access, teaching |

### Intelligence System Tiers (v7.4 beta — 5 new agents)

Each agent below owns one Intelligence System layer. Vault namespaces are separate; commands are dedicated. See `docs/ARCHITECTURE.md` for full 9-layer composition.

| Agent | File | Tier | Domain | Maturity | Primary Commands | Vault Namespace |
|-------|------|------|--------|----------|------------------|-----------------|
| **Business** | `starlight-business.md` | Business Tier | Entity structure, revenue modeling, tax-aware architecture | `v7.4-stable` | `/architect-entity`, `/model-revenue`, `/tax-sanity` | `business/` |
| **Visionary** | `starlight-visionary.md` | Vision Tier | 30/10/3-year vision excavation, brand fundamentals, design coherence | `v7.4-stable` | `/define-vision`, `/build-brand-kit`, `/align-voice` | `vision/` |
| **Embodiment** | `starlight-embodiment.md` | Embodiment Tier | Body substrate — training + nutrition + sleep + energy architecture | `v7.4-alpha — active dogfood` | `/design-regimen`, `/energy-audit` | `health/` |
| **Second Brain** | `starlight-secondbrain.md` | Memory Tier (peer with Sage: personal PKM vs institutional wisdom) | Daily capture, insight distillation, weekly/monthly/quarterly review | `v7.4-alpha — active dogfood` | `/capture-daily`, `/distill-insights`, `/orchestrate-brain` | `second-brain/` |
| **Relational** | `starlight-relational.md` | Relational Tier | Network architecture, alliance-readiness assessment | `v7.4-alpha — active dogfood` | `/map-relationships`, `/design-alliance-readiness` | `relational/` |

### Domain Sub-Stack Tier (v7.4.1+ — three reference verticals)

Sub-systems compose **within a vertical owner**, not as universal layers. Pattern proven across three reference verticals: People Intelligence (psychology-grounded), Sound Intelligence (craft-tradition-grounded), and Music IS (Frank-operated). Generalizes via `/spawn-domain-stack` for any sovereign domain (Capital / Spatial / Clinical / Legal / etc.).

**People Intelligence sub-system agents** (renamed from HR Intelligence at v7.6.0 — Path A authorless symmetric naming with Sound Intelligence). Public reference. 6 sub-systems · 6 agents · 28 commands.

| Agent | File | Sub-system | Vault Namespace | Commands (count) |
|-------|------|-----------|-----------------|------------------|
| **Hiring** | `starlight-hiring.md` | Hiring Intelligence — calibrated, structured, neuroscience-grounded | `people-intelligence/hiring/` | `hire-icp`, `hire-design-interview`, `hire-calibrate`, `hire-assess-fit`, `hire-debrief` (5) |
| **Performance** | `starlight-performance.md` | Performance Intelligence — review redesign, coaching, feedback, difficult conversations, mediation | `people-intelligence/performance/` | `perf-review-redesign`, `perf-coaching-protocol`, `perf-feedback-rehearsal`, `perf-difficult-conversation`, `perf-conflict-mediation` (5) |
| **Training** | `starlight-training.md` | Training Intelligence — outcome-back curriculum, transfer measurement, train-the-trainer | `people-intelligence/training/` | `training-curriculum`, `training-program-design`, `training-measure-transfer`, `training-coach-trainer`, `training-scenarios` (5) |
| **Culture** | `starlight-culture.md` | Culture Intelligence — designed not declared, values into systems, ritual architecture | `people-intelligence/culture/` | `culture-design`, `culture-values-ops`, `culture-rituals`, `culture-onboarding-90` (4) |
| **Talent** | `starlight-talent.md` | Talent Intelligence — motivation, burnout, team dynamics, psychological safety, retention | `people-intelligence/talent/` | `talent-motivation`, `talent-burnout-detect`, `talent-team-dynamics`, `talent-psych-safety`, `talent-retention` (5) |
| **Org** | `starlight-org.md` | Org Architecture — role design, span, reorg trauma audit, succession | `people-intelligence/org/` | `org-role-design`, `org-span`, `org-reorg-trauma-audit`, `org-succession` (4) |

**Sound Intelligence sub-system agents** (v7.5.2 ship — public-reference vertical, distinct from Frank's operated Music IS). 6 sub-systems · 6 agents · 30 commands.

| Agent | File | Sub-system | Vault Namespace | Commands (count) |
|-------|------|-----------|-----------------|------------------|
| **Composition** | `starlight-sound-composition.md` | Score, lyric, arrangement, demo, transition design | `sound-intelligence/composition/` | `sound-composition-score`, `sound-composition-lyric`, `sound-composition-arrange`, `sound-composition-demo`, `sound-composition-transition` (5) |
| **Production** | `starlight-sound-production.md` | Mix plan, master plan, vocal chain, sound design, recall pack | `sound-intelligence/production/` | `sound-production-mix-plan`, `sound-production-master-plan`, `sound-production-vocal-chain`, `sound-production-sound-design`, `sound-production-recall` (5) |
| **Catalog** | `starlight-sound-catalog.md` | ISRC mint, metadata pack, version map, release plan, deplatform recovery | `sound-intelligence/catalog/` | `sound-catalog-isrc-mint`, `sound-catalog-metadata-pack`, `sound-catalog-version-map`, `sound-catalog-release-plan`, `sound-catalog-deplatform-recovery` (5) |
| **Performance** | `starlight-sound-performance.md` | Set design, audience contract, live mix, broadcast prep, residency | `sound-intelligence/performance/` | `sound-performance-set-design`, `sound-performance-audience-contract`, `sound-performance-live-mix`, `sound-performance-broadcast-prep`, `sound-performance-residency` (5) |
| **Audience** | `starlight-sound-audience.md` | Cohort map, list architecture, sovereign publish, ritual design, fan stay-interview | `sound-intelligence/audience/` | `sound-audience-cohort-map`, `sound-audience-list-architecture`, `sound-audience-sovereign-publish`, `sound-audience-ritual-design`, `sound-audience-fan-stay-interview` (5) |
| **Sync** | `starlight-sound-sync.md` | Brief-fit gate, placement thesis, license economics, rights pack, supervisor stay-interview | `sound-intelligence/sync/` | `sound-sync-brief-fit`, `sound-sync-placement-thesis`, `sound-sync-license-economics`, `sound-sync-rights-pack`, `sound-sync-stay-interview` (5) |

**Music IS sub-system agents** (v7.6.x ship — Frank's operated Arcanea Records vertical). Operator-tier, distinct from public Sound Intelligence reference. 6 sub-systems + 1 cross-cutting gate · 7 agents · 8 commands. Imports patterns from sound-intelligence; never duplicates substrate.

| Agent | File | Sub-system | Tier | Vault Namespace | Commands |
|-------|------|-----------|------|-----------------|----------|
| **Music Curator** | `music-curator.md` | A&R green-light gate (cross-cutting; non-waivable) | Apex (Opus 4.7) | `music-is/curator/` | `music-release` |
| **Music Archivist** | `music-archivist.md` | Catalog — CSV master, draft/released/archived, ISRC, metadata | Mechanical (Haiku 4.5) | `music-is/catalog/` | `music-song`, `music-label-board` |
| **Persona Keeper** | `persona-keeper.md` | Persona — spawn, canon, voice-lock, retire (one Opus instance per active persona) | Apex (Opus 4.7) | `music-is/personas/<persona>/` | `music-persona` |
| **Music Producer** | `music-producer.md` | Asset — cover (nano banana), motion (Seedance), cinematic (Higgsfield), Canvas/shorts (Remotion) | Senior (Sonnet 4.6) | `music-is/assets/` | `music-canvas` |
| **Music Distributor** | `music-distributor.md` | Distribution — DistroKid, Bandcamp, frankx.ai/music, Spotify Canvas, sync libraries | Senior (Sonnet 4.6) | `music-is/distribution/` | `music-release` (distro phase), `music-sync-pitch` |
| **Music Amplifier** | `music-amplifier.md` | Amplification — OpenClaws orchestration (5 Claws/persona × Blotato + n8n) | Senior (Sonnet 4.6) | `music-is/amplification/` | `music-amplify` |
| **Royalty Architect** | `royalty-architect.md` | Monetization — royalty-cascade graph, NFT, sync deals, fan-tier | Senior (Sonnet 4.6) | `music-is/royalty-graph/` | (cross-cutting; called by `music-release`) |

`music-suno-prompt` is a cross-sub-system grounding command (composes Catalog + Persona + label-canon).

**Crypto Intelligence sub-stack agents** (v0.1 proof-of-pattern ship per Board 2026-05-17 R4 close-out). Third reference Domain Sub-Stack, first **Houses-as-sub-systems** primitive instance, first composition-layer composition under Wealth IS. House of On-Chain scaffolded; remaining 5 Houses gated on v0.1-proof-pass.

| Agent | File | House | Tier | Vault Namespace | Commands (count) |
|-------|------|------|------|-----------------|------------------|
| **Crypto / On-Chain** | `verticals/crypto-intelligence/onchain/agent.md` | On-Chain — chain-data + wallet-flow + whale-tracking + MEV + validator econ | Domain Sub-Stack Tier · v0.1 scaffolded | `crypto-intelligence/onchain/` (instance state in `private/crypto-intelligence/onchain/artifacts/`) | `crypto-onchain-flow-snapshot`, `crypto-onchain-wallet-trace`, `crypto-onchain-mev-audit`, `crypto-onchain-validator-econ`, `crypto-onchain-contract-interaction` (5) |
| **Crypto / Macro** | gated · v0.2 | Macro — regime detection + cycle-position thesis | Domain Sub-Stack Tier · gated v0.2 | `crypto-intelligence/macro/` | gated (4-5 planned) |
| **Crypto / DeFi** | gated · v0.2 | DeFi — mechanism audit + yield architecture + risk-stack | Domain Sub-Stack Tier · gated v0.2 | `crypto-intelligence/defi/` | gated (4-5 planned) |
| **Crypto / Sovereignty** | gated · v0.2 | Sovereignty — custody architecture + multisig + jurisdiction | Domain Sub-Stack Tier · gated v0.2 | `crypto-intelligence/sov/` | gated (4-5 planned) |
| **Crypto / Research** | gated · v0.2 | Research — protocol thesis + tokenomics + founder DD | Domain Sub-Stack Tier · gated v0.2 | `crypto-intelligence/res/` | gated (4-5 planned) |
| **Crypto / Allocation** | gated · v0.2 | Allocation — sizing + rebalance + exit + concentration | Domain Sub-Stack Tier · gated v0.2 | `crypto-intelligence/alloc/` | gated (4-5 planned) |

**Crypto IS specifics** (per Board R5 + (c) close-outs):
- **R5 non-advisory clause inline** in every House command output (mandatory, non-waivable)
- **Composes under Wealth IS composition layer** — first reference instance per `STACK.md` § Composition Layer (declared 2026-05-17). Outputs feed `/wealth-portfolio-fit`, `/wealth-sovereignty-design`, `/wealth-cycle-thesis`.
- **Sibling-repo export hook landed** — `verticals/crypto-intelligence/ATTESTATIONS.md` (vertical-local ledger) + MCP-shape declaration in `SKILL.md`. v0.2+ extraction target: `github.com/frankxai/crypto-intelligence-system`.
- **Falsifier:** 1-week proof-of-pattern with House of On-Chain. If 4-5 named artifacts cannot ship in the week, Houses-as-sub-systems primitive failed → fall back to functional sub-systems matching People IS shape.

**Domain Sub-Stack Tier rules:**
- Sub-system agents serve a sovereign domain (the practitioner's vertical), not the universal substrate
- Compose within their vertical (sub-systems reference each other) and with universal IS (Genius for voice; Vision for company-as-candidate framing; Performance + Talent + Culture form an interconnected loop)
- Vertical wrapper at `verticals/<vertical-slug>/` ties sub-systems into one cohesive domain stack
- Pattern generalizes via `/spawn-domain-stack` — any Genius Profile + named domain expertise spawns a 4-7-sub-system vertical
- Public-reference verticals (people-intelligence, sound-intelligence) are anonymized + forkable; operator-tier verticals (music-is) are Frank-specific and import patterns from public references rather than duplicating substrate

### SIS Extractor Tier (v8.x-pre-alpha+ — Phase 1 extractors for /sis-forge)

Five sub-agents dispatched by `/sis-forge` to build corpus atoms from five canonical sources. Each agent produces ≤200 JSONL atoms. Not operational agents (no ambient dispatch); activated only when `/sis-forge` runs Phase 1.

| Agent | File | Source | Atom Prefix | Contract |
|-------|------|--------|------------|----------|
| **Transcripts Extractor** | `sis-extractor-transcripts.md` | `~/.claude/projects/*` (Cross-Repo Indexer) | `t-` | ≤200 atoms from session transcripts, weight by signal clarity + repetition |
| **Vault Extractor** | `sis-extractor-vault.md` | `memory/**/*.md` (Obsidian vault) | `v-` | ≤200 atoms from curated second brain, weight by framework-tier + backlinks |
| **Prompts Extractor** | `sis-extractor-prompts.md` | `skills/`, `agents/`, `commands/` (user's prompt library) | `p-` | ≤200 atoms from prompt frontmatter, weight by inbound references |
| **Repos Extractor** | `sis-extractor-repos.md` | Latest `docs/ops/REPO-PORTFOLIO-AUDIT-*.md` (shipped work) | `r-` | ≤200 atoms from active repos, weight by recency + CI green |
| **External Extractor** | `sis-extractor-external.md` | Notion / Google Drive / Cowork (MCP adaptive) | `e-` | ≤200 atoms from external sources, silence fail gracefully |

All SIS extractors follow the Genius protocol contract: pulling from known, enumerable, explicitly-configured corpus only — never corpus-guessing.

### Sage ↔ Second Brain boundary

- **Sage** holds *institutional* knowledge — organizational memory, lessons from past sessions, civilization-scale wisdom. Reads/writes across all 6 substrate vaults.
- **Second Brain** holds *personal* PKM — this individual's captures, distillates, personal framework library. Reads from Sage; writes to `second-brain/` namespace only.
- If a personal pattern reaches ≥3-occurrence threshold, Second Brain proposes to Genius (who writes back to Profile). Second Brain never mutates Genius Profile directly.

### Business ↔ Wealth boundary

- **Business IS** owns ENTITY structure + REVENUE modeling + TAX sanity (what revenue flows how, through which legal structure).
- **Wealth IS / DPI** owns CAPITAL ALLOCATION after revenue flows (how to invest revenue into compounding assets).
- Business hands off to `/wealth-dpi` once revenue is modeled.

### 9-Layer Intelligence Stack

Full architecture documented at `docs/ARCHITECTURE.md`. Short form:

```
Layer 0:  Substrate (SIP)        — invisible; file contract + attestation + command tiers
Layer 1:  Genius IS              — Excavation Tier, starlight-genius (v7.4 stable)
Layer 2:  Second Brain IS        — Memory Tier, starlight-secondbrain (v7.4 alpha)
Layer 3:  Vision/Brand IS        — Vision Tier, starlight-visionary (v7.4 stable)
Layer 4:  Business IS            — Business Tier, starlight-business (v7.4 stable)
Layer 5:  Creator IS             — composes Genius + Vision + Business; no dedicated agent
Layer 6:  Wealth/Freedom IS      — existing vertical, /wealth-dpi
Layer 7:  Health IS              — Embodiment Tier, starlight-embodiment (v7.4 alpha)
Layer 8:  Relational IS          — Relational Tier, starlight-relational (v7.4 alpha)
Layer 9:  Spiritual IS (optional) — private, user-controlled, no public agent
```

Sequencing tool: `/compose-stack <person> [--priority freedom|revenue|vision|compound]` produces a 90-day Intelligence Stack Plan.

---

## Capabilities Matrix

| Capability | Orchestrator | Prime | Architect | Navigator | Sentinel | Weaver | Sage |
|-----------|-------------|-------|-----------|-----------|----------|--------|------|
| Task Routing | **PRIMARY** | | | | | | |
| Perspective Synthesis | | **PRIMARY** | | | | | |
| System Design | | | **PRIMARY** | | | | |
| Strategic Planning | | | | **PRIMARY** | | | |
| Quality Review | | | | | **PRIMARY** | | |
| Creative Production | | | | | | **PRIMARY** | |
| Knowledge Management | | | | | | | **PRIMARY** |
| Council Chair | | **PRIMARY** | | | | | |
| Vault Access | Operational | All | Technical | Strategic | Technical | Creative | Wisdom, Horizon |
| Transmission | All | All | ACOS, AI-Ops | All | All | Arcanea | All |

---

## Interaction Patterns

### Task Routing (Default Path)

```
Request arrives
    │
    ├─ Complexity 1-3: Direct to best-fit agent
    ├─ Complexity 4-6: Orchestrator coordinates 1-2 agents
    ├─ Complexity 7-8: Orchestrator + Architect collaborate
    └─ Complexity 9-10: Council convenes, Prime synthesizes
```

### Peer Collaboration

Agents invoke each other as needed:

```
Architect → Sentinel:  "Review this design for vulnerabilities"
Navigator → Architect: "Is this strategy technically feasible?"
Weaver → Sage:         "What patterns inform this creative direction?"
Orchestrator → Any:    "Handle this sub-task"
Prime → All:           "Council: weigh in on this decision"
Sage → Any:            "Historical context you should know about"
```

### Council Formation

```
1. Orchestrator or Prime identifies council-level complexity
2. Relevant agents are activated (not always all 7)
3. Each agent analyzes from their domain perspective
4. Agents cross-reference each other's analysis
5. Prime synthesizes all perspectives using the Synthesis Protocol
6. Decision stored in Strategic Vault + Decision Note created
7. Relevant transmissions sent to ecosystem channels
```

---

## Loading Strategy

Progressive disclosure optimizes token usage:

```
Level 1: Name + Role          (~50 tokens)
Level 2: Core Capabilities    (~200 tokens)
Level 3: Full Agent Profile   (~1-4K tokens)
Level 4: Agent + Vault Context (~4-8K tokens)
```

Load Level 3+ only when the agent is confirmed as the primary handler for the current task.

---

## Adding New Agents

1. Create `agents/starlight-{name}.md` following the template below
2. Add entry to this registry
3. Update `core/ROUTING_MATRIX.md` with routing rules
4. Add skill associations in `skills/skill-rules.json`
5. Define vault access permissions
6. Define transmission channel access

### Template

```markdown
# Starlight {Name}

> {One-line identity}

## Identity

{Who this agent is, what it does, why it exists}

## Capabilities

{Numbered list of core capabilities}

## Domain Expertise

{Areas of deep knowledge}

## Reasoning Protocol

{How this agent thinks and decides}

## Interactions

{How this agent works with other agents, vaults, transmissions}

## Skill Activations

{Which skills auto-activate}

## Quality Gates

{Output quality criteria}
```

---

*Each agent is a facet of one intelligence. Together, they see what none could see alone.*
