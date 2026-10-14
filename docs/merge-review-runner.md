# Independent review runner

The `independent-review-policy` gate counts a checker verdict only when the
`starlight-checker` GitHub App recorded it, matched by the numeric App id pinned in
[`checker-trust.json`](../tools/merge-review/checker-trust.json) (see
[merge review](merge-review.md)). The App's token is minted only in GitHub-hosted jobs of
[`independent-review-runner.yml`](../.github/workflows/independent-review-runner.yml):

| Job | Runner | Reviewer | Start it with |
|---|---|---|---|
| `review-hosted` (default) | GitHub-hosted `ubuntu-latest` | API-key call to Grok, then Gemini, then OpenAI | dispatch with `runner: hosted`, or the `checker:review` label |
| `review-c940` + `record-c940` (optional, **OFF**) | C940 self-hosted, then GitHub-hosted | Frank's signed-in subscription CLIs | only after `C940_CHECKER_ENABLED` is set, see section 4 |

Every job follows the same rules:

- they start from `workflow_dispatch` with a PR number, or when the repository owner
  adds the label to a same-repository PR (`pull_request_target`, labeled only);
- they run only from the default branch and never for fork PRs;
- they check out only `tools/merge-review` at the workflow's own commit and never check
  out, build or run PR code;
- they read the PR's content through the **compare API at explicit base and head
  SHAs**, never through the moving branch, and bind it into a manifest (head, merge
  base, per-file blob SHA and patch SHA-256). A file without a textual patch (binary
  or too large) is refused. Caps: 300 files, 250 commits, 300 KB of patches. Hidden
  zero-width, bidi and tag characters are stripped;
- they compute the maker vendors from the branch seat plus commit trailers and
  authors, and pick the first configured checker outside all of them, in the order
  grok, gemini, codex. Unknown makers and unknown agent markers are refused;
- trusted instructions go in the **system** role (Gemini `systemInstruction`); the
  PR's data goes in one fenced **user** block with a random fence;
- the reply must be **exactly one JSON object** with exactly the keys in
  [`checker-output.schema.json`](../tools/merge-review/checker-output.schema.json).
  Text around it, a code fence, a second or trailing object, or an extra key is
  refused. `reviewedFiles` must equal the sorted manifest paths. The runner computes
  `reviewSha256`, `packetSha256` and `manifestSha256` itself;
- they re-read the PR head immediately before recording (a moved head records
  nothing) and again after (a move is reported; the receipt covers only the reviewed
  head);
- they record the ledger check run first, then the mirror comment, and refuse if
  either response is not attributed to the pinned App id and bot user id. Any error
  before that records nothing.

API reviewers get one request with no tools, so they can answer but not act.

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
- [ ] Repository permissions: Checks read and write (the ledger), Pull requests read,
      Issues read and write (mirror comments), Contents read, Metadata read.
      Everything else, including all organization and account permissions: no access.
- [ ] "Where can this App be installed": only on this account.
- [ ] Generate a private key. Install the App on `Starlight-Intelligence-System` only.
- [ ] In a reviewed PR, set `checkerApp.appId` (the App ID on the App page) and
      `checkerApp.botUserId` (`gh api "users/starlight-checker[bot]" --jq .id`) in
      `checker-trust.json`. Until both are set, nothing the App records counts.

## 2. The `starlight-checker` environment

Settings > Environments > New `starlight-checker`. Deployment branches: selected
branches, `main` only. Keys go here only, never into a file, issue, chat or harness
profile. Delete downloaded keys once stored. No self-hosted job uses this environment.

| Kind | Name | Needed for |
|---|---|---|
| secret | `CHECKER_APP_ID` | hosted jobs; must equal `checkerApp.appId` or the runner refuses |
| secret | `CHECKER_APP_PRIVATE_KEY` | hosted jobs (the whole `.pem`) |
| secret | `XAI_API_KEY` | hosted Grok |
| secret | `GEMINI_API_KEY` | hosted Gemini |
| secret | `OPENAI_API_KEY` | hosted OpenAI, used when Grok and Gemini are unavailable or share a maker vendor |
| variable | `CHECKER_GROK_MODEL`, `CHECKER_GEMINI_MODEL`, `CHECKER_CODEX_MODEL` | the exact model ID per vendor, copied from that vendor's current model list |
| variable | `CHECKER_GROK_PRICE`, `CHECKER_GEMINI_PRICE`, `CHECKER_CODEX_PRICE` | optional `input,output` USD per million tokens, from the vendor's price page; without it cost is `unknown` |

A vendor with no key or no model ID is skipped. The runner does not guess model IDs.
With none configured it refuses every PR. Create the `checker:review` and
`checker:review-c940` labels.

## 3. Repository settings after the App exists

- [ ] Actions > General > fork pull request workflows: require approval for all
      external contributors.
- [ ] Keep repository auto-merge disabled.
- [ ] Runner groups exist only for organizations. This repository is user-owned, so a
      C940 runner would be repository-scoped. After a move to an organization, create
      a group restricted to this repository and pass `-RunnerGroup`.

## 4. Optional and OFF: the C940 path

**Do not enable this until runner administration has an owner independent of the
agents' shared login.** That login holds Administration on the repository, so it can
register a rogue runner under the `starlight-checker` label and receive whatever a
self-hosted job is given. The design therefore gives the self-hosted job nothing worth
stealing, and keeps it off twice:

