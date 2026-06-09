# QUICK-START — Music IS / Arcanea Records

> Front door for entering the system. Where you are, what's built, what's pending, what to do next.

**Last updated:** 2026-04-29 (Phase 0 spawn complete; Phase 1 ready)

---

## Where you are

**Phase 0 spawn — COMPLETE.** Music IS vertical scaffolded at `verticals/music-is/` with full file contract, 4 labels, 8 skills, 8 commands, naming intelligence, Notion architecture, end-to-end workflows, productization spec, failure runbook.

**Phase 1 — READY TO START.** First persona spawn (Alera locked, Frank Riemer locked, Frank's Vibes #1 naming-decision-pending) + Suno mastery enrichment + first 12 gated releases for Frank Riemer label.

---

## The four labels (locked)

| Label | Persona Phase 1 | Status |
|---|---|---|
| **Frank Riemer** | Frank Riemer (himself) | locked |
| **Frank's Vibes** | Lumen / Aether / Dawn (Frank locks one) | naming-pending |
| **Arcanea** | **Alera** (Voice Guardian, 528 Hz) | locked |
| **Nona** | (deferred to Phase 2) | — |

Full label CANONs at `labels/<slug>/CANON.md`. Per-Guardian Arcanea roster at `labels/arcanea/CANON.md`.

---

## Today (next session, 30-60 min)

### Action 1 — Lock Frank's Vibes persona name

Read `labels/franks-vibes/NAMING.md` scorecard. Pick one: **Lumen** (recommended) / **Aether** / **Dawn**.

Then:
```
/music-persona franks-vibes lumen
```
(or `aether` / `dawn`)

This spawns the persona scaffold; you populate sound DNA + visual DNA + voice DNA + audience contract + monetization stack at scaffold time.

### Action 2 — Verify availability of locked names

Search Spotify, Apple Music, YouTube, Bandcamp, Google for:
- "Lumen" (or your chosen Frank's Vibes name)
- "Alera"
- "Frank Riemer" (validate yours)

Confirm no major-artist conflicts. If conflict, return to NAMING.md for next-tier candidate.

### Action 3 — Begin catalog migration (Phase A)

Read `catalog/MIGRATION.md`. Start with Migration Phase A: 46 already-cataloged tracks from FrankX `MUSIC_CATALOG_INDEX.md`.

```
/music-song <suno-url> <persona> <intent>
```

Run this for the 46 cataloged tracks (or batch import script if Phase 1 ships migration tooling).

### Action 4 — First Frank Riemer release through gate

Once you have:
- 1 song in `catalog/draft/<song-id>.md`
- Asset bundle complete (cover + motion-short + Canvas)
- Royalty graph entry stub

Run:
```
/music-release <song-id>
```

Music-curator gates. If pass: distro pushes to DistroKid + Spotify Canvas + Bandcamp + frankx.ai/music; amplification mesh schedules N drops; royalty graph locks.

This is your **first proof of life** — full end-to-end pipeline run.

---

## This week (Phase 1 week 1)

- ✅ Phase 0 spawn complete
- [ ] Frank's Vibes persona name lock
- [ ] Migration Phase A complete (46 tracks)
- [ ] First Frank Riemer release through gate
- [ ] First Alera release plan drafted (per `labels/arcanea/personas/alera/CANON.md` release plan)
- [ ] Notion sync setup (AI Musicians Hub schema-locked)

---

## File map (where everything lives)

### Vertical core (10 files)

```
verticals/music-is/
├── README.md           # Overview + 4 labels
├── SOUL.md             # Refusal posture + drift tests
├── STACK.md            # 7-layer stack
├── LABELS.md           # 4 labels at-a-glance + Phase 1 personas
├── AGENTS.md           # 7 agents + tier discipline
├── SUB-SYSTEMS.md      # 6 sub-systems
├── STRATEGY.md         # 6-phase plan, 18-24 months
├── DECISIONS.md        # 14 locked decisions (D4 + D7 revised)
├── MEMORY.md           # Append-only operational log
├── CANON.md            # At-a-glance canonical resolver
└── QUICK-START.md      # ← you are here
```

### Skills (9 files at `skills/music-is/`)

- `persona-canon` (Apex/Opus) — spawn + canon defense
- `naming-intelligence` (Senior+/Apex) — 6-axis test + availability
- `suno-prompt` (Senior/Sonnet) — grounded prompt synthesis
- `song-intake` (Mechanical/Haiku) — Suno URL → catalog draft
- `asset-render` (Senior/Sonnet) — cover/motion/Canvas/Higgsfield orchestration
- `release-gate` (Apex/Opus) — non-waivable A&R gate
- `amplification-mesh` (Senior/Sonnet) — OpenClaws orchestration
- `catalog-systems` (Mechanical/Haiku) — catalog hygiene + label-board
- `distribution-flow` (Senior/Sonnet) — DistroKid/Bandcamp/Canvas/sync
- `royalty-graph` (Senior/Sonnet) — attribution-cascade design + observation

### Commands (8 files at `commands/music-*.md`)

- `/music-song` — Suno URL → catalog draft
- `/music-persona` — Spawn persona (with naming-intelligence)
- `/music-release` — A&R green-light gate
- `/music-label-board` — Multi-persona portfolio scorecard
- `/music-suno-prompt` — Grounded Suno prompt synthesis
- `/music-amplify` — Cross-platform amplification scheduling
- `/music-canvas` — Spotify Canvas + Reel/Short generation
- `/music-sync-pitch` — Sync-licensing pitch dossier

### Per-label content (`labels/<slug>/`)

```
labels/
├── frank-riemer/
│   ├── CANON.md                          # Label canon
│   └── personas/frank-riemer/CANON.md    # Persona = artist-of-record
├── franks-vibes/
│   ├── CANON.md                          # Label canon
│   └── NAMING.md                         # Persona naming scorecard (Lumen / Aether / Dawn)
├── arcanea/
│   ├── CANON.md                          # Label canon (10 Guardians + frequency canon)
│   └── personas/
│       ├── alera/CANON.md                # Phase 1 persona
│       └── lyssandria/CANON.md           # Phase 2 persona prep
└── nona/
    ├── CANON.md                          # Label canon
    └── NAMING.md                         # Persona naming scorecard (Crash / Razor / Iron)
```

### Knowledge corpus (`knowledge/`)

```
knowledge/
├── suno/
│   ├── prompt-pattern-library.md         # 3-layer pattern + per-genre anchors
│   ├── structure-tags-reference.md       # Suno syntax
│   ├── genre-style-cards.md              # 11 cards across 4 labels
│   ├── vocal-control-recipes.md          # 10 recipes
│   └── known-bugs-workarounds.md         # 10 known bugs
└── naming/
    ├── musician-naming-patterns.md       # 6 pattern families + genre affinity
    └── banned-names.md                   # Reserved + per-pattern-banned
```

### Workflows (`workflows/`)

```
workflows/
├── release-cycle-sop.md                  # 10-stage spine workflow
├── persona-social-setup-sop.md           # Per-persona × per-platform setup
├── weekly-hygiene-sop.md                 # 12-check Monday ritual
├── asset-pipeline-n8n-spec.md            # Phase 2 autonomous render
├── sync-pitch-protocol.md                # Sync-licensing dossier protocol
├── voice-lock-template.md                # Per-persona × per-platform format
├── revenue-observation-spec.md           # Per-rail tracking + Wealth IS composition
├── failure-mode-runbook.md               # 3-tier severity recovery protocols
└── sync-system-integration.md            # Compose with FrankX existing infrastructure
```

### Notion architecture (`notion/`)

```
notion/
└── SCHEMA.md                             # 4 surfaces collapsed to mirror-only
```

### Catalog (`catalog/`)

```
catalog/
├── master.csv                            # Source of truth (schema seeded)
├── MIGRATION.md                          # 3-tier migration plan
├── draft/                                # Pre-gate per-song docs
├── released/                             # Post-gate immutable
├── archived/                             # Withdrawn
└── royalty-graph.json                    # Attribution-cascade graph
```

### Productization (`productization/`)

```
productization/
└── PHASE-5-SPEC.md                       # Phase 5 (Q1 2027) template productization
```

---

## The 6-phase plan (compressed)

| Phase | Window | Headline ship | Trigger to next |
|---|---|---|---|
| **P0** | This week (DONE) | File contract + skills + commands + scaffolds | Phase 1 start |
| **P1** | May 2026, 4w | Frank Riemer 12 releases + Alera 6 releases + Suno mastery + naming locks | 12 releases live + revenue baseline visible |
| **P2** | June 2026, 4w | Asset pipeline autonomous (n8n) + Frank's Vibes persona spawn | 30+ releases + autonomous pipeline proof |
| **P3** | Q3 2026, 8w | OpenClaws amplification mesh (5 Claws × persona) | 10K+ followers OR $1K month from amplification |
| **P4** | Q4 2026, 8w | frankx.ai/music/studio dashboard live + multi-label scaling | 3+ labels + 3+ months baseline |
| **P5** | Q1 2027, 12w | Productize Music IS template (3 tiers €19/€597/enterprise) | 10 paying customers OR 1 Enterprise |
| **P6** | Q2 2027+ | NFT + sync direct + fan tier + royalty cascade sovereignty | ongoing compounding |

---

## The 14 locked decisions (one-line each)

D1: Music IS at `verticals/music-is/` Phase 0-2; migrates to dedicated repo Phase 3+
D2: Public reference (sound-intelligence) vs. operated (music-is) — separate, compose at methodology
D3: Excel/CSV master = truth; Notion mirror only
D4: **Name-from-canon, naming-intelligence-grounded; codename optional only** ← REVISED 2026-04-29
D5: DistroKid streaming + Bandcamp direct + Sound.xyz NFT (Phase 6)
D6: Brand boundary — Starlight (substrate) / Arcanea Records (instance) / per-label brands / frankx.ai (cross-label)
D7: **Phase 1 personas: Frank Riemer #1, Alera #2, Frank's Vibes #1 (naming-pending) #3, Nona Phase 2** ← REVISED 2026-04-29
D8: Notion mirror-only; Excel + markdown is truth
D9: Token tier — Opus (taste/canon) / Sonnet (orchestrate) / Haiku (CRUD) / external (engines)
D10: Suno v5 primary; engine-agnostic at contract
D11: AI-disclosure structural; vocal-impersonation refused without consent
D12: `/luminor-board` substrate-tier gate before commit (now in autonomous mode per session note)
D13: Phase 5 productization triggers — 3+ labels + 3+ months revenue + 30+ releases
D14: Sovereignty clause non-waivable (SIP § 5)

---

## What pending Phase 1 close

- [ ] First Frank's Vibes persona name lock (Lumen/Aether/Dawn)
- [ ] First availability checks pass for Frank Riemer + Alera + Frank's Vibes #1 names
- [ ] Migration Phase A: 46 tracks ingested
- [ ] First Frank Riemer release gated + live across rails
- [ ] First Alera release gated + live (composing with 528 Hz cluster)
- [ ] First sync-pitch sent (Frank Riemer + Alera; Tier 1 libraries Musicbed + Marmoset + Position Music)
- [ ] Notion sync setup (AI Musicians Hub schema-locked + Vibe OS migration)
- [ ] First weekly hygiene ritual run (Monday cycle)

---

## Quick-reference commands

```
/music-song <suno-url> <persona> [intent]
/music-persona <label> <persona-name>
/music-release <song-id> [--override]
/music-label-board [label]
/music-suno-prompt <intent> <persona>
/music-amplify <song-id> <channels>
/music-canvas <song-id>
/music-sync-pitch <song-id> <use-case>
```

---

## When stuck or things break

→ `workflows/failure-mode-runbook.md` (3-tier severity recovery protocols)

---

## What this gives you

- **A real label with canon-discipline** — not a Suno content-factory
- **Persona-multiplication scaling** with multiplication-discipline preventing dilution
- **Royalty-cascade sovereignty** designed at every release
- **Sync-licensing rail compounding** as the highest-leverage monetization
- **Frequency-canon Arcanea label** with 10-Guardian frequency-suite as unique moat
- **Auto-amplification mesh** Phase 3+ with voice-lock-discipline
- **Productizable methodology** Phase 5+ for €19-€100K+ tiers
- **Built on SIP attestation** every artifact carries provenance

---

**Built on SIP** — `verticals/music-is/QUICK-START.md` · v0.1 · 2026-04-29 · The front door · Phase 0 complete · Phase 1 ready
