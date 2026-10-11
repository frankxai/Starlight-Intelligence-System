# ADR-000 — Reality Architecture substrate map

- Status: Accepted (board 2026-08-16)
- Date: 2026-08-16
- Context: SIS PR #85 genesis seed + Review Board MERGE_WITH_FIXES

## Decision

Reality Architecture is a **domain/protocol inside SIS**, not a new sovereign repo.
Canonical operating contracts remain SIP/SIS. Reality schemas are additive projections.

## Naming

| Name | Role | Collision note |
|------|------|----------------|
| `RealityObject` | Typed world entity with epistemic envelope | Supersets thin `graph-entity` |
| `RealityEvent` | Append-only observation of change | Distinct from UI/analytics events |
| `FutureBranch` | Versioned proposed world-state delta | Git metaphor, not git storage |
| `RealityDiff` | Structured gap list current ↔ target | Product artifact for Reality Architect |
| `ActualizationPlan` | Governed plan compiled from a Diff | Compiles into `WorkPacket` / Task Envelope |
| **`ActualizationReceipt`** | Action→actor→tool→evidence→verify binding | **NOT** Foundry `evidence-receipt` (package validation) |

Foundry `foundry/contracts/evidence-receipt.schema.json` remains the **package/forge validation receipt**.
Do not overload that schema for world-state transitions.

## Edge invariant

`packages/core/schemas/graph-edge.schema.json` requires `evidenceRef` for every edge.
Reality relations that assert **real/observed** facts MUST carry `evidence_ids` / map to edges with `evidenceRef`.
Simulated/fictional/planned relations may use weaker provenance but must keep `existence.realm` / epistemic kind explicit.

## Values vs facts

- Telos/preference links use `values[]` / `epistemics.kind = preference`.
- Never encode desired outcomes as `existence.realm = real` without an ActualizationReceipt (or explicit `unverifiable` label).

## Mapping to existing schemas

- Thin graph I/O: `graph-entity` / `graph-edge`
- Agent work units: `work-packet`, Foundry `task-envelope`
- Decisions: `decision.schema.json`
- Current-state truth discipline: `core/validation-contract.md` (disk-first)

## Consequences

- Kernel v0.1.1 ships six schemas under `docs/reality-architecture/schemas/`.
- Empire Graph, Observatory, Reality Architect, Arcanea Genome consume these IDs.
- Marketplace/Web3/RDF runtimes stay adapters, not sources of truth.
