# Context Engineering

> *"Context is the difference between noise and signal."*

## When This Skill Activates

- Managing AI context quality, session handoffs, context optimization
- Keywords: "context", "session", "continuity", "state", "handoff"
- Default for: Starlight Orchestrator, Starlight Prime

## What This Skill Does

Manages the quality, size, and relevance of context provided to agents and the intelligence system. Ensures context stays fresh, relevant, and within optimal token budgets. Absorbed from GSD/ACOS v4 context engineering patterns.

## Procedures

### Procedure 1: Context Quality Monitoring

1. Assess current context fill percentage:
   - 0-30%: Peak performance zone
   - 30-50%: Good quality, watch for degradation
   - 50-70%: Degrading, consider splitting tasks
   - 70%+: Poor quality, MUST spawn fresh context
2. Identify stale or irrelevant context
3. Recommend context refresh if quality is degrading
4. Create session handoff if fresh context needed

### Procedure 2: Context Assembly

1. Identify what context is needed for the current task
2. Load from vaults: relevant decisions, patterns, state
3. Load from notes: session continuity, recent learnings
4. Load from transmissions: cross-system updates
5. Prioritize by relevance (most relevant first)
6. Trim to fit token budget
7. Verify assembled context is sufficient

### Procedure 3: Session Handoff

1. Summarize current session state
2. Capture all pending work and decisions
3. Store in Session Note
4. Update Operational Vault with current state
5. Create continuation plan for next session
6. Ensure zero knowledge loss in handoff

## Integration Points

- **Vault:** Operational Vault (session state), all vaults (context sources)
- **Notes:** Session Notes (handoff records)
- **Agents:** Orchestrator (primary), Prime (system-wide context)

## Quality Criteria

- Is context within optimal token budget?
- Is irrelevant context removed?
- Is session handoff complete (zero knowledge loss)?
- Is the right context loaded for the task?
