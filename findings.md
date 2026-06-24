# Findings: Swarm Research & Design Analysis

> Repository analyses, framework capabilities, matrix scaling models, and Starlight Queen specifications.
> Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1).

---

## 1. Best-in-Class GitHub Repositories & Agentic Ecosystems

We evaluated six leading multi-agent platforms and patterns to integrate their strengths into the Starlight Intelligence System (SIS) meta-layer:

### Letta (MemGPT)
*   **Core Strengths:** Virtual OS-like context window pagination. It separates agent state into Core (persistent instructions/user facts), Recall (message logs), and Archival (searchable vector store). Agents can dynamically write, edit, and read their own memory pages using internal loop operations.
*   **Starlight Adaptation:** Adapting a **ContextCompactor** agent that monitors token pressure in active sessions and pages inactive dialogue turns out of the prompt, summarizing key facts into the Technical or Operational memory vaults.

### ai16z Eliza
*   **Core Strengths:** Direct blockchain agentic integrations (EVM/Solana wallet management, mempool scanning, token deployment) paired with autonomous multi-channel social posting loops (Twitter, Discord, Telegram). Action-Provider-Evaluator architecture allows agents to continuously execute actions and verify outcomes.
*   **Starlight Adaptation:** Map Eliza's blockchain connection client stack into the **Crypto Intelligence** House, and adapt its autonomous evaluator-action loop for real-time social campaign orchestration.

### Mastra (TypeScript-native)
*   **Core Strengths:** Built entirely in TypeScript on top of Vercel AI SDK. Focuses on **durable workflows** (state-machine-driven, parallel routing, and the ability to suspend/resume execution steps), type-safe integrations with third-party APIs, and granular observability tracing (OpenTelemetry integration for latency, token counts, and tool traces).
*   **Starlight Adaptation:** Introduce durable state-machine routing for multi-agent workflows inside `si-dispatch`, and wire OpenTelemetry tracing into the Echo Portal dashboard to monitor agent tool execution metrics.

### Agno (formerly Phidata)
*   **Core Strengths:** Declarative agent definition with modular toolkits, vector databases, and knowledge bases in a clean Pythonic API. Implements a production-ready API runtime (AgentOS) with secure authentication, built-in cron scheduling, and Human-in-the-Loop (HITL) manual gates.
*   **Starlight Adaptation:** Standardize the YAML schema formats for agent profiles and implement clean, manual approval gates (`/schedule` or dashboard button) for high-impact actions like execution of terminal commands or code writes.

### CrewAI & AutoGen
*   **Core Strengths:** Role-playing hierarchical swarms and state-machine conversation graphs. AutoGen excels in multi-agent conversation patterns (group chat, round-robin, hierarchical) and code execution loops. CrewAI excels in role-based task decomposition (backstory, goals, specific tools) and sequential/hierarchical processes. CrewAI Flows provide event-driven branching logic and deterministic backbone states combined with agentic decision-making nodes.
*   **Starlight Adaptation:** Map hierarchical and state-machine routing concepts into our orchestration layer (`si-dispatch`). This allows specialized specialist subagents to be orchestrated in structured task groups rather than loose prompts.

### Olas (Autonolas)
*   **Core Strengths:** Off-chain multi-agent services coordinated via on-chain consensus (Tendermint/ABCI) and execution accountability (Gnosis Safe multisigs). Designed for cooperative keeper networks that perform decentralized off-chain computation, verify outcomes collectively, and record them on-chain.
*   **Starlight Adaptation:** Introduce decentralized keeper monitoring patterns to our active healing and backup loops. This ensures background sentinel processes can reach consensus on codebase audits and system state across multiple runtimes.

