# Reality Architecture Genesis

Status: DRAFT / board MERGE_WITH_FIXES — kernel v0.1.1 in progress
Date: 2026-08-16
Owner: Starlight Intelligence System
Board: `queen/reports/reality-architecture-board-20260816/BOARD_VERDICT.md` (control plane)
ADR: `docs/reality-architecture/ADR-000-reality-architecture-substrate-map.md`
Schemas: `docs/reality-architecture/schemas/` (canonical)
Fixtures: `docs/reality-architecture/fixtures/`
Validate: `python scripts/validate-reality-architecture-kernel.py`

## Decision

Starlight Intelligence System remains the canonical substrate. Reality Architecture is a new protocol/domain inside SIS, not a new top-level source of truth.

- **Arcanea** = possibility graph: what could exist.
- **Starlight** = actualization graph: what can become real.
- **Reality Architect** = steering interface and first commercial wedge.
- **Starlight Knowledge Tree** = typed knowledge/capability projection that evolves toward a broader Reality Graph.
- **Starlight Command Center** = operational/visual projection (Reality Observatory).
- **Starlight Swarm** = governed action/experiment runtime.

The core loop is:

`observe -> model -> branch -> value -> plan -> act -> evidence -> update`

No component may silently collapse epistemic categories such as empirical fact, inference, theology, mythology, speculation, simulation, fiction, or desired future.

## Product thesis

The category is **steerable world models**: executable representations of current reality, possible futures, causal constraints, capabilities, values, actions, evidence and provenance.

The first proving ground is the FrankX/Starlight/Arcanea estate itself. The first commercial proving ground is Reality Architect.

## Canonical primitives

### Reality Object

A globally stable, typed object representing something real, inferred, hypothetical, planned, simulated or fictional.

Required top-level concerns:

- identity and stable ID
- ontological type
- realm/existence class
- epistemic state + confidence
- source/provenance
- temporal state/history
- relations
- capabilities
- causal claims
- value/preference links
- representations/assets
- available actions
- possible branches

### Reality Event

An append-only observation of change. Durable state should be derived from events where practical rather than hand-maintained duplicate counters.

### Future Branch

A versioned proposed world-state delta from a named baseline. A branch contains explicit assumptions, interventions, changed objects/edges, predicted effects, uncertainty and verification criteria.

### Reality Diff

A structured difference between current state and target/branch state. It must classify gaps at least as:

- knowledge
- capability
- resource/capital
- relationship/coordination
- technology
- permission/regulatory
- behavior/process
- evidence
- time

### Actualization Plan

A governed plan compiled from a Reality Diff into experiments/actions with owners, prerequisites, costs, gates, expected evidence and rollback/stop conditions.

### Actualization Receipt

A durable record binding action -> actor/agent -> tool -> input reference -> output/evidence -> timestamp -> verification result. Never claim a world-state transition without a receipt or an explicit unverifiable label.

**Naming:** This is `ActualizationReceipt` (`schemas/actualization-receipt.schema.json`). It is **not** Foundry package `foundry/contracts/evidence-receipt.schema.json` (forge/package validation).

## Great Trees as ontology views

Great Trees are human-readable ontology modules/views, not separate databases.

- **Axioma** — formal structure: mathematics, logic, computation, information.
- **Physis** — physical law, spacetime, energy, fields, forces.
- **Materia** — atoms, molecules, chemistry, materials, fabrication.
- **Vitae** — life, genetics, evolution, ecology.
- **Noesis** — cognition, intelligence, memory, learning, consciousness models.
- **Sophia** — knowledge, claims, evidence, models, uncertainty.
- **Causa** — causal mechanisms and interventions.
- **Kyberna** — feedback, control, steering, homeostasis, governance.
- **Concordia** — relationships, trust, institutions, markets, coordination.
- **Praxis** — engineering, design, invention, deployment.
- **Chrona** — time, history, state transitions, trajectories.
- **Telos** — goals, values, preference, ethics, aesthetics, tradeoffs.
- **Arcanea** — counterfactual/fictional possibility across all Trees.
- **Starlight** — reachability/actualization across all Trees.

Ancient, philosophical and religious reality models belong in a **Lineage Graph** with source/tradition/interpretation metadata and explicit epistemic typing. They inspire structural primitives; they are not silently asserted as scientific equivalences.

## Graph families

Reality Architecture must support multiple projections over shared identities:

- ontology/semantic graph
- knowledge/evidence graph
- causal graph
- conditionality graph
- temporal/event graph
- state-space/future-branch graph
- lineage/provenance graph
- relationship/coordination graph
- capability/dependency graph
- value/telos graph
- spatial/scene graph
- digital-twin graph
- agent/action graph
- interdependence/hypergraph projection

A tree is an interface primitive. Reality is not constrained to tree topology.

