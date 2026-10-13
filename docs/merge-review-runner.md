# Independent review runner

The `independent-review-policy` gate counts a receipt only when the
`starlight-checker` GitHub App posted it (see [merge review](merge-review.md)).
The App's token is minted only inside
[`independent-review-runner.yml`](../.github/workflows/independent-review-runner.yml),
which has two jobs:

| Job | Runner | Reviewer | Start it with |
|---|---|---|---|
| `review-hosted` (default) | GitHub-hosted `ubuntu-latest` | API-key call to Grok, then Gemini, then OpenAI | dispatch with `runner: hosted`, or the `checker:review` label |
| `review-c940` (optional) | the C940 self-hosted runner | Frank's signed-in subscription CLIs | dispatch with `runner: c940`, or the `checker:review-c940` label |

Use the C940 job only when a review needs a subscription CLI. Its logins stay on that
machine; the hosted job never sees them, and the C940 job never sees the API keys.

Both jobs follow the same rules:

- they start from `workflow_dispatch` with a PR number, or when the repository owner
  adds the label to a same-repository PR (`pull_request_target`, labeled only);
- they run only from the default branch and never for fork PRs;
- they check out only `tools/merge-review` at the workflow's own commit and never check
  out, build or run PR code;
- they read the diff and the full changed-file list through the API as data, cap them
  (300 files, 300 KB of diff), strip zero-width, bidi and tag characters, and fence
  them as untrusted;
- they pick the first configured checker whose vendor differs from the maker's, from
  the head branch `agent/<harness>/...`, in the order grok, gemini, codex. A Google
  maker (antigravity, jules) never gets Gemini. Unknown makers are refused;
- they validate the reviewer's JSON against
  [`checker-output.schema.json`](../tools/merge-review/checker-output.schema.json):
  `reviewedFiles` must equal the full list and the review must be at least 80
  characters. The runner computes `reviewSha256` and `packetSha256` itself;
- they post the receipt ([schema](../tools/merge-review/review-receipt.schema.json))
  with the App token only if the PR head is unchanged at post time, and write the
  verdict and cost to the job summary. Any error posts nothing.

API reviewers get one plain request with no tools, so they can answer but not act.
CLI reviewers run read-only in an empty folder, with tokens and API keys stripped from
their environment. A CLI template in
[`checker-commands.json`](../tools/merge-review/checker-commands.json) is used only
after its `verifiedOn` date is set in a reviewed PR. None is set yet.

### Cost

Every receipt carries `cost_usd` and `cost_source`:

- `billed`: the API response reported a cost;
- `estimated`: token counts from the response multiplied by the price variable;
- `unknown`: neither was available, which is always the case for subscription CLIs.

An unknown cost is `null`, never `0`. The gate rejects a receipt that writes `0` with
`unknown`.

## 1. Create the GitHub App (owner, in the browser)

- [ ] Settings > Developer settings > GitHub Apps > New. Name `starlight-checker`.
- [ ] Homepage: the repository URL. Webhook: inactive. No callback URL, no device flow,
      do not request user authorization (OAuth) during installation.
- [ ] Repository permissions: Pull requests read, Issues read and write (comments),
      Contents read, Metadata read. Everything else, including all organization and
      account permissions: no access.
- [ ] "Where can this App be installed": only on this account.
- [ ] Generate a private key. Install the App on `Starlight-Intelligence-System` only.

## 2. The `starlight-checker` environment

Settings > Environments > New `starlight-checker`. Deployment branches: selected
branches, `main` only. Keys go here only, never into a file, issue, chat or harness
profile. Delete downloaded keys once stored.

