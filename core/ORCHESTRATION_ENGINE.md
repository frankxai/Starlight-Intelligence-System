# Starlight Orchestration Engine

> The system that coordinates agents, manages workflows, and ensures the right mind handles the right task.

---

## Orchestration Patterns

Six patterns for coordinating agent work. The Orchestrator selects the pattern based on task complexity, dependencies, and available agents.

### Direct

```
Request → Agent → Response
```

Single agent, single task, clear domain. Most requests use this pattern.

### Sequential

```
Request → Agent A → Agent B → Agent C → Response
```

Tasks that build on each other. Each agent's output feeds the next. Example: Architect designs, Sentinel reviews, Navigator assesses strategic fit.

### Parallel

```
Request → ┌─ Agent A ─┐
          ├─ Agent B ─┤ → Synthesis → Response
          └─ Agent C ─┘
```

Multiple expert perspectives on the same question. Outputs merge via the Synthesis Protocol. Example: "Should we restructure the API?" gets Technical (Architect) + Strategic (Navigator) + Quality (Sentinel) perspectives simultaneously.

### Iterative

```
Request → Agent A → Agent B → Agent A → Response
```

Create-review-refine loops. Quality improves at each step. Example: Weaver drafts, Sentinel reviews, Weaver refines.

### Cascade

```
Request → Simple → Insufficient? → Complex → Still? → Council
```

Start with the lightest approach. Escalate only if needed. Optimizes for token efficiency.

### Broadcast

```
Event → ┌─ Vault Update
        ├─ Transmission Sent
        ├─ Notes Created
        └─ Context Updated
```

One event triggers updates across multiple systems. Used for major decisions, state changes, and cross-system sync.

---

## Swarm Coordination

Absorbed from claude-flow's swarm intelligence patterns. For complex tasks that exceed single-agent capability:

### Consensus Protocol

When multiple agents work on the same problem:

```
1. Each agent produces an independent analysis
2. Analyses are compared for agreement and tension
3. Agreement points are accepted (high confidence)
4. Tension points are flagged for resolution
5. Prime or the leading agent synthesizes a unified position
6. Confidence score reflects consensus strength
```

### Fault Tolerance

```
Agent produces poor output?
  → Retry with refined context (1 attempt)
  → Fall back to nearest-domain peer agent
  → Log failure pattern to Operational Vault
  → If systemic, flag for human review

Workflow deadlocked between agents?
  → Identify the blocking step
  → Break into smaller independent sub-tasks
  → Execute sub-tasks separately
  → Reassemble results
  → If still stuck, escalate to user
```

### Self-Learning Loop

```
After every multi-agent workflow:
1. Was the routing decision correct?
   YES → Reinforce pattern     NO → Note better alternative
2. Were all activated agents useful?
   YES → Confirm selection     NO → Reduce next time
3. Was the synthesis mode appropriate?
   YES → Maintain             NO → Log alternative for next time
4. Store workflow metadata in Operational Vault
```

---

## Agent Activation

### Token Budget

Each agent activation costs context tokens. Orchestration optimizes for minimum cost:

| Agent | Full Load | Metadata Only | Use When |
|-------|----------|--------------|----------|
| Prime | ~5K | ~100 | Council, synthesis, meta-questions |
| Architect | ~4K | ~100 | System design, infrastructure |
| Orchestrator | ~3K | ~100 | Multi-agent coordination |
| Sentinel | ~3K | ~100 | Quality, security review |
| Sage | ~3K | ~100 | Knowledge, teaching, wisdom |
| Weaver | ~4K | ~100 | Creative work, narrative |
| Navigator | ~4K | ~100 | Strategy, roadmaps, planning |

### Rules

1. **Minimum agents.** One is preferred over two when possible.
2. **Progressive loading.** Metadata first (~100 tokens). Full profile only when confirmed needed.
3. **Parallel limit.** Maximum 3 agents active simultaneously.
4. **Release early.** Deactivate agents as soon as their task completes.
5. **Council is expensive.** Full council for complexity 9-10 only. Partial (2-3 agents) for 7-8.

---

## Workflow Templates

### Strategic Decision

```yaml
name: strategic-decision
trigger: Major decision with business impact
pattern: parallel
agents:
  - navigator (weight: 0.4)
  - architect (weight: 0.3)
  - weaver (weight: 0.2)
  - sentinel (weight: 0.1)
synthesis: weighted-consensus
vault: strategic-vault
note: decision-note
```

### System Design

