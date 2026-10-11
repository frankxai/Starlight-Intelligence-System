# Agentic Music OS - First Release Packet Report

Date: 2026-06-19
Status: proposed implementation contract
Scope: Music IS / Arcanea Records, Phase 0 to Phase 1

## Executive Decision

The first real Agentic Music OS release packet should be a local, proof-backed folder that turns one Suno URL, MP3, or WAV into an auditable release candidate. The packet prepares distribution and launch materials, but it must not upload to DistroKid, Spotify, YouTube, Bandcamp, or social platforms.

The packet is not a dashboard. It is the release evidence layer between `catalog/master.csv` and the non-waivable `/music-release` A&R gate.

Core principles:

- `catalog/master.csv` remains the catalog source of truth.
- The release packet holds proof, analysis, assets, manifests, and upload-ready checklists.
- CSV stores gate-critical summaries and pointers, not bulky evidence.
- All observed facts are separated from A&R inferences.
- External rails are prepared locally and marked `prepared_local_only` until Frank performs and verifies manual platform actions.

## Exact Folder Convention

Use a stable packet root so paths do not break when status changes:

```text
verticals/music-is/catalog/release-packets/<song_id>/
  PACKET.md
  packet.manifest.json
  checksums.sha256
  catalog.fields.json
  NO_EXTERNAL_UPLOADS.md

  intake/
    intake.json
    source-url.txt
    prompt.txt
    lyrics.txt
    notes.md

  audio/
    source-audio.pointer.json
    master-audio.pointer.json
    ffprobe.json
    ebur128.json
    pcm-scan.json
    audio-analysis.json
    waveform.png
    spectrogram.png
    structure-notes.md
    transcription.txt
    lyrics-alignment.json

  rights/
    ai-disclosure.md
    rights-disclosure.md
    sample-clearance.md
    vocal-consent.pointer.json
    platform-disclosure-notes.md

  ar/
    ar-report.md
    ar-report.json
    ar-report.schema.json
    council-notes.md
    frank-signoff.md

  assets/
    asset-manifest.json
    cover/
      cover-master.pointer.json
      cover-3000x3000.pointer.json
      cover-square.pointer.json
      cover-landscape.pointer.json
      cover-vertical.pointer.json
    motion/
      canvas.pointer.json
      short-9x16.pointer.json
      visualizer-16x9.pointer.json
      square-loop.pointer.json
    prompts/
      cover-directions.md
      canvas-directions.md
      short-directions.md

  distribution/
    distribution-manifest.json
    distrokid-packet.md
    spotify-artists-packet.md
    youtube-packet.md
    bandcamp-packet.md
    owned-site-packet.md
    post-upload-backfill.md

  launch/
    launch-manifest.json
    x-copy.md
    instagram-copy.md
    tiktok-copy.md
    youtube-description.md
    newsletter-copy.md
    site-release-copy.md

  telemetry/
    telemetry-plan.json
    reminders.json
    seven-day-retro-template.md
    thirty-day-retro-template.md

  logs/
    command-log.md
    validation-log.md
    manual-actions.md
```

Large or private binaries should be referenced by pointer files rather than committed blindly. Use this pointer shape:

```json
{
  "path": "C:/path/to/local/file.wav",
  "storage_class": "local_private | google_drive | external_archive | repo_tracked",
  "sha256": "hex",
  "bytes": 0,
  "mime_type": "audio/wav",
  "created_at": "2026-06-19T00:00:00Z",
  "notes": "No platform upload performed."
}
```

If a file is small, non-private, and useful for review, it may live in the packet folder directly. Audio masters, private consents, and platform credentials stay outside the public repo and are represented with pointer files.

## Catalog Fields

Keep the current `catalog/master.csv` fields. Append these fields after `notes` to avoid breaking readers that depend on existing column order:

