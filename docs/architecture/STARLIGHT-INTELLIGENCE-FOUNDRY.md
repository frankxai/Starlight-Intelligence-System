# Starlight Intelligence Foundry

Status: v0.1 operational kernel
Date: 2026-07-28
Owner: Starlight Queen / Foundry
Scope: operational layer; no SIP substrate contract change

## Decision

Starlight is capability-first and skills-first.

ChatGPT Work is the conversational cockpit. Codex is the repository-native engineering worker. The Agents SDK is the programmable orchestration runtime. Other harnesses are deployment adapters. SIS provides shared capability contracts, governance, evidence, and ratified memory.

```text
ChatGPT Work / Slack / Voice / API
                  |
        Starlight Foundry Plugin
                  |
          Starlight Queen
      typed routing + governance
                  |
      +-----------+-----------+
      |                       |
 Foundry Compiler       Execution Mesh
 skills / agents /      Codex / Agents SDK /
 swarms / verticals     Claude / Gemini / Grok
      |                       |
      +-----------+-----------+
                  |
          Proving Ground
       evidence + taste + tests
                  |
         Ratified SIS Memory
```

The system does not treat “agent” as a synonym for prompt, persona, or intelligence. An agent is a persistent policy boundary. Everything else is a skill, deterministic tool, or temporary task worker.

## Current OpenAI surface

OpenAI currently exposes two relevant packaging layers:

- Skills provide reusable instructions to ChatGPT and Codex.
- Plugins package skills and may optionally include MCP servers or app components.

The repository therefore ships `plugins/starlight-foundry` as a skills-only v0.1 plugin. A remote MCP server is intentionally absent until a deployed endpoint, authentication model, privacy contract, and runtime tests exist.

Workspace Agent publication, schedules, channels, and API triggering remain a separate governed deployment target. Availability depends on workspace and plan configuration; a compiled Agent Pack is not proof that a Workspace Agent was published.

Primary references:

