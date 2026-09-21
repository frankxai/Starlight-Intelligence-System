# ADR: SIS owns the Architecture Blueprint Manifest

Status: Accepted

Date: 2026-09-01

Scope: SIS operational layer
Owner: Starlight Architecture

## Context

Starlight needs reusable AI architectures that join web experience, agent execution, state, model routing, and operations across providers. Provider templates solve only their local deployment boundary. Hand-authored diagrams cannot enforce secret boundaries, source truth, verification state, or recovery.

Without one canonical contract, a Vercel starter, Railway template, public catalog, and implementation guide can each describe a different system while sharing the same product name.

## Decision

SIS owns a versioned **Architecture Blueprint Manifest** as an operational contract.

The manifest defines:

- the buyer outcome and acceptance criteria;
- explicit provider project surfaces and their deployment units;
- authenticated connections and environment-variable references;
- source, IaC, release-template, and availability state;
- secret, approval, observability, and recovery controls;
- optional adapter state;
- evidence-scoped promotion from contract-valid to production-proven.

Provider-native source remains in product repositories. A public Starlight catalog consumes the manifest. It does not become a second source of architecture truth.

## Repository authority

| Concern | Authority |
|---|---|
| Schema, semantic invariants, reference manifest, promotion policy | Starlight Intelligence System |
| Vercel project source and template release | Vercel product/template repository |
| Railway project source, `.railway/railway.ts`, and marketplace release | Railway operator/template repository |
| Cross-provider behavior and failure-path evidence | Shared integration/eval lane |
| Catalog presentation, affiliate links, campaign IDs, and disclosures | Shared commercial offer registry |

Downstream repositories consume a pinned `schemaVersion` and Blueprint version. They must not copy and mutate the schema.

## First reference architecture

`starlight-agent-launchpad@0.1.0` has exactly two cloud surfaces:

- Vercel project: public cockpit plus server boundary.
- Railway multi-service project: protected operator API plus private PostgreSQL receipt store.

Vercel calls Railway through authenticated public HTTPS. It cannot use Railway private DNS. The browser never receives the service token. The two projects deploy and roll back independently.

The v0.1 proof excludes Hermes and n8n. Both are optional planned adapters behind the core operator contract until their source and integration evidence exist.

## Governance

This decision does not amend SIP file contracts, attestation, sovereignty, alliances, or the universal IS taxonomy. It is therefore operational-tier work and does not require a substrate Board pre-pass.

Contract evolution follows these rules:

1. Additive optional fields may ship in a compatible schema revision with deterministic tests.
2. A changed required field, meaning, enum closure, or promotion invariant requires a new `schemaVersion`.
3. Provider claims may never outrun source and evidence recorded in the manifest.
4. A marketplace template is derived from pinned source and tests; it is never the canonical architecture definition.
5. Commercial attribution remains outside the architecture contract.
6. Production promotion requires schema and cross-surface integration proof plus build, health, security, and rollback proof per surface; evidence must be an immutable HTTPS reference bound by a SHA-256 fragment.

## Consequences

The contract creates one stable seam across SIS, a Vercel cockpit repository, a Railway operator repository, and public catalogs. It also makes incompleteness visible: the first reference remains a candidate until both sources, real deployment URLs, integration evidence, and rollback evidence replace planned fields.

The cost is deliberate friction. A blueprint cannot be called verified because its schema validates or because one provider template deploys successfully.

---

**Built on SIP** — Starlight Intelligence Protocol; operational SIS decision.
