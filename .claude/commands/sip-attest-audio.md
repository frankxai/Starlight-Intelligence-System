---
name: sip-attest-audio
description: Attest an audio artifact (music track, voice-over, podcast, soundscape). Generates SIP attestation embedded in ID3 tags + sidecar .sip.json. Refuses decorative use. v7.5+ — scaffold present, full implementation pending.
allowed-tools: Read, Write, Bash
argument-hint: <audio-file-path> [--tool suno|udio|elevenlabs|musicgen|generic] [--canon hz|arcanea|none]
---

# /sip-attest-audio

Load `SIP.md`, `docs/attested-modalities.md`, and `ATTESTATIONS.md`. Attach Starlight Intelligence Protocol attestation to an audio artifact (track, voice-over, podcast episode, soundscape).

## Artifact
$ARGUMENTS

## Process

1. **Validate input.**
   - Parse `<audio-file-path>` from `$ARGUMENTS`. Resolve to absolute path.
   - Verify file exists. If not, emit: `Cannot attest — file not found: <path>.` Halt.
   - Verify extension in {`.mp3`, `.wav`, `.flac`, `.ogg`, `.m4a`}. If not, emit: `Cannot attest — not an audio container. Supported: mp3, wav, flac, ogg, m4a.` Halt.
   - Parse optional flags `--tool` (default `generic`) and `--canon` (default `none`).

2. **Scan for real composition.** Refuse decorative attestation — same rule as `/sip-attest` for text.
   - Check for tool-reported metadata (e.g., Suno embeds prompt + model ID in ID3; ElevenLabs sets generator tags).
   - Check for prompt provenance in a co-located `<filename>.prompt.txt` or `<filename>.json` if present.
   - Check for canon references — if `--canon hz`, verify a Hz grounding declaration is present (Hz values used in the track, stated in prompt or metadata). If `--canon arcanea`, verify canonical element references (Guardian names, Vel'Tara sites) in prompt or metadata.
   - If no composition signals found AND `--tool generic` AND `--canon none`, emit: `Cannot attest — no SIP composition detected. Attestation would be decorative, which corrodes the protocol.` Halt.
   - Tool hint alone is not composition — tool + prompt + (optional) canon together are.

3. **Compute composition hash.**
   - Emit a `sha256sum <audio-file-path>` Bash command. Capture the hash.
   - This hash is what the attestation binds to. Tampering with the audio payload breaks the bind.

4. **Generate SIP attestation block.** Audio-specific fields extend the base `/sip-attest` format:
   - Standard fields: substrate version, layers used, verticals, canon, nodes, generated timestamp.
   - Audio-specific fields: `duration_seconds`, `sample_rate_hz`, `channels`, `tool`, `tool_version` (if reported), `prompt_hash` (sha256 of the prompt text if provided; not the prompt itself, to preserve prompt IP), `canon_refs` (list of canon elements if canon composed), `payload_sha256` (from step 3).
   - If `--canon hz`, add `hz_values` field listing the Hz values claimed (e.g., `[528, 432]`).

5. **Emit sidecar `<filename>.sip.json`.**
   - Write JSON file next to the audio: same basename, `.sip.json` extension.
   - Content: full attestation object per step 4 plus an `attestation_text_block` field with the rendered human-readable block (matching `/sip-attest` format).
   - This sidecar is functional today. It is the primary attestation surface for v7.5.

6. **Emit binary-embed command (stubbed for v7.5).**
   - For `.mp3` / `.m4a`: emit the `id3v2` or `eyeD3` command that writes a custom `TXXX:SIP_ATTESTATION` frame containing a summary of the attestation (substrate version, payload hash, canon pin, tool, generated timestamp).
     Example: `eyeD3 --add-comment "<summary>:SIP:eng" <file>` or the equivalent Python `mutagen` snippet.
   - For `.flac` / `.ogg`: emit the `metaflac --set-tag="SIP_ATTESTATION=<summary>" <file>` command.
   - For `.wav`: emit the note that WAV has limited native tagging; attestation lives in sidecar only unless the creator converts to a tagged container.
   - Print the command to the user. Do not execute automatically — this is a scaffold; the creator runs the binary-embed step manually in v7.5. v7.5.1 will wrap these in direct tool invocations.

## Output format

```
---
**Built on SIP** — Starlight Intelligence Protocol · Audio

Substrate: starlightintelligence.org/protocol v1.1.0
Modality: audio · Container: <ext> · v7.5 scaffold (sidecar functional, binary embed manual)

Artifact:
- File: <absolute-path>
- Payload SHA-256: <hash>
- Duration: <seconds>s · Sample rate: <Hz> · Channels: <n>

Composition:
- Tool: <tool> · version: <tool-version or @unpinned>
- Prompt hash: <sha256 or "not provided">
- Canon: <hz|arcanea|none>[ v<version> · Hz values: [<list>] or refs: [<list>]]

Verticals:
- <vertical-name>@<sha-or-@unpinned> · <one-line contribution>

Nodes:
- <node-name> · role: <creator/architect/...> · <one-line contribution>

Generated: <ISO date>
Sidecar: <filename>.sip.json (primary attestation surface)
Attestation is compounding, not credit transfer: every composition strengthens every node.
---

To complete binary embed (v7.5 manual step):
  <emitted shell command>

Sidecar written: <filename>.sip.json ✅
```

## Rules

- **No decoration.** If composition is not real (no tool hint with prompt, no canon reference), refuse. Same integrity bar as text `/sip-attest`.
- **Hash is truth.** Payload SHA-256 is the anchor. Every other field is metadata around it.
- **Canon pinning required when canon composed.** Hz canon use with arbitrary frequencies is decorative canon composition and is refused.
- **Sidecar always emitted.** Even when binary embed is stubbed, the sidecar `.sip.json` is the authoritative attestation and is fully valid today.
- **Prompt IP protected.** Attestation carries the sha256 of the prompt, not the prompt text. Creators retain prompt sovereignty; attestation only proves the prompt existed at attestation time.
- **License check.** If `--canon arcanea` and artifact is commercial, emit LICENSE-CONFLICT warning (Arcanea canon is CC-BY-NC by default).

## v7.5 status

Scaffold. Full binary-embed automation pending in v7.5.1. Sidecar attestation is functional and valid. The emitted binary-embed commands are correct and can be run by the creator manually today; the v7.5.1 release will execute them inside the command itself.

---

```
---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [attestation, commands]

Verticals:
- starlight-intelligence-system @<v7.5.0-pending> · /sip-attest-audio scaffold command: audio attestation schema with sidecar + stubbed ID3/Vorbis binary embed, canon composition rules (Hz, Arcanea), decorative-use refusal per SIP § Layer 2.

Canon:
- none · command itself declines canon; command supports canon pinning (hz, arcanea) for audio artifacts that compose it.

Nodes:
- Frank Riemer · role: architect · authored v7.5 modality extension

Generated: 2026-04-24
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```
