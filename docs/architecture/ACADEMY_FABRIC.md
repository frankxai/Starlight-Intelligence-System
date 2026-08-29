# Academy Fabric boundary and repository ownership

Status: proposed ADR
Date: 2026-08-29
Owners: Starlight Intelligence / Academy Fabric
Decision scope: repository ownership, shared contracts, runtime boundary, first vertical, commercial projection

## Decision

Build one Starlight Agentic Academy Fabric across existing canonical repositories. Do not create another academy, protocol, community, identity, commerce, credential, or command-center repository.

The Fabric is a capability-and-evidence substrate. Branded academies remain Academy Packs and brand-native experiences over shared contracts until repeated paid delivery, distinct governance, or regulatory isolation justifies a separate bounded system.

## Repository ownership

| Repository | Owns | Must not own |
| --- | --- | --- |
| `frankxai/Starlight-Intelligence-System` | Open protocol, shared identity/consent/reference primitives, Academy Fabric schemas, event envelope, conformance fixtures, public verification contracts | Private learner state, billing state, branded curriculum, account-backed Academy runtime |
| `frankxai/starlight-intelligence-academy` | Canonical Academy runtime, Mission lifecycle, evidence ingestion/evaluation, Passport projection, Guardian routing, institution overlays | Duplicate SIS protocol, a second commercial account, vertical-specific source libraries |
| `frankxai/ai-architect-academy` | Open AI Architect patterns, curriculum, Mission Packets, evidence exemplars, rubric specialization | Accounts, shared runtime, credential authority, commercial entitlement ledger |
| `frankxai/starlight-intelligence-web` | Offer and institutional surface, tenancy, checkout projection, reconciled entitlement view | Canonical learning evidence, credential decisions, duplicate Mission runtime |
| `frankxai/frankx-starlight-command` | Canonical portfolio topology and ownership map | Operational learning truth or runtime state |
| `frankxai/starlight-command-center` | Read-only observability and executive projection | Canonical business, contract, learner, payment, or repository state |

GenCreator and Arcanea consume the same Fabric through their own Academy Packs and brand-native community surfaces. `frankxai/gencreator.ai` is the GenCreator consumer. Arcanea implementation ownership is decided by the repository-boundary work in `frankxai/arcanea-platform#29`; no Fabric contract moves there before that decision.

## Boundary with Community OS

The accepted Community OS strategy remains valid for shared identity, consent, entitlement, contribution, memory policy, agents, events, and adapters. Academy Fabric adds learning-specific semantics:

- Learning Contract and learner support/privacy terms;
- immutable Mission Contract and pinned rubric/evidence rules;
- learner Artifact and Evidence Bundle provenance;
- accountable assessment decision and appeal;
- human credential distinct from agent capability attestation;
- learner-controlled Passport projection;
- faculty Guardian Pack and role-separated agent team;
- contribution receipt separated from ownership and economic entitlement.

Existing Foundry `capability-graph` and `evidence-receipt` contracts describe package/agent validation. They do not acquire learner-competence or credential semantics. Academy records stay under the explicit `academy-fabric` namespace.

## Non-bypassable laws

1. `MissionContract -> EvidenceBundle -> authorised human assessment -> HumanCredential` is the only credential path.
2. A human credential and an agent capability attestation are different record types, subjects, authorities, lifecycles, and verification projections.
3. Learning Passport is a consented read model. It is not a telemetry store, universal profile, public-by-enrolment page, or source of truth.
4. Published packs, frozen evidence, credentials, attestations, contribution receipts, entitlement decisions, and events are immutable facts. Corrections supersede; they do not rewrite history.
5. Tenant isolation applies to every reference traversal. Evidence visibility can never exceed the strictest artifact, consent, licence, Mission, or institution rule.
6. Contribution, learning influence, credential, ownership, reputation, and economic entitlement remain separate records.
7. Every active agent requires a build digest, unexpired capability attestation, delegation, tool/data scope, budget, and escalation route.
8. Agents may validate, meter, provision approved access, and prepare decisions. They may not independently create debt, discounts, renewal terms, revenue shares, disputed payouts, public evidence, or credential status.

## First proof slice

The first deterministic vertical slice uses one AI Architect Mission Packet:

1. activate a pinned Mission Contract;
2. record one human principal and any disclosed agent delegation;
3. register content-addressed artifacts and freeze an Evidence Bundle;
4. run deterministic checks before model, peer, or human evaluation;
5. record critique, revision, defence, and an authorised human decision;
6. issue a non-formal Capability Receipt only if policy permits;
7. materialise private and employer-selective Passport projections;
8. evaluate the purchased or sponsored entitlement exactly once;
9. prove replay safety, tenant denial, revoked sharing, recovery, and auditability.

The public `ai-architect-academy` repository remains honest: it is currently an open pattern and learning resource library, not a course, certification, account system, or managed service. The slice must not change that claim until runtime and external evidence exist.

## Interoperability posture

The internal model is adapter-ready for Open Badges 3.0, CLR 2.0, W3C Verifiable Credentials Data Model 2.0, and CloudEvents 1.0. It does not claim conformance or issue production credentials in v0.1. LTI, xAPI, SSO, SIS, wallet, and credential-network integrations wait for a named funded requirement.

MCP is read-first in v0.1. It exposes published packs, authorised Mission/evidence metadata, public credential verification, public agent-attestation verification, schema validation, and deterministic evidence preflight. Consequential write tools remain deferred and require explicit confirmation boundaries.

## Commercial and institutional gate

The immediate commercial proof is a fixed EUR 5,000 AI Architect Academy Evidence Sprint with a EUR 2,500 deposit against signed scope. The broader Fabric is not promoted to a horizontal product until paid delivery repeats and at least three adjacent pilots share 70% or more of their workflow.

Institutional deployments begin as overlays. Universities and companies retain academic authority, identity, policy, LMS/SIS, faculty roles, and learner relationships. Starlight adds Mission, Guardian, evidence, Passport, entitlement, and interoperability contracts.

## Consequences

- One contract kernel compounds across AI Architect, GenCreator, Arcanea, Expert-to-Academy, and future institutional packs.
- The Academy runtime may evolve without collapsing protocol, curriculum, commercial, and portfolio ownership into one repository.
- Human authority, privacy, evidence, and payment boundaries are testable before automation.
- Forty pathways remain a portfolio map rather than forty simultaneous products.
- New repositories, credentials, integrations, and autonomous finance require evidence and a separate decision record.

## Related canonical work

- SIS issue #66: Community OS control plane and contracts
- Starlight Academy issue #2: public truth and launch gate
- AI Architect Academy issue #20: first traceable-evidence lab
- GenCreator issue #33: Community OS adapter
- GenCreator issue #42: versioned CreatorPack
- Arcanea Platform issue #29: repository ownership boundary

