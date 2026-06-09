# DECISIONS — Music IS / Arcanea Records

> Architectural decisions resolved at Phase 0 spawn. Each decision has a position, a reason, and a revisit-trigger. Re-litigation requires explicit canon-update + `MEMORY.md` log.

**Date locked:** 2026-04-29
**Author:** Frank (architect)
**Companion:** `STRATEGY.md` references these decisions; future `MEMORY.md` revisions reference these IDs.

---

## D1 — Vertical home

**Position:** Music IS lives at `verticals/music-is/` in this Starlight scaffold (in-substrate mirror) for Phase 0-2. Migrates to dedicated repo `arcanea-ecosystem/labels/arcanea-records` when Phase 3 amplification mesh stabilizes.

**Reason:** building alongside Starlight skills/agents/commands during Phase 0-2 keeps iteration tight; dedicated repo overhead would slow spawn. Long-term home per VERTICALS.md canon is `arcanea-ecosystem/labels/arcanea-records`.

**Revisit-trigger:** Phase 3 close OR substrate-tier file-contract pollution risk if music-IS-specific patterns leak into Starlight reference scaffold.

---

## D2 — Public reference vs. operated layer separation

**Position:** `verticals/sound-intelligence/` remains the **public reference vertical** (forkable substrate for sovereign sound practitioners; six sub-systems: Composition · Production · Catalog · Performance · Audience · Sync; DAW-based; rights-and-clearance-aware). `verticals/music-is/` is **Frank's operated layer** (AI-music label; Suno-first; persona-multiplication; OpenClaws amplification; royalty-cascade).

The two compose at the methodology layer (Music IS imports patterns from Sound Intelligence; e.g., sync brief-fit, metadata discipline, mastering reference) but do not duplicate substrate.

