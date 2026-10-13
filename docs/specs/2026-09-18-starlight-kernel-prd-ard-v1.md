# 🌟 Starlight Sovereign Kernel — Master PRD, ARD & Execution Blueprint v1.0

**Status:** Approved Architecture & Product Specification  
**Canonical Spec:** `Starlight-Intelligence-System/docs/specs/2026-09-18-starlight-kernel-prd-ard-v1.md`  
**Date:** September 18, 2026  
**Author:** Antigravity (Advanced Agentic Architecture)  
**Stakeholders:** Frank Riemer (Lead Architect / Sovereign Founder), Starlight Intelligence System, Arcanea Labs BV  

---

## 1. Executive Summary & Estate Reality Audit

### 1.1 What the Agents Did (Estate Audit & Recent Milestones)
A machine-wide audit of Frank's active estate via `agentic-ops/ops/OPS-LEDGER.md`, git trees, and cross-agent coordination logs reveals the recent state of execution:

1. **Starlight Operator & Voice Integration Wave (Antigravity - 2026-09-18):**
   - Implemented and verified production IPC lifecycles (`ping`, `session.start`, `session.stop`, `shutdown`) in `starlight-voice/sidecar/src/starlight_voice/ipc.py`.
   - Hardened `starlight-voice/scripts/start-jarvis.ps1` to probe the shared Starlight MCP loopback bridge (`:8767`), stopping uncoordinated gateway sprawl.
   - Extracted and verified three official starter templates under `Starlight-Intelligence-System/templates/`: `operator-workspace-starter`, `local-voice-companion-starter`, and `remote-voice-starter`.
