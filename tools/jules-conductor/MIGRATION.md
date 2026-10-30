# Jules retirement and existing-control-plane handoff

Decision date: 2026-10-30. Status: proposed migration; provider execution is not activated by this change.

## Evidence and scope

At SIS base `7e4ca5b295e4c0097576045326762d278514e360`, the ledger contains 50 historical sessions, none marked owned, with last tick October 12. Three say In Progress and one Planning; these are stale observations, not evidence of current work. The backlog has 28 entries and zero armed entries. The archive contains 1,220 nonempty lines. Preserve the original files and their hashes rather than normalizing history.

The implementation supports dispatch, polling, patch inspection, draft-PR recording, separate review and protected landing. Checked configuration disables automatic dispatch, merging, estate sweeps and remote adoption. Manual dispatch was still possible; this change closes that path. Existing Jules-linked PRs demonstrate historical provider usage. Neither those PRs nor the October 28 suggestions prove conductor ownership or a live session.

Private, dated PR/head/patch evidence and reconciliation notes belong in `frankxai/agentic-ops/ops/evidence/jules-retirement-2026-10-30/`. The scan is bounded, not an estate-wide completeness claim. No existing PR, agent process, lease or session was changed during inspection.

## Capability mapping

| Former Jules capability | Smallest supported replacement | Admission boundary |
|---|---|---|
| Create cloud task | Existing agentic-ops task contract and selected coding worker | Current issue, branch, lease, runtime auth and budget must be verified |
| Session identity/status | Original task ID and idempotency key, provider run ID in the existing operations ledger | Never replay because a provider timed out; reconcile evidence first |
| Repo sandbox/credentials | Existing isolated worktree or admitted runner | Repo-scoped short-lived credential; no inherited production or cloud secrets |
| Draft PR creation | Existing GitHub tool or authenticated host GitHub client | Draft only; no merge, ready transition or auto-merge authority |
| Specialist review | Existing agentic-ops author/reviewer routing and repository merge gate | Different admitted reviewer, exact-head evidence, CTO PASS for sensitive paths |
| Polling/patch recovery | GitHub PR heads and saved text patches; limited Jules reads until cutoff | Status remains unknown when remote evidence is absent |
| Cost/resource control | Existing host admission and budget accounting | One task, one attempt, explicit time/cost ceiling; zero cost means no paid call |

## Worker comparison

These are execution options within the existing control plane, not alternative controllers. Documentation was checked on October 30; version, auth, pricing and availability must be rechecked on the execution host.

| Worker | Supported interface | Current architectural fit | Qualification still required |
|---|---|---|---|
| Codex | `codex exec`, structured event output with `--json`, explicit sandbox | Existing agentic-ops author/reviewer; default v1 software routing selects it as reviewer | Live config holds, auth and sandbox smoke; do not use bypass flags |
| Claude Code | `claude -p`, structured JSON output | Existing v1 software author, with Codex as separate reviewer | Host auth/tools, explicit allowed operations and bounded output; `--bare` omits repo configuration, so governance must be explicitly supplied if used |
| Antigravity | Documented `agy -p`, JSON/stream output and JSON schema | Existing review-seat convention, but absent from checked main routing-policy workers | Register only after reviewed policy change, auth, scope, draft and cancellation tests; not an automatic fallback |

