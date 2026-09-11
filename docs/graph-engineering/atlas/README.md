# Starlight Agentic Graph Atlas

This is an authored reference architecture, not a live estate dashboard. It extends the four-layer contract in `../CONTRACT.md`; it does not create a second scheduler or a graph per agent. Start with the [dependency-free adoption kit](../../../tools/graph-adoption/README.md) to inspect your own repository and declare one workflow.

## Artifacts

- `estate-graph.v1.json` — seven projections of one operating model, six domain routes, policies, benchmarks, effort economics, and the target roadmap.
- Operator inventories are private, ignored `*.graph-adoption.local.json` files; they are never imported by the public page. The earlier August snapshot is retained locally for provenance, not used as current evidence.
- `instruction-compiler-contract.v1.json` — portable instruction atoms, precedence, context-pack contract, compile pipeline, and lifecycle gates.
- `TARGET_ARCHITECTURE.md` — current-state diagnosis and target control-plane design.
- `RESEARCH_2026.md` — primary-source implementation benchmark.
- `page-spec.md` and `scene-brief.md` — the visual product contract for `/graph-atlas`.

## Reproduce

```powershell
node scripts/snapshot-graph-atlas.mjs --estate-root /absolute/path/to/repositories
npm run graph-atlas:generate
npm run graph-atlas:check
npm run test:work-graph
```

The snapshot contains private repository/branch identifiers but no absolute source paths. It checks immediate Git roots and tracked filenames, including hidden instruction directories. Source-candidate counts are heuristics, not canonical-authority claims. The generated public TypeScript module is derived only from the authored JSON model; `graph-atlas:check` rejects output drift.

## Interpretation

The views are projections, not separate control planes:

1. Estate operating graph — intent to measured value across harness adapters.
2. Reusable loop shapes — chain, diamond, router, and convergence mechanics.
3. Instruction compiler — source contracts to minimum sufficient context packs.
4. Four graph layers — workflow, memory, code, and world graphs with typed references.
5. Value and learning loop — demand to measured outcome and portfolio learning.
6. Multi-brand production — distinct brand packs feeding one governed content/design/publishing loop.
7. Target architecture — control plane, runtime, adapters, proof, memory, and policy.

Graphiti and GraphRAG may become derived memory indexes. They are explicitly not the fleet source of truth. Authoritative state remains typed work events, receipts, repository facts, and approved world records.
