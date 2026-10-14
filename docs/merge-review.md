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
- the **maker vendors**: every vendor named in commit trailers (`Co-authored-by`,
  `Signed-off-by` and similar) or commit author and committer identities. Provenance
  must be positive: every commit must name a vendor, and the branch seat's vendor
  (`agent/<harness>/...`) must be among them. A commit with no vendor signal, or a
  branch the commits do not corroborate, makes the maker **unknown**; the runner then
  refuses and no checker PASS qualifies. A Grok-made commit on `agent/claude/x` with a
  Grok trailer yields `anthropic` and `xai`. An agent marker with no known vendor
  (Cursor, Copilot and similar) also makes independence unprovable.
  Residual: trailers are self-declared. A harness that writes a false trailer can still
  misstate its vendor; only signed provenance from a second identity closes that.

Ledger entries are judged only when the receipt names this repository and PR, so a
FAIL recorded for another PR that shares the head SHA does not poison this one. Check
runs and comments are read across every page; a listing above the cap (1,000 check
runs, 3,000 comments) or one whose count does not add up fails closed rather than
being truncated. PR content, including the routine-path check, is classified only from
the compare API at explicit base and head SHAs, never from the moving `/files`
listing, and the head is re-read after classification.

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
  from every actor who pushed the head branch (activity API of the head repository,
  so a fork's pushes are read from the fork). If any of these identities cannot be read
  or linked to an account, or the activity listing is empty or fails, no approval counts.

A `CHANGES_REQUESTED` review at the head by any human blocks, and a later `DISMISSED`
review withdraws that reviewer's approval. A blocking checker ledger entry is not
overridden by a human approval.

The check still cannot judge the report's quality. It establishes who recorded the
evidence and that it covers this exact content, not that the review was good.

### Re-evaluation

Only default-branch triggers run the policy: `pull_request_target` (source, base,
title and auto-merge changes), `issue_comment` from collaborators or Apps, a schedule,
and dispatch from the default branch. No `pull_request` or `pull_request_review`
trigger exists for this check, because those run the PR's own workflow copy. Comment
runs queue per PR instead of cancelling, so a stream of comments cannot keep an
evaluation from finishing, and comments from non-collaborators are ignored before the
job starts.

- The schedule every 30 minutes lists **all** open PRs across every page and
  evaluates the 25 least recently evaluated (never-evaluated first). New activity on
  other PRs cannot starve an old one. GitHub may delay scheduled runs;
- dispatch `merge-review.yml` with a PR number to re-evaluate at once.

Any API error, rate limit or trust-file problem during an evaluation publishes a
failing check for that head instead of leaving an earlier green one. If the PR itself
cannot be read, a `pull_request_target` run still fails the head named by the event.

**Residual latency:** after an approval is dismissed, a green check can stay green
until the PR's turn in the sweep (with N open PRs, about N/25 sweeps) or a dispatch.
Do not merge on the strength of a human approval you did not just see.

## Residual risk that code cannot close

**Forged policy check.** The required `independent-review-policy` context is trusted by
app id 15368 (GitHub Actions), which every workflow shares. A same-repository PR can add
its own `pull_request` workflow with `checks: write` that posts a green check under that
name. Each run this gate writes names its workflow run in `external_id`; the gate fails
any evaluation that finds another check of that name at the head not written by the
default-branch `merge-review.yml` (`pull_request_target`, `issue_comment`, `schedule`,
or a default-branch dispatch). It cannot stop a forged check written *after* its own,
and branch protection reads the newest. Closing this needs the check produced under an
identity no PR workflow holds (a dedicated App's check, bound by `integration_id`) and
a second identity to own that App. Check runs written before this change carry no run
id and count as foreign, so existing open PRs need a new push or a fresh evaluation.

**Trust root.** Anyone holding the owner's login is a repository administrator. The live
ruleset "Independent source review and CI" (id 24873080) has
`bypass_actors: [{RepositoryRole 5 (admin), bypass_mode: always}]`,
`pull_request.required_approving_review_count: 0`, `require_code_owner_review: false`,
`require_last_push_approval: false`, and classic protection on `main` has
`enforce_admins: false`. After a second identity exists, change exactly: remove the
admin bypass actor; set `required_approving_review_count` to 1,
`require_code_owner_review` and `require_last_push_approval` to true; set
`enforce_admins` to true; and make the independent owner the code owner of
`checker-trust.json` and `.github/CODEOWNERS`. Until then that login can still: bypass the
ruleset to change `main`, edit `checker-trust.json` and CODEOWNERS that way, edit the
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
