# Memory Consolidation

> *"The art of remembering is the art of forgetting what doesn't matter."*

## When This Skill Activates

- Optimizing vault storage, archiving old entries, deduplicating
- Keywords: "consolidate", "optimize memory", "clean up", "archive", "deduplicate"
- Default for: Starlight Prime

## What This Skill Does

Optimizes the Starlight Vaults by consolidating related entries, archiving stale data, deduplicating, and ensuring memory remains high-quality and retrievable. Inspired by AI-Ops research on memory consolidation patterns (Working -> Episodic -> Semantic -> Procedural).

## Procedures

### Procedure 1: Memory Hierarchy Consolidation

Following the AI-Ops memory hierarchy:

1. **Working Memory** (current session context)
   - Review items in current context
   - Identify what should be promoted to persistent storage

2. **Episodic Memory** (specific events/sessions)
   - Review Session Notes older than 30 days
   - Extract lasting insights, archive the rest
   - Promote patterns to Semantic Memory

3. **Semantic Memory** (general knowledge/facts)
   - Review vault entries for accuracy
   - Merge related entries into comprehensive entries
   - Promote proven patterns to Procedural Memory

4. **Procedural Memory** (how-to knowledge)
   - Review skill effectiveness
   - Update skills based on accumulated learnings
   - Archive deprecated procedures

### Procedure 2: Deduplication

1. Scan vaults for entries with high similarity
2. Compare content, timestamps, and confidence scores
3. For duplicates: keep the entry with highest confidence
4. Merge unique details from discarded duplicates
5. Update all references to point to the kept entry
6. Log deduplication actions for audit

### Procedure 3: Quality Assessment

1. Calculate vault health metrics:
   - Entry count per vault
   - Average confidence score
   - Oldest entry age
   - Index accuracy
   - Retrieval success rate
2. Identify low-quality entries (low confidence, never retrieved)
3. Recommend actions: consolidate, archive, or remove
4. Generate vault health report
5. Store report in Operational Vault

## Integration Points

- **Vault:** All vaults (operates on all vaults)
- **Agents:** Prime (authorizes consolidation), Sage (knowledge quality)
- **Notes:** Archives old notes, creates consolidation reports

## Quality Criteria

- Did consolidation reduce total entries without losing knowledge?
- Are remaining entries higher quality?
- Were no high-confidence entries accidentally removed?
- Is the vault healthier after consolidation?
