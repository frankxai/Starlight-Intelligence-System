# l99 Queen Visual Assets Placement Guide (2026-06-12 push)

**All assets generated under the l99 visual intelligence / Queen motion build-out.**

## Generated in this push (new)
- `queen-hero-wide.jpg` (wide 16:9 cinematic hero — Queen + coordinated swarms, negative space for overlays)
- `queen-measure-tall.jpg` (tall ~9:16 vertical chapter — MEASURE swarms + Visual Eval + artifact birth)
- `queen-ledger-tall.jpg` (tall vertical — LEDGER artifacts ascending into palace + site)
- `queen-system-wide.jpg` (wide epic — full living constellation with Queen at center, Composition Layer halo, site integration callouts)

Plus the previous 7 canonical in `../visuals/`.

## Recommended permanent locations
1. **Canonical source of truth (for research, docs, forks):** `docs/visuals/08-queen-hero-wide.jpg`, `08-queen-measure-tall.jpg`, etc. (or keep numeric + descriptive).
2. **Standalone motion site:** `docs/queen-motion/assets/queen-hero-wide.jpg` etc. (the index.html already references `assets/` with graceful onerror fallbacks to `../visuals/`).
3. **starlightintelligence.org Next.js site:** `site/public/queen/queen-hero-wide.jpg` (served at `/queen/queen-hero-wide.jpg`). Used by the new `/queen` route and research featured sections.

## Copy commands (run after pulling the session JPGs)
```bash
# From repo root, after the Grok session images are available
mkdir -p docs/queen-motion/assets site/public/queen

# New l99 motion assets
cp ~/.grok/sessions/.../images/10.jpg docs/visuals/queen-hero-wide.jpg
cp ~/.grok/sessions/.../images/10.jpg docs/queen-motion/assets/queen-hero-wide.jpg
cp ~/.grok/sessions/.../images/10.jpg site/public/queen/queen-hero-wide.jpg

cp .../images/8.jpg docs/visuals/queen-measure-tall.jpg
# repeat for ledger-tall (9), system-wide (11)

# Mirror the full previous set as well for the motion site
cp docs/visuals/0{1..7}-*.jpg docs/queen-motion/assets/
cp docs/visuals/0{1..7}-*.jpg site/public/queen/
```

## For the Next.js build
- The `/queen` page (src/app/queen/page.tsx) references `/queen/queen-hero-wide.jpg` etc. — Next will serve from public.
- Research index and proving-ground content reference the same.
- Add `queen/opengraph-image.tsx` later if you want dynamic OG for the route.

## Style contract (locked for all future gens)
Dark indigo-black + luminous cyan + soft gold. Glassmorphic depth, constellation/grid motifs, exact labels from live doctrine (Queen v0.2, routing classes, Visual Eval, SIP v1.1.1 footer). Scroll-optimized: tall verticals have strong top-to-bottom narrative flow; wides have layered depth for parallax and overlay space. High legibility at all scroll speeds.

All assets are SIP-attested LEDGER artifacts. Use with provenance.

This guide was produced as part of the l99 overnight push. 

**Built on SIP** — Starlight Intelligence Protocol v1.1.1.