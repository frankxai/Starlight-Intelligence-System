---
name: energy-intelligence/installer-workflow
description: Use when designing operator-tier workflow for installer companies — lead intake, site survey, design, permitting, installation, commissioning, handoff. Shifts responsibility from operator toward structured self-service, installer enablement, and buyer clarity. Sub-system 3 of 6 in the Energy Intelligence reference vertical. v0.1.0-scaffold.
type: domain-vertical
---

# Skill: energy-intelligence/installer-workflow

> Operator-tier workflow design for installer companies — lead intake, site survey, design, permitting, installation, commissioning, handoff. The PV-Lager-bound skill: shifts responsibility from operator toward structured self-service, installer enablement, and buyer clarity. Sub-system 3 of 6 in the Energy Intelligence reference vertical.

**Status:** v0.1.0-scaffold — full protocol authored in v8.x cycle.

**Domain:** Energy Intelligence
**Vertical:** Energy Intelligence reference vertical (sub-system: Installer)
**Voice:** Frank DNA + installer-operator clarity — refuses HR-fluff "great culture" framings; refuses inflated lead-conversion claims; encodes the "shift responsibility" rule.
**Disclaimer:** Installer workflow design is operational architecture, not licensed installation work. Skill produces process design + checklists + permit-trail templates. Every installation step cites jurisdiction-extended `licensed_electrician_review` and `permit_pull` validation requirements.

---

## Activation Triggers

**Keywords:** installer, installer ops, lead intake, site survey, MPU, main panel upgrade, permit, AHJ, authority having jurisdiction, commissioning, PTO, permission to operate, interconnection application, work order, technician, dispatch, installation crew, quality assurance, callback, warranty claim, deplatform-recovery, installer-operator.

**Agents:** `starlight-energy-installer` (primary), `starlight-energy-operations` (post-install handoff), `starlight-energy-grid` (interconnection coordination), `starlight-energy-recovery` (deplatform / disaster).

**Intents:** lead-intake-design, site-survey-protocol, design-approval-flow, permit-coordination, installation-checklist, commissioning-protocol, customer-handoff.

**Commands (planned):** `/energy-installer-intake`, `/energy-installer-survey`, `/energy-installer-permit`, `/energy-installer-commission`, `/energy-installer-handoff`.

---

## Research grounding

- **SEIA + IREC installer best-practice guides** — operator-tier workflow benchmarks.
- **NABCEP certification body of knowledge** — technician-side installation protocol.
- **DOE SunShot soft-cost reduction studies** — soft-cost dominates installed cost; workflow design is the lever.
- **PV-Lager operator practice** (Frank's family business, sovereign-instance grounding) — German installer-side reality.
- **AHJ permit-process variation literature** — permit times vary 10-100x across jurisdictions.

The PV-Lager constraint encoded here: **shift responsibility AWAY from operator toward structured self-service, installer enablement, and buyer clarity.** Operator does not absorb risk that belongs to buyer or installer.

---

## Protocol — outline (full content v8.x)

### Step 1: Lead intake architecture
Forms / call-script / web flow that collect the right inputs ONCE. Inputs route to sizing + cost skills, not back to phone tag. Refuses "we'll get back to you with a quote" pattern — collects enough at intake to surface a calculator-grounded preliminary number.

### Step 2: Site survey protocol
Roof / site / electrical-panel survey checklist + photo manifest + measurement protocol. Output is `SiteSurvey` schema-conformant artifact that downstream design can read.

### Step 3: Design + approval flow
Sized + cost-modeled artifact → buyer review → revision loop → signed approval. Every revision tracked. No "verbal change" accepted; every change goes through schema-conformant update.

### Step 4: Permit coordination
AHJ-specific permit packets. Pre-checked permit-likelihood per AHJ. Permit-pull tracking integrated with project state.

### Step 5: Installation checklist
Crew-side checklist by phase. Photos + measurements + sign-offs per step. Quality-assurance rubric anchored to NABCEP body of knowledge.

### Step 6: Commissioning + PTO
Utility interconnection application, inspection coordination, PTO confirmation. Customer never receives "we'll let you know when it's on" — receives state machine view.

### Step 7: Customer handoff to operations
Handoff packet: monitoring access, maintenance schedule, warranty claim path, expected production envelope (with sensitivity band, never single-point promise).

---

## Out of scope

- Authorization of installation (skill always surfaces `licensed_electrician_review`)
- Permit-time guarantees (jurisdiction-variant, always surfaces uncertainty)
- Sales-pressure tactics (refuses; the skill is about clarity, not closing)
- Lead-quality manipulation (skill produces honest intake, not optimized-for-conversion intake)

---

## Quality gates

- **PV-Lager constraint encoded** — every workflow surface checks: "does this shift responsibility AWAY from operator?"
- **Schema-conformant artifacts at every handoff** — `SiteSurvey`, `Design`, `PermitPacket`, `CommissioningReport`, `HandoffPacket`
- **Photo + measurement manifest at site survey** — never "estimated from memory"
- **Production envelope with band, not single-point** — at customer handoff
- **Validation surface complete** — every step that requires licensed authorization is named

---

## Composes with

- `@starlight/schemas` — `SiteSurvey`, `Design`, `PermitPacket`, `CommissioningReport`, `HandoffPacket`
- `@starlight/calculators` — preliminary sizing at intake (CapacityEstimator from inputs only)
- `@starlight/validation` — surfaces installer-required + permit-required + utility-required validations
- `energy-intelligence/sizing-architecture` + `cost-modeling` — upstream design pipeline
- `energy-intelligence/operations-monitoring` — downstream handoff
- `energy-intelligence/grid-integration` — utility-side coordination

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-04
- Full protocol: planned v8.x (encodes PV-Lager operator-tier reality as canonical reference instance)
