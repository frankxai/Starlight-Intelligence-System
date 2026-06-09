---
name: creator-pipeline
description: Generate a multi-modal content pipeline from a person's Genius Profile. Produces content calendar, per-piece production plan across text/audio/image/video/podcast, and attestation routing. Composes with existing modality commands + ACOS pipeline where available.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <person-name> [cadence: daily|weekly|biweekly] [modalities: text,audio,image,video,podcast — default: text,image]
---

# /creator-pipeline

Load `SIP.md`, `VERTICALS.md`, `VOICES.md`, `genius/profile-<person-slug>.md`, `genius/freedom-path-<person-slug>.md`, and any brand/voice files under `creator/brand-<person-slug>.md` or `creator/voice-<person-slug>.md` if they exist. Generate a multi-modal content pipeline grounded in the person's Genius Profile — not generic content themes.

## Input
$ARGUMENTS

## When this command fires

- A person has completed `/discover-genius` and has a Genius Profile on file.
- They want to turn frameworks → content stream, not one-off posts.
- They want attestation-aware production (every piece ships with "Built on SIP" or sidecar).

## When this command does NOT fire

- No Genius Profile exists → halt and route to `/discover-genius`.
- Single artifact being shipped → use `/sip-attest` (or modality-specific attest) directly.
- Pillar already has 3+ pieces shipped and needs a reusable template → use `/content-systemize`.

## Process

1. **Validate Genius Profile exists.**
   - Resolve `<person-slug>` from `<person-name>` (lowercase, hyphenated).
   - Check for `genius/profile-<person-slug>.md`.
   - If not present, halt with: `Run /discover-genius <person> first — content pipeline without genius excavation ships generic content.`
   - Parse optional cadence arg (default `weekly`) and modalities list (default `text,image`).

2. **Extract seed concepts from Frameworks list.**
   - Each framework in the Profile becomes a potential content seed.
   - Typical shape: 5-10 frameworks → 50-100 pieces of content over 6 months.
   - Map:
     - Framework 1 → Pillar 1 (primary content theme)
     - Framework 2 → Pillar 2
     - ...
     - Cross-domain synthesis (what only this person can say) → Flagship content
   - If Profile has fewer than 3 frameworks, halt: `Profile too thin — run /discover-genius to deeper pass before pipelining.`

3. **Modality fit per pillar.**
   - For each pillar, read the Profile's voice samples and recommend modalities:
     - Voice samples heavy on written prose → lead with text + image derivatives
     - Voice samples heavy on spoken/conversational → lead with audio/podcast + text transcripts
     - Framework inherently visual (process diagrams, mental models) → lead with image + video
     - Framework story-driven → lead with audio/podcast + essay
   - Intersect with requested modalities arg. Never force a modality the profile does not support — note it as "experimental" if requested but not voice-aligned.

4. **Cadence plan — 12-week calendar.**
   - Based on cadence arg, produce a 12-week publishing schedule.
   - Each week has:
     - One anchor piece (long-form — essay, podcast episode, or video; 1500-3000 words or 15-30 min)
     - 2-4 atomic pieces (social cards, image cards, clips derived from anchor)
     - One evergreen library piece (framework documentation, tutorial — slow-decay content)
   - Weeks 4, 8, 12 are flagship slots (highest-leverage cross-domain synthesis).

5. **Per-piece production plan.** For each piece on the calendar, produce:
   - Title (draft — use formulas if `/content-systemize` exists for the pillar)
   - Pillar + framework source
   - Modality (primary + derivatives)
   - Tool mapping: Suno for audio, Nano Banana for hero image, Veo for short video, Claude for draft text, ElevenLabs for voice-over, Remotion for programmatic video
   - Attestation route (which `/sip-attest-*` command stamps this)
   - Estimated production time (in hours)

6. **Voice-clone guardrails.**
   - Every piece must pass: "Does this sound like <person> or like generic content?"
   - Pipeline includes a voice-check gate — the operator (or an Envoy agent if configured) reviews every AI-drafted piece against the Profile's voice samples BEFORE attestation stamp.
   - Pieces that don't pass get rewritten, not shipped. No exceptions.

7. **Attestation routing.** Each modality routes to its correct attestation command:
   - Text → `/sip-attest <path>`
   - Audio → `/sip-attest-audio <path> --tool <tool> [--canon <canon>]`
   - Image → `/sip-attest-image <path> --tool <tool>`
   - Video → `/sip-attest-video <path> --tool <tool>`
   - Multi-modal (e.g., music video, podcast with show art) → `/sip-compose-modality <manifest>`
   - Every piece in the pipeline has an attestation route. No un-stamped content ships.

