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

---

## Calls made by SIS queen 2026-05-05 under "lead with authority + make calls" directive

> Frank authorized SIS queen to make these calls. Reversible: any call can be overridden by Frank with one comment in this doc. Each call carries reasoning + falsifier (the condition under which the call should be revisited).

### Fork 1 — Adopt CopilotKit?

**CALL: Pilot-on-one-app-first.**

Reasoning:
- The plan's own Phase 1 says "Golden reference impl (single app, ~3 weeks)". That IS the pilot. Adopting wholesale across 5 repos before the boundary holds is risky.
- The `packages/agent-ui-runtime` scaffold already shipped in commit `9cd7996` (per the substrate ratification PR) — package shell exists, real consumer doesn't.
- One pilot proves the boundary AND the CopilotKit-bespoke split (Fork 3 below). If the boundary leaks during pilot, that's a cheap discovery.

Falsifier: pilot succeeds AND a second consuming repo (FrankX, ACOS) is ready to integrate without bespoke surgery — at that point flip to "Adopt".

### Fork 2 — Golden reference impl location?

**CALL: `arcanea-command-center`.**

Reasoning:
- Arcanea is the highest-traffic creative IP repo with the broadest UI surface (Luminor sidebar, worldbuilder, codex editor — per plan).
- SIS already has bespoke cockpit (orb + dashboard + DispatchPanel) covering the local-Jarvis use case. Building a competing `starlight-agent-console` would split attention without capturing portability gain.
- Arcanea-canonical means the package gets battle-tested by the broadest user base (creator-facing, not just Frank's daily driver).
- The plan's Phase 3 propagation order already lists Arcanea as #1 — golden ref AT Arcanea aligns scope with priority.

Falsifier: Arcanea's UI surface is on a freeze (e.g., big migration in flight) AND SIS site has a concrete external-facing UX gap CopilotKit would close — flip to `starlight-agent-console`.

### Fork 3 — Bespoke cockpit posture?

**CALL: Keep bespoke for local Jarvis. Adopt CopilotKit for cross-repo / SaaS / portable surfaces.**

Reasoning:
- The plan itself recommends this exact split ("keep bespoke for local, adopt CopilotKit for cross-repo apps where portability matters").
- The orb's daily driver is Groq Orpheus 225ms TTS + 6 native tools + persona switcher (per `memory/project_jarvis_intelligence_layer.md`). That latency + tool-call density is NOT replicable in CopilotKit at the same fidelity. Migrating local would degrade Frank's daily driver.
- CopilotKit shines for shared/multi-user/portable web surfaces (Arcanea Luminor sidebar, FrankX creator console, etc.). That's exactly its design center.
- Architecture: orb stays local-Jarvis (SIS substrate-bound), CopilotKit becomes the SaaS-grade UI for Arcanea + FrankX consumer apps. Two surfaces, complementary, no overlap.

Falsifier: local Jarvis becomes maintenance-heavy (daily breakage, Groq deprecation, etc.) AND CopilotKit-equivalent latency hits parity (sub-300ms TTS + 6+ tools) — at that point the unification economics flip.

---

## Net of all 3 calls

The CopilotKit plan PROCEEDS with these scope guards:
- Pilot one app (`arcanea-command-center`) for ~3 weeks
- Bespoke cockpit (orb + dashboard + DispatchPanel) STAYS for local-Jarvis
- Cross-repo / portable / SaaS UIs adopt the new `@arcanea/agent-ui-runtime` package once pilot proves the boundary

Frank can override any of these calls in this doc — they survive only as long as nobody contradicts them. The falsifiers above name the explicit conditions under which a flip is justified.

## Out of scope (deliberately)

- **Replacing the orb / dashboard for local use.** The bespoke cockpit is Frank's daily driver and is more responsive than a CopilotKit-wrapped equivalent would be.
- **Adopting AG-UI Protocol substrate-side.** AG-UI is a UI<->agent message bus, not a substrate. SIP stays unchanged.
- **Migrating existing voice-operator surfaces.** Voice-operator stays bespoke; CopilotKit is text/UI-first.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Source: `.intake/copilot kit.txt`
- Plan drafted: 2026-05-03 — awaiting decision before scheduling
