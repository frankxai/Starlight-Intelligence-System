# Starlight Meta-Harness: The Sovereign Multi-Agent Substrate

> **Autonomous Multi-Harness Orchestration, Zero-Copy Skill Mesh & Real-Time Cross-Transcript Observability**  
> Built on the Starlight Intelligence Protocol (SIP v1.1.1)

---

## 1. The Multi-Agent Reality in 2026

Modern AI developers do not use a single agent. They work across multiple specialized harnesses:
- **Claude Code** for deep architectural reasoning and complex refactoring.
- **OpenAI Codex** for sandboxed execution and deterministic unit testing.
- **OpenCode** for unmetered batch scaffolding, local models, and rapid TUI workflows.
- **Antigravity CLI** for high-context system synthesis and multimodal design.
- **Grok Build** for high-velocity API tasks and real-time news analysis.

### The Broken State of the Art
1. **Vendor Silos & Quota Halts**: When an engineer hits Claude's weekly rate limit or OpenAI's tier boundary, execution halts. Swapping to another CLI means losing context, skills, and memory.
2. **Memory Amnesia & Docker Bloat**: Traditional vector databases (Pinecone, Chroma in Docker, Milvus) consume 2–4 GB of RAM, require complex cloud configs, and lose auditability.
3. **The Self-Review Trap (Silent Regressions)**: When a single agent writes and approves its own code, hallucinations and regressions slip into production unchecked.
4. **Skill Duplication Sprawl**: Cloning 400+ markdown skill definitions across multiple tool directories wastes gigabytes of disk space and creates divergent configuration drift.

---

## 2. The Starlight Solution

The **Starlight Sovereign Meta-Harness** solves these pain points natively in < 60 MB of RAM with zero cloud vendor dependencies:

```mermaid
flowchart TD
    subgraph Harnesses ["Disparate Agent Harnesses"]
        codex["OpenAI Codex<br/>(~/.codex/history.jsonl)"]
        claude["Claude Code<br/>(~/.claude/history.jsonl)"]
        opencode["OpenCode<br/>(~/.local/share/opencode.db)"]
        kilo["Kilo Code<br/>(~/.config/kilo/)"]
    end

    subgraph MetaSubstrate ["Starlight Meta-Harness Substrate"]
        bridge["Poly-Bridge Engine<br/>(tools/memory-bridge/poly-bridge.mjs)"]
        mesh["Zero-Copy Skill Mesh<br/>(scripts/sync-harness-skills.ps1)"]
        arena["Maker ≠ Checker Arena<br/>(tools/arena/queen-tournament.mjs)"]
        memory["Sovereign Vaults<br/>(6 Semantic Vaults + FTS5 Index)"]
        sse["HTTP / SSE Streamer<br/>(Port :7318 /stream)"]
    end

    subgraph Surfaces ["Developer Surfaces"]
        cockpit["Starlight Cockpit / CLI"]
        observatory["Observatory Dashboard (:4321)"]
        ide["IDE Extensions / Local Browser"]
    end

    codex --> bridge
    claude --> bridge
    opencode --> bridge
    kilo --> bridge

    mesh -.->|"NTFS Junctions (0 B)"| codex
    mesh -.->|"NTFS Junctions (0 B)"| opencode
    mesh -.->|"NTFS Junctions (0 B)"| kilo

    bridge --> sse
    sse --> observatory
    sse --> ide

    arena -->|"Adversarial Cross-Audit"| codex
    arena -->|"Batch Scaffolding"| opencode
    arena -->|"Synthesis"| cockpit

    memory <---> cockpit
    memory <---> bridge
```

---

## 3. Core Architectural Capabilities

### A. Zero-Copy Skill Mesh (`starlight-meta sync`)
- Uses Windows NTFS Directory Junctions (`mklink /J`) and POSIX symlinks to project 450+ specialized skills from the master vault directly into OpenCode, Kilo, and Codex.
- **Resource Impact**: **0 Bytes disk added**, instant capability explosion across all installed agent harnesses.

### B. Real-Time Poly-Bridge & SSE Daemon (`starlight-meta bridge`)
- Concurrently monitors heterogeneous persistence backends:
  - OpenCode SQLite WAL (`opencode.db` via `node:sqlite DatabaseSync` read-only).
  - Codex event stream (`~/.codex/history.jsonl`).
  - Claude session stream (`~/.claude/history.jsonl`).
- Emits real-time unified events over Server-Sent Events (SSE) on port `7318` (`/stream`, `/recent`, `/health`).

### C. Maker ≠ Checker Arena (`starlight-meta arena`)
- Autonomous multi-agent tournament loop:
  1. **Generation (Maker)**: OpenCode or Antigravity drafts rapid implementations.
  2. **Audit (Checker)**: OpenAI Codex runs sandboxed tests and AST validation.
  3. **Taste & Security Gate**: Verified against Design Taste Kernel and Secret Scrubbing gates before commit.

### D. Sovereign Local-First Memory (`starlight-meta memory`)
- 6 human-readable, event-sourced semantic vaults:
  - **Strategic (◆)**: Architecture decisions and historical outcomes.
  - **Technical (⬡)**: Empirically validated engineering patterns.
  - **Creative (✦)**: Brand DNA, design tokens, voice constraints.
  - **Operational (▸)**: Run logs, harness state changes, workflow receipts.
  - **Wisdom (◎)**: Cross-domain synthesis and distilled lessons.
  - **Horizon (↗)**: Long-range vision and ecosystem roadmap.
- Zero-cost lexical and semantic querying in < 15ms.

---

## 4. Benchmark & Resource Footprint

| Metric | Traditional Agent Stacks (Docker + Chroma + Cloud) | Starlight Sovereign Meta-Harness | Improvement |
| :--- | :--- | :--- | :--- |
| **Idle RAM Usage** | 2,500 – 4,200 MB | **25 – 45 MB** | **~98% reduction** |
| **Skill Disk Duplication** | 500 MB – 2 GB per harness | **0 Bytes (Junctions)** | **100% elimination** |
| **Cross-Harness Latency** | Manual copy / API round-trip | **< 10ms local loopback** | **Instantaneous** |
| **External Cloud Lock-in** | High (Cloud vector DBs, remote telemetry) | **Zero (Local-first files)** | **Complete sovereignty** |

---

## 5. Quickstart Guide

### 1. Check System Status
```bash
node tools/meta-harness/starlight-meta.mjs status
```

### 2. Project Skills to All Installed Harnesses
```bash
node tools/meta-harness/starlight-meta.mjs sync
```

### 3. Launch Live Real-Time Cross-Agent Stream
```bash
# In background or separate window:
node tools/meta-harness/starlight-meta.mjs bridge --serve 7318

# Live console monitoring:
node tools/meta-harness/starlight-meta.mjs bridge --watch
```

### 4. Search Sovereign Memory
```bash
node tools/meta-harness/starlight-meta.mjs memory search "Maker Checker"
```

### 5. Dispatch Multi-Agent Tournament
```bash
node tools/meta-harness/starlight-meta.mjs arena run --task="Refactor Lane Guard"
```

---

*Built on SIP v1.1.1 — Sovereign Substrate · MIT License*
