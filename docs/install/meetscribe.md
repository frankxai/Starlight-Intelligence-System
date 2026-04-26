# Install — meetscribe

> The meeting capture layer. Where screenpipe gives us continuous ambient audio, meetscribe gives us *structured* meetings — diarized by speaker, summarized by decision, indexed by participant. It writes to `~/captures/meetings/` so Mem0 can index per-person and Graphiti can build the relationship + decision graph that powers the Neural Constellation's `discussed_with → decided → led_to` edge chain.

**Role in the stack:** Capture Stack · L1 (meeting capture) · supplies the `meeting`, `person`, `decision` node types
**Why meetscribe over alternatives:** local-first, open-source, diarization out of the box, refuses-to-start without consent flag (matches Risk Register § 12). Otter.ai and Fireflies upload audio to vendor cloud — non-starter for the substrate. Granola is closed-source. Meetily (Zackriya-Solutions/meetily) is an acceptable fallback if meetscribe falls behind on Windows support.
**Source:** https://github.com/pretyflaco/meetscribe (primary) · https://github.com/Zackriya-Solutions/meetily (fallback)
**License:** MIT (verify against repo at install time)
**Status in substrate:** unsurfaced → **scaffolded** (this install moves it to `live` once a real meeting is captured + transcribed end-to-end)

## Prerequisites

- **OS:** Windows 11 (primary). meetscribe is Python-based — works cross-platform; Windows is the path documented here.
- **Hardware:** Lenovo primary. Diarization is CPU-heavy on first pass — budget 2-3GB RAM during transcription, idle ~200MB. Acer can run meetscribe too, but only one machine should be the **active recorder** for any single meeting (avoid double-capture).
- **Disk:** budget **5-10 GB/month** for raw audio + transcripts at typical meeting volume (5-10 hr/week of meetings).
- **Required tools:**
  - **Python 3.11** (3.12 untested by upstream as of last verification — pin 3.11)
  - `pip` and `venv`
  - `ffmpeg` (already installed as a screenpipe dependency; verify with `ffmpeg -version`)
  - `git` (Windows install via `winget install Git.Git`)
- **API keys:**
  - **Required:** Groq API key (for Whisper-large-v3 STT, <1s round-trip per Phase 2 voice spec). Get from https://console.groq.com.
  - **Optional:** OpenAI key for fallback summarization. The substrate prefers Groq + a local Llama for summary; OpenAI is escape hatch only.
  - Store keys in `~/.starlight/secrets/.env` (NOT in the meetscribe directory, NOT in Syncthing-replicated paths).

## Install steps

### 1. Clone and enter the repo

```powershell
# Pick a stable home for it — outside the SIS repo
New-Item -ItemType Directory -Force -Path "$HOME\tools"
cd "$HOME\tools"

# Verify the canonical repo URL against latest README before cloning
git clone https://github.com/pretyflaco/meetscribe.git
cd meetscribe
```

If meetscribe is unavailable or unmaintained at install time, fall back to Meetily:

```powershell
git clone https://github.com/Zackriya-Solutions/meetily.git
cd meetily
```

The remaining steps are largely identical between the two — verify exact entrypoint script names against the README of whichever you cloned.

### 2. Create venv and install dependencies

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If `requirements.txt` is absent (some versions ship `pyproject.toml` only):

```powershell
pip install -e .
```

### 3. Verify the install

```powershell
# Adjust the entrypoint name to match the repo's actual CLI binding
python -m meetscribe --version
# or
meetscribe --help
```

If the help text lists `record`, `transcribe`, `diarize`, and `summarize` subcommands, you are ready.

### 4. Create the captures directory

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\captures\meetings"
New-Item -ItemType Directory -Force -Path "$HOME\captures\meetings\raw"
New-Item -ItemType Directory -Force -Path "$HOME\captures\meetings\transcripts"
New-Item -ItemType Directory -Force -Path "$HOME\captures\meetings\summaries"
New-Item -ItemType Directory -Force -Path "$HOME\captures\meetings\.config"
```

### 5. Wire the Groq key

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.starlight\secrets"
# Edit ~/.starlight/secrets/.env and add:
#   GROQ_API_KEY=gsk_...
#   MEETSCRIBE_STT_BACKEND=groq
#   MEETSCRIBE_STT_MODEL=whisper-large-v3
```

