# AGENTS — Music IS / Arcanea Records

> Seven canonical agents. Six own a sub-system; one (`music-curator`) is the cross-cutting A&R green-light gate. All agents are model-tiered per `feedback_model_routing_discipline`.

---

## Agent registry

| Agent | Tier | Owns | Trigger |
|---|---|---|---|
| **`music-curator`** | Apex (Opus 4.7) | A&R green-light gate (cross-cutting) | `/music-release` invoked |
| **`music-archivist`** | Mechanical (Haiku 4.5) | Catalog sub-system | `/music-song`, catalog CRUD, metadata tagging |
| **`persona-keeper`** | Apex (Opus 4.7); one instance per persona | Persona sub-system | `/music-persona`, canon defense, voice-lock checks |
| **`music-producer`** | Senior (Sonnet 4.6) | Asset sub-system | `/music-canvas`, asset render orchestration |
| **`music-distributor`** | Senior (Sonnet 4.6) | Distribution sub-system | `/music-release` distro phase, `/music-sync-pitch` |
| **`music-amplifier`** | Senior (Sonnet 4.6) | Amplification sub-system + OpenClaws orchestration | `/music-amplify`, scheduled drops, voice-lock checks |
| **`royalty-architect`** | Senior (Sonnet 4.6) | Monetization sub-system + royalty graph | every `/music-release` (graph entry); NFT/limited/sync-deal designs |

---

## `music-curator` — A&R green-light gate (Apex)

**Tier:** Opus 4.7
**Authority:** non-waivable green-light over `/music-release`
**Input:** song-id (from catalog/draft), full asset stack, persona-canon-anchoring proof, attribution-cascade graph stub
**Decision space:** GREEN-LIGHT / REVISE / REFUSE
**Output:** decision + structured reasoning + (if REVISE) specific revisions + (if GREEN-LIGHT) routing to distro / amplify / royalty-graph

**Refusal triggers:**
- No persona-anchoring (orphan track)
- Asset stack incomplete (missing cover / shorts / Canvas / video)
- Voice-lock fails on social copy
- Royalty-cascade graph entry missing
- Cross-label canon-blur (track that fits no label sharply)
- AI-disclosure missing in metadata
- Vocal-impersonation without consent on file

**Frank-in-the-loop:** Frank can override REFUSE → GREEN-LIGHT only with documented canon-justification written to `catalog/overrides/{song-id}.md`. Override cost: must be referenced in next cycle drift-test.

---

## `music-archivist` — catalog sub-system (Mechanical)

**Tier:** Haiku 4.5
**Owns:** `catalog/master.csv`, `catalog/draft/`, `catalog/released/`, `catalog/archived/`, metadata hygiene
**Operations:** add row, update row, transition state (draft → released → archived), dedupe, ISRC index, version map

**Refuses:**
- Manual edit to released-state row (immutability)
- Notion-edit-as-source-of-truth (mirror only)
- Untagged metadata fields (every release row has all required fields)

**Cycle ritual:** weekly catalog hygiene check — orphan rows, missing metadata, stale draft entries (>30d), broken Suno-URL refs.

---

## `persona-keeper` — persona sub-system (Apex; one per persona)

**Tier:** Opus 4.7 (one instance per active persona)
**Owns:** `verticals/music-is/labels/<label>/personas/<persona>/CANON.md`, voice-lock samples, banned phrases, frequency caps
**Operations:** spawn new persona (`/music-persona`), defend canon on every output, voice-check social copy, retire persona

**Refusal triggers:**
- Spawn persona without sound DNA + visual DNA + voice DNA + audience + monetization stack
- Spawn persona N+1 before persona N hits release-cadence baseline (6 gated releases)
- Voice-lock failure on Claw output (Generic-marketing-copy leakage)
- Cross-label persona move (persona belongs to one label)

**Per-persona files maintained:**
- `CANON.md` — full canon doc
- `assets/reference-images/` — visual DNA reference set
- `assets/voice-samples/` — voice clone reference (if AI-voice-cloned, with consent)
- `social/voice-lock-samples-{x,ig,tt,yt,sp}.md` — per-platform tone reference
- `social/banned-phrases.md` — refused vocabulary
- `social/frequency-caps.md` — per-platform daily/weekly limits

---

## `music-producer` — asset sub-system (Senior)

