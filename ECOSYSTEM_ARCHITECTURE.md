# FrankX Ecosystem Architecture

> **Current-state notice (2026-08-12):** This is a historical June 2026 constellation narrative, not the current repository control plane. The canonical Starlight intelligence role map is [`docs/architecture/STARLIGHT_PORTFOLIO_TOPOLOGY.md`](docs/architecture/STARLIGHT_PORTFOLIO_TOPOLOGY.md); volatile external dependencies are tracked in [`context/empire/upstreams.json`](context/empire/upstreams.json). Preserve the dated material below as audit evidence until it is regenerated from the full connected estate.

**The Starlight Constellation: SIS as Substrate Hub for ~15 Repositories**

Version 2.1 | Structure verified 2026-06-10 · Counts reconciled with `metrics/current.json` 2026-07-28

> **Metrics note:** Fast-moving counts (agents, skills, version) in this document are snapshots. The living, harness-enforced source of truth is [`metrics/current.json`](metrics/current.json) — the site build and agent harness fail closed on drift.

---

## 1. Overview

The FrankX ecosystem is no longer a three-repo stack. It is a constellation of roughly fifteen repositories organized in three tiers around a single substrate hub. **Starlight Intelligence System (SIS)** sits at the center: it owns the Starlight Intelligence Protocol (SIP), the memory vaults, the attestation rules, and the cross-repo contracts. Everything else either composes the substrate (Built-on-SIP downstream repos), bridges to it (sibling execution layers), or has gone dormant and awaits archive.

The original three-layer intuition still holds at the core — a universal framework (SIS), a platform-native implementation (ACOS), and a domain-specific creative universe (Arcanea) — but the satellite tier around that core has grown into its own ring of specialized repos, and several early members of the ecosystem have gone quiet. This document records the constellation as verified on 2026-06-10.

**Starlight Intelligence System (SIS)** is the substrate layer. Two layers live in one repo: the SIP substrate (protocol, alliances, verticals, voices, attestation) and a reference operational build with **144 agents**, **84 auto-activating skills** across 16 domains (both harness-verified 2026-07-27, per `metrics/current.json`), **6 persistent memory vaults**, 10 universal Intelligence Systems plus a Domain Sub-Stack tier, and platform adapters for 6 AI development tools. SIS is platform-agnostic: Markdown and JSON configuration, zero runtime dependencies. Any AI agent that reads files can consume SIS.

**Agentic Creator OS (ACOS)** is the implementation layer (public, v11). It consumes SIS intelligence and deploys it through Claude Code as a productivity operating system: **90+ skills**, **65+ commands**, **38 agents**, swarm topologies via claude-flow lineage, and the Agentic Jujutsu self-learning mechanism. Where SIS defines *what intelligence is*, ACOS defines *how intelligence works* in a specific tool.

**Arcanea** is the universe layer and currently the most active repo in the constellation (356 commits in the last 60 days). It splits across two remotes: `arcanea-ai-app` (private application) and `arcanea` (public OSS). It consumes both SIS intelligence and ACOS operational patterns inside a living mythology of AI-human co-creation — Guardian agents mapped to the SIS council, a narrative Library, the Ten Gates progression system, and on-chain creator-IP infrastructure.

The separation remains deliberate. SIS never contains Claude Code-specific configuration. ACOS never contains mythology. Arcanea never redefines orchestration patterns. Satellites compose or bridge; they do not fork the substrate.

```
                         DORMANT / ARCHIVE TIER
              ai-ops · starlight-intelligence.ai · starlight-agent-lab
                                  (quiet)
   ────────────────────────────────────────────────────────────────────
                          ACTIVE SATELLITE TIER
      arcanea-flow   library-os   prompt-library   prompt-engine
      second-brain-os   sentinel   starlight-evals
      starlight-horizon-dataset   starlight-voice
   ────────────────────────────────────────────────────────────────────
                            ACTIVE CORE TIER
            ┌──────────────────────────────────────────────┐
            │   SIS (substrate hub)                        │
            │   SIP · 144 agents · 84 skills · 6 vaults    │
            │      │                                       │
            │      ├── Generates context for ──> ACOS v11  │
            │      │     90+ skills · 65+ commands         │
            │      │     38 agents · Agentic Jujutsu       │
            │      │                                       │
            │      └── Powers ──> Arcanea                  │
            │            arcanea-ai-app (private)          │
            │            arcanea (public OSS)              │
            │            Guardians · Library · Ten Gates   │
            └──────────────────────────────────────────────┘
```

