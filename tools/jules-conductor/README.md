# Starlight Jules Conductor — retirement mode

Built on SIP v1.1.1. Jules becomes read-only after November 11, 2026 and shuts down December 31, 2026. New-session dispatch is disabled in code immediately, including manual `dispatch`, `arm`, `run-ready`, and automatic backlog dispatch even if configuration enables it.

The replacement is a bounded handoff into **agentic-ops**, the existing control plane. SIS remains the memory plane. No new queue, scheduler, automatic fallback, credential store, or orchestration service is introduced.

```bash
node tools/jules-conductor/migration.mjs inventory
node tools/jules-conductor/migration.mjs handoff <existing-board-id> <admission.json>
node --test tools/jules-conductor/tests/*.test.mjs tools/runner/inspect-cloud-run.test.mjs
```

`inventory` is offline, hashes the original evidence files and labels remote status unverified. `handoff` emits a held `starlight.task_contract.v1` proposal for the existing router. It neither dispatches nor creates a PR. See [migration and rollback](MIGRATION.md) for admission fields, preservation, validation and cloud connector readiness.

## Existing work

Do not cancel, duplicate, adopt, or claim ownership of existing sessions. Original board, backlog, ledger and archive bytes remain unchanged. Their old command examples are historical and dispatch entrypoints now fail closed.

The existing `tick` and `daemon` remain legacy preservation tools for an operator already running them. They can update local state and convert linked ready PRs to drafts under the existing policy; **they are not read-only inventory commands**. Do not start them merely to inspect the migration. Their Jules subprocess boundary permits only explicit `get`, session-list and patch-read commands, with no `--apply`, before **December 31, 2026 at 00:00 UTC**. This conservative cutoff avoids dependence on availability during the shutdown day. Unknown commands and all subsequent provider calls are denied.

## Governance retained

- `autoMerge`, `autoDispatch`, estate sweep and remote-session adoption remain off.
- Every replacement change starts on an isolated agent branch and opens a draft PR.
- Review must be independent of the author and bind the exact head SHA. Sensitive changes require CTO PASS under [the merge policy](../../docs/merge-review.md).
- Protected production repositories remain excluded from this handoff adapter.
- Scope, live authentication, budget reservation, timeouts, cancellation, lane ownership and audit receipts are enforced at host admission; router eligibility alone grants no execution authority.

Previous council, patch validation, draft enforcement, archive handling and merge-gate implementation remain available for existing artifacts. Retirement does not reinterpret an old status as evidence of a live session or a historical routing entry as proof of current authentication.
