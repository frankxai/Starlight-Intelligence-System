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
