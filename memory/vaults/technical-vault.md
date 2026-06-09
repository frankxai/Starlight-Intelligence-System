---
type: vault
vault: technical
retention: permanent
writers:
- architect
- sentinel
readers: all
last_consolidated: '2026-05-11'
---

# Technical Vault

> *"Patterns are the currency of engineering wisdom."*

**Vault Type:** Technical Patterns & Architecture
**Retention:** Permanent with periodic refinement
**Primary Writers:** Starlight Architect, Starlight Sentinel
**Access:** All agents (read), Architect + Sentinel (write)

---

## Vault Index

| Date | Entry | Category | Confidence |
|------|-------|----------|------------|
| 2026-02-10 | Configuration-First Pattern | architecture-pattern | 0.95 |
| 2026-02-10 | Skill Auto-Activation Pattern | skill-pattern | 0.90 |
| 2026-02-10 | Memory Hierarchy Pattern | memory-pattern | 0.90 |
| 2026-05-06 | Core Regression Harness Pattern | test-pattern | 0.90 |

---

## Entries

### [2026-02-10] Configuration-First Pattern

**Category:** architecture-pattern
**Confidence:** 0.95
**Source:** Starlight Architect / Pattern extracted from ACOS v6
**Related:** Strategic Vault - Architecture Decision

**Pattern:** Use markdown files and JSON configuration instead of executable code for AI system definition.

**Structure:**
- Agent definitions → `.md` files with identity, capabilities, protocols
- Skill definitions → `.md` files with procedures and activation criteria
- Activation rules → `.json` files with keyword/agent/intent triggers
- Memory → `.md` files with structured entries

**Benefits:** Zero install friction, works across environments, creator-friendly, leverages Claude's native intelligence.

**Anti-pattern:** Code-first agent systems requiring TypeScript runtimes, WASM compilation, or complex build steps.

---

### [2026-02-10] Skill Auto-Activation Pattern

**Category:** skill-pattern
**Confidence:** 0.90
**Source:** Starlight Architect / Pattern extracted from ACOS v6 skill-rules.json
**Related:** Technical Vault - Configuration-First Pattern

**Pattern:** Skills activate automatically based on context without explicit invocation.

**Mechanism:**
1. Request analyzed for keywords, agent context, and intent
2. `skill-rules.json` consulted for matching rules
3. Matching skills loaded at appropriate depth (metadata → summary → core → full)
4. Skills deactivate when task completes

**Priority Order:** Exact match > Keyword match > Agent default > Context inference

**Key Insight:** Progressive loading (4 levels) prevents token budget overrun while ensuring skills are available when needed.

---

### [2026-02-10] Memory Hierarchy Pattern

**Category:** memory-pattern
**Confidence:** 0.90
**Source:** Starlight Architect / Pattern from AI-Ops AGI research
**Related:** Wisdom Vault - Memory is Power Principle

**Pattern:** Memory organized in a hierarchy from volatile to permanent.

**Hierarchy:**
1. Working Memory → Current session context (ephemeral)
2. Episodic Memory → Session Notes + Operational Vault (medium-term)
3. Semantic Memory → Technical/Creative/Strategic Vaults (long-term)
4. Procedural Memory → Skills + Wisdom Vault (permanent)

**Consolidation:** Knowledge flows upward through the hierarchy over time. Working memory insights get captured as episodes, episodes get generalized into semantic knowledge, and proven semantic knowledge becomes procedural skill.

---

### [2026-05-06] Core Regression Harness Pattern

**Category:** test-pattern
**Confidence:** 0.90
**Source:** Codex / repo quality pass
**Related:** Technical Vault - Memory Hierarchy Pattern

**Pattern:** Every core storage or retrieval bug gets a small executable regression test wired into the default root test suite.

**Applied:** Added coverage for platform-native `MemoryManager.save()` paths and `RetrievalIndex.rebuildFromVaults()` indexing of MCP-style `content` entries. Also fixed SQLite FTS `MATCH` usage to avoid alias-based query failures.

**Why it matters:** The repo's protocol layer is heavily conformance-tested, but runtime storage edges need the same treatment. A passing `npm test` should cover both substrate shape and operational behavior.

---

---

### [2026-04-25] Claw Contract Pattern

**Category:** claw-pattern
**Confidence:** 0.95
**Source:** Starlight Architect / Claw Architecture Session
**Related:** Strategic Vault — SIS Claws Architecture Decision

**Pattern:** Every installable operational unit (Claw) carries a machine-readable contract in `CLAW.md`.

**Contract fields:**
- `name`, `version`, `purpose`, `phase`
- `permissions` — filesystem, sis_vaults, shell, network (declared minimum surface)
- `inputs` / `outputs` — exactly what the Claw consumes and produces
- `commands` — slash commands the Claw registers
- `skills.requires` / `skills.activates`
- `mcp.required` / `mcp.optional`
- `safety.mutation_default` (default: false), `safety.private_data_export`, `safety.requires_sentinel`
- `agents.primary` / `agents.supporting`

**Benefits:**
- Installable: `openclaw install frankxai/sis-genius-claw` reads CLAW.md to validate prerequisites
- Auditable: Sentinel Claw compares declared permissions vs. actual runtime behavior
- Composable: Multiple Claws compose through Memory Claw and Sentinel Claw, not through direct coupling
- Sovereign: Each Claw declares minimum permissions — no runtime escalation

**Anti-pattern:** Agent personas without bounded contracts — no declared permissions, no defined outputs, no mutation safety — are toy agents, not product infrastructure.

---

### [2026-04-25] Local-First Ingestion Pattern

**Category:** data-architecture
**Confidence:** 0.92
**Source:** Starlight Architect / Claw Architecture Session
**Related:** Strategic Vault — SIS Claws Architecture Decision

**Pattern:** External sources are ingestion points, not the memory substrate.

**Correct data flow:**
```
External sources (Drive, Notion, PDFs, repos, Canva)
        ↓
Ingestion Claw (Genius, Reclamation)
        ↓
Classification + extraction
        ↓
SIS vaults (local ~/.starlight/)
        ↓
Platform exports (Claude Code, Codex, ChatGPT Projects)
```

**Rule:** Only `sis-memory-mcp` writes to canonical vault memory. External MCPs (filesystem-mcp, google-drive-mcp, notion-mcp) are read-only ingestion surfaces. This prevents tool chaos where multiple systems become authoritative for the same memory.

**Cloud boundary:** Public vault, attestation ledger, docs, and install packages are cloud-safe. The canonical agent memory layer stays local. This preserves the sovereignty contract.

**Anti-pattern:** Using Google Drive or Notion as the memory substrate — excellent raw material stores but poor canonical memory layers.
