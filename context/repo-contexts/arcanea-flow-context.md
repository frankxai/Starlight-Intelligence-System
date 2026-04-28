# Arcanea-Flow Context — Swarm Orchestration Sibling

> *Starlight's understanding of arcanea-flow*

**Repository:** `C:\Users\frank\arcanea-flow\` (local sibling)
**Lineage:** ruv-FANN / claude-flow / agentic-flow
**Last Updated:** 2026-04-29
**Architectural Decision:** Connect-not-absorb (memory: `project_arcanea_flow_connect_not_absorb.md`)

---

## What arcanea-flow Is

Swarm orchestration and execution layer. Evolved from the ruv-FANN / claude-flow / agentic-flow stack. Provides hive-mind coordination, hooks-driven sync, neural training, and ReasoningBank adaptive learning.

**Core philosophy:** Execution-layer churn. Ships fast. Optimizes for swarm agent throughput.

---

## What SIS Uses from arcanea-flow

| Capability | arcanea-flow provides | SIS consumes via |
|---|---|---|
| Swarm topologies | Hierarchical / mesh / blackboard patterns | Memory Bus reads |
| Hooks system | Pre-task / post-edit / post-task lifecycle hooks | Channel notifications |
| ReasoningBank | Adaptive learning loop with AgentDB HNSW | Vector tier writes |
| SPARC methodology | Specification → Pseudocode → Architecture → Refinement → Completion | Pattern reference |
| Neural training | RL pieces, neural net training in distributed sandboxes | Outputs into Memory Bus |
| Hive-mind | Queen-led multi-agent coordination | Blackboard summaries |

---

## What SIS Provides to arcanea-flow

1. **Memory Bus** — singleton daemon arcanea-flow writes ReasoningBank deltas into
2. **Substrate canon** — SIP, voices, attestation, sovereignty rules arcanea-flow attests against
3. **Vault read access** — under explicit grants, for cross-repo reasoning context
4. **Attestation infrastructure** — `memory.attest` MCP tool returns "Built on SIP" block

---

## Integration Points

- **Channel:** `transmissions/channels/arcanea-flow-channel.md`
- **Bus contract:** `transmissions/channels/memory-bus.md`
- **Memory namespace:** `arcanea-flow.*` prefix
- **Attestation:** Required for substrate-affecting writes
- **Audit cadence:** `/openclaw-audit` recommended quarterly

---

## What SIS does NOT do

- ❌ Import arcanea-flow code
- ❌ Copy skill content into `skills/`
- ❌ Treat arcanea-flow as an operational subdirectory
- ❌ Vendor arcanea-flow's swarm internals
- ❌ Run arcanea-flow CI in SIS pipelines

---

## Folder structure (top-level scan, 2026-04-29)

```
arcanea-flow/
├── CHANGELOG.md
├── CLAUDE.md
├── LICENSE
├── README.md
├── agents/
├── docs/
├── package.json
├── plugin/
├── scripts/
├── tests/
├── tsconfig.json
├── v2/
└── v3/
```

v3/ likely the active line per `v3-*` skill series referenced in skill registry.

---

## Pending integration deliverables (Phase 0)

1. Memory Bus daemon implementation (this is the joint)
2. Grant matrix for cross-namespace reads (which `frank.*` namespaces can arcanea-flow consume)
3. Attestation hook in arcanea-flow's write path (must call `memory.attest` before substrate-affecting writes)
4. Channel log discipline (every meaningful exchange logged here)
5. `/openclaw-audit` quarterly cadence on arcanea-flow license + dependency posture

---

**Built on SIP** · v1.1.0 · Arcanea-Flow Context · 2026-04-29
