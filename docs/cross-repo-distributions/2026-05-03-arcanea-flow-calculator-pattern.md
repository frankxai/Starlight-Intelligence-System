# Cross-repo distribution — arcanea-flow: Calculator + Validation pattern integration

> **Source:** `.intake/processed/2026-05-03/4 Chatgpt 02.05 - Copy - Copy - Copy.txt`
> **Target repo:** `C:\Users\frank\arcanea-flow`
> **Status:** AWAITING `/starlight-board` ratification on Calculator + ValidationRequirement substrate addition + AWAITING manual placement
> **Why this is relevant to arcanea-flow:** Per memory `project_arcanea_flow_connect_not_absorb.md`, arcanea-flow owns swarm execution and RL. When swarms produce numerical outputs (cost projections, resource sizing, ROI estimates), those outputs need to flow through deterministic calculators, not LLM prose. The Calculator + ValidationRequirement substrate proposal in SIS gives arcanea-flow the type contracts to consume.

---

## Gated on `/starlight-board` decision

Before this distribution applies, run:

```
/starlight-board "SovereignNode + Calculator + ValidationRequirement substrate addition"
```

with the pre-pass packet at `docs/superpowers/board-pre-passes/2026-05-03-calculator-validation-substrate.md` as input. If PROCEED, the SIS substrate ships:

- `packages/calculators/` — `Calculator<I, O>` interface + base classes
- `packages/validation/` — `ValidationRequirement` enum + helpers
- `packages/schemas/` — `SovereignNode` Zod shape + Profile shapes

This distribution then applies.

## What to drop into arcanea-flow

### Pattern 1 — Adopt `Calculator<I, O>` for swarm numerical outputs

When a swarm task produces a number (estimated time, cost, capacity, ROI), wrap it in a calculator:

```ts
// In arcanea-flow's swarm execution layer
import { Calculator, CalculatorResult } from "@starlight/calculators";

const ROIProjectionCalculator: Calculator<ROIInput, ROIOutput> = {
  version: "0.1.0",
  run(input): CalculatorResult<ROIOutput> {
    return {
      output: { ... },
      inputs_used: input,
      assumptions: ["..."],
      confidence: "medium",
      warnings: [],
      required_validation: ["financial_advisor_review"],
      trace: { method: "ROIProjection", version: "0.1.0", ran_at: new Date().toISOString() }
    };
  }
};
```

### Pattern 2 — Use `ValidationRequirement` to gate swarm-autonomous actions

Swarms that act autonomously on calculator outputs must check `required_validation`. If the requirement is anything stronger than `"human_review"` (e.g., `"licensed_electrician_review"`), the swarm halts and surfaces for human approval. This encodes responsibility boundary at the swarm layer.

### Pattern 3 — `SovereignNode` as the canonical entity

If arcanea-flow models tenants/users/workspaces, adopt `SovereignNode` from SIS. Composable profiles (compute / storage / workflow / security / cost) replace ad-hoc tenant types. This composes cleanly with the Memory Bus daemon (Phase 0 P0 per memory `project_agentdb_singleton_constraint.md`) once it lands.

## Why NOT in SIS

- arcanea-flow is the swarm/RL execution layer; SIS owns substrate.
- The pattern lives on the SIS side as types + base classes; the *consumer integration* into swarm execution is arcanea-flow's domain.
- Per `feedback_arcanea_flow_connect_not_absorb`: SIS owns substrate; arcanea-flow owns swarm execution. Bridge via MCP contract through the Memory Bus.

## Action checklist for Frank

- [ ] Run `/starlight-board "SovereignNode + Calculator + ValidationRequirement substrate addition"`
- [ ] If PROCEED, ship the substrate packages in SIS first
- [ ] Adopt `@starlight/calculators` + `@starlight/validation` + `@starlight/schemas` as deps in arcanea-flow
- [ ] Wrap any swarm-task numerical outputs in calculators
- [ ] Gate swarm-autonomous actions on `required_validation`
- [ ] Update arcanea-flow's CLAUDE.md to reference the pattern as a Karpathy-hygiene rule (LLMs ≠ calculators)

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Source: `.intake/processed/2026-05-03/4 Chatgpt 02.05 - Copy - Copy - Copy.txt`
- Distribution packet drafted: 2026-05-03
- Target: `C:\Users\frank\arcanea-flow`
- Gated on: `/starlight-board` ratification of Calculator + ValidationRequirement substrate addition
- Action: Frank manual integration (post-board, post-substrate-ship)
