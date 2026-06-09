# Energy Intelligence — Sub-Systems

7 sub-systems (6 numbered + 1 cross-cutting). Each owns a focused practice with its own primary command and (eventually) its own dedicated agent.

## 1. Sizing

**Purpose:** Match generation/storage capacity to demand under jurisdictional constraints.

**Inputs:** Annual demand profile, peak demand, roof/site area, jurisdiction, equipment preferences.

**Outputs (Calculator-backed):** Recommended PV capacity (kWp), battery capacity (kWh), inverter sizing, panel count estimate, expected annual yield.

**Validation requirements:** `site_survey_required` always. Jurisdiction-extended: `certified_installer_review_<jurisdiction>` for any capacity > X kWp.

**Primary command (planned):** `/energy-sizing`

## 2. Cost

**Purpose:** Capital and operational economics — CapEx, OpEx, payback period, NPV, IRR.

**Inputs:** Sizing recommendation, regional pricing data, financing assumptions (term, rate, down payment), tariff structure.

**Outputs (Calculator-backed):** Total CapEx, OpEx by year, payback range, NPV at hurdle rate, IRR, sensitivity to tariff change.

**Validation requirements:** `financial_advisor_review` if size triggers material spend. `tax_advisor_review` if depreciation/incentive claims appear.

**Primary command (planned):** `/energy-cost`

## 3. Installer

**Purpose:** Installer-side enablement. Project briefs, certified-installer routing, site-survey scheduling.

**Inputs:** Sizing + cost outputs, customer location, installer-network availability.

**Outputs:** Generic installer-project-brief markdown bundle (specs, drawings, expected timeline, validation requirements satisfied).

**Validation requirements:** `licensed_electrician_review_<jurisdiction>`, `manufacturer_spec_check`.

**Primary command (planned):** `/energy-installer-brief`

## 4. Operations

**Purpose:** Day-to-day yield monitoring, fault detection, predictive maintenance.

**Inputs:** Live telemetry (when available), historical yield, weather forecast, maintenance schedule.

**Outputs:** Anomaly flags, maintenance recommendations, yield-vs-expected reports, deplatform-recovery protocols.

**Validation requirements:** Vary — `manufacturer_spec_check` on warranty-affecting work; `licensed_electrician_review_<jurisdiction>` on any work touching the grid-tied side.

**Primary command (planned):** `/energy-ops`

## 5. Buyer

**Purpose:** Buyer-side clarity. What to ask, what to refuse, what to verify when receiving an installer's quote.

**Inputs:** Quote received from a third-party installer, customer's profile.

**Outputs:** Quote-validation report, list of red flags, list of verifications buyer should perform, list of negotiation positions.

**Validation requirements:** `human_review` always. Optional `legal_review` if quote involves long-term lease or PPA.

**Primary command (planned):** `/energy-buyer`

## 6. Grid

**Purpose:** Grid-side compliance — feed-in tariffs, regulatory approvals, grid-operator confirmations.

**Inputs:** Installation specs, jurisdiction.

**Outputs:** Required grid-operator forms, expected approval timeline, compliance checklist, feed-in tariff projections.

**Validation requirements:** `grid_operator_confirmation_<jurisdiction>` always. `legal_review` for non-residential / commercial scale.

**Primary command (planned):** `/energy-grid`

## ★ Recovery (cross-cutting)

**Purpose:** Storm, grid-failure, battery-fault, deplatform recovery protocols. Cross-cutting because resilience needs to be designed at every sub-system interface.

**Inputs:** Operational telemetry + scenario specification.

**Outputs:** Recovery playbook per scenario, communication templates for stakeholders, post-incident review structure.

**Validation requirements:** Vary by recovery action.

**Primary command (planned):** `/energy-recovery`

## Composition rules

- **Sizing before Cost.** Cost is meaningless without a size to cost. Sizing must run (even in shadow mode) before Cost is invoked.
- **Validation gates ARE the user's permission.** A Calculator output with unsatisfied `required_validation` is NOT a green-light.
- **Buyer-side and Installer-side are mirror sub-systems.** Same equation, different sovereign on each side. Buyer protects the buyer; Installer protects the installer. Both are honest.
- **Recovery runs continuously.** It is not a phase, it is a posture. Every other sub-system designs its outputs assuming Recovery will need to use them in adverse scenarios.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Substrate composed: [`@starlight/schemas`, `@starlight/calculators`, `@starlight/validation`]
- Scaffold: 2026-05-03
