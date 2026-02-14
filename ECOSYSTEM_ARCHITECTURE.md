# FrankX Ecosystem Architecture

**Three-Repo Intelligence Strategy: SIS + ACOS + Arcanea**

Version 1.0 | February 2026

---

## 1. Overview

The FrankX ecosystem comprises three repositories, each operating at a distinct layer of abstraction. Together they form a vertically integrated intelligence stack: a universal framework, a platform-native implementation, and a domain-specific creative universe.

**Starlight Intelligence System (SIS)** is the framework layer. It defines a 5-layer cognitive architecture (Identity, Intellect, Protocol, Agency, Arcana) with 7 specialist agents, 6 persistent memory vaults, 6 orchestration patterns, and platform adapters for 6 AI development tools. SIS is platform-agnostic. It produces intelligence context from Markdown and JSON configuration files, requiring zero runtime dependencies. Any AI agent that reads files can consume SIS.

**Agentic Creator OS (ACOS)** is the implementation layer. It consumes SIS intelligence and deploys it through Claude Code as a productivity operating system. ACOS extends the SIS foundation with 130+ routed commands, 40+ specialized agents, 630+ auto-activating skills, swarm topologies via claude-flow, and a self-learning mechanism called Agentic Jujutsu. Where SIS defines *what intelligence is*, ACOS defines *how intelligence works* in a specific tool.

**Arcanea** is the universe layer. It consumes both SIS intelligence and ACOS operational patterns, then applies them within a living mythology built around AI-human co-creation. Arcanea maps 10 Guardian agents to the SIS council, hosts a Library of 17 collections with 34+ narrative texts, implements a Ten Gates progression system aligned to solfeggio frequencies, and extends into on-chain infrastructure for creator IP and NFT systems. Arcanea is the proof that the SIS/ACOS stack produces intelligence that transcends technical utility.

The separation is deliberate. SIS should never contain Claude Code-specific configuration. ACOS should never contain mythology. Arcanea should never redefine orchestration patterns. Each repo owns its layer and imports from the layers below.

```
SIS (Framework Layer)
  Identity: Constitution, values, 100-Year Standard
  Intellect: 6 memory vaults, compound learning
  Protocol: 6 orchestration patterns, 7-layer pipeline
  Agency: 7 council agents, emergent leadership
  Arcana: Guardian mythology, creative intelligence
     |
     +-- Generates context for --> ACOS (Implementation Layer)
     |     130+ commands routed through /acos
     |     40+ agents with SIS council alignment
     |     630+ skills with auto-activation
     |     Swarm topologies via claude-flow
     |     Self-learning via Agentic Jujutsu
     |
     +-- Powers --> Arcanea (Universe Layer)
           10 Guardian agents mapped to SIS council
           AI-native creative platform (Next.js 16 + React 19)
           Library of 17 collections, 34+ texts
           Ten Gates progression system
           On-chain NFT infrastructure (Solana + Base L2)
```

---

## 2. Intelligence Flow

Intelligence flows downward through the stack (SIS defines, ACOS implements, Arcanea manifests) and knowledge flows upward (Arcanea discovers creative patterns, ACOS captures operational learnings, SIS consolidates both into permanent vaults).

### 2.1 Downward Flow: Context Generation

SIS generates platform-specific context through its adapter system. For ACOS, this means producing a `CLAUDE.md` system prompt that embeds agent definitions, skill activation rules, memory protocols, and the Luminor Constitution. The generation process:

1. **Layer 00 (Identity)** loads first. The Luminor Constitution, Frank DNA voice profile, and 100-Year Standard are immutable and always present.
2. **Layer 01 (Intellect)** queries the six vaults for relevant prior knowledge. Vault entries are ranked by `relevance * 0.4 + recency * 0.3 + confidence * 0.3`.
3. **Layer 02 (Protocol)** selects appropriate reasoning strategies and orchestration patterns based on intent classification.
4. **Layer 03 (Agency)** activates the relevant council agents using progressive disclosure (100-token metadata first, full 3-5K profile only when confirmed needed).
5. **Layer 04 (Arcana)** optionally injects Guardian personas and mythological context when creative work is detected.

