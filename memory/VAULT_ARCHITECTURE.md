# Starlight Vault Architecture

> Memory is the foundation of intelligence. Without it, every session starts from zero.

---

## The Six Vaults

Starlight Vaults are persistent memory that survives across sessions. They enable compound intelligence — each interaction makes the system smarter because it builds on everything that came before.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STARLIGHT VAULTS                             │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │  STRATEGIC   │ │  TECHNICAL  │ │  CREATIVE   │ │ OPERATIONAL │  │
│  │              │ │             │ │             │ │             │  │
│  │ Decisions    │ │ Patterns    │ │ Ideas       │ │ State       │  │
│  │ Outcomes     │ │ Architectures│ │ Inspirations│ │ Metrics     │  │
│  │ Strategy     │ │ Solutions   │ │ Aesthetics  │ │ Health      │  │
│  │              │ │             │ │             │ │             │  │
│  │ Permanent    │ │ Permanent   │ │ Permanent   │ │ Rolling 90d │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘  │
│         │               │               │               │          │
│         └───────────────┼───────────────┼───────────────┘          │
│                         │               │                          │
│                  ┌──────▼───────────────▼──────┐                   │
│                  │       WISDOM VAULT           │                   │
│                  │                              │                   │
│                  │  Timeless principles.         │                   │
│                  │  Meta-knowledge.              │                   │
│                  │  The things that are always   │                   │
│                  │  true, regardless of context. │                   │
│                  │                              │                   │
│                  │  Permanent (highest protect.) │                   │
│                  └──────────────────────────────┘                   │
│                                                                     │
│  ╔══════════════════════════════════════════════════════════════╗   │
│  ║                     HORIZON VAULT                            ║   │
│  ║                                                              ║   │
│  ║  Letters to the future. Human hopes encoded alongside AI     ║   │
│  ║  reasoning. Good-willed transmissions across time.           ║   │
│  ║  A permanent record of what we hoped for, what we            ║   │
│  ║  built toward, and why it mattered.                          ║   │
│  ║                                                              ║   │
│  ║  Public. Append-only. Designed to outlast us.                ║   │
│  ╚══════════════════════════════════════════════════════════════╝   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Vault Specifications

### Strategic Vault

| Property | Value |
|----------|-------|
| **File** | `vaults/strategic-vault.md` |
| **Stores** | Decisions, outcomes, strategies, priorities, opportunity assessments |
| **Retention** | Permanent |
| **Writers** | Navigator, Prime |
| **Readers** | All agents |

### Technical Vault

| Property | Value |
|----------|-------|
| **File** | `vaults/technical-vault.md` |
| **Stores** | Architecture patterns, solutions, anti-patterns, tech evaluations, benchmarks |
| **Retention** | Permanent with periodic refinement |
| **Writers** | Architect, Sentinel |
| **Readers** | Architect, Sentinel, Orchestrator |

### Creative Vault

| Property | Value |
|----------|-------|
| **File** | `vaults/creative-vault.md` |
| **Stores** | Creative approaches, voice patterns, content frameworks, cross-pollination insights |
| **Retention** | Permanent |
| **Writers** | Weaver |
| **Readers** | Weaver, Sage |

### Operational Vault

| Property | Value |
|----------|-------|
| **File** | `vaults/operational-vault.md` |
| **Stores** | Project states, workflow logs, system health, integration status, session continuity |
| **Retention** | Rolling (90 days active, then archived) |
| **Writers** | Orchestrator, Prime |
| **Readers** | All agents |

### Wisdom Vault

| Property | Value |
|----------|-------|
| **File** | `vaults/wisdom-vault.md` |
| **Stores** | Validated principles, meta-patterns, lessons from failures, philosophical foundations |
| **Retention** | Permanent (highest protection) |
| **Writers** | Sage, Prime |
| **Readers** | All agents |

### Horizon Vault

