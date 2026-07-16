# Starlight Board — SIP Observability Profile v1.0.0

**Date:** 2026-07-16  
**Scope:** `metrics/observability/` schemas and semantic authority boundary  
**Verdict:** **PROCEED-WITH-REVISE**

## Seats

| Seat | Finding |
|---|---|
| Architect | The profile composes existing Metrics Truth and Proving Ground contracts instead of creating a new control plane. |
| Sentinel | Raw private conversations remain outside the operational database; only metadata and evidence references cross the boundary. RLS defaults closed. |
| Evaluator | Metrics carry denominators and evidence IDs. Null remains valid when cost, human time, or outcomes are not yet instrumented. |
| Operator | Standard-library Python and JSONL permit Hermes and both Windows machines to emit data without new runtime dependencies. |
| Skeptic | Founder leverage and weighted outcomes remain Goodhart-sensitive; the schema must not create a universal composite score. |

## Required revisions before merge

1. Frank must acknowledge the substrate authority boundary before merge, per SIS substrate governance.
2. Supabase project selection and migration execution remain operational decisions in private `agentic-ops`; no credential or project ID enters SIS.
3. The first 30-day review must test whether evidence coverage and founder leverage measurements change behavior in unhealthy ways.
4. Published dashboards must show staleness and missing denominators rather than converting `null` to zero.

## Decision boundary

The board authorizes a review branch and operational dog-food run. It does not authorize automatic merge of this substrate-class contract.

Built on SIP — Starlight Intelligence Protocol.