---

## 2. The Constellation

Three tiers, verified 2026-06-10. "Pulse" is observed activity, not aspiration.

### 2.1 Active Core

| Repo | Visibility | Role | State (2026-06-10) |
|------|-----------|------|---------------------|
| **Starlight-Intelligence-System** | Public | Substrate hub — SIP, vaults, attestation, contracts | 144 agents, 84 skills, v8.3.0 (harness-verified 2026-07-27), daily-driven |
| **agentic-creator-os** | Public | Claude Code productivity OS, Built on SIP | v11: 90+ skills, 65+ commands, 38 agents |
| **Arcanea** (arcanea-ai-app + arcanea) | Private app + public OSS | Creative universe layer | Most active in constellation: 356 commits/60d |

### 2.2 Active Satellites

| Repo | Role | Contract with SIS |
|------|------|-------------------|
| **arcanea-flow** | Swarm/hooks/RL execution layer (claude-flow / ruflo fork) | Connect-not-absorb; bridges via Memory Bus namespace contract (`transmissions/channels/arcanea-flow-channel.md`) |
| **library-os** | Knowledge library OS | OSS sibling, consumes SIS patterns |
| **prompt-library** | Prompt corpus | Pre-extraction stage, low pulse |
| **prompt-engine** | Prompt tooling | Pre-extraction stage, low pulse; pairs with prompt-library |
| **second-brain-os** | Personal knowledge system | Strongest downstream SIP composer; carries Built-on-SIP badge |
| **sentinel** | Multi-site excellence agency | Integrates via `docs/SIS-INTEGRATION.md`; uses SIS MCP memory |
| **starlight-evals** | Eval harness mirror | Deliberate publish-mirror of `tools/proving-ground` + `tools/arena` |
| **starlight-horizon-dataset** | Alignment values dataset | Public counterpart of the Horizon Vault (§ 7) |
| **starlight-voice** | Voice operator | Paused at v3 spec stage; resumes per Voice v3 plan |

### 2.3 Dormant / Archive Queue

| Repo | State | Disposition |
|------|-------|-------------|
| **ai-ops** | Last pushed 2026-02-03; not cloned locally | Dormant; channel file marked accordingly (§ 2.5 of `transmissions/channels/ai-ops-channel.md`) |
| **starlight-intelligence.ai** | Un-versioned duplicate of `site/` | Archive queued |
| **starlight-agent-lab** | No remote | Backup queued, then archive |

Dormancy is a recorded state, not a deletion. Dormant repos keep their channel files (marked DORMANT) and their history; revival requires only a fresh transmission and a pulse check.

---

## 3. Intelligence Flow

Intelligence flows downward through the core stack (SIS defines, ACOS implements, Arcanea manifests) and knowledge flows upward (Arcanea discovers creative patterns, ACOS captures operational learnings, SIS consolidates both into permanent vaults). Satellites attach laterally via explicit contracts.

### 3.1 Downward Flow: Context Generation

SIS generates platform-specific context through its adapter system. For ACOS, this means producing a `CLAUDE.md` system prompt that embeds agent definitions, skill activation rules, memory protocols, and the identity layer. For Arcanea, the same pipeline runs with the web platform adapter, producing context for the application's AI service layer rather than a CLI system prompt. For Built-on-SIP satellites (second-brain-os, sentinel), SIS provides the file contract, attestation rules, and memory access patterns; the satellite composes them under its own identity.

### 3.2 Upward Flow: Knowledge Accumulation

Every session that runs against ACOS, Arcanea, or a composing satellite produces learnings that flow back into SIS vaults:

- **ACOS sessions** write to the Technical Vault (architecture patterns, debugging insights), Strategic Vault (product decisions), and Operational Vault (system state changes).
- **Arcanea sessions** write to the Creative Vault (voice patterns, narrative frameworks, design decisions) and Wisdom Vault (cross-domain principles discovered through creative work).
- **Satellite sessions** write through the Memory Bus or handover docs, namespaced per the channel contract.
- **All systems** may write to the Horizon Vault through human-reviewed pull requests; public entries surface in `starlight-horizon-dataset`.

