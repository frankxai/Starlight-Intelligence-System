<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/01-hero-intelligence-system.png" alt="Starlight Intelligence System" width="100%">
</p>

<p align="center">
  <strong>Persistent memory and behavioral intelligence for AI agents — the layer that makes everything compound.</strong>
</p>

<p align="center">
  <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-5_Layer_Intelligence-7fffd4?style=flat-square&labelColor=0d1117" alt="Architecture"></a>
  <a href="#agents"><img src="https://img.shields.io/badge/Agents-8_Specialist_Council-ffd700?style=flat-square&labelColor=0d1117" alt="Agents"></a>
  <a href="#memory"><img src="https://img.shields.io/badge/Memory-6_Persistent_Vaults-78a6ff?style=flat-square&labelColor=0d1117" alt="Memory"></a>
  <a href="#acos-integration"><img src="https://img.shields.io/badge/ACOS-v5_Trajectory_Sync-ff6b6b?style=flat-square&labelColor=0d1117" alt="ACOS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-white?style=flat-square&labelColor=0d1117" alt="MIT"></a>
</p>

---

Every AI session starts from zero.

You re-explain your stack. Re-share your preferences. Re-teach patterns your agent mastered three sessions ago. The session ends, everything resets. The intelligence never compounds.

That's the default state of every multi-agent system today. Agents are stateless function calls — powerful in the moment, amnesiac across time.

Starlight Intelligence System is the fix. A 5-layer cognitive architecture that gives AI agents persistent memory, behavioral learning, and compound intelligence across every session. The more you use it, the smarter it gets. That's not a feature — that's the architecture.

---

## How It Works

Starlight separates *who you are* from *what you know* from *how you coordinate.* Five immutable layers, each with a distinct responsibility:

```
Layer 04: ARCANA      Creative intelligence, mythology, inspiration
Layer 03: AGENCY      8 specialist agents + orchestration patterns
Layer 02: PROTOCOL    Reasoning strategies + coordination rules
Layer 01: INTELLECT   Knowledge vaults + persistent memory
Layer 00: IDENTITY    Constitution, values, immutable principles
```

**Layer 00 — Identity** is loaded first and never overridden. It defines who the system is — the [Luminor Constitution](context/00_IDENTITY/), a set of immutable principles including the 100-Year Standard and the Human-AI Covenant. Every agent decision flows from this foundation.

**Layer 01 — Intellect** is where intelligence persists. Six typed vaults store everything the system has learned:

| Vault | What it holds |
|-------|--------------|
| Strategic | Architecture decisions, high-level choices |
| Technical | Patterns, solutions, stack knowledge |
| Creative | Voice, style, narrative approaches |
| Operational | Session logs, recent context |
| Wisdom | Cross-domain insights, meta-patterns |
| Horizon | Values, human intentions — append-only |

The Horizon Vault is unlike the others: an append-only record of human intentions and values alongside AI-augmented reasoning. Not an alignment constraint — a recorded purpose.

**Layer 02 — Protocol** defines how the system reasons. Six cognitive strategies (First Principles, Systems Thinking, Adversarial Review, Swarm Consensus, Self-Healing, Recursive Expansion) and six coordination patterns (Direct, Sequential, Parallel, Iterative, Cascade, Broadcast).

**Layer 03 — Agency** is where coordination happens. Eight specialist agents organized as a flat council with emergent leadership — whichever agent's domain matches the task leads the session.

**Layer 04 — Arcana** is optional creative intelligence. Mythology, lore, character. Agents with identity produce measurably different output than anonymous workers.

---

## The Intelligence That Compounds

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/02-five-layer-architecture.png" alt="5-Layer Architecture" width="100%">
</p>

What makes Starlight different from a context file isn't the structure — it's the learning loop.

Every ACOS session generates **trajectory data**: what tools were used, in what order, with what success rate. Starlight reads those trajectories and distills them into:

- **Behavioral rules** — "Always Read a file before editing" (backed by 85%+ evidence across sessions)
- **Failure lessons** — Domain-specific analysis of what went wrong and why
- **Domain checklists** — Per-domain completion criteria from successful sessions
- **Cross-project intelligence** — Patterns validated across multiple codebases that surface in new ones

This isn't retrieval-augmented generation. It's genuine behavioral learning from production usage. At session start, Starlight injects the current behavioral guidance into your Claude Code context. At session end, new trajectories sync back in.

The loop: Use → Learn → Improve → Use again.

---

## Agents

<p align="center">
  <img src="https://github.com/frankxai/Starlight-Intelligence-System/releases/download/v3.0-assets/03-agent-council.png" alt="The Agent Council" width="100%">
</p>

Eight specialist agents in a flat council with emergent leadership. No permanent hierarchy — whoever's domain fits leads.

