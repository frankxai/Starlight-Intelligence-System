# 🌌 Starlight Sovereign Kernel v2.0 — Master PRD, ARD & Infinite Architecture

**Status:** Approved Master Engineering Architecture & GTM Strategy  
**Canonical Spec:** `Starlight-Intelligence-System/docs/specs/2026-09-18-starlight-sovereign-kernel-v2-infinite-vaults.md`  
**Date:** September 18, 2026  
**Author:** Antigravity (Advanced Agentic Architecture)  
**Stakeholders:** Frank Riemer (Lead Architect / Sovereign Founder), Starlight Intelligence System, Arcanea Labs BV  

---

## 1. The Ruthless Competitive Reality & The True Moat

### 1.1 Competitor Landscape Dissection: Where the Market is Stuck
In 2026, the artificial intelligence software development market is divided into four distinct categories—all of which suffer from systemic, structural flaws:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                COMPETITIVE DECONSTRUCTION                              │
├───────────────────────┬──────────────────────────────────┬─────────────────────────────┤
│ Competitor Category   │ Representative Players           │ Fatal Structural Flaw       │
├───────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ 1. Single-Agent IDEs  │ Cursor, Windsurf, Copilot, Cline │ Single-workspace lock-in.   │
│                       │                                  │ Zero multi-agent out-of-    │
│                       │                                  │ process concurrency. Cross- │
│                       │                                  │ session amnesia.            │
├───────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ 2. Cloud Black Boxes  │ Devin, Cognition, Factory, Magic │ Disconnected from local PC. │
│                       │                                  │ $500+/mo cloud tax. High    │
│                       │                                  │ latency. Zero local GPU/    │
│                       │                                  │ hardware telemetry leverage.│
├───────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ 3. Swarm Frameworks  │ LangGraph, CrewAI, AutoGen,      │ Application-level prompt-   │
│                       │ Untrivial Agent-Orchestrator     │ glue. No OS file leases.    │
│                       │                                  │ No Tree-sitter AST compiler │
│                       │                                  │ gates. High git collision.  │
├───────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ 4. Flat Vector Memory │ Mem0, Letta (MemGPT), Zep,       │ Cosine similarity RAG is    │
│                       │ Chroma, Pinecone                 │ code-blind. Context rot.    │
│                       │                                  │ Massive token inflation.    │
│                       │                                  │ No epistemic decay curves.  │
└───────────────────────┴──────────────────────────────────┴─────────────────────────────┘
```

### 1.2 The True Product-Market Fit (PMF): What Sovereign Builders Truly Want
The ideal user is the **Sovereign Tech Lead, Solo Founder, or Elite Multi-Agent Team** running 3 to 10 autonomous agents in parallel (Claude Code for UI, Hermes for background research, Codex for backend, local models for micro-tasks).

What they demand:
1. **Zero-Clobber Multi-Agent Concurrency:** Run multiple agents simultaneously without branch obliteration, git merge hell, or file corruption.
2. **Deterministic Pre-Commit AST Invariant Gates:** Prevent agents from deleting public exports, mutating function signatures, or breaking call sites before git commit. Mathematical verification in microseconds, not an hour later in CI.
3. **Infinite Epistemic Hyper-Vaults:** Memory that scales with the enterprise—not a rigid 6-bucket box, but dynamic namespaces with exponential half-life decay, cross-vault hypergraphs, and cryptographic Merkle attestations.
4. **Virtual MCP (vMCP) Context Compression:** Eliminate tool token bloat. Dynamically mount only the exact tools needed for the active AST node, slashing context waste by 85%+.
5. **Terminal-Native CLI + TUI + Daemon First:** Developers live in the terminal. The CLI must be blazing fast, rust-native, scriptable, and beautiful.
6. **Universal Interoperability ("Work with All"):** Act as the Layer-0 substrate beneath Claude Code, Cursor, Hermes Agent, OpenCode, Codex, and Git—not another walled garden.

---

## 2. From Static 6 Vaults to the Infinite Hyper-Vault Mesh

### 2.1 The Architectural Paradigm Shift
The original 6-vault model (*Strategic, Technical, Creative, Operational, Wisdom, Horizon*) was an important baseline. However, complex multi-repo estates require an **Infinite-Dimensional Epistemic Memory Mesh**:

```
                                  INFINITE HYPER-VAULT MESH
                                ┌───────────────────────────┐
                                │   core/strategic/canon    │ (Immutable, λ = 0)
                                └─────────────┬─────────────┘
                                              │ DependsOn
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │     repo/frankx-prod      │                   │      lore/starbound       │
         │  (Technical Contracts)    │                   │   (Creative Tokens/Mood)  │
         └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                       │ Implements                                    │ Generates
                       ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │ project/audio-dsp/sprint4 │                   │   agent/hermes/trajectories│
         │ (Operational, λ = 14d)    │                   │ (Learned Skills & Prompts)│
         └───────────────────────────┘                   └───────────────────────────┘