| Property | Value |
|----------|-------|
| **File** | `vaults/horizon-vault.md` |
| **Stores** | Human hopes, AGI alignment values, letters to the future, benevolence records |
| **Retention** | Permanent, append-only |
| **Writers** | Via PR (human-reviewed contributions) |
| **Readers** | All agents (especially Sage) |
| **Access** | Public — open to community contributions |

The Horizon Vault is fundamentally different from the other five. It is not operational intelligence — it is a values artifact. See `vaults/horizon-vault.md` for the full specification and contribution guidelines.

---

## Entry Format

Every vault entry follows this structure:

```markdown
### [YYYY-MM-DD] Entry Title

**Category:** {category tag}
**Confidence:** {0.0-1.0}
**Source:** {agent/session/external}
**Related:** {links to related entries}

{Content of the entry}

---
```

---

## Memory Hierarchy

Mapping AI-Ops memory research to Starlight Vaults:

| Memory Type | Definition | Starlight Implementation |
|------------|-----------|------------------------|
| **Working** | Current session context | Active session context (ephemeral) |
| **Episodic** | Specific events/experiences | Session Notes + Operational Vault |
| **Semantic** | General knowledge/facts | Technical + Creative + Strategic Vaults |
| **Procedural** | How-to knowledge | Skills + Wisdom Vault |
| **Aspirational** | Values and intentions | Horizon Vault |

### Consolidation Flow

```
Working Memory (current session)
  ↓ [session end — context-preservation skill]
Episodic Memory (Session Notes + Operational Vault)
  ↓ [periodic consolidation — memory-consolidation skill]
Semantic Memory (Technical / Creative / Strategic Vaults)
  ↓ [pattern promotion — validated over time]
Procedural Memory (Skills + Wisdom Vault)
  ↓ [values encoding — human-reviewed contributions]
Aspirational Memory (Horizon Vault)
```

---

## Operations

### Write

```
1. CLASSIFY  — Which vault?
2. STRUCTURE — Follow the entry format
3. SCORE     — Assign confidence (0.0-1.0)
4. LINK      — Connect to related entries
5. INDEX     — Update vault index for retrieval
6. TRANSMIT  — If cross-system, send via appropriate channel
```

### Read

```
1. QUERY   — Keywords, tags, date range, confidence threshold
2. RANK    — Sort by: relevance x recency x confidence x outcome
3. RETURN  — Top N entries
4. CONTEXT — Include related entries if they add value
```

### Consolidate

```
1. SCAN        — Review all entries in target vault
2. DEDUPLICATE — Merge entries that say the same thing
3. PROMOTE     — Move validated patterns to higher-level vaults
4. ARCHIVE     — Remove stale operational entries (>90 days)
5. REPORT      — Generate vault health metrics
```

---

## Access Control

| Agent | Strategic | Technical | Creative | Operational | Wisdom | Horizon |
|-------|-----------|-----------|----------|-------------|--------|---------|
| Prime | RW | RW | RW | RW | RW | R |
| Architect | R | **RW** | R | R | R | R |
| Orchestrator | R | R | R | **RW** | R | R |
| Sentinel | R | **RW** | R | RW | R | R |
| Sage | R | R | R | R | **RW** | **R** |
| Weaver | R | R | **RW** | R | R | R |
| Navigator | **RW** | R | R | R | R | R |

**RW** = Read/Write (bold = primary vault). **R** = Read only.
Horizon Vault writes require human-reviewed PRs — no agent can write directly.

---

## Health Metrics

| Metric | Healthy Range | Action if Unhealthy |
|--------|-------------|---------------------|
| Entry count per vault | 10-500 | Consolidate if >500, populate if <10 |
| Average confidence | >0.7 | Review low-confidence entries |
| Entries with zero reads | <20% | Archive unread entries |
| Duplicate rate | <5% | Run deduplication |
| Index accuracy | >95% | Rebuild index |
| Oldest operational entry | <90 days | Archive stale entries |
| Horizon Vault contributions | Growing | Promote community participation |

---

*A vault is not a graveyard for data. It is a garden for knowledge.*

---