| Kind | Name | Needed for |
|---|---|---|
| secret | `CHECKER_APP_ID` | both jobs (numeric App ID) |
| secret | `CHECKER_APP_PRIVATE_KEY` | both jobs (the whole `.pem`) |
| secret | `XAI_API_KEY` | hosted Grok |
| secret | `GEMINI_API_KEY` | hosted Gemini |
| secret | `OPENAI_API_KEY` | hosted OpenAI, used when Grok and Gemini are unavailable or the same vendor as the maker |
| variable | `CHECKER_GROK_MODEL`, `CHECKER_GEMINI_MODEL`, `CHECKER_CODEX_MODEL` | the exact model ID per vendor, copied from that vendor's current model list (for example the Grok 4.3 and Gemini 3.8 Flash IDs) |
| variable | `CHECKER_GROK_PRICE`, `CHECKER_GEMINI_PRICE`, `CHECKER_CODEX_PRICE` | optional `input,output` USD per million tokens, from the vendor's price page; without it cost is `unknown` |
| variable | `CHECKER_APP_SLUG` | only if the App slug differs |

A vendor with no key or no model ID is skipped. The runner does not guess model IDs.
With none configured it refuses every PR. Create the `checker:review` and
`checker:review-c940` labels.

## 3. Repository settings after the App exists

- [ ] Actions > General > fork pull request workflows: require approval for all
      external contributors (formerly "all outside collaborators").
- [ ] Keep repository auto-merge disabled.
- [ ] Runner groups exist only for organizations. This repository is user-owned, so the
      C940 runner is repository-scoped. After a move to an organization, create a group
      restricted to this repository and pass `-RunnerGroup`.

## 4. Optional: switch a review to the C940

Use this when a review needs a subscription CLI rather than an API key.

1. Set up the runner. The script refuses to install, and the registrar pauses, below
   15 GB free (`-MinFreeGB`).

   ```powershell
   # Elevated PowerShell 7 on the C940. Version and SHA-256 from the actions/runner release.
   pwsh -File tools/merge-review/c940-runner-setup.ps1 -Mode Install -RunnerVersion <x.y.z> -RunnerSha256 <sha256>
   pwsh -File tools/merge-review/c940-runner-setup.ps1 -Mode Status
   ```

   Install asks for a fine-grained PAT with access to this one repository and only
   "Administration: Read and write" (required for runner registration tokens). It is
   stored with machine DPAPI in a folder only SYSTEM and Administrators can read. A
   SYSTEM task registers one `--ephemeral` runner at a time. A second task runs
   `run.cmd` as the low-privilege local user `starlight-runner`, which cannot read the PAT.
2. Sign in once as `starlight-runner` (`runas /user:starlight-runner pwsh`), install
   Python 3.12+ and the CLIs, and log each one in under that profile.
3. Run each template in `checker-commands.json` on a sample packet, confirm it cannot
   write files or use tools, and set `verifiedOn` in a PR.
4. Dispatch the workflow with `runner: c940`, or add the `checker:review-c940` label.

To retire it: `-Mode Uninstall`, remove the runner in Settings > Actions > Runners, and
revoke the PAT.

## 5. Activation proof (before anyone relies on it)

Observe these on hosted runs:

- an owner-login receipt is ignored;
- an App PASS receipt passes a low-risk PR, and an App FAIL revokes it;
- a head push during review stops the post;
- a fork PR and a non-owner label do not start a job;
- a dispatch from a non-default branch is skipped;
- a missing API key or model ID refuses without posting;
- the summary shows `unknown` cost, not `$0`, when no price is set;
- a high-risk PR fails until a distinct human approves.

## 6. Proposed ruleset

Apply this only after a second identity exists or the repository is locked. With one
human account, `required_approving_review_count: 1` blocks every merge, because GitHub
forbids approving your own PR. Bind the status check to the observed App's
`integration_id` after the activation proof.

```json
{
  "name": "main-independent-review",
  "target": "branch",
  "enforcement": "active",
  "conditions": {"ref_name": {"include": ["~DEFAULT_BRANCH"], "exclude": []}},
  "bypass_actors": [],
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {"type": "pull_request", "parameters": {
      "required_approving_review_count": 1,
      "require_last_push_approval": true,
      "require_code_owner_review": true,
      "dismiss_stale_reviews_on_push": true,
      "required_review_thread_resolution": true}},
    {"type": "required_status_checks", "parameters": {
      "strict_required_status_checks_policy": false,
      "required_status_checks": [{"context": "independent-review-policy"}]}}
  ]
}
```