**Reason:** the canon already distinguishes Sound Intelligence (open reference) from Music IS (Frank's specific operated music vertical) per VERTICALS.md § "Music IS" and § "Sound Intelligence." Conflating them dilutes both. The accidental SOUL.md overwrite (2026-04-29 morning session) demonstrated the risk.

**Revisit-trigger:** never. This separation is structural.

---

## D3 — Catalog primary

**Position:** Excel/CSV master is the **single source of truth** for catalog. Markdown corpus per persona is structured supplemental truth. Notion mirrors. Linear tracks state. Dashboard observes.

**Reason:** sovereignty + offline-readable + vendor-lock-free + git-trackable + scriptable. Notion has been Frank's drift-source historically (per `feedback_strategy_shipping`).

**Revisit-trigger:** if Excel becomes a bottleneck at >10K rows AND a sovereign alternative (SQLite + custom UI? Airtable self-hosted?) is identified. Not before Phase 5.

---

## D4 — Persona naming convention (REVISED 2026-04-29)

**Position:** **Name-from-canon, grounded in naming-intelligence.** Personas are named at spawn through `naming-intelligence` skill 6-axis test (memorability / searchability / sonic-feel / brand-extensibility / canon-fit / pronounce-ability+global) plus availability check (Spotify, Apple Music, YouTube, Bandcamp, Google, USPTO/EUIPO basic). The chosen name is locked at spawn; ships under that name from release #1.

**Codename optional only** when the public name is intentionally deferred for a strategic reason (e.g., pre-launch confidentiality during a campaign window). Default is **public name from spawn**.

**Reason:** the original v0.1 codename-first decision (2026-04-29 morning) was a wrong simplification. Frank's existing brand-graph + Arcanea ecosystem canon + 10 Guardian roster provides rich naming substrate; deferring real-name decision sacrifices brand compounding for false optionality. Personas built under public names accumulate audience equity from release #1; renaming mid-stream costs more than locking right at spawn.

**Methodology lock:** every persona spawn invokes `naming-intelligence` skill before persona enters canon. The 6-axis scorecard is preserved at `verticals/music-is/labels/<label>/personas/<persona>/NAMING.md` so future audits can review the lock decision.

**Revisit-trigger:** never re-litigate naming-from-canon as the structural posture. Per-persona name revisions allowed only with documented canon-evolution justification and migration plan (audience equity preservation).

**Predecessor:** D4 v0.1 (codename-first) — superseded same day after Phase 0 review.

---

## D5 — Distribution rails

**Position locked:**

- **Streaming primary:** DistroKid (owner-keeps-rights flat-fee; metadata locked from catalog at gate-pass)
- **Direct primary:** Bandcamp (per-label as warranted; Frank Riemer always; Arcanea always; Frank's Vibes optional; Nona Phase 2+)
- **Owned:** frankx.ai/music (auto-synced from catalog; per-label sub-pages from Phase 4)
- **Discovery:** Spotify Canvas non-optional per release; Spotify for Artists pitching per-release per `/music-release` checklist
- **Sync rails (Phase 6+):** Musicbed + Artlist + Songtradr + Pond5 + Position Music for library; direct deals for high-leverage placements
- **NFT/limited (Phase 6+):** Sound.xyz + Catalog + Zora — Arcanea label first (Guardian-canon-tied); Frank Riemer second (limited vinyl tied); Frank's Vibes optional; Nona merch-tied not NFT

**Refused:**
- Aggregators that take master ownership ("all-rights-flips for advance")
- Paid-playlist placement networks
- Platforms without published royalty-rate transparency
- Free distribution that takes streaming royalties

**Reason:** maximizes sovereignty + revenue-per-stream + optionality across rails. Distro-by-canon-fit not by genre-default.

**Revisit-trigger:** Phase 6 mid-quarter (Q3 2027) when sync direct-deal volume is observable.

---

## D6 — Brand boundary (substrate vs. instance vs. label)

**Position:**

- **Substrate (open reference)** — ships under **Starlight Intelligence**: `verticals/sound-intelligence/` (six-sub-system reference vertical); `/spawn-domain-stack` meta-pattern.
- **Operating instance (Frank's specific)** — ships under **Arcanea Records**: `verticals/music-is/` (this vertical); `arcanea-ecosystem/labels/arcanea-records` (long-term repo home).
- **Each label** — ships under its **own label brand**: Frank Riemer / Frank's Vibes / Arcanea / Nona — distinct DSP identities, distinct mailing lists, distinct fan loops.
- **Frank's personal channel (frankx.ai)** — cross-label amplification + architect content + Music IS productization marketing.
- **Arcanea ecosystem integration** — Arcanea label only, via Guardian canon binding; royalty-cascade graph references Arcanea ecosystem attribution-cascade.

**Reason:** four-label structure exists because audiences are different; collapsing brands collapses moat. Substrate stays open (forks compounded via SIP attestation); instance stays Frank-owned; each label stays sharp.

**Revisit-trigger:** never. Structural.

---

## D7 — First three personas (Phase 1 priority) (REVISED 2026-04-29)

**Position locked:**

1. **Frank Riemer (label) → Frank himself (persona)** — Phase 1 first. Already Frank's identity. First 12 gated releases here in May 2026. **Locked.**

2. **Arcanea (label) → Alera (Voice Guardian, 528 Hz, Whale Otome Godbeast)** — Phase 1 second. **Locked** per Arcanea ecosystem canon (`Arcanea/.arcanea/lore/CANON_LOCKED.md` TIER 2). Alera is the canonical Voice Guardian — sound-embodied by canon. Releases tuned to 528 Hz; composes with Frank's existing 528Hz healing-frequency cluster (per FrankX MUSIC_CATALOG_INDEX.md). First 6 releases EP-format Phase 1 close.

3. **Frank's Vibes (label) → naming-decision pending; top 3 candidates** — Phase 1 third. Candidates per `naming-intelligence` 6-axis test: **Lumen** / **Aether** / **Dawn**. Frank locks at `/music-persona franks-vibes <name>` after availability check (Spotify, Apple Music, YouTube, Bandcamp, Google, USPTO/EUIPO trademark). Default: spawn under public name from release #1 per D4 revision.

4. **Nona (label)** — deferred to Phase 2. Naming candidates Phase 2-readiness: **Razor** / **Iron** / **Crash** per `naming-intelligence`.

**Reason for revised order (Arcanea #2 instead of #3):**
- Alera's frequency-tuning composes natively with Frank's existing 528 Hz catalog (45+ tracks already cataloged per FrankX MUSIC_CATALOG_INDEX); first releases can leverage existing audience signal
- Arcanea label's per-Guardian frequency-suite is the unique moat — starting with Alera lights the canon-binding architecture early
- Sync-licensing leverage on Arcanea label is highest (cinematic-grade); earlier launch = earlier sync pitches
- Frank's Vibes is still next-most-volume but moves from #2 → #3 due to naming decision pending (Lumen/Aether/Dawn)

**Predecessor:** D7 v0.1 (Pulse-01 / Razor-01 / TBD Guardian) — superseded same day after Arcanea Guardian canon discovery.

**Revisit-trigger:** Phase 1 close — review Alera's release-cadence baseline (6 gated releases) before spawning Lyssandria (Phase 2 Arcanea persona #2).

---

## D8 — Notion role

**Position:** Notion is **mirror-only.** Single source of truth = local Excel + markdown. Notion never authors. Manual edits in Notion are not authoritative — they get overwritten on next sync.

**The four existing Notion surfaces collapse:**

| Notion surface | Role | Action |
|---|---|---|
| AI Musicians Hub | Catalog mirror; primary user-facing dashboard view | Schema-lock to `catalog/master.csv`; rename "Music IS — Label Board" |
| Vibe OS | Per-persona canon library | One row per persona; child page = full canon doc |
| FrankX Music Brand Strategy | Frank Riemer label CANON page | Migrate to Vibe OS as Frank Riemer label row; archive standalone |
| Music | Playlist/release feed for frankx.ai/music | Mirror only; auto-synced from `catalog/released/` |

**Reason:** Notion's drift-source pattern is documented (per `feedback_strategy_shipping`). Excel + markdown sovereignty is locked.

**Revisit-trigger:** never. Structural. Sync mechanism (Phase 1+) auto-detects Notion drift and overwrites.

---

## D9 — Token tier discipline (model routing)

**Position locked per `feedback_model_routing_discipline`:**

- **Apex (Opus 4.7)** — `music-curator` (A&R green-light), `persona-keeper` (canon defense), persona-spawn `/music-persona`
- **Senior (Sonnet 4.6)** — `music-producer`, `music-distributor`, `music-amplifier`, `royalty-architect`; Suno prompt synth; sync pitch composition; per-platform copy generation
- **Mechanical (Haiku 4.5)** — `music-archivist`; catalog CRUD; metadata tagging; social-drop scheduling; status checks
- **External (`/arco`, n8n, direct API)** — Suno gen, nano banana, Seedance, Higgsfield, Remotion, DistroKid, Blotato

Every Agent dispatch sets `model:` explicitly.

**Reason:** Frank's locked routing discipline; tier-mismatch is documented drift cost.

**Revisit-trigger:** if Opus 4.7 / Sonnet 4.6 / Haiku 4.5 successor models ship and deprecation timelines force a re-tier.

---

## D10 — Engine choice (current + future)

**Position:** **Suno v5 primary** at Phase 0-2. **Engine-agnostic at contract** — every catalog row names the engine + version per row. Knowledge corpus has per-engine sub-folders.

**Future engines (deferred):**
- Suno API direct integration when stable (replaces UI scraping)
- Udio for backup / comparison generations
- Stable Audio for instrumentals + ambient layers
- Custom LoRA / open-weights — Phase 6+ when label-curated dataset is sufficient

**Refused:**
- AI vocals trained on or imitating any specific identifiable artist's voice without written consent
- Engine outputs claimed as "human-composed" without disclosure

**Reason:** engine-coupling is fragility risk. AI-disclosure is structural.

**Revisit-trigger:** Phase 6 — custom LoRA decision based on dataset volume + per-persona stability.

---

## D11 — AI-disclosure posture

**Position:** **Structural, non-waivable.** Per persona bio per platform names AI-generated music produced by Arcanea Records. Per-platform AI-content policies respected (Spotify AI-generated tags, YouTube AI-disclosed labels, etc.). `/sip-attest-audio` embeds attestation in metadata.

**Vocal-impersonation refused** at architecture: refuses AI vocals trained on any non-Frank identifiable artist without written consent on file. Personas voice-cloned from Frank himself explicitly disclosed.

**Reason:** sovereignty + ethics + future-proofing against tightening regulation.

**Revisit-trigger:** never. Structural.

---

## D12 — `/luminor-board` substrate-tier governance gate

**Position:** `verticals/music-is/` spawn touches **substrate-tier file-contract symmetry** (verticals are substrate-tier per CLAUDE.md). Per CLAUDE.md substrate-tier governance gate (v7.5.1+ rule), `/luminor-board` invokes BEFORE commit/tag for any change touching the `verticals/` namespace.

**Action:** invoke `/luminor-board` after Phase 0 spawn complete, BEFORE git commit. Board reviews file-contract symmetry against `verticals/people-intelligence/` reference and `verticals/sound-intelligence/` reference. Board outcome: PROCEED / PROCEED-WITH-REVISE / HOLD.

**Reason:** structural-not-discretionary per substrate canon.

**Revisit-trigger:** every substrate-tier change touching this vertical's file contract.

---

## D13 — Revenue-baseline trigger for productization (Phase 5)

**Position:** Phase 5 productization spawn requires:
- 3+ active labels (Frank Riemer + Frank's Vibes + Arcanea minimum; Nona optional)
- 3+ months of revenue baseline (steady-state observable per label)
- 30+ gated releases total
- Methodology stability (no drift-test failures in last 2 cycles)

**Reason:** premature productization sells incomplete methodology and damages trust. Wait for compounding signal.

**Revisit-trigger:** Phase 4 close.

---

## D14 — Sovereignty clause non-waivable

**Position:** Per SIP § 5, sovereignty clause is non-waivable across all Music IS productization tiers. Forks at the methodology layer (file contract, command structure, sub-system map) are MIT-licensed; forks of Frank's specific catalog data, persona canons, royalty graphs, fan data are refused without explicit license + per-instance contract.

**Reason:** structural per SIP.

**Revisit-trigger:** never.

---

**Built on SIP** — Music IS DECISIONS.md · v0.1 · 2026-04-29 · 14 decisions locked · Re-litigation requires explicit canon-update.
