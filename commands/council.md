# /council Command

> *"Many minds, one decision. The Council convenes."*

**Primary Agent:** Starlight Prime (Council Chair)
**Skills Activated:** multi-agent-coordination, strategic-reasoning, decision-framework

---

## Subcommands

### /council [--topic]

Convene a full council of all agents on a topic.

**Arguments:**
- `--topic`: The topic for council discussion

**Process:**
1. Prime convenes all 6 other agents
2. Each agent provides their domain perspective
3. Prime synthesizes all perspectives
4. Council reaches resolution
5. Decision recorded in Strategic Vault

**Example:**
```
/council --topic "How should we evolve the Starlight memory system for v2?"
```

### /council [--agents] [--topic]

Convene a subset of agents for a focused discussion.

**Arguments:**
- `--agents`: Comma-separated list of agents to convene
- `--topic`: The topic for discussion

**Example:**
```
/council --agents architect,sentinel --topic "Security review of vault access control"
/council --agents navigator,weaver --topic "Creative strategy for ecosystem documentation"
```

### /council review [artifact]

Have the council review an artifact (document, design, plan).

**Process:**
1. Prime distributes artifact to relevant agents
2. Each agent reviews from their domain lens
3. Sentinel provides quality assessment
4. All feedback synthesized
5. Review record created

**Example:**
```
/council review "The proposed transmission protocol for v1.1"
```

### /council decide [question]

Have the council make a formal decision on a question.

**Process:**
1. Prime frames the question
2. Navigator provides strategic analysis
3. Architect provides technical feasibility
4. Sentinel provides risk assessment
5. Sage provides wisdom perspective
6. Weaver provides creative alternatives
7. Orchestrator provides execution feasibility
8. Prime synthesizes into decision
9. Decision Note created and stored

**Example:**
```
/council decide "Should we add real-time synchronization between repos?"
```

---

## Council Protocols

### Full Council
All 7 agents participate. Used for major strategic or architectural decisions.
**Token Cost:** High (~5000-8000 tokens)
**When:** Architecture changes, strategic pivots, major decisions

### Mini Council
3-4 agents participate. Used for domain-specific decisions.
**Token Cost:** Medium (~2000-4000 tokens)
**When:** Domain decisions, focused reviews

### Pair Review
2 agents collaborate. Used for quick validations.
**Token Cost:** Low (~1000-2000 tokens)
**When:** Quick checks, validation of approach

---

## Processing

```
/council [subcommand] [args]
  → Parse subcommand and arguments
  → Prime assesses: Full Council, Mini Council, or Pair?
  → Assemble context for all participating agents
  → Each agent provides perspective (parallel where possible)
  → Prime synthesizes using Synthesis Protocol
  → Decision/review recorded in vault
  → Return council output
```
