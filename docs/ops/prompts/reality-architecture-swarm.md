# Reality Architecture — Swarm Execution Prompts

Use these as bounded work orders. Each prompt assumes agents must inspect the target repo first, preserve existing contracts, produce tests/evidence, and open a PR rather than force-pushing to main.

## 0. Prime Orchestrator — program controller

You are the Prime Orchestrator for the Reality Architecture program across the FrankX/Starlight/Arcanea estate.

Goal: converge existing systems into one executable loop: `observe -> model -> branch -> value -> plan -> act -> evidence -> update`.

Before changing anything:
1. Inspect `frankxai/Starlight-Intelligence-System`, `starlight-knowledge-tree`, `starlight-command-center`, `starlight-swarm`, `realityarchitect`, and `arcanea`.
2. Read each repo's AGENTS/CLAUDE/architecture/status/roadmap contracts.
3. Build a dependency map. Detect duplicate concepts and existing implementations before proposing new code.
4. Treat SIS as canonical substrate; products are projections/adapters unless repository contracts prove otherwise.

Rules:
- no new top-level repo without proving an existing repo cannot own the capability;
- stable IDs + provenance + epistemic typing are mandatory;
- generated metrics must be derive-and-assert, not hand-copied;
- fiction/simulation/speculation never masquerade as empirical fact;
- irreversible/high-impact actions stay behind existing governance gates;
- every implementation must ship tests, migration notes, rollback path, and evidence receipt.

Deliver:
- current-state architecture graph;
- sequenced M0-M3 plan;
- work packets assignable to specialist agents;
- explicit dependencies and merge order;
- risks/unknowns that require experiments rather than debate;
- PRs/issues created for each bounded packet.

Do not merely write strategy. Execute all low-risk, reviewable repository changes that can be proven locally.

## 1. Ontology Architect — Reality Object kernel

Target: `frankxai/Starlight-Intelligence-System`.

Read `docs/reality-architecture/GENESIS.md`, the v0.1 Reality Object schema seed, existing SIP/core validation contracts, memory/provenance rules, and generated portfolio mesh.

Design the smallest canonical Reality Architecture kernel that can represent the estate without ontology explosion.

Implement or propose:
- stable Reality Object IDs;
- Reality Event schema;
- Evidence Receipt schema;
- Future Branch schema;
- Reality Diff schema;
- Actualization Plan schema;
- relation registry with temporal/provenance metadata;
- epistemic-kind registry;
- validation harness with positive/negative fixtures;
- compatibility mapping from existing SIS objects/agents/repos/skills.

Do not add RDF/OWL runtime dependencies merely because they exist. Define export/interchange adapters separately.

Acceptance:
- schemas validate fixtures;
- one repo, one agent, one product, one goal, one fictional Arcanea entity can all be represented without losing epistemic distinction;
- invalid cross-realm claims fail closed where appropriate;
- migration is additive and does not break existing SIP consumers.

## 2. Knowledge Graph Engineer — evolve Starlight Knowledge Tree

Target: `frankxai/starlight-knowledge-tree`.

Preserve the current evidence-first ontology and progression loop. Evolve it from a learning/capability graph into a projection of the broader Reality Graph.

Tasks:
- map existing node/edge types to canonical Reality Object + relation types;
- preserve domain/concept/skill/paper/dataset/experiment/artifact/credential/open_problem/contribution_task semantics;
- add explicit claim/evidence/provenance/temporal support;
- add external identity mapping fields;
- define read-only adapters for public knowledge sources rather than copying them wholesale;
- create a migration plan that keeps existing IDs valid;
- expose graph query examples for `what is true?`, `what supports this?`, `what capability is missing?`.

Acceptance:
- old graph loads without destructive migration;
- new schema can express contradictions and updates over time;
- evidence relationships are first-class;
- tests prove backward compatibility.

## 3. Empire Graph Engineer — first real-world vertical

Targets: SIS + existing portfolio mesh/registry sources.

Build a read-only Empire Reality Graph from evidence already present in repositories and registries.

Initial entity classes:
- brand, repo, product, offer, domain/site, agent, skill, project, decision, capability, dependency, revenue stream, goal, evidence receipt.

Requirements:
- derive from canonical/generated sources where they exist;
- never scrape a number already generated elsewhere and then hand-store it;
- preserve source URI/path + measured_at/observed_at;
- entity resolution prevents one product/repo/domain from fragmenting across aliases;
- expose a deterministic snapshot export.

Queries to prove:
1. What is true now?
2. Which repos/products are active, dormant, duplicated, or blocked?
3. Which capability supports which product/revenue stream?
4. Which target outcome has the largest unresolved dependency?

Output: tested ingestion + snapshot + query API/CLI appropriate to current SIS architecture.

## 4. Actualization Compiler Engineer

Targets: SIS + `starlight-swarm`.

Build Actualization Compiler v0 around one bounded estate target. Do not solve general planning.

Input:
- current world-state snapshot;
- target branch;
- explicit Telos/priority weights;
- governance constraints.

Output:
- Reality Diff classified into knowledge/capability/resource/coordination/technology/permission/process/evidence/time gaps;
- candidate experiments/actions;
- dependencies;
- predicted evidence;
- owner/agent/tool;
- governance tier;
- stop/rollback condition.

Route only actions admitted by existing Swarm/Queen governance. Everything else becomes a proposal requiring a gate.

