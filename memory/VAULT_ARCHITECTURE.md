# Starlight Vault Architecture

> *"Memory is the foundation of intelligence. Without it, every session starts from zero."*

---

## Overview

Starlight Vaults are the persistent memory system of the Starlight Intelligence System. They store knowledge, decisions, patterns, and state across sessions, enabling compound intelligence that grows over time.

Inspired by AI-Ops research on memory hierarchies (Working -> Episodic -> Semantic -> Procedural) and the Graphiti model (Episode -> Entity -> Relationship -> Inference layers).

---

## The Five Vaults

```
STARLIGHT VAULTS
================

┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  STRATEGIC   │  │  TECHNICAL   │  │  CREATIVE    │           │
│  │  Vault       │  │  Vault       │  │  Vault       │           │
│  │              │  │              │  │              │           │
│  │  Decisions   │  │  Patterns    │  │  Ideas       │           │
│  │  Strategies  │  │  Architectures│  │  Inspirations│           │
│  │  Outcomes    │  │  Solutions   │  │  Insights    │           │
│  │              │  │              │  │              │           │
│  │  Permanent   │  │  Permanent   │  │  Permanent   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │ OPERATIONAL  │  │  WISDOM      │                              │
│  │  Vault       │  │  Vault       │                              │
│  │              │  │              │                              │
│  │  State       │  │  Principles  │                              │
│  │  Metrics     │  │  Lessons     │                              │
│  │  Workflows   │  │  Meta-knowledge│                            │
│  │              │  │              │                              │
│  │  Rolling 90d │  │  Permanent   │                              │
│  └──────────────┘  └──────────────┘                              │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Vault Specifications

### Strategic Vault
**File:** `vaults/strategic-vault.md`
**Purpose:** Stores strategic decisions, outcomes, and strategic intelligence.
**Retention:** Permanent
**Primary Writers:** Navigator, Prime
**Primary Readers:** All agents

**Entry Types:**
- Strategic decisions with rationale
- Strategy outcomes (what worked, what didn't)
- Priority frameworks and their results
- Competitive landscape observations
- Opportunity assessments

### Technical Vault
**File:** `vaults/technical-vault.md`
**Purpose:** Stores technical patterns, architectures, and solutions.
**Retention:** Permanent with periodic refinement
**Primary Writers:** Architect, Sentinel
**Primary Readers:** Architect, Sentinel, Orchestrator

**Entry Types:**
- Architecture decisions and patterns
- Technical solutions to specific problems
- Anti-patterns and their consequences
- Technology evaluations
- Performance benchmarks

### Creative Vault
**File:** `vaults/creative-vault.md`
**Purpose:** Stores creative insights, inspirations, and creative patterns.
**Retention:** Permanent
**Primary Writers:** Weaver
**Primary Readers:** Weaver, Sage

**Entry Types:**
- Creative approaches that worked well
- Voice and style patterns
- Content frameworks
- Creative block solutions
- Cross-pollination insights (ideas from one domain applied to another)

### Operational Vault
**File:** `vaults/operational-vault.md`
**Purpose:** Stores current system state, metrics, and operational data.
**Retention:** Rolling (90 days active, then archived)
**Primary Writers:** Orchestrator, Prime
**Primary Readers:** All agents

**Entry Types:**
- Current project states
- Workflow execution logs
- System health metrics
- Integration status
- Transmission logs
- Session continuity data

### Wisdom Vault
**File:** `vaults/wisdom-vault.md`
**Purpose:** Stores timeless principles, meta-knowledge, and accumulated wisdom.
**Retention:** Permanent (highest protection)
**Primary Writers:** Sage, Prime
**Primary Readers:** All agents

**Entry Types:**
- Validated principles (proven over time)
- Meta-patterns (patterns about patterns)
- Lessons learned from failures
- Cross-domain insights
- Philosophical foundations
- Teaching frameworks

---

## Vault Entry Format

Every vault entry follows this structure:

```markdown
### [YYYY-MM-DD] Entry Title

**Category:** [category tag]
**Confidence:** [0.0-1.0]
**Source:** [agent/session/external]
**Related:** [links to related entries]

[Content of the entry]

---
```

---

## Memory Hierarchy Integration

Mapping AI-Ops memory research to Starlight Vaults:

| Memory Type | AI-Ops Definition | Starlight Implementation |
|------------|-------------------|------------------------|
| **Working Memory** | Current session context | Active session context (ephemeral) |
| **Episodic Memory** | Specific events/experiences | Session Notes + Operational Vault |
| **Semantic Memory** | General knowledge/facts | Technical + Creative + Strategic Vaults |
| **Procedural Memory** | How-to knowledge | Skills + Wisdom Vault |

### Consolidation Flow

```
Working Memory (session)
  ↓ [session end - context-preservation skill]
Episodic Memory (Session Notes + Operational Vault)
  ↓ [periodic consolidation - memory-consolidation skill]
Semantic Memory (Technical/Creative/Strategic Vaults)
  ↓ [pattern promotion - over time]
Procedural Memory (Skills + Wisdom Vault)
```

---

## Vault Operations

### Write Operations

```
1. CLASSIFY: Which vault?
2. STRUCTURE: Follow entry format
3. SCORE: Assign confidence (0.0-1.0)
4. LINK: Connect to related entries
5. INDEX: Update vault index
6. TRANSMIT: If cross-system relevant, send Transmission
```

### Read Operations

```
1. QUERY: Keywords, tags, date range, confidence threshold
2. RANK: Sort by relevance (keyword match x recency x confidence)
3. RETURN: Top N entries
4. CONTEXT: Include related entries if beneficial
```

### Consolidation Operations

```
1. SCAN: Review entries in target vault
2. DEDUPLICATE: Merge similar entries
3. PROMOTE: Move validated patterns to higher-level vaults
4. ARCHIVE: Remove stale operational entries
5. REPORT: Generate health metrics
```

---

## Vault Access Control

| Agent | Strategic | Technical | Creative | Operational | Wisdom |
|-------|-----------|-----------|----------|-------------|--------|
| Prime | RW | RW | RW | RW | RW |
| Architect | R | **RW** | R | R | R |
| Orchestrator | R | R | R | **RW** | R |
| Sentinel | R | **RW** | R | RW | R |
| Sage | R | R | R | R | **RW** |
| Weaver | R | R | **RW** | R | R |
| Navigator | **RW** | R | R | R | R |

**RW** = Read/Write (bold = primary vault)
**R** = Read only

---

## Vault Health Metrics

| Metric | Healthy Range | Action if Unhealthy |
|--------|-------------|---------------------|
| Entry count per vault | 10-500 | Consolidate if >500, populate if <10 |
| Average confidence | >0.7 | Review low-confidence entries |
| Entries with zero reads | <20% | Archive unread entries |
| Duplicate rate | <5% | Run deduplication |
| Index accuracy | >95% | Rebuild index |
| Oldest operational entry | <90 days | Archive stale entries |

---

*"A vault is not a graveyard for data. It is a garden for knowledge."*
