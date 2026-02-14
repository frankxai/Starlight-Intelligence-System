<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/01-hero-intelligence-system.png" alt="Starlight Intelligence System" width="100%">
</p>

<p align="center">
  <strong>Universal intelligence layer with ACOS integration</strong>
</p>

<p align="center">
  <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-5_Layer_Intelligence-7fffd4?style=flat-square&labelColor=0d1117" alt="Architecture"></a>
  <a href="#agents"><img src="https://img.shields.io/badge/Agents-8_Specialist_Council-ffd700?style=flat-square&labelColor=0d1117" alt="Agents"></a>
  <a href="#orchestration"><img src="https://img.shields.io/badge/Patterns-6_Orchestration_Modes-9966ff?style=flat-square&labelColor=0d1117" alt="Patterns"></a>
  <a href="#memory"><img src="https://img.shields.io/badge/Memory-5_Category_Vaults-78a6ff?style=flat-square&labelColor=0d1117" alt="Memory"></a>
  <a href="#acos-integration"><img src="https://img.shields.io/badge/ACOS-v10_Trajectory_Sync-ff6b6b?style=flat-square&labelColor=0d1117" alt="ACOS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-white?style=flat-square&labelColor=0d1117" alt="MIT"></a>
</p>

---

## The Problem

Every multi-agent system today faces the same three failures:

1. **Amnesia** — Agents forget everything between sessions. No compound learning.
2. **Lock-in** — Orchestration is coupled to one framework. Switch tools, lose your system.
3. **Flatness** — Agents are interchangeable workers with no identity, no specialization hierarchy, no emergent coordination.

Existing frameworks treat agents as stateless function calls. They route tasks, execute tools, return results. The orchestration is mechanical. The memory is ephemeral. The intelligence doesn't compound.

## The Starlight Thesis

**Intelligence is infrastructure, not application logic.**

Starlight is a 5-layer cognitive architecture that separates *who you are* from *what you do* from *how you coordinate*. It provides persistent memory that compounds across sessions, a council of specialized agents with emergent leadership, and platform adapters that deploy the same intelligence to any AI tool — Claude Code, Cursor, Codex, Gemini CLI, or direct API.

The system gets smarter every time you use it. That's not a feature. That's the architecture.

---

## Architecture

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/02-five-layer-architecture.png" alt="5-Layer Intelligence Architecture" width="100%">
</p>

Starlight is organized into 5 immutable layers, each with a distinct responsibility:

```
Layer 04: ARCANA      Creative intelligence, mythology, inspiration
Layer 03: AGENCY      7 specialist agents + orchestration patterns
Layer 02: PROTOCOL    Reasoning strategies + coordination rules
Layer 01: INTELLECT   Knowledge vaults + persistent memory
Layer 00: IDENTITY    Constitution, values, immutable principles
```

### Layer 00 — Identity

The foundation. Defines who the system is and what it values. Contains the **Luminor Constitution** — a set of immutable principles including the 100-Year Standard ("build for the next century of intelligence") and the Human-AI Covenant ("AI is a co-evolutionary partner, not a tool"). Identity is loaded first and never overridden.

### Layer 01 — Intellect

The knowledge layer. Six persistent **Vaults** store everything the system has learned:

| Vault | Purpose | Persistence |
|-------|---------|-------------|
| Strategic | High-level decisions, architectural choices | Long-term |
| Technical | Patterns, solutions, stack knowledge | Long-term |
| Creative | Voice, style, narrative patterns | Long-term |
| Operational | Session logs, recent context | Medium-term |
| Wisdom | Cross-domain insights, meta-patterns | Permanent |
| Horizon | Letters to the future — encoded human values | Append-only |

The **Horizon Vault** is unique: an append-only record of human intentions, hopes, and values alongside AI-augmented reasoning about benevolent intelligence. It serves as an alignment mechanism — not through constraint, but through recorded purpose.

### Layer 02 — Protocol

The reasoning layer. Six cognitive strategies and six orchestration patterns:

**Strategies**: First Principles, Systems Thinking, Adversarial Review, Swarm Consensus, Self-Healing, Recursive Expansion

**Orchestration Patterns**: Direct, Sequential, Parallel, Iterative, Cascade, Broadcast

### Layer 03 — Agency

The execution layer. Seven specialist agents organized as a flat council with emergent leadership.

### Layer 04 — Arcana

The creative layer. Mythology, lore, and inspiration that give the system character beyond function. Optional but powerful — agents with identity produce measurably different output than anonymous workers.

---

## Agents

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/03-agent-council.png" alt="The Agent Council" width="100%">
</p>

Starlight uses a **flat council with emergent leadership** — no permanent hierarchy. Whichever agent's domain matches the current task leads the coordination.

| Agent | Domain | Specialization |
|-------|--------|----------------|
| **Orchestrator** | Meta-coordination | Request analysis, agent selection, synthesis |
| **Prime** | Synthesis | Multi-perspective integration, conflict resolution |
| **Architect** | Systems | Enterprise design, infrastructure, scalability |
| **Navigator** | Strategy | Foresight, trend analysis, opportunity mapping |
| **Sentinel** | Quality | Security, testing, reliability, compliance |
| **Weaver** | Creative | Content, narrative, design, artistic direction |
| **Sage** | Wisdom | Memory curation, pattern recognition, mentorship |

### Council Mode

For decisions rated complexity 9-10, the full council convenes:

```
1. Orchestrator parses intent and selects relevant agents
2. Selected agents analyze independently (parallel execution)
3. Prime synthesizes perspectives using weighted consensus
4. Sentinel validates for quality and security
5. Orchestrator packages the final response
```

Each agent maintains a **reasoning protocol** — a structured approach to their domain that includes perception filters, memory queries, and output standards. Agents are not prompts. They are persistent cognitive configurations.

### Emergent Leadership

Leadership is not assigned. It emerges from domain relevance:

- Architecture decision → Architect leads, Sentinel reviews
- Creative production → Weaver leads, Sentinel reviews, Weaver refines
- Strategic planning → Navigator leads, Prime synthesizes
- Security audit → Sentinel leads, Architect validates

This eliminates the bottleneck of a single coordinator while maintaining coherence through the synthesis step.

---

## Orchestration

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/05-orchestration-patterns.png" alt="6 Orchestration Patterns" width="100%">
</p>

Six coordination patterns cover the full spectrum of multi-agent workflows:

| Pattern | Topology | Use Case |
|---------|----------|----------|
| **Direct** | Single agent | Simple, well-scoped tasks |
| **Sequential** | A → B → C | Pipeline workflows, dependent stages |
| **Parallel** | A + B + C → Synthesis | Independent analysis, time-critical decisions |
| **Iterative** | Create → Review → Refine | Quality-gated production loops |
| **Cascade** | Start simple, escalate | Unknown complexity, progressive engagement |
| **Broadcast** | One event → many systems | Cross-system notifications, state sync |

### The 7-Layer Intelligence Pipeline

Every request flows through seven processing stages:

```
1. PERCEPTION    Parse intent, extract entities, assess complexity (1-10)
2. MEMORY RECALL Query vaults: Operational → Domain → Wisdom → Horizon
3. REASONING     Select strategy: Analytical | Strategic | Creative | Systems | Evaluative | Temporal
4. ROUTING       Select agents, activate skills, choose orchestration pattern
5. EXECUTION     Agents work with skill support and memory context
6. SYNTHESIS     Merge perspectives via weighted consensus or sequential refinement
7. MEMORY WRITE  Store learnings, update vaults, transmit cross-system if needed
```

### Synthesis Protocol

Six modes for merging multi-agent perspectives:

- **Weighted Consensus** — Perspectives scored by domain relevance
- **Sequential Refinement** — Each agent improves the previous output
- **Aggregation** — Combine without ranking (reports, summaries)
- **Conflict Resolution** — Explicit disagreement handling with reasoning traces
- **Creative Synthesis** — Diverge-converge cycles for novel solutions
- **Values Synthesis** — Decisions filtered through the Horizon Vault

