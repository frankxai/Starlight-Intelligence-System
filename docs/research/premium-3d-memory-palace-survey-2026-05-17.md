# Premium 3D + Memory Palace Design — Reference Survey

**Date:** 2026-05-17
**Author:** Starlight research agent (Opus 4.7 / 1M)
**Scope:** Benchmark survey for the Starlight Intelligence System 3D substrate scene — vault orbs (memory palace) on R3F + drei MeshTransmissionMaterial, glass HUD, postprocessing. Frank's call: "still not really good." This document is research-first; no design verdicts.
**Method:** WebSearch + WebFetch against current (2025–2026) state of the field. Cited inline.

---

## 1. Top Reference Works

### 1.1 Apple Liquid Glass — WWDC25 (iOS 26 / visionOS 26)
What lands: a *digital meta-material* that "dynamically bends and shapes light" rather than a frosted-blur overlay. Real-time refraction + specular highlights tied to **device motion** (not cursor), edge highlights from a computed normal map, and adaptation to surrounding content (light/dark, contrast). Critically: Apple gates it behind **Reduced Transparency / Reduced Motion / High Contrast**, with the spec note that specular amplitude ≤ 6px to avoid vestibular nausea. Reusable: light bending > Gaussian blur; specular as motion-driven, not static gradient; respect contrast modes. ([Apple newsroom](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) · [Meet Liquid Glass — WWDC25 #219](https://developer.apple.com/videos/play/wwdc2025/219/) · [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials))

### 1.2 Linear — "A Linear spin on Liquid Glass" (2025 refresh)
The single best public deconstruction of glass UI from a SaaS team. Linear **explicitly rejected refraction** ("refraction can make dense professional interfaces harder to read"), then rebuilt the look with: Gaussian blur foundation + SDF-modeled rounded rect + a **normal map driving a SwiftUI shader** for specular response + a simulated **moving physical light source** that shifts as you scroll. Their 2025 site refresh also cut color saturation, warmed the gray, shrank icons, and adopted *"structure should be felt not seen."* For Starlight (also dense info), this is the most relevant template. ([Linear · liquid glass](https://linear.app/now/linear-liquid-glass) · [Linear · design refresh](https://linear.app/now/behind-the-latest-design-refresh))

### 1.3 Bruno Simon — bruno-simon.com
Still the most-cited R3F portfolio because the **craft is in restraint**: cartoon-baked materials, a single warm directional light, hand-tuned camera damping, physics that *feels* (Rapier under the hood), and a tiny color palette. He's open about technique through Three.js Journey and the MIT-licensed repo. Reusable for us: trust one strong light + warm rim, ship a *bespoke* shader instead of a stack of generic ones, and accept that **camera motion is 50% of the perceived premium**. ([bruno-simon.com](https://bruno-simon.com/) · [case study](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b) · [GitHub source](https://github.com/brunosimon))

### 1.4 Active Theory — Neon, Halo 5 Visualizer, Adidas CHILE20, Fiomet
Agency-tier moves we can lift directly. **Neon**: tubes isolated to a separate render target → blurred → composited (selective bloom, not global); UV-from-normals texture sampling for "lighting" instead of real lights; light RGB-shifted chromatic aberration; mirrored ground with normal-map-distorted reflection. **Halo 5**: point light tied to cursor distance + directional light from cursor angle = the helmet "knows where you are." **Fiomet**: scroll-velocity-driven border / camera response (motion that responds to *speed of intent*, not scroll position). ([Neon case study](https://medium.com/active-theory/neon-a-webgl-installation-fdf540c42152) · [Halo 5](https://medium.com/active-theory/xbox-halo-5-guardians-visualizer-5b9afcb542f1) · [activetheory.net](https://activetheory.net/))

### 1.5 Studio Freight / Lenis
Lenis itself is 3KB and trivial, but the discipline it represents — **frame-locked scroll** that lets WebGL and DOM share one timeline — is the substrate underneath every premium 3D site in this list. Awwwards SOTM. The takeaway for Starlight isn't to add Lenis; it's that 3D timing must be locked to scroll, not to wall-clock. ([lenis.studiofreight.com](https://lenis.studiofreight.com/) · [Awwwards](https://www.awwwards.com/sites/lenis-2))

### 1.6 Stripe Press — press.stripe.com
Premium *editorial* artifact feel without 3D theatrics: oversized titles in a tight serif, generous whitespace, vivid book covers as the only color source, downloadable zines that make ideas feel physical, dense substantive description over marketing copy. The lesson for vault orbs: treat each orb the way Stripe treats a book — as a **named artifact with weight**, not a category badge. ([press.stripe.com](https://press.stripe.com/) · [Yuin Chien case study](https://yuinchien.com/p/stripe-press))

### 1.7 Vercel — Geist design system
Geist Sans + Geist Mono as a paired display/code system, deliberately Swiss/geometric, anti-Inter by intention. The pre-set Tailwind typography classes (font-size + line-height + letter-spacing + weight bundled) is the right composition unit — not raw font-size utilities. ([Geist typography](https://vercel.com/geist/typography) · [Geist font](https://vercel.com/font))

### 1.8 Raycast + Arc Browser
Raycast: Inter with **ss03 stylistic set on** (single-story `g`) as a brand-typographic tell; 1.6 body / 1.1–1.4 display line-height ladder; +0.1–0.4px tracking; surface ladder #07080a → #101111; hairline 1px #242728 borders; 6–10px radii — saturated color is *rare and categorical only*. Arc: vertical sidebar reclaims premium horizontal space; **Spaces** use distinct linear gradients as identity (purple/pink/cyan), 0.2s easings on state changes, "Little Arc" demonstrates *match interface weight to task weight*. Both are anti-AI-slop because they refuse default densities. ([Raycast DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/raycast/DESIGN.md) · [Arc design analysis](https://blakecrosley.com/guides/design/arc))

### 1.9 NASA Eyes on the Solar System
The reference for "planet-orbit visualization that doesn't feel junky." Why it works: **real data**, real ephemerides, time-scrubbable (1950–2050), comparison side-by-side, perspective + lighting are modulatable. The premium isn't shaders — it's **factuality at every zoom level**. ([eyes.nasa.gov](https://eyes.nasa.gov/apps/solar-system/) · [JPL announcement](https://www.jpl.nasa.gov/news/explore-the-solar-system-with-nasas-new-and-improved-3d-eyes/))

### 1.10 Heptabase whiteboards + Obsidian Canvas
Spatial knowledge UIs that *work*. Heptabase's frame: **every note is a card, every project is a whiteboard, cards exist on multiple whiteboards simultaneously**. Skeuomorphic on purpose — "index cards on a wall with sticky tack." Obsidian Canvas matured into the de-facto plugin pattern. For Starlight, this is the argument that an orb should be the *named container*, not the *category label*; the underlying note appears in multiple constellations. ([wiki.heptabase.com](https://wiki.heptabase.com/version-one) · [Heptabase](https://heptabase.com/))

### 1.11 Awwwards SOTY 2025 winners — Lando Norris site + Messenger
Two patterns converging in 2025–2026: (a) **cinematic scroll-driven** single-3D-object reveal (Lando Norris helmet, OFF+BRAND), bold lime accent on otherwise neutral; (b) **tiny inhabited world** (Messenger — a planet you make deliveries on, console-game feel in-browser). Both reject the "many floating glass orbs" pattern. ([Awwwards SOTY 2025](https://www.awwwards.com/annual-awards-2025/site-of-the-year) · [Orpetron — 3D winners](https://orpetron.com/blog/10-award-winning-websites-bringing-3d-design-to-life/))

### 1.12 Codrops — "Warping 3D Text Inside a Glass Torus" (Mar 2025)
The cleanest current public reference for `MeshTransmissionMaterial` craft: samples default 10 (push higher only with intent), resolution 128–256 produces pixelated artifacts you may want, IOR animated 1.07 → 1.5 to *make the glass breathe*. Read this before next-iteration commit. ([Codrops tutorial](https://tympanus.net/codrops/2025/03/13/warping-3d-text-inside-a-glass-torus/))

---

## 2. Transferable Principles for the Starlight Scene

1. **One strong directional light, not five.** Bruno Simon, Active Theory Neon, NASA Eyes all converge on this. Stack a warm key + cool rim + HDRI ambient at low intensity — never N point lights "to make it pop."
2. **Specular driven by motion, not by time.** Apple's Liquid Glass tracks device motion; Halo 5 tracks cursor; Linear simulates a moving physical light source during scroll. Static animated glints are the AI-slop default. Tie highlights to camera-velocity or scroll-velocity.
3. **Selective bloom, not global postprocessing.** Active Theory isolates emissive objects to their own render target before bloom. Globally bloomed scenes read as "vibe-coded WebGL." Use `EffectComposer` with a `SelectiveBloom` pass keyed on a `layers` channel.
4. **Refraction is not free clarity.** Linear explicitly removed refraction because it harmed dense-info legibility. Vault orbs that *contain* text/data should treat MeshTransmissionMaterial's `thickness` and `chromaticAberration` as a budget — high values look luxurious but make labels unreadable. Default closer to `thickness: 0.2`, `chromaticAberration: 0.02`.
5. **Artifact-first naming.** Stripe Press, Heptabase, Arc Spaces all treat their primary objects as **named artifacts**, not categories. The six vaults are named (Strategic, Technical, Creative, Operational, Wisdom, Horizon) — but they should *appear* as distinct artifacts (different surface character, different weight, different inner content cue) rather than six recolors of the same orb.
6. **Time-scrubbing is premium.** NASA Eyes is premium because you can travel 1950→2050. A memory palace that can scrub through *when knowledge entered* (a timeline ring, a session-time scrub) inherits that gravitas — and matches our existing `memory/knowledge-graph/rollup/` dates.
7. **Frame-locked scroll, not wall-clock animation.** Lenis-discipline. Every reveal, every camera move, every halo state-change should bind to a scroll position or an input event — never to a `useFrame` ramp that runs unconditionally.

---

## 3. Three Specific Technique Tips (code-level)

### 3.1 MeshTransmissionMaterial preset for "named artifact" (not generic blob)
Based on drei docs + Codrops + the Linear "subtract refraction for legibility" principle:

```tsx
<MeshTransmissionMaterial
  transmission={1}
  thickness={0.25}            // not 1.0 — preserves inner legibility
  roughness={0.05}            // tiny, but non-zero — pure 0 reads as plastic
  chromaticAberration={0.02}  // half the drei default 0.03
  anisotropicBlur={0.1}
  distortion={0.08}           // low — high = "AI demo"
  distortionScale={0.4}
  temporalDistortion={0.08}   // gentle, ties to camera motion
  ior={1.15}                  // animate 1.07 → 1.5 on hover to "breathe"
  samples={8}                 // up from 6 default; 16+ only for hero shots
  resolution={256}            // 256 is the sweet spot; lower = pixelated artifact
  backside={false}            // turn on only for hero orb, expensive
/>
```
Source: [drei docs](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material) · [Codrops](https://tympanus.net/codrops/2025/03/13/warping-3d-text-inside-a-glass-torus/)

### 3.2 Lighting rig — Bruno Simon × Active Theory pattern
- HDRI environment at `intensity 0.4–0.6` (not 1.0) — ACES tone mapping in renderer.
- ONE directional light, warm (`#ffe5cc`, intensity 1.2), elevated, casting a soft contact shadow.
- ONE cool rim light (`#7da3ff`, intensity 0.3) from behind to separate orbs from background.
- Per-orb point light **only** tied to cursor proximity (Halo 5 trick) — fades to 0 at distance > 3 units; gives orbs "awareness."
- Renderer: `toneMapping: ACESFilmicToneMapping`, `outputColorSpace: SRGBColorSpace`, `toneMappingExposure: 1.0` (tune per HDRI, not global multiplier).

Source: [Active Theory Neon](https://medium.com/active-theory/neon-a-webgl-installation-fdf540c42152) · [Active Theory Halo 5](https://medium.com/active-theory/xbox-halo-5-guardians-visualizer-5b9afcb542f1) · [LearnOpenGL — HDR](https://learnopengl.com/Advanced-Lighting/HDR)

### 3.3 Motion grammar — Linear / Apple / Fiomet
- Spring on hover/select: `response 0.3, dampingFraction 0.6` (Linear's documented value).
- Easings on state changes: `0.18–0.24s` cubic-bezier(0.32, 0.72, 0, 1) (Apple-ish), never linear.
- Scroll-velocity → camera FOV nudge (Fiomet pattern): on fast scroll, FOV widens by ~2–3°, returns on idle. Tie via Lenis or `useScroll` velocity.
- Edge-of-view distortion when user navigates beyond the orbit ring (Apple "drag beyond edge distorts" trick) — subtle bend, not pull.
- **No idle wobble.** If the user isn't doing anything, the scene is *still* (with breathing IOR ≤ 1px equivalent). Idle wobble is the #1 AI-slop motion tell.

Source: [Linear · liquid glass](https://linear.app/now/linear-liquid-glass) · [Active Theory Fiomet](https://medium.com/active-theory/fiomet-case-study-9a0180268423)

---

## 4. What NOT to Do — AI-Slop Markers in 3D + Premium UI

Synthesized from the Developers Digest "15-pattern" checklist + Adpharm + Monet + Linear's anti-patterns, with 3D-scene additions.

### 4.1 Typography slop
- **Inter everywhere** — especially centered hero. Pair Inter with `ss03` like Raycast or replace it with Geist/Fraunces.
- **Accent serif italic for one hero word** — Space Grotesk / Instrument Serif / Geist Serif used as a "lol classy" garnish.
- **All-caps tiny tracking labels** above every section.

### 4.2 Color slop
- **"VibeCode Purple"** — that LLM-default lavender gradient on white.
- **Purple → blue gradient hero**, especially radial.
- **Colored left borders on cards** — "almost as reliable a sign of AI-generated design as em-dashes in text" (Developers Digest).
- **Gradient text everywhere**, especially on hover.
- **Default shadcn gray** without tuning.

### 4.3 Glassmorphism slop
- **Frosted-blur-only glass** with no specular, no edge highlight, no motion response — the 2022 default that LLMs keep regurgitating.
- **Glass over solid colored gradient backgrounds** — defeats the point; glass should refract real scene content.
- **Same blur radius on every panel** — premium systems vary blur with elevation (Linear stack: 8 / 16 / 32 / 64).

### 4.4 3D / WebGL-specific slop
- **Generic floating glass orbs in space, evenly spaced on a ring.** This is literally our current pattern. The escape is artifact-first differentiation (§ 2.5).
- **Global bloom** on the whole scene → everything glows → nothing is special.
- **Constant idle rotation/wobble.** Premium scenes are still at rest.
- **Cursor-tracked tilt on everything.** A single hero object tracking cursor reads as intent; everything tracking cursor reads as Pinterest.
- **Stars / particles / nebula background.** Especially with `Stars` from drei at defaults.
- **Bevel-everything geometry** — over-rounded boxes, no edge contrast.
- **Default `Environment preset="city"`** — readable as drei-default at a glance.
- **High `chromaticAberration` (>0.05)** — rainbow edges read "tech demo" not "premium."

### 4.5 Layout slop
- **Centered hero + three-up icon cards + numbered "1, 2, 3" steps + stat banner.** The full AI landing-page combo.
- **Emoji icons in sidebar/nav.**
- **Identical card grids with icon-on-top.**

### 4.6 Motion slop
- **Animate everything.** Linear's *"every animation has a purpose"* is the counter-discipline.
- **Bouncing buttons, wiggling icons, floating badges.**
- **Linear easings.** Always cubic-bezier, always with intent.

Sources: [Developers Digest — 15 patterns](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it) · [Adpharm — Claude Design slop](https://www.theadpharm.com/insights/claude-design-without-the-ai-slop-look) · [Monet — landing page pitfalls](https://www.monet.design/blog/posts/escape-ai-slop-landing-page-design) · [Impeccable — Slop](https://impeccable.style/slop/)

---

## 5. Recommended Next-Iteration Vector (research-derived, not opinion)

The convergent signal across Apple / Linear / Active Theory / Bruno Simon / Stripe Press / Heptabase points one direction: **differentiate the six vault orbs as named artifacts with distinct material character, drop refraction intensity for legibility, drive specular by motion not time, and treat the scene as still-at-rest with selective bloom + warm key + cool rim under ACES.** The "memory palace" metaphor lands when each orb is recognizably *itself* (Strategic ≠ Creative ≠ Horizon in surface, weight, and inner cue) — not when six identical glass spheres orbit a point.

Whether to act on that is Frank's call; this document is the research substrate.

---

## Sources (consolidated)

- [Apple — Liquid Glass announcement (newsroom)](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)
- [Apple Developer — Meet Liquid Glass (WWDC25 #219)](https://developer.apple.com/videos/play/wwdc2025/219/)
- [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple HIG — Designing for visionOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos)
- [Liquid Glass Reference (conorluddy)](https://github.com/conorluddy/LiquidGlassReference)
- [Linear — A Linear spin on Liquid Glass](https://linear.app/now/linear-liquid-glass)
- [Linear — Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh)
- [Bruno Simon portfolio](https://bruno-simon.com/)
- [Bruno Simon — case study](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b)
- [Studio Freight Lenis](https://lenis.studiofreight.com/)
- [Active Theory — Neon case study](https://medium.com/active-theory/neon-a-webgl-installation-fdf540c42152)
- [Active Theory — Halo 5 Visualizer](https://medium.com/active-theory/xbox-halo-5-guardians-visualizer-5b9afcb542f1)
- [Active Theory — Fiomet](https://medium.com/active-theory/fiomet-case-study-9a0180268423)
- [Active Theory home](https://activetheory.net/)
- [Three.js examples](https://threejs.org/examples/)
- [Mr.doob sketches (Neocities)](https://mrdoob.neocities.org/)
- [Raycast DESIGN.md (awesome-design-md)](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/raycast/DESIGN.md)
- [Arc Browser design analysis (Blake Crosley)](https://blakecrosley.com/guides/design/arc)
- [Vercel — Geist typography](https://vercel.com/geist/typography)
- [Vercel — Geist font](https://vercel.com/font)
- [Stripe Press](https://press.stripe.com/)
- [Stripe Press case study — Yuin Chien](https://yuinchien.com/p/stripe-press)
- [Heptabase wiki — Version 1.0](https://wiki.heptabase.com/version-one)
- [Heptabase](https://heptabase.com/)
- [NASA Eyes on the Solar System](https://eyes.nasa.gov/apps/solar-system/)
- [JPL — New-and-improved 3D Eyes](https://www.jpl.nasa.gov/news/explore-the-solar-system-with-nasas-new-and-improved-3d-eyes/)
- [Awwwards Site of the Year 2025](https://www.awwwards.com/annual-awards-2025/site-of-the-year)
- [Orpetron — 10 award-winning 3D websites](https://orpetron.com/blog/10-award-winning-websites-bringing-3d-design-to-life/)
- [drei — MeshTransmissionMaterial docs](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material)
- [Codrops — Warping 3D Text Inside a Glass Torus](https://tympanus.net/codrops/2025/03/13/warping-3d-text-inside-a-glass-torus/)
- [Developers Digest — AI Design Slop (15 patterns)](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)
- [Adpharm — Claude Design without the AI slop look](https://www.theadpharm.com/insights/claude-design-without-the-ai-slop-look)
- [Monet — Escape AI slop landing page design](https://www.monet.design/blog/posts/escape-ai-slop-landing-page-design)
- [Impeccable — Slop](https://impeccable.style/slop/)
- [LearnOpenGL — HDR](https://learnopengl.com/Advanced-Lighting/HDR)
- [Danthree — Tone Mapping / ACES (ACEScg)](https://www.danthree.studio/en/glossary/tone-mapping-aces-acescg)

---

*Word count: ~2,150. Research-first deliverable. No design verdict was made; the convergent direction in § 5 is the synthesis the sources point to, not a recommendation.*
