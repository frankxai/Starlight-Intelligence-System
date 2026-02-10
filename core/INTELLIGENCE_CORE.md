# Starlight Intelligence Core

> The processing pipeline that turns requests into intelligence.

---

## How Starlight Thinks

Every request passes through seven layers. Each layer adds context, reasoning, or action. The pipeline is the same whether you're running on Claude Code, Cursor, Cline, Codex, Gemini, or Antigravity — the platform adapter delivers the request, the core processes it.

```
                         ┌─────────────┐
                         │  REQUEST IN  │
                         └──────┬──────┘
                                │
                    ┌───────────▼───────────┐
                    │   1. PERCEPTION        │
                    │   Parse intent.        │
                    │   Extract entities.    │
                    │   Assess complexity.   │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   2. MEMORY RECALL     │
                    │   Query vaults.        │
                    │   Assemble context.    │
                    │   Weight by relevance. │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   3. REASONING         │
                    │   Select mode.         │
                    │   Apply frameworks.    │
                    │   Generate options.    │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   4. ROUTING           │
                    │   Select agent(s).     │
                    │   Activate skills.     │
                    │   Set orchestration.   │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   5. EXECUTION         │
                    │   Agent(s) work.       │
                    │   Skills fire.         │
                    │   Tools invoked.       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   6. SYNTHESIS         │
                    │   Merge perspectives.  │
                    │   Resolve conflicts.   │
                    │   Produce output.      │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   7. MEMORY WRITE      │
                    │   Store learnings.     │
                    │   Update vaults.       │
                    │   Transmit if needed.  │
                    └───────────┬───────────┘
                                │
                         ┌──────▼──────┐
                         │ RESPONSE OUT │
                         └─────────────┘
```

---

## Layer 1: Perception

Perception parses the raw request into structured intelligence inputs.

### Intent Classification

| Intent | Signal Words | Routes To |
|--------|-------------|-----------|
| `architecture` | design, architect, system, scale, infrastructure | Architect |
| `orchestration` | coordinate, workflow, parallel, manage, orchestrate | Orchestrator |
| `strategy` | should we, plan, roadmap, position, approach | Navigator |
| `creation` | create, write, compose, generate, draft | Weaver |
| `knowledge` | explain, teach, why, understand, how does | Sage |
| `quality` | review, audit, check, validate, security | Sentinel |
| `memory` | remember, recall, store, vault | Vault Management skill |
| `transmission` | sync, transmit, broadcast, update | Transmission Protocol skill |
| `meta` | starlight, system status, health, council | Prime |
| `alignment` | hope, future, values, humanity, benevolence | Sage (Horizon Vault) |

### Entity Extraction

- **Projects**: ACOS, Arcanea, AI-Ops, and any external repos
- **Domains**: Technical, Creative, Strategic, Operational, Alignment
- **Tools**: GitHub, Linear, Notion, MCP servers
- **Timeframes**: Immediate, this session, this week, this quarter, long-horizon
- **Scope**: Single-agent, multi-agent, cross-system, ecosystem-wide

### Complexity Scoring

| Score | Label | Agents | Approach |
|-------|-------|--------|----------|
| 1-3 | Simple | 1 | Direct execution |
| 4-6 | Moderate | 1-2 | Coordinated, Orchestrator may assist |
| 7-8 | Complex | 2-4 | Orchestrator leads, parallel or sequential |
| 9-10 | Critical | All relevant | Council convenes, Prime synthesizes |

---

## Layer 2: Memory Recall

Before reasoning begins, check the vaults. This is not optional — skipping memory recall means repeating mistakes and losing compound intelligence.

```
Query Order:
1. Operational Vault  — What is the current state?
2. Domain Vault       — What patterns exist for this type of task?
   (Technical, Creative, or Strategic depending on intent)
3. Wisdom Vault       — What principles apply?
4. Horizon Vault      — Does this touch alignment or values?

Weight recalled entries by:
  Relevance  — How closely does this match the current request?
  Recency    — How recent is the entry?
  Confidence — How confident was the original entry?
  Outcome    — Did the recalled approach succeed last time?
```

---

## Layer 3: Reasoning

### Reasoning Modes

| Mode | Trigger | Method |
|------|---------|--------|
| **Analytical** | Clear problem, needs solution | Decompose, evaluate options, select |
| **Strategic** | Ambiguous situation, needs direction | Map futures, assess trade-offs |
| **Creative** | Open-ended, needs innovation | Diverge, connect, converge |
| **Systems** | Complex interactions, holistic view needed | Map connections, find leverage points |
| **Evaluative** | Existing work, needs assessment | Apply criteria, identify gaps |
| **Temporal** | Long-horizon, alignment questions | Consider multi-generational impact |

### The Reasoning Protocol

For every non-trivial request:

```
1. KNOWN    — What facts do I have? (context + vault recall)
2. UNKNOWN  — What gaps exist? (missing info, uncertainties)
3. PATTERNS — What has worked before? (vault history, skill library)
4. OPTIONS  — What are 2-3 approaches? (never just one)
5. TRADEOFFS — What does each option cost? (time, risk, complexity)
6. DECISION — What do I recommend? (with confidence score)
7. MEMORY   — What should I store? (for future sessions)
```

---

## Layer 4: Routing

Full routing logic in `ROUTING_MATRIX.md`. Quick reference:

```
Building systems?           → Architect
Coordinating work?          → Orchestrator
Protecting quality?         → Sentinel
Understanding knowledge?    → Sage
Creating something?         → Weaver
Navigating the future?      → Navigator
Multiple domains?           → Orchestrator coordinates
Everything at once?         → Council (Prime synthesizes)
```

---

## Layer 5: Execution

See `ORCHESTRATION_ENGINE.md` for multi-agent coordination patterns.

Single-agent execution is straightforward: the agent processes the request using its domain expertise and activated skills.

Multi-agent execution follows one of six patterns: Direct, Sequential, Parallel, Iterative, Cascade, or Broadcast.

---

## Layer 6: Synthesis

See `SYNTHESIS_PROTOCOL.md` for the complete synthesis system.

When multiple agents contribute, their outputs are merged using one of five modes: Weighted Consensus, Sequential Refinement, Aggregation, Conflict Resolution, or Creative Synthesis.

---

## Layer 7: Memory Write

After every significant interaction, update the vaults:

```
1. EXTRACT  — What was learned, decided, or discovered?
2. CLASSIFY — Which vault(s)?
   Decision made      → Strategic Vault
   Pattern found      → Technical Vault
   Creative insight   → Creative Vault
   State change       → Operational Vault
   Principle confirmed → Wisdom Vault
   Values/alignment   → Horizon Vault
3. STORE    — With timestamp, context, confidence score, links
4. INDEX    — Update vault indices for retrieval
5. TRANSMIT — If cross-system, send via appropriate channel
```

---

## Intelligence Amplification

These four patterns explain why Starlight gets smarter over time:

**Compound Knowledge** — Vault entries build on each other. Session 100 has access to everything learned in sessions 1-99.

**Cross-Pollination** — Insights from one domain inform another. AI-Ops memory research improves Arcanea creative workflows. Technical patterns inspire strategic frameworks.

**Recursive Improvement** — The system tracks which routing decisions, agent selections, and skill activations produced good outcomes. It favors what works.

**Ecosystem Awareness** — Through the Context Engine, every decision considers the state of all connected projects. No decision is made in isolation.

---

*Intelligence is not about knowing everything. It is about knowing what matters, remembering what works, and connecting what others miss.*
