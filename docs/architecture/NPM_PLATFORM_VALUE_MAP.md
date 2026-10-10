# Package foundations and platform value proposal

Status: engineering and go-to-market proposal. This document does not approve
new infrastructure, portfolio ownership, commercial offers or publication.
Tracking: [issue 329](https://github.com/frankxai/Starlight-Intelligence-System/issues/329).

## Evidence and authority

The public maintainer inventory contains 45 latest-version metadata records as
of 10 October 2026. It does not establish 45 safe, installable or maintained
packages. See [the catalog](NPM_RELEASE_CATALOG.md) for package-level follow-ups.
The new core, AI SDK adapter and MCP server have separate artifact and installed
consumer verification. Their publication has not been confirmed.

Portfolio preflight used reviewed registry commit
`b767cd9664280cfd3c976d8f4229a768b355b31a`, loading manifest, exclusions,
repositories, artifact authorities and architecture decisions from that revision.
The SIS repository record identifies protocol, provenance, governance and
evaluation work here. Package inventory is a documentary engineering artifact;
platform integrations are product-runtime proposals. An exact artifact-authority
record for the proposed cross-platform commercial integration remains unresolved.
Resolve that through the registry review process before assigning canonical
owners or writing platform implementations in other repositories.

Memory/provider records also require their existing publication boundaries to
be checked before further releases. A live npm version does not supersede a
reviewed repository's restrictions. Keep private data and historical evaluation
queries out of public packages and public evidence.

## Shared foundation

Keep protocol types, bounded recall and sanitizer contracts in the dependency-free
core. Place persistence, model SDKs, transport and commercial behavior in their
respective implementations. Reuse the accepted SIS terminal runtime and creator
workspace for recoverable results and provenance. Providers own authorization and
storage; MCP exposes capabilities; neither becomes portfolio truth.

| Consumer proposal | Useful integration | Acceptance evidence before launch |
| --- | --- | --- |
| Existing Next.js products | AI SDK middleware with server-selected tenant/workspace and bounded memory | Deployed cold/warm latency; retrieval relevance; tenant denial; cancellation; real provider failure |
| Coding harnesses | Read-only MCP recall with explicit host write grants | Official clients; restart/reconnect; scoped credential handling; installed CLI; retention/deletion behavior |
| Creator products | Portable output receipts and editable creator-workspace artifacts | Restart recovery; stale-edit denial; export/import compatibility; asset rights and provenance |
| Team operations | Versioned contracts and reproducible evaluation receipts | Upgrade/migration fixtures; incident recovery; supported engine matrix; reproducible installed consumers |

These are integration targets. The current branch has fixture-level evidence,
not production deployments for these consumers. Preserve the reviewed platform
architecture: product-local orchestration stays with its existing runtime; one
durable process has one orchestrator; provider-neutral IDs and receipts remain
portable. A new package does not justify a new service or data store.

## Revenue experiments

Vercel presents the AI SDK together with gateway, sandbox and workflow products.
That demonstrates an integration-led product portfolio; it does not establish
Starlight buyer demand. [Vercel's AI SDK page](https://vercel.com/ai-sdk).
Mastra publishes deployment, observability and support offerings, while LangSmith
publishes paid platform plans. These are comparable commercial structures, not
proof that copying them will work. [Mastra pricing](https://mastra.ai/pricing),
[LangSmith pricing](https://www.langchain.com/pricing).

Test separate value hypotheses through existing approved products:

| Experiment | What customers would receive | Decision evidence |
| --- | --- | --- |
| Team memory operations | Hosted access controls, retention, recovery and auditable retrieval | Design partners identify an operational failure they will pay to solve; costs and recovery measured |
| Creator workflow product | Editable, repeatable outputs with clear provenance and project continuity | Users complete a real creation task, return to edit it, and choose to pay for the workflow |
| Supported engineering edition | A tested compatibility matrix, migration help and maintained release channels | Teams request and pay for a defined support obligation that can be delivered profitably |

Price, income, conversion and market advantage remain unvalidated. Keep open
protocols useful independently. Charge for an implemented outcome with a defined
service boundary. Do not build three subscription stacks before demand evidence.

## Defensibility to measure

A package count and a new scope establish no moat. Build evidence around reusable
failure-recovery fixtures, migration compatibility, evaluation quality, and real
consumer adoption. Keep a permissively usable substrate and distinguish code
licenses from data or creative-content rights.

Compare the adapter against direct AI SDK middleware using the same model,
retrieval provider, query set and deployment. Report median/p95 added latency,
recall relevance, denial accuracy and completed-task cost. Compare orchestration
only for workloads both systems support, including interrupted runs and unknown
worker outcomes. Publish reproducible workloads and limitations before making
claims against LangGraph or Mastra.

## Ordered engineering work

Installed-consumer CI now runs an executable adapter comparison against direct AI
SDK middleware using the same core privacy/scope policy, model fixture, memory
provider and multi-turn messages. It alternates invocation order, excludes warmups,
records median/p95 end-to-end SDK latency, and verifies identical prompt projection,
one provider read, workspace forwarding, denied records and unavailable/hung-provider
failure behavior. `benchmark.json` binds results to exact source and archive manifest.
The comparator is `packages/ai-sdk-adapter/benchmark/compare.mjs`.

This is a deterministic integration comparison, not a retrieval-quality benchmark.
Token usage and completed-task cost are null because the model is a fixture. Both
variants use the same core policy rather than comparing a guarded implementation
against an unsafe baseline. Runner timing is noisy and establishes no speed advantage.
Deployment, live models, real query relevance, streaming latency, repair effort and
customer willingness to pay still require separate evidence. The baseline uses the
[official AI SDK middleware interface](https://ai-sdk.dev/docs/ai-sdk-core/middleware).

1. Finish independent review and hosted checks for the three modular packages.
   Resolve first-publication/trusted-publisher configuration and release exact
   verified bytes. Keep legacy SDK packaging and new organization candidates working.
2. Inspect each live package's authoritative source lane, instructions and release
   history. Verify real artifacts, entry points, rights, dependency vulnerabilities,
   supported runtimes and installed consumers before changing its scope or version.
3. Prioritize shared dependencies and user-facing CLIs, then isolated leaf packages.
   Record each package as verified, needs fixes, intentionally legacy or unresolved;
   metadata flags alone cannot choose that state.
4. Resolve commercial integration authority and pick one existing product consumer.
   Deliver a real end-to-end workflow, measure it, and test willingness to pay.
5. Extend only the foundations and paid outcomes that those measurements support.

Remaining gaps: exact-revision independent review, hosted execution, npm account
bootstrap, browser/edge deployment, real model-provider behavior, cross-package
artifact coverage, approved commercial integration authority and buyer evidence.