- [Build skills](https://learn.chatgpt.com/docs/build-skills)
- [Build plugins](https://learn.chatgpt.com/docs/plugins)
- [Workspace Agent authentication](https://developers.openai.com/workspace-agents/authentication)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)

## Control-plane boundaries

| Component | Owns | Must not own |
|---|---|---|
| Intent Contract | Definition of done, constraints, permissions, proof | Runtime implementation |
| Capability Graph | Discoverable skills, agents, relationships, lifecycle | Silent selection |
| Foundry | Validation, compilation, packaging | Autonomous permission expansion |
| Queen | Routing, topology, approvals, ratification | Pretending suggested work executed |
| Execution Mesh | Runtime work and spans | Promotion verdict |
| Taste Engine | Qualitative hard gates and judge policy | Factual or security override |
| Proving Ground | Evidence lanes and receipts | Changing acceptance tests after failure |
| SIS memory | Ratified decisions and preference evidence | Unreviewed self-modification |

## Canonical compilation flow

```text
Intent
  -> Task Envelope
  -> Capability Resolution
  -> Kind-specific Pack
  -> Compiled Capability Package
  -> Runtime Execution
  -> Evidence Receipt
  -> Evolution Proposal
  -> Re-proof
  -> Ratified Memory
```

The deterministic compiler validates model-authored contracts. It does not claim to replace model judgment. The capability resolver selects only explicit required and preferred capabilities. Lexical suggestions are visible discovery hints and require model or operator confirmation.
`allowCreation` authorizes creation of the requested package itself; dependencies must already be materialized and explicitly selected.

## Task Envelope

`foundry/contracts/task-envelope.schema.json` carries:

- objective and deliverables;
- vertical, audience, artifacts, and references;
- stakes and reversibility;
- autonomy and approval points;
- hard constraints and budget;
- evidence freshness and required lanes;
- tool, memory, external-write, and destructive-action permissions;
- required, preferred, forbidden, and creatable capabilities;
- structured completion tests;
- deployment targets.

The Queen prefers `route-envelope`:

```bash
node tools/queen/driver.mjs route-envelope <task-envelope.json>
```

The old keyword classifier remains a labeled compatibility fallback. It is not the cognitive control plane.

## Capability packages

| Pack | Contract | Core gate |
|---|---|---|
| Skill | `skill-pack.schema.json` | Reusable procedure, bounded activation, step-level proof |
| Agent | `agent-pack.schema.json` | At least one persistent autonomy boundary |
| Swarm | `swarm-pack.schema.json` | Distinct roles, state policy, conflict owner, termination |
| Vertical | `vertical-pack.schema.json` | Recurring domain constraints and evaluation |
| Plugin | `plugin-pack.schema.json` | Materialized validated skills and real deployment surface |

Every compiled package contains:

```text
package/
├── task-envelope.json
├── <kind>-pack.json
├── capability-resolution.json
├── foundry-manifest.json
├── README.md
└── <kind-specific artifacts>
```

The manifest records SHA-256 digests for compiler-produced artifacts. The prover fails on changed, missing, or unexpected package files.
Pack deployment, tool, and memory permissions must be subsets of the Task Envelope; the compiler fails closed on attempted expansion.

## Agent necessity

At least one must be true:

1. stable decision rights;
2. distinct memory scope;
3. constrained tool or permission boundary;
4. genuine ownership transfer;
5. ongoing schedule, channel, or API trigger.

If all are false, compilation fails and the correct result is a Skill Pack or temporary worker.

This keeps the existing named-agent library available as a rich compatibility and domain layer while moving new routing from identity-first to capability-first.

## Swarm topology

Supported pack-level topologies:

- `manager-workers`;
- `handoff`;
- `agents-as-tools`;
- `parallel-merge`;
- `debate-synthesize`.

A swarm is justified only when work is genuinely separable, evaluation needs independence, latency materially improves, or permissions need isolation. Every swarm declares:

- role-level capabilities and decision rights;
- produced artifacts;
- shared-state schema and write policy;
- conflict owner and method;
- success conditions;
- stop conditions;
- maximum rounds.

The v0.1 compiler packages this graph. Live Agents SDK dispatch and trace ingestion are phase 2.

## Taste Engine

A Taste Profile contains:

- artifact type and audience;
- production constraints and candidate policy;
- hard rejection gates;
- weighted dimensions with observable excellence and failure;
- reference exemplars and anti-exemplars with rationales;
- pairwise preferences and accepted judgment rationales;
- blind comparison policy;
- minimum independent judges;
- producer-judge separation;
- synthesis owner.

Production sequence:

```text
candidate hypotheses
  -> deterministic artifact gates
  -> blind pairwise comparison
  -> domain critic
  -> adversarial review
  -> separate synthesis
  -> acceptance tests
```

Not every artifact needs multiple candidates or multiple judges. The Task Envelope declares when taste is a required lane. If required judge evidence is absent, the package remains `experimental`.

## Proving Ground

Evidence lanes:

| Lane | Proves |
|---|---|
| Static | Schema, shape, required files, deterministic policy |
| Behavioral | The procedure or runtime performs the intended behavior |
| Factual | Claims are current, sourced, and correctly scoped |
| Artifact | Output opens, parses, renders, or executes natively |
| Taste | Domain quality clears hard gates and independent judgment |
| Security | Permissions, secrets, privacy, destructive behavior |
| Economic | Cost, latency, throughput, and budget |
| Drift | Registry, adapter, dependency, and deployment consistency |

Verdicts:

- `validated`: all declared required lanes passed;
- `experimental`: required proof is pending;
- `revise`: a required test failed;
- `rejected`: a critical security test failed.

Command tests use argv with `shell: false`, require `--execute-commands`, and must be explicitly allowed by the Task Envelope.

## Evolution

`/evolve` does not self-modify the system. It maps a real failed or pending test to the smallest responsible layer and emits `apply: false`.

| Lane | Default responsible layer |
|---|---|
| Static | Contract or compiler |
| Behavioral | Procedure or runtime |
| Factual | Evidence policy |
| Artifact | Renderer or packaging |
| Taste | Taste Profile |
| Security | Permission or guardrail |
| Economic | Routing or budget |
| Drift | Registry or adapter |

Durable memory is updated only after the revised package passes its required proof.

## Command surface

```text
/forge skill <brief>
/forge agent <brief>
/forge swarm <brief>
/forge vertical <brief>
/forge plugin <brief>

/prove <package-or-artifact>
/evolve <package-or-receipt>
```

Legacy `/agent-creator` and `/workflow-skill-creator` commands route to Foundry and remain deprecated compatibility aliases.

## Runtime commands

```bash
# Inspect contracts and examples
node tools/foundry/cli.mjs validate foundry/examples/research-brief.task-envelope.json

# Derive the live graph
node tools/foundry/cli.mjs graph --out /tmp/starlight-capability-graph.json

# Compile
node tools/foundry/cli.mjs forge \
  --envelope foundry/examples/research-brief.task-envelope.json \
  --pack foundry/examples/research-brief.skill-pack.json \
  --out /tmp/research-brief-forge

# Prove
node tools/foundry/cli.mjs prove /tmp/research-brief-forge

# Propose the smallest evolution
node tools/foundry/cli.mjs evolve \
  /tmp/research-brief-forge/evidence-receipt.json \
  --out /tmp/research-brief-forge/evolution.json
```

## “Superintelligence” as protocol

The `/superintelligence` posture should guarantee:

1. explicit unknowns and decision variables;
2. memory retrieval before generation when relevant;
3. current primary-source grounding for unstable claims;
4. independent hypotheses when ambiguity matters;
5. model and tool routing from demonstrated performance;
6. parallelism only for separable work;
7. builder, critic, and verifier separation when required;
8. executable or artifact-native proof;
9. visible uncertainty and unresolved assumptions;
10. ratified learning written back only after proof.

No phrase in a prompt can substitute for tools, permissions, evidence, tests, or feedback.

## v0.1 boundaries

Built now:

- typed contracts for envelopes, packs, taste, graph, manifests, and receipts;
- dependency-free compiler, resolver, prover, and evolution proposer;
- typed Queen envelope route;
- four portable Foundry skills;
- ChatGPT Work/Codex skills-only plugin;
- compatibility migration for legacy creators;
- conformance, integrity, traversal, taste-pending, graph, and parity tests.

Not claimed:

- deployed remote MCP service;
- published Workspace Agent;
- live Agents SDK swarm dispatch;
- cryptographically signed judge evidence;
- continuous autonomous self-advancement;
- npm release parity.

Those require separate deployment authority, credentials, runtime traces, and release governance.

## Phase 2

1. Add an authenticated remote MCP service for Foundry contracts, registries, receipts, and trace ingestion.
2. Compile Agent Packs into Agents SDK runtime definitions with guardrails, sessions, handoffs, and trace IDs.
3. Add signed or workspace-attributed human and model judge evidence.
4. Benchmark routing by task class, model, cost, latency, and outcome.
5. Promote plugin and skill versions only from longitudinal receipts.
6. Repair npm distribution drift after release review.

The next proof is not a larger agent catalog. It is one intent compiling into one portable, governed, proven capability that behaves coherently across ChatGPT and Codex.
