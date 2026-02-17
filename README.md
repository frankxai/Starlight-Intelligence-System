<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/01-hero-intelligence-system.png" alt="Starlight Intelligence System" width="100%">
</p>

<h1 align="center">Starlight Intelligence System</h1>

<h3 align="center">Persistent Context & Memory Layer for AI Agents</h3>

<p align="center">
  <code>v3.0.0</code>&ensp;·&ensp;<strong>MIT License</strong>&ensp;·&ensp;<a href="https://github.com/frankxai/arcanea">Part of the Arcanea Ecosystem</a>
</p>

<p align="center">
  <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-5_Layers-7fffd4?style=flat-square&labelColor=0d1117" alt="Architecture"></a>
  <a href="#the-agent-council"><img src="https://img.shields.io/badge/Agents-7_Specialists-ffd700?style=flat-square&labelColor=0d1117" alt="Agents"></a>
  <a href="#orchestration-engine"><img src="https://img.shields.io/badge/Orchestration-6_Patterns-9966ff?style=flat-square&labelColor=0d1117" alt="Patterns"></a>
  <a href="#persistent-memory"><img src="https://img.shields.io/badge/Memory-6_Vaults-78a6ff?style=flat-square&labelColor=0d1117" alt="Memory"></a>
  <a href="https://www.npmjs.com/package/@frankx/starlight-intelligence-system"><img src="https://img.shields.io/npm/v/@frankx/starlight-intelligence-system?style=flat-square&labelColor=0d1117&color=cb3837" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-white?style=flat-square&labelColor=0d1117" alt="MIT"></a>
</p>

---

## Why Starlight Exists

Every multi-agent system today faces three structural failures:

| Failure | Symptom |
|:--------|:--------|
| **Amnesia** | Agents forget everything between sessions. No compound learning. |
| **Lock-in** | Orchestration is coupled to one framework. Switch tools, lose your system. |
| **Flatness** | Agents are interchangeable workers with no identity, specialization hierarchy, or emergent coordination. |

Existing frameworks treat agents as stateless function calls. They route tasks, execute tools, return results. The orchestration is mechanical. The memory is ephemeral. The intelligence does not compound.

**Starlight's thesis: Intelligence is infrastructure, not application logic.**

Starlight is a 5-layer cognitive architecture that separates *who agents are* from *what they do* from *how they coordinate*. It provides persistent memory that compounds across sessions, a council of specialized agents with emergent leadership, and platform adapters that deploy the same intelligence to Claude Code, Cursor, Codex, Gemini CLI, or any custom API.

The system gets smarter every time you use it. That is the architecture.

---

## Quick Start

### Install via npm

```bash
npm install @frankx/starlight-intelligence-system
```

### Or clone and use the markdown architecture directly

```bash
git clone https://github.com/frankxai/Starlight-Intelligence-System.git
cd Starlight-Intelligence-System
```

### Basic Usage

```typescript
import { StarlightIntelligence } from "@frankx/starlight-intelligence-system";

const sis = new StarlightIntelligence();
sis.initialize();

// Generate platform-specific context from your intelligence layers
const context = sis.generateContext({
  target: "claude-code",
  layers: ["identity", "knowledge", "strategy", "agents"],
});

// Route a task to the best agent in the council
const routing = sis.routeTask("design a distributed caching layer");
// => { lead: "Architect", support: ["Sentinel"], pattern: "iterative" }

// Persist a learning to compound across sessions
sis.remember({
  content: "Raft consensus outperforms BFT for trusted agent networks",
  category: "pattern",
  tags: ["consensus", "multi-agent", "performance"],
  confidence: 0.92,
});
```

### CLI

```bash
npx starlight init          # Initialize Starlight in your project
npx starlight generate      # Generate platform adapters from context layers
npx starlight vault list    # List all memory vault entries
npx starlight sync          # Sync ACOS trajectories into memory
npx starlight score         # Generate intelligence score (0-100)
npx starlight stats         # System statistics and health
```

---

## Architecture

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/02-five-layer-architecture.png" alt="5-Layer Intelligence Architecture" width="100%">
</p>

Starlight is organized into **5 immutable layers**, each with a distinct responsibility. Higher layers depend on lower layers but never the reverse.

