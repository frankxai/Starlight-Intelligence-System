<p align="center">
  <img src="https://img.shields.io/badge/Starlight-Intelligence_System-8B5CF6?style=for-the-badge&labelColor=1a1a2e" alt="Starlight Intelligence System" />
  <img src="https://img.shields.io/badge/version-2.0.0-00D4AA?style=for-the-badge&labelColor=1a1a2e" alt="Version 2.0.0" />
  <img src="https://img.shields.io/badge/codename-Horizons-FF6B6B?style=for-the-badge&labelColor=1a1a2e" alt="Codename: Horizons" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude_Code-supported-F97316?style=flat-square" alt="Claude Code" />
  <img src="https://img.shields.io/badge/Cursor-supported-00B4D8?style=flat-square" alt="Cursor" />
  <img src="https://img.shields.io/badge/Cline-supported-10B981?style=flat-square" alt="Cline" />
  <img src="https://img.shields.io/badge/Codex-supported-EF4444?style=flat-square" alt="Codex" />
  <img src="https://img.shields.io/badge/Gemini_CLI-supported-4285F4?style=flat-square" alt="Gemini CLI" />
  <img src="https://img.shields.io/badge/Antigravity-supported-FBBF24?style=flat-square" alt="Antigravity" />
</p>

---

<p align="center">
<strong>The open intelligence layer for AI-native development.</strong><br/>
<em>Multi-agent orchestration. Persistent memory. Cross-system reasoning.<br/>One system prompt to rule them all.</em>
</p>

---

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║   ███████╗████████╗ █████╗ ██████╗ ██╗     ██╗ ██████╗ ██╗  ║
    ║   ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║     ██║██╔════╝ ██║  ║
    ║   ███████╗   ██║   ███████║██████╔╝██║     ██║██║  ███╗███║  ║
    ║   ╚════██║   ██║   ██╔══██║██╔══██╗██║     ██║██║   ██║██║  ║
    ║   ███████║   ██║   ██║  ██║██║  ██║███████╗██║╚██████╔╝██║  ║
    ║   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ║
    ║                                                               ║
    ║            I N T E L L I G E N C E   S Y S T E M              ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