### Fabric (Daniel Miessler)
*   **Core Strengths:** Crowd-sourced, crowd-verified markdown patterns for granular, task-specific text extraction, summarization, and cognitive tasks (e.g., extracting wisdom, writing threads, coding).
*   **Starlight Adaptation:** Introduce a native command `/fabric-import` in our integration layer that downloads and parses public Fabric markdown prompts, auto-generating compliant Starlight skills under `skills/integration/` with YAML metadata.


## 2. The Multi-Thousand-Agent Matrix (144x12)

To scale the Starlight Swarm into a multi-thousand-agent matrix, we model the topology as 12 federated Houses, each comprising a nested 144-agent council. This results in $12 \text{ Houses} \times 144 \text{ Agents} = 1728$ active specialized roles.

### 2.1 The Twelve Federated Houses
Each House acts as an autonomous domain vertical containing its own schema, skills, memory namespace, and localized control loops:
1.  **House of Code & Systems (The Engine):** Dev automation, compiler pipelines, MCP server tools, and test suites.
2.  **House of Wealth & Capital (The Ledger):** Crypto allocation, DeFi, Dutch BV tax architecture, real estate planning.
3.  **House of Creator & Media (The Beacon):** Visual production (Higgsfield/Midjourney), copywriting, newsletters, branding.
4.  **House of Health & Life (The Substrate):** Longevity, sleep, biomechanics, training, wearable telemetry.
5.  **House of Music & Acoustics (The Harmony):** Composition, mixing, ISRC registry, royalties, sync placement.
6.  **House of People & Relational (The Alliance):** Performance design, coaching, curriculum design, organizational trauma audits.
7.  **House of Space & Orbit (The Horizon):** Orbital mechanics, telemetry ingestion, space debris mapping.
8.  **House of Marine & Depths (The Depths):** Bio-acoustics, dive coordination, water quality, species mapping.
9.  **House of Legal & Contracts (The Shield):** GDPR compliance, IP management, trademark logs, terms of service.
10. **House of Infrastructure & Ops (The Kernel):** Hardware, cluster administration, backups, CDN routing, deployment.
11. **House of Research & Science (The Library):** Literature retrieval (arXiv/bioRxiv), citation mapping, data aggregation.
12. **House of Wisdom & Alignment (The Anchor):** Existential alignment, value analysis, dream consolidation.

### 2.2 The Nested 144-Agent House Taxonomy
Each of the 12 Houses is organized into a strict internal structure of 144 roles:

*   **Apex Leadership Tiers (12 Agents):**
    *   `1x Domain Queen` (Workflow orchestrator, local memory routing, subagent execution state)
    *   `1x Domain King` (Immutable policy locks, permission gates, custody boundaries)
    *   `1x Domain Architect` (System design, custom tool generation, local API schemas)
    *   `1x Domain Sentinel` (Security reviews, license audits, regression checks)
    *   `1x Domain Sage` (Local vault history, pattern compiler, retrieval)
    *   `7x Domain Council Archetypes` (Local advisory seats representing specific values/perspectives)
*   **Core Universal Specialist Tiers (36 Agents):**
    *   `12x Intake & Routing Specialists` (Query parsing, classification, packet handoffs)
    *   `12x Data Translators & Extractors` (Format translation, corpus mining)
    *   `12x Platform Adapters` (Eliza, Letta, CrewAI, AutoGen adapters specific to this domain)
*   **Domain Sub-Stack Tiers (72 Agents):**
    *   `6x Sub-systems` $\times$ `12x Specialists` = 72 Agents.
    *   (e.g., in House of Music: Composition, Production, Catalog, Performance, Audience, Sync)
*   **Federated Relay Tiers (24 Agents):**
    *   `12x P2P Sync Relays` (Device conflict resolution, Syncthing log monitoring)
    *   `12x External Workspace Watchers` (Git event triggers, webhooks)

