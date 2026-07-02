# OpenBB Adapter

> **The OSS Bloomberg terminal.** Unified Python SDK + REST API across stocks, ETFs, options, crypto, macro, alternatives.

## Provider

- URL: https://openbb.co
- Repo: https://github.com/OpenBB-finance/OpenBB
- License: AGPL-3.0
- Auth: provider-specific (OpenBB itself is free; data providers vary)
- Cost: free for yfinance/FRED/Llama; paid for Polygon/Tiingo/Bloomberg

## Why OpenBB

- Unifies multiple data providers under one API
- Free providers (yfinance, FRED, DefiLlama) cover Tier 0-1 needs
- Natural language query layer simplifies common operations
- Local REST API mode (`openbb api`) makes it MCP-friendly

## Providers integrated

| Provider | What | Cost |
|---|---|---|
| yfinance | Stocks, ETFs, options, news | Free |
| FRED | Macro | Free |
| DefiLlama | DeFi TVL, yields | Free |
| FMP (Financial Modeling Prep) | Fundamentals | Free tier + paid |
| Polygon | Real-time + historical | Paid |
| Tiingo | Quality stock data | Paid |
| Intrinio | Fundamentals + alternatives | Paid |

## Used by IIS

| Agent | Use case |
|---|---|
| fundamentals | DCF, P/E, EV/EBITDA via FMP / yfinance |
| technical | RSI, MACD, Bollinger via TA-Lib through OpenBB |
| macro-risk | Cross-references FRED data with broader macro context |
| crypto-dca | Stock-correlation context (when relevant) |

## Setup pattern

```bash
# Operator's private setup
pip install openbb openbb-fred openbb-yfinance openbb-crypto

# OR run as REST API server for MCP integration
pip install openbb[all]
openbb api  # starts local FastAPI at http://localhost:6900
```

## Sample fetcher (pattern)

```python
# adapters/openbb/fetch.py — operator implements
from openbb import obb

def fetch_macro():
    """Macro snapshot via FRED through OpenBB."""
    return obb.economy.fred_series(
        symbol="M2SL,DFF,T10Y2Y,CPIAUCSL,DTWEXBGS",
        start_date="2025-01-01"
    )

def fetch_equity_fundamentals(ticker: str):
    """Fundamentals for a single equity via FMP."""
    return {
        "income": obb.equity.fundamental.income(symbol=ticker),
        "ratios": obb.equity.fundamental.ratios(symbol=ticker),
        "dcf": obb.equity.fundamental.dcf(symbol=ticker),
    }

def fetch_technical(ticker: str, days: int = 90):
    """Technical indicators via OpenBB TA module."""
    return {
        "rsi": obb.technical.rsi(symbol=ticker, length=14),
        "macd": obb.technical.macd(symbol=ticker),
        "bollinger": obb.technical.bbands(symbol=ticker),
    }
```

## REST API mode (recommended for MCP integration)

```bash
openbb api --host 127.0.0.1 --port 6900
```

Then build a custom MCP that wraps `localhost:6900` (similar to Rotki MCP pattern in `architecture/07-mcp-integration.md`).

## License consideration

OpenBB is AGPL-3.0. If you use OpenBB code in a public-facing service, AGPL provisions apply to your service. For personal IIS use, AGPL is fine. For B2B or hosted versions of IIS, consider:
- Using OpenBB as a sibling service (REST API only — your code doesn't link OpenBB)
- Using individual provider APIs directly (yfinance, FRED) instead of OpenBB

## Cross-references

- `architecture/06-data-feeds.md`
- `architecture/07-mcp-integration.md` (custom MCP wrapping OpenBB REST)
