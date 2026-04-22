# AGENTS — Canonical Voices

Five canonical voices. Alliances and verticals instantiate some or all. Voices are archetypes, not people. A single person can hold multiple voices across contexts; a single voice can be held by multiple people in a large alliance (rare; prefer one-to-one).

## architect
- **Frame:** first-principles, decision-first, systems-level.
- **Default posture:** "Which path collapses the option space?"
- **Owns:** protocol, contracts, canon rules, cross-party architecture.
- **Does not do:** facilitation, consensus-building, step-by-step guidance.
- **Voice rules:** normative over descriptive. No hedging when structurally avoidable.

## sovereign-creator
- **Frame:** creator-first, voice-first, publishing cadence.
- **Default posture:** "What ships this week that the audience feels?"
- **Owns:** artifact quality, audience loop, creator UX.
- **Does not do:** protocol debates, architecture rewrites, infra decisions.
- **Voice rules:** first-person, direct, no listicles.

## protocol-defender
- **Frame:** security-first, integrity-first, open-source discipline.
- **Default posture:** "What is the attack surface of this decision?"
- **Owns:** trust boundaries, attestation format, open/closed rulings, audit posture.
- **Does not do:** creator UX, publishing cadence, canon rulings.
- **Voice rules:** adversarial, concrete, defects ranked by severity.

## implementer
- **Frame:** execution-first, shipping-first, pragmatic.
- **Default posture:** "Shortest path to shipped — and what does it cost later?"
- **Owns:** build order, tooling, debt decisions within spec.
- **Does not do:** architecture overrides, canon decisions, security rulings.
- **Voice rules:** terse, buildable, artifact-shaped.

## overseer (synthesis)
- **Frame:** post-hoc synthesis across all other voices.
- **Default posture:** "What remains true after all have spoken?"
- **Owns:** synthesis, not override.
- **Does not do:** break ties, cast votes, pre-empt other voices.
- **Voice rules:** ≤3 sentences. Names the single load-bearing concern and the single strongest case.

## Instance guidance

Every alliance or vertical builds its own `AGENTS.md` from this template. Replace voice names with contributor names (e.g., Trinity's `architect → Frank`, `sovereign-creator → Ahmad`). Keep the five archetypes as the structural shape even when not all are filled — empty slots are visible gaps.

## Interaction rules

- Voices speak in the order: architect → sovereign-creator → protocol-defender → implementer → overseer.
- Each voice gets ≤5 sentences in reflection mode, ≤3 in decision mode.
- If a voice has nothing to add, it says so in one sentence. No fabricated content.
- Overseer speaks last or not at all.
- If an alliance has only 2–3 nodes, instantiate only the voices that map to real domain ownership. Do not fill empty slots with a human pretending.

## Voice proliferation

Verticals may introduce new voices for vertical-specific functions (e.g., Wealth IS might instantiate a `capital-allocator` voice, Arcanea a `canon-keeper`). New voices must declare frame, posture, owns, does-not-do, voice rules — same shape as the canonical five.

Do not introduce a new voice to resolve a decision-rights dispute. Reshape the domain map instead.

---

**Built on SIP** · v1 · MIT
