# Modular Swarm Architecture & AMCP Connectors

> Architectural specification for dynamic modular swarm packaging and Agent Model Context Protocol (AMCP) integration. Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1).

---

## 1. Modular Swarms: Repository Isolation

To prevent the core Starlight Intelligence System (SIS) repository from bloating, specialized domain verticals (such as Space/Cosmos, Marine, and Longevity) are decoupled from the core codebase.

```
                  CORE STARLIGHT INTELLIGENCE SYSTEM
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  starlight-marine        starlight-space       starlight-longevity
  (Git Submodule)        (npm/python pkg)       (Isolated Folder)
```

### 1.1 Packaging Options
Specialized verticals can be integrated using three isolated mechanisms:
1.  **Git Submodules:** Recommended for active development. Submodules are placed in `verticals/<domain-slug>/` and carry their own git history, file contract, and testing suites.
2.  **External Package Dependencies:** Domain swarms can be packaged as scoped npm or Python packages (e.g., `@starlight-swarm/marine-intelligence`) and installed in node_modules/ or virtual environments.
3.  **Config-Driven Paths:** The modular registry reads `verticals-registry.json` (located in the gitignored `private/` directory) to resolve local absolute file paths for domain agent profiles and skills.

### 1.2 Registry Integration
The core Orchestrator dynamically loads agent profiles and skill rules at runtime by scanning both the core folders (`agents/`, `skills/`) and the active vertical subfolders:
- **Agents Scanning:** Resolves `verticals/<domain-slug>/agents/*.md` profiles.
- **Skills Loading:** Automatically merges `verticals/<domain-slug>/skills/skill-rules.json` with the core `skills/skill-rules.json`.
- **Test Exemption:** Core symmetry tests (e.g., `v76.test.ts`) ignore directories under `verticals/` unless explicitly declared as a core reference vertical in `v79-vertical-coverage.test.ts`.

---

## 2. Agent Model Context Protocol (AMCP)

AMCP is an API and MCP-based connector specification that allows external agent harnesses (such as Mastra, Agno, Letta, or CrewAI) to hook into the Starlight Intelligence System.

```
 ┌───────────────────────────┐                ┌───────────────────────────┐
 │ External Harness (Mastra) │  JSON-RPC/MCP  │ Starlight AMCP Connector  │
 │                           ├───────────────►│                           │
 │  - Runs custom agent task │                │  - Queries memory vaults  │
 │  - Lacks vector PKM       │                │  - Enforces King locks    │
 └───────────────────────────┘                └───────────────────────────┘
```

### 2.1 The AMCP Schema
The AMCP gateway extends the standard Model Context Protocol (MCP) by exposing three groups of resources and tools:

#### 1. Memory Retrieval Tools
*   `amcp_memory_search(query, limit, vaults)`: Searches vector database and returns hybrid RRF-ranked context.
*   `amcp_memory_append(vault, entry, tags)`: Appends a structured JSONL memory atom, enforcing client-auth credentials.
*   `amcp_session_store(harness_id, key, value)`: Stores short-term execution state in the Memory Gateway SessionStore.

#### 2. King Policy Gateways
*   `amcp_policy_check(action, payload)`: Validates if a proposed transaction or action violates any active King policy locks (e.g., spend ceilings, PII leaks).
*   `amcp_policy_verify_commit(diff)`: Scans code modifications for forbidden imports or credentials before staging.

#### 3. Starlight Board & Council Consensus
*   `amcp_board_evaluate(proposal, vectors)`: Convenes a simulated Board challenge (Sovereign, Seer, Harmonizer, Strategist, Verifier) and returns a verdict recommendation.
*   `amcp_consensus_verify(proposal, model_votes)`: Calculates the consensus coefficient for multi-model verification.

### 2.2 Security & Permissions
To ensure that private vaults are protected from malicious code, AMCP enforces token-based authentication:
- **Read-Only Access:** Default for external integrations. Enables semantic search and context recall across public and non-private tags.
- **Write Access:** Requires a cryptographically signed client token matched against `private/amcp-clients.json`. Permitted only for appending memory logs or session items.
- **Substrate Access:** Irreversible substrate-level edits are strictly blocked over the AMCP gateway. They must be executed locally through the interactive cockpit with fresh user approval (Frank-ack).

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, amcp]
