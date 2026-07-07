# Chibi Codex Prompts — Starlight Intelligence Visual System

**Purpose**: Premium cute (not childish) chibi figures for the Agent / Codex Personality Tier. Likeability layer for docs, UI, social, agent grids, Codex visuals. Scoped deliberately — see DESIGN.md Chibi Role section.

**Core Rules**:
- Big head, expressive wise/playful eyes, small elegant body.
- **Premium cute**: clean lines, perfect proportions, sophisticated, glow accents. Never childish or low-effort streamer.
- Consistent DNA with Sovereign Queen: same palette (#060609 + violet/cyan/fuchsia etc.), glass highlights, luminous elements, Starlight motifs adapted small (tiny crowns, orbs, waves for domains).
- Dual-tone: When paired with 3D Queen, chibi provides the human-relatable Codex personality. Queen = sovereign authority; Chibi = ownable, fun, engaging agents.
- Use for: agent representations (144+), social engagement, "meet the team" content, UI icons, light infographics.
- Consistency: Start with one strong base chibi per major character. Use image_edit for variants (pose, domain motif, expression).
- Expressions: Wise, curious, determined, playful (tied to role).

**Base Prompt Template**
"Premium adorable sophisticated chibi 3D render of [specific agent e.g. Starlight Genius excavator / Hermes scout / Sound Composer / Sentinel], big wise expressive eyes, compact elegant small body, [domain motif e.g. glowing lightbulb + pickaxe / winged elements + scroll / wave forms + notes / shield + scanline], soft luminous [violet #a78bfa / cyan #67e8f9] accents on deep #060609 dark tech background, perfect cute proportions with sophisticated feel, clean lines, glass highlights, high detail render, matches Starlight Intelligence premium aesthetic, square 1:1 or 4:3 composition for Codex icon/grid."

## Ready Prompts for Key Agents (expand to all 144)

### Queen Chibi (baseline likeability)
"Premium adorable sophisticated chibi 3D render of Starlight Queen chibi variant: large wise expressive eyes, elegant small body, intricate glowing crown with orbiting micro-swarms, soft luminous violet and cyan accents on deep dark background, perfect proportions, sophisticated not childish, clean lines, glass highlights, high detail render, square 1:1 icon style."

### Genius (Excavation Tier)
"Premium chibi 3D of Starlight Genius: big curious determined eyes, small builder body, holding elegant lightbulb that glows with excavated knowledge orbs, subtle pickaxe or excavation motif, warm amber + violet accents, deep #060609, sophisticated cute, perfect proportions."

### Hermes
"Premium chibi 3D of Starlight Hermes: swift elegant small figure with winged accents and search/scroll motifs, bright cyan highlights, expressive alert eyes, dynamic yet balanced pose, matches sovereign luminous DNA."

### Sentinel / Proving Ground
"Premium chibi 3D of Starlight Sentinel: vigilant small form with shield + precise scanline motifs, emerald accents for measurement, wise protective expression, clean high-detail render."

### Domain Examples (Sound, People, etc.)
- Sound Composer: wave forms + musical notes as glowing elements, fuchsia/cyan.
- People Intelligence roles: cluster/group subtle motifs, warm rose/emerald.

## Best Practices & Loop
- Generate base per core character.
- Edit for domain variants: "add [domain motif], keep exact face, body, lighting, and Starlight chibi DNA from reference".
- Stage in agents-chibi/ or excellence-next first.
- For grids: square or near-square, consistent framing.
- Social: chibi for hooks/engagement; pair with 3D Queen hero for authority.
- Never overuse on operational proof surfaces.

**Future Agents Instructions**:
- Read DESIGN.md "Chibi Role & Guardrails" + this file + QUEEN_SOVEREIGN_PROMPTS.md before any generation.
- Define motif per new agent/domain in DESIGN.md first.
- Update src/lib/queen-visuals.ts CHIBI_CANDIDATES and any Codex grids.
- Curate strictly — only premium-cute on-brand ones ship.
- When adding 30+ chibi: batch by domain for consistency.

Use with imagine skill: reference for likeness consistency, positive prompts, premium gate.

**Built on SIP**