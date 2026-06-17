# Starlight Swarm Topology & Memory Layer Strategy

> Architectural specification for the L99 Swarm Topology and dedicated Memory Substrate. Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1).

---

## 1. Swarm Topology: Kings, Queens, and Governance

To scale the Starlight Intelligence System beyond a flat council of specialists to a multi-tiered corporate/personal execution swarm, we introduce three core structural primitives: **Kings**, **Queens**, and the **Model Council**.

```
                        ┌───────────────────────────────────────┐
                        │          USER (Sovereign Node)        │
                        └───────────────────┬───────────────────┘
                                            │
                        ┌───────────────────▼───────────────────┐
                        │      KINGS (Immutable Policy Locks)    │
                        └───────────────────┬───────────────────┘
                                            │
                        ┌───────────────────▼───────────────────┐
                        │  QUEEN / CENTRAL COMMAND (Orchestrator)│
                        └─────────┬───────────────────┬─────────┘
                                  │                   │
            ┌─────────────────────▼───┐           ┌───▼─────────────────────┐
            │   DOMAIN QUEENS (Music) │           │  DOMAIN QUEENS (Energy) │
            └───────────┬─────────────┘           └───────────┬─────────────┘
                        │                                     │
           ┌────────────┴───────────┐            ┌────────────┴───────────┐
           │ Domain Agents (144+ )  │            │ Domain Agents (144+ )  │
           └────────────────────────┘            └────────────────────────┘
```

### 1.1 Kings: Sovereign Policy Anchors & Authority Locks
**Kings** are not active, chatty agents. They represent **immutable policy anchors**, **governance rules**, or **cryptographic custody boundaries** set by the Sovereign user. They define the boundaries within which the active swarms must operate:
- **Value Custody:** Absolute spending ceilings, transaction authorization rules, and API wallet allocations.
- **System Boundaries:** Git write-access blocks on substrate directories (`SIP.md`, `CLAUDE.md`), pre-commit hooks, and PII-scrubbing parameters (The Veil).
- **Rule Verification:** A King represents a "non-negotiable invariant" that the Active Healing Daemon or SAGE cannot bypass, even in yolo mode.

### 1.2 Queens: Meta-Orchestration Loops
**Queens** are the active meta-orchestrators of the system. While standard agents act as specialists (e.g., Hiring, Production, Sizing), Queens manage the active loops and synthesis lines:
- **Starlight Queen (System Overseer):** Coordinates the main system, runs the `ROUTE → MEASURE → LEARN → RATIFY → LEDGER` closed self-improvement loop, manages context compression, and drives the background dreaming pipelines.
- **Domain Queens (Vertical Coordinators):** Verticals (e.g., Music IS, Energy IS, Space/Cosmos) run their own loops. A Domain Queen acts as the local orchestrator for that specific vertical, fanning tasks to its sub-system agents and verifying results.

### 1.3 The Starlight Board & Model Council
High-stakes proposals (A1/A2, substrate-level modifications) cannot be decided by a single agent or a single LLM instance.
- **Starlight Board:** Convened for major strategic verdicts. Evaluates changes using five functional pressure vectors: **Sovereign** (irreversibility), **Seer** (second-order effects), **Harmonizer** (alignment/conflicts), **Strategist** (leverage), and **Verifier** (execution/reality checks).
- **Model Council:** A consensus-seeking system that runs the proposal across a heterogeneous set of LLMs and CLI tools (e.g., Fable 5, Opus 4.8, Grok 4.3, Gemini 3.5). The proposal is only executed if a consensus coefficient ($C_c \ge 0.80$) is achieved, ensuring that single-model hallucinations do not compromise the sovereign substrate.

---

## 2. Dedicated Memory Layer: `starlight-memory`

As the Starlight Intelligence System processes hundreds of daily tasks, context logs, and agentic interactions, the local database and memory system require a dedicated, separate architectural layer.

### 2.1 The Split Strategy
We propose separating memory management into a standalone repository: **`starlight-memory`**. This preserves the core SIS repository as a clean execution and routing engine, while the memory repository handles state, vector indexes, and query routing.

```
   ┌──────────────────────────────┐              ┌──────────────────────────────┐
   │ Starlight Intelligence System │              │       starlight-memory       │
   │                              │              │                              │
   │  - Routing Matrix            │  API/MCP     │  - Vector Embeddings         │
   │  - Agent Specifications      ├─────────────►│  - SQLite FTS5 Hybrid Index  │
   │  - Slash Commands            │  Loopback    │  - JSONL Event Spine         │
   │  - CLI / UI Cockpit          │              │  - mem0 Graph Databases      │
   └──────────────────────────────┘              └──────────────────────────────┘
```

- **Clean API:** SIS connects to `starlight-memory` using a local loopback server or custom MCP server (`mcp-server.js`).
- **P2P Sync Compatibility:** The event-sourced JSONL memory files (`memory/vaults/*.jsonl`) remain compatible with Syncthing, allowing multi-device state synchronization.
- **Dependency Minimization:** Embedding generation (e.g., numpy, sentence-transformers) is localized to the memory engine, keeping the core client lightweight and zero-dependency.

### 2.2 Integration of mem0 and MemPalace Graph Memory
We incorporate a hybrid semantic + graph-based memory model:
- **Semantic Vector Storage:** Used for fast similarity searches and long-term history recall.
- **mem0 Graph-Entity Memory:** Maps relationships between people, concepts, projects, and rules. When the system learns that "Frank prefers Outfit font for brand visuals," it writes an entity relationship node, preventing conversational drift.
- **MemPalace Dream Consolidation:** During background processing (dreaming), a scheduler consolidates raw transcripts, extracts repeating frameworks, resolves contradictions, and updates the strategic vault.

### 2.3 Strict Privacy Gating (No Leaks)
To ensure that personal, proprietary, or financial context never leaks to public surfaces (such as the Next.js `MemoryPalace` visual component or `starlightintelligence.org`), we enforce three rules:
1. **Tag-Based Gating:** Every memory atom is stored with a classification tag. Tags like `#private`, `#financial`, `#credentials` are automatically filtered out by the local Sanitization Gateway (The Veil).
2. **Dynamic Client Decoupling:** The public `MemoryPalace.tsx` component is populated using an anonymized, curated build-time export (`public-vault/`). It never communicates directly with local SQLite databases or live vaults.
3. **Local Encryption:** The local private vault (`private/`) is encrypted at rest using keys managed by a local hardware security module or local keystore, ensuring that even if the git repository is public, the personal data is protected.

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, memory]
