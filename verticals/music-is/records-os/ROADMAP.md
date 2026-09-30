# Implementation program and acceptance

Planning starts 30 September 2026. Calendar windows are review targets, not promised releases. First public release = the cleared packet plus a 28-day delivery lead. A missing gate moves the date; it does not lower the evidence requirement.

| Slice | Window | Issue | Exit evidence |
|---|---|---|---|
| Identity and ownership | Days 1–14 | [Name/profile reconciliation](https://github.com/frankxai/Starlight-Intelligence-System/issues/256) | Current profile IDs and ownership; recorded name-use review; artist split decision |
| Private recording intake | Days 1–30 | [Intake and legacy audit](https://github.com/frankxai/Starlight-Intelligence-System/issues/257) | One recoverable source/master packet; duplicate proof; real receipt audit |
| Delivery and projections | Days 15–45 | [Release control and Notion binding](https://github.com/frankxai/Starlight-Intelligence-System/issues/258) | Exact-version approval, manual submission receipt, correct live URLs, conflict-safe projection |
| Agent admission | After first intake proof | [Shadow-tested seven-role workflow](https://github.com/frankxai/Starlight-Intelligence-System/issues/259) | Scope/cost/trace/recovery tests and an actual run/deployment receipt |
| Audience and accounting | First campaign + provider statement timing | [Three-single pilot and close](https://github.com/frankxai/Starlight-Intelligence-System/issues/260) | Repeat-listener evidence, consented audience, attributable costs and reconciled statement |

## Building the software

Use the existing Music IS CLI, catalog coprocessor, cockpit and June packet specification as the starting point. They are prototypes with some simulated state, not proof of live operation. The current `frankxai/arcanea-records` README still presents the broad Arcanea platform; decide its future role explicitly instead of placing a second independent catalog there.

Build a thin Records module with stable work/recording/version/asset/release identifiers; separate state axes; component-rights/evidence records; contributor agreements; private media pointers; approval-by-revision; durable run/effect ledger; provider receipts; authorized statement imports. Use tenant/artist scope through APIs, jobs, storage and retrieval. A service credential is not permission to expose every artist's private files.

Backend/API becomes operational authority only after a tested migration of a small audited subset. Export CSV and packet manifests for recovery. Keep existing operating tools during cutover. Test access denial, stale revision rejection, duplicate/out-of-order events, uncertain effects and restore before adding more dashboards.

First software product proof: one private source becomes a reliable release packet with accurate unknowns and actionable blockers. Then prove repeatability with a second recording, one real delivery, one statement import and a portable export. Productization is earned by those outcomes; a docs PR is not a working record-label SaaS.

## Validation in this change

Dependency-free structural validator and regression tests cover registry binding, historical/series identity exclusion, rights independence, approval revision/hash binding, receipt/profile requirements, uncertainty handling, and legacy CLI refusal/unknown intake. The tests use synthetic fixtures and do not exercise distributor, Notion sync, Suno generation, legal clearance or royalty payments.

## Boundaries

No masters selected by ear, music rights certified, legal entity formed, names registered, artist slots assigned, accounts renamed, releases submitted, paid generation commissioned, newsletter messages sent or persistent workers deployed. This package completes the current organization and provides the concrete implementation backlog; provider/business execution has distinct receipts and mandates.

Built on SIP — operating implementation remains founder-owned.
