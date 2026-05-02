# Board pre-pass — SovereignNode + Calculator + ValidationRequirement substrate addition

> **Source:** `.intake/processed/2026-05-03/4 Chatgpt 02.05 - Copy - Copy - Copy.txt`
> **Tier:** Substrate (touches every Domain Sub-Stack going forward)
> **Status:** AWAITING `/starlight-board` ratification — board-before-tag invariant active
> **Author:** Claude Opus 4.7 session 2026-05-03 (extracted + curated; not original to ChatGPT only — Frank's brief shaped the question)

---

## Proposal

Add three substrate primitives that any Domain Sub-Stack touching real-world infrastructure must use:

### 1. `SovereignNode` — canonical entity

A typed entity (TypeScript / Zod) representing a sovereign unit: person, home, family, creator, business, installer, community, studio, retreat, property. Carries composable profiles (energy / compute / storage / workflow / security / cost).

```ts
type SovereignNode = {
  id: string;
  kind: "person" | "home" | "business" | "installer" | /* ... */;
  profiles: {
    energy?: EnergyProfile;
    compute?: ComputeProfile;
    storage?: StorageProfile;
    workflow?: WorkflowProfile;
    security?: SecurityProfile;
    cost?: CostProfile;
  };
  // ...
};
```

Replaces ad-hoc "user" / "tenant" / "instance" patterns currently scattered across verticals.

### 2. `Calculator<Input, Output>` — deterministic, never LLM

Numerical and structural decisions never go through an LLM. Energy cost, PV sizing, payback range, RAM/VRAM class, server feasibility, ROI projection — all flow through deterministic calculators with:

```ts
type CalculatorResult<T> = {
  output: T;
  inputs_used: object;       // echo for traceability
  assumptions: string[];     // explicit, named
  confidence: "high" | "medium" | "low";
  warnings: string[];
  required_validation: ValidationRequirement[];
  trace: { method: string; version: string; ran_at: string };
};
```

The LLM does interpretation, extraction, and prose framing — never the math.

### 3. `ValidationRequirement` — responsibility boundary as type

```ts
type ValidationRequirement =
  | "human_review"
  | "certified_installer_review"
  | "licensed_electrician_review"
  | "tax_advisor_review"
  | "legal_review"
  | "financial_advisor_review"
  | "manufacturer_spec_check"
  | "grid_operator_confirmation"
  | "site_survey_required";
```

Every calculator output names which human/certified review is required before any irreversible action. Encodes responsibility boundary as a compiler-checkable type.

## Why this is substrate

It changes how every Domain Sub-Stack is built going forward. People, Sound, and Music IS currently don't use this pattern. Energy IS, Home IS, Compute IS would natively use it.

## Why this needs `/starlight-board`

Per board-before-tag invariant (`CLAUDE.md` v7.5.1+), substrate edits go through the board before commit. This proposal touches:

- File contract (new types in `packages/schemas/`)
- Domain Sub-Stack pattern (calculators + validation become required for infra-touching verticals)
- Attestation rules (calculator outputs get their own attestation shape — not silent)

## What ships if PROCEED

1. **`packages/calculators/`** — new package. Includes `Calculator<I, O>` interface, `CalculatorResult<T>` shape, base classes for common categories (energy / cost / sizing / time).
2. **`packages/validation/`** — new package. `ValidationRequirement` enum, helpers for naming the right requirement per output.
3. **`packages/schemas/`** — new package. `SovereignNode` Zod shape + `Profile` shapes (energy / compute / storage / etc).
4. **`docs/ARCHITECTURE.md`** — new section "Calculator + Validation pattern" alongside the 10-IS table.
5. **`skills/intelligence/deterministic-calculator-pattern.md`** — auto-activating skill that loads when an agent is generating numerical output.
6. **One pilot Domain Sub-Stack adopting it** — recommendation: NEW Energy IS or Home IS. **Not** retrofit People/Sound/Music IS (large refactor cost, low marginal value for non-infra domains).

## What stays untouched if PROCEED

- People IS, Sound IS, Music IS — no required adoption. They may opt in if they generate numerical outputs, but the existing 7-file contract + agent layer stays as-is.
- All existing commands and skills.
- The 10-IS taxonomy.
- The sovereignty clause.

## Anti-pattern checklist (Verifier vector — pre-board)

| Anti-pattern | Default? | Mitigation in this proposal |
|---|---|---|
| God-agent doing math | YES if not constrained | Calculator pattern forbids LLM math |
| Chatbot-first product | NO | Pattern is engine-first, UI emerges later |
| Pricing pages with no deterministic core | YES if commercial | Validation requirements make pricing claims auditable |
| Hardcoded business logic in agents | YES if not constrained | Calculators isolate business logic from LLM context |
| LLM doing math silently | YES default | Pattern forbids it explicitly |
| Unsupported ROI promises | YES default | `confidence` + `assumptions` + `warnings` make refusal a feature |
| Autonomous external actions on numbers | YES default | `required_validation` enforces human-in-loop where it matters |
| Beautiful UI with no deterministic core | YES default | Build order inverted: schemas → SovereignNode → calculator → vertical slice → UI/agent LAST |
| Untraceable outputs | YES default | `trace` field is required on every CalculatorResult |
| Hidden assumptions | YES default | `assumptions[]` is required and surfaced |

## Cost

- ~2-3 weeks for the foundation (3 packages + ARCHITECTURE.md update + skill)
- ~1-2 weeks for the Energy IS pilot
- Zero retrofit cost for People/Sound/Music IS (they don't adopt unless they earn the need)

## Pre-pass questions for the board

1. **Sovereign vector** — Is this the right level of substrate? Could the same be achieved with a convention rather than a typed package?
2. **Seer vector** — In 18 months, will every Domain Sub-Stack want this? Or is it specifically infra-domain (Energy / Home / Compute)?
3. **Harmonizer vector** — Does this conflict with any existing sovereignty-clause boundary? Does the `ValidationRequirement` enum quietly assert authority over external certifying bodies?
4. **Strategist vector** — What does this unlock? (Honest answer: legal-and-financial defensibility for any product that makes numerical claims. The PV-Lager pilot needs this.) What does it close? (Honest answer: pure-LLM "AI does the math" framings.)
5. **Verifier vector** — What fails first? Likely: a calculator producing a wrong number that nonetheless passes its `confidence` check. Mitigation: bench every calculator against a fixed input/output corpus before promotion.

## Recommendation (Claude's pre-pass synthesis, not the board's)

**Likely PROCEED** with these revisions:

- Pilot on Energy IS (a NEW vertical) before any retrofit
- Don't change existing People/Sound/Music IS
- Keep the package structure thin (interfaces + base classes only); each calculator is its own implementation
- Add `mode: "shadow" | "live"` to CalculatorResult so a calculator can run alongside legacy paths during transition

The board has final say. Frank approves the verdict regardless.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Pre-pass packet drafted: 2026-05-03
- Board verdict: AWAITING — ready for `/starlight-board "SovereignNode + Calculator + ValidationRequirement substrate addition"`
