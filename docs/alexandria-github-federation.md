# GitHub federation acquisition candidate

This additive adapter extends `src/alexandria/` at SIS revision
`e159af3f94e93190c4a8ae127884d8f0d560dd5a`. It does not add a canonical store,
background schedule, provider account, Worker binding or deployment.

## Inspected contract

The replayable discovery and successful public repository response are in
`test/fixtures/github-discovery.json` and `test/fixtures/github-search-live.json`.
Fixtures retain public contract/result fields and omit conversation, feedback and
invocation identifiers that are unnecessary for deterministic replay.
Discovery was free on 2026-11-13. The inspected capability is
`github-com/repositories/search_repos`, five Firecrawl credits per request,
not per repository. The workflow is pinned to version `1.3.0` and digest
`sha256:310d4c0f33d3a817c5267fe57e226b6e20974eb60a744871b7bbdd44fba80e32`.
Unknown providers, changed option/response contracts, changed prices and changed
workflow digests are refused. Requests include the workflow version.

`withGitHubCatalog(existingCatalog, inspectedDiscovery)` adds the reviewed
provider without modifying existing catalog entries or resetting their
reconciliation timestamps. Existing GitHub ownership requires explicit
reconciliation instead of replacement. The base catalog count assertions remain
unchanged. Import `src/alexandria/github.ts` alongside the existing public surface;
the digest-pinned root package export map is unchanged.

## Accounting and provider isolation

`PinnedGitHubTransport` delegates to `FirecrawlTransport`; `acquireGitHubPage`
executes through the supplied existing `Alexandria` router and ReceiptLedger.
Use an isolated GitHub acquisition session; the pinned transport accepts only
one GitHub search capability per dispatch. Other provider lanes retain their
own transport and session budgets. The implementation introduces no spend
ledger or global budget override.

The live response has `entry.records: 1` as a number, the page under `entry.data`,
and five credits only at aggregate `data.creditsCost`. The shared transport
therefore preserves `chargeUnknown` and the five-credit reservation. This adapter
does not invent a per-entry allocation. Its usage records distinguish accounting
credits, reported provider credits and reserved credits per returned reference.
`creditsPerEntity` remains null when the entry charge is unknown. Actual account
balance deltas belong in the acquisition experiment evidence, not in this
transport's per-entry charge field. Currency cost is unmeasured, never zero.

429/502/503/504 retries use the same payload and `x-request-id`, at most three
attempts with at most five seconds configured retry delay. Default fetch timeout
is fifteen seconds per attempt. The default per-instance interval is six
seconds; this is not an account-wide distributed rate limiter. Multiple workers
must bind this lane to the existing account coordinator before scheduled use.
Uncertain outcomes remain reserved by SIS; no automatic new request ID or
spend ceiling increase is allowed. Retry-After is not yet exposed by the shared
transport response interface; this candidate uses bounded configured backoff.

## Artifact and projection contract

`GitHubPageArtifacts` must bind to the existing authorized Alexandria artifact
store. Its put must be durable before returning. Keep this source capture
restricted until the source terms permit the intended use. It stores the
admitted page, receipt, request fingerprint, canonical hash and original
retrieval time. No default in-memory or second canonical store is supplied.

The normalized row has GitHub's numeric repository ID, canonical GitHub URL,
numeric account reference, source/retrieval timestamps, provider/workflow
provenance, content hash and source repository SPDX label. SPDX is informational
about the repository's license; it does not clear metadata redistribution or
permit copying arbitrary source content. `redistribution` stays `not-cleared`.
Private records, contradictory attribution/owners and duplicate numeric IDs
are rejected before artifact capture and projection.

The `ingest(reference, idempotencyKey)` callback must upsert in the existing
canonical registry/reference store and emit its own projection/outbox events.
Keys combine the stable GitHub repository ID and canonical row hash. All
references and their account links remain `external-reference` and `unclaimed`.
Capabilities are empty. No passport, member, proof of repository control or
verified agent capability is inferred from source metadata.

Checkpoint advancement happens only after every idempotent consumer succeeds.
A retry uses the durable acquired page without another provider call or charge.
A missing capture after a settled provider call surfaces SIS `replay_completed`;
manual reconciliation is required. The adapter never silently pays again.

Pagination binds query, page size, order, sort and workflow pin. It explicitly
stops on `incomplete_results`, invalid cursors or the 1,000-result search window.
A page cursor is not a stable upstream snapshot: changed repository ordering
can shift references between pages. Numeric IDs and idempotent upserts prevent
duplication; completeness needs a partitioned official-API enumeration strategy.
Prefer GitHub's official API or bulk datasets for large discovery experiments.

## Verification and launch gates

Run the checked-in fixture test and the existing SIS replay suite. Tests use
injected fetch and do not spend credits. `test/alexandria-github.test.ts` covers
contract drift, budget refusal, workflow pins, retry identity, private/identity
quarantine, durable replay, capture loss, source attribution and pagination.

Remaining gates: different-provider exact-head security review; durable source
store binding and failure recovery; real account-wide rate limit; reviewed
rights/terms for each target use; real incremental scheduler/dead-letter binding;
canonical registry and Knowledge Tree outbox consumers; real 10K/100K controlled
cost/load runs; production approval. No scheduled ingestion or deployed service
is established by these local tests.
