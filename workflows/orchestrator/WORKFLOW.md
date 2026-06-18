# Starlight Orchestrator Workflow

> Private Intelligence Office — the master routing layer that coordinates all 10 IS, manages sovereign context, and drives autonomous cross-system execution.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "/starlight" — system status and routing entry point
- "Run a full sovereign intelligence sweep"
- "Coordinate across [IS1] and [IS2]"
- "What's the state of my entire intelligence system?"
- "Enter /yolo mode" or "Drive autonomously across my repos"

## Input Schema

```yaml
inputs:
  - name: command
    type: string
    required: false
    description: "Named command to route (/starlight|/council|/navigate|/yolo|/synthesize|/transmit|/vault|/dispatch)."
  - name: cross_is_context
    type: object
    required: false
    description: "Multi-IS context for cross-system coordination — named IS inputs and their current states."
  - name: mode
    type: string
    required: true
    description: "One of: status-check | cross-is-coordinate | sovereign-sweep | yolo-session | council-convene | dispatch"
  - name: scope
    type: string
    required: false
    description: "Scope limiter for yolo mode — per yolo-scope.json phase-in rules. Required if mode=yolo-session."
  - name: synthesis_sources
    type: array
    required: false
    description: "Named IS or vault sources to synthesize from in multi-source intelligence mode."
```

## Workflow Steps

### Step 1 — System Status Load
**Agent:** starlight-orchestrator  
**Skill:** memory/ecosystem-sync  
**Action:** Load system health from all vaults — operational (current state), strategic (active decisions), technical (running processes). Check all 10 IS for pending tasks, blocked decisions, and vault debt. Map active harnesses and their current scopes. Build the unified system picture.  
**Output:** `system-status.json` — full 10-IS state snapshot, vault debt, active harnesses, pending decisions.

### Step 2 — Intent Classification and Routing
**Agent:** starlight-orchestrator  
**Skill:** intelligence/systems-thinking  
**Action:** Classify the incoming intent against the IS taxonomy. Route to the correct IS workflow if single-domain. If multi-domain: identify the cross-IS coordination pattern (sequential, parallel, cascade) and design the execution topology. Apply substrate-vs-operational tier decision before acting.  
**Output:** `routing-decision.md` — IS assignment, topology, substrate/operational tier classification.

### Step 3 — Council Convene (When Required)
**Agent:** starlight-prime  
**Skill:** intelligence/strategic-reasoning  
**Action:** If council-convene mode or if the decision is major/irreversible: convene the /council. Each of the 7 agents provides their perspective. Prime synthesizes into a unified recommendation. Apply the substrate governance gate check — if substrate-level, invoke /starlight-board before proceeding.  
**Output:** `council-verdict.md` — 7-perspective synthesis with Prime's unified recommendation and gate status.

### Step 4 — Cross-IS Coordination
**Agent:** starlight-orchestrator  
**Skill:** orchestration/parallel-execution  
**Action:** Execute the cross-IS coordination plan. For parallel: dispatch all IS tasks simultaneously and collect results. For cascade: IS-N output feeds IS-N+1 input. For sequential: execute in dependency order. Manage shared vault state to prevent write conflicts. Aggregate partial results as they arrive.  
**Output:** `coordination-results.json` — aggregated outputs from all involved IS workflows.

### Step 5 — Sovereign Synthesis
**Agent:** starlight-prime  
**Skill:** memory/knowledge-synthesis  
**Action:** Synthesize coordination results into a coherent sovereign intelligence picture. Resolve conflicts between IS outputs. Apply Prime's integration function — one voice, one direction, maximum signal, minimum noise. Produce the Sovereign Intelligence Brief.  
**Output:** `sovereign-brief.md` — synthesized cross-IS intelligence with unified direction and next actions.

### Step 6 — Vault Write + Transmission Broadcast
**Agent:** starlight-orchestrator  
**Skill:** memory/ecosystem-sync  
**Action:** Write sovereign brief to strategic-vault, coordination state to operational-vault, and cross-IS patterns to wisdom-vault. Broadcast transmission to all active IS channels. Update unified-context.md. If yolo mode was active: invoke /yolo-exit protocol — vault writes, session summary, drift detection.  
**Output:** Vault atoms x3, broadcast transmission, unified-context update, optional yolo-exit.

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-orchestrator-specialist (405B — cross-IS synthesis, council facilitation, sovereign intelligence, substrate governance)
- Support: hermes-orchestrator-executor (70B — status checks, routing decisions, vault writes, transmission dispatch)

## Output Artifacts

1. `system-status.json` — Full 10-IS state snapshot with vault debt and harness map
2. `routing-decision.md` — IS assignment, execution topology, tier classification
3. `council-verdict.md` — Seven-perspective synthesis with unified recommendation (when council convened)
4. `coordination-results.json` — Aggregated outputs from all involved IS workflows
5. `sovereign-brief.md` — Synthesized cross-IS intelligence with unified direction and next actions

## Vault Routing

Which vaults get written:
- **Strategic:** Cross-IS decisions, sovereign direction changes, council verdicts, governance gate outcomes
- **Technical:** Coordination patterns, routing matrices, system architecture changes, IS topology
- **Operational:** Current system state, active IS tasks, harness scopes, transmission log
- **Wisdom:** Cross-IS synthesis patterns, orchestration lessons, sovereignty principles
- **Horizon:** Long-arc cross-IS intentions, AGI alignment observations, 10-year system trajectory

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/starlight` | "starlight", "system status", "what's running" | Main entry point — system status, active IS states, vault health, pending decisions |
| `/council` | "convene the council", "major decision", "I need all perspectives" | Convene all 7 agents for major decisions — 7-perspective synthesis with Prime verdict |
| `/yolo` | "yolo mode", "drive autonomously", "aggressive execution" | Enter /yolo Hive session — Claude-led cross-repo conductor with parallel council scan. Phase-in locked per yolo-scope.json. |
| `/synthesize` | "synthesize across", "combine intelligence from", "unified view" | Multi-source intelligence synthesis — pulls from named IS vaults and produces sovereign brief |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
