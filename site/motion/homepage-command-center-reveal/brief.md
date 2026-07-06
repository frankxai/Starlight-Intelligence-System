# Homepage Command Center Reveal

## Context

Brand: Starlight Intelligence  
Site/repo: `Starlight-Intelligence-System/site`  
Page/route: `/`  
Audience: technical founder, AI-builder, agent-systems operator  
Primary user task: understand that Starlight turns agent memory into an operational system  
Surface: first viewport hero

## First Read

What this is: persistent context and memory architecture for AI agents  
Who it is for: builders operating multi-agent systems  
Main product/object/state: command-center trace from capture to attestation  
Primary action: adopt SIP, run the reference, download starter, or spawn vertical  
Trust/proof signal: visible trace states and protocol language, not abstract glow

## Motion Thesis

Motion job: make intelligence legible.  
Behavior keywords: precise, operational, calm, luminous, traceable.  
What becomes clearer because this moves: context is captured, routed, verified, and sealed.  
What becomes more memorable because this moves: Starlight behaves like a command center, not a generic AI website.

## Still Frame Gate

Static first frame or screenshot: homepage hero with command-center trace figure.  
Hero object: central orchestrator core with evidence nodes.  
Supporting elements: readout rows, trace paths, glass panels.  
What stays still: headline, body copy, CTAs, nav, primary layout.  
What is removed: abstract-only hero backdrop as the sole first-viewport motion idea.  
Pass/fail: pass for first implementation; requires browser proof before promotion.

## Motion Map

Motion name: Command Center Trace Reveal  
Trigger: page load  
Affected elements: trace lines, evidence nodes, orchestrator core, readout rows  
Initial state: quiet panel with stable composition  
Animated state: evidence nodes settle, trace lines draw toward core, readout rows reveal  
Final resting state: all nodes and proof rows visible

Beat sequence:

1. Setup: glass panel and central core are visible.
2. Trigger: evidence nodes pulse once.
3. Primary motion: trace lines draw into and out of the core.
4. Secondary motion: readout rows rise in with tiny opacity shift.
5. Hold: core breathes subtly.
6. Loop return: trace animation repeats quietly without moving layout.

## Timing

Duration: 4.8s loop  
Delay: 0-1.18s staggered trace start  
Stagger: 120-220ms  
Easing/spring: cubic-bezier(0.23, 1, 0.32, 1)  
Interruption behavior: decorative and non-blocking  
Loop behavior: low-amplitude repeat, no CTA movement

## Runtime

Chosen runtime: SVG + global CSS  
Why this runtime: no client bundle, no new dependency, exact text in HTML/SVG, reduced-motion controllable  
Fallback runtime: static SVG with all traces visible  
Files/components likely touched:

- `src/app/page.tsx`
- `src/components/CommandCenterReveal.tsx`
- `src/app/globals.css`

Asset needs: none

## Reduced Motion

Reduced-motion behavior: all traces, node pulses, core breathing, and row reveals become static.  
What information remains visible: every node, trace, readout row, headline, and CTA.  
What motion is removed: line drawing, pulsing, float/settle.  
Static replacement: full command trace visible at rest.

## QA Proof

Completed proof:

- Desktop screenshot: `motion/homepage-command-center-reveal/qa/desktop-1440-v2.png`
- Mobile screenshot: `motion/homepage-command-center-reveal/qa/mobile-390-v2.png`
- Reduced-motion screenshot: `motion/homepage-command-center-reveal/qa/desktop-reduced-motion-1440-v2.png`
- Local gates: `pnpm lint` passed; `pnpm build` passed.
- Browser checks: desktop reveal displays with no headline overlap; mobile reveal is hidden; reduced motion disables trace and row animations; no horizontal overflow at 1440px or 390px.

Deferred proof:

- Vercel preview verification after commit/push or preview deployment selection.
- Optional short frame sequence/video export if this pattern becomes a social or launch asset.

Status: implementation pass verified locally.
