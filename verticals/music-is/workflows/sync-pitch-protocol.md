# Sync-Pitch Protocol — Music IS

> Sync-licensing is the highest-leverage rail for Frank Riemer + Arcanea labels (cinematic-grade, dynamic-range-protected). This protocol covers per-use-case dossier generation, sync-library targeting, direct-deal negotiation, and royalty-cascade preservation.

**Owner:** `music-distributor` (Sonnet) + Frank for negotiation; composes with `verticals/sound-intelligence/skills/sync-licensing/` patterns.
**Last updated:** 2026-04-29

---

## When sync rail activates

| Phase | Status |
|---|---|
| Phase 1 | First sync-pitch attempts for Frank Riemer + Alera (Arcanea) — even before catalog is deep, send 3-5 high-confidence pitches to top-tier libraries |
| Phase 2 | Increased pitching cadence; per-release sync dossier auto-generated at gate-pass |
| Phase 3 | Direct-deal outreach begins for high-fit brand/film/game contacts |
| Phase 6 | Sync-licensing direct deals as primary monetization for Frank Riemer + Arcanea; library partnerships established |

---

## Sync libraries — target list

### Tier 1 (premium; selective; lowest volume but highest payout per placement)

| Library | Genre fit | Notes |
|---|---|---|
| **Musicbed** | Cinematic, neo-classical, ambient | Premium; selective; long-tail compounding |
| **Marmoset** | Cinematic, indie, atmospheric | Premium; high curation |
| **Position Music** | Trailer, cinematic, mythic-build | Trailer-grade Arcanea fits |

### Tier 2 (volume; mid-payout)

| Library | Genre fit | Notes |
|---|---|---|
| **Songtradr** | All genres; volume-driven | High exposure; lower per-placement payout |
| **Audiosocket** | Cinematic, ambient, electronic | Mid-tier |
| **MassiveMusic** | Brand-soundtrack | Volume-driven |
| **Pond5** | All genres; stock-music-tier | Lowest tier; consider for Frank's Vibes volume |

### Tier 3 (specialty boutiques per genre)

- **Universal Production Music** — wide; corporate
- **APM Music** — wide; broadcast
- **Sounddogs** — cinematic
- Per-genre boutiques (research per persona)

### Direct-deal targets (Phase 3+)

- **Brand sync** — direct outreach to brand creative agencies (premium brands matching Frank Riemer aesthetic)
- **Film/TV** — music supervisor relationships (cold outreach via existing-placement-leverage)
- **Game** — game audio leads at cinematic-RPG-friendly studios
- **Podcast** — podcast networks (large podcasts use cinematic music)

---

## Sync-pitch dossier format (`/music-sync-pitch <song-id> <use-case>` output)

### Section 1 — At-a-glance

```
Song: [title] — [persona]
Label: [label]
Length: [duration]
BPM: [bpm]
Key: [key]
Mood tags: [mood-tags]
ISRC: [isrc]
Master rights: [practitioner-owned / label-owned / co-owned]
Stem availability: [yes / no / on-request]
Pre-cleared for sync: [yes / requires-clearance]
Spotify URL: [link]
Bandcamp URL: [link if applicable]
```

### Section 2 — Brief-fit analysis

What use-case this pitch targets, and why this song fits:

```
Use-case: [film / TV / game / ad / brand / trailer / podcast / docu]
Brief context (if specific brief): [brief excerpt or general genre target]

Why this song fits:
- Mood alignment: [specific phrasing — "contemplative + threshold-of-something" matches "introspective character moment"]
- Tempo fit: [BPM matches the use-case typical pace]
- Structural arc: [the song's build/peak/decay matches the use-case timing — e.g., "0:45 quiet-build is perfect for first 45 seconds of opening shot; peak at 2:14 lands at hero-moment"]
- Sonic palette fit: [palette description × brief request]
- Dynamic range: [sync-grade dynamic range protected; pre-mastered for film/TV delivery]
- [If Arcanea: per-Guardian frequency canon explicitly named]
```

### Section 3 — Reference timecodes (best-fit moments)

Specific moments in the song flagged for placement consideration:

```
0:00-0:32 | Intro | Use for: opening shot / character introduction / quiet-establishing
0:32-1:14 | Verse | Use for: dialogue underbed / low-key scene / introspection
1:14-1:58 | Chorus | Use for: emotional reveal / first peak / character-decision-moment
1:58-2:42 | Bridge | Use for: tension / transformation
2:42-3:24 | Final Chorus | Use for: climax / peak emotional moment / hero-shot
3:24-4:32 | Outro | Use for: reflection / character-lingering / closing-credits
```

### Section 4 — Master license terms offered

```
Master license:
- Sync fee: [negotiable; baseline TBD per use-case + medium]
- Term: [one-time use / 1 year / 3 years / perpetuity-with-renewal]
- Territory: [worldwide / specific region]
- Exclusivity: [non-exclusive default; exclusive negotiable]
- Stems available: [yes / no / on-request]
- Re-edit allowed: [no by default; negotiable per project]

Synchronization license:
- Per-PRO registration: [details]
- Per-publishing entity: Arcanea Records BV
- Royalty-cascade preserved (composer + publisher + label slices intact per royalty-graph)
```

