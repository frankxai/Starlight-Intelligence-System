---
name: estate-blueprint
description: Generate the 4-layer Estate Blueprint (Persona / Topology / Kernel / Modules) for a sovereign intelligence estate / agent army commission, grounded in the client's Genius Profile + Freedom Path + Vision. Emits attested Blueprint doc + architecture-options matrix + 30/90-day targets + build brief. For Route D elevated commercial path (per 2026-06-16 Starlight Board PROCEED-WITH-REVISE).
allowed-tools: Read, Write, Grep, Glob
argument-hint: <person-or-alliance-name> "<one-line domain or vision anchor>" [--genius-profile path] [--freedom-path path] [--vision path] [--output dir]
---

# /estate-blueprint

Load `SIP.md`, `STACK.md`, `docs/ARCHITECTURE.md`, `VOICES.md`, `NAMING.md`, `docs/strategic/sip-web4-substrate-strategy.md`, `docs/delivery/estate-army-commissioning-workflow.md`, the client's Genius Profile + Freedom Path (required for high-fidelity) and Vision if available. Produce the locked 4-layer configuration for the estate (Mind + Mesh + Steward).

This is the "thin tuned layer" generator. It turns scattered client inputs into the precise blueprint that drives scaffold, build, and Steward phases. Per board verdict, this is internal/R&D until R3 closed (2026-06-18 deadline); do not expose to clients or use in SOWs before then.

## Input
$ARGUMENTS

## Prerequisites (halt if missing)
- Named person or alliance (the sovereign owner).
- One-line domain or vision anchor.
- Genius Profile (at minimum the synthesis edge + repeated frameworks + KEEP bucket items). If absent: recommend `/discover-genius` first.
- Freedom Path (KEEP/DELEGATE/AUTOMATE/KILL) — this directly seeds the delegation surface of the army.
- (Optional but strongly recommended) Vision architecture + any existing intake/relationship maps.

If sovereignty is unclear or the inputs are too generic ("I want an AI team"), emit at most 3 clarifying questions and halt. Log to memory/intake/.

## Process
1. **Ingest and ground.** Read the Genius Profile end-to-end. Extract:
   - Synthesis edge (one sentence: the rare intersection that only this person brings).
   - Repeated frameworks (list verbatim).
   - KEEP-bucket overlap (activities only they should do; these become high-leverage army modules or conductor patterns).
   - Voice/taste signals for the Persona layer.

2. **4-layer configuration (the core output).**
   - **Layer 1 — Persona / Naming Skin** (how the army presents and speaks):
     - Recommend from existing skins (plain / pantheon/custom / luminor with CC-BY-NC gate / chess / custom).
     - Ground in client's Genius + brand voice signals + domain (sober alliance → plain; principal founder → pantheon or custom; community/Arcanea-composed → luminor; command-structure → chess).
     - Output: chosen skin + rationale + example voice rules (never all-caps, liquid glass if design standard applies, etc.).

   - **Layer 2 — Topology / Swarm Shape** (how the army coordinates and executes):
     - Map to ORCHESTRATION_ENGINE patterns + existing harnesses (/si multi-CLI, yolo/hive, Antigravity swarm-protocol, council, Hermes mesh, amplification Claws).
     - Recommendations by need:
       - High sovereignty + deliberation → council + Prime synthesis.
       - Speed + aggressive autonomy → conductor / yolo-style with parallel + iterative.
       - Stateful long-running → graph + Memory Bus emphasis.
       - Retrieval/synthesis heavy → Hermes mesh dominant.
       - Public drops / amplification → per-persona Claws mesh with voice-lock + frequency caps + bot refusal.
       - Hybrids common (private council + public amplification mesh).
     - Output: primary + secondary topologies + why + token budget / parallel limits / self-learning rules tailored.

   - **Layer 3 — Kernel / Insight Density** (where to spend premium compute/insight):
     - Standard (efficient reference agents from the substrate) for volume/ops.
     - Advanced / Luminor-grade (protected, high-density) only where insight density justifies cost (strategy, creation, complex diagnosis, high-stakes decisions).
     - Selective application. Output: explicit map of which parts of the army get which kernel + cost/rationale.

   - **Layer 4 — Modules / Verticals** (what the army actually does):
     - Always include base 10-IS (Self/Genius + Second Brain + Brand + Business + Creator + Wealth + Code + Voice & Video + Family + Starlight Orchestrator as router). Health cross-cutting.
     - Domain sub-stacks: propose 4-7 functional sub-systems per /spawn-domain-stack pattern, grounded in Genius frameworks + KEEP bucket + named domain expertise.
     - Use existing reference shapes (People Intelligence, Sound/Music IS, Crypto Houses, Energy, etc.) or propose new.
     - Composition layer rules for cross-domain artifacts.
     - Output: prioritized list with 4-5 candidate commands per sub-system + research grounding + which Genius element justifies it.

