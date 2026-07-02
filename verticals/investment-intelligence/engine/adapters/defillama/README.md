# DefiLlama Adapter

> **Best free DeFi data source.** Comprehensive TVL + yield data, no auth required.

## Provider

- URL: https://defillama.com
- API docs: https://defillama.com/docs/api
- Auth: none (public API)
- Rate limits: ~300 requests/5min (informal — be polite)
- Cost: free

## Endpoints used

| Endpoint | Returns | Used by |
|---|---|---|
| `/protocols` | All protocols + TVL | defi-yield |
| `/tvl/{protocol}` | TVL history for a protocol | defi-yield |
| `/yields/poolsBorrow` | Lending pool yields | defi-yield |
| `/stablecoins` | Stablecoin market caps | defi-yield, macro-risk |
| `/chains` | TVL by chain | defi-yield |

## Normalized output

```yaml
defi_context:
  total_defi_tvl: 87.4              # USD billion
  total_tvl_30d_change_pct: 4.2
  top_yield_pools:
    - protocol: morpho
      asset: USDC
      apy: 5.8
      tvl: 1.2                       # USD billion
      audit_history: clean
    - protocol: aave
      asset: USDC
      apy: 4.1
      tvl: 12.4
      audit_history: clean
  stablecoin_market_cap: 167.2
  stablecoin_30d_change_pct: 1.8
  source: defillama
  fetched_at: 2026-05-04T16:00:00+02:00
```

## Cache strategy

- Default TTL: 6 hours
- TVL changes slowly day-to-day; weekly cadence is fine with cache

## Failure modes

| Failure | Mitigation |
|---|---|
| API offline | Use cached data; flag stale |
| Protocol rename (rare) | Update protocol map; alert on lookup failure |
| Yield pool removed | Drop from top yields; surface in next session if previously held |

## Sample fetcher (pattern)

```python
# adapters/defillama/fetch.py
import httpx

BASE = "https://api.llama.fi"

def fetch_protocols():
    r = httpx.get(f"{BASE}/protocols", timeout=10)
    r.raise_for_status()
    return r.json()

def fetch_yields():
    r = httpx.get(f"{BASE}/yields/poolsBorrow", timeout=10)
    r.raise_for_status()
    return r.json()

def top_yield_pools(asset="USDC", limit=5):
    pools = fetch_yields()
    matching = [p for p in pools if p["symbol"] == asset]
    return sorted(matching, key=lambda p: p["apy"], reverse=True)[:limit]
```

## Audit history check

The defi-yield agent should not blindly trust DefiLlama on protocol risk. Each yield opportunity should pair with:
- Protocol audit status (manual research; not in DefiLlama)
- Historical incidents (rugs, exploits, hacks)
- Multi-source confirmation (CryptoSec, DefiLlama Hacks page)

DefiLlama provides the metrics; the agent's persona (`agents/catalog.json`) requires the manual risk overlay.

## Cross-references

- `architecture/06-data-feeds.md`
- `agents/catalog.json` (defi-yield agent persona)
