# Reality Architecture (SIS domain)

Constitutional docs + kernel contracts for steerable world models inside **Starlight Intelligence System**.

## Start here

1. [GENESIS.md](./GENESIS.md) — decision, loop, milestones, non-goals  
2. [ADR-000 substrate map](./ADR-000-reality-architecture-substrate-map.md) — naming + SIS mappings  
3. [type-registry.v0.json](./type-registry.v0.json) — object/relation/gap registries  
4. [schemas/](./schemas/) — six primitives (v0.1.1)  
5. [fixtures/](./fixtures/) — positive + negative  
6. Swarm prompts: [`docs/ops/prompts/reality-architecture-swarm.md`](../ops/prompts/reality-architecture-swarm.md)

## Primitives

| Schema | File |
|--------|------|
| RealityObject | `schemas/reality-object.schema.json` |
| RealityEvent | `schemas/reality-event.schema.json` |
| FutureBranch | `schemas/future-branch.schema.json` |
| RealityDiff | `schemas/reality-diff.schema.json` |
| ActualizationPlan | `schemas/actualization-plan.schema.json` |
| ActualizationReceipt | `schemas/actualization-receipt.schema.json` |

## Validate

```bash
python scripts/validate-reality-architecture-kernel.py
```

Requires `jsonschema` (Python).

## Program issues

- SIS #84 M0–M3  
- Knowledge Tree #5  
- Command Center #10  
- Swarm #18  
- Reality Architect #19  
- Arcanea #103  
