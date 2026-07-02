# /invest-strategy

Run the Investment Intelligence weekly strategy session — the full pipeline (blind-parallel analysis → debate → risk gate → synthesis) producing a draft session document for human verdict. Namespaced `invest-*` to avoid collision with operator-instance commands.

## Usage

```
/invest-strategy [--week YYYY-WW] [--mode weekly|rebalance]
```

## Contract

Load `verticals/investment-intelligence/SKILL.md` (vertical-tier rules fire) and execute `verticals/investment-intelligence/engine/commands/weekly-strategy.md` under them:

- R5 non-advisory clause opens the output. Non-waivable.
- Pipeline order structural: analysis agents run blind-parallel per `engine/agents/catalog.json`; risk vetoes size, never direction; only the portfolio-manager emits TradeIntents.
- Any non-DCA TradeIntent terminates as a pending-approval object via the trade-gate MCP (`mcp/trade-gate/`) — never a fabricated fill.
- Real balances/positions are T0 data per `ROUTING.md`: on non-local models, work from aggregates.
- Session artifact validates against `engine/schemas/strategy-session.schema.json`; acted-on recommendations get trajectory records.

**Built on SIP** — invest-strategy wrapper · v0.1