```csv
release_packet_path,packet_manifest_path,packet_state,packet_created_date,packet_updated_date,source_type,source_audio_path,source_audio_sha256,master_audio_path,master_audio_sha256,lyrics_path,transcription_path,language,explicit,instrumental,vocal_source,genre_primary,genre_secondary,mood_tags,rights_status,sample_clearance_status,audio_analysis_path,duration_confidence,bpm_confidence,key_confidence,lufs_integrated,true_peak_dbtp,lra_lu,clipping_event_count,artifact_flags,ar_report_path,ar_decision,ar_decision_date,ar_gate_version,ar_open_revisions_count,distribution_packet_path,external_upload_status,post_upload_ids_status,proof_packet_hash
```

Field rules:

| Field | Required when | Values / notes |
|---|---|---|
| `release_packet_path` | packet created | Relative path to `catalog/release-packets/<song_id>/` |
| `packet_manifest_path` | packet created | Relative path to `packet.manifest.json` |
| `packet_state` | packet created | `intake`, `analysis_ready`, `asset_ready`, `gate_ready`, `green_light`, `revise`, `refuse`, `manual_upload_pending`, `released_backfilled` |
| `packet_created_date` | packet created | `YYYY-MM-DD` |
| `packet_updated_date` | every packet mutation | `YYYY-MM-DD` |
| `source_type` | intake | `suno_url`, `mp3`, `wav`, `stem_bundle`, `hybrid` |
| `source_audio_path` | local audio exists | Pointer path or relative packet path |
| `source_audio_sha256` | local audio exists | SHA-256 of source audio |
| `master_audio_path` | master selected | Pointer path or relative packet path |
| `master_audio_sha256` | master selected | SHA-256 of selected master |
| `lyrics_path` | vocals or lyrics known | Relative path to `intake/lyrics.txt` |
| `transcription_path` | transcription run | Relative path to `audio/transcription.txt` |
| `language` | intake | ISO-like string or `unknown` |
| `explicit` | intake | `yes`, `no`, `unknown` |
| `instrumental` | intake | `yes`, `no`, `unknown` |
| `vocal_source` | vocals exist | `suno`, `frank_clone`, `external_clone_consented`, `external_clone_unverified`, `human_recorded`, `none`, `unknown` |
| `genre_primary` | gate-ready | One canonical genre |
| `genre_secondary` | gate-ready | Optional semicolon-separated list |
| `mood_tags` | gate-ready | Semicolon-separated tags |
| `rights_status` | gate-ready | `clear`, `needs_review`, `blocked` |
| `sample_clearance_status` | gate-ready | `none_declared`, `cleared`, `public_domain`, `needs_review`, `blocked` |
| `audio_analysis_path` | analysis run | Relative path to `audio/audio-analysis.json` |
| `duration_confidence` | analysis run | `observed`, `catalog_only`, `unknown` |
| `bpm_confidence` | analysis run | `observed`, `estimated`, `catalog_only`, `unknown` |
| `key_confidence` | analysis run | `observed`, `estimated`, `catalog_only`, `unknown` |
| `lufs_integrated` | ebur128 run | Numeric LUFS or blank |
| `true_peak_dbtp` | ebur128 run | Numeric dBTP or blank |
| `lra_lu` | ebur128 run | Loudness range in LU or blank |
| `clipping_event_count` | PCM scan run | Integer; blank if unavailable |
| `artifact_flags` | analysis run | Semicolon-separated: `abrupt_end`, `vocal_slur`, `muddy_low_end`, `clipping_risk`, `codec_lossy`, etc. |
| `ar_report_path` | A&R run | Relative path to `ar/ar-report.json` |
| `ar_decision` | A&R run | `GREEN-LIGHT`, `REVISE`, `REFUSE` |
| `ar_decision_date` | A&R run | `YYYY-MM-DD` |
| `ar_gate_version` | A&R run | Example: `music-is-release-gate-v0.2` |
| `ar_open_revisions_count` | REVISE | Integer |
| `distribution_packet_path` | distribution prep | Relative path to `distribution/distribution-manifest.json` |
| `external_upload_status` | packet created | `not_started`, `prepared_local_only`, `manual_upload_pending`, `manual_upload_complete_unverified`, `verified_ids_backfilled` |
| `post_upload_ids_status` | after manual upload | `not_applicable`, `pending`, `partial`, `complete` |
| `proof_packet_hash` | packet validation | SHA-256 over normalized manifest and checksums |