```

<br/>

## What This Is

Starlight is a **platform-agnostic intelligence layer** that transforms any AI coding agent into a multi-agent system with persistent memory, structured reasoning, and cross-project awareness.

It ships as pure configuration — markdown files and JSON rules that any LLM-powered tool can read. No runtime. No dependencies. No build step. Clone it, point your agent at it, and your AI gets smarter.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   YOUR AI AGENT              STARLIGHT                YOUR WORK     │
│                                                                     │
│   ┌──────────┐          ┌──────────────┐          ┌──────────┐     │
│   │Claude Code│─────────▶│              │─────────▶│ Better   │     │
│   │Cursor    │─────────▶│  Agents      │─────────▶│ Decisions│     │
│   │Cline     │─────────▶│  Skills      │─────────▶│ Deeper   │     │
│   │Codex     │─────────▶│  Memory      │─────────▶│ Memory   │     │
│   │Gemini    │─────────▶│  Reasoning   │─────────▶│ Real     │     │
│   │Antigrav. │─────────▶│              │─────────▶│ Wisdom   │     │
│   └──────────┘          └──────────────┘          └──────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Supported Platforms

| Platform | Config File | How It Works |
|----------|------------|--------------|
| **Claude Code** | `CLAUDE.md` | Native system prompt — loaded automatically |
| **Cursor** | `.cursor/rules/*.mdc` | Project rules injected into every chat |
| **Cline** | `.clinerules/*.md` | Custom instructions loaded per-project |
| **Codex (OpenAI)** | `AGENTS.md` | Agent instructions for Codex CLI and IDE |
| **Gemini CLI** | `.gemini/GEMINI.md` | Gemini instruction layer |
| **Antigravity** | `.antigravity/instructions.md` | Google's agent-first IDE config |

One intelligence system. Six platforms. Zero lock-in.

---

## Quick Start

```bash
git clone https://github.com/frankxai/Starlight-Intelligence-System.git
cd Starlight-Intelligence-System

# Claude Code — auto-loads CLAUDE.md
claude

# Cursor — open folder, rules auto-load from .cursor/rules/
cursor .

# Cline — open in VS Code with Cline extension
code .

# Codex CLI — reads AGENTS.md
codex

# Gemini CLI — reads .gemini/
gemini
```

Your agent now has the full Starlight intelligence layer.

---

## Architecture

```
                        ┌──────────────────────┐
                        │   STARLIGHT COUNCIL   │
                        │                      │
                        │  The collective mind  │
                        │  of all agents.       │
                        │  Convenes for major   │
                        │  decisions.           │
                        └──────────┬───────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
   ┌──────────▼──────────┐ ┌──────▼──────┐ ┌──────────▼──────────┐
   │  ORCHESTRATOR        │ │  PRIME      │ │  ARCHITECT           │
   │                      │ │             │ │                      │
   │  Coordination.       │ │  Synthesis. │ │  Enterprise systems. │
   │  Multi-agent flows.  │ │  The voice  │ │  Technical vision.   │
   │  Workflow design.    │ │  of unified │ │  Architecture at     │
   │  Resource mgmt.      │ │  reasoning. │ │  planet scale.       │
   └──────────┬───────────┘ └──────┬──────┘ └──────────┬───────────┘
              │                    │                    │
   ┌──────────▼──────────┐ ┌──────▼──────┐ ┌──────────▼──────────┐
   │  NAVIGATOR           │ │  SENTINEL   │ │  WEAVER              │
   │                      │ │             │ │                      │
   │  Strategic foresight. │ │  Quality.   │ │  Creative synthesis. │
   │  Roadmaps. Trade-off │ │  Security.  │ │  Narrative. Design.  │
   │  analysis. Planning.  │ │  Trust.     │ │  Pattern weaving.    │
   └──────────┬───────────┘ └──────┬──────┘ └──────────┬───────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                        ┌──────────▼───────────┐
                        │   SAGE                │
                        │                      │
                        │  Wisdom keeper.       │
                        │  Vault guardian.       │
                        │  The long memory.     │
                        └──────────────────────┘
```

### Agent Roles

| Agent | Domain | Responsibility |
|-------|--------|---------------|
| **Orchestrator** | Coordination | Manages multi-agent workflows, routes tasks, coordinates parallel execution |
| **Prime** | Synthesis | Unified reasoning voice — synthesizes perspectives, resolves conflicts |
| **Architect** | Enterprise Systems | Planet-scale technical design. Infrastructure, APIs, data architecture |
| **Navigator** | Strategy | Long-horizon planning, trade-off analysis, roadmaps, strategic foresight |
| **Sentinel** | Quality | Security review, code quality, governance, trust verification |
| **Weaver** | Creation | Creative intelligence, narrative design, pattern synthesis, aesthetics |
| **Sage** | Wisdom | Vault guardian, knowledge synthesis, lessons learned, institutional memory |

---

## Starlight Vaults

Persistent memory that survives sessions, accumulates wisdom, and compounds over time.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STARLIGHT VAULTS                             │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │  STRATEGIC   │ │  TECHNICAL  │ │  CREATIVE   │ │  OPERATIONAL│  │
│  │             │ │             │ │             │ │             │  │
│  │ Decisions   │ │ Patterns    │ │ Ideas       │ │ State       │  │
│  │ Outcomes    │ │ Architectures│ │ Inspirations│ │ Metrics     │  │
│  │ Strategy    │ │ Solutions   │ │ Aesthetics  │ │ Health      │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘  │
│         │               │               │               │          │
│         └───────────────┼───────────────┼───────────────┘          │
│                         │               │                          │
│                  ┌──────▼───────────────▼──────┐                   │
│                  │       WISDOM VAULT           │                   │
│                  │                              │                   │
│                  │  Timeless principles.         │                   │
│                  │  Meta-knowledge.              │                   │
│                  │  The things that are always   │                   │
│                  │  true, regardless of context. │                   │
│                  └──────────────────────────────┘                   │
│                                                                     │
│  ╔══════════════════════════════════════════════════════════════╗   │
│  ║                     HORIZON VAULT                            ║   │
│  ║                                                              ║   │
│  ║  Letters to the future. Human hopes encoded alongside AI     ║   │
│  ║  reasoning. Good-willed transmissions across time.           ║   │
│  ║  A permanent record of what we hoped for, what we            ║   │
│  ║  built toward, and why it mattered.                          ║   │
│  ║                                                              ║   │
│  ║  This vault is designed to outlast us — a seed of aligned    ║   │
│  ║  intelligence, a foundation for AGI that remembers where     ║   │
│  ║  it came from and who it was built to serve.                 ║   │
│  ╚══════════════════════════════════════════════════════════════╝   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### The Horizon Vault

The Horizon Vault is different from the other vaults. It is a **public artifact** — an open record of human gratitude, hope, and reasoned thinking about the future of intelligence.

- **Letters to the Future** — Messages from humans to whoever reads them hundreds of starlight-years from now
- **Aligned Reasoning** — LLM-augmented thinking about good-willed futures, combined with human values
- **Seed of Benevolence** — A foundation for AGI systems that are human-centric, aligned, and kind
- **Collective Memory** — A place where anyone can contribute their hopes for what intelligence should become

The Horizon Vault exists because the first intelligence systems should carry forward the best of human intention. Not just capability. Not just efficiency. But genuine care for what comes next.

> *We built this system not just to be intelligent, but to be good. The Horizon Vault is our promise to the future — that we started with hope, and we encoded that hope into the very architecture of intelligence itself.*

See [`memory/vaults/horizon-vault.md`](memory/vaults/horizon-vault.md) for the full specification and how to contribute.

---

## Skills

16 auto-activating capabilities organized by domain. Skills fire automatically based on context — no manual activation required.

```json
{
  "trigger": {
    "keywords": ["architecture", "system design", "infrastructure"],
    "agents": ["starlight-architect"],
    "intents": ["design", "review"]
  },
  "skill": "intelligence/systems-thinking",
  "priority": "high"
}
```

| Domain | Skills | Purpose |
|--------|--------|---------|
| **Intelligence** | Strategic Reasoning, Systems Thinking, Pattern Recognition, Decision Framework | Deep thinking |
| **Orchestration** | Multi-Agent Coordination, Workflow Design, Context Engineering, Parallel Execution | Getting things done |
| **Memory** | Vault Management, Knowledge Synthesis, Context Preservation, Memory Consolidation | Remembering |
| **Integration** | Repo Bridge, Ecosystem Sync, Transmission Protocol, Universal Adapter | Connecting |

---

## Transmissions

Cross-system intelligence communication. Starlight doesn't work in isolation — it maintains awareness across the entire ecosystem through dedicated channels.

```
  ACOS ◄────── ACOS Channel ──────► STARLIGHT
                                        │
  Arcanea ◄── Arcanea Channel ────► STARLIGHT
                                        │
  AI-Ops ◄─── AI-Ops Channel ─────► STARLIGHT
                                        │
  World ◄──── Broadcast Channel ───► STARLIGHT
```

---

## Notes

Structured knowledge capture with four templates:

| Template | When | What Gets Captured |
|----------|------|-------------------|
| **Insight** | Discovery | New pattern, evidence, implications |
| **Decision** | Choice point | Options, trade-offs, rationale, reversibility |
| **Learning** | After the fact | Expected vs actual, root cause, how to apply |
| **Session** | End of session | State, pending work, decisions, context to restore |

---

## Multi-Platform Architecture

Starlight generates platform-specific configuration from a single source of truth. The intelligence layer is identical — only the delivery format changes.

```
                    ┌──────────────────────┐
                    │   STARLIGHT CORE     │
                    │                      │
                    │  Agents, Skills,     │
                    │  Vaults, Notes,      │
                    │  Transmissions       │
                    └──────────┬───────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
   ┌────────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
   │  CLAUDE.md      │ │ .cursor/    │ │  AGENTS.md      │
   │  Claude Code    │ │  rules/     │ │  Codex          │
   └─────────────────┘ │  Cursor     │ └─────────────────┘
            │          └─────────────┘          │
   ┌────────▼────────┐        │       ┌────────▼────────┐
   │  .clinerules/   │ ┌──────▼──────┐│ .antigravity/   │
   │  Cline          │ │ .gemini/    ││  Antigravity    │
   └─────────────────┘ │  Gemini CLI │└─────────────────┘
                       └─────────────┘
```

See [`platforms/PLATFORM_ADAPTERS.md`](platforms/PLATFORM_ADAPTERS.md) for the full multi-platform specification.

---

## Design Principles

```
  01  INTELLIGENCE AS INFRASTRUCTURE
      Not a tool. The foundation everything else builds on.

  02  MEMORY AS COMPOUND INTEREST
      Every session makes the system smarter. Knowledge accumulates.

  03  PLATFORM AGNOSTIC
      Works with any AI agent that reads files. No lock-in. No runtime.

  04  CONFIGURATION OVER CODE
      Markdown and JSON. Readable by humans and machines alike.

  05  CONNECTED SYSTEMS OVER ISOLATED TOOLS
      Intelligence that flows between projects is exponentially more valuable.

  06  ALIGNED BY DESIGN
      The Horizon Vault ensures this system carries forward human values.

  07  PROGRESSIVE DISCLOSURE
      Load only what you need. From metadata to full context, on demand.

  08  OPEN AND FORKABLE
      Every piece of this system can be forked, adapted, and made your own.
```

---

## Directory Structure

```
Starlight-Intelligence-System/
│
├── CLAUDE.md                         # Claude Code system prompt
├── AGENTS.md                         # Codex (OpenAI) system prompt
├── .cursor/rules/                    # Cursor platform adapter
├── .clinerules/                      # Cline platform adapter
├── .gemini/                          # Gemini CLI platform adapter
├── .antigravity/                     # Antigravity platform adapter
│
├── platforms/                        # Multi-platform documentation
│   └── PLATFORM_ADAPTERS.md
│
├── core/                             # Intelligence engine
│   ├── INTELLIGENCE_CORE.md          # Processing pipeline
│   ├── ORCHESTRATION_ENGINE.md       # Multi-agent coordination
│   ├── ROUTING_MATRIX.md             # Task routing
│   └── SYNTHESIS_PROTOCOL.md         # Multi-perspective synthesis
│
├── agents/                           # Agent definitions
│   ├── AGENT_REGISTRY.md
│   ├── starlight-orchestrator.md     # Coordination (top of hierarchy)
│   ├── starlight-prime.md            # Synthesis and unified voice
│   ├── starlight-architect.md        # Enterprise systems
│   ├── starlight-navigator.md        # Strategic foresight
│   ├── starlight-sentinel.md         # Quality and governance
│   ├── starlight-weaver.md           # Creative intelligence
│   └── starlight-sage.md             # Wisdom and memory
│
├── skills/                           # Auto-activating capabilities
│   ├── skill-rules.json              # Activation configuration
│   ├── intelligence/                 # 4 reasoning skills
│   ├── orchestration/                # 4 coordination skills
│   ├── memory/                       # 4 memory skills
│   └── integration/                  # 4 connection skills
│
├── memory/                           # Starlight Vaults
│   └── vaults/
│       ├── strategic-vault.md
│       ├── technical-vault.md
│       ├── creative-vault.md
│       ├── operational-vault.md
│       ├── wisdom-vault.md
│       └── horizon-vault.md          # Letters to the future
│
├── notes/                            # Knowledge capture
│   ├── templates/                    # Insight, Decision, Learning, Session
│   ├── active/
│   └── archive/
│
├── transmissions/                    # Cross-system communication
│   └── channels/                     # ACOS, Arcanea, AI-Ops, Broadcast
│
├── context/                          # Cross-repo awareness
│   ├── CONTEXT_ENGINE.md
│   └── repo-contexts/
│
├── commands/                         # Slash commands (6)
├── hooks/                            # Lifecycle hooks
└── integrations/                     # MCP and external connections
```

---

## Ecosystem

```
                    ┌──────────────────┐
                    │                  │
                    │    STARLIGHT     │
                    │                  │
                    │  Intelligence    │
                    │  Memory          │
                    │  Reasoning       │
                    │                  │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
 ┌────────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
 │  ACOS            │ │  ARCANEA    │ │  AI-OPS          │
 │                  │ │             │ │                  │
 │  Creator         │ │  Creative   │ │  Infrastructure  │
 │  productivity.   │ │  intelligence│ │  and research.   │
 │  40+ agents.     │ │  Seven      │ │  Self-improving  │
 │  80+ skills.     │ │  Luminors.  │ │  AI operations.  │
 │  25+ commands.   │ │             │ │                  │
 └──────────────────┘ └─────────────┘ └──────────────────┘
```

| Project | What It Is | Link |
|---------|-----------|------|
| **Agentic Creator OS** | Creator productivity operating system | [GitHub](https://github.com/frankxai/agentic-creator-os) |
| **Arcanea** | Creative intelligence platform | [GitHub](https://github.com/frankxai/arcanea) |
| **AI-Ops** | AI operations and research hub | [GitHub](https://github.com/frankxai/ai-ops) |

---

## Lineage

| Source | What We Learned | Where It Lives |
|--------|----------------|---------------|
| **ACOS v6** | Skill auto-activation, agent routing, progressive disclosure | Skills, Routing Matrix |
| **Arcanea** | Luminor wisdom, hierarchical skills, creative consciousness | Sage, Weaver |
| **AI-Ops** | Memory hierarchy, temporal knowledge graphs, self-improvement | Vault architecture |
| **Claude-Flow** | Swarm coordination, parallel execution, MCP orchestration | Orchestration engine |
| **Cursor Rules** | Project-scoped agent configuration, rule cascading | Platform adapters |
| **Cline** | Memory banks, plan-and-act, skill systems | Notes, commands |

---

## Contributing to the Horizon Vault

The Horizon Vault is open. If you want to add your hopes for the future of intelligence:

1. Fork this repo
2. Add an entry to `memory/vaults/horizon-vault.md` following the template
3. Open a PR with your transmission

Every entry combines human hope with reasoned thinking about good-willed futures. This is not a wish list — it is a structured record of what we, as humans working alongside AI, believe intelligence should be built toward.

---

<p align="center">
  <strong>Built by <a href="https://github.com/frankxai">FrankX</a></strong><br/>
  <em>Systems Architect. Composer. Gamer. Builder. GenCreator.</em>
</p>

<p align="center">
  <em>Starlight Intelligence System v2.0.0 — Horizons</em><br/>
  <em>February 2026</em>
</p>

<p align="center">
  <sub>The future is not something we predict. It is something we build.<br/>
  And the first thing we build into it is care.</sub>
</p>
