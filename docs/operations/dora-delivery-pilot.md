# DORA delivery pilot

Reviewed 16 October 2026. This operational pilot connects measurement policy to
GitHub and Vercel release workflows. It does not deploy or collect production
telemetry. Account-specific findings live in the operator's separate audit.

## Guide review

| DORA guide | Application in this pilot and its rollout |
| --- | --- |
| [Software delivery metrics](https://dora.dev/guides/dora-metrics/) | Use the current five-metric vocabulary; keep service boundaries and evidence coverage explicit. |
| [Innovating with generative AI](https://dora.dev/guides/how-to-innovate-with-generative-ai/) | Evaluate a workflow experiment through accepted changes, user outcomes and repair effort. |
| [Value stream mapping](https://dora.dev/guides/value-stream-management/) | Trace both feature delivery and recovery; measure queue time separately from active work. |
| [Organizational transformation](https://dora.dev/guides/how-to-transform/) | Prove one improvement on a working service, then share a reusable implementation. |
| [Empowering delivery teams](https://dora.dev/guides/how-to-empower-software-delivery-teams/) | Give service owners room to improve flow within existing permissions; review product results. |

Older guides refer to four keys. The current metrics guide governs names here.
The guide review covers all five articles linked from the Guides index plus
selected capability articles, not every research report and external reference.
DORA / Google Cloud publishes its content under CC BY 4.0. Proposed workflow
choices below are local implementation decisions.

## Workflow

A bounded user outcome becomes a small branch and draft PR. CI runs quick,
meaningful checks; preview verification exercises the relevant user journey.
Review and check evidence identify the exact SHA. Production deployment remains
the responsibility of the existing release path.

For Vercel Git integration, verify [Deployment Checks](https://vercel.com/docs/deployment-checks)
on the production build before custom-domain assignment. Avoid adding a second
competing deployment trigger. Native checks need matching package scripts and
can skip when those scripts are absent. Confirm that the intended tests ran.

A custom CI release path should build for production, stage without assigning
domains, verify that production build and promote the same artifact. A preview
promotion can rebuild under production variables. Release authorization and
repo-specific gates remain applicable.

Record production exposure separately from successful builds. Verified
`deployment.promoted` [webhooks](https://vercel.com/docs/webhooks) provide one
signal but omit rollbacks; capture and reconcile rollback exposure separately.
Attach a production incident to the causing deployment and any remediation
releases. Verify restoration through the affected user journey.

For cross-repository publishing, preserve authoring-to-production change IDs.
For monorepos, scope change ranges to affected services. Keep flag activation
and progressive traffic exposure beside deployment records.

## Capability rollout

| Capability | Next evidence to establish |
| --- | --- |
| Continuous delivery and deployment automation | One normal release path and verified recovery |
| Continuous integration, small batches and trunk-based work | Short branch lifetimes, reliable feedback and prompt review |
| WIP limits and value-stream visibility | Largest active-work vs queue-time constraint |
| Test automation and data | Repeatable critical journeys with isolated fixtures |
| Security and version control | Exact-SHA evidence, least privilege and reviewed dependencies |
| Database change management | Expand/contract compatibility and recovery evidence |
| Observability and proactive failure signals | Release-linked alerts and verified restoration |
| Maintainability and documentation | A new worker completes the documented task |
| Platform engineering | A second service adopts without central manual support |
| AI context, user focus and experimentation | Fresh scoped context and an observed product outcome |

Begin with one service and one measured constraint. A proposed initial WIP limit
is one unblocked implementation per service owner and one integration owner at
a time. This is an experiment, not a DORA mandate. Use delivery, stability,
runtime spend and human repair effort together when evaluating more agent
capacity. Do not score individual agents by commits or rank unrelated services.

## Acceptance sequence

1. The offline calculator and example pass their contract tests.
2. An upstream adapter verifies event authenticity, scopes and immutable event
   IDs, then reconciles a release, staged non-release, duplicate and rollback.
3. A reviewed incident provides causation, impact start and restoration evidence.
4. One real production build is held until exact-SHA checks pass.
5. A service owner measures a constraint, changes one mechanism and evaluates
   delivery, user outcome, cost and repair load before broad adoption.

Only the first step is implemented by this change. See
[`tools/delivery-evidence/README.md`](../../tools/delivery-evidence/README.md)
for the input contract, calculation policies and integration boundary.
