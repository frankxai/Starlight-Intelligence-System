# /starlight Command

> *"The master command. Your interface to the intelligence system."*

**Primary Agent:** Starlight Prime
**Skills Activated:** context-engineering, vault-management

---

## Subcommands

### /starlight status

Show the current state of the entire Starlight Intelligence System.

**Output:**
```
STARLIGHT INTELLIGENCE SYSTEM v1.0.0
=====================================

Agents:    7/7 available
Skills:    16/16 registered
Vaults:    5/5 operational
Channels:  4/4 connected
Context:   Fresh (assembled [timestamp])

Active Agent: [current agent]
Active Skills: [currently loaded skills]
Token Usage: [current/budget]
```

### /starlight agents

List all agents with their current state.

**Output:** Agent table with name, role, status, and loaded skills.

### /starlight skills

List all skills with their activation status.

**Output:** Skill table with name, category, status (active/standby), and trigger count.

### /starlight health

Run a comprehensive system health check.

**Checks:**
1. Vault health metrics (entry counts, confidence averages, staleness)
2. Transmission channel connectivity
3. Context engine assembly quality
4. Skill activation accuracy
5. Agent availability

**Output:** Health report with metrics and recommendations.

### /starlight context

Show the current assembled context.

**Output:** Summary of loaded context sources, token allocation, and relevance scores.

### /starlight reset

Reset to fresh context while preserving all vault data.

**Actions:**
1. Clear current working memory
2. Archive current session as Session Note
3. Reassemble fresh context from vaults
4. Confirm reset to user

### /starlight queen ( /sq )

Primary entry to the continuous Queen loop (model-tier routing + eval overseer). Dispatches to dedicated surface.

See `commands/starlight-queen.md` (and shorts `/sq`, `/so`).

**Sub-dispatch examples:**
- /starlight queen status
- /starlight queen measure memory
- /starlight sq learn
- /starlight so route "long agentic refactor with tests"

### /starlight orchestrator

Activate Starlight Orchestrator (Leadership). With Queen role enabled by default for model-tier decisions.

See `agents/starlight-orchestrator.md` + `commands/starlight-queen.md` (Queen surfaces).

### /starlight architect

Activate / drive Starlight Architect (Leadership) for system design, scaffolding, trade-offs, planet-scale architecture. Ties to designing the Queen surfaces and similar.

See `commands/starlight-architect.md` + `agents/starlight-architect.md`.

### /starlight sq / /starlight so

Short aliases. /sq → queen loop; /so → orchestrator with Queen posture.

---

## Processing

```
/starlight [subcommand]
  → Parse subcommand
  → Route to Prime agent
  → Execute with system-level access
  → Return formatted output
  → Log in Operational Vault
```

**Grok harness note (2026-06-12):** When invoked under Grok 4.3 (this TUI), /starlight (the /si surface) activates Grok-native excellence gates (excellence-review, gstack for health/proving-ground, subagent swarm for agents/skills scan, repo-mastery for cross-repo context). Memory Gateway v0.1 provides unified session state; Queen routing table (v0.2 + advancement) consulted for model-tier decisions. Visuals (routing diagrams, palace cards, heatmaps, advance receipts, Queen tick cards) via image_gen; model lane now requires Visual Eval artifacts (lanes.json/SPEC). Full Queen loop (tick for closed self-improving MEASURE/LEARN/RATIFY/LEDGER + mandatory visual + velocity) driveable via Grok subagents + surfaces (`commands/starlight-queen.md` tick, `/sq`, `/so`). Composer 2.5 preferred for agentic-composer-long + visual-synthesis per v0.2 doctrine. See v0.2 ROUTING-DOCTRINE.md, agents/starlight-orchestrator.md, core/orchestrator/harnesses/grok/*, HARNESS.md.

See agents/starlight-orchestrator.md §Grok, agents/starlight-architect.md, commands/starlight-queen.md, commands/starlight-architect.md, HARNESS.md.
