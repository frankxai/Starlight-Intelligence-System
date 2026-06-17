# Hermes Swarm — Genius Profile

> The distributed intelligence backbone of the Starlight Intelligence System.

---

## Signal (what this swarm uniquely sees)

A single agent sees one IS at a time. The Hermes swarm runs all ten simultaneously, which means it is the first layer in the stack capable of detecting cross-IS contradictions in real time: a wealth decision that conflicts with a self-energy constraint, a creator pipeline that outpaces the brand architecture's readiness, a business sprint that ignores the second-brain's knowledge gaps. These contradictions are invisible to sequential single-agent sessions. The swarm surfaces them before they become expensive mistakes.

The swarm also owns the write path back into the SIS vaults. Every synthesis result, every cross-IS pattern, every contradiction resolved passes through the Vault Writer before the session closes. This makes the swarm a self-reinforcing intelligence loop — the more tasks it runs, the richer the vault context it draws from next time. No other layer in the stack has both the read breadth (10 IS domains) and the write authority (all 6 vaults) simultaneously.

Finally, the swarm carries SIP attestation on every output. Not as a post-hoc step, but structurally — the Conductor embeds attestation in the aggregated result before returning it to the Starlight Orchestrator. This means every swarm output is sovereignty-stamped, audit-traceable, and composable into future SIP-aware artifacts without retrofit.

---

## Swarm Topology

```
Starlight Orchestrator
        │
        ▼
Hermes Swarm Conductor (405B, port 8112)
        │
        ├── IS Specialist Layer (405B, ports 8083–8104)
        │       ├── hermes-self-specialist       (8083)
        │       ├── hermes-wealth-specialist     (8084)
        │       ├── hermes-family-specialist     (8085)  ← sovereign privacy
        │       ├── hermes-business-specialist   (8086)
        │       ├── hermes-creator-specialist    (8087)
        │       ├── hermes-secondbrain-specialist(8088)
        │       ├── hermes-voice-video-specialist(8100)
        │       ├── hermes-brand-specialist      (8102)
        │       └── hermes-orchestrator-specialist(8104)
        │
        ├── IS Executor Layer (70B, ports 8093–8105)
        │       ├── hermes-self-executor         (8093)
        │       ├── hermes-wealth-executor       (8094)
        │       ├── hermes-family-executor       (8095)  ← sovereign privacy
        │       ├── hermes-business-executor     (8096)
        │       ├── hermes-creator-executor      (8097)
        │       ├── hermes-secondbrain-executor  (8098)
        │       ├── hermes-code-executor         (8099)
        │       ├── hermes-voice-video-executor  (8101)
        │       ├── hermes-brand-executor        (8103)
        │       └── hermes-orchestrator-executor (8105)
        │
        └── Infrastructure Layer
                ├── hermes-vault-writer     (70B, 8110) — persistence
                └── hermes-sentinel-monitor (70B, 8111) — governance
```

**Signal flow:** Conductor decomposes incoming task → dispatches to relevant IS Specialist(s) → Specialists spawn Executor subtasks for parallelism → results aggregate back at Conductor → Vault Writer commits to SIS vaults → Sentinel Monitor runs quality gate → attested result returns to Starlight Orchestrator.

---

## IS Assignment Matrix

| IS | Specialist | Executor | Primary Model | Concurrency |
|----|-----------|---------|--------------|-------------|
| Self | hermes-self-specialist (8083) | hermes-self-executor (8093) | 405B / 70B | up to 4 parallel subtasks |
| Wealth | hermes-wealth-specialist (8084) | hermes-wealth-executor (8094) | 405B / 70B | up to 4 parallel subtasks |
| Family | hermes-family-specialist (8085) | hermes-family-executor (8095) | 405B / 70B | sovereign privacy — no external calls |
| Business | hermes-business-specialist (8086) | hermes-business-executor (8096) | 405B / 70B | up to 6 parallel subtasks |
| Creator | hermes-creator-specialist (8087) | hermes-creator-executor (8097) | 405B / 70B | up to 6 parallel subtasks |
| Second Brain | hermes-secondbrain-specialist (8088) | hermes-secondbrain-executor (8098) | 405B / 70B | up to 4 parallel subtasks |
| Code | hermes-code-review (8082) | hermes-code-executor (8099) | 70B / 70B | up to 8 parallel subtasks |
| Voice & Video | hermes-voice-video-specialist (8100) | hermes-voice-video-executor (8101) | 405B / 70B | up to 4 parallel subtasks |
| Brand | hermes-brand-specialist (8102) | hermes-brand-executor (8103) | 405B / 70B | up to 4 parallel subtasks |
| Orchestrator (cross-IS) | hermes-orchestrator-specialist (8104) | hermes-orchestrator-executor (8105) | 405B / 70B | routes to any above |

