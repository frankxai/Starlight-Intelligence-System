---
name: taste-engine
description: Turn subjective quality intent into executable hard gates, weighted rubrics, exemplars, anti-exemplars, blind comparison, and independent judge evidence. Use for high-value artifacts where correctness alone is insufficient.
---

# Taste Engine

## Outcome

Create a domain-specific Taste Profile and an evaluation loop that can reject polished mediocrity without pretending subjective judgment is deterministic.

When the SIS schema is unavailable, read `references/portable-contracts.md` before authoring the profile and keep all unrun evaluation `pending-runtime`.

## Use this skill when

- A high-value artifact must be persuasive, elegant, clear, resonant, or production-ready.
- “Premium,” “beautiful,” “world-class,” or similar intent needs an executable definition.
- Multiple candidates can be compared.
- A winning example should become reusable preference memory.

Do not use a taste rubric as a substitute for factual, security, accessibility, or artifact-native checks.

## Procedure

1. Identify the judgment context.
   - Name the artifact type, audience, decision, medium, production constraints, and what failure costs.
2. Write hard rejection gates.
   - Encode failures that invalidate an artifact regardless of polish.
   - Keep factual fabrication, unusable output, accessibility failure, and broken production constraints outside weighted averaging.
3. Define weighted dimensions.
   - Use observable descriptions of excellence and failure.
   - Make weights reflect the use case rather than generic aesthetic preference.
   - Confirm weights total approximately 1.0.
4. Ground the rubric.
   - Add reference exemplars and explain why each wins.
   - Add anti-exemplars and name the failure pattern.
   - Do not copy protected material into the profile; store references and rationales.
5. Generate candidates only when diversity is useful.
   - Change a real hypothesis, structure, or creative direction between candidates.
   - Avoid cosmetic variations that create fake choice.
6. Evaluate in layers.
   - Run deterministic artifact checks.
   - Use blind pairwise comparison where possible.
   - Add a domain critic and adversarial reviewer for consequential work.
   - Keep the producer from being the sole required judge.
7. Synthesize.
   - Let a separate owner combine winning properties without erasing the reason one candidate won.
8. Record preference evidence.
   - Store the winning reference, losing alternative, judgment rationale, judge identity or trace, and confidence.
   - Mark unrun or non-independent judging as pending.

## Evidence rules

- A judge result counts only when the evidence identifies it as producer-independent.
- Required taste lanes remain pending until the declared judge count passes.
- Taste cannot override a failed hard gate.
- Preference memory records why an artifact won, not just a score or adjective.

## Return

Return the Taste Profile, candidate strategy, deterministic gates, judge plan, evidence status, winning rationale, and unresolved disagreement. Include an Evidence Receipt only when an authorized runtime actually produced one; otherwise mark judging and receipt generation pending.
