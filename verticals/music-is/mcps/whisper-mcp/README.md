# Whisper MCP — Music IS

> First Music IS MCP. Transcribes voice memos + audio captures + bounced masters via OpenAI Whisper. Unlocks Mobile Inbox voice-memo type + Bridge voice-memo button + `voice-memo-to-prompt` skill.

**Status:** scaffold v0.1 · 2026-04-30
**Tier priority:** P0 (per MIS-ADVANCED-STACK.md)
**Composes with:** `music-is/voice-memo-to-prompt` skill · Mobile Inbox · Bridge Spark Zone

---

## Purpose

Three operational use-cases:

1. **Voice memo → Suno prompt** — Frank captures an idea on phone (Notion Mobile Inbox, type: Voice Memo). Whisper transcribes → classify intent → ground in active persona canon → generate Suno prompt candidates. Closes the on-the-go-capture-to-creation loop in <60 seconds.

2. **Audio file → catalog metadata** — bounced master uploaded to catalog draft folder. Whisper transcribes any vocal track (or fully-transcribed song) for: lyric capture (registration with LyricFind/Musixmatch), AI-disclosure metadata, sync-deliverable cue sheet generation.

3. **Reference track → analysis prep** — paste a Spotify/YouTube URL of an existing track. Pipeline: fetch audio → Whisper transcribe → compose with `reference-track-ab` skill for sonic-canon analysis.

---

## Tools exposed

### `transcribe_audio(file_path: str | url: str, language: str = "auto", model: str = "whisper-large-v3") → TranscriptResult`

Transcribe an audio file (local path) or audio URL (Suno share, Bandcamp track URL, YouTube URL, direct .mp3/.wav/.m4a link). Returns:
- `text` — full transcription
- `segments` — timestamp-aligned chunks
- `language` — detected
- `duration_seconds`
- `confidence` — mean confidence across segments

**Implementation:** OpenAI Whisper API (whisper-large-v3) primary; local whisper.cpp fallback for sovereignty mode.

### `classify_intent(transcription: str, persona_canon_ref: str | null) → IntentClassification`

Classify transcribed text into one of: `idea` / `lyric_fragment` / `brief` / `reference_pointer` / `suno_prompt_seed` / `voice_note` / `unclassified`.

If `persona_canon_ref` provided (path to CANON.md), also returns:
- `persona_fit_score` (0-1)
- `canon_alignment_notes` — which canon dimensions the intent serves
- `suggested_label_hint`
- `suggested_persona_hint`

**Implementation:** Sonnet via askClaude pattern with structured-output schema; refuses if vocal-impersonation language detected (per D11).

### `voice_memo_to_prompt(audio_url: str, persona_slug: str, engine: str = "suno") → PromptCandidates`

The full pipeline chained: transcribe → classify → ground → generate.

Returns:
- `transcription` (full text)
- `classification` (Intent type)
- `persona_grounding` (which canon dimensions used)
- `prompt_candidates` (3-5 Suno/Udio/Stable Audio prompts grounded in persona CANON + knowledge/suno corpus)
- `predicted_variability` per candidate
- `mobile_inbox_entry_url` (Notion URL of the corresponding capture entry, if exists)

**Refusal triggers:**
- No persona context provided
- Vocal-impersonation of identifiable non-Frank artist detected in transcription
- Persona not registered in `LABELS.md` active personas
- Engine not declared in `STACK.md` L2

### `transcribe_song(audio_url: str) → SongTranscription`

Full-song transcription for lyric registration + cue sheet generation. Returns timestamped lyric blocks suitable for LyricFind/Musixmatch submission. AI-disclosure metadata embedded.

### `process_inbox_voice_memos() → BatchResult`

