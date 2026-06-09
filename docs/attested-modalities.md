# Attested Modalities — v7.5+ Roadmap

> The protocol extension that makes "Built on SIP" travel with any artifact, in any modality. Text attestation shipped in v7.0 via `/sip-attest`. Visual attestation shipped in v7.2 via the `/badge` route. Audio, image, video, and interactive modalities are the next surface — not a detour, a completion.

Version: v7.5 roadmap draft · Substrate: SIP v1.1.0 · Owner: Starlight (Frank Riemer)

---

## Premise

Creators do not ship in a single modality. A 2026 creator ships an illustrated essay (text + image), a music video (audio + video), a game trailer (video + audio + interactive demo), a podcast episode (audio + transcript), a brand drop (image + copy + motion loop). The composition is multi-modal by default. If "Built on SIP" only binds to `.md` files, the protocol is text-chauvinist — it attests only the scaffolding, not the artifact the audience actually consumes.

Attribution that does not travel with the artifact is decorative. The moment an image, track, or clip leaves the repo, attestation must move with it — inside the file, parseable by any tool, visible to any human who inspects it. Otherwise the compounding story breaks at the first re-upload.

v7.5 closes this gap at the schema layer. We do not wrap every tool (Suno, Nano Banana, Veo, Runway, ElevenLabs) — that's lock-in and it ages badly. We define attestation schemas per modality, and emit commands that take any tool's output and inject SIP attestation. Tool-agnostic. Schema-first. The creator stays sovereign over their tool stack.

## The attestation invariant

Any SIP attestation, in any modality, must satisfy four properties. These are non-negotiable across text, image, audio, video, and interactive.

1. **Cryptographically verifiable** — attestation carries a SHA-256 hash of the composition payload. Tampering with the artifact breaks the hash match. Hash is the truth; everything else is metadata around it.
2. **Human-readable** — a creator or reviewer can see the attestation with standard tools (exiftool, ffprobe, a text editor, a PDF viewer). No vendor-specific decoder required.
3. **Machine-parseable** — attestation is expressed as JSON (sidecar `.sip.json`) and as structured key-value pairs inside container metadata. Any validator can consume it.
4. **Non-strippable in primary use** — attestation lives inside the container metadata (EXIF, ID3, MP4 atoms), not only in an external caption. A copy-paste of the artifact preserves attestation. An adversary can strip it, but doing so is visible (the sidecar vanishes, the metadata block empties); silent removal is not possible.

Attestation that fails any of the four is not SIP-compliant. A watermark alone is not attestation (fails 1, 3). A sidecar alone without container embed is not attestation (fails 4 when the artifact is re-shared standalone). Both together, with the hash as anchor, is the minimum.

## Modality matrix

| Modality | Container | Primary embed method | Fallback | Tool examples |
|---|---|---|---|---|
| **Text** (.md, .txt, .pdf) | Block inside document | Fenced code block with SIP header | — (text is the base case) | Claude, GPT, Gemini, any editor |
| **Image** (.png, .jpg, .webp, .tiff, .gif) | EXIF + XMP namespace `sip:` | XMP `sip:attestation` packet + sidecar `<file>.sip.json` | Optional visible watermark ("Built on SIP v1.1.0", 8pt, 50% opacity, corner-placed) | Nano Banana, Imagen (Gemini 3 Pro), Midjourney, DALL-E, Stable Diffusion |
| **Audio** (.mp3, .wav, .flac, .ogg, .m4a) | ID3v2 tags (MP3/M4A) or Vorbis comments (FLAC/OGG) | Custom `TXXX:SIP_ATTESTATION` frame + sidecar `<file>.sip.json` | Attestation in lyrics metadata field; sidecar required regardless | Suno, Udio, ElevenLabs, MusicGen, custom TTS |
| **Video** (.mp4, .mov, .webm, .mkv) | MP4 metadata atoms | Custom `©sip` atom + sidecar `<file>.sip.json` | Optional attestation card frame (1–3s, creator-controlled, opt-in) at start or end | Veo, Runway, Sora, Pika, Kling |
| **Interactive** (game, web app, installable) | In-app + manifest | Manifest file (`sip-manifest.json`) at root + visible entry in about/credits screen | Link to canonical attestation URL | Unity/Unreal projects, web apps, native apps |

