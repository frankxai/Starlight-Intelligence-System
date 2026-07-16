# SIP Observability Profile v1.0.0

The SIP Observability Profile defines the neutral event and scorecard contract used by Starlight Intelligence System consumers. It does not mandate a vendor, database, agent framework, or dashboard.

## Decision

SIS owns the semantics. Operational instances own their private events.

| Concern | Authority |
|---|---|
| Event and scorecard schemas | `Starlight-Intelligence-System/metrics/observability/` |
| Metric truth and public claims | `metrics/METRICS_TRUTH.md` + `metrics/current.json` |
| Private run events, incidents and fleet state | `agentic-ops/observability/` |
| Capability and assurance receipts | `starlight-evals` |
| Raw conversations and private reflections | Second Brain OS private vault |

## Epistemic boundaries

- A chat is evidence of intent.
- A Git change is evidence of state change.
- A verification receipt is evidence of quality.
- Analytics, contracts, invoices and cash are evidence of external outcome.
- No source may silently impersonate another source's authority.

## Required joins

Every accountable execution surface should preserve:

`objective_id → run_id → repo_id → agent_id → artifact_id → evidence`

Missing joins remain visible as `null`; they are never inferred from commit volume, chat volume, or token volume.

## Core metrics

1. Verified outcome rate.
2. First-pass yield.
3. Successful unattended completion rate.
4. Evidence coverage rate.
5. Cost per verified outcome.
6. Human minutes per verified outcome.
7. Repo-registry coverage.
8. Founder leverage ratio, guarded by cash runway, strategic WIP, body, relationships, recovery, and the Sunday non-work boundary.

Metrics describe the system. When a team starts optimizing behavior specifically to move a measure, the measure must be reviewed or retired.

Built on SIP — Starlight Intelligence Protocol.