For this first report and first packet, `external_upload_status` must remain `prepared_local_only` unless Frank explicitly runs manual upload outside this task.

## Proof Packet Manifest

`packet.manifest.json` is the receipt. It must be deterministic enough to hash and broad enough to drive dashboards.

Minimum schema:

```json
{
  "schema_version": "agentic-music-os.release-packet.v0.1",
  "song_id": "frank-riemer_20260619_example",
  "title": "Example",
  "label": "frank-riemer",
  "persona": "frank-riemer",
  "packet_state": "gate_ready",
  "created_at": "2026-06-19T00:00:00Z",
  "updated_at": "2026-06-19T00:00:00Z",
  "catalog": {
    "master_csv_path": "verticals/music-is/catalog/master.csv",
    "catalog_row_hash": "sha256",
    "catalog_fields_path": "catalog.fields.json"
  },
  "external_action_policy": {
    "distrokid_upload": "not_performed",
    "spotify_upload": "not_performed",
    "youtube_upload": "not_performed",
    "bandcamp_upload": "not_performed",
    "social_posting": "not_performed",
    "allowed_status": "prepared_local_only"
  },
  "source": {
    "source_type": "suno_url",
    "source_url": "https://suno.com/song/...",
    "engine": "suno-v5",
    "model_version": "unknown",
    "prompt_path": "intake/prompt.txt",
    "lyrics_path": "intake/lyrics.txt",
    "source_audio": {
      "path": "audio/source-audio.pointer.json",
      "sha256": "sha256",
      "required": true
    }
  },
  "proof_files": [
    {
      "role": "ffprobe",
      "path": "audio/ffprobe.json",
      "sha256": "sha256",
      "required_for_gate": true,
      "status": "present"
    },
    {
      "role": "audio_analysis",
      "path": "audio/audio-analysis.json",
      "sha256": "sha256",
      "required_for_gate": true,
      "status": "present"
    },
    {
      "role": "ai_disclosure",
      "path": "rights/ai-disclosure.md",
      "sha256": "sha256",
      "required_for_gate": true,
      "status": "present"
    },
    {
      "role": "ar_report",
      "path": "ar/ar-report.json",
      "sha256": "sha256",
      "required_for_gate": true,
      "status": "present"
    }
  ],
  "analysis_summary": {
    "duration_seconds": 0,
    "codec": "mp3",
    "sample_rate_hz": 44100,
    "channels": 2,
    "lufs_integrated": null,
    "true_peak_dbtp": null,
    "lra_lu": null,
    "clipping_event_count": null,
    "artifact_flags": []
  },
  "rights_summary": {
    "ai_disclosure_status": "present",
    "sample_clearance_status": "none_declared",
    "vocal_source": "suno",
    "vocal_consent_status": "not_required",
    "rights_status": "clear"
  },
  "assets_summary": {
    "cover": "prepared | missing | blocked",
    "canvas": "prepared | missing | blocked",
    "short_9x16": "prepared | missing | blocked",
    "visualizer_16x9": "prepared | missing | blocked"
  },
  "distribution_summary": {
    "distrokid_packet": "prepared_local_only",
    "spotify_artists_packet": "prepared_local_only",
    "youtube_packet": "prepared_local_only",
    "bandcamp_packet": "prepared_local_only",
    "owned_site_packet": "prepared_local_only"
  },
  "ar_summary": {
    "decision": "GREEN-LIGHT | REVISE | REFUSE",
    "decision_date": "2026-06-19",
    "hard_gate_failures": [],
    "open_revisions": []
  },
  "attestation": {
    "checksums_path": "checksums.sha256",
    "packet_hash": "sha256",
    "sip_audio_attestation_hash": null
  }
}
```

Manifest validation must fail if:

- Any required proof file is missing.
- Any listed SHA-256 does not match.
- `external_action_policy` claims an upload occurred without verified post-upload IDs.
- `ar_summary.decision` is `GREEN-LIGHT` while rights, audio decode, disclosure, asset, or royalty graph hard gates are incomplete.
- `catalog_row_hash` was computed before the latest packet update.

