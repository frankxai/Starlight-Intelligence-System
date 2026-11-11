# Evolution Lab runtime proof — 5 November 2026

Source-only increment to [SIS #546](https://github.com/frankxai/Starlight-Intelligence-System/pull/546)
under [#545](https://github.com/frankxai/Starlight-Intelligence-System/issues/545).
Starting revision: `61216357d9e0569752c156bc5af4390ed22e7145`.
No hosted benchmark, customer activation or production release is claimed.

## What changed

The completed-receipt verifier reuses canonical `src/run-receipt.ts` DSSE
verification with server-owned keys, requires server authorization for the frozen experiment and
two tenant-scoped runs, checks runtime/source/dataset/metric binding and freshness,
then calls the existing comparison method. Missing or unverifiable evidence
returns `BLOCKED`; every result withholds release authority. Synthetic fixtures
exercise both Cloudflare and Vercel receipt paths using actual local signatures
and the existing canonical verifier; no new signature protocol or registry.

## Same-session service observations

| Service | Observation | Implication |
| --- | --- | --- |
| GitHub | #546 is an open draft on `agent/codex/evaluation-evolution-foundation-20261105` | Extend the existing work; no duplicate PR or repository |
| Vercel | Existing `starlightintelligence-ai` preview is READY at app source `2fc2ba20e5863ca8abd7eb67d1cc484d321b5587`, branch `agent/claude/mission-control-live` | This is another feature's preview, not Evolution Lab deployment proof |
| Cloudflare | Existing burst and mission-control Workers have deployed versions; the sampled burst Worker has Durable Objects and AI bindings, and mission-control has a service binding and D1 | Resource presence does not prove a connected Evolution adapter; no browser binding in these two samples |
| Supabase | Active Starlight Platform has RLS-enabled membership, budget and `agent_runs` tables; `agent_runs` has no `tenant_id` | Customer run comparison remains blocked until a reviewed mapping exists |
| Supabase policy/grants | `agent_runs_insert` has `WITH CHECK true` for anon/authenticated, but both roles lack effective INSERT grants; anon also lacks table SELECT and sequence USAGE | No effective anonymous write exposure established. Preserve the grant boundary; do not use unqualified telemetry as trusted evidence |

Only schema metadata, policy expressions and grants were queried. No customer
rows, credential values or raw runtime traces were read. No database change,
paid provisioning, model invocation, Worker upload, Vercel configuration change,
production promotion, new issuer or key distribution occurred.

## Verification and limits

Native Node.js 24 tests run the existing 12 advisory cases plus receipt tests for
signature tampering/replay, unknown/revoked issuers, role confusion, self-review,
tenant/run mismatch, frozen budget/hypothesis mismatch, exact runtime descriptor,
stale/future timestamps, snapshot mutation, malformed inputs and private-error
redaction. Git diff whitespace checking also runs. The PR records the final head
and exact test count; this note does not pin itself recursively.

Tests are synthetic and producer-run. The targeted CI workflow is added but
draft execution is skipped; no passing GitHub CI claim follows from its presence.
Full repository CI, an independent reviewer, actual Workers/Vercel imports,
qualified real issuers, current-session authorization and database isolation
integration tests remain outstanding. Signed metrics still depend on honest,
independent measurement; cryptography is not statistical proof.

## Next admissible runtime experiment

Use the existing Nexus experience in web issue #295, not a new app. Before the
first real run, the responsible owners must supply:

1. A server-mediated tenant-to-run mapping and negative integration evidence for
   unknown/revoked/cross-tenant callers; retain denial for unmapped legacy rows.
2. Two frozen task/run mappings, an uncontaminated held-out digest and an exact
   runtime descriptor, including the required pinned CLI v3 toolchain where used.
3. Existing budget reservation/settlement and allowed runtime credentials, bounded
   time/retries, cancellation and unknown-effect recovery.
4. Qualified runner/checker issuer keys from the existing authority, signed real
   receipts, exact-head independent review and one explicit human acceptance.

These are connection and evidence gates. The new module cannot provision them
or authorize execution. Rollback is removal of the new verifier/tests/workflow
from the draft; no cloud or database rollback is needed.

Built on SIP — Starlight Intelligence Protocol.
