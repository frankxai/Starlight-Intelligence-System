# SIS Memory Claw

> The six vaults as living memory. Librarian, janitor, archivist, and immune system.

---

## Contract

```yaml
name: sis-memory-claw
version: 0.1.0
purpose: Operate the six SIS vaults as durable, searchable, contradiction-aware memory. Every other Claw calls this instead of inventing its own storage.
phase: 1

permissions:
  filesystem: read_write
  sis_vaults: read_write
  shell: none
  network: none

inputs:
  - text, markdown, JSON entries
  - vault query strings
  - reconciliation triggers
  - export format requests

outputs:
  - /vaults/<type>.jsonl — updated vault files
  - /exports/claude-code-memory.md
  - /exports/chatgpt-project-memory.md
  - /exports/vault-health-report.md

commands:
  - /sis-remember
  - /sis-search
  - /sis-reconcile
  - /sis-decay
  - /sis-promote
  - /sis-export

skills:
  requires:
    - memory/vault-management
    - memory/knowledge-synthesis
    - memory/memory-consolidation
    - memory/context-preservation
  activates:
    - intelligence/pattern-recognition
    - safety/private-public-split

mcp:
  required:
    - sis-memory-mcp
  optional:
    - sqlite-mcp

safety:
  mutation_default: false
  private_data_export: blocked
  requires_sentinel: true

agents:
  primary: starlight-sage
  supporting:
    - starlight-prime
    - starlight-sentinel
```

---

## What Memory Claw Does

Memory Claw is the substrate's heart. It manages the six vaults as a unified intelligence layer — not static documents, but a living memory that grows more useful over time.

Six vaults under Memory Claw's care:

| Vault | What it stores | Retention |
|-------|---------------|-----------|
| `strategic` | Decisions, outcomes, strategies | Permanent |
| `technical` | Patterns, architectures, anti-patterns | Permanent with refinement |
| `creative` | Ideas, voice patterns, aesthetics | Permanent |
| `operational` | Project states, session logs, health | Rolling 90 days |
| `wisdom` | Principles, meta-patterns, lessons | Permanent (highest protection) |
| `horizon` | Human hopes, alignment values | Permanent, append-only |

---

## Commands

### `/sis-remember`

Write a memory entry to the appropriate vault.

```
Usage: /sis-remember <content> [--vault strategic|technical|creative|operational|wisdom|horizon] [--tags tag1,tag2]

Flow:
1. Classify content to the best-fit vault (auto or explicit)
2. Structure entry following vault entry format
3. Score confidence (0.0–1.0) based on source quality
4. Check for near-duplicates (cosine similarity > 0.92 = flag)
5. Check for contradictions with existing entries
6. Write to vault JSONL file
7. Update SQLite index
8. Return: entry ID + vault + confidence
```

### `/sis-search`

Query across all vaults or a specific vault.

```
Usage: /sis-search <query> [--vault <name>] [--min-confidence 0.7] [--limit 10]

Flow:
1. Tokenize query
2. Run FTS against SQLite index
3. Optionally run semantic similarity against vault entries
4. Rank by: relevance × recency × confidence × outcome-flag
5. Return: ranked entries with provenance
```

### `/sis-reconcile`

Find and resolve contradictions, merge duplicates, promote patterns.

```
Usage: /sis-reconcile [--vault <name>] [--dry-run]

Flow:
1. Scan target vault(s)
2. Detect duplicate entries (>92% similarity)
3. Detect contradictions (same topic, conflicting claims)
4. In dry-run: report findings only
5. With approval: merge duplicates, flag contradictions for human review
6. Promote high-confidence patterns to Wisdom vault
7. Report: contradiction count, duplicates merged, promotions made
```

### `/sis-decay`

Decay stale operational entries and low-confidence items.

```
Usage: /sis-decay [--dry-run]

Flow:
1. Identify operational entries older than 90 days
2. Identify entries with confidence < 0.4 and 0 reads
3. In dry-run: report what would be archived
4. With approval: archive to ~/.starlight/exports/archived-YYYY-MM.jsonl
5. Remove from active vault index
6. Report: entries archived, space freed
```

### `/sis-promote`

Elevate a validated entry from its current vault to a higher-level vault.

```
Usage: /sis-promote <entry-id> --to wisdom|strategic|technical

Flow:
1. Load the entry
2. Validate it has been read ≥3 times or manually flagged
3. Re-evaluate confidence with current context
4. Write promoted copy to target vault
5. Mark original as promoted (not deleted)
6. Report: promotion confirmed + new entry ID
```

### `/sis-export`

Render vault content as platform-ready memory packs.

```
Usage: /sis-export [--format claude-code|chatgpt-project|cursor|codex|gemini] [--vault <names>] [--max-tokens 8000]

Flow:
1. Load entries from specified vaults (or all)
2. Apply private-public-split check (Sentinel gate)
3. Format for target platform (markdown, system prompt, project instructions)
4. Enforce token budget (truncate by age + confidence)
5. Write to ~/.starlight/exports/<format>-memory-YYYY-MM-DD.md
6. Report: entries included, tokens used, private entries blocked
```

---

## Integration with Other Claws

Memory Claw is the shared substrate. Every other Claw calls it:

- **Bootstrap Claw** — calls `/sis-remember` after install to record workspace config
- **Genius Claw** — calls `/sis-remember` to write GENIUS_PROFILE, VOICE_FINGERPRINT entries
- **Reclamation Claw** — calls `/sis-remember` to import high-value insights after mapping
- **Sentinel Claw** — reads Wisdom vault for security principles; writes security decisions
- **Creator Claw (future)** — reads Creative + Technical vaults for voice and context

---

## Health Monitoring

Memory Claw tracks vault health automatically:

| Metric | Healthy | Action |
|--------|---------|--------|
| Entry count per vault | 10–500 | Consolidate if >500, populate if <10 |
| Average confidence | >0.7 | Review low-confidence entries |
| Entries with zero reads | <20% | Archive candidates |
| Duplicate rate | <5% | Run `/sis-reconcile` |
| Oldest operational entry | <90 days | Run `/sis-decay` |

---

*Built on SIP · sis-memory-claw v0.1.0 · MIT*
