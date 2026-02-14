# /synthesize Command

> *"Combine many sources into one truth."*

**Primary Agent:** Starlight Prime (with Council support)
**Skills Activated:** knowledge-synthesis, strategic-reasoning, pattern-recognition

---

## Subcommands

### /synthesize [--sources] [--topic]

Run a synthesis operation across specified sources on a topic.

**Arguments:**
- `--sources`: Comma-separated list of sources (vault, notes, transmissions, all)
- `--topic`: The topic or question to synthesize around

**Example:**
```
/synthesize --sources vault,notes --topic "memory architecture patterns"
/synthesize --sources all --topic "ecosystem integration strategy"
```

### /synthesize decision [topic]

Run the decision framework synthesis for a specific decision.

**Process:**
1. Gather all relevant context for the decision
2. Activate decision-framework skill
3. Generate options with trade-offs
4. Score options against criteria
5. Present recommendation with reasoning

**Example:**
```
/synthesize decision "Should we add a sixth vault for relationship data?"
```

### /synthesize knowledge [topic]

Run knowledge synthesis to combine understanding from multiple sources.

**Process:**
1. Query all vaults for topic-relevant entries
2. Check active notes for recent insights
3. Review transmission channels for cross-system context
4. Combine into unified knowledge summary
5. Store synthesis result

**Example:**
```
/synthesize knowledge "temporal knowledge graphs"
```

### /synthesize cross-repo [topic]

Run cross-repository synthesis to find patterns and insights across the ecosystem.

**Process:**
1. Load all repo contexts
2. Query vaults for cross-repo patterns
3. Check transmission channels for recent updates
4. Identify cross-pollination opportunities
5. Generate cross-repo synthesis report

**Example:**
```
/synthesize cross-repo "skill architecture patterns"
```

---

## Processing

```
/synthesize [subcommand] [args]
  → Parse subcommand and arguments
  → Assemble context from specified sources
  → Activate knowledge-synthesis + supporting skills
  → Route to Prime (may convene Council for complex synthesis)
  → Execute synthesis operation
  → Store results in appropriate vault
  → Return synthesis report
```
