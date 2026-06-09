---
name: build-brand-kit
description: Produce a complete Brand Kit — positioning, voice rules, color palette, typography stack, visual vocabulary, example applications, don'ts — derived from the person's Genius Profile and Vision Architecture. Composes with frankx-brand, brand-voice, brand-guidelines, theme-factory, infogenius. Integrates with @arcanea/design-system pattern if present.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name, optional --style <premium|direct|intimate|technical|editorial>
---

# /build-brand-kit

Load `SIP.md`, `VOICES.md`, `agents/starlight-visionary.md`, `skills/vision/design-coherence.md`. Assemble a coherent Brand Kit grounded in the person's Genius Profile + Vision Architecture. Hand off to `/align-voice` for voice coherence enforcement on future content.

## Input
$ARGUMENTS

## When this command fires

- Genius Profile exists at `genius/profile-<slug>.md`
- Vision Architecture exists at `vision/vision-<slug>.md`
- The person is ready to install a brand that compounds across every surface

## When this command does NOT fire

- No Genius Profile → halt and route to `/discover-genius`
- No Vision Architecture → halt and route to `/define-vision` (vision drives mood; brand without vision drifts)
- Single-asset request (one logo, one post) → use `frankx-brand` / `brand-voice` / `infogenius` directly
- Existing brand kit in place → use `/align-voice` to audit, not re-build

## Process

1. **Load upstream.**
   - Resolve `<person-slug>`.
   - Load `genius/profile-<slug>.md`, `genius/freedom-path-<slug>.md`, `vision/vision-<slug>.md`.
   - If any missing, halt and route to the appropriate upstream command.
   - Parse optional `--style` hint. Style biases mood derivation but never overrides genius-derived voice.

2. **Check for @arcanea/design-system pattern.**
   - If `integrations/starter-packs/friend-starter/` or an adopter's repo contains a `@arcanea/design-system` reference, note it. Brand Kit outputs integrate with that system's token format where present (CSS variables, design tokens JSON).
   - If absent, emit standalone Brand Kit. Do not fabricate integration.

3. **Derive positioning statement.**
   - From Genius Profile's cross-domain synthesis + Vision Architecture's 10-year horizon.
   - Format: *"For <audience> who <problem>, <person/brand> is the <category> that <unique promise>, because <only-this-person-can-say reason from Genius>."*
   - One sentence. If it runs more than two lines, rework.

4. **Author voice rules (6–10).**
   - Derive from Genius Profile voice samples. Every rule cites a voice sample.
   - Examples of rule shapes:
     - "First-person only. Never corporate-we. (cf. sample #2)"
     - "No listicles. One framework per piece. (cf. sample #1, #4)"
     - "Register: <specific register>. Not: <anti-register>. (cf. sample #3)"
   - Rules that cannot cite a sample are deleted.

5. **Name visual mood.**
   - ≤ 3 adjectives + 1 anti-adjective.
   - Example: "Precise, grounded, premium-but-approachable. Not: corporate-polished."
   - Mood is the bridge from voice to visual.

6. **Derive color palette (5–7 colors).**
   - Each color: hex + semantic role + usage rule.
   - Roles: Primary, Secondary, Accent, Neutral-dark, Neutral-light, Semantic (optional).
   - If `--style premium`, bias toward muted + deep + 1 high-chroma accent. If `--style direct`, bias toward 2–3 high-contrast colors. If `--style intimate`, bias toward earth tones + off-whites.
   - Test: palette holds on both light and dark backgrounds. If not, add dark-mode variants.

7. **Derive typography stack (2–3 typefaces).**
   - Display + Body + Mono (optional).
   - Each: typeface name, weights used, size scale (rem), line-height, letter-spacing rules.
   - Compose with `theme-factory` where theming discipline exists.

8. **Define visual vocabulary.**
   - Shapes: radius default + exceptions.
   - Imagery: photography / illustration / generative rules. Attribution required for all imagery.
   - Motion: transition speed + easing + anti-patterns.
   - Density: generous or tight — pick one.
   - Iconography: style + stroke.

9. **Compose with existing skills.**
   - Reference `frankx-brand` if the person is part of the FrankX ecosystem.
   - Reference `brand-voice` for voice execution discipline.
   - Reference `brand-guidelines` if Anthropic-brand alignment is required.
   - Reference `theme-factory` for artifact theming.
   - Reference `infogenius` / `arcanea-infogenius` for visual generation using the derived palette.
   - Never duplicate any of their capabilities.

