# ADR 2026-10-23 — Frontier Ledger v2: one provenance-aware record of what we learn from the frontier

Status: **proposed** (draft PR; requires architecture-board review). Author: Hyperagent frontier cycle 1. Base: `main` at `e036722`.

## Context

Starlight's external-technology knowledge lived in `context/empire/upstreams.json` (schema 1.0.0): 18 hand-curated entries, audit cutoff 2026-08-12, validated by `scripts/validate-upstreams.mjs`, which no CI workflow ran. It recorded *what we adopted*, but not *why we believe it*, *when it stopped being true*, *what contradicts it*, or *which products depend on it*. Frontier research was repeated across threads and repositories (SIS harness/memory study 2026-08-12, claude-code-config skill-foundry receipt 2026-09-29, agentic-ops-hub estate-guard landscape 2026-10-05, Frontier Lab strategy 2026-10-15) without a shared, machine-checkable memory.

On 2026-10-23 the register was 72 days old: 14 of 18 entries exceeded a 45–60 day freshness window, and one observed upstream (Letta Code) had moved from the pinned v0.30.19 to v0.34.21.

## Decision

1. **Canonical ledger.** `context/frontier/ledger.json` (schema 2.0.0) records Sources → Records → Claims with evidence class, confidence, `valid_from`/`valid_until`, supersession, contradictions, adoption state with decider and rationale, pending proposals, and links to products, repositories, decisions, tasks and capabilities.
2. **v1 becomes a projection.** `context/empire/upstreams.json` is generated from ledger records marked `registers: ["upstreams"]`. The migration is lossless (byte-identical projection). CI fails on drift. Existing consumers and `validate-upstreams.mjs` are unchanged.
3. **Ingestion is incremental and idempotent.** JSONL batches are de-duplicated by canonical URL, merged with provenance, and logged as batches. Re-running a batch is a no-op.
4. **Agents cannot promote adoption.** Automated deciders may assign only `ignore`, `watch` or `evaluate`; stronger states become proposals awaiting a named owner. v1 policy is preserved: reference harnesses stay lab-only, memory providers stay shadow/pattern-only.
5. **External text is data.** Only allow-listed fields are stored; control and bidi characters are stripped; instruction-like text is flagged for review.
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

`node --test test/frontier-ledger.test.mjs` (lossless migration, drift detection, de-duplication, idempotent ingestion, adoption authority, policy classes, untrusted text, supersession, contradictions, staleness, offline release watch, deterministic report, CLI gates, universe ranking). Seven targeted mutants of the core library were each killed by at least one test.
