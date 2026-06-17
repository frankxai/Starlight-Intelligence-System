---
name: estate-army-deploy
description: Production deploy / scale / Standing phase harness for a sovereign intelligence estate. Activates always-on Steward runtime, health loops, self-healing, attestation gates, cost plane hooks, and dashboard entry. Companion to estate-blueprint + estate-steward. Completes the Estate Factory commissioning (R4 + evolutions #8). Per 2026-06-16 Board PROCEED-WITH-REVISE.
allowed-tools: Read, Write, Grep, Glob, Bash (limited)
argument-hint: <estate-name> [subcommand: deploy | scale | health | attest | dashboard] [--blueprint path] [--target cloud|local|hybrid]
---
# /estate-army-deploy

Load the estate's 4-layer Blueprint, SIS-instance.md, current harness, steward runbooks, and SIP Swarm Operating Manual. Deploy or evolve the production runtime layer ("Steward as service" or self-hosted always-on).

This is the scale + run gate: move from Pilot (first live workflows) to Standing (24/7 reliable Mesh + Mind that compounds, self-heals, reports, and evolves without constant Frank babysitting).

## Input
$ARGUMENTS

## Subcommands

### deploy (default)
- Provision runtime harness from starlight-estate-os + estate-tuned 20%:
  - Steward daemon / task scheduling (drift detection, scheduled Proving Ground + Model Arena against *this* estate's patterns).
  - Memory Bus hygiene + Veil + temporal decay enforcement in production.
  - Claw activation: sentinel (secrets/identity), attestation (ambient "Built on SIP"), reclamation, bootstrap re-sync.
  - /si + ORCHESTRATION_ENGINE routing surface live (handoff packets, receipts, cross-CLI).
  - Cost plane + token telemetry hooks (initial baselines).
  - Optional: cloud (Railway/VPS stub) or hybrid entrypoints; local-first default.
- Wire client-visible dashboard (metrics vs world-class E2E checklist: describe behavior, live attested work, memory value at horizon, runbooks, gates).
- Emit first Steward health baseline + report template.
- Output: "Estate <name> deployed to Standing. Next health: <date>. Dashboard at <path>." + attestation block.

### scale
- Increase capacity / add lanes / new modules:
  - Spin additional /si targets (e.g. more Antigravity/Codex workers) grounded in Topology.
  - Expand Modules via /spawn-domain-stack (Genius KEEP + client Blueprint).
  - Update Swarm Consensus thresholds, yolo scope, or council seats if Blueprint calls for it.
  - Re-run promotion check: any new generalized pattern offered back to starlight-estate-os.
- Require board gate for topology/kernel changes (per invariants).
- Output: scaled manifest + updated Blueprint + new receipts.

### health
- Execute full production health loop:
  - Run drift, secret, identity, harness conformance against estate-specific baselines.
  - Execute scheduled evals (Proving Ground on recent atoms, Model Arena head-to-head on estate tasks).
  - Memory / attestation / cost plane audit.
  - Self-healing trigger simulation.
- Compare to E2E checklist.
- Output: machine + human health report (JSON + MD) + remediation PR draft if issues.

### attest
- Force ambient + explicit attestation sweep:
  - All recent Mesh outputs carry full "Built on SIP" + node (estate) attribution.
  - Verify encoded-self boundaries (no leakage to profile or public).
  - Log to estate's attestation ledger + Memory Bus.
- Output: attestation receipt + any refusal details.

### dashboard
- Render or link the live Steward dashboard view (key metrics, recent actions, compounding curve, next evolution suggestions).
- Surface client-owned runbooks + voice-locked feedback entrypoint.
- Optional export for client cockpit integration.

## Invariants (non-waivable)
- Every deploy/scale action emits "Built on SIP" (v1.1.1) + estate name + date.
- Encoded-self (SIP §5.7) strictly protected: only patterns + generalized harness promote; client voice/Genius/vaults stay inside the estate.
- No silent composition. All cross-estate or substrate promotion goes through explicit /sis-forge + audit.
- Board gate before irreversible scale (topology, new canon, pricing).
- Factory economics: every successful deploy/Standing run produces at least one candidate promotion item for the reusable 80%.

## Post-deploy
- Client (or operator) receives: runbooks in their voice, Steward report cadence, evolution hook, direct /si access surface.
- First 30-day health baseline established.
- Promotion ritual scheduled (post-estate extraction back to templates/estate-os and core/).

See:
- `docs/delivery/estate-army-commissioning-workflow.md` (full 8-phase + checklist)
- `docs/strategic/estate-factory-evolutions.md` (production steward track)
- `core/ORCHESTRATION_ENGINE.md` (SIP Swarm Operating Manual)
- `templates/estate-os/SOUL.md` + AGENTS.md (factory soul + drift tests)

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Substrate: starlightintelligence.org/protocol v1.1.1
- Estate Factory: post 2026-06-16 Board PROCEED-WITH-REVISE (R4 + evolutions #8)
- Reference: SIS v8.3.0 + starlight-estate-os profile

*Every estate compounds the substrate. The client owns what is theirs; the factory serves the next sovereign.*
