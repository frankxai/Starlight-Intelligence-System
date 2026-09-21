# Starlight Architecture Blueprints

Architecture Blueprints are SIS-owned, provider-aware contracts for systems that span more than one deployment surface. They describe the outcome, project boundaries, connections, controls, rollout order, and evidence state without pretending that a diagram is a deployment.

The v1 contract is intentionally small:

- [`contracts/architecture-blueprint-manifest.schema.json`](contracts/architecture-blueprint-manifest.schema.json) is the closed structural contract.
- [`validate.mjs`](validate.mjs) adds graph, secret-boundary, provider, source, template, and evidence invariants.
- [`examples/starlight-agent-launchpad.blueprint.json`](examples/starlight-agent-launchpad.blueprint.json) is the first candidate.

## Validate

```bash
npm run blueprints:validate
npm run test:blueprints
```

The validator is deterministic and dependency-free. It reuses the in-repo Foundry JSON Schema engine, then applies Blueprint-specific semantic gates.

## Starlight Agent Launchpad v0.1

The candidate models two independent provider projects:

1. A Vercel web cockpit authenticates the human, validates a bounded task, and requires approval.
2. Its server route calls the Railway operator over protected-public HTTPS with a service token.
3. The Railway project executes the core operator contract and persists a deterministic run receipt in Railway PostgreSQL.

`*.railway.internal` is deliberately invalid for the Vercel-to-Railway edge. Railway private networking only exists within a Railway project.

The Railway project source of truth is `.railway/railway.ts`. A Railway marketplace template is a derived, tested release artifact and receives a `releaseTemplateRef` only after publication. The Vercel and Railway surfaces deploy and roll back independently; there is no fictional cross-cloud deploy button.

Current truth is explicit:

| Element | State |
|---|---|
| Blueprint contract | `contract-valid` |
| Vercel source and template | `planned` |
| Railway source and template | `planned` |
| Authenticated run-receipt integration | `planned` |
| Hermes reasoning adapter | optional, `planned` |
| n8n workflow adapter | optional, `planned` |

Hermes and n8n are not part of the v0.1 proof. The canonical proof is:

> Vercel cockpit → authenticated Railway operator → durable deterministic run receipt.

## Promotion rules

- `contract-valid` proves only that the manifest passes structural and semantic validation.
- `deploy-tested` requires real source and provider deployment evidence.
- `production-proven` must pair with top-level `verified`; every required check must pass with evidence.
- Production promotion requires schema and cross-surface integration proof plus build, health, security, and rollback proof for every surface.
- Production evidence uses an immutable HTTPS reference ending in `#sha256=<64 lowercase hex characters>`; labels such as `trust-me` cannot promote a claim.
- `available` source must identify a repository, root directory, and immutable or reviewable ref.
- `published` deployment must identify its derived release template.
- Optional adapters remain visibly `planned` until source and evidence exist.

## Ownership boundary

SIS owns the schema, semantic rules, reference manifests, and promotion policy. Product repositories own executable Vercel and Railway source. Public sites may catalog a Blueprint, and commercial offer registries may attach campaign, referral, and disclosure metadata, but neither may redefine the architecture contract.

Affiliate identifiers and campaign URLs stay outside this manifest. That keeps infrastructure truth independent of monetization and prevents unknown partner identifiers from becoming architectural state.

See [the architecture decision](../docs/architecture/ADR-2026-09-01-architecture-blueprint-manifest.md).

---

**Built on SIP** — operational SIS contract; no SIP substrate amendment.
