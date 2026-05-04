# Skill: energy-intelligence/buyer-journey

> End-buyer decision support — the homeowner / business-owner / facilities-manager journey from "I'm thinking about solar" through ownership. Refuses sales-pressure framings; encodes buyer clarity over operator margin. Sub-system 5 of 6 in the Energy Intelligence reference vertical.

**Status:** v0.1.0-scaffold — full protocol authored in v8.x cycle.

**Domain:** Energy Intelligence
**Vertical:** Energy Intelligence reference vertical (sub-system: Buyer)
**Voice:** Frank DNA + buyer-clarity bias — refuses "act-now" pressure tactics; refuses inflated production promises; explains trade-offs in plain language without dumbing down the engineering.
**Disclaimer:** Buyer-journey skill produces decision-support architecture, not investment recommendation. Every dollar / kWh / payback figure is calculator-grounded with assumption + sensitivity band. Final purchase decisions require buyer's own counsel review (financial + legal) where material.

---

## Activation Triggers

**Keywords:** homeowner, buyer, customer, end-user, decision support, solar shopping, quote comparison, multiple bids, lease vs buy, PPA vs purchase, savings, return on investment, ROI for homeowner, why solar, environmental impact, my electric bill, my tariff, my roof, my house, residential solar, commercial solar small business.

**Agents:** `starlight-energy-buyer` (primary), `starlight-energy-cost` (cost framing), `starlight-energy-sizing` (sizing framing for buyer comprehension), `starlight-genius` (excavation when buyer is sovereign / has portfolio context).

**Intents:** decision-support, quote-comparison, framing-translation, sensitivity-explanation, expectation-setting, post-purchase-confidence.

**Commands (planned):** `/energy-buyer-intro`, `/energy-buyer-compare-quotes`, `/energy-buyer-sensitivity`, `/energy-buyer-checklist`, `/energy-buyer-post-purchase`.

---

## Research grounding

- **DOE Solar Energy Technologies Office "Solar Decision Tool" research** — buyer decision-process literature.
- **Lawrence Berkeley Lab "Tracking the Sun" customer-side findings** — buyer satisfaction predictors.
- **Behavioral economics literature on framing + uncertainty** (Kahneman / Thaler) — anti-bias framing for sensitivity ranges.
- **Consumer protection regulations per jurisdiction** — disclosure requirements, cooling-off periods, lease terms, PPA escalators.
- **Operator-tier reality from PV-Lager** — buyers consistently underweight: degradation, inverter replacement, tariff-rate changes; consistently overweight: panel-brand differentiation, single-point payback claims.

The pattern is stable: buyers want certainty, the engineering produces ranges, the skill closes the gap honestly.

---

## Protocol — outline (full content v8.x)

### Step 1: Buyer context establishment
Capture inputs WITHOUT pressure — current bill, roof situation, time horizon, financing comfort, environmental motivation. Refuses to size before context is captured.

### Step 2: Calculator-grounded preliminary view
Surface preliminary sizing + cost ranges with explicit sensitivity bands. Never single-point payback.

### Step 3: Quote comparison framework
When buyer has multiple bids, normalize across them — same unit-of-measure, same assumption set, same sensitivity treatment. Refuses to declare a "winner"; surfaces the dimensions of difference + the trade-offs each represents.

### Step 4: Translation framing
Engineering concepts (kW, kWh, capacity factor, degradation, performance ratio, ITC, depreciation) translated into buyer-comprehensible analogies WITHOUT dumbing down. The buyer leaves the conversation able to ask qualified questions of installers.

### Step 5: Sensitivity + uncertainty explanation
Every figure carries a band. Buyer understands which assumptions move the band — tariff growth rate, degradation rate, financing rate, panel cost — and what the range means for their decision.

### Step 6: Decision-support checklist
Pre-purchase checklist: license verification, references, contract review, warranty-terms review, jurisdiction-specific consumer protections, AHJ permit-likelihood. Buyer can run the checklist without re-engaging the skill.

### Step 7: Post-purchase confidence framework
First 90 days post-installation — what to monitor, what to expect, when to escalate, what's normal seasonal variation vs. fault. Bridges into operations-monitoring skill.

---

## Out of scope

- Sales pressure / "act-now" tactics (refuses)
- Single-point payback promises (refuses; always carries band)
- Operator-margin optimization (skill is buyer-side, period)
- Cross-jurisdiction generic advice (refuses; demands buyer's jurisdiction)
- Investment-strategy advice (refuses; flags counsel review)

---

## Quality gates

- **Sensitivity always surfaced** — single-point figures never shipped to buyer
- **Quote comparison normalized** — never compares apples to oranges
- **Translation preserves engineering integrity** — analogies are honest, not lossy
- **Checklist self-contained** — buyer doesn't re-engage skill to run it
- **Anti-pattern detection** — skill flags when an installer's quote shows pattern of: inflated production, omitted degradation, escalator clause buried, panel-brand-differentiation framing

---

## Composes with

- `@starlight/schemas` — `BuyerContext`, `QuoteComparison`, `DecisionChecklist`
- `@starlight/calculators` — Cost calculators run with buyer-bias defaults (conservative tariff growth, manufacturer-named degradation)
- `@starlight/validation` — surfaces consumer-protection + counsel-review validations
- `energy-intelligence/sizing-architecture` + `cost-modeling` — upstream engineering source-of-truth
- `energy-intelligence/operations-monitoring` — downstream post-purchase bridge

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-04
- Full protocol: planned v8.x
