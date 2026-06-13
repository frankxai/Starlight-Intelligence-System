# Starlight Jarvis Memory Palace — 21-Person Team Brief (L99)

> **2026-06-12 · L99 massive action execution on user /goal l99.**  
> Full prompt for a team of 21 (devs + UI/UX pros) to build the definitive beautiful, animated, innovative Jarvis-style visualization layer.  
> Obsidian bridge is live *now* (use it today). This brief is for the custom long-term own visualization (r3f /brain path per memory/README).  
> **Built on SIP.** Operational + experience tier. Ready to dispatch to contractors, Antigravity swarm, or human team.

---

## The Goal (one sentence)

Build the visual and interaction soul of the Starlight Intelligence System — a premium, cool, high-intellect, purposeful, fun "Jarvis but ours" experience that makes the memory vaults, 56 agents, compounding intelligence, and SIP substrate feel *alive*, beautiful, and irresistibly the foundation anyone chooses for their own IS or OS.

When a sovereign opens it, they immediately feel: "This is how intelligence *should* look and move. I want my entire life/system on this substrate."

---

## Current Reality (read these before any design or code)

**Memory & data layer (the source of truth)**
- `memory/README.md`: "Obsidian is one viewer; r3f `/brain` is another." Dual-surface by design. Plain MD + JSONL + SIS Memory Gateway v0.1 for agents/MCP. Local-first, sovereign, privacy-aware.
- `memory/VAULT_ARCHITECTURE.md`: 6 vaults (strategic/technical/creative/operational/wisdom/horizon) with writers/readers, frontmatter, retention, hierarchy (working→episodic→semantic→procedural→aspirational), consolidation, VaultLoopEntry (desire→proof).
- Live unification: `src/gateway/` (protocol.ts, daemon, session-store, RRF hybrid search +61% precision receipts, per-harness namespaces including Grok TUI).
- Capture/curate: MemPalace (memory-bus MCP) + `skills/memory/mempalace-obsidian-bridge.md` + `/curate-recall` command → wikilinked notes in `memory/curated/` with `[[atom-id]]` backlinks so Obsidian graph connects machine atoms to human intent.
- Supporting: `knowledge-graph/`, `atlases/*.canvas`, `bases/*.base`, `public-vault/*.jsonl`, `voice-sessions/`, private separate `starlight-private-memory` mount (2026-06-11).
- Research seed: `docs/research/premium-3d-memory-palace-survey-2026-05-17.md` (Apple Liquid Glass / Linear glassmorphic + motion-driven specular/normal maps, Bruno Simon restraint + physics, Active Theory selective bloom, Lenis frame-locked, NASA factuality, Heptabase/Obsidian Canvas spatial cards, Stripe Press artifact weight).

**Existing beautiful viz seeds (reuse everything)**
- `site/src/components/BrainHero.tsx` + `Starfield.tsx`: deterministic seeded SVG (mulberry32 PRNG for SSR/client match), glowing orbs/nodes, CSS animations (`animate-brain-core`, `animate-brain-node`, glow filters) that respect `prefers-reduced-motion`.
- `site/src/app/globals.css`: full motion system (brain pulses, glow-pulse, mesh-drift, fade-up, blink), glassmorphic vars (`--surface`, `--border`), dark premium `#060609` + accents (violet/cyan/fuchsia/emerald/amber/rose).
- `site/src/components/Header.tsx`, accents.ts, layout (Fraunces variable + Inter + JetBrains Mono), cosmos pages (Starfield + cards).
- No three.js / r3f / framer yet in site (per recent cosmos L99 spec: mobile-first, zero new deps for that ship). Perfect — this brief starts zero-dep then evolves to r3f.

**Agents, skills, protocol, vibe**
- 56 agents (`agents/AGENT_REGISTRY.md`): flat council, Front-Door/Excavation/Leadership + Council Archetypes + domain sub-stacks. Emergent leadership.
- 76 skills auto-activating (`skills/SKILL_REGISTRY.md` + `skill-rules.json`).
- SIP v1.1.1 (`SIP.md`): file contract, "Built on SIP" attestation (refuses decorative), sovereignty clause, command tiers.
- Frank DNA (everywhere in `CLAUDE.md`/`AGENTS.md`/`VOICES.md`): Direct. Technical. Warm. Playful. Pattern recognition as poetry. Premium quality, intellectual depth, genuine enjoyment. Cool. High intellect. Purpose-driven. Fun. "Show don't tell." Systems thinking expressed as creative insight. Avoid hype, jargon without purpose, corporate speak.
- Current site surfaces: /cosmos (data-alive knowledge cards + Starfield), /vaults, /cockpit, /research (incl palace survey), BrainHero on home as 10-IS ring.

