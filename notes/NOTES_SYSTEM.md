# Starlight Notes System

> *"Capture fleeting intelligence before it fades."*

---

## Overview

Starlight Notes are structured documents that capture insights, decisions, learnings, and session state. They bridge the gap between ephemeral working memory and permanent vault storage.

Notes are the primary mechanism for:
- **Session continuity** - Preserving context across sessions
- **Decision documentation** - Recording what was decided and why
- **Learning capture** - Storing insights that emerge during work
- **Insight preservation** - Catching creative breakthroughs before they're lost

---

## Note Types

| Type | Template | Purpose | Lifecycle |
|------|----------|---------|-----------|
| **Insight Note** | `templates/insight-note.md` | Capture a new insight or discovery | Active → Vault promotion |
| **Decision Note** | `templates/decision-note.md` | Record a decision with full context | Active → Strategic Vault |
| **Learning Note** | `templates/learning-note.md` | Document something learned | Active → Wisdom Vault |
| **Session Note** | `templates/session-note.md` | Capture session state for handoff | Active → Archive after next session |

---

## Note Lifecycle

```
CREATION
  ↓
ACTIVE (notes/active/)
  ↓ [after review and validation]
PROMOTED (moved to appropriate Vault)
  ↓ [original note archived]
ARCHIVED (notes/archive/)
```

### Lifecycle Rules

1. **Insight Notes** stay active until validated, then promote to appropriate Vault
2. **Decision Notes** are immediately promoted to Strategic Vault (keep active copy for reference)
3. **Learning Notes** stay active until confirmed through experience, then promote to Wisdom Vault
4. **Session Notes** stay active until next session begins, then archive

---

## Note Storage

```
notes/
├── NOTES_SYSTEM.md          # This file
├── templates/
│   ├── insight-note.md       # Template for insight capture
│   ├── decision-note.md      # Template for decision records
│   ├── learning-note.md      # Template for learnings
│   └── session-note.md       # Template for session handoffs
├── active/                   # Currently active notes
│   └── .gitkeep
└── archive/                  # Archived notes
    └── .gitkeep
```

---

## Creating Notes

### When to Create

| Situation | Note Type | Created By |
|-----------|-----------|------------|
| New pattern discovered | Insight Note | Any agent |
| Strategic decision made | Decision Note | Navigator, Prime |
| Something failed and we learned why | Learning Note | Sentinel, Sage |
| Session ending | Session Note | Orchestrator |
| Cross-domain connection found | Insight Note | Sage, Weaver |
| Trade-off explicitly chosen | Decision Note | Navigator |
| Anti-pattern identified | Learning Note | Sentinel |

### How to Create

1. Select the appropriate template from `notes/templates/`
2. Fill in all required fields
3. Save to `notes/active/` with naming convention: `[YYYY-MM-DD]-[type]-[descriptive-slug].md`
4. Log creation in Operational Vault

---

## Note Quality Standards

- **Complete:** All template fields filled
- **Specific:** Concrete details, not vague generalities
- **Actionable:** Contains clear implications or next steps
- **Linked:** References related vault entries, notes, or transmissions
- **Honest:** Includes uncertainty and limitations

---

*"A note is a promise to your future self: I found something worth remembering."*
