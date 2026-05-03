# `@starlight/agent-ui-runtime`

CopilotKit wrapper with strong-boundary enforcement. Provides one consistent agent-UI surface across Arcanea, FrankX, ACOS, and any other consumer that wants generative UI + shared state + human-in-the-loop without inventing its own.

## Status

**Scaffold only (v0.1.0-scaffold) shipped 2026-05-03.** Per Board PROCEED-WITH-REVISE (`docs/boards/2026-05-03-copilotkit-adoption.md`):

- `BOUNDARY.md` ships in this package — required, CI-checked
- Provider-pattern interfaces declared (memory / canon / identity injected by consuming app)
- Full implementation is cross-repo: golden reference impl lives in Arcanea (`apps/arcanea-command-center`). See `docs/cross-repo-distributions/2026-05-03-arcanea-luminor-sidebar-copilotkit.md`.

## What this package will do (when full impl ships)

1. Wrap CopilotKit's `<CopilotKit>` provider with our defaults (auth, telemetry-off, voice-canonical theme).
2. Expose `AgentRegistry` and `ToolRegistry` for declaring per-app agents and frontend tools.
3. Provide `GenerativeUIRenderers` for the canonical patterns: decision card, tool-call confirmation, table-of-results, approval prompt.
4. Provide `HumanApprovalComponents` that block downstream actions on `ValidationRequirement` (composes with `@starlight/validation`).

## What this package will NOT do — see BOUNDARY.md

The strong-boundary rule (Board REVISE: "build boundary enforcement into the wrapper from day one"):

- This package does NOT import from `@starlight/memory`, `@starlight/canon`, `@starlight/identity` or any equivalent.
- All access to memory / canon / identity flows through **provider interfaces** the consuming app injects.
- A CI lint rule will flag any direct import as a boundary violation.

See `BOUNDARY.md` for the full table + enforcement plan.

## Provider pattern (Board REVISE)

```ts
import type { AgentUIProviders } from "@starlight/agent-ui-runtime/providers";

const providers: AgentUIProviders = {
  canon: {
    async query(term: string) {
      // Consuming app's responsibility: query its own canon source
      return arcaneaCanonClient.lookup(term);
    },
  },
  memory: {
    async recall(query: string) {
      return memoryBus.recall(query);
    },
  },
  identity: {
    current() {
      return getCurrentSovereign();
    },
  },
};

<AgentUIRuntime providers={providers}>
  <App />
</AgentUIRuntime>
```

The wrapper sees only the provider interface; it never knows which canon system or memory bus is underneath. Different consumers can inject completely different implementations without changing the wrapper.

## Cross-repo

The full implementation is happening in `C:\Users\frank\Arcanea` (golden reference). See `docs/cross-repo-distributions/2026-05-03-arcanea-luminor-sidebar-copilotkit.md` for the placement.

This package may be promoted to a shared monorepo location once the golden-ref proves the boundary holds (~3 weeks per the plan at `docs/superpowers/plans/2026-05-03-copilotkit-runtime-package.md`).

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Substrate-leaning ratified: 2026-05-03 (Board verdict at `docs/boards/2026-05-03-copilotkit-adoption.md`)
