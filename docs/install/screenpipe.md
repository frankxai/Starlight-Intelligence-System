# Install — screenpipe

> The digital-exhaust layer. screenpipe runs continuously in the background, capturing screen frames and audio on both machines, OCR-indexing them, and writing searchable artifacts to `~/captures/screen/` for Mem0 and Graphiti to ingest. It is the difference between "I think we discussed that on Tuesday" and "here is the exact frame, the exact phrase, the exact decision."

**Role in the stack:** Capture Stack · L0 (continuous capture) · the substrate of every other capture layer
**Why screenpipe over alternatives:** local-first, open-source, OCR + audio indexed, no SaaS dependency, runs on Windows. Rewind.ai is closed-source and cloud-leaning. Granola is meeting-only. screenpipe is the only primitive that gives Frank a continuous searchable log without sending frames anywhere.
**Source:** https://github.com/mediar-ai/screenpipe
**License:** MIT
**Status in substrate:** unsurfaced → **scaffolded** (this install moves it to `live` once the smoke test passes)

## Prerequisites

- **OS:** Windows 11 (primary). Mac/Linux supported by upstream — see repo README.
- **Hardware:** Lenovo (16GB RAM, audited tight per Risk Register § 12) is the primary capture machine. Acer is hot mirror via Syncthing. Watch RAM: screenpipe with embeddings on can pull 1.5-2GB; tune accordingly.
- **Disk:** budget **40-80 GB/month** for screen + audio at default settings. Tune retention down on Lenovo if free space is < 100GB.
- **Required tools:**
  - `winget` (built into Windows 11) — preferred install path
  - Or `cargo` + Rust toolchain if building from source
  - `ffmpeg` (auto-installed by screenpipe on Windows; verify after install)
- **API keys / external services:** none required for local-only operation. Optional: OpenAI/Anthropic key if you opt-in to cloud-side embeddings. **Default for Frank's stack: do not opt in. Local embeddings only.**

## Install steps

### 1. Install via winget (preferred)

```powershell
# PowerShell as your normal user (not admin unless winget complains)
winget install --id mediar-ai.screenpipe --source winget
```

If winget does not surface the package on your build, fall back to the official installer link from the repo README:

```powershell
# Verify against latest release: https://github.com/mediar-ai/screenpipe/releases
# Download the .msi for Windows x64 and run:
Start-Process -FilePath "$env:USERPROFILE\Downloads\screenpipe-latest-x64.msi"
```

### 2. Verify the binary

```powershell
screenpipe --version
where.exe screenpipe
```

Expected: a version string and a path under `%LOCALAPPDATA%\Programs\screenpipe\` or similar.

### 3. Create the captures directory

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\captures\screen"
New-Item -ItemType Directory -Force -Path "$HOME\captures\audio"
New-Item -ItemType Directory -Force -Path "$HOME\captures\.config"
```

### 4. First run — interactive

```powershell
screenpipe --data-dir "$HOME\captures\screen" --port 3030
```

Let it run for 60 seconds with a few apps open. You should see frames being written under `~/captures/screen/data/` and OCR indexes under `~/captures/screen/db/`.

Stop with `Ctrl+C`.

### 5. Register as a Windows service (autostart)

screenpipe ships a service installer:

```powershell
# Verify command syntax against the latest README — flag names shift between releases.
# https://github.com/mediar-ai/screenpipe#installation
screenpipe install-service --data-dir "$HOME\captures\screen" --port 3030
Start-Service screenpipe
Get-Service screenpipe
```

If `install-service` is not exposed on your build, register manually via NSSM:

```powershell
winget install --id NSSM.NSSM
nssm install screenpipe "C:\Path\To\screenpipe.exe" --data-dir "$HOME\captures\screen" --port 3030
nssm start screenpipe
```

## Configuration

**Config file location:** `~/captures/screen/.config/screenpipe.toml` (create if absent — screenpipe uses CLI flags by default; the substrate pins config here so it syncs via Syncthing).

