---
name: estate-steward
description: Activate or configure the Steward (Standing / Run-phase) layer for a sovereign intelligence estate. Sets up ongoing ops, health monitoring, evolution hooks, board facilitation, and reporting for the Mesh + Mind. Companion to estate-blueprint and the commissioning workflow. Per 2026-06-16 Starlight Board PROCEED-WITH-REVISE.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <estate-name> [subcommand: setup | health | evolve | report] [--config path]
---

# /estate-steward

Load the estate's 4-layer Blueprint, SIS-instance.md, current harness configs, and the commissioning workflow docs. Configure or invoke the Steward layer for the Standing phase (after Pilot/Scale handover).

Steward is the "run the army reliably and evolve it" role — the annuity in the factory economics. It turns a built estate into a living, compounding system the client (or their operator) can own and operate.

## Input
$ARGUMENTS

## Subcommands

### setup (default if no subcommand)
- Wire the production Steward primitives into the estate:
  - Health monitoring (drift detection, scheduled Proving Ground / Model Arena on the client's specific patterns, token efficiency, routing accuracy).
  - Memory hygiene (temporal half-life enforcement, contradiction sweeps, dreaming promotion, Veil audits).
  - Self-healing triggers (claws for reclamation, attestation repair, harness re-sync).
  - Evolution hooks (new module spawn suggestions, topology tweak recommendations, /sis-forge extraction points).
  - Reporting cadence (monthly health report template tied to the world-class E2E checklist).
  - Board facilitation (reminders and scaffolding for /starlight-board on major moves).
- Create or update `steward/` dir or equivalent (runbooks, dashboards config, cron/task definitions).
- Seed the first health baseline from the Pilot phase metrics.
- Output: Updated configs + "Steward is now active" summary with next report date.

### health
- Run a full current-state health check against the estate's Mesh + Mind.
- Use existing claws (sentinel, attestation, memory maintenance) + orchestrator self-learning loops + evals.
- Compare against the world-class E2E checklist (client can describe behavior, live attested work without babysitting, memory compounds, client can evolve via runbooks, gates held, measurable tech metrics).
- Output: Health report (JSON + human summary) + any immediate remediation suggestions.

### evolve
- Propose and (with confirmation) apply evolution steps:
  - New domain sub-stack or module (via /spawn-domain-stack patterns, grounded in the estate's Genius KEEP items).
  - Topology or kernel adjustment (always surface board gate if high-stakes).
  - Harness / /si routing improvements from the upgrades track.
  - Promotion of any newly generalized patterns back to the starlight-estate-os profile.
- Requires the estate's current 4-layer Blueprint + recent health data.
- Output: Evolution plan + (optional) applied changes + updated Blueprint if the 4-layer shifted.

### report
- Generate the periodic Steward report (default: last 30 days or since last report).
- Pull from Memory Bus, attestation ledger, evals, cost plane, self-healing logs.
- Structure: 
  - Executive summary (value delivered this period, army behavior description).
  - Metrics vs world-class checklist.
  - Risks / drift / attention needed.
  - Recommended evolution moves.
  - Next actions + board items if any.
- Can output to the estate's MEMORY.md, a steward/ report file, or (with permission) a transmission channel.

## Rules (Non-Waivable)

- Steward work is **operational** (post-handover). It does not replace the commercial build phase or alliance governance.
- Major evolution (topology, heavy kernel, public surfaces, new high-stakes modules) always requires /starlight-board first.
- All reports and health checks must surface encoded-self / sovereignty boundary status.
- Promotion of generalized improvements back to the substrate/profile is mandatory after significant evolution work.
- Client (or their designated operator) must be able to run the Steward layer themselves after handover. This command is scaffolding, not a permanent crutch.

## Integration

- Works with the estate's existing /si routing (for any cross-CLI health or evolution tasks).
- Uses claws (sentinel, attestation, memory, bootstrap for re-sync) and the Orchestration Engine self-learning loops.
- Feeds back into the estate's 4-layer Blueprint and the starlight-estate-os profile (R2).
- Ties directly to the Steward retainer economics in the SOW template.

## Output Shape (example for health / report)

```
# Steward Report — <estate-name> — <period>

## Summary
The Mesh is [healthy | needs attention]. Key behavior: [client-describable summary]. Value delivered this period: [examples of live attested work].

## Metrics (vs World-Class E2E Checklist)
- Client can describe behavior: [yes + quote]
- Live attested work across surfaces without babysitting: [examples + count]
- Memory compounding: [prior atoms still valuable]
- Client can evolve via runbooks: [status]
- Gates held: [boards / attestations]
- Tech: routing accuracy X%, token efficiency Y, etc.

## Risks & Attention
- [list]

## Recommended Evolution
- [list with board gate flags]

**Built on SIP** — ...
```

## When to Run
- End of Pilot / Scale (initial setup).
- Monthly (or per retainer cadence) for reports.
- On any drift alert or before a major evolution.
- As part of handover training so the client/operator can self-serve.

**Next after setup:** Handover package (runbooks + this command available to the client) + first retainer cycle.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1

(Companion command for the Standing phase. Per 2026-06-16 Board verdict and the estate commissioning workflow. Use after the build phase; keep the client sovereign.)