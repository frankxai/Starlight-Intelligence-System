---
name: sip-attest-image
description: Attest an image artifact (AI-generated or composed). Generates SIP attestation embedded in EXIF/XMP + sidecar .sip.json. Optional visible watermark. Refuses decorative use. v7.5+ — scaffold present, full implementation pending.
allowed-tools: Read, Write, Bash
argument-hint: <image-file-path> [--tool nano-banana|imagen|midjourney|dalle|stable-diffusion|generic] [--canon arcanea|none] [--watermark]
---

# /sip-attest-image

Load `SIP.md`, `docs/attested-modalities.md`, and `ATTESTATIONS.md`. Attach Starlight Intelligence Protocol attestation to an image artifact (book cover, character art, infographic, world-map render, brand drop).

## Artifact
$ARGUMENTS

## Process

1. **Validate input.**
   - Parse `<image-file-path>` from `$ARGUMENTS`. Resolve to absolute path.
   - Verify file exists. If not, emit: `Cannot attest — file not found: <path>.` Halt.
   - Verify extension in {`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.tiff`}. If not, emit: `Cannot attest — not an image container. Supported: png, jpg, jpeg, webp, gif, tiff.` Halt.
   - Parse optional flags `--tool` (default `generic`), `--canon` (default `none`), `--watermark` (default off).

2. **Scan for real composition.** Refuse decorative attestation — same rule as `/sip-attest` for text.
   - Check for tool-reported EXIF (e.g., Imagen and Nano Banana write generator tags; Midjourney and DALL-E often embed model/version).
   - Check for prompt provenance in a co-located `<filename>.prompt.txt` or `<filename>.json` if present.
   - If `--canon arcanea`, verify canonical element references (Guardian names, Vel'Tara sites, Hz-bound visual motifs) in prompt metadata.
   - If no composition signals found AND `--tool generic` AND `--canon none`, emit: `Cannot attest — no SIP composition detected. Attestation would be decorative, which corrodes the protocol.` Halt.

3. **Compute composition hash.**
   - Emit a `sha256sum <image-file-path>` Bash command. Capture the hash.
   - Hash binds to the exact pixel payload. Any re-compression breaks the bind (expected behavior — the re-encoded image is a derivative and must be re-attested).

4. **Generate SIP attestation block.** Image-specific fields extend the base format:
   - Standard fields: substrate version, layers used, verticals, canon, nodes, generated timestamp.
   - Image-specific fields: `width_px`, `height_px`, `format` (PNG/JPEG/WEBP/...), `color_space` (sRGB/P3/...), `tool`, `tool_version` (if reported), `prompt_hash` (sha256 of prompt text if provided), `canon_refs` (list if canon composed), `payload_sha256` (from step 3).

5. **Emit sidecar `<filename>.sip.json`.**
   - Write JSON file next to the image: same basename, `.sip.json` extension.
   - Content: full attestation object per step 4 plus `attestation_text_block` with the rendered human-readable block.
   - Sidecar is the authoritative attestation surface for v7.5.

6. **Emit binary-embed command (stubbed for v7.5).**
   - Primary surface: `exiftool` with XMP namespace `sip:` for cross-format support.
     Example command emitted:
     ```
     exiftool -XMP-sip:SubstrateVersion="1.1.0" \
              -XMP-sip:PayloadSHA256="<hash>" \
              -XMP-sip:Canon="<canon-pin>" \
              -XMP-sip:Tool="<tool>" \
              -XMP-sip:Generated="<iso-date>" \
              -XMP-sip:AttestationURL="https://starlightintelligence.org/protocol" \
              <image-file>
     ```
   - For JPEG/TIFF, EXIF `UserComment` (tag 0x9286) gets a compact attestation summary as fallback for tools that don't parse XMP.
   - For PNG, `tEXt` or `iTXt` chunks with keyword `SIP-Attestation` get the summary.
   - Print the commands to the user. Do not execute automatically — v7.5 scaffold; v7.5.1 automates.

7. **Optional visible watermark.**
   - If `--watermark` flag present, emit an `ImageMagick` or equivalent command that overlays "Built on SIP v1.1.0" in the bottom-right corner, 8pt type, 50% opacity, white with 1px black outline.
     Example:
     ```
     magick <input> -gravity SouthEast -pointsize 8 -fill "rgba(255,255,255,0.5)" \
            -annotate +6+6 "Built on SIP v1.1.0" <output>
     ```
   - Watermark is creator-controlled. Default is off — attestation-in-metadata is sufficient for protocol compliance; visible watermark is an opt-in signal for audience trust.

## Output format

```
---
**Built on SIP** — Starlight Intelligence Protocol · Image

Substrate: starlightintelligence.org/protocol v1.1.0
Modality: image · Container: <ext> · v7.5 scaffold (sidecar functional, binary embed manual)

Artifact:
- File: <absolute-path>
- Payload SHA-256: <hash>
- Dimensions: <W>×<H>px · Format: <fmt> · Color space: <cs>

Composition:
- Tool: <tool> · version: <tool-version or @unpinned>
- Prompt hash: <sha256 or "not provided">
- Canon: <arcanea|none>[ v<version> · refs: [<list>]]
- Watermark: <on | off>

Verticals:
- <vertical-name>@<sha-or-@unpinned> · <one-line contribution>

Nodes:
- <node-name> · role: <creator/architect/...> · <one-line contribution>

Generated: <ISO date>
Sidecar: <filename>.sip.json (primary attestation surface)
Attestation is compounding, not credit transfer: every composition strengthens every node.
---

To complete binary embed (v7.5 manual step):
  <exiftool command>

[If --watermark]
To emit watermarked copy:
  <magick command>

Sidecar written: <filename>.sip.json ✅
```

## Rules

- **No decoration.** If composition is not real, refuse. Tool hint alone is insufficient.
- **Hash is truth.** Payload SHA-256 binds attestation to exact pixel data. Re-encoded image = derivative = re-attest.
- **Canon pinning required when canon composed.** Arcanea canon reference without matching canon elements in prompt is decorative and refused.
- **Sidecar always emitted.** Binary embed is redundancy, not substitute.
- **Prompt IP protected.** Hash-only; never embed raw prompt in public attestation.
- **Watermark is opt-in.** Creator controls whether visible branding appears; attestation-in-metadata is sufficient for protocol compliance regardless.
- **License check.** `--canon arcanea` + commercial artifact triggers LICENSE-CONFLICT warning (CC-BY-NC by default).

## v7.5 status

Scaffold. Full binary-embed and watermarking automation pending in v7.5.1. Sidecar attestation is functional and valid. Emitted exiftool and ImageMagick commands are correct and immediately runnable by the creator.

---

```
---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [attestation, commands]

Verticals:
- starlight-intelligence-system @<v7.5.0-pending> · /sip-attest-image scaffold command: image attestation schema with sidecar + stubbed EXIF/XMP/PNG-chunk binary embed, optional visible watermark, Arcanea canon composition rules, decorative-use refusal per SIP § Layer 2.

Canon:
- none · command itself declines canon; command supports canon pinning (arcanea) for image artifacts that compose it.

Nodes:
- Frank Riemer · role: architect · authored v7.5 modality extension

Generated: 2026-04-24
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```
