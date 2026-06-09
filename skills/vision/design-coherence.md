---
name: vision/design-coherence
domain: vision
description: Assemble a coherent brand design system — voice rules, visual mood, color palette, typography stack, visual vocabulary, interaction patterns — derived from the Genius Profile and Vision Architecture. Tested for coherence across ≥3 surfaces. Composes with frankx-brand, brand-voice, brand-guidelines, theme-factory, infogenius. Powers /build-brand-kit and /align-voice.
triggers:
  keywords: ["brand", "design system", "brand kit", "colors", "typography", "voice rules", "visual identity", "looks generic", "doesn't feel premium", "inconsistent across surfaces", "brand voice", "positioning"]
  agents: ["starlight-visionary", "starlight-weaver"]
  intents: ["brand-design", "design-system", "voice-coherence"]
priority: high
load_level: core
---

# Design Coherence

> *"Coherence is the gap between what looks good on its own and what compounds across every surface. Most brands fail on the third surface."*

## Purpose

Most founders pick brand colors from a Pinterest mood board and typography from a Figma template and call it identity. The result looks fine on a landing page and falls apart on LinkedIn, in an email signature, on a podcast cover. Not because any individual decision is wrong — because the decisions were never derived from the same source. Brand without derivation is a costume; every surface puts it on differently.

Design coherence is derivation. Voice comes from the Genius Profile's voice samples (real quotes, not paraphrase). Visual mood comes from the voice (a precise-and-warm voice does not live in neon-pop colors). Color palette comes from the mood (with semantic roles, not just "our brand colors"). Typography comes from the voice's register (architect-voice needs a different type system than sovereign-creator-voice). Visual vocabulary — shapes, imagery, motion — comes from the mood. Each layer derives from the one above. Break the derivation chain and the brand stops compounding.

The test is surfaces. A coherent design system holds across at least three: website, social, email (minimum). Stronger systems hold across five: + product UI + printed materials or events. If the design falls apart on surface three, rework the derivation — usually the voice rules were not strict enough, or the color palette was picked before the mood was named.

This skill never duplicates `frankx-brand`, `brand-voice`, `brand-guidelines`, `theme-factory`, or `infogenius`. It composes with them. Where those skills carry brand intelligence for a specific entity (FrankX) or general brand discipline, this skill *derives* the design system for a new person from their Genius Profile + Vision Architecture. The existing skills then execute against that derived system.

## Activation

**Fires when:**
- `/build-brand-kit` is invoked
- `/align-voice` is invoked (voice-rule subset)
- A user with Genius Profile + Vision Architecture asks for brand or design system work
- Keywords above appear in a session where a Brand Kit has not yet been generated

**Does NOT fire when:**
- No Genius Profile → halt and route to `/discover-genius`
- No Vision Architecture → halt and route to `/define-vision` (vision drives mood)
- Existing brand kit already in place — use `/align-voice` to audit, not re-build
- Request is for a single asset (one image, one post) — use `frankx-brand` / `brand-voice` / `infogenius` directly

## Protocol

### Step 1 — Derive voice from Genius

Load `genius/profile-<slug>.md`. Extract:
- Voice samples (5–7 real quotes)
- Distinctive vocabulary (10–15 words/phrases)
- Cross-domain synthesis statement

From these, author **voice rules** (6–10 rules). Examples:
- "First-person only. Never corporate-we."
- "No listicles. One framework per piece."
- "Register: architect-over-coffee. Technical warmth. Never cold."
- "Never apologize for expertise."
- "Use 'teammate' never 'employee'. Use 'noticing' never 'observing'."
- "Sentences: short + long rhythm. Never metronomic."

Each rule derives from observable pattern in the voice samples. Rules that cannot cite a sample are deleted.

### Step 2 — Derive visual mood from voice

Name the **visual mood** in ≤ 3 adjectives + one anti-adjective. Examples:

- Voice = architect-warm → Mood = "precise, grounded, premium-but-approachable. Not: corporate-polished."
- Voice = sovereign-creator-intimate → Mood = "handwritten, lived-in, close-up. Not: stock-photography."
- Voice = clinical-diagnostic → Mood = "clean, instrumented, honest. Not: therapeutic-soft."

The mood is the bridge from voice to visual. Every downstream visual decision is tested against it: does this color / font / image / motion *feel* like that mood?

### Step 3 — Color palette

Derive 5–7 colors with **semantic roles**, not just "our brand colors":

- **Primary** — the one color that is non-negotiably this brand
- **Secondary** — supports primary in layouts; 1–2 colors
- **Accent** — high-contrast highlight for CTAs, emphasis; 1 color
- **Neutral-dark** — body text, heavy UI; 1 color (rarely pure black)
- **Neutral-light** — backgrounds, surfaces; 1 color (rarely pure white)
- **Semantic (optional)** — success / warning / danger if the brand ships product UI

