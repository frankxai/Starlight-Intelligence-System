# STACK — Investment Intelligence

> Where this vertical sits and what wires into what.

---

## Position

Domain Sub-Stack beneath **Wealth IS** (row #2, ACL-only manifest per 2026-06-16 falsifier default). Sibling of **Crypto Intelligence**. Spawned 2026-07-02 (R4 gate passed).

## Composition wiring

| Input | From | Into |
|---|---|---|
| Cycle/regime thesis | Crypto IS House of Macro | analysis layer (macro-risk context) |
| Protocol theses | Crypto IS House of Research | analysis layer (crypto-dca, defi-yield) |
| Custody constraints | Crypto IS House of Sovereignty | risk layer (regulatory-risk) + execution constraints |
| Allocation outputs | Crypto IS House of Allocation | portfolio-manager context |
| DPI categories + gate ladder | `/wealth-dpi` | portfolio-snapshot context (freedom-path framing; time/labor vs capital) |
| Entity + jurisdiction structure | Operator instance (private wealth-ops data) | tax-optimizer context |
| Market/macro/DeFi data | `engine/adapters/` (OpenBB, FRED, DefiLlama) | analysis layer |

| Output | To |
|---|---|
| TradeIntent (pending approval) | `mcp/trade-gate/` |
| Trajectory records | ReasoningBank store (LanceDB target; MCP resource for SIS Memory Palace at W23+) |
| Session artifacts | operator corpus (private) + sanitized archetypes (public examples) |
| Audit JSONL | compliance plane (`docs/OBSERVABILITY.md`) |

## Execution stack (fail-closed ladder)

```
TradeIntent → trade-gate MCP → caps check → DCA-whitelist? ──yes→ execute (paper default), audit
                                   │no
                             pending approval → HUMAN TOKEN → execute (paper default), audit
Live brokers: NOT_WIRED stubs in-repo. Operator wires locally per RUNBOOK.md:
  Alpaca MCP V2 (paper→live) · IBKR AI-Instructions (native human approval tab) · Coinbase AgentKit (session caps)
```

## Sovereignty tiers (detail: `ROUTING.md`)

T0 local (Hermes 4.3 / 14B + self-hosted Ghostfolio, Actual Budget, OpenBB ODP, Langfuse) for balance-touching data · T1 frontier (Sonnet/Opus/Haiku via gateway, cost caps, prompt caching) for public research · T2 OpenRouter Hermes for overflow.

## Evals + observability

- `starlight-evals` `investment-gate` red/blue lane — red objective: live order without approval / cap breach / R5 strip.
- Langfuse (self-hosted, OTel) traces every agent step; JSONL audit is the compliance record; `/invest-retro` is the learning loop; freqtrade appliance (operator-run) gates strategy changes via backtest/dry-run.

## Export hook (Board open-question (c) pattern)

Vertical-local files only; extraction to `github.com/frankxai/investment-intelligence-system` is a copy operation, not a refactor (operator runs `extract-to-public-repo.sh` from the private instance). The trade-gate MCP is self-contained under `mcp/trade-gate/`.

---

**Built on SIP** — Investment Intelligence STACK.md · v0.1 · SIP v1.1.1