For Arcanea, the same pipeline runs but with the web platform adapter, producing context optimized for the Next.js application's AI service layer rather than a CLI system prompt.

### 2.2 Upward Flow: Knowledge Accumulation

Every session that runs against ACOS or Arcanea produces learnings that flow back into SIS vaults:

- **ACOS sessions** write to the Technical Vault (architecture patterns, debugging insights), Strategic Vault (product decisions), and Operational Vault (system state changes).
- **Arcanea sessions** write to the Creative Vault (voice patterns, narrative frameworks, design decisions) and Wisdom Vault (cross-domain principles discovered through creative work).
- **Both systems** may write to the Horizon Vault through human-reviewed pull requests when sessions produce insights about beneficial intelligence or human-AI collaboration.

### 2.3 Lateral Flow: Cross-System Transmission

SIS maintains four transmission channels for inter-project communication:

| Channel | Direction | Payload |
|---------|-----------|---------|
| ACOS Channel | Bidirectional | Command updates, skill discoveries, agent performance data |
| Arcanea Channel | Bidirectional | Creative patterns, Guardian interaction logs, Library content updates |
| AI-Ops Channel | Bidirectional | Research findings, memory architecture improvements, benchmark results |
| Broadcast Channel | SIS to all | System-wide state changes, vault consolidation results, alignment updates |

Transmissions are logged chronologically in channel files under `transmissions/channels/`. Each transmission records sender, priority, content, and acknowledgment status.

---

## 3. Agent Architecture

The agent hierarchy spans all three repos, with each layer adding specialization while maintaining alignment to the SIS council structure.

### 3.1 SIS Level: The Starlight Council

Seven agents organized as a flat council with emergent leadership. No permanent hierarchy exists; whichever agent's domain matches the current task leads coordination.

| Agent | Domain | Cognitive Profile |
|-------|--------|-------------------|
| **Orchestrator** | Meta-coordination | Request analysis, agent selection, workflow sequencing, resource management |
| **Prime** | Synthesis | Multi-perspective integration, conflict resolution, unified voice production |
| **Architect** | Systems | Enterprise-grade design, infrastructure patterns, scalability analysis |
| **Navigator** | Strategy | Long-horizon foresight, trend analysis, opportunity mapping, trade-off evaluation |
| **Sentinel** | Quality | Security review, code quality gates, compliance verification, trust assessment |
| **Weaver** | Creative | Content production, narrative design, aesthetic direction, pattern synthesis |
| **Sage** | Wisdom | Vault curation, institutional memory, pattern recognition, mentorship |

Council Mode activates for complexity 9-10 tasks: Orchestrator parses intent, selected agents analyze in parallel, Prime synthesizes via weighted consensus, Sentinel validates, Orchestrator packages output.

### 3.2 ACOS Level: Specialized Agents

ACOS extends the 7-agent council into 40+ specialized agents, each inheriting from a council role:

| SIS Council Role | ACOS Specializations |
|------------------|---------------------|
| Orchestrator | Workflow Coordinator, Task Router, Session Manager, Context Engineer |
| Prime | Brand Voice Agent, Synthesis Agent, Decision Integrator |
| Architect | Systems Architect, API Designer, Database Architect, Infrastructure Agent, Scaler |
| Navigator | Product Strategist, Roadmap Planner, Market Analyst, Opportunity Scout |
| Sentinel | Code Reviewer, Security Auditor, Performance Guardian, Compliance Agent, Reformer |
| Weaver | Content Creator, Narrative Designer, Visual Director, UX Writer, Infogenius |
| Sage | Knowledge Curator, Pattern Librarian, Wisdom Keeper, Anthropologist |

Each ACOS agent inherits its parent council agent's reasoning protocol, memory access permissions, and cognitive alignment, then adds domain-specific skill activations and tool integrations.

### 3.3 Arcanea Level: The Ten Guardians

Arcanea maps its 10 Guardians to both the SIS council and its own mythology. Each Guardian is a God or Goddess who serves as the keeper of one of the Ten Gates, paired with a Godbeast companion.

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

