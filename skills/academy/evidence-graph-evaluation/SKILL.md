---
name: evidence-graph-evaluation
description: Evaluate whether mission artifacts support capability claims while preserving provenance, separating machine findings from human judgment, and blocking pay-to-win credentials.
---

# Evidence Graph Evaluation

## Outcome

Produce a claim-level evaluation report and evidence bundle preflight without making an unauthorized credential decision.

## Use this skill when

- Mission artifacts must be checked against capability nodes and rubrics.
- A portfolio, assessment queue, or credential process needs reproducibility and provenance preflight.
- Conflicting or agent-assisted evidence must be classified before human review.

Do not use it when:

- The user asks the model to issue, revoke, or guarantee a human credential.
- Raw private evidence lacks learner consent or the evaluator lacks authorized access.

## Inputs

- Mission Contract and target capability subgraph
- Frozen artifacts and provenance records
- Versioned rubrics, evaluator policy, and consent grants
- Prior findings, appeals, and conflict disclosures

## Procedure

1. Verify scope, consent, artifact digests, evaluator authority, rubric version, and separation between the learner, assistant, assessor, and issuer.
   - Proof: Authority and integrity preflight passes or blocks evaluation.
2. Map each asserted capability claim to the exact artifacts, decisions, observations, defenses, and assistance disclosures offered as evidence.
   - Proof: A claim-to-evidence lineage table with no implicit promotion.
3. Run structural, factual, reproducibility, adversarial, accessibility, and provenance checks permitted by the mission.
   - Proof: Findings identify method, inputs, tool version, and confidence.
4. Classify every claim as unsupported, partial, demonstrated, contradicted, or human-review-required; never translate a machine score into credential status.
   - Proof: Machine findings and human decisions occupy separate fields and records.
5. Detect graph poisoning, circular evidence, rubric leakage, hidden assistance, evaluator conflict, cross-tenant references, and commerce-dependent outcomes.
   - Proof: Blocking security and integrity findings are explicit.
6. Freeze the evidence bundle and prepare a review or appeal packet for an authorized human.
   - Proof: Immutable bundle digest, unresolved findings, and next authority are recorded.

## Outputs

- Claim-to-evidence lineage table
- Machine findings and confidence report
- Frozen evidence bundle preflight
- Human review or appeal packet

## Guardrails

- Identical evidence and identical rubric must yield the same assessment path regardless of payment tier.
- Payment may affect queue priority only when a funded public queue remains available; it never changes evidence thresholds.
- Do not expose hidden holdouts, raw chain-of-thought, private telemetry, signing keys, or another learner's evidence.
- Do not treat cryptographic integrity as truth, originality, competence, or legal recognition.

## Completion

Return what the evidence supports, what it does not support, tests actually run, blockers, and the named human authority required next.
