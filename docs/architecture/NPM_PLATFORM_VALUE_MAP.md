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

Remaining gaps: exact-revision independent review, complete hosted execution, npm account
bootstrap, browser/edge deployment, real model-provider behavior, cross-package
artifact coverage, approved commercial integration authority and buyer evidence.

## Engineering assessment and reuse decisions, 10 October 2026

The current packages are focused integration candidates. Strong boundaries include
host-selected scope, privacy and retention projection, cancellation, bounded
responses, installed-archive verification and source-bound publishing receipts.
These checks support a narrow reliability claim. They do not establish superior
memory quality, distributed durability, production operations or customer value.

Enabling the full non-draft checks exposed two Foundry validators still reading
the removed root npm lockfile. This is an integration defect in the pnpm migration,
despite the modular package matrix passing. The repair reads the root pnpm importer,
checks exact registry versions/integrities and retains reviewed source closures.
The updated closure is a candidate for review, not an independently approved lock.
An untyped host configuration also accepted truthy sharing/write/delete flags;
the repair requires actual booleans before provider calls or tool registration.

| Existing technology | What it already provides | Starlight decision |
| --- | --- | --- |
| [Vercel AI SDK middleware](https://ai-sdk.dev/docs/ai-sdk-core/middleware) | Model-agnostic interception for RAG, guardrails, caching and logging | Keep the SDK as execution owner. Our adapter earns value through tested memory policy and provider compatibility; two-line wrapping alone is easy to reproduce. |
| [Official MCP SDK and security guidance](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices) | Standard tool transport plus implementation security requirements | Use official protocol implementations. Preserve stdio as the current operator-owned target; remote authentication and authorization require separate production work. |
| [Mastra memory](https://mastra.ai/docs/memory/overview) | Message history, working memory, semantic recall and observational memory | Compare real retrieval and context quality before adding a competing full agent framework. Current Starlight packages do not provide this entire memory lifecycle. |
| [LangGraph persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence) | State checkpoints, threads and recovery capabilities | Integrate portable memory with an accepted product runtime. Do not claim the new packages replace durable graph execution. |
| [Temporal TypeScript](https://docs.temporal.io/develop/typescript) / [Trigger.dev idempotency](https://trigger.dev/docs/idempotency) | Established workflow/task execution and deduplication mechanisms | Evaluate one against the existing runtime only when a concrete long-running product needs it. Use operation IDs and side-effect reconciliation; do not introduce a second orchestrator without an ownership decision. |
| [Self-hosted Mem0](https://github.com/mem0ai/mem0/blob/main/docs/open-source/setup.mdx) | A self-hosted memory API with account/key and audit facilities documented upstream | Sovereignty and self-hosting alone are not unique. Compare a real provider on retention, access control, retrieval and operating cost. Provider names in a contract are not tested integrations. |
| [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/) | Standard traces and metrics | Add privacy-safe instrumentation in the owning adapter/runtime when an actual deployment needs it. Keep telemetry dependencies out of the portable core. |

These are technical integration candidates, not confirmed commercial partnerships.
The market already supplies transport, model routing and workflow engines. A useful
Starlight contribution can be portable project memory, explicit authority, creator
provenance and reliable recovery across those systems. That is a hypothesis until
matched workloads and users demonstrate the benefit.

Production sequence:

1. Finish all relevant non-draft checks and review the exact final revisions. Resolve
   findings and rerun affected consumers. Required gates must not depend on a draft
   PR remaining exempt from tests.
2. Merge only reviewed revisions. Verify npm trusted publishers against repository,
   workflow, environment and allowed actions. Current npm documentation permits
   staged publishing and requires explicit direct-publish permission for newly
   configured publishers; our current pipelines publish directly.
   [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
3. Publish verified bytes, confirm registry integrity, then repeat clean installation
   from the registry. Verify the complete public dependency graph and CLI discovery.
4. Deliver one approved existing product integration with a real memory/model
   provider. Measure recall relevance, cross-scope denial, median/p95 added latency,
   streaming, cancellation, retention/deletion and failure recovery against the
   same task implemented directly on the chosen framework.
5. Establish support and migration expectations, incident diagnostics, recovery
   procedures and cost bounds. Expand to other packages and revenue experiments
   after this workflow has useful output and buyer evidence.

Passing local fixtures or the package matrix does not close the later deployment,
live-provider, independent-review or commercial acceptance steps.

### Review reconciliation

All twelve hosted workflows passed at `2d3a2270e83085dca74416727be7ca1726469a5f`.
The separate Codex cloud review of earlier `07b430790f9fb88427f9b1815455490d7c6c7728`
identified seven findings. Its lockfile finding was fixed in `725914c`. The next
remediation sanitizes retrieval queries before provider egress, bounds provider IDs
before regex work, rejects sensitive caller IDs before writes/deletes, preserves
recognizable cancellation and timeout errors, and skips retrieval for oversized
model prompts while preserving model execution. The existing gateway rejects
workspace mode because its search endpoint cannot enforce workspace isolation.
The in-process factory still accepts independently authorized scoped providers.

Twenty-six core, AI SDK and official MCP client tests passed locally after these
changes. This receipt does not attest a live remote provider or approve the new
revision. Fresh CI and exact-revision independent review remain required.

GitHub Copilot review `5478795909` inspected `725914cee74e9884a6ca33edcde7f0474418252b`
and returned eight findings, including untrusted memory assigned a system role,
shareable privacy tags losing precedence to public tags, and incomplete workspace
support in the injected Mem0 adapter. Reconciliation preserves the existing host
system message, attaches recalled data only to the latest user message, requests
and verifies returned Mem0 tenant/workspace metadata, preserves restrictive privacy
and retention, and exposes install hooks as explicit static follow-up. The review
is from GitHub's separate service; its underlying model was not disclosed.
It is a findings report, not an approval of subsequent fixes.

Focused local suites after these changes passed 24 adapter/MCP/artifact tests and
29 Mem0/Foundry tests. The creator repair is separately assigned to hosted Copilot
session `cfad75da-ca44-4b47-b38f-30756c601c54` in creator PR 7, based on PR 6's
immutable `d4eb90502fdeee0ccd9c3c431cb030324b39ba09`. The first Codex implementation
request could not start because no cloud environment was configured for that repo.
No new local worker or paid generation was started. Policy documents were loaded;
they are not runtime enforcement or proof of deployment.

The retained Mem0 adapter also passed a SIS memory ID directly to remote deletion
and ignored tenant ownership. Deletion now requires a host-injected authoritative
tenant/SIS identity resolver, verifies both returned identities, and deletes the
resolved remote ID. Clients without that resolver fail closed. This is an injected
client contract tested with fixtures, not a verified Mem0 SDK integration. A real
client must implement authoritative lookup and tenant authorization. The existing
in-memory write queue is not durable; retention enforcement, restart recovery and
delete/write races require live-provider acceptance before that adapter is used
as a production memory store.

Codex's exact `471077cf` review reported no major issues. Copilot review
`5478863478` at that same revision found two previously missed defects: local
workspace filtering happened after provider ranking/limits, and an oversized
received audit chunk did not exhaust the remaining aggregate budget. The next
repair filters workspace before ranking and exhausts the budget before rejection,
with starvation and stream-cancellation regressions. Its final review and fresh
CI remain separate gates.

The next exact-head Copilot review (`5478887558` on `8abeea2a`) found failed
HTTP response bodies that were left open in estate metadata, artifact inspection
and the MCP gateway, plus an incorrect Node 18 claim for the native root runtime.
These paths now cancel rejected bodies; metadata fetches deny redirects. The
operational root declares only the tested Node 22 and 24 lines. The portable core
retains its independent Node 18 consumer test. Only the two package-manifest
source digests in the Foundry lock changed; historical review provenance did not.

Review job logs for the latest creator Copilot review disclose GPT-5.6 Sol. That
is an independent agent/service, but does not establish a different model provider
from Codex. A model-selected external review is still required before merge.

Anthropic Claude Opus 5.5 reviewed exact `e91a49dc` in hosted session
`650449fc-40ce-43e5-87d7-d0d8f144c3e4`. It reproduced quadratic email
sanitization, broken root npm installation through an unpublished workspace
dependency, and Turbo editing agent instructions. The repair constrains email
and JWT scan starts, rejects facts above 16,000 characters before sanitizer work,
disables Turbo agent guidance, and restores the operational SDK's self-contained
contracts/sanitizer. Its build/dev/test/lint no longer require pnpm. Root migration
stays separately versioned and is not published by the modular release workflow.
The SDK candidate now packs through npm and installs without a core tarball;
that test must pass rather than masking an unpublished dependency with a local
package. Local memory IDs are also namespaced by tenant to prevent overwrites.
The existing npm root version is 8.5.1 as verified on 10 October; this branch does
not republish or downgrade it. Fresh CI and exact-revision review are required.