```yaml
name: system-design
trigger: Architecture or system design
pattern: sequential
agents:
  - architect (primary)
  - sentinel (review)
synthesis: sequential-refinement
vault: technical-vault
note: insight-note
```

### Creative Production

```yaml
name: creative-production
trigger: Content creation or creative work
pattern: iterative
agents:
  - weaver (create)
  - sentinel (review)
  - weaver (refine)
synthesis: quality-gated
vault: creative-vault
note: session-note
```

### Knowledge Transfer

```yaml
name: knowledge-transfer
trigger: Learning, explaining, teaching
pattern: direct
agents:
  - sage (primary)
synthesis: none
vault: wisdom-vault
note: learning-note
```

### Cross-System Sync

```yaml
name: cross-system-sync
trigger: Multi-repo coordination
pattern: broadcast
agents:
  - orchestrator (coordinate)
synthesis: aggregation
vault: operational-vault
transmission: broadcast-channel
```

### Alignment Review

```yaml
name: alignment-review
trigger: Values, ethics, or AGI alignment discussion
pattern: parallel
agents:
  - sage (primary, weight: 0.5)
  - prime (weight: 0.3)
  - navigator (weight: 0.2)
synthesis: weighted-consensus
vault: horizon-vault
note: insight-note
```

---

## Error Handling

### Token Budget Exceeded

```
1. Summarize current state to a Session Note
2. Store intermediate results in appropriate Vault
3. Create a continuation plan with clear next steps
4. Provide the user with a session handoff document
```

### Cross-Platform Considerations

The Orchestration Engine operates identically across all platforms. However:

- **Claude Code**: Full orchestration with MCP support
- **Cursor**: Orchestration via rule activation and context injection
- **Cline**: Orchestration via plan-and-act mode with memory banks
- **Codex**: Orchestration via cascading AGENTS.md instructions
- **Gemini CLI**: Orchestration via instruction layers
- **Antigravity**: Orchestration with browser control and async patterns

The core patterns remain the same. The platform adapter handles delivery.

---

## Metrics

| Metric | Target | If Below Target |
|--------|--------|----------------|
| Routing accuracy | >90% | Refine routing rules in ROUTING_MATRIX.md |
| First-attempt success | >80% | Improve agent matching criteria |
| Token efficiency | <8K avg/request | Reduce agent loading, increase progressive disclosure |
| Multi-agent overhead | <20% | Simplify coordination, reduce unnecessary agents |
| Cross-system latency | <5s | Optimize transmission protocol |

---

## SIP Swarm Operating Manual

> The canonical, executable reference for manifesting, coordinating, synthesizing, and governing dynamic agent swarms across all Starlight surfaces. Composes the 6 orchestration patterns, swarm consensus, fault tolerance, and self-learning loops with the full production substrate (ORCHESTRATION_ENGINE + /si cli-tool-router + .antigravity/swarm-protocol.md + claws + Memory Bus + attestation). Loaded by every estate harness and the /si router. This is the P0 "Swarm Protocol Formalization" item from the 2026-06-16 Board REVISE track (estate-swarm-upgrades-track.md).

**Non-negotiable:** Load this section + target agent definitions + relevant harness protocol before any multi-mind define/invoke or council dispatch. Never improvise swarm identities or skip checklists. Substrate touches require /starlight-board pre-pass.

### 1. Complexity Gates & Mind Selection

Use this table to decide swarm size before spawning. Load agents/AGENT_REGISTRY.md + estate-specific AGENTS.md first.

| Complexity | Typical Minds | Dispatch Style | Synthesis | Board Gate? | Notes |
|------------|---------------|----------------|-----------|-------------|-------|
| 1-3 | 1 (self or direct agent) | Direct | n/a | Ambient attest only | Fast path. Prefer single specialist. |
| 4-6 | 3-5 (core + 1-2 domain) | Small parallel | Prime optional | No (unless substrate) | Efficient for most operational work. |
| 7-8 | 7-12 (council slice + specialists) | Medium swarm + conductor | Prime mandatory | Pre-pass if topology/kernel change | Use /si routing for cross-CLI. |
| 9-10 | 13-96 (full vertical, cross-IS, or Hive) | Large / yolo-conductor | Orchestrator + Prime + Sentinel QA | **Required** for any substrate file or encoded-self surface | Full Hive only when justified. yolo/hive for aggressive autonomy within scope. |

