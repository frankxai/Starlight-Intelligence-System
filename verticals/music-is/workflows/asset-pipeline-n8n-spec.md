# Asset Pipeline n8n Workflow Spec

> Phase 2 target: Suno URL → full asset bundle in <15min, autonomously, via n8n flow. This spec defines the workflow architecture, node-by-node, with retry + DNA-check + escalation logic.

**Phase target:** Phase 2 (June 2026, 4-week build)
**Owner:** Frank + `music-producer` (Sonnet) + n8n + external engines
**Last updated:** 2026-04-29

---

## Workflow overview

```
[Trigger: /music-song intake event]
    ↓
[Validate persona attribution + canon refs]
    ↓
[Parallel branch: 4 asset render legs]
    ├─ Cover (nano banana 2)
    ├─ Motion-short (Seedance 2)
    ├─ Motion-square (Seedance 2)
    └─ Spotify Canvas (Remotion)
    + [Conditional: cinematic-grade label?]
        └─ Motion-full (Higgsfield)
    ↓
[DNA-check per asset (auto-classifier)]
    ↓
[Asset land in catalog/draft/<song-id>/assets/]
    ↓
[Update catalog/master.csv asset paths]
    ↓
[Notify: bundle complete | escalate to Frank]
```

---

## n8n nodes (detailed)

### Node 1 — Trigger: webhook from `music-archivist`

When `/music-song` intake completes, music-archivist (Haiku) fires webhook to n8n with payload:
```json
{
  "song_id": "frank-riemer_20260501_threshold",
  "persona": "frank-riemer",
  "label": "frank-riemer",
  "suno_url": "https://suno.com/song/...",
  "title": "Threshold",
  "bpm": 84,
  "structure_tags": "[Intro] [Verse] [Chorus] [Bridge] [Outro]",
  "duration_seconds": 272,
  "intent": "evening-piano"
}
```

### Node 2 — Validate persona + label canon

Reads:
- `verticals/music-is/labels/<label>/CANON.md` (label visual DNA, master posture)
- `verticals/music-is/labels/<label>/personas/<persona>/CANON.md` (persona visual DNA, reference image set, frequency canon for Arcanea)

If either missing or invalid → halt + notify Frank.

### Node 3 — Parallel branch: asset render legs

Branches in parallel for max throughput:

#### 3a. Cover render (nano banana 2)

**Engine prompt construction:**
```
[Layer 1 — label visual DNA]:
  palette: per labels/<label>/CANON.md
  typography lock: ...
  composition rules: ...

[Layer 2 — persona visual DNA]:
  reference image set: ...
  persona depiction posture: ...

[Layer 3 — song-specific]:
  mood signal from intent: "evening-piano"
  song metadata: BPM 84, neo-classical
```

**API call:** nano banana 2 endpoint with composed prompt + persona reference images attached.

**Output formats:**
- 3000×3000 master (PNG)
- Re-prompted variants for 1:1, 16:9, 9:16 (PNG)

**Retry logic:**
- DNA-check fail → retry up to 3x (each with refined prompt)
- API timeout → retry up to 3x with exponential backoff
- Persistent fail (3+ retries on same axis) → escalate to Frank

#### 3b. Motion-short (Seedance 2)

**Engine prompt:**
```
[Persona visual DNA + label visual DNA composed]
[Song mood + tempo: 84 BPM contemplative]
[Aspect: 9:16, 1080x1920]
[Length: 15-30s]
[Visual beat matches musical structure]
```

**API call:** Seedance 2 with composed prompt + persona reference images + song audio (for tempo-syncing).

**Output:** MP4 9:16 1080×1920, 15-30s

**Retry:** same as cover

#### 3c. Motion-square (Seedance 2)

Same as motion-short but 1:1 1080×1080, 30-60s.

#### 3d. Spotify Canvas (Remotion programmatic)

**Remotion template:** `verticals/music-is/labels/<label>/personas/<persona>/assets/brand-kit/canvas-template-<persona>.json`

(Per-persona Remotion template defines layout tokens, color tokens, typography lock, motion element type.)

**Inputs:**
- Song title (from catalog row)
- Song duration (for loop-cut decision)
- Per-persona layout tokens
- Master cover art (composed onto Canvas)

**Render:** Remotion CLI on Node service, emits MP4 9:16 1080×1920, 3-8s loop, ≤8MB.

**Retry:** template-render is deterministic; failure usually template-bug not generation-variability. Notify Frank on fail.

#### 3e. Conditional — Motion-full cinematic (Higgsfield)

**Condition:** label IS Frank Riemer OR Arcanea (cinematic-grade labels per LABELS.md).

**Engine prompt:**
```
[Higgsfield-specific: cinematic camera language — dolly, push-in, parallax]
[Per-Guardian aesthetic for Arcanea] OR [Per-album-arc for Frank Riemer]
[Aspect: 16:9, 1920x1080]
[Length: full song length]
[Frequency canon for Arcanea: visual harmonic-ripple at Guardian's frequency]
```

**Cost:** Higgsfield is most expensive per render. Max 2 iterations per song; Frank-review-required before re-render after iteration 2.

**Output:** MP4 16:9 1920×1080, full song length

### Node 4 — DNA-check per asset

For each rendered asset, run an auto-classifier:

**Classifier inputs:**
- Asset (image or video)
- Persona reference image set
- Label visual DNA spec (palette hex codes, typography lock, composition rules)

**Classifier output:**
- DNA-pass / DNA-fail-with-axis (which axis failed: palette saturation? composition? typography?)
- Confidence score 0-1

