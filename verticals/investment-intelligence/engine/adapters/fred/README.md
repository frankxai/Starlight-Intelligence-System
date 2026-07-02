# FRED Adapter (Federal Reserve Economic Data)

> **Best in class for macro context.** Free, authoritative, no rate-limit issues for weekly use.

## Provider

- URL: https://fred.stlouisfed.org
- API docs: https://fred.stlouisfed.org/docs/api/fred/
- Auth: free API key — register at https://fred.stlouisfed.org/docs/api/api_key.html
- Rate limits: 120 requests/minute (default — generous)
- Cost: free

## Series used by IIS

| Symbol | Series | Used by |
|---|---|---|
| `DFF` | Effective Federal Funds Rate | macro-risk |
| `M2SL` | M2 Money Supply | macro-risk |
| `T10Y2Y` | 10Y - 2Y Treasury Spread | macro-risk |
| `CPIAUCSL` | Consumer Price Index | macro-risk, tax-optimizer |
| `DTWEXBGS` | Trade-Weighted USD Index (broad) | macro-risk |
| `UNRATE` | US Unemployment Rate | macro-risk (regime indicator) |

## Normalized output

```yaml
macro_context:
  fed_funds_rate: 4.50
  m2_yoy: 4.1               # year-over-year %
  yield_curve_2_10: -0.30
  cpi_yoy: 2.8
  dxy: 99.2
  unemployment: 3.9
  source: fred
  fetched_at: 2026-05-04T16:00:00+02:00
  cache_age_hours: 0
```

## Cache strategy

- Default TTL: 24 hours
- M2/CPI: monthly publication — TTL 7 days fine
- Fed funds rate / DXY: daily publication — TTL 24 hours fine
- For weekly Strategy Sessions, cache hit is the norm

## Failure modes

| Failure | Mitigation |
|---|---|
| API key not configured | Fall back to manual macro input prompt |
| Rate-limit hit | Use cached data; mark stale > 7 days |
| Series renamed/deprecated | Maintain symbol map; alert on next pull failure |

## Sample fetcher (pattern, not OSS code)

```python
# adapters/fred/fetch.py — operator implements
import os
import httpx
from datetime import datetime, timedelta

API_KEY = os.environ["FRED_API_KEY"]
BASE = "https://api.stlouisfed.org/fred"

def fetch_series(series_id: str, since: str = None):
    params = {
        "series_id": series_id,
        "api_key": API_KEY,
        "file_type": "json",
        "observation_start": since or (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
    }
    r = httpx.get(f"{BASE}/series/observations", params=params, timeout=10)
    r.raise_for_status()
    return r.json()

def fetch_macro_snapshot():
    return {
        "fed_funds_rate": latest("DFF"),
        "m2_yoy": yoy_change("M2SL"),
        "yield_curve_2_10": latest("T10Y2Y"),
        "cpi_yoy": yoy_change("CPIAUCSL"),
        "dxy": latest("DTWEXBGS"),
        "unemployment": latest("UNRATE"),
        "source": "fred",
        "fetched_at": datetime.utcnow().isoformat(),
    }
```

## Why FRED specifically

- **Authoritative.** Federal Reserve publishes the data. No middleman.
- **Free.** No paid tier required for weekly use.
- **Stable.** Series IDs rarely change; symbols are stable for decades.
- **Comprehensive.** ~800,000 series available; the IIS uses ~6.

## Cross-references

- `architecture/06-data-feeds.md` — overall data feed strategy
- `agents/catalog.json` — which agents consume FRED data
