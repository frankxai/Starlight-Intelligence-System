# SKILL — AI Ops Intelligence

> Substrate skill file for the AI Operations Intelligence vertical. Auto-loaded when any `/ai-ops-*` or `/ai-coe-*` command activates. Enforces voice, refusal patterns, attestation, and composition rules across the registry / council / CoE sub-systems.

## Activation rules

Loaded when:
- any `/ai-ops-*` command runs
- any `/ai-coe-*` command runs
- the `starlight-ai-ops` agent activates
- `/spawn-domain-stack` selects this vertical as a reference pattern

## Phase 0 scope (active 2026-05-17)

This SKILL is Phase 0 — operational scope limited to:
- `/ai-ops-excavate` (read filesystem → emit `memory/ai-ops/{platform}/{slug}.md`)
- `/ai-ops-list` (read registry → print table)

Council, CoE, sync, and ACOS bridge surfaces are deferred to Phase 1+ pending Phase 0 schema-vs-reality gate.

## Invariants the wrapper enforces

1. **Voice composition.** Every human-facing artifact (excavation logs, list output) runs through Frank-DNA tone — direct, technical, warm. No generic-template prose.

2. **Schema invariants.** Every assistant entry validates against `schemas/assistant.schema.json` before write. Invalid entries are rejected with a diff, never silently coerced.

3. **Attestation footer.** Every shipped artifact under this vertical carries "Built on SIP · AI Ops Intelligence". Phase 0 emit step injects this automatically.

4. **Refusal patterns.** Refuses to write entries for platforms not in the supported enum. Refuses to overwrite an existing entry without explicit confirmation.

5. **Domain sensitivity gating.** Phase 0 only reads local filesystem; no network calls, no credential access. If Phase 1+ work touches Notion / external APIs, gate-check applies (see §10 of spec).

## Composition

This vertical follows the Domain Sub-Stack pattern (sibling of People Intelligence + Sound Intelligence). Public substrate at `verticals/ai-ops-intelligence/` is MIT-licensed and forkable; private instance lives at `memory/ai-ops/`.

---

**Built on SIP** · AI Ops Intelligence v0.1 (Phase 0) · MIT
