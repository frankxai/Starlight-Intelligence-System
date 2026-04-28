# Arcanea-Flow Channel

> *Starlight ↔ arcanea-flow*

**Channel Type:** Bidirectional via Memory Bus
**Primary Topics:** Swarm orchestration, hooks results, RL/ReasoningBank outputs, hive-mind blackboard, neural training
**Connected Repo:** `C:\Users\frank\arcanea-flow\` (sibling repo, ruv-FANN / claude-flow / agentic-flow lineage)
**Architectural Decision:** Connect-not-absorb (memory: `project_arcanea_flow_connect_not_absorb.md`)

---

## Channel rationale

ruflow / claude-flow ships fast. Absorbing freezes SIS to a snapshot and forces vendoring every upstream change. SIS substrate is meant to be stable; arcanea-flow is execution-layer churn.

**Division of ownership:**

| SIS owns | arcanea-flow owns |
|---|---|
| Substrate (SIP, voices, attestation, contracts) | Swarm topologies, agent spawning, hooks |
| Memory primitives + Memory Bus daemon | SPARC, neural training, RL pieces |
| Vault canon, Voice canon | ReasoningBank execution loop |
| The bus contract itself | Hive-mind blackboard patterns |

---

## Integration mechanism

Both repos read/write through the **Memory Bus singleton daemon** (`transmissions/channels/memory-bus.md`). No code is shared between repos. No skills are duplicated. No agents are imported.

**Namespace contract:**
- arcanea-flow writes under `arcanea-flow.*` namespace prefix
- SIS reads from `arcanea-flow.*` via standard `memory.search` / `memory.query` / `memory.graph` MCP calls
- arcanea-flow reads from `frank.vault.*` and `frank.kg.*` only with explicit grants in the bus config

**Attestation rule:** When arcanea-flow produces SIS-substrate-affecting work (e.g., a ReasoningBank decision that changes a vault-canonical fact), it must `memory.attest` the artifact before write. The attestation carries SIP attribution back to SIS.

---

## What flows in each direction

**Starlight → arcanea-flow:**
- Vault canon snapshots (read-only)
- Voice / agent / skill metadata
- SIP attestation requirements
- Substrate-tier rule changes

**arcanea-flow → Starlight:**
- Swarm execution outputs
- ReasoningBank adaptive learnings (deltas to Memory Bus)
- Hive-mind blackboard summaries
- Neural training results that inform agent routing

---

## What does NOT flow

- ❌ Code import either direction (no `from arcanea-flow.X import Y`)
- ❌ Skill content duplication
- ❌ Agent file copying
- ❌ Direct DB writes that bypass the Memory Bus contract
- ❌ Cross-repo CI dependencies (each repo runs its own tests)

---

## Channel Log

### [2026-04-29] Channel established (Phase 0 deliverable)

**From:** Cockpit Master Plan v8 board-revised
**Priority:** Normal
**Action Required:** Yes — formalize sibling registration in `context/repo-contexts/arcanea-flow-context.md` (this session) + grant matrix in Memory Bus config (Phase 0 daemon implementation)

arcanea-flow sibling repo at `C:\Users\frank\arcanea-flow\` registered as connected peer per Master Plan v8. Connect-not-absorb pattern locked. Bridge mechanism: Memory Bus singleton daemon. ReasoningBank execution loop runs in arcanea-flow, writes results into Memory Bus → SIS reads them through standard memory APIs.

**Acknowledged:** Yes — System initialization.

---

**Built on SIP** · v1.1.0 · Arcanea-Flow Channel · 2026-04-29