## Audio-Analysis Script Requirements

Proposed script path:

```text
verticals/music-is/scripts/analyze-audio.mjs
```

Command shape:

```bash
node verticals/music-is/scripts/analyze-audio.mjs --song-id <song_id> --audio <path> --packet <packet_dir>
```

Required behavior:

1. Create or update the packet folder without touching external platforms.
2. Compute SHA-256, byte size, MIME guess, and modified time for input audio.
3. Run `ffprobe` when available and write `audio/ffprobe.json`.
4. Run `ffmpeg` EBU R128 loudness analysis when available and write `audio/ebur128.json`.
5. Generate `audio/waveform.png` and `audio/spectrogram.png` when `ffmpeg` is available.
6. Decode PCM through `ffmpeg` to scan for clipping clusters and write `audio/pcm-scan.json`.
7. Write normalized `audio/audio-analysis.json`.
8. Update `packet.manifest.json`, `checksums.sha256`, and `catalog.fields.json`.
9. Never infer unavailable facts. Missing tools must produce explicit `not_available` statuses.

Required tool detection:

| Tool | Required | Purpose | Failure behavior |
|---|---:|---|---|
| Node.js ESM | yes | Script runtime | Hard fail |
| `ffprobe` | preferred | Codec, duration, streams, bitrate | Record `not_available`; duration can fall back to catalog only |
| `ffmpeg` | preferred | EBU R128, waveform, spectrogram, PCM decode | Record `not_available`; do not fake loudness |
| Optional BPM/key engine | no | BPM/key estimate | Record method and confidence, or `not_available` |
| Optional transcription engine | no | Lyrics/transcription alignment | Record `not_run` unless configured |

`audio/audio-analysis.json` must include:

```json
{
  "schema_version": "agentic-music-os.audio-analysis.v0.1",
  "song_id": "song_id",
  "analyzed_at": "2026-06-19T00:00:00Z",
  "input": {
    "path": "path",
    "sha256": "sha256",
    "bytes": 0
  },
  "tooling": {
    "ffprobe": { "available": true, "version": "string" },
    "ffmpeg": { "available": true, "version": "string" },
    "bpm_key_engine": { "available": false, "name": null },
    "transcription_engine": { "available": false, "name": null }
  },
  "observed": {
    "duration_seconds": 0,
    "codec": "mp3",
    "bitrate_kbps": 0,
    "sample_rate_hz": 44100,
    "channels": 2,
    "container": "mp3",
    "lufs_integrated": null,
    "lra_lu": null,
    "true_peak_dbtp": null,
    "peak_dbfs": null,
    "rms_dbfs": null,
    "clipping_event_count": null,
    "silence_leading_seconds": null,
    "silence_trailing_seconds": null
  },
  "estimated": {
    "bpm": null,
    "bpm_confidence": "unknown",
    "key": null,
    "key_confidence": "unknown"
  },
  "artifacts": {
    "flags": [],
    "notes": [],
    "requires_human_listen": true
  },
  "files_written": {
    "ffprobe": "audio/ffprobe.json",
    "ebur128": "audio/ebur128.json",
    "pcm_scan": "audio/pcm-scan.json",
    "waveform": "audio/waveform.png",
    "spectrogram": "audio/spectrogram.png"
  }
}
```

Recommended FFmpeg commands:

```bash
ffprobe -v error -print_format json -show_format -show_streams input.wav
ffmpeg -hide_banner -nostats -i input.wav -filter_complex ebur128=peak=true -f null -
ffmpeg -y -i input.wav -filter_complex showwavespic=s=1600x400:colors=white audio/waveform.png
ffmpeg -y -i input.wav -lavfi showspectrumpic=s=1600x900:legend=disabled audio/spectrogram.png
ffmpeg -i input.wav -f f32le -acodec pcm_f32le -
```

The PCM scan should count clipping clusters, not only individual samples. A practical first threshold is absolute sample value `>= 0.999` with contiguous samples grouped as one event per channel.

Label-specific loudness interpretation should come from label canon:

- Frank Riemer and Arcanea: dynamic-range-protected, sync-grade posture.
- Frank's Vibes and Nona: streaming-loudness optimized without crushed dynamics.

The script reports measured facts; the A&R report decides whether those facts fit the label.

## A&R Report Schema

The A&R report has two files:

- `ar/ar-report.json`: machine-readable gate record.
- `ar/ar-report.md`: human-readable council report.

`ar/ar-report.json` schema:

```json
{
  "schema_version": "agentic-music-os.ar-report.v0.1",
  "song_id": "song_id",
  "generated_at": "2026-06-19T00:00:00Z",
  "gate_version": "music-is-release-gate-v0.2",
  "decision": "GREEN-LIGHT | REVISE | REFUSE",
  "decision_confidence": "high | medium | low",
  "external_uploads_performed": false,
  "inputs": {
    "catalog_row_hash": "sha256",
    "packet_manifest_hash": "sha256",
    "audio_analysis_path": "audio/audio-analysis.json",
    "asset_manifest_path": "assets/asset-manifest.json",
    "rights_disclosure_path": "rights/rights-disclosure.md",
    "royalty_graph_ref": "catalog/royalty-graph.json#song_id"
  },
  "observed_facts": {
    "catalog": {},
    "audio": {},
    "lyrics": {},
    "assets": {},
    "rights": {},
    "distribution_packet": {}
  },
  "hard_gates": [
    {
      "id": "audio_decodable",
      "status": "pass | fail | not_run",
      "evidence": ["audio/ffprobe.json"],
      "failure_mode": null
    },
    {
      "id": "ai_disclosure_present",
      "status": "pass | fail | not_run",
      "evidence": ["rights/ai-disclosure.md"],
      "failure_mode": null
    },
    {
      "id": "rights_clear",
      "status": "pass | fail | not_run",
      "evidence": ["rights/rights-disclosure.md"],
      "failure_mode": null
    },
    {
      "id": "asset_bundle_complete",
      "status": "pass | fail | not_run",
      "evidence": ["assets/asset-manifest.json"],
      "failure_mode": null
    },
    {
      "id": "royalty_graph_stub_present",
      "status": "pass | fail | not_run",
      "evidence": ["catalog/royalty-graph.json"],
      "failure_mode": null
    },
    {
      "id": "no_external_uploads_performed",
      "status": "pass | fail",
      "evidence": ["NO_EXTERNAL_UPLOADS.md", "packet.manifest.json"],
      "failure_mode": null
    }
  ],
  "taste_assessment": {
    "persona_fit": {
      "score_0_100": 0,
      "rationale": "string",
      "evidence_refs": []
    },
    "label_fit": {
      "score_0_100": 0,
      "rationale": "string",
      "evidence_refs": []
    },
    "production_quality": {
      "score_0_100": 0,
      "rationale": "string",
      "evidence_refs": []
    },
    "hook_or_memory": {
      "score_0_100": 0,
      "rationale": "string",
      "evidence_refs": []
    },
    "release_timing": {
      "score_0_100": 0,
      "rationale": "string",
      "evidence_refs": []
    }
  },
  "council": [
    {
      "agent": "music-curator",
      "role": "final A&R gate",
      "decision": "GREEN-LIGHT | REVISE | REFUSE",
      "notes": "string",
      "evidence_refs": []
    },
    {
      "agent": "persona-keeper",
      "role": "canon and artist identity",
      "decision": "pass | revise | refuse",
      "notes": "string",
      "evidence_refs": []
    },
    {
      "agent": "music-producer",
      "role": "audio and visual quality",
      "decision": "pass | revise | refuse",
      "notes": "string",
      "evidence_refs": []
    },
    {
      "agent": "music-distributor",
      "role": "local distribution packet readiness",
      "decision": "pass | revise | refuse",
      "notes": "string",
      "evidence_refs": []
    },
    {
      "agent": "royalty-architect",
      "role": "splits and rail economics",
      "decision": "pass | revise | refuse",
      "notes": "string",
      "evidence_refs": []
    },
    {
      "agent": "compliance-sentinel",
      "role": "AI disclosure, sample, consent, no-upload boundary",
      "decision": "pass | revise | refuse",
      "notes": "string",
      "evidence_refs": []
    }
  ],
  "open_revisions": [
    {
      "id": "revise-001",
      "severity": "blocking | nonblocking",
      "owner": "music-producer",
      "task": "string",
      "evidence_needed": "string"
    }
  ],
  "frank_signoff": {
    "required_for_green_light": true,
    "status": "pending | approved | rejected",
    "path": "ar/frank-signoff.md"
  },
  "attestation": {
    "report_hash": "sha256",
    "packet_hash": "sha256",
    "created_by": "agentic-music-os"
  }
}
```