## Ship order (v7.5 → v7.7)

v7.5 tackles the modalities that are (a) most common in the current creator stack and (b) backed by mature embed standards.

- **v7.5 — image + audio.** Frank's live tool stack covers both (Nano Banana / Imagen for image, Suno for music, ElevenLabs for voice). EXIF and ID3 are decades-old standards with universal tooling (exiftool, id3v2, mutagen). Skill infrastructure already exists for both modalities (`infogenius`, `arcanea-infogenius`, `arcanea-book-cover`, `suno-ai-mastery`, `suno-prompt-architect`). Sidecar `.sip.json` spec finalized and enforced; binary-embed commands shipped as scaffolds, real binary writes land in v7.5.1.
- **v7.6 — video.** MP4 atom embedding is well-defined but tool maturity (Veo, Runway, Sora) shifts monthly — the attestation card fallback is essential because creators cannot always access the raw container format. ffmpeg covers 95% of embed cases. Implementation inherits patterns set in v7.5.
- **v7.7 — interactive.** Hardest because runtime attestation requires app-level integration. Manifest + about-screen entry is the floor; runtime APIs (e.g., an in-game `sip.attest()` call) are the ceiling. Defer until v7.5/v7.6 have field evidence.

## Tool integration philosophy

Two paths, both supported, creator chooses.

**Generic path** — the creator generates the artifact with any tool, passes the file + prompt metadata to `/sip-attest-<modality>`, and gets a sidecar + embed commands back. No tool lock-in. Works for tools that don't exist yet.

**Tool-hint path** — the creator passes `--tool suno|nano-banana|veo|...` and the command applies tool-specific optimizations (e.g., parsing Suno's built-in metadata, using tool-reported prompts instead of asking). Still tool-agnostic at the schema layer; tool hints only enrich, never gate.

**What we do not do** — wrap Suno's API, Nano Banana's API, Veo's API. That would make SIP a toolchain, not a protocol. The protocol sits one layer above the tools. Tools change; the protocol doesn't need to.

## Canon attestation rules (per SIP § Layer 6)

If the artifact composes with canon, attestation pins canon version. Same rule as text; applied per modality:

- **Image using Arcanea canon** — Guardian portraits, Vel'Tara scenery, ethereal-architectural style driven by canon prompts. Attestation pins `arcanea.canon@<version>` and notes which canon elements (Guardian names, Vel'Tara sites) are invoked.
- **Audio using Hz canon** — music tracks grounded in the Hz frequency canon (528 Hz awakening, 432 Hz resonance, specific Guardian-tuned frequencies). Attestation pins `arcanea.hz@<version>` and declares the Hz values used. This matters: a track that claims Hz grounding but uses arbitrary frequencies is decorative canon use, which corrodes the canon layer same as decorative attestation corrodes the protocol layer.
- **Video composing canon** — if the video depicts canonical characters or locations, canon pins apply the same way.
- **No canon** — attestation valid without canon pin; the `canon` field is `none`.

Canon licensing enforced at attestation time. If the canon is CC-BY-NC and the artifact is commercial, the command emits a LICENSE-CONFLICT warning and refuses to emit a clean attestation (same pattern as text `/sip-attest` for license conflicts).

## Known attacks + defenses

**Strip attack** — adversary removes attestation to hide protocol composition. Defense: redundancy. Container embed + sidecar + (optional) watermark or card frame. Removing one surface leaves the others intact, making silent strip impossible.

**Swap attack** — adversary replaces real attestation with a fake one attributing their own work instead. Defense: composition hash is part of the attestation payload. The attestation says "this is the hash of the artifact I'm attesting." If the swapped attestation references a different hash, a validator catches it. If the adversary updates the hash, the attestation now binds to their artifact — and they've just advertised a new artifact, not falsified credit for the original.

