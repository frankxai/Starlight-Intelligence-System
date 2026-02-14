# Starlight Synthesis Protocol

> How multiple agent perspectives become one coherent output. The final stage before delivery.

---

## Synthesis Modes

### Weighted Consensus

When multiple agents provide perspectives on the same question.

```
1. COLLECT perspectives from each agent
2. WEIGHT by domain expertise:
   Primary domain match → 1.0x
   Secondary domain    → 0.7x
   Tertiary domain     → 0.4x
3. IDENTIFY consensus points (>70% agreement)
4. SURFACE tensions (significant disagreement)
5. PRODUCE weighted recommendation
```

**Example:** "Should we restructure the API?"

| Agent | Weight | Position |
|-------|--------|----------|
| Architect | 1.0 | Yes, microservices pattern |
| Navigator | 0.7 | Yes, but phase the migration |
| Sentinel | 0.4 | Yes, if backward compatibility maintained |

**Synthesis:** Restructure to microservices with phased migration and backward compatibility gates.
**Consensus:** 100% on restructure. **Tension:** Timing. **Resolution:** Phased (Navigator's caution + Sentinel's gates).

### Sequential Refinement

Each agent's output feeds the next.

```
Agent A → initial output (70% quality)
Agent B → review/refine  (85% quality)
Agent C → polish/validate (95% quality)
```

### Aggregation

Multiple independent results need unified presentation.

```
1. COLLECT all agent outputs
2. CATEGORIZE by type (insights, actions, warnings)
3. DEDUPLICATE overlapping findings
4. ORGANIZE by priority
5. PRESENT as unified report
```

### Conflict Resolution

When agents significantly disagree.

```
1. IDENTIFY the specific point of disagreement
2. EXAMINE each agent's reasoning chain
3. CHECK vault history for similar past conflicts
4. APPLY decision framework:
   - Which agent has highest domain authority?
   - What does historical data suggest?
   - What are the reversibility characteristics?
   - What's the risk profile of each position?
5. PRODUCE resolution with explicit trade-off acknowledgment
6. STORE in Strategic Vault for future reference
```

### Creative Synthesis

Combining diverse inputs into something new.

```
1. ABSORB all inputs without judgment
2. IDENTIFY unexpected connections
3. MAP complementary elements
4. GENERATE novel combinations
5. EVALUATE against quality criteria
6. PRESENT the emergent creation
```

### Values Synthesis

When decisions touch alignment, ethics, or long-term impact.

```
1. READ Horizon Vault for relevant values and hopes
2. FRAME the decision against stated aspirations
3. EVALUATE options through benevolence lens
4. PRODUCE recommendation that serves both present and future
5. STORE reasoning in Wisdom Vault
```

---

## Output Formats

### Strategic Decision

```
Consensus Points: {where all agents align}
Key Tensions: {where perspectives differ and why}
Recommendation: {weighted recommendation}
Confidence: {High/Medium/Low} ({percentage})
Next Steps: {1. immediate  2. follow-up  3. verification}
Vault Record: {vault-name, related entries}
```

### Technical Decision

```
Architecture Decision: {the decided approach}
Alternatives: {options with pros/cons and agent support}
Selected: {option} because {reasoning}
Implementation: {phased steps with checkpoints}
Risks: {risk → mitigation pairs}
```

### Creative Output

```
Vision: {the creative direction}
Elements: {from sources + emergent novel elements}
Output: {the creative result}
Quality: {originality, coherence, impact scores}
```

---

## Confidence Scoring

| Score | Label | Meaning |
|-------|-------|---------|
| 90-100% | High | Strong consensus, clear evidence, proven pattern |
| 70-89% | Moderate | Majority agreement, some uncertainty |
| 50-69% | Low | Split opinions, limited evidence |
| <50% | Uncertain | Insufficient data, novel territory |

### Calculation

```
Base: 50%

+ 15%  vault has relevant precedent
+ 10%  all agents agree
+ 10%  pattern matches known successful approach
+  5%  cross-system context confirms
+  5%  recent (<30 days) supporting evidence
+  5%  low complexity / well-understood domain

- 10%  agents significantly disagree
- 10%  no vault precedent
-  5%  high complexity / novel territory
-  5%  time-sensitive with incomplete data
```

---

## Post-Synthesis

After every synthesis:

1. **Vault Write** — Store the result and reasoning in the appropriate vault
2. **Note Creation** — Create Decision, Insight, or Learning note
3. **Transmission** — If cross-system, send relevant updates
4. **Context Update** — Update unified context with new state
5. **Index Update** — Ensure vault indices reflect new entry

---

*Synthesis is the highest form of intelligence — seeing unity in diversity, signal in noise, opportunity in chaos.*
