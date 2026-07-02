# Data Feed Adapters

The substrate is **adapter-neutral**: agents declare what data they need; adapters supply it. This directory defines the patterns for the most common adapters. Operators implement; substrate documents.

## Adapter contract

```typescript
interface DataAdapter<T> {
  name: string;                       // unique identifier
  description: string;
  cadence: "daily" | "weekly" | "ondemand";
  authRequired: boolean;
  freeTier: boolean;
  rateLimits: { requestsPerMinute?: number; requestsPerDay?: number };

  fetch(opts: { since?: ISO8601; symbols?: string[] }): Promise<T>;
  normalize(raw: T): NormalizedOutput;
  cache?: { ttlSeconds: number };
}
```

## Reference adapters

The substrate ships **patterns** for these adapters — not working implementations. Operators review and adapt to their environment.

| Adapter | Tier | Auth | Free | Used by |
|---|---|---|---|---|
| [fred/](./fred/) | 0+ | API key | Yes | macro-risk |
| [defillama/](./defillama/) | 0+ | None | Yes | defi-yield |
| [coingecko/](./coingecko/) | 0+ | None | Yes | crypto-dca, technical |
| [alternative-me/](./alternative-me/) | 0+ | None | Yes | macro-risk, crypto-dca |
| [openbb/](./openbb/) | 1+ | Provider-specific | Mixed | fundamentals, technical |
| [glassnode/](./glassnode/) | 1+ | API key | Limited | macro-risk, crypto-dca |
| [cryptopanic/](./cryptopanic/) | 1+ | API key | Limited | researcher |

## Why patterns, not code

The OSS substrate documents the **contract** so operators implement consistently. Live API integrations have:

- API keys (Tier-2 secrets — never in OSS)
- Rate-limit accounting (operator-specific)
- Caching strategy (varies by deployment)
- Retry/backoff logic (varies by environment)

Operators implement these in their private repos using the patterns here as the reference. The substrate then ships pre-built adapter wrappers for popular CLIs (Claude Code, Cowork) that read from operator-private adapter implementations via standard interfaces.

## Adding an adapter

1. Create `adapters/<provider>/README.md` with API contract + auth + rate limits + free tier + sample normalized output
2. Add to this file's table
3. Submit PR with example fixture data (sanitized — no real keys, no real positions)
4. Maintainers verify the adapter doesn't fingerprint contributors and merge

## Adapter precedence (when operators have multiple)

If an operator has multiple adapters for the same data class (e.g., FRED + Yahoo Finance both can return 10Y yield), order:

1. **Paid > Free** (when paid is configured — usually higher quality)
2. **Authoritative > Aggregator** (FRED for macro, not Yahoo)
3. **Cache hits ≤ 24h ≥ Live API call** (reduce rate-limit pressure)

The agents query through a unified adapter layer; precedence is configured once per operator deployment.
