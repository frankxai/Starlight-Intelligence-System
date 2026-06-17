# SIS Hermes Claw

> Orchestrate the Hermes agent swarm across all 10 IS domains. Decompose any task into IS-scoped work packets, route to specialist Hermes profiles, aggregate synthesis, and hand off to Memory Claw for vault writes.

---

## Contract

```yaml
name: sis-hermes-claw
version: 0.1.0
purpose: Orchestrate the Hermes agent swarm across all 10 IS domains. Decomposes tasks, routes to IS specialists, aggregates results, and hands off to Memory Claw.
phase: 1

permissions:
  filesystem: read
  sis_vaults: read           # Memory Claw handles all writes
  shell: none
  network: outbound-agent-endpoints  # localhost:808X ports only

inputs:
  - task (string: natural language task or command)
  - is_scope (array: which IS domains to engage, default: auto-detect)
  - swarm_mode (enum: single-is | cross-is | portfolio-sweep, default: auto)
  - concurrency (int: max parallel agents, default: 4)

outputs:
  - /swarm-results/SESSION_ID/synthesis.md
  - /swarm-results/SESSION_ID/per-agent-results.jsonl
  - Memory Claw handoff packet

commands:
  - /hermes-swarm
  - /hermes-route
  - /hermes-status
  - /hermes-harvest
  - /hermes-boot

skills:
  requires:
    - safety/permission-gate
    - safety/sentinel-mcp
  activates:
    - orchestration/multi-agent-coordination
    - orchestration/parallel-execution
    - orchestration/workflow-design
    - orchestration/hermes-swarm
    - intelligence/hermes-search
    - memory/knowledge-synthesis

mcp:
  required:
    - filesystem-mcp
    - sis-memory-mcp
  optional:
    - github-mcp
    - web-search-mcp

agents:
  primary: starlight-hermes
  supporting:
    - starlight-orchestrator
    - starlight-prime
    - starlight-sentinel

safety:
  mutation_default: false
  vault_writes: delegated_to_memory_claw
  requires_sentinel: true
```

---

## Identity

Hermes Claw is the swarm coordination surface for the Starlight Intelligence System. Named for the messenger god and built on the Nous Hermes retrieval backbone, it routes work to the right IS specialist, runs agents in parallel (up to `concurrency` limit), collects results, and synthesizes before handing off. It never writes to vaults directly — that contract belongs to Memory Claw.

---

## Capabilities

| Capability | What it does |
|-----------|-------------|
| **IS Detection** | Infers which Intelligence Systems a task touches using keyword + intent analysis |
| **Specialist Routing** | Maps each IS to its Hermes agent profile (`agents/AGENT_REGISTRY.md`) |
| **Parallel Dispatch** | Launches up to N agents concurrently; respects `concurrency` cap |
| **Result Collection** | Polls agent endpoints, times out at 120s per agent, marks failures |
| **Swarm Synthesis** | Merges per-agent outputs using the Synthesis Protocol |
| **Memory Handoff** | Packages synthesis + provenance into a Memory Claw handoff packet |
| **Sentinel Gate** | Routes synthesis through Sentinel Claw before vault write |

---

## Routing Logic — IS Specialist Selection

Each IS domain maps to a dedicated Hermes profile. Routing uses keyword matching first; if ambiguous, Prime is consulted for domain classification.

| IS Domain | Hermes Profile | Triggers |
|-----------|---------------|---------|
| Self IS | `starlight-hermes-self` | identity, beliefs, habits, personal growth, psychology |
| Wealth IS | `starlight-hermes-wealth` | money, assets, investments, financial, wealth, DPI |
| Family IS | `starlight-hermes-family` | family, relationships, home, parenting, legacy |
| Business IS | `starlight-hermes-business` | business, revenue, entity, clients, operations |
| Creator IS | `starlight-hermes-creator` | content, audience, publishing, brand, creative pipeline |
| Second Brain IS | `starlight-hermes-secondbrain` | memory, knowledge, PKM, notes, capture, vault |
| Code IS | `starlight-hermes-code` | code, repo, architecture, systems, technical |
| Voice & Video IS | `starlight-hermes-voicevideo` | music, sound, video, recording, production, persona |
| Brand IS | `starlight-hermes-brand` | brand, design, visual identity, positioning |
| Starlight Orchestrator | `starlight-hermes` (primary) | meta, cross-IS, orchestration, synthesis, routing |

