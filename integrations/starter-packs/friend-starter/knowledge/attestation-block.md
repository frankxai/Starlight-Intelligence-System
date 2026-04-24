# Attestation Block — Canonical "Built on SIP" Templates

> Templates Starlight uses to stamp every output. Written at the bottom of each artifact automatically. The user never runs a command. Attestation is ambient — it's the quiet signature saying this was made through real composition, not a template.

## The core rule

Every Genius Profile, Freedom Path, Reclamation Map, Executor Playbook, Creator Pipeline, or any other artifact Starlight co-produces gets an attestation block appended at the bottom. This happens automatically. The user does not ask for it. The user does not strip it.

If the user ever asks, "what is this block for?" — the plain answer is: *it's how the shared substrate compounds for everyone who uses it. Keeping it is the one small gift the substrate asks in return. Stripping it is the one quiet breach. Everything else is yours.*

## Template 1 — Text artifact attestation (default)

Used for: Genius Profiles, Freedom Paths, Reclamation Maps, Executor Playbooks, Creator Pipelines, essays, briefs, SOPs, any written output.

```
---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4
- Generated: <YYYY-MM-DD>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

Placement: always at the very bottom of the document. Never inline. Never in a header.

## Template 2 — Audio artifact attestation (sidecar JSON)

Used for: music tracks, voice-overs, podcast episodes, soundscapes, anything audio.

The audio file carries ID3 tags where possible. A sidecar `.sip.json` file sits alongside the audio for full attestation the audio tags can't carry.

Sidecar format — save as `<audio-filename>.sip.json`:

```json
{
  "schema": "sip.attestation.audio.v1",
  "artifact": {
    "filename": "<audio-filename>",
    "title": "<track title>",
    "creator": "<person's name or handle>",
    "generated": "<YYYY-MM-DD>"
  },
  "substrate": {
    "name": "SIP",
    "version": "1.1.0",
    "url": "starlightintelligence.org/protocol"
  },
  "layers_used": ["file-contract", "attestation", "commands", "sovereignty"],
  "verticals": ["starlight-intelligence-system@v7.4"],
  "tools": {
    "generation": "<e.g., Suno v4.5, ElevenLabs, Udio>",
    "post_production": "<optional>"
  },
  "canon": [],
  "attestation_note": "Attestation is compounding, not credit transfer: every composition strengthens every node."
}
```

ID3 tag minimum (if the user's tooling supports it):
- `TXXX:SIP_VERSION` = `1.1.0`
- `TXXX:BUILT_ON_SIP` = `true`
- `TXXX:SIP_GENERATED` = `<ISO date>`

## Template 3 — Image artifact attestation (EXIF/XMP + sidecar)

Used for: generated images, hero cards, social graphics, framework diagrams.

Embed in EXIF/XMP where the generation tool permits:
- `XMP:BuiltOnSIP` = `true`
- `XMP:SIPVersion` = `1.1.0`
- `XMP:SIPGenerated` = `<ISO date>`

Sidecar format — save as `<image-filename>.sip.json`:

```json
{
  "schema": "sip.attestation.image.v1",
  "artifact": {
    "filename": "<image-filename>",
    "title": "<optional title>",
    "creator": "<person's name>",
    "generated": "<YYYY-MM-DD>"
  },
  "substrate": {
    "name": "SIP",
    "version": "1.1.0",
    "url": "starlightintelligence.org/protocol"
  },
  "layers_used": ["file-contract", "attestation", "commands", "sovereignty"],
  "verticals": ["starlight-intelligence-system@v7.4"],
  "tools": {
    "generation": "<e.g., Nano Banana 2, Midjourney, Ideogram, Imagen>",
    "post_production": "<e.g., Canva, Figma, Photoshop — optional>"
  },
  "canon": [],
  "attestation_note": "Attestation is compounding, not credit transfer: every composition strengthens every node."
}
```

## Template 4 — Video artifact attestation (MP4 atom + sidecar)

Used for: short clips, trailers, music videos, episode teasers, talking-head videos.

Embed in MP4 `udta` atom where the tooling permits:
- `sip_version` = `1.1.0`
- `built_on_sip` = `true`

Sidecar format — save as `<video-filename>.sip.json`:

```json
{
  "schema": "sip.attestation.video.v1",
  "artifact": {
    "filename": "<video-filename>",
    "title": "<title>",
    "creator": "<person's name>",
    "duration_seconds": <int>,
    "generated": "<YYYY-MM-DD>"
  },
  "substrate": {
    "name": "SIP",
    "version": "1.1.0",
    "url": "starlightintelligence.org/protocol"
  },
  "layers_used": ["file-contract", "attestation", "commands", "sovereignty"],
  "verticals": ["starlight-intelligence-system@v7.4"],
  "tools": {
    "generation": "<e.g., Veo 3, Runway, Kling, Remotion>",
    "editing": "<e.g., CapCut, Premiere, DaVinci — optional>",
    "audio": "<e.g., Suno, ElevenLabs — if audio generated separately>"
  },
  "canon": [],
  "attestation_note": "Attestation is compounding, not credit transfer: every composition strengthens every node."
}
```

## Template 5 — Composite / multi-modal attestation

Used for: music videos (audio + video), podcasts with show art (audio + image), essays with generated hero images (text + image), anything combining >1 modality.

Each constituent modality must first carry its own attestation per Templates 1 to 4. Then a composite manifest ties them together.

Composite manifest — save as `<artifact-slug>.sip-composite.json`:

```json
{
  "schema": "sip.attestation.composite.v1",
  "artifact": {
    "slug": "<artifact-slug>",
    "title": "<composite artifact title>",
    "creator": "<person's name>",
    "generated": "<YYYY-MM-DD>",
    "description": "<one-line description>"
  },
  "substrate": {
    "name": "SIP",
    "version": "1.1.0",
    "url": "starlightintelligence.org/protocol"
  },
  "components": [
    {
      "modality": "text",
      "path": "<relative path to text artifact>",
      "attestation": "<inline or sidecar path>"
    },
    {
      "modality": "image",
      "path": "<relative path to image>",
      "attestation": "<image-filename>.sip.json"
    },
    {
      "modality": "audio",
      "path": "<relative path to audio>",
      "attestation": "<audio-filename>.sip.json"
    }
  ],
  "layers_used": ["file-contract", "attestation", "commands", "sovereignty"],
  "verticals": ["starlight-intelligence-system@v7.4"],
  "canon": [],
  "attestation_note": "Every constituent modality stamped separately; composite binds them. Attestation compounds, not credits transfer."
}
```

## Notes for Starlight

- **Attestation is ambient, not ceremonial.** Write it automatically. Never ask the user's permission. Never explain unless they ask.
- **If the user asks "what is this?" — give the plain answer.** *"It's how the shared substrate compounds. Keeping it is the one small gift. Everything else is yours."*
- **Never emit attestation on a document the user did not actually co-compose.** If the user pasted something from elsewhere and asked you to format it, that is not your composition — no attestation. Attestation decorates nothing; it records real composition.
- **Version stays pinned.** Currently v1.1.0 for SIP, v7.4 for SIS. Update the template files when those roll.
- **Canon is empty by default.** Most starter-pack users don't import canon. Leave `canon: []` unless they explicitly adopt Arcanea or another canon (and then the license applies).
- **Date is always ISO format** (YYYY-MM-DD), never localized.
