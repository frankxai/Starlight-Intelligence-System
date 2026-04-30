# SOP — Release Cycle (idea → revenue)

> The spine workflow. Every Music IS release passes through this end-to-end pipeline. Phase 0-1 manual-assisted; Phase 2+ progressively automated.

**Owner:** Frank + `music-curator` (Opus) + sub-agents
**Last updated:** 2026-04-29

---

## Pipeline overview

```
1. IDEATION → 2. PROMPT → 3. GENERATION → 4. INTAKE → 5. ASSET → 6. GATE → 7. DISTRIBUTION → 8. AMPLIFICATION → 9. OBSERVATION → 10. ROYALTY-CASCADE
```

Each stage has: input · operations · output · refusal triggers · model tier.

---

## Stage 1 — Ideation

**Input:** persona context (active persona for the session) + intent (one-line description: mood, audience, occasion, tempo target, sub-cohort)

**Operations:**
1. Pull persona CANON.md (sound DNA + visual DNA + monetization stack)
2. Check release-calendar for this persona (cadence balance)
3. If persona has 6+ releases queued already, defer ideation to next cycle (multiplication discipline)
4. Articulate intent: 1-3 sentences capturing what THIS song serves (audience moment, transformational purpose, brand-anchor candidate, sync-pitch hypothesis)

**Output:** intent-doc draft (in head or in `catalog/draft/<song-id-tbd>.md` if Frank wants to capture)

**Refusal triggers:**
- No persona context (orphan ideation)
- Intent that violates persona canon
- Cycle exceeds persona's release cadence baseline

**Model:** Opus or Sonnet (Frank-driven; agent assists if requested)

---

## Stage 2 — Prompt synthesis

**Input:** intent + persona + label context

**Operations:**
1. Invoke `/music-suno-prompt <intent> <persona>`
2. `music-is/suno-prompt` skill (Sonnet) reads:
   - `verticals/music-is/knowledge/suno/prompt-pattern-library.md`
   - `verticals/music-is/knowledge/suno/structure-tags-reference.md`
   - `verticals/music-is/knowledge/suno/genre-style-cards.md`
   - `verticals/music-is/knowledge/suno/vocal-control-recipes.md`
   - `verticals/music-is/knowledge/suno/known-bugs-workarounds.md`
   - persona CANON.md (Suno prompt anchors)
   - label CANON.md (sound DNA)
3. Generates 3-5 candidate prompts (3-layer pattern: style stem + intent layer + structure tags)
4. Returns candidates with predicted variability + suggested first re-roll

**Output:** 3-5 grounded Suno prompts paste-ready

**Refusal triggers:**
- Persona context missing
- Prompt violates persona's Suno-anchors
- Specific named non-Frank artist's style requested
- Vocal-clone prompt for non-Frank voice without consent

**Model:** Sonnet 4.6

---

## Stage 3 — Generation

**Input:** 3-5 prompts from Stage 2

**Operations:**
1. Frank generates 3-5 variants per prompt in Suno (manual UI Phase 0-1; API Phase 2+)
2. Tag each variant with seed/version metadata
3. Frank curates: which variant(s) advance to intake
4. Failed variants → log to `verticals/music-is/knowledge/suno/iteration-log.md` with what-failed-and-why
5. **For Arcanea label (per-Guardian frequency canon):** verify generated track frequency-spectrum compliance (528 Hz presence for Alera, etc.) before advance

**Output:** 1-3 Suno URLs of variants worth intaking

**Refusal triggers:**
- Variant violates persona canon (auto-fail)
- Arcanea variant fails frequency-canon check
- Generation engine output claimed as human-composed (refused; AI-disclosure structural)

**Model:** External (Suno) + Frank curation

---

## Stage 4 — Intake

**Input:** Suno URL + persona attribution + intent tag

**Operations:**
1. Run `/music-song <suno-url> <persona> [intent]`
2. `music-is/song-intake` skill (Haiku) executes:
   - Validates persona registration
   - Extracts Suno metadata (title, prompt, BPM, duration, structure tags)
   - Generates song-id: `<persona>_<YYYYMMDD>_<short-slug>`
   - Writes `catalog/master.csv` draft row
   - Writes `catalog/draft/<song-id>.md` per-song doc
   - Registers in persona's `releases-index.md`
   - Dispatches `music-producer` (Sonnet) for asset render queue

**Output:** catalog row written; draft md path; asset queue status

**Refusal triggers:** see `/music-song` doc

**Model:** Haiku 4.5

---

## Stage 5 — Asset pipeline

**Input:** song-id + persona canon + label canon

**Operations:**
1. `music-producer` (Sonnet) orchestrates parallel asset render:
   - **Cover** (nano banana 2): master 3000×3000 + 1:1 + 16:9 + 9:16 variants
   - **Motion video — short** (Seedance 2): 9:16 1080×1920, 15-30s
   - **Motion video — square** (Seedance 2): 1:1 1080×1080, 30-60s
   - **Spotify Canvas** (Remotion programmatic): 9:16 3-8s loop ≤8MB
   - **(Cinematic-grade labels Frank Riemer + Arcanea):** full motion video (Higgsfield) 16:9 full song length