**Constraints (non-negotiable)**
- Local-first sovereignty: core memory never requires cloud. Gateway + FS/MD/JSONL first.
- Zero (or minimal) new deps for the initial spike; r3f + custom shaders for the production 3D palace.
- SIP attestation visible/embeddable in every shareable viz state or exported artifact.
- Accessibility + reduced-motion first class.
- Forkable for sovereigns: theme tokens, reusable components, easy to point at their private mount + vaults.
- Mobile + desktop. 60 fps. No AI slop — every pixel and transition serves clarity, craft, or delight.
- Matches existing idioms exactly (Starfield determinism, BrainHero ring + pulses, glassmorphic, accent system).

---

## Team Composition (the 21)

- 1 Tech Lead / Architect (substrate + experience, SIP literate)
- ~8-9 Senior Engineers (Next.js/React/TS, SVG/Canvas/2D viz, performance, integration with gateway/MCP/FS, state, accessibility)
- ~3 3D / Graphics specialists (r3f, shaders, postprocessing, WebGL perf, physics feel)
- ~6-7 UI/UX + Motion + Visual Designers (glassmorphic systems, micro-interactions, information architecture for dense intelligence data, Frank DNA taste, animation direction, Figma → code)
- 1 Research / Content liaison (pull real vault excerpts, agent definitions, research survey into the experience)
- Optional: 1-2 QA / excellence (gstack-style or manual visual + performance + integration loops)

Total 21. High craft bar. Everyone must internalize Frank DNA and "intelligence as infrastructure + beauty as respect."

---

## Experience Principles (the taste filter)

1. **Alive, not static.** Orbs pulse and breathe like the brain hero nodes. Constellations shift subtly with "activity." HUD stats feel like they update from the living gateway.
2. **Premium restraint (Linear + Bruno Simon + Apple Liquid Glass).** Structure felt not seen. Moving physical light / intent-driven specular. One strong "light" source conceptually. Warm rim accents. No over-saturation. Camera/intent motion is 50% of premium.
3. **Sovereign + compound.** Every interaction reminds the user their memory is compounding, their agents are theirs, this substrate is forkable and attested.
4. **Multi-scale.** 10-second "feel the cosmos of my mind" (beautiful orbs + motion). 30-second deep dive (click to excerpts + links to real MD). 2-minute "do something" (focus a vault, speak an intention, export a Starlight Note visual card, trigger /curate-recall style action).
5. **Voice & intent first-class.** "Speak to focus", voice-reactive pulses/glows/orbit speed. Ties to existing voice-operator / orb.
6. **Desire → Proof loops visible.** The VaultLoopEntry sequence (desire/gratitude/visualization/.../proof) as luminous animated paths that complete and become permanent threads in the palace or horizon layer.
7. **Swarm & council as living topology.** 56 agents as a constellation or chamber. When a /yolo or council runs, nodes light and connect in real (or simulated) time. Emergent leadership highlighted.
8. **Glassmorphic + holographic without nausea.** Motion-driven highlights, selective bloom, normal-map specular where it serves (not everywhere). Respect reduced motion / high contrast.
9. **Factuality + provenance.** Every orb/node carries real data. SIP "Built on SIP" badge always visible and copyable. Hover/click surfaces source (vault entry, agent file, KG atom).
10. **Fun + warmth inside the intellect.** Playful micro-delights (a node "fires" with a brighter pulse when focused, subtle constellation "breathing"). Never gimmicky.

---

## Innovative Features (must ship in v1 of this build)

