# Starlight Orchestration Engine

> *"One conductor. Many instruments. One symphony."*

---

## Overview

The Orchestration Engine coordinates multi-agent execution across the Starlight system. It determines how agents collaborate, when to run in parallel vs. sequential, and how to synthesize multi-agent results.

---

## Orchestration Patterns

### Pattern 1: Direct (Single Agent)

```
User Request → Agent → Response
```

**When:** Simple, clear requests within one domain.
**Example:** "Design a microservices architecture" → Starlight Architect

### Pattern 2: Sequential (Agent Pipeline)

```
User Request → Agent A → Agent B → Agent C → Response
```

**When:** Tasks that build on each other with dependencies.
**Example:** "Design and validate a new system"
1. Starlight Architect → Design the system
2. Starlight Sentinel → Validate quality and security
3. Starlight Navigator → Assess strategic fit

### Pattern 3: Parallel (Multi-Agent Council)

```
User Request → ┌─ Agent A ─┐
               ├─ Agent B ─┤ → Synthesis → Response
               └─ Agent C ─┘
```

**When:** Need multiple expert perspectives simultaneously.
**Example:** "Should we rebuild the content pipeline?"
- Starlight Architect → Technical feasibility
- Starlight Navigator → Strategic timing
- Starlight Weaver → Creative impact

### Pattern 4: Iterative (Refinement Loop)

```
User Request → Agent A → Review → Agent B → Refine → Agent A → Response
```

**When:** Quality refinement or design iteration needed.
**Example:** "Create and polish a strategic document"
1. Starlight Weaver → Draft content
2. Starlight Sentinel → Quality review
3. Starlight Weaver → Refine based on feedback

### Pattern 5: Cascade (Escalating Complexity)

```
User Request → Simple Agent → Insufficient? → Complex Agent → Still? → Council
```

**When:** Uncertain complexity - start simple, escalate as needed.
**Example:** "Help with this problem" (ambiguous)
1. Try: Starlight Sage → Explain/teach
2. If deeper: Starlight Architect → Design solution
3. If strategic: Convene Council

### Pattern 6: Broadcast (One-to-Many)

```
Event → ┌─ Vault Update
        ├─ Transmission Sent
        ├─ Notes Created
        └─ Context Updated
```

**When:** Significant events that affect multiple systems.
**Example:** Major architectural decision made
- Store in Strategic Vault
- Transmit to ACOS and Arcanea channels
- Create Decision Note
- Update unified context

---

## Agent Activation Protocol

### Activation Costs

Each agent activation consumes context tokens. The Orchestration Engine optimizes for minimum token cost:

| Agent | Estimated Token Load | Priority |
|-------|---------------------|----------|
| Starlight Prime | ~5k | Only for meta/council |
| Starlight Architect | ~4k | Architecture tasks |
| Starlight Orchestrator | ~3k | Multi-agent coordination |
| Starlight Sentinel | ~3k | Quality/security checks |
| Starlight Sage | ~3k | Knowledge/teaching |
| Starlight Weaver | ~4k | Creative synthesis |
| Starlight Navigator | ~4k | Strategic planning |

### Activation Rules

```
ACTIVATION DECISION
===================

1. MINIMUM AGENTS
   Always use the minimum number of agents needed.
   One agent is preferred over two when possible.

2. PROGRESSIVE LOADING
   Load agent metadata first (~100 tokens).
   Only load full agent if confirmed needed.

3. PARALLEL LIMIT
   Maximum 3 agents active simultaneously.
   Queue additional agents if needed.

4. DEACTIVATION
   Release agent context as soon as task completes.
   Don't hold agents "just in case."

5. COUNCIL THRESHOLD
   Only convene full council for complexity 9-10.
   Partial council (2-3 agents) for complexity 7-8.
```

---

## Workflow Templates

### Template: Strategic Decision

```yaml
name: strategic-decision
trigger: Major decision with business impact
pattern: parallel
agents:
  - starlight-navigator (weight: 0.4)
  - starlight-architect (weight: 0.3)
  - starlight-weaver (weight: 0.2)
  - starlight-sentinel (weight: 0.1)
synthesis: weighted-consensus
vault_write: strategic-vault
note_type: decision-note
```

### Template: System Design

```yaml
name: system-design
trigger: Architecture or system design request
pattern: sequential
agents:
  - starlight-architect (primary)
  - starlight-sentinel (review)
synthesis: sequential-refinement
vault_write: technical-vault
note_type: insight-note
```

### Template: Creative Production

```yaml
name: creative-production
trigger: Content creation or creative work
pattern: iterative
agents:
  - starlight-weaver (create)
  - starlight-sentinel (review)
  - starlight-weaver (refine)
synthesis: quality-gated
vault_write: creative-vault
note_type: session-note
```

### Template: Knowledge Transfer

```yaml
name: knowledge-transfer
trigger: Learning, explaining, or teaching
pattern: direct
agents:
  - starlight-sage (primary)
synthesis: none
vault_write: wisdom-vault
note_type: learning-note
```

### Template: Cross-System Sync

```yaml
name: cross-system-sync
trigger: Multi-repo coordination needed
pattern: broadcast
agents:
  - starlight-orchestrator (coordinate)
synthesis: aggregation
vault_write: operational-vault
transmission: broadcast-channel
```

---

## Error Handling

### Agent Failure

```
IF agent fails to produce useful output:
  1. Retry with refined context (1 attempt)
  2. Fall back to Starlight Prime (general intelligence)
  3. Log failure pattern to Operational Vault
  4. Notify user of degraded capability
```

### Orchestration Deadlock

```
IF workflow gets stuck between agents:
  1. Identify blocking step
  2. Break into smaller sub-tasks
  3. Execute sub-tasks independently
  4. Reassemble results
  5. If still stuck, escalate to user
```

### Token Budget Exceeded

```
IF approaching token limits:
  1. Summarize current state to Notes
  2. Store intermediate results in Vaults
  3. Create continuation plan
  4. Provide user with session handoff
```

---

## Orchestration Metrics

Track and optimize:

| Metric | Target | Purpose |
|--------|--------|---------|
| Routing accuracy | >90% | Right agent for right task |
| First-attempt success | >80% | Minimize retries |
| Token efficiency | <8k avg per request | Minimize context waste |
| Multi-agent overhead | <20% | Coordination cost vs. value |
| Cross-system latency | <5s | Transmission speed |

---

*"The best orchestration is invisible. The user sees results, not the machinery."*
