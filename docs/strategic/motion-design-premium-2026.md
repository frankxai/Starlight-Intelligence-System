# Motion Design — Premium Bar (June 2026)

**Status:** Design reset after Frank review · Replaces `hero-frame-preview.html` approach  
**Message (locked):** *The power of your multi-agent system, amplified.*  
**Hooks:** `Your agents. Amplified.` (motion) · full line (copy/deck)

---

## Honest audit — why the work failed

| What we shipped | Why it fails premium bar |
|-----------------|--------------------------|
| Flat SVG circles + lines | Reads as **diagram clipart**, not product cinema. Anti-pattern: flat 2D flowchart (premium-visual § Anti-Patterns). |
| `hero-frame-preview.html` | Poster layout: headline pasted on void. No depth, no glass, no rim light, no hierarchy. |
| AI keyframe slideshow (P0) | Three unrelated stills + crossfade = **PowerPoint**, not motion design. |
| Copy on loop | Competed with site H1; typography default (Georgia/system) = **template**, not Starlight. |
| Skipped references | Ignored canonical bar: `docs/visuals/01–07`, Queen scroll assets `08–11`, live `BrainHero` craft. |
| Skipped design sprint | No moodboard, no A/B/C directions, no self-critique before build. |

**Verdict:** We executed **pipeline tasks**. We did not run **design thinking**.

---

## Quality bar (non-negotiable, June 2026)

Synthesized from: `premium-visual` skill, `frontend-design` process, live site (`BrainHero`, globals.css), canonical `docs/visuals/`.

### Must pass all seven

1. **Pitch-deck test** — Would you put this behind a $50k+ estate conversation without apologizing?
2. **Learn test** — Viewer grasps *amplification* without reading docs (information + emotion).
3. **Material test** — Frosted glass / crystal / volumetric rim — **not** flat orbs on `#060609`.
4. **Hierarchy test** — Foreground (hero metaphor) · midground (agent lanes) · background (void + grid).
5. **Restraint test** — One signature metaphor; everything else quiet (Chanel: remove one accessory).
6. **Site coherence** — Extends `BrainHero` + Fraunces/Inter tokens — does not invent parallel brand.
7. **Motion literacy** — Movement explains the idea (interference, convergence, pulse sync) — not decoration.

### Canonical references (in-repo — match this caliber)

| Asset | Steal |
|-------|-------|
| `docs/visuals/06-self-advancing-sis-constellation.jpg` | Living system, luminous arrows, depth fog |
| `docs/visuals/07-queen-visual-routing-heatmap-palace-card.jpg` | Glass split card, data + beauty |
| `docs/visuals/10-queen-hero-wide.jpg` | Cinematic hero, negative space for type |
| `site/src/components/BrainHero.tsx` | Hub-spoke + ring topology, staggered neural wave |
| Site hero | Mesh drift, dot grid, violet/cyan restraint |

### External caliber (structure only)

- **Linear** — one metaphor, infinite polish, motion never shouts
- **Apple Vision Pro UI loops** — material honesty, slow confidence, physical light
- **Stripe press / product films** — abstract systems that feel *expensive* because physics is believable

---

## Design tokens (Starlight-native, not generic)

```
VOID          #060609     site background (locked)
SURFACE       rgba(255,255,255,0.02)   glass panel fill
BORDER        rgba(255,255,255,0.06)   hairline
TEXT          #e2e8f0
MUTED         #94a3b8
ACCENT_V      #a78bfa    orchestrator / substrate
ACCENT_C      #67e8f9    routing / amplification energy
ACCENT_W      #f0abfc    peak / warm highlight (sparingly)
RIM           teal-violet gradient on glass edges (upper-left key light)
```

**Typography (site-aligned):**

| Role | Face | Use |
|------|------|-----|
| Display | Fraunces | *Amplified* — one word, tracked, large |
| UI | Inter / Geist | Micro-labels only if needed |
| Data | JetBrains Mono | Lane IDs, receipt hash — 1–2 glyphs max |

**Motion curve:** `cubic-bezier(0.4, 0, 0.2, 1)` — site `--ease`. Durations: 400–800ms beats; nothing snappy-cheesy.

---

## Signature metaphor (pick one direction)

