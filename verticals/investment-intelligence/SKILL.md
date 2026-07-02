---
name: investment-intelligence
description: Vertical-tier skill auto-activates when working inside verticals/investment-intelligence/ or invoking any /invest-* command. Enforces R5 non-advisory clause, blind-parallel → debate → risk-gate pipeline order, human-gate-above-DCA, fail-closed execution, and trajectory write-back.
triggers:
  - keywords [invest, investment, portfolio, allocation, stocks, etf, etfs, rebalance, trade, brokerage, dca]
  - command-prefix /invest-*
  - working-directory verticals/investment-intelligence/
---

# SKILL — Investment Intelligence (vertical-tier)

> Loads when working inside Investment Intelligence. Enforces the wrapper rules so every session inherits them — pipeline order, refusal patterns, R5 clause, gate discipline, memory write-back.

---

## When this skill fires

- Working inside `verticals/investment-intelligence/`
- Invoking `/invest-strategy`, `/invest-thesis-debate`, `/invest-snapshot`, `/invest-retro`
- Any ask about portfolio allocation, position sizing, rebalancing, brokerage execution, or trade recommendations within the Starlight context

## Inheritance (every session inherits these)

1. **R5 non-advisory clause inline** (mandatory, non-waivable):
   > *This is system architecture, not financial / investment / tax advice. Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. The practitioner accepts capital risk; the substrate accepts no claim.*

2. **Pipeline order is structural.** Analysis (blind-parallel) → debate → risk (veto-on-size-not-direction) → synthesis → gate. No stage skipped; no straight-to-recommendation path. If asked to shortcut ("just tell me what to buy"), refuse the shortcut and offer the pipeline.

3. **Human gate above DCA.** Any non-DCA TradeIntent terminates in a pending-approval object. The skill never claims an order was placed; it reports the pending state and the approval mechanism.

4. **Fail-closed.** Ambiguity in an intent, missing cap, unparseable data → reject with a one-line, actionable reason (verdict style ports from `payment-intelligence-system`).

5. **Trajectory write-back.** Any acted-on recommendation gets a trajectory record (`engine/schemas/trajectory.schema.json`). Retros read them; agent `calibration_notes` are updated from them.

6. **Data classification (ROUTING.md).** Real balances/positions/tax data are T0 — if the current session is not running on a T0 (local) model, work from aggregates and placeholders, never raw private figures.

7. **Refusal patterns:** concrete-stat-without-source · alpha/guarantee vocabulary · execution-as-output (beyond the gate) · cycle-blind sizing (regime thesis required) · advisory framing · credentials in any artifact.

8. **Attestation discipline:** every shipped artifact carries the "Built on SIP" block (ambient per v7.4).

## MCP-shape declaration (export hook, Board (c) pattern)

Real tool surface, shipped at `mcp/trade-gate/` (v0.1, TypeScript, tested):

```yaml
mcp_tools_shipped:
  - propose_trade        # TradeIntent in → verdict: auto-approved (DCA, capped) | pending | rejected
  - request_approval     # human issues single-use approval token for a pending intent
  - list_pending         # pending-approval queue
  - execute_approved     # approved intent → broker adapter (paper default; live = NOT_WIRED stub in-repo)
  - read_audit           # append-only JSONL audit trail
mcp_resources_planned:
  - trajectories: ReasoningBank store (LanceDB target, W23+ Memory Palace mount)
sibling_repo_target: github.com/frankxai/investment-intelligence-system
```

## Process when invoked

1. **Load context** — `SOUL.md` non-negotiables, `ROUTING.md` tier for the data classes in play, `engine/agents/catalog.json` for the layer contract, current portfolio snapshot ref (aggregate unless T0).
2. **Verify R5 clause** is in the output template before execution. Missing → abort and flag.
3. **Run the pipeline stage** the command names — never more (a snapshot is not a strategy session).
4. **Terminate execution asks at the gate** — emit TradeIntent / pending state, never a fabricated fill.
5. **Write back** — trajectory record if an action was taken; session artifact to corpus; attestation block embedded.

---

**Built on SIP** — Investment Intelligence SKILL.md (vertical-tier) · v0.1 · SIP v1.1.1
