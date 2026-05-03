# `@starlight/validation`

Encodes responsibility boundary as a type. Every numerical or irreversible-action output names which human/certified review is required before that action lands in the world.

## Status

Foundation v0.1 shipped 2026-05-03. Per Board REVISE: the enum is **extensible** — core canonical members ship in this package; jurisdictions extend via `extendValidationRequirement`.

## The principle

LLMs make claims. Calculators make numbers. **Neither has authority to authorize an irreversible action** that requires a certified human's review under the applicable regulatory frame. This package encodes who has that authority as a type.

When a calculator returns a result, it carries `required_validation: ValidationRequirement[]`. The consuming surface (UI, agent, automation) MUST gate any irreversible action on satisfying every requirement in that list before proceeding.

## Core canonical members

These ship as enum members. They are register-neutral — applicable in any jurisdiction.

| Member | Meaning |
|---|---|
| `human_review` | A human must confirm before the action proceeds |
| `tax_advisor_review` | A qualified tax professional must review (region-extended) |
| `legal_review` | Qualified legal review (region-extended) |
| `financial_advisor_review` | Qualified financial advisor (region-extended) |
| `manufacturer_spec_check` | Verify against manufacturer's published specification |
| `site_survey_required` | A physical site survey must occur before installation |

## Region-extended members

Per Board REVISE, jurisdiction-specific reviewers extend the enum via the extension API:

```ts
import { extendValidationRequirement, ValidationRequirement } from "@starlight/validation";

extendValidationRequirement({
  jurisdiction: "DE",
  members: [
    "certified_installer_review_de",      // VDE/HK certification
    "licensed_electrician_review_de",     // Elektromeister
    "grid_operator_confirmation_de",      // Netzbetreiber
  ],
});

extendValidationRequirement({
  jurisdiction: "US-CA",
  members: [
    "licensed_electrician_review_us_ca",  // CA electrician license
    "grid_operator_confirmation_us_ca",   // PG&E/SCE/SDGE
  ],
});
```

Extended members are namespaced by jurisdiction suffix (`_de`, `_us_ca`, etc.) so two jurisdictions can both ship "licensed electrician review" without collision.

## Why this is substrate

Without this type, every Domain Sub-Stack invents its own gating mechanism (or doesn't gate at all). Every "AI says install this 12 kWp PV system" surface needs a way to say "but a licensed electrician must sign off first." Without a typed contract, the gating is convention — and conventions erode.

This package makes the gating compiler-checkable. A surface that emits a ValidationRequirement-bearing output and then proceeds without satisfying it is a TypeScript error.

## Composes with

- `@starlight/calculators` — every CalculatorResult carries `required_validation: ValidationRequirement[]`.
- `@starlight/schemas` — SovereignNode profiles carry jurisdiction tags, which determine which extended members apply.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Substrate ratified: 2026-05-03 (Board verdict at `docs/boards/2026-05-03-calculator-validation-substrate.md`)
