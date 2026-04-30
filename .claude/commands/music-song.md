---
description: Capture a Suno URL into Music IS catalog draft + queue asset render
argument-hint: <suno-url> [persona] [intent]
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# /music-song — Suno URL → catalog draft

Capture a Suno-generated song into the Music IS catalog as a draft row, queue asset render, register in label/persona indexes.

## Usage

```
/music-song https://suno.com/song/abc123 frank-riemer evening-piano
/music-song https://suno.com/song/xyz789 pulse-01 lo-fi-evening
```

## Arguments

- **suno-url** (required) — Suno song URL or extension share URL
- **persona** (required) — persona codename; rejection if not provided or invalid
- **intent** (optional) — short tag like "evening-journal", "gym-peak", "score-grade"

## Behavior

Invokes `music-is/song-intake` skill (Mechanical tier, Haiku 4.5):

1. Validates persona (must be active in `verticals/music-is/labels/<label>/personas/<persona>/CANON.md`)
2. Extracts Suno metadata (title, prompt, BPM, duration, structure tags)
3. Generates song-id: `<persona>_<YYYYMMDD>_<short-slug>`
4. Writes `catalog/master.csv` draft row + `catalog/draft/<song-id>.md`
5. Registers in persona's `releases-index.md`
6. Dispatches `music-producer` (Sonnet 4.6) to queue asset render bundle (cover + motion + Canvas; +Higgsfield for cinematic-grade labels)
7. Returns: catalog row written, draft md path, asset queue status, next-step suggestion

## Refusals

- No persona attribution → orphan track refused
- Persona not registered in active LABELS.md
- Engine not declared in STACK.md L2
- Vocal track using non-Frank cloned voice without consent doc on file
- Duplicate intake (idempotent; use update path for revisions)

## Composes with

- `/music-suno-prompt` — generate the prompt that produces the URL
- `/music-release` — gate the song after asset bundle complete

---

**Built on SIP** — `/music-song` · Mechanical tier · idempotent · persona-attribution-required