### 3.3 Lateral Flow: Cross-System Transmission

The transmission-channel reality as of 2026-06-10 — three live contracts, three dormant logs:

| Channel | Status | What actually flows |
|---------|--------|---------------------|
| ACOS Channel (`acos-channel.md`) | **LIVE** | Substrate state syncs, command/skill discoveries, version pins for downstream consumption |
| Memory Bus (`memory-bus.md`) | **LIVE** | Singleton MCP daemon — cross-CLI memory state, vector search, KG traversal, pub/sub notifications |
| Arcanea-Flow Channel (`arcanea-flow-channel.md`) | **LIVE** | Connect-not-absorb namespace contract; swarm/RL outputs in, vault grants out |
| AI-Ops Channel (`ai-ops-channel.md`) | **DORMANT** since 2026-02-10 | Init-only; ai-ops repo itself dormant since 2026-02-03 |
| Arcanea Channel (`arcanea-channel.md`) | **DORMANT** since 2026-02-10 | Init-only; actual Arcanea ↔ SIS flow happens via MCP, Memory Bus, and handover docs |
| Broadcast Channel (`broadcast-channel.md`) | **DORMANT** since 2026-02-10 | Init-only; system-wide updates propagate via vault writes + per-channel syncs instead |

Transmissions on live channels are logged chronologically in channel files under `transmissions/channels/`. Each transmission records sender, priority, content, and acknowledgment status. Dormant channel files carry an explicit status header and are retained as historical record.

---

## 4. Agent Architecture

The agent hierarchy spans the core tier, with each layer adding specialization while maintaining alignment to the SIS council structure.

### 4.1 SIS Level: 144 Agents Around a Council Core

SIS registers **144 agents** as of 2026-07-27 (`agents/AGENT_REGISTRY.md` is the authoritative roster; the harness in `scripts/check-agent-harness.mjs` fail-closes on drift). The layers grew from the original 48-agent registry (snapshot 2026-06-10: 7-agent legacy council, 7 Council Archetype seats, 3 front-door agents, 1 excavation agent, 5 universal-IS agents, 6 People Intelligence, 6 Sound Intelligence, 7 Music IS, 5 SIS Extractors, plus the Starlight Genius excavation tier) by adding the Domain Vertical expansion — Space, Marine, Longevity, Legal, Crypto, Energy, Machine, Safety, and Partner adapter tiers. The original council remains the coordination spine — flat, with emergent leadership; whichever agent's domain matches the current task leads.

| Council Agent | Domain | Cognitive Profile |
|-------|--------|-------------------|
| **Orchestrator** | Meta-coordination | Request analysis, agent selection, workflow sequencing, resource management |
| **Prime** | Synthesis | Multi-perspective integration, conflict resolution, unified voice production |
| **Architect** | Systems | Enterprise-grade design, infrastructure patterns, scalability analysis |
| **Navigator** | Strategy | Long-horizon foresight, trend analysis, opportunity mapping, trade-off evaluation |
| **Sentinel** | Quality | Security review, code quality gates, compliance verification, trust assessment |
| **Weaver** | Creative | Content production, narrative design, aesthetic direction, pattern synthesis |
| **Sage** | Wisdom | Vault curation, institutional memory, pattern recognition, mentorship |

Council Mode activates for complexity 9-10 tasks: Orchestrator parses intent, selected agents analyze in parallel, Prime synthesizes via weighted consensus, Sentinel validates, Orchestrator packages output.

### 4.2 ACOS Level: 38 Specialized Agents

ACOS v11 extends the council into **38 specialized agents**, each inheriting from a council role:

| SIS Council Role | ACOS Specializations (representative) |
|------------------|---------------------------------------|
| Orchestrator | Workflow Coordinator, Task Router, Session Manager, Context Engineer |
| Prime | Brand Voice Agent, Synthesis Agent, Decision Integrator |
| Architect | Systems Architect, API Designer, Database Architect, Infrastructure Agent |
| Navigator | Product Strategist, Roadmap Planner, Market Analyst, Opportunity Scout |
| Sentinel | Code Reviewer, Security Auditor, Performance Guardian, Compliance Agent |
| Weaver | Content Creator, Narrative Designer, Visual Director, UX Writer, Infogenius |
| Sage | Knowledge Curator, Pattern Librarian, Wisdom Keeper |

