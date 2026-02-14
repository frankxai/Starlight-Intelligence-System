# Starlight Skill Architecture

> *"Skills are knowledge made executable. The difference between knowing and doing."*

---

## Overview

The Starlight Skill Architecture defines how capabilities are organized, activated, and composed within the intelligence system. Inspired by ACOS's skill-based system and Arcanea's hierarchical naming, Starlight skills are markdown-defined capabilities that auto-activate based on context.

---

## Skill Hierarchy

```
STARLIGHT SKILL SYSTEM
=======================

Layer 1: CATEGORIES (4 domains)
  Intelligence, Orchestration, Memory, Integration

Layer 2: SKILLS (16 capabilities)
  4 skills per category

Layer 3: PROCEDURES (within each skill)
  Specific step-by-step protocols
```

---

## Skill Categories

### Intelligence Skills
Core reasoning and thinking capabilities.

| Skill | File | Purpose |
|-------|------|---------|
| Strategic Reasoning | `intelligence/strategic-reasoning/SKILL.md` | Long-term thinking, trade-off analysis |
| Systems Thinking | `intelligence/systems-thinking/SKILL.md` | Holistic analysis, feedback loops |
| Pattern Recognition | `intelligence/pattern-recognition/SKILL.md` | Identifying recurring patterns |
| Decision Framework | `intelligence/decision-framework/SKILL.md` | Structured decision-making |

### Orchestration Skills
Coordination and execution capabilities.

| Skill | File | Purpose |
|-------|------|---------|
| Multi-Agent Coordination | `orchestration/multi-agent-coordination/SKILL.md` | Agent team management |
| Workflow Design | `orchestration/workflow-design/SKILL.md` | Creating execution workflows |
| Context Engineering | `orchestration/context-engineering/SKILL.md` | Managing AI context quality |
| Parallel Execution | `orchestration/parallel-execution/SKILL.md` | Running concurrent tasks |

### Memory Skills
Persistence and knowledge capabilities.

| Skill | File | Purpose |
|-------|------|---------|
| Vault Management | `memory/vault-management/SKILL.md` | Read/write/query vault operations |
| Knowledge Synthesis | `memory/knowledge-synthesis/SKILL.md` | Combining knowledge sources |
| Context Preservation | `memory/context-preservation/SKILL.md` | Saving/restoring context |
| Memory Consolidation | `memory/memory-consolidation/SKILL.md` | Optimizing stored memory |

### Integration Skills
Cross-system connection capabilities.

| Skill | File | Purpose |
|-------|------|---------|
| Repo Bridge | `integration/repo-bridge/SKILL.md` | Cross-repository operations |
| Ecosystem Sync | `integration/ecosystem-sync/SKILL.md` | Multi-system synchronization |
| Transmission Protocol | `integration/transmission-protocol/SKILL.md` | Cross-system communication |
| Universal Adapter | `integration/universal-adapter/SKILL.md` | External system integration |

---

## Auto-Activation System

Skills activate automatically based on `skill-rules.json`. This follows the ACOS pattern where context triggers load appropriate skills without explicit invocation.

### How Auto-Activation Works

```
1. User request arrives at Intelligence Core
2. Request is analyzed for intent, entities, and keywords
3. skill-rules.json is consulted for matching rules
4. Matching skills are loaded into agent context
5. Agent executes with skill knowledge available
6. Skills deactivate when task completes
```

### Activation Priority

```
Priority 1: EXACT MATCH
  Request explicitly names the skill.
  Example: "Use the decision framework"

Priority 2: KEYWORD MATCH
  Request contains skill trigger keywords.
  Example: "analyze the trade-offs" → decision-framework

Priority 3: AGENT DEFAULT
  Agent's default skills activate automatically.
  Example: Architect always has systems-thinking

Priority 4: CONTEXT INFERENCE
  System infers skill need from conversation context.
  Example: Multi-repo discussion → repo-bridge
```

---

## Skill File Structure

Every skill follows this structure:

```markdown
# [Skill Name]
> [One-line purpose]

## When This Skill Activates
[Trigger conditions]

## What This Skill Does
[Core capability description]

## Procedures
### Procedure 1: [Name]
[Step-by-step protocol]

### Procedure 2: [Name]
[Step-by-step protocol]

## Integration Points
[How this skill connects to agents, vaults, transmissions]

## Quality Criteria
[How to know this skill was applied well]
```

---

## Skill Composition

Skills can compose together for complex tasks:

```
COMPOSITION PATTERNS
====================

Sequential: Skill A → Skill B → Skill C
  Example: strategic-reasoning → decision-framework → context-preservation
  Use: Making and recording a strategic decision

Parallel: Skill A + Skill B simultaneously
  Example: systems-thinking + pattern-recognition
  Use: Analyzing a complex system for recurring patterns

Nested: Skill A uses Skill B as a sub-step
  Example: knowledge-synthesis uses vault-management internally
  Use: Synthesizing knowledge requires reading from vaults

Conditional: IF condition THEN Skill A ELSE Skill B
  Example: IF cross-repo THEN repo-bridge ELSE direct
  Use: Adapting approach based on task scope
```

---

## Token Budget Strategy

Inspired by Arcanea's token budget approach:

| Skill Load Level | Tokens | When |
|-----------------|--------|------|
| **Metadata only** | ~50 | Skill index lookup |
| **Summary** | ~200 | Activation decision |
| **Core procedures** | ~500-1k | Standard activation |
| **Full skill** | ~1-2k | Deep application |

**Rule:** Load the minimum level needed. Escalate only if the task demands it.

---

## Creating New Skills

1. Create `skills/[category]/[skill-name]/SKILL.md`
2. Follow the Skill File Structure template
3. Add activation rule to `skill-rules.json`
4. Associate with relevant agents
5. Define vault read/write permissions
6. Test activation with sample requests

---

*"A skill is not just knowledge. It is knowledge that knows when to apply itself."*
