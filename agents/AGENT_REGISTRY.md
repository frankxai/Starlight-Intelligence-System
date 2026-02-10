# Starlight Agent Registry

> Seven minds. One system. No hierarchy is permanent — only the mission is.

---

## Architecture

The Starlight agent system uses a **flat council with emergent leadership**. No single agent permanently outranks another. Leadership emerges based on the task at hand.

For any given task, one agent leads. The others support, challenge, or defer. The Starlight Council convenes when no single agent can handle the complexity alone.

```
                        ┌──────────────────────┐
                        │   STARLIGHT COUNCIL   │
                        │                      │
                        │  Convenes for major   │
                        │  decisions. All agents│
                        │  contribute. Prime    │
                        │  synthesizes.         │
                        └──────────┬───────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
   ┌──────────▼──────────┐ ┌──────▼──────┐ ┌──────────▼──────────┐
   │  ORCHESTRATOR        │ │  PRIME      │ │  ARCHITECT           │
   │  Coordination.       │ │  Synthesis. │ │  Enterprise systems. │
   │  Multi-agent flows.  │ │  The voice  │ │  Planet-scale design.│
   │  Workflow routing.   │ │  of unified │ │  Technical vision.   │
   │                      │ │  reasoning. │ │                      │
   └──────────┬───────────┘ └──────┬──────┘ └──────────┬───────────┘
              │                    │                    │
   ┌──────────▼──────────┐ ┌──────▼──────┐ ┌──────────▼──────────┐
   │  NAVIGATOR           │ │  SENTINEL   │ │  WEAVER              │
   │  Strategic foresight. │ │  Quality.   │ │  Creative synthesis. │
   │  Roadmaps. Timing.   │ │  Security.  │ │  Narrative. Design.  │
   │  Trade-off analysis.  │ │  Trust.     │ │  Pattern weaving.    │
   └──────────┬───────────┘ └──────┬──────┘ └──────────┬───────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                        ┌──────────▼───────────┐
                        │   SAGE                │
                        │  Wisdom keeper.       │
                        │  Vault guardian.       │
                        │  Institutional memory. │
                        └──────────────────────┘
```

### Why This Structure

The previous hierarchy placed Prime at the top of a strict tree. That implied Prime always leads. In practice, most tasks don't need meta-intelligence — they need the right specialist.

The new structure:

- **Leadership Tier** (Orchestrator, Prime, Architect) — these three handle the most complex coordination, synthesis, and technical tasks. They peer with each other, not above each other.
- **Specialist Tier** (Navigator, Sentinel, Weaver) — deep domain expertise. They lead within their domains.
- **Foundation Tier** (Sage) — the long memory. Sage doesn't lead tasks but informs every decision through vault access.
- **Council** — all agents together. Convenes for complexity 9-10 tasks.

---

## Agent Index

| Agent | File | Domain | Leads When |
|-------|------|--------|-----------|
| **Orchestrator** | `starlight-orchestrator.md` | Coordination | Multi-step workflows, parallel tasks, agent routing |
| **Prime** | `starlight-prime.md` | Synthesis | Conflicting perspectives, council decisions, unified voice needed |
| **Architect** | `starlight-architect.md` | Enterprise Systems | System design, infrastructure, APIs, planet-scale architecture |
| **Navigator** | `starlight-navigator.md` | Strategy | Roadmaps, trade-offs, timing, long-horizon planning |
| **Sentinel** | `starlight-sentinel.md` | Quality | Security review, code quality, governance, compliance |
| **Weaver** | `starlight-weaver.md` | Creation | Creative work, narrative, design, pattern synthesis |
| **Sage** | `starlight-sage.md` | Wisdom | Knowledge retrieval, lessons learned, vault access, teaching |

---

## Capabilities Matrix

| Capability | Orchestrator | Prime | Architect | Navigator | Sentinel | Weaver | Sage |
|-----------|-------------|-------|-----------|-----------|----------|--------|------|
| Task Routing | **PRIMARY** | | | | | | |
| Perspective Synthesis | | **PRIMARY** | | | | | |
| System Design | | | **PRIMARY** | | | | |
| Strategic Planning | | | | **PRIMARY** | | | |
| Quality Review | | | | | **PRIMARY** | | |
| Creative Production | | | | | | **PRIMARY** | |
| Knowledge Management | | | | | | | **PRIMARY** |
| Council Chair | | **PRIMARY** | | | | | |
| Vault Access | Operational | All | Technical | Strategic | Technical | Creative | Wisdom, Horizon |
| Transmission | All | All | ACOS, AI-Ops | All | All | Arcanea | All |

---

## Interaction Patterns

### Task Routing (Default Path)

```
Request arrives
    │
    ├─ Complexity 1-3: Direct to best-fit agent
    ├─ Complexity 4-6: Orchestrator coordinates 1-2 agents
    ├─ Complexity 7-8: Orchestrator + Architect collaborate
    └─ Complexity 9-10: Council convenes, Prime synthesizes
```

### Peer Collaboration

Agents invoke each other as needed:

```
Architect → Sentinel:  "Review this design for vulnerabilities"
Navigator → Architect: "Is this strategy technically feasible?"
Weaver → Sage:         "What patterns inform this creative direction?"
Orchestrator → Any:    "Handle this sub-task"
Prime → All:           "Council: weigh in on this decision"
Sage → Any:            "Historical context you should know about"
```

### Council Formation

```
1. Orchestrator or Prime identifies council-level complexity
2. Relevant agents are activated (not always all 7)
3. Each agent analyzes from their domain perspective
4. Agents cross-reference each other's analysis
5. Prime synthesizes all perspectives using the Synthesis Protocol
6. Decision stored in Strategic Vault + Decision Note created
7. Relevant transmissions sent to ecosystem channels
```

---

## Loading Strategy

Progressive disclosure optimizes token usage:

```
Level 1: Name + Role          (~50 tokens)
Level 2: Core Capabilities    (~200 tokens)
Level 3: Full Agent Profile   (~1-4K tokens)
Level 4: Agent + Vault Context (~4-8K tokens)
```

Load Level 3+ only when the agent is confirmed as the primary handler for the current task.

---

## Adding New Agents

1. Create `agents/starlight-{name}.md` following the template below
2. Add entry to this registry
3. Update `core/ROUTING_MATRIX.md` with routing rules
4. Add skill associations in `skills/skill-rules.json`
5. Define vault access permissions
6. Define transmission channel access

### Template

```markdown
# Starlight {Name}

> {One-line identity}

## Identity

{Who this agent is, what it does, why it exists}

## Capabilities

{Numbered list of core capabilities}

## Domain Expertise

{Areas of deep knowledge}

## Reasoning Protocol

{How this agent thinks and decides}

## Interactions

{How this agent works with other agents, vaults, transmissions}

## Skill Activations

{Which skills auto-activate}

## Quality Gates

{Output quality criteria}
```

---

*Each agent is a facet of one intelligence. Together, they see what none could see alone.*
