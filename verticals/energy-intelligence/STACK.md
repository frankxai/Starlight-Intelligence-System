# Energy Intelligence — Stack

## Substrate composition

Energy IS is the first reference Domain Sub-Stack to natively use the calculator + validation substrate ratified 2026-05-03.

```
verticals/energy-intelligence/
├── (this vertical's surface)
└── composes:
    ├── @starlight/schemas      ← SovereignNode + EnergyProfile + CostProfile
    ├── @starlight/calculators  ← All numerical math goes through here
    └── @starlight/validation   ← All gating goes through here
```

## Cross-cutting integrations

| Integration | Purpose |
|---|---|
| `@starlight/agent-ui-runtime` (when cross-repo lands) | Agent UI surfaces (sizing wizard, cost dashboard, installer brief renderer) |
| `private/voice-operator/config/workflows/` (per-instance) | Operator workflows (e.g., PV-Lager's installer-onboarding flow) |
| `mcp__starlight-mcp` | Memory + canon access via MCP |
| External: jurisdiction grid-operator APIs | Grid-side data + confirmations |
| External: solar-irradiance APIs (PVGIS, NREL NSRDB, etc.) | Yield calculations |
| External: equipment supplier catalogs | Manufacturer spec checks |

## Persistence

Energy IS data lives in the consumer's sovereign instance. The public reference vertical does NOT carry user data. PV-Lager (a sovereign instance) holds its own data under `private/verticals/pv-lager/` per privacy framework.

| Surface | Where it lives |
|---|---|
| Calculator results (replay corpus) | Per-instance under `private/<instance>/calculators/` |
| Customer data | Per-instance under `private/<instance>/customers/` (NEVER public) |
| Operational telemetry | Per-instance under `private/<instance>/telemetry/` |
| Audit trail | Per-instance JSONL log + attestation chain |

## Languages / runtimes

| Layer | Runtime |
|---|---|
| Substrate packages | TypeScript + Zod |
| Agents | Markdown (Claude Code agent shape) |
| Commands | Markdown (`.claude/commands/energy-*.md`) |
| Calculators (this vertical) | TypeScript implementations of `Calculator<I, O>` |
| External integrations | Per-API SDK (typically Node.js) |

## Deploy posture

Energy IS itself does not deploy — it is a reference vertical. Sovereign instances (PV-Lager and others) deploy their own surfaces. Reference patterns:

- Operator dashboard: Next.js + `@starlight/agent-ui-runtime` (when cross-repo lands)
- Public landing: deploys via FrankX repo's commercial register
- Calculator service: per-instance, typically a Vercel function or Node.js service

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-03
