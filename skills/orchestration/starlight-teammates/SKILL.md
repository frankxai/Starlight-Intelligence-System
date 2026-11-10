---
name: starlight-teammates
description: Coordinate autonomous sovereign teammates across the Starlight Intelligence System. Routes tasks across dynamic frontier models (Sonnet 5.5, Gemini 4 Argon, Opus 5.5, GPT-6.1 Sol), enforces fail-closed governance invariants, integrates Refero MCP and BrowserOS Neo, and anchors state to the 6-vault memory substrate.
type: orchestration
---

# Starlight Teammates Orchestration

> *"Autonomous execution with sovereign memory and fail-closed governance."*

## When This Skill Activates

- Task involves autonomous digital teammates or workers ("teammate", "teammates", "queen teammate", "search manager", "github officer", "community lead", "computer teams", "dispatch teammate")
- User runs `starlight teammates` CLI commands or interacts with `/teammates` cockpit route
- Invocations of MCP tools: `sis_teammates_list`, `sis_teammates_dispatch`, `sis_teammates_approve`
- When coordinating high-autonomy background work across sandbox environments (Firecracker / E2B / BrowserOS Neo)

---

## The Sovereign Teammates Fleet

| Teammate | Role | Domain | Default Tier | Frontier Models | Active Vaults |
|---|---|---|---|---|---|
| **Starlight Queen** | Ecosystem Operator & CIO | orchestration | Standard | Claude Sonnet 5.5, Opus 5.5, Gemini 4 Argon | Operational, Wisdom, Strategic, Technical |
| **Search Manager** | Intelligence & Lab Analyst | intelligence | Light | Gemini 4 Argon, GPT-6.1 Sol, GLM 5.3 | Strategic, Wisdom |
| **GitHub Officer** | Code Quality & Sentinel Guardian | safety | Standard | Claude Sonnet 5.5, GPT-6.1 Sol | Technical, Operational |
| **Community Lead** | Member Engagement & Synthesizer | relational | Light | Gemini 4 Argon, GLM 5.3 | Creative, Wisdom |
| **Teammate Builder** | Swarm Node & Skill Compiler | foundry | Frontier | Claude Opus 5.5, GPT-6 Astra, Sonnet 5.5 | Technical, Wisdom |

---

## Execution Procedures

### Procedure 1: Fleet Inventory & Task Intake
1. Inspect available sovereign teammates via `teammatesEngine.getTeammates()` or `sis_teammates_list`.
2. Map incoming request intent to the appropriate teammate specialist.
3. Pass input through The Veil (`SanitizationGateway`) to scrub credentials, tokens, and PII before processing.

### Procedure 2: Dynamic Multi-Model Routing
Evaluate intent complexity and route dynamically to model tiers:
- **Light Tier** (Gemini 4 Argon, GPT-6.1 Sol, GLM 5.3): Fast web search synthesis, linting, status checks, JSON extraction, background heartbeat.
- **Standard Tier** (Claude Sonnet 5.5): Primary daily driver, full-stack code implementation, PR reviews, multi-tool workflows.
- **Frontier Tier** (Claude Opus 5.5, GPT-6 Astra): Deep systems architecture, mathematical proofs, model council consensus, multi-repo refactoring.

### Procedure 3: Fail-Closed Governance Invariants (Non-Waivable)
Before executing any tool or state change, check governance gates:
1. **Financial Transactions**: Any prompt or action touching credit cards, payments, invoices, or subscriptions MUST HALT immediately. Status changes to `waiting_approval`. Approval card emitted to cockpit.
2. **Production Deployments / Main Merges**: Any action attempting direct push or merge to `main` branch MUST HALT awaiting human operator signature.
3. **Execution Freeze**: Teammate halts execution cleanly until the operator resolves the gate via `sis_teammates_approve` or the UI approval card.

### Procedure 4: Tool & Sandbox Orchestration
Teammates execute actions within isolated environments:
- **Refero MCP**: Query live UI/UX design patterns from leading apps (`refero_search_screens`, `refero_search_flows`).
- **BrowserOS Neo**: Autonomous web tasks in an authenticated operator browser profile (`browseros-neo`).
- **MicroVM Sandboxes**: Isolate bash execution, file writes, and build pipelines in ephemeral Firecracker / E2B microVMs.

### Procedure 5: Sovereign Memory Hydration & Settlement
1. Prior to task execution, hydrate teammate context from relevant vaults (Strategic, Technical, Creative, Operational, Wisdom, Horizon).
2. Upon task completion, record execution trace, models utilized, duration, and output receipt to the Operational Vault via `sis_append_entry`.
3. If new architectural patterns or decisions emerged, commit to Technical or Strategic Vaults with SIP attestation footer.