Batch-process all Mobile Inbox entries with Type=Voice Memo and Status=Not Started. For each:
1. Pull audio attachment from Notion
2. Run `voice_memo_to_prompt` with Persona Hint as `persona_slug`
3. Update Mobile Inbox entry with transcription + prompt candidates in Intent field
4. Mark Status=In Progress (awaiting Frank's review on Bridge)
5. Return summary report

Designed to run on Bridge "Process Inbox" button click or weekly hygiene ritual.

---

## Architecture

```
verticals/music-is/mcps/whisper-mcp/
├── README.md                    # this file
├── package.json                 # Node + MCP SDK + OpenAI deps
├── tsconfig.json
├── server.ts                    # MCP server entry
├── tools/
│   ├── transcribe-audio.ts
│   ├── classify-intent.ts
│   ├── voice-memo-to-prompt.ts
│   ├── transcribe-song.ts
│   └── process-inbox-voice-memos.ts
├── lib/
│   ├── whisper-client.ts        # OpenAI Whisper API wrapper
│   ├── audio-fetcher.ts         # URL → local audio (Spotify/YouTube/Bandcamp/Suno via yt-dlp)
│   ├── persona-grounding.ts     # reads CANON.md + suno corpus
│   ├── notion-bridge.ts         # reads/writes Mobile Inbox entries
│   └── ai-disclosure.ts         # SIP attestation for transcribed content
├── .env.example                 # OPENAI_API_KEY, NOTION_TOKEN, etc.
├── tests/
│   ├── transcribe.test.ts
│   ├── classify.test.ts
│   └── full-flow.test.ts
└── Dockerfile (optional)        # for hosted deployment
```

---

## Environment variables

```
OPENAI_API_KEY=sk-...               # OpenAI Whisper API
NOTION_TOKEN=secret_...             # for Mobile Inbox reads
NOTION_INBOX_DS=8e0a1b1f-601e-4e4e-8b69-d6cc1f28b4e7
MUSIC_IS_ROOT=/path/to/Starlight-Intelligence-System/verticals/music-is
MODE=production                     # production | local-fallback (uses whisper.cpp)
LOG_LEVEL=info
```

---

## Deployment options

### Option A — Local Node service (simplest, P0 ship)

```bash
cd verticals/music-is/mcps/whisper-mcp
npm install
cp .env.example .env  # fill in credentials
npm run dev           # starts MCP server on stdio
```

Add to Claude Code MCP config (`~/.claude/mcp.json` or equivalent):

```json
{
  "mcpServers": {
    "music-is-whisper": {
      "command": "node",
      "args": ["/path/to/whisper-mcp/dist/server.js"],
      "env": { "OPENAI_API_KEY": "${env:OPENAI_API_KEY}" }
    }
  }
}
```

### Option B — Hosted (Vercel Edge / Railway / Fly.io)

For team usage or Phase 5 productization. HTTP transport mode, OAuth for Notion access.

### Option C — Self-hosted with whisper.cpp (sovereignty mode)

Replace OpenAI Whisper API calls with local whisper.cpp binary (Apple Silicon optimized). Slower but no API costs + full sovereignty. For Frank's heaviest use cases.

---

## Composes with

| Surface | How it composes |
|---|---|
| Mobile Inbox (Notion) | `process_inbox_voice_memos` reads Voice Memo entries; updates with transcription |
| Bridge artifact (Cowork) | Voice-memo button dispatches `voice_memo_to_prompt` flow |
| `music-is/voice-memo-to-prompt` skill | Skill is the higher-level Music IS abstraction; this MCP is the substrate |
| `music-is/reference-track-ab` skill | Uses `transcribe_audio` to capture lyrics from reference tracks |
| `music-is/song-intake` skill | Optional: transcribe full song at intake for lyric capture |
| `music-is/lyric-rights-registration` skill (P2) | Uses `transcribe_song` for LyricFind/Musixmatch submission |
| Catalog (`catalog/master.csv`) | Transcribed lyrics → catalog row metadata + ai_disclosure_metadata field |

---

## SIP attestation

Every transcription artifact carries SIP attestation:

```json
{
  "tool": "whisper-mcp",
  "version": "0.1.0",
  "model": "whisper-large-v3",
  "transcribed_at": "2026-05-01T10:23:45Z",
  "audio_source": "notion-inbox-capture://abc123",
  "ai_disclosure": "AI-transcribed via Whisper; lyrics captured for catalog metadata only; no impersonation",
  "attestation_hash": "..."
}
```

Stored alongside the transcription in `catalog/draft/<song-id>/transcripts/<timestamp>.json` (or per-Mobile-Inbox-entry equivalent).

---

## Refusal posture

Refuses:
- Audio with no consent doc on file when it's an identifiable non-Frank voice (vocal-impersonation guard)
- Transcription of copyrighted material without fair-use justification (reference tracks: transcribe analysis only, not full reproduction)
- Storage of full lyrics for tracks not yet rights-cleared
- Batch processing without persona context per entry

---

## Phase rollout

| Phase | Ship |
|---|---|
| Phase 1 W1 | scaffold + `transcribe_audio` + `classify_intent` + local Node deployment |
| Phase 1 W2 | `voice_memo_to_prompt` + Notion Mobile Inbox integration |
| Phase 1 W3 | `process_inbox_voice_memos` batch + Bridge integration |
| Phase 2 | `transcribe_song` + `music-is/lyric-rights-registration` skill composition |
| Phase 3 | Hosted deployment for multi-device Frank access (mobile-side Whisper run) |
| Phase 5 | Productization: this MCP ships as part of the Music IS template package |

---

## Testing

```
npm test                    # unit tests
npm run test:integration    # end-to-end with sample voice memos
npm run test:flow           # full voice-memo-to-prompt pipeline
```

Sample test fixtures at `tests/fixtures/voice-memos/` — 5 sample memos covering Idea / Lyric Fragment / Brief / Reference Pointer / Suno Prompt Seed classifications.

---

## Open questions (Phase 1 to resolve)

1. **whisper.cpp vs. OpenAI API default** — sovereignty mode vs. quality. Default to OpenAI API for v0.1; whisper.cpp opt-in via `MODE=local-fallback`.
2. **Audio URL fetching for protected platforms** — Spotify/YouTube/Bandcamp use DRM/anti-scrape. Use yt-dlp where legal; for Spotify, fall back to manual URL-to-MP3 upload by Frank.
3. **Notion attachment downloads** — Notion's audio attachments need authenticated fetch; bridge through `notion-fetch` MCP tool.
4. **Privacy of voice memos** — Frank's voice memos may contain personal context. Whisper transcripts live in `private/` only; never in public substrate.

---

**Built on SIP** — `verticals/music-is/mcps/whisper-mcp/README.md` · v0.1 · 2026-04-30 · P0 priority · scaffold only · ready for Claude Code build
