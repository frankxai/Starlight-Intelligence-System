# ADR 2026-10-23 — Frontier Ledger v2: one provenance-aware record of what we learn from the frontier

Status: **proposed** (draft PR; requires architecture-board review). Author: Hyperagent frontier cycle 1. Base: `main` at `e036722`.

## Context

Starlight's external-technology knowledge lived in `context/empire/upstreams.json` (schema 1.0.0): 18 hand-curated entries, audit cutoff 2026-08-12, validated by `scripts/validate-upstreams.mjs`, which no CI workflow ran. It recorded *what we adopted*, but not *why we believe it*, *when it stopped being true*, *what contradicts it*, or *which products depend on it*. Frontier research was repeated across threads and repositories (SIS harness/memory study 2026-08-12, claude-code-config skill-foundry receipt 2026-09-29, agentic-ops-hub estate-guard landscape 2026-10-05, Frontier Lab strategy 2026-10-15) without a shared, machine-checkable memory.

On 2026-10-23 the register was 72 days old: 14 of 18 entries exceeded a 45–60 day freshness window, and one observed upstream (Letta Code) had moved from the pinned v0.30.19 to v0.34.21.

## Decision

1. **Canonical ledger.** `context/frontier/ledger.json` (schema 2.0.0) records Sources → Records → Claims with evidence class, confidence, `valid_from`/`valid_until`, supersession, contradictions, adoption state with decider and rationale, pending proposals, and links to products, repositories, decisions, tasks and capabilities.
2. **v1 becomes a projection.** `context/empire/upstreams.json` is generated from ledger records marked `registers: ["upstreams"]`. The migration is lossless (byte-identical projection). CI fails on drift. Existing consumers and `validate-upstreams.mjs` are unchanged.
3. **Ingestion is incremental and idempotent.** JSONL batches are de-duplicated by canonical URL, merged with provenance, and logged as batches. Re-running a batch is a no-op.
4. **Agents cannot promote adoption or touch the register.** Automated deciders may assign only `ignore`, `watch` or `evaluate`. Stronger states need a decider listed in `policy.human_deciders` and a `decision_ref`; agent recommendations become proposals. Ingestion rejects claims on register-feeding predicates (`track`) and throws if a merge would alter any existing record's adoption or identity, or the register projection. v1 policy is preserved: reference harnesses stay lab-only, memory providers stay shadow/pattern-only.
5. **External text is data.** Only allow-listed, type-checked fields are stored. Control, bidi, zero-width, soft-hyphen, BOM, separator and Unicode tag characters are stripped. Unknown fields fail validation. Instruction-like text, including obfuscated variants, is flagged for review.
6. **No new infrastructure.** Plain JSON in Git, zero-dependency Node (≥18) scripts and a zero-dependency CI workflow modelled on `protocol.yml`. No database, graph service or vendor memory product is introduced.
7. **Recurring execution is proposed, not enabled.** The release watch (`frontier:watch`) runs on demand. A weekly schedule requires an owner decision on cadence, token and who reviews the resulting PRs.

## Consequences

- Future agents can answer *what we learned, what changed, why we decided and what to build differently* from one file plus `frontier:report`, instead of re-researching.
- Adoption decisions gain an audit trail; disagreements surface as contradictions instead of silent overwrites.
- Cost: one JSON file grows with records (expected hundreds, not millions). If it exceeds roughly 5 MB, shard by class behind the same library API, still without a new database.
- Risk: claims are only as good as their sources. Vendor benchmark numbers are always `vendor_claim`; the report separates observed from claimed.
- Reversible: delete `context/frontier/`, `scripts/frontier/` and the workflow; `upstreams.json` remains a valid v1 file.

## Alternatives rejected

- **Graph database / hosted memory provider (Graphiti, Mem0, Cognee).** Already tracked in shadow; adopting one as the system of record would contradict the v1 policy that memory providers are projections, add an operational dependency, and is unjustified at this scale.
- **Extending v1 in place.** A breaking schema change for the existing validator and tests, with no projection boundary between curated decisions and observed facts.
- **Notion or Drive as the register.** Not reviewable in Git, not machine-checkable, and contrary to the accepted `architecture_authority_model` (canonical changes require pull requests).

## Verification

An independent verifier first returned **FAIL**: projection, tests and validation held, but two high-severity holes existed (an automated `track` claim could repoint the register; promotion of existing records was untested) along with sanitiser, decision-policy, drift-check and temporal gaps. All fifteen findings were fixed, each with a regression test, and the ledger data was migrated in place (decision references, `recorded_at`, human-decider allowlist) without changing the register bytes. A fresh independent re-verification returned **PASS WITH FINDINGS**: F1–F8 fixed and five new bypass attempts blocked. Its new findings were then fixed too: freshness laundering through weak claims, calendar-invalid dates, source-id shadowing, batch-id reuse, reserved predicates, and independent tests for each runtime invariant.


`node --test test/frontier-ledger.test.mjs` (lossless migration, drift detection, de-duplication, idempotent ingestion, adoption authority, policy classes, untrusted text, supersession, contradictions, staleness, offline release watch, deterministic report, CLI gates, universe ranking). 43 tests pass. Twenty targeted mutants of the library and CLI — including the four that survived the verifier's own mutation run — are each killed by at least one test.