Primary references: [Codex noninteractive](https://developers.openai.com/codex/noninteractive), [Claude Code headless](https://code.claude.com/docs/en/headless), [Antigravity headless](https://antigravity.google/docs/cli/headless/). No provider CLI was executed in this environment. The current main router is a pure validator/router; a `routable` response does not prove an execution adapter, budget reservation, or authentication. The open Forge v2 proposal is not treated as deployed authority. Current Queen non-code contracts must not be repurposed to bypass a git-write restriction.

## Prepare one held handoff

1. Reconcile the owning GitHub issue, any open PRs and current lane/lease. Retain the source task ID. If prior work exists, resume/review that artifact instead of creating a replacement task. Deduplicate overlapping work before admission.
2. Fetch an exact current base SHA. Choose an isolated branch matching the author selected by the existing router. Inspect the original board prompt and repo-local instructions; the adapter emits its digest rather than copying private prompt text.
3. Supply all and only these admission fields in a private local JSON file. Values below are placeholders, not authority:

```json
{
  "issue_url": "https://github.com/frankxai/gencreator.ai/issues/123",
  "base_sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "branch": "agent/claude-code/dependency-repair",
  "expires_at": "2026-10-30T13:00:00Z",
  "idempotency_key": "migration:gencreator-minor-bumps:revision-1",
  "max_minutes": 15,
  "max_cost_usd": 0,
  "acceptance": ["Exclude every semver-major update and keep the original bounded scope."]
}
```

Expiry must be canonical UTC with seconds and within the next 24 hours. Branch and issue ownership are proposed, not remotely verified by this offline adapter. It rejects unprofiled/protected repositories, unsafe review configuration, path escapes, credentials and configured excluded paths. The host must still validate repository-specific allowed scopes, actual diff paths and risk.

4. Run `node tools/jules-conductor/migration.mjs handoff gencreator-minor-bumps admission.json`. Keep its full held envelope in the existing task record. Validate its `contract` with agentic-ops `control-plane/schemas/task-contract.schema.json` and route through `control-plane/route_task.py`. Do not discard the separate resource proposal or holds. Never use replay resource overrides as live capacity evidence.
5. Only the existing host controller may admit execution after live auth, scope and lease checks, reservation of the cost ceiling, and timeout/cancellation enforcement. Use a repo-scoped GitHub App installation token where supported. Do not provision an estate-wide PAT, long-lived cloud key, or give a coding worker merge/deploy access. No admitted adapter means HOLD, not fallback.
6. Record task/idempotency key, contract digest, router policy revision, author/reviewer, runtime version, base/head SHA, credential scope metadata (never tokens), start/stop times, spend, test evidence and draft PR URL. Preserve a failed attempt and reconcile it before any retry.

## Preservation and cutover

- Before November 12: export any actually observed remote session metadata/patches using an authenticated existing host. Do not cancel sessions. This environment has no authenticated Jules CLI, so remote status remains unresolved. Preserve board/ledger/archive/backlog bytes at the base commit plus inventory hashes. Fetch exact PR head refs and create a private backup bundle if GitHub retention is uncertain; per-file text patches are not a full repository backup and may omit binaries.
- Before December 31: complete reconciliation or label each item held with an owner and reason. Link recovered commits/PRs to the original task ID. Stop only the Jules-specific schedule after its owner verifies there is no pending preservation work; do not stop shared Hermes, Queen, or other agents. Do not remove credentials needed by another consumer without a usage check.
- From December 31 at 00:00 UTC: all Jules subprocess calls fail closed. Inventory, schema handoffs, GitHub review and existing non-Jules worker paths remain available. GitHub inspection must not depend on a successful Jules patch download.

Rollout: review this change, run the checks below, obtain the required independent exact-head CTO receipt, merge through normal protections, then update the existing host checkout. This PR alone changes no deployed process. Admit one bounded docs task first; require its draft PR, audit receipt and separate review before a dependency or auth task. Live paid-worker acceptance remains outstanding until a suitable host is authenticated.

Rollback: hold new admissions in the existing controller, preserve the attempted task and branch, and revert only the handoff/preflight changes if faulty. **Keep the retirement boundary and automatic dispatch/merge disabled.** Never roll back by re-enabling Jules, deleting historical state, replaying uncertain tasks, changing production protection or killing unrelated agents. Switch an eligible worker only after reconciliation and a new reviewed contract revision.

## Cloudflare, GCP and workflow alternatives

Use the existing Cloudflare integration and existing execution Worker/Durable Object. The account already contains execution and fleet-ingress Workers; no Cloudflare Workflows were listed during inspection. A new durable scheduler would compete with agentic-ops and is unnecessary for this migration.

The fleet ingress points to GCP project `starlight-intelligence-estate`, region `europe-west4`, job `starlight-runner-job`. Observed deployed settings expose those three variables but no webhook-secret or GCP-token bindings. The source therefore fails closed for authenticated dispatch. Job existence, image, IAM and actual readiness are not yet verified.

Read-only preflight (does not run a job):

```bash
node tools/runner/inspect-cloud-run.mjs
```

It describes that exact target using authenticated `gcloud`, reports only environment **names**, and suppresses raw error output. This environment returned `gcloud_unavailable`. Discovery found no usable GCP/Cloud Run connector in this session. Do not mark GCP connected on the strength of configured project variables.

Setup sequence on the existing authorized cloud host:

1. Authenticate a read-only identity for the exact project and run the preflight. Inspect the immutable image digest, service account, retries, timeout and resources. Resolve the older deploy script's different job/region defaults before any deployment.
2. Prefer [GitHub OIDC Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines) restricted to the numeric owner/repository identity and approved workflow/ref. Use separate observer and executor identities. Bind only job-specific permissions needed by the reviewed path; jobs with overrides require additional permission, so do not blindly grant project-wide Run Admin. Do not export a service-account JSON key or install an expiring OAuth token as a permanent Worker secret.
3. Repair the existing ingress/runner contract before activation: ingress sends `REPO`/`COMMIT_SHA` while the runner consumes `STARLIGHT_REPO`/`STARLIGHT_REF`; arbitrary commands, frozen installs, secret handling, delivery deduplication, exact-SHA execution, repo/task allowlists, cancellation and budget admission all require explicit tests. Validate callback provenance before accepting completion. A valid webhook HMAC alone is not task authorization.
4. Keep Cloudflare as transport/observation and the existing agentic-ops controller as the sole task authority. An OIDC-authenticated existing GitHub workflow can call Cloud Run after admission; introducing a new long-lived credential bridge is not required. Review credential bindings and deployment as separate concrete changes after these checks.

Alternatives: existing admitted local Codex/Claude execution for bounded code tasks; GitHub Actions for deterministic tests and reviewed OIDC job invocation; the existing Cloudflare execution Worker for its already-admitted task kinds. Railway remains an existing hosting option, not an automatic coding-agent fallback. Antigravity remains a qualification candidate. No alternative is treated as ready merely because its connector is installed.

## Validation

```bash
node --test tools/jules-conductor/tests/*.test.mjs tools/runner/inspect-cloud-run.test.mjs
python3 -m unittest discover -s tools/merge-review/tests -p 'test_*.py' -v
```

October 30 results: 43 Node and 37 Python tests pass. Three fixture contracts (the two existing board tasks and a bounded README change) pass the existing agentic-ops schema and route to Claude Code with Codex review. Fifteen negative cases hold on disk, RAM, missing RAM evidence, expiry and reviewer unavailability. Fixtures use synthetic issue/base/resource values and perform no provider execution. Private receipts record the authority revision and decisions. A separate Codex review corrected timestamp validation, configured path exclusions and a false-positive dispatch test; it does **not** satisfy the repository's different-seat CTO gate. No end-to-end authenticated provider or Cloud Run job run is claimed.
