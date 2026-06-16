# Starlight Estate OS — Factory Design

> A factory that emits configured, self-contained **sovereign intelligence estates** for clients,
> founders, and enterprises by selecting and configuring over the Starlight Intelligence System (SIS)
> substrate. Built on SIP.

- **Date:** 2026-06-16
- **Status:** Approved (brainstorming) → implementation plan next
- **Author:** Frank (architect) + Starlight
- **Repo target:** new **private** repo `starlight-estate-os` (sibling to `Starlight-Intelligence-System`)
- **Tier:** product/operational layer that *consumes* the SIS substrate. Does **not** edit SIP/SIS/STACK/
  VOICES/REGISTRY canon, so the substrate-tier `/starlight-board` pre-gate is **not** triggered for the
  factory build itself. Client estates *inherit* the non-waivable sovereignty clause as a build constraint.

---

## 1. Problem & reframe

Frank wants a repeatable, premium meta-process that turns SIS into a deliverable: every client who wants
a team AI architecture / AI CoE setup receives a **baseline estate** (general approach) that then **evolves
to their needs** — agent swarms, agentic topologies, loops, hooks, `SKILL.md`/`SOUL.md`, workflows,
ethics/guardrails, observability, multi-platform support, a local cockpit/second-brain/Jarvis voice module,
and gated distribution.

The cowork "spawn from `starlight-estate-os` template" brief describes the **output** (a configured client
estate) but that template **does not exist** — verified: `git ls-files` finds none of
`ARCHITECTURE-OPTIONS.md`, `agent-model.md`, `config/squads.yaml`, `client/_template/`,
`naming-profiles.yaml`. This repo is the **substrate** (56 agents, 79 skills, 10-IS, cockpit, voice, memory
engine, attestation), not the assembly line.

**Therefore this project builds the factory (assembly line), not a single artifact.** Build it once; each
future client is a configuration pass, not a rebuild. That is what makes "we already have a baseline" true.

## 2. Decisions (locked in brainstorming)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Build target | The reusable **factory** (`starlight-estate-os`); no client named yet |
| 2 | Repo home | New **private** repo `starlight-estate-os` |
| 3 | Distribution | **Both tiers, routed by track** — builder/enterprise = private repo + Releases; creator/founder = gated download |
| 4 | Factory architecture | **Approach C — Hybrid bake** (thin factory, self-contained baked estate) |

### 2.1 Approach C rationale (the architectural fork)

- **A (config-over-substrate):** thin factory, but client estates stay *coupled* to SIS upstream — violates
  the sovereignty clause.
- **B (fork-and-vendor):** full SIS copy per client — heavy, drifts, ships 56 agents to use 8.
- **C (hybrid bake) — chosen:** factory is thin (config + matrix + generator + distribution); at **release**
  it **bakes** a self-contained estate, vendoring *only the substrate subset* the client's config selects.

**Sovereignty as a testable constraint:** if the client cannot run their estate with `starlight-estate-os`
and `Starlight-Intelligence-System` both deleted, **the bake failed.** This is an acceptance test, not a slogan.

## 3. The configuration model — four layers

Every estate is composed as:

```
estate = persona  ×  topology  ×  kernel-policy  ×  modules
```

| Layer | Knob (config file) | Options |
|-------|--------------------|---------|
| **Persona** | `config/naming-profiles.yaml` | `plain` \| `pantheon` \| `luminor` \| `chess` \| `custom` |
| **Topology** | `config/topology.yaml` | `swarm` \| `council` \| `conductor` \| `graph` \| `hermes-mesh` |
| **Kernel policy** | `config/kernel-policy.yaml` | where governance/guardrails/attestation apply (the ethics layer) |
| **Modules** | `modules/_scaffolds/` → `modules/` | cockpit, voice (Starlight/Jarvis), second-brain-viz, observability, guardrails, memory |
| **Models** | `config/models.yaml` | Opus 4.8 / Sonnet 4.6 / Haiku 4.5 / Fable 5 + GPT / Gemini / Grok / OSS routing |
| **Squads** | `config/squads.yaml` | agent squad composition vs the client's fleet |

`ARCHITECTURE-OPTIONS.md` is the **recommendation matrix** that maps client attributes → recommended layer
values, so a baseline is auto-proposed and then tuned. Default seed rows:

