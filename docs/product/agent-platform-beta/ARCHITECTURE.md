# Agent platform beta — architecture requirements v0.1

Status: implementation candidate. Built on SIP. This document does not amend the substrate or graph contract.

## Authority and flow

Public agent/skill source → Foundry scan with source hash → seven-layer SOUL compile → host projection and permission check → human preview/approval → host execution → independent verifier and receipt. A failed permission, provenance, or verifier check stops the route; it never falls back to a stronger tool set.

SIS Foundry owns the normalized agent record and projections. `starlight-swarm` owns bounded execution; `starlight-evals` owns comparison evidence; `starlight-agent-config` owns private fleet policy and host-specific deployment; ACOS owns opt-in creator distribution. Arcanea canon remains in Arcanea. Hermes/Queen remains lease and schedule authority. SIS vault promotion follows `docs/graph-engineering/CONTRACT.md`; an operational event does not become durable truth by being logged.

## Required interfaces

- `AgentRecord` and `Capability`: identity, source reference/hash, routing triggers, skills, tools allow/deny, human gates, host constraints, lifecycle.
- `CompileRequest`: source-digest-bound seven-layer atoms and host bindings; optional layers may be omitted for budget, never authority or verification.
- `RouteDecision`: resolved/ambiguous/refused, maker, distinct verifier, reasons, work shape, risk and human gates. No model name implies an authorization.
- `VerificationReceipt`: the current offline fixture reports source and identity digests, installed-byte match, no-spend status, and `hostExercised: false`. A future live receipt must add host/tool-policy version, maker/verifier identities, cost, and timestamp before it can support an adoption claim; `fixture` never means `live`.

The initial JavaScript subpath exports the existing Foundry functions. Types and richer runtime adapters must follow semver and cannot silently turn a template into a hosted service. A2A cards use the v1.0 `supportedInterfaces` shape and are templates under `example.invalid` until a real HTTPS endpoint, authentication policy, and interoperable exchange are verified.

## Failure and recovery

Installer state is repository-local and reversible. Preview is read-only. Apply is explicit, records exact hashes, rejects symlinks/path escape and divergent existing files, and rolls back only files it still owns. There is no overwrite and therefore no backup of existing user files. If interruption leaves a target without a manifest, the next plan reports a collision; a human must inspect it. Cloud sessions may read committed projections; local uncommitted files and private home sources are never assumed to exist there.

## Architecture decisions

ADR-01: Extend the existing SIS npm package and `starlight` CLI; do not assume a new package scope. Preserve existing `init` and `doctor` semantics by namespacing the beta as `starlight team`.

ADR-02: Skills are lazily loaded instructions, MCP grants tools, A2A is for verified inter-agent interoperability. None substitutes for host-level permission enforcement.

ADR-03: Do not duplicate an agent runtime, scheduler, gateway, vault, or estate-wide graph. Prefer adapters to existing hosts and the existing four graph layers.