2. **Hygiene, Cost & Performance Wave (Grok 4.6 & Antigravity - 2026-09-16):**
   - Landed **#707** (agent entrypoint contract) and **#428** (Prettier heal) on `main`.
   - Resolved Vercel preview build minute surge (+141%) via `scripts/should-deploy.sh` PR verification, saving hundreds of CI minutes.
   - Enforced root-scoped Dependabot policies in `FrankX` (#209), squashed Dependabot PR fragmentation.
   - Crushed Arcanea Lambda bundle bloat (Issue #294) from 147 MB to <1 MB with a zero-external-dependency `global-error.tsx`.
3. **Hermes Agent Runtime Maintenance (2026-09-15):**
   - Updated `hermes-agent` to v0.21.3 with configuration migration v37 → v45.
   - Preserved Telegram channel-echo and generic-secret environment patches.
   - Established global SessionStart hook fail-open runtime (`session-boot.py`) running in ~130ms, eliminating hook pipe deadlocks on Windows.

---

### 1.2 The Structural Problem Diagnosed: Why the "Ledger-Ingest" Script is the Exact Anti-Pattern Starlight Eliminates

In an earlier experimental prompt, a concrete operational command was proposed:
```powershell
node C:\Users\frank\agentic-ops\.worktrees\ledger-ingest\lifecycle\ledger-ingest.js
# Verify idempotency: run a second time (0 records inserted)
# Rotate token: gbrain auth revoke "ledger-ingest"
```

#### The Diagnosis:
1. **The Fragile Network-Glue Anti-Pattern:**
   The script above illustrates a developer manually writing ad-hoc Node.js scripts to scrape memory from an external daemon (`gbrain`), pipe it over HTTP/stdio into a Git worktree, and manually manage API tokens.
2. **Failure Modes of Ad-Hoc Glue:**
   - **Token Expiry & Leakage:** Tokens passed in CLI sessions get logged to shell history and chat transcripts, necessitating frantic `revoke` calls.
   - **Zero Transactional Guarantees:** If the process crashes midway through writing the ledger, the worktree is left in a dirty, inconsistent state.
   - **Race Conditions:** Two agents running parallel ingest scripts overwrite cursor files and corrupt state tracking.
3. **The Starlight Protocol Solution:**
   Starlight does **not** rely on brittle, user-authored sync scripts. Instead, Starlight operates as an **out-of-process, deterministic Layer-0 Kernel (`starlightd`)** in Rust that arbitrates state synchronization at the protocol layer.

```
AD-HOC (Fragile):
[Agent CLI] ---> [Manual Node Glue Script] ---> [External MCP Daemon] ---> [Git Worktree]
                       ^ (Token leak, race condition, no invariants)

STARLIGHT (Deterministic):
[Agent CLI] <===(Local IPC / Leases)===> [starlightd Kernel] <===(In-Process)===> [LibSQL + Merkle Ledger]
                                               │
                                               ├── Tree-sitter Invariant Interceptor (No Breaking AST)
                                               ├── WFG Deadlock Cycle Arbiter
                                               └── POSIX / Cloudflare Worktree Leases
```

---

## 2. The Sovereign Strategy: Market Positioning & GTM

### 2.1 The Starlight Value Wedge
```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           THE STARLIGHT VALUE WEDGE                            │
├────────────────────────────────────────────────────────────────────────────────┤
│ THE RED OCEAN: Reselling model tokens at 30% margin with conversational UIs    │
│ that suffer hallucinated drift, branch collisions, and context inflation.      │
│                                                                                │
│ THE BLUE OCEAN: The "HashiCorp + Git for Autonomous Swarms."                   │
│ A deterministic, out-of-process Layer-0 Kernel that arbitrates concurrency,     │
│ AST invariants, and multimodal world memory across Claude Code, Hermes Agent,  │
│ OpenCode, and local models.                                                    │
│                                                                                │
│ WHERE WE ARE #1 IN THE WORLD:                                                  │
│ Deterministic Multi-Agent State Synchronization & Multimodal IP Consistency.   │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Go-To-Market (GTM) Playbook
1. **Step 1 (Trojan Horse CLI):** Ship `starlightd` as an open-source Rust binary. Solves one burning developer pain point: a 1-click worktree concurrency locker for Claude Code, Cursor, and OpenCode.
2. **Step 2 (The Memory Extension):** Auto-inject Starlight’s 6-Vault MCP server into `~/.claude.json` and `.cursor/mcp.json`. Agents automatically receive sub-millisecond AST blast-radius analysis and persistent memory.
3. **Step 3 (The Sovereign Cockpit):** Release the Tauri v2 desktop GUI. Solo founders and creative technologists pay $49/month for real-time hardware telemetry, 3D memory constellations, and multimodal asset pipelines.
4. **Step 4 (Team Mesh & Edge Relays):** Teams pay $199–$799/month for Cloudflare Durable Object distributed locks and cryptographic Merkle compliance audit trails.

---

## 3. Comprehensive Product Requirements Document (PRD v1.0)

### 3.1 Functional Requirements (FR)

#### FR-1: Distributed Concurrency & Worktree Arbiter
- **Scope:** Agents (Claude Code, Hermes, OpenCode, Codex) must acquire leases before touching any file.
- **Specification:**
  ```json
  {
    "worktree": "/repo/.worktrees/dsp",
    "paths": ["src/dsp/*"],
    "ttl_secs": 120,
    "agent_id": "agent-01-claude"
  }
  ```
- **POSIX & Cloudflare Backing:** Local leases use POSIX `flock` / Windows file lock semantics; team swarms use Cloudflare Durable Objects.
- **Heartbeat & Zombie Reaping:** Background heartbeat renewal loop. If an agent dies or hangs past TTL, its leases are automatically reaped and rollback procedures triggered.
- **Wait-For-Graph (WFG) Cycle Detection:** Directed graph of agent resource dependencies. Tarjan SCC cycle detection detects deadlocks in $<2\text{ ms}$ and preempts the lower-priority agent.

#### FR-2: AST Invariant & Blast-Radius Engine
- **Scope:** Intercepts code mutations prior to Git commit or worktree merge.
- **Parsers:** Native Tree-sitter parsers for TypeScript/TSX, Rust, Python, and Go.
- **Mathematical Invariant:**
  $$\Delta G = G_{\text{speculative}} \setminus G_{\text{canonical}}$$
- **Enforcement Rules:**
  - `NO_SYNTAX_ERRORS`: Speculative tree root must be free of syntax errors.
  - `NO_BREAKING_EXPORTS`: Exported functions, interfaces, or classes cannot be removed without deprecation metadata.
  - `NO_MUTATED_SIGNATURES`: Parameters and return types cannot mutate without backward compatibility.
  - `NO_CIRCULAR_DEPENDENCIES`: Imports between modules must maintain acyclic structure.

#### FR-3: 6-Vault Semantic Memory Substrate
- **Vault Hierarchy:**
  1. `Strategic`: Immutable canon, architectural principles, corporate governance.
  2. `Technical`: Schemas, API contracts, deployment blueprints, benchmarks.
  3. `Creative`: Character lore, narrative worlds, design tokens, voice guides.
  4. `Operational`: Sprint tasks, ephemeral scratchpads, daily worktree logs.
  5. `Wisdom`: Synthesized retrospectives, post-mortems, anti-pattern catalogs.
  6. `Horizon`: Long-term research, speculative models, emergent opportunities.
- **Dual-Layer Storage:**
  - Layer A: Human-readable flat Markdown files (`.starlight/vaults/*.md`) with YAML frontmatter.
  - Layer B: Embedded LibSQL database with SQLite FTS5 (BM25 search) and `sqlite-vec` (vector embeddings).
- **Decay Dynamics:** Operational notes decay with a 90-day exponential confidence half-life; Strategic and Creative canon remain permanent.

#### FR-4: Dynamic Hardware Placement Broker
- **Scope:** Real-time sampling of machine utilization (CPU, RAM, GPU VRAM via NVML/IOKit).
- **Allocation Formula:**
  $$M_{\text{alloc}} = M_{\text{weights}} + M_{\text{kv\_cache}} + M_{\text{workspace}}$$
- **Routing Decision Engine:**
  - Tasks requiring $<8\text{ GB}$ VRAM route to local quantized models (Ollama/vLLM) at $0 cloud cost.
  - Large reasoning or cross-repo architectural synthesis routes to frontier cloud models (Claude 3.7 / Fable, GPT-5, Kimi).

#### FR-5: Multimodal Creative IP Synchronizer
- **Scope:** Bi-directional synchronization between narrative lore and downstream creative assets.
- **Cross-Domain Pipeline:**
  - Changes to character lore in `.starlight/vaults/creative/` trigger updates in design tokens (`tailwind.config.js`).
  - Image prompt presets for ComfyUI / Stable Diffusion update automatically with canonical color palettes.
  - Audio style anchors in Suno AI / ElevenLabs reflect updated mood and tempo specifications.

---

### 3.2 Non-Functional Requirements (NFR)

| NFR ID | Requirement | Metric / Target | Verification Method |
| --- | --- | --- | --- |
| **NFR-1** | IPC Response Latency | $<4\text{ ms}$ over Unix Domain Socket / Named Pipe | Criterion benchmark suite |
| **NFR-2** | Memory Footprint | Daemon $<20\text{ MB}$ RAM; Desktop GUI $<45\text{ MB}$ RAM idle | Process monitor telemetry |
| **NFR-3** | Offline Sovereignty | 100% operational offline; zero external network calls required | Air-gapped test container |
| **NFR-4** | Write Durability | Zero corruption across 100,000 atomic transactions | SQLite WAL + Git commit-tree hash checks |

---

## 4. Architecture Requirements Document (ARD v1.0) & Technical Specifications

### 4.1 System Topology

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           TAURI V2 DESKTOP SURFACE                              │
│         (React 19 • Tailwind CSS • Radix UI • Three.js Canvas Graph)            │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ IPC via Unix Domain Socket / Named Pipe
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            STARLIGHT CORE DAEMON (Rust)                         │
│                                                                                 │
│  ┌──────────────────────┐  ┌───────────────────────┐  ┌──────────────────────┐  │
│  │ Telemetry Collector  │  │ Concurrency Arbiter   │  │ Causal AST Invariant │  │
│  │ (sysinfo / NVML)     │  │ (Worktree Leases)     │  │ (Tree-sitter TS/Rust)│  │
│  └──────────┬───────────┘  └───────────┬───────────┘  └──────────┬───────────┘  │
│             │                          │                         │              │
│             ▼                          ▼                         ▼              │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                  SIP ENGINE (Cryptographic Merkle Ledger)                 │  │
│  └─────────────────────────────────────┬─────────────────────────────────────┘  │
│                                        │                                        │
│  ┌─────────────────────────────────────┴─────────────────────────────────────┐  │
│  │                  EMBEDDED LOCAL-FIRST STORAGE SUBSTRATE                   │  │
│  │      LibSQL Embedded Engine • sqlite-vec Extension • SQLite FTS5          │  │
│  │           Flat-File Markdown Vaults (.starlight/vaults/*.md)              │  │
│  └─────────────────────────────────────┬─────────────────────────────────────┘  │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼ Local MCP (stdio / SSE)                                         ▼ Compute Proxy
┌───────────────────────────────┐                                 ┌───────────────────────┐
│     Harness Execution Bus     │                                 │  Hybrid Compute Mesh  │
│ • Claude Code CLI             │                                 │ • Local Ollama / vLLM │
│ • Hermes Agent Core           │                                 │ • Local ComfyUI API   │
│ • OpenCode / OpenClaw         │                                 │ • OpenRouter / Claude │
│ • Headless Playwright Worker  │                                 │ • OpenAI / Kimi Cloud │
└───────────────────────────────┘                                 └───────────────────────┘
```

---

### 4.2 Architectural Decisions (AD)

#### AD-1: Rust Daemon + Tauri v2 instead of Electron
- **Context:** Orchestrators running alongside local 32B models and multi-agent swarms cannot waste system resources.
- **Decision:** Build the core daemon in Rust and the UI in Tauri v2 using the OS-native webview.
- **Consequence:** Background daemon consumes $<20\text{ MB}$ RAM; desktop cockpit idles at $<45\text{ MB}$ RAM (vs. 600+ MB for Electron).

#### AD-2: Embedded LibSQL + sqlite-vec instead of External Vector Databases
- **Context:** External vector databases (Chroma, Pinecone, Milvus) introduce Docker dependencies, Python virtual environment collisions, and network fragility.
- **Decision:** Use LibSQL embedded in Rust with `sqlite-vec` extension and FTS5 BM25 search.
- **Consequence:** Zero external daemon dependencies, zero network roundtrip latency, sub-5ms query retrieval.

#### AD-3: Tree-sitter Invariant Interception instead of LLM Self-Evaluation
- **Context:** Asking an LLM to judge whether another LLM wrote safe code is slow (2–10s), non-deterministic, and consumes costly tokens.
- **Decision:** Use incremental Tree-sitter AST queries in Rust to deterministically intercept syntax errors, breaking exports, and mutated signatures.
- **Consequence:** Verification takes $<10\text{ ms}$ with mathematical certainty.

#### AD-4: Wait-For-Graph (WFG) with Priority Preemption instead of Random Backoff
- **Context:** Concurrent agents editing shared worktree files encounter circular lock deadlocks.
- **Decision:** Maintain a live directed graph of agent-resource wait states and preempt lower-priority agents upon cycle detection.
- **Consequence:** Zero lock freezeups; high-priority agents (e.g. human-directed Claude Code) proceed without interruption.

#### AD-5: Dual-Layer Markdown + SQLite Vaults instead of Pure Database Storage
- **Context:** Developers demand git-versioned, human-inspectable notes; AI agents require high-speed semantic search.
- **Decision:** Store Markdown files on disk with two-way reconciliation into LibSQL.
- **Consequence:** Full compatibility with Obsidian, Git diffs, and instant vector retrieval.

#### AD-6: Ed25519 Cryptographic SIP Attestations instead of Raw Git Commits
- **Context:** Proving provenance of agentic code and autonomous decisions requires tamper-evident receipts.
- **Decision:** Every worktree promotion generates a Merkle-tree block signed with the agent's ephemeral Ed25519 key.
- **Consequence:** Verifiable audit trail for compliance, multi-tenant teams, and regulatory governance.

---

## 5. SOTA Technology Integration Analysis

### 5.1 NousResearch/hermes-agent Integration
- **Role in Starlight:** Persistent self-evolving background agent for unattended loops and research synthesis.
- **Key Capabilities Leveraged:**
  - **Self-Improving Skill Loop:** Hermes converts successful task trajectories into reusable `SKILL.md` files. Starlight ingests these skills directly into the Technical Vault.
  - **Multi-Platform Gateway:** Hermes provides inbound triggers from Telegram, Discord, and Slack, routing requests into Starlight's worktree scheduler.
  - **Loopback OAuth & Memory:** Seamlessly connects to Starlight's shared MCP bridge (`127.0.0.1:8767`).

### 5.2 Untrivial-ai/agent-orchestrator Integration
- **Role in Starlight:** Supervised multi-agent fleet IDE and orchestration patterns.
- **Key Capabilities Leveraged:**
  - **Fleet Task Decomposition:** Hierarchical breakdown of complex epics into discrete, isolated agent tasks.
  - **Harness Agnosticism:** Orchestrates across Claude Code, Codex, and OpenCode seamlessly.
  - **Supervisory Review Gates:** In-flight human-in-the-loop approvals before speculative branches merge to canonical branches.

---

## 6. Extended SDLC Plan & Multi-Agent Development Progress Framework

### 6.1 Autonomous SDLC Team Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     AUTONOMOUS SDLC WORKFLOW ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Agent 1: Kernel Engineer]   │ Rust daemon, POSIX locks, sysinfo telemetry      │
│ [Agent 2: Compiler Engineer] │ Tree-sitter AST queries, invariant rules         │
│ [Agent 3: Storage Architect] │ LibSQL schema, sqlite-vec, FTS5 sync             │
│ [Agent 4: Protocol Engineer] │ MCP stdio/SSE server, loopback OAuth manager     │
│ [Agent 5: UI/Cockpit Lead]   │ Tauri v2, React 19, Three.js 3D visualizer       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 12-Week / 6-Sprint Step-by-Step Progress Plan

| Sprint / Weeks | Focus Area | Deliverables & Code Artifacts | Quantitative Verification Gate |
| --- | --- | --- | --- |
| **Weeks 1–2** | Rust Core & Concurrency | `starlightd` skeleton, POSIX flock manager, WFG deadlock cycle detector, heartbeat reaper. | 10 mock CLI agents attempt simultaneous writes; zero dirty-tree conflicts; deadlocks resolve automatically in $<2\text{ ms}$. |
| **Weeks 3–4** | AST Invariant Engine | Tree-sitter integration for TypeScript and Rust; diff comparison module; breaking-change query pack. | Unit test suite with 25 breaking API patterns; engine intercepts and blocks all 25 with structured MCP error payloads. |
| **Weeks 5–6** | Storage & MCP Server | LibSQL embedded engine, `sqlite-vec` indexing, FTS5 BM25 search, Axum MCP stdio/SSE router. | Ingest 50,000 Markdown lines; query retrieval latency $<5\text{ ms}$; MCP SSE chunking handles edge fragmentation. |
| **Weeks 7–8** | Hardware Profiler & Hub | NVML / IOKit telemetry poller; dynamic compute allocation formula; Hermes loopback OAuth manager. | Live telemetry accurately tracks VRAM spikes during local 32B model inference and prevents RAM thrashing. |
| **Weeks 9–10** | Tauri v2 Desktop Cockpit | React 19 UI, Tailwind CSS, Lucide HUD, Three.js 6-Vault constellation, worktree management swimlanes. | Sub-45 MB RAM idle footprint; 60 FPS graph rendering across 2,000 nodes. |
| **Weeks 11–12** | Cloud Edge & Hardening | Cloudflare Durable Object state sync; Ed25519 SIP Merkle attestation explorer; end-to-end dogfooding. | Remote 3-node worktree sync completes across WAN within $50\text{ ms}$; full test suite passes. |

---

## 7. UI/UX Systems, Navigation Architecture & User Flows

### 7.1 Global Desktop Cockpit Layout (ASCII Wireframe)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STARLIGHT STUDIO  │ CPU: 14% │ RAM: 18.2/64GB │ VRAM: 11.4/24GB │ BURN: $0.18/HR   │
├───────────┬───────────────────────────────────────────┬─────────────────────────┤
│ [NAV]     │ WORKTREE: /worktrees/arcanea-synth-engine │ AGENT FLEET: 3 Active   │
│ • Deck    ├───────────────────────────────────────────┼─────────────────────────┤
│ • Constel │ [Agent-01: Claude Code]                   │ [Leased Files]          │
│ • Compute │ Task: Refactoring audio DSP buffer        │ • src/dsp/buffer.rs     │
│ • Canvas  │ Status: Compiling in speculative worktree │ • src/dsp/filters.rs    │
│ • Ledger  ├───────────────────────────────────────────┼─────────────────────────┤
│           │ [Agent-02: Hermes Agent]                  │ [Leased Files]          │
│           │ Task: Synthesizing character lore theme   │ • lore/characters/sol.md│
│           │ Status: Emitting Suno audio prompt spec   │ • assets/audio/theme.json│
│           ├───────────────────────────────────────────┴─────────────────────────┤
│           │ LIVE SPECULATIVE LOG                                                │
│           │ > Invariant Check: Tree-sitter DSP buffer pass (0 errors).          │
│           │ > SIP Attestation block #4829 minted: SHA-256[7f3a...b81e]          │
└───────────┴─────────────────────────────────────────────────────────────────────┘
```

### 7.2 User Journeys & State Machines

#### Journey 1: Morning State Sync
```
[User Wakes Up]
       │
       ▼
[Opens Starlight Cockpit] ───> Menu Bar Telemetry Widget reads "Dreaming Loop Clean"
       │
       ├── Reads synthesized summary of overnight Hermes runs
       ├── Inspects 3 Git diffs ingested into Technical Vault
       └── Verifies system VRAM clear (0 memory leaks)
```

#### Journey 2: Multi-Agent Collision Interception
```
[Agent 1 (Claude)] claims lock on Frontend Worktree
       │
[Agent 2 (Hermes)] reads Lore from Creative Vault
       │
[Agent 1] attempts to mutate exported AudioContext signature
       │
       ▼
[Starlight AST Engine Intercepts]
       │
       ├── Tree-sitter detects: NO_MUTATED_SIGNATURES violation
       ├── Blocks speculative commit
       ├── Returns structured MCP error to Agent 1
       └── Agent 1 automatically amends code with backward-compatible overload
```

---

## 8. Unit Economics & Revenue Model

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INCOME STREAMS & ECONOMICS                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Tier 1: Starlight Core (Open Source)    │ $0     │ Apache 2.0 CLI & Local daemon│
│ Tier 2: Sovereign Studio Pro            │ $49/mo │ Desktop Cockpit + Local Hub  │
│ Tier 3: Studio Team Mesh                │ $199/mo│ Durable Object Sync + Leases │
│ Tier 4: Sovereign Enterprise Appliance  │ $25k/yr│ Private VPC + Audit Attest   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Seat Unit Economics (Studio Pro @ $49/month)
- Hosting & Telemetry (Cloudflare Workers + D1): **$0.65**
- Payment Processing (Stripe): **$1.72**
- Customer Support & Docs Infrastructure: **$1.20**
- Marginal AI Compute Cost: **$0.00** *(Users bring their own local models via Ollama/vLLM or their own API keys; Starlight is an orchestration layer, not a compute reseller)*
- **Net Contribution Margin: $45.43 (92.7% Gross Margin)**

---

## 9. Verification & Code Artifacts Completed
The foundational code for Starlight's Tree-sitter Invariant Engine, Wait-For-Graph deadlock detector, and worktree lease manager has been created in:
- `C:\Users\frank\Starlight-Intelligence-System\crates\starlight-invariants\Cargo.toml`
- `C:\Users\frank\Starlight-Intelligence-System\crates\starlight-invariants\src\invariants.rs`
- `C:\Users\frank\Starlight-Intelligence-System\crates\starlight-invariants\src\wfg.rs`
- `C:\Users\frank\Starlight-Intelligence-System\crates\starlight-invariants\src\lease.rs`
- `C:\Users\frank\Starlight-Intelligence-System\crates\starlight-invariants\src\lib.rs`
- `C:\Users\frank\Starlight-Intelligence-System\crates\starlight-invariants\tests\invariant_tests.rs`