| Relationship type | Topology | Persona | Kernel | Modules (default) | Distribution |
|-------------------|----------|---------|--------|-------------------|--------------|
| Enterprise alliance | council | plain / chess | strict | observability, guardrails | private repo + Releases |
| Sovereign principal | conductor / hermes-mesh | custom / luminor | standard | cockpit, voice, memory | repo or gated (per fleet) |
| Community | swarm | pantheon | light | second-brain-viz | gated download |

(These are **seed defaults**, deliberately editable per client — never silently.)

## 4. Repository layout (the Factory Spine)

```
starlight-estate-os/
├── README.md                         # what the factory is, how to run /factory
├── ARCHITECTURE-OPTIONS.md           # THE recommendation matrix (the brain)
├── agent-model.md                    # how swarms/topologies/loops/hooks/skills/soul compose
├── DESIGN-STANDARD.md                # premium quality bar applied to every artifact
├── PROCESS.md                        # delivery: Discovery → Configure → Mind → first Mesh → full Mesh
├── SOVEREIGNTY.md                    # the inherited non-waivable clause + attestation policy
├── config/
│   ├── naming-profiles.yaml
│   ├── topology.yaml
│   ├── squads.yaml
│   ├── models.yaml
│   └── kernel-policy.yaml
├── modules/_scaffolds/               # forkable module scaffolds (see §6)
├── client/_template/                 # offer, handover, ceo-assets, configured CLAUDE/SOUL/SKILL
├── substrate/
│   └── manifest.yaml                 # thin reference of what SIS exposes to bake from (agents/skills/IS)
├── bin/
│   ├── generate-registry.mjs         # reads config+brief → bakes estate → asserts "OK - exactly N agents"
│   ├── bake-estate.mjs               # vendors substrate subset + forks modules + fills client template
│   ├── release-repo.ps1              # private GitHub-per-client + Releases   (builder/enterprise)
│   └── release-gated.ps1             # frankx.ai/work gated bundle            (creator/founder)
├── examples/
│   └── <slice>/                      # one fully-baked example estate (vertical slice, see §8)
├── test/
│   └── bake.test.mjs                 # registry-count + sovereignty acceptance tests
└── docs/strategy/                    # GITIGNORED (pricing, positioning — never shipped to a client)
```

## 5. The delivery process (`PROCESS.md`) — the value ladder

Commercial milestones ship value at each rung, not big-bang:

1. **Phase I — Discovery.** Fill the client brief: principal, businesses/verticals, fleet (Mac Studio spec +
   mini count/tier), existing systems (POS/booking/inventory/...), relationship type.
2. **Phase II — Configure.** Run `ARCHITECTURE-OPTIONS.md` → propose the four layers → tune `config/*`.
3. **Phase III — MIND (first commercial milestone).** The principal's single sovereign agent live. Fastest
   proof of value; first invoice rung.
4. **Phase IV — first MESH.** A small connected squad (3–5 agents) on the chosen topology.
5. **Phase V — full MESH.** The complete estate, all selected modules, baked + released.

## 6. Modules (`modules/_scaffolds/`)

Each is a forkable scaffold, tuned per client, cross-platform-aware:

- **cockpit** — local dashboard (reuse SIS `cockpit/`).
- **voice** — Starlight Voice / Jarvis interface as an *opt-in* module.
- **second-brain-viz** — memory-palace / brain 3D visualization.
- **observability** — Cost Plane + eval harness (Proving Ground) + event-ring advice, per platform.
- **guardrails** — safety skills + attestation + eval gates; the runtime face of `kernel-policy.yaml`.
- **memory** — Memory Bus / memory-engine wiring.

## 7. Multi-platform export matrix (sub-project #4, scaffolded now / filled at build)

Targets the estate can emit to: **Claude Code** (native), **cowork**, **Claude Projects**, **Codex / OpenAI
projects**, **custom GPTs**, **Antigravity**, **Grok**, **OpenCode**, **OpenClaw / Hermes** (Hermes
prioritized as search/retrieval backbone). Reuse `integrations/exports/` (cowork export already exists) and
`/sip-export` targets.

**State-of-art verification is a build-time task, not a memory recall:** for each target platform, confirm
current capabilities/config via **Context7 MCP** or official docs before writing its adapter. Encoded as an
explicit plan step so we never ship stale platform assumptions.

