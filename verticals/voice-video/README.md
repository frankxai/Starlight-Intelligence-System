# Voice & Video IS — Narrative Media Intelligence

> Intelligence System layer 8 (per `MASSIVE_ACTION_PLAN.md` § 2). Voice cloning, talking-head pipelines, podcast architecture, video factory operations, ElevenLabs / Suno / Veo orchestration. Composes Creator IS with the modality attestation commands.

**Tier:** Universal Intelligence System layer.
**License:** MIT for substrate-aligned reference patterns.
**Status:** `scaffolded — v0.1` (this directory). Modality attestation commands shipped in v7.3.1 (`/sip-attest-audio`, `/sip-attest-video`, `/sip-compose-modality`).

---

## What Voice & Video IS does

Voice & Video IS is the layer where text becomes voice and voice becomes video — with attestation surviving every transform. The IS owns:

- **Voice production.** ElevenLabs voice clones, Suno music generation, Whisper transcription, narration pipelines. All attested via `/sip-attest-audio`.
- **Video production.** Talking-head, b-roll, animation, Remotion templated, Veo / Runway / Sora generation. All attested via `/sip-attest-video`.
- **Composite media.** Multi-modal compositions (music video, podcast with chapters, narrated explainer) attested via `/sip-compose-modality`.
- **Catalog architecture.** Catalog compounding logic shared with Music IS — both verticals compose into Arcanea Records' catalog when canon-aligned.
- **Local voice room** (Phase 2). HavenCore-style local voice loop + ElevenLabs TTS for the Orchestrator's voice mode.

---

## Composition with the rest of the 10-IS stack

| Composes with | Why |
|---|---|
| **Self / Genius IS** | Voice samples drive every TTS render — never generic. |
| **Brand IS** | Voice & video express the brand voice rules at modality scale. |
| **Creator IS** | Voice & Video IS is where Creator IS's text pipelines render to audio/video. |
| **Code IS** | Production pipelines run as code (Remotion, ffmpeg, exiftool). |
| **Music IS** (sovereign vertical) | Catalog compounding via Arcanea Records labels. |

---

## Primary commands

- **`/sip-attest-audio`** — attest a music track / voice-over / podcast / soundscape (Suno, Udio, ElevenLabs, MusicGen).
- **`/sip-attest-video`** — attest a video clip / trailer / music video / episode teaser (Veo, Runway, Sora, Pika).
- **`/sip-compose-modality`** — composite attestation for multi-modal artifacts.
- **`/factory`** — content publishing pipeline (existing FrankX command, composes here).
- **Skills:** `suno-ai-mastery`, `suno-prompt-architect`, `arcanea-book-cover` (image-side modality counterpart), `algorithmic-art`, `ui-ux-pro-max`.

---

## Refusal patterns

- Decorative attestation on artifacts that didn't actually compose with SIP.
- Voice cloning without consent verification at session start.
- Synthetic-voice-as-real-voice claims (every Voice & Video IS artifact discloses the modality stack used).
- Stripping attestation footers / sidecar files during post-production.
- Generating in-character voice for protected-class identities (race, gender, real-named individuals) without explicit pre-approval.

---

**Built on SIP** — Voice & Video IS reference · v0.1 · SIP v1.1.0
