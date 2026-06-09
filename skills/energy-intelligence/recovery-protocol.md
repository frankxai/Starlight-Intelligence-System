---
name: energy-intelligence/recovery-protocol
description: Use when designing cross-cutting resilience — disaster recovery, deplatform recovery, manufacturer-failure recovery, installer-bankruptcy recovery. The "what if everything goes wrong" sub-system. Adapted from sound-catalog-deplatform-recovery for energy. Cross-cutting (1) of the Energy Intelligence reference vertical. v0.1.0-scaffold.
type: domain-vertical
---

# Skill: energy-intelligence/recovery-protocol

> Cross-cutting resilience — disaster recovery, deplatform recovery, manufacturer-failure recovery, installer-bankruptcy recovery. The "what if everything goes wrong" sub-system. Cross-cutting (1) of the Energy Intelligence reference vertical, paired against the 6 sub-system heads.

**Status:** v0.1.0-scaffold — full protocol authored in v8.x cycle.

**Domain:** Energy Intelligence (cross-cutting)
**Vertical:** Energy Intelligence reference vertical
**Voice:** Frank DNA + sovereignty-first — refuses platform-trust assumptions; encodes the "preserve, pattern-recognize, recover" loop borrowed from `sound-catalog-deplatform-recovery` and adapted to energy.
**Disclaimer:** Recovery protocols are pre-event architecture. Live disaster response requires qualified emergency / restoration personnel; this skill produces the playbook the system + buyer + operator follow when rare events fire.

---

## Activation Triggers

**Keywords:** disaster, outage, blackout, brownout, grid down, hurricane, fire, flood, freeze, manufacturer bankruptcy, installer bankruptcy, deplatform, monitoring service shutdown, panel-recall, inverter-recall, warranty-failure, force majeure, utility-disconnect, deplatform-recovery, resilience, off-grid bridge, backup, islanding, microgrid.

**Agents:** `starlight-energy-recovery` (primary, cross-cutting), `starlight-energy-operations` (fault → outage handoff), `starlight-energy-installer` (warranty-claim coordination), `starlight-energy-grid` (utility-side coordination during outage).

**Intents:** disaster-readiness, outage-protocol, deplatform-readiness, warranty-failure-recovery, installer-failure-recovery, monitoring-failure-recovery.

**Commands (planned):** `/energy-recovery-readiness`, `/energy-recovery-outage`, `/energy-recovery-deplatform`, `/energy-recovery-warranty-failure`, `/energy-recovery-installer-failure`.

---

## Research grounding

- **DOE / NREL "Power Outage Resilience" research** — outage-frequency + duration trends per region.
- **Sandia / EPRI microgrid + islanding literature** — islanding-capable system design.
- **FEMA disaster-preparedness guidance** — household + small-business resilience planning.
- **PV-Lager operator practice on warranty failures + manufacturer bankruptcies** — German installer-side reality on stranded-warranty scenarios.
- **Sound-IS deplatform-recovery skill** — pattern source for "preserve, pattern-recognize, recover" loop.

The pattern from the sound vertical: when a platform / supplier / channel fails, you preserve what you have, pattern-recognize what's recoverable, and architect the recovery path BEFORE the event, not during.

---

## Protocol — outline (full content v8.x)

### Step 1: Readiness audit
At commissioning + annually: which failure modes is this system / buyer / operator vulnerable to? Audit: monitoring-service dependency, manufacturer warranty-residual, installer-business-continuity, grid-outage-frequency, regional-disaster-class.

### Step 2: Per-failure-mode protocol library
For each named failure mode, a protocol. Each protocol carries: detection signal, immediate-response steps, escalation path, recovery-time target, post-recovery review.

### Step 3: Outage protocol (most-common failure mode)
Grid outage: islanding behavior (if hardware-capable), critical-load isolation, generator-bridge integration (if installed), customer communication, restoration-time tracking. PV-Lager-grounded: ~10% of installations have backup-capable hardware; the protocol differs.

### Step 4: Deplatform readiness
Monitoring-service shutdown / panel-manufacturer-API removal / installer-portal deprecation: data export readiness, alternate-monitoring-source identification, schema-conformant local cache, cite-able historical baseline preserved.

### Step 5: Warranty / manufacturer failure
Manufacturer bankruptcy + insolvency proceedings + UCC stranded-warranty scenarios — pre-event architecture preserves the right artifacts (photos, IV curves, performance history) so claims can land in successor entity, insurance, or jurisdictional consumer-protection process.

### Step 6: Installer failure
Installer bankruptcy / closure: warranty-residual transfer paths, monitoring-service continuity, maintenance-relationship continuity, jurisdiction-specific bond / consumer-protection coverage.

### Step 7: Post-event review + memory update
Every fired event becomes a memory entry. Pattern recognition across events feeds back into Step 1 readiness audit. The skill gets smarter session-to-session.

---

## Out of scope

- Live emergency response (qualified personnel; skill is pre-event architecture)
- Insurance claim filing (skill produces packet; buyer / operator files)
- Litigation strategy (counsel; skill flags the surfaces)
- Microgrid design from scratch (out of substrate scope; flags to qualified specialist)

---

## Quality gates

- **Readiness audit at commissioning + annually** — never reactive-only
- **Per-failure-mode protocol exists** — every named mode has a documented protocol, not a vibes
- **Pre-event artifacts preserved** — photos, IV curves, baseline, contracts, warranty terms all schema-conformant + retrievable
- **Post-event review fires** — every event updates the playbook
- **Cross-cutting composition** — every sub-system surfaces failure modes back to recovery, not in silos

---

## Composes with

- `@starlight/schemas` — `FailureMode`, `RecoveryProtocol`, `ReadinessAudit`, `PostEventReview`
- `@starlight/calculators` — `OutageImpactCalculator`, `RecoveryTimeEstimator`
- `@starlight/validation` — surfaces emergency-response, insurance-review, counsel-review validations
- `energy-intelligence/operations-monitoring` — fault → outage handoff
- `energy-intelligence/installer-workflow` — installer-side recovery coordination
- `energy-intelligence/grid-integration` — utility-side coordination during outage
- `sound-intelligence/sound-catalog-deplatform-recovery` — pattern parent (cross-vertical)

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-04
- Full protocol: planned v8.x
- Pattern source: sound-IS deplatform-recovery, adapted to energy domain
