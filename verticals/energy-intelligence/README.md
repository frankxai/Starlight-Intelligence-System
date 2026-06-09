# Energy Intelligence

> Sovereign energy operating layer. Composition · production · catalog of energy systems for the human side of energy ops — sized, costed, validated, governed by jurisdiction-extended responsibility boundaries.

## Status

**Scaffold v0.1.0-scaffold shipped 2026-05-03.** Per `/starlight-board` verdict at `docs/boards/2026-05-03-energy-is-domain-substack.md` (PROCEED, sequencing-gated on Calculator/Validation substrate landing first — landed in this same PR via `packages/calculators` + `packages/validation` + `packages/schemas`).

Foundation files (this 7-file contract) ship in this PR. Full content per sub-system, agent definitions, and 20-30 commands are v8.x scope.

## Position in the substrate

Energy IS is the **4th reference Domain Sub-Stack**, joining People Intelligence, Sound Intelligence, and Music IS at the Domain Sub-Stack Tier. It is the first reference vertical that uses the new Calculator + ValidationRequirement substrate — sets the precedent for infrastructure-shaped sub-stacks (Compute, Home, Capital).

## Soul (TL;DR)

Energy practiced as the architecture of sovereign infrastructure — every sizing decision grounded in measurable demand, every cost projection deterministic and auditable, every irreversible action gated on the right human reviewer (licensed electrician, certified installer, grid operator).

LLMs propose framings; calculators produce numbers; validation requirements gate actions. This vertical refuses pure-LLM "AI says install this" framings — they are unauditable and legally indefensible.

## Sub-systems

6 numbered sub-systems plus 1 cross-cutting (Recovery). See `SUB-SYSTEMS.md` for the spec.

| # | Sub-system | Primary command (planned) |
|---|---|---|
| 1 | Sizing | `/energy-sizing` |
| 2 | Cost | `/energy-cost` |
| 3 | Installer | `/energy-installer-brief` |
| 4 | Operations | `/energy-ops` |
| 5 | Buyer | `/energy-buyer` |
| 6 | Grid | `/energy-grid` |
| ★ | Recovery (cross-cutting) | `/energy-recovery` |

## Composes with

- `@starlight/schemas` — every Energy IS entity is a `SovereignNode` with composable `EnergyProfile` + `CostProfile` (from this PR).
- `@starlight/calculators` — sizing, cost, payback, ROI, capacity all flow through deterministic Calculators.
- `@starlight/validation` — irreversible actions (install authorization, grid feed-in, financing approval) gate on jurisdiction-extended ValidationRequirement.

## Sovereign instances

Energy IS as shipped here is a **public reference vertical** — generic, jurisdiction-agnostic example. Frank's family business **PV-Lager** is a sovereign instance instantiated under `private/verticals/pv-lager/` per the privacy framework (see `docs/cross-repo-distributions/2026-05-03-private-pv-lager-energy.md`).

Other adopters fork this reference vertical to their own `private/` instances or sovereign-spawn forks.

## Refusals

Patterns this vertical refuses to ship:

- Pure-LLM numerical claims (sizing, cost, payback) without Calculator backing
- Authorization of installation, grid feed-in, or major financing without the jurisdiction-required validation reviewers
- Promises about regulatory compliance the substrate cannot verify
- Hidden or unstated assumptions in calculator outputs
- "AI does the math" marketing posture

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Substrate composed: [`@starlight/schemas`, `@starlight/calculators`, `@starlight/validation`]
- Vertical ratified: 2026-05-03 (Board verdict at `docs/boards/2026-05-03-energy-is-domain-substack.md`)
