# Starlight Intelligence — Visual Brand & Agent Visualization System

**Version:** v1.0 (2026-06)  
**Purpose:** Define the premium visual language for Starlight operational intelligence, generated visual studies, icons, 3D experiments, infographics, and integration across the public site (starlightintelligence.org), content, social, and internal tools.

This is the source of truth for visuals. All generated assets, components, and future work must align.

## 0. Operational Product Guardrail
- Starlight production pages lead with memory, proofs, governance, traces, evals, logs, operator control, APIs, and reproducible deploys.
- Queen, swarm, chibi, and cinematic Codex language is a brand-lab layer. It may support `/visuals/brand-lab`, `/queen`, social, and experimental routes, but it must not dominate the homepage first viewport or primary product promise.
- Exact UI, labels, dashboards, diagrams, proofs, and protocol text should be coded directly. Generated visuals are supporting applications after QA, not the source of truth for product evidence.

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
- Queen is central only on `/queen`, brand-lab, and campaign-specific visual surfaces. Operational product pages keep evidence, controls, and proofs central.

**Chibi & Icons:**
- Big head, expressive eyes, small body. Premium cute (not childish) — clean lines, perfect proportions, glow accents.
- Use for likeability in docs, UI, social, and the Agent Codex layer.
- Icon set: Outline (thin elegant lines), Filled, 3D (beveled with light), Chibi Bust.

**Chibi Role (scoped deliberately):**
- Primary purpose: emotional connection + personality for the 144-agent system (Codex).
- Tone: sophisticated approachable ("premium cute"), playful where Queen herself is serene/commanding.
- When to reach for chibi: agent grids, social posts, docs, UI elements, "meet the agents" content.
- When to use majestic 3D Queen instead: heroes, research headers, /queen cinematic, authority/brand moments.
- Never let chibi dominate operational product surfaces (see guardrail above).
- This gives us dual-tone strength: cool/premium sovereign substrate (Queen + swarms) + fun/human-relatable Codex personality (chibi). Fits the overall brand "Fun" + "approachable" without diluting high-intellect positioning. Not streamer/low-effort — elevated likeability layer.

**Star Guardian Influence (2026-06-26 addition)**:
- New "star related" research executed: Full scrape of best LoL Star Guardian designs (Ahri leader, Lux, Kai'Sa, Prestige Syndra, etc.).
- Style: Four-pointed stars, luminous pastels + iridescent, magical girl splash art (Riot), ethereal glows, personality palettes.
- Applied to Starlight: Blend with existing Queen (light-stream robes → star energy, swarms → familiars). See brand-assets/06-illustrations/star-guardian/ for 10 refined prompts, bases, evaluation, and guide.
- Use for fresh variants in Sovereign (leaders) and Codex (chibi Guardians). Update prompts in brand-assets/prompts/visuals/ when expanding.

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
- **Homepage:** Product-first operational intelligence surface. The first viewport must show memory, proofs, governance, traces, evals, logs, and operator control through exact coded UI or real product evidence.
- **Visual Brand Lab:** Generated Queen, swarm, chibi, and cinematic studies live at `/visuals/brand-lab` until they pass artifact, crop, contrast, accessibility, and surface-fit QA.
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

**Visual Production Pipeline & Best Practices**
1. Generate or curate in brand-assets/06-illustrations/excellence-next/.
2. Strict curation against this DESIGN.md.
3. Promote winners to next numeric ID.
4. Update src/lib/queen-visuals.ts + VISUAL_CONTENT_PLAN.md + this file if rules change.
5. Wire using simple paths or the registry.
6. Content (research heroes, social, infographics): update assignments.
7. QA (gstack or visual review) + production deploy (site/ to Vercel).
8. For infographics: prefer code for text/data accuracy; generated for mood/atmosphere plates. Composite when both needed.
9. Social & broader content: pre-sized in social/, hooks written with brand voice.

**Targets (Excellent State)**
- Sovereign Tier: Complete coverage for all current + new research, /queen phases, key heroes.
- Codex Tier: 20–30 chibi minimum for core agents + 1–2 per Universal IS + first verticals (People, Sound, etc.). Domain motifs documented.
- System: 8–12 infographics (mix artistic + code), full social kits per major artifact.
- Management: All assets tracked in registry + plan. Zero drift. Easy extension.
- Overall: ~150-200 curated high-quality assets. Every surface feels premium and intentional.

**Success Criteria (Gate Before Shipping Any Visual)**
- DNA match (palette, lighting, motifs, dual-tone rules from this doc).
- Premium execution (no slop, artifacts, weak composition).
- Correct tier (Sovereign for authority, chibi for personality/engagement).
- Technical excellence (performance, responsive, alt, no shift).
- Perfect content fit + clean integration (preferably via queen-visuals.ts).
- Extensible and documented.
- Brand coherence across the system.

**Star Guardian-inspired Tier (2026-06-26 addition)**:
Additive layer fusing Riot Star Guardian splash polish (four-pointed star emblems, iridescent ribbons, luminous magical-girl cinematic from Ahri/Lux/Syndra/Kai'Sa references) with Starlight Queen DNA.
- Sovereign: dynamic 16:9 splash heroes (leader, prestige, action, group).
- Codex: 1:1 premium-cute chibi for agent personality (Soraka/Lux hybrid likeability).
- Strict: four-pointed stars (force in prompt), soft ethereal glow/rim, sophisticated elegance, swarms as elegant familiars, palette harmony on #060609 + violet/cyan.
- Full research + 10 refined prompts + eval loop: `brand-assets/prompts/visuals/STAR_GUARDIAN_STARLIGHT_PROMPTS.md`.
- Workflow: image_gen or image_edit on 98/71/84 bases → excellence-next/star-guardian/ (sg-*.jpg) → curate → promote (numeric or thematic) → update queen-visuals.ts + plans.
- Wiring targets: /queen (phase comparisons + motion), brand-lab grids (Sovereign / Codex / StarGuardian tabs), social kits, infographic mood, Codex diversity.
- Good for: high-contrast elegant variety while staying on-brand.

Use excellence gates (visual QA, design-review mindset). Only ship what would make the "best of best teams" proud.

**Instructions for Future Agents & Upper-Coating Systems**
- Before any visual work: Read this full DESIGN.md + brand-assets/VISUALS_MANAGEMENT.md + the prompts in brand-assets/prompts/visuals/.
- Always respect dual-tone and scopes.
- Use excellence-next for staging.
- Update the registry and plans on every promotion.
- For new agents: First define motif in DESIGN.md, then generate chibi + optional 3D bust using the prompt libraries.
- Load the imagine skill for every image_gen/image_edit call.
- When in doubt, default to curation of existing excellence over new low-quality volume.
- Document reasoning here so the system compounds.

**Built on SIP**

(End of DESIGN.md — this is a living constitution. Expand with examples, new motifs, and links as assets land. Future agents: start here and in VISUALS_MANAGEMENT.md.)
