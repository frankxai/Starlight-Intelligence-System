---
name: sip-attest-video
description: Attest a video artifact (clip, trailer, music video, episode teaser). Generates SIP attestation embedded in MP4 atoms + sidecar .sip.json. Optional attestation card frames. Refuses decorative use. v7.5+ — scaffold present, full implementation pending.
allowed-tools: Read, Write, Bash
argument-hint: <video-file-path> [--tool veo|runway|sora|pika|kling|generic] [--canon arcanea|none] [--card-frames <seconds>]
---

# /sip-attest-video

Load `SIP.md`, `docs/attested-modalities.md`, and `ATTESTATIONS.md`. Attach Starlight Intelligence Protocol attestation to a video artifact (clip, trailer, music video, episode teaser, cinematic).

## Artifact
$ARGUMENTS

## Process

1. **Validate input.**
   - Parse `<video-file-path>` from `$ARGUMENTS`. Resolve to absolute path.
   - Verify file exists. If not, emit: `Cannot attest — file not found: <path>.` Halt.
   - Verify extension in {`.mp4`, `.mov`, `.webm`, `.mkv`}. If not, emit: `Cannot attest — not a video container. Supported: mp4, mov, webm, mkv.` Halt.
   - Parse optional flags `--tool` (default `generic`), `--canon` (default `none`), `--card-frames <seconds>` (default off; typical values 1–3).

