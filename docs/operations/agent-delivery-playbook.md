# Applying DORA in agent work

This is an operational playbook over the existing work graph and review queue.
It changes how software-delivery work is routed and evidenced; it does not grant
admission, merge, spending or production-release authority. Functional roles
below are responsibilities assigned to existing agents, not new agent records.

## The execution loop

| Responsibility | Agent behavior | Required handoff |
| --- | --- | --- |
| Orchestrator | Select one already-authorized user outcome; inspect downstream capacity before starting more implementation. | Work ID, service, owner, acceptance, scope, existing permissions and next proof. |
| Builder | Produce the smallest independently testable change; maintain the repo-required isolated branch and draft PR. | Current commit, changed behavior, tests, preview evidence and recovery notes. |
| Reviewer | Review the exact current revision; reject stale evidence and record the actual commands executed. | Revision-bound independent findings through the existing review policy. |
| Release owner | Follow the service's existing authorized release path; distinguish built, staged and serving production. | Production revision, exposure time/source and rollback target. |
| Verifier | Exercise the relevant user journey; inspect runtime symptoms and record uncertainty. | Tested revision, environment, observed result and limitations. |
| Service owner | Compare delivery and product outcome; choose the next constraint to address. | A bounded experiment with baseline, expected effect and evaluation point. |

One agent may perform several responsibilities where local policy permits, but
independent review must satisfy the existing separate-maker/reviewer rule. A
role label in a prompt is not proof of independence. Keep the Orchestration
Engine's existing concurrency rules and the review queue's capacity reservation.

## Every engineering handoff

Carry these fields in the existing WorkPacket's mission/context and evidence
references. Do not create a competing task ledger or infer a new schema here.

```text
Work ID / correlation ID:
Service and canonical repository:
Existing authorization / accountable owner:
User outcome and acceptance check:
Bounded scope / excluded changes:
Current revision and PR:
Next missing proof / responsible role:
Validation commands and results:
Release requirement / existing release authority:
Recovery method:
Cost or runtime limit / stop condition:
Evidence references / known limitations:
```

Use product-level acceptance: "a new user can save and reopen a project" is
testable. "Improve the platform" is not enough to route implementation.
Use existing configured cost limits; a worker cannot invent permission to spend.
Stop unchanged retries when the same cause recurs. Return the blocker, evidence
and owner action rather than producing more speculative branches.

## A command agents can use now

After the repo's normal build, project the private runtime's existing ledger:

```sh
node dist/work-graph-cli.js project /absolute/private/work-events.jsonl > /absolute/private/work-projection.json
node tools/delivery-evidence/agent-next-action.mjs /absolute/private/work-projection.json WORK_ID 1 1
```

The last two arguments are the observed review waiting count and available
review capacity. Defaults are zero waiting and one review slot. Measure these
from the host's queue; do not fabricate capacity. The command reads a projection
and outputs one role, action and missing evidence. It does not write the graph,
launch a worker, change state, verify a provider, or authorize a release.

| Observed state | Recommended action |
| --- | --- |
| Projection conflicts | Repair evidence before relying on its claims. |
| Work absent or unadmitted | Locate the work or use existing admission controls. |
| Blocked | Resolve the named blocker; do not retry unchanged. |
| New artifact needed while review is saturated | Clear reviews before starting additional implementation. |
| Artifact, change or checks missing | Route the specific missing proof to builder or reviewer. |
| Production exposure missing | Route to the authorized release owner; READY does not close it. |
| User verification missing | Test the delivered journey and record limitations. |
| All required proofs present | Use the existing authorized completion path after checking freshness. |
| Already complete | Observe the product outcome; do not spawn more work automatically. |

The advisor consumes the current work-graph projector. Its result is only as
trustworthy as that projection's source evidence. It does not independently
establish exact-SHA freshness, incident causation or production exposure.

## Use the existing graph without inflating claims

Retain one `workId` and `correlationId` across intent, run, artifact, PR, checks,
deployment, verification and completion. Use the existing requirements on
`work.admitted`. Actual shipping work requires deployment and verification proof;
source-only work may legitimately omit deployment when admitted that way.
Changing requirements to manufacture completion is not an improvement.

`deployment.succeeded` is the existing graph event name. For a production-delivery
claim, attach served-revision and exposure evidence; a build-only record cannot
establish that users received the change. The DORA calculator's normalized
release input is a derived analytical view, not a replacement work graph.

Adapters must verify source provenance and revision scope before feeding the
graph. Private live events stay in the existing private runtime. Never publish
account inventories, session transcripts or customer data in this public repo.
Continuity import never admits or automatically resumes work. Use the existing
owner reconciliation and admission rules.

## Apply it to one actual change

Select an already-authorized, bounded service change from the current queue.
Use that service's own AGENTS instructions and required checks.

1. Capture the current failure or requested user behavior and its acceptance
   evidence. Record current review and release queue delay.
2. Complete one small implementation and exact-revision review. When a blocker
   appears, resolve it before increasing implementation concurrency.
3. Follow the existing release authority. Capture the actual production
   assignment and test the affected user journey.
4. Link any resulting incident to the causing deployment and remediation;
   record impact start and verified restoration. Keep uncertain attribution null.
5. Compare delivery delay, repair effort, cost and the product outcome. Choose
   one next improvement, such as removing a repeated preview-auth failure or
   shortening the production-sync handoff.

The first acceptance run must include a staged non-release, a duplicate event
and a verified rollback as well as a normal promotion. Without those cases a
collector can produce plausible but incorrect DORA numbers.

## What to improve when a metric changes

| Signal | Agent investigation | Bounded experiment |
| --- | --- | --- |
| Lead time rises | Separate coding, review, CI, sync and release waiting. | Remove the largest verified wait or handoff. |
| Release frequency falls | Check user demand, batch size and blocked release conditions. | Split one useful change or repair the release path; no empty deployments. |
| Change failure rate rises | Trace escaped defects to the exact change and missing check. | Add the relevant journey or compatibility check. |
| Recovery slows | Separate detection, access, decision, remediation and verification delays. | Exercise the documented recovery path in an appropriate test environment. |
| Rework rises | Link remediation releases to incidents and repeat causes. | Fix the recurrent cause and compare later incident-driven work. |

DORA metrics describe the delivery system, not an individual agent ranking.
More tokens, agents or PRs have no inherent value. Service owners evaluate
completed user tasks, commercial outcomes where relevant, human interruptions
and repair cost beside delivery speed and stability.

## Activation boundary

The advice command and its tests are executable on this branch. The orchestration
entry point links this playbook. Until reviewed and merged, existing default-
branch agents do not inherit the new text. Runtime adapters, queue observations,
production collectors and host scheduling must be explicitly wired and verified;
a prompt cannot establish that they are running.

Related: [DORA pilot](dora-delivery-pilot.md),
[work graph](../architecture/operational-work-graph.md),
[`src/review-queue.ts`](../../src/review-queue.ts), and
[measurement contract](../../tools/delivery-evidence/README.md).
