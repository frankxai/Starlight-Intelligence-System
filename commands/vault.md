# /vault Command

> *"Access the persistent memory of Starlight."*

**Primary Agent:** Starlight Sage
**Skills Activated:** vault-management, knowledge-synthesis

---

## Subcommands

### /vault read [vault-name] [--query "search terms"]

Read entries from a specific vault with optional search.

**Arguments:**
- `vault-name`: strategic | technical | creative | operational | wisdom
- `--query`: Optional search terms to filter entries

**Example:**
```
/vault read strategic --query "architecture decisions"
/vault read wisdom
/vault read technical --query "configuration-first"
```

### /vault write [vault-name] [content]

Write a new entry to a vault. The Sage will structure the entry properly.

**Arguments:**
- `vault-name`: Target vault
- Content provided in the message

**Example:**
```
/vault write wisdom "Configuration should be declarative whenever possible. 
Imperative configuration creates hidden dependencies."
```

### /vault search [query]

Search across all vaults simultaneously.

**Arguments:**
- `query`: Search terms

**Output:** Ranked results from all vaults with vault name, entry title, relevance score, and snippet.

### /vault health

Display vault health metrics for all vaults.

**Output:**
```
VAULT HEALTH REPORT
===================

Strategic:   [entries] entries | avg confidence [score] | [status]
Technical:   [entries] entries | avg confidence [score] | [status]
Creative:    [entries] entries | avg confidence [score] | [status]
Operational: [entries] entries | avg confidence [score] | [status]
Wisdom:      [entries] entries | avg confidence [score] | [status]

Overall: [healthy/attention-needed/critical]
```

### /vault consolidate

Run memory consolidation across all vaults.

**Actions:** Deduplication, archival, promotion, health assessment.

### /vault export [vault-name]

Export all entries from a vault in a portable format.

---

## Processing

```
/vault [subcommand] [args]
  → Parse subcommand and arguments
  → Activate vault-management skill
  → Route to Sage agent
  → Execute vault operation
  → Return formatted results
  → Log operation in Operational Vault
```