8. **Emit Pipeline document.**
   - Write to `creator/pipeline-<person-slug>.md`.
   - Create the `creator/` directory if missing.
   - Output format below.

## Output format

```
# Creator Pipeline — <Person Name> — <YYYY-MM-DD> (v1.0)

## Premise
<2-3 sentences in <person>'s voice — what this pipeline ships, why it's aligned with their genius, what the audience gets>

## Pillars (from Genius Profile frameworks)

### Pillar 1 — <framework name>
- **Thesis**: <one sentence>
- **Primary modality**: <text | audio | image | video | podcast>
- **Derivative modalities**: <list>
- **Attestation route**: <command>
- **Example first piece**: <title>

### Pillar 2 — ...
...

### Flagship — <cross-domain synthesis>
- **Why flagship**: <this is what only <person> can say — intersection of N domains>
- **Format**: <likely a long essay + podcast + keynote; highest leverage piece>
- **Release**: <piece 4, 8, or 12 in the calendar>

## 12-week calendar

| Week | Anchor (long-form) | Atomics (short) | Evergreen (library) |
|------|--------------------|-----------------| --------------------|
| 1    | <title> — <modality> | <3-4 pieces> | <framework doc> |
| 2    | ... | ... | ... |
| ... |
| 12   | ... | ... | ... |

## Per-piece production plans

### Week 1 · Anchor: "<title>"
- **Pillar**: 1 — <framework>
- **Modality**: <primary>
- **Derivatives**: <list>
- **Production**:
  - Draft: Claude (voice-cloned from Profile samples)
  - Audio (if applicable): Suno prompt — <one-line brief>
  - Image: Nano Banana hero image — prompt <one-line brief>
  - Video (if applicable): Veo 30-sec cut from anchor
- **Voice check**: Envoy reviews against samples <sample IDs>
- **Attestation**: `/sip-attest <path>` (or modality-specific)
- **Estimated time**: <hours>

### Week 1 · Atomic 1: "<title>"
...

(continue for all 12 weeks — weeks 5-12 can be abbreviated with "see week N template" after a pattern stabilizes)

## Voice guardrails
<list of voice rules extracted from Profile — e.g., "first-person only", "no listicles", "one framework per piece", "technical warmth — like an architect over coffee", "never apologize for expertise">

## Attestation policy
Every piece ships with "Built on SIP" block (for text) or sidecar `.sip.json` (for media). No exceptions. Voice-check gate runs before stamp. Commercial artifacts using Arcanea canon trigger LICENSE-CONFLICT review.

## ACOS integration
<If ACOS commands exist (content-studio, generate-images, factory, publish, create-music, generate-social), route derivative production through them. Primary anchors stay in SIS; ACOS handles publishing automation. Explicit command mappings:
- Atomic social → /generate-social
- Hero images → /generate-images
- Music seeds → /create-music
- Weekly batch publish → /factory + /publish-content>

## Next commands
1. `/content-systemize <person> <pillar>` — take a pillar and turn it into reusable templates once 3+ pieces have shipped
2. `/sip-attest` (and variants) — stamp each piece as it ships
3. `/alliance-forge` — if pipeline requires collaborators (editor, designer, audio engineer)

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha) · creator-is (playbook layer)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never** ship a pipeline without Genius Profile input. Halt and route to `/discover-genius`.
- **Never** ship generic content themes — every pillar maps to a specific framework in the person's Profile.
- **Voice-check gate is non-negotiable.** Pieces that don't pass get rewritten, not shipped. The pipeline's entire value is that content sounds like the person, not like AI.
- **Every piece has an attestation route.** No un-stamped content from the pipeline. If a piece can't be stamped, it can't ship from the pipeline.
- **Sovereignty:** the pipeline is the person's. They can delete, modify, or republish anywhere. Starlight compounds via attestation, not ownership.
- **Modality choice is advisory.** The person can override based on what they actually enjoy shipping — joy is a production multiplier.
- **Cadence is ambitious but honest.** If the person can't realistically sustain weekly anchors, downgrade to biweekly. Unshipped content is worse than less content.
- **Flagship slots stay sacred.** Weeks 4, 8, 12 are reserved for the cross-domain synthesis only this person can ship. Don't dilute them with standard pillar content.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha) · creator-is (playbook layer)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
