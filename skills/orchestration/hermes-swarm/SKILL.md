---
name: orchestration/hermes-swarm
description: Use when dispatching the Hermes agent swarm for any multi-IS or complex task — routes to IS-specialist Hermes profiles, coordinates parallel execution, aggregates synthesis, and writes results to vaults. Default skill for Starlight Hermes, Starlight Orchestrator, and Hermes Claw.
type: orchestration
---

# Hermes Swarm Orchestration

> *"Route to every mind that needs to know. Synthesize before you speak."*

## When This Skill Activates

- Task spans multiple Intelligence Systems ("across all IS", "portfolio sweep", "full system view")
- User invokes `/hermes-swarm`, `/hermes-route`, `/hermes-harvest`, or `/hermes-status`
- Keywords: "swarm", "hermes swarm", "dispatch swarm", "cross-IS", "portfolio sweep", "all intelligence systems"
- Active agent is `starlight-hermes` or `starlight-orchestrator`
- Hermes Claw or Workflow Claw requests swarm execution for a task step
- Any task that Orchestrator cannot route to a single agent without loss of coverage

## What This Skill Does

Manages the full lifecycle of a Hermes swarm execution: IS domain detection, specialist profile selection, parallel agent dispatch, result collection, synthesis, and Memory Claw handoff. Ensures no IS domain is silently skipped, no agent failure is swallowed, and no output reaches vaults without Sentinel sign-off.

---

## Procedures

### Procedure 1: IS Domain Detection

1. Receive task string and optional `is_scope` array
2. Run keyword + intent scan against IS domain map (10 domains)
3. Score each domain: confidence 0.0 – 1.0
4. Flag domains above 0.5 as engaged; below 0.5 as background
5. If no domain above 0.5: surface ambiguity, request clarification before proceeding
6. If `is_scope` explicitly provided: use it directly, skip scoring

### Procedure 2: Specialist Profile Selection

1. Map each engaged domain to its Hermes specialist profile (see Routing Logic in Hermes Claw)
2. Verify each profile exists in `agents/AGENT_REGISTRY.md`
3. For missing profiles: route to `starlight-hermes` (primary) with IS context appended
4. Determine swarm mode: `single-is` (1 domain), `cross-is` (2-9), `portfolio-sweep` (all 10)
5. Confirm specialist list and mode before dispatch

### Procedure 3: Swarm Launch

1. Apply concurrency cap (default 4; read from Hermes Claw contract)
2. Batch specialists into parallel groups respecting concurrency cap
3. Dispatch each group; pass task + IS context to each agent
4. Start 120s timeout clock per agent
5. For `portfolio-sweep`: roll through batches sequentially; each batch parallel within itself
6. Log dispatch events to run context (session ID, agent, timestamp, IS domain)

### Procedure 4: Result Collection

1. Poll agent endpoints for completion (or await callback)
2. On timeout: mark agent as `timed-out`, record partial output if available
3. On error: mark agent as `failed`, record error message
4. On success: collect full output, tag with agent ID, IS domain, confidence score
5. Assemble per-agent results into `per-agent-results.jsonl`
6. Report collection summary: N succeeded, M timed-out, K failed

### Procedure 5: Synthesis

1. Load all successful agent outputs
2. Apply Synthesis Protocol (see `core/SYNTHESIS_PROTOCOL.md`):
   - Merge overlapping claims (prefer higher-confidence agent)
   - Flag contradictions between agents for explicit resolution
   - Surface unique contributions from each IS perspective
3. Write `synthesis.md` with: summary, per-IS findings, contradictions, recommended actions
4. Cite each agent contribution by IS domain and agent ID
5. Mark synthesis confidence: `high` (all agents succeeded) | `partial` (some failures) | `degraded` (>50% failures)

### Procedure 6: Vault Handoff

1. Route synthesis through Sentinel Claw for quality gate
2. On Sentinel pass: package synthesis + per-agent results into Memory Claw handoff packet
3. Packet includes: session_id, task, swarm_mode, IS domains engaged, synthesis.md path, vault targets
4. Pass packet to Memory Claw; do not write vaults directly
5. Confirm vault write receipts; log to session context
6. If Sentinel veto: surface veto reason to user, hold packet, await resolution

---

## Integration Points

- **Hermes Claw** — primary caller and contract owner; this skill implements its swarm execution logic
- **Workflow Claw** — may invoke this skill for `execution: swarm` steps within a workflow
- **Memory Claw** — receives vault handoff packet at end of Procedure 6
- **Sentinel Claw** — quality gate between synthesis and vault write (Procedure 6, step 1)
- **Multi-Agent Coordination skill** — parent orchestration pattern; hermes-swarm is the IS-specialized variant
- **Parallel Execution skill** — governs the concurrency model used in Procedure 3

---

## Quality Criteria

- Were all IS domains with confidence > 0.5 engaged? (no silent skips)
- Did every agent receive IS-scoped context, not the raw task alone?
- Were timed-out and failed agents explicitly marked, not silently dropped?
- Does synthesis reference every agent result (even failed ones)?
- Did Sentinel Claw pass before Memory Claw handoff executed?
- Is synthesis confidence level accurately reported?
