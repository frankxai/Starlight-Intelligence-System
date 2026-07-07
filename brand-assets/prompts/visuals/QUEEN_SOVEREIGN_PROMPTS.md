# Queen Sovereign Prompts — Starlight Intelligence Visual System

**Purpose**: Consistent, premium 3D Queen + Swarm renders for Sovereign Tier (heroes, /queen, research headers, authority moments).

**Brand DNA (always load this)**:
- Cool. Premium. High intellect. Purpose-driven. Fun.
- Vibe: Luminous, sovereign, cosmic yet approachable.
- Core: Majestic 3D Queen (ethereal yet strong, abstract/symbolic, no real faces). Flowing robes as light streams/conduits. Crown/orb/staff with embedded swarms.
- Palette: #060609 deep cosmic + violet #a78bfa, cyan #67e8f9/#22d3ee, fuchsia, emerald, amber, rose accents.
- Style: Cinematic 3D CGI (volumetric god rays, glass/transmission materials inspired by Apple Liquid Glass + Linear, rim lights, particle glows, high detail, clean, elegant dark backgrounds).
- Expressions: Serene, wise, commanding (playful only in chibi tier).
- Motion philosophy reference: Swarms as luminous orbs/particles with neural threads. Behaviors: ordered (ledger), flowing (route), etc.

**Critical Rules (from DESIGN.md + imagine skill)**:
- Front-load subject, strong high-level direction for mood/composition/lighting/style. Natural prose. Positive description.
- For series consistency: Generate ONE strong base image first. Then use image_edit with that base + "keep exact face/body style, lighting, DNA" for variants (pose, mood, density, background).
- Reference-first: When iterating a specific Queen look, always pass the best previous image as reference.
- Aspect: 16:9 or 21:9 for heroes/banners, 4:3 or 3:2 for cards.
- Never dominate operational surfaces — these are brand-lab / dedicated visual surfaces.
- Quality gate: Beautiful, on-brand, no artifacts, sophisticated, high production value. Score mentally against "best of best teams".
- SIP: Consider adding subtle attestation elements only if the artifact is final public.

## Base Prompt Template (copy/adapt)
"Premium cinematic 3D render of the Starlight Queen, [specific pose/mood e.g. elegant sovereign conductor / meditative architect / luminous weaver], in [setting e.g. vast dark cosmic chamber / floating memory palace of orbs / proving ground with testing swarms], flowing luminous robes of [violet #a78bfa and cyan #67e8f9] light streams carrying glowing agent swarms as particles, [crown/orb/staff] motifs with embedded swarms, [expression: serene commanding / wise], volumetric god rays, subtle glass transmission materials, perfect rim lighting, ultra-detailed high-end CGI, sophisticated powerful presence, deep #060609 background with subtle star field and [specific accent elements], [composition: centered powerful / dynamic diagonal], 16:9 aspect, premium dark tech aesthetic matching Starlight Intelligence DNA."

## Specific Ready Prompts (use these as starting points)

### Heroic Conductor (for research headers, /queen phases)
[Use the template above with "elegant sovereign conductor", "vast dark cosmic chamber", "raised staff directing coordinated swarms", "serene commanding expression".]

### Memory Palace Architect
"Premium cinematic 3D render of the Starlight Queen in meditative architect pose over a glowing 3D memory palace of floating neural orbs and six semantic vaults, soft cosmic light, deep #060609 void with violet cyan accents, intricate details on robes as data conduits, ethereal but grounded power, volumetric lighting, cinematic composition, 16:9 for blog hero."

### Swarm Ledger / Proving Ground
"Premium cinematic 3D render of the Starlight Queen overseeing ordered luminous swarms in a proving ground / ledger field, particles forming precise patterns and connections as fine neural threads, commanding yet wise presence, dark cosmic tech environment with emerald and amber accents for measurement/ledger, high detail CGI, 16:9."

## Iteration Loop (Best Practice)
1. Generate base with image_gen using full DNA + specific prompt.
2. Curate: Only keep if it nails lighting, proportions, mood, DNA.
3. For variants: image_edit(base.jpg, "transform into [new pose/mood e.g. weaving / resting conductor], increase swarm density in [color], keep exact Queen face style, body proportions, lighting, glass materials and overall Starlight DNA from reference").
4. Stage all in excellence-next/.
5. Promote only winners to numeric IDs + update registry + plan.

## Notes for Future Agents
- Always re-read full site/DESIGN.md and this file before prompting.
- Prioritize consistency over novelty.
- When quota tight: edit existing excellence bases rather than new from-scratch gens.
- For social crops: generate or edit to target ratios (1.91:1, 1:1, 16:9).
- Tag outputs with date + intent in filenames during staging.

**Built on SIP** — Starlight Intelligence Protocol

## Star Guardian-Inspired Tier (added 2026-06-26)
Full research, style breakdown, Riot references, and 10 refined ready prompts (Ahri-leader, Prestige Syndra dark, Lux optimistic, Jinx chaotic, chibi Codex, Kai'Sa tactical, Ezreal playful, group Guardians, action battle, prestige luxurious) live in `STAR_GUARDIAN_STARLIGHT_PROMPTS.md`.

Use for Sovereign splash heroes + Codex chibi personality. Always blend with core Queen DNA (#060609 luminous streams, swarms as familiars). Stage in excellence-next/star-guardian/. Curate ruthlessly on four-pointed star fidelity + glow harmony before promoting to numeric + registry.

Use these with the imagine skill guidance for prompt craft, reference handling, and premium visual gate.