# Narrative export fonts

The seven standalone SVG exports embed the same Latin variable font families used by the site: Inter and Newsreader. These WOFF2 files were copied from the local Next.js build produced by `next/font/google` on 2026-09-23. Keeping them with the SVG generator makes the exported typography portable across presentation and social tools.

- Inter upstream: https://github.com/google/fonts/tree/main/ofl/inter; license in `inter-OFL.txt`.
- Newsreader upstream: https://github.com/google/fonts/tree/main/ofl/newsreader; license in `newsreader-OFL.txt`.

The fonts are visual assets, not evidence of product capability. Regenerate exports with `node site/scripts/export-next-era.mjs` from the repository root.
