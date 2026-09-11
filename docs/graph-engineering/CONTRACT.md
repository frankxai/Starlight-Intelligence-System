# Starlight Graph Engineering Contract

**Schema:** `starlight.graph-engineering.v1`  
**Status:** executable law for this repo  
**Date:** 2026-08-29
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

## Implemented now (this PR)

These are the advanced post mechanics, as code, not as a second essay:

| Mechanic | From | Code |
|---|---|---|
| Diamond / router / converge | 0xwhrrari + 0xCodez | `src/loop-graph.ts` |
| Reduce in **code**, not an agent | 0xCodez 14-step | diamond `kind=code` gate |
| Autonomy brake: turns, cost, empty rounds, silence list | Sprytixl 7-step | `LoopBrakes` |
| Write-back after executed nodes | noisyb0y1 / Sprytixl | `requireWriteback` |
| Same-actor verifier rejected | 0xCodez / longgraph supervisor | `evaluateLoopGraph` |
| Initializer feature list starts **failing** | 0xCodez harness | `initHarness` + `docs/graph-engineering/harness/features.v1.json` |
| Effort-scale fan-out caps | Anthropic multi-agent research (simple/comparison/complex) | `classifyEffort` + `maxFanOutForEffort` |
| Capacity admission | Starlight overnight + DeLM shared substrate | `ramAvailGb` / `storageMode` refuse multi-agent fan-out |
| Shared gist write-back | Stanford DeLM gists | optional `facts.gists` must cover executed nodes |
| Compiled reachability and edge contracts | Google ADK workflow graphs | roots, terminals, duplicate edges, missing nodes, and contract drift fail closed |
| True diamond AND join | deterministic graph runtimes | reducer stays blocked until every active predecessor completes |
| Caller-declared actor separation | independent-supervisor law | out-of-plan nodes and same-actor verification halt; host authentication is still required |
| Estate graph atlas | Starlight operating evidence | `docs/graph-engineering/atlas/estate-graph.v1.json` + reproducible census |

Still **not** in this PR (and not required to copy X): DSPy optimizer runtime, Codegraph install, nightly GraphRAG extract, a third scheduler.

### Runtime boundary and migration (2026-09-05)

`runLoopEngine` is an in-memory recorder of supplied steps, not a tool executor or authenticated evidence broker. All nodes now require a nonblank `writeback`; checkers additionally require `verdict: "pass"`. Missing/failing verdicts block completion. Actors and artifact references remain caller-supplied; the host must authenticate identities, resolve artifacts, meter real costs and enforce permissions. Declared `costUnits` are not billed tokens. Convergence stopping is evaluated by `evaluateLoopGraph`; repeating/resuming rounds is not implemented by the recorder.

Router selection is exclusive and fixed at the root; later facts cannot switch branches. A missing or ambiguous match halts unless exactly one default applies. Conditions outside the router root are unsupported and rejected. Joins wait for every active predecessor; skipped router branches do not block the chosen tail.

The dependency-free community entry is [the adoption kit](../../tools/graph-adoption/README.md). It checks local manifest/source conformance and generates coverage, never bulk-modifies another repository. Production, publication and paid-product release gates remain independent.

## Estate atlas and target control plane

`docs/graph-engineering/atlas/` projects this contract across the verified estate without creating new graph authorities. It contains the reproducible instruction/agent census, the current and target operating projections, six reusable domain routes, implementation research, graph economics, and the `/graph-atlas` page contract.

The target instruction compiler treats AGENTS, CLAUDE, GEMINI, SKILL, policy, brand, and repo files as provenance-bearing source atoms. It emits a minimum sufficient task pack and a harness-native rendering. Generated skill mirrors remain build output, never source authority.

## First compiled loops

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