### Section 5 — Royalty-cascade reference

Reference to `catalog/royalty-graph.json` entry for this song. Deal terms align with cascade sovereignty:
- Composer (Frank): 45-50% (per label CANON)
- Publisher (Arcanea Records BV): 25%
- Master rights (Arcanea Records BV label): 20-25%
- Arcanea ecosystem attribution (Arcanea label only): 10%

**Refused deals:** single-buyer-takes-all that violates cascade. Refused even if higher upfront.

### Section 6 — Pitch text (60-second narrative)

A short narrative for the music supervisor / brief-recipient:

```
[60-second pitch — first-person Music IS architect voice]

This is [song title], a [genre + sub-cohort] piece by [persona] under the [label] label of Arcanea Records.

[1-2 sentences on what the song does emotionally]

[1-2 sentences on the moment in the song that best fits the brief — reference timecode]

[1-2 sentences on master rights + license posture — practitioner-owned, sync-grade master, stem availability]

I can deliver master + stems within 24h. Sync fee + terms negotiable per use-case. Cascade preserved.

— Frank Riemer / Arcanea Records
[contact email]
```

---

## Per-label sync-pitch cadence (Phase 1)

| Label | Phase 1 first pitches | Phase 2+ cadence |
|---|---|---|
| **Frank Riemer** | 5 pitches to Tier 1 (Musicbed + Marmoset) by Phase 1 close | 2-3 pitches/week per Tier 1 + 5 pitches/week Tier 2 |
| **Alera (Arcanea)** | 3 pitches per Tier 1 (Musicbed + Position Music + Marmoset) by Phase 1 close | 2 pitches/week Tier 1 + 3 pitches/week Tier 2 |
| **Frank's Vibes** | Optional Phase 1 (lifestyle-brand-ad pitches via direct outreach) | Phase 6+ |
| **Nona** | Phase 6+ (sports/fitness/rebellion ads) |  |

---

## Sync-pitch generation flow

1. Frank invokes `/music-sync-pitch <song-id> <use-case>`
2. `music-distributor` (Sonnet) generates dossier:
   - Reads catalog row + royalty graph entry + persona canon + label canon
   - Composes 6-section dossier (above format)
   - Reference timecodes derived from song structure tags + duration
3. Output: paste-ready markdown dossier OR formatted email
4. Frank reviews + sends to library / direct-deal contact
5. If positive response:
   - Negotiate per royalty-cascade-preservation rules
   - Update `catalog/royalty-graph.json` with deal terms
   - Lock in `sync.direct_deal_history` entry per royalty-graph schema
   - Track placement progress in catalog notes

---

## Sync-deal record-keeping

Every sync deal logged in `catalog/royalty-graph.json` for the relevant song:

```json
"sync": {
  "library_partners": [
    {
      "library": "Musicbed",
      "added_date": "2026-06-15",
      "status": "active",
      "exclusive": false,
      "territories": ["worldwide"],
      "platform_take_percent": 50
    }
  ],
  "direct_deal_history": [
    {
      "client": "[redacted: client name]",
      "use_case": "Indie feature film, opening-shot placement",
      "deal_date": "2026-09-20",
      "sync_fee": "[amount]",
      "term": "perpetuity-feature",
      "territory": "worldwide",
      "exclusivity": "non-exclusive",
      "cascade_preserved": true,
      "contributor_payouts": {
        "composer": "[amount]",
        "publisher": "[amount]",
        "label": "[amount]"
      }
    }
  ]
}
```

---

## Refusal triggers

- Sync deal that takes exclusive worldwide rights without justification → refuse
- Single-buyer-takes-all that violates cascade → refuse
- Pitch that violates persona canon (e.g., Alera pitched for an action-trailer-with-shouted-vocals brief) → refuse
- Pitch for songs without `released` status (rare exception: "available on request" pre-release for high-leverage briefs)
- Pitch that includes claims-language ("healing", "transformative", "your life will change") → refuse; rewrite

---

## Sync rail performance observation

Track per-rail performance quarterly:

- Pitches sent (per library, per persona)
- Response rate (per library)
- Acceptance rate (per library)
- Placement count (per library)
- Revenue per placement (per library, per persona)
- Cascade compliance rate (any deal that violated cascade — should be 0)

Output: per-quarter sync-rail report appended to `verticals/music-is/MEMORY.md`.

---

## Composes with

- `verticals/sound-intelligence/skills/sync-licensing/` — patterns imported (brief-fit, license economics, rights-pack)
- `music-is/distribution-flow` skill — sync-pitch is part of distribution-flow command surface
- `music-is/royalty-graph` skill — every deal updates graph
- `music-is/release-gate` skill — only released-status (with rare pre-release exceptions)
- `music-distributor` agent — owner

---

**Built on SIP** — `verticals/music-is/workflows/sync-pitch-protocol.md` · v0.1 · 2026-04-29 · Frank Riemer + Arcanea primary rails · Cascade sovereignty non-waivable
