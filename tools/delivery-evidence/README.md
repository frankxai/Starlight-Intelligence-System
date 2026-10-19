# Delivery evidence pilot

Measure a service's changes reaching production, with explicit evidence gaps.
This is an offline, dependency-free pilot. It does not collect events, verify
provider signatures, deploy applications, modify protection rules, or claim a
live DORA dashboard. The GitHub workflow tests the calculator.

```sh
node --test tools/delivery-evidence/report.test.mjs
node tools/delivery-evidence/report.mjs tools/delivery-evidence/example.json
```

For practical agent routing, read the
[agent delivery playbook](../../docs/operations/agent-delivery-playbook.md).
`agent-next-action.mjs` consumes the existing work-graph projection and returns
one missing-proof action without writing state or launching agents. Its tests
include the real work-graph projector and existing example events on Node 24:

```sh
node --test tools/delivery-evidence/agent-next-action.test.mjs
```

The example is synthetic. Account-specific inventories and build snapshots are
kept in the separate operator audit. A build snapshot alone cannot populate
production-exposure or incident metrics.

## Input contract

Use `example.json` as the minimal shape. Service IDs are stable application
identities, independent of repository names and cloud providers. A service's
`production_observation_complete` may be true only after reconciling the entire
reporting window against source events, including manual releases and rollbacks.
Keep it false for paginated or partial samples.

Each release has a unique exposure-event `id` and a separate `deployment_id`.
Set `exposed_at` from verified production traffic assignment. A READY build or a
successful GitHub check is insufficient. Accepted provenance kinds describe
evidence supplied by a trusted upstream collector; the calculator does not
authenticate a string claiming to be a provider event.

`requires_intervention` and `is_rework` are independent true/false/null fields.
Null means unclassified. A failure or rework needs an `incident_ref`. A production
hotfix can be rework without itself being a failed change. Ordinary bug fixes
and failed builds are not automatically production incidents.

For failures, `failed_at` is the verified start of production impact and
`recovered_at` is verified restoration. Detection-time proxies must remain
missing until the collector records their uncertainty explicitly.
This pilot reports deployment-caused failures only, not general incident MTTR.

`changes` contains the relevant full commit SHAs and recorded commit times, not
just the deployment's head SHA. `changes_complete` attests that the delivered
change range was reconciled. Use application path scope for monorepos. Preserve
an authoring-to-production mapping for cross-repository publishing; the tool
does not infer original authorship across a copied or squashed change.
Include pre-window exposure history to avoid counting old commits again during
rollbacks or redeployments. These provenance requirements remain collector work.

## Calculation policy

| Output | Policy |
| --- | --- |
| Deployment frequency | Verified production release occurrences / exact window duration in days. |
| Change lead time | Median commit-to-first-observed-production-exposure duration, one sample per commit per service. |
| Change fail rate | Releases requiring immediate intervention / production releases. |
| Deployment rework rate | Unplanned incident-driven releases / production releases. |
| Failed deployment recovery time | Median production-impact-start-to-restoration duration for failed releases in the exposure cohort. |

Windows are `[start,end)`. Recovery unresolved at the window end remains
right-censored. No failures means an undefined recovery duration, never zero.
Unknown classifications or incomplete observation produce null authoritative
values and retain the observed counts/medians separately. Medians here are a
local operationalization, not a claim of an official DORA scoring algorithm.
No cross-service rank, blended score, or performance tier is calculated.

Identical event retries deduplicate; conflicting IDs or duplicate exposure
identities fail. Input must be a snapshot whose classifications are valid as of
the reporting cutoff. This tool cannot establish event authenticity, detect
unreported incidents, prove history completeness, or infer customer value.

## Next integration boundary

1. Verify raw Vercel webhook signatures before parsing. Validate the known team,
   project and repository against the registry; store the original event ID and
   payload digest in an append-only durable store. Treat payload text as data.
2. Normalize `deployment.promoted` into exposure evidence. Add a separately
   verified rollback feed: Vercel's promoted webhook does not include rollbacks.
   Reconcile delivery gaps with provider records before marking coverage complete.
3. Resolve change ranges through read-only GitHub access. Record deploy/check SHA
   agreement, monorepo paths, and the FrankX authoring-to-production mapping.
4. Link a reviewed incident record to the causing deployment, remediation
   releases, impact start and restoration. Keep ambiguous attribution null.
5. Feed normalized snapshots into this calculator. Enable a production reporting
   job only after a real release, a duplicate delivery, a staged-but-unpromoted
   build and a rollback have been reconciled end to end.

Implementation roadmap and source review:
[`docs/operations/dora-delivery-pilot.md`](../../docs/operations/dora-delivery-pilot.md).
