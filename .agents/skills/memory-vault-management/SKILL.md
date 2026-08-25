---
name: memory-vault-management
description: "Use when storing, retrieving, or managing persistent memory across the Starlight Vaults — handles reading, writing, querying, and organizing entries across all vaults. Default skill for Starlight Prime and Starlight Sage."
---

# Vault Management & Hybrid Cognitive Memory

> *"Memory is the sovereign foundation of intelligence. Append with discipline, retrieve with precision, compound forever."*

## When This Skill Activates

- Storing, retrieving, searching, or consolidating persistent memory across the 6 Starlight Vaults.
- Keywords: "vault", "store", "remember", "recall", "persist", "save", "memory", "fts5", "hybrid search", "dreaming", "mempalace"
- Default for: Starlight Prime, Starlight Sage, Hermes

## What This Skill Does

Operates the Starlight Event-Sourced Hybrid Memory substrate. Manages append-only JSONL truth ledgers, SQLite FTS5 hybrid lexical + vector search (RRF), 90-day temporal half-life weighting, contradiction detection, and dreaming background promotion across the 6 semantic vaults.

## The 6 Semantic Memory Vaults

| Vault | Symbol | Focus & Purpose | Retention Policy |
|---|:---:|---|---|
| **Strategic** | ◆ | Architectural decisions, trade-off rationale, locked policies | Permanent with contradiction tracking |
| **Technical** | ⬡ | Empirical patterns, verified code snippets, API schemas | Validated via Sandbox; permanent |
| **Creative** | ✧ | Aesthetic canons, design tokens, narrative lore, voice | Permanent; versioned |
| **Operational** | ▸ | Swarm execution receipts, active state, task telemetry | 90-day temporal decay half-life |
| **Wisdom** | ◎ | Cross-domain heuristics, compounding lessons, dreaming output | Permanent compound distillation |
| **Horizon** | ↗ | Append-only vision ledger, forward moonshots, 10x milestones | Living ledger |

## Procedures

### Procedure 1: Deterministic Vault Append (Event-Sourced JSONL)

1. **Vault Routing**: Select the exact target vault based on knowledge type.
2. **PII & Secret Scrubbing (The Veil)**: Strip API keys, tokens, and sensitive personal identifiers before persistence.
3. **Structure Entry**:
   ```json
   {
     "id": "entry_<timestamp>_<hash>",
     "vault": "technical",
     "title": "Clear searchable summary",
     "content": "Empirically validated pattern or decision...",
     "confidence": 0.95,
     "tags": ["orm", "sqlite", "fts5"],
     "source": "session:2026-08-25",
     "createdAt": "2026-08-25T02:30:00Z"
   }
   ```
4. **Append & SQLite Sync**: Append to `memory/vaults/<vault>.jsonl` with atomic locking; trigger SQLite FTS5 index update.

### Procedure 2: Hybrid RRF Retrieval (Lexical BM25 + Vector Embeddings)

1. **Query Construction**: Extract semantic entities and keyword vectors from operator request.
2. **Hybrid Search Execution**:
   - Query SQLite FTS5 index for exact token matches ($R_{\text{FTS}}$).
   - Compute embedding similarity against local vector index ($R_{\text{vec}}$).
3. **Reciprocal Rank Fusion (RRF)**:
   $$RRF(d) = \sum_{m \in \{FTS, vec\}} \frac{1}{k + r_m(d)} \times e^{-\lambda \Delta t}$$
   Apply temporal half-life decay factor ($e^{-\lambda \Delta t}$) where operational records older than 90 days decay in relevance while strategic/wisdom records maintain weight.
4. **Contradiction Check**: Compare retrieved entries against active workspace state. If contradiction detected, flag divergence and recommend reconciliation.

### Procedure 3: Dreaming & Knowledge Promotion

1. **Background Dreaming Daemon**: Periodic background process inspects high-frequency operational patterns.
2. **Pattern Synthesis**: Promote recurring operational receipts to Technical patterns or Wisdom heuristics.
3. **Log Promotion**: Write promotion records to `memory/CONSOLIDATION_LOG.md` and update `PROMOTION_QUEUE.json`.

## Integration Points

- **MCP Server**: Exposes `starlight-memory` tools (`memory_recall`, `memory_search`, `memory_remember`, `vault_read`, `vault_list`)
- **Storage**: `memory/vaults/*.jsonl`, SQLite FTS5 index at `sis-memory.sqlite`
- **Agents**: Prime, Sage, Hermes, Navigator

## Quality Criteria

- Is the entry recorded in the correct vault with proper tags and confidence calibration?
- Did the hybrid retrieval query return high-precision, temporally weighted results?
- Were secrets and sensitive tokens scrubbed before disk write?
- Are contradictions between new facts and old memory proactively highlighted?
