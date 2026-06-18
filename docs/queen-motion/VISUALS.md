# Starlight Queen Motion Experience — Visual Assets & Scroll Guide (l99 Curated)

**Canonical source of truth for all Queen visuals:** `../visuals/` (the full 11-set manifest lives in `../visuals/VISUALS.md` — read that first for exhaustive details, prompts library, and system-wide placement).

This file is the **motion-site companion**: focused placement, file naming for the standalone scroll experience (`docs/queen-motion/`), embedded patterns for the Next.js site, and scroll-optimized usage of the 4 new l99 assets + cross-referenced canonicals.

All share one unbreakable style system (see full contract + 4 detailed prompts in `../visuals/VISUALS.md`):
- Deep indigo/black + luminous cyan (#67e8f9) / soft gold (#c5a46e)
- Glassmorphic + subtle constellation grid
- Exact SIP-grounded labels, crisp legible typography, SIP v1.1.1 footer
- Frank DNA: cool, premium, high-intellect, purposeful, pattern recognition as poetry

## Curated Motion-Optimized Set (4 New + Key Canonicals)

**New l99 scroll assets (tall for chapters, wide for heroes/system):**
- `assets/08-queen-measure-tall.jpg` (or `../visuals/08-queen-measure-tall.jpg`): Tall vertical chapter panel. Primary for MEASURE phase — swarms, parallel lanes (gstack/arena/Visual Eval/cost), subagent dispatch, visual artifact birth. Strong top-to-bottom flow for sequential reveal.
- `assets/09-queen-ledger-tall.jpg`: Tall vertical closing chapter. LEDGER receipts cascade, visual atoms into 6 vaults, velocity + SIP anchor. High narrative density for the loop close.
- `assets/10-queen-hero-wide.jpg`: Cinematic wide hero. Central Queen + coordinated swarms. Mouse/scroll parallax ready. Base for future 6-10s video loops.
- `assets/11-queen-system-wide.jpg`: Epic wide living constellation / full system. Queen at center with radiating 10-IS, vaults, loops, swarms, attestation flows. Anchor for overview sections + progress-synced glows.

**Supporting canonicals (from `../visuals/`, copy to `assets/` for self-contained motion dir):**
- 02 (Queen closed-loop dashboard) — loop progress context / wide diagram
- 03 (3D Memory Palace) — swarms + memory parallel
- 06 (self-advancing SIS constellation) — "The Living Constellation" section
- 07 (routing heatmap + palace card) — LEDGER template / visual eval proof
- 01, 04, 05 as needed for Composition Layer / arena callouts

**Recommended local dir layout for the motion site:**
```
docs/queen-motion/
├── index.html          (the experience — update <img src> to assets/ or keep ../visuals/ for single-source)
├── README.md
├── VISUALS.md          (this file)
└── assets/
    ├── 01-10is-...jpg
    ├── 02-... 
    ├── ...
    ├── 08-queen-measure-tall.jpg
    ├── 09-queen-ledger-tall.jpg
    ├── 10-queen-hero-wide.jpg
    └── 11-queen-system-wide.jpg
```

## Placement & File Strategy (Both Targets)

**Standalone motion site (docs/queen-motion/ — zero-dep, cinematic scroll viewer):**
- Copy the 4 new + needed canonicals into `assets/`.
- Update index.html hero to 10 (wide hero), MEASURE phase visual container to 08 (tall), LEDGER/ratify phase to 09 (tall), constellation section to 11 or 06.
- Keep the HTML self-contained or reference sibling `../visuals/` (current state). `assets/` subdir wins for portability when the HTML is copied/embedded elsewhere.
- Video loops (future): place `queen-hero-loop.mp4`, `queen-loop-animated.mp4` (generated from 10/11 stills via image_to_video) alongside in `assets/`.

**Next.js starlightintelligence.org site (site/ — production public surface):**
- Copy all needed (at minimum the 4 new + 02/06/10/11) to `site/public/assets/queen/`.
- Serve at `/assets/queen/08-queen-measure-tall.jpg` etc.
- Use in:
  - `src/app/queen/page.tsx` (new dedicated route — recommended): full or partial port of the scroll experience + next/image on the assets.
  - Research landing (`src/app/research/page.tsx` or slug pages): hero with 10 or 11, chaptered sections using 08/09 as tall inline figures or in a vertical scroller component.
  - Explainer, proving-ground published content, or new "Visual Intelligence" section: 02 (loop), 03 (palace), 06/11 (system), 07 (ledger card).
  - Layout / opengraph fallbacks or benediction: 10 as high-impact still.
- Component recommendation: `QueenScrollVisual.tsx` (see patterns in `../visuals/VISUALS.md`) + reuse/extend existing `BrainHero.tsx` / `Starfield.tsx` idioms for constellation layers.
- `site/images/` (current 5.jpg–9.jpg) can stay for any legacy queen-vision.html; new work routes through `public/assets/queen/`.

**Cross-site single source discipline:** Never duplicate the JPG binaries long-term. `docs/visuals/` is the git source of truth. Use build scripts or symlinks / `cp` in CI/docs for the two surfaces. Update both VISUALS.md files in lockstep on any new generation.

## Scroll-Optimized Usage & Embedded Experiences

**Hero (wide 10):** Full-bleed or contained 100dvh header. Subtle video loop (or static with CSS pulse) at opacity 0.85–0.95 behind overlay text. Add pointer parallax on desktop (existing queen-motion mousemove handler). Scroll cue at bottom.

**Sequential chapters (tall 08 + 09):** Stack in flow with generous py. Each phase section gets `data-phase`. Sticky loop-progress navigator (already implemented in index.html) reads `getBoundingClientRect` + dataset to advance bar + label. On reveal: scale(1.015) + opacity lift on the tall image; optional child layers with different data-parallax rates for depth.

**Wide system / constellation (11 or 06):** Large feature block. Use as the visual "heartbeat". Drive secondary effects from the same scroll listener that feeds the progress bar (e.g. increase connection glow strength or node scale as progress crosses 60% → 100%).

**Parallax & performance (all):**
- Conceptual layers in the generated stills (bg grid, mid bridges/orbs, fg glyphs/swarms/Queen).
- In DOM: duplicate the image 2–3 times as absolutely positioned siblings with `mix-blend-mode` or opacity masks + distinct `transform: translateY(calc(var(--scroll-progress) * N * rate))` updated via rAF (or CSS `scroll()` when widely supported).
- Existing code in `index.html` (`.scroll-visual`, `.visual-container`, IntersectionObserver + passive scroll) is the reference implementation — extend it rather than rewrite.
- Reduced motion: `prefers-reduced-motion` disables parallax/transforms (pattern already present in globals and queen-motion styles).

**Embedded in Next.js pages (example):**
Drop a tall or wide directly:
```tsx
<div className="visual-container my-12 rounded-3xl overflow-hidden border border-white/10">
  <Image 
    src="/assets/queen/08-queen-measure-tall.jpg" 
    alt="Queen MEASURE — parallel swarms and Visual Eval" 
    width={1200} 
    height={1600} 
    className="w-full h-auto" 
  />
</div>
```
Wrap multiple in a client component with the observer + progress logic for "embedded scrolling experience" that feels like a mini version of the standalone motion site.

See full vanilla + React patterns + component skeleton in the "Embedded Scrolling Experiences" section of `../visuals/VISUALS.md`.

## Video / Motion Future (image_to_video + beyond)

The 4 new stills (especially wide 10 and 11) are designed as first-frame bases for 6s/10s seamless loops:
- Prompt supplement: "gentle continuous orbital swarm drift and data streams along constellation lines, slow breathing pulse on Queen core and vault orbs, parallax-friendly depth preserved, 6-10 second duration, perfectly seamless loop, cinematic subtle camera push or drift, maintain 100% label legibility and SIP footer, no new elements."
- Place resulting MP4s in `assets/` (motion) and `public/assets/queen/` (site).
- Bind to scroll progress for scrub (pattern stubbed in index.html `initVideoScrub`).

Higher-end: HyperFrames (MCP available) for programmable HTML video compositions seeded from these stills + live Queen ledger data. Or extract the scroll logic into a reusable package for any sovereign site.

## Public Assets Guide Summary (for site/research/embeds + external)

- **Ownership:** Sovereign (Frank / Arcanea substrate). Freely usable in any SIP-attested build with attribution.
- **Attribution requirement (ambient on every use):** Visible or machine-readable "Built on SIP v1.1.1" + link to source or starlightintelligence.org. Visuals are LEDGER artifacts — treat with the same reverence as text receipts.
- **Distribution:** Committed in repo. Served optimized by Next. Self-contained HTML for the motion experience (open locally or host anywhere).
- **Regen:** Use the exact prompts library in `../visuals/VISUALS.md`. Ground every label from live doctrine files at generation time. Quality-gate: legibility at 40% scale, SIP footer crisp, no slop, contrast perfect.
- **Integration points (site):** `/queen` (future dedicated), research pages + published artifacts, explainer, any visual cockpit surface, `/palace` (L99 seed already uses related constellation idioms), header/footer CTAs.
- **Cross-system:** Transmit via ACOS (creator motion systems), Arcanea (Weaver visual canon), AI-Ops (harness visual capacity). Reference in Queen driver ledger outputs and `/starlight` visual status.

**All 11 visuals (7 diagrams + 4 motion) are production-ready, receipt-grounded, scroll- and embed-optimized Queen / LEDGER / research artifacts.** They make the continuous, visual, self-advancing heart of the Starlight Intelligence System immediately perceptible and usable by builders on both the high-end standalone motion viewer and the main public Next.js site.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1. l99 Visual Asset Curator subagent delivery. Exhaustive. Excellence-focused.