## State-of-art interoperability targets

Prefer standards/adapters over proprietary reinvention:

- RDF / JSON-LD for semantic interchange where useful
- OWL/SHACL patterns for formal meaning/validation where justified
- PROV-style provenance semantics
- MCP for model/tool/context interaction
- A2A-compatible boundaries where independent agents need delegation
- SysML v2 mappings for engineered systems
- OpenUSD mappings for spatial/scene composition
- external identity mappings to Wikidata/OpenAlex/scientific ontologies rather than copying public knowledge wholesale

These are adapters/projections. SIS remains the canonical operating contract for this ecosystem.

## Storage rule: one reality, many projections

Do not force one database to serve every query shape.

- Git = schema/spec/version-control plane
- Postgres/Supabase = operational object/event/permission plane
- graph projection = relationship traversal
- vector projection = fuzzy semantic retrieval only
- object storage = multimodal assets
- OpenUSD/scene format = spatial projection
- MCP/A2A = agency/interoperability plane

Every projection must be rebuildable or reconcilable from canonical IDs + durable sources.

## First executable vertical: Empire Reality Graph

Model only the estate first:

- brands
- repositories
- products/offers
- domains/sites
- agents/skills
- people/partners where appropriate
- assets
- research/claims
- goals
- revenue streams
- capabilities
- projects
- decisions
- dependencies
- evidence/receipts

The system must answer, with evidence:

1. **What is true now?**
2. **What futures are available?**
3. **What prevents target future X?**
4. **What smallest experiment reduces the highest-value uncertainty?**
5. **Which permitted actions can the swarm execute now?**
6. **Did the action change reality as predicted?**

## First commercial vertical: Reality Architect

Reality Architect should extend `reality.md` without breaking the open standard:

`reality.md -> local Reality Object graph -> target future branch -> Reality Diff -> one bounded Actualization Plan -> receipt -> weekly state update`

Do not jump immediately to a giant hosted personal knowledge graph. Preserve local-first ownership and prove a narrow paid outcome.

Initial monetizable progression:

- free: reality.md + assessment + local export
- paid self-service: Reality Diff report / system-gap pack
- pro subscription: persistent branches, weekly diffs, agent-ready plans, receipts
- team: shared capability/decision graph
- enterprise: ontology + operational action adapters + governance

## Arcanea proving ground

Arcanea keeps its Vault / Fragment / Encyclopedia layering and canon tiers. Add World Genome and Future Branch semantics as adapters, not a canon rewrite.

A World Genome should expose:

- laws/constraints
- primitives
- entities
- geography/spatial state
- ecology
- civilizations/institutions
- agents/goals
- resources/economics
- history
- mysteries/boundaries
- current state
- counterfactual branches
- simulation assumptions
- provenance/canon tier

The first demo should branch one bounded Arcanean scenario and produce a traceable story/event consequence without modifying locked canon.

## Governance invariants

1. Evidence outranks rhetoric.
2. Derived claims must declare source + transformation.
3. Fiction/simulation/speculation never masquerade as empirical fact.
4. Agents may propose branches; irreversible/high-impact actions remain governed by existing SIS/Swarm gates.
5. No duplicate canonical identities across products.
6. Generated counts are derived-and-asserted, never hand-maintained.
7. Every execution path has stop/rollback semantics where technically possible.
8. Values/Telos are explicit inputs, never smuggled in as facts.
9. External standards are adapters, not new sovereign sources of truth.
10. Revenue experiments must attach to measurable user outcomes.

## Milestones

### M0 — Constitutional alignment
- ratify primitives and repo ownership
- add schemas + ADRs
- map existing SIS/Knowledge Tree/Arcanea/Reality Architect concepts to canonical IDs

### M1 — Read-only Empire Reality Graph
- ingest generated portfolio mesh + repo/product/agent metadata
- expose object + relation queries
- evidence/provenance on every state claim

### M2 — Branch + Diff
- create future branch schema
- diff current estate against one target: revenue/product launch or autonomous content engine
- render in Command Center

### M3 — Actualization Compiler v0
- compile diff into bounded experiments
- route to governed Swarm workers
- collect receipts and update measured state

### M4 — Reality Architect paid loop
- local-first personal branch/diff/receipt experience
- one paid self-service outcome
- weekly compounding loop

### M5 — Arcanea World Genome
- map canon entities/fragments into World Genome projection
- simulate one non-canon branch
- publish an interactive Tree/Forest explorer

## Explicit non-goals for v0

- universal ontology of all human knowledge
- custom blockchain/token launch
- replacing Wikidata/OpenAlex/scientific ontologies
- training a frontier world model
- giving every agent unrestricted write authority
- moving all repos into a monorepo
- treating spiritual/religious models as empirical physics

The system earns scope by closing loops, not by accumulating nouns.
