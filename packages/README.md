# `packages/` — substrate packages

> TypeScript packages that any Domain Sub-Stack composes with. Each package
> declares interfaces + base classes + canonical types. Implementations live
> per-vertical; the substrate provides the contract.

## Status

This directory is **NEW as of 2026-05-03** per the `/starlight-board` ratification of the SovereignNode + Calculator + ValidationRequirement substrate proposal (`docs/boards/2026-05-03-calculator-validation-substrate.md` — verdict PROCEED-WITH-REVISE).

The packages currently ship **interface + types + base classes**. Full build infrastructure (npm publish, tests, CI) is v8.x scope. Today, packages are imported via path resolution from consuming code, or used as design references.

## Packages

| Package | Purpose | Status |
|---|---|---|
| `@starlight/schemas` | Canonical entity types — SovereignNode + Profiles (Zod) | Foundation shipped 2026-05-03 |
| `@starlight/validation` | ValidationRequirement enum + jurisdiction extension mechanism | Foundation shipped 2026-05-03 |
| `@starlight/calculators` | Calculator interface + CalculatorResult + promotion-pipeline modes | Foundation shipped 2026-05-03 |
| `@starlight/agent-ui-runtime` | CopilotKit wrapper with strong-boundary enforcement | Scaffold + BOUNDARY.md only; full impl is cross-repo (Arcanea) |

## Composition rules

Every infra-touching Domain Sub-Stack (Energy, Home, Compute, Capital) **must** use:

1. `SovereignNode` from `@starlight/schemas` as its canonical entity type
2. `Calculator<I, O>` from `@starlight/calculators` for any numerical output (cost, sizing, ROI, capacity)
3. `ValidationRequirement` from `@starlight/validation` to gate any irreversible action

Non-infra-touching Domain Sub-Stacks (People, Sound, Music IS) opt out — their numerical claims are loose enough that LLM-prose is acceptable.

## The deterministic-not-LLM principle

Numerical and structural decisions never go through an LLM. The LLM does interpretation, extraction, and prose framing — never the math. This is a hard contract enforced by the package shape: a Calculator output carries `confidence` / `assumptions` / `warnings` / `required_validation` / `trace` and is auditable; an LLM output is not.

## Promotion pipeline

Every calculator carries a `mode` field with one of four values:

| Mode | Meaning | Use |
|---|---|---|
| `shadow` | Runs alongside legacy path; outputs logged but not shown to user | New calculators ship here |
| `live-with-warnings` | Outputs shown to user with explicit warning banner | After shadow corpus passes |
| `live` | Outputs shown to user as canonical | After live-with-warnings stabilizes |
| `deprecated` | Outputs hidden; calculator preserved for replay only | When superseded |

The promotion pipeline lives in `packages/calculators/README.md`.

## Cross-repo

When a sibling repo (`arcanea-flow`, `agentic-creator-os`, `arcanea`) wants to consume these packages, it imports via path resolution (today) or via npm install (v8.x). The cross-repo distribution packets at `docs/cross-repo-distributions/` name where each package consumer should land.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Substrate ratified: 2026-05-03 (Board verdict at `docs/boards/2026-05-03-calculator-validation-substrate.md`)