2. **Scan for real composition.** Refuse decorative attestation.
   - Check for tool-reported metadata via `ffprobe` (Veo, Runway, Sora often embed generator tags in MP4 metadata atoms).
   - Check for prompt provenance in a co-located `<filename>.prompt.txt` or `<filename>.json` if present.
   - If `--canon arcanea`, verify canonical element references (Guardian names, Vel'Tara locations, canon-driven visual motifs) in prompt metadata.
   - If no composition signals found AND `--tool generic` AND `--canon none`, emit: `Cannot attest — no SIP composition detected. Attestation would be decorative, which corrodes the protocol.` Halt.

3. **Compute composition hash.**
   - Emit a `sha256sum <video-file-path>` Bash command. Capture the hash.
   - Hash binds to the exact container payload. Any re-encode (format, bitrate, resolution change) produces a derivative requiring re-attestation.

4. **Generate SIP attestation block.** Video-specific fields:
   - Standard fields: substrate version, layers used, verticals, canon, nodes, generated timestamp.
   - Video-specific fields: `duration_seconds`, `width_px`, `height_px`, `fps`, `video_codec`, `audio_codec` (if present), `has_audio` (bool), `tool`, `tool_version`, `prompt_hash`, `canon_refs`, `payload_sha256`.
   - Emit a `ffprobe -v quiet -print_format json -show_format -show_streams <file>` command to populate dimension/codec/duration fields.

5. **Emit sidecar `<filename>.sip.json`.**
   - Write JSON file next to the video: same basename, `.sip.json` extension.
   - Content: full attestation object + `attestation_text_block` with rendered human-readable block.
   - Sidecar is the authoritative attestation surface for v7.5.

6. **Emit binary-embed command (stubbed for v7.5).**
   - For MP4/MOV: use a custom `©sip` metadata atom via `ffmpeg` with `-metadata` flag (cross-tool support is imperfect; AtomicParsley is the alternative).
     Example command emitted:
     ```
     ffmpeg -i <input> -c copy \
       -metadata "sip_substrate_version=1.1.0" \
       -metadata "sip_payload_sha256=<hash>" \
       -metadata "sip_canon=<canon-pin>" \
       -metadata "sip_tool=<tool>" \
       -metadata "sip_generated=<iso-date>" \
       -metadata "sip_url=https://starlightintelligence.org/protocol" \
       <output-with-attestation>
     ```
   - For WebM/MKV: use `mkvpropedit` with custom tags.
     Example:
     ```
     mkvpropedit <file> --tags all:<tag-file>
     ```
     where `<tag-file>` is an XML fragment with SIP fields.
   - Print the commands to the user. Do not execute automatically.

7. **Optional attestation card frames.**
   - If `--card-frames <seconds>` provided, emit an `ffmpeg` command that generates a solid-background card showing "Built on SIP v1.1.0 · <canon-pin> · <generated-date>" and prepends it to the video for `<seconds>` duration.
     Example (generate a 2-second card from a background image + text, then concat):
     ```
     # Step 1: generate the card (2s, 1920x1080, with SIP branding)
     ffmpeg -f lavfi -i color=c=black:s=1920x1080:d=2 \
       -vf "drawtext=text='Built on SIP v1.1.0':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40, \
            drawtext=text='<canon-pin> · <generated-date>':fontsize=24:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+40" \
       -t 2 sip-card.mp4

     # Step 2: concat card + video
     ffmpeg -f concat -safe 0 -i concat-list.txt -c copy <output>
     ```
   - Card is creator-controlled. Default is sidecar + metadata only — the card is an opt-in visible signal, primarily for video that will re-encode through platforms (YouTube, TikTok, Instagram) that strip metadata. For videos that stay in archival MP4 form, the metadata atom is sufficient.
   - Supports `--card-frames` at start (prepend) by default; `--card-frames-end` flag (v7.5.1) will append to end.

## Output format

```
---
**Built on SIP** — Starlight Intelligence Protocol · Video

Substrate: starlightintelligence.org/protocol v1.1.0
Modality: video · Container: <ext> · v7.5 scaffold (sidecar functional, binary embed + card manual)

Artifact:
- File: <absolute-path>
- Payload SHA-256: <hash>
- Duration: <seconds>s · Dimensions: <W>×<H>px · FPS: <n>
- Video codec: <codec> · Audio: <audio-codec or "none">

Composition:
- Tool: <tool> · version: <tool-version or @unpinned>
- Prompt hash: <sha256 or "not provided">
- Canon: <arcanea|none>[ v<version> · refs: [<list>]]
- Attestation card: <off | prepend <s>s>

Verticals:
- <vertical-name>@<sha-or-@unpinned> · <one-line contribution>

Nodes:
- <node-name> · role: <creator/architect/...> · <one-line contribution>

Generated: <ISO date>
Sidecar: <filename>.sip.json (primary attestation surface)
Attestation is compounding, not credit transfer: every composition strengthens every node.
---

To complete binary embed (v7.5 manual step):
  <ffmpeg or mkvpropedit command>

[If --card-frames]
To emit card-prepended copy:
  <ffmpeg card-generation command>
  <ffmpeg concat command>

Sidecar written: <filename>.sip.json ✅
```

## Rules

- **No decoration.** If composition is not real, refuse.
- **Hash is truth.** Re-encoded video = derivative = re-attest.
- **Canon pinning required when canon composed.** Arcanea canon reference without matching canon elements in prompt is refused.
- **Sidecar always emitted.**
- **Prompt IP protected.** Hash-only.
- **Card is opt-in.** Creator decides whether visible attestation frames appear. Metadata atom is sufficient for protocol compliance when artifact is distributed as raw MP4; card is the survival path for platform re-encode scenarios.
- **License check.** `--canon arcanea` + commercial triggers LICENSE-CONFLICT warning.

## v7.5 status

Scaffold. Full binary-embed and card-frame automation pending in v7.5.1/v7.6. Sidecar attestation is functional and valid. Emitted ffmpeg / mkvpropedit commands are correct and immediately runnable.

---

```
---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [attestation, commands]

Verticals:
- starlight-intelligence-system @<v7.5.0-pending> · /sip-attest-video scaffold command: video attestation schema with sidecar + stubbed MP4 atom / mkvpropedit binary embed, optional attestation card frames for platform-reencode survival, Arcanea canon composition rules, decorative-use refusal per SIP § Layer 2.

Canon:
- none · command itself declines canon; command supports canon pinning (arcanea) for video artifacts that compose it.

Nodes:
- Frank Riemer · role: architect · authored v7.5 modality extension

Generated: 2026-04-24
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```