2. Per-asset DNA-check (auto-classifier against persona's reference image set)
3. Auto-retry up to 3x on DNA failure; escalate to Frank if persistent fail
4. Asset bundle lands in `catalog/draft/<song-id>/assets/`
5. Update catalog row asset paths

**Output:** complete asset bundle

**Refusal triggers:** see `/music-canvas` and `asset-render` skill

**Model:** Sonnet (orchestrate) → external engines

**Phase 2 target:** n8n flow autonomously runs Stage 5 (Suno URL → full asset bundle in <15min)

---

## Stage 6 — Gate (`/music-release`)

**Input:** song-id (with complete asset bundle)

**Operations:**
1. `music-curator` (Opus) runs gate checks:
   - Persona-anchoring proof
   - Asset bundle complete
   - Voice-lock check on social copy stubs
   - Royalty-cascade graph entry stub
   - Cross-label canon-blur check
   - AI-disclosure metadata
   - Vocal-impersonation check (consent doc on file if external-cloned)
   - Sample / sync-clearance check
   - Frank-in-the-loop A&R sign-off (final listen-confirm + cover-confirm + intent-confirm)
2. **For Arcanea label:** verify per-Guardian frequency canon compliance in master spectrum
3. Decision: GREEN-LIGHT / REVISE / REFUSE

**Output (GREEN-LIGHT):** routing manifest + parallel dispatch to Stage 7-10

**Output (REVISE):** specific revisions named; song stays in draft

**Output (REFUSE):** fundamental refusal; song stays in draft with REFUSED-final flag

**Refusal triggers:** see `/music-release` and `release-gate` skill

**Model:** Opus 4.7 (gate decision); Sonnet (orchestration of pass-through)

---

## Stage 7 — Distribution

**Input:** GREEN-LIT song

**Operations:**
1. `music-distributor` (Sonnet) parallel-dispatches:
   - **DistroKid push** — lock metadata from catalog row; manual upload Phase 0-1, MCP Phase 2+
   - **Spotify Canvas upload** — via Spotify-for-Artists web UI
   - **Bandcamp upload** — per-label routing (always for Frank Riemer + Arcanea; per warrant for others)
   - **frankx.ai/music sync** — auto-mirror from `catalog/released/`
   - **Sync-library pitch dossier** — generated per `/music-sync-pitch` for any sync rail active for this persona/label
2. Wait for DistroKid ISRC mint (~24-72h)
3. Pull ISRC + DistroKid ID into catalog row
4. Update `isrc-index.json`
5. Schedule release date per persona's release calendar

**Output:** release live across rails; ISRC indexed; metadata locked

**Refusal triggers:**
- Distro before GREEN-LIGHT
- Manual metadata edit at distributor (catalog is truth)
- Aggregator that takes master rights

**Model:** Sonnet 4.6 → external rails

---

## Stage 8 — Amplification

**Input:** released song

**Operations:**
1. `music-amplifier` (Sonnet) auto-schedules N drops per persona's release calendar via Claws:
   - Default cadence:
     - T+0h: Spotify Canvas live
     - T+2h: Claw-X drop 1 (release announcement)
     - T+6h: Claw-IG Reel
     - T+24h: Claw-TT vertical
     - T+48h: Claw-YT Short
     - T+72h: Claw-X drop 2 (production angle)
     - T+1w: Claw-IG carousel
     - T+2w: Claw-TT drop 2
     - T+4w: Claw-X drop 3
2. Per-Claw drop generation:
   - Pull voice-lock from persona's `social/voice-lock-<platform>.md`
   - Compose drop content (within character/length limits)
   - Voice-lock check (auto-rollback ≤3 attempts; escalate to Frank if persistent fail)
   - Frequency-cap check (≤3 drops/day per persona)
   - AI-disclosure compliance check
3. Schedule via Blotato + n8n
4. Per-platform performance feedback observed weekly

**Output:** amplification mesh activated; drops scheduled

**Refusal triggers:** see `/music-amplify` and `amplification-mesh` skill

**Model:** Sonnet 4.6 → Blotato + n8n

**Phase 0-2 manual mode:** Frank approves each drop before publish; voice-lock check runs but doesn't auto-publish.
**Phase 3+ autonomous mode:** per persona, after voice-lock false-positive rate ≤5% across 4 weeks.

---

## Stage 9 — Observation

**Input:** released song with amplification active

**Operations:**
1. Per-platform performance metrics observed weekly:
   - Streaming counts (Spotify-for-Artists, Apple Music for Artists, etc.)
   - Engagement rates per Claw drop
   - Playlist additions
   - Comment sentiment (rough)
   - Sync-pitch responses (if sync rail active)
2. Update `catalog/master.csv` with rolling performance metrics (separate column or related table)
3. `/music-label-board` reflects updates
4. Weekly hygiene ritual (Mondays) reviews observation data + flags actions
5. Top-performers feed into amplification copy generation (positive examples)

**Output:** observation dashboard refreshed; weekly hygiene report

**Model:** Haiku (CRUD) + Sonnet (synthesis for hygiene report)

---

## Stage 10 — Royalty-cascade

**Input:** released song with platform IDs (DistroKid + Bandcamp + etc.)

**Operations:**
1. `royalty-architect` (Sonnet) finalizes `catalog/royalty-graph.json` entry:
   - Contributors enumerated (composer, publisher, label, any guests)
   - Splits sum to 100%
   - Per-rail config (streaming, bandcamp, sync, NFT-pending)
   - Attestation hash matches `/sip-attest-audio` output
   - `creator_forge_lineage` flagged active (Phase 6+ Creator Forge integration)
2. Royalty observation:
   - Streaming royalty payouts pulled monthly
   - Bandcamp direct sales tracked
   - Sync-deal payouts logged with deal-history
3. Per-rail revenue feeds `Wealth IS` theses (if active)

**Output:** royalty graph locked; revenue forecasting active

**Refusal triggers:** see `/music-release` and `royalty-graph` skill

**Model:** Sonnet 4.6

---

## Token economy per release

Approximate token spend per release through full pipeline:

| Stage | Model | Calls | Tokens approx |
|---|---|---|---|
| 1. Ideation | Frank-driven (no agent) | 0 | 0 |
| 2. Prompt synthesis | Sonnet | 1-2 | 2-4K |
| 3. Generation | External (Suno) | N/A | 0 (external cost) |
| 4. Intake | Haiku | 1 | <1K |
| 5. Asset pipeline | Sonnet (orchestrate) | 4-6 | 10-20K |
| 6. Gate | Opus | 1 | 5-10K |
| 7. Distribution | Sonnet | 2-4 | 5-10K |
| 8. Amplification | Sonnet | 5-9 (per Claw drop) | 5-15K |
| 9. Observation | Haiku (weekly) | 1 | <1K |
| 10. Royalty graph | Sonnet | 1 | 2-3K |

**Total per release:** ~30-65K tokens (well within budget)

External costs (Suno + nano banana + Seedance + Higgsfield + Remotion render): variable; capped per persona's monetization stack ROI.

---

## End-to-end timing (Phase 0-1 manual-assisted)

| Stage | Time per release |
|---|---|
| 1-3 (idea + prompt + generation) | 30min - 2h (Frank-curated iteration) |
| 4 (intake) | 1min |
| 5 (asset) | 1-3h (Phase 2 target: 15min) |
| 6 (gate) | 5-15min |
| 7 (distribution) | 30min (manual) → 5min (Phase 2 MCP) |
| Wait for DistroKid mint | 24-72h |
| 8 (amplification scheduling) | 30min (Phase 0-1) → autonomous (Phase 3+) |
| 9 (observation) | ongoing weekly |
| 10 (royalty graph) | 5min |

**Phase 1 target:** 1 release/week per active persona (4 weeks × 4 releases for Frank Riemer = 4 first releases by end of week 4)
**Phase 2 target:** 1 release/2-3 days per active persona (autonomous asset pipeline reduces wait)
**Phase 3+ target:** persona-multiplied throughput (4-12 releases/month across active personas)

---

## Failure modes + recovery

| Failure | Stage | Recovery |
|---|---|---|
| Suno generation fails to honor canon | 3 | Re-roll with stronger anchors; if persistent, log to known-bugs-workarounds + notify naming-intelligence to update genre-style-cards |
| Asset DNA-check fails 3x | 5 | Escalate to Frank; manual override with documented reason; update DNA reference set if pattern repeats |
| Gate refuses (REFUSE) | 6 | Document reason; song stays in draft; consider re-canon or archive |
| DistroKid mint delayed >7 days | 7 | Check DistroKid status; raise to Frank; investigate metadata issues |
| Voice-lock fails 3x on amplification | 8 | Escalate to Frank; update voice-lock samples if pattern repeats |
| Performance flatlines after release | 9 | Review per-Claw cadence; consider re-amplification campaign or audience-cohort revisit |
| Royalty graph integrity error | 10 | Audit contributors + splits; correct in catalog/master.csv (truth source); re-emit graph entry |

---

## Composes with

- All 8 Music IS skills
- All 8 Music IS commands
- All Music IS agents
- Notion mirror (catalog updates propagate via sync mechanism)
- Wealth IS (revenue forecasting)
- Creator Forge (Phase 6+ attribution-cascade)

---

**Built on SIP** — `verticals/music-is/workflows/release-cycle-sop.md` · v0.1 · 2026-04-29 · Spine workflow · 10-stage pipeline · Token economy + timing benchmarked