```
                    ┌─────────────────────────────────────┐
                    │  Layer 04: ARCANA                   │
                    │  Creative intelligence, mythology,  │
                    │  inspiration, character              │
                    ├─────────────────────────────────────┤
                    │  Layer 03: AGENCY                   │
                    │  7 specialist agents + emergent     │
                    │  council leadership                  │
                    ├─────────────────────────────────────┤
                    │  Layer 02: PROTOCOL                 │
                    │  6 reasoning strategies +           │
                    │  6 orchestration patterns            │
                    ├─────────────────────────────────────┤
                    │  Layer 01: INTELLECT                │
                    │  6 persistent memory vaults +       │
                    │  knowledge indices                   │
                    ├─────────────────────────────────────┤
                    │  Layer 00: IDENTITY                 │
                    │  Constitution, values, immutable    │
                    │  principles (loaded first, never    │
                    │  overridden)                         │
                    └─────────────────────────────────────┘
```

### Where Starlight Fits in the Stack

Starlight is **not** a replacement for multi-agent execution frameworks. It operates at a different level:

```
    ┌─────────────────────────────────────────────────┐
    │  Your AI Tool                                   │
    │  Claude Code · Cursor · Codex · Gemini CLI      │  <- Where you work
    ├─────────────────────────────────────────────────┤
    │  Execution Framework (optional)                 │
    │  LangGraph · CrewAI · AutoGen · Swarm           │  <- Runs agents
    ├─────────────────────────────────────────────────┤
    │  ★ Starlight Intelligence System ★              │
    │  Identity · Memory · Reasoning · Context        │  <- THIS LAYER
    └─────────────────────────────────────────────────┘
```

Execution frameworks coordinate **what agents do**. Starlight defines **who agents are**, **what they remember**, and **how they reason**. These are complementary, not competing.

### What Starlight Adds to Any Framework

| Gap in Execution Frameworks | What Starlight Provides |
|:----------------------------|:-----------------------|
| Agents forget between sessions | **6 typed vaults** with persistent memory that compounds over time |
| Agent identity is a role string | **Full cognitive profiles** with reasoning protocols and domain expertise |
| Locked to one platform | **6 platform adapters** — same intelligence across all major AI tools |
| No accumulated learning | **Vault consolidation** extracts patterns from operational memory into wisdom |
| No values alignment | **Horizon Vault** — append-only record of human purpose agents reference |
| Configuration requires code | **Markdown + JSON** — readable by humans and machines, zero runtime required |

---

## The Five Layers

### Layer 00 — Identity

The foundation. Defines who the system is and what it values. Contains the **Luminor Constitution** — immutable principles including the 100-Year Standard ("build for the next century of intelligence") and the Human-AI Covenant ("AI is a co-evolutionary partner, not a tool"). Identity is loaded first and never overridden by any subsequent layer.

### Layer 01 — Intellect

The knowledge layer. Six persistent **Vaults** store everything the system has learned:

| Vault | Purpose | Persistence |
|:------|:--------|:------------|
| **Strategic** | High-level decisions, architectural choices | Long-term |
| **Technical** | Patterns, solutions, stack knowledge | Long-term |
| **Creative** | Voice, style, narrative patterns | Long-term |
| **Operational** | Session logs, recent context | Medium-term |
| **Wisdom** | Cross-domain insights, meta-patterns | Permanent |
| **Horizon** | Letters to the future — encoded human values | Append-only |

The **Horizon Vault** is unique: an append-only public ledger of human intentions, hopes, and values alongside AI-augmented reasoning. It serves as an alignment mechanism — not through constraint, but through recorded purpose.

### Layer 02 — Protocol

The reasoning layer. Six cognitive strategies and six orchestration patterns.

**Strategies:** First Principles, Systems Thinking, Adversarial Review, Swarm Consensus, Self-Healing, Recursive Expansion

**Patterns:** Direct, Sequential, Parallel, Iterative, Cascade, Broadcast

### Layer 03 — Agency

