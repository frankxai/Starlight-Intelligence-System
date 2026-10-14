# Merge review and npm release

The `independent-review-policy` check evaluates a PR's current source identity and
review evidence. A passing check establishes the recorded review's acceptance by
the evaluator. Package publication and production readiness require separate
evidence.

## Trust roots

Who can attest is pinned in
[`tools/merge-review/checker-trust.json`](../tools/merge-review/checker-trust.json),
never in a repository variable. The gate and the checker runner both read it from
the trusted default-branch checkout, so a PR cannot change the rules it is judged
by. The file is CODEOWNED and high risk. It holds:

- the checker App's numeric `appId` and its bot account's numeric `botUserId`
  (slug and login alone are not trusted). `github-actions` and the harness Apps
  are denied outright;
- `independentReviewers`: numeric user ids of humans independent of every agent
  harness;
- `nonIndependent`: the shared owner login and harness or automation accounts,
  which never count as independent;
- the seat-to-vendor table, branch harness names and vendor patterns that both
  tools use to decide who made a change and who may review it;
- the C940 signer, if that optional path is ever enabled.

**As shipped every attestation path is OFF.** `appId` is null and
`independentReviewers` is empty, so the check fails closed on every non-routine PR
until a reviewed PR fills them in. That is deliberate: both values need an identity
that the agents' shared login does not control.

## Who can attest

A comment from the owner's login attests nothing. Every harness on the owner's
machine shares that `gh` login, and on 2026-10-12 PR #377 merged on a canned
receipt posted that way. The gate accepts exactly two kinds of evidence.

### 1. A checker App ledger entry

The [independent review runner](merge-review-runner.md) records each verdict twice
with the App's installation token:

- an `independent-review-receipt` **check run** on the head SHA: the ledger. Check
  runs cannot be deleted, and only the App that created one can change it. Its
  `output.text` is the canonical receipt JSON and its `output.summary` is
  `receiptSha256: <sha256 of that text>`. PASS is conclusion `success`; REVISE and
  FAIL are `failure`;
- a mirror **comment**: `STARLIGHT-INDEPENDENT-REVIEW-V1`, a newline (LF or CRLF),
  then the same canonical JSON, for people to read.

The gate lists check runs for the head filtered by the pinned `appId` and decides:

1. any non-PASS or unreadable ledger entry at this head **blocks for good**. A later
   PASS at the same head does not re-roll it; push a fix and review the new head;
