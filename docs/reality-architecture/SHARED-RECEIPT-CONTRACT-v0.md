# Shared Receipt / Proof Contract v0

**Status:** draft, branch-only, not deployed.  
**Schema:** `docs/reality-architecture/schemas/shared-receipt.v0.schema.json`  
**Date:** 2026-11-07 (Europe/Berlin)  
**Scope:** additive folding only. Does **not** rewrite:

- `docs/reality-architecture/schemas/actualization-receipt.schema.json`
- `foundry/contracts/evidence-receipt.schema.json`
- `foundry/contracts/platform-release-receipt.schema.json`
- `docs/receipts.md` (run-receipt / DSSE profile)

Related reuse (untouched this stream): [starlight-memory #49](https://github.com/frankxai/starlight-memory/pull/49).

## Why

IncomeGraph already has a first-class `Receipt` node type (`agenticincome.ai/v1.1`) whose only typed edge is:

`attests: Receipt → RevenueObservation | Experiment | Evidence | Maintenance`

SIS already has three incompatible Proof JSON shapes plus a signed run-receipt. Agents need one citation envelope without breaking Foundry or Reality Architecture validators.

## Envelope (measured from live schemas)

| Shared field | Actualization | Foundry evidence | Platform release | IncomeGraph Receipt node | Run receipt (`docs/receipts.md`) |
|---|---|---|---|---|---|
| `receiptId` | `id` (`ra:receipt:…`) | `receiptId` | `receiptId` | node `id` | `receiptId` |
| `createdAt` | `finished_at` (or `started_at`) | `createdAt` | `createdAt` | provenance.date (date only; lift to date-time when wrapping) | `issuedAt` |
| `subject.name` | `action_id` / plan | `packageId`@`packageVersion` | `subject.name` | `label` | `subject.name` |
| `subject.contentHash` | evidence[].content_hash | artifacts[].sha256 | `subject.artifactSha256` | optional in `data` | `subject.digest.sha256` |
| `actor` | `actor` | (issuer implied) | `attestation.actor` | `owner` / principal | `issuer` + decisions |
| `status.verdict` | `result` + `verification.status` | `status` | derived from `checks` / `claims` | evaluation outcome (soft) | `verdict` PASS/FAIL/PARTIAL |
| `evidence[]` | `evidence[]` | `artifacts[]` + tests | `evidence[]` | via `attests` targets + Evidence nodes | `evidence[]` |
| `attestation` | n/a | n/a | `attestation` | optional | DSSE envelope |
| `payload.body` | full actualization object | full evidence-receipt | full platform-release | optional pointer JSON | run-receipt predicate |

## IncomeGraph → shared → domain

1. **Author** an IncomeGraph `Receipt` node (required node fields: `id`, `type=Receipt`, `label`, `owner`, `provenance`, `version`, `visibility`, `evaluation`).
2. **Edge** `attests` from that node to the `Evidence` / `Experiment` / `RevenueObservation` / `Maintenance` it proves.
3. **Optional wrap:** create a Shared Receipt with `receiptKind: "income-graph"`, `incomeGraph.nodeId` = Receipt node id, `incomeGraph.attestsToNodeIds` = edge targets, and `subject.uriOrRef` pointing at a durable artifact (commit, JSONL ledger line, payment export).
4. **If** the proof is actually a Foundry package validation, platform release, or actualization run, set `receiptKind` accordingly and place the **unmodified** domain JSON under `payload.body` with `payload.domainSchemaId` set. Domain validators keep working.

## Compat rules (v0)

- `compat.preservesDomainSchemas` is always `true`.
- Do not migrate Foundry or Actualization writers to this envelope yet.
- Empty `evidence` is allowed only for `status.verdict: "draft"`.
- Signature verification stays with the domain verifier (`sis.receipt.verify`, platform-release attestation, Foundry conformance). The shared envelope may *carry* attestation metadata; it does not redefine crypto.

## How to test

SIS already depends on **Ajv** (measured: `package.json` / `tools/foundry/lib/upstream-conformance.mjs`, `protocol/lib/jsonschema.mjs`).

Manual check without a new npm script:

```bash
# from a checkout of Starlight-Intelligence-System (not required for this PR review)
node --input-type=module -e '
  import fs from "node:fs";
  import Ajv2020 from "ajv/dist/2020.js";
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const schema = JSON.parse(fs.readFileSync("docs/reality-architecture/schemas/shared-receipt.v0.schema.json","utf8"));
  const validate = ajv.compile(schema);
  const example = JSON.parse(fs.readFileSync("docs/reality-architecture/schemas/examples/shared-receipt.v0.example.json","utf8"));
  if (!validate(example)) { console.error(validate.errors); process.exit(1); }
  console.log("shared-receipt.v0: ok");
'
```

This PR ships a minimal example next to the schema. Domain fixtures under `docs/reality-architecture/fixtures/` and Foundry conformance suites remain the source of truth for the three wrapped shapes.

## Non-goals (this PR)

- No production deploy, no secrets, no DNS, no Foundry contract rewrites.
- No change to signed run-receipt DSSE profile.
- No merge requirement; draft only.
