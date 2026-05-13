# Memory Consolidation Log

> Append-only receipt of dreaming-pipeline runs. Each line records dreaming-agent output: timestamp, insights extracted from sessions, contradictions detected across vaults, Wisdom-promotion candidates identified, sessions processed.
>
> Maintained by `scripts/dreaming-run.ts` (TS runner) and `scripts/dreaming-cron.ps1` (Windows scheduled task wrapper). Direct invocation: `node --import tsx scripts/dreaming-run.ts`.
>
> **Why this file exists:** the substrate's claim is "memory that compounds." If consolidation isn't observable, the claim isn't verifiable. This log makes the cadence visible. Receipt-stale > 7 days = pipeline broken (or scheduled task not registered).
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
