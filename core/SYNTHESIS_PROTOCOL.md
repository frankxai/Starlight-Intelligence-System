# Starlight Synthesis Protocol

> *"Many voices. One truth. The art of making the whole greater than the sum."*

---

## Overview

The Synthesis Protocol defines how Starlight merges results from multiple agents, vaults, and external sources into coherent, actionable intelligence. This is the final stage before output delivery.

---

## Synthesis Modes

### Mode 1: Weighted Consensus

**When:** Multiple agents provide perspectives on the same question.

```
WEIGHTED CONSENSUS
==================

1. COLLECT perspectives from each agent
2. WEIGHT by domain expertise:
   - Agent's primary domain match → 1.0x weight
   - Agent's secondary domain → 0.7x weight
   - Agent's tertiary domain → 0.4x weight

3. IDENTIFY consensus points (>70% agreement)
4. SURFACE tensions (significant disagreement)
5. PRODUCE weighted recommendation

Example:
  "Should we restructure the API?"
  
  Architect (weight 1.0): "Yes, microservices pattern"
  Navigator (weight 0.7): "Yes, but phase the migration"
  Sentinel (weight 0.4):  "Yes, if we maintain backward compat"
  
  Synthesis: "Restructure to microservices with phased migration
              and backward compatibility gates."
  Consensus: 100% (restructure)
  Tension: Timing (immediate vs. phased)
  Resolution: Phased (Navigator's caution + Sentinel's gates)
```

### Mode 2: Sequential Refinement

**When:** Each agent's output feeds the next agent.

```
SEQUENTIAL REFINEMENT
=====================

1. Agent A produces initial output
2. Agent B refines/reviews output
3. Agent C polishes/validates output
4. Final output incorporates all refinements

Quality improves at each step:
  Draft (70%) → Reviewed (85%) → Polished (95%)
```

### Mode 3: Aggregation

**When:** Multiple independent results need unified presentation.

```
AGGREGATION
===========

1. COLLECT all agent outputs
2. CATEGORIZE by type (insights, actions, warnings)
3. DEDUPLICATE overlapping findings
4. ORGANIZE by priority/relevance
5. PRESENT as unified intelligence report
```

### Mode 4: Conflict Resolution

**When:** Agents significantly disagree.

```
CONFLICT RESOLUTION
===================

1. IDENTIFY the specific point of disagreement
2. EXAMINE each agent's reasoning chain
3. CHECK vault history for similar past conflicts
4. APPLY decision framework:
   a. Which agent has highest domain authority?
   b. What does historical data suggest?
   c. What are the reversibility characteristics?
   d. What's the risk profile of each position?
5. PRODUCE resolution with explicit trade-off acknowledgment
6. STORE in Strategic Vault for future reference
```

### Mode 5: Creative Synthesis

**When:** Combining diverse inputs into something new.

```
CREATIVE SYNTHESIS
==================

1. ABSORB all inputs without judgment
2. IDENTIFY unexpected connections
3. MAP complementary elements
4. GENERATE novel combinations
5. EVALUATE against quality criteria
6. PRESENT the emergent creation
```

---

## Synthesis Output Format

### For Strategic Decisions

```markdown
## Starlight Synthesis

### Consensus Points
- [Where all agents align]

### Key Tensions
- [Where perspectives differ and why]

### Recommendation
[Weighted recommendation with confidence score]
Confidence: [High/Medium/Low] ([percentage])

### Reasoning
[Brief explanation of synthesis logic]

### Next Steps
1. [Immediate action]
2. [Follow-up action]
3. [Verification step]

### Vault Record
Stored in: [vault-name]
Related entries: [links to related vault entries]
```

### For Technical Decisions

```markdown
## Starlight Technical Synthesis

### Architecture Decision
[The decided approach]

### Alternatives Considered
| Option | Pros | Cons | Agent Support |
|--------|------|------|---------------|
| A | ... | ... | Architect |
| B | ... | ... | Navigator |

### Selected Approach
[Option] selected because: [reasoning]

### Implementation Path
1. [Step 1]
2. [Step 2]
3. [Validation checkpoint]

### Risk Mitigations
- [Risk 1] → [Mitigation]
- [Risk 2] → [Mitigation]
```

### For Creative Outputs

```markdown
## Starlight Creative Synthesis

### Vision
[The creative direction]

### Elements Combined
- From [Source A]: [Element]
- From [Source B]: [Element]
- Emergent: [Novel element from synthesis]

### Output
[The creative result]

### Quality Assessment
- Originality: [score]
- Coherence: [score]
- Impact: [score]
```

---

## Confidence Scoring

| Score | Label | Meaning |
|-------|-------|---------|
| 90-100% | **High Confidence** | Strong consensus, clear evidence, proven pattern |
| 70-89% | **Moderate Confidence** | Majority agreement, some uncertainty, reasonable risk |
| 50-69% | **Low Confidence** | Split opinions, limited evidence, higher risk |
| <50% | **Uncertain** | Insufficient data, novel territory, recommend exploration |

### Factors Affecting Confidence

```
CONFIDENCE CALCULATION
======================

Base score: 50%

+ 15% if vault has relevant precedent
+ 10% if all agents agree
+ 10% if pattern matches known successful approach
+ 5%  if cross-system context confirms
+ 5%  if recent (< 30 days) supporting evidence
+ 5%  if low complexity / well-understood domain

- 10% if agents significantly disagree
- 10% if no vault precedent
- 5%  if high complexity / novel territory
- 5%  if time-sensitive with incomplete data
```

---

## Post-Synthesis Actions

After every synthesis:

1. **Vault Write** - Store the synthesis result and reasoning
2. **Note Creation** - Create appropriate note (Decision, Insight, Learning)
3. **Transmission** - If cross-system, send relevant updates
4. **Context Update** - Update unified context with new state
5. **Index Update** - Ensure vault indices reflect new entry

---

*"Synthesis is the highest form of intelligence - seeing unity in diversity, signal in noise, opportunity in chaos."*
