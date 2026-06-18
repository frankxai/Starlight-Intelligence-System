# Starlight Research: Agentic Memory, Local Dashboards, and Visualizations Survey

> **Date:** 2026-06-18  
> **Attestation:** Built on SIP v1.1.1 — Research & Experience Tiers  
> **Status:** Draft Proposal for Board Review  

Memory is the foundational substrate of any sovereign intelligence system. Without persistence, version control, and clear visual interfaces, agent operations become fragmented and opaque. This research survey evaluates **GeminiLight/MindOS** along with other leading open-source repositories to guide the visual and architectural roadmap of the **Starlight Intelligence System (SIS)**.

---

## 1. Executive Summary

To build a premium, self-healing, multi-agent stack that empowers builders, we must bridge the gap between human thought and autonomous execution. This survey investigates:
1. **GeminiLight/MindOS** — A local-first, collaborative knowledge base with a git-backed memory spine.
2. **Stateful Memory Frameworks** — How systems like **Letta** (MemGPT) structure core/recall/archival tiers.
3. **Graph & Temporal Engines** — How **Graphiti** tracks semantic evolution.
4. **Execution Tracing Dashboards** — How **AgentPrism** and **Phidata** visualize multi-agent coordination.

We propose a unified execution plan to incorporate these concepts into the SIS monorepo and its sister repositories (**Arcanea**, **FrankX**, **agentic-creator-os**).

---

## 2. GeminiLight/MindOS Deep Dive

**GeminiLight/MindOS** is structured as an OpenCode-style monorepo, separating core runtime logic from visualization interfaces.

```
MindOS Monorepo Layout
├── packages/
│   ├── mindos/      <-- CLI kernel, ACP/MCP protocols, core runtime facade
│   ├── retrieval/   <-- Local search, directory scanner, document indexing
│   └── web/         <-- React frontend, Agents Dashboard, Echo portal
```

### Approach to Memory
* **Markdown Source of Truth:** Rather than a closed vector database, MindOS stores knowledge, rules, and standard operating procedures (SOPs) as raw Markdown files versioned via Git.
* **Read-First Discipline:** Agents are mandated to perform query searches on the knowledge directory before generating new outputs, minimizing token waste and contextual drift.
* **Auto-Ingestion Pipeline:** Automates PDF and image conversion into structured Markdown. Provides a companion browser extension for clipping web assets directly into the agent's memory.

### Dashboards & Observability
* **Agents Dashboard:** A local web control center to list connected agents, track execution statuses, verify running ports, and manage Model Context Protocol (MCP) server hooks.
* **MindOS Echo:** The inward-facing user interface designed for **cognitive reflection**. It processes logs from recent human-agent interactions and guides the user to distill them into reusable SOPs or personal methodologies, ensuring the agent's memory compounds constructively.

---

## 3. Curated Repository Survey

The following open-source projects represent state-of-the-art implementations of agent memory, dashboards, and visualizations:

### 1. Letta (formerly MemGPT)
* **GitHub:** [letta-ai/letta](https://github.com/letta-ai/letta)
* **Core Philosophy:** Stateful agents with virtual memory paging.
* **Memory Structure:** Separates memory into **Core** (in-context RAM), **Recall** (event/conversation logs), and **Archival** (vector DB). Syncs state to Git-backed "Context Repositories."
* **Dashboard/Viz:** Exposes an Agent Development Environment (ADE) to interactively inspect agent recall logs and edit memory variables on-the-fly.

### 2. Graphiti
* **GitHub:** [getzep/graphiti](https://github.com/getzep/graphiti)
* **Core Philosophy:** Temporal knowledge graph engine for context.
* **Memory Structure:** Builds entity-relationship graphs where nodes and edges dynamically decay or strengthen based on time and interaction frequency.
* **Dashboard/Viz:** Interactive 2D/3D knowledge graph viewer representing semantic connections.

### 3. AgentPrism
* **GitHub:** [evilmartians/agent-prism](https://github.com/evilmartians/agent-prism)
* **Core Philosophy:** Developer-centric agent telemetry visualization.
* **Memory Structure:** Ephemeral tracing logs mapped to hierarchical structures.
* **Dashboard/Viz:** React components that render multi-agent execution timelines (tool calls, retries, model choices, nested planning states).

### 4. rohitg00/agentmemory
* **GitHub:** [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory)
* **Core Philosophy:** Lightweight, local-first agent tracing.
* **Memory Structure:** Local vector embeddings and document caching.
* **Dashboard/Viz:** Real-time port viewer (`http://localhost:3113`) providing live memory operations streams, visual graphs, and OpenTelemetry health tracking.

### 5. Khoj
* **GitHub:** [khoj-ai/khoj](https://github.com/khoj-ai/khoj)
* **Core Philosophy:** Personal AI search and memory companion.
* **Memory Structure:** Semantic indexing of local markdown vaults, PDFs, and images.
* **Dashboard/Viz:** Minimalist local web console for search evaluation and agent tuning.

### 6. Phidata
* **GitHub:** [phidatahq/phidata](https://github.com/phidatahq/phidata)
* **Core Philosophy:** Relational-backed assistants with interactive playgrounds.
* **Memory Structure:** PostgreSQL relational storage combined with vector retrieval.
* **Dashboard/Viz:** Web/local playground to run agents, inspect database states, and adjust prompts dynamically.

### 7. OpenWebUI
* **GitHub:** [open-webui/open-webui](https://github.com/open-webui/open-webui)
* **Core Philosophy:** Unified chat interface and dashboard.
* **Memory Structure:** Local SQLite database storing user memory fragments, custom tools, and agent workflows.
* **Dashboard/Viz:** Robust chat console, pipeline management dashboards, and prompt-sharing registries.

---

## 4. Architectural Proposals for Starlight (SIS)

To absorb these paradigms, we propose four main initiatives to advance our codebase:

### Proposal A: The "Starlight Echo" Reflection Portal
To replicate MindOS's cognitive growth loop, we will establish an interactive portal in `site/src/app/queen/echo` or `site/src/app/palace/echo`:

```
[Dreaming Consolidation Loop] ──> [PROMOTION_QUEUE.md]
                                         │
                                         ▼
                               ┌──────────────────┐
                               │   Echo Portal    │ <-- Human approves, edits,
                               │   (Next.js UI)   │     or rejects promotions
                               └─────────┬────────┘
                                         │
                                         ▼
                               [Wisdom/Strategic Vault]
```

* **Human-in-the-Loop Consolidation:** Currently, the dreaming pipeline consolidates memory vaults in the background. The **Echo Portal** will surface the `PROMOTION_QUEUE.md` in a clean, glassmorphic layout. The sovereign can review, edit, or reject distilled principles before they are finalized.
* **Active Mind-Correction:** Direct input boxes to override agent system prompts and active rules without code changes.

### Proposal B: 3D Memory Palace Constellation (R3F)
Evolve the pure SVG constellation in `site/src/components/MemoryPalace.tsx` to a high-end React Three Fiber (R3F) 3D experience, guided by the survey at `docs/research/premium-3d-memory-palace-survey-2026-05-17.md`:
* **Temporal Gravity (Graphiti model):** Orbs float in a 3D coordinate space. Constellation threads brighten or fade depending on Ranks and last-read timestamps retrieved from `src/gateway/server.ts`.
* **Spatial Memory Cards:** Focus on an orb to "zoom" the camera, displaying markdown-rendered spatial cards of actual vault excerpts.

### Proposal C: Council Chamber & Swarm Tracing (AgentPrism model)
* **Council Timeline:** Integrate hierarchical trace timelines in `/site/src/app/yolo` showing `/yolo` Hive parallel subagent tasks.
* **Gateway Observability:** Expose real-time websocket updates from the `src/gateway` loopback protocol to show which agent is currently reading or writing to which vault.

### Proposal D: Ingestion & Git-Backed Versioning
* **Git-Backed Vault Commitments:** When memory consolidation runs, automatically create a scoped Git commit with a detailed commit message outlining how many atoms were consolidated, creating a clear audit trail.
* **Local Ingest:** Add native PDF-to-Markdown and Image-to-Markdown tools directly into `src/gateway/client.ts` to easily ingest media folder drops.

---

## 5. Ecosystem Impact Mapping

Applying these features across our repositories:

1. **Starlight Intelligence System:** Receives the core gateway updates (temporal relationship weights, automated git-commit commits, local media parser skills).
2. **agentic-creator-os (ACOS):** Receives the **Echo Portal** (cognitive reflection UI) and **Council Chamber** (agent execution timelines) to improve local coordination.
3. **Arcanea & FrankX:** The Next.js frontend is updated with the R3F immersive Memory Palace, applying Apple Liquid Glass and specular motion animations.

---

## 6. Recommendations & Action Plan

1. **Step 1:** Add Git-backed committing to the `/orchestrate-brain` memory consolidation scripts.
2. **Step 2:** Prototype the **Starlight Echo** interface in `site/src/app/queen` to display proposed promotions from `PROMOTION_QUEUE.md`.
3. **Step 3:** Initiate the contract with developers to begin the R3F 3D Memory Palace implementation following the 21-person team brief.

---

*Built on SIP v1.1.1*  
*Starlight Intelligence System — Horizons + Genius + Domain Sub-Stack Tier · 2026-06-18*