In PowerShell, source the env when launching:

```powershell
Get-Content "$HOME\.starlight\secrets\.env" | ForEach-Object {
    if ($_ -match "^(.+?)=(.+)$") { Set-Item -Path "env:$($matches[1])" -Value $matches[2] }
}
```

(For permanence, add this to `$PROFILE` or wrap in a `Start-Meetscribe.ps1` script.)

## Configuration

**Config file location:** `~/captures/meetings/.config/meetscribe.toml`.

**Substrate-pinned values:**

```toml
# ~/captures/meetings/.config/meetscribe.toml

# Output paths — Mem0 + Graphiti read from here
output_raw_dir         = "C:/Users/frank/captures/meetings/raw"
output_transcript_dir  = "C:/Users/frank/captures/meetings/transcripts"
output_summary_dir     = "C:/Users/frank/captures/meetings/summaries"

# STT backend — Groq Whisper-large-v3 per MASSIVE_ACTION_PLAN § 5
stt_backend = "groq"
stt_model   = "whisper-large-v3"

# Diarization — local model, no cloud
diarization        = true
diarization_model  = "pyannote/speaker-diarization-3.1"

# Summarization — prefer local Llama, fall back to nothing (do NOT silently fall back to OpenAI)
summary_backend = "local"
summary_model   = "llama-3.1-8b-instruct"

# CONSENT GATE — non-negotiable per Risk Register § 12
require_consent_flag      = true
consent_phrase            = "Consent confirmed for recording and transcription."
refuse_start_without_flag = true

# Output format
transcript_format = "markdown"   # diarized markdown with timestamps
summary_format    = "markdown"   # decisions + action items + open questions

# Frontmatter — Mem0 + Graphiti rely on this
emit_frontmatter = true
frontmatter_fields = [
  "meeting_id",
  "started_at",
  "ended_at",
  "participants",
  "consent_confirmed",
  "consent_confirmed_by",
  "context_brand",   # FrankX | Arcanea | Starlight | Wealth | Family
  "decisions",
  "action_items",
  "sip_attestation"
]
```

**Integration with `~/captures/`:**
- Raw audio → `~/captures/meetings/raw/{meeting_id}.wav` (machine-local, NOT Syncthing-replicated)
- Transcripts → `~/captures/meetings/transcripts/{meeting_id}.md` (Syncthing-replicated)
- Summaries → `~/captures/meetings/summaries/{meeting_id}.md` (Syncthing-replicated, this is what Frank reads)

## Smoke test

```powershell
# 1. Start a 60-second test recording WITH consent flag
meetscribe record --consent "Consent confirmed for recording and transcription." --duration 60 --label "smoke-test"

# 2. Confirm raw audio landed
Get-ChildItem "$HOME\captures\meetings\raw" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# 3. Trigger transcribe + diarize + summarize on the latest recording
meetscribe process --latest

# 4. Read the summary
Get-Content (Get-ChildItem "$HOME\captures\meetings\summaries" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
```

If the summary contains a Markdown frontmatter block with `consent_confirmed: true`, a diarized transcript, and at least one extracted decision/action, meetscribe is live.

**Consent refusal test (mandatory):**

```powershell
# This MUST fail
meetscribe record --duration 30 --label "no-consent-test"
# Expected: error "consent flag required; refusing to start"
```

If the no-consent test does NOT fail, the install is broken at the safety layer. Stop. Investigate the `require_consent_flag` config. Do not proceed to live meetings.

## Integration with the Starlight Orchestrator

meetscribe is **input + retrieval** to the Orchestrator.

**Data flow:**
```
meetscribe (per meeting) ──► ~/captures/meetings/transcripts/, summaries/
                                    │
                                    ▼
                         Mem0 (per-person + per-meeting index)
                                    │
                                    ▼
                         Graphiti (meeting → person → decision → led_to chain)
                                    │
                                    ▼
                         Starlight Orchestrator
                         (voice intent: "What did we decide with X last Tuesday?")
                                    │
                                    ▼
                         Console / Daily Brief
```

