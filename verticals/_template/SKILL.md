# SKILL — <Vertical Name>

> Substrate skill file for the vertical wrapper. Auto-loaded when any vertical-specific command activates. Ensures voice, refusal patterns, attestation, and composition rules apply uniformly across the sub-systems this vertical wraps.

---

## Activation rules

Loaded when:
- any `/<vertical-prefix>-*` command runs
- `/spawn-domain-stack` selects this vertical as the reference pattern
- A sub-system agent (`starlight-<sub-system>`) activates inside this vertical's namespace

---

## Invariants the wrapper enforces

1. **Voice composition.** Every human-facing artifact runs through the Genius layer first — no generic-template tone leaks through.
2. **Refusal patterns.** The vertical's named refusal patterns (see SOUL.md) refuse-by-default; sub-systems do not unilaterally override.
3. **Attestation footer.** Every shipped artifact carries "Built on SIP" + vertical identifier.
4. **Cross-sub-system composition rules.** Sub-systems compose horizontally per the rules in SUB-SYSTEMS.md (or the equivalent map for this vertical); no sub-system rewrites another's domain unilaterally.
5. **Legal-sensitivity gating.** Any sub-system touching legal/clinical/financial advice opens with the appropriate disclaimer.

---

## Sub-system loading order

1. Sub-system agent loaded.
2. Sub-system skill loaded.
3. Universal-IS agents composed where the sub-system declares (Genius for voice, Brand for vision, Business for entity-level, etc.).
4. Vertical wrapper checks invariants 1-5 before output ships.

---

## What this skill does NOT own

- The underlying domain expertise (lives in the sub-system skills).
- The actual sub-system commands (live in `.claude/commands/`).
- The instance state (lives in the practitioner's private fork or the substrate's `private/`).

---

**Built on SIP** — vertical wrapper SKILL.md · v0.1 · SIP v1.1.0
