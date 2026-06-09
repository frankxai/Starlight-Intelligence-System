---
name: energy-intelligence/grid-integration
description: Use when designing utility interconnection, tariff structure resolution, or grid-side coordination — encodes the regulated-market reality (jurisdiction-specific rules, named grid operator, named tariff schedule, named interconnection standard). Refuses cross-jurisdiction generic advice. Sub-system 6 of 6 in the Energy Intelligence reference vertical. v0.1.0-scaffold.
type: domain-vertical
---

# Skill: energy-intelligence/grid-integration

> Utility interconnection, tariff structure resolution, and grid-side coordination. Encodes the regulated-market reality — different jurisdiction, different rules, different grid operator. Sub-system 6 of 6 in the Energy Intelligence reference vertical.

**Status:** v0.1.0-scaffold — full protocol authored in v8.x cycle.

**Domain:** Energy Intelligence
**Vertical:** Energy Intelligence reference vertical (sub-system: Grid)
**Voice:** Frank DNA + jurisdiction-precision — refuses cross-jurisdiction generic advice; names the grid operator + tariff schedule + interconnection standard explicitly.
**Disclaimer:** Grid integration is the most jurisdiction-bound sub-system. Every interconnection rule, tariff schedule, and grid-operator process is jurisdiction-extended and time-variant. This skill produces architecture-of-engagement; the actual interconnection application is filed by the licensed installer with the named utility under the named standard. Refuses to authorize.

---

## Activation Triggers

**Keywords:** interconnection, grid, utility, AHJ, authority having jurisdiction, IEEE 1547, VDE-AR-N 4105, G99, G98, smart inverter, anti-islanding, ride-through, voltage support, frequency support, net metering, NEM, NEM 3.0, feed-in tariff, FIT, time-of-use, TOU, demand response, virtual power plant, VPP, aggregator, distribution operator, DSO, transmission operator, TSO.

**Agents:** `starlight-energy-grid` (primary), `starlight-energy-sizing` (interconnection-bound sizing constraints), `starlight-energy-cost` (tariff-driven cost), `starlight-energy-installer` (filing path coordination).

**Intents:** interconnection-feasibility, tariff-resolution, grid-standard-compliance, vpp-program-evaluation, application-coordination.

**Commands (planned):** `/energy-grid-interconnect-check`, `/energy-grid-tariff-resolve`, `/energy-grid-vpp-eval`, `/energy-grid-application-coord`.

---

## Research grounding

- **IEEE 1547-2018** — US-default interconnection standard.
- **VDE-AR-N 4105 + VDE-AR-N 4110** — German low/medium-voltage interconnection.
- **G98 / G99** — UK low-voltage / above-3.68kW interconnection.
- **EU Network Codes (RfG, DCC, ER)** — EU-wide interconnection harmonization layer.
- **CAISO / ERCOT / PJM / European TSO market design literature** — wholesale-market interfaces relevant to behind-the-meter participation.
- **NEM 3.0 / state PUC tariff orders** — US net-metering successor regimes.
- **EPRI smart-inverter and Volt-VAR research** — grid-services literature.

The pattern: every jurisdiction has its standard; the standards are stable but versioned; cross-citation requires the version + effective date.

---

## Protocol — outline (full content v8.x)

### Step 1: Jurisdiction lock + standard naming
First action: name the user's jurisdiction → grid operator → applicable interconnection standard (with version + effective date). Refuses to proceed without this triple.

### Step 2: Interconnection feasibility
Screening: voltage class, size class, hosting capacity (where published), pre-application engineering review pathway. Output: `feasibility = likely | uncertain | unlikely | requires_engineering_review` with rationale.

### Step 3: Tariff resolution
Pull jurisdiction-extended retail rate schedule, time-of-use bands (if any), demand charges (if any), net metering rules, feed-in tariff (if any), export-rate compensation regime. Every input cited with effective date.

### Step 4: Smart-inverter requirement check
Per IEEE 1547-2018 / VDE-AR-N / G99 / region-equivalent — required modes: anti-islanding, voltage ride-through, frequency ride-through, Volt-VAR / Volt-Watt. Names the inverter compliance level required.

### Step 5: VPP / aggregator program evaluation (where applicable)
Where the buyer's region has an active VPP or DR aggregator program, surface options + economic terms + lock-in risk + opt-out provisions. Refuses to recommend without buyer-context fit.

### Step 6: Application coordination architecture
Pre-application meeting (if AHJ pattern), study fees, application packet structure, expected timeline (with jurisdiction-band — never single-point), interconnection agreement review checklist.

### Step 7: Validation surface
Surface every grid-side validation requirement: `grid_operator_confirmation`, `utility_interconnection_agreement`, `smart_inverter_compliance_certification`. Refuses to file. Refuses to authorize.

---

## Out of scope

- Cross-jurisdiction generic interconnection advice (refuses; demands jurisdiction)
- Filing the interconnection application (licensed installer's role)
- Tariff-rate guarantees (rates change; always carries effective date)
- VPP earnings projection without operator-named lock-in / opt-out terms (refuses)
- Wholesale-market participation design (out of substrate scope; flags to qualified specialist)

---

## Quality gates

- **Jurisdiction triple named or refuse** — jurisdiction → operator → standard with version + date
- **Interconnection feasibility scored** — never "looks fine"; always one of `likely | uncertain | unlikely | requires_engineering_review`
- **Tariff schedule cited with effective date** — no undated rate references
- **Smart-inverter compliance named** — inverter-shopping list cites compliance level required
- **Timeline carries band** — jurisdiction-variant; never single-point promise

---

## Composes with

- `@starlight/schemas` — `JurisdictionTriple`, `InterconnectionFeasibility`, `TariffSchedule`, `SmartInverterRequirement`
- `@starlight/calculators` — TariffImpactCalculator (paired with cost-modeling), HostingCapacityChecker (where published)
- `@starlight/validation` — primary surface for grid-side jurisdiction-extended validations (most reside here)
- `energy-intelligence/sizing-architecture` — bidirectional (grid constrains sizing; sizing constrains feasibility class)
- `energy-intelligence/cost-modeling` — tariff inputs flow downstream
- `energy-intelligence/installer-workflow` — application coordination

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-04
- Full protocol: planned v8.x
