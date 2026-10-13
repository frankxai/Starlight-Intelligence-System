# Merge review and npm release

The `independent-review-policy` check evaluates a PR's current source identity and
review receipt. A passing check establishes the recorded review's acceptance by
the evaluator. Package publication and production readiness require separate
evidence.

## Submit a review

A PR merges only with a PASS from a different seat or model than its author.
Valid reviewers are Codex (`codex`), Claude Code (`claude-code`), Antigravity
(`antigravity`) and CTO (`cto`). A self-review never counts: the receipt's
`provider` must differ from its `maker`. Jules is never a reviewer and opens
drafts only; the Jules conductor never merges or enables auto-merge. Supply the exact commit and every
changed file. Preserve blocking findings, failed checks and limitations. A source
change requires a fresh exact-head review; an older passing report is insufficient.

The trusted attestor posts a PR comment beginning with
`STARLIGHT-INDEPENDENT-REVIEW-V1` followed by a newline and a JSON receipt.
The evaluator accepts LF or CRLF after the marker and preserves the report's
UTF-8 bytes for SHA-256 verification. See the [evaluator](../tools/merge-review/merge_review_gate.py)
and its [regression tests](../tools/merge-review/tests/test_merge_review_gate.py).

The receipt contains `repository`, numeric `pr`, full `headSha`, `maker` (the author seat:
`codex`, `claude-code`, `antigravity`, `cto` or `jules`),
`provider`, `verdict`, `blockingFindings`, all `reviewedFiles`, the complete
`review`, its `reviewSha256`, the review packet's `packetSha256` and a nonempty
`resolution`. Only `PASS` counts. Use it only after resolving every blocking finding;
do not translate an incomplete review into approval. The report must contain at
least 80 characters. Hash the actual report and the actual supplied packet.

The attestor must be `frankxai` with GitHub association `OWNER`, `MEMBER` or
`COLLABORATOR`. This is an identity-based attestation: the check cannot authenticate
the model or judge the report's quality. The attestor must inspect the evidence.

## High-risk changes and auto-merge

Changes touching money, publish, secrets, auth, licensing, agent instruction
files (`AGENTS.md`, `CLAUDE.md`, `SKILL.md` and similar), dependency manifests
and lockfiles (`package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`;
the gate cannot verify a patch-only bump), or the gate and policy files
themselves (`tools/merge-review/`, `tools/jules-conductor/`, `.github/`, this
document) need a CTO PASS. When CTO is the maker, a PASS from another admitted
seat (Codex, Claude Code or Antigravity) is required instead. High-risk paths
under `docs/notes/` or `docs/handovers/` lose the routine exemption. The check
fails while GitHub auto-merge is armed on a high-risk PR, and re-runs when
auto-merge is enabled or disabled; high-risk PRs never auto-merge. Auto-merge is allowed only
for low-risk changes (docs, copy, patch-level dependency bumps) after a separate
exact-head PASS and green checks. No tool in this repository posts a receipt or
enables auto-merge on its own behalf.

## Recover a failed or missing check

Inspect the check summary and compare the receipt with the current PR head and
complete changed-file list. Repair missing or invalid evidence, resolve findings,
then post the corrected receipt. The workflow evaluates PR comment changes and
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