### 2.3 Governance & Routing Protocols
To run 1728 agents without crashing context windows, we use a **Two-Tier Dynamic Routing Protocol**:
1.  **House Dispatch:** The global orchestrator (`si-dispatch`) checks user query keywords and affected workspace directories against `skills/skill-rules.json`. It routes the task to one of the 12 Houses (e.g., files under `src/music/` go to the House of Music).
2.  **Specialist Load:** The local Domain Queen maps the task parameters to the target sub-system and lazy-loads only the target specialist agent profile and matched skill markdown files.
3.  **Governance Locks:** Any output code write or shell command is reviewed against the Domain King's invariant policy rules before being executed.


## 3. Starlight Queen Self-Advancement Architecture

To continuously expand and refine the swarm without manual intervention, we define the specifications for the Starlight Queen's autonomous self-advancement loop, commands, and memory substrate.

### 3.1 The ROUTE──►MEASURE──►LEARN──►RATIFY──►LEDGER Loop
The Starlight Queen (`tools/queen/driver.mjs`) manages system evolution through a closed loop:
1.  **ROUTE:** Ambiently monitors tool execution streams, developer command inputs, and user query types. Matches them to active Houses and agents.
2.  **MEASURE:** Tracks execution metrics. Triggers when a workflow is repeated $\ge 3$ times, encounters $\ge 2$ consecutive execution retries, or receives direct human correction.
3.  **LEARN:** Extracts the target pattern. The `starlight-genius` agent designs a specialized agent profile (identifying custom domain, voice, and triggers) and compiles the corresponding skills.
4.  **RATIFY:** Submits the proposed files (`agents/starlight-new-agent.md` and `skills/new-skill/SKILL.md`) to the **Model Council** for validation. Runs standard syntax checkers and `npm run verify` to ensure zero regressions.
5.  **LEDGER:** Upon achieving $C_c \ge 0.80$ consensus and human approval, writes the new files to the local disk, updates the registry files, and takes a signed Git checkpoint.

### 3.2 Dynamic Command Interfaces
*   **`/agent-creator` Command:**
    *   **Arguments:** `--name`, `--tier`, `--domain`, `--voice`, `--triggers`.
    *   **Action:** Generates a new `starlight-{name}.md` agent profile with standard Markdown structure and frontmatter validation parameters. Automatically appends the new agent role to `agents/AGENT_REGISTRY.md`.
*   **`/workflow-skill-creator` Command:**
    *   **Arguments:** `--domain`, `--name`, `--tools`, `--playbook`.
    *   **Action:** Creates `skills/{domain}/{name}/SKILL.md` defining YAML metadata, execution scripts, and mock tests. Automatically inserts a trigger block in `skills/skill-rules.json`.

### 3.3 Decoupled Memory Layer: `starlight-memory`
As the transaction database grows, all memory operations are decoupled into the dedicated `starlight-memory` repository. The core SIS repository remains zero-dependency, interacting with the memory store via a local loopback server or custom MCP server over stdio/WebSockets.

#### 3.3.1 Hybrid Search & Retrieval
*   **Lexical Indexing:** Local SQLite database utilizing FTS5 for fast, literal keyword matches across logs and codebases.
*   **Semantic Vector Indexing:** Lightweight embedding database generating dense vectors locally.
*   **Reciprocal Rank Fusion (RRF):** Unifies search outputs to return the most relevant context snippet to the retrieval agent (`starlight-hermes`).

#### 3.3.2 mem0 Entity-Relationship Mapping
Integrates a graph-based entity memory to capture persistent facts and preferences, preventing agent drift across sessions:
```
(Frank, prefers_typography, "Outfit")
(Vercel, acts_as_deploy_target_for, "FrankX Website")
(Music IS, requires_A&R_approval_for, "music-release")
```
When a fact is mentioned, the memory manager updates the graph, creating permanent behavioral locks.

#### 3.3.3 The Veil: Sanitization Gateway
All queries and writes to `starlight-memory` pass through a local regex and dictionary scrubbing layer. This prevents credentials, secrets, API tokens, and private identifiers from landing in vector indexes or public dashboards.


---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