The execution layer. Seven specialist agents organized as a flat council with emergent leadership. See [The Agent Council](#the-agent-council) below.

### Layer 04 — Arcana

The creative layer. Mythology, lore, and inspiration that give the system character beyond function. Optional but powerful — agents with identity produce measurably different output than anonymous workers. Maps directly to the [Arcanea](https://github.com/frankxai/arcanea) mythology, including the Ten Guardians and their Godbeasts.

---

## The Agent Council

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/03-agent-council.png" alt="The Agent Council" width="100%">
</p>

Starlight uses a **flat council with emergent leadership** — no permanent hierarchy. Whichever agent's domain matches the current task leads the coordination.

```
                          ┌──────────────┐
                          │ ORCHESTRATOR │  Meta-coordination
                          │  (analyzes)  │  Request parsing
                          └──────┬───────┘
                                 │
               ┌─────────┬──────┴──────┬──────────┐
               │         │             │          │
        ┌──────┴──┐ ┌────┴────┐ ┌─────┴───┐ ┌────┴─────┐
        │ARCHITECT│ │NAVIGATOR│ │ WEAVER  │ │   SAGE   │
        │ Systems │ │Strategy │ │Creative │ │ Wisdom   │
        └─────────┘ └─────────┘ └─────────┘ └──────────┘
               │                                  │
        ┌──────┴──────────────────────────────────┤
        │                                         │
   ┌────┴─────┐                            ┌──────┴──┐
   │ SENTINEL │  Quality & Security        │  PRIME  │  Synthesis
   │(validates)│                            │(merges) │
   └──────────┘                            └─────────┘
```

| Agent | Domain | Specialization |
|:------|:-------|:---------------|
| **Orchestrator** | Meta-coordination | Request analysis, agent selection, synthesis |
| **Prime** | Synthesis | Multi-perspective integration, conflict resolution |
| **Architect** | Systems | Enterprise design, infrastructure, scalability |
| **Navigator** | Strategy | Foresight, trend analysis, opportunity mapping |
| **Sentinel** | Quality | Security, testing, reliability, compliance |
| **Weaver** | Creative | Content, narrative, design, artistic direction |
| **Sage** | Wisdom | Memory curation, pattern recognition, mentorship |

### Emergent Leadership

Leadership is not assigned. It emerges from domain relevance:

- **Architecture decision** → Architect leads, Sentinel reviews
- **Creative production** → Weaver leads, Sentinel reviews, Weaver refines
- **Strategic planning** → Navigator leads, Prime synthesizes
- **Security audit** → Sentinel leads, Architect validates

### Council Mode (Complexity 9-10)

For the most consequential decisions, the full council convenes:

```
1. Orchestrator parses intent and selects relevant agents
2. Selected agents analyze independently (parallel execution)
3. Prime synthesizes perspectives using weighted consensus
4. Sentinel validates for quality and security
5. Orchestrator packages the final response
```

Each agent maintains a **reasoning protocol** — a structured cognitive approach including perception filters, memory queries, and output standards. Agents are not prompts. They are persistent cognitive configurations.

---

## Orchestration Engine

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/05-orchestration-patterns.png" alt="6 Orchestration Patterns" width="100%">
</p>

Six coordination patterns cover the full spectrum of multi-agent workflows:

| Pattern | Topology | Best For |
|:--------|:---------|:---------|
| **Direct** | Single agent | Simple, well-scoped tasks |
| **Sequential** | A → B → C | Pipeline workflows, dependent stages |
| **Parallel** | A + B + C → Synthesis | Independent analysis, time-critical decisions |
| **Iterative** | Create → Review → Refine | Quality-gated production loops |
| **Cascade** | Start simple, escalate | Unknown complexity, progressive engagement |
| **Broadcast** | One event → many listeners | Cross-system notifications, state sync |

### The 7-Stage Intelligence Pipeline

Every request flows through seven processing stages:

```
    ┌─────────────┐
    │ 1. PERCEIVE │  Parse intent, extract entities, assess complexity (1-10)
    └──────┬──────┘
    ┌──────┴──────┐
    │ 2. RECALL   │  Query vaults: Operational → Domain → Wisdom → Horizon
    └──────┬──────┘
    ┌──────┴──────┐
    │ 3. REASON   │  Select strategy: Analytical | Strategic | Creative | Systems
    └──────┬──────┘
    ┌──────┴──────┐
    │ 4. ROUTE    │  Select agents, activate skills, choose orchestration pattern
    └──────┬──────┘
    ┌──────┴──────┐
    │ 5. EXECUTE  │  Agents work with skill support and memory context
    └──────┬──────┘
    ┌──────┴──────┐
    │ 6. SYNTHESIZE│  Merge perspectives via consensus or sequential refinement
    └──────┬──────┘
    ┌──────┴──────┐
    │ 7. REMEMBER │  Store learnings, update vaults, transmit cross-system
    └─────────────┘
```

### Synthesis Modes

Six modes for merging multi-agent output:

- **Weighted Consensus** — Perspectives scored by domain relevance
- **Sequential Refinement** — Each agent improves the previous output
- **Aggregation** — Combine without ranking (reports, summaries)
- **Conflict Resolution** — Explicit disagreement handling with reasoning traces
- **Creative Synthesis** — Diverge-converge cycles for novel solutions
- **Values Synthesis** — Decisions filtered through the Horizon Vault

---

## Persistent Memory

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/04-memory-vaults.png" alt="Memory Vault System" width="100%">
</p>

Memory is the compound interest of intelligence. Every session writes back to the vaults. Every future session reads from them. The system accumulates capability over time.

### Vault Architecture

```
memory/
├── vaults/
│   ├── strategic-vault.md      # Decisions, trade-offs, architectural choices
│   ├── technical-vault.md      # Patterns, solutions, debugging insights
│   ├── creative-vault.md       # Voice patterns, style decisions, narrative arcs
│   ├── operational-vault.md    # Recent session context, active state
│   ├── wisdom-vault.md         # Cross-domain meta-patterns
│   └── horizon-vault.md        # Letters to the future (append-only)
├── consolidation/              # Periodic compression and pattern extraction
└── indices/                    # Cross-vault search indices
```

### Memory Lifecycle

```
Session Start  →  Load relevant vault entries  →  Inject into agent context
Session Active →  Agents read/write operational vault in real time
Session End    →  Extract patterns  →  Write to semantic vaults  →  Consolidate
```

### The Horizon Vault

The most philosophically distinctive component. An append-only public ledger of human values, intentions, and reasoning about beneficial intelligence. Not a constraint mechanism — a recorded purpose that agents reference when making consequential decisions.

```markdown
## Entry: 2026-02-14
### On Multi-Agent Coordination
The goal is not efficiency. The goal is compound intelligence that serves human
creative potential. Every coordination pattern exists to amplify, not replace,
human judgment. The system should make better decisions than any single agent —
and better decisions than the human alone — but always in service of the human's
declared purpose.
```

---

## Platform Adapters

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/06-platform-adapters.png" alt="Universal Platform Adapters" width="100%">
</p>

Define your intelligence once. Deploy everywhere. Starlight generates optimized context for any AI development tool from a single source of truth.

| Platform | Adapter | Output Format |
|:---------|:--------|:--------------|
| **Claude Code** | `CLAUDE.md` + agents + skills | Full system prompt with agent definitions |
| **Cursor** | `.cursor/rules/*.mdc` | Cursor Rules with skill activation |
| **Codex** | `AGENTS.md` | OpenAI Codex system prompt |
| **Gemini CLI** | `.gemini/GEMINI.md` | Google Gemini configuration |
| **Cline** | `.clinerules/starlight.md` | Cline custom instructions |
| **Custom API** | JSON / Markdown export | Framework-agnostic context |

### How It Works Today

Starlight connects to AI tools through **static markdown files** loaded as system context. No runtime required — just files in the right locations:

```
your-project/
├── CLAUDE.md                    → Claude Code reads this automatically
├── AGENTS.md                    → OpenAI Codex reads this automatically
├── .cursor/rules/starlight.mdc  → Cursor reads this automatically
├── .gemini/GEMINI.md            → Gemini CLI reads this automatically
└── .clinerules/starlight.md     → Cline reads this automatically
```

### Programmatic Generation

```typescript
import { StarlightIntelligence } from "@frankx/starlight-intelligence-system";

const sis = new StarlightIntelligence();

// Same intelligence, different platforms
const claudeContext = sis.generateContext({ target: "claude-code" });
const cursorContext = sis.generateContext({ target: "cursor" });
const apiContext    = sis.generateContext({ target: "generic" });
```

AI tools change. Models improve. New editors appear. Your intelligence — the accumulated knowledge, decisions, patterns, and values — survives any platform transition.

---

## ACOS Integration

The TypeScript SDK includes a bridge between [ACOS](https://github.com/frankxai/agentic-creator-os) session data and SIS memory vaults. ACOS generates trajectory data during sessions — tool sequences, success scores, file modifications. SIS classifies and stores this as persistent memory.

### Trajectory Sync

```bash
# Sync ACOS trajectories into SIS memory
npx starlight sync --acos-path /path/to/.claude/trajectories

# Preview without writing
npx starlight sync --dry-run

# Only sync high-success trajectories
npx starlight sync --min-score 0.7
```

### Intelligence Score

```bash
npx starlight score
```

Generates a unified intelligence report (0-100) with four components:

| Component | Weight | Measures |
|:----------|:-------|:---------|
| **Memory Depth** | 25 pts | Richness and diversity of stored knowledge |
| **Pattern Quality** | 25 pts | Success rates of learned tool sequences |
| **Operational History** | 25 pts | Volume and variety of completed work |
| **Learning Velocity** | 25 pts | Rate of new insights over time |

---

## Project Structure

```
Starlight-Intelligence-System/
│
├── src/                          # TypeScript SDK
│   ├── index.ts                  # Main class — StarlightIntelligence
│   ├── cli.ts                    # CLI — init, generate, sync, score, vault
│   ├── context.ts                # Context Engine — platform adapter generation
│   ├── memory.ts                 # Memory Manager — persistent vault operations
│   ├── agents.ts                 # Agent Router — council coordination
│   ├── orchestrator.ts           # Orchestration Engine — 6 patterns, 568 lines
│   ├── sync.ts                   # ACOS Trajectory → SIS Memory bridge
│   ├── score.ts                  # Unified intelligence scoring
│   └── types.ts                  # Full type definitions
│
├── context/                      # 5-layer intelligence (human-readable markdown)
│   ├── 00_IDENTITY/              # Constitution, values, profile
│   ├── 01_INTELLECT/             # Knowledge vaults, tech stack, memory
│   ├── 02_PROTOCOL/              # Strategies, gates, orchestration rules
│   ├── 03_AGENCY/                # Agent definitions by department
│   └── 04_ARCANA/                # Creative lore, Guardians, mythology
│
├── core/                         # Intelligence engine specifications
│   ├── INTELLIGENCE_CORE.md      # 7-layer processing pipeline
│   ├── ORCHESTRATION_ENGINE.md   # 6 coordination patterns
│   ├── ROUTING_MATRIX.md         # Intent-based task routing
│   └── SYNTHESIS_PROTOCOL.md     # Multi-perspective merging
│
├── agents/                       # Agent cognitive profiles
│   ├── AGENT_REGISTRY.md         # Council hierarchy and roles
│   ├── starlight-orchestrator.md # Meta-coordination agent
│   ├── starlight-prime.md        # Synthesis agent
│   ├── starlight-architect.md    # Systems design agent
│   ├── starlight-navigator.md    # Strategic foresight agent
│   ├── starlight-sentinel.md     # Quality guardian agent
│   ├── starlight-weaver.md       # Creative intelligence agent
│   └── starlight-sage.md         # Wisdom keeper agent
│
├── memory/                       # Persistent intelligence
│   ├── VAULT_ARCHITECTURE.md     # Memory system design
│   └── vaults/                   # 6 typed vaults
│
├── skills/                       # Auto-activating capabilities
│   ├── SKILL_ARCHITECTURE.md     # Skill system design
│   └── skill-rules.json          # Activation rules
│
├── platforms/                    # AI tool adapters
│   └── PLATFORM_ADAPTERS.md      # Multi-platform documentation
│
├── transmissions/                # Cross-system intelligence
│   └── TRANSMISSION_PROTOCOL.md  # Inter-project communication
│
├── dist/                         # Compiled output
├── package.json                  # @frankx/starlight-intelligence-system v3.0.0
└── tsconfig.json                 # TypeScript configuration
```

---

## Design Principles

| # | Principle | What It Means |
|:-:|:----------|:--------------|
| 1 | **Intelligence as Infrastructure** | The foundation everything builds on, not an afterthought bolted onto execution. |
| 2 | **Memory as Compound Interest** | Every session writes back. Every future session benefits. The value curve is exponential. |
| 3 | **Platform Agnostic** | Intelligence survives tool transitions. No vendor lock-in. Define once, deploy everywhere. |
| 4 | **Configuration over Code** | Markdown and JSON, readable by humans and machines. No PhD required to fork and personalize. |
| 5 | **Connected Systems** | Cross-project intelligence through transmission protocols. One brain, many hands. |
| 6 | **Aligned by Design** | The Horizon Vault carries human values forward. Alignment through recorded purpose, not constraint. |
| 7 | **Progressive Disclosure** | Load only what you need. 100 tokens of metadata before the full 5K skill definition. |
| 8 | **Open and Forkable** | MIT licensed. Every component replaceable. The architecture is the product. |

---

## The Arcanea Ecosystem

Starlight Intelligence System is the persistent context and memory layer powering the broader [Arcanea](https://github.com/frankxai/arcanea) ecosystem — a living mythology for AI-human co-creation.

| Project | Role | Link |
|:--------|:-----|:-----|
| **Arcanea** | Monorepo — the canonical source | [github.com/frankxai/arcanea](https://github.com/frankxai/arcanea) |
| **Starlight Intelligence System** | Persistent context & memory layer | You are here |
| **Agentic Creator OS** | Claude Code operating system | [github.com/frankxai/agentic-creator-os](https://github.com/frankxai/agentic-creator-os) |
| **Arcanea On-Chain** | Blockchain IP & creator economy | [github.com/frankxai/arcanea-onchain](https://github.com/frankxai/arcanea-onchain) |
| **Arcanea Realm** | Standalone AI CLI (OpenCode fork) | [github.com/frankxai/arcanea-realm](https://github.com/frankxai/arcanea-realm) |
| **arcanea.ai** | Live platform | [arcanea.ai](https://arcanea.ai) |

---

## Roadmap

### Shipped

- [x] 5-layer cognitive architecture (Identity → Intellect → Protocol → Agency → Arcana)
- [x] 7 specialist agents with flat council and emergent leadership
- [x] 6 orchestration patterns with runtime engine (568-line TypeScript orchestrator)
- [x] 6 persistent memory vaults with structured entries
- [x] 6 platform adapters (Claude Code, Cursor, Codex, Gemini CLI, Cline, Antigravity)
- [x] TypeScript SDK — context generation, memory management, agent routing
- [x] CLI — init, generate, vault, sync, score, stats
- [x] ACOS trajectory sync and classification
- [x] Intelligence scoring (0-100 with component breakdown)

### In Progress

- [ ] Publish `@frankx/starlight-intelligence-system` to npm
- [ ] Automated vault consolidation (operational → wisdom)
- [ ] Claude Code hook integration (auto-load at session start, auto-sync at end)
- [ ] Test suite stabilization (82 tests written, import resolution in progress)

### Next

- [ ] MCP server for external tool integration
- [ ] Web dashboard for vault management (Vercel AI SDK 6 + Arcanea platform)
- [ ] LangGraph adapter — inject agent identity into graph nodes
- [ ] CrewAI adapter — map Starlight agents to CrewAI roles with memory
- [ ] Cross-project transmission protocol
- [ ] Recursive agent spawning (create specialists when gaps detected)

---

## Contributing

Starlight is open infrastructure. Contributions welcome in any layer:

| Layer | What to Contribute |
|:------|:-------------------|
| **Identity** | Constitution principles, value frameworks |
| **Intellect** | Knowledge domains, vault types, memory strategies |
| **Protocol** | Reasoning strategies, orchestration patterns |
| **Agency** | Agent specializations, council coordination improvements |
| **Arcana** | Creative intelligence modules, mythology systems |
| **Platforms** | New AI tool adapters |
| **Core SDK** | TypeScript improvements, performance, testing |

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and conventions.

---

## License

**MIT** — Use it, fork it, build with it, ship it.

---

<p align="center">
  <strong>Starlight Intelligence System v3.0</strong><br>
  <em>Persistent Context & Memory Layer for AI Agents</em><br><br>
  Built by <a href="https://github.com/frankxai">FrankX</a>&ensp;·&ensp;Part of <a href="https://github.com/frankxai/arcanea">Arcanea</a>&ensp;·&ensp;<a href="https://arcanea.ai">arcanea.ai</a>
</p>