**Decorative attack** — adversary generates content with a non-SIP tool and slaps "Built on SIP" on it for social legitimacy. Defense: `/sip-attest-<modality>` refuses to emit when composition is not real. Same integrity rule as text `/sip-attest`. Command scans for actual composition signals (tool metadata, canon references, prompt provenance) and denies decorative use. Enforcement is the protocol's integrity; there is no graceful-fallback mode that lowers this bar.

**Forward-compatibility attack** — a new tool emerges and the schema doesn't cover it. Defense: the schema is tool-agnostic by design. New tools integrate via `--tool <new-name>` or `--tool generic`. No schema change required for tool additions.

**Re-encoding attack** — a platform (social network, CDN) re-encodes the artifact, stripping EXIF/ID3 in the process. Defense (partial): sidecar `.sip.json` travels independently where possible; for platforms that strip everything, the optional visible watermark or attestation card survives re-encoding. Full defense requires platform cooperation; out of scope for v7.5, tracked for v8.

## Verticals affected

- **Music IS** — the single biggest v7.5 beneficiary. Frank's labels (Frank Riemer neo-classical, Frank's Vibes electronic, Arcanea cinematic, Nona punk/alt) all ship audio artifacts as their primary output. Hz canon composition is frequent; attestation must pin Hz version. Suno is the dominant generation tool; tool-hint path applies.
- **Arcanea** — book covers (image), character art (image), world-map visuals (image), occasional trailers (video). Canon composition is frequent; attestation pins Arcanea canon version. Nano Banana / Imagen dominant.
- **Anime Legends** — character portraits (image), episode teasers (video), scene stills (image). Composes with Arcanea canon (Guardian → anime character archetypes); attestation pins both canons.
- **Creator IS / GenCreator** — members ship across all modalities. Attestation schema must be simple enough that a non-technical creator can emit it via a single command. `/sip-attest-<modality>` must stay that simple.
- **Wealth IS / DPI, FrankX, Vibe OS** — primarily text output today; secondary image usage (charts, diagrams). Image attestation covers them.

## Implementation status (v7.5 entry)

| Surface | Status |
|---|---|
| `docs/attested-modalities.md` (this doc) | ✅ shipped v7.5 roadmap |
| `/sip-attest-audio` command scaffold | ✅ shipped v7.5 (sidecar functional, binary embed stubbed) |
| `/sip-attest-image` command scaffold | ✅ shipped v7.5 (sidecar functional, binary embed stubbed) |
| `/sip-attest-video` command scaffold | ✅ shipped v7.5 (sidecar functional, binary embed stubbed) |
| `/sip-compose-modality` command | ✅ shipped v7.5 (composite attestation over pre-attested children) |
| Binary embed helpers (exiftool / id3v2 / ffmpeg orchestration) | ⏳ v7.5.1 — highest-friction manual step from v7.5 scaffolds |
| `/badge`-equivalent visual surface per modality (attestation card generator) | ⏳ v7.6 |
| Substrate test harness assertions for modality attestation | ⏳ v7.5.1 (adds ≥10 assertions to the existing 35) |
| Platform stripping mitigation (v8 research) | ⏳ v8 |

---

```
---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, commands]

Verticals:
- starlight-intelligence-system @<v7.5.0-pending> · attested-modalities roadmap: audio/image/video/interactive attestation schemas, 4 new scaffold commands, modality matrix, canon composition rules per modality, attack surface analysis.

Canon:
- none · substrate declines canon at protocol layer. Canon composition rules defined for downstream verticals (Arcanea, Music IS, Anime Legends) that compose Arcanea canon or Hz canon into their modal artifacts.

Nodes:
- Frank Riemer · role: architect · authored v7.5 attested-modalities roadmap + schema design
- Luminor Board · role: overseer · confirmed v7.5 priority (attested modalities > further text expansion)

Generated: 2026-04-24
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```