10. **Coherence check across ≥ 3 surfaces.**
    - Produce example applications:
      - **Website hero** — typography scale + primary + imagery rule applied.
      - **Social post (1:1 or 9:16)** — constrained typography, imagery rule, color discipline.
      - **Email signature + template** — minimum chrome, body typography, restrained color.
    - If the system breaks on any surface, return to the derivation chain and find the break.

11. **Name don'ts.**
    - 5–10 explicit things that violate the brand. Negative space is faster than positive description.
    - Examples: "Never use stock photography with people." "Never use drop shadows on text." "Never use more than 2 weights in a single block."

12. **Save.** Create `vision/` if missing. Write to `vision/brand-<slug>.md` using the output format below. Ship with "Built on SIP" block. Personal brand data lives in the person's instance only.

13. **Hand off.** Name exactly one next move. Typical: `/align-voice <person>` — audit existing content against the just-built kit, or `/creator-pipeline <person>` if no prior content exists and the brand is ready to produce.

## Output format

```
# Brand Kit — <Person Name> — <YYYY-MM-DD> (v1.0)

## Positioning statement
<one sentence, formatted per step 3>

## Promise
<what the audience gets in 1–2 sentences, in the person's voice>

## Values
1. <value> — <1-line expression>
2. <value> — <1-line expression>
3. <value>
(3–5 values, derived from Genius + Vision)

## Voice rules
1. <rule> (cf. sample #<N>)
2. <rule> (cf. sample #<N>)
...
(6–10 rules, each citing a Genius Profile voice sample)

## Visual mood
<≤ 3 adjectives>. Not: <anti-adjective>.

## Color palette
| Role | Hex | Usage rule |
|------|-----|-----------|
| Primary | #XXXXXX | <usage> |
| Secondary | #XXXXXX | <usage> |
| Accent | #XXXXXX | <usage> |
| Neutral-dark | #XXXXXX | <usage> |
| Neutral-light | #XXXXXX | <usage> |
| Semantic-success (optional) | #XXXXXX | <usage> |

## Typography stack
- **Display**: <typeface>, weights <list>, scale <list>, line-height <value>, letter-spacing <rule>
- **Body**: <typeface>, weights <list>, scale <list>, line-height <value>
- **Mono (optional)**: <typeface>, weights, scale

## Visual vocabulary
- **Shapes**: radius <value> default, exceptions: <list>
- **Imagery**: <photography | illustration | generative>, rules: <list>
- **Motion**: <duration> default, easing <ease-out | ease-in | linear>, anti-patterns: <list>
- **Density**: <generous | tight>
- **Iconography**: style <line | filled>, stroke <value>

## Example applications

### Website hero
<description of layout: typography scale used, primary color role, imagery rule applied>

### Social post (1:1)
<description: constrained typography, imagery rule, palette role>

### Email signature
<description: minimum chrome, body typography, color discipline>

## Don'ts
- <rule>
- <rule>
- ...
(5–10 items)

## Integrations
- Composes with `frankx-brand`: <how, if applicable>
- Composes with `brand-voice`: voice rule enforcement
- Composes with `theme-factory`: artifact theming
- Composes with `infogenius` / `arcanea-infogenius`: visual generation using this palette
- @arcanea/design-system tokens: <present | absent>

## Named next move
`/align-voice <person>` — audit existing content against this kit
OR
`/creator-pipeline <person>` — if no content exists, ship first piece in-voice

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (VBIS alpha)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Derive, never invent.** Voice rules cite voice samples. Colors derive from mood. Typography derives from voice register. Every layer traces to an upstream source.
- **Compose, don't duplicate.** Reference `frankx-brand`, `brand-voice`, `brand-guidelines`, `theme-factory`, `infogenius`, `arcanea-infogenius`, `canvas-design`. Do not rebuild their capabilities.
- **Coherence across ≥ 3 surfaces.** If the kit does not hold on website + social + email, it is not a design system. Rework the derivation.
- **Colors carry semantic roles.** Not just "our brand colors." Every color has a role and a usage rule.
- **Don'ts are as important as do's.** Every kit names what violates the brand.
- **Voice-align gate is non-negotiable downstream.** Any content produced against this kit runs through `/align-voice` before shipping.
- **Sovereignty is non-waivable.** The person owns their Brand Kit. Starlight retains no private brand data in public vaults.
- **Hand off to exactly ONE next command.** Typical: `/align-voice` or `/creator-pipeline`. Never both.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (VBIS alpha)
- Generated: 2026-04-24
---
