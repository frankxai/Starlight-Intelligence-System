# Starlight Intelligence — Visual Brand & Agent Visualization System

**Version:** v1.0 (2026-06)  
**Purpose:** Define the complete premium visual language for the Starlight Queen, her Swarms, all agents (144+), chibi/likable variants, icons, 3D experiences, infographics, and integration across the public site (starlightintelligence.org), content, social, and internal tools.

This is the source of truth for visuals. All generated assets, components, and future work must align.

## 1. Brand Vision & Principles
- **Vibe:** Cool. Premium. High intellect. Purpose-driven. Fun. Luminous, sovereign, cosmic yet approachable.
- **Likeability:** Combine majestic 3D Queen with adorable chibi figures for emotional connection without losing sophistication.
- **Premium Execution:** Cinematic 3D CGI (octane-like renders), perfect lighting, high detail, consistent color grading. No slop.
- **Unique System:** "Starlight Codex Visuals" — a layered system for representing intelligence:
  - **Queen Layer:** The Conductor (central, elegant, powerful).
  - **Swarm Layer:** Coordinated agent particles (dynamic, beautiful fields).
  - **Agent Layer:** Individual characters (chibi + 3D busts per role).
  - **System Layer:** Constellations, Memory Orbs, Hierarchies (for IS, verticals, etc.).
- **All Agents Coverage:** Tiered (Front-Door, Excavation, Leadership, Specialist, Foundation, Universal IS, Domain Sub-Stacks). Visual DNA consistent: glowing cores, star accents, domain-specific motifs (e.g. sound waves for Sound Intelligence, people clusters for People).
- **Motion Philosophy:** GSAP ScrollSync for premium feel — elements animate in harmony with scroll (swarms pulse, particles follow progress, reveals feel "conducted").
- **Dimensions & Usage:**
  - Hero: 16:9 or 21:9, large.
  - Cards/Gallery: 3:2, 4:3.
  - Icons: 1:1, 512px+.
  - Social: 1.91:1 (FB), 1:1 (IG), 16:9 (X).
  - Infographics: 16:9 or vertical 9:16.
  - Blog Headers: Full bleed or contained with generous margins (see prose styles).

## 2. Visual Language
**Core Palette (from site):**
- BG: #060609 deep cosmic
- Accents: violet #a78bfa, cyan #67e8f9 / #22d3ee, fuchsia #e879f9, emerald #34d399, amber #fbbf24, rose #fb7185
- Neutrals: soft whites, deep charcoals with glass/luminosity effects.
- 3D Style: Volumetric light, subtle god rays, glass/transmission materials (inspired by Apple Liquid Glass + Linear), rim lights, particle glows. Dark elegant backgrounds. Highly detailed yet clean.

**Queen Design:**
- Ethereal yet strong female figure (abstract/symbolic, no real faces to avoid issues).
- Flowing hair/robes as light streams and agent conduits.
- Crown/orb/staff motifs with embedded swarms.
- Expressions: Serene, wise, commanding, playful in chibi.
- 3D variants: Heroic full-body, close-up portrait, conducting pose, meditative.

**Swarms:**
- Luminous orbs/particles (small for density, varied sizes for hierarchy).
- Connections as fine neural threads or light bridges.
- Behaviors visual: ordered (ledger), chaotic-beautiful (measure), flowing (route).
- Queen always central or leading.

**Chibi & Icons:**
- Big head, expressive eyes, small body. Premium cute (not childish) — clean lines, perfect proportions, glow accents.
- Use for likeability in docs, UI, social.
- Icon set: Outline (thin elegant lines), Filled, 3D (beveled with light), Chibi Bust.

**Agent Characters Examples (extend to all 144):**
- Orchestrator / Queen: Central conductor.
- Prime / Sage: Wise elder with book/orb.
- Architect: Builder with geometric tools.
- Chibi variants for every specialist (e.g. chibi Sound Composer with notes, chibi Genius excavator with lightbulb).
- Domain specific: People (group figures), Sound (wave motifs), Music IS (notes + persona masks).