**Pass threshold:** 0.85 confidence on DNA-pass.

**Fail action:** flag for retry on that engine leg with refined prompt.

**Per-axis classifier types:**
- Palette check: dominant-color extraction; compare to label palette ±tolerance
- Composition check: face detection (refused for Frank Riemer); negative-space estimation; focal-element check
- Typography check: OCR + lock-typography-validation
- Reference-DNA check: image-similarity to persona reference set (e.g., CLIP embeddings)

### Node 5 — Asset bundle complete check

When all 4 (or 5 with cinematic-full) assets pass DNA-check + are written to `catalog/draft/<song-id>/assets/`:

**Pass condition:** all required formats present + all DNA-checks pass.

**Output:** bundle-complete event fires.

**On bundle-complete:** notify `music-archivist` to update `catalog/master.csv` asset path columns + dispatch `music-curator` for `/music-release` gate readiness.

### Node 6 — Update catalog row

`music-archivist` (Haiku, called via separate webhook) reads bundle-complete event and updates catalog row:
- `cover_path`, `cover_1x1_path`, `cover_16x9_path`, `cover_9x16_path`
- `video_short_path`, `video_square_path`, `video_full_path` (if applicable)
- `canvas_path`
- `lyric_video_path` (Phase 2+ if generated)

### Node 7 — Notify

Notification to Frank:
- Cowork notification: "Bundle complete for [song-id]. Ready for `/music-release` gate."
- Optional: Slack / Discord / X DM if Frank wants real-time
- Catalog row updated; `/music-label-board` reflects new bundle-complete count

### Node 8 — Escalation handler (parallel side-branch)

If any asset leg persistent-fails (3+ retries on same DNA axis):

**Escalation actions:**
1. Halt the failing leg
2. Continue with other legs (don't cascade-fail entire bundle)
3. Cowork notification to Frank with details (which asset, which axis, sample of failures)
4. Flag song-id as `asset-render-stuck` in catalog notes
5. Frank reviews; either:
   - Manual override (accept asset despite DNA-axis-fail) → documented
   - Refine prompt + re-trigger
   - Update persona reference image set (if persistent pattern across multiple songs)

---

## Cost discipline

| Engine | Per-render cost (estimate) | Iteration cap | Notes |
|---|---|---|---|
| nano banana 2 | $0.X (per image) | 5 iterations max | Cheap; iterate freely |
| Seedance 2 | $X.X (per video) | 3 iterations max | Mid-cost; curated |
| Higgsfield | $XX (per cinematic video) | 2 iterations max + Frank-review | Most expensive; cinematic-grade only |
| Remotion | ~$0 (render compute) | unlimited | Self-hosted; deterministic |

**Per-song asset budget cap:** $X (defined per persona's monetization stack ROI). Track via n8n cost-meter node.

---

## DNA reference set maintenance

The DNA-check classifier is only as good as the reference set. Maintain quarterly:

- Frank reviews flagged DNA-fail asset samples
- High-confidence-fail patterns added to refused-DNA list
- High-confidence-pass patterns added to positive reference set
- Reference-DNA-set is versioned (commits to `verticals/music-is/labels/<label>/personas/<persona>/assets/reference-images/`)

---

## Phase 0-1 manual-assisted mode

Before n8n flow ships (Phase 1):

1. `music-producer` (Sonnet) composes engine prompts manually
2. Frank invokes external engines (web UI for nano banana, Seedance, Higgsfield; CLI for Remotion)
3. Frank reviews output + DNA-checks himself
4. Asset paths manually written to catalog row via `/music-song` extension or direct edit
5. Bundle-complete declared by Frank when all formats present

This phase is slow (1-3h per asset bundle) but builds canon-discipline before automation.

---

## Phase 2+ autonomous mode

Once n8n flow ships:

1. `/music-song` triggers webhook
2. Flow runs autonomously
3. Frank notified on bundle-complete OR escalation
4. Target: <15min from Suno URL to bundle-complete (most cases)
5. Cinematic-grade Higgsfield render extends to ~30-60min for full song

**Phase 2 success criteria:**
- 30+ releases through autonomous pipeline (no manual intervention)
- DNA-check pass rate ≥85% first-attempt; ≥95% within 2 retries
- Mean time-to-bundle <15min for non-cinematic; <60min for cinematic-grade

---

## Failure modes + recovery

| Failure | Recovery |
|---|---|
| nano banana 2 API down | Fall back to manual mode; queue song for retry on API restore |
| Seedance 2 quality regression | Frank-review-mode override; pause autonomous render until QA |
| Higgsfield render timeout | Retry once with shorter prompt; if persistent, fall back to Seedance for that song |
| Remotion template breaks | Halt Canvas render leg; notify Frank; debug template; resume |
| DNA-check classifier false-positive | Frank manual-override; update reference set if pattern repeats |
| n8n flow halts mid-way | Recovery mode: detect partial completion, resume failed legs only |

---

## Composes with

- `music-is/asset-render` skill (this is its automation layer)
- `music-is/song-intake` (trigger source)
- `music-is/release-gate` (downstream consumer of bundle-complete)
- FrankX existing music infrastructure (asset paths can reference existing FrankX-produced assets when applicable)

---

**Built on SIP** — `verticals/music-is/workflows/asset-pipeline-n8n-spec.md` · v0.1 · 2026-04-29 · Phase 2 target · Autonomous render <15min · DNA-check + retry + escalation
