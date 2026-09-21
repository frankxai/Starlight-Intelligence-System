# Community contracts: a creation week with evidence

This is the first executable slice of [issue #66](https://github.com/frankxai/Starlight-Intelligence-System/issues/66).
It implements the existing [community operating model](../communities/starlight-communities-operating-system.md).
SIS owns the shared contracts. `starlight-communities` owns the community operating
experience; GenCreator, Discourse, and Discord adapters belong in their consuming repositories.

## Run the proof

With the repository dependencies installed:

```sh
npm run test:community
```

The deterministic test runs intake → quest → commitment → artifact → reflection,
replays an event, and checks consent, tenancy, causality, and privacy boundaries.
The [workflow plugin](../../plugins/starlight-community/README.md) makes the same
ritual available as a portable planning skill without requiring the runtime.

## Contract

`src/community.ts` exports `CommunityEvent`, `CommunityConsent`,
`CommunityAdapterManifest`, `CommunityLedger`, and `planCommunityAction`.
The closed version-1 event envelope uses opaque member/cell/object identifiers,
source provenance, correlation and causation IDs, an idempotency key, UTC time,
privacy class, and an explicit consent basis. Unknown fields and versions fail.
Member details, artifact bodies, reflection text, and identity mappings stay in the
authenticated consuming product; only their structured references enter this kernel.

The host supplies current authenticated consent on every admission and projection.
Events cannot grant their own consent. Public-class admission also requires current sharing consent. Duplicate consent records fail closed.
Idempotency keys are scoped to community and adapter; IDs to community. Identical
replays are ignored; changed content under the same key or ID fails. Causal links
must stay within the same member, cell, loop, and correlation chain.

Unavailable adapters and missing capabilities return an explicit fallback without
consuming the idempotency key. This implementation has no delivery side effects.
Retries therefore remain a host concern: bounded backoff for transient failures,
dead-letter invalid inputs privately, and replay with the original key after review.
Production storage must enforce transactional uniqueness across concurrent workers;
the in-memory fixture ledger is capped at 10,000 events and is not that storage layer.

Public and memory projections re-evaluate current consent. Private events never enter
either projection. Public outputs additionally require public event privacy and sharing
consent; memory outputs require memory consent. Source URLs and member/cell identities
are omitted. Opaque IDs must themselves be non-sensitive. Previously exported copies
require a separate host revocation/deletion process.

The private weekly scorecard measures submitted artifacts, commitments, reflections,
peer help, and member completion. It reports retention, adapter reliability, and cost
as null until a host supplies actual period/attempt/usage evidence. An event records a
submission, not an independently verified artifact or certified competency.

## Remaining acceptance work in #66

- Authenticated member identity and external identity mapping; consent revocation storage.
- Durable transactional adapter queue, retries, dead letters, and migration/export tests.
- Product-specific platform adapters with observed capability/health evidence.
- Competency and credential schemas; authenticated human approval records.
- Measured retention, provider cost, and adapter reliability in a real weekly pilot.
- Connected-host buyer testing of the skill package and independent release receipts.

There is no new feed, payment system, member database, or automatic public sender.
The action planner can produce drafts or requests for human review; every result is
explicitly non-executable. Breaking event changes require a new version and an explicit
migration; never reinterpret stored version-1 events in place.

Built on SIP — Starlight Intelligence Protocol v1.1.1. Canon: none.