2. any App receipt comment at this head without a matching ledger entry blocks;
3. the newest ledger entry must be a PASS whose mirror comment exists, is
   byte-identical after the marker, was never edited (REST timestamps and GraphQL
   `lastEditedAt` and edit count, from #403) and whose receipt matches this PR. A
   deleted, edited or mismatched mirror fails closed;
4. a matching PASS that does not *qualify* (see below) is ignored. It neither passes
   nor blocks, so an independent human can still approve.

The receipt contains `repository`, numeric `pr`, full `headSha`, `maker`,
`makerVendors`, `provider`, `verdict`, `blockingFindings`, `reviewedFiles`,
`manifestSha256`, the complete `review` (80+ characters) and its `reviewSha256`,
`packetSha256`, a nonempty `resolution`, and `cost_usd` with `cost_source`
(`billed`, `estimated` or `unknown`; an unknown cost is `null`, never `0`). See the
[schema](../tools/merge-review/review-receipt.schema.json), the
[evaluator](../tools/merge-review/merge_review_gate.py) and its
[regression tests](../tools/merge-review/tests/test_merge_review_gate.py).

The gate recomputes, from the compare API at the PR's base and the receipt's head:

- the **manifest**: head SHA, merge base and, for every file, its path, previous
  path, status, blob SHA and patch SHA-256. `manifestSha256` must match, and
  `reviewedFiles` must equal the manifest paths exactly. A review of other content
  recorded under this head (a force-push race) fails;
- the **maker vendors**: the vendor of the branch seat (`agent/<harness>/...`) plus
  every vendor named in commit trailers (`Co-authored-by`, `Signed-off-by` and
  similar) or commit author and committer identities. The branch name is a claim; a
  Grok-made commit on `agent/claude/x` yields `anthropic` and `xai`. An agent marker
  with no known vendor (Cursor, Copilot and similar) makes independence unprovable,
  so no checker PASS qualifies.

A PASS *qualifies* when the provider is a different seat from the maker, its vendor
is known and outside every maker vendor, and, for a high-risk change, the provider
is CTO (or, for a CTO-made change, Codex, Claude Code or Antigravity). CTO has no
verifiable vendor in the trust file, so today no checker PASS qualifies on a
high-risk change; those need an independent human.

### 2. An independent human review

An `APPROVED` pull request review on the exact head counts only when the reviewer:

- is a `User` with association `OWNER`, `MEMBER` or `COLLABORATOR`;
- has a numeric user id listed in `independentReviewers` and not in `nonIndependent`;
- differs from the PR author, from every commit author and committer in the PR, and
  from every actor who pushed the head branch (repository activity API). If any of
  these identities cannot be read or linked to an account, no approval counts.

A `CHANGES_REQUESTED` review at the head by any human blocks, and a later `DISMISSED`
review withdraws that reviewer's approval. A blocking checker ledger entry is not
overridden by a human approval.

The check still cannot judge the report's quality. It establishes who recorded the
evidence and that it covers this exact content, not that the review was good.

### Re-evaluation

The check re-runs on PR source changes, auto-merge changes, base or title edits, and
any PR comment. Review events cannot trigger it directly, because a
`pull_request_review` workflow runs the PR's own copy. Instead:

- `review-event-relay.yml` (no permissions, does nothing) fires on review submit,
  edit and dismiss, and the default-branch policy workflow re-evaluates through
  `workflow_run`. Expected latency is a minute or two;
- a schedule every 30 minutes re-evaluates the 25 most recently updated open PRs.
  GitHub may delay scheduled runs, so allow up to an hour;
- dispatch `merge-review.yml` with a PR number to re-evaluate at once.

**Residual latency:** after an approval is dismissed, a green check can stay green
until the relay or sweep runs. Do not merge within that window on the strength of a
human approval you did not just see. A PR edit can also break its own relay copy;
the sweep and dispatch still cover it.

## Residual risk that code cannot close

Anyone holding the owner's login is a repository administrator. Until a second,
independent identity exists, that login can still: push to `main` (no ruleset is
applied), edit `checker-trust.json` through such a push, edit the
`starlight-checker` environment, delete the App's mirror comments (which only blocks),
and register runners. Each of these is an admin action that appears in the audit
log, where posting a comment was not. The weak paths are therefore off by default:
no App id, no human reviewers, no C940 signer, C940 job disabled. Closing them for
good needs a second identity: give agents fine-grained tokens without
Administration, Variables or Environments permissions, list an independent owner in
CODEOWNERS, and apply the ruleset in the [runner doc](merge-review-runner.md).

The earlier allowlist of `cursor` and `chatgpt-codex-connector` (#403) is
superseded. Those Apps post as the owner's login on the owner's machine, which is
the same shared identity.

## High-risk changes and auto-merge

Changes touching money, publish, secrets, auth, licensing, agent instruction
files (`AGENTS.md`, `CLAUDE.md`, `SKILL.md` and similar), dependency manifests
and lockfiles (`package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`;
the gate cannot verify a patch-only bump), or the gate and policy files
themselves (`tools/merge-review/` including `checker-trust.json`,
`tools/jules-conductor/`, `.github/`, this document and the runner doc) are high
risk. A rename is judged on both its old and new path, so moving `src/auth.py` to
`src/helper.py` stays high risk. High-risk paths under `docs/notes/` or
`docs/handovers/` lose the routine exemption. The check fails while GitHub
auto-merge is armed on a high-risk PR; high-risk PRs never auto-merge. Auto-merge is
allowed only for low-risk changes after a qualifying exact-head PASS and green
checks. The runner is the only tool here that records receipts; nothing enables
auto-merge.

## Recover a failed or missing check

Inspect the check summary. Compare the newest `independent-review-receipt` check run
and its mirror comment with the current head and manifest. A recorded REVISE or FAIL
at a head is final for that head: resolve the findings, push, and dispatch the
checker runner for the new head. If a mirror comment is missing or edited, dispatch
the runner again; the newest complete PASS with an intact mirror decides. Never edit
or delete a receipt to conceal a failure; the ledger keeps it anyway.

If an event was missed, dispatch `merge-review.yml` on `main` with the PR number.
The workflow runs trusted default-branch code and reads PR metadata; it never
executes PR source. Inspect the named check's conclusion: the enclosing workflow
can succeed after publishing a failing review check. Closed PRs are not evaluated.

The only routine exemption is ordinary `100644` `.md` or `.txt` files below
`docs/notes/` or `docs/handovers/`, excluding instruction files and unsafe paths.
Renames, executable files, symlinks and other paths require evidence. Normal CI
still applies. Do not move substantive work into these directories to evade review.

Administrators must verify real hosted denial and acceptance before requiring
the check. Preserve existing protection, CI and security rules; bind required
checks to the observed GitHub Actions app. A merged workflow alone does not prove
that branch protection requires its result. Inspect the live repository rules.

## Release remains a separate decision

Before npm publication, verify legitimate package-level publisher authority,
the accepted source revision, actual tarball digests and clean installed consumers
on the supported runtime matrix. Publish the tested artifact with the reviewed
OIDC workflow and verify registry integrity, provenance and installation afterward.
Reconcile registry state before retrying an ambiguous publication. Preserve
reserved versions and required release-environment review. A successful pack,
merge check or CI run does not establish publication or customer acceptance.
