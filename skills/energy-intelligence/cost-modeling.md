# Skill: energy-intelligence/cost-modeling

> LCOE, payback, financing structure, and total-cost-of-ownership modeling for energy systems. Every number flows through `@starlight/calculators`. Sub-system 2 of 6 in the Energy Intelligence reference vertical.

**Status:** v0.1.0-scaffold — full protocol authored in v8.x cycle.

**Domain:** Energy Intelligence
**Vertical:** Energy Intelligence reference vertical (sub-system: Cost)
**Voice:** Frank DNA + operator-tier precision — refuses approximate-in-prose; names assumptions; surfaces sensitivity.
**Disclaimer:** Cost modeling produces engineering / finance projections, not investment advice. Tax credits, utility tariffs, and incentive programs are jurisdiction-extended and time-variant. Every output carries `valid_as_of` timestamp + assumption list. Final financial decisions require qualified counsel + verified tariff schedule.

---

## Activation Triggers

**Keywords:** LCOE, levelized cost, payback, ROI, IRR, NPV, financing, lease, PPA, power purchase agreement, capex, opex, tariff, time-of-use, TOU, demand charge, net metering, incentive, ITC, investment tax credit, depreciation, MACRS, feed-in tariff, FIT, cost of energy.

**Agents:** `starlight-energy-cost` (primary), `starlight-energy-sizing` (paired — cost depends on sizing), `starlight-energy-buyer` (cost framing for end-buyer), `starlight-energy-grid` (tariff inputs).

**Intents:** lcoe-calculation, payback-analysis, financing-comparison, sensitivity-modeling, tariff-impact.

**Commands (planned):** `/energy-payback`, `/energy-lcoe`, `/energy-financing-compare`, `/energy-tariff-impact`.

---

## Research grounding

- **NREL System Advisor Model (SAM) financial methodology** — LCOE, payback, financing structure canonical formulas.
- **DOE / Lawrence Berkeley Lab "Tracking the Sun"** — operator-tier installed-cost benchmarks per system class.
- **IEA World Energy Outlook** — capital cost trajectories + technology learning curves (jurisdiction-extended where regional).
- **IRS Publication 946 + state-specific DSIRE database** — tax credit + incentive resolution.
- **EIA Form 861 + utility tariff schedules** — jurisdiction-extended retail rate inputs.

Specific dollar values move quarterly; the structure (capex + opex + financing + incentive + tariff offset) is stable.

---

## Protocol — outline (full content v8.x)

### Step 1: Inherit sized system
Cost modeling never sizes. Receives `SizingResult` from `energy-intelligence/sizing-architecture` skill. If no upstream sizing artifact, refuses to compute and routes user to sizing.

### Step 2: Capex resolution
Component cost resolution per jurisdiction + supplier class. Composes with `@starlight/calculators` capex calculator. Carries assumption list (panel chemistry pricing, inverter class, BOS markup, soft-cost ratio, installer overhead).

### Step 3: Opex projection
Annual O&M, insurance, monitoring, inverter replacement schedule, panel degradation curve. Per-jurisdiction insurance + property-tax adjustments.

### Step 4: Tariff + incentive surface
Jurisdiction-extended retail rate schedule, time-of-use bands, demand charges, net metering rules, feed-in tariff, ITC / state-specific incentives. Every input cited + dated.

### Step 5: Financing structure comparison
Cash purchase vs. loan vs. lease vs. PPA. Each option produces `LCOE`, `payback_years`, `cumulative_cash_flow_curve`, `risk_profile`. Side-by-side comparison.

### Step 6: Sensitivity analysis
Vary tariff growth rate, degradation rate, financing rate, panel cost. Show top-3 levers. Honest about uncertainty band — never single-point projections.

### Step 7: Validation surface
Surface jurisdiction-extended `tax_advisor_review` (when tax credits material), `utility_interconnection_confirmation` (when net metering material). Refuses to authorize.

---

## Out of scope

- Investment advice (calculator output, not advice)
- Future utility rate guarantees (always surfaces uncertainty band)
- Cross-border financing structures (refuses; demands jurisdiction)
- Crypto / token financing structures (refuses — out of substrate scope)

---

## Quality gates

- **No bare $ in agent prose** — every dollar amount cites calculator + assumption set + valid_as_of date.
- **Sensitivity always shown** — single-point payback or LCOE never shipped without ±band.
- **Tariff schedule dated** — utility rates change; output carries the schedule's effective date.
- **Three financing options minimum** — never one-option recommendation without comparison.

---

## Composes with

- `@starlight/schemas` — `CostProfile`, `FinancingOption`, `TariffSchedule`
- `@starlight/calculators` — LCOECalculator, PaybackCalculator, NPVCalculator, SensitivityCalculator
- `@starlight/validation` — surfaces jurisdiction-extended financial-validation requirements
- `energy-intelligence/sizing-architecture` — upstream input
- `energy-intelligence/buyer-journey` — downstream framing for end-buyer
- `energy-intelligence/grid-integration` — tariff inputs

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-04
- Full protocol: planned v8.x
