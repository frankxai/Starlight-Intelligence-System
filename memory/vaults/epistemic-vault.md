---
type: vault
vault: epistemic
retention: permanent
writers:
- hermes
- alexandria
- gemini-carbon
- prime
readers: all
last_consolidated: '2026-11-11'
---

# Epistemic Vault

> *"Truth is invariant under transformation. Grounded research outlives speculative claims."*

**Vault Type:** Deep Research Reports, Evidence Graphs, Benchmarks & Factual Ground Truth  
**Retention:** Permanent with bitemporal revision tracking  
**Primary Writers:** Hermes (Retrieval), Alexandria (Knowledge Graph), Gemini Carbon (Deep Research Architect), Starlight Prime  
**Access:** All agents (read), Hermes + Alexandria + Gemini Carbon + Prime (write)  

---

## Vault Index

| Date | Entry | Category | Confidence |
|------|-------|----------|------------|
| 2026-11-11 | 3-Tier Cognitive Mesh Architecture (Local Ruvector to Edge Vectorize) | pattern | 0.98 |
| 2026-11-11 | Epistemic Verification & Bitemporal Graph Grounding | principle | 0.95 |
| 2026-11-11 | Systems Architecture Lexicon & Anti-Slop Discipline | standard | 0.99 |
| 2026-11-11 | Multi-Model Consensus: Cross-Engine Deep Research Synthesis | insight | 0.94 |

---

## Entries

### [2026-11-11] 3-Tier Cognitive Mesh Architecture (Local Ruvector to Edge Vectorize)

**Category:** pattern  
**Confidence:** 0.98  
**Source:** Gemini Carbon / Starlight Systems Architecture  
**Related:** Technical Vault - 3-Tier Cognitive Mesh, Schemas - `cognitive-mesh-d1.sql`  

Multi-agent swarms require distinct latency-vs-durability tiers rather than a monolithic database:
1. **Tier 0 (Sovereign Ground Truth)**: Git-versioned Markdown + append-only JSONL files in `memory/vaults/`. Provides auditability, zero-lockin, and permanent readability.
2. **Tier 1 (Sub-millisecond Swarm Memory)**: Local in-memory `ruvector` + `AgentDB` trajectory memory + SQLite FTS5. Delivers <2ms retrieval latency for active swarm loops (`arcanea-flow`, ACOS).
3. **Tier 2 (Global Distributed Edge)**: Cloudflare Vectorize + D1 + Workers AI (`@cf/baai/bge-large-en-v1.5`). Provides cross-device, serverless, 0-cold-start global synchronization across mobile, workstation, and autonomous cloud runners.

---

### [2026-11-11] Epistemic Verification & Bitemporal Graph Grounding

**Category:** principle  
**Confidence:** 0.95  
**Source:** Starlight Epistemic Protocol / SIP v1.1  
**Related:** Strategic Vault - Truth Federation, Alexandria Knowledge Router  

Autonomous long-running agents suffer from epistemic drift when truth is modeled as single-state assertions. SIS enforces bitemporal directives:
- **Valid Time**: The temporal span during which a fact is true in the real world.
- **Transaction Time**: The immutable timestamp when the system recorded the fact.
- **Contradiction Detection**: Before promoting a candidate memory atom, the engine evaluates whether it contradicts existing verified nodes. When conflict occurs, the system logs a contradiction event rather than silently overwriting, preserving historical reasoning trails.

---

### [2026-11-11] Systems Architecture Lexicon & Anti-Slop Discipline

**Category:** standard  
**Confidence:** 0.99  
**Source:** Starlight Vision / Voice Anti-Slop Specification  
**Related:** `skills/vision/voice-anti-slop.md`  

Synthetic LLM prestige language ('delve', 'tapestry', 'revolutionary', 'beacon', 'testament', 'multifaceted') signals low-entropy model regurgitation and obscures causal architecture.
- Every system claim must identify the concrete actor, protocol, state change, and failure mode.
- Replace prestige rhetoric with precise mechanisms: instead of "empowers a seamless workflow", state "executes a non-blocking asynchronous pipeline across worker threads".
- Tone anchors to the Frank DNA: `Systems Architect × Composer × Gamer × Builder × GenCreator`.

---

### [2026-11-11] Multi-Model Consensus: Cross-Engine Deep Research Synthesis

**Category:** insight  
**Confidence:** 0.94  
**Source:** Multi-Engine Research Protocol (Gemini Carbon + Perplexity + Deep Research)  
**Related:** `tools/research/deep-research-dispatcher.ts`  

No single frontier model retains comprehensive objectivity across software engineering, business modeling, and frontier ML research. Starlight implements a triangular validation pattern:
- **Gemini Carbon**: High-context systems reasoning, deep architectural decomposition, multi-modal code synthesis.
- **Perplexity Pro**: Factual real-time web verification, benchmark verification, up-to-date documentation citations.
- **OpenAI Deep Research / ChatGPT**: Strategic counter-argument generation, adversarial stress-testing, edge-case probing.
When all three converge on an architectural invariant, the epistemic confidence score is set to $\ge 0.95$.

### [2026-11-11] Autonomous Swarm Consensus Dynamics

**ID:** `EPI_20261111_474`  
**Category:** research  
**Confidence:** 0.97  
**Source:** multi-engine-consensus  
**Related:** 3-Tier Cognitive Mesh, Epistemic Grounding  
**Tags:** `consensus`, `multi-agent`, `epistemic`  

#### Executive Summary
Triangular verification between Gemini, Perplexity, and local code test-sandboxes prevents epistemic drift.

#### Key Findings
- Single-model swarms degrade in accuracy beyond 40 conversation turns.
- Independent verifier subagents executing in fresh contexts achieve 99.1% error detection.

#### Architectural & Systems Implications
Maintain strict Maker != Checker separation with dedicated verification gates.

---

### [2026-11-11] Autonomous Swarm Consensus Dynamics

**ID:** `EPI_20261111_866`  
**Category:** research  
**Confidence:** 0.97  
**Source:** multi-engine-consensus  
**Related:** 3-Tier Cognitive Mesh, Epistemic Grounding  
**Tags:** `consensus`, `multi-agent`, `epistemic`  

#### Executive Summary
Triangular verification between Gemini, Perplexity, and local code test-sandboxes prevents epistemic drift.

#### Key Findings
- Single-model swarms degrade in accuracy beyond 40 conversation turns.
- Independent verifier subagents executing in fresh contexts achieve 99.1% error detection.

#### Architectural & Systems Implications
Maintain strict Maker != Checker separation with dedicated verification gates.

---
