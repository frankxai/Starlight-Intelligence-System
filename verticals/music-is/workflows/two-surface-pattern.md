# Two-Surface, One-Truth Pattern

> The operational architecture of Music IS. Mobile is the capture surface; Desktop is the processing surface; the catalog is the source of truth. Both surfaces serve the operator from different physical contexts; neither owns truth.

**Last updated:** 2026-04-30

---

## The pattern

```
        ┌──────────────────────────┐
        │       MOBILE             │
        │   (Notion app, phone)    │
        │                          │
        │  📥 Mobile Inbox DB      │
        │  • Drop Suno URL         │
        │  • Note an idea          │
        │  • Voice memo            │
        │  • Lyric fragment        │
        │  • Brief / reference     │
        │                          │
        │  5-second capture        │
        └────────────┬─────────────┘
                     │  Notion sync
                     ▼
        ┌──────────────────────────┐
        │       TRUTH              │
        │                          │
        │  catalog/master.csv      │
        │  per-persona CANON.md    │
        │  royalty-graph.json      │
        │  knowledge/suno/         │
        │                          │
        │  Local Starlight repo    │
        │  Git-tracked + offline   │
        └────────────▲─────────────┘
                     │  catalog reads / writes
                     │
        ┌────────────┴─────────────┐
        │       DESKTOP            │
        │   (Bridge artifact)      │
        │                          │
        │  🎛 Music IS Bridge      │
        │  • 3 next actions        │
        │  • 10-stage pipeline     │
        │  • 4-persona swim-lanes  │
        │  • Inbox queue           │
        │  • 7-agent suggestions   │
        │                          │
        │  Single-pilot cockpit    │
        └──────────────────────────┘
```

---

## Surface responsibilities

### Mobile surface (Notion app)

**Owns:** capture + light triage. Frank's on-the-go reach into the system.

**Reads from:** Mobile Inbox (its own captures), AI Musicians Hub (mirror of catalog for browsing), Vibe OS (persona reference).

**Writes:** Mobile Inbox entries only. **Never edits catalog directly.**

**Friction budget:** ≤10 seconds per capture. If a capture takes more, the pattern failed.

