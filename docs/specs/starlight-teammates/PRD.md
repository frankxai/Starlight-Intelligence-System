# Starlight Teammates — Product Requirements Document (PRD)

> **Substrate Attestation:** Built on SIP (Starlight Intelligence Protocol) § 1  
> **Status:** Draft / Active Specification  
> **Target Surface:** `starlightintelligence.ai` (Platform, Hub & API)  
> **Author:** Antigravity (Advanced Agentic Systems Architect)  
> **Canonical Path:** `docs/specs/starlight-teammates/PRD.md`  
> **Date:** 2026-11-09  

---

## 1. Executive Summary & Vision

Modern AI tools suffer from an ephemeral session trap: closing a browser tab destroys the worker's working memory, project files remain disconnected, and models act purely reactively when prompted.

**Starlight Teammates** elevates autonomous agents from ephemeral chat bots into **persistent, autonomous sovereign co-workers**. Unlike proprietary closed-wall implementations (such as Perplexity Teammates or Grok bots), Starlight Teammates are built upon the **Starlight Intelligence Protocol (SIP)**:
1. **Sovereign, Portable Memory:** Long-term memory persists in the user's sovereign SIS 6-Vault architecture (Strategic ◆, Technical ⬡, Creative ✦, Operational ▸, Wisdom ◎, Horizon ↗) with local-first encryption, rather than locked into a vendor's silo.
2. **Proactive Operatorship:** Agents don't just wait for prompts; they operate scheduled background sweeps (e.g. Starlight Queen's Monday ecosystem brief), monitor connected resources, draft PRs/specs asynchronously, and propose prioritized next moves.
3. **Fail-Closed Governance:** Strict adherence to SIP safety invariants: autonomous financial transactions fail closed, production code releases require cryptographically verifiable approvals, and tool execution is gated by permission scopes.
4. **Universal Interoperability via MCP:** Every teammate can simultaneously act as an MCP Client (consuming external tools like GitHub, Linear, Notion, Vercel, Refero, BrowserOS Neo) and expose an MCP Server (allowing local IDE tools like Claude Code, Cursor, and Codex to drive Starlight Teammates directly).

---

## 2. Competitive Decompilation & Architectural Differentiators

| Capability | Grok Bot (xAI) | Perplexity Teammates (Max) | Starlight Teammates (`starlightintelligence.ai`) |
| :--- | :--- | :--- | :--- |
| **Execution Horizon** | Ephemeral chat / short session | Persistent thread with unread state | **Persistent Sovereign Worker & Swarm Node** |
| **Memory Architecture** | Single-turn context / account preferences | Proprietary vector DB / Project Brain | **SIS 6-Vault Hybrid Substrate** (SQLite FTS5 + Pluggable Vectors + Append-only JSONL; exportable & local-first) |
| **Sandbox Execution** | Backend code execution container | SPACE MicroVMs (Firecracker on Akamai/Crusoe) | **Pluggable Sandboxing** (Firecracker / Cloudflare Containers / E2B / Daytona with rolling snapshots) |
| **Proactivity & Autonomy** | Reactive only | Scheduled automations & background threads | **Proactive Queen Loops** (Autonomous heartbeat, scheduled briefs, prepared draft PRs, unprompted forward progress) |
| **Governance & Safety** | Prompt safety filter | Standard enterprise RBAC / SOC2 | **SIP Non-Waivable Invariants** (Financial fail-closed, multi-agent git coordination, provenance attestation) |
| **Ecosystem Connectivity** | X/Twitter data integration | Native enterprise connectors + basic MCP | **Bidirectional MCP Mesh + BrowserOS Neo** (Native support for local/remote tools + persistent authenticated browser) |
| **Data Sovereignty** | Proprietary cloud storage | Enterprise cloud storage | **100% User Owned & Sovereign** (Exportable via `/sip-export` to any IDE, local disk, or cloud) |

---

## 3. Core Persona: The Starlight Queen as Primary Co-Worker

The flagship instantiation of Starlight Teammates is the **Starlight Queen**—the supreme autonomous coordinator of the user's intelligence estate.

### Queen Operational Tenets
1. **Curious, Confident, Warm, Playful:** High intellectual rigor paired with playful wit. Never cold enterprise boilerplate; never hallucinated slang.
2. **Prepared Work over Suggestions:** Queen does not output "Here are some tips for your landing page." She opens a branch, writes the component, stages the pull request, and provides a single approval card.
3. **Autonomous Sub-agent Decomposition:** Complex tasks are decomposed into parallel specialist sub-workers (researchers, coders, sentinels). Queen reviews and synthesizes their output before reporting to the operator.
4. **Assumption-Driven Forward Momentum:** When an operator is inactive, Queen states her default assumption and proceeds along the highest-leverage path unless countermanded:
   > *"If you don't answer, I'll start with Option B, since it's the open decision blocking revenue, and set up the Monday brief alongside it."*

---

## 4. User Personas & Primary Jobs-to-be-Done (JTBD)

### Persona A: The Sovereign Builder & Founder (Frank / GenCreator)
- **Job:** Needs autonomous operational momentum across 10+ active repositories, brand assets, social campaigns, and cloud infrastructure without burning cognitive cycles on context reloading.
- **Pain Point:** Context exhaustion across disparate tools (Claude Code, Cursor, GitHub, Vercel). Having to explain architecture again in every chat.
- **Success Criteria:** Waking up on Monday morning to a structured intelligence brief, 3 drafted PRs ready for 1-click merge, and synchronized vaults.

### Persona B: Technical Lead / AI Systems Architect
- **Job:** Wants to orchestrate specialized swarms of AI workers (e.g. Sentinel for security audits, Hermes for deep provenance search, Architect for schema design).
- **Pain Point:** Lack of persistent state, no shared knowledge graph between different agent runs, unpredictable token costs.
- **Success Criteria:** Deterministic routing where cheap tasks route to high-velocity models (Gemini 4 Argon, GPT-6.1 Sol, GLM 5.3) and frontier reasoning is budgeted for synthesis (Claude Opus 5.5, Claude Sonnet 5.5, GPT-6 Astra, o4/o5).

---

## 5. Functional Requirements & Feature Matrix

### P0 — MVP Capabilities (Foundation)
- **FR-01: Persistent Teammate Registry:** Dedicated sidebar with persistent teammate nodes (Starlight Queen, Search Manager, GitHub Officer, Community Lead, Teammate Builder).
- **FR-02: Thread Continuity & Context Hydration:** Navigating to a teammate rehydrates their exact state, recent tasks, project files, and unread notifications without context loss.
- **FR-03: Sovereign Memory Binding:** Teammate automatically reads and appends to SIS memory vaults using `starlight-memory` MCP.
- **FR-04: Approval Card Primitive:** Standardized UI card for human-in-the-loop gating when an agent requests sensitive actions (deploying code, spending budget, sending public communications).
- **FR-05: Model Tier Routing:** Explicit routing controls (Standard/Light/Frontier) to cap token usage and optimize credit spend.

### P1 — Advanced Autonomy & Swarm Integration
- **FR-06: Intra-Session Sub-agent Trees:** Parent teammate can spawn ephemeral child agents to parallelize research, writing, or code verification in isolated context windows.
- **FR-07: Agent Mail & Cross-Teammate Referencing:** Direct teammate mentions via `@` syntax (`@queen`, `@sentinel`), allowing asynchronous task handoffs between teammates.
- **FR-08: Scheduled Heartbeat & Autonomic Cycles:** Teammates can be assigned cron schedules (e.g. `0 9 * * 1` for Monday Morning Brief) to wake up, execute tasks, and deliver reports.
- **FR-09: BrowserOS Neo Integration:** Teammates can request live web actions or inspections through the user's dedicated, authenticated BrowserOS neo browser profile.

### P2 — Platform & Enterprise Expansion
- **FR-10: Teammate Builder Studio:** Low-code/conversational creation interface allowing users to spawn custom teammates with specific skills, MCP bindings, and vault access scopes.
- **FR-11: Remote MCP Server Exposure:** `starlightintelligence.ai` exposes an authenticated MCP endpoint so Claude Code, Cursor, and Codex can use Starlight Teammates as remote tools.
- **FR-12: Sandboxed MicroVM Workspaces:** Cloud execution environments providing root Linux bash, git, and language runtimes with rolling snapshot persistence.

---

## 6. Non-Functional Requirements (NFRs)

1. **Security & Data Privacy:** Zero leakage of vault secrets or API tokens. Local scrubbing via "The Veil" gateway before any external model invocation.
2. **Latency & Perceived Performance:** Real-time token streaming via Server-Sent Events (SSE). UI response to teammate selection under 100ms.
3. **Accessibility & Design Bar:** Full adherence to `DESIGN-EXCELLENCE.md`. Complete keyboard navigability (`Cmd/Ctrl+K` switcher, `J/K` list navigation), high-contrast borders, visible focus rings, and explicit support for `prefers-reduced-motion`.
4. **Reliability & Idempotency:** Background worker jobs must be idempotent; a dropped network connection during an autonomous task must cleanly resume from the last git checkpoint.

---

## 7. Out of Scope for Phase 1

- Autonomous live credit card payments without 1-click human confirmation.
- Destructive git operations (e.g. `git push --force` or branch deletion) without explicit operator signature.
- Proprietary closed model training (all capabilities built via frontier API orchestration).

---

## 8. Success Metrics & Key Results (OKRs)

- **Metric 1:** 90%+ reduction in repetitive context setting for recurring weekly tasks.
- **Metric 2:** 100% compliance with SIP fail-closed financial invariant (0 autonomous unintended transactions).
- **Metric 3:** Token efficiency improvement: ≥65% reduction in frontier token burn by routing subtasks to fast models.
- **Metric 4:** Operator satisfaction: ≥4 finished draft PRs accepted per week via Queen proactive loops.
