# Starlight Academy Fabric Contract Pack

Implementation contracts for the Starlight Trust & Learning Profile. This package is the canonical machine-readable boundary between academy experiences, capability and execution graphs, institutional adapters, agent workflows, evidence services, credential services, and optional managed-resource services.

**Release:** `0.1.0-draft.1`  
**JSON Schema dialect:** 2020-12  
**Stability:** pre-1.0; production use requires explicit pinning  
**Repository licence:** MIT, inherited from Starlight Intelligence System. Any later separate schema licence requires an explicit legal and release decision.

## Contract law

1. Websites, LMSs, communities, and branded academies are projections over these records; they are not additional sources of truth.
2. Human, organisation, agent definition, immutable agent build, and workload instance identities remain distinct.
3. `declared`, `authorised`, `demonstrated`, and `credentialed` are separate states. No record may silently promote one into another.
4. Every consequential mission, assessment, payment, publication, or credential action has a named accountable human or institution.
5. A cryptographic signature proves integrity and signer control, never educational quality, truth, legal recognition, consent, or competence.
6. Learner evidence is private by default. Public projection requires an explicit consent grant and must not include raw learning telemetry.
7. Human credentials, contribution receipts, team mission attestations, and agent capability attestations are separate records.
8. Agents may validate, provision approved access, meter usage, and prepare actions. They may not independently create debt, invent discounts, alter renewal terms, define revenue shares, release disputed payouts, publish sensitive evidence, or decide credential status.
9. Events are append-only facts. Corrections create superseding events or new record versions; consumers never mutate historical events.
10. Every consumer must reject unknown major schema versions and preserve unknown minor fields when acting as a relay.
11. Every published Academy Pack provides a complete free local or BYOK path through curriculum, missions, skills, evidence, Passport export, and credential eligibility under the same rubric.
12. Capacity, privacy, integration, and service accountability may be paid; knowledge, capability truth, evidence rights, portability, and credential meaning may not be payment-gated.
13. Competency, execution, and economic/resource graphs are separate projections. No edge silently transfers capability, authority, ownership, reputation, credential status, or economic entitlement.

## Open capability floor

`AcademyPack.openAccessContract` is a hard conformance boundary, not marketing metadata. It requires the capability graph, curriculum, missions, skills, plugin manifests, reference agent definitions, rubrics/evaluators, public fixtures, local runner, Passport export, and credential-eligibility path to remain available without payment. Hosted compute may be transparently capped; local and BYOK execution remain learner-controlled.

The first public vertical is the AI Architect Graph Engineering Commons. Its competency graph records what a learner may learn and prove. Its execution graph records how bounded tools, skills, temporary workers, humans, and future attested agents coordinate and recover. Neither graph contains commercial entitlement.

## Repository layout

```text
academy-fabric-contracts/
  schemas/v0.1/               JSON Schema 2020-12 contracts
  fixtures/                   Valid and invalid conformance vectors
  events/catalog.yaml         Event taxonomy and ownership
  interfaces/openapi.yaml     Minimal HTTP control/resource plane
  interfaces/mcp-surface.yaml Minimal read-first MCP contract
  src/validate.mjs            Schema + semantic invariant validator
  src/invariants.mjs          Cross-field and cross-record laws
  .github/workflows/ci.yml    Contract conformance gate
```

## Schema identifiers

Canonical IDs use:

```text
https://schemas.starlightintelligence.org/academy-fabric/v0.1/<name>.schema.json
```

The URI is an identity, not a promise that network resolution is required. Validators must resolve from the pinned package or an integrity-checked registry mirror.

## Versioning

- Package releases use SemVer. Before `1.0.0`, a minor release may intentionally break draft consumers; every deployment must pin an exact package digest.
- Each object contains `metadata.schemaVersion` (contract version) and `metadata.recordVersion` (domain record version). They solve different problems.
- Schema `$id` paths carry `vMAJOR.MINOR`; compatible patches keep the same `$id` and are published as package patches.
- Additive optional fields and enum values require a minor version. Removing/renaming fields, changing meaning, narrowing accepted data, or changing invariants requires a new major schema line.
- Credential, attestation, receipt, and event records are immutable. Their status changes through new events and/or status-list entries.
- Every write requires optimistic concurrency through `If-Match`/ETag or an expected record version.

## Validation

```bash
npm ci
npm test
```

The validator performs:

- JSON Schema meta-validation;
- all valid/invalid fixture checks;
- semantic invariants JSON Schema cannot express reliably;
- event `dataschema` dispatch;
- reference/digest syntax checks;
- schema ID uniqueness and `$ref` resolution.

CI must additionally lint OpenAPI, verify generated TypeScript compilation, scan for secrets, and require CODEOWNER review for schema or policy changes.

## Non-goals in v0.1

- no degree, accreditation, EQF/NLQF, or statutory recognition claims;
- no autonomous credential decisions;
- no blockchain, token, universal reputation score, or wallet-only identity;
- no LMS, CMS, CRM, billing, or DAM implementation;
- no paid curriculum, hidden rubric, pay-to-win credential, or payment-dependent Passport export;
- no persistent agent activation without build-specific attestation, verified evidence, signed delegation, least privilege, revocation, and independent human authority;
- no storage of chain-of-thought, biometric proctoring, emotion inference, or opaque learner scoring.
