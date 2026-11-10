# Acceptance evidence

- Freeze a two-executor/one-resource fixture: exactly one live lease may own the resource within a tenant.
- Identical operation retries return the original result without extending authority; changed payload under the same operation ID is rejected.
- Expiry followed by reacquisition increments the fence; the previous owner cannot renew, release or validate output under the new generation.
- Recreate the arbiter over persisted storage and preserve ownership, expiry, generation and idempotency behavior.
- Wrong tenant/resource bindings and malformed timestamps, identifiers, TTLs and generations fail closed.
- Storage errors never become apparent lease success; concurrent attempts are serialized by the transactional adapter.
- Keep current protected HTTP routes unavailable before a real identity/membership verifier is integrated; no caller-selected tenant or forged Access header establishes authority.
- Before staging: integrate every effect and artifact sink with current-fence validation and verified grants. Internal lease tests alone do not prove safe distributed execution.
- Before hosted admission: prove unknown residency, revoked node, exhausted budget and denied tool cannot trigger fallback execution.
- Before launch: interrupt and resume a real repository mission, reject a late old-owner result, restore a hashed checkpoint and produce an exact-head reviewed PR.
- Benchmark the same frozen missions, models, budget and review criteria against both manual handoff and an assembled existing coding harness plus persistent cloud workspace plus GitHub PR workflow. Measure reconstruction time, review time, accepted completion and escaped defects; include failed attempts and support in cost.
- Before commerce: concurrent reservation, duplicated settlement, cancellation with late usage and refund fixtures pass against existing business contracts.
- Before UI release: desktop/mobile/keyboard review binds exact artifacts and distinguishes queued, working, disconnected, waiting-for-approval, failed and complete.
- Before recurring pricing: measure repeat use, accepted completion, total supplier cost, review/support time and contribution per accepted mission; unknowns remain unknown.
- Proposed pilot expansion gate: at least three of five teams complete at least two accepted missions per week for three consecutive weeks; reconstruction and review time fall without completion-quality degradation versus the assembled baseline; at least two paid renewals occur. These are proposed thresholds, not observed outcomes or authorized prices.
- If any proposed pilot threshold is missed, stop breadth expansion and repair the repository mission workflow before adding capability categories or execution providers.
- Before promoting this proposal: reconcile SIS #476/#477/#510/#518 and Ops #395/#389 without assuming their open content is accepted architecture.

Required negative/failure cases: wrong tenant; stale source; unavailable tool; unknown region/retention; insufficient budget; repeated event; uncertain external effect; cancellation with late result; export/reopen/recovery. Freeze cases before evaluation. Structural validation is not behavior, quality, security or production acceptance.
