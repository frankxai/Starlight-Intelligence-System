# Board pre-pass — CopilotKit as standardized agent-UI runtime

> **Source:** `.intake/processed/2026-05-03/copilot kit.txt`
> **Tier:** Operational-leaning (not substrate, but cross-repo enough that it warrants board pressure-test)
> **Status:** AWAITING `/starlight-board` ratification

---

## Proposal

Adopt CopilotKit (~30.5k stars, MIT, AG-UI Protocol aligned) as the standardized agent-UI substrate across Arcanea, FrankX, ACOS, and (selectively) SIS. Wrap it in one internal package `packages/agent-ui-runtime/` and consume it across all repos that need an agent-user surface.

Full plan at `docs/superpowers/plans/2026-05-03-copilotkit-runtime-package.md`. This packet is the pressure-test gate before scheduling.

## Why this is board-worthy

Operational-tier in the strict sense (no SIP edit, no taxonomy change), but consequential because:

- It commits multiple sibling repos to a shared dependency (entropy decreases, but the dependency graph couples)
- Replaces or parallels the bespoke v7.5.3 cockpit work (orb + dashboard + DispatchPanel + brain SSE)
- Sets a precedent for "how agent-user UIs are built in our ecosystem"

## Three sub-decisions

### Decision 1 — Adopt CopilotKit?

| Option | Pros | Cons |
|---|---|---|
| **Yes** | Portability across repos; standardized AG-UI Protocol; generative UI primitives we don't yet have | Couples ecosystem to one OSS dependency; learning curve; potential lock-in |
| **No** | Sovereignty over the surface; bespoke fit per app | Every repo invents its own; entropy compounds; no shared state primitives |
| **Pilot on one app first** | Low-risk validation of the boundary rules | Delays the cross-repo win |

**Pre-pass recommendation: Pilot on one app first.** Build `apps/arcanea-command-center` or `apps/starlight-agent-console` as the canonical impl, prove the boundary holds, then propagate.

### Decision 2 — Golden reference impl location

| Option | Why |
|---|---|
| **`apps/arcanea-command-center` in `arcanea` repo** | Arcanea is the primary user-facing surface (Luminor sidebar, worldbuilder, codex editor); the canonical impl naturally lives there |
| **`apps/starlight-agent-console` in SIS repo** | SIS is the substrate; canonical patterns live there for cross-repo adoption |
| **Both** | Different surfaces, different audiences, parallel proofs |

**Pre-pass recommendation:** Single golden ref in **Arcanea** (largest user-facing surface, most generative-UI need). SIS gets a thinner consumer (the existing dashboard at `:3007` could absorb a subset of CopilotKit primitives without becoming the canonical impl).

### Decision 3 — Bespoke cockpit posture

| Option | Pros | Cons |
|---|---|---|
| **Keep bespoke v7.5.3 cockpit, adopt CopilotKit elsewhere** | Frank's daily driver stays optimal; CopilotKit is for cross-repo apps where portability matters | Two patterns to maintain |
| **Migrate cockpit to CopilotKit** | One pattern across everything | Loses bespoke fit; the orb + dashboard + DispatchPanel + brain SSE work would need re-implementation |

**Pre-pass recommendation:** Keep bespoke cockpit as Frank's local Jarvis surface. CopilotKit wins where portability + standardization matter (Arcanea, FrankX, ACOS); bespoke wins where Frank's daily-driver fit matters (local cockpit).

## What ships if PROCEED (with above recommendations)

1. **`packages/agent-ui-runtime/`** — new internal package wrapping CopilotKit with our defaults
2. **Golden reference impl** in `arcanea` repo (`apps/arcanea-command-center` or equivalent)
3. **Strong-boundary documentation** at `docs/agent-ui-runtime-boundary.md` — what CopilotKit owns vs doesn't
4. **6 new slash commands** that map to CopilotKit-rendered UIs (`/architect`, `/content`, `/music`, `/design`, `/research`, `/deploy`) — added to `.claude/commands/`
5. **Strict NON-shipped: bespoke cockpit unchanged.** The v7.5.3 orb + dashboard + DispatchPanel + brain SSE stay as Frank's local Jarvis.

## What stays untouched

- `private/voice-operator/` — voice operator stays bespoke (text-first CopilotKit doesn't fit voice loop)
- SIP substrate — no change
- Existing 70+ commands — unchanged (CopilotKit adds 6 new ones, doesn't replace existing)

## Pre-pass questions for the board

1. **Sovereign vector** — Are we ready to be coupled to a 30.5k-star OSS dependency for agent-UI surfaces across multiple repos? What's the exit if CopilotKit changes direction?
2. **Seer vector** — In 18 months, will the AG-UI Protocol be the standard, or will MCP / agentic-UI standards have shifted? What's the cost of being early?
3. **Harmonizer vector** — Does the strong-boundary table actually hold? CopilotKit's own ambition might creep into "memory" / "canon" / "agent identity" territory if we let it.
4. **Strategist vector** — Generative UI + shared state + human-in-the-loop is the primitive layer that's missing. What do we lose if we don't adopt this? (Honest: every repo continues to invent its own assistant UX, and the ecosystem stays fragmented.)
5. **Verifier vector** — What fails first? Likely: the boundary rules (CopilotKit owns UI orchestration, NOT memory) erode under product pressure. Mitigation: encode the boundary in lint rules + CI checks on the consuming apps.

## Recommendation (Claude's pre-pass synthesis)

**Likely PROCEED-WITH-REVISE** along the lines of the three decisions above:

- YES adopt — but pilot in one app first
- Golden ref in Arcanea, not SIS
- Keep bespoke cockpit; CopilotKit complements, doesn't replace

The board may push back on coupling the ecosystem to a third-party OSS dependency. Counter: we're already coupled to Next.js, React, Tailwind, and Anthropic SDK. CopilotKit is on the same coupling tier. The portability win is real.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Pre-pass packet drafted: 2026-05-03
- Plan: `docs/superpowers/plans/2026-05-03-copilotkit-runtime-package.md`
- Board verdict: AWAITING — ready for `/starlight-board "CopilotKit as standardized agent-UI runtime"`