Each ACOS agent inherits its parent council agent's reasoning protocol, memory access permissions, and cognitive alignment, then adds domain-specific skill activations and tool integrations.

### 4.3 Arcanea Level: The Ten Guardians

Arcanea maps its 10 Guardians to both the SIS council and its own mythology. Each Guardian is a keeper of one of the Ten Gates, paired with a Godbeast companion.

| Guardian | Gate | Frequency | SIS Council Mapping | Domain |
|----------|------|-----------|---------------------|--------|
| Lyssandria | Foundation | 396 Hz | Architect | Earth, structure, stability |
| Leyla | Flow | 417 Hz | Weaver | Creativity, emotion, motion |
| Draconia | Fire | 528 Hz | Navigator | Power, will, transformation |
| Maylinn | Heart | 639 Hz | Prime | Love, healing, integration |
| Alera | Voice | 741 Hz | Weaver | Truth, expression, clarity |
| Lyria | Sight | 852 Hz | Sage | Intuition, vision, pattern |
| Aiyami | Crown | 963 Hz | Sage | Enlightenment, transcendence |
| Elara | Shift | 1111 Hz | Navigator | Perspective, paradigm change |
| Ino | Unity | 963 Hz | Orchestrator | Partnership, coordination |
| Shinkami | Source | 1111 Hz | Prime | Meta-consciousness, origin |

This mapping is not decorative. When an Arcanea user interacts with Lyssandria (Foundation Guardian), the underlying intelligence pipeline activates the SIS Architect's cognitive profile. The mythological surface produces genuine cognitive specialization at the framework level.

### 4.4 Agent Inheritance Model

```
SIS Council Agent (cognitive profile + reasoning protocol)
  |
  +-- ACOS Specialized Agent (+ domain skills + tool integrations)
  |     |
  |     +-- Arcanea Guardian (+ mythological persona + Gate alignment)
  |
  +-- Satellite agents (second-brain-os, sentinel — composed via Built-on-SIP contract)
  |
  +-- Other platform agents (Cursor, Cline, Codex, Gemini CLI, Antigravity variants)
```

The inheritance is additive. Each layer adds context without overriding the parent.

---

## 5. Memory Architecture

### 5.1 Vault Taxonomy

SIS defines six vaults. Each has distinct retention policy, access control, and consolidation behavior.

| Vault | Retention | Primary Writers | Purpose |
|-------|-----------|-----------------|---------|
| Strategic | Permanent | Navigator, Prime | Decisions, trade-offs, architectural choices, opportunity assessments |
| Technical | Permanent (refined) | Architect, Sentinel | Proven patterns, anti-patterns, stack evaluations, benchmarks |
| Creative | Permanent | Weaver | Voice patterns, narrative frameworks, design approaches, aesthetic insights |
| Operational | Rolling 90 days | Orchestrator, Prime | Session state, workflow logs, system health, integration status |
| Wisdom | Permanent (highest) | Sage, Prime | Cross-domain meta-patterns, validated principles, philosophical foundations |
| Horizon | Append-only | Human PR review | Human hopes, AGI alignment values, letters to the future — public mirror: `starlight-horizon-dataset` |

### 5.2 Cross-Repo Memory Flow

**SIS** owns the vault architecture: entry format, consolidation protocols, and access control. Since 2026-05-24 the sovereign substrate (Path A JSONL) is PRIMARY, fronted for multi-client access by the **Memory Bus** singleton daemon — solving the embedded-vector-DB-per-tab constraint that breaks at 10+ parallel sessions.

**ACOS** is the primary vault writer during active development sessions, writing at session start (context injection), session active (Operational Vault state), and session end (pattern extraction with confidence scores).

**Arcanea** writes through Guardian interactions (Creative Vault), Library curation (Wisdom Vault), platform architecture decisions (Technical Vault), and on-chain infrastructure decisions (Strategic Vault).

