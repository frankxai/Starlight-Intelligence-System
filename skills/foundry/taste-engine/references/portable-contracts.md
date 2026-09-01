# Portable Taste Profile contract

Use this reference when the SIS Taste Profile schema is unavailable. It provides a stable evidence-plan shape, not an evaluated result.

Return one object with:

- `schemaVersion`, stable `id`, `artifactType`, `audience`, and `productionConstraints`;
- `hardGates`, each with `id` and observable `rejectWhen`;
- weighted `dimensions`, each with `id`, `weight`, `excellent`, and `failure`; weights total 1.0;
- referenced `exemplars` with `why` and `antiExemplars` with `failure`;
- `candidatePolicy.minimumCandidates`, `maximumCandidates`, and comparison method;
- any actual `pairwisePreferences` with winner, loser, and rationale;
- `acceptedJudgments` only for real judge traces;
- `judgePolicy` covering blind review, independent-judge minimum, producer eligibility, synthesis owner, domain critic, and adversarial review.

When no independent run occurred, keep `acceptedJudgments` empty and return `evaluationStatus: pending-runtime`. Never fabricate a score, winner, judge identity, or Evidence Receipt.