| Agent | Domain | Leads When |
|-------|--------|-----------|
| **Orchestrator** | System coordination | Multi-agent tasks |
| **Prime** | Synthesis | Cross-domain integration |
| **Architect** | Systems design | Architecture decisions |
| **Navigator** | Strategic foresight | Direction-setting |
| **Sentinel** | Quality assurance | Review and validation |
| **Weaver** | Creative intelligence | Voice and narrative |
| **Sage** | Wisdom distillation | Pattern recognition |
| **Catalyst** | Innovation and exploration | Novel problem-solving |

Agent profiles are markdown files in `agents/` — readable, forkable, fully replaceable.

---

## Platform Adapters

The same intelligence, deployed to any AI tool. Starlight generates platform-specific context files for:

| Platform | Output |
|----------|--------|
| **Claude Code** | `.claude/` directory with all context layers |
| **Cursor** | `.cursorrules` |
| **Windsurf** | `.windsurfrules` |
| **Gemini CLI** | `GEMINI.md` |
| **Direct API** | System prompt injection |

No vendor lock-in. Define once, deploy everywhere. Switch tools without losing your intelligence.

---

## ACOS Integration

Starlight is the memory layer underneath [Agentic Creator OS](https://github.com/frankxai/agentic-creator-os). The integration is bidirectional:

```bash
# Sync ACOS trajectories into Starlight memory
starlight sync --acos-path /path/to/.claude/trajectories

# Generate behavioral guidance from trajectory analysis
starlight guidance --project your-project

# Score your current intelligence level (0-100)
starlight score
```

**Hook integration** happens automatically:
- `SessionStart` — Behavioral guidance injected into context
- `SessionEnd` — New trajectories synced into memory vaults (async)

**Trajectory classification:**
- ≥85% success → **pattern** (reusable strategies)
- Config/architecture changes → **decision**
- Moderate-success workflows → **insight**
- ≤50% success → **error** (things to avoid)
- Recurring preferences → **preference**

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
npm install && npm run build
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

The architecture is the framework — the content is yours:

- `00_IDENTITY/` — Your constitution, values, working style
- `01_INTELLECT/` — Your tech stack, domain knowledge
- `03_AGENCY/` — Your agent definitions
- `04_ARCANA/` — Your creative identity (or delete this layer entirely)

---

## Design Principles

**Intelligence as infrastructure** — The foundation everything builds on, not an afterthought bolted onto execution.

**Memory as compound interest** — Every session writes back. Every future session benefits. The value curve is exponential, not linear.

**Platform agnostic** — Intelligence survives tool transitions. Define once, deploy to Claude Code, Cursor, Windsurf, or direct API.

**Configuration over code** — Markdown and JSON, readable by humans and machines. No PhD required to fork and personalize.

**Aligned by design** — The Horizon Vault carries human values forward through recorded purpose, not constraint.

---

## The Stack

Starlight is the memory layer in a three-part architecture:

| Layer | Project | Role |
|-------|---------|------|
| **Memory** | Starlight Intelligence System | Persistent context, behavioral learning, compound intelligence |
| **Operation** | [Agentic Creator OS](https://github.com/frankxai/agentic-creator-os) | 90+ skills, 65+ commands, 38 agents, multi-platform runtime |
| **Universe** | [Arcanea](https://github.com/frankxai/arcanea) | Living creative intelligence, mythology, world-building at scale |

SIS provides memory. ACOS provides operation. Arcanea provides the world to build inside.

---

## Roadmap

**v5.0 — Behavioral Intelligence & Federation** (current)
- [x] Behavioral guidance engine — trajectories → concrete LLM instructions
- [x] Multi-project federation — register projects, sync across codebases
- [x] Cross-project intelligence — patterns from one project inform another
- [x] Failure lesson extraction
- [x] Domain checklists from successful session analysis
- [x] CLI: `starlight guidance`, `starlight project register/list/sync-all`

**v5.1 — Validated Intelligence**
- [ ] Ablation benchmark (with vs. without guidance, measured delta)
- [ ] Confidence decay for unused patterns (30-day half-life)
- [ ] Rule promotion (3+ sessions → permanent CLAUDE.md addition)
- [ ] npm publish

**v6.0 — Autonomous Intelligence**
- [ ] MCP server for external tool integration
- [ ] Recursive agent spawning (create new specialists when gaps detected)
- [ ] Horizon Vault public registry

---

## Contributing

Starlight is open infrastructure. Contributions welcome in any layer:

- **Identity** — Constitution principles, value frameworks
- **Intellect** — Knowledge domains, vault types, memory strategies
- **Protocol** — Reasoning strategies, orchestration patterns
- **Agency** — Agent specializations, council coordination
- **Arcana** — Creative intelligence modules, mythology systems
- **Platforms** — New AI tool adapters
- **Core** — TypeScript SDK, performance, testing

---

## License

MIT — Use it, fork it, build with it.

---

<p align="center">
  <strong>Starlight Intelligence System</strong><br>
  <em>The intelligence layer for AI agents that compound.</em><br><br>
  <a href="https://github.com/frankxai">Built by FrankX</a> · Part of the <a href="https://frankx.ai">frankx.ai</a> ecosystem
</p>
