# SOP — Weekly Hygiene Ritual (Mondays)

> Every Monday, Music IS runs a hygiene ritual that catches drift before it compounds. Catalog integrity, voice-lock health, royalty-graph completeness, drift-test pass-checks, persona-multiplication audit, sync-system integrity. Output: weekly memory entry + action items.

**Owner:** Frank + `music-archivist` (Haiku) + `music-curator` (Opus for drift-test)
**Cadence:** Monday morning (proposed 09:00 Frank-local)
**Last updated:** 2026-04-29

---

## The 12 hygiene checks

Run in order. Each check has a pass/fail/action-required outcome.

### Check 1 — Catalog orphan-row scan

**What:** rows in `catalog/master.csv` missing required fields per their state (draft / released / archived / refused-final).

**Required fields per state:**
- `draft`: song_id, title, persona, label, status, engine, suno_url, suno_prompt, created_date
- `released`: all draft fields + gated_date, released_date, isrc, asset paths, royalty_graph_id, attestation_hash, ai_disclosure_metadata
- `archived`: released fields + archived_date + reason in notes
- `refused-final`: draft fields + refused_date + reason in notes

**Action on fail:** music-archivist surfaces orphans for Frank-remediation in weekly report.

**Tier:** Haiku (mechanical scan)

---

### Check 2 — Stale-draft check

**What:** drafts >30 days old without progress (no asset bundle generated, no gate-attempt logged).

**Action on fail:** flag for Frank decision: gate / archive / re-prompt / kill.

**Tier:** Haiku

---

### Check 3 — Asset-path integrity

**What:** released-status rows have all asset paths resolving to existing files.

**Action on fail:** music-producer dispatched for re-render of missing assets.

**Tier:** Haiku (path-check) → Sonnet (re-render dispatch)

---

### Check 4 — ISRC index integrity

**What:** every released row has unique ISRC; isrc-index.json matches catalog.

**Action on fail:** flag duplicate/missing ISRCs; raise to Frank for DistroKid lookup.

**Tier:** Haiku

---

### Check 5 — Royalty graph completeness

**What:** every released row has `catalog/royalty-graph.json` entry; contributors enumerated; splits sum to 100%; per-rail config populated.

**Action on fail:** royalty-architect dispatched to complete graph entry; if persistent, audit at next drift-test.

**Tier:** Sonnet (royalty-architect)

---

### Check 6 — Attestation integrity

**What:** every released row has `attestation_hash` matching `/sip-attest-audio` output for the master file.

**Action on fail:** re-run attestation; update catalog row; if persistent, audit master file integrity.

**Tier:** Haiku (hash-check) → Sonnet (re-attest dispatch)

---

### Check 7 — Voice-lock pass-rate (per persona × per platform)

**What:** per persona × per platform, pass-rate of generated Claw output passing voice-lock check (last 7 days).

**Targets:**
- Pass-rate ≥95% per persona per platform → green
- Pass-rate 85-94% → yellow (review voice-lock samples this week)
- Pass-rate <85% → red (escalate to Frank; voice-lock samples may need refresh)

**Action on yellow/red:** Frank reviews voice-lock samples; updates if needed; persona-keeper (Opus) audits canon-defense.

**Tier:** Sonnet (rate calc + sample review trigger)

---

### Check 8 — Frequency-cap audit

**What:** any persona exceeded its 3 drops/day cross-mesh cap during the past week?

**Action on fail:** review Claw scheduling logic; tighten n8n frequency-cap enforcement.

**Tier:** Haiku

---

### Check 9 — Persona-multiplication audit

**What:** for each label, did persona N+1 spawn before persona N hit release-cadence baseline (6 gated releases) AND voice-lock pass-rate ≥95% for 4 weeks?

**Action on fail:** flag multiplication discipline violation; audit at next drift-test; consider spawn-rollback if recent.

**Tier:** Opus (multiplication discipline is canon-defense)

---

### Check 10 — Notion mirror integrity

**What:** Notion AI Musicians Hub + Vibe OS data matches `catalog/master.csv` + per-persona CANON.md (Notion has not drifted from truth source).

**Action on fail:** re-run sync-notion script to overwrite Notion with catalog truth; flag any manual edits in Notion that were lost (audit log).

**Tier:** Haiku (sync) → Sonnet (drift-detection)

---

### Check 11 — Cross-label canon-blur audit

