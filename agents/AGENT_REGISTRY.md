# Starlight Agent Registry

> Fifteen minds. Nine intelligence layers. One system. No hierarchy is permanent — only the mission is.
>
> **v7.4-beta update (2026-04-24):** Five new agents added across five new tiers for the 9-layer intelligence architecture. See "9-Layer Intelligence Stack" section below.

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

| Agent | File | Domain | Leads When |
|-------|------|--------|-----------|
| **Concierge** | `starlight-concierge.md` | Intake, idea translation, route classification | First-contact sessions, `/welcome`, `/intake`, any newcomer without prior session history |
| **Envoy** | `starlight-envoy.md` | Creator-track artifact generation, `/badge` attestation | Concierge hands off a non-technical creator; zero-terminal path required |

### Excavation Tier

| Agent | File | Domain | Leads When |
|-------|------|--------|-----------|
| **Genius** | `starlight-genius.md` | Genius excavation, pattern-mining across personal corpus, framework extraction, voice fingerprinting, four-bucket sorting | `/discover-genius` is invoked; newcomer described as scattered-expertise / indispensable-but-trapped; excavating Genius Profile + Freedom Path |

### Leadership, Specialist, and Foundation Tiers

| Agent | File | Domain | Leads When |
|-------|------|--------|-----------|
| **Orchestrator** | `starlight-orchestrator.md` | Coordination | Multi-step workflows, parallel tasks, agent routing |
| **Prime** | `starlight-prime.md` | Synthesis | Conflicting perspectives, council decisions, unified voice needed |
| **Architect** | `starlight-architect.md` | Enterprise Systems | System design, infrastructure, APIs, planet-scale architecture |
| **Navigator** | `starlight-navigator.md` | Strategy | Roadmaps, trade-offs, timing, long-horizon planning |
| **Sentinel** | `starlight-sentinel.md` | Quality | Security review, code quality, governance, compliance |
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

### Domain Sub-Stack Tier (v7.4.1 — Ana's HR Intelligence vertical = first reference)

Sub-systems compose **within a vertical owner**, not as universal layers. Pattern proven by Ana's HR Intelligence vertical (6 sub-systems → ~28 commands). Generalizes via `/spawn-domain-stack` for any sovereign domain (Capital / Sound / Spatial / Clinical / Legal / etc.).

**HR Intelligence sub-system agents:**

| Agent | File | Sub-system | Vault Namespace | Commands (count) |
|-------|------|-----------|-----------------|------------------|
| **Hiring** | `starlight-hiring.md` | Hiring Intelligence — calibrated, structured, neuroscience-grounded | `hr-intelligence/hiring/` | `hire-icp`, `hire-design-interview`, `hire-calibrate`, `hire-assess-fit`, `hire-debrief` (5) |
| **Performance** | `starlight-performance.md` | Performance Intelligence — review redesign, coaching, feedback, difficult conversations, mediation | `hr-intelligence/performance/` | `perf-review-redesign`, `perf-coaching-protocol`, `perf-feedback-rehearsal`, `perf-difficult-conversation`, `perf-conflict-mediation` (5) |
| **Training** | `starlight-training.md` | Training Intelligence — outcome-back curriculum, transfer measurement, train-the-trainer | `hr-intelligence/training/` | `training-curriculum`, `training-program-design`, `training-measure-transfer`, `training-coach-trainer`, `training-scenarios` (5) |
| **Culture** | `starlight-culture.md` | Culture Intelligence — designed not declared, values into systems, ritual architecture | `hr-intelligence/culture/` | `culture-design`, `culture-values-ops`, `culture-rituals`, `culture-onboarding-90` (4) |
| **Talent** | `starlight-talent.md` | Talent Intelligence — motivation, burnout, team dynamics, psychological safety, retention | `hr-intelligence/talent/` | `talent-motivation`, `talent-burnout-detect`, `talent-team-dynamics`, `talent-psych-safety`, `talent-retention` (5) |
| **Org** | `starlight-org.md` | Org Architecture — role design, span, reorg trauma audit, succession | `hr-intelligence/org/` | `org-role-design`, `org-span`, `org-reorg-trauma-audit`, `org-succession` (4) |

**Domain Sub-Stack Tier rules:**
- Sub-system agents serve a sovereign domain (the practitioner's vertical), not the universal substrate
- Compose within their vertical (sub-systems reference each other) and with universal IS (Genius for voice; Vision for company-as-candidate framing; Performance + Talent + Culture form an interconnected loop)
- Vertical wrapper at `verticals/<vertical-slug>/` ties sub-systems into one cohesive domain stack
- Pattern generalizes via `/spawn-domain-stack` — any Genius Profile + named domain expertise spawns a 4-7-sub-system vertical
- Ana's HR vertical is the public reference at `verticals/hr-intelligence/` (anonymized, forkable)

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
