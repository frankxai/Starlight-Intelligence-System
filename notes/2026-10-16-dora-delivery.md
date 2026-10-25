# DORA delivery evidence pilot — 16 October 2026

**Category:** engineering-workflow / measurement
**Source:** DORA Guides review and connected GitHub/Vercel inspection
**Related:** `docs/operations/dora-delivery-pilot.md`, `tools/delivery-evidence/README.md`

Decision: measure each application's production exposure independently of build
status and PR completion. Offline calculator and a read-only GitHub contract
workflow added on the DORA pilot branch. Missing incident attribution and
incomplete history remain null; this is not a live collector or dashboard.

The review covered all five Guides-index articles and selected capabilities.
Private account inventories and deployment snapshots stay in the operator audit;
the public contribution contains reusable code, synthetic input and methodology.
Production event ingestion, exact-SHA deployment gate verification and rollout
remain separate work. Existing release paths and substrate rules are unchanged.

Follow-up: added an operational playbook, linked from the Orchestration Engine,
and a read-only next-action advisor over the existing work-graph projection.
It routes missing proof to a functional role and highlights saturated review
capacity. It cannot admit, schedule, merge or release work. The new integration
test uses the existing projector and example ledger; no second task bus is added.
