# Wisdom Promotion Queue

> Append-only queue of dreaming-pipeline promotion candidates awaiting human review. Maintained by `scripts/dreaming-run.ts` (writeback step landed 2026-05-28, closes audit N3).
>
> **Why this file exists:** the dreaming agent identifies entries that appear across multiple non-wisdom vaults (cross-vault patterns at `PROMO_SIM=0.15`). Per the calibration history in `src/dreaming.ts`, that threshold is set low — "more promotions, some noise. Beats silence." This queue surfaces candidates for human review rather than auto-merging them into `memory/vaults/wisdom-vault.md` (where bad promotions would be hard to unwind).
>
> **Review process:**
> 1. Read each candidate — open the source vault file at the noted `entryId`.
> 2. Decide whether the pattern is real wisdom (genuinely cross-vault and durable) or noise (vocabulary overlap without substantive shared pattern).
> 3. If wisdom: copy the relevant content into `memory/vaults/wisdom-vault.md` under the appropriate section. Mark this row reviewed by deleting it.
> 4. If noise: delete the row. The dedup state (`memory/.dreaming-state.json`) prevents re-queueing.
>
> **Dedup guarantee:** `memory/.dreaming-state.json` (gitignored) records every `entryId` ever queued. Nightly runs append only NEW candidates — the queue grows monotonically per real new patterns, not per nightly noise.
>
> **Built on SIP** — operational tier (dreaming pipeline writeback).

## Candidates

### 2026-05-27T23:18:35.168Z

- [ ] **`md:creative-vault.md#0`** — creative → wisdom  
      Cross-vault pattern: found in creative + strategic
- [ ] **`md:creative-vault.md#1`** — creative → wisdom  
      Cross-vault pattern: found in creative + strategic, technical
- [ ] **`md:operational-vault.md#0`** — operational → wisdom  
      Cross-vault pattern: found in operational + strategic
- [ ] **`md:strategic-vault.md#0`** — strategic → wisdom  
      Cross-vault pattern: found in strategic + creative, operational
- [ ] **`md:strategic-vault.md#1`** — strategic → wisdom  
      Cross-vault pattern: found in strategic + creative, technical
- [ ] **`md:technical-vault.md#1`** — technical → wisdom  
      Cross-vault pattern: found in technical + creative, strategic
### 2026-06-16T02:02:05.420Z

- [ ] **`md:strategic-vault.md#14`** — strategic → wisdom  
      Cross-vault pattern: found in strategic + technical
- [ ] **`md:technical-vault.md#10`** — technical → wisdom  
      Cross-vault pattern: found in technical + strategic
