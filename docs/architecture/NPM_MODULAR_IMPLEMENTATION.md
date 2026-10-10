# Modular npm implementation

Status: implementation branch; publication and acceptance gates remain open.
Tracking: [SIS issue 329](https://github.com/frankxai/Starlight-Intelligence-System/issues/329).

10 October follow-up: adversarial fixtures reproduced acceptance of unterminated
archives and ambiguous paths in the release/static-audit parser. The parser now
requires complete padded blocks and two zero terminator blocks, rejects concealed
trailing members, malformed octal fields, control/colon/empty path segments and
directory payloads, and counts directories toward the existing200-member budget.
Legitimate dotted filenames remain accepted. All13 release/audit tests pass, and
the three existing actual package archives still parse. These checks cover the
parser change; fresh hosted artifact consumers and exact-revision independent
review remain required. Local build admission is HOLD7222MB/8192required; no new
build or independent reviewer was launched. Prior hosted results retain their
earlier revision boundaries. Both npm-production environments now exist with
owner approval and main-only policies; default admin bypass remains enabled.

## Decision and boundaries

Extract shared contracts and context projection into dependency-free core. Build
AI SDK middleware and an official MCP SDK server against those contracts. Keep
the operational SIS runtime as their host/provider rather than duplicating its
database, memory router, or vault filesystem.

| Package | Responsibility | Runtime dependencies |
| --- | --- | --- |
| `@starlight-intelligence/core` | Protocol/provider types, existing Veil sanitizer, scoped context projection | None |
| `@starlight-intelligence/ai-sdk` | AI SDK model middleware for generation and streaming | Core; AI SDK 7 peer |
| `@starlight-intelligence/mcp` | Official MCP SDK v2 server factory and read-only stdio gateway bridge | Core, official MCP server, Zod |

All three candidates are now versioned at0.2.0 using the initial minor Changeset.
Changesets3.0.3 generated their changelogs and consumed that completed Changeset;
the root8.5.0 manifest and lockfile are unchanged. Its read-only publish-plan
confirms only core, AI SDK and MCP, in dependency order, are unpublished candidates.
CI checks this plan after versioning; status reports no pending Changeset once it
has been consumed. Actual archive/installed-consumer checks and source-bound OIDC
publication remain the release gates. No registry publication occurs through the
plan command. Exact-revision review/account bootstrap and fresh hosted acceptance
remain open. Local build admission remains HOLD7334MB/8192required; the version
command made text changes and its automatic pnpm update found the lockfile already
up to date without dependency resolution or new installs.
Public code and retained schemas use MIT. No creative canon or private instance
state is included.

The alternative was a separate new memory engine inside each adapter. That would
duplicate retention, indexing, tenant policy, and provider configuration. These
packages reuse the existing provider contract and add a shared safe projection.
The existing root imports the extracted contracts and sanitizer, so core is used
by SIS as well as the new integrations.

The root legacy package name remains unchanged on this branch to preserve the
other session's scope-migration lane. Its subpath exports and binaries are retained.
The `packages/core` schema subpaths are retained under the new core scope. No
shim, deprecation, or first publication is performed here. Reconcile the root
scope rename and Changesets ignore entry before integrating that separate lane.

## Trust and lifecycle

Hosts supply authenticated providers and fixed tenant/workspace scope. Projection
checks that returned records match scope before exposing sanitized facts. It
excludes raw content, private/secret/regulated records, invalid or expired retention,
duplicate IDs, and nonfinite scores. Public records are permitted; private-shareable
records require explicit host authorization. Query, record count, text budget,
and recall waiting are bounded. Sanitizer/provider failures stop recall without
credential-bearing messages. Cancellation reaches cooperative providers, while
the deadline also bounds waiting on uncooperative providers.

The gateway bridge talks to the existing single-tenant SIS search endpoint. That
endpoint has no multi-tenant authorization contract. The bridge labels results
with the configured dedicated tenant/workspace; it cannot establish those labels
from independent upstream identity. Never use one unsegregated gateway for several
tenants. The programmatic provider integration can enforce real upstream tenant
and workspace policies.

MCP is read-only by default. Writes/deletes require host grants and provider methods.
The existing deletion contract supports tenant/ID only, so workspace-scoped deletion
is rejected. Provider implementations own actual write cancellation, idempotency,
and retention enforcement. Sanitizer regexes and untrusted-reference prompt labels
do not guarantee complete secret detection or prompt-injection resistance.
Attestation and harness types declare contracts; they do not verify signatures or
enforce machine admission.

## Development and release

The root and these three packages form the pnpm workspace. Other nested apps,
plugins, native validators, and repositories keep their own dependency lanes.
`pnpm-lock.yaml` is authoritative for this workspace; the stale root npm lock was
removed. Root workflows install pnpm
11.5.0 and use the frozen lock. Turbo builds core before dependents, with local
package tasks bounded to concurrency one. Avoid root `npm ci` with workspace protocols.

```sh
pnpm install --frozen-lockfile
pnpm run test:packages
pnpm run verify:packages
node scripts/test-npm-consumer.mjs
pnpm exec changeset status
pnpm run version:packages
```

`verify:packages` audits actual pnpm-generated tarballs, not dry-run listings.
It rejects unapproved members, links/traversal, missing export/bin targets,
unresolved workspace dependencies, core runtime dependencies and external imports,
and core JavaScript of 20,000 bytes or more. Gitleaks scans all regular file contents.
Receipts record source revision, dirtiness, SHA-256, SHA-512 integrity, and sizes.
Consumer verification installs these bytes outside workspace resolution, compiles
public declarations, and runs the package integration tests against installed exports.
Consumer runs remain in ignored artifacts for inspection.

CI checks Linux/Windows on Node 22/24 and runs tarball verification on Linux.
Core also has a Node 18 compatibility job to preserve the legacy SIS runtime floor.
All six jobs passed in hosted run
[38023639393](https://github.com/frankxai/Starlight-Intelligence-System/actions/runs/38023639393)
for PR head `5a977a1db747a84459d2fcdc6c8f507619206b06`.
PR jobs check GitHub's merge revision; their artifact receipt identifies the actual
source revision. Changes after this head require their own hosted verification.
`npm-ecosystem-release.yml` is manual and main-only. Verification creates the
tarballs before the separate `npm-production` environment job. The publish job
has OIDC permission, uses pinned npm 11.10.0, and publishes the same bytes with
provenance. It rejects dirty receipts, altered digests/integrity, token-based
credentials, and conflicting registry versions. Existing identical versions are
reconciled before publishing missing packages in core-first order. An ambiguous
publication failure stops; rerun checks registry integrity before retrying.
Publishing several npm packages is not atomic.

Account setup required before release:

1. Confirm ownership/access for each new package in the npm organization.
2. Configure a trusted publisher for `frankxai/Starlight-Intelligence-System`,
   workflow `npm-ecosystem-release.yml`, environment `npm-production`, allowing
   direct publish. New-package initialization may have a time-limited first-publish
   window; check the account's current setup immediately before release.
3. Configure GitHub `npm-production` protection with a required reviewer and main
   branch restriction. A YAML environment reference alone does not enforce approval.
4. Verify public repository/package eligibility for provenance and publish permissions.
5. Obtain exact-revision independent provider review and passing hosted checks.
6. Approve the concrete receipt/version set and dispatch the release workflow.

Source references: [AI SDK middleware](https://ai-sdk.dev/docs/ai-sdk-core/middleware),
[official MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/), and
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
Implementation was checked against installed upstream types because examples on
documentation pages can lag the current major.

## Evidence and remaining acceptance

Current continuation: accepted main `fe964d5a9449704c841cad821f8f2e6d02c9551b`
was integrated at `efccc9c2916d6d16614d69d393f27a51a0390c41`. Root identity remains
the accepted legacy package at 8.5.0; its terminal/creator exports and workflows
are preserved. Root lint/build and all 69 terminal/creator tests passed after
integration. The SDK candidate workflow now packs with pnpm and installs the core
candidate alongside each SDK identity, avoiding unresolved workspace dependencies
and an accidental dependency on an unpublished registry version.

The core sanitizer now masks complete common credential formats, database URIs
and complete/incomplete private-key blocks. Named context secret fields are
masked before recursively processing values. Literal replacement text cannot
reinsert a secret, and data property names cannot invoke prototype setters.
See the updated coverage contract for remaining gaps. These changes passed six
core tests and 24 legacy sanitizer coverage tests. All 14 package integration
tests and six release tests pass. Current core JavaScript is 8,642 bytes;
the compressed tarball is 12,483 bytes, including the preserved schemas.

The full workspace audit, including development dependencies, returned zero
reported vulnerabilities after locking esbuild 0.28.2 and fast-uri 3.1.8.
This does not cover the separate site/plugin dependency graphs. GitHub still
reports their sharp and MCP OAuth alerts; those need their own source and
runtime verification before fixes are claimed. Forty-five registry metadata
records remain inventory coverage rather than forty-five verified releases.

Independent provider review remains open. Claude and Gemini attempts
returned errors, not verdicts. The commercial/platform proposal in
`NPM_PLATFORM_VALUE_MAP.md` preserves unresolved authority and demand evidence.
Historical working-tree/admission evidence follows.

### Published artifact audit, 10 October 2026

`audit-npm-artifacts.mjs` checks the exact registry tarballs from the complete
45-package maintainer inventory. It verifies identity and integrity before static
entrypoint, dependency, state-path and redacted secret scans. Requests are registry-only
HTTPS without redirects; archive parsing and aggregate response bytes are bounded.
No package or lifecycle code executes. Five adversarial fixture tests join the six
release tests in `test:packages`; all eleven passed locally.

The observed scan inspected 42 archives and left three uninspected within its
budgets. Three published packages retained local workspace dependencies:
`@arcanea/library-pipeline`, `@arcanea/mcp-server`, and
`@starlight-intelligence/creator-mcp`. `arcanea-soul` advertises declarations absent
from its tarball. Two packages produced scanner findings requiring private triage;
these are not confirmed credential leaks. See `NPM_ARTIFACT_AUDIT.md` for exact
versions, coverage and limits. These findings invalidate blanket estate-wide
installation readiness, while leaving the separately verified three new candidates
as their own evidence set. Repairs belong to each source repository's owner.

### Historical local verification

Update, 10 October 2026: build admission recovered. Frozen installation, all three
package builds, 13 package integration tests, actual tarball allowlists and Gitleaks
scans, and installation into a separate consumer directory passed. The installed
consumer also passed strict TypeScript declaration checks and 13 integration tests.
This exposed a missing upstream JSON Schema declaration dependency in the AI adapter;
`@types/json-schema` is now a published dependency rather than a workspace-only fix.
Core JavaScript is 7,568 bytes and its compressed package is 11,923 bytes, including
the preserved schemas. Root lint/build and 43 native/provider/sanitizer tests passed.
Tracked sparse-checkout fixtures were materialized; the six previously failing
symmetry test files then passed all 53 tests. Mandatory hooks remain enabled.

These are working-tree results, not a clean publication receipt. Current main has
advanced to `fe964d5a9449704c841cad821f8f2e6d02c9551b`, including terminal SDK and
creator workflows. Integration and new verification against that revision are open.
Claude review returned a quota error; Gemini review returned a client eligibility
error. Neither attempt produced a review verdict. The live maintainer metadata
inventory now contains 45 packages; see `NPM_RELEASE_CATALOG.md` for exact coverage.
The earlier held-admission record below remains historical evidence.

Earlier local builds and 13 package tests passed on Node 24.16.0 before the final
release-hardening edits. Afterwards, 35 legacy provider/sanitizer and release-safety
tests passed, along with five tests against the current core source through tsx.
Both new workflow files parsed as YAML. Changesets status correctly identified the
three minor releases. Subsequent build admission was held below the 8,192 MB reserve
and later measured only 3,283 MB free, below the 4 GiB floor. Final-revision build,
tarball scan, consumer installation, root regressions, and independent review
remain pending until their recorded results are added to the handover.

The requested competitive position is an objective. This implementation supplies
modular integrations; it does not prove superiority over Vercel AI SDK, MCP,
LangGraph, or Mastra. A fair comparison needs scoped workloads, latency/size/cost
measurements, failure recovery tests, and buyer evidence. Browser/edge deployment,
live model providers, production gateway behavior, and multi-tenant provider
authorization also need deployment-specific validation.

Source blueprint inspected in the primary checkout:
`docs/architecture/NPM_ECOSYSTEM_STRATEGY.md`, SHA-256
`13FB83D2A50F3A10C7F83B99252405658919EAFF5E29DC5C923F416C74A6B2A6`.
Its prior audit claims are supplied context; this branch records its own evidence.

## Publication evidence and configuration isolation

The publisher requires a clean checkout at the exact manual main-branch release
workflow SHA. It verifies artifact identities and both digests before publishing.
Versions must be stable numeric semver before they enter filesystem paths.
Installed consumer checks write `consumer.json`, bound to the exact manifest bytes
and source SHA. A new attempt invalidates its earlier success before installing or
testing; publication rejects failed, partial or mismatched consumer evidence.

npm runs from a private temporary package directory with empty project, user and
global configuration and an environment allowlist. The allowlist retains GitHub
OIDC and provenance metadata while dropping inherited npm configuration, publishing
tokens, provider credentials and Node process options. A read-only npm test verifies
that the parent project's registry configuration is not inherited.

These checks prevent accidental execution outside the intended release path. npm's
signed OIDC trust configuration supplies account authorization. Environment strings
and consumer receipts alone do not establish independent review or human approval.
The protected `npm-production` environment and exact-revision review remain required.

On 10 October 2026, 16 release/artifact tests passed locally, including malformed
version denial, consumer evidence mismatch, workflow identity and configuration
isolation. Earlier hosted run 38028360568 passed all six jobs for `fdb1e47`; it does
not verify the subsequent publisher edits. Fresh CI and provider review must be
recorded for the resulting revision before release.
