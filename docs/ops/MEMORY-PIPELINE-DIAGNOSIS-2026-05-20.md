# Memory Consolidation Pipeline — Diagnosis + Fix Options

**Date:** 2026-05-20
**Author:** Claude (Opus 4.7, /superintelligence pass)
**Scope:** Operational tier — diagnosing the 9-zero-night `CONSOLIDATION_LOG.md` finding from the mempalace baseline research

---

## 1. Observed symptom

`memory/CONSOLIDATION_LOG.md` shows 9 consecutive nightly runs (2026-05-07 → 2026-05-17) with output:
```
- <ISO> · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
```

The CONSOLIDATION_LOG.md header says "Receipt-stale > 7 days = pipeline broken." Mempalace baseline agent flagged this as evidence of broken consolidation.

## 2. Root cause analysis (not the obvious answer)

### What the pipeline actually does

`scripts/dreaming-run.ts` lines 51-57:
```ts
const SESSIONS_DIR =
  process.env.STARLIGHT_SESSIONS_DIR ??
  join(REPO_ROOT, "memory", "voice-sessions");
```

`src/dreaming.ts` line 43:
```ts
for (const file of fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".json"))) {
```

The pipeline:
1. ✅ Cron fires nightly (Windows scheduled task)
2. ✅ Reads `memory/voice-sessions/` directory
3. ✅ Filters for `*.json` files
4. ✅ Writes nightly receipt with counts

### What's actually happening

Per `git status`:
```
D memory/voice-sessions/2026-04-28.md
D memory/voice-sessions/2026-04-29.md
D memory/voice-sessions/2026-04-30.md
D memory/voice-sessions/2026-05-01.md
```

The directory exists but contains zero `.json` files. The 4 deleted files were `.md` (already wouldn't have been processed by the `.endsWith(".json")` filter).

### The non-obvious finding

Per memory atom `project_voice_operator_bridge_off.md`:
> "COGNITION_BRIDGE_URL off 2026-04-30: orb uses native Groq+tools. Re-enable after executor."

**Voice-operator was intentionally disabled on 2026-04-30.** It is the upstream that writes session.json files to `memory/voice-sessions/`. With voice-operator off, no sessions are produced. The pipeline correctly processes the zero files that exist.

**The pipeline is NOT broken. The upstream is intentionally paused.**

The CONSOLIDATION_LOG.md header's "Receipt-stale > 7 days = pipeline broken" rule misfires here: receipts ARE being written daily (stale-detection passes), but the contents are zeros because the upstream is paused (which the rule didn't anticipate).

## 3. The three legitimate fixes (ranked by leverage)

### Fix A — Repoint the pipeline at a live source (HIGHEST LEVERAGE)

The pipeline assumes voice-sessions/ is the source. But SIS has multiple live atom sources today:

- `memory/_audit/*.jsonl` — cross-repo-indexer writes daily (audit row format)
- `memory/mempalace_upstream/chroma.sqlite3` — live mempalace store
- `~/.claude/projects/.../*.jsonl` — Claude Code session transcripts
- `docs/chronicle/blessings.jsonl` — blessed Chronicle entries

**Recommendation:** Add a multi-source dreaming agent that reads from `memory/_audit/*.jsonl` (today's actual write source). This restores "memory that compounds" observability without depending on voice-operator state.

**Implementation:** ~40 LOC to add `processAuditFiles()` method to `DreamingAgent`; ~10 LOC to update `dreaming-run.ts` to call both.

### Fix B — Update the rule, not the pipeline (LOW EFFORT)

Update CONSOLIDATION_LOG.md header to distinguish:
- "Receipts stale > 7 days = pipeline broken (cron not firing, runtime error)"
- "Zero counts > 7 days = upstream paused (voice-operator off OR sessions-dir misconfigured)"

This is honest about the system state without false alarms.

### Fix C — Restore voice-operator (HIGHEST RISK)

Per memory: voice-operator bridge was deliberately disabled until "after executor." Re-enabling requires more than just turning it on. Out of scope for today.

## 4. Recommended action (today)

Apply **Fix B** today (1 file, 5 lines):
- Update `memory/CONSOLIDATION_LOG.md` header to clarify the zero-count semantics
- Add an explicit note: "Zero counts since 2026-05-07 = voice-operator paused per `project_voice_operator_bridge_off.md`, not pipeline failure"

Queue **Fix A** as Phase 0 sibling work:
- Extend `DreamingAgent.dream()` to also process `memory/_audit/*.jsonl` files
- Add `extractInsightsFromAuditRow()` method
- This restores the "memory that compounds" claim without restarting voice-operator

## 5. Why this matters for memory-foundation research

The diagnosis confirms a finding from the mempalace baseline:
- The pipeline architecture is sound (FTS5 + temporal half-life + dreaming + Memory-Bus singleton ALL exist as code)
- The observability is honest (CONSOLIDATION_LOG.md doesn't lie about counts)
- What's missing is the consolidation-of-actual-active-corpus link

This is part of the broader "incumbent layer-over" recommendation: keep the orchestration (Dreaming agent, Contradiction detector, Memory Bus, audit log), repoint the substrate (foundation research output) AND the source (Fix A above).

## 6. Falsifier

This diagnosis is wrong if:
- Voice-operator is actually emitting `.json` files somewhere I missed (verify by find/locate)
- The cron is using a different `STARLIGHT_SESSIONS_DIR` env var than the default (check scheduled task definition)
- There's a separate "production" dreaming pipeline that's not `scripts/dreaming-run.ts`

To falsify: `Get-ScheduledTask | Where-Object { $_.TaskName -like "*dream*" } | Select-Object -ExpandProperty Actions` to verify the actual command line.

---

*Built on SIP — 2026-05-20 · Diagnosis grounded in code+config read · Fix B applicable today; Fix A queued as Phase 0 sibling*