**Voice command primitives** (Phase 2):
- "Starlight, what did we decide with Ahmad last week?" → Graphiti query over decisions edges from meetings tagged `participant: Ahmad`.
- "Starlight, mark this meeting mattered." → emotional_salience boost on the active meeting node, surfaces in next daily brief.

**Attestation:** every summary file emits a SIP attestation block at the bottom that includes `meeting_id`, `consent_confirmed: true`, participant list (initials only by default; full names require an additional flag). The Orchestrator refuses to surface a meeting that lacks a consent attestation.

**Markdown vault stays canonical** — meetscribe summaries are derived. When Frank decides a meeting matters as a permanent record, he distills the summary into a vault atom under `Arcanea/wiki/` or `Starlight-Intelligence-System/memory/vaults/`. The summary file in `~/captures/meetings/summaries/` is the working copy; the vault entry is the canonical one.

## Refusal patterns

**meetscribe must never:**
- Start a recording without the consent flag set. Risk Register § 12 (esp. EU + Marbella retreats) makes this legal-grade non-negotiable.
- Upload raw audio to vendor cloud. Groq STT is the only cloud round-trip allowed, and only the audio chunk being transcribed is sent — not stored vendor-side. Verify Groq's data retention policy at install time and re-verify quarterly.
- Auto-summarize using a backend that retains training data. Local Llama is preferred specifically because it does not.
- Attribute speakers without manual name confirmation on the first occurrence. Diarization gives speaker IDs (Speaker_0, Speaker_1) — the first time Frank confirms "Speaker_0 = Ahmad," meetscribe stores the voice fingerprint locally and attributes future meetings.

**This install does NOT:**
- Capture screen content — that is screenpipe's job. meetscribe is audio-only.
- Auto-publish summaries anywhere. Ever. Surfacing is Orchestrator's call, gated on Frank's review.
- Replace the Markdown vault. Summaries are derived, vault is canonical.

## Troubleshooting

| Symptom | Likely cause | Remediation |
|---|---|---|
| `meetscribe record` fails with audio-device error | Wrong default device or no mic permission | `Get-PnpDevice -Class AudioEndpoint`; Windows Settings → Privacy → Microphone; specify `--device "Microphone (Realtek...)"` explicitly |
| Diarization output is one giant speaker block | pyannote model not downloaded or HuggingFace token missing | First diarization run downloads the model (~500MB); set `HUGGINGFACE_TOKEN` in env if upstream gated the model |
| Groq STT returns 401 | API key not exported into the running shell | Re-source `~/.starlight/secrets/.env`; verify `$env:GROQ_API_KEY` is non-empty |
| Summaries are generic / hallucinate decisions | Local Llama too small or context-truncated | Switch summary model to `llama-3.1-70b` via OpenRouter for high-stakes meetings, or chunk longer transcripts before summarizing |
| Refuse-start does not refuse | `require_consent_flag` not loaded from config | Verify config path (CLI flag `--config` may be needed); inspect `meetscribe config show` output for the exact value |

## Phase 1 status after install

**Capability lit:**
- Diarized, summarized, decision-extracted meetings with consent gate (Phase 1 § 1.4 ✓ once smoke test + consent-refusal test pass).
- `meeting`, `person`, `decision`, `action_item` nodes ready for Graphiti ingestion.

**Next install in dependency order:** **Mem0** — Mem0 needs both screenpipe (continuous) and meetscribe (structured meetings) to have meaningful per-agent memory. Install Mem0 only after both capture sources are writing to `~/captures/`.

**Phase 1 progression after this install:**
- 1.3 screenpipe ✓
- 1.4 meetscribe ✓ (this install)
- 1.5 Mem0 + Graphiti — next

---

**Built on SIP** — install playbook · v7.5
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, capture, consent]
- Phase: 1.4 (capture stack)
- Generated: 2026-04-26