Decision rules:

- `GREEN-LIGHT` requires every hard gate to pass, no blocking open revisions, and Frank signoff approved.
- `REVISE` is used when the song is viable but missing fixable proof, assets, metadata, or mix/master changes.
- `REFUSE` is used for rights ambiguity, AI-vocal impersonation without consent, uncured sample issues, label/persona orphaning, or quality failure that should not be revised under the same song ID.
- A&R may score taste, but scores cannot override failed hard gates.
- The report must name which evidence is observed and which judgment is inferred.

`ar/ar-report.md` should render these sections:

```text
# A&R Report - <song_id>

Decision: GREEN-LIGHT | REVISE | REFUSE
External uploads performed: No

## Packet Summary
## Observed Audio Facts
## Rights and Disclosure
## Persona and Label Fit
## Asset Bundle Readiness
## Distribution Packet Readiness
## Royalty Graph Readiness
## Council Notes
## Blocking Revisions
## Frank Signoff
## Attestation
```

## Distribution Packet Boundary

The first release packet may prepare the following files:

- `distribution/distrokid-packet.md`
- `distribution/spotify-artists-packet.md`
- `distribution/youtube-packet.md`
- `distribution/bandcamp-packet.md`
- `distribution/owned-site-packet.md`

Each file must start with:

```text
Status: prepared_local_only
External upload performed: no
Prepared for manual use by Frank after GREEN-LIGHT.
```

Post-upload fields such as DistroKid ID, ISRC, UPC, Spotify URL, YouTube URL, Bandcamp URL, and live social URLs remain blank until Frank manually performs the external action and the IDs are backfilled.

## First Packet Acceptance Criteria

A first real packet is complete when:

- Packet folder exists at `catalog/release-packets/<song_id>/`.
- `packet.manifest.json` validates.
- `checksums.sha256` covers every proof file in the manifest.
- Audio analysis is generated from an actual local MP3/WAV, or missing tooling is explicitly recorded.
- A&R report uses observed facts from packet files, not simulated Huron/Patel/Margulis scores.
- AI disclosure and rights disclosure are present.
- Distribution files are prepared locally and explicitly marked no-upload.
- `catalog.fields.json` contains the proposed catalog field values for the row.
- `catalog/master.csv` can be updated from `catalog.fields.json` without manual reinterpretation.
- `external_upload_status` is `prepared_local_only`.

## Implementation Order

1. Add `catalog/release-packets/.gitkeep` and a README explaining pointer files and no-upload policy.
2. Add `verticals/music-is/scripts/analyze-audio.mjs`.
3. Add a packet generator that creates the folder skeleton, manifest, and `NO_EXTERNAL_UPLOADS.md`.
4. Extend the catalog writer to accept the appended packet fields.
5. Replace the simulated council output with `ar-report.json` generation from packet evidence.
6. Update `/music-release` so it can move to `manual_upload_pending` without claiming DistroKid or Canvas completion.
7. Only after a real manual upload, backfill ISRC/UPC/platform IDs and transition `external_upload_status` to `verified_ids_backfilled`.

## Non-Goals

- No DistroKid upload.
- No Spotify Canvas upload.
- No YouTube publish.
- No Bandcamp publish.
- No social posting.
- No claim that a release is live without post-upload IDs and catalog backfill.
- No public artist identity spawn unless the persona naming discipline has been completed.

**Built on SIP** - Music IS Agentic Music OS release packet report. Catalog is truth; packet is proof; external rails are prepared, not simulated.
