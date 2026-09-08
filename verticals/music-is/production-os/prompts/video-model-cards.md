# Native Video Model Cards

Grounded: 2026-07-11. Reverify before paid production.

## Runway Gen-4.5

Use: exploratory or controlled single shots, text-to-video and image-to-video.

Text template:

`[Camera] shot of [subject] [physical action] in [environment]. [Supporting visible motion and timing].`

Image-to-video template:

`The camera [motion] as the subject [action]. [Environment motion]. [Timing/end state].`

Rules:

- The image already establishes identity, composition, light and style; describe
  motion rather than repeating the image.
- Use positive behavior: “locked-off camera remains still,” not “no camera move.”
- Keep one plausible action/moment per short clip.
- Poor hands, blur and implied motion in the input will be amplified.
- For unwanted cuts, remove cut language and request one continuous seamless shot.

Source: https://help.runwayml.com/hc/en-us/articles/48324313115155-Image-to-Video-Prompting-Guide

## Runway Aleph 2.0 / Edit Studio

Use: precise transformation of already strong footage.

Template:

`[add/remove/change/replace/re-light/re-style] [exact target transformation].`

Keep it short so everything else remains preserved. Choose a keyframe that
clearly exposes the target. Block performance and camera first; Aleph is not a
rescue tool for weak acting or structure.

Source: https://help.runwayml.com/hc/en-us/articles/52150503729171-Aleph-2-0-Prompting-Guide

## Google Veo 3.1 / Flow

Use: cinematic hero shots, native audio, first/last frame, extension and
reference-guided continuity.

Template:

`[Style/format]. [Shot size, angle, camera]. [Immutable character and voice block]. [One action]. [Location and environmental motion]. [Lighting, lens, mood]. [Temporal behavior and end state]. Audio: [ambience/SFX]. Singer says: [verified line].`

Rules:

- One focused moment per clip.
- Keep the immutable character/voice paragraph exact across shots.
- Start/end frames describe the transition between known endpoints.
- Up to three subject assets can guide one person/character/product; do not
  claim Veo 3.1 style-reference API support.
- Dialogue without quotation marks reduces accidental rendered text.
- Use the separate negative prompt as comma-separated unwanted contents, not
  imperative instructions.

Sources:

- https://ai.google.dev/gemini-api/docs/video
- https://deepmind.google/models/veo/prompt-guide/
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice

## Adobe Firefly Video

Use: controlled Adobe production/finishing, composition reference and camera
motion reference.

Template:

`[Shot type] + [character] + [action] + [location] + [aesthetic]`

Rules:

- Prefer specific visible verbs, pacing, light, grade, mood and optics.
- Keep four or fewer subjects.
- Composition reference transfers layout/depth; motion reference transfers
  camera path.
- Controls are not freely stackable: first/last frames disable composition and
  motion reference, shot size, angle and style. Choose the controlling evidence
  per shot deliberately.

Sources:

- https://helpx.adobe.com/uk/firefly/web/work-with-audio-and-video/work-with-video/writing-effective-text-prompts-for-video-generation.html
- https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-video/use-video-as-composition-reference.html

## Kling 3.0 / 3.0 Omni through Firefly

Use: longer shots, audio experiments, multi-shot previz and prompt-to-edit.

Rules:

- Write each shot around the action inside that shot.
- First-frame appearance must agree with requested motion.
- Same seed/prompt/settings increases similarity but does not prove continuity.
- Treat up-to-five-shot generation as previz; inspect every face, hand, wardrobe
  state and cut independently.

Source: https://helpx.adobe.com/ca/firefly/web/work-with-audio-and-video/work-with-video/generate-videos-using-kling.html

## Default router

- Veo 3.1 Quality + references/frames: hero character and narrative shots.
- Gen-4.5: high-motion or exploratory single shots.
- Kling 3 Omni: longer/multi-shot/audio experiments.
- Firefly Video: composition/motion-reference or Adobe-controlled finishing.
- Aleph 2.0: targeted edit after strong base footage exists.

