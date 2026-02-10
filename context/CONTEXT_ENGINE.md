# Starlight Context Engine

> *"Context is everything. Without it, intelligence is just noise."*

---

## Overview

The Starlight Context Engine is the unified system that assembles, manages, and optimizes context for all intelligence operations. It pulls from Vaults, Notes, Transmissions, and repo-specific context files to build the perfect context for any task.

Inspired by ACOS v4's context engineering patterns and AI-Ops research on knowledge management.

---

## Architecture

```
CONTEXT ENGINE
==============

┌────────────────────────────────────────────┐
│              CONTEXT ASSEMBLER              │
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  VAULT   │  │   NOTE   │  │ TRANS-   │ │
│  │  READER  │  │  READER  │  │ MISSION  │ │
│  │          │  │          │  │ READER   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │              │              │       │
│  ┌────▼──────────────▼──────────────▼────┐ │
│  │         CONTEXT MERGER                │ │
│  │   (dedup, prioritize, trim)           │ │
│  └────────────────┬──────────────────────┘ │
│                   │                         │
│  ┌────────────────▼──────────────────────┐ │
│  │         CONTEXT OPTIMIZER             │ │
│  │   (token budget, relevance filter)    │ │
│  └────────────────┬──────────────────────┘ │
│                   │                         │
│  ┌────────────────▼──────────────────────┐ │
│  │         UNIFIED CONTEXT               │ │
│  │   (ready for agent consumption)       │ │
│  └───────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

## Context Sources

### 1. Vault Context
Read from the five Starlight Vaults based on task relevance.
- **Strategic Vault** → Strategy/decision tasks
- **Technical Vault** → Architecture/engineering tasks
- **Creative Vault** → Content/creative tasks
- **Operational Vault** → State/coordination tasks
- **Wisdom Vault** → All tasks (always available)

### 2. Note Context
Read from active Starlight Notes.
- **Session Notes** → Continuity from previous sessions
- **Decision Notes** → Recent decisions that may be relevant
- **Insight Notes** → Recent discoveries
- **Learning Notes** → Recent learnings

### 3. Transmission Context
Read from Transmission channels for cross-system awareness.
- **ACOS Channel** → ACOS state and updates
- **Arcanea Channel** → Creative intelligence updates
- **AI-Ops Channel** → Infrastructure and research updates
- **Broadcast Channel** → System-wide announcements

### 4. Repo Context
Read from dedicated repo context files.
- **acos-context.md** → ACOS architecture, capabilities, patterns
- **arcanea-context.md** → Arcanea architecture, capabilities, patterns
- **ai-ops-context.md** → AI-Ops architecture, capabilities, patterns

---

## Context Assembly Process

### Step 1: Classify the Task

```
Task arrives → Analyze for:
  - Domain (strategic, technical, creative, operational)
  - Scope (single-repo, cross-repo, ecosystem-wide)
  - Complexity (simple, moderate, complex, council-level)
  - Required agents
```

### Step 2: Select Context Sources

```
Based on classification:
  - ALWAYS load: Wisdom Vault (core principles)
  - IF strategic → Strategic Vault + Navigator context
  - IF technical → Technical Vault + Architect context
  - IF creative → Creative Vault + Weaver context
  - IF operational → Operational Vault + Orchestrator context
  - IF cross-repo → Relevant repo contexts + Transmission channels
  - IF complex → Load all vaults at summary level
```

### Step 3: Merge and Deduplicate

```
1. Collect all selected context items
2. Remove exact duplicates
3. Merge near-duplicates (keep highest confidence)
4. Sort by relevance score:
   Relevance = (keyword_match * 0.4) + (recency * 0.3) + (confidence * 0.3)
```

### Step 4: Optimize for Token Budget

```
Token Budget Allocation:
  - System prompt (CLAUDE.md): ~2000 tokens (fixed)
  - Agent definition: ~1000 tokens (fixed per agent)
  - Skill definitions: ~500-2000 tokens (variable)
  - Vault context: ~1000-3000 tokens (variable)
  - Task context: remaining budget

IF total exceeds budget:
  1. Reduce vault entries (keep top N by relevance)
  2. Summarize rather than include full entries
  3. Drop lowest-priority skill definitions
  4. NEVER drop system prompt or agent definition
```

### Step 5: Deliver Unified Context

The assembled context is delivered as a structured document ready for agent consumption.

---

## Repo Context Files

Each connected repository has a dedicated context file that captures its architecture, capabilities, and patterns. These files are maintained by the Repo Bridge skill and updated via Transmissions.

```
context/
├── CONTEXT_ENGINE.md          # This file
├── unified-context.md         # Current assembled context (ephemeral)
└── repo-contexts/
    ├── acos-context.md        # ACOS architecture and capabilities
    ├── arcanea-context.md     # Arcanea architecture and capabilities
    └── ai-ops-context.md      # AI-Ops architecture and capabilities
```

---

## Context Quality Metrics

| Metric | Target | Action if Below |
|--------|--------|----------------|
| Relevance score | >0.7 average | Improve source selection |
| Token utilization | 60-80% of budget | Adjust loading strategy |
| Stale context ratio | <10% | Refresh stale sources |
| Cross-repo coverage | All connected repos | Update missing contexts |
| Assembly time | <2s | Optimize source queries |

---

*"The best context is invisible - it makes intelligence feel effortless."*
