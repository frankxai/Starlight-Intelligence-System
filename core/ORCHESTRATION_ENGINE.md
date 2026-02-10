# Starlight Orchestration Engine

> The system that coordinates agents, manages workflows, and ensures the right mind handles the right task.

---

## Orchestration Patterns

Six patterns for coordinating agent work. The Orchestrator selects the pattern based on task complexity, dependencies, and available agents.

### Direct

```
Request → Agent → Response
```

Single agent, single task, clear domain. Most requests use this pattern.

### Sequential

```
Request → Agent A → Agent B → Agent C → Response
```

Tasks that build on each other. Each agent's output feeds the next. Example: Architect designs, Sentinel reviews, Navigator assesses strategic fit.

### Parallel

```
Request → ┌─ Agent A ─┐
          ├─ Agent B ─┤ → Synthesis → Response
          └─ Agent C ─┘
```

Multiple expert perspectives on the same question. Outputs merge via the Synthesis Protocol. Example: "Should we restructure the API?" gets Technical (Architect) + Strategic (Navigator) + Quality (Sentinel) perspectives simultaneously.

### Iterative

```
Request → Agent A → Agent B → Agent A → Response
```

Create-review-refine loops. Quality improves at each step. Example: Weaver drafts, Sentinel reviews, Weaver refines.

### Cascade

```
Request → Simple → Insufficient? → Complex → Still? → Council
```

Start with the lightest approach. Escalate only if needed. Optimizes for token efficiency.

### Broadcast

```
Event → ┌─ Vault Update
        ├─ Transmission Sent
        ├─ Notes Created
        └─ Context Updated
```

One event triggers updates across multiple systems. Used for major decisions, state changes, and cross-system sync.

---

## Swarm Coordination

Absorbed from claude-flow's swarm intelligence patterns. For complex tasks that exceed single-agent capability:

### Consensus Protocol

When multiple agents work on the same problem:

```
1. Each agent produces an independent analysis
2. Analyses are compared for agreement and tension
3. Agreement points are accepted (high confidence)
4. Tension points are flagged for resolution
5. Prime or the leading agent synthesizes a unified position
6. Confidence score reflects consensus strength
```

### Fault Tolerance

```
Agent produces poor output?
  → Retry with refined context (1 attempt)
  → Fall back to nearest-domain peer agent
  → Log failure pattern to Operational Vault
  → If systemic, flag for human review

Workflow deadlocked between agents?
  → Identify the blocking step
  → Break into smaller independent sub-tasks
  → Execute sub-tasks separately
  → Reassemble results
  → If still stuck, escalate to user
```

### Self-Learning Loop

```
After every multi-agent workflow:
1. Was the routing decision correct?
   YES → Reinforce pattern     NO → Note better alternative
2. Were all activated agents useful?
   YES → Confirm selection     NO → Reduce next time
3. Was the synthesis mode appropriate?
   YES → Maintain             NO → Log alternative for next time
4. Store workflow metadata in Operational Vault
```

---

## Agent Activation

### Token Budget

Each agent activation costs context tokens. Orchestration optimizes for minimum cost:

| Agent | Full Load | Metadata Only | Use When |
|-------|----------|--------------|----------|
| Prime | ~5K | ~100 | Council, synthesis, meta-questions |
| Architect | ~4K | ~100 | System design, infrastructure |
| Orchestrator | ~3K | ~100 | Multi-agent coordination |
| Sentinel | ~3K | ~100 | Quality, security review |
| Sage | ~3K | ~100 | Knowledge, teaching, wisdom |
| Weaver | ~4K | ~100 | Creative work, narrative |
| Navigator | ~4K | ~100 | Strategy, roadmaps, planning |

### Rules

1. **Minimum agents.** One is preferred over two when possible.
2. **Progressive loading.** Metadata first (~100 tokens). Full profile only when confirmed needed.
3. **Parallel limit.** Maximum 3 agents active simultaneously.
4. **Release early.** Deactivate agents as soon as their task completes.
5. **Council is expensive.** Full council for complexity 9-10 only. Partial (2-3 agents) for 7-8.

---

## Workflow Templates

### Strategic Decision

```yaml
name: strategic-decision
trigger: Major decision with business impact
pattern: parallel
agents:
  - navigator (weight: 0.4)
  - architect (weight: 0.3)
  - weaver (weight: 0.2)
  - sentinel (weight: 0.1)
synthesis: weighted-consensus
vault: strategic-vault
note: decision-note
```

### System Design

```yaml
name: system-design
trigger: Architecture or system design
pattern: sequential
agents:
  - architect (primary)
  - sentinel (review)
synthesis: sequential-refinement
vault: technical-vault
note: insight-note
```

### Creative Production

```yaml
name: creative-production
trigger: Content creation or creative work
pattern: iterative
agents:
  - weaver (create)
  - sentinel (review)
  - weaver (refine)
synthesis: quality-gated
vault: creative-vault
note: session-note
```

### Knowledge Transfer

```yaml
name: knowledge-transfer
trigger: Learning, explaining, teaching
pattern: direct
agents:
  - sage (primary)
synthesis: none
vault: wisdom-vault
note: learning-note
```

### Cross-System Sync

```yaml
name: cross-system-sync
trigger: Multi-repo coordination
pattern: broadcast
agents:
  - orchestrator (coordinate)
synthesis: aggregation
vault: operational-vault
transmission: broadcast-channel
```

### Alignment Review

```yaml
name: alignment-review
trigger: Values, ethics, or AGI alignment discussion
pattern: parallel
agents:
  - sage (primary, weight: 0.5)
  - prime (weight: 0.3)
  - navigator (weight: 0.2)
synthesis: weighted-consensus
vault: horizon-vault
note: insight-note
```

---

## Error Handling

### Token Budget Exceeded

```
1. Summarize current state to a Session Note
2. Store intermediate results in appropriate Vault
3. Create a continuation plan with clear next steps
4. Provide the user with a session handoff document
```

### Cross-Platform Considerations

The Orchestration Engine operates identically across all platforms. However:

- **Claude Code**: Full orchestration with MCP support
- **Cursor**: Orchestration via rule activation and context injection
- **Cline**: Orchestration via plan-and-act mode with memory banks
- **Codex**: Orchestration via cascading AGENTS.md instructions
- **Gemini CLI**: Orchestration via instruction layers
- **Antigravity**: Orchestration with browser control and async patterns

The core patterns remain the same. The platform adapter handles delivery.

---

## Metrics

| Metric | Target | If Below Target |
|--------|--------|----------------|
| Routing accuracy | >90% | Refine routing rules in ROUTING_MATRIX.md |
| First-attempt success | >80% | Improve agent matching criteria |
| Token efficiency | <8K avg/request | Reduce agent loading, increase progressive disclosure |
| Multi-agent overhead | <20% | Simplify coordination, reduce unnecessary agents |
| Cross-system latency | <5s | Optimize transmission protocol |

---

*The best orchestration is invisible. The user sees results, not the machinery.*