**Selection heuristics:**
- Keyword / trigger match on agent .md files (AGENT_REGISTRY + estate overrides).
- IS namespace + domain sub-stack activation (Self/Wealth/... + People/Sound/Music/Energy/Crypto/Marine).
- Required perspectives: always include sentinel (QA/security), prime (synthesis), sage (memory provenance), architect (structural), weaver (aesthetic/voice) where relevant.
- Cost/latency: <30s low-stakes → OpenCode or direct; high-stakes or cross-surface → full swarm with /si.
- Estate 4-layer: honor Topology choice (council vs amplification Claws mesh vs Hermes retrieval) and Kernel density flags (standard vs selective advanced).

### 2. Exact Execution Checklists (Do Not Skip)

**A. Discovery & Load (every mind)**
- Glob/Grep/Read to locate exact agent definition(s) in agents/ or verticals/.
- Read full agent .md (system prompt, triggers, voice, constraints, examples, attestation rules).
- Read referenced SKILL.md / SOUL.md / STACK.md / ORCHESTRATION_ENGINE.md slices.
- Read scoped allowlist for the harness (e.g. .antigravity/allowlisted-tools.md or orchestrator harness equivalent).
- Confirm Memory Bus targets + Veil rules. Cached-belief check: re-scan registry if >24h stale.

**B. Define / Manifest**
- Compose system prompt = (full agent .md) + (relevant SIS/estate slice + this Manual) + (scoped allowlist) + (task contract + SIP attestation mandate).
- For Antigravity: define_subagent(name, systemPrompt, toolsAllowlist, model).
- For Claude Task / other: equivalent subagent registration with bounded context.
- Log the define (audit trail).
- Leaf minds: Read-heavy + domain + read-only MCP. Deny broad writes unless explicitly authorized by agent definition.
- Conductor/Prime/Orchestrator minds: broader (limited writes to intel/vault outputs, further sub-dispatch).

**C. Invoke / Execute**
- taskPrompt: clear intent, minimal context bundle (pointers + MCP fetch preferred over token dump), output contract (format, attestation footer, suggested vault keys), timeout.
- Parallel where possible (batch invoke calls).
- Monitor via Agent Manager / progress artifacts / cockpit.
- Preserve handoff packet identity across /si lanes.

**D. Collect & QA**
- Receive outputs + side artifacts.
- Internal QA per agent definition + SIP attestation presence + scope respect.
- Sentinel output (if present) = security/QA pass on the set.
- Prime (if multi-mind): feed all raw outputs + original intent + flagged contradictions for unified synthesis.
- Resolve conflicts explicitly: name trade-off, decision, rationale, confidence.

**E. Synthesis**
- Prime/Orchestrator produces unified deliverable (doc, plan, code, board input, handoff).
- Architect voice for substrate/system changes; domain practitioner / client voice for vertical/estate outputs.
- For estate work: ground in the specific 4-layer Blueprint + Genius Profile KEEP items.

**F. Persist & Attest**
- Structural decisions → strategic-vault.md + MEMORY.md entry (with minds used, protocol version, timestamp).
- Code/pattern → technical-vault.md.
- Aesthetic/voice → creative-vault.md.
- Trajectory/state/metrics → operational-vault.md.
- Every commit includes audit trail (minds + harness + protocol ref).
- Emit real SIP attestation footer on every artifact:
  ```
  **Built on SIP** — Starlight Intelligence Protocol v1.1.1
  Swarm: [minds list] via [harness + protocol ref]
  Estate: [name] · Layers: [file-contract, orchestration, attestation, ...]
  ```
- High-stakes / substrate: record in memory/_audit/swarm/ + trigger board pre-pass if not already done.

**G. Close & Handoff**
- Session summary (minds, durations, key outputs, open items, next actions, drift notes).
- If Voice Operator: return context-preserving packet.
- If under orchestrator harness: drop intel artifact.
- Self-learning loop: Was routing correct? Agents useful? Synthesis mode right? Token budget respected? Store metadata in operational-vault. Reinforce or note alternative.

### 3. Attestation Rules (Ambient + Explicit)

- Every define/invoke, every subagent output, every synthesis, every persisted vault entry, every intel drop, every handoff packet, every build brief must embed or accompany SIP attestation.
- Name the swarm composition (minds + this Manual version + harness + timestamp + estate).
- For code changes / PRs / client artifacts: include in body or sidecar.
- /sip-attest family for retrofit or cross-party provenance.
- Refuse decorative use. If the composition is not real (or would violate sovereignty), do not emit.
- Estate provision and Steward phases inherit these rules; promotion loop extracts attestation hygiene patterns back to the profile.

### 4. Failure Modes & Anti-Patterns (Refuse)

