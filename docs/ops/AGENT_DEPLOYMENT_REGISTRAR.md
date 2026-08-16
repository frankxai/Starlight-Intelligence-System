# Agent Deployment Registrar — Advisory v1.0

The registrar is the advisory inventory and architecture guard for portfolio agents. It turns the July 2026 SIS/Eve strategy into an executable Phase 0A baseline without creating another platform or changing SIP core contracts.

It is not yet a legal, security, commercial, or production release authorization. Version 1.0 rejects every `lifecycle: live` record. Version 1.1 must implement the structured release evidence below before the mode can change.

## Files

- `context/empire/agent-deployments.json` is the reviewed source of truth.
- `schemas/agent-deployments.schema.json` documents its public shape.
- `scripts/validate-agent-deployments.mjs` enforces cross-record policy that JSON Schema cannot express.
- `scripts/generate-agent-deployments.mjs` renders `PORTFOLIO_AGENT_DEPLOYMENTS.md`.
- `test/agent-deployments.test.mjs` proves the fail-closed gates.

## Run

```bash
node scripts/validate-agent-deployments.mjs
node scripts/generate-agent-deployments.mjs
node scripts/generate-agent-deployments.mjs --check
node --test test/agent-deployments.test.mjs
```

No third-party dependency is required.

## Planned v1.1 promotion contract

An entry may move through `idea → spec → spike → pilot` as its evidence changes. A working website, installed SDK, preview deployment or generated demo is not evidence that an agent product is live. Advisory v1.0 cannot promote any entry to `live`.

Before `live`, record:

1. Production surface and domain evidence.
2. Exact runtime and one loop owner.
3. Tenant, data-class, region, retention and ZDR policy.
4. Provider/model allowlist and credential mode.
5. Entitlement, usage/cost ledger and hard budget.
6. Approval boundaries for every external side effect.
7. Versioned eval, safety and tenant-isolation test receipts.
8. Intended purpose, forbidden uses, synthetic-content disclosure and incident owner.
9. Terms, privacy/DPA and rights-attestation evidence appropriate to the product.

The v1.1 schema must type and verify these receipts, including artifact hash/URL, exact commit and environment, owner/reviewer, result, observation time, expiry/freshness, regulatory role/classification, Article 50 disclosures/marking, provider-feature policy, per-period commercial limits, data-processing/retention/deletion policy, tool-effect scope and immutable ledger references. Free-form prose is not sufficient.

## Architecture boundary

- SIS owns the registry, policy, provenance, budgets, approval and evaluation contracts.
- Arcanea is the first reference implementation of the product runtime.
- Vercel AI SDK + AI Gateway is the default customer-product path.
- OpenAI Agents SDK, Claude Agent SDK, Eve and the ChatGPT host are explicit alternative loop owners for bounded use cases.
- Typed domain functions and one tenant-aware MCP service are the capability ABI.
- Runtime session IDs are resumability pointers. Postgres/event records remain business truth.

The registrar intentionally rejects raw provider-credit resale, plaintext BYOK storage, uncapped managed usage, R5 deployments, sensitive data on preview runtimes and any ambiguous nested orchestration loop.

Built on SIP.
