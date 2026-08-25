---
name: vision/impeccable-design-kernel
description: Master design and frontend engineering standard for world-class web surfaces, UI/UX, motion choreography, and brand assets. Enforces Impeccable Taste, Next.js 15, React 19, Tailwind v4, Motion Taste Rubric, and native Antigravity/NanoBanana media generation.
type: vision
version: "2026-08-25"
status: stable
---

# Impeccable Design Kernel & Premium Web Standard

> *"Design is not decoration. It is the visual architecture of intent. Build with impeccable taste, zero slop, and cinematic motion."*

## When This Skill Activates

- Any frontend UI/UX development, landing page creation, dashboard design, visual branding, or motion engineering.
- Keywords: "impeccable", "design system", "tailwind v4", "nextjs 15", "react 19", "motion design", "gsap", "v0", "nanobanana", "brand assets", "anti-slop"
- Default for: Starlight Weaver, Starlight Visionary, Social Visual Director

## What This Skill Does

Enforces the FrankX & Starlight Impeccable Design Taste standards across all digital surfaces. Governs component architecture, typographic scales, fluid CSS layouts, motion choreographies, and visual media pipelines.

## Core Rules & Invariants

1. **Anti-Slop Mandate**: No generic AI stock aesthetics, illegible floating gradients, or AI-generated text baked into images. Exact code overlays (CSS/SVG/HTML) for all typography, charts, and metrics.
2. **Media Generation Policy (Strict Higgsfield Ban)**:
   - **NEVER USE HIGGSFIELD**: Strict mandate banning Higgsfield MCP or tools.
   - **Antigravity Native & NanoBanana First**: Prioritize native Antigravity `generate_image`, NanoBanana (`nb-image` / `nb-generate.mjs`), and Veo native pipelines for all visual media.
3. **Vector/SVG-First**: All logos, icons, badges, and interface glyphs must be pristine, scalable inline SVGs or Lucide icons.
4. **Modern Web OS Standard**:
   - Next.js 15 App Router with React 19 Server Components (RSC) and Server Actions.
   - Tailwind CSS v4 CSS-first configuration (`@theme` variables, avoiding legacy `tailwind.config.js`).
   - Motion Choreography: Track A (CSS/WAAPI local micro-interactions) first, Track B (GSAP/Lenis smooth scroll) earned, Track C (Three.js/WebGL) only with strict fallback and `prefers-reduced-motion` compliance.

## Procedures

### Procedure 1: Design Token & Layout Architecture

1. **Establish Foundation Design Tokens**:
   - Define color tokens with OKLCH / CSS variables (`--color-background`, `--color-foreground`, `--color-accent-amber`, `--color-surface-glass`).
   - Establish fluid typography scale using `clamp()` for perfect readability across mobile, tablet, and ultra-wide displays.
2. **Glass & Surface Elevation**:
   - Multi-layered backdrops (`backdrop-blur-md`, subtle 1px border overlays `border-white/10`).
   - Dark-first aesthetic with deep ambient gradients, subtle noise textures, and luminous accent glows.
3. **Accessible Information Hierarchy**:
   - High-contrast text ratios ($\ge 4.5:1$ for body, $\ge 3:1$ for headers).
   - Generous whitespace and scannable visual pacing.

### Procedure 2: Modern Frontend Implementation (Next.js 15 + Tailwind v4)

1. **Component Scaffolding**:
   - Use Shadcn/UI patterns built with Tailwind v4 `@utility` classes.
   - Separate server data-fetching components from interactive client islands (`"use client"`).
2. **V0 Branded Generation Flow**:
   - Utilize `v0_generate_branded` or `v0_generate` with Starlight design tokens for rapid layout scaffolding.
   - Refactor generated components into clean, modular TypeScript files.
3. **Form & State Management**:
   - Use React 19 `useActionState` and Server Actions for mutation pipelines.

### Procedure 3: Motion Choreography & Performance Gating

1. **Micro-Interactions (Track A)**:
   - Spring-based hover transitions (`transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)`).
   - Active tactile feedback on buttons, cards, and navigation items.
2. **Cinematic Scroll & Stagger (Track B)**:
   - Use GSAP ScrollTrigger or Framer Motion for scroll-driven reveals.
   - Stagger child elements ($0.05\text{s} - 0.1\text{s}$ interval) to create a polished cadence.
3. **Performance Gate**:
   - 60fps locked rendering; avoid layout thrashing.
   - Wrap complex animations with `@media (prefers-reduced-motion: reduce)`.

### Procedure 4: Visual Asset Generation & Quality Gate

1. Formulate rich, cinematic prompts for native Antigravity `generate_image` or NanoBanana.
2. Review visual outputs against `TASTE.md` (lighting coherence, chromatic balance, brand palette alignment).
3. Stage approved images into `brand-assets/` or project public directories with descriptive semantic naming.

## Integration Points

- **Design Bible**: `DESIGN_BIBLE.md`, `.arcanea/config/design-tokens.yaml`, `DESIGN_TASTE.md`
- **MCP Servers**: `starlight-v0` (`v0_generate`, `v0_generate_branded`, `v0_pull_code`)
- **Visual Tools**: Native Antigravity `generate_image`, NanoBanana (`nb-image`), Remotion

## Quality Criteria

- Does the UI meet Impeccable Taste benchmarks (Awwwards/Godly level polish)?
- Is typography rendered cleanly in code without AI hallucinated text artifacts?
- Are Higgsfield tools strictly avoided in favor of native Antigravity and NanoBanana?
- Does the interface perform fluidly at 60fps with responsive adaptation across screen sizes?
