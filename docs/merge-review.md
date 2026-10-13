# Merge review and npm release

The `independent-review-policy` check evaluates a PR's current source identity and
review receipt. A passing check establishes the recorded review's acceptance by
the evaluator. Package publication and production readiness require separate
evidence.

## Submit a review

A PR merges only with a PASS from a different seat or model than its author.
Valid reviewers are Codex (`codex`), Claude Code (`claude-code`), Antigravity
(`antigravity`), Grok (`grok`), Gemini (`gemini`) and CTO (`cto`). A self-review never counts: the receipt's
`provider` must differ from its `maker`. Jules is never a reviewer and opens
drafts only; the Jules conductor never merges or enables auto-merge. Supply the exact commit and every
changed file. Preserve blocking findings, failed checks and limitations. A source
change requires a fresh exact-head review; an older passing report is insufficient.

A receipt is a PR comment beginning with
`STARLIGHT-INDEPENDENT-REVIEW-V1` followed by a newline and a JSON receipt.
The evaluator accepts LF or CRLF after the marker and preserves the report's
UTF-8 bytes for SHA-256 verification. See the [evaluator](../tools/merge-review/merge_review_gate.py)
and its [regression tests](../tools/merge-review/tests/test_merge_review_gate.py).

The receipt contains `repository`, numeric `pr`, full `headSha`, `maker` (the author seat:
`codex`, `claude-code`, `antigravity`, `grok`, `cto` or `jules`),
`provider`, `verdict`, `blockingFindings`, all `reviewedFiles`, the complete
`review`, its `reviewSha256`, the review packet's `packetSha256`, a nonempty
`resolution`, and `cost_usd` with `cost_source` (`billed`, `estimated` or `unknown`;
an unknown cost is `null`, never `0`). Only `PASS` counts. Use it only after resolving every blocking finding;
do not translate an incomplete review into approval. The report must contain at
least 80 characters. Hash the actual report and the actual supplied packet.

## Who can attest

A comment from the owner's login attests nothing. Every harness on the owner's
machine shares that `gh` login, and on 2026-10-12 PR #377 merged on a canned
receipt posted that way. The gate now accepts exactly two kinds of evidence:

1. **A checker App receipt.** The comment's `performed_via_github_app.slug` equals
   the configured checker App (repository variable `CHECKER_APP_SLUG`, default
   `starlight-checker`), its author is that App's own `<slug>[bot]` account, and
   that account is neither the PR author nor the head commit's author or
   committer. Only the App's installation token produces such a comment. The
   [independent review runner](merge-review-runner.md) posts it after a
   reviewer from another vendor reads the diff as data. By default that is an
   API-key call on a GitHub-hosted runner; the C940 job is optional.
2. **A real GitHub review.** An `APPROVED` pull request review on the exact head,
   by a `User` account with association `OWNER`, `MEMBER` or `COLLABORATOR` that
   is not the PR author or head commit author or committer. GitHub forbids
   self-approval, so agents using the owner's login cannot produce it. Dispatch
   `merge-review.yml` with the PR number after approving; review events do not
   trigger the gate, because they would run the PR's copy of the workflow.

A `CHANGES_REQUESTED` review at the head blocks, and a later `DISMISSED` review
withdraws that reviewer's approval. The newest current-head checker receipt wins;
if it is not a valid PASS, a human approval does not override it. Push a fix and
run the checker again. Comments from any other account or App are ignored: they
neither pass nor revoke.

The check still cannot judge the report's quality. It establishes who posted the
evidence, not that the review was good.

**Residual risk.** Anyone holding the owner's login remains a repository
administrator. That login can repoint `CHECKER_APP_SLUG`, edit the
`starlight-checker` environment, or register a rogue runner with the
`starlight-checker` label and receive the App token. Each of these is an
admin action that appears in the audit log, where posting a comment was not.
Closing them for good needs a second identity: give agents fine-grained tokens
without Administration, Variables or Environments permissions, and apply the
ruleset in the runner doc.

The earlier allowlist of `cursor` and `chatgpt-codex-connector` (#403) is
superseded. Those Apps post as the owner's login on the owner's machine, which is
the same shared identity. #403's edit rule stays: an edited receipt
(`updated_at` differs from `created_at`) never counts, and neither does one
whose GraphQL edit history shows `lastEditedAt` or any content edit, because GitHub
keeps the original App attribution after an edit and REST timestamps have
one-second resolution. If edit history cannot be read, the check fails closed.
Post a new receipt instead of editing one. The App only shows which integration
posted the comment, not which seat or model is behind it.

## High-risk changes and auto-merge

Changes touching money, publish, secrets, auth, licensing, agent instruction
files (`AGENTS.md`, `CLAUDE.md`, `SKILL.md` and similar), dependency manifests
and lockfiles (`package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`;
the gate cannot verify a patch-only bump), or the gate and policy files
themselves (`tools/merge-review/`, `tools/jules-conductor/`, `.github/`, this
document) need a CTO PASS from the checker App or a distinct human's approval. When CTO is the maker, a PASS from another admitted
seat (Codex, Claude Code or Antigravity) is required instead. High-risk paths
under `docs/notes/` or `docs/handovers/` lose the routine exemption. The check
fails while GitHub auto-merge is armed on a high-risk PR, and re-runs when
auto-merge is enabled or disabled; high-risk PRs never auto-merge. Auto-merge is allowed only
for low-risk changes (docs, copy, patch-level dependency bumps) after a separate
exact-head PASS and green checks. The checker runner posts receipts with its
vendor seat as `provider`, never `cto`, so until a CTO checker mode exists a
high-risk PR passes only through a distinct human's exact-head approval. The
runner is the only tool here that posts receipts; nothing enables auto-merge.

## Recover a failed or missing check

Inspect the check summary and compare the receipt with the current PR head and
complete changed-file list. Repair missing or invalid evidence, resolve findings,
then dispatch the checker runner again. The workflow evaluates PR comment changes and
PR source changes. A newer parsed, current-head invalid or blocking receipt revokes
an earlier pass. Stale-head receipts and comments without a recognized marker are
skipped. Never overwrite a historical failed report to conceal the failure.

If the event was missed, dispatch `merge-review.yml` on `main` with the PR number.
The workflow runs trusted default-branch code and reads PR metadata; it never
executes PR source. Inspect the named check's conclusion: the enclosing workflow
can succeed after publishing a failing review check. Closed PRs are not evaluated.

The only routine exemption is ordinary `100644` `.md` or `.txt` files below
`docs/notes/` or `docs/handovers/`, excluding instruction files and unsafe paths.
Renames, executable files, symlinks and other paths require a receipt. Normal CI
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
