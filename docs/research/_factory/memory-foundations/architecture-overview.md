# Memory Foundation — Architecture Overview

**Date:** 2026-05-20 (Addendum 2 added Tier 1)
**Companion to:** `synthesis.md` + `CHARTER-ADDENDUM-2.md`
**Purpose:** Mermaid-rendered diagrams of the memory architecture (current + post-Phase-0 + post-Addendum-2 3-tier model). Renders inline on GitHub + site detail page.

---

## Current state (2026-05-20)

```mermaid
flowchart TB
    subgraph CC["Claude Code session"]
        CCMD["CLAUDE.md rules"]
        AUTOMEM["Auto Memory<br/>MEMORY.md"]
        SKILLMEM["Skills<br/>MEMORY.md per skill"]
    end

    subgraph ORCH["SIS Orchestration Layer ✅ keep"]
        BUS["Memory Bus MCP<br/>singleton stdio"]
        GUARD["Guardian<br/>PII redaction"]
        AUDIT["Audit log<br/>memory/_audit/*.jsonl"]
        ROUTER["Router<br/>contract.py"]
        ABC["Substrate ABC<br/>25 LOC"]
    end

    subgraph SUB["Substrate (current — fails A2)"]
        CHROMA["mempalace_upstream<br/>ChromaDB binary<br/>⚠️ NOT filesystem-native"]
        FROZEN["mempalace<br/>atoms.jsonl<br/>520 atoms · frozen"]
    end

    subgraph CANON["Canon — Obsidian-readable"]
        STRATEGIC["strategic-vault.md"]
        TECHNICAL["technical-vault.md"]
        CREATIVE["creative-vault.md"]
        OPERATIONAL["operational-vault.md"]
        WISDOM["wisdom-vault.md"]
        HORIZON["horizon-vault.md"]
    end

    CC -->|hot path| ORCH
    ORCH --> ABC
    ABC --> CHROMA
    ABC -.fallback.-> FROZEN
    ORCH -.attestation per-atom.-> AUDIT
    CHROMA -.no direct read without engine.-> CANON
    FROZEN -.plain JSONL.-> CANON

    classDef fail fill:#3a1a1a,stroke:#ff6b6b,color:#fff
    classDef keep fill:#1a3a1a,stroke:#6bff6b,color:#fff
    classDef canon fill:#1a1a3a,stroke:#6b9bff,color:#fff

    class CHROMA fail
    class FROZEN fail
    class BUS,GUARD,AUDIT,ROUTER,ABC keep
    class STRATEGIC,TECHNICAL,CREATIVE,OPERATIONAL,WISDOM,HORIZON canon
```

**Diagnosis:** The substrate layer fails A2 (filesystem-native). Orchestration layer is sound — keep it. Canon is sovereign and readable. The fix is at the substrate slot only.

---

## Post-Phase-0 target

```mermaid
flowchart TB
    subgraph CC["Claude Code session (operational hot-path)"]
        CCMD["CLAUDE.md rules"]
        AUTOMEM["Auto Memory MEMORY.md"]
    end

    subgraph ORCH["SIS Orchestration Layer (unchanged)"]
        BUS["Memory Bus MCP singleton"]
        GUARD["Guardian"]
        AUDIT["Audit log"]
        ROUTER["Router"]
        ABC["Substrate ABC 25 LOC"]
    end

    subgraph CANDIDATES["Phase 0 dog-food — head-to-head"]
        LETTA["C3 Letta MemFS<br/>markdown + YAML frontmatter<br/>~/.letta/agents/sis/memory/"]
        LANGGRAPH["C7 LangGraph + JsonlStore<br/>atoms-phase0.jsonl<br/>plain text append-only"]
    end

    subgraph HOTPATH["Optional operational hot-path"]
        MEM0["mem0<br/>operator-namespace memory"]
    end

    subgraph ARCHIVE["Archived"]
        CHROMA_ARCH["mempalace_upstream<br/>30-day fallback"]
        FROZEN_ARCH["atoms.jsonl pre-migration<br/>520 atoms"]
    end

    subgraph CANON["Canon — Obsidian-readable (unchanged)"]
        VAULTS["6 vault MD files<br/>strategic · technical · creative<br/>operational · wisdom · horizon"]
    end

    CC -->|hot path| ORCH
    ORCH --> ABC
    ABC ==>|Phase 0 winner| LETTA
    ABC ==>|Phase 0 winner| LANGGRAPH
    ABC -.30 day fallback.-> CHROMA_ARCH
    ORCH -.optional layer.-> MEM0
    LETTA -->|filesystem-native| VAULTS
    LANGGRAPH -->|filesystem-native| VAULTS

    classDef new fill:#1a3a3a,stroke:#6bffff,color:#fff
    classDef keep fill:#1a3a1a,stroke:#6bff6b,color:#fff
    classDef canon fill:#1a1a3a,stroke:#6b9bff,color:#fff
    classDef archive fill:#3a3a1a,stroke:#ffff6b,color:#888

    class LETTA,LANGGRAPH new
    class BUS,GUARD,AUDIT,ROUTER,ABC keep
    class VAULTS canon
    class CHROMA_ARCH,FROZEN_ARCH archive
```

**Resolution:** Phase 0 winner replaces the substrate slot. A2 axiom restored — every atom is filesystem-readable plain text without engine. ChromaDB demoted to 30-day fallback. mem0 becomes optional operational hot-path layer above the substrate, NOT a substrate replacement.

