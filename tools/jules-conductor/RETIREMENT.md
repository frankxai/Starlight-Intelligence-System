# Jules retirement: migration and preservation runbook

Status: proposal for independent review; no runtime change or deployment.
Evidence captured 2026-10-30 against SIS main `7e4ca5b295e4c0097576045326762d278514e360`. Recheck all live state before acting.

## Deadline and inventory

Google's 2026-10-29 service email says finish sessions by November 11; read-only follows and service ends December 31, 2026. Time of day and timezone were not stated; finish early.

The committed ledger's last tick and remote scan are October 12. It has 50 records: 13 Completed, 4 Failed, 29 Unknown, 3 In Progress and 1 Planning. None has `owned: true`. These are historical observations, not live session status. Candidate unresolved session IDs: 14134481200233383555 (arcanea-ai-app), 7967601734376621378 and 10111753558202591287 (gencreator.ai), 6834506921304401785 (gencreator.ai). Verify in the actual Jules account and do not interrupt active work.

The committed backlog contains harvested GitHub issue snapshots; reconcile current issues rather than dispatching stale descriptions. Search across accessible GitHub repositories returned many Jules-associated open PRs; the search is not exhaustive and may include mentions rather than authored patches. Examples: gencreator.ai#211 and agentic-ops#226 are open drafts at the time checked. Preserve their head SHAs, diffs and review evidence; draft status is not a quality verdict. Enumerate all pages and verify each PR individually.

## Preserve before disabling anything

1. From the authorized Jules account, list sessions and record account, ID, repo, task, state, latest update, branch and PR URL. Compare to ledger and archive; include untracked sessions. Never infer absence from this committed snapshot.
2. For each unfinished session, capture available task, conversation, logs, patch, base SHA and generated artifacts to an access-controlled location, checking for secrets or private data before wider storage. Preserve open PR branches, current head SHA, diff, CI and reviews. Reconcile in-flight work with owners; finish, hand off or explicitly defer. Do not cancel or start new sessions during inventory.
3. Record timestamp, completeness, location and checksums in the existing operations ledger. Verify restoration with a sample patch in an isolated checkout. Recheck near both deadlines.

## Replacement decision

Use the reviewed agentic-ops routing and task envelope as authority. Route one bounded task to an actually available Codex or Claude Code seat; use Antigravity when its interactive execution environment is available. The registry's prior version and host snapshots are historical, not evidence of current availability. Reuse GitHub branches, draft PRs and the existing independent-review-policy; do not introduce a new controller. An operator-driven execution path is the fallback when unattended execution is not verified.

A task envelope must bind repository, base SHA, permitted paths and effects, acceptance checks, executor and reviewer identity, deadline, resource and cost ceilings, and recovery. Reject unknown repository or scope, absent budget, or unverified credentials. Use isolated checkouts and least-privilege credentials scoped to one repository; no production deployment or merge grants to the execution seat. Draft PR only. A distinct admitted reviewer evaluates the exact head and all changed files; sensitive changes follow the CTO rule in docs/merge-review.md. Run existing CI and confirm live branch protections; a policy document or check alone does not establish enforcement.

The existing config disables automatic dispatch and merge, but the direct `dispatch` command is an escape hatch. Neither that flag nor this runbook disables manual dispatch or other Jules integrations. Audit every trigger and owner first. Propose an explicit disabled-by-default dispatch guard covering direct dispatch, run-ready and automatic paths only after checking active operators; leave read and recovery paths intact. Tests must show every create-session path blocked and existing-session inspection unaffected. Deploy the guard only through normal review, with a host rollout record.

## Candidate infrastructure

Cloudflare account access was confirmed, and existing Worker names include starlight-fleet-ingress, starlight-cloud-worker and frankxai-ci-wake; names alone do not establish a safe running workflow. SIS main contains a fleet ingress with fail-closed checks and a Cloud Run Jobs call; deployment, identity, permissions, spend, credit eligibility and end-to-end behavior remain unverified. Do not reactivate public endpoints. Inspect existing deployments and ownership before extending them.

For durable asynchronous coordination, evaluate the existing Cloudflare execution path against the accepted registry and workload limits. For containerized or longer-running execution, evaluate the existing GCP Cloud Run Jobs boundary after establishing project access, identity federation or short-lived scoped credentials, budgets and audit logs. Cloudflare and GCP are execution adapters, not portfolio authority. No GCP connector was available in this session. No infrastructure was created.

## Validation and rollback

Before promotion, run representative isolated tasks: a bounded docs change and a small test fix; verify path enforcement, redaction, cost ceilings, interruption/retry idempotency, draft-only PR creation, exact-head independent review and protected-repo denial. Exercise missing credentials, unavailable provider and ambiguous dispatch outcome; fail closed and reconcile before retrying. Record exact revisions, seat, logs, costs and outcomes. No such end-to-end validation was performed in this proposal.

Rollback: stop new dispatch through the existing router, preserve in-flight runs and receipts, reconcile unknown outcomes, then route new tasks manually to another verified seat. Revert the reviewed adapter or guard commit if necessary without restoring Jules as a dependency or weakening review. Never delete session artifacts or reset work as a rollback shortcut.
