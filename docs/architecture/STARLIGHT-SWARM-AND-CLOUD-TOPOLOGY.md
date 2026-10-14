# Starlight Swarm Topology, Autonomous Fleet & High-Performance Cloud Architecture

> **Specification & Operational Master Blueprint**  
> **Built on the Starlight Intelligence Protocol (SIP v1.1.1 — Sovereign Substrate)**  
> **Brand & Estate Scope:** FrankX • Arcanea • Starlight Intelligence Systems • GenCreator

---

## 1. Executive Vision: The Autonomous Sovereign Fleet

In traditional AI architectures, autonomous agents are either toy wrappers around single LLM chat endpoints or brittle, vendor-locked proprietary platforms that hijack user context and data.

The **Starlight Intelligence System (SIS)** operates on an entirely different paradigm: a **multi-tiered, sovereign cognitive fleet** where:
1. **You own the substrate:** All memories, transcripts, graph entities, and code live in local-first, event-sourced vaults (SQLite + JSONL) with cryptographic SIP receipts.
2. **Heterogeneous model swarms:** No single vendor dictates capability. Tasks route across Claude, Gemini, Codex, Grok, and local open-source models based on cost-efficiency and reasoning depth.
3. **Hybrid cloud execution:** The local machine is an active cockpit and flight recorder; cloud architectures (Cloudflare R2, Oracle Cloud Infrastructure, Vercel, Upstash, Supabase) serve as high-performance compute muscles without compromising data sovereignty.

```
                           ┌─────────────────────────────────────────────────────────┐
                           │               FRANK (Sovereign Operator)                │
                           │   Systems Architect × Composer × Gamer × Builder × GC   │
                           └────────────────────────────┬────────────────────────────┘
                                                        │
                           ┌────────────────────────────▼────────────────────────────┐
                           │          TIER 0: SOVEREIGN KINGS (Policy Locks)         │
                           │   Money Fails Closed • Canon Locks • SIP Attestation    │
                           └────────────────────────────┬────────────────────────────┘
                                                        │
                           ┌────────────────────────────▼────────────────────────────┐
                           │       TIER 1: QUEENS / DOMAIN CONTROLLERS (Supervisors) │
                           │  Queen Orchestrator • Agent Lifecycle • Memory Palaces  │
                           └──────────────┬───────────────────────────┬──────────────┘
                                          │                           │
                   ┌──────────────────────▼───────┐           ┌───────▼──────────────────────┐
                   │  TIER 2: MODEL COUNCILS      │           │  TIER 2: SANTA CONVERGENCE   │
                   │  Maker/Checker • Hetero Evals│           │  Fire Gate ⇄ Crown Gate Loop │
                   └──────────────┬───────────────┘           └───────┬──────────────────────┘
                                  │                                   │
         ┌────────────────────────┴───────────────────────────────────┴────────────────────────┐
         │                        TIER 3: 151-AGENT SPECIALIST SWARM                          │
         │         10 Universal Houses of Intelligence + Domain Sub-Stack Verticals            │
         └────────────────────────────────────────┬───────────────────────────────────────────┘
                                                  │
                                  ┌───────────────▼───────────────┐
                                  │ TIER 4: FRONT-DOOR & EXCAVATE │
                                  │ Concierge • Envoy • Genius    │
                                  └───────────────────────────────┘
```

---

## 2. The 5-Tier Swarm Hierarchy

