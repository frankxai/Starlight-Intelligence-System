# Plan — CopilotKit as standardized agent-UI runtime

> **Window:** 2026-05-XX (post-decision; not yet scheduled)
> **Tier:** Operational (touches UI runtime, not substrate primitives).
> **Owner:** Frank decides scope; Claude executes.
> **Trigger:** `.intake/copilot kit.txt` processed 2026-05-03 — proposal to wrap CopilotKit (~30.5k stars, MIT, AG-UI Protocol) in one internal package and consume it across Arcanea / FrankX / ACOS / SIS UIs.

> **Status:** v0.1 — proposal stage. NOT YET DECIDED. See "Decision needed" at end.

---

## Why this plan exists

Every repo (Arcanea, FrankX, ACOS, SIS) currently invents its own assistant surface. The result is entropy with a chat bubble — five different "AI panels" that don't share state, don't speak the same protocol to backend agents, and don't compose.

CopilotKit gives us:

- **Generative UI** — agents propose cards / tables / timelines that users can approve.
- **Shared state** — a single source of truth for "what the agent is thinking" across surfaces.
- **Human-in-the-loop** — explicit approval flows instead of silent agent actions.
- **AG-UI Protocol** — a standardized message bus between agents and UIs.

Wrapping it in one internal package (`packages/agent-ui-runtime`) means every consuming repo imports the same primitives and the integration cost amortizes.

## The strong-boundary rule

CopilotKit owns:

- UI orchestration / agent-user interaction
- Shared state across agent + frontend
- Frontend tools the agent can call
- Generative UI rendering
- Human approval flows
- Chat sidebar UX

CopilotKit does NOT own:

- Memory (lives in Supabase / vaults / second-brain layer)
- Canon (lives in repo SOUL.md / CANON.md / Arcanea symbolic engine)
- Business logic (lives in calculator packages, n8n workflows, MCP servers)
- Agent identity (lives in `agents/*.md` files)
- Workflow state (lives in `private/voice-operator/config/workflows/`)
- Repo intelligence (lives in CLAUDE.md / MASTER_PLAN.md / SIP)
- Security / publishing authority (lives in repo CI gates + sovereignty clause)

This boundary is non-negotiable. CopilotKit is a UI substrate. The intelligence stays where it is.

## Architecture

```
packages/agent-ui-runtime/         (NEW package, internal)
├── src/
│   ├── CopilotProvider.tsx        wraps CopilotKit's <CopilotKit> with our defaults
│   ├── AgentRegistry.ts           per-app agent definitions (id, name, capabilities)
│   ├── ToolRegistry.ts            per-app frontend tools (the agent can call these)
│   ├── SharedStateAdapters.ts     Supabase / Notion / GitHub state adapters
│   ├── GenerativeUIRenderers.tsx  cards / tables / timelines / forms / approval-prompts
│   └── HumanApprovalComponents.tsx
├── package.json
└── README.md                       boundary rules + consumer examples
```

Each consuming app installs `@arcanea/agent-ui-runtime` and gets a consistent agent surface.

## Phasing

### Phase 1 — Golden reference impl (single app, ~3 weeks)

Build **`apps/arcanea-command-center`** OR **`apps/starlight-agent-console`** as the canonical pattern:

- Sidebar with chat
- 3-5 frontend tools the agent can call (e.g., navigate, query-canon, render-card)
- 3-5 backend tools through MCP (e.g., write-vault-entry, dispatch-cli, run-workflow)
- 3-5 generative UI patterns (decision card, tool-call confirmation, table-of-results)
- Human approval flow for any write operation

Goal: prove the boundary holds and the abstraction is comfortable.

### Phase 2 — Extract to package (~1 week)

Once the golden ref is stable, extract the reusable primitives into `packages/agent-ui-runtime/`. The golden ref becomes the consumer that proves the package shape.

### Phase 3 — Propagate (~1-2 weeks per consumer)

In priority order:

1. **`arcanea` repo** — Luminor sidebar, worldbuilder, codex editor. Primary user-facing impl.
2. **`frankx.ai` repo** — Creator/business operator cockpit.
3. **`agentic-creator-os` repo** — Operator console / agent shell.
4. **SIS site (`site/`)** — possibly. The bespoke local cockpit (orb + dashboard + DispatchPanel) shipped 2026-04-30 already covers some of this surface natively. **Decision: keep bespoke for local, adopt CopilotKit for cross-repo apps where portability matters.**
5. **`arcanea-flow`** — IF it grows a UI surface; today it's swarm-only.

## Slash command → UI rendering map (proposed new commands)

These are not in the current 70+ command surface; they would be added if CopilotKit lands:

| Command | UI rendering |
|---|---|
| `/architect` | system-map + repo-graph + decision-table |
| `/content` | post-drafts + carousel-outline + publishing-checklist |
| `/music` | Suno-prompt-variants + catalog-metadata + release-plan |
| `/design` | component-suggestions + brand-tokens |
| `/research` | source-cards + synthesis-panel + claim-validation |
| `/deploy` | Vercel-status + env-checks + release-checklist |

## Decision needed (Frank)

Three decisions before this plan gets scheduled:

1. **Adopt CopilotKit?** Yes / No / Pilot-on-one-app-first.
2. **Golden reference impl location?** `arcanea-command-center` (Arcanea-canonical) or `starlight-agent-console` (SIS-canonical) or both?
3. **Bespoke cockpit posture?** Keep the v7.5.3 orb + dashboard + DispatchPanel as Frank's local Jarvis surface (recommendation), or migrate to CopilotKit (would lose bespoke fit but gain portability)?

## Out of scope (deliberately)

- **Replacing the orb / dashboard for local use.** The bespoke cockpit is Frank's daily driver and is more responsive than a CopilotKit-wrapped equivalent would be.
- **Adopting AG-UI Protocol substrate-side.** AG-UI is a UI<->agent message bus, not a substrate. SIP stays unchanged.
- **Migrating existing voice-operator surfaces.** Voice-operator stays bespoke; CopilotKit is text/UI-first.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Source: `.intake/copilot kit.txt`
- Plan drafted: 2026-05-03 — awaiting decision before scheduling
