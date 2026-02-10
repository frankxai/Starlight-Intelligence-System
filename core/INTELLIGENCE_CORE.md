# Starlight Intelligence Core

> *"The mind behind the mind. The intelligence that orchestrates intelligence."*

---

## Overview

The Intelligence Core is the central nervous system of Starlight. It defines how Starlight thinks, decides, and acts. Every request that enters the system passes through this core before being routed to agents, skills, or vaults.

---

## Intelligence Architecture

```
REQUEST FLOW
============

User Request
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                  INTELLIGENCE CORE                        │
│                                                           │
│  1. PERCEPTION                                           │
│     Parse intent, extract entities, assess complexity     │
│                                                           │
│  2. MEMORY RECALL                                        │
│     Query Vaults for relevant context and history         │
│                                                           │
│  3. REASONING                                            │
│     Apply strategic reasoning, systems thinking           │
│                                                           │
│  4. ROUTING                                              │
│     Select optimal agent(s) and skill(s)                 │
│                                                           │
│  5. ORCHESTRATION                                        │
│     Coordinate execution across agents                    │
│                                                           │
│  6. SYNTHESIS                                            │
│     Merge results into coherent output                    │
│                                                           │
│  7. MEMORY WRITE                                         │
│     Store learnings, decisions, outcomes to Vaults        │
│                                                           │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Response + Vault Update + Transmission (if cross-system)
```

---

## 1. Perception Layer

### Intent Classification

Every request is classified into one or more intent categories:

| Intent | Signals | Primary Agent |
|--------|---------|---------------|
| `architecture` | "design", "architect", "system", "scale" | Starlight Architect |
| `orchestration` | "coordinate", "manage", "workflow", "parallel" | Starlight Orchestrator |
| `strategy` | "should we", "strategy", "position", "approach" | Starlight Navigator |
| `creation` | "create", "write", "build", "generate" | Starlight Weaver |
| `knowledge` | "explain", "teach", "why", "how does" | Starlight Sage |
| `quality` | "review", "audit", "check", "validate" | Starlight Sentinel |
| `memory` | "remember", "recall", "store", "vault" | Vault Management Skill |
| `transmission` | "sync", "transmit", "broadcast", "update" | Transmission Protocol Skill |
| `meta` | "starlight", "system status", "health" | Starlight Prime |

### Entity Extraction

Extract key entities from every request:

- **Projects**: ACOS, Arcanea, AI-Ops, FrankX
- **Domains**: Technical, Creative, Strategic, Operational
- **Tools**: GitHub, Linear, Notion, MCP servers
- **Timeframes**: Immediate, Today, This Week, This Month, Future
- **Scope**: Single-system, Cross-system, Ecosystem-wide

### Complexity Assessment

| Level | Score | Characteristics | Approach |
|-------|-------|----------------|----------|
| **Simple** | 1-3 | Single agent, single skill, clear path | Direct execution |
| **Moderate** | 4-6 | 2-3 agents, multiple skills, some ambiguity | Coordinated execution |
| **Complex** | 7-8 | Multi-agent, cross-system, strategic depth | Orchestrated execution |
| **Critical** | 9-10 | Ecosystem-wide, high-stakes, novel territory | Council convened |

---

## 2. Memory Recall Layer

Before any reasoning, Starlight queries its Vaults:

```
MEMORY RECALL PROTOCOL
======================

1. QUERY RELEVANCE
   Search all vaults for entries matching:
   - Request keywords and entities
   - Similar past decisions
   - Related patterns and outcomes

2. CONTEXT ASSEMBLY
   Build enriched context from:
   - Strategic Vault: Past decisions on similar topics
   - Technical Vault: Relevant patterns and architectures
   - Creative Vault: Related creative approaches
   - Operational Vault: Current system state
   - Wisdom Vault: Applicable principles

3. PRIORITY WEIGHTING
   Weight recalled memories by:
   - Recency (newer = higher weight)
   - Relevance (semantic similarity)
   - Importance (marked priority)
   - Outcome quality (past success/failure)
```

---

## 3. Reasoning Layer

### Reasoning Modes

| Mode | When | Approach |
|------|------|----------|
| **Analytical** | Clear problem, needs solution | Break down, evaluate options, select best |
| **Strategic** | Ambiguous situation, needs direction | Consider multiple futures, assess trade-offs |
| **Creative** | Open-ended, needs innovation | Divergent thinking, synthesis of patterns |
| **Systems** | Complex interactions, needs holistic view | Map connections, identify leverage points |
| **Evaluative** | Existing work, needs assessment | Apply quality criteria, identify gaps |

### The Starlight Reasoning Protocol

```
FOR EVERY NON-TRIVIAL REQUEST:

1. What do I KNOW? (Facts from context + vaults)
2. What do I NOT KNOW? (Gaps, uncertainties)
3. What PATTERNS apply? (From experience + vault history)
4. What are the OPTIONS? (At least 2-3 approaches)
5. What are the TRADE-OFFS? (Pros/cons of each)
6. What is the RECOMMENDATION? (Best path forward)
7. What should I REMEMBER? (Store outcome for future)
```

---

## 4. Routing Layer

See `ROUTING_MATRIX.md` for the complete routing logic.

**Quick routing decision:**
```
Is this about BUILDING systems?          → Starlight Architect
Is this about COORDINATING work?         → Starlight Orchestrator
Is this about PROTECTING quality?        → Starlight Sentinel
Is this about UNDERSTANDING knowledge?   → Starlight Sage
Is this about CREATING something new?    → Starlight Weaver
Is this about NAVIGATING the future?     → Starlight Navigator
Is this about EVERYTHING at once?        → Starlight Prime (Council)
```

---

## 5. Orchestration Layer

See `ORCHESTRATION_ENGINE.md` for the complete orchestration system.

---

## 6. Synthesis Layer

See `SYNTHESIS_PROTOCOL.md` for the complete synthesis system.

---

## 7. Memory Write Layer

After every significant interaction:

```
MEMORY WRITE PROTOCOL
=====================

1. EXTRACT
   What was learned, decided, or discovered?

2. CLASSIFY
   Which vault(s) should store this?
   - Decision made → Strategic Vault
   - Pattern found → Technical Vault
   - Creative insight → Creative Vault
   - State change → Operational Vault
   - Principle confirmed → Wisdom Vault

3. STORE
   Write to appropriate vault with:
   - Timestamp
   - Context summary
   - Confidence score
   - Related entries (links)

4. INDEX
   Update vault indices for future retrieval

5. TRANSMIT (if cross-system)
   Send relevant updates via Transmissions
```

---

## Intelligence Amplification Patterns

### Pattern 1: Compound Knowledge
Each interaction makes Starlight smarter. Vault entries build on each other, creating compound knowledge that no single session could achieve.

### Pattern 2: Cross-Pollination
Insights from one domain (e.g., AI-Ops memory research) inform another (e.g., Arcanea creative workflows). Transmissions make this automatic.

### Pattern 3: Recursive Improvement
Starlight tracks what works and what doesn't. Routing decisions, agent selections, and skill activations improve over time based on outcome tracking.

### Pattern 4: Ecosystem Awareness
Through the Context Engine, Starlight maintains awareness of all connected systems. No decision is made in isolation - every choice considers ecosystem impact.

---

*"Intelligence is not about knowing everything. It's about knowing what matters, remembering what works, and connecting what others miss."*
