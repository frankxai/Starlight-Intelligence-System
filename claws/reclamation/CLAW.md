# SIS Reclamation Claw

> Turn knowledge chaos into a functional second brain. Organized by function, not original storage location.

---

## Contract

```yaml
name: sis-reclamation-claw
version: 0.1.0
purpose: Scan scattered local/Drive/Notion sources, classify by function, produce a reorganization plan, and import high-value insights into SIS vaults — without mutating user files by default.
phase: 2

permissions:
  filesystem: read
  sis_vaults: read_write
  shell: none
  network: optional

inputs:
  - local_folders (any structure)
  - drive_folders (Google Drive connector, optional)
  - notion_export (optional)
  - existing_notes (any format)

outputs:
  - /reclamation/RECLAMATION_MAP.md
  - /reclamation/FOLDER_TREE_PROPOSAL.md
  - /reclamation/MOVE_PLAN.md
  - /reclamation/VAULT_IMPORT_PLAN.json

commands:
  - /reclaim-knowledge
  - /scan-sources
  - /propose-structure
  - /import-insights
  - /execute-moves

skills:
  requires:
    - safety/permission-gate
    - safety/mutation-approval
    - safety/private-public-split
  activates:
    - intelligence/pattern-recognition
    - intelligence/systems-thinking
    - memory/knowledge-synthesis
    - memory/vault-management

mcp:
  required:
    - filesystem-mcp
    - sis-memory-mcp
    - sentinel-mcp
  optional:
    - google-drive-mcp
    - notion-mcp

safety:
  mutation_default: false
  private_data_export: blocked
  requires_sentinel: true

agents:
  primary: starlight-architect
  supporting:
    - starlight-sage
    - starlight-sentinel
    - starlight-orchestrator
```

---

## The Core Rule

**Reclamation Claw never mutates user files by default.**

Every scan, classification, and reorganization produces a *plan* first. File moves, renames, or deletes require explicit human approval via `/execute-moves`. This is not optional — it is the safety contract that makes Reclamation Claw trustworthy enough to use on a real knowledge base.

---

## What Reclamation Claw Does

Reclamation Claw addresses the real problem: people don't need another knowledge app. They need their *existing mess* made usable.

It scans across sources, classifies content by functional purpose (not original location), detects duplicates, and produces a reorganization proposal that the user reviews before anything changes.

---

## Classification Taxonomy

Reclamation Claw organizes by *function*, not location:

| Function Bucket | What belongs here |
|----------------|-------------------|
| **Strategy** | Decisions, priorities, plans, opportunity analyses |
| **Reference** | Procedures, how-tos, templates, standards |
| **Ideas** | Brainstorms, hypotheses, creative experiments |
| **Projects** | Active project files, scoped work |
| **Archive** | Completed or dormant work worth preserving |
| **Vault candidates** | High-insight content ready for SIS vault import |
| **Delete candidates** | Duplicates, drafts superseded, zero-value clutter |
| **Do not move** | Files with external links, shared docs, platform-specific assets |

---

## Processing Flow

### Phase 1: Scan

```
1. Recursively scan all specified source paths
2. Build a content inventory: file path, size, type, last modified, estimated topic
3. Detect duplicates by content hash and fuzzy title matching
4. Flag files with external links or shared-doc indicators as "do not move"
5. Produce: inventory manifest (JSON, not written to vaults yet)
```

### Phase 2: Classify

```
1. Sample content from each file (first 500 words)
2. Apply function taxonomy classification
3. Assign confidence score per classification (0.0–1.0)
4. Low-confidence items (<0.6) are flagged for manual review
5. Produce: classification map
```

### Phase 3: Map

```
1. Group classified items into the proposed FOLDER_TREE_PROPOSAL
2. Identify vault candidates (high confidence, high insight density)
3. Identify delete candidates (confirmed duplicates + zero-value)
4. Generate RECLAMATION_MAP.md (human-readable overview)
5. Generate MOVE_PLAN.md (actionable steps with file paths)
6. Generate VAULT_IMPORT_PLAN.json (structured import manifest for Memory Claw)
```

### Phase 4: Human Review

```
User reviews:
- RECLAMATION_MAP.md — the big picture
- MOVE_PLAN.md — specific file operations
- VAULT_IMPORT_PLAN.json — what gets stored in SIS vaults
User can: approve all / approve sections / reject / modify
```

### Phase 5: Execute (requires explicit approval)

```
1. Execute approved file moves (atomic operations, rollback on failure)
2. Call Memory Claw `/sis-remember` for each vault candidate in import plan
3. Log every operation to reclamation.log
4. Produce: execution report (what moved, what was imported, what was skipped)
```

---

## Commands

### `/reclaim-knowledge`

Full reclamation run: scan → classify → map → present for approval.

```
Usage: /reclaim-knowledge --sources <path1,path2,...> [--drive <folder-url>]

Produces all four output files.
Does NOT execute any moves.
Requires explicit /execute-moves to apply changes.
```

### `/scan-sources`

Inventory-only scan. No classification, no proposal.

```
Usage: /scan-sources --sources <path>

Produces: file count, type breakdown, estimated duplicate rate, total size
Useful for scoping before a full reclamation run.
```

### `/propose-structure`

Generate FOLDER_TREE_PROPOSAL for a specific set of sources.

```
Usage: /propose-structure --sources <path>

Produces: FOLDER_TREE_PROPOSAL.md + MOVE_PLAN.md (no vault operations)
```

### `/import-insights`

Import approved vault candidates from VAULT_IMPORT_PLAN.json.

```
Usage: /import-insights --plan /reclamation/VAULT_IMPORT_PLAN.json

Calls Memory Claw for each entry.
Requires Sentinel gate approval.
Reports: entries imported per vault.
```

### `/execute-moves`

Apply approved file moves from MOVE_PLAN.md.

```
Usage: /execute-moves --plan /reclamation/MOVE_PLAN.md [--dry-run]

In dry-run: prints operations without executing.
In live mode: requires explicit "I confirm" prompt.
Atomic: on any failure, rolls back all moves in the current batch.
Logs every operation.
```

---

## Output File Schemas

### RECLAMATION_MAP.md

```markdown
# Reclamation Map — [Date]
Sources analyzed: [list]

## Summary
- Files scanned: N
- Duplicates detected: N
- Vault candidates: N
- Proposed moves: N
- Do not move: N

## Functional Buckets
### Strategy (N files)
[File list with classification confidence]

### Reference (N files)
[...]

## Vault Import Candidates
[Top N items ready for SIS vault import]

## Delete Candidates
[Confirmed duplicates + zero-value items]

## Do Not Move
[Files with external links or platform dependencies]
```

### VAULT_IMPORT_PLAN.json

```json
{
  "generated": "YYYY-MM-DD",
  "source_run": "reclaim-YYYYMMDD",
  "candidates": [
    {
      "source_file": "/path/to/file.md",
      "vault": "strategic",
      "excerpt": "first 200 chars of high-value content",
      "confidence": 0.85,
      "tags": ["strategy", "decision"],
      "approved": false
    }
  ]
}
```

---

## Safety

- **Never mutates source files** until `/execute-moves` is called with explicit confirmation
- "Do not move" flags protect files with external links, shared references, platform-specific content
- Sentinel Claw gates `/import-insights` and `/execute-moves` — both require `mutation-approval` skill
- All operations logged to `~/.starlight/logs/reclamation.log`
- Rollback is always available for the current execution batch

---

*Built on SIP · sis-reclamation-claw v0.1.0 · MIT*
