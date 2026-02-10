# Context Preservation

> *"What you preserve today is what you can build on tomorrow."*

## When This Skill Activates

- Saving context for future sessions, session handoffs
- Keywords: "preserve", "save context", "handoff", "session end", "continue later"
- Default for: Starlight Orchestrator, Starlight Sage

## What This Skill Does

Ensures no valuable context is lost between sessions. Captures decisions, progress, pending work, and relevant state into persistent storage that can be restored.

## Procedures

### Procedure 1: Session State Capture

1. Summarize what was accomplished this session
2. List all decisions made (with reasoning)
3. List all pending work (not yet started or incomplete)
4. Capture current blockers or questions
5. Note any important context that might not be obvious
6. Store as Session Note in notes/active/
7. Update Operational Vault with current state

### Procedure 2: Context Restoration

1. Read most recent Session Note
2. Read Operational Vault for current state
3. Check Transmission channels for updates since last session
4. Reconstruct the working context
5. Identify what has changed since last session
6. Present restored context summary
7. Confirm with user before proceeding

### Procedure 3: Knowledge Extraction

1. Before context is lost, scan for extractable knowledge:
   - Decisions worth remembering → Strategic Vault
   - Technical patterns discovered → Technical Vault
   - Creative insights generated → Creative Vault
   - Principles confirmed → Wisdom Vault
2. Extract and store each piece of knowledge
3. Link extracted entries to the session that produced them
4. Ensure nothing valuable is ephemeral

## Integration Points

- **Vault:** Operational Vault (state), all vaults (extracted knowledge)
- **Notes:** Session Notes (handoff records)
- **Transmissions:** Check for updates during restoration
- **Context:** Updates unified-context.md

## Quality Criteria

- Can the next session fully resume from preserved context?
- Was all extractable knowledge captured?
- Is the session summary concise but complete?
- Are pending items clearly actionable?
