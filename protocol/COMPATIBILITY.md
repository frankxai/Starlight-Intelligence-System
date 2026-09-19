# SIP graph — compatibility rules (v0.1.0)

The graph contract is versioned independently of SIP itself. A profile declares
`sipGraphVersion`; a validator declares the version it implements. This document says what
happens when they differ, and what kind of change forces which bump.

## The asymmetry that matters

A consumer **must ignore unknown optional fields** and **must reject unknown types**.

Unknown data is safe: a field a validator does not understand cannot make it approve something it
should have refused. An unknown node or edge *type* is not safe, because the validator has no rule
matrix for it and would be silently approving a relationship it cannot govern. So forward
compatibility is granted to data and denied to governed entities.

This is enforced: rule G4 and G5 fail on unknown types, and the test
`an unknown optional field does not break validation` pins the other half.

## What bumps what

| Change | Bump |
|---|---|
| Add an optional field to the envelope or a body | minor |
| Add a node type | minor |
| Add an edge type | minor |
| Widen an edge's legal endpoint set | minor |
| Add a validation rule that only fails on newly-invalid shapes | minor |
| Fix a rule's message, or a bug where a rule failed to fire | patch |
| Clarify prose without changing behaviour | patch |
| Add a required field | **major** |
| Remove or rename a node or edge type | **major** |
| Narrow an edge's legal endpoint set | **major** |
| Change the visibility lattice or the meaning of a level | **major** |
| Change what a projection rule permits | **major** |

Adding a node type is a minor bump *for the publisher* and a hard stop *for an older consumer* —
G4 will reject the profile. That is intended. The older consumer is not silently wrong; it
refuses, and the receipt says why.

## Validator behaviour across versions (rule C1)

Let the profile declare `pMajor.pMinor.pPatch` and the validator implement `vMajor.vMinor.vPatch`.

- `pMajor !== vMajor` → **fail**. A major bump is a breaking change; refuse rather than guess.
- `pMajor === vMajor` and `pMinor > vMinor` → **fail**, with the reason stated: the profile may
  declare types this validator cannot govern. Upgrade the validator.
- `pMajor === vMajor` and `pMinor <= vMinor` → **pass**. Patch is never load-bearing.

A validator never downgrades a profile, never strips fields to make it fit, and never emits a
PASS receipt it could not fully check.

## Deprecation

Inherited from `SIP.md` § Versioning: a breaking change requires a major bump and a **90-day
deprecation window**. This checker validates exactly one major version (rule C1 fails any other), so
during a window adopters keep the previous checker pinned beside the new one; no multi-version
validator exists yet. The canonical
changelog is `starlightintelligence.org/protocol/changelog`.

## Receipts pin versions

Every receipt records `declaredGraphVersion` (what the profile claimed) and `sipGraphVersion`
(what the validator implements), plus a sha256 of the exact profile bytes. A receipt is therefore
re-checkable: given the same profile and the same tool version, the rule results are reproducible.
Only `checkedAt` differs between runs, which the test suite pins.

---

**Built on SIP** · graph v0.1.0 · MIT
