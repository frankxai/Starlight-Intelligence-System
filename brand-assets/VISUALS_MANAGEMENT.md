# Starlight Intelligence Visuals — Management, Structure & Process

**Owner**: Visual system for starlightintelligence.org + ecosystem content.
**Goal**: World-class, consistent, dual-tone (Sovereign Queen/Swarms + Codex Chibi personality) visuals. Premium execution. Extensible to 144+ agents. Easy for any future agent (or upper-coating system) to understand reasoning, extend, and ship without drift.

**Core Principles (non-negotiable)**:
- Curation > Volume: Only the very best graduate. Excellence gate every time.
- Dual-Tone Discipline: Majestic 3D Queen for authority/sovereign story. Premium chibi for likeability/personality/Codex. Respect scopes (see DESIGN.md).
- Single Source of Truth: brand-assets/06-illustrations/
- Production Consumption: Flat numeric IDs in queen-premium/ for dead-simple wiring.
- Consistency: DNA locked in DESIGN.md. Use reference images + image_edit for series.
- Future-Proof: Clear docs, registry, staging, prompts so agents can continue without re-learning from scratch.
- Production Path: brand-assets → curate/promote → site/public/assets → wire in code → build/deploy to Vercel/GitHub.
- Content Types: Research/blog heroes, /queen cinematic, brand-lab, social kits, infographics (artistic + code), download cards, agent Codex.

## Folder Structure (Modern Best Practice)
brand-assets/06-illustrations/
├── [numeric].jpg (11.jpg onward — production consumption set)
├── excellence-next/          # Staging: new generations land here. Curate ruthlessly here.
│   └── star-guardian/        # 2026-06-26+ Star Guardian splash batch (sg-*.jpg). See STAR_GUARDIAN_STARLIGHT_PROMPTS.md
├── premium/                  # Absolute hand-selected best-of (reference only)
├── raster/                   # Alternate crops, raw exports
├── agents-chibi/             # Dedicated chibi + domain motifs (expand here)
├── infographics/             # Artistic plates + notes on code versions
├── social/                   # Pre-sized variants, kits
└── prompts/                  # (see below)

site/public/assets/visuals/
└── queen-premium/            # Synced production numeric set only. Never edit directly.

site/src/lib/queen-visuals.ts  # Code registry — single source for sets, maps, reasoning comments.