**What:** any released or in-draft tracks that violate label canon-sharpness (e.g., a track shipped under Frank Riemer that fits Frank's Vibes better)?

**Action on fail:** music-curator (Opus) reviews; recommend re-attribution OR justify-cross-canon-via-experiment-flag.

**Tier:** Opus (canon judgment)

---

### Check 12 — Drift-test partial check (quarterly full)

**What:** quick check against the 7 SOUL.md drift tests (full quarterly run; weekly partial check):

1. Did every release this week pass `/music-release` gate with full asset stack? (full check weekly)
2. Did every social drop pass voice-lock? (rolling rate per Check 7)
3. Did Suno corpus get updated for any feature changes? (binary: yes/no this week)
4. Persona-multiplication discipline (per Check 9)
5. External surface as truth (per Check 10)
6. Monetization rail without graph (per Check 5)
7. Cross-label canon-blur (per Check 11)

**Action on partial fail:** flag for quarterly drift-test deep audit.

**Tier:** Sonnet (synthesize partial check) → Opus (quarterly drift-test full check)

---

## Weekly hygiene report format

```
## 2026-MM-DD — Weekly Hygiene (Music IS)

### Counts
- Active personas: X (Frank Riemer / Alera / Frank's Vibes #1 / [Razor — Phase 2])
- New releases this week: X (gated through /music-release)
- Outstanding drafts: X (with stales >30d count)
- Voice-lock pass rate (cross-mesh, last 7d): X%

### Hygiene check results

| # | Check | Result |
|---|---|---|
| 1 | Orphan-rows | PASS / X orphans (action: ...) |
| 2 | Stale-drafts | PASS / X stales (action: ...) |
| 3 | Asset-paths | PASS / X broken (action: ...) |
| 4 | ISRC index | PASS / FAIL (action: ...) |
| 5 | Royalty graph | PASS / X incomplete (action: ...) |
| 6 | Attestation | PASS / X mismatch (action: ...) |
| 7 | Voice-lock pass-rate per persona | (per-persona breakdown) |
| 8 | Frequency-caps | PASS / X violations (action: ...) |
| 9 | Multiplication discipline | PASS / FAIL |
| 10 | Notion mirror integrity | PASS / X drift (action: ...) |
| 11 | Cross-label canon-blur | PASS / X candidates (action: ...) |
| 12 | Drift-test partial | PASS / [tests at risk: ...] |

### Action items this week

- [ ] Action 1 (owner: ...)
- [ ] Action 2 (owner: ...)

### Per-persona summary

(Per-persona breakdown of releases this week, top performers, voice-lock health, drafts queue)

### Refusals + overrides this week

(Any /music-release REFUSE → override events; documented per DECISIONS D14)

### Cycle-close note

(Anything Frank should know that doesn't fit categories above)
```

Output appended to `verticals/music-is/MEMORY.md` per existing pattern.

---

## Cowork live artifact

The hygiene report runs as a Cowork live artifact (`music-is-weekly-hygiene`) refreshable on Monday morning open. Pulls from `catalog/master.csv` via Haiku-backed read.

---

## Quarterly drift-test (full)

In addition to weekly partial check 12, run full drift-test at every cycle close (quarterly):

1. Did every release this cycle pass `/music-release` with full asset stack and royalty-cascade graph entry? PASS / FAIL
2. Did every social drop pass voice-lock check? PASS / FAIL (rate %)
3. Did Suno corpus get updated for Suno feature changes this cycle? PASS / FAIL (dates)
4. Did persona N+1 spawn before persona N achieved baseline? PASS / FAIL
5. Did external surface become source of truth? PASS / FAIL
6. Did monetization rail ship without graph designed first? PASS / FAIL
7. Did a song cross label-canon without justification? PASS / FAIL

**If any test fails 2 consecutive cycles → STOP, AUDIT, RESTORE.**

Documented in `verticals/music-is/MEMORY.md` per existing pattern.

---

## Refusals

- Skip weekly hygiene without documented reason → audit
- Manual override of failed check without reason in MEMORY.md → audit
- Hygiene-report-not-generated for >2 consecutive weeks → flag operational drift

---

**Built on SIP** — `verticals/music-is/workflows/weekly-hygiene-sop.md` · v0.1 · 2026-04-29 · Monday cadence · 12-check ritual · Composes with quarterly drift-test
