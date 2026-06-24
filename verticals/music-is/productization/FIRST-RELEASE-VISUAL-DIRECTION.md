# Agentic Music OS — First Release Visual Direction

> Premium, canon-locked prompt packs and selection standards for the first release pipeline (cover 3000×3000 + Spotify Canvas 9:16).  
> Grounded in `labels/<label>/CANON.md` Visual DNA.  
> Intended for `music-producer` agent, asset-render flows, Grok Imagine / Nano Banana / equivalent.  
> **No external upload or publishing.** These are source-of-truth prompt artifacts and rubrics only. Generate variants locally, select per rubric, land assets in `catalog/draft/<song-id>/assets/`.

**Release pipeline contract:** Every first-wave release ships with:
- Master square cover (3000×3000 PNG, sRGB)
- Spotify Canvas (1080×1920 MP4, 3–8s seamless loop, ≤8 MB)
- Supporting ratios as needed (1:1, 16:9 visualizer)
- All assets pass this visual direction + label Visual DNA gate before `/music-release` A&R.

**Deliverable manifest (this file fulfills the request):**
- 3000×3000 cover prompt (per label)
- 9:16 Canvas/video prompt (per label)
- Negative prompt (per label or shared)
- Palette (hex + rules)
- Typography direction
- Selection rubric (hard gates + scored dimensions)
Labels covered: Frank Riemer, Frank's Vibes, Arcanea (Alera Phase 1).
File location: `productization/FIRST-RELEASE-VISUAL-DIRECTION.md` inside music-is vertical.

---

## Usage in Pipeline

1. Pull label + persona CANON (sound DNA + visual DNA).
2. Feed the exact cover prompt + Canvas prompt (substitute [TITLE], [ARTIST], [SUBTITLE], mood specifics from track).
3. Generate 4–6 variants per asset type.
4. Score every variant with the label-specific selection rubric (gate failures auto-reject).
5. Human or curator final pick; archive runner-ups with scores.
6. Lock selected assets to release packet.

Prompts are engineered for modern image/video models: high specificity on composition, lighting, texture, mood, technical quality, and negative constraints. They refuse AI slop patterns and enforce label DNA.

---

## 1. Frank Riemer

**Label:** frank-riemer  
**Position:** artist-of-record, neo-classical / cinematic-piano.  
**Priority:** Phase 1 first release.

### Palette
- **Primary / background:** near-black `#0A0A0A`, cool grey `#2D2D2F`
- **Accent (single warm):** warm cream `#C9A876`
- **Neutral / paper:** off-white `#E8E5DD`
- **Rule:** Saturation ≤30%. Zero warm orange/red or bright digital colors. Monochrome base + one quiet warm point of light.

### Typography Direction
- **Display / title:** Instrument Serif (preferred) or Geist Display. Small size. Elegant, editorial, low weight. Kerning generous but classical.
- **Artist credit:** Clean sans (Geist). Tiny scale, positioned top-right or bottom-right per canon. Never dominant.
- **Placement rule:** Title in lower third (bottom 25–35%), left or center aligned. Minimal text on cover. Artist name secondary and discreet.
- **Never:** All-caps emphasis, heavy drop shadows, modern display faces, Cinzel / Space Grotesk / Inter.

### 3000×3000 Cover Prompt
```
Premium minimalist square album cover, exactly 3000x3000 pixels, photorealistic film photography aesthetic for neo-classical solo piano release titled "[TITLE]" by Frank Riemer. 

Composition: 65-80% deliberate negative space using deep near-black #0A0A0A and cool mid-grey #2D2D2F. Single small, hyper-detailed focal element only — a close-up fragment of a real grand piano key edge with visible felt texture and subtle ivory grain, or a single page of aged music score paper with faint handwritten notation and paper fiber texture, softly lit by natural side window light in an intimate quiet room. One delicate warm cream #C9A876 highlight on the focal only, no other color. 

Cinematic contemplative mood matching Olafur Arnalds, Max Richter Sleep series, and Nils Frahm Spaces aesthetic: vast quiet, dynamic-range protected, anti-hype, museum print quality. Shallow depth of field on focal element, soft film grain, natural analog warmth, real room acoustics implied by light. 

No human figures, no faces, no hands unless extremely subtle piano key interaction only, no full instrument, no text-heavy elements. Title "[TITLE]" set small and elegant in Instrument Serif or Geist Display, warm cream #C9A876, positioned in lower third with generous breathing room and classical letter-spacing. "Frank Riemer" in tiny clean sans, discreet top-right or bottom-right. 

Ultra-high resolution, 8K detail, print-ready, sRGB, flawless composition, masterful negative space, no clutter. Texture-of-piano-felt and texture-of-paper authentic and tactile.
```