**Substrate-pinned values** (not user-choice — these are the substrate's stance):

```toml
# ~/captures/screen/.config/screenpipe.toml
data_dir         = "C:/Users/frank/captures/screen"
audio_data_dir   = "C:/Users/frank/captures/audio"
port             = 3030

# Local-only. No cloud uploads. Non-negotiable.
disable_telemetry = true
cloud_audio       = false
cloud_vision      = false

# Retention — tune to disk pressure on Lenovo
retention_days    = 30

# Audio
audio_chunk_secs  = 30
audio_devices     = ["default"]
disable_audio     = false  # set true if mic-off privacy mode

# Vision
fps               = 1        # 1 frame/sec is plenty for OCR + recall
ignored_windows   = ["1Password", "Bitwarden", "Banking"]
include_apps      = []       # empty = all
```

**Privacy redactions — required:**

```toml
# Add any window title patterns or app names that should NEVER be captured
ignored_windows = [
  "1Password",
  "Bitwarden",
  "Banking",
  "Stripe Dashboard",
  "Wise",
  "Trezor",
  "MetaMask"
]
```

**Integration with `~/captures/`:**
- screenpipe writes frames + audio + OCR JSON to `~/captures/screen/` and `~/captures/audio/`.
- Mem0 (next install) reads from these paths.
- Graphiti (after Mem0) ingests temporal events from screenpipe's event log.
- Syncthing must be configured to **exclude** `~/captures/screen/data/` from sync — frames are large and machine-local. **Sync only** the OCR JSON + transcripts to the Acer mirror.

## Smoke test

```powershell
# 1. Service running?
Get-Service screenpipe   # should report Running

# 2. API responsive?
Invoke-RestMethod -Uri "http://localhost:3030/health"
# Expected: {"status": "ok", ...}

# 3. Search a phrase you typed in the last 5 minutes
$body = @{ q = "starlight"; limit = 5 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3030/search" -Method Post -ContentType "application/json" -Body $body
# Expected: a JSON array of frame matches with timestamps
```

If all three return cleanly, screenpipe is live.

## Integration with the Starlight Orchestrator

screenpipe is **input-only** to the Orchestrator. It does not call out; nothing reads from it except Mem0 and Graphiti.

**Data flow:**
```
screenpipe (continuous) ──► ~/captures/screen/, ~/captures/audio/
                                    │
                                    ▼
                         Mem0 (per-agent index, derived)
                                    │
                                    ▼
                         Graphiti (temporal graph, derived)
                                    │
                                    ▼
                         Starlight Orchestrator
                         (reads Graphiti for daily brief,
                          context-fetches for any voice intent)
```

**Attestation:** any artifact the Orchestrator emits that cites a screenpipe frame must carry the source frame ID + timestamp in the SIP attestation footer. The frame itself is never embedded in a public artifact without explicit Frank approval.

**Markdown vault stays canonical** — screenpipe captures are *raw* and *derived*. They feed Mem0/Graphiti, which surface candidates to the daily brief, which Frank distills into vault entries. Frames themselves are NOT vault content.

## Refusal patterns

**screenpipe must never:**
- Sync raw frames or audio to cloud storage. Not OneDrive. Not iCloud. Not Dropbox. Not Google Drive. Not S3. The Risk Register § 12 (Consent / recording legal exposure) makes this non-waivable.
- Capture during banking, password manager, or wallet windows. The `ignored_windows` list above is the floor, not the ceiling — extend it the moment a new sensitive app enters Frank's flow.
- Run with `cloud_audio = true` or `cloud_vision = true`. If a future model needs cloud embeddings, that is a separate opt-in artifact with its own consent log entry, not a config flip.
- Capture on the Acer when the Acer is in "guest mode" (any session not authenticated as Frank). Service should be stopped before handing the machine to anyone else.

**This install does NOT:**
- Configure meeting transcription — that is meetscribe's job.
- Replace the Markdown vault — frames are derived, vault is canonical.
- Build a UI — search is via API or the screenpipe app, not via SIS Console.

## Troubleshooting

| Symptom | Likely cause | Remediation |
|---|---|---|
| Service starts then immediately stops | Port 3030 already bound (often by Console dev server) | `netstat -ano \| findstr :3030`; change screenpipe port to 3031 in config + service args |
| RAM climbs to 4GB+ on Lenovo | Embeddings running with too-large model | Disable embeddings via `--disable-vision-embeddings` flag, or set fps=0.5 |
| OCR returns empty for all frames | Tesseract not installed or PATH not set | screenpipe bundles tesseract on Windows; reinstall via winget. Verify with `tesseract --version` |
| Audio capture silent | Default device is muted or Windows privacy gave no mic access | Settings → Privacy → Microphone → allow desktop apps; confirm `Get-PnpDevice -Class AudioEndpoint` lists active mic |
| Disk fills in <1 week | Default retention too generous | Drop `retention_days` to 14, drop `fps` to 0.5, run `screenpipe vacuum` to compact older data |

## Phase 1 status after install

**Capability lit:**
- Continuous searchable screen + audio log on Lenovo (Phase 1 § 1.3 ✓ once smoke test passes).
- Foundation for Mem0 ingestion.

**Next install in dependency order:** **meetscribe** — adds diarized meeting transcription on top of the audio capture surface. Mem0 install (1.5) is gated on both screenpipe and meetscribe writing into `~/captures/`.

**Phase 1 progression after this install:**
- 1.3 Lenovo install ✓
- 1.3 Acer install — repeat this playbook on the Acer, then verify Syncthing replicates `~/captures/screen/db/` (NOT `~/captures/screen/data/`) between machines.

---

**Built on SIP** — install playbook · v7.5
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, capture]
- Phase: 1.3 (capture stack)
- Generated: 2026-04-26