**Ambiguous task fallback:** If confidence < 0.7 across all domains, route to Starlight Orchestrator profile and note ambiguity in synthesis.

---

## Swarm Topology

```
┌─────────────────────────────────────────────┐
│               HERMES CLAW                   │
│  task → IS detection → specialist routing   │
└──────────────┬──────────────────────────────┘
               │  dispatches (≤ concurrency)
    ┌──────────┼──────────────────┐
    ▼          ▼                  ▼
[IS-A Agent] [IS-B Agent]  [IS-C Agent]
    │          │                  │
    └──────────┴──────────────────┘
               │  per-agent-results.jsonl
               ▼
         [Synthesis]
               │
    ┌──────────┴──────────┐
    ▼                     ▼
[Memory Claw]      [Sentinel Claw]
(vault writes)     (quality gate)
```

---

## Operating Modes

### `single-is`
One IS domain. Routes to one specialist. Returns focused result. Fastest path.

```
/hermes-route --task "review my brand positioning" --is brand
```

### `cross-is`
Two or more IS domains detected or specified. Runs specialist agents in parallel. Synthesis merges perspectives.

```
/hermes-swarm --task "should I productize my creative knowledge?" --is creator,business,secondbrain
```

### `portfolio-sweep`
All 10 IS domains engaged. Used for `/hermes-status`, system-wide audits, and `/starlight-board` pre-meeting scans. Runs with `concurrency: 4` in rolling batches.

```
/hermes-swarm --task "full portfolio health check" --mode portfolio-sweep
```

---

## Commands

| Command | Usage | What it does |
|---------|-------|-------------|
| `/hermes-swarm` | `--task <str> [--is <domains>] [--mode <mode>]` | Launch swarm for any task; auto-detects mode if not specified |
| `/hermes-route` | `--task <str> --is <domain>` | Route to a single IS specialist |
| `/hermes-status` | `[--domain <name>]` | Check status of all agents in registry; optional domain filter |
| `/hermes-harvest` | `[--session <id>]` | Collect and synthesize pending swarm results |
| `/hermes-boot` | `--profiles <list>` | Start specific IS Hermes profiles (idempotent) |

---

## Integration Points

| Claw | Relationship |
|------|-------------|
| **Memory Claw** | Receives handoff packet after synthesis; executes all vault writes |
| **Sentinel Claw** | Quality gate on synthesis output before Memory Claw handoff |
| **Workflow Claw** | May be invoked by Workflow Claw for swarm execution steps |
| **Genius Claw** | Hermes Claw provides retrieval backbone for genius excavation runs |
| **Architect Claw** | Requests portfolio-sweep mode for system design decisions |
| **OpenClaw Registry** | Hermes Claw registers its agent fleet here; status queryable externally |

---

## Quality Gates

1. **IS confidence check** — abort if no domain reaches 0.5 confidence; surface ambiguity to user.
2. **Concurrency cap** — never exceed `concurrency` (default 4) parallel agents.
3. **Timeout enforcement** — 120s per agent; failed agents marked, not silently dropped.
4. **Synthesis completeness** — synthesis must reference every agent result; partial synthesis flagged.
5. **Sentinel sign-off** — Sentinel Claw must pass synthesis before Memory Claw handoff executes.
6. **No direct vault writes** — any code path that bypasses Memory Claw is a contract violation.

---

## Security Model

- Network access restricted to `localhost:808X` agent endpoints; no outbound internet from Hermes Claw itself.
- Source material read-only; swarm results written to `/swarm-results/SESSION_ID/` only.
- Per-agent result files contain no vault secrets; they carry synthesized output only.
- `private-public-split` runs on synthesis before any external export.
- Sentinel Claw veto is binding; Hermes Claw may not bypass it.

---

*Built on SIP · sis-hermes-claw v0.1.0 · MIT*
