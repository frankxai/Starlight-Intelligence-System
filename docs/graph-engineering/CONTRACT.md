# Starlight Graph Engineering Contract

**Schema:** `starlight.graph-engineering.v1`  
**Status:** executable law for this repo  
**Date:** 2026-08-24  
**Owner:** `Starlight-Intelligence-System`  
**Not:** a new product, a per-agent brain, Q-Town, Agent Canvas, GraphRAG-as-memory, or a second Queen scheduler

This contract names the four graphs the estate may keep. Everything else is a skill, a pack, a projection, or waste.

## Layers

| ID | Name | Job | Canonical home | How many |
|---|---|---|---|---|
| **A** | Workflow / loop-graph | What is legal next, what proves done, who may not self-grade | This repo: `src/work-graph.ts` + `docs/graph-engineering/loops/` | A small library of reusable shapes. One compiled ledger per *campaign*, never per agent |
| **B** | Memory / truth | What is true, with provenance | Six SIS vaults. Private notes stay in `second-brain-vault` | **One** estate memory. No per-brand second brain |
| **C** | Code | Callers, callees, impact | On-demand local index of an *active* product repo | Only repos with a live writer. Never the whole estate |
| **D** | World / drive | Where Frank steers | `docs/starlight-world/` (palace, vaults, city) | **One** |

Foundry `capability-graph` is **procedural memory** (skills and registered agents). It is not layer B and not a fifth product graph.

## Hard forbids

1. **No graph per agent.** Hundreds of agents share A+B+D. Headcount is not topology.
2. **No graph per skill.** Skills are encoded expertise. They attach to a route. They are not graphs.
3. **No graph per domain by default.** A domain earns a typed subgraph only when the *product* is knowledge (canon index, research hub). It still projects into SIS. It never becomes a second SSOT.
4. **No GraphRAG as fleet memory.** `microsoft/graphrag` is a document indexer in maintenance mode. Expensive batch indexes are not Queen state.
5. **No Graphiti as a second memory product.** Temporal facts may be a *derived* index only after the SIS promotion rule. Auto-invalidation must not erase wisdom-vault entries.
6. **No Codegraph/Graphify as SSOT.** Code indexes are disposable. `private/` stays off-graph.
7. **No third orchestrator.** Hermes/Queen remains schedule and lease authority. `longgraph-skill` and `agent-graph` are pattern sources, not a second cron.
8. **No private notes, secrets, transcripts, or `.env` values** in any public graph, loop ledger, or work-graph event body.
9. **No self-certified done.** Completion requires an independent supervisor or a deterministic gate. A model summary is not a fact.
10. **No live spawn from World.** District stewards stay `registered` until a Queen lane admits a writer.

## Promotion into layer B

A work-graph event, transcript, or index hit becomes semantic memory only when all of these hold:

1. the claim is stable (not task progress);
2. provenance points at an evidence URI;
3. privacy/retention is classified;
4. contradiction and staleness were evaluated;
5. a human or named policy authorized promotion;
6. the projection is reversible.

Otherwise it stays layer A (operational) or dies with the session.

## Workflow shapes (layer A)

Reuse these. Do not invent a new shape per brand.

| Shape | When |
|---|---|
| **Chain** | True data dependency (admit before execute) |
| **Diamond** | Independent fan-out, then merge (research, review, scans) |
| **Router** | Inspect facts, pick one legal path |
| **Converge** | Repeat until a stop rule outside the model (tests dry, K empty rounds) |

Every compiled loop must name: nodes, edges as data contracts, executor, **different** supervisor, proof gates, stop rule, human gates, and the work-graph event kinds it emits.

## Scale

- Skills scale by **activation**, not by cloning graphs.
- Brands scale by **packs** on the creator substrate, not by brand-to-brand graphs.
- Content scale is a **pipeline loop** (brief → draft → verifier → human publish). Corpus stays files + hashes.
- Software scale is **one writer per repo** plus a code index on that repo only.
- Fleet scale is **shared routes and facts**. 144 registered SIS agents without a live process and a receipt are registry theater.

## First compiled loop

`docs/graph-engineering/loops/si-admit-verify-ship/` compiles the existing SI / Queen admit → make → verify → ship loop onto the operational work graph.

Validate:

```bash
npm run test:work-graph
npm run test:graph-engineering
```

## Related

- Operational event kernel: `docs/architecture/operational-work-graph.md`
- Starlight World (layer D): `docs/starlight-world/` on `agent/hermes/starlight-world-palace`
- Foundry capability graph (procedural): `foundry/contracts/capability-graph.schema.json`
- Estate routing: `starlight-agent-config/core/estate/repo-estate.control.json`

Built on SIP — operational + doctrine tier.
