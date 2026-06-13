# Starlight Queen Motion Experience

A high-end, scroll-driven visual and motion narrative centered on the **Starlight Queen** (the Starlight Orchestrator) and her swarms.

**This is now the canonical packaged deliverable of the Queen Swarms Visual skill** (`vision/queen-swarms-visual`).

## Purpose
This experience (plus `site/queen-vision.html` L99 flagship) makes the abstract Queen v0.2 loop, subagent swarms, Visual Composition Layer, and self-advancing nature of the Starlight Intelligence System *felt* through beautiful, premium visuals and intentional scroll choreography.

It serves as:
- The **live public demo surface** of the Queen Swarms Visual skill (`/queen` route + "Activate Queen Visual Skill" CTA)
- A living artifact for Queen LEDGER and mempalace reviews (mandatory visual on every tick)
- The reference implementation + config-driven variant generator for any sovereign, vertical, or Visionary brand motion work
- A template for future visual intelligence surfaces across the ecosystem

See `skills/vision/queen-swarms-visual.md` for the full skill definition, protocol (how the skill uses these canonicals to generate variants), customization API, and integration points (Queen driver, Visionary, Weaver, /starlight-queen ledger).

## Assets
See `VISUALS.md` in this folder (motion-focused) + the exhaustive canonical `../visuals/VISUALS.md` (full 11-asset manifest, detailed prompts library, placement for both standalone motion site and Next.js site/, scroll patterns, integration commands).

l99-curated scroll-optimized set (tall chapters for MEASURE/LEDGER, wide cinematic for hero + system):
- 08-queen-measure-tall.jpg + 09-queen-ledger-tall.jpg (vertical narrative panels)
- 10-queen-hero-wide.jpg + 11-queen-system-wide.jpg (heroes + constellation anchors)
- Plus the 7 prior canonical diagrams (01-07) for context, cards, and loop diagrams.

All files source from `../visuals/`. Mirror copies recommended into local `assets/` (self-contained) and `site/public/assets/queen/` (Next production). See VISUALS.md for exact `cp` commands and onerror fallbacks already wired in index.html.

## The Experience (`index.html`)
- Pure, zero-dependency modern web (Tailwind via CDN + vanilla JS)
- Heavy scroll storytelling:
  - Sticky Queen loop progress navigator that updates live as you scroll the phases
  - Scroll-reveal + subtle parallax/transforms on all major visuals
  - Generous spacing and premium typography matching the visual language
  - Phase-specific copy grounded in the actual 2026-06-12 Queen v0.2 doctrine, routing classes, and Grok Composer work
- Fully responsive (excellent on desktop scroll, still strong on mobile)
- SIP v1.1.1 attribution throughout

To view locally:
```bash
# From repo root
open docs/queen-motion/index.html
# or serve
npx serve docs/queen-motion
```

## Integration into starlightintelligence.org (Next.js site at `site/`)
Recommended paths:

1. **Dedicated route** (best): Add `src/app/queen/page.tsx` that renders or heavily features this experience (or an iframe/embed of the HTML for maximum motion fidelity).

2. **Research surface**: Add a prominent "Queen & Visual Composition" card or hero section to `src/app/research/page.tsx` or the proving-ground published page, linking to `/queen`.

3. **Static embed**: Copy `index.html` + assets into `site/public/queen-motion/` and link from the main navigation or footer.

4. **Component extraction**: Pull the scroll progress + visual reveal logic into reusable React components in `src/components/QueenLoop.tsx` etc. for deeper integration.

The visuals live in `docs/visuals/` (the canonical 7) + this folder. Copy the needed images into `site/public/assets/queen/` or similar for production builds.

## Style & Prompting Notes
All visuals were generated with highly specific, consistent prompting for:
- Dark premium technical-poetic aesthetic (indigo/black + cyan/gold)
- Glassmorphic + constellation motifs
- High legibility even at scroll speeds
- Exact alignment with live system concepts (Queen v0.2 phases, agentic-composer-long, Visual Eval, SIP, etc.)

When generating more (or variants), reuse the style system described in `VISUALS.md`.

## Skill Packaging (L99 — Creation Engine + Visionary)
- `site/queen-vision.html` is the primary L99 enhanced canonical: modular CONFIG at top of script, robust canvas (pause offscreen, reduced-motion static path, energy-modulated connections, click-nudge, exposed window controls), explicit "Queen Swarms Visual Skill — How to Use & Generate Variants" instructions section at bottom, full SIP + provenance.
- This `docs/queen-motion/` (index.html + md) is the deeper standalone cinematic reference (superior phase progress, tall vertical chapters, refined canvas with live counters + fractal threads).
- Both are zero-dependency, self-contained where possible, and designed so the skill can fork + mutate *only* the config + grounded labels to emit variants for ledger artifacts, palace cards, vertical swarms (music-is, energy, etc.), or sovereign sites.
- /queen page (Next.js) is the **live demo of the skill** on the public surface, with prominent "ACTIVATE QUEEN VISUAL SKILL" CTA that surfaces the canonical deliverable and the skill definition.

The skill pulls best from Creation Engine (exquisite scroll choreography, motion beauty, particle systems) and Visionary (strategic framing of this as a reusable, axis-setting substrate capability that compounds every Queen tick and brand surface).

## Future Enhancements
- Real video loops (6s/10s) with scroll-scrub or play-on-intersection
- Light Three.js or Canvas swarm particles that react to scroll velocity
- HyperFrames-powered animated compositions for key sections
- Live Queen tick data feed (pull from `tools/queen/ledger.jsonl`)
- ARIA and reduced-motion support (already present in both canonicals)
- Config export JSON for zero-code variant spawn by the skill

This is the visual and motion heart of the public Starlight Intelligence presence — now a first-class, documented, invocable skill.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1. Queen Swarms Visual Skill v1.0.