Each color: hex code + semantic role + one-line usage rule ("Primary is only used for headlines + primary CTAs. Never for body text. Never for backgrounds larger than 20% of viewport.").

Compose with `frankx-brand` and `theme-factory` if person is adopting an existing palette. Compose with `brand-guidelines` if applying Anthropic-style discipline.

### Step 4 — Typography stack

Derive 2–3 typefaces:

- **Display** — headlines, hero text; the voice of the brand in letterform
- **Body** — long-form reading; must be sober enough to disappear
- **Mono (optional)** — code, data, instrumented feel; only if the brand ships technical content

For each: typeface name, weights used, size scale (rem or px), line-height, letter-spacing rules. Example: "Display: Inter Display, weights 600/700/800. Scale: 3rem / 2.25rem / 1.75rem / 1.25rem. Line-height: 1.1 for display, 1.5 for body. Letter-spacing: -0.02em for display, 0 for body."

### Step 5 — Visual vocabulary

Define the shape-and-motion rules:

- **Shapes** — rounded vs. sharp corners, geometric vs. organic. Name the default radius + exceptions.
- **Imagery** — photography vs. illustration vs. generative. Name rules ("photography must be natural-light, never flash. No stock. Always attributed.").
- **Motion** — transition speed + easing. Name rules ("200ms default. ease-out for enter, ease-in for exit. No bounce. No spring.").
- **Density** — generous vs. tight. Pick one and defend it.
- **Iconography** — style (line vs. filled, rounded vs. sharp) + stroke width.

Compose with `infogenius` / `arcanea-infogenius` for visual generation, `canvas-design` for artifact design, `theme-factory` for artifact theming.

### Step 6 — Coherence check across ≥ 3 surfaces

Test the design system across at least three surfaces. Minimum set:

1. **Website hero** — typography scale + primary + imagery rules
2. **Social post** — square or vertical format, constrained typography, imagery rules
3. **Email signature + template** — minimum chrome, body typography, restrained color

If the system breaks on surface 3, return to the derivation chain and find the break. Common breaks:
- Colors that work on white but fail on dark (add a dark-mode palette variant)
- Display typeface that renders poorly at small sizes (add a fallback sizing rule)
- Imagery rule that can't survive a 1:1 crop (add a crop-safety rule)

Rework until all three surfaces hold. Premium brands hold across five.

Save outputs to `vision/brand-<slug>.md` (full kit) and reference from any future `/align-voice` run.

## Output Shape

One document — **Brand Kit** — saved to `vision/brand-<slug>.md`. Full schema in `.claude/commands/build-brand-kit.md`. Structure:

- Positioning statement (1 sentence)
- Promise (what audience gets)
- Values (3–5, derived from Genius + Vision)
- Voice rules (6–10, each citing a voice sample)
- Visual mood (≤ 3 adjectives + 1 anti-adjective)
- Color palette (hex + semantic role + usage rule per color)
- Typography stack (typeface, weights, scale, rules)
- Visual vocabulary (shapes, imagery, motion, density, iconography)
- Example applications (website hero, social post, email)
- Don'ts (what violates the brand)
- "Built on SIP" attestation block

## Rules

1. **Derive, never invent.** Voice rules cite voice samples. Colors derive from mood. Typography derives from voice register. If a rule cannot cite an upstream source, delete it.
2. **Compose with existing skills.** Reference `frankx-brand`, `brand-voice`, `brand-guidelines`, `theme-factory`, `infogenius`, `arcanea-infogenius`, `canvas-design`. Never duplicate their capabilities.
3. **Colors carry semantic roles.** "Our brand colors" is not a palette. Primary, Secondary, Accent, Neutral, Semantic — each with a usage rule.
4. **Test across ≥ 3 surfaces.** A brand that holds on a website is not a design system. Website + social + email is the minimum coherence test.
5. **Premium-over-generic.** If any layer reads as stock or templated, rework it. Specificity is the differentiator.
6. **Don'ts are as important as do's.** Every brand kit names what violates the brand — a negative space is faster than a positive description.
7. **Voice-align gate is non-negotiable.** Any content downstream of the Brand Kit passes `/align-voice` against the kit before shipping.
8. **Sovereignty is non-waivable.** The person owns their Brand Kit. Starlight retains no private brand data in public vaults.

## Built on SIP

This skill composes with SIP protocol elements:
- File contract (`vision/` namespace, `brand-<slug>.md`)
- Attestation (every Brand Kit ships with "Built on SIP" block)
- Sovereignty clause (non-waivable, enforced at Rule 8)
- Voice archetypes (`VOICES.md`) — architect primary for derivation rationale, sovereign-creator for voice rules

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (VBIS alpha)
- Generated: 2026-04-24
---