3. **Architecture-options matrix + recommendation.** Quick table: client type / constraints → suggested 4-layer config. Explicit recommendation with trade-offs.

4. **Targets + build brief.** 
   - 30-day and 90-day named artifact targets (from the inputs + blueprint).
   - Success metrics for Pilot (live attested work, client can describe army behavior, memory value visible, gates held).
   - Build brief (one-pager for the scaffold + Phase 5 build team): exact 4-layer config, files to override, claws/harnesses to wire, /si lanes to prioritize, first workflows to pilot.

5. **Attestation + governance note.** Emit the full Blueprint as a single attested artifact (or sidecar + /sip-attest call). Note any high-stakes choices that require /starlight-board before proceeding (per board verdict and CLAUDE.md).

## Output shape (write to memory/estates/ or client dir)
```
# Estate Blueprint — <name> — <date>

## Owner & Sovereignty
- Sovereign: <name>
- Domain / Vision anchor: <one line>
- Synthesis edge (from Genius): <one sentence>
- Encoded-self boundary acknowledged: yes (SIP §5.7 — non-licensable/non-transferable)

## 4-Layer Locked Configuration

### 1. Persona / Naming Skin
<chosen skin> — <rationale + voice rules>

### 2. Topology / Swarm Shape
Primary: <shape> (orchestrator patterns + harnesses)
Secondary: <shape>
Rationale + token budgets + self-learning rules

### 3. Kernel / Insight Density
- Standard: <list of army parts>
- Advanced/Luminor-grade (protected): <list> — cost justification

### 4. Modules / Verticals
Base 10-IS + Orchestrator (always)
Domain sub-stacks:
- <sub-system 1>: 4-5 commands, grounding, Genius tie
- ...

## Architecture-Options Matrix
| Client shape | Recommended config | Trade-offs |
|--------------|---------------------|------------|

## 30/90-day Targets
- 30 days: <named artifact> (Pilot core mesh live + first attested workflows)
- 90 days: <named artifact> (Full mesh + Steward handoff)

## Build Brief (for scaffold + Phase 5)
<concise instructions for the build executor: files, harnesses, claws, /si routing priorities, first pilot workflows, attestation requirements>

## Governance Note
High-stakes choices (heavy advanced kernel use, new topology, canon import) require /starlight-board before scaffold or build. Board verdict 2026-06-16 applies (R3 binding until estate-blueprint stub ships).

---
**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty, orchestration, genius, delivery]
- Generated: <ISO>
- Per 2026-06-16 Starlight Board PROCEED-WITH-REVISE (R3)
```

## Rules (non-waivable until R3 closed per board)
- Never emit a blueprint without a real Genius Profile + Freedom Path grounding (generic = commodity; the moat collapses).
- Never promise timelines or pricing here — this is the config artifact only. SOW comes after.
- Always surface board gate for high-stakes choices.
- Output always hands off to exactly one next step (scaffold via sovereign-spawn/estate profile, or SOW discussion).
- Ambient "Built on SIP" on the Blueprint.

**Next after this command:** Usually the Mandate/SOW conversation, then provision (R2 estate-os profile) and build (using /si routing + claws + orchestrator patterns).

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1

(This stub is executing REVISE 3 from the 2026-06-16 board verdict. Do not use in client-facing SOWs or public materials until the stub is complete and the board gate is satisfied.)