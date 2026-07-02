# AGENTS — Investment Intelligence

> The 11-agent, 3-layer decision swarm + cross-cutting Researcher. Canonical machine-readable catalog: `engine/agents/catalog.json` (validated by `engine/schemas/agent.schema.json`). This file is the human map.

---

## Topology

```
Layer 1 — ANALYSIS (blind-parallel: agents do not see each other's output)
  macro-risk      Fed/regime/recession flags            Sonnet
  crypto-dca      DCA discipline, dominance trends      Sonnet
  defi-yield      yield mechanism + counterparty risk   Sonnet
  fundamentals    equities/ETF valuation + quality      Sonnet
  technical       trend/level context (never sole basis) Haiku

Layer 2 — RISK (veto-on-size-not-direction)
  risk-manager    sizing, concentration, drawdown caps  Sonnet
  tax-optimizer   jurisdiction + entity placement       Sonnet
  regulatory-risk platform/instrument/rule risk         Sonnet

Layer 3 — SYNTHESIS
  portfolio-manager  the decision-maker; weighs all     Opus   ← reasoning depth load-bearing
  chief-of-staff     session orchestration + human brief Sonnet

Cross-cutting
  researcher      primary-source citations only         Sonnet
```

## Rules the catalog enforces

- Every agent declares `tools_allowed` and `tools_denied`. **`execution-platforms` and `credential-stores` are denied for all 11 agents** — only the trade-gate MCP touches execution, and only the human touches credentials.
- Analysis agents run blind-parallel; their `stance/evidence/confidence` outputs collide first in the debate stage (`/invest-thesis-debate`).
- Risk agents receive the debated thesis and may veto size, never direction.
- The portfolio-manager is the only agent that emits a TradeIntent; the chief-of-staff formats the human brief and never alters the intent.
- `calibration_notes` per agent are updated from retrospectives (`/invest-retro`) — the ReasoningBank loop.

## Model routing (see `ROUTING.md` for tiers and providers)

| Layer | Default model | Rationale |
|---|---|---|
| Analysis | Sonnet (technical: Haiku) | Parallel breadth; cost-bounded |
| Risk | Sonnet | Structured judgment against explicit caps |
| Portfolio-manager | Opus | The decision; reasoning depth load-bearing |
| Chief-of-staff / Researcher | Sonnet | Orchestration + citation discipline |
| Balance-touching context prep | Local Hermes (T0) | Private data never leaves the box |

## Optional persona overlays (absorbed, provenance named)

Investor-persona lenses (value / contrarian / quality / deep-value shorts) absorbed selectively from `ai-hedge-fund` (MIT) may be layered onto the analysis stage for debate diversity. See `docs/absorption/ai-hedge-fund.md`. Overlays never bypass the risk layer or the gate.

---

**Built on SIP** — Investment Intelligence AGENTS.md · v0.1 · SIP v1.1.1
