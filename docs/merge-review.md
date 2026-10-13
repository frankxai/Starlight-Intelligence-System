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

The receipt comment must also be recorded by GitHub as posted through an
allowlisted GitHub App (`performed_via_github_app.slug` is `cursor` or
`chatgpt-codex-connector`). A comment with no posting App was written with a raw
token (a personal access token or the `gh` CLI) and never counts as a receipt;
it can neither pass nor revoke. An edited receipt
(`updated_at` differs from `created_at`) never counts either, and neither does one
whose GraphQL edit history shows `lastEditedAt` or any content edit, because GitHub
keeps the original App attribution after an edit and REST timestamps have
one-second resolution. If edit history cannot be read, the check fails closed.
Post a new receipt instead of editing one. The App only shows which integration posted the
comment, not which seat or model is behind it.

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
executes PR source. Inspect the named check and the job: this writer exits nonzero
when review is denied. The older implementation could publish a failing review
check while its job succeeded. Closed PRs are not evaluated.

The only routine exemption is ordinary `100644` `.md` or `.txt` files below
`docs/notes/` or `docs/handovers/`, excluding instruction files and unsafe paths.
Renames, executable files, symlinks and other paths require a receipt. Normal CI
still applies. Do not move substantive work into these directories to evade review.

Administrators must verify real hosted denial and acceptance before requiring
the check. Preserve existing protection, CI and security rules; bind required
checks to the observed distinct writer App after the activation proof below.
A merged workflow alone does not prove that branch protection requires its result. Inspect the live repository rules.

## Release remains a separate decision

Before npm publication, verify legitimate package-level publisher authority,
the accepted source revision, actual tarball digests and clean installed consumers
on the supported runtime matrix. Publish the tested artifact with the reviewed
OIDC workflow and verify registry integrity, provenance and installation afterward.
Reconcile registry state before retrying an ambiguous publication. Preserve
reserved versions and required release-environment review. A successful pack,
merge check or CI run does not establish publication or customer acceptance.

## Distinct writer setup and activation

The writer candidate uses the official `actions/create-github-app-token` v3.2.0,
pinned to its verified commit. Its installation token is limited to this repository,
requests Checks write plus Contents, Issues and Pull requests read, and is revoked
by the action's post-step. The ordinary workflow token has Contents read only.
The trusted workflow checks out its immutable `github.workflow_sha`; it never
checks out or runs PR source. The read-only fixture workflow uses no App secrets.

Owner setup is required before activation. Register a private GitHub App with only
those repository permissions and install it only on this repository. Disable its
webhook unless an accepted service needs one. No OAuth user tokens, PAT fallback,
paid hosting, new daemon or model-provider credentials are required. Create the
`merge-review-writer` environment with a deployment branch rule allowing only the
actual default branch. Store the App private key only in that environment's
`MERGE_REVIEW_APP_PRIVATE_KEY` secret; configure its actual client ID as
`MERGE_REVIEW_APP_CLIENT_ID` and numeric App ID as `MERGE_REVIEW_APP_ID`. Never
paste keys into a task, report, issue, local harness profile or repository.
The evaluator rejects missing/invalid IDs and the shared Actions App15368, and
checks the actual created check's App ID before it can report success.

The current server rejects normal SIS364 merging even though all visible checks
pass. This candidate is not an installed writer or a proven repair of that server
behavior. Changing an expected App ID without an actual passing installed check
would create another missing gate. Preserve the current protections and failures.
A trusted, independently reviewed activation path must first run the exact
reviewed evaluator under the legitimately installed App without executing PR
source or weakening the required check. That bootstrap dependency remains open.

Before rebinding required review checks, observe real hosted denial for missing,
stale, incomplete, untrusted and revoked receipts; then exact-head acceptance.
Verify wrong/shared writer rejection, source updates during a delayed evaluation,
comment edit/deletion reevaluation, environment denial on an untrusted branch,
post-job token retirement and a normal protected merge. Bind the required context
to the observed actual App ID only after those observations. The Python fixtures
mock GitHub transport; they do not prove these hosted permissions, environment,
token lifecycle, branch rules or merge behavior. Never call fixture PASS a live
activation. Other required CI, npm authority and production gates stay separate.

Supported interfaces: [official token action](https://github.com/actions/create-github-app-token/tree/bcd2ba49218906704ab6c1aa796996da409d3eb1), [workflow variables](https://docs.github.com/en/actions/reference/workflows-and-actions/variables) and [environment branch restrictions](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
