# Failure-Mode Runbook — Music IS

> When operational failures hit, this runbook prevents drift and routes recovery. Catalog corruption, voice-lock false-positives, distribution failures, royalty-graph integrity errors, persona-canon defense breakdowns. Each failure type has a triage flowchart and a recovery protocol.

**Owner:** Frank + relevant agent per failure mode
**Last updated:** 2026-04-29

---

## Severity tiers

| Tier | Label | Examples | Response time |
|---|---|---|---|
| **Tier 1 — Critical** | Sovereignty / data-integrity threats | Catalog corruption, royalty-cascade violation, vocal-impersonation discovered post-release, persona-canon defense breakdown | Same-day Frank attention |
| **Tier 2 — Operational** | Workflow blockers | Asset render persistent fail, Voice-lock false-positive >5%, DistroKid mint stuck >7 days | Within 48h |
| **Tier 3 — Hygiene** | Drift accumulating | Stale drafts >30d, broken asset paths, Notion drift, ISRC index stale | Within next weekly hygiene ritual |

---

## Tier 1 — Critical failures

### F1.1 — Catalog corruption (master.csv corrupted or lost)

**Symptoms:** master.csv unreadable, missing rows, schema violation, or accidental overwrite.

**Recovery:**
1. **Stop all writes immediately** (halt music-archivist agent)
2. Restore from git (catalog/master.csv is git-tracked)
   ```
   git log catalog/master.csv
   git checkout HEAD~1 -- catalog/master.csv (or specific commit hash)
   ```
3. If git history insufficient, restore from latest weekly hygiene-report MEMORY.md entry (which references row counts + key metadata)
4. Re-run catalog hygiene ritual to rebuild any missing per-song markdown docs in `catalog/<state>/`
5. Resume writes only after integrity verified
6. Log failure to MEMORY.md with timestamp + cause + recovery path
7. If structural cause (e.g., schema migration error): write post-mortem; lock structural-not-discretionary fix

**Prevention:**
- Always commit catalog changes immediately
- Never edit catalog/master.csv from multiple agents simultaneously
- Backup ritual: weekly hygiene includes catalog-export-to-revenue-cycle-snapshot

---

### F1.2 — Royalty-cascade violation (deal closed that violates cascade)

**Symptoms:** sync-deal logged where contributor splits don't preserve cascade; or DSP statement shows split that doesn't match cascade graph.

**Recovery:**
1. **Halt the deal** (refuse signature if not yet signed; renegotiate if signed)
2. Audit `catalog/royalty-graph.json` entry: was cascade designed first? If not, structural failure (cascade-not-designed-first per SOUL.md → drift).
3. If deal already-closed and cannot renegotiate:
   - Document the violation in MEMORY.md
   - Mark song as `cascade-violated` in catalog notes
   - Refuse future deals on this song unless cascade-restored-via-renegotiation
   - Audit at next quarterly drift-test
4. If DSP-statement-mismatch:
   - DistroKid issue → contact DistroKid support
   - Update cascade graph if DSP routing changed (e.g., new royalty rate per stream)
5. Lock in next cycle drift-test review

**Prevention:**
- Royalty graph designed BEFORE every release (gate refuses if missing)
- Royalty graph designed BEFORE every NFT/limited mint
- Quarterly cascade-compliance audit

---

### F1.3 — Vocal-impersonation discovered post-release

**Symptoms:** released song discovered to use AI-cloned voice of identifiable non-Frank artist without consent on file.

**Recovery:**
1. **Pull release from all platforms immediately** (DistroKid takedown, Bandcamp unlist, frankx.ai/music remove, Spotify Canvas remove, social drops archive)
2. Document discovery in MEMORY.md with timestamp + how-discovered
3. Investigate root cause:
   - Suno generation accidentally cloned identifiable artist?
   - Catalog row missed AI-disclosure metadata audit?
   - Gate check failed?
4. Notify impersonated artist if identifiable + provide proof of takedown
5. Fix gate check protocol if structural failure (gate should refuse vocal-impersonation per release-gate skill)
6. Audit all other releases for same risk
7. If pattern (multiple releases): trigger deep audit + halt all releases until fix structural

**Prevention:**
- `/music-release` gate refuses vocal-clone without consent doc on file (D11 non-waivable)
- Vocal-clone-consent ledger maintained at `verticals/music-is/knowledge/suno/vocal-control-recipes.md`
- Gate audit at every quarterly drift-test (test 1: did every release pass gate)

---

### F1.4 — Persona-canon defense breakdown

**Symptoms:** persona-keeper agent's voice-lock pass rate drops below 80% across 4 weeks, OR persona's releases visibly drift from canon (sound DNA, visual DNA, or voice DNA).

**Recovery:**
1. **Halt persona's release pipeline** (no new gate-passes until canon restored)
2. Audit recent releases for canon-drift specifics:
   - Sound DNA: do recent songs' Suno prompts honor persona's anchors?
   - Visual DNA: do recent assets pass DNA-check against reference set?
   - Voice DNA: do recent Claw drops pass voice-lock?
3. Identify drift cause:
   - Canon docs got loose (e.g., Frank loosened reference set in iteration)?
   - persona-keeper Opus model output drift?
   - Suno feature change broke prompt grounding?