> **Wrong metaphor:** "nodes and edges" (every AI landing page since 2023)  
> **Right metaphor:** **Constructive interference** — multiple agent beams, incoherent alone, **phase-aligned through substrate** into one brighter wave.

That is *amplification* in physics. It is visually premium. It is not a graph diagram.

---

## Three directions (Frank picks one)

### Direction A — **The Substrate Lens** (recommended)

**One-line:** A frosted glass disc (SIP substrate) floats in void; agent light enters from off-axis angles; the lens **refracts them into a single coherent beam** outward toward viewer.

| Layer | Content |
|-------|---------|
| BG | Void + subtle dot grid (site) + slow mesh drift |
| Mid | 4–5 thin light filaments (agent lanes), misaligned phase |
| FG | Glass lens with rim glow; beam unifies on pass-through |
| Type | Only `Amplified.` in Fraunces, lower-right negative space |

**Loop (10s):** Filaments drift out of phase (weak) → engage lens → sync → pulse once (strong) → decay to phase-offset (seam).

**Why premium:** Material (glass), physics (refraction), restraint (one object), site palette.

---

### Direction B — **Neural Ring Evolved** (extends BrainHero)

**One-line:** Evolve existing `BrainHero` topology: peripheral nodes are **CLI agents**; ring wave accelerates; center Orchestrator **does not grow** — the **ring brightness integral** grows (amplification = system, not hero orb).

| Layer | Content |
|-------|---------|
| BG | Same SVG topology as production hero |
| Motion | `animate-brain-node` wave → **sync phase** (all nodes peak together) → luminance boost on spokes |
| Type | None on loop; site H1 carries copy |

**Loop:** Inherits 9s neural wave; add 1s "sync flash" at peak — seamless with existing CSS.

**Why premium:** Coherent with shipped site; no new visual vocabulary; hardest engineering, lowest brand risk.

---

### Direction C — **Glass Command Surface** (Queen visual lane)

**One-line:** Floating glass panel (07-card language) seen at shallow angle; inside, routing heatmap **animates** — lanes brighten in parallel; receipt strip slides in at loop peak.

| Layer | Content |
|-------|---------|
| BG | Depth fog, constellation faint |
| Mid | Tilted glass card, frosted |
| FG | Heatmap cells pulse; micro receipt |

**Best for:** Factory scroll + warm leads — **not** homepage ambient (too dense).

**Why premium:** Matches `docs/visuals/07` production artifacts; information-dense glass doctrine.

---

## Surface mapping (after direction pick)

| Asset | Direction | Notes |
|-------|-----------|-------|
| Homepage loop | **A or B** | Ambient; max 1–2 words or none |
| Estate scroll | **C** (or A expanded) | 45s; proof beat uses real receipt shape |
| Social cut | Crop from scroll hook | 9:16, 6s |

---

## Process v3 (design before pixels)

```
1. MOODBOARD     Pin 3 in-repo visuals + 1 external ref in brief.md
2. DIRECTION     Frank picks A / B / C (or hybrid A+B)
3. STILL         premium-visual prompt OR evolved BrainHero screenshot
                 → Frank approves still (creative lock)
4. MOTION SCRIPT Beat sheet with timestamps + "what moves and why"
5. BUILD         HyperFrames + GSAP OR site CSS (B) — no image_gen plates for hero
6. QA            Seven tests above + 390×844 screenshot
7. DRAFT MP4     _draft/ only
8. FRANK WATCH   Approve / revise / kill
9. SHIP          high render + registry
```

**Banned until step 3 approval:** `image_gen` keyframes, commit to `public/motion/`, HTML with circles-and-lines.

---

## Self-critique checklist (before showing Frank again)

- [ ] Would I confuse this with a YC AI wrapper landing page?
- [ ] Is there exactly one thing I remember 24h later?
- [ ] Did I take one justified aesthetic risk?
- [ ] Did I remove one accessory?
- [ ] Does it compose with the existing hero (not fight it)?

---

## Immediate next step

**Frank picks:** A (Lens) · B (BrainHero evolve) · C (Glass surface) · or A+B hybrid.

No build until pick. `hero-frame-preview.html` is **withdrawn** — do not use as reference.

---

**Built on SIP** v1.1.1 · Design reset 2026-06-18