### 9:16 Canvas / Video Prompt (1080×1920, loopable)
```
Vertical 9:16 Spotify Canvas, 1080x1920 resolution, 4–8 second seamless loop. Same premium minimalist neo-classical aesthetic as the square cover for Frank Riemer "[TITLE]".

Extremely slow, meditative camera choreography only: imperceptible slow rack focus or micro-pan (2–4 pixels per second max) across the single tactile focal element (piano felt edge or score paper texture), or ultra-gentle natural light shift / shadow breathing across the paper/felt surface. Preserve 65%+ negative space at every frame. 

Film grain, photoreal room photography, quiet contemplative atmosphere. No fast motion, no pulsing, no beat-synced animation, no particle effects, no text overlays or on-screen typography except possibly an extremely subtle non-distracting title fade at start/end (optional and minimal). 

Loop must be perfectly seamless with zero visible jump cut or motion discontinuity. Cinematic, high-end sync-grade production value. Match dynamic-range protected, warm low-end, intimate room reverb feeling of the music. 

Ultra-premium, no artifacts, filmic color grade matching the square cover palette (near-black, cool grey, single warm cream accent).
```

### Negative Prompt (apply to both cover and Canvas generations)
```
faces, people, hands, full body, portrait, selfie, crowd, text overload, logo, watermark, UI chrome, buttons, social media icons, neon, bright saturated colors, warm orange, red, digital gradients, heavy bokeh, lens flare, painterly fantasy art, illustration, cartoon, 3D render, low poly, AI slop, deformed, extra fingers, bad anatomy, blurry, low contrast, overexposed, underexposed, cluttered composition, busy background, stock photo composite, modern app UI aesthetic, drop shadows on text, heavy outlines, geometric patterns, abstract shapes unless paper texture, cinematic trailer style, epic fantasy, any saturation above 30 percent, high key lighting, clinical digital look
```

### Selection Rubric (score each variant 1–10 per axis; gates are hard fails)

**Hard Gates (any fail = reject variant):**
- Palette fidelity: exact match to near-black / cool grey / single warm cream only (no extra hues).
- Zero faces, people, or hands dominating.
- Negative space 60%+ measured.
- No text overload or modern typography.
- No saturated color.

**Scored Dimensions (target composite 8.5+ for release):**
1. **Visual DNA fidelity** — matches Frank Riemer cover composition rules (negative space, single focal, texture authenticity) exactly.
2. **Mood resonance** — contemplative, intimate, anti-hype, matches neo-classical sound DNA (Olafur/Max/Nils references).
3. **Focal strength** — single element is quietly powerful, tactile, memorable without shouting.
4. **Technical excellence** — sharp where intended, beautiful film grain, flawless edges, print-ready at 3000px.
5. **Series coherence** — could sit beside prior and future Frank Riemer releases without drift.
6. **Thumbnail / crop resilience** — focal remains legible and powerful when scaled to 300×300 or Spotify tile.
7. **Canvas loop quality** (for vertical) — motion is imperceptible-slow, perfectly seamless, emotionally aligned to track arc.
8. **Typography integration** — if present, elegant, correctly placed, never fights the image.

**Final curator call:** Highest composite that passes all gates + personal resonance with the specific track.

---

## 2. Frank's Vibes

**Label:** franks-vibes  
**Position:** vibe-engineered electronic, lo-fi / chill-house / context-of-listening. Multi-persona.  
**Priority:** Phase 1 second wave.

### Palette
- **Primary anchor:** sunset orange `#E8743C` + magenta `#D4528B` + deep purple `#3F2C5C`
- **Secondary:** aurora green-magenta gradients for evening; soft blue `#5B7FA8` + dusty rose `#D4A89C` for journal sub-cohort.
- **Rule:** mid-saturation 30–65%. Warm gradients, never clinical. Brighter and more emotional than Frank Riemer.

### Typography Direction
- **Display:** Geist Display. Modern but warm, slightly rounded feel.
- **Body:** Geist.
- **Usage:** More permissive text presence than Frank Riemer. Title can be larger and integrated into the mood scene. Second-person vibe language in captions; on-cover text minimal or atmospheric.
- **Placement:** Often lower third or integrated into scene lighting. Subtle glow or soft overlay OK if it serves the sunset/aurora mood.
- **Never:** Brutalist, Cinzel, heavy condensed faces, all-caps hype.