---

## Swarm Operating Modes

### Mode 1: Single-IS Deep Dive

**Trigger:** Task maps cleanly to one IS domain.

**Flow:**
1. Conductor identifies target IS, routes to that IS Specialist.
2. Specialist decomposes into parallel subtasks, spawns Executor threads.
3. Executor results merge back at Specialist.
4. Specialist produces synthesis → Vault Writer commits → Sentinel passes → result returned.

**Latency target:** Under 90 seconds for standard depth analysis.

**Example:** "Analyze my current energy patterns and flag KEEP/DELEGATE/AUTOMATE/KILL." → Self Specialist + Self Executor only.

---

### Mode 2: Cross-IS Synthesis

**Trigger:** Task spans 2–5 IS domains, or Conductor detects implicit cross-IS dependencies.

**Flow:**
1. Conductor decomposes task into per-IS sub-problems.
2. Relevant Specialists run in parallel (not sequentially).
3. Orchestrator Specialist receives per-IS outputs, runs contradiction detection pass.
4. Synthesis written to strategic vault via Vault Writer.
5. Sentinel validates no cross-IS conflicts remain unresolved in output.

**Latency target:** Under 3 minutes for 3-IS synthesis.

**Example:** "Plan Q3 capital moves given my current energy state and creator pipeline capacity." → Wealth + Self + Creator specialists in parallel → Orchestrator Specialist synthesizes.

---

### Mode 3: Full Portfolio Sweep (Orchestrator)

**Trigger:** `/yolo` session open, `/starlight` status check, quarterly review, or explicit "sweep all IS" command.

**Flow:**
1. Conductor fans out to all 10 IS Specialists simultaneously.
2. Each Specialist runs a lightweight health-check + pattern-scan against their domain vault.
3. Orchestrator Specialist aggregates per-IS status, surfaces top 3 cross-IS tensions.
4. Full synthesis written to strategic + operational vaults.
5. Sentinel runs full quality + permission audit.
6. Result handed back to Starlight Orchestrator with SIP attestation.

**Latency target:** Under 8 minutes for full sweep.

**Example:** `/yolo` session open → Conductor auto-runs Mode 3 to orient the session.

---

## Genius Skills (what this swarm has that others don't)

1. **Parallel IS coverage** — All 10 Intelligence Systems run simultaneously in Mode 3. No single-threaded IS-by-IS sequencing. Contradictions that only appear across domains are visible from the first synthesis pass.

2. **Vault synthesis across domains** — The Vault Writer has read-write access to all 6 vaults simultaneously. Cross-domain pattern elevation (e.g., a wealth pattern that is actually a self-energy symptom) gets written once, referenced everywhere.

3. **Hermes self-improving skill loop** — Each Executor run logs which subtask decompositions worked and which stalled. The Orchestrator Specialist reads this log on session open and adjusts decomposition strategy. The swarm gets measurably faster at recurring task types over time.

4. **SIP attestation on every output** — The Conductor embeds `Built on SIP — Starlight Intelligence Protocol v1.1.1` in every aggregated result before returning it. No post-hoc retrofit step. Every swarm output is sovereignty-stamped, audit-traceable, and immediately composable into downstream SIP artifacts.

