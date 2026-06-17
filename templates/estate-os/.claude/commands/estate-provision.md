---
name: estate-provision
description: Scaffold a sovereign intelligence estate from the starlight-estate-os profile, apply 4-layer Blueprint, emit initial build brief, and dispatch via /si for first Mesh construction. Estate-specific command surface.
allowed-tools: Read, Write, Grep, Glob, mcp__*, /si routing
argument-hint: <estate-name> [blueprint-path or inline 4-layer summary] [--dry-run]
---

# /estate-provision

Load `templates/estate-os/README.md`, `AGENTS.md`, `SKILL.md`, `MEMORY.md`, `SOUL.md` (this estate's overrides if present), the client's 4-layer Blueprint (from /estate-blueprint or prior), and relevant substrate canon (STACK.md, ORCHESTRATION_ENGINE.md, claws/, /si command, SIP §5).

One sentence on what this command produces: A fully scaffolded sovereign directory (or in-place composition) using the thin starlight-estate-os profile as the reusable 80%, the client's Genius-grounded 4-layer config applied as the tuned 20%, an initial build brief with /si-dispatched first-wave tasks for Mind/Mesh components, and all artifacts carrying real SIP attestation + promotion commitments.

## Input
$ARGUMENTS

## Process

1. **Scaffold from profile** — Create or reference the estate root using the starlight-estate-os composition rules (file contract, inherited 10-IS + Orchestrator, production Mesh primitives from ORCHESTRATION_ENGINE + /si + claws + Memory Bus, module scaffolds from vertical/domain starters). Wire private/ (gitignored), ATTESTATIONS.md, and cycle-0 MEMORY.md. Never copy the entire substrate; compose by reference + thin overrides.

2. **Apply 4-layer Blueprint** — 
   - Persona / Naming skin (plain/pantheon/luminor/chess/custom; voice mappings from VOICES.md + client's Genius).
   - Topology / Swarm shape (council, yolo/hive conductor, amplification Claws mesh, Hermes retrieval, hybrid — drawn from ORCHESTRATION_ENGINE 6 patterns + swarm consensus).
   - Kernel / insight density (standard agents for volume; selective advanced/Luminor-grade only where blueprint justifies cost; flag for routing).
   - Modules (base 10-IS + specific domain sub-stacks via /spawn-domain-stack patterns; register in VERTICALS.md or client registry).
   Ground every layer in the excavated Genius Profile + Freedom Path KEEP items. Produce the tuned AGENTS.md overrides, SKILL.md invariants, SOUL.md (if not already), and estate-specific .claude/commands/ stubs.

3. **Initial build brief & dispatch via /si** — Emit a concise, actionable Build Brief (30/90-day targets, first Pilot workflows, key harness configs, claw bootstrap sequence, vault seeding plan, attestation schedule). Then intelligently dispatch the first construction wave:
   - Architecture / topology lock → Claude (or primary substrate lane) via /si.
   - Implementation of core agents/skills/commands/harnesses → Codex or targeted lane.
   - Research / long-context / browser swarm components → Gemini or Antigravity via /si.
   - Always preserve context with handoff packets per cli-tool-router. Leave receipts in operational-vault and estate logs.
   Use progressive loading and token budgets from the Orchestration Engine. Route high-stakes (substrate touch, encoded-self, public) through /starlight-board pre-pass.

4. **Attestation & sovereignty enforcement** — Every generated artifact (scaffold, blueprint application summary, build brief, handoff packets) must carry a real "Built on SIP" block with layers used, substrate version, estate name, and timestamp. Route cross-party or high-provenance items explicitly through /sip-attest. Enforce encoded-self boundaries (SIP §5.7): refuse any attempt to treat client's voice/Genius artifacts as licensable or transferable. Client ownership language is explicit in every SOW-tied output.

5. **Promotion commitments** — Append to the estate's MEMORY.md and ATTESTATIONS.md the standing commitment: after Pilot/Standing, run /sis-forge + manual audit; promote all generalized patterns (new module scaffold, improved runbook, harness config, orchestration template) back to starlight-estate-os, core/, claws/, or docs/delivery/. This is the factory economics contract.

6. **Handoff & verification** — Produce operator handoff packet (Voice Operator compatible if active) + Steward runbook stub (client voice where possible). Verify against world-class E2E checklist from estate-army-commissioning-workflow.md. Log to operational-vault.

## Output format

```
# Estate Provision — <Estate Name>
**Date:** YYYY-MM-DD
**Profile:** starlight-estate-os (composition vX)
**Blueprint:** [link or summary of 4 layers + Genius grounding]
**Scaffold location:** [path or "in-place composition"]
**Attested:** Yes (see ATTESTATIONS.md)

## 4-Layer Application Summary
- Persona: ...
- Topology: ... (references ORCHESTRATION_ENGINE patterns)
- Kernel: ...
- Modules: ...

## Initial Build Brief
[30/90 targets, first workflows, /si dispatches executed or queued, claws bootstrap order]

## First Dispatches (via /si)
- [lane] : [task summary] — receipt: [id or path]
...

## Next Actions
...

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
*Estate Factory R2/R3 composition. Client owns tuned estate; generalized patterns promote back.*
```

## Rules

- Sovereignty is non-waivable. This command does not override decision rights inside the client's domain or alliance nodes.
- Silent composition or stripped attestation is a breach. Every artifact carries "Built on SIP".
- Use the thin profile: promote anything that generalized instead of baking client-specifics into the reusable 80%.
- Board gate before any irreversible topology, kernel, or public move.
- Always check layer routing first (substrate vs operational).
- Dispatch via /si (cli-tool-router) for any cross-lane construction; never raw shell unless dry-run or one-shot.
- If the estate is part of an alliance (e.g. Trinity), keep ALLIANCE.md hygiene separate from this commercial provision SOW.

---

**Built on SIP** — estate-provision command (starlight-estate-os example) · SIP v1.1.1 · 2026-06-17 evolution pass · Composes estate-army-commissioning-workflow + ORCHESTRATION_ENGINE + /si + starlight-estate-os profile per 2026-06-16 Board PROCEED-WITH-REVISE.