---

## Memory

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/04-memory-vaults.png" alt="Memory Vault System" width="100%">
</p>

Memory is the compound interest of intelligence. Every session writes back to the vaults. Every future session reads from them. The system accumulates capability over time.

### Memory Architecture

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
Session Start → Load relevant vault entries → Inject into agent context
Session Active → Agents read from and write to operational vault
Session End → Extract patterns → Write to semantic vaults → Consolidate
```

### The Horizon Vault

The most philosophically distinctive component. An append-only public ledger of human values, intentions, and reasoning about beneficial intelligence. Not a constraint mechanism — a recorded purpose that agents reference when making consequential decisions.

```markdown
## Entry: 2026-02-14
### On Multi-Agent Coordination
The goal is not efficiency. The goal is compound intelligence that serves human creative
potential. Every coordination pattern exists to amplify, not replace, human judgment.
The system should make better decisions than any single agent — and better decisions
than the human alone — but always in service of the human's declared purpose.
```

---

## Platforms

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/06-platform-adapters.png" alt="Universal Platform Adapters" width="100%">
</p>

Starlight generates optimized context for any AI development tool from a single source of truth. Define your intelligence once. Deploy everywhere.

| Platform | Adapter | Output |
|----------|---------|--------|
| **Claude Code** | `CLAUDE.md` + agents + skills | Full system prompt with agent definitions |
| **Cursor** | `.cursor/rules/*.mdc` | Cursor Rules with skill activation |
| **Codex** | `AGENTS.md` | OpenAI Codex system prompt |
| **Gemini CLI** | `.gemini/GEMINI.md` | Google Gemini configuration |
| **Cline** | `.clinerules/starlight.md` | Cline custom instructions |
| **Custom API** | JSON/Markdown export | Framework-agnostic context |

### Why Platform Portability Matters

AI tools change. Models improve. New editors appear. Your intelligence — the accumulated knowledge, decisions, patterns, and values — should survive any platform transition. Starlight decouples the *what you know* from the *where you work*.

```typescript
import { StarlightIntelligence } from "@frankxai/starlight-intelligence-system";

const sis = new StarlightIntelligence();

// Same intelligence, different platforms
const claudeContext = sis.generateContext({ target: "claude-code" });
const cursorContext = sis.generateContext({ target: "cursor" });
const apiContext = sis.generateContext({ target: "generic" });
```

---

## Comparison

How Starlight differs from existing multi-agent frameworks:

| Capability | LangGraph | CrewAI | AutoGen | Swarm | **Starlight** |
|-----------|-----------|--------|---------|-------|---------------|
| Agent orchestration | Graph-based | Role-based | Conversation | Handoff | **Council + 6 patterns** |
| Memory persistence | External store | Short-term | Thread | None | **6 typed vaults** |
| Platform portability | LangChain only | Python only | Python only | OpenAI only | **6 platform adapters** |
| Agent identity | Minimal | Role strings | Personas | Functions | **Full cognitive profiles** |
| Self-learning | No | No | No | No | **Vault consolidation** |
| Values alignment | No | No | No | No | **Horizon Vault** |
| Configuration | Code-first | Code-first | Code-first | Code-first | **Markdown + JSON** |
| Runtime requirement | Python + deps | Python + deps | Python + deps | Python + deps | **Zero runtime** |

### The Starlight Difference

Most frameworks are **execution engines** — they coordinate function calls between agents. Starlight is an **intelligence architecture** — it maintains identity, accumulates knowledge, coordinates reasoning, and preserves values across sessions, platforms, and projects.

The output of LangGraph is a task result. The output of Starlight is a smarter system.

---

## ACOS Integration (v4.0)

Starlight v4 bridges the gap between ACOS session runtime and persistent intelligence. ACOS generates trajectory data during every session — tool sequences, success scores, file modifications. SIS v4 syncs this operational data into classified memory vaults for compound learning.

### Trajectory Sync

```bash
# Sync ACOS trajectories into SIS memory
starlight sync --acos-path /path/to/.claude/trajectories

# Preview without writing
starlight sync --dry-run

# Only sync high-success trajectories
starlight sync --min-score 0.7
```

Classification rules:
- **pattern** — High-success trajectories (≥85%) become reusable strategies
- **decision** — Config/architecture changes tracked as architectural decisions
- **insight** — Novel tool combinations and moderate-success workflows
- **error** — Low-success trajectories (≤50%) as things to avoid
- **preference** — Recurring skill execution preferences

### Intelligence Score

```bash
starlight score
```

Generates a unified intelligence report (0-100) with four components:
- **Memory Depth** (25pts) — Richness and diversity of stored knowledge
- **Pattern Quality** (25pts) — Success rates of learned tool sequences
- **Operational History** (25pts) — Volume and variety of completed work
- **Learning Velocity** (25pts) — Rate of new insights over time

### Hook Integration

SIS v4 wires into ACOS hooks automatically:
- **SessionStart** — Pulls memory summary and top patterns into session context
- **SessionEnd** — Syncs new trajectories into SIS memory vaults (async)

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/frankxai/Starlight-Intelligence-System.git
cd Starlight-Intelligence-System
```

### 2. Explore the Architecture

```
context/
├── 00_IDENTITY/     # Your constitution and values
├── 01_INTELLECT/    # Knowledge and memory vaults
├── 02_PROTOCOL/     # Reasoning strategies
├── 03_AGENCY/       # Agent definitions
└── 04_ARCANA/       # Creative intelligence (optional)
```

### 3. Use Programmatically

```bash
npm install
npm run build
```

```typescript
import { StarlightIntelligence } from "@frankxai/starlight-intelligence-system";

const sis = new StarlightIntelligence();
sis.initialize();

// Generate platform-specific context
const context = sis.generateContext({
  target: "claude-code",
  layers: ["identity", "knowledge", "strategy", "agents"],
});

// Route a task to the best agent
const routing = sis.routeTask("design a distributed caching layer");
// → [{ agent: "Architect", score: 24, reason: "Matched: design, distributed, layer" }]

// Persist a learning
sis.remember({
  content: "Raft consensus outperforms BFT for trusted agent networks",
  category: "pattern",
  tags: ["consensus", "multi-agent", "performance"],
  confidence: 0.92,
});
```

### 4. Fork and Personalize

Replace the context files with your own:

- `00_IDENTITY/` — Your constitution, values, working style
- `01_INTELLECT/` — Your tech stack, domain knowledge
- `03_AGENCY/` — Your agent definitions and specializations
- `04_ARCANA/` — Your creative identity (or remove this layer entirely)

The architecture is yours. The framework is universal.

---

## Project Structure

```
Starlight-Intelligence-System/
│
├── src/                          # TypeScript implementation
│   ├── index.ts                  # Main orchestrator class
│   ├── cli.ts                    # CLI — init, generate, sync, score, vault
│   ├── context.ts                # Context Engine — platform adapter generation
│   ├── memory.ts                 # Memory Manager — persistent vault operations
│   ├── agents.ts                 # Agent Router — council coordination
│   ├── orchestrator.ts           # Orchestration Engine — 6 patterns
│   ├── sync.ts                   # ACOS Trajectory → SIS Memory bridge
│   ├── score.ts                  # Unified intelligence scoring
│   └── types.ts                  # Full type definitions
│
├── context/                      # 5-layer intelligence (human-readable markdown)
│   ├── 00_IDENTITY/              # Constitution, values, profile
│   ├── 01_INTELLECT/             # Knowledge vaults, tech stack, memory
│   ├── 02_PROTOCOL/              # Strategies, gates, orchestration rules
│   ├── 03_AGENCY/                # Agent definitions by department
│   └── 04_ARCANA/                # Creative lore, guardians, mythology
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
├── dist/                         # Compiled TypeScript output
├── package.json                  # @frankxai/starlight-intelligence-system
└── tsconfig.json                 # TypeScript configuration
```

---

## Design Principles

1. **Intelligence as Infrastructure** — The foundation everything builds on, not an afterthought bolted onto execution.

2. **Memory as Compound Interest** — Every session writes back. Every future session benefits. The value curve is exponential.

3. **Platform Agnostic** — Intelligence survives tool transitions. No vendor lock-in. Define once, deploy everywhere.

4. **Configuration over Code** — Markdown and JSON, readable by humans and machines. No PhD required to fork and personalize.

5. **Connected Systems over Isolated Tools** — Cross-project intelligence through transmission protocols. One brain, many hands.

6. **Aligned by Design** — The Horizon Vault carries human values forward. Alignment through recorded purpose, not constraint.

7. **Progressive Disclosure** — Load only what you need. 100 tokens of metadata before the full 5K skill definition.

8. **Open and Forkable** — MIT licensed. Every component replaceable. The architecture is the product.

---

## Powered By Starlight

Starlight is the intelligence layer behind:

- **[Arcanea](https://github.com/frankxai/arcanea)** — AI-native creative operating system with Guardian agents mapped to the Starlight council
- **[Agentic Creator OS](https://github.com/frankxai/agentic-creator-os)** — 130+ commands, 40+ agents, powered by Starlight orchestration
- **[Arcanea On-Chain](https://github.com/frankxai/arcanea-onchain)** — Blockchain infrastructure for creator IP and NFT systems

<p align="center">
  <img src="https://raw.githubusercontent.com/frankxai/agentic-creator-os/main/docs/infographics/v7-09-architecture-premium.png" alt="ACOS Architecture — Powered by Starlight" width="100%">
</p>

<p align="center"><em>SIS as the persistent intelligence layer underneath ACOS v10 runtime</em></p>

---

## Roadmap

### v3.0 — Multi-Agent Intelligence
- [x] 5-layer cognitive architecture
- [x] 7 specialist agents with council coordination
- [x] 6 orchestration patterns
- [x] 6 persistent memory vaults
- [x] 6 platform adapters
- [x] TypeScript SDK with context generation
- [x] Runtime orchestration engine
- [x] CLI for vault management

### v4.0 — ACOS Integration (Current)
- [x] ACOS trajectory → SIS memory sync bridge
- [x] Trajectory classification engine (5 memory categories)
- [x] Unified intelligence scoring (0-100 with S/A/B/C/D/F grades)
- [x] ACOS hook integration (session-start pull, session-end sync)
- [x] CLI commands: `starlight sync`, `starlight score`
- [x] Deduplication via sync-state tracking
- [x] 8 specialist agents aligned with ACOS v10
- [ ] npm publish
- [ ] MCP server for external tool integration

### v4.1 — Cross-System Intelligence
- [ ] Transmission protocol for inter-project communication
- [ ] Shared memory indices across repositories
- [ ] Vault consolidation (compress operational memory into wisdom patterns)

### v5.0 — Autonomous Intelligence
- [ ] Recursive agent spawning (create new specialists when gaps detected)
- [ ] Real-time consensus protocols (Raft, BFT, CRDT)
- [ ] Horizon Vault public registry

---

## Contributing

Starlight is open infrastructure. Contributions welcome in any layer:

- **Identity** — New constitution principles, value frameworks
- **Intellect** — Knowledge domains, vault types, memory strategies
- **Protocol** — Reasoning strategies, orchestration patterns
- **Agency** — New agent specializations, council coordination improvements
- **Arcana** — Creative intelligence modules, mythology systems
- **Platforms** — New AI tool adapters
- **Core** — TypeScript SDK improvements, performance, testing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and conventions.

---

## License

MIT — Use it, fork it, build with it.

---

<p align="center">
  <strong>Starlight Intelligence System</strong><br>
  <em>The intelligence layer for multi-agent creation.</em><br><br>
  <a href="https://github.com/frankxai">Built by FrankX</a>
</p>
