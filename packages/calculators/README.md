# `@starlight/calculators`

Deterministic-not-LLM math contract. Every numerical or structural output produced for a sovereign decision flows through a Calculator, never through an LLM directly.

## Status

Foundation v0.1 shipped 2026-05-03. Per Board REVISE: explicit promotion pipeline (`shadow` → `live-with-warnings` → `live` → `deprecated`).

## The contract

```ts
interface Calculator<Input, Output> {
  readonly name: string;
  readonly version: string;
  readonly mode: CalculatorMode;
  run(input: Input): CalculatorResult<Output>;
}

interface CalculatorResult<T> {
  output: T;
  inputs_used: object;            // echo of input for traceability
  assumptions: string[];          // explicit, named
  confidence: "high" | "medium" | "low";
  warnings: string[];
  required_validation: ValidationRequirement[];
  trace: {
    method: string;
    version: string;
    ran_at: string;
  };
}
```

The LLM does interpretation, extraction, prose framing — never the math. A Domain Sub-Stack agent that emits a number without going through a Calculator is in violation of the substrate.

## Promotion pipeline (from Board REVISE)

Every calculator carries a `mode` field. New calculators ship in `shadow` and earn promotion:

| Mode | Meaning | Visibility | Promotion gate |
|---|---|---|---|
| `shadow` | Runs alongside legacy path; outputs logged but not shown to user | Internal-only | Outputs match legacy on a fixed I/O corpus |
| `live-with-warnings` | Outputs shown to user with explicit warning banner | User-visible with caveat | User-visible run produces no false-positive validation requirements over a sample window |
| `live` | Outputs shown as canonical | User-visible | Stays here unless superseded |
| `deprecated` | Outputs hidden; calculator preserved for replay | Replay-only | Superseded by a newer version that's `live` |

Promotion decisions are operator-tier (per Domain Sub-Stack), not substrate-level — but the mode field IS substrate, so every promotion is auditable.

## Example: PV sizing calculator

```ts
import { Calculator, CalculatorResult } from "@starlight/calculators";
import type { EnergyProfile } from "@starlight/schemas";

interface PVSizingInput {
  household_demand_kwh: number;
  roof_area_m2: number;
  jurisdiction: string;  // "DE-BY", "US-CA", etc.
}

interface PVSizingOutput {
  recommended_capacity_kwp: number;
  panel_count_estimate: number;
  expected_annual_yield_kwh: number;
}

const PVSizingV1: Calculator<PVSizingInput, PVSizingOutput> = {
  name: "pv-sizing",
  version: "0.1.0",
  mode: "shadow",  // ← starts here per the pipeline
  run(input): CalculatorResult<PVSizingOutput> {
    const recommended = Math.min(input.household_demand_kwh / 1000, input.roof_area_m2 / 6);
    return {
      output: {
        recommended_capacity_kwp: recommended,
        panel_count_estimate: Math.ceil(recommended / 0.4),  // ~400Wp panels
        expected_annual_yield_kwh: recommended * 950,         // generic mid-EU yield
      },
      inputs_used: input,
      assumptions: [
        "Generic mid-Europe yield estimate (~950 kWh/kWp/yr); will diverge by region",
        "Panel size assumed 400 Wp; real panel selection happens per supplier",
        "Roof area constraint uses 6 m²/kWp packing density (south-facing pitched roof typical)",
      ],
      confidence: "medium",
      warnings: input.roof_area_m2 < input.household_demand_kwh / 200
        ? ["Roof area is constraining; capacity may be smaller than demand wants"]
        : [],
      required_validation: [
        "site_survey_required",
        input.jurisdiction.startsWith("DE") ? "certified_installer_review_de" : "licensed_electrician_review",
      ],
      trace: {
        method: "PVSizing",
        version: "0.1.0",
        ran_at: new Date().toISOString(),
      },
    };
  },
};
```

## Why this is substrate

Without this contract, every Domain Sub-Stack agent that produces a number does so via LLM prose: "Based on your roof, you'll want around 8 kWp." That number is not auditable. It carries no assumptions, no confidence, no required validation. It is a hallucination with formatting.

This package makes the math auditable. The output IS the assumptions + confidence + warnings + validation, not just a bare number. Surfaces consuming the output can render any of those alongside the number — and a sovereign reviewing the output downstream can verify the math.

## Composes with

- `@starlight/schemas` — Calculators typically take `SovereignNode` profiles as input and produce structured outputs that update those profiles.
- `@starlight/validation` — `required_validation` gates downstream irreversible actions.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Substrate ratified: 2026-05-03 (Board verdict at `docs/boards/2026-05-03-calculator-validation-substrate.md`)
