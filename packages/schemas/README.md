# `@starlight/schemas`

Canonical entity types for SIS Domain Sub-Stacks. Replaces ad-hoc tenant / user / instance patterns with one composable shape: **SovereignNode**.

## Status

Foundation v0.1 shipped 2026-05-03 per Board ratification. Types are stable; production consumers (Energy IS, Compute IS, etc.) compose with these.

## Exports

```ts
import {
  SovereignNode,
  SovereignNodeKind,
  EnergyProfile,
  ComputeProfile,
  StorageProfile,
  WorkflowProfile,
  SecurityProfile,
  CostProfile,
} from "@starlight/schemas";
```

## SovereignNode

A single entity in a Domain Sub-Stack. Each node has a `kind` and zero or more **composable profiles**.

```ts
const homeNode: SovereignNode = {
  id: "home-frank-001",
  kind: "home",
  profiles: {
    energy: { /* EnergyProfile */ },
    cost: { /* CostProfile */ },
  },
  metadata: {
    created: "2026-05-03",
    sovereign_owner: "frank",
  },
};
```

The `kind` field is a closed enum of canonical sovereign-entity types:

| Kind | Use |
|---|---|
| `person` | Individual sovereign |
| `home` | Household / residence |
| `family` | Multi-person sovereign unit |
| `creator` | Public-facing creator account |
| `business` | Operating business / SMB |
| `installer` | Service-providing professional |
| `community` | Bounded social group |
| `studio` | Production-shaped business (music, video, design) |
| `retreat` | Place-bound experience-shaped operation |
| `property` | Asset-shaped node (real estate, vehicle, equipment) |

Adding a new kind requires `/starlight-board` ratification — this is substrate.

## Profiles

Each profile is a **composable trait** the SovereignNode opts into. A node may have any combination.

| Profile | Carries |
|---|---|
| `energy` | Demand, generation, storage, grid connection, tariffs |
| `compute` | CPU/GPU class, RAM, VRAM, cloud accounts, quotas |
| `storage` | Disk class, backup policy, retention windows |
| `workflow` | Active workflows, schedule, agent assignments |
| `security` | Auth model, secrets store, audit policy |
| `cost` | Currency, budget envelope, payback model |

Profiles are in `src/profiles.ts`. Each has its own Zod shape with explicit `inputs`, `assumptions`, and `provenance` fields so any derived calculation has a traceable origin.

## Why this is substrate

Every Domain Sub-Stack used to invent its own tenant/instance type. People IS has `Person` with HR-shaped fields; Sound IS has `Artist` with musician-shaped fields; Music IS has `Persona`. That's fine for creator-shaped sub-stacks. But infrastructure-shaped sub-stacks (Energy, Compute, Home, Capital) need a richer entity that composes profiles — because a household has both energy demand AND a cost envelope AND maybe compute load.

`SovereignNode` is the canonical answer. People/Sound/Music IS continue using their domain-shaped types; new infra-shaped sub-stacks compose `SovereignNode`.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Substrate ratified: 2026-05-03 (Board verdict at `docs/boards/2026-05-03-calculator-validation-substrate.md`)
