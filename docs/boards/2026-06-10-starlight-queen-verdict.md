# Starlight Board — The Starlight Queen (continuous routing + eval overseer)

**Date:** 2026-06-10
**Tier:** substrate (orchestrator agent role + core routing + autonomy boundary)
**Decision rights:** Frank (SIP § 5)

## Proposal

Elevate `starlight-orchestrator` into a continuous overseer (the "Queen") that closes
a loop: **route** every task to the right model-tier + agent from a live data-driven
routing table → **measure** outcome via the Proving Ground scorecard + Cost Plane →
**learn** by re-deriving the routing table from receipts → **ratify** (auto for
low-stakes, Frank-ack for high-stakes) → **ledger** the change. Composes the existing
orchestrator, ROUTING_MATRIX, Proving Ground, and Cost Plane (`src/infra/cost-snapshot.ts`)
— connective tissue, not new measurement. Token optimization is intrinsic: route
capability-saturated task-classes down-tier (R3 proved Haiku matches Opus on
coding/grounding).

## Verdict

| Vector | Challenge |
|---|---|
| Sovereign | Reversible, but a silent re-route to a money path is the risk — kill-switch + explicit boundary required. |
| Seer | Compounds into an asset OR an unauditable oracle; the improvement ledger is the deciding factor. |
| Harmonizer | Missing connective tissue between 4 tools that don't talk; must not override the substrate human-ratify rule. |
| Strategist | Self-optimizing eval+routing+cost loop; the Haiku cost lever may pay for the whole Proving Ground. |
| Verifier | Failure = stale table / n=1 rule-flip; require ≥2 concordant rounds + provenance; build read-only first. |

**Overseer:** Load-bearing concern = the autonomy boundary (bound auto-routing to
low-stakes; gate money/substrate/irreversible). Strongest case = the tools exist, it's
reversible, and the cost payoff is immediate.

**Recommendation:** PROCEED-WITH-REVISE

### REVISE items (binding, addressed in v0.1)

| # | Item | Status |
|---|---|---|
| A1 | Autonomy boundary: auto-apply only low-stakes task-classes; money/substrate/irreversible/external-side-effect always safe-default + Frank-ack; one-flag kill-switch | shipped — ROUTING-DOCTRINE.md §Autonomy + `autoApply` per class |
| A2 | Sample floor + provenance: a routing rule hardens only after ≥2 concordant rounds; table carries `lastDerivedFrom` + `confidence` | shipped — routing-table.json fields |
| A3 | Improvement ledger: every change dated, evidenced, reversible | shipped — ROUTING-DOCTRINE.md §Ledger |

---
**Built on SIP** · Starlight Board · 2026-06-10