- `review-c940` runs only when the repository variable `C940_CHECKER_ENABLED` is
  `true`. It is unset;
- it has no environment, no App key and no API keys, only the read-only job token. It
  writes a draft receipt, signs it with an SSH key that lives on the C940, and uploads
  both as an artifact;
- `record-c940` runs on a GitHub-hosted runner. It verifies the signature with
  `ssh-keygen -Y verify` against `c940.allowedSigners` in `checker-trust.json` (null,
  so it refuses), re-derives the head, manifest and maker vendors from the API, checks
  the CLI seat is enabled and verified, and only then mints the App token and records.
  A draft from any other machine, for other content, or for a moved head is refused.

The Grok and Gemini CLI templates in
[`checker-commands.json`](../tools/merge-review/checker-commands.json) are
`disabled`: they rely on a "do not use tools" prompt. They stay disabled until each
CLI has a verified flag that removes tool use and the runner adds OS isolation (no
network beyond the vendor API, no writable home). The Codex template runs
`--sandbox read-only` but is still unverified (`verifiedOn` null). CLI replies may
come wrapped in one envelope object (`envelopeKey`), which is unwrapped just as
strictly.

When an independent runner owner exists:

1. Set up the runner. The script refuses to install, and the registrar pauses, below
   15 GB free (`-MinFreeGB`).

   ```powershell
   # Elevated PowerShell 7 on the C940. Version and SHA-256 from the actions/runner release.
   pwsh -File tools/merge-review/c940-runner-setup.ps1 -Mode Install -RunnerVersion <x.y.z> -RunnerSha256 <sha256>
   pwsh -File tools/merge-review/c940-runner-setup.ps1 -Mode Status
   ```

   Install creates the low-privilege user `starlight-runner`, keeps the release
   archive and a per-file manifest in a SYSTEM-only folder, generates the signing key
   and prints the `allowedSigners` line to pin, and asks for a fine-grained PAT with
   access to this one repository and only "Administration: Read and write". The PAT
   is stored with machine DPAPI where only SYSTEM and Administrators can read it.
2. How the two accounts stay apart:
   - the runner bundle, `config.cmd` and the setup script are **read and execute only**
     for `starlight-runner`; only `work`, `logs` and a fresh `_diag` are writable;
   - before every registration the SYSTEM registrar re-checks the archive against
     the release SHA-256, every extracted file against the manifest, that the job
     user has no write access to the bundle and that the bundle has no reparse
     points. Any mismatch stops registration;
   - the registrar renames the old `_diag` (a rename moves a planted link rather than
     following it) and gives `config.cmd` a fresh SYSTEM-only `_diag`;
   - work-folder cleanup runs as `starlight-runner` in the job task, never as SYSTEM;
   - credentials: no App private key or API key ever reaches the C940. The PAT is
     decrypted only inside the SYSTEM registrar and sent as an HTTP header. The one-hour
     registration token is an argument of the SYSTEM `config.cmd` process, after every
     leftover `starlight-runner` process is stopped. `config.cmd` logs are moved to the
     SYSTEM-only folder before the job user gets a writable `_diag`, and registrar logs
     are written there too. The job environment holds only the read-only job token;
   - the runner is registered `--ephemeral --disableupdate`. Update it by re-running
     Install with the new version and SHA-256; GitHub stops queueing jobs to runners
     more than 30 days behind a release.
3. Sign in once as `starlight-runner` (`runas /user:starlight-runner pwsh`), install
   Python 3.12+ and the CLIs, and log each one in under that profile.
4. In one reviewed PR: pin `c940.allowedSigners`, and for each CLI you verified
   read-only on a sample packet, set `verifiedOn` (and drop `disabled` only once the
   isolation above exists). Then set `C940_CHECKER_ENABLED=true`.
5. Dispatch the workflow with `runner: c940`, or add the `checker:review-c940` label.

Known residual: the signing key is readable by `starlight-runner`, so a reviewer CLI
that escaped its sandbox could sign a draft. It still cannot change the content the
hosted job re-derives, only the verdict text, which a compromised reviewer controls
anyway.

To retire it: `-Mode Uninstall`, remove the runner in Settings > Actions > Runners,
revoke the PAT, clear `c940.allowedSigners` and unset `C940_CHECKER_ENABLED`.

## 5. Activation proof (before anyone relies on it)

None of this has run yet: there is no App, no keys, no hosted run and no C940 test.
Observe these on hosted runs before requiring the check:

- an owner-login receipt is ignored; an App PASS with its ledger passes a low-risk PR;
- an App FAIL blocks that head even after a later PASS and after its comment is deleted;
- deleting or editing the mirror of the newest PASS blocks;
- a head push during review records nothing;
- a fork PR and a non-owner label do not start a job;
- a dispatch from a non-default branch is skipped;
- a missing API key or model ID refuses without recording;
- the summary shows `unknown` cost, not `$0`, when no price is set;
- a high-risk PR fails until a listed independent human approves, and dismissing that
  approval turns the check red within the relay or sweep window.

## 6. Proposed ruleset

Apply this only after a second identity exists. With one human account,
`required_approving_review_count: 1` blocks every merge, because GitHub forbids
approving your own PR. Bind the status check to the observed GitHub Actions app's
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