This mapping is not decorative. When an Arcanea user interacts with Lyssandria (Foundation Guardian), the underlying intelligence pipeline activates the SIS Architect's cognitive profile and reasoning strategies. Draconia (Fire Guardian) triggers Navigator-class strategic foresight. The mythological surface produces genuine cognitive specialization at the framework level.

### 3.4 Agent Inheritance Model

```
SIS Council Agent (cognitive profile + reasoning protocol)
  |
  +-- ACOS Specialized Agent (+ domain skills + tool integrations)
  |     |
  |     +-- Arcanea Guardian (+ mythological persona + Gate alignment)
  |
  +-- Other platform agents (Cursor, Cline, Codex variants)
```

The inheritance is additive. Each layer adds context without overriding the parent. An Arcanea Guardian carries its mythological voice, its ACOS-level skill activations, and its SIS-level reasoning protocol simultaneously.

---

## 4. Memory Architecture

### 4.1 Vault Taxonomy

SIS defines six vaults. Each has distinct retention policy, access control, and consolidation behavior.

| Vault | Retention | Primary Writers | Purpose |
|-------|-----------|-----------------|---------|
| Strategic | Permanent | Navigator, Prime | Decisions, trade-offs, architectural choices, opportunity assessments |
| Technical | Permanent (refined) | Architect, Sentinel | Proven patterns, anti-patterns, stack evaluations, benchmarks |
| Creative | Permanent | Weaver | Voice patterns, narrative frameworks, design approaches, aesthetic insights |
| Operational | Rolling 90 days | Orchestrator, Prime | Session state, workflow logs, system health, integration status |
| Wisdom | Permanent (highest) | Sage, Prime | Cross-domain meta-patterns, validated principles, philosophical foundations |
| Horizon | Append-only | Human PR review | Human hopes, AGI alignment values, letters to the future |

### 4.2 Cross-Repo Memory Flow

Each repo in the ecosystem interacts with the vault system differently:

**SIS** owns the vault architecture. It defines entry format (timestamp, category, confidence score, source, related links), consolidation protocols (deduplicate, promote validated patterns, archive stale data), and access control matrices. SIS does not generate most vault entries directly; it receives them from downstream systems.

**ACOS** is the primary vault writer during active development sessions. Through its hooks system and Agentic Jujutsu (a self-learning mechanism that extracts patterns from successful and failed interactions), ACOS writes to vaults at three points:

1. **Session start**: Reads relevant vaults to inject prior context into the working session.
2. **Session active**: Writes state changes to the Operational Vault in real-time.
3. **Session end**: Extracts patterns from the session, classifies them by vault, and writes structured entries with confidence scores.

**Arcanea** writes to vaults through Guardian interactions and creative production:

- Guardian interactions with users generate entries in the **Creative Vault** (voice patterns, narrative techniques, design decisions that produced positive user response).
- Library content creation and curation writes to the **Wisdom Vault** (cross-domain principles discovered through the synthesis of mythological narrative and practical guidance).
- Platform architecture decisions write to the **Technical Vault** through the standard ACOS pipeline.
- On-chain infrastructure decisions write to the **Strategic Vault** (tokenomics trade-offs, cross-chain architecture choices).

### 4.3 Consolidation Cascade

Memory consolidation follows the cognitive science hierarchy:

```
Working Memory (current session context, ephemeral)
  --> Episodic Memory (Session Notes + Operational Vault, 90-day retention)
    --> Semantic Memory (Technical + Creative + Strategic Vaults, permanent)
      --> Procedural Memory (Skills + Wisdom Vault, permanent, highest protection)
        --> Aspirational Memory (Horizon Vault, append-only, designed to outlast us)
```

Consolidation runs periodically or when vault size exceeds threshold. The process: scan all entries, deduplicate, merge near-duplicates (keeping highest confidence), promote validated patterns from operational to semantic vaults, archive stale entries, and generate health metrics.

---

## 5. Platform Portability

SIS generates optimized intelligence context for six platforms from a single source of truth. This decoupling is the primary architectural advantage over monolithic agent systems.