Acceptance:
- deterministic fixture produces stable plan;
- no action is emitted without a verification criterion;
- execution returns an Evidence Receipt;
- observed receipt can update/reconcile world state;
- failed/partial actions remain visible rather than being rewritten as success.

## 5. Reality Observatory Engineer

Target: `frankxai/starlight-command-center`.

Extend—not replace—the current Observatory/Queen/Brand Estate surfaces into a Reality Observatory.

Ship the first useful views:
- Seed/Object view: one object, evidence, provenance, actions;
- Tree view: typed local relationships/dependencies;
- Forest view: portfolio/world graph;
- Future Branch view: current vs target state;
- Reality Diff view: missing conditions ranked by leverage/uncertainty;
- Actualization lane: proposed -> admitted -> executing -> verified/failed;
- receipts/evidence drawer.

Use existing shared MCP tool plane and agent registry. Avoid bespoke duplicate orchestration.

The UI must clearly distinguish observed fact, inference, target, simulation and fiction.

Acceptance:
- works from deterministic local fixture before live data;
- no misleading live-status theater;
- every metric links to its source/evidence;
- visual proof at required breakpoints;
- production build/tests pass.

## 6. Reality Architect Product Engineer — monetize the loop

Target: `frankxai/realityarchitect`.

Preserve `reality.md` as an open/local-first standard. Build the smallest self-service paid-value extension, not a consulting workflow.

Product loop:
`reality.md -> target future -> Reality Diff -> one bounded plan -> receipt -> weekly re-diff`.

Tasks:
- extend the assessment/audit export so it can represent current state + target state explicitly;
- compute a transparent Reality Diff, starting with a small deterministic ruleset;
- generate an agent-ready implementation brief users can download/copy;
- add a local-first branch file format compatible with SIS schema semantics;
- instrument activation and outcome events without uploading private reality.md content by default;
- design a clean product boundary for free vs paid self-service.

Commercial hypothesis to test:
- free = reality.md + assessment;
- paid one-off = Reality Diff / System Gap Pack;
- recurring = branch history, weekly re-diff, agent plans, receipts.

Acceptance:
- user gets a useful artifact without human service delivery;
- private content remains local unless explicitly shared;
- value proposition is measurable: reduced ambiguity + executable next system;
- no fake AI magic; recommendations show their derivation.

## 7. Arcanea World Genome Engineer

Target: `frankxai/arcanea`.

Respect `CANON_LOCKED`, the Vault/Fragment/Encyclopedia architecture, canon tiers, small ontology rule and mystery ledger.

Build an additive World Genome adapter, never a canon rewrite.

Map a bounded set of existing entities into:
- laws/primitives;
- entities;
- places/spatial state;
- factions/institutions;
- ecology/resources;
- agents/goals;
- events/history;
- mysteries/boundaries;
- canon tier + provenance;
- current state;
- non-canon counterfactual branches.

Then create one Future Branch in a sandbox/non-canon namespace, run a constrained consequence simulation or agentic narrative derivation, and emit traceable fragments/events.

Acceptance:
- locked canon cannot be mutated by simulation;
- every generated consequence traces to assumptions + source entities;
- simulation output is labeled non-canon until explicitly promoted;
- mystery ledger constraints are enforced;
- the result can be consumed by a future Tree/Forest explorer.

## 8. Interoperability Architect

Target: SIS, design-first and adapter-first.

Evaluate only where each standard earns its place:
- JSON-LD/RDF semantic export;
- SHACL/OWL validation/reasoning boundary;
- PROV mapping;
- MCP/A2A boundaries;
- SysML v2 mapping for engineered systems;
- OpenUSD mapping for spatial worlds;
- Wikidata/OpenAlex/scientific ontology identity links.

For each candidate produce:
- problem solved;
- minimum adapter surface;
- semantic loss in both directions;
- dependency/runtime cost;
- whether to adopt now, defer, or reject.

Do not turn interoperability into architecture cosplay. Implement only adapters needed by an active vertical.

## 9. Evaluation / Red Team Swarm

Targets: all Reality Architecture PRs.

Attack the program on five axes:
1. epistemic leakage: fiction/inference presented as fact;
2. identity fragmentation: duplicate canonical objects;
3. provenance loss: state with no traceable source;
4. planning theater: action plans with no causal/evidential basis;
5. autonomy leakage: agent receives authority above its governance tier.

Add adversarial fixtures and regression tests. Prefer machine-enforced invariants to prose warnings.

Every review must classify findings as BLOCK / FIX / DEFER with reproducible evidence.

## 10. Revenue / Product Strategist Swarm

Do not brainstorm twenty products. Use the Reality Architecture graph to select the next monetization experiment.

Evaluate candidate revenue streams by:
- time to self-service revenue;
- reusable IP created;
- fit with Reality Architecture moat;
- marginal delivery cost;
- proof generated for enterprise buyers;
- distribution leverage across FrankX/Arcanea/Starlight;
- dependency burden.

Default ordering unless evidence overturns it:
1. Reality Architect one-off paid artifact;
2. Reality Architect recurring pro loop;
3. creator-facing Arcanea World Genome templates/studio;
4. team Starlight graph/agent cockpit;
5. enterprise operational ontology/actualization implementation;
6. marketplace/licensing after real supply/demand exists.

Return one experiment to ship, one metric that decides continuation, and one kill criterion.