### 3000×3000 Cover Prompt
```
Premium atmospheric square album cover 3000x3000 for vibe-engineered electronic release "[TITLE]" on Frank's Vibes label. Mid-saturation sunset-toned aesthetic: dominant warm gradient from deep purple #3F2C5C through sunset orange #E8743C to soft magenta #D4528B. Aurora-like subtle green-magenta shift in highlights.

Persona-led or mood-context-explicit composition: stylized contemplative figure (back or soft silhouette preferred, or profile with headphones), or evocative scene — headphones resting on a train window at golden hour, open journal on a wooden desk with warm lamp light and city dusk outside, or lone figure walking into a soft sunset field. Warm low-end visual equivalent: rich color depth, soft filmic grain or light bloom. Tycho album art warmth meets Bonobo dusk photography meets refined lo-fi study mood.

Soft volumetric light, gentle bokeh in distance, emotional but never saccharine. Single evocative focal or balanced environmental storytelling. Title "[TITLE]" in Geist Display, warm cream or soft off-white with subtle glow, tastefully integrated — lower third or floating in light area. Artist credit small and secondary. 

High production value, cinematic color grade, print and streaming ready, emotionally resonant with gym / journaling / evening / creator-soundtrack listening contexts. 30-65% saturation, no high-key or washed out.
```

### 9:16 Canvas / Video Prompt
```
Vertical 9:16 Spotify Canvas 1080x1920, 4–8s seamless loop for Frank's Vibes "[TITLE]". Sunset-aurora warm gradient aesthetic, mid-saturation.

Subtle, tasteful motion that matches listening context: very slow warm light sweep or gentle cloud movement across dusk sky, slow breathing glow on headphones or journal page, soft head-nod rhythm on a silhouette figure (low amplitude, elegant), or slow parallax between foreground object and sunset background. 

Keep energy calm-to-mid (lo-fi/journal = slowest; gym sub-cohort can have slightly more pulse but still refined). Perfect loop. No hard cuts, no strobing, no heavy particle or glitch effects. Text minimal or none on the loop itself. 

Color story anchored in #E8743C, #D4528B, #3F2C5C with aurora accents. Filmic, premium, emotionally supportive of the track's vibe context (evening reset, movement, focus). High production value, no artifacts.
```

### Negative Prompt
```
faces front-on staring at camera, full realistic portraits unless soft stylized backlit silhouette, cluttered scenes, neon cyberpunk, high saturation >70%, pure black or pure white dominant, clinical clean minimalism, corporate gradient, stock-photo people smiling, text overload, logo, UI, buttons, watermarks, fast erratic motion, beat-synced flashy animations, glitch, distortion, low-fi pixel art unless intentional lo-fi study aesthetic, oversaturated orange, harsh shadows, lens flare abuse, AI artifacts, deformed anatomy, busy foreground, meme aesthetic, party / club lighting unless evening chill-house context
```

### Selection Rubric

**Hard Gates:**
- Palette anchored in sunset orange + magenta + deep purple (mid-sat).
- Persona-led or explicit mood context (gym/journal/evening/creator).
- No front-facing staring portraits or busy human crowds.
- Seamless loop for Canvas.

**Scored Dimensions:**
1. **Vibe DNA fidelity** — warm gradients, aurora feel, context-of-listening explicit.
2. **Emotional temperature** — matches the specific sub-cohort (chill journal = intimate warmth; gym = movement energy without aggression).
3. **Persona coherence** — figure/silhouette/avatar style is consistent and ownable for the persona across releases.
4. **Technical polish** — clean motion, no banding in gradients, beautiful light.
5. **Thumbnail power** — pops at small size on streaming grids while staying premium.
6. **Canvas musicality** — motion supports the groove/tempo without fighting it.
7. **Series identity** — instantly recognizable as Frank's Vibes even without logo.
8. **Avoids hype** — emotional and atmospheric, never "drop" energy.

---

## 3. Arcanea (Alera Phase 1 representative)

**Label:** arcanea  
**Position:** canon-bound mythic / cinematic / guardian.  
**Phase 1 focus:** Alera (Voice Guardian, 528 Hz, Whale Otome godbeast, cerulean + crystal).

**Note:** For first releases use Alera canon. Later releases will swap in per-Guardian specifics (palette, godbeast, frequency ripple).

### Palette (Alera)
- **Core:** cerulean blue, crystal clarity, deep cosmic blue `#0D2851`, atlantean teal `#00BCD4`
- **Accent:** gold `#FFD700` (subtle, never dominant)
- **Per label-wide:** deep cosmic blue + teal + gold as foundation. Frequency visualized as subtle harmonic light refraction or ripple.

### Typography Direction
- **Display:** Geist Display + Instrument Serif accent for titles.
- **Editorial:** Instrument Serif for mythic/score moments.
- **Rule:** Elegant, resonant, never fantasy-cliche. Title can feel carved or light-refracted. Gold accent on type rare and tasteful.
- **Placement:** Lower third or integrated as luminous inscription. Minimal. Breathes with mythic scale.