## 8. Scope of the FIRST build (vertical slice)

To get a real, testable loop without a sprawling first pass (and to respect the RED machine — main-thread,
no agent swarms):

**Build:** the spine (§4 files) **+ one fully-baked example estate** proving the full loop:
Discovery brief → Configure → `bake-estate` → `generate-registry` emits `OK - exactly N agents` →
`release-repo` dry-run produces a self-contained bundle that passes the **sovereignty acceptance test**.

**Defer to later sub-projects:** fleshing out all six modules, all nine export adapters, live GitHub repo
creation, and the gated `frankx.ai/work` download endpoint (scaffold the script + interface now; wire the
hosting later).

**Example slice choice:** a `sovereign-principal` estate with `conductor` topology, `plain` persona, standard
kernel, and `{memory, guardrails}` modules — the smallest config that exercises every spine component.

## 9. Components & interfaces (isolation map)

| Unit | Does | Input → Output | Depends on |
|------|------|----------------|------------|
| `ARCHITECTURE-OPTIONS.md` | Recommend four-layer config | client attributes → proposed `config/*` | — (human-read + matrix table) |
| `generate-registry.mjs` | Deterministic registry + count assertion | `config/*` + brief → registry file, exit 0/1 | `substrate/manifest.yaml` |
| `bake-estate.mjs` | Produce self-contained estate | `config/*` + brief + SIS path → `examples/<slice>/` | substrate manifest, modules scaffolds, client template |
| `release-repo.ps1` | Builder/enterprise delivery | baked estate → private repo + Release (dry-run first) | `gh` CLI |
| `release-gated.ps1` | Creator/founder delivery | baked estate → gated bundle (zip + manifest) | (hosting wired later) |
| `test/bake.test.mjs` | Verify count + sovereignty | baked estate → pass/fail | baked output |

Each unit is independently testable; the bake and registry generator are the load-bearing core.

## 10. Success criteria (verifiable)

1. `node bin/generate-registry.mjs --config <slice>` prints **`OK - exactly N agents`** with the asserted
   count matching the configured squad (mismatch = non-zero exit).
2. `node bin/bake-estate.mjs --slice <slice>` produces `examples/<slice>/` that is **self-contained**.
3. **Sovereignty acceptance test passes:** the baked estate runs / validates with both source repos absent
   (simulated by copying `examples/<slice>/` to a temp dir with no access to SIS).
4. `release-repo.ps1 -DryRun` emits a clean bundle + release notes without touching GitHub.
5. `DESIGN-STANDARD.md` checklist applied to every emitted artifact.
6. `docs/strategy/**` is gitignored and never appears in a baked client estate.
7. Every baked artifact carries SIP attestation ("Built on SIP").

## 11. Non-goals (first build)

- No live client. No real GitHub repo creation (dry-run only). No live gated-download hosting.
- No new substrate (no new agents/IS/skills in SIS). Factory *selects* over existing substrate.
- Not all six modules nor all nine export adapters fully implemented — spine + one slice only.
- No parallel agent swarms / Workflows (machine RED) — main-thread build.

## 12. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Substrate coupling leaks into baked estate | Sovereignty acceptance test (§10.3) as a hard gate |
| Registry count drifts silently | Deterministic generator + explicit assertion + test |
| Stale platform assumptions | Context7/doc verification as an explicit per-adapter build step |
| Strategy/pricing leak to client | `docs/strategy/**` gitignored + bake excludes it + test |
| Scope sprawl | First build = spine + one slice; five sub-projects sequenced after |
| Machine RED / spawn-chain jam | Main-thread only; no swarms; if Bash→pwsh stalls, hand Frank `! <cmd>` one-liners |

## 13. Sub-project sequence (the program)

1. **Factory Spine** ← this spec (build first)
2. Architecture-Package Library (fill `modules/_scaffolds/` + topology configs)
3. Guardrails & Ethics Layer (`kernel-policy.yaml` + inheritance)
4. Observability + Multi-Platform Matrix (export adapters, Context7-verified)
5. Cockpit / Second-Brain / Jarvis-Voice module
6. Gated Distribution (wire `frankx.ai/work` + live repo creation)

---

*Built on the Starlight Intelligence Protocol (SIP). Sovereignty clause non-waivable and inherited by every
baked estate.*