## 3. Asset Library Structure
- /public/assets/visuals/queen3d/ — 3D Queen + swarms
- /public/assets/visuals/agents-chibi/ — chibi icons/figures
- /public/assets/visuals/agents-3d/ — 3D busts
- /public/assets/visuals/icons/ 
- /public/assets/visuals/infographics/
- /public/assets/visuals/social/ (sized variants)
- Naming: queen-3d-conducting-001.jpg, swarm-field-explore-012.jpg, chibi-orchestrator-003.png, etc.
- Always provide alt text, SIP attribution where appropriate.

## 4. Integration into Site Experience
- **Homepage:** Hero with layered 3D Queen. Flagship interactive QueenSwarm section (enhanced). Visual Codex gallery. Scroll-synced swarm reveals.
- **/queen:** Expanded chapters with 3D images, chibi comparisons, full swarm gallery. More GSAP sync (phases tied to scroll progress).
- **/palace, /research, /explainer:** Use new images as headers, inline illustrations, infographics.
- **Blog/Content (research, explainer, cosmos, vaults):** 
  - Headers: Large contained or bleed image + title with generous pt-12 pb-8, max-w-4xl mx-auto.
  - Images: .prose img { max-w-full mx-auto my-8 rounded-xl shadow, aspect ratio respected via container }.
  - Specific plans per content (see below).
- **Components:** Enhance QueenSwarm, add AgentIcon, SwarmGallery, VisualCodexCard. Hybrid SVG+image for BrainHero/MemoryPalace (e.g. 3D orb image + SVG nodes).
- **New:** Consider /visuals or /codex page for the full system demo.
- **Social/Marketing:** Pre-sized assets for posts, threads.

## 5. Motion & Tech
- GSAP core + ScrollTrigger for scroll sync (progress bars, section reveals, particle control tied to scroll %).
- Framer for React entrances where needed.
- Canvas/QueenSwarm for interactive.
- Future: R3F for true interactive 3D if performance allows (use current images as fallback).
- Respect reduced motion everywhere.

## 6. Content Plans (Blog/Research + Infographics + Social)
**General Rules:**
- Blog headers: 1200-1600px wide, 16:9 or 3:2, generous margins (container mx-auto px-6, image mt-8 mb-12).
- Image sizing: Responsive, never stretch. Use Next <Image> or styled with object-cover where appropriate. Padding around text 1.5-2rem.
- Infographics: One per major topic, using Queen + labeled swarms/agents.
- Social: 5-10 variants per major release, chibi for engagement, 3D for authority.

**Specific Plans (generate headers first):**
1. **premium-3d-memory-palace-2026-05-17.md**: Header — 3D Memory Palace interior with Queen floating central, swarms as orbs. Infographic: 3D orb layers diagram. Social: "The 3D Memory Palace — Survey".
2. **starlight-proving-ground-2026-06.md**: Header — Queen in proving ground with testing swarms. Chibi "Sentinel" agents. Social series on excellence gates.
3. **memory-foundations-2026-05.md**: Header — Foundational 3D vaults + Queen architecting. Icon set for vaults.
4. **model-arena-2026-06.md**: Header — Queen overseeing model arena battle with swarm judges. Infographic: Arena brackets with 3D agents.
5. **explainer.md**: Header — Queen + full swarm overview. Multiple chibi for layers.
6. **sip.md / protocol**: Icon set + constellation SIP layers.
7. **changelog, cosmos cards**: Themed per entry with small Queen/Swarm accents or chibi.

Generate social posts as image descriptions + copy hooks.

## 7. Generation Guidelines (for 100+ images)
- Use image_gen with detailed, consistent prompts emphasizing beauty, 3D, premium, Starlight DNA.
- Batch: Queen variants (10), Swarms (15), Chibi Agents (30+ for coverage), Icons (20), Infographics (10), Social/headers (15+).
- Iterate: Generate base, then variants (pose, lighting, density).
- Wire immediately to public/ and components.
- Quality gate: Beautiful, likeable, on-brand, no artifacts. Use for replace where SVGs feel static.

This document evolves. Update with new generations. All work must feel "best of best teams" — thoughtful, executed, delightful.

**Built on SIP**

(End of DESIGN.md — expand with generated examples and links as assets land.)