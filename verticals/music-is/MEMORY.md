# MEMORY — Music IS / Arcanea Records

> Live log of substantive decisions, drift-tests, weekly hygiene reports, override events, and other state the operator should remember across cycles. Append-only; never delete entries (archive if needed).

---

## 2026-04-29 — Phase 0 spawn

**Author:** Frank (architect) + Claude Opus 4.7 pair
**Event:** Music IS vertical spawn at `verticals/music-is/`

**Spawned:**
- Vertical core: README, SOUL, STACK, LABELS, AGENTS, SUB-SYSTEMS, STRATEGY, DECISIONS, MEMORY, CANON
- 8 skills under `skills/music-is/`: persona-canon, suno-prompt, song-intake, asset-render, release-gate, amplification-mesh, catalog-systems, distribution-flow, royalty-graph
- 8 commands under `commands/`: /music-song, /music-persona, /music-release, /music-label-board, /music-suno-prompt, /music-amplify, /music-canvas, /music-sync-pitch
- 4 label CANON.md scaffolds: frank-riemer, franks-vibes, arcanea, nona
- 5 Suno corpus seed docs: prompt-pattern-library, structure-tags-reference, genre-style-cards, vocal-control-recipes, known-bugs-workarounds
- Catalog seed: `catalog/master.csv` schema with example row

**Note:** Initial session attempted to spawn at `verticals/sound-intelligence/` and accidentally overwrote canonical SOUL.md. Restored from git HEAD. Re-routed spawn to correct location `verticals/music-is/` per VERTICALS.md canon (`Music IS = Frank's specific operated music vertical, distinct from public reference Sound Intelligence`).

**Phase 0 still pending:**
- `/luminor-board` substrate-tier governance gate before commit/tag (per CLAUDE.md substrate-tier rule)
- 100+ legacy Suno songs imported into catalog draft state
- Persona codenames resolved (per DECISIONS.md D7 — Phase 1 mid week 2)

---

## Pattern: weekly hygiene log entries

Format for weekly catalog hygiene entries:

```
## YYYY-MM-DD — Weekly hygiene
- Active personas: X (per label breakdown)
- New releases this week: X (gated through /music-release)
- Outstanding drafts: X (with stales >30d count)
- Voice-lock pass rate (Claw outputs): X%
- Refusals + overrides this week: X
- Drift-test status: pass / partial / fail (which test failed)
- Action items: X
```

---

## Pattern: override log entries

Per DECISIONS.md D14, every `/music-release --override` requires a documented entry here referencing the canon-justification at `catalog/overrides/<song-id>.md`.

```
## YYYY-MM-DD — Override: <song-id>
- Override type: REFUSE → GREEN-LIGHT
- Reason: (link to catalog/overrides/<song-id>.md)
- Cycle reference: (next drift-test cycle)
- Quarter override count: X/1 (limit per quarter; audit triggered if exceeded)
```

---

## Pattern: drift-test entries

Quarterly drift-test against SOUL.md tests:

```
## YYYY-Q-N — Drift test
1. Did every release this cycle pass /music-release with full asset stack and royalty-cascade graph entry? PASS / FAIL
2. Did every social drop pass voice-lock check? PASS / FAIL (rate %)
3. Did Suno knowledge corpus get updated for any Suno feature changes this cycle? PASS / FAIL (dates)
4. Did persona N+1 spawn before persona N achieved release-cadence baseline? PASS / FAIL
5. Did any external surface become source of truth for catalog field? PASS / FAIL
6. Did any monetization rail ship without attribution-cascade graph designed first? PASS / FAIL
7. Did a song cross label-canon without canon-justification? PASS / FAIL

Overall: drift-status / drift-actions
```

If any test fails for two consecutive cycles → STOP, AUDIT, RESTORE.

---

## Pattern: persona spawn / retirement entries

```
## YYYY-MM-DD — Persona spawned: <persona-codename> (label: <label>)
- 5-dimension canon completion: confirmed
- Persona-keeper instance: dispatched
- First release target: YYYY-MM-DD
- Multiplication discipline note: persona N-1 stability confirmed: yes/no
```

```
## YYYY-MM-DD — Persona retired: <persona-codename> (label: <label>)
- Reason: (link to RETIREMENT.md)
- Releases preserved in catalog/released/ with status flag persona_retired
- Royalty graph entries persist (cascade continues)
- Discord/social presence handling: archived / transferred
```

---

## Pattern: monetization-rail activation entries

```
## YYYY-MM-DD — Monetization rail activated: <rail>
- Persona / label affected: X
- Cascade graph designed first: confirmed
- Phase: X
- Revenue baseline target: X
```

---

## Pattern: methodology evolution entries

When file contract or skills change:

```
## YYYY-MM-DD — Methodology evolution
- Change: X (which file / skill / command)
- Reason: X
- /luminor-board pass: confirmed (substrate-tier rule)
- Migration impact: X (existing personas/releases affected)
```

---

**Built on SIP** — `verticals/music-is/MEMORY.md` · Append-only · v0.1 · 2026-04-29 · First entry: Phase 0 spawn