---

---

## 3-tier model (Addendum 2 — AgentDB tier added)

```mermaid
flowchart TB
    subgraph T1["Tier 1 — Agent State DB · per-agent durable"]
        T1S["sqlite-memory / brainctl<br/>SQLite + FTS5 + vector<br/>~/.sis/agentdb/&lt;agent-id&gt;.db<br/>📁 single-file portable"]
    end

    subgraph T2["Tier 2 — Operational hot-path · session memory"]
        T2S["mem0 (optional)<br/>OR none-needed"]
    end

    subgraph T3["Tier 3 — Substrate canon · sovereign durable"]
        T3S["Letta MemFS OR LangGraph+JsonlStore<br/>markdown / JSONL<br/>📁 filesystem-native<br/>SIP attestation per atom"]
    end

    subgraph CANON["Canon — Obsidian-readable"]
        VAULTS["6 vault MD files<br/>strategic · technical · creative<br/>operational · wisdom · horizon"]
    end

    subgraph ORCH["SIS Orchestration Layer — fronts ALL tiers"]
        BUS["Memory Bus singleton MCP"]
        GUARD["Guardian PII redaction"]
        AUDIT["Audit log<br/>memory/_audit/*.jsonl"]
        ROUTER["Router contract.py"]
        ABC["Substrate ABC (25 LOC)"]
    end

    AGENT[("Claude Code agent<br/>session")] -->|hot writes| T1
    AGENT -->|hot writes| T2
    AGENT -->|ratified writes| T3

    T1 -->|via Memory Bus| ORCH
    T2 -->|via Memory Bus| ORCH
    T3 -->|via Memory Bus| ORCH

    ORCH -->|attestation per write| AUDIT
    T3 -->|filesystem-native| CANON
    AUDIT -.dreaming pipeline.->|Fix A 2026-05-20| CANON

    classDef tier1 fill:#1a2a3a,stroke:#5b9bff,color:#fff
    classDef tier2 fill:#2a1a3a,stroke:#9b5bff,color:#fff
    classDef tier3 fill:#1a3a2a,stroke:#5bff9b,color:#fff
    classDef canon fill:#3a2a1a,stroke:#ffb86b,color:#fff
    classDef orch fill:#1a3a3a,stroke:#6bffff,color:#fff

    class T1S tier1
    class T2S tier2
    class T3S tier3
    class VAULTS canon
    class BUS,GUARD,AUDIT,ROUTER,ABC orch
```

**Why three tiers, not one:**
- Tier 1 lifetime = per-agent, persistent across sessions, high-frequency (every tool call)
- Tier 2 lifetime = cross-session, operator-scoped, medium-frequency
- Tier 3 lifetime = substrate-tier, sovereign, low-frequency (per ratification)

Same Memory Bus + Guardian + audit + router fronts all three. Substrate ABC is the seam; three concrete subclasses, one orchestration layer.

## Decision matrix as visual

```mermaid
quadrantChart
    title Candidate positioning — A2 sovereignty × score
    x-axis "Fails A2" --> "Passes A2 strongly"
    y-axis "Lower score" --> "Higher score"
    quadrant-1 "Substrate candidates"
    quadrant-2 "High-score, A2 fail"
    quadrant-3 "Out of running"
    quadrant-4 "Sovereign but low score"

    "Letta MemFS (C3)": [0.95, 0.88]
    "LangGraph + LangMem (C7)": [0.85, 0.82]
    "Cognee (C4)": [0.80, 0.70]
    "Zep / Graphiti (C5)": [0.35, 0.72]
    "mem0 (C2)": [0.20, 0.62]
    "mempalace incumbent (C1)": [0.45, 0.50]
    "Anthropic Memory API (C6)": [0.75, 0.40]
```

C3 and C7 are the only candidates in the top-right quadrant (high A2 + high score). Phase 0 dog-food resolves the tie. Anthropic Memory API is REJECTED separately on A5 (model lock-in) regardless of its position here.

---

## Substrate ABC contract (current — kept across Phase 0)

```mermaid
classDiagram
    class Substrate {
        <<abstract>>
        +commit(atom: Atom) None
        +recall(query, namespace, vault, top_k) Sequence[Atom]
        +health() dict
    }
    class Atom {
        +id: str
        +text: str
        +tier: str
        +namespace: str
        +source: str
        +written_at: str
        +redacted: bool
        +attestation: str
    }
    class MempalaceUpstream {
        ChromaDB backend
        currently PRIMARY ❌ fails A2
    }
    class MempalaceFrozen {
        hashing-TF backend
        atoms.jsonl + vectors.npy
        FALLBACK · 520 atoms frozen
    }
    class LettaMemFSSubstrate {
        Letta MemFS backend
        markdown + YAML frontmatter
        ✅ Phase 0 candidate
    }
    class LangGraphSubstrate {
        BaseStore + JsonlStore
        plain JSONL append-only
        ✅ Phase 0 candidate
    }

    Substrate <|.. MempalaceUpstream
    Substrate <|.. MempalaceFrozen
    Substrate <|.. LettaMemFSSubstrate
    Substrate <|.. LangGraphSubstrate
    Substrate ..> Atom : uses
```

The Substrate ABC is the architectural property that makes this whole research cycle low-risk. **Swapping substrate = writing one new subclass.** ~200-300 LOC. Reversible.

---

*Built on SIP — 2026-05-20 · Mermaid renders inline on GitHub + on site detail page · Pair with synthesis.md*
