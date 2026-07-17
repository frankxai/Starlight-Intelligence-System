# Memory Consolidation Log

> Append-only receipt of dreaming-pipeline runs. Each line records dreaming-agent output: timestamp, insights extracted from sessions, contradictions detected across vaults, Wisdom-promotion candidates identified, sessions processed.
>
> Maintained by `scripts/dreaming-run.ts` (TS runner) and `scripts/dreaming-cron.ps1` (Windows scheduled task wrapper). Direct invocation: `node --import tsx scripts/dreaming-run.ts`.
>
> **Why this file exists:** the substrate's claim is "memory that compounds." If consolidation isn't observable, the claim isn't verifiable. This log makes the cadence visible.
>
> **Reading the receipts:**
> - **Receipt-stale > 7 days** = pipeline broken (cron not firing OR scheduled task not registered) — investigate the scheduled task
> - **Zero counts > 7 days with fresh receipts** = upstream paused (voice-operator off OR sessions-dir misconfigured) — pipeline working, source paused
>
> **Current state (2026-05-21, post Fix A + Fix B):**
> - **Fix A landed 2026-05-20** — dreaming agent now reads `memory/_audit/*.jsonl` alongside `memory/voice-sessions/`. First non-zero receipt: `insights: 43 · processed: 17` (audit-day batch).
> - **Fix B landed 2026-05-21** — vault scanner now accepts `memory/vaults/*.md` alongside legacy `<vault>.jsonl`. Default `STARLIGHT_VAULT_DIR` is the in-repo `memory/vaults/`. Result: `insights: 46 · processed: 18`. 5/5 unit tests pass.
> - **Open calibration:** `promotions` + `contradictions` still 0. The vault MD files share enough vocabulary that PROMO_SIM=0.5 should fire — needs investigation of the `ContradictionDetector.similarity` function. Tracked as Phase 0 sibling work, not blocker.
> - **Calibration gate added 2026-05-22:** before claiming Wisdom promotion or contradiction detection is healthy, add a fixture-backed check that feeds two near-duplicate vault entries and one explicit contradiction through `ContradictionDetector.similarity`/promotion selection. Expected result: at least one promotion candidate and one contradiction candidate, or a documented threshold reason why zero is correct.
> - **Verdict on the "memory that compounds" claim:** Now observable nightly with real signal (guardian-redaction patterns, high-output session days, broad-refactor markers). Pipeline reads from live substrate, not paused upstream.
>
> **Format**: `- <ISO-timestamp> · insights: N · contradictions: N · promotions: N · processed: N` (or `error: <msg>` on failure).
>
> Background: 2026-05-07 end-to-end excellence audit found all 6 vaults stamped `last_consolidated: 2026-05-01` (5 days stale) despite rich pipeline architecture (FTS5 + temporal half-life + dreaming + Memory-Bus singleton). This file + the cron close the observability gap.
>
> **Built on SIP** — operational tier (memory observability).

- 2026-05-07T07:48:07.910Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-10T20:57:48.300Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-11T04:00:02.190Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-11T06:30:35.461Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-12T04:00:03.638Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-13T04:00:02.680Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-15T04:00:02.856Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-16T04:00:03.333Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-17T04:00:03.377Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-20T17:43:50.434Z · insights: 43 · contradictions: 0 · promotions: 0 · processed: 17
- 2026-05-21T09:06:57.313Z · insights: 46 · contradictions: 0 · promotions: 0 · processed: 18
- 2026-05-22T00:23:03.589Z · insights: 46 · contradictions: 0 · promotions: 0 · processed: 18
- 2026-05-22T00:24:36.437Z · insights: 46 · contradictions: 0 · promotions: 0 · processed: 18
- 2026-05-22T00:26:51.180Z · insights: 46 · contradictions: 0 · promotions: 6 · processed: 18
- 2026-06-11T20:04:45.913Z · insights: 0 · contradictions: 0 · promotions: 6 · processed: 0 · decayed: 0 · archived: 0
- 2026-06-11T20:05:58.994Z · insights: 0 · contradictions: 0 · promotions: 6 · processed: 0 · decayed: 0 · archived: 0
- 2026-06-11T20:06:38.867Z · insights: 0 · contradictions: 0 · promotions: 6 · processed: 0 · decayed: 0 · archived: 0
- 2026-06-11T20:06:58.197Z · insights: 0 · contradictions: 0 · promotions: 6 · processed: 0 · decayed: 0 · archived: 0
- 2026-06-11T17:23:48.072Z · insights: 58 · contradictions: 0 · promotions: 6 · processed: 24
- 2026-06-16T02:02:05.420Z · insights: 13 · contradictions: 0 · promotions: 4 · queued: 2 · processed: 8 · decayed: 0 · archived: 0
- 2026-06-17T02:00:46.796Z · insights: 13 · contradictions: 0 · promotions: 4 · queued: 0 · processed: 8 · decayed: 0 · archived: 0
- 2026-06-18T02:00:03.641Z · insights: 16 · contradictions: 0 · promotions: 4 · processed: 10 · decayed: 0 · archived: 0
- 2026-07-01T11:00:09.506Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0
- 2026-07-01T11:13:04.946Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 18 · sb_contradictions: 0
- 2026-07-11T12:24:56.391Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 18 · sb_contradictions: 0
- 2026-07-11T12:27:00.243Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 18 · sb_contradictions: 0
- 2026-07-12T02:15:03.876Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 22 · sb_contradictions: 0
- 2026-07-12T04:26:08.825Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 22 · sb_new: 22 · sb_contradictions: 0
- 2026-07-12T04:26:18.426Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 22 · sb_new: 0 · sb_contradictions: 0
- 2026-07-13T02:15:02.692Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 22 · sb_new: 0 · sb_contradictions: 0
- 2026-07-14T02:15:03.061Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 22 · sb_new: 0 · sb_contradictions: 0
- 2026-07-15T02:15:02.833Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 22 · sb_new: 0 · sb_contradictions: 0
- 2026-07-16T02:15:04.729Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 22 · sb_new: 0 · sb_contradictions: 0
- 2026-07-17T02:15:02.769Z · insights: 58 · contradictions: 0 · promotions: 4 · processed: 24 · decayed: 0 · archived: 0 · sb_dirs: 5 · sb_promotions: 22 · sb_new: 0 · sb_contradictions: 0