### Tier 0: Sovereign Kings (Immutable Policy Anchors)
Kings are **not chatty generative agents**. They are **hard cryptographic and policy invariants** enforced before any code executes, any file is written, or any currency moves.
- **Money Fails Closed:** Autonomous agents can calculate, invoice, and simulate; they can **never** execute irreversible outbound financial transactions without human verification.
- **Substrate Write Gating:** Substrate-level files (`SIP.md`, `CLAUDE.md`, `SYSTEM.md`, `AGENTS.md`) cannot be modified without a formal Starlight Board convene and cryptographic review receipt.
- **Canon Locks:** Creative canon (such as Arcanea's `CANON_LOCKED.md`) is read-only to code and narrative agents; promotion occurs strictly through `/lock-decision`.
- **The Veil (PII & Secret Sanitization):** Automated 23-pattern regex redaction scrubs OpenAI, Anthropic, AWS, Stripe, GitHub, and Bearer tokens before handovers or transcripts touch storage.

### Tier 1: Queens / Domain Controllers (The Supervisors)
Queens are the active meta-orchestrators of the estate. While standard agents execute bounded tasks, Queens run continuous loops:
- **Starlight Queen (Central Brain):** Oversees the `inbox/`, resolves queue cards, schedules background tasks, ensures RAM safety (enforcing the 4.0 GiB dispatch floor), and monitors process health.
- **Queen Agent Lifecycle Supervisor:** Real-time discovery, telemetry, and safe lifecycle management for terminal agents (Codex, Claude Code, OpenCode). Captures prompts, tool calls, and git diffs into durable handovers at `~/.starlight/handoffs/`.
- **Domain Queens:** Specialized vertical coordinators (e.g., Music Queen for Suno/Catalog pipelines, Energy Queen for solar/sizing architectures) that manage sub-swarms.

### Tier 2: Model Councils & Consensus Engines
High-stakes architectural changes cannot rely on a single model's probabilistic output.
- **Heterogeneous Model Council:** Evaluates major initiatives across different model families (e.g., Anthropic Claude 3.5 Sonnet, Google Gemini 1.5 Pro, xAI Grok 3, OpenAI GPT-4o). A proposal is ratified only when consensus score $C_c \ge 0.80$.
- **Maker / Checker Protocol:** The agent writing code or drafting copy is never the same agent reviewing it. An independent Checker evaluates code quality, security vulnerabilities, and design tokens before pull requests are promoted out of draft status.
- **Santa Method Adversarial Loop:** For creative and design tasks, the *Fire Gate* (Drafting Agent) creates rapid prototypes, while the *Crown Gate* (Reviewer Agent) critiques against `TASTE.md`. Output only ships when both reach equilibrium.

### Tier 3: Executive & Specialist Fleets (151 Agents)
151 named agents organized across the **10 Universal Houses of Intelligence** and domain sub-stacks. Agents operate with clean domain boundaries, auto-activating skills, and flat council collaboration.

### Tier 4: Front-Door & Excavation Tiers
- **Concierge:** Zero-friction intake for newcomers and unstructured ideas.
- **Envoy:** Translates technical outputs into executive summaries and zero-terminal deliverables.
- **Voice Operator:** High-bandwidth cockpit voice intake for spoken brainstorms.
- **Genius:** Framework excavation agent that mines personal writings and notes to extract unique intellectual IP.

---

## 3. The 10 Houses of Intelligence (Autonomous Systems Mapping)

| House | Core Focus | Lead Agents | Key Repositories |
| :--- | :--- | :--- | :--- |
| **1. Self** | Embodiment, energy architecture, physical sovereignty | `starlight-self-is`, `starlight-embodiment` | `frank-gym-os`, `frankx-life-os` |
| **2. Wealth** | Capital allocation, DPI tracking, deal evaluation | `starlight-wealth`, `starlight-cfo` | `agentic-wealth-os`, `disruptivepassiveincome` |
| **3. Family** | Family office, legacy preservation, multi-generational archives | `starlight-family`, `starlight-relational` | `frank-riemer-family`, `family-history-atlas` |
| **4. Business** | Dutch BV governance, entity contracts, operational compliance | `starlight-business`, `starlight-org` | `agentic-business-os`, `data/bv-ops.json` |
| **5. Creator** | ACOS content factory, digital product funnels, newsletter engine | `starlight-creator`, `creation-engine` | `frankx.ai-vercel-website`, `gencreator.ai` |
| **6. Second Brain** | Epistemic knowledge graph, vault recall, dialectical checks | `starlight-secondbrain`, `starlight-sage` | `starlight-memory-vault`, `second-brain-vault` |
| **7. Code** | SAGE self-healing, empirical sandboxing, testing harnesses | `starlight-architect`, `starlight-sentinel` | `Starlight-Intelligence-System`, `src/healing/` |
| **8. Voice & Video** | Programmatic Remotion video, Suno audio pipelines, Foley sound | `starlight-voice`, `starlight-media` | `starlight-remotion-lab`, `AnimeLegends` |
| **9. Brand** | Design taste kernel, vector-first assets, anti-slop copy rules | `starlight-brand`, `starlight-weaver` | `starlight-design-intelligence`, `design-agent-standards` |
| **10. Orchestrator** | Master meta-router connecting all houses, queues, and tool planes | `starlight-orchestrator`, `starlight-queen` | `Starlight-Intelligence-System`, `queen/` |

---

## 4. High-Performance, Cost-Effective Heterogeneous Model Routing

To achieve enterprise performance without excessive token spend, Starlight utilizes a **3-tier heterogeneous routing matrix**:

```
                                  [ Incoming Task / User Intent ]
                                                 │
                                 ┌───────────────┴───────────────┐
                                 │ Complexity & Intent Classifier│
                                 │   (Local Regex + AST Filter)  │
                                 └───────────────┬───────────────┘
                                                 │
          ┌──────────────────────────────────────┼──────────────────────────────────────┐
          ▼                                      ▼                                      ▼
   [ TIER A: FAST / SCOUT ]               [ TIER B: BUILD / CODE ]              [ TIER C: STRATEGIC / COUNCIL ]
   • Google Gemini 1.5 Flash             • Anthropic Claude 3.5 Sonnet         • Anthropic Claude 3 Opus
   • Google Flash Lite                    • OpenAI Codex / GPT-4o               • Google Gemini 1.5 Pro
   • Anthropic Claude 3.5 Haiku           • Open-Source Qwen 2.5 Coder          • xAI Grok 3 / GPT-5 Tier
   ───────────────────────────            ───────────────────────────           ───────────────────────────
   Cost: $0.075 - $0.25 / MTok            Cost: $3.00 - $5.00 / MTok            Cost: $15.00 - $30.00 / MTok
   Tasks: Broad scans, file indexing,     Tasks: Refactoring, test execution,    Tasks: Council arbitration,
   log parsing, initial triage.           feature builds, debugging.            PR reviews, lore promotion.
```

### The 10x Cost Optimization Loop
1. **Local-First Extraction:** AST inspection, git diff calculation, and regex sanitization run locally on Node.js/Python without calling external LLM APIs (0 cost).
2. **Flash Scout Triage:** Broad codebase scans, documentation research, and initial issue categorization run on **Gemini 1.5 Flash** or **Haiku 3.5** ($0.075 / MTok).
3. **Targeted Sonnet/Codex Execution:** Only the isolated, pre-scoped files and clear prompt packets are passed to **Claude 3.5 Sonnet** or **Codex**.
4. **Opus/Pro Consensus Reserved for Synthesis:** Multi-model councils and strategic approvals only invoke Tier C models when high-stakes decisions ($C_c \ge 0.80$) or Board reviews are active.

---

## 5. Cloud Architectures & Strategic Partnerships

Starlight's multi-cloud architecture decouples **storage truth** from **transient compute**:

```
                                     ┌─────────────────────────────┐
                                     │   Local Operator Cockpit    │
                                     │  (Windows / Starlight CLI)  │
                                     └──────────────┬──────────────┘
                                                    │
                 ┌──────────────────────────────────┼──────────────────────────────────┐
                 ▼                                  ▼                                  ▼
      [ Cloudflare Substrate ]             [ Oracle Cloud (OCI) ]             [ Vercel & Supabase ]
      ────────────────────────             ──────────────────────             ─────────────────────
      • R2: Zero-egress object             • Bare-metal A100/H100 GPU         • Vercel Edge: Preview
        storage for DAM & media.             clusters for model runs.           deploys & review gates.
      • Workers: Edge routing              • Oracle AI Agent Spec &           • Supabase: Managed Postgres
        and request filtering.               ADK enterprise pipelines.          with RLS for user apps.
      • KV/D1: Low-latency session         • Autonomous DB for high-          • Upstash: Serverless Redis &
        flags and demand cache.              scale relational graphs.           Vector for demand signals.
```

### Strategic Cloud Roles
1. **Cloudflare (Zero-Egress Data Substrate):**
   - **Cloudflare R2** hosts the distributed Digital Asset Management (DAM) system, audio stems, video renders, and prompt evaluations with $0 egress fees.
   - **Workers & Turnstile** shield public demand-capture forms and waitlist endpoints against bot abuse.
2. **Oracle Cloud Infrastructure (Enterprise Compute Partner):**
   - High-performance bare-metal compute instances for training local models, embedding generation, and running continuous SAGE proving ground sandboxes.
   - OCI Solution Design & AI Agent Spec integrations for enterprise consulting and Fortune 500 CoE architectures.
3. **Upstash (Real-Time Swarm Bus & Demand Capture):**
   - Serverless Redis REST API handles real-time queue synchronization, agent telemetry pulses, and atomic waitlist position allocation (`packages/demand-capture`).
   - Serverless Vector stores fast embedding lookups for recent session context.
4. **Vercel (The Review & Surface Gate):**
   - Governed by the **Vercel Preview Gate Policy**: Localhost runs transient single dev servers (SDS) with TTL; Vercel deploys preview instances for verified cross-device stakeholder reviews.
5. **Supabase (Application Core):**
   - Managed Postgres with Row-Level Security (RLS) powering client-facing web applications (`gencreator.ai`, `frankx.ai`).

---

## 6. Community, Client & Enterprise Availability Engine

How Starlight capabilities are packaged and made accessible across tiers:

```
                           ┌──────────────────────────────────────────────┐
                           │          Starlight Capability Hub            │
                           └──────────────────────┬───────────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
      [ 1. Open Community ]             [ 2. Pro Creators & Clients ]    [ 3. Sovereign Enterprise ]
      ─────────────────────             ─────────────────────────────    ───────────────────────────
      • Sovereign Claws (npm/GitHub)    • Full ACOS Content Engine       • Estate OS Blueprinting
      • 27 Open MCP Tools (stdio)       • Genius Framework Excavation    • Dedicated OCI Swarm Fleet
      • 4-Target SIP Exports            • Studio Multi-Model Pipelines   • Custom Memory Gateways
      • MIT Skills Library              • High-Ticket Digital Products   • Private Air-Gapped Vaults
```

### Packaging & Distribution Tiers
1. **Community Layer (Open Source & Free Protocol):**
   - **Sovereign Claws:** Modular agent stacks (`sis-core-claw`, `sis-creator-claw`, `sis-business-claw`) installable via npm with cryptographic SHA-256 integrity verification.
   - **SIP Attestation (`Built on SIP`):** Open protocol specification allowing developers to fork or compose their own cognitive vaults.
   - **SIP Universal Export:** 1-click export of Starlight knowledge bases to Claude Projects, ChatGPT Projects, Gemini Gems, Cursor rules, and Microsoft Copilot.
2. **Pro Creators & Clients (Commercial GTM):**
   - **Agentic Creator OS (ACOS):** Complete end-to-end studio for book writing, newsletter generation, music releases, and automated social distribution.
   - **Genius Excavation:** Structured consultation protocol extracting an executive's tacit knowledge into reusable AI agents.
3. **Sovereign Enterprise (High-Ticket Estate Commissioning):**
   - **Starlight Estate OS:** Custom multi-agent fleets deployed inside the client's own cloud tenancy (OCI / AWS / Azure / Cloudflare).
   - **Corporate Memory Gateway:** Isolated, self-hosted SQLite/Postgres hybrid vector indexes with role-based access control and PII scrubbing.
   - **CoE 6-Pillar Governance:** Strategy, Governance, Talent, Technology, Data, and Ethics frameworks tailored for regulated industries.

---

## 7. Operational Checklist & Immediate Action Vectors

- [x] **Local CLI-Agent Lifecycle Engine:** Verified with 11/11 tests passing, PR #406 open on GitHub.
- [x] **Executive Tier Agent Cards (151 Agents):** Standardized and audited, PR #407 open on GitHub.
- [x] **Demand Door #2 (KV Alias):** Upstash Redis REST fallback implemented in `packages/demand-capture/src/store.ts` and `report.mjs`.
- [x] **Demand Door #5 (Sender Authentication):** Receipts and starter emails unified to verified `mail.frankx.ai` DKIM domain.
- [x] **Demand Door #6 (Akamoto Surface 404):** Asset accurately classified as `on-disk` and held dark in `graph/products.graph.json`.
- [x] **Queen Inbox De-blocking:** 3 completed demand door cards archived, reducing queue blockers to 21.
- [ ] **Next Sprint Target:** Connect Upstash Redis REST live token to run estate demand reporting (`node packages/demand-capture/report.mjs`).
- [ ] **Next Sprint Target:** Promote PR #406 and PR #407 from Draft to Ready upon Frank's independent review ack.
