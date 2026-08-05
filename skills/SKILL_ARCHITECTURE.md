# Starlight Skill Architecture

> Skills are portable capabilities. Agents are persistent policy boundaries.

## Authoritative sources

No prose document owns the live skill count.

| Concern | Source of truth | Enforcement |
|---|---|---|
| Skill definitions | `skills/**/SKILL.md` and legacy `skills/<domain>/*.md` | `scripts/validate-agentskills.mjs` |
| Activation | `skills/skill-rules.json` | `test/v77-skill-rules.test.ts` |
| Ownership and lifecycle | `skills/SKILL_REGISTRY.md` | `test/v78-skill-registry.test.ts` |
| Public counts | `metrics/current.json` | `test/v80-platform-prompts.test.ts` plus metric checks |
| Foundry contracts | `foundry/contracts/*.schema.json` | `test/v92-foundry.test.ts` |
| ChatGPT/Codex distribution | `plugins/starlight-foundry/` | plugin validator plus parity test |

The registry headline and metrics ledger must be derived from these sources during every capability change.

## Canonical shape

New skills use the Agent Skills directory form:

```text
skills/<domain>/<skill-name>/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/       # optional
├── scripts/          # optional
└── assets/           # optional
```

`SKILL.md` frontmatter contains only:

```yaml
---
name: skill-name
description: What it does and concrete situations that should activate it.
---
```

The repository still supports legacy flat Markdown skills because existing routing paths depend on them. Flat files are compatibility inputs, not the preferred shape for new capabilities.

## Capability-first routing

Routing starts from a Task Envelope, not a character name:

1. State objective, deliverables, stakes, reversibility, autonomy, and permissions.
2. Resolve required, preferred, and forbidden capabilities against the generated graph.
3. Select the smallest execution shape.
4. Compile a portable package.
5. Prove declared evidence lanes.
6. Promote only from a receipt.

Lexical matching in `skill-rules.json` remains an activation surface. It is not sufficient evidence for an autonomous routing decision.

## Skill, agent, swarm, vertical, or plugin

| Shape | Use when | Reject when |
|---|---|---|
| Skill | One reusable outcome needs stable procedure and proof | Persistent identity is unnecessary |
| Agent | Stable decision rights, memory, tools, ownership, or ongoing triggers require a durable actor | A persona is the only justification |
| Swarm | Distinct roles need coordination, shared state, and termination | Work is sequential or not separable |
| Vertical | Domain constraints, audiences, taste, and evaluation recur across capabilities | It is a one-off workflow |
| Plugin | Validated skills and optional MCP connectivity need distribution | No capability has passed its required proof |

The default is a skill. Agent creation must pass the necessity gate in `foundry/contracts/agent-pack.schema.json`.

## Activation

`skill-rules.json` can activate by:

- explicit skill or command name;
- concrete keywords;
- detected intent;
- an agent default.

Activation loads guidance into the current actor. It does not create a new actor, grant tools, expand memory, or authorize external writes.

## Composition

- **Sequential:** one capability produces the next capability's input.
- **Nested:** a skill declares another skill as a dependency.
- **Parallel:** separable capabilities produce independent artifacts.
- **Judge:** a producer and evaluator remain distinct.
- **Handoff:** ownership transfers under an explicit condition.

Every multi-actor composition names its synthesizer, state-write policy, conflict owner, success conditions, stop conditions, and maximum rounds.

## Taste and proof

Qualitative intent becomes a Taste Profile containing:

- hard rejection gates;
- weighted dimensions;
- grounded exemplars and anti-exemplars;
- production constraints;
- blind comparison policy;
- independent judge count;
- stored winning rationale.

Taste never overrides failed factual, security, accessibility, or artifact checks. A producer cannot be the sole required judge.

Foundry evidence lanes are:

`static`, `behavioral`, `factual`, `artifact`, `taste`, `security`, `economic`, and `drift`.

Only declared required lanes block promotion, but every unrun check remains visible in the receipt.

## Creating or evolving capabilities

Use:

```text
/forge skill <brief>
/forge agent <brief>
/forge swarm <brief>
/forge vertical <brief>
/forge plugin <brief>
/prove <package-or-artifact>
/evolve <package-or-receipt>
```

`/forge` compiles. `/prove` evaluates. `/evolve` proposes a smallest-responsible-layer patch and never auto-applies it.

Legacy `/agent-creator` and `/workflow-skill-creator` commands are compatibility aliases. They route to `/forge agent` and `/forge skill`.

## Token and context discipline

Load only what the task requires:

| Level | Content |
|---|---|
| Metadata | Name, description, activation boundary |
| Core | Procedure, guardrails, completion |
| References | Domain detail needed for this task |
| Scripts/assets | Only when execution or artifact production requires them |

Progressive disclosure must not become partial instruction reading: once a skill is selected, read its complete `SKILL.md`.
