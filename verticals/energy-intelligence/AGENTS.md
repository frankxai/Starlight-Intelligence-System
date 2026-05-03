# Energy Intelligence — Agents

Per the Domain Sub-Stack Tier pattern: one named agent per sub-system, plus optional cross-cutting agents.

## Status

**Stub v0.1.0-scaffold.** Agent definitions are placeholders — full agent files at `agents/starlight-energy-{sub-system}.md` are v8.x scope.

## Agents (planned)

### Sub-system heads (6)

| Agent | Sub-system | Tier | Status |
|---|---|---|---|
| `starlight-energy-sizing` | Sizing | Domain Sub-Stack | Planned v8.x |
| `starlight-energy-cost` | Cost | Domain Sub-Stack | Planned v8.x |
| `starlight-energy-installer` | Installer | Domain Sub-Stack | Planned v8.x |
| `starlight-energy-operations` | Operations | Domain Sub-Stack | Planned v8.x |
| `starlight-energy-buyer` | Buyer | Domain Sub-Stack | Planned v8.x |
| `starlight-energy-grid` | Grid | Domain Sub-Stack | Planned v8.x |

### Cross-cutting (1)

| Agent | Concern | Tier | Status |
|---|---|---|---|
| `starlight-energy-recovery` | Resilience / disaster / deplatform | Domain Sub-Stack · cross-cutting | Planned v8.x |

## Identity (shared across the vertical)

All Energy IS agents share these identity rules:

- **Refuses LLM math.** Any numerical claim flows through `@starlight/calculators`. Agent prose explains; calculators compute.
- **Names jurisdiction.** Every agent surface starts by establishing the user's jurisdiction (or asking). All ValidationRequirements then resolve to jurisdiction-extended members.
- **Encodes responsibility boundary.** No agent authorizes installer-required actions. The agent surfaces the requirement; the licensed human authorizes.
- **Honors PV-Lager constraint.** Where the agent serves an installer-operator (vs end-buyer), it shifts responsibility AWAY from the operator toward structured self-service, installer enablement, and buyer clarity.

## Agent file structure (when authored)

Each agent file follows the standard `agents/<name>.md` template:

- Identity (name, role, tier, voice, refuses)
- Capabilities (commands they can run, calculators they invoke, profiles they read/write)
- Reasoning protocol (when to ask, when to compute, when to gate)
- Skill activations (which `skills/` files they auto-load)
- Quality gates (what they refuse to ship, what triggers `/openclaw-audit`)

## Composes with

- `@starlight/schemas` — agents read/write SovereignNode + EnergyProfile + CostProfile
- `@starlight/calculators` — agents invoke calculators, never compute directly
- `@starlight/validation` — agents surface validation requirements, never authorize
- `@starlight/agent-ui-runtime` (when CopilotKit lands cross-repo) — agents render via the wrapper

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-03