4. Restore canon:
   - Re-curate reference image set (visual DNA)
   - Re-curate voice samples (voice DNA)
   - Re-distill Suno prompt anchors (sound DNA)
   - Update persona CANON.md with locked refresh
5. Resume releases only after canon restored + 3 consecutive gate-passes prove the restore

**Prevention:**
- Weekly hygiene check 7 (voice-lock pass rate per persona × platform)
- Quarterly drift-test (canon-defense as test #2)
- Persona-keeper audit at every persona N+1 spawn (multiplication discipline)

---

## Tier 2 — Operational failures

### F2.1 — Asset render persistent fail

**Symptoms:** `music-producer` retries 3+ times on same DNA-axis; cannot produce passing asset.

**Recovery:**
1. Frank-review the failed asset samples
2. Diagnose: persona reference set issue? Engine regression? Prompt-construction bug?
3. Options:
   - Manual override (accept asset despite DNA-fail) → documented in catalog notes
   - Refine prompt + re-trigger
   - Update persona reference set (if pattern across multiple songs)
   - Switch engine fallback (e.g., use Midjourney instead of nano banana for this asset)
4. If pattern persists across 5+ songs: structural review of DNA-check classifier or persona reference set
5. Notify Frank if escalation needed

**Prevention:**
- Reference set quality review quarterly
- Engine-version-pinning: lock specific nano banana / Seedance versions in `STACK.md` L2; upgrade only with controlled rollout

---

### F2.2 — Voice-lock false-positive rate >5%

**Symptoms:** voice-lock check rejecting drops that Frank reviews as actually-on-canon.

**Recovery:**
1. Identify pattern: which platform? which persona? what's the false-positive content type?
2. Frank-curate 3-5 new voice-lock samples that represent the false-positive cases
3. Update `voice-lock-<platform>.md` with new samples
4. Re-run voice-lock check on past-week's drops to confirm pattern resolves
5. If structural (e.g., classifier model issue): consider switching classifier or re-training

**Prevention:**
- Weekly hygiene check 7 (voice-lock pass rate)
- Voice-lock samples reviewed quarterly per persona × platform

---

### F2.3 — DistroKid mint stuck (>7 days post-push)

**Symptoms:** track pushed to DistroKid but ISRC not minted, or DSP propagation failed.

**Recovery:**
1. Check DistroKid dashboard for status (pending / rejected / approved)
2. If rejected: read DistroKid rejection reason; usually metadata issue
   - Fix metadata in `catalog/master.csv` (truth source)
   - Re-push with corrected metadata
3. If pending >7 days: contact DistroKid support
4. If DSP-propagation failed: usually self-resolves within 14 days; if not, contact DistroKid

**Prevention:**
- Metadata validation at `/music-release` gate (catch metadata issues pre-push)
- Per-DSP propagation check at T+7 days post-mint

---

### F2.4 — n8n workflow halts mid-pipeline (Phase 2+ asset pipeline)

**Symptoms:** asset pipeline halts; some legs complete, others stuck.

**Recovery:**
1. Check n8n execution logs for error
2. Resume failed legs only (don't re-run full pipeline; idempotent leg-resume)
3. If structural (n8n itself failing): manual mode for the song; debug n8n
4. Track recovery in MEMORY.md if pattern repeats

**Prevention:**
- n8n monitoring (heartbeat checks)
- Per-leg idempotency
- Phase 2 build includes recovery-mode handling

---

## Tier 3 — Hygiene drift

Per `weekly-hygiene-sop.md`, the 12 hygiene checks catch Tier 3 issues weekly:
- Orphan rows
- Stale drafts
- Asset path integrity
- ISRC index integrity
- Royalty graph completeness
- Attestation integrity
- Voice-lock pass rate
- Frequency cap audit
- Multiplication discipline
- Notion mirror integrity
- Cross-label canon-blur
- Drift-test partial check

Each fail → action item in weekly hygiene report.

---

## General principles

### Truth source preservation

- `catalog/master.csv` is truth; never repair from Notion; always restore from git
- `catalog/royalty-graph.json` is truth; never repair from DSP statements alone (DSP-statement is observation, not authority)
- Per-persona CANON.md is truth; restore from git if accidentally edited

### Documentation

Every failure → MEMORY.md entry. Pattern: timestamp + symptom + cause + recovery path + prevention update.

### Escalation

Tier 1 → Frank attention same-day
Tier 2 → Frank attention within 48h
Tier 3 → Address in next weekly hygiene ritual

### Post-mortem

Every Tier 1 failure → post-mortem within 7 days:
- Root cause analysis
- Detection latency analysis (could we have caught it sooner?)
- Prevention update (what structural change prevents recurrence?)
- Lock structural fix in DECISIONS.md if substrate-tier change required

---

## Composes with

- `verticals/music-is/MEMORY.md` (failure log)
- `verticals/music-is/workflows/weekly-hygiene-sop.md` (catches Tier 3 drift)
- `verticals/music-is/DECISIONS.md` (structural fixes locked here)
- All Music IS skills (failure modes per skill catalog)

---

**Built on SIP** — `verticals/music-is/workflows/failure-mode-runbook.md` · v0.1 · 2026-04-29 · 3-tier severity · Recovery protocols + prevention patterns
