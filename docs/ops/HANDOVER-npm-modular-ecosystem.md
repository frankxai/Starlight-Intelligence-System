# Modular npm ecosystem pickup

Tracking: [SIS issue 329](https://github.com/frankxai/Starlight-Intelligence-System/issues/329).
Estate record: [hub draft PR 217](https://github.com/frankxai/agentic-ops-hub/pull/217).
Date: 10 October 2026. Owner: this Codex session.

Current pickup: implementation checkpoint `5f3375d90efe0e4ab7ae7394d988237a48630b11`
and integration `efccc9c2916d6d16614d69d393f27a51a0390c41` are pushed on this lane.
Integration preserves main's 8.5.0 terminal/creator SDK and its organization
candidate. Root lint/build and 69 terminal/creator tests passed. Subsequent core
credential/prototype/replacement hardening passes six core and 24 sanitizer tests;
14 package integration and five release-safety tests pass. Core is now 8,642 bytes
of JavaScript and 12,483 bytes compressed with schemas. Full workspace dependency
audit reports zero vulnerabilities after esbuild/fast-uri patch overrides.
Separate plugin/site alerts remain open and are not covered by that audit.

Next: finish the clean-revision artifact/installed-consumer receipt, open the draft
product PR, obtain independent provider review and hosted checks, then configure
first publication/OIDC. No package was published by this session. Do not retry
publishing ambiguous versions or treat failed reviewer authentication as approval.
The value proposal and 45-package catalog retain their limited evidence coverage.

Earlier continuation evidence follows; its sizes and held-admission status are
historical and are superseded by the current pickup above.

Continuation: package builds, 13 integration tests, real tarball Gitleaks/allowlist
audits, separate installed-consumer declaration checks and 13 integration tests now
pass. Root lint/build and 43 native regression tests pass. The AI adapter now
publishes its required JSON Schema type dependency. Core has 7,568 bytes of
JavaScript and an 11,923-byte compressed tarball. Registry inventory is now 45
latest-version metadata records, not 45 verified installed artifacts.
Review attempts returned Claude quota and Gemini client eligibility errors; no
independent verdict exists. Latest accepted main is fe964d5a9449704c841cad821f8f2e6d02c9551b.
Next: checkpoint this implementation, integrate main's terminal/creator SDK changes,
repeat affected checks, and obtain independent review. Publication remains gated
by clean receipts, hosted CI and trusted-publisher setup.

## Implementation lane

- Worktree: `C:/Users/frank/starlight/repos/.codex-worktrees/sis-npm-modular-ecosystem`.
- Origin: `https://github.com/frankxai/Starlight-Intelligence-System.git`.
- Branch: `agent/codex/npm-modular-ecosystem`.
- Immutable base: `421c873533ea68791b38a37378f28f0c88b709a2` from origin/main.
- All implementation edits remain local and uncommitted. No product PR exists yet.
  Preserve this worktree and its separate index. The primary `codex/consolidate`
  scope-migration work belongs to another session and was left untouched.

The four requested implementation surfaces exist: zero-dependency core (shared
with root SIS), AI SDK 7 middleware, official MCP SDK v2 server/stdio gateway bridge,
and pnpm/Turbo/Changesets plus artifact-bound OIDC workflows. Read
`docs/architecture/NPM_MODULAR_IMPLEMENTATION.md` and each package README for
trust boundaries, two-line integration, versions, and account setup.

Core candidate 0.1.0 preserves 13 schema exports. Adapter/MCP candidates are also
0.1.0. The initial minor Changeset proposes 0.2.0; versioning has not run. Root
legacy name/version stay unchanged; its dependency now points to workspace core.
Root npm lock was removed in favor of the updated pnpm lock. Nested plugin/native
dependency lanes retain their locks. Six root workflows now install frozen pnpm
dependencies; no npm publishing token is used by the new release workflow.

## Verification and admission

- Earlier three package builds and 13 integration tests passed on Node 24.16.0.
  This predates final hardening edits and is not a final-revision build claim.
- 35 focused tests passed afterwards: existing provider routing/local-core,
  existing sanitizer coverage (including documented gaps), and four tarball/
  release-denial tests. Five current-source core tests also passed through tsx.
- Both new workflows parsed as YAML. Changesets status lists the three minor bumps.
- `git diff --check` passed after preserving baseline line endings.
- Local pnpm install used ignored lifecycle scripts; the SQLite native binary was
  not built. Full root/native regression checks remain open.
- Latest build preflight: HOLD, RAM 3,283 MB free / 8,192 MB required, CPU 81%,
  posture maintenance/drain-and-handoff. No foreign processes were stopped.

Final builds, actual tarball scanner/budget receipts, installed consumer tests,
hosted CI, and independent provider review remain pending. The release workflows
are configured, not executed. npm org access, per-package trusted publishers, and
the protected `npm-production` environment have not been verified. No package was
published, deprecated, or represented as release-ready.

## Source and instructions

The implementation source fingerprint is in ignored
`artifacts/npm-ecosystem-implementation/source-snapshot.json`. It binds modified/new
implementation files and deletions to the base; the handover itself is excluded
to avoid a circular receipt. It is not a publication receipt or a commit.

Root guides explicitly read at this base:

- AGENTS: `B05683E142FAFCB7E907CEE0DD51F068180C28DD415AF819EF0E3146373B8F24`.
- CLAUDE: `2E306B5B029343941C7A5D279C216A27C5C1C28C36B892377FA8BC36C35DB8FD`.
- CREATOR: `F0E6BA4B61FEF37CDE70F642F6000FDB8A3990171021CEC5678D08C8E0FEC4A7`.

Blueprint source and hash are in the architecture record. Workspace bootstrap,
machine policy, founder quality policy, and humanizer were read. Location guard
and explicit-file routing checks passed; ownership was checked separately. No
deeper instructions were found for the implementation paths. The Emil guide was
read; UI/touch/motion checks are inapplicable to these packages. Missing shared
capability/progressive-loading/storage-sensor pointers from the earlier audit
remain unresolved. Policy loading is not runtime enforcement.

## Next admitted step

Verify ownership, source fingerprint, current guides, RAM/storage, and admission.
Then run frozen install, package tests, actual tarball verification, consumer install,
root type/build and relevant regressions, and Changesets checks. Materialize only
the tracked fixtures needed by mandatory repository hooks before committing; the
worktree is sparse. Keep secret and test hooks enabled. Obtain exact-source
independent provider review, fix findings, commit explicit owned files and create
a draft product PR linked to #329. Rebuild a clean-revision artifact receipt after
commit. Reconcile the other session's system rename/shim separately. Account
configuration and approval of the concrete release packet precede publication.

All finite test clients/fixture servers closed. No session-owned worker, watcher,
or server is left running.