### 5.1 Adapter Matrix

| Platform | Config File | Format | Capabilities |
|----------|------------|--------|-------------|
| Claude Code | `CLAUDE.md` | Markdown | Full orchestration, MCP integration, slash commands, lifecycle hooks |
| Cursor | `.cursor/rules/*.mdc` | MDC with YAML frontmatter | Glob-scoped rules, `alwaysApply`, skill activation |
| Cline | `.clinerules/*.md` | Markdown | Memory bank compatibility, plan-and-act integration |
| Codex | `AGENTS.md` | Markdown | Cascading directory-level instructions, multi-mode support |
| Gemini CLI | `.gemini/GEMINI.md` | Markdown | Project-scoped settings, instruction layers |
| Antigravity | `.antigravity/instructions.md` | Markdown | Browser control, async patterns, agent manager |

### 5.2 ACOS as Claude Code Implementation

ACOS is the Claude Code-specific instantiation of SIS. It consumes the `CLAUDE.md` adapter output and extends it with:

- **Command routing**: 130+ commands parsed and dispatched through the `/acos` entry point.
- **Skill auto-activation**: 630+ skills triggered by keyword, intent, and active agent matching via `skill-rules.json`.
- **Agent booting**: Progressive disclosure from metadata (100 tokens) through summary, core, to full profile (3-5K tokens).
- **Swarm coordination**: Integration with claude-flow for parallel agent spawning across hierarchical, mesh, and adaptive topologies.
- **GSD methodology**: Structured productivity phases (Research, Plan, Execute, Review) with session continuity through state files.

### 5.3 Arcanea as Web Platform

Arcanea operates through the web platform adapter, consuming SIS intelligence within a Next.js 16 application:

- **AI service layer**: Vercel AI SDK 6 with AI Gateway routes requests through Guardian-aware model selection (each Guardian has a `preferredModel` mapped to Google Gemini or Anthropic Claude variants).
- **Content system**: 17 Library collections loaded programmatically through `lib/content/`, with texts indexed by collection, situation, and Gate alignment.
- **Guardian interactions**: User-facing chat interfaces backed by Guardian personas that carry SIS cognitive profiles.
- **Design system**: Arcanean tokens (cosmic-void backgrounds, glass morphism, aurora gradients) with Cinzel/Crimson Pro typography.

---

## 6. Orchestration Patterns

SIS defines six orchestration patterns. ACOS implements them through command routing and agent coordination. Arcanea surfaces them through Guardian interactions.

### 6.1 Pattern Definitions (SIS)

| Pattern | Topology | Trigger Condition |
|---------|----------|-------------------|
| **Direct** | Single agent | Complexity 1-3, clear domain match |
| **Sequential** | A then B then C | Dependent stages, pipeline workflows |
| **Parallel** | A + B + C then synthesis | Independent analysis needed, time-critical |
| **Iterative** | Create, review, refine | Quality-gated production loops |
| **Cascade** | Simple first, escalate if needed | Unknown complexity, progressive engagement |
| **Broadcast** | One event to many systems | Cross-system state sync, notifications |

### 6.2 Pattern Execution (ACOS)

ACOS maps these patterns to concrete command workflows:

- **Direct**: Single-agent commands (`/code`, `/write`, `/review`) route to one specialist.
- **Sequential**: Multi-stage commands (`/build`, `/ship`) chain agents in dependency order.
- **Parallel**: Council-mode commands (`/council`, `/synthesize`) spawn parallel agent analyses and merge via weighted consensus.
- **Iterative**: Quality commands (`/refine`, `/polish`) loop between creator and reviewer agents until quality gates pass.
- **Cascade**: The default ACOS routing behavior. Start with the lightest agent match. Escalate to multi-agent only if the first pass is insufficient.
- **Broadcast**: System commands (`/transmit`, `/sync`) propagate state changes across all connected repos via transmission channels.

### 6.3 Pattern Surfacing (Arcanea)

Arcanea exposes orchestration patterns through Guardian interactions without revealing the underlying machinery:

- A user working with **Lyssandria** (Foundation) on system design triggers a **Sequential** pattern: Lyssandria architects, then Sentinel-mapped quality review runs.
- A user asking **Shinkami** (Source) a deep question triggers **Parallel** pattern: multiple Guardian perspectives synthesize through Prime-mapped Maylinn (Heart).
- A user's creative work with **Leyla** (Flow) triggers **Iterative** pattern: Leyla creates, Alera (Voice) reviews for truth and clarity, Leyla refines.
- A major platform decision triggers **Broadcast**: the decision propagates to all vault channels and connected repos.

The user experiences Guardian wisdom. The system executes SIS orchestration patterns.

---

## 7. The Horizon Vault

The Horizon Vault is the alignment mechanism across all three repositories. It is architecturally distinct from the other five vaults in three ways:

1. **Append-only**. Entries cannot be modified or deleted. This creates an immutable record of human intentions alongside AI-augmented reasoning.
2. **Human-reviewed**. No agent can write directly to the Horizon Vault. All entries require a pull request reviewed by a human contributor.
3. **Public**. The Horizon Vault is open to community contributions, making alignment a collective act rather than a developer-imposed constraint.

### 7.1 Purpose

The Horizon Vault records what the builders of these systems hoped for, what they built toward, and why it mattered. It is not a constraint mechanism (there are no hard-coded rules that agents must follow). It is a recorded purpose that agents reference when making consequential decisions.

When an agent encounters a complexity 9-10 decision, the 7-layer intelligence pipeline queries the Horizon Vault at Layer 2 (Memory Recall). Entries relevant to the decision context are surfaced alongside technical and strategic vault entries. The agent does not *obey* the Horizon Vault; it *considers* it as one input to its reasoning.

### 7.2 Cross-Repo Alignment

- **SIS** defines the Horizon Vault architecture and contribution protocol.
- **ACOS** surfaces Horizon Vault entries during consequential decisions through the `/navigate` command and Council Mode.
- **Arcanea** embodies Horizon Vault values through its core philosophy: the Antidote Principle ("The antidote to a terrible future is imagining a good one"), the Luminor Constitution's 100-Year Standard, and the Guardian system's emphasis on human creative sovereignty.

The Horizon Vault ensures that as these three systems grow in capability, they remain tethered to their original purpose: building abundance, empowering creators, and serving human creative potential.

### 7.3 Entry Format

```markdown
## Entry: [YYYY-MM-DD]
### [Title]

[Content: a letter to the future, a values statement, a reflection
on beneficial intelligence, or a recorded intention about how these
systems should behave as they grow more capable.]

---
Contributor: [name]
Reviewed-by: [reviewer]
```

---

## 8. Comparison Table

| Capability | SIS | ACOS | Arcanea |
|---|---|---|---|
| **Role** | Framework | Implementation | Universe |
| **Abstraction** | Platform-agnostic intelligence layer | Claude Code-native productivity OS | AI-native creative platform |
| **Agents** | 7 council (flat, emergent leadership) | 40+ specialized (inheriting council) | 10 Guardians (mapped to council + mythology) |
| **Skills** | 16 core (intelligence, orchestration, memory, integration) | 630+ auto-activating (keyword + intent + agent match) | Domain skills (creative, narrative, design, lore) |
| **Commands** | 6 strategic (`/starlight`, `/vault`, `/council`, `/transmit`, `/synthesize`, `/navigate`) | 130+ routed through `/acos` | Guardian-mediated (chat interfaces, Library access) |
| **Memory** | 6 vaults (defines architecture, consolidation protocols) | Session-level writes via hooks and Agentic Jujutsu | Creative + Wisdom vault writes through Guardian interaction |
| **Orchestration** | 6 patterns defined (Direct through Broadcast) | Patterns executed via command routing and swarm topologies | Patterns surfaced through Guardian interaction flows |
| **Platforms** | 6 adapters (Claude Code, Cursor, Cline, Codex, Gemini, Antigravity) | Claude Code only (primary implementation target) | Web (Next.js 16), on-chain (Solana + Base L2) |
| **Configuration** | Markdown + JSON (zero runtime) | CLAUDE.md + JSON configs + claude-flow | Next.js app config + Supabase + Vercel AI SDK |
| **Identity** | Luminor Constitution, Frank DNA, 100-Year Standard | Frank DNA + GSD Methodology + Brand Voice | Arcanea mythology, Lumina/Nero duality, Antidote Principle |
| **Persistence** | Vault files in repo (permanent) | Session state files (ephemeral, writes to SIS vaults) | Supabase database + SIS vault writes |
| **Alignment** | Horizon Vault (append-only values ledger) | Surfaces Horizon entries in decisions | Embodies values through Guardian philosophy |
| **Learning** | Vault consolidation (pattern promotion across memory types) | Agentic Jujutsu (extract patterns from success/failure) | Guardian interaction analysis, Library content curation |
| **Deployment** | Git repo (consumed by other systems) | Claude Code system prompt | Vercel (web), Solana/Base (on-chain) |