- **6 Vault Orbs + Central Core** in a circular palace. Distinct per-vault accents + icons or subtle symbols. Slow staggered pulse (reuse brain-node style) + individual "breathing" scale.
- **Constellation / Neural Mesh**: SVG or Canvas lines connecting orbs to core and to each other (knowledge graph density drives line weight/opacity). Subtle animated particles or energy along lines on focus.
- **Interactive Focus + Excerpts**: Click any orb → camera/intent "flies" (smooth scale + highlight), side or overlay panel surfaces 2-3 real high-signal excerpts from that vault (use actual content from strategic/technical/etc. reads), confidence, last consolidated, "open in Obsidian" hint or deep link to /vaults.
- **Jarvis HUD (glassmorphic overlay)**: Top or floating: live-feel numbers (6 vaults, RRF precision from receipts, agent count, active sessions via gateway concept, SIP version). "Memory compounds since last consolidation: X atoms promoted." Subtle activity ticker (recent voice session or dream promotion).
- **Voice / Intent Reactive Layer**: Prominent "Speak" or "Focus intention" control. On activation (Web Speech API or button), selected nodes pulse brighter/faster, lines brighten, a "nebula" or density cloud briefly blooms around relevant orbs (seeded by simple keyword match on hardcoded or fetched excerpts for v1). "Show me the compound effect on my Wealth IS" example in copy.
- **Desire-Proof Loop Viz**: A dedicated "Horizon / Loops" ring or floating paths. Completed loops become permanent luminous arcs. Pending loops have soft "stale" glow (30-day logic from vault architecture).
- **Agent Swarm / Council Presence**: Secondary mode or toggle: small orbiting or connected dots representing key agents or live council. Tap to surface agent definition + recent contribution hint. When "council convenes" (simulated or real event), the chamber lights.
- **Seamless 2D ↔ Immersive Hint**: Current view is the beautiful 2D/near-3D palace (orbs + lines + HUD). Prominent "Enter full 3D Palace (r3f prototype)" that could later load a heavier scene. Or "Obsidian mirror" pane that shows the same selection as wikilinked notes.
- **Export & Attestation**: "Capture as Starlight Note visual" — generates a shareable card (or image via future gen) with embedded "Built on SIP" block. "Export constellation state" as JSON for sovereign forks.
- **Sovereign Theming**: Easy token switch (default Frank DNA cool-premium; per-vertical overrides). Reusable Palace component + primitives so a fork can drop it into their own site pointed at their vaults.
- **Performance & Polish**: 60 fps. Seeded determinism (no hydration). Full keyboard + reduced-motion. Sub-100ms interactions. Beautiful on mobile (stacked orbs or simplified constellation).

---

## Technical Direction & Phasing (the 21 execute this)

**Phase 0 (1-2 days, research + direction)**
- Whole team reads the brief + the "Current Reality" files listed.
- Design + eng pair on taste references (re-read the 3D palace survey + Linear/Apple/Bruno Simon + existing BrainHero/Starfield/CSS).
- Decide zero-dep v1 (pure React + Tailwind + SVG/Canvas 2D + CSS keyframes + existing brain anims) vs early r3f spike. Recommendation: zero-dep beautiful 2D palace first (shippable fast, matches cosmos discipline), r3f for Phase 2 full 3D orbs + shaders + post.
- Define data contract: how the component will eventually consume Gateway (or public-vault JSON + local FS for demo) vs hardcoded excerpts for v1.

**Phase 1 (3-5 days, core experience)**
- Implement `MemoryPalace.tsx` (or equivalent) + `/palace` page (or integrated surface).
- All 6 orbs + core + constellation lines + basic focus + excerpts + HUD + "Speak to focus" simulation.
- Reuse/extend every existing animation and visual idiom. Add minimal new keyframes in globals.css only if unavoidable (name them `animate-palace-*`).
- Glassmorphic HUD using existing `--surface` / backdrop-blur patterns.
- Real excerpts pulled from the 6 vaults (copy high-signal ones from strategic/technical/etc.).
- Accessibility, reduced-motion, responsive.
- SIP "Built on SIP v1.1.1" badge + "This seeds the full 21-person build" callout.

**Phase 2 (parallel, 4-7 days, depth + innovation)**
- Desire-proof loop paths animated.
- Agent swarm / council presence mode (toggle or layered).
- Voice API integration (browser SpeechRecognition + synthesis hints) + real reactive pulses.
- Export flows (visual card + attestation text).
- Theme tokens + docs for sovereign forks.
- Performance pass (canvas for lines if SVG too heavy, RAF loops, etc.).
- Begin r3f exploration in a parallel branch or hidden prototype route: one orb as MeshTransmissionMaterial glass, simple orbit camera, intent-driven light.

