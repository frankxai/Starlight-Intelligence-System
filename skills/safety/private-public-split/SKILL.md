# Private/Public Split

> Vault content is sovereign. What goes public is the user's explicit choice, not a default.

## When This Skill Activates

- Vault content is being prepared for export to a platform adapter
- A Claw is generating a public artifact from vault material
- Keywords: "export", "publish", "public vault", "share memory", "platform pack"
- Default for: Starlight Sentinel

## What This Skill Does

Enforces a clear boundary between private vault content (stays local) and public-safe content (can be exported to platform adapters, shared contexts, or the public vault). Prevents personal, financial, medical, and relationship data from silently flowing into shared AI contexts.

## Procedures

### Procedure 1: Entry Classification

Before any vault export, classify each entry:

```
PRIVATE (never exported without explicit approval):
  - Personal names, addresses, family relationships
  - Financial specifics: account numbers, exact valuations, salary details
  - Medical, health, or therapy references
  - Legal matters
  - Relationship conflicts or sensitive personal dynamics
  - Entries explicitly tagged: { privacy: "private" }
  - All Horizon Vault entries (require PR-level review)

PUBLIC_SAFE (exported by default):
  - Frameworks and mental models (no personal attribution required)
  - Technical architecture patterns
  - Strategic decisions: goals, priorities, opportunity assessments (non-sensitive)
  - Creative concepts, voice elements
  - Professional methodology and principles
  - Entries explicitly tagged: { privacy: "public" }
```

### Procedure 2: Export Filtering

1. Load all entries from target vault(s)
2. Classify each entry as PRIVATE or PUBLIC_SAFE
3. Apply token budget to PUBLIC_SAFE entries (newest + highest confidence first)
4. Present summary to user: "N entries included, M entries withheld as private"
5. User can review the withheld list and opt-in specific entries
6. Write filtered export to target path

### Procedure 3: Tagging Protocol

Assist the user in tagging vault entries for future automatic filtering:

```
Tags added to vault entries:
  { "privacy": "private" }    — never export
  { "privacy": "public" }     — always safe to export
  { "privacy": "review" }     — ask before each export
```

Default for untagged entries: classified by content heuristic (Procedure 1).

## Integration Points

- **Vaults:** Reads all vaults; writes privacy tags back to entries (via Memory Claw)
- **Agents:** Starlight Sentinel (primary), Starlight Sage (vault guardian)
- **Skills:** Composes with `secret-detector` (structural classification + credential scan), `permission-gate` (approval flow)
- **Claws:** Memory Claw (`/sis-export`), Creator Claw (content generation), Attestation Claw (public vault)

## Quality Criteria

- No private entry is exported without explicit user opt-in
- Export summary always shows what was withheld and why
- Privacy tags are preserved across Memory Claw operations (not stripped on reconcile)
- Horizon Vault entries are always withheld by default
