# Energy Intelligence — Quickstart

> Five steps to feel the composition. Reference vertical; sovereign instances follow this same shape against their own data.

## Status

Quickstart v0.1.0 — uses the substrate packages shipped 2026-05-03. Agent + command surface is v8.x; the substrate composition is real today.

## Step 1 — Pick entry sub-system

Pick where you need help:

- **Sizing first** if you're starting fresh with no system yet
- **Buyer first** if you have a quote in hand and want to evaluate it
- **Cost first** if you have a sizing recommendation and need economics
- **Operations first** if you have a system already and need monitoring/maintenance discipline
- **Installer first** if you're an installer-operator wanting to brief customers
- **Grid first** if you're navigating regulatory feed-in approvals

The 6 sub-systems are not strictly sequential; they're entry points.

## Step 2 — Compose your SovereignNode

Use `@starlight/schemas`:

```ts
import { makeSovereignNode } from "@starlight/schemas";

const myHome = makeSovereignNode({
  id: "home-001",
  kind: "home",
  profiles: {
    energy: {
      annual_demand_kwh: 4200,
      grid: {
        connected: true,
        jurisdiction: "DE-BY",
        tariff_eur_per_kwh: 0.32,
      },
      assumptions: ["Demand from 2024 utility bill; pre-EV"],
      provenance: {
        source: "user-input",
        recorded_at: "2026-05-03T12:00:00Z",
        confidence: "medium",
      },
    },
    cost: {
      currency: "EUR",
      payback_horizon_years: 10,
      hurdle_rate: 0.05,
      assumptions: ["Personal hurdle rate; not market rate"],
      provenance: {
        source: "user-input",
        recorded_at: "2026-05-03T12:00:00Z",
      },
    },
  },
  metadata: {
    created: "2026-05-03",
    sovereign_owner: "frank",
  },
});
```

## Step 3 — Run a calculator

Use `@starlight/calculators`. Example calculator implementations land per sub-system in v8.x; the contract is in place today:

```ts
// (Example — implementation lands when sizing sub-system is authored)
import type { Calculator } from "@starlight/calculators";

const result = PVSizingV1.run({
  household_demand_kwh: myHome.profiles.energy!.annual_demand_kwh!,
  roof_area_m2: 80,
  jurisdiction: "DE-BY",
});

console.log(result.output.recommended_capacity_kwp);  // e.g., 6.5
console.log(result.assumptions);                       // 3 named assumptions
console.log(result.confidence);                        // "medium"
console.log(result.warnings);                          // []
console.log(result.required_validation);
// → ["site_survey_required", "certified_installer_review_de"]
```

## Step 4 — Honor the validation requirements

Don't ship action on a calculator output that has unsatisfied `required_validation`. Use `@starlight/validation`:

```ts
import { defaultSeverity, isRegisteredValidationRequirement } from "@starlight/validation";

for (const req of result.required_validation) {
  if (!isRegisteredValidationRequirement(req)) {
    throw new Error(`Unknown validation requirement: ${req}`);
  }
  const sev = defaultSeverity(req);
  console.log(`${req} — severity: ${sev}`);
  // gating-required → block until satisfied
  // gating-recommended → warn but allow override
  // advisory → informational
}
```

The `licensed_electrician_review_de` (or equivalent) is `gating-required`. Until a real licensed electrician signs off, the action does not ship.

## Step 5 — Log the artifact

Every artifact you ship in this vertical carries `Built on SIP` attestation:

```markdown
**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Vertical: energy-intelligence@v0.1.0-scaffold
- Layers used: [file-contract, attestation, sovereignty]
- Substrate composed: [@starlight/schemas, @starlight/calculators, @starlight/validation]
- Calculator: pv-sizing@0.1.0 (mode: shadow)
- Validation: site_survey_required, certified_installer_review_de
- Generated: <ISO date>
```

The attestation goes alongside the artifact (in the markdown body, in the PDF footer, in the email signature). Attestation is what makes the artifact compoundable across the alliance.

## When you're stuck

- Calculator returns `confidence: "low"` — don't ship; reduce input ambiguity or wait for the live-with-warnings tier
- Validation requirement you don't know how to satisfy — refuse to proceed; the substrate is doing its job
- Jurisdiction not yet extended — call `extendValidationRequirement` for your region per `@starlight/validation/README.md`

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-03
