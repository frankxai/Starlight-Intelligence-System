# Vault Management

> *"Memory is the foundation of intelligence. Manage it well."*

## When This Skill Activates

- Storing, retrieving, or managing persistent memory
- Keywords: "vault", "store", "remember", "recall", "persist", "save", "memory"
- Default for: Starlight Prime, Starlight Sage

## What This Skill Does

Manages all operations on Starlight Vaults - the persistent memory system. Handles reading, writing, querying, and organizing vault entries across all five vaults.

## Procedures

### Procedure 1: Vault Write

1. Determine which vault is appropriate:
   - Strategic decision? → Strategic Vault
   - Technical pattern? → Technical Vault
   - Creative insight? → Creative Vault
   - Operational state? → Operational Vault
   - Principle/lesson? → Wisdom Vault
2. Structure the entry with:
   - Timestamp (ISO 8601)
   - Title (descriptive, searchable)
   - Category tags
   - Content (the knowledge to store)
   - Confidence score (0.0-1.0)
   - Related entries (links to other vault entries)
   - Source (where this knowledge came from)
3. Append to the appropriate vault file
4. Update vault index

### Procedure 2: Vault Read/Query

1. Determine which vault(s) to query
2. Search by: keywords, tags, date range, confidence threshold
3. Retrieve matching entries
4. Sort by relevance (keyword match + recency + confidence)
5. Return top N most relevant entries
6. Include related entries if requested

### Procedure 3: Vault Maintenance

1. Review entries older than 90 days in Operational Vault
2. Archive or remove stale operational entries
3. Check for duplicate entries across vaults
4. Merge duplicates, keeping the highest-confidence version
5. Verify index accuracy
6. Report vault health metrics

## Integration Points

- **Vault:** All vaults (this skill operates ON vaults)
- **Agents:** All agents use this skill for memory operations
- **Notes:** Creates notes as a side effect of significant vault operations
- **Memory:** See memory/VAULT_ARCHITECTURE.md for full design

## Quality Criteria

- Is the entry in the correct vault?
- Is the entry structured and searchable?
- Is the confidence score calibrated?
- Are related entries linked?
