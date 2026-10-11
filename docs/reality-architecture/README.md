# Reality Architecture (SIS domain)

Constitutional docs + kernel contracts for steerable world models inside **Starlight Intelligence System**.

## Start here

1. [GENESIS.md](./GENESIS.md) — decision, loop, milestones, non-goals  
2. [ADR-000 substrate map](./ADR-000-reality-architecture-substrate-map.md) — naming + SIS mappings  
3. [type-registry.v0.json](./type-registry.v0.json) — object/relation/gap registries  
4. [schemas/](./schemas/) — six primitives (v0.1.1)  
5. [fixtures/](./fixtures/) — positive + negative  
6. Swarm prompts: [`docs/ops/prompts/reality-architecture-swarm.md`](../ops/prompts/reality-architecture-swarm.md)
7. **Starlight World** (spatial drive surface): [`docs/starlight-world/`](../starlight-world/) — Mind Palace + six vaults + city. Not Q-Town. Not Agent Canvas.

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

## Consuming the kernel

Verticals pin a revision rather than tracking `main`:

```text
https://raw.githubusercontent.com/frankxai/Starlight-Intelligence-System/<tag-or-commit>/docs/reality-architecture/type-registry.v0.json
https://raw.githubusercontent.com/frankxai/Starlight-Intelligence-System/<tag-or-commit>/docs/reality-architecture/schemas/reality-object.schema.json
```

Proposed tag on merge: `reality-architecture-v0.1.2` (a maintainer creates it; tags are a release action). The
registry grows additively only, so a pinned consumer never breaks.

## Projections

- **Reality Architect** (`frankxai/realityarchitect`) projects a person's open files into this kernel: see
  [`verticals/reality-architect/`](../../verticals/reality-architect/README.md).
