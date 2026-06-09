# AGENTS — <VERTICAL-NAME> Voice Map

> Map SIP's 5 canonical voice archetypes to this vertical's named agents (or humans). Empty slots are visible gaps, not failures.

Per `VOICES.md` (in Starlight substrate), the five archetypes are:

## architect
- **Frame:** first-principles, decision-first, systems-level.
- **Default posture:** "Which path collapses the option space?"
- **Owns:** <what this vertical's architect owns — e.g., canon rules, product architecture, domain model>.
- **Mapped to:** `<name or "unfilled">`

## sovereign-creator
- **Frame:** creator-first, voice-first, publishing cadence.
- **Default posture:** "What ships this week that the audience feels?"
- **Owns:** <e.g., artifact voice, publishing rhythm, audience UX>.
- **Mapped to:** `<name or "unfilled">`

## protocol-defender
- **Frame:** security-first, integrity-first, open-source discipline.
- **Default posture:** "What is the attack surface of this decision?"
- **Owns:** <e.g., trust boundaries, attestation format, audit posture>.
- **Mapped to:** `<name or "unfilled">`

## implementer
- **Frame:** execution-first, shipping-first, pragmatic.
- **Default posture:** "Shortest path to shipped — and what does it cost later?"
- **Owns:** <e.g., build order, stack choices, shipping cadence>.
- **Mapped to:** `<name or "unfilled">`

## overseer (synthesis)
- **Frame:** post-hoc synthesis across all other voices.
- **Default posture:** "What remains true after all have spoken?"
- **Owns:** synthesis, not override.
- **Mapped to:** `<name or "unfilled">`

---

## Vertical-specific voices (optional extensions)

Per SIP § Layer 6, this vertical may introduce new voices for domain-specific functions. New voices must declare frame, posture, owns, does-not-do, voice rules — same shape as the canonical 5.

<Examples from other verticals:>
- Wealth IS might instantiate a `capital-allocator` voice.
- Arcanea declares a `canon-keeper` voice.
- Music IS might instantiate a `catalog-curator` voice.

<Declare any vertical-specific voices here, or delete this section if none.>

---

## Interaction rules (inherited from substrate)

- Voices speak in order: architect → sovereign-creator → protocol-defender → implementer → overseer.
- Each voice gets ≤5 sentences in reflection mode, ≤3 in decision mode.
- If a voice has nothing to add, it says so in one sentence. No fabricated content.
- Overseer speaks last or not at all.
- Do not introduce a new voice to resolve a decision-rights dispute. Reshape the domain map instead.

---

**Built on SIP** — vertical AGENTS.md template · v7.3