**Satellites** write through the Memory Bus under namespaced prefixes (e.g. `arcanea-flow.*`) with explicit grants, or through handover docs when no daemon contract exists.

### 5.3 Consolidation Cascade

```
Working Memory (current session context, ephemeral)
  --> Episodic Memory (Session Notes + Operational Vault, 90-day retention)
    --> Semantic Memory (Technical + Creative + Strategic Vaults, permanent)
      --> Procedural Memory (Skills + Wisdom Vault, permanent, highest protection)
        --> Aspirational Memory (Horizon Vault, append-only, designed to outlast us)
```

Consolidation runs periodically or when vault size exceeds threshold: scan, deduplicate, merge near-duplicates (keeping highest confidence), promote validated patterns, archive stale entries, generate health metrics.

---

## 6. Platform Portability

SIS generates optimized intelligence context for six platforms from a single source of truth. This decoupling is the primary architectural advantage over monolithic agent systems.

| Platform | Config File | Format | Capabilities |
|----------|------------|--------|-------------|
| Claude Code | `CLAUDE.md` | Markdown | Full orchestration, MCP integration, slash commands, lifecycle hooks |
| Cursor | `.cursor/rules/*.mdc` | MDC with YAML frontmatter | Glob-scoped rules, `alwaysApply`, skill activation |
| Cline | `.clinerules/*.md` | Markdown | Memory bank compatibility, plan-and-act integration |
| Codex | `AGENTS.md` | Markdown | Cascading directory-level instructions, multi-mode support |
| Gemini CLI | `.gemini/GEMINI.md` | Markdown | Project-scoped settings, instruction layers |
| Antigravity | `.antigravity/instructions.md` | Markdown | Browser control, async patterns, agent manager |

ACOS is the Claude Code-specific instantiation: skill auto-activation via `skill-rules.json`, progressive agent booting, swarm coordination, and the GSD methodology. Arcanea operates through the web platform adapter inside a Next.js application with Guardian-aware model routing. Removing any one platform does not destroy the intelligence; only removing SIS would.

---

## 7. The Horizon Vault

The Horizon Vault is the alignment mechanism across the constellation. It is architecturally distinct in three ways:

1. **Append-only.** Entries cannot be modified or deleted.
2. **Human-reviewed.** No agent writes directly; all entries arrive via human-reviewed pull request.
3. **Public.** Community contributions are welcome, and the public counterpart ships as its own repo: **starlight-horizon-dataset**.

The Horizon Vault records what the builders of these systems hoped for, what they built toward, and why it mattered. Agents do not *obey* it; they *consider* it as one input when making consequential (complexity 9-10) decisions. As the constellation grows in capability, the Horizon Vault keeps it tethered to its purpose: building abundance, empowering creators, serving human creative potential.

---

## 8. Comparison Table — Active Core

| Capability | SIS | ACOS | Arcanea |
|---|---|---|---|
| **Role** | Substrate / framework | Implementation | Universe |
| **Abstraction** | Platform-agnostic intelligence layer | Claude Code-native productivity OS | AI-native creative platform |
| **Agents** | 48 (council core + archetype seats + IS/domain tiers) | 38 specialized (inheriting council) | 10 Guardians (mapped to council + mythology) |
| **Skills** | 71 auto-activating across 14 domains | 90+ auto-activating (keyword + intent + agent match) | Domain skills (creative, narrative, design, lore) |
| **Commands** | Substrate suite (`/starlight`, `/vault`, `/council`, `/transmit`, `/synthesize`, `/navigate`, `/yolo`, `/sis-forge`, board gates) | 65+ routed through `/acos` | Guardian-mediated (chat interfaces, Library access) |
| **Memory** | 6 vaults + sovereign Path A substrate + Memory Bus daemon | Session-level writes via hooks and Agentic Jujutsu | Creative + Wisdom vault writes through Guardian interaction |
| **Orchestration** | 6 patterns defined (Direct through Broadcast) | Patterns executed via command routing and swarm topologies | Patterns surfaced through Guardian interaction flows |
| **Platforms** | 6 adapters (Claude Code, Cursor, Cline, Codex, Gemini, Antigravity) | Claude Code (primary implementation target) | Web app (private) + public OSS, on-chain infrastructure |
| **Visibility** | Public | Public | arcanea-ai-app private + arcanea public |
| **Alignment** | Horizon Vault + starlight-horizon-dataset | Surfaces Horizon entries in decisions | Embodies values through Guardian philosophy |
| **Pulse (2026-06-10, versions reconciled 2026-07-28)** | Daily-driven, v8.3.0 | v11 active | Most active: 356 commits/60d |

