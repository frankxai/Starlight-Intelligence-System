# /invest-thesis-debate

Bull/bear adversarial debate on a single investment thesis (TradingAgents-pattern, provenance: `verticals/investment-intelligence/docs/absorption/tradingagents.md`). Pressure-test before any new position thesis enters the portfolio.

## Usage

```
/invest-thesis-debate <thesis-slug or free-text thesis>
```

## Contract

Load `verticals/investment-intelligence/SKILL.md` and execute `verticals/investment-intelligence/engine/commands/thesis-debate.md` under it:

- R5 non-advisory clause opens the output.
- Bull and bear cases argued from independently-formed analysis-layer stances (blind-parallel first, collide second).
- Verdict is a thesis-quality assessment (validated against `engine/schemas/thesis.schema.json`), never a buy/sell instruction.
- Optional persona overlays (value/contrarian/quality lenses per `AGENTS.md` § persona overlays) increase debate diversity; they never bypass the risk layer.

**Built on SIP** — invest-thesis-debate wrapper · v0.1