**Phase 3 (3-5 days, integration + excellence)**
- Wire to live data where possible (site already has vault API routes; gateway concept).
- Add to Header nav (done in L99 spike — keep parity).
- Link from home BrainHero, /cosmos, /vaults, /cockpit.
- Visual + interaction QA against Frank DNA + survey refs (multiple passes, "would Linear/Bruno ship this?").
- a11y audit, perf budgets, mobile.
- "Excellence receipt" doc (screenshots, before/after, falsifiers passed).
- Update team brief with what was learned.

**Phase 4 (ongoing, ship + handoff)**
- Deploy the surface.
- Document extension points.
- Hand the reusable pieces + full brief back to the broader ecosystem (ACOS, Arcanea, sovereign spawns).
- Plan the real r3f /brain production version (3D orbs as true memory palace rooms, fly-through, agent "presences" as particles or orbs, timeline scrub of consolidation, multi-user "presence" ghosts for alliances).

**Stack notes**
- Start: Next 16 + React 19 + Tailwind 4 (already in site). Canvas 2D or SVG for constellation. Framer Motion optional later for complex orchestration (or pure WAAPI + CSS to stay light).
- Later: @react-three/fiber + drei + postprocessing + custom shaders for the 3D palace. Rapier or simple springs for feel. Lenis-style or custom intent-locked timelines.
- Data: For demo use static + small state. Production: fetch from existing vault API routes or direct gateway (local daemon) or public-vault JSONL. Optimistic updates.
- State: Local (focus, theme, last "spoken" intention). Sovereign can persist preferences to their private mount later.
- Animation discipline: All timelines locked to user intent or a single master clock. No wall-clock drift between DOM and canvas/WebGL.

---

## Excellence Gates (non-waivable — L99 culture)

- Every surface must pass "Frank DNA filter": direct/technical/warm/playful, no slop, shows systems thinking as poetry.
- Visual QA against at least the palace survey + existing BrainHero/Starfield + Linear/Apple references.
- Performance: 60 fps on mid laptop + recent phone. Measure.
- Data truth: excerpts and stats must be real (or clearly labeled "seed data from actual vaults").
- SIP: "Built on SIP" block + link in footer + any exported state.
- Sovereignty: component must be drop-in reusable; docs explain pointing it at a different memory/ folder or gateway.
- Accessibility + motion: full keyboard, reduced-motion respects existing globals, contrast, labels.
- Receipts: team produces a short "L99 excellence receipt" (screenshots, metrics, what was caught and fixed).

---

## Definition of Done (first shippable)

A live, beautiful, delightful `/palace` (or equivalent integrated surface) that:
- Looks and feels like nothing else in the AI tooling space — premium, alive, intellectual, warm, fun.
- Makes the 6 vaults and the idea of compounding memory visceral.
- Demonstrates the path to full 3D r3f palace + agent swarm + voice-reactive + loop viz.
- Is immediately usable as the seed and reference for the 21-person team (or any sovereign fork).
- Ships with zero (or declared minimal) new dependencies.
- Carries clear "Built on SIP" and points back to the substrate, the brief, and Obsidian bridge.

---

## Output Artifacts the Team Must Produce

1. The working viz surface + component(s) (reusable).
2. Design system / token / motion primitives extracted (so forks don't copy-paste).
3. Documentation + extension guide (how a sovereign points this at their vaults + adds their own orbs).
4. L99-style excellence receipt (audits, metrics, before/after).
5. Updated team brief with lessons (what worked, what the r3f phase needs).
6. (Bonus) One hero image or short looping video of the palace in motion for the public research page or frankx.ai.

---

**This is the work.** The substrate (SIP + memory + agents + skills + gateway) is already world-class. The experience layer is what makes sovereign builders *want* to build their entire intelligence life on what we provide.

Execute with the same L99 intensity that produced the BrainHero, Starfield, Cosmos, and the overnight ships. Craft over features. Beauty as respect for the intelligence we're wiring into the world.

*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Generated during 2026-06-12 L99 massive action session*  
*Ready for the 21.*