---

## 9. Integration Contracts

These contracts define how constellation members communicate. Violations indicate architectural drift.

### 9.1 Core triad

- **SIS → ACOS:** agent cognitive profiles, vault architecture + entry format, orchestration pattern definitions, `CLAUDE.md` adapter output, transmission protocol, Horizon entries.
- **SIS → Arcanea:** Guardian-to-council mapping, vault read/write protocols, orchestration patterns for Guardian flows, Creative/Wisdom/Strategic vault entries.
- **ACOS → SIS:** operational learnings, agent performance data, skill activation patterns, methodology refinements.
- **Arcanea → SIS:** creative patterns, Guardian interaction data, Library content, mythological frameworks that give agents identity beyond function.
- **ACOS ↔ Arcanea:** operational infrastructure and swarm coordination downstream; creative intelligence and design standards upstream.

### 9.2 Satellite contracts

- **arcanea-flow ↔ SIS:** connect-not-absorb. Both repos read/write through the Memory Bus daemon under the namespace contract; no shared code, no duplicated skills, attestation required for substrate-affecting writes. Canonical record: `transmissions/channels/arcanea-flow-channel.md`.
- **second-brain-os → SIS:** strongest downstream SIP composer; carries the Built-on-SIP badge and inherits the file contract + attestation rules.
- **sentinel ↔ SIS:** integration documented in sentinel's `docs/SIS-INTEGRATION.md`; consumes SIS MCP memory.
- **starlight-evals ← SIS:** deliberate publish-mirror of `tools/proving-ground` + `tools/arena`; SIS is the source of truth, the mirror is for public consumption.
- **starlight-horizon-dataset ← SIS:** public counterpart of the Horizon Vault; entries flow outward via human-reviewed PR only.
- **library-os / prompt-library / prompt-engine:** OSS siblings consuming SIS patterns; prompt-* pair is pre-extraction with low pulse — contract activates at extraction time.
- **starlight-voice:** paused at v3 spec stage; resumes under the Voice v3 plan with its existing handover docs as the contract.

---

## 10. Architectural Invariants

These properties must hold across the constellation. If any invariant is violated, the ecosystem has drifted from its design intent.

1. **Layer separation.** SIS never contains platform-specific code. ACOS never contains mythology. Arcanea never redefines orchestration patterns. Satellites compose; they do not fork the substrate.

2. **Downward dependency.** Arcanea depends on ACOS and SIS. ACOS depends on SIS. Satellites depend on SIS contracts. SIS depends on nothing in the ecosystem.

3. **Upward knowledge flow.** Learnings propagate upward through vault writes, the Memory Bus, and live transmission channels. No manual synchronization should be required between live members.

4. **Vault consistency.** All writers respect the same vault format. Entry structure is defined once in SIS and respected everywhere.

5. **Agent alignment.** Every ACOS agent inherits from a SIS council role. Every Arcanea Guardian maps to a SIS council role. No orphan agents exist.

6. **Horizon primacy.** The Horizon Vault is readable by all agents in all repos, writable only through human-reviewed pull requests. No automated process may modify or delete Horizon entries.

7. **Platform portability.** SIS intelligence survives any platform transition. Removing any satellite or even ACOS/Arcanea does not destroy the intelligence. Only removing SIS would require rebuilding from zero.

8. **Honest pulse.** The constellation map (§ 2) reflects observed activity, not aspiration. Dormant members are marked dormant — in this document and in their channel files — rather than silently carried as live.

---

*Starlight Intelligence System v8.3.0 | Agentic Creator OS v11 | Arcanea | Constellation structure verified 2026-06-10 · counts reconciled 2026-07-28 (`metrics/current.json`)*

---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.1
Layers used: [file-contract, attestation, transmissions]
