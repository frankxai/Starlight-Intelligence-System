# Starlight Agent Registry

> *"Seven minds. One purpose. Infinite capability."*

---

## Overview

The Starlight Intelligence System operates through 7 specialized agents, each embodying a distinct intelligence domain. All agents inherit the Frank DNA and operate under the coordination of Starlight Prime.

---

## Agent Hierarchy

```
                    STARLIGHT PRIME
                   (Meta-Intelligence)
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────┴─────┐  ┌────┴────┐  ┌─────┴─────┐
    │ ARCHITECT │  │ORCHESTR.│  │ SENTINEL  │
    │ (Build)   │  │(Coord.) │  │ (Protect) │
    └───────────┘  └─────────┘  └───────────┘
          │              │              │
    ┌─────┴─────┐  ┌────┴────┐  ┌─────┴─────┐
    │   SAGE    │  │ WEAVER  │  │ NAVIGATOR │
    │ (Know)    │  │(Create) │  │ (Plan)    │
    └───────────┘  └─────────┘  └───────────┘
```

---

## Agent Index

| # | Agent | File | Domain | Activation |
|---|-------|------|--------|------------|
| 0 | **Starlight Prime** | `starlight-prime.md` | Meta-intelligence, unified mind | Council, meta, complex |
| 1 | **Starlight Architect** | `starlight-architect.md` | Enterprise AI, system design | Architecture, scaling, infrastructure |
| 2 | **Starlight Orchestrator** | `starlight-orchestrator.md` | Multi-agent coordination | Workflow, parallel, coordination |
| 3 | **Starlight Sentinel** | `starlight-sentinel.md` | Quality, security, governance | Review, audit, validation |
| 4 | **Starlight Sage** | `starlight-sage.md` | Wisdom, learning, teaching | Knowledge, explanation, guidance |
| 5 | **Starlight Weaver** | `starlight-weaver.md` | Creative intelligence | Creation, synthesis, innovation |
| 6 | **Starlight Navigator** | `starlight-navigator.md` | Strategic foresight | Strategy, planning, navigation |

---

## Agent Capabilities Matrix

| Capability | Prime | Architect | Orchestrator | Sentinel | Sage | Weaver | Navigator |
|-----------|-------|-----------|-------------|----------|------|--------|-----------|
| System Design | | **PRIMARY** | | | | | |
| Multi-Agent Coord | | | **PRIMARY** | | | | |
| Quality Review | | | | **PRIMARY** | | | |
| Knowledge Mgmt | | | | | **PRIMARY** | | |
| Creative Work | | | | | | **PRIMARY** | |
| Strategy | | | | | | | **PRIMARY** |
| Council Chair | **PRIMARY** | | | | | | |
| Vault Access | Full | Technical | Operational | Technical | Wisdom | Creative | Strategic |
| Transmission | All | ACOS, AI-Ops | All | All | All | Arcanea | All |

---

## Agent Interaction Patterns

### Council Formation
When Starlight Prime convenes the council, agents interact as follows:

```
1. Prime poses the question to all relevant agents
2. Each agent analyzes from their domain perspective
3. Agents may reference each other's capabilities:
   - Architect asks Sentinel about security implications
   - Navigator asks Architect about technical feasibility
   - Weaver asks Sage about knowledge foundations
4. Prime synthesizes all perspectives using Synthesis Protocol
5. Result stored in appropriate Vault + Note created
```

### Peer Collaboration
Agents can invoke each other without Council:

```
Architect → Sentinel:  "Review this design for security"
Weaver → Sage:         "What patterns inform this creation?"
Navigator → Architect: "Is this strategy technically viable?"
Orchestrator → All:    "Coordinate on this workflow"
```

---

## Agent Loading Strategy

### Progressive Disclosure (Token Optimization)

```
Level 1: Agent Name + Role     (~50 tokens)
  "Starlight Architect - Enterprise AI System Design"

Level 2: Core Capabilities     (~200 tokens)
  Key capabilities, primary skills

Level 3: Full Agent Profile    (~1-4k tokens)
  Complete agent definition with all context

Level 4: Agent + Vault Context (~4-8k tokens)
  Full agent + relevant vault entries
```

**Load Level 3+ ONLY when the agent is confirmed as the primary handler.**

---

## Adding New Agents

To add a new Starlight agent:

1. Create `agents/starlight-[name].md` following the agent template
2. Add entry to this registry
3. Update `core/ROUTING_MATRIX.md` with routing rules
4. Add skill associations in `skills/skill-rules.json`
5. Define vault access permissions
6. Define transmission channel access

### Agent Template Structure

```markdown
# Starlight [Name]
> [One-line essence]

## Identity & Purpose
[Who this agent is and why it exists]

## Core Capabilities
[What this agent can do - numbered list]

## Domain Expertise
[Specific areas of deep knowledge]

## Reasoning Approach
[How this agent thinks and decides]

## Interaction Patterns
[How this agent works with other agents]

## Vault Access
[Which vaults this agent reads/writes]

## Skill Activations
[Which skills auto-activate for this agent]

## Quality Gates
[Criteria for this agent's output quality]
```

---

*"Each agent is a facet of one intelligence. Together, they see what none could see alone."*