**Capture types:**
- **Suno URL** — paste link + pick Persona Hint (Frank Riemer / Alera / Frank's Vibes #1 / Nona / Unsure). Done.
- **Idea** — 1-3 sentences. Persona/Label hints optional.
- **Voice Memo** — audio attachment + 1-line intent note (transcribed at processing time).
- **Photo** — visual reference (cover-art inspiration, scene mood, etc.).
- **Lyric Fragment** — short text snippet for future use.
- **Brief** — context for a future track ("4-min cinematic for indie docu, prestige tone, no vocals").
- **Reference** — link to existing track / artist / piece as influence reference.

**Refusals at mobile layer:**
- No direct edits to released-status catalog rows
- No persona spawn (requires `/music-persona` via desktop)
- No `/music-release` gate (Apex/Opus decision; desktop only)

### Desktop surface (the Bridge)

**Owns:** processing + decisions + dispatch.

**Reads from:** Notion Tasks DB, Mobile Inbox DB, catalog/master.csv (via sync), per-persona CANON.md.

**Writes:** Dispatches `/music-*` commands to chat (which write catalog), updates Notion task status, generates synthesis via embedded Haiku.

**The 5 panels:**
1. **Today's 3 next actions** — per-Executor (Human / Cowork / Claude Code)
2. **Pipeline** — 10-stage flow with live counts
3. **Persona swim-lanes** — Frank Riemer / Alera / Frank's Vibes #1 / Nona-deferred
4. **Mobile Inbox queue** — process captures into catalog
5. **Agent suggestions** — 7 agents + naming-intelligence propose work

**Frequency cap:** Frank opens Bridge ≥1x/day during Phase 1 (morning ritual). Cowork agents can also open it for crew handoffs.

### Truth layer (Starlight repo)

**Owns:** the canonical state. Nothing else is authoritative.

**Files:**
- `catalog/master.csv` — every song row
- `catalog/draft/<song-id>.md` — pre-gate per-song
- `catalog/released/<song-id>.md` — post-gate immutable
- `catalog/royalty-graph.json` — attribution cascade
- `labels/<label>/CANON.md` — per-label canon
- `labels/<label>/personas/<persona>/CANON.md` — per-persona canon
- `labels/<label>/personas/<persona>/social/voice-lock-*.md` — voice samples
- `knowledge/suno/` — Suno mastery corpus
- `knowledge/naming/` — naming-intelligence corpus

**Sync direction:** Truth → mirrors (Notion, Bridge). Never mirrors → truth.

---

## Capture-to-processing flow (Mobile Inbox → catalog)

```
1. Frank captures on mobile:
   Notion app → Music Production project → 📥 Mobile Inbox →
   New entry → pick Type → fill fields → save

2. Capture sits in Mobile Inbox with Status=Not Started.

3. Frank opens Bridge on desktop (morning ritual):
   Panel 4 shows pending captures.

4. Frank clicks "Process queue" button OR opens a single capture:
   Bridge dispatches to chat with appropriate /music-* command:
   - Suno URL → /music-song <url> <persona> <intent>
   - Idea → catalog/draft note creation (no song-id yet)
   - Voice Memo → transcribe + classify + route
   - Lyric Fragment → catalog/draft note OR persona lyrics-bank
   - Brief → future-prompt seed
   - Reference → knowledge/references/<persona>/

5. music-archivist (Haiku) writes catalog row OR persona file.

6. Mobile Inbox capture status → Done (with link to catalog row).

7. Next sync push (sync-notion.ts) updates Notion AI Musicians Hub
   mirror with the new catalog row; Bridge refreshes on next open.
```

---

## Notion-side architecture (4 surfaces, mirror-only)

Per `verticals/music-is/notion/SCHEMA.md`:

| Notion surface | Role | Authority |
|---|---|---|
| **AI Musicians Hub** | Catalog mirror (Music IS — Label Board) | Read-only; manual edits overwritten on sync |
| **Vibe OS** | Persona canon library (one row per persona) | Read-only; manual edits overwritten on sync |
| **Music Production - the Agentic Record Label** | Project hub + Tasks DB + Mobile Inbox | Read-write (this is the operating surface; tasks + captures live here) |
| **Music (feed page)** | Public-facing release feed → frankx.ai/music | Read-only mirror |

**Key distinction:** Tasks DB + Mobile Inbox in the project page are **authoring** surfaces (they live in Notion natively, not mirrors of the repo). All other Notion surfaces are mirrors.

---

## Daily ritual (Frank's morning routine)

```
1. Open Bridge artifact (5 min)
   • Glance drift indicators (3 green dots expected)
   • Read today's 3 next actions
   • Skim Mobile Inbox panel for overnight captures
   • Skim agent suggestions

2. Process Mobile Inbox captures (5-15 min depending on volume)
   • Each capture → click dispatch → review chat → confirm or revise

3. Execute Human-lane next action (15-60 min)
   • Name lock / availability check / curation / A&R review

4. Dispatch Cowork-lane + Claude-Code-lane next actions (5 min)
   • Hand off to Cowork crew (Brand Steward, A&R Lead, etc.)
   • Hand off to Claude Code (script builds, integrations)

5. End-of-day (optional, 5 min)
   • Mark completed tasks done in Bridge
   • Drop tomorrow's first idea to Mobile Inbox if it arrives

Total morning time: ~30-60 min.
```

---

## Future: cross-device sync (Phase 2+)

Phase 2+ targets for tighter mobile/desktop coupling:

- **Push notifications** from Mobile Inbox to Bridge (badge counter on Bridge panel 4)
- **Bridge mobile-web variant** — read-only mobile view via frankx.ai/music/studio/bridge (Next.js dashboard, Phase 4+)
- **Voice memo auto-transcription** — Whisper integration via n8n flow triggered on Mobile Inbox new-entry-with-audio
- **Photo OCR + visual-DNA-match** — when Frank drops a reference photo, auto-classify which persona's visual DNA it could feed
- **Mobile-to-desktop "throw" gesture** — send capture context to Bridge directly via Notion automation + Cowork webhook

---

## Anti-patterns refused

- **Notion as system-of-record** — manual edits to mirror surfaces get overwritten. If you find yourself editing AI Musicians Hub directly, stop and edit catalog/master.csv instead (or accept the overwrite at next sync).
- **Bridge as authoring surface** — Bridge dispatches commands, it doesn't author files directly. All writes flow through chat → /music-* skills.
- **Capture-without-processing** — captures sitting in Mobile Inbox >7 days become stale (hygiene check flags them).
- **Desktop-without-mobile** — losing mobile capture means losing the on-the-go reach; ideas die between locations.
- **Mobile-without-desktop** — captures without processing become noise; nothing compounds without the Bridge gate.

---

## Composes with

- `verticals/music-is/QUICK-START.md` — entry point
- `verticals/music-is/workflows/release-cycle-sop.md` — Stage 4 (Intake) is where captures land
- `verticals/music-is/workflows/cowork-artifacts-spec.md` — Bridge is the realized artifact
- `verticals/music-is/notion/SCHEMA.md` — Notion mirror architecture
- Mobile Inbox Notion DB at `https://www.notion.so/574199d617b447de90da64c08b226379`
- Bridge artifact at Cowork sidebar (`music-is-bridge`)

---

**Built on SIP** — `verticals/music-is/workflows/two-surface-pattern.md` · v0.1 · 2026-04-30 · Mobile = capture; Desktop = processing; Repo = truth · Daily ritual 30-60 min