### 3000×3000 Cover Prompt
```
Premium cinematic square album cover 3000x3000, hyper-real concept art + mythic score-grade aesthetic for Arcanea label release "[TITLE]" — Alera, Voice Guardian, 528 Hz.

Composition: dramatic cinematic scale with atmospheric depth. Central or integrated subtle mythic element — the Voice Guardian Alera (elegant, resonant female form or luminous presence) with her Godbeast Whale Otome (majestic whale form or symbolic silhouette) rendered with hyper-real detail, crystalline refraction, and ocean-meets-starlight atmosphere. Deep cosmic blue #0D2851 dominant, accented by atlantean teal #00BCD4 and very refined gold #FFD700 threads or highlights. 

Subtle visualization of 528 Hz frequency as gentle harmonic light ripples, refractions through crystal or water surface, or luminous standing waves integrated into the environment — never literal text or HUD. Cinematic lighting: volumetric god rays, deep contrast, Hans Zimmer / Two Steps from Hell / Ramin Djawadi album and game cinematic concept art level (Final Fantasy XVI, Elden Ring tier quality).

Hyper-realistic yet mythic, no generic fantasy painterly slop, no cartoon, no over-the-top dragons. Every element canon-bound. Title "[TITLE]" in elegant Geist Display or Instrument Serif, refined gold or crystal white, positioned with breathing room in lower third. "Alera — Arcanea" or "Alera | 528 Hz" discreetly placed. Vast mythic space, epic yet intimate emotional core.

Print and streaming master quality, 8K, flawless anatomy and materials, museum-grade composition.
```

### 9:16 Canvas / Video Prompt
```
Vertical 9:16 Spotify Canvas, 1080x1920, 5–8 second seamless loop for Arcanea Alera "[TITLE]". Cinematic mythic score aesthetic.

Slow, powerful, resonant camera choreography: very slow dolly or crane movement through atmospheric space, subtle crystalline light refraction pulse timed to the Guardian frequency (528 Hz implied in the slow breathing rhythm of the light), gentle sway of whale form or light waves, or slow reveal of luminous details. 

Maintain epic scale with intimate emotional center. Color anchored in deep cosmic blue, teal, and refined gold. Frequency ripple or refraction elements move organically with the music's harmonic motion. Perfect seamless loop. 

No fast action, no battle trailer strobing, no particle spam. Text extremely minimal or absent on the loop. Hyper-real + mythic, score-grade production value matching the label's orchestral hybrid DNA. Volumetric god-light, depth, and clarity.
```

### Negative Prompt
```
generic fantasy art, AI slop dragons, painterly illustration, cartoon, low-effort character, over-saturated gold, rainbow overload, literal sheet music or frequency numbers as text, HUD elements, UI, watermarks, logos, modern armor or anachronistic tech, busy crowded mythic scenes, low contrast, flat lighting, fast erratic camera, strobing, heavy lens flare abuse, deformed anatomy especially on godbeast, people staring at camera, stock fantasy composites, new-age crystal healing clichés, text heavy, all-caps, cheap 3D render, plastic materials, oversaturated teal
```

### Selection Rubric (Alera / Arcanea)

**Hard Gates:**
- Binds to Alera canon (Voice Guardian + 528 Hz + Whale Otome godbeast visible or referenced).
- Palette fidelity: cosmic blue / teal / refined gold only.
- Mythic + hyper-real concept art quality, no generic fantasy.
- Frequency element present but subtle (ripple/refraction/light).
- Seamless loop.

**Scored Dimensions:**
1. **Canon fidelity** — every visual element traceable to Alera persona + label Visual DNA + Guardian roster.
2. **Cinematic power** — Hans Zimmer / trailer score / game concept art emotional and visual weight.
3. **Frequency integration** — 528 Hz visualized elegantly without becoming literal graphic.
4. **Godbeast respect** — Whale Otome depicted with dignity and integration (not mascot).
5. **Scale vs intimacy** — feels both mythic and emotionally human.
6. **Technical mastery** — materials, lighting, refractions, anatomy flawless.
7. **Cross-ecosystem coherence** — composes with broader Arcanea visual canon (book/legends).
8. **Canvas musical sync** — motion and light breathe with the score architecture and frequency.

**Release decision:** Must score 9+ on canon fidelity gate. Highest overall that passes.

---

## Cross-Label Rules & First Release Pipeline Notes

- All prompts must be used verbatim or with only [TITLE] / track-specific substitutions. Do not drift the DNA language.
- Generate variants with temperature/creativity settings that favor fidelity first, then surprise.
- For first Frank Riemer release (highest priority), enforce the strictest negative space and texture rules.
- Canvas is non-optional for Frank's Vibes per canon; strongly recommended for all.
- Archive all scored variants + rubric scores with the song draft for audit and future consistency training.
- After first three label releases, run a visual drift audit against this document.

**Source of truth chain:**  
`labels/<label>/CANON.md` (Visual DNA) → this prompt pack → generated assets → `music-curator` gate → release packet.

**Version:** v1.0 for Agentic Music OS first release pipeline — 2026-06-19

---

*End of visual direction. No assets generated or uploaded in this artifact.*
