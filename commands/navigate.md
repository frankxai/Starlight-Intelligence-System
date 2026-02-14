# /navigate Command

> *"See ahead. Plan the path. Move with purpose."*

**Primary Agent:** Starlight Navigator
**Skills Activated:** strategic-reasoning, decision-framework, systems-thinking

---

## Subcommands

### /navigate plan [objective]

Create a strategic plan for achieving an objective.

**Arguments:**
- `objective`: What you want to achieve

**Output:**
1. Current state assessment
2. Desired state definition
3. Gap analysis
4. Strategic options (minimum 3)
5. Recommended path with milestones
6. Risk assessment
7. Resource requirements

**Example:**
```
/navigate plan "Achieve full ecosystem integration across all repos within 3 months"
```

### /navigate assess [situation]

Provide a strategic assessment of a situation.

**Arguments:**
- `situation`: Description of the situation to assess

**Output:**
1. Situation summary
2. Key factors and dynamics
3. Opportunities identified
4. Threats identified
5. Recommended actions
6. Timing considerations

**Example:**
```
/navigate assess "ACOS has grown to 80+ skills but some overlap with Arcanea capabilities"
```

### /navigate decide [options]

Navigate a decision with explicit trade-off analysis.

**Arguments:**
- `options`: The decision and options to consider

**Process:**
1. Frame the decision
2. Identify all options
3. Define evaluation criteria
4. Score options
5. Analyze trade-offs
6. Assess reversibility
7. Run pre-mortem on top option
8. Present recommendation

**Example:**
```
/navigate decide "Monorepo vs multi-repo for the Starlight ecosystem"
```

### /navigate roadmap [--horizon]

Create a strategic roadmap for the Starlight ecosystem.

**Arguments:**
- `--horizon`: Time horizon (1month, 3months, 6months, 1year)

**Output:**
1. Vision statement
2. Key milestones by time period
3. Dependencies between milestones
4. Resource allocation
5. Risk checkpoints

**Example:**
```
/navigate roadmap --horizon 6months
```

### /navigate priorities

Review and update the current priority list.

**Output:**
1. Current priorities with scores
2. Recommended changes
3. New priorities to consider
4. Priorities to retire

---

## Processing

```
/navigate [subcommand] [args]
  → Parse subcommand and arguments
  → Activate strategic-reasoning + decision-framework skills
  → Load Strategic Vault context
  → Route to Navigator agent
  → Execute strategic operation
  → Store results in Strategic Vault
  → Return strategic output
```
