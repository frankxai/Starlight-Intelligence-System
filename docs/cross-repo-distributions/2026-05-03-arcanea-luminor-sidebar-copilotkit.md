# Cross-repo distribution — Arcanea repo: Luminor sidebar via CopilotKit (golden-ref impl)

> **Source:** `.intake/processed/2026-05-03/copilot kit.txt`
> **Target repo:** `C:\Users\frank\Arcanea` (or `arcanea-platform`, depending on which carries the user-facing app)
> **Status:** AWAITING `/starlight-board` ratification on CopilotKit adoption + AWAITING manual placement
> **Why this lives in Arcanea, not SIS:** Arcanea is the primary user-facing surface (Luminor sidebar, worldbuilder, codex editor). The golden-reference impl of CopilotKit naturally lives where the highest-quality consumer is, not on the substrate.

---

## Gated on `/starlight-board` decision

Before this distribution applies, run:

```
/starlight-board "CopilotKit as standardized agent-UI runtime"
```

with the pre-pass packet at `docs/superpowers/board-pre-passes/2026-05-03-copilotkit-adoption.md` as input. If the verdict is PROCEED-WITH-REVISE per the recommended sub-decisions (pilot in one app first, golden ref in Arcanea, keep bespoke cockpit for local), this distribution applies. If STOP, drop this packet.

## What to drop into Arcanea

### File 1 — `arcanea/apps/arcanea-command-center/` (or `arcanea-platform/apps/...`)

The golden reference impl. Per the plan at `docs/superpowers/plans/2026-05-03-copilotkit-runtime-package.md`:

- Sidebar with chat (CopilotKit primary)
- 3-5 frontend tools the agent can call (e.g., navigate, query-canon, render-card)
- 3-5 backend tools through MCP (e.g., write-vault-entry, dispatch-cli, run-workflow)
- 3-5 generative UI patterns (decision card, tool-call confirmation, table-of-results)
- Human approval flow for any write operation

This proves the boundary holds and the abstraction is comfortable.

### File 2 — `arcanea/packages/agent-ui-runtime/` (or extracted to a shared monorepo location)

After the golden ref stabilizes, extract the reusable primitives into a shared package consumed by:

- Arcanea (this repo) — primary user
- FrankX repo — operator cockpit
- ACOS repo — operator console

The package wraps CopilotKit with our defaults:

- `CopilotProvider.tsx`
- `AgentRegistry.ts`
- `ToolRegistry.ts`
- `SharedStateAdapters.ts`
- `GenerativeUIRenderers.tsx`
- `HumanApprovalComponents.tsx`

### File 3 — `arcanea/docs/agent-ui-runtime-boundary.md`

The strong-boundary documentation. What CopilotKit owns vs doesn't own (verbatim from the SIS plan doc).

## Why NOT in SIS

- SIS is the substrate; the bespoke v7.5.3 cockpit (orb + dashboard + DispatchPanel) is Frank's local Jarvis surface and stays bespoke per the pre-pass recommendation.
- Arcanea is the primary user-facing surface where CopilotKit's generative-UI + shared-state primitives create the most user value (Luminor sidebar, worldbuilder, codex editor).
- The shared package can be consumed by SIS later (the dashboard at `:3007` could absorb a subset), but SIS is not the canonical home of the abstraction.

## Action checklist for Frank

- [ ] Run `/starlight-board "CopilotKit as standardized agent-UI runtime"` (the pre-pass packet is ready)
- [ ] If PROCEED, scaffold `apps/arcanea-command-center` in Arcanea with CopilotKit
- [ ] Build the 3 patterns: sidebar + frontend/backend tools + generative UI + human-in-loop
- [ ] Once stable (~3 weeks), extract to `packages/agent-ui-runtime`
- [ ] Cross-distribute the package to FrankX + ACOS

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Source: `.intake/processed/2026-05-03/copilot kit.txt`
- Distribution packet drafted: 2026-05-03
- Target: `C:\Users\frank\Arcanea` (or `arcanea-platform`)
- Gated on: `/starlight-board` ratification
- Action: Frank manual move (post-board)
