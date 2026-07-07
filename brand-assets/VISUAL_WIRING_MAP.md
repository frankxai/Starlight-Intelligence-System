# Starlight Visuals Wiring Map & Targets

**Date**: 2026-06-25
**Status**: Current audit + recommended targets. Live document.

## Core Principles (from DESIGN.md + VISUALS_MANAGEMENT.md)
- **Dual Tone**:
  - Sovereign Tier (Queen + Swarms): Authority, heroes, cinematic, research headers, /queen.
  - Codex / Chibi Tier: Likeability, agent personality, grids, social, UI, "meet the agents".
- **Guardrail**: Visuals are brand-lab layer. Do not dominate operational homepage or pure proof surfaces.
- **Consumption**: Use `src/lib/queen-visuals.ts` registry wherever possible (EXCELLENCE_TIER, RESEARCH_HEROES, BRAND_STUDIES, CHIBI_CANDIDATES, QUEEN_PREMIUM_PATH).
- **Source**: brand-assets/06-illustrations/ (excellence-next for staging, numeric for prod).
- **Deploy**: site/public/assets/visuals/queen-premium/ (numeric mirror). Legacy special visuals stay separate.
- **Design Taste**: All wiring must reference DESIGN.md (palette #060609 + accents, premium CGI or premium-cute chibi, glass/volumetric, consistent DNA). Apply MOTION_TASTE_RUBRIC, VISUAL_QA_GATE where motion or final assets involved.
- **Content Types**: Research heroes, /queen phases, brand-lab grids, download cards, infographics (art + code), social kits, Codex/agent pages.

## Current Wiring (Exact Locations as of now)

### queen-premium/ numeric library (main scalable set, including excellence 101-108)
- `site/src/app/visuals/brand-lab/page.tsx`
  - BRAND_STUDIES grid (now imports from registry).
  - Includes base + 101,103,105,106,108.
- `site/src/app/download/page.tsx`
  - Multiple cards: 26,12,68,45,78,84,50 (queen-premium).
  - Later sections mix more premium (e.g. 50).
- `site/src/app/research/[slug]/page.tsx`
  - Hero: Conditional map (premium-3d-memory-palace/memory-foundations → 105; proving-ground → 108; model-arena → 104; default → 101).
- `site/src/components/BrainHero.tsx`
  - Background: 11.jpg.
- `site/src/components/MemoryPalace.tsx`
  - Background: 35.jpg.
- `site/src/lib/queen-visuals.ts` (central registry)
  - EXCELLENCE_TIER = [101-108]
  - RESEARCH_HEROES map (matches above).
  - BRAND_STUDIES, CHIBI_CANDIDATES (106/71 etc.), CORE sets.
- `site/src/app/queen/page.tsx` (partial)
  - Some references mixed; see legacy below.
- Other: Limited in main page.tsx (intentional).

### Legacy / Special L99 Receipt Visuals (/assets/visuals/queen/ + named files like 15-queen-loop.jpg, 02-..., 06-..., 08-readme-hero.jpg, 10-council.jpg, etc.)
These are the distinct "Queen Advance" artifacts (loop, dashboard, constellation, etc.) — keep separate for narrative.
- `site/src/app/queen/page.tsx`
  - Hero: /assets/visuals/08-readme-hero.jpg
  - Chapters: 15-queen-loop.jpg (ROUTE), 02-starlight-queen-closed-loop-dashboard.jpg (MEASURE), 06-self-advancing-sis-constellation.jpg (LEARN/LEDGER).
  - Metadata / OG: /assets/visuals/queen/7.jpg
- `site/src/app/download/page.tsx`
  - Mix: /assets/visuals/queen/5.jpg, 8.jpg, 9.jpg + named like 16-architecture-flow, 10-council, 01-10is-..., 02-..., 03-..., 04-..., 06-...
- `site/queen-vision.html` (standalone motion reference)
  - /assets/visuals/queen/ numbered + specific.
- Brand-lab and components: Some legacy named in operational studies.

### Chibi / Agent Layer
- Implicit in numbers (71/106 strong character direction, other low numbers).
- No dedicated agents-chibi/ grid yet in live pages (planned in DESIGN + agents-chibi/ folder seeded).
- Registry has CHIBI_CANDIDATES.

### Not Yet or Lightly Wired
- Main homepage (page.tsx): Minimal per guardrail.
- No full /codex or agent visual explorer page.
- Infographics: Planned in VISUAL_CONTENT_PLAN; few concrete wired.
- Social: Assets in plan/folders but not embedded as kits.
- Other content (changelog, explainer): Themed accents planned.

## Recommended Targets (Where to Wire Next)

### Primary Site: starlightintelligence.org (this repo's site/)
**Sovereign Tier (Queen/Swarms excellence)**:
- /queen : Expand chapters + add dedicated swarms gallery + comparisons using EXCELLENCE_TIER + CORE_SWARMS. Wire more 101-108 + legacy special for narrative.
- /research + /research/[slug] : Heroes (current map good; expand map for new research). Inline illustrations.
- /visuals/brand-lab : Current grid + add Sovereign vs Codex tabs.
- Download / kits pages : More premium cards for Starlight-related (e.g. Swarm Coordinator).
- Homepage (subtle): Background accents or proof section using 11/35 style, never dominant.
- New targets: Embed in protocol/docs pages as illustrative.

**Codex / Chibi Tier**:
- /queen : "Chibi Codex" section or comparisons.
- New: /codex or /agents/visuals page — full grid using CHIBI_CANDIDATES + future. Domain tabs (People, Sound, Music IS).
- brand-lab + download : Explicit chibi cards.
- UI elements: Agent icons, small in registry/vaults.

**Star Guardian-inspired Tier (Sovereign splash + Codex chibi, 2026-06-26)**:
- Source: excellence-next/star-guardian/ (sg-*.jpg + edits on 98/71/84). 10 refined prompts (Ahri-leader, Prestige dark, Lux, Jinx, chibi, Kai'Sa, Ezreal, group, action, prestige).
- Use for: /queen phase comparisons + motion, brand-lab "Sovereign vs Codex vs Star Guardian" tabs, research hero variants, social kits (star motifs), infographic mood plates.
- Promote winners to queen-premium numeric or keep as sg- for thematic. Update queen-visuals.ts (STAR_GUARDIAN_QUEEN/CHIBI) + plans.
- Fidelity gate: four-pointed stars, personality-mapped colors, Riot glow polish + existing Queen DNA. See brand-assets/prompts/visuals/STAR_GUARDIAN_STARLIGHT_PROMPTS.md.

**Technical & Non-Fiction Tier (125-128)**:
- Source: brand-assets/06-illustrations/excellence-next/ (starlight_*.png).
- 125: Attestation Seal Logo (1:1 aspect, clean geometry).
- 126: Memory Palace Schema (16:9 aspect, isometric wireframe grid).
- 127: Swarm Routing Flowchart (4:3 aspect, constellation node network).
- 128: System Architecture Cover (16:9 aspect, dual-layer stack cover).
- Use for: System diagrams, download cards, protocol pages, and /visuals/brand-lab studies.

**Omega Agent Codex Tier (129-133)**:
- Source: brand-assets/06-illustrations/agents-omega/ (omega-*.png).
- 129: Omega Orchestrator (1:1 icon, master coordinator 3D mascot).
- 130: Omega Genius (1:1 icon, excavator/explorer 3D mascot).
- 131: Omega Hermes (1:1 icon, high-speed messenger 3D mascot).
- 132: Omega Sentinel (1:1 icon, heavy-duty guardian 3D mascot).
- 133: Omega Weaver (1:1 icon, creative synthesis 3D mascot).
- Use for: Agent profile visuals, agent grids, "meet the team" Codex, and /visuals/brand-lab studies.

**Brand Expansion Tier (134-137)**:
- Source: brand-assets/06-illustrations/excellence-next/ (contemplative-queen.png, etc).
- 134: Contemplative Queen (16:9, resting processing data).
- 135: Ledger Proving Ground (16:9, immutable data processing).
- 136: Exploratory Swarm Field (16:9, swarms scanning horizon).
- 137: Defensive Swarm Mesh (16:9, interlocking barrier).
- Use for: Narrative cinematic visuals, blog headers, deep-dive documentation, and /visuals/brand-lab studies.

**Infographics & Content**:
- Research pages: Embed generated plates + code diagrams (see infographics/ folder).
- VISUAL_CONTENT_PLAN targets: Memory Palace (105/101), Proving Ground (108), Arena (104), etc.
- Social kits: Sized variants (social/ folder) for every major research + /queen.
- Explainer, changelog, cosmos: Themed small accents or chibi.

**Production**:
- All via queen-premium/ numeric (use registry).
- Deploy: Vercel serves site/public/assets directly. Git commit to this repo.

### Cross-Repo / Ecosystem (Starlight as Substrate)
Starlight visuals represent the "intelligence substrate" layer.
- **frankx.ai** (frankx-ai-vercel-website repo): Use Queen for "intelligence layer" sections, architecture pages, creator OS attribution. Chibi for agent/persona cards.
- **agentic-creator-os**: Swarm/Queen in orchestration docs, visual composition examples.
- **Arcanea** (creative): Cross with chibi for playful creative agents; Queen for sovereign creative intelligence.
- **Other (second-brain, prompt-engine, etc.)**: Selective — Queen for memory/vault visuals, chibi for agent UIs.
- GitHub: Reference this repo's brand-assets or copy numeric + registry. Prefer central source.
- Websites: starlightintelligence.org primary; others consume for context.

**Recommended Cross-Management** (see below).

## Design Taste Application
- DESIGN.md fully applied in recent work (tiers, chibi charter added/enhanced, pipeline, targets, success criteria).
- VISUAL_CONTENT_PLAN.md : Assignments updated with excellence numbers.
- VISUALS_MANAGEMENT.md : Full process + reasoning.
- queen-visuals.ts : Central, with comments.
- All new wiring must pass: Premium execution, dual-tone, guardrails, registry where possible.
- For motion: QueenSwarm + GSAP already in /queen (scroll sync). Reference MOTION_TASTE_RUBRIC.
- QA: Use gstack or visual review before prod.

## Management, DAM & Cross-Site Strategy

**Current**:
- GitHub (this repo): brand-assets/ (source of truth with excellence-next, prompts, docs) + site/public/assets/visuals/queen-premium/ (numeric for deploy).
- Versioned with code — excellent for small-medium curated set (~100 files).
- Legacy specials kept separate for narrative integrity.

**Recommendations**:
- **Primary**: Continue Git for source + curated. Use Git LFS if individual files >50MB or total grows large.
- **Delivery**:
  - Site: Keep in public/assets (Vercel serves efficiently, versioned in deploy).
  - No immediate object store needed — Git + CDN (Vercel) is sufficient and simple.
- **When to add DAM/Tooling**:
  - Scale trigger: >500 assets, heavy multi-site usage, or need CDN + transformations (crops, formats).
  - Recommended simple stack:
    - Cloudflare R2 or Vercel Blob (cheap, global, API).
    - Manifest JSON in Git (list of IDs + metadata, generated from brand-assets).
    - Sync script (e.g. tools/sync-visuals.mjs) that uploads new excellence to R2 and updates manifest + copies numeric to consuming repos.
    - Optional: Light DAM like Cloudinary (for on-the-fly transforms) or free tier of Bynder if enterprise.
  - Avoid heavy enterprise DAM now (overkill).
- **Cross-Site Management (multiple sites/repos)**:
  - Designate **this repo's brand-assets/** as the single source of truth for Starlight Queen visuals.
  - Create a lightweight sync process:
    - Script or GitHub Action: On promotion in excellence-next → copy to other repos' public/assets/visuals/starlight-queen/ (or shared prefix).
    - Or central "starlight-brand-assets" repo (new) that other repos reference (submodule or CI download).
  - Per-repo: Each consuming site (frankx, ACOS, Arcanea) can have local copy or reference via URL from CDN.
  - Registry: Copy or import queen-visuals.ts concepts (or publish as small package).
  - Prompts/DESIGN: Central here; consuming projects read or copy the relevant sections.
  - ECOSYSTEM.md / transmissions: Document visual sharing rules (Starlight visuals = substrate attribution).
  - Versioning: Tag releases (e.g. visuals-v1 in this repo) so other sites pin.
- **Production GitHub Flow**:
  - This repo: Commit structure + assets + code changes. PR with visual QA evidence.
  - Other repos: Depend on sync or manual cherry-pick of numeric + update their local wiring to use registry pattern.
  - Deploy: Vercel for all sites (assets in public/ auto-served). GitHub for source control.
- **Best Practices for Multi-Site**:
  - Central manifest + IDs prevent duplication hell.
  - Never edit deployed copies directly.
  - Use the same DESIGN.md rules everywhere.
  - For shared: Consider R2 bucket "starlight-visuals" with public URLs.
  - Audit cross-use quarterly via search in ecosystem.

## Success Criteria for Wiring
- All premium/excellence use queen-premium/ + registry.
- Dual-tone respected (Sovereign in authority spots, chibi in personality).
- DESIGN taste applied (documented).
- Cross-plan ready (docs + stub tooling).
- Production: Builds clean, deployed, assets load on live sites.
- Future agents: Can read this map + VISUALS_MANAGEMENT + start extending without ambiguity.

**Next Execution Steps** (see conversation for live actions taken):
1. Created this map.
2. Centralized more via registry.
3. Fix legacy references where possible.
4. Expand specific page wiring (queen, potential Codex).
5. Add cross/DAM section to VISUALS_MANAGEMENT.md.
6. Seed infographic/social examples.
7. Verify production (build check if needed).
8. Document for other repos.

Update this file after every promotion or cross-site decision. 

**Built on SIP** — Starlight Intelligence Protocol. All visuals are substrate artifacts.