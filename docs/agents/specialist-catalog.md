# Find the specialist, then choose the name

A newcomer should recognize the work an agent owns before learning its personality. The operational catalog therefore presents a descriptive role, one purpose, an input, an expected artifact, and specific acceptance checks. A creative name can appear alongside the role. It never changes the agent's identity, tools, memory access, cost, or decision rights.

This is an operational projection of the profiles in `agents/`. It does not rename a profile, remove a registered agent, change SIP, or replace the Foundry ontology. The public product fleet can have a different membership; derive its count from that fleet's own source.

## Identity and sources

| Field | Meaning |
| --- | --- |
| `id` | Existing runtime router key: profile filename stem. |
| `profileName` | Original frontmatter name; this differs from the filename for many profiles. |
| `ontologyId` | Existing `agent:sis/...` Foundry identity, using its original normalization. |
| `name` | Descriptive specialist label, the default display. |
| `aliases` | Preserved names; optional presentation and unambiguous lookup. |
| `slug` | Descriptive export directory name; never a replacement identity. |

The original profiles and `foundry/agent-ontology/agent-ontology.mjs` remain sources for their existing consumers. `agents/catalog/identity-overrides.json` contains the reviewed operational proposals for role, purpose, outcome, acceptance, and personality. The generated cards label those as curated proposals and distinguish them from source-declared identities and local skill definitions. A profile definition is not observed runtime capability.

The generator reuses the Foundry frontmatter parser. It derives every source profile, resolves actual skill definitions from the mixed legacy/directory layout, preserves unresolved declarations as findings, and pins source content with SHA-256. Capability prose never becomes a skill ID. A deterministic digest covers the generator, identity proposals, contracts, voice, profiles, referenced skills, and existing loop implementation. Generated Markdown belongs outside `agents/`; catalog metadata lives in JSON so it cannot inflate the profile count.

```bash
node scripts/build-specialist-catalog.mjs
node scripts/build-specialist-catalog.mjs --check
node --test test/specialist-catalog.test.mjs
node --import tsx --test test/specialist-agent-loader.test.ts
```

`src/agents.ts` uses fresh generated cards for descriptive labels and local skill keys. Lookup preserves filename IDs and also accepts an unambiguous original profile name or alias. Explicit custom agent lists still work. Missing or stale catalog data falls back to source discovery; only profiles with required frontmatter are admitted. Regenerate the catalog after changing an input to retain specialist labels.

## One discovery graph, existing execution loops

`agents/catalog/constellation.json` projects agent and skill nodes with typed relationships: local skill use, possible routing, and required independent review. Each node keeps source references. These edges describe discovery and policy. They do not grant permissions, share private memory, schedule work, or imply a running integration.

Functional swarm templates define a lead, selected contributors, a different verifier, and an expected result. Launch only the specialists a task needs. Japanese or other creative names can be optional instance aliases while the functional role and membership remain visible. Existing authored worlds and canon remain in their own brand scope; this catalog introduces no new canon.

Reuse `src/loop-graph.ts`, `src/loop-engine.ts`, and `src/work-graph.ts`. The existing `si-admit-verify-ship` file is the work-graph lifecycle blueprint; its documentary nodes do not satisfy the executable loop type. One shared `agents/catalog/specialist-review-loop.json` supplies executable admission → make → deterministic checks → independent review, with no side-effect actions allowed by default. Its `converge` shape lets `evaluateLoopGraph` enforce the two-round no-progress stop when the host submits current round counts before another attempt. The host drives repetition; there are no graph cycles. There is no graph per agent and no additional orchestrator. The operational prompt contract adds bounded attempts, checkpointed recovery, maker/checker separation, and a durable artifact receipt. Graph cost units are admission weights, separate from actual currency accounting enforced by the host.

The Foundry task envelope stays unchanged. `agents/catalog/run-envelope.schema.json` is a separate host wrapper for tenant/project/run/instance IDs, goal ancestry, an atomic work lease, selected runtime, and independent verifier; its `task` property references the canonical Foundry schema. The schema validates shape. The host must authenticate identities, enforce lease ownership/expiry, authorize tools, isolate tenants, count actual currency/token usage, and verify receipts. The zero default spend ceiling requires a task budget before paid calls.

## Export instructions

Preview one composed specialist prompt, or write an inspectable package:

```bash
node scripts/export-specialist.mjs starlight-navigator --print
node scripts/export-specialist.mjs starlight-navigator --alias Hikari --out /tmp/starlight-specialists
node scripts/export-specialist.mjs starlight-adapter-crewai --target eve-instructions --out /tmp/starlight-eve
```

Each package contains the specialist prompt, original profile, pinned voice, local skill definitions, `SKILLS.md`, agent card, contracts, envelope schemas, and a hash manifest. Supporting references, scripts, assets, and the original profile's repository links remain dependencies of the source checkout; the manifest lists their resource bases. These are definitions, not self-contained installed skill mounts. Exports refuse different-content overwrites and refuse destinations inside `agents/`. The prompt names the role first; an alias remains presentation data. A generated package contains no automatic tool grants.

The portable target emits `AGENTS.md` instructions. A host still needs native configuration, version-pinned bindings, credentials, budget enforcement, and a recorded evaluation. The Eve target emits `agent/subagents/<descriptive-slug>/instructions.md` and supporting files only. An authorized runtime implementer must add `agent.ts` with `defineAgent`, a required descriptive `description`, an explicit model, and the actual tools/skills. Authored child configurations require their own slots. Channels, schedules, and instrumentation stay on the root agent. Eve requires Node 24+.

Track `generated`, `typechecked`, `smoke-tested`, `evaluated`, and `deployed` separately. This exporter proves generation; it does not prove Eve execution or compatibility with every harness. Framework specialists such as Paperclip, CrewAI, LangGraph, and AutoGen produce mapping and review artifacts until native binding evidence exists. Preserve the AutoGen adapter identity for existing users while assessing migration to Microsoft Agent Framework rather than promoting the archived project as the default.

The shared voice is pinned to `frankxai/starlight-design-intelligence@3d6fc8fdd38b5db69a16db1078e30d454e891af1` (`PROPOSAL_PREVIEW`). Personality remains warm, curious, and exact about what happened. The useful introduction is “I review your deployment and recovery plan.” The optional name comes after the work.

Built on SIP — operational composition of existing agent profiles, file contracts, and skill references. This label is not a signed execution receipt.