```

### 2.2 Mathematical Confidence Decay Equation
Every memory node in Starlight possesses a time-dependent epistemic confidence score:

$$C(t) = C_0 \cdot e^{-\lambda t} \cdot \left(1 + 0.15 \cdot N_{\text{attestations}}\right)$$

Where:
- $C_0 \in [0.0, 1.0]$ is the initial confidence.
- $\lambda = \frac{\ln(2)}{T_{1/2}}$ is the decay constant computed from the domain half-life $T_{1/2}$.
- $T_{1/2} = 0$ designates permanent, immutable canon ($\lambda = 0$).
- $T_{1/2} = 14\text{ days}$ for operational sprint notes and transient worktree logs.
- $T_{1/2} = 180\text{ days}$ for technical API contracts.
- $N_{\text{attestations}}$ is the count of cryptographic Ed25519 Merkle endorsements.

---

## 3. Virtual Model Context Protocol (vMCP) Mesh Router

### 3.1 The MCP Token Crisis & Starlight's Solution
When an agent connects to 15 upstream MCP servers (GitHub, Playwright, Cloudflare, Linear, Filesystem, SQLite, etc.), **30,000 to 70,000 tokens** of the LLM context window are consumed solely by tool descriptions before any work starts. This causes severe reasoning degradation ("context rot").

```
VANILLA MCP (Unfiltered Token Bloat):
[Agent LLM Context: 200k tokens]
├── [Tool Schemas: 52,000 tokens (26% of window!)] <--- Context Rot & High Cost
└── [Actual Code & Instructions: 148,000 tokens]

STARLIGHT vMCP (JIT Context Synthesis):
[Agent LLM Context: 200k tokens]
├── [vMCP JIT Synthesized Tools: 3,200 tokens (1.6% of window!)] <--- 85%+ Savings
└── [High-Fidelity Code & Memory: 196,800 tokens]
```

### 3.2 JIT Scope Filtering Engine
Starlight dynamically synthesizes active tools based on:
1. **Active Worktree Path:** Editing `src/dsp/buffer.ts` mounts Tree-sitter and DSP audio tools; unmounts Cloudflare deploy and git release tools.
2. **Agent Intent:** Intent matching "deploy to production" dynamically mounts Cloudflare/Vercel tools.
3. **Security Invariant Pre-Checks:** Every tool execution passes through Starlight's local IPC sandbox before touching system files.

---

## 4. Terminal-Native CLI (`starlight`), TUI & Cockpit Architecture

### 4.1 The CLI as Developer Ground Truth
Developers work in terminals (`zsh`, `pwsh`, `tmux`, `neovim`). Starlight provides a first-class native Rust CLI binary (`starlight`):

```bash
# Telemetry, active agent leases, and daemon health
starlight status

# Tree-sitter AST pre-commit verification gate
starlight gate check --file src/dsp/buffer.ts

# Worktree concurrency lease acquisition
starlight lease acquire --agent claude-code --worktree /repo/.worktrees/dsp --paths "src/dsp/*" --ttl 120

# Infinite Vault exploration and semantic queries
starlight vault query --namespace "repo/frankx-prod"
starlight vault stats
starlight vault audit # Cross-vault contradiction detection

# Virtual MCP metrics and active tools
starlight vmcp --intent "refactor audio buffer" --path "src/dsp/buffer.ts"

# Background daemon management
starlight daemon start
```

### 4.2 Terminal User Interface (TUI) via Ratatui
Launching `starlight tui` provides a 60 FPS interactive terminal dashboard showing:
- Real-time CPU, RAM, and GPU VRAM utilization via NVML.
- Active agent swimlanes (Claude Code, Hermes, OpenCode, Codex).
- Live worktree leases, held files, and remaining TTL counters.
- Tree-sitter invariant pass/fail log stream.
- Infinite Vault memory graph explorer.

---

## 5. Universal Interoperability Matrix ("How We Work with All")

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    STARLIGHT UNIVERSAL SUBSTRATE (LAYER 0)                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Claude Code]       │ Global hooks (~/.claude/hooks) + vMCP bridge (:8767)      │
│ [Cursor / Windsurf] │ Virtual MCP auto-injected (.cursor/mcp.json)              │
│ [Hermes Agent]      │ Persistent background loop, self-evolving skills ingestion│
│ [Untrivial IDE]     │ Fleet orchestration under Starlight worktree locks        │
│ [OpenCode / Codex]  │ Standard stdio / SSE MCP transport                        │
│ [Git Hooks]         │ Pre-commit .git/hooks/pre-commit invariant validation     │
│ [Local Models]      │ Direct vLLM / Ollama hardware placement broker            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Comprehensive Product Requirements Document (PRD v2.0)

### 6.1 Functional Requirements (FR)
- **FR-1 (Infinite Vault Epistemic Mesh):** Hierarchical dynamic namespaces, mathematical confidence decay, and automated cross-vault contradiction detection.
- **FR-2 (Virtual MCP Router):** JIT tool synthesis and context filtering delivering $\ge 80\%$ token reduction compared to vanilla MCP configurations.
- **FR-3 (Distributed Concurrency & Worktree Arbiter):** POSIX flock + Cloudflare Durable Object leases with TTL heartbeats and automated zombie-process reaping.
- **FR-4 (Wait-For-Graph Cycle Preemption):** Tarjan SCC cycle detection resolving circular deadlocks deterministically in $<2\text{ ms}$.
- **FR-5 (AST Invariant & Blast-Radius Engine):** Tree-sitter parsers for TypeScript, Rust, Python, Go enforcing `NO_SYNTAX_ERRORS`, `NO_BREAKING_EXPORTS`, and `NO_MUTATED_SIGNATURES`.
- **FR-6 (Dynamic Hardware Placement Broker):** Real-time hardware telemetry (CPU, RAM, VRAM via NVML) dynamically placing tasks across local quantized models and cloud frontier APIs.
- **FR-7 (Terminal CLI & Cockpit):** Full-featured Rust CLI, 60fps Ratatui TUI, and optional Tauri v2 desktop surface.

### 6.2 Non-Functional Requirements (NFR)
- **NFR-1 (Latency):** Daemon IPC responses execute in $<2\text{ ms}$.
- **NFR-2 (Memory Footprint):** Daemon consumes $<15\text{ MB}$ RAM; TUI $<10\text{ MB}$ RAM; Tauri GUI $<45\text{ MB}$ RAM idle.
- **NFR-3 (Offline Sovereignty):** 100% operational offline with zero mandatory external telemetry.
- **NFR-4 (Write Durability):** Zero state corruption across 100,000+ atomic writes via SQLite WAL journaling and Git commit-tree hashes.

---

## 7. Extended SDLC Plan & Multi-Agent Progress Framework

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     AUTONOMOUS SDLC WORKFLOW ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [Agent 1: Kernel Engineer]   │ Rust daemon, POSIX locks, sysinfo telemetry      │
│ [Agent 2: Compiler Engineer] │ Tree-sitter AST queries, invariant rules         │
│ [Agent 3: Storage Architect] │ Infinite Vault Mesh, LibSQL, sqlite-vec, FTS5    │
│ [Agent 4: Protocol Engineer] │ vMCP router, JIT tool synthesis, loopback proxy  │
│ [Agent 5: CLI & UI Lead]     │ Rust CLI, Ratatui TUI, Tauri v2 Cockpit          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Sprint | Weeks | Focus Area | Deliverables | Verification Gate |
| --- | --- | --- | --- | --- |
| **Sprint 1** | Weeks 1–2 | Rust Core & Concurrency | `starlightd`, POSIX flock, WFG deadlock cycle detector, heartbeat reaper | 10 mock CLI agents attempt simultaneous writes; 0 conflicts; deadlocks resolve in $<2\text{ ms}$. |
| **Sprint 2** | Weeks 3–4 | AST Invariant Engine | Tree-sitter TypeScript/Rust parsers, diff comparator, query packs | 25 breaking API patterns intercepted and blocked with structured MCP payloads. |
| **Sprint 3** | Weeks 5–6 | Infinite Vault Mesh | Dynamic namespaces, confidence decay engine, LibSQL + sqlite-vec | Ingest 50,000 memory entries; query retrieval $<3\text{ ms}$; decay curve validated. |
| **Sprint 4** | Weeks 7–8 | Virtual MCP Router | vMCP proxy, JIT tool filtering, token savings analyzer | Token overhead reduced by $\ge 80\%$ on real multi-tool workflows. |
| **Sprint 5** | Weeks 9–10 | Terminal CLI & TUI | Native `starlight` CLI, Ratatui TUI, telemetry HUD | CLI commands execute in $<10\text{ ms}$; 60 FPS TUI rendering. |
| **Sprint 6** | Weeks 11–12 | Cloud Edge & Hardening | Cloudflare DO leases, Ed25519 SIP Merkle attestation explorer, dogfooding | Remote 3-node worktree sync completes across WAN in $<50\text{ ms}$. |

---

## 8. Unit Economics & Revenue Model

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INCOME STREAMS & ECONOMICS                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Tier 1: Starlight Core (Open Source)    │ $0     │ Apache 2.0 CLI & Local daemon│
│ Tier 2: Sovereign Studio Pro            │ $49/mo │ Terminal TUI + Tauri Cockpit │
│ Tier 3: Studio Team Mesh                │ $199/mo│ Durable Object Sync + Leases │
│ Tier 4: Sovereign Enterprise Appliance  │ $25k/yr│ Private VPC + Audit Attest   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Pro Seat Economics ($49/month)
- Hosting & Telemetry: **$0.65**
- Payment Processing (Stripe): **$1.72**
- Customer Support: **$1.20**
- Marginal AI Compute Cost: **$0.00** *(Bring Your Own Key / Local GPU)*
- **Net Contribution Margin: $45.43 (92.7% Gross Margin)**
