# Skill: energy-intelligence/sizing-architecture

> System sizing for solar PV, storage, thermal, and combined energy systems. Refuses LLM math — every numerical claim flows through `@starlight/calculators`. Sub-system 1 of 6 in the Energy Intelligence reference vertical.

**Status:** v0.1.0-scaffold — full protocol authored in v8.x cycle. Stub establishes activation contract + composition surface so the `starlight-energy-sizing` agent (authored in parallel by Energy IS tab) can auto-load this file without breakage.

**Domain:** Energy Intelligence
**Vertical:** Energy Intelligence reference vertical (sub-system: Sizing)
**Voice:** Frank DNA + operator-tier precision — refuses approximate-in-prose, names jurisdiction, encodes responsibility boundary.
**Disclaimer:** Sizing decisions touch electrical engineering, structural engineering, and grid interconnection regulations. This skill produces system-architecture sizing recommendations grounded in calculator output. Final designs require licensed-electrician review per jurisdiction-extended `licensed_electrician_review` validation requirement. Never authorize installer-required actions; surface them.

---

## Activation Triggers

**Keywords:** sizing, kW, kWh, capacity, load profile, solar PV, photovoltaic, panel count, inverter sizing, battery sizing, storage sizing, thermal sizing, heat pump sizing, EV charger sizing, peak demand, base load, solar irradiance, capacity factor, derating.

**Agents:** `starlight-energy-sizing` (primary), `starlight-energy-cost` (paired — sizing informs cost), `starlight-energy-grid` (interconnection-bound sizing constraints).

**Intents:** sizing-design, capacity-recommendation, load-profile-analysis, system-component-spec.

**Commands (planned, authored in v8.x command-pass):** `/energy-sizing`, `/energy-load-profile`, `/energy-derate-check`.

---

## Research grounding

This skill is grounded in published engineering standards and operator practice — claims cite direction, not specific numbers; specific numbers come from `@starlight/calculators`.

- **NREL System Advisor Model (SAM) methodology** — capacity factor + derating + degradation per panel chemistry + climate zone.
- **IEEE 1547 (interconnection)** — sizing constraints per grid voltage class + utility tariff structure.
- **IEC 61724 (PV performance monitoring)** — measurement contract sizing must satisfy.
- **PVGIS / NSRDB / TMY3 datasets** — irradiance + climate inputs for capacity factor calculation (jurisdiction-extended).
- **DOE Solar Futures Study + Lawrence Berkeley Lab** — operator-tier benchmarks for residential, commercial, utility-scale sizing patterns.

The bundle (load profile + irradiance + derating + interconnection constraint) is stable across literature; specific values move per jurisdiction and panel chemistry.

---

## Protocol — outline (full content v8.x)

### Step 1: Establish jurisdiction
Before sizing, name the user's jurisdiction. All downstream `ValidationRequirement` instances resolve jurisdiction-extended (e.g., German `VDE-AR-N 4105` interconnection vs. US `IEEE 1547` vs. UK `G99`). If user cannot name jurisdiction, refuse to size — surface the question.

### Step 2: Load profile
Capture or estimate hourly load profile for sizing horizon (annual + design-day). Sources: utility interval data, sub-meter readings, archetype profiles per occupancy class. Composes with `@starlight/schemas` `EnergyProfile` shape.

### Step 3: Resource profile
Pull jurisdiction-extended irradiance / climate data via calculator. Never approximate from memory.

### Step 4: System candidate generation
Generate 2-4 sizing candidates per chemistry / topology variant. Each candidate carries `CalculatorResult<SizingOutput>` with assumptions + confidence + warnings + required validation.

### Step 5: Constraint application
Apply interconnection constraint, structural constraint, electrical-panel-capacity constraint, budget envelope, regulatory caps. Some candidates eliminated.

### Step 6: Recommendation + validation surface
Recommend 1-2 surviving candidates. Surface every `ValidationRequirement` that gates installation: `licensed_electrician_review`, `structural_engineering_review` (if rooftop), `grid_operator_confirmation` (if interconnection-bound), jurisdiction-extended permits. Agent NEVER says "this is approved." Agent says "here is the requirement; here is who authorizes."

### Step 7: Cost handoff
Selected candidate(s) flow to `energy-intelligence/cost-modeling` skill for LCOE / payback / financing modeling.

---

## Out of scope

- Authorization of installation (always surfaces requirement, never authorizes)
- Personality-as-primary signal (sizing is engineering, not vibes — same posture as Hiring)
- Approximate-in-prose numerical claims (always points at calculator)
- Cross-jurisdiction generic recommendations (refuses generic; demands jurisdiction)

---

## Quality gates

- **No bare numbers in agent prose** — every kW, kWh, $, %, year MUST cite calculator function or refuse.
- **Jurisdiction named or refuse** — generic sizing without jurisdiction is not shipped.
- **Validation surface complete** — at least one `ValidationRequirement` per candidate, with severity-hint resolution per substrate convention.
- **Composes with Cost** — sizing artifact MUST be readable by cost-modeling skill (schema-conformant output).

---

## Composes with

- `@starlight/schemas` — `SovereignNode` + `EnergyProfile` + `LoadProfile` (planned)
- `@starlight/calculators` — sizing calculators (LoadProfileAnalyzer, CapacityFactorCalculator, DeratingCalculator)
- `@starlight/validation` — surfaces jurisdiction-extended validation requirements
- `energy-intelligence/cost-modeling` — downstream consumer
- `energy-intelligence/grid-integration` — bidirectional (grid constrains sizing; sizing requires grid confirmation)

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-04 (Tier 2e support, authored by SIS queen during Energy IS agent dispatch)
- Full protocol: planned v8.x
