# Technology lanes

Verify current versions, documentation, licenses, and repository compatibility before installation. The lane is selected by the interaction job, not by novelty.

## Research and direction

- **Refero** — default live design evidence for styles, real product screens, and user flows. Extract principles and preserve provenance; never copy a composition or treat search output as canon. MCP: `https://api.refero.design/mcp`.
- **Owned repository evidence** — product states, media, analytics, tokens, and existing components outrank external inspiration.

## Interface foundation

- Preserve the project's framework. For established Starlight portfolio repos, prefer compatible stable Next.js, React, TypeScript, and Tailwind versions already selected by the repo.
- Use semantic HTML and platform CSS first.
- Use **shadcn/ui** as an owned-code distribution layer and **Radix UI**, **Base UI**, or **React Aria** primitives when their accessibility and behavior fit the project.
- A shared Starlight registry may distribute owned tokens, primitives, sections, hooks, and rules. Third-party registry items never enter it unless redistribution rights explicitly permit that.

## Aceternity UI

Use Aceternity as a recipe source for a selected interaction or composition—not as a theme. Inspect the code before installation and replace demo content, tokens, type, spacing, motion, and imagery.

Project registry configuration:

```json
{
  "registries": {
    "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
  }
}
```

Inspect before adding:

```bash
npx shadcn@latest view @aceternity
npx shadcn@latest search @aceternity -q "<job>"
npx shadcn@latest add @aceternity/<component>
```

Free and purchased items may have different or item-specific terms. Record the item URL and license evidence. Aceternity's commercial license permits end products and modification but prohibits redistribution of source items and template/marketplace resale.

Reject the familiar AI-site defaults unless the chosen direction truly requires them: decorative aurora, beams, meteors, gratuitous bento grids, auto-scrolling logo strips, glowing borders, pointer followers, and typewriter copy.

## Motion decision ladder

1. **CSS / platform APIs** — hover, focus, simple reveal, view transitions, and scroll-driven effects when browser support and fallbacks are adequate.
2. **Motion for React** — component state, layout, presence, gesture, spring, and interruptible UI animation. It is MIT-licensed; import from `motion/react`.
3. **GSAP + `@gsap/react`** — multi-element timelines, ScrollTrigger choreography, complex SVG/text sequencing, pinning, or deterministic cinematic control. Use `useGSAP()` with scoped cleanup. GSAP's Standard License covers ordinary commercial use at no charge but is not an MIT code-redistribution grant; reverify exceptions before productizing animation tooling.
4. **Three.js / React Three Fiber / Spline** — only when spatial interaction or authored 3D is central to the experience thesis and a static/mobile fallback exists.

Do not make two animation systems own the same element/property. Each motion system needs a named job, bundle justification, reduced-motion posture, teardown behavior, and frame/performance inspection.

## Selection tests

Choose a dependency only when it wins against native code on at least one structural dimension: accessibility, interaction correctness, authoring leverage, runtime performance, maintainability, or signature expression. Reject it when its primary contribution is recognizable decoration.

## Canonical sources

- Refero Styles: https://styles.refero.design/
- Refero MCP skill: https://github.com/referodesign/refero_skill
- Aceternity components and CLI: https://ui.aceternity.com/components and https://ui.aceternity.com/components/cli
- Aceternity license: https://ui.aceternity.com/licence
- shadcn registry: https://ui.shadcn.com/docs/registry
- Motion: https://motion.dev/ and https://motion.dev/docs/react
- GSAP license and React integration: https://gsap.com/community/standard-license/ and https://gsap.com/resources/React/

Last verified: 2026-08-30.