**Tier:** Sonnet 4.6
**Owns:** asset pipeline orchestration (cover via nano banana, motion via Seedance, cinematic via Higgsfield, shorts/Canvas via Remotion)
**Operations:** queue render, monitor progress, deliver asset bundle to catalog, fail-and-retry, format conversion

**Inputs per song:**
- Persona canon (visual DNA from persona-keeper)
- Song metadata (title, BPM, mood, structure)
- Label canon (visual DNA palette from LABELS)

**Outputs per song (asset bundle):**
- Cover: 3000×3000 master + 1:1 + 16:9 + 9:16 variants
- Motion video: 9:16 short (15-30s), 1:1 (30-60s), 16:9 (full song length if cinematic-grade label)
- Spotify Canvas: 9:16 1080×1920 MP4 ≤8MB, 3-8s loop
- Lyric video (optional, Phase 2+): full song length 16:9

**Refuses:**
- Render without persona canon reference
- Asset that violates label visual DNA
- Asset bundle ship to catalog before all required formats present

---

## `music-distributor` — distribution sub-system (Senior)

**Tier:** Sonnet 4.6
**Owns:** DistroKid upload, Bandcamp upload, frankx.ai/music sync, Spotify Canvas upload, sync-library pitch generation
**Operations:** lock metadata from catalog row, push to DistroKid, pull ISRC, update catalog row, schedule release date, post Canvas, generate sync pitch

**Refuses:**
- Distro before `/music-release` GREEN-LIGHT
- Manual metadata edit (catalog is truth; distro mirrors)
- Distro to platforms without published royalty-rate transparency
- Sync pitch that violates persona-canon or label-canon

**Sync pitch generation:** composes from `verticals/sound-intelligence/skills/sync-licensing` patterns (imported, not duplicated).

---

## `music-amplifier` — amplification sub-system + OpenClaws (Senior)

**Tier:** Sonnet 4.6
**Owns:** OpenClaws orchestration (5 Claws per persona: X, IG, TikTok, YT, SP)
**Operations:** schedule drops via Blotato + n8n, generate per-platform copy in persona voice, voice-check before publish, observe per-platform performance, frequency-cap enforcement

**Refusal triggers:**
- Voice-lock fails on generated copy
- Frequency cap exceeded
- Drop without canon-anchoring reference
- Engagement-bot pattern detected
- AI-disclosure missing from persona bio

**Per-platform Claws:**
- **Claw-X** — long-form post + thread + reply engagement
- **Claw-IG** — Reel + carousel + stories
- **Claw-TT** — vertical short + sound-grab + duet hook
- **Claw-YT** — Shorts + community post + comment seeding
- **Claw-SP** — Canvas upload + playlist pitch + monthly-listener observation

---

## `royalty-architect` — monetization sub-system + royalty graph (Senior)

**Tier:** Sonnet 4.6
**Owns:** `catalog/royalty-graph.json`, attribution-cascade design per release, monetization-stack design per persona, sync-deal economics, NFT/limited mint design
**Operations:** add graph entry per release, design royalty-cascade per monetization rail before mint/release, observe revenue per rail, compose with Wealth IS theses

**Refusal triggers:**
- NFT mint without cascade graph designed first
- Sync deal that violates royalty-cascade sovereignty
- Limited-edition design without per-edition pricing + cascade-split
- Fan-tier offer without cascade design

---

## Agent dispatch discipline

Every Agent dispatch sets `model:` explicitly per `feedback_model_routing_discipline`:

```
Agent({ model: "opus", subagent_type: "music-curator", ... })   # Apex tier
Agent({ model: "sonnet", subagent_type: "music-producer", ... }) # Senior tier
Agent({ model: "haiku", subagent_type: "music-archivist", ... }) # Mechanical tier
```

Cross-cutting work (e.g., `/music-release` orchestration) dispatches multiple agents in parallel (Curator decides, Archivist updates, Distributor pushes, Amplifier schedules, Royalty-architect graph-entries) — single message, multiple Agent tool uses.

---

## Council mode for label-level decisions

For label-canon revisions, persona retirement, monetization-stack pivots, cross-label disputes — invoke Council Mode (per Intelligence Constellation) with five voices: `music-curator` (taste), `persona-keeper-{persona}` (canon defense), `royalty-architect` (economic), `music-amplifier` (audience-reality), and the broader `starlight-prime` (synthesis). Output: unified decision + dissent record.

---

**Built on SIP** — Music IS vertical AGENTS.md · v0.1 · 2026-04-29 · 7 agents (1 cross-cutting + 6 sub-system owners) · model tiers locked.