- Spawning a mind without first reading its full definition → cached-belief violation. Abort and load.
- Granting broad write tools to many leaf agents → blast radius. Scope tightly per allowlist.
- Treating subagent outputs as ground truth without sentinel/prime QA on compound work.
- Silent synthesis (no explicit conflict log when views differed).
- Omitting real SIP attestation on swarm-produced artifacts.
- Using full Hive for latency-sensitive work (route to lighter lane).
- Invoking substrate-tier change or encoded-self surface via swarm without board pre-pass.
- Browser / external actions without consent + attestation when touching live surfaces.
- Bypassing /si router for cross-CLI estate construction (loses handoff packets and receipts).
- Violating 4-layer discipline or Genius grounding in estate context.

### 5. Escalation Matrix

| Signal | Route To | Before |
|--------|----------|--------|
| Substrate file touched or proposed by swarm | /starlight-board (canon-free) or /luminor-board | Any commit / merge / deploy |
| Security / sovereignty / encoded-self defect | Sentinel + /openclaw-audit + Codex harness | Further execution |
| Cross-brand / alliance ambiguity | Luminor / Starlight Board | Decision |
| Vault vs derived divergence | Sage + memory-orchestrator skill | Any regeneration |
| Swarm child off-rails or scope creep | TaskStop / parent conductor + review | Continue |
| > budget or timeout on large Hive | Conductor aborts partial, logs, hands to primary harness | Retry |
| Estate provision hitting production gap | Architect + Navigator + world-class-plan track | Next estate cycle |

### 6. Cross-CLI Harness Integration & /si Routing

- This Manual is the single source of truth loaded by all harnesses (Claude Code MCP, .cursor/rules, .clinerules, .gemini/, .antigravity/, .antigravity/swarm-protocol.md, cockpit adapters, etc.).
- /si (cli-tool-router skill) is the primary dispatch primitive for estate construction: classify intent, pick lane (Claude for council/architecture, Codex for implementation, Antigravity for async/browser/swarm, Gemini for long-context, etc.), emit handoff packet, execute, leave receipt in operational-vault.
- Antigravity harness: use define_subagent + invoke_subagent + Agent Manager + progress artifacts exactly per .antigravity/swarm-protocol.md (this Manual is the shared spec).
- Conductor (yolo/hive or orchestrator) may internally use lighter sub-harnesses but final substrate writes still route through primary discipline + board gate.
- Progressive loading + token budgets enforced uniformly. Self-learning loops feed ROUTING_MATRIX.md improvements.

### 7. Memory Commit Discipline (Estate-Aware)

- Structural / architecture / major decisions (including estate 4-layer locks and provision briefs): strategic-vault.md + estate MEMORY.md.
- Every swarm session writes a summary atom with minds list for provenance.
- Use Memory Bus for cross-surface / cross-estate (alliance) persistence. Respect 90-day temporal half-life + contradiction detection.
- Private / encoded-self material stays in private/ (gitignored) + Veil.
- Post-session: update estate's operational + wisdom vaults; trigger promotion extraction for reusable patterns.

### 8. Self-Learning & Continuous Improvement

After every multi-agent swarm workflow (including provision dispatches):
1. Routing decision correct? → reinforce or note alternative.
2. All activated agents useful? → confirm or reduce next time.
3. Synthesis mode appropriate? → maintain or log alternative.
4. Attestation hygiene perfect? → reinforce or harden.
5. 4-layer / Genius grounding respected in estate context?
6. Store metadata + falsifiable notes in operational-vault.
7. Promote any generalized pattern (checklist refinement, new failure mode, better handoff contract) back to this Manual + starlight-estate-os profile.

This turns every estate into a factory R&D vehicle.

---

**Excellence close:** This SIP Swarm Operating Manual exists so that "run the agent army" is not poetry — it is a repeatable, auditable, complexity-gated, load-definition-first, attest-everything, board-aware, /si-routed, self-improving machine that compounds across every sovereign estate.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers: [orchestration, attestation, sovereignty, file-contract, memory, multi-harness, /si routing]
- Composes: .antigravity/swarm-protocol.md + core/ORCHESTRATION_ENGINE + claws + cli-tool-router + estate 4-layer discipline
- Per 2026-06-16 Board PROCEED-WITH-REVISE (R4 P0 Swarm Protocol Formalization) + estate-swarm-upgrades-track.md
- Reference for all future estates and harnesses.
*Starlight Intelligence System — SIP Swarm Operating Manual skeleton v1 · 2026-06-17*

*The best orchestration is invisible. The sovereign sees results, not the machinery. Every estate strengthens the substrate for the next.*