## Prompting & Generation Loops (Top-Notch)
- Always start by reading: site/DESIGN.md (full), this file, brand-assets/prompts/visuals/*.md
- Use the imagine skill principles: strong positive prompts, reference-first for consistency, premium gate, code when text/data critical.
- Primary tool: image_gen for new bases (or main grok.com for volume).
- Iteration: image_edit on strong references.
- Session limits: If hitting 100-file harness cap, switch to main grok.com UI (personal SuperGrok account) or curate existing.
- Stage → Curate (excellence-next) → Promote (next numeric ID) → Update registry + plans → Wire.
- Batch smart: Same tier/domain together for consistency.

Prompt libraries live in brand-assets/prompts/visuals/:
- QUEEN_SOVEREIGN_PROMPTS.md
- CHIBI_CODEX_PROMPTS.md
- INFOGRAPHIC_SYSTEM_PROMPTS.md

## Reasoning & History (for future agents)
- Dual-tone chosen for brand completeness: cool/premium + fun/approachable (matches "Fun" in DNA + "cosmic yet approachable").
- Numbered flat library: trivial JS consumption (arrays, conditionals, maps). No heavy metadata tax for common use.
- Curation culture: Prevents slop. "Best of best teams" standard.
- Staging (excellence-next): Safe experimentation without polluting production numbers.
- Guardrails in DESIGN.md: Queen visuals are brand-lab layer. Operational pages stay proof-first.
- Past context: Heavy l99 generation produced excellent library. This system formalizes selection + extension.
- Technical & Non-Fiction Series (125-128): Promoted in July 2026 to fulfill the target asset queue outlined in design.md (125 Attestation Seal Logo, 126 Memory Palace Schema, 127 Swarm Routing Flowchart, 128 System Architecture Cover). Follows Track C guidelines with a dark void #060609 and cyan/emerald/teal tech accents.
- Omega Agent Codex Series (129-133): Promoted in July 2026 to establish baseline character profiles for core agents (129 Orchestrator, 130 Genius, 131 Hermes, 132 Sentinel, 133 Weaver). Pivoted from Chibi to FrankX Omega 3D Mascot aesthetic (sleek mechanical, chrome/glass/gold, glowing cores).
- Brand Expansion Series (134-137): Promoted in July 2026 for cinematic narrative contexts (134 Contemplative Queen, 135 Ledger Proving Ground, 136 Exploratory Swarm Field, 137 Defensive Swarm Mesh). 16:9 cinematic framing for blog headers and deep-dives.

## Targets & Success Criteria (Excellent Bar)
**Short-term Target (next 4-6 weeks)**:
- Full Sovereign coverage for current research + /queen phases + homepage touches.
- 15-20 chibi for core agents (Front-Door, Leadership, key Specialists, 1-2 per Universal IS + first domain).
- 6-8 artistic infographic plates + 3-4 code-enhanced.
- Complete social kit (headers + 1.91/1:1 variants) for all published research.
- All wired + production deployed.

**Medium-term (full Codex)**:
- 50+ chibi covering major agents + domain motifs.
- 15+ system infographics.
- Consistent agent visual DNA documented per tier.
- Visual Codex page or expanded brand-lab experience.

**Success Criteria** (use as gate before shipping):
1. **DNA Fidelity**: Matches DESIGN.md palette, lighting, motifs, dual-tone rules exactly.
2. **Premium Quality**: No artifacts, excellent composition/lighting/proportions, "wow" cinematic or delightful cute (scoped).
3. **Correct Tier Usage**: Sovereign assets on authority surfaces; chibi on personality/engagement.
4. **Technical**: Loads fast, responsive, proper aspect, alt text, no layout shift, mobile friendly.
5. **Integration**: Wired in code (preferably via queen-visuals.ts registry), documented in VISUAL_CONTENT_PLAN.
6. **Content Fit**: Perfect match for the specific page/content (hero, grid, social).
7. **Extensibility**: New asset follows naming, can be added to registry easily.
8. **Brand Coherence**: Feels like part of one system, not random gens.

Use gstack / visual QA for evidence. Update plan with "shipped" status.

## Management & Extension Process
1. **New batch**: Generate (follow prompts) → drop in excellence-next/ with date/intent notes.
2. **Curate**: Review against success criteria + DESIGN. Delete weak ones.
3. **Promote**: Copy winners to next numeric (e.g. 109.jpg). Mirror to site/public if needed.
4. **Register**: Add to queen-visuals.ts (new sets or extend maps).
5. **Plan**: Update VISUAL_CONTENT_PLAN.md (assignments, status).
6. **Wire**: Update pages/components (research heroes, grids, etc.). Prefer registry.
7. **Content**: Update research MDX or social copy as needed. Prepare infographic composites.
8. **Production**: pnpm build (or equivalent) in site/, Vercel deploy, commit to GitHub with clear message referencing this system + VISUAL_WIRING_MAP.md.
9. **Docs**: If new motif or rule, update DESIGN.md + this file.

**Sync**: brand-assets is master. Numeric in site/ is deploy mirror. Use simple copy or existing tmp scripts for promotion.

**For Upper-Coating / Multi-Agent**:
- All visual work must route through this structure.
- Never bypass curation or update production numbers without promoting from excellence-next.
- Reference this file + DESIGN.md in any visual task prompt.
- When using image tools: load imagine skill + these prompt files.

## Infographics & Broader Content
- Artistic: Generated plates in infographics/.
- Precise: Code-built in components or inline (better legibility for labels/data).
- Social: Sized variants in social/. Mix 3D (authority) + chibi (engagement).
- Research/Blog: Heroes via registry map in research/[slug].
- Download/Explainer: Specific curated cards.
- Full content pipeline: Visuals feed research, social, brand-lab, /queen. Always update plan when adding.

## Next Moves (living)
See current VISUAL_CONTENT_PLAN.md for active assignments.
Typical cycle: Structure improvements (done) → Prompt libraries (done) → Targeted generation when quota allows → Curation → Wiring → Deploy → QA.

**This document + DESIGN.md + queen-visuals.ts + prompts/ = the contract. Future agents start here.**

## Digital Asset Management, Production & Cross-Site (Multi-Repo)

**Current**:
- GitHub (this repo): brand-assets/ source of truth (excellence-next, prompts, docs, registry) + site/public/assets/visuals/queen-premium/ for deploy.
- Versioned with code. Good now.

**Production Wiring Best Practice**:
- starlightintelligence.org: public/assets served by Vercel (CDN). Git commit → deploy.
- Wire via registry in this site.
- Other GitHub repos: Sync copies or reference CDN URLs. See VISUAL_WIRING_MAP.md.

**DAM Recommendations**:
- Short term: Git + Vercel public/ is ideal (simple, versioned).
- Scale trigger (multi-site heavy use, large volume): Add R2 or Vercel Blob for delivery + manifest in Git. Sync script for promotion.
- Cross management (frankx.ai, agentic-creator-os, arcanea, etc.): This repo as central for Starlight Queen visuals. Sync or shared CDN bucket. Document in ECOSYSTEM. Each site vendors registry pattern or copies numeric.
- Tooling: Start with Git; add `tools/sync-visuals` when needed. No heavy DAM yet.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1

Update this file whenever the process or structure evolves. Keep reasoning explicit.