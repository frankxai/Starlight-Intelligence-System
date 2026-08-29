---
name: passport-graph-projection
description: Project consented capability and evidence records into a learner-controlled Passport view without exposing raw telemetry or collapsing declared, demonstrated, and credentialed states.
---

# Passport Graph Projection

## Outcome

Produce a purpose-bound, revocable Passport projection that a learner can inspect, export, and selectively share.

## Use this skill when

- Verified capability and evidence records must become a portfolio, application, mentor, institution, or private learner view.
- A learner wants to export portable progress from one academy or tool.
- A partner needs a minimal proof projection rather than access to the learner's source database.

Do not use it when:

- Consent is missing, expired, withdrawn, broader than the stated purpose, or cannot be independently checked.
- The request asks for a universal public score, hidden risk rating, or raw learning telemetry.

## Inputs

- Learner-controlled consent grant and projection purpose
- Capability graph version
- Learning Passport, evidence, credential, and contribution records
- Recipient, expiry, revocation, and data-minimization policy

## Procedure

1. Validate the active consent grant, recipient, purpose, fields, expiry, revocation state, and export jurisdiction.
   - Proof: A consent decision records exactly what may be projected.
2. Resolve record status and lineage. Keep declared, practiced, demonstrated, credentialed, expired, withdrawn, and disputed claims distinct.
   - Proof: No state is inferred from graph adjacency or commercial entitlement.
3. Minimize the projection to the purpose: capability claims, selected artifacts, provenance, assistance disclosure, issuer, status, and verification route.
   - Proof: Every included field has a purpose and every excluded sensitive field stays absent.
4. Generate public, institution, opportunity, mentor, or private-self views from the same canonical records without mutating them.
   - Proof: Projection digest and source record versions are recorded.
5. Test revocation, expiry, stale credential, broken link, recipient mismatch, and cross-tenant leakage.
   - Proof: Negative tests fail closed.
6. Return export, verification, revocation, and deletion instructions controlled by the learner.
   - Proof: The learner can inspect and withdraw the projection without purchasing a service.

## Outputs

- Purpose-bound Passport projection
- Projection manifest and digest
- Verification and revocation instructions
- Excluded-field and privacy test report

## Guardrails

- Passport export and one complete private/self-hosted path remain free.
- Never include raw telemetry, chain-of-thought, behavioral inference, hidden assessment data, unrelated history, or financial data.
- A recipient receives a projection, not standing access to the learner's private graph.
- Expired or withdrawn consent invalidates the projection immediately.

## Completion

Return the projection purpose, included records, excluded classes, tests actually run, expiry, and revocation route.