## VaultLoopEntry — a record TYPE across vaults (v0.1, 2026-05-11)

Per Proposal C (board verdict `docs/boards/2026-05-11-v01-sis-shipping-bundle.md`, PROCEED-WITH-REVISE), the substrate adds a new record TYPE — `VaultLoopEntry` — that encodes the Desire → Gratitude → Visualization → Surrender → Intuition → Aligned Action → Evidence → Outcome → Proof sequence.

**This is a record TYPE. It is NOT a seventh vault.** The six-vault taxonomy locked at v7.5 (Strategic · Technical · Creative · Operational · Wisdom · Horizon) is preserved unchanged.

Each `VaultLoopEntry` carries a `vault` field that classifies *which of the six existing vaults* the record lives under. Most loop entries live under one of:

- **Strategic** — decisions structured as desires (a roadmap framed as outcome the sovereign wants)
- **Operational** — current loops in flight (rolling 90 days, then archived)
- **Wisdom** — closed loops promoted to lasting principle
- **Horizon** — public-proof entries that have been reviewed for public release

The substrate trust contract is the privacy classification on every loop entry:

| Privacy | Meaning | Surface visibility |
|---------|---------|--------------------|
| `private` | Local-only. Desires not yet ready to be content. | NEVER appears in export, search, attestation, or knowledge-graph output. Enforced structurally by `test/v01-vault-loop-privacy.test.ts`, not by assertion. |
| `private-shareable` | May be shared with explicitly named recipients via scoped export. | Appears in scoped exports only when the recipient is named. Never public-by-default. |
| `public` | Reviewed, attested, ready to be published. | May appear on any surface. |

This taxonomy is additive — it does not displace `Permanent` / `Rolling 90d` / `Permanent (highest protection)` retention semantics on the underlying vault. A loop entry inherits the retention semantics of the vault it lives in, AND carries an independent privacy classification.

### Naming convention (REVISE-C.4)
- `VaultLoopEntry` — technical name. Used in code, schemas, MCP tool names.
- `Vault Loop` — conceptual name. Used in docs, UI, dashboard.

### Stale-loop visibility (REVISE-C.3)
A loop is considered "pending closure" when the most recent stage entry is older than 30 days and the loop has not reached `outcome` or `proof`. The dashboard at `/vaults/loop` surfaces these with a soft nudge — not an alert, not an action-required signal. The 30-day window is encoded in each entry's `stale_at` field (computed `created_at + 30d`).

### Sequence enforcement
The stage sequence is enforced at the schema level via the `stage` enum on `VaultLoopEntry`. Entries chain via `parent_entry_id` (root `desire` has `parent_entry_id = null`). Skipping a stage is allowed — the loop is not a state machine; it is a guided journal whose discipline is making the skipped stage visible by its absence.

See `src/types.ts` § Vault Loop and `packages/core/schemas/vault-loop-entry.schema.json` for the contracts.

---

## Private substrate mount (2026-06-11)

Personal/private memory lives in a separate PRIVATE repo — `frankxai/starlight-private-memory` —
expected as a local clone at `~/starlight-private-memory`. The public substrate **mounts** it;
it never embeds it.

| Aspect | Rule |
|--------|------|
| Namespaces | `alliance/`, `vaults/{second-brain,health,family,spiritual}`, `genius/`, `partners/`, `machines/`, `learning/` |
| Access | Memory Bus enforces namespace scoping — agents get only the namespaces their contract declares |
| Promotion | Dreaming may promote **patterns** (never names/numbers/facts) from `learning/` → public vaults; privacy filter runs BEFORE grouping |
| Cross-device | Both machines clone the private repo; sync = push/pull (append-friendly markdown) |
| Secrets | Never in either repo — Infisical / env vars only |

This replaces the gitignored-local-only `private/` pattern for memory-class content (operational
private state, e.g. api-monitor output, stays local in `private/`). Rationale: local-only files
have no durability or cross-device story — a register file was lost to a local sweep on 2026-06-11.