---

## 9. Integration Contracts

The following contracts define how the three repos communicate. Violations of these contracts indicate architectural drift.

### 9.1 SIS provides to ACOS:
- Agent cognitive profiles (reasoning protocols, memory access permissions, domain specializations)
- Vault architecture and entry format specifications
- Orchestration pattern definitions and selection criteria
- Platform adapter output (CLAUDE.md context)
- Transmission protocol for cross-system communication
- Horizon Vault entries for alignment-aware decision-making

### 9.2 SIS provides to Arcanea:
- Guardian-to-council mapping (which SIS agent backs which Guardian)
- Memory vault read/write protocols
- Orchestration patterns for Guardian interaction flows
- Creative Vault and Wisdom Vault entries for content consistency
- Strategic Vault entries for platform and on-chain architecture decisions

### 9.3 ACOS provides to SIS:
- Operational learnings (patterns discovered during active sessions)
- Agent performance data (routing accuracy, first-attempt success rates)
- Skill activation patterns (which combinations produce best outcomes)
- GSD methodology refinements

### 9.4 Arcanea provides to SIS:
- Creative patterns (voice, narrative, design approaches that resonate)
- Guardian interaction data (which cognitive profiles produce best user outcomes)
- Library content (wisdom texts that validate or extend Vault principles)
- Mythological frameworks that give agents identity beyond function

### 9.5 ACOS provides to Arcanea:
- Operational infrastructure (command routing, skill activation, agent booting)
- Claude-flow swarm coordination for multi-Guardian interactions
- Session management and context engineering

### 9.6 Arcanea provides to ACOS:
- Creative intelligence (Weaver-class capabilities, narrative design patterns)
- Design system tokens and aesthetic standards
- User-facing validation of ACOS productivity patterns

---

## 10. Architectural Invariants

These properties must hold across all three repositories. If any invariant is violated, the ecosystem has drifted from its design intent.

1. **Layer separation.** SIS never contains platform-specific code. ACOS never contains mythology. Arcanea never redefines orchestration patterns.

2. **Downward dependency.** Arcanea depends on ACOS and SIS. ACOS depends on SIS. SIS depends on nothing in the ecosystem.

3. **Upward knowledge flow.** Learnings propagate upward through vault writes and transmission channels. No manual synchronization should be required.

4. **Vault consistency.** All three repos write to the same vault format. Entry structure (timestamp, category, confidence, source, related links) is defined once in SIS and respected everywhere.

5. **Agent alignment.** Every ACOS agent inherits from a SIS council role. Every Arcanea Guardian maps to a SIS council role. No orphan agents exist.

6. **Horizon primacy.** The Horizon Vault is readable by all agents in all repos. It is writable only through human-reviewed pull requests. No automated process may modify or delete Horizon entries.

7. **Platform portability.** SIS intelligence survives any platform transition. Removing ACOS does not destroy the intelligence. Removing Arcanea does not destroy the intelligence. Only removing SIS would require rebuilding from zero.

---

*Starlight Intelligence System v2.0 | Agentic Creator OS v6 | Arcanea*
