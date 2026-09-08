# Agentic Record Studio Operating Model

Status: local-first implementation contract
Updated: 2026-07-11

Extend Music IS and the existing Agentic Music OS plugin. Do not create a
parallel record-studio plugin until a stable external tool integration, hook,
or UI surface requires packaging beyond the current plugin.

## Stage and skill routing

| Stage | Primary capability | Use it for | Model posture |
| --- | --- | --- | --- |
| Brief / new song | `music-is/suno-prompt` + Suno Release Ops | Simple or Custom prompt pack, title, controlled variants | Small/fast model; frontier only for difficult lyric or identity decisions |
| Intake | Agentic Music OS + `audio-intake.py` | hash, metadata, loudness, waveform, lyrics draft, tempo/key estimates | Deterministic tools + cached `faster-whisper-base` CPU int8; no general LLM |
| A&R | Agentic Music OS release gate | observed facts, persona fit, rights, revisions | Frontier judgment model after facts exist |
| Cover | Premium Visual Design + image generation | concept frame and 3000-square cover | Image model; inspect and score every export |
| Canvas / teaser | Motion Director → Motion Media Producer → Remotion | 3–8s loop, 30s vertical, full visualizer template | Code/render tools; no LLM per frame |
| Distribution | Agentic Music OS | local DistroKid/Spotify/YouTube/Bandcamp packet | Small model for form normalization; human submits |
| Launch | Multi-Brand Social OS / music amplifier | hook matrix and platform-native edits | Small model drafts; human approval before external send |
| Observe | Music archivist + analytics | catalog truth, metrics, 7/30-day retro | Deterministic ingestion; small model synthesis |

## Token-efficient router

1. Run deterministic extraction before any model.
2. Retrieve only one relevant knowledge reference and one persona/label canon.
3. Use a small/fast model for schema normalization, prompt compression, captions,
   and platform copy.
4. Escalate to a frontier model only for A&R, artist naming, rights ambiguity,
   major partnership/licensing terms, or conflicting evidence.
5. Cache transcript, analysis JSON, selected hooks, and approved copy; never ask
   another model to rediscover them from the full audio.

## Music-video quality gate

Remotion is the edit, typography, audio, and delivery layer. It is not, by
itself, an art direction or a substitute for cinematography.

1. Start with the song evidence: hook window, lyric truth, energy curve, and a
   one-sentence emotional thesis.
2. Write a treatment and timed shot progression before generating or editing.
3. A cinematic short needs either native motion footage or at least four
   meaningfully distinct, visually coherent premium source shots. A single
   poster with camera drift is allowed only when the approved concept is
   explicitly a one-take visualizer.
4. Generate or source plates as Tier A/B assets, inspect them together as a
   contact sheet, and reject incoherent anatomy, lighting, palette, or visual
   grammar before animation.
5. Use Motion Director for thesis and beat structure, Motion Media Producer for
   the production plan, image/video generation for the picture, Remotion for
   timing and finishing, and Motion Taste Critic as the release gate.
6. Render the encoded master, not just stills. Verify duration, dimensions,
   codecs, audio, every cut boundary, safe areas, and representative frames.
7. Important visual work ships only at 26/30 or better. A spec, source file, or
   successful render command is not evidence of visual quality.
8. Preserve rejected versions in the manifest as rejected; never silently call
   them verified after the creative direction changes.

## Market-competitive release gate

The 30-point visual gate is necessary but not sufficient. Before a flagship
music asset is called release-ready, score it out of 100:

- Scroll stop and first 1.5 seconds: 15
- Emotional specificity and meaning: 15
- Artist/persona recognizability: 15
- Native motion, performance, and temporal continuity: 15
- Editorial rhythm and ending: 10
- Platform-native participation behavior: 10
- Variant/reuse system: 10
- Technical finish: 5
- Rights, provenance, and disclosure readiness: 5

Thresholds: below 60 = restart; 60–79 = internal prototype; 80–89 = bounded
platform test; 90+ = flagship candidate. A zero in artist recognizability,
rights, or native motion blocks flagship status regardless of total.

Build hook tests before the master. A default release campaign needs at least
four meaningfully different openings, one repeatable audience behavior, and a
single source graph that can produce flagship, short-hook, performance, POV,
creator-template, Canvas, cover, and process-proof variants.

## Integration reality

- Suno: product/UI-first. Track files, prompts, lineage, and rights proof; treat
  unofficial cookie wrappers as experimental.
- DistroKid: prepare and validate locally. No stable public self-serve upload API
  was verified. Human submits the upload form and backfills ISRC/UPC.
- Spotify: Web API supports catalog/playback surfaces, not Canvas upload. Canvas,
  Clips, artist profile, and editorial pitch remain Spotify for Artists actions.
- Social: prepare drafts and edits locally. Posting, DMs, spend, and account
  creation remain human-gated.

## Release minimum

- Lossless master preferred; MP3 is review evidence only.
- Verified lyrics and explicit status.
- Artist/persona and label canon lock.
- Rights, AI credits, samples, vocal consent, credits, and 100% split.
- 3000×3000 RGB JPG cover.
- 7.9s textless vertical Canvas and one 15–30s vertical hook edit.
- DistroKid packet created at least four weeks before the target release when a
  coordinated date and Spotify pitch matter.
- No external release claim until live identifiers are backfilled.

## Durable research lanes (run when swarm admission allows)

1. Suno official feature/prompt/rights watch.
2. Studio craft: arrangement, vocal production, mix/master, stem, and QC SOPs.
3. Distribution/legal: DistroKid, DSP metadata, publishing, AI disclosure,
   licensing, and jurisdiction-specific counsel questions.
4. Growth: Spotify/TikTok/YouTube/Instagram/CapCut hook experiments and telemetry.
5. Product: artist sites, commerce, fan CRM, sync dossier, royalty graph, and
   adopter-facing studio interface.

Every lane returns sources, dated claims, artifacts, decisions, risks, and the
next bounded task. New external sends, money paths, legal conclusions, and
publishing always require human approval.
