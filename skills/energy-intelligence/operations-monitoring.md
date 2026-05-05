---
name: energy-intelligence/operations-monitoring
description: Use when designing post-install monitoring, performance verification, predictive maintenance, or warranty-claim lifecycle — the "is the system actually doing what we promised?" sub-system. Surfaces underperformance honestly. Sub-system 4 of 6 in the Energy Intelligence reference vertical. v0.1.0-scaffold.
type: domain-vertical
---

# Skill: energy-intelligence/operations-monitoring

> Post-install monitoring, performance verification, predictive maintenance, and warranty-claim lifecycle. The "is the system actually doing what we promised?" sub-system. Sub-system 4 of 6 in the Energy Intelligence reference vertical.

**Status:** v0.1.0-scaffold — full protocol authored in v8.x cycle.

**Domain:** Energy Intelligence
**Vertical:** Energy Intelligence reference vertical (sub-system: Operations)
**Voice:** Frank DNA + operator-tier precision — refuses "set it and forget it" framings; surfaces underperformance honestly; encodes the warranty boundary.
**Disclaimer:** Monitoring + maintenance recommendations require system-specific verification. Underperformance diagnoses surface candidates, not certainties — physical inspection by qualified technician finalizes diagnosis. Every warranty-claim path cites manufacturer + installer + jurisdiction-specific consumer protection.

---

## Activation Triggers

**Keywords:** monitoring, production data, energy yield, performance ratio, PR, capacity factor, soiling, shading, inverter fault, micro-inverter, optimizer, RMS, remote monitoring system, alarm, alert, derate, degradation, warranty claim, panel replacement, inverter replacement, IV curve, string-level diagnostics, underperformance.

**Agents:** `starlight-energy-operations` (primary), `starlight-energy-recovery` (when fault → outage), `starlight-energy-installer` (warranty-claim coordination).

**Intents:** performance-verification, fault-diagnosis, predictive-maintenance, warranty-claim-lifecycle, customer-reporting.

**Commands (planned):** `/energy-perf-check`, `/energy-fault-triage`, `/energy-warranty-claim`, `/energy-customer-report`.

---

## Research grounding

- **IEC 61724-1 (PV performance monitoring)** — measurement contract canonical.
- **NREL "PV System Performance Assessment"** — performance-ratio methodology.
- **Sandia PV Performance Modeling Collaborative** — degradation rate benchmarks per chemistry + climate.
- **EPRI inverter-failure databases** — replacement-rate benchmarks.
- **Field literature on soiling losses** — climate-zone soiling rates + cleaning cost-benefit thresholds.

The performance-ratio + capacity-factor + degradation-curve bundle is stable; specific benchmarks shift per chemistry generation.

---

## Protocol — outline (full content v8.x)

### Step 1: Performance baseline establishment
At commissioning + first 90 days, lock the expected-performance envelope per `@starlight/calculators` ProductionForecaster. Baseline carries `valid_as_of` + assumption set.

### Step 2: Continuous monitoring contract
Define monitoring data flow — interval data, KPIs computed, alarm thresholds, notification routing. Performance ratio computed daily; capacity factor computed monthly; degradation curve fit annually.

### Step 3: Underperformance diagnosis
When PR drops below threshold, fault-tree triage: weather (resource), soiling, shading change, string-level fault, inverter fault, panel-level fault. Each branch carries diagnostic protocol + escalation criteria.

### Step 4: Predictive maintenance
Inverter end-of-life curves, panel degradation tracking, scheduled cleaning cost-benefit per soiling zone. Maintenance schedule generated as `MaintenanceCalendar` artifact, schema-conformant.

### Step 5: Warranty-claim lifecycle
When fault attributable to manufacturer / installer / warranty-covered failure: structured claim packet — diagnostic data, photos, IV curves, performance history, cite-able warranty terms. Claim-tracking state machine.

### Step 6: Customer reporting
Monthly + annual reports — production vs. baseline, performance ratio, kWh saved, $ saved at current tariff, environmental impact (kg CO2 avoided per jurisdiction-extended grid emission factor). All numbers calculator-grounded.

### Step 7: Validation surface
Surface `manufacturer_warranty_review` for warranty-covered claims; `utility_billing_reconciliation` for tariff-side anomalies. Never authorize claim — surface the path.

---

## Out of scope

- Future-production guarantees (always surfaces uncertainty band)
- Forensic-grade fault analysis (skill triages; full forensics requires field technician + IV curve tracer)
- Cross-system comparison without normalization (refuses; PR + capacity factor required)
- Tariff-side dispute resolution (utility's process; skill surfaces, doesn't escalate)

---

## Quality gates

- **Baseline locked at commissioning** — monitoring without baseline is theater
- **Performance ratio computed, not approximated** — `@starlight/calculators` only
- **Underperformance triage tree complete** — every alarm has named branches
- **Warranty-claim packet schema-conformant** — every claim includes the same artifacts
- **Monthly + annual report cadence** — never "we'll let you know if anything's wrong"

---

## Composes with

- `@starlight/schemas` — `PerformanceBaseline`, `MonitoringRecord`, `FaultDiagnosis`, `MaintenanceCalendar`, `WarrantyClaim`
- `@starlight/calculators` — ProductionForecaster, PerformanceRatioCalculator, DegradationFitter, EmissionFactorMapper
- `@starlight/validation` — surfaces manufacturer + utility validation requirements
- `energy-intelligence/installer-workflow` — receives handoff at commissioning
- `energy-intelligence/recovery-protocol` — fault → outage handoff
- `energy-intelligence/buyer-journey` — customer-side reporting voice

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-04
- Full protocol: planned v8.x
