# Agent UI Runtime — Strong Boundary

> Per Board verdict 2026-05-03: this file is a **required artifact** of the
> package. CI checks for its existence + non-empty body. Boundary enforcement
> begins here.

## What this package owns

- UI orchestration (sidebar, modals, panels)
- Agent-user message exchange
- Shared state across agent + frontend session
- Frontend tool registration and invocation
- Generative UI rendering (cards, tables, timelines, forms)
- Human-in-the-loop approval flows
- Theme + chrome (font, color, spacing)

## What this package does NOT own

- **Memory** — durable state lives in `@starlight/memory` (or equivalent consumer-supplied store). The wrapper does NOT read or write memory directly.
- **Canon** — symbolic / mythic / domain knowledge lives in the consumer's canon system (e.g., Arcanea's MCP canon, or a vault). The wrapper does NOT lookup canon directly.
- **Identity** — sovereign identity, auth, current-user determination lives in the consumer's identity system. The wrapper does NOT determine identity.
- **Business logic** — calculators, workflows, n8n integrations, MCP servers stay in their own packages. The wrapper renders results; it doesn't compute them.
- **Workflow state** — durable workflow state lives in `private/voice-operator/config/workflows/` (or the consumer's equivalent). The wrapper renders progress; it doesn't persist.
- **Repo intelligence** — `CLAUDE.md` / `MASTER_PLAN.md` / `SIP.md` are read by agents, not by the UI wrapper.
- **Security policy** — auth, secrets, audit policy stay in the consumer's security layer. The wrapper renders approval flows; it doesn't decide what requires approval.
- **Publishing authority** — what ships when stays with the sovereign with decision rights per SIP § 5. The wrapper renders the decision UI; it doesn't make the decision.

## Enforcement

### Static (lint-checkable)

CI rule will flag any of the following as a boundary violation in `packages/agent-ui-runtime/src/`:

- `import ... from "@starlight/memory"` (or any direct memory-package import)
- `import ... from "@starlight/canon"` (or any canon-system import)
- `import ... from "@starlight/identity"` (or any identity-system import)
- `import ... from "@starlight/calculators"` for direct calc invocation (the wrapper renders results, but app injects them)

**Implementation note:** the lint rule will be added in the v8.x cycle as either a custom ESLint rule or a simple grep gate in CI. Until then, the boundary is enforced by code review.

### Provider pattern (runtime contract)

All access to memory / canon / identity / calculators flows through `AgentUIProviders` injected by the consuming app:

```ts
interface AgentUIProviders {
  canon?: { query(term: string): Promise<CanonResult>; };
  memory?: { recall(query: string): Promise<MemoryResult>; };
  identity?: { current(): SovereignIdentity; };
  calculators?: { run<I, O>(name: string, input: I): Promise<CalculatorResult<O>>; };
}
```

The wrapper sees only the interface. The implementation lives in the consuming app. Two apps can inject completely different impls without the wrapper knowing.

## What this enables

- Arcanea's Luminor sidebar can use the wrapper to render generative UI while keeping Arcanea's canon system as the single source of truth for Guardian / Vel'Tara lookups.
- FrankX's operator cockpit can use the same wrapper while keeping FrankX's memory/identity layer.
- ACOS's creator console can use the same wrapper while keeping ACOS's creator-shaped identity.
- The bespoke v7.5.3 cockpit (orb + dashboard + DispatchPanel + brain SSE) **does not adopt** this package. It stays bespoke as Frank's local Jarvis surface — which is the explicit recommendation in the board pre-pass packet.

## When this boundary is challenged

When a CopilotKit feature wants direct access to memory or canon (a generative-UI flow that wants to "remember" something, or a card that wants to look up canon inline), the answer is:

1. Add a method to `AgentUIProviders` instead.
2. The consumer app injects the provider.
3. The wrapper still doesn't import the underlying system.

The boundary is non-negotiable. Erosion would defeat the purpose of the wrapper (which is portability across consuming apps with different memory/canon/identity backends).

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Source: Board verdict at `docs/boards/2026-05-03-copilotkit-adoption.md` (REVISE item 1: "Provider-pattern is the only way the wrapper accesses memory/canon/identity")