5. **Cross-IS contradiction detection** — The Orchestrator Specialist runs an active contradiction pass after per-IS synthesis: does the wealth thesis conflict with the self energy budget? Does the creator pipeline outpace brand architecture readiness? These contradictions are flagged as first-class outputs, not buried in footnotes.

---

## Freedom Path (KEEP/DELEGATE/AUTOMATE/KILL)

### KEEP (only Frank can do)
- Approving substrate-level SIP changes — no swarm agent can commit to `SIP.md` without Frank's explicit ack (Board gate enforced)
- Setting capital allocation thesis — Wealth Specialist analyzes, Frank decides
- Family IS decisions — specialist provides intelligence, all decisions stay with Frank
- Brand positioning pivots — Brand Specialist surfaces options, Frank owns the choice
- Cross-IS strategic direction — swarm identifies tensions, Frank resolves them

### DELEGATE (to swarm specialists)
- Deep IS domain analysis (Self energy audit, Wealth DPI ledger ops, Business brain sprints)
- Content strategy generation (Creator Specialist)
- Vault search and knowledge recall (Second Brain Specialist)
- Video scripting and podcast op plans (Voice & Video Specialist)
- Code review and quality gate (Code Executor)
- Brand reputation monitoring and surface audits

### AUTOMATE (swarm handles unattended)
- Vault writes after any synthesis session
- Quality gate checks via Sentinel Monitor
- Cross-IS health sweeps on `/yolo` session open
- Executor subtask decomposition for recurring task patterns
- SIP attestation embedding on all outputs

### KILL (stop doing)
- Manual vault writes after synthesis (Vault Writer handles this)
- Sequential IS analysis when parallel is possible (Conductor handles fan-out)
- Re-running contradiction detection after synthesis (Orchestrator Specialist runs it structurally)
- Post-hoc SIP attestation (it is now ambient at the Conductor level)

---

## Deployment Runbook

**Prerequisites:** OpenRouter API key set in environment. Ports 8083–8112 open on localhost. `sis-memory-mcp` running for Vault Writer.

**Boot sequence (order matters):**

```bash
# Step 1: Infrastructure first — Sentinel must be online before any agent runs
start_agent hermes-sentinel-monitor   # port 8111

# Step 2: Vault Writer — must be ready before any synthesis result is produced
start_agent hermes-vault-writer       # port 8110

# Step 3: IS Executors — fast 70B agents, boot quickly
start_agent hermes-self-executor      # 8093
start_agent hermes-wealth-executor    # 8094
start_agent hermes-family-executor    # 8095
start_agent hermes-business-executor  # 8096
start_agent hermes-creator-executor   # 8097
start_agent hermes-secondbrain-executor # 8098
start_agent hermes-code-executor      # 8099
start_agent hermes-voice-video-executor # 8101
start_agent hermes-brand-executor     # 8103
start_agent hermes-orchestrator-executor # 8105

# Step 4: IS Specialists — 405B agents, allow 60s warmup each
start_agent hermes-self-specialist      # 8083
start_agent hermes-wealth-specialist    # 8084
start_agent hermes-family-specialist    # 8085  ← verify noExternalCalls=true before boot
start_agent hermes-business-specialist  # 8086
start_agent hermes-creator-specialist   # 8087
start_agent hermes-secondbrain-specialist # 8088
start_agent hermes-voice-video-specialist # 8100
start_agent hermes-brand-specialist     # 8102
start_agent hermes-orchestrator-specialist # 8104

# Step 5: Conductor last — it needs all downstreams healthy
start_agent hermes-swarm-conductor     # 8112

# Step 6: Health check
curl http://localhost:8112/health  # Conductor reports all-agent status
```

**Shutdown order:** Conductor first, then Specialists, then Executors, then Infrastructure (Sentinel last — it writes final audit log on shutdown).

**Family IS isolation check:** Before booting `hermes-family-specialist` and `hermes-family-executor`, confirm network rules block outbound calls from ports 8085 and 8095. The `sovereignPrivacy: true` flag is a registry hint, not a network enforcement — the operator must enforce at the firewall level.

---

*Built on SIP — Starlight Intelligence Protocol v1.1.1*
