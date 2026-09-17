# Promotion queue — voided candidates (2026-08-30)

## Voided 2026-08-30 — unresolvable positional ids

The eight candidates below were queued 2026-05-27 and 2026-06-16 against entry
ids of the form `md:<file>#<integer>`, where the integer was the section's
position in the file at scan time. Every vault has been edited since
(`creative-vault.md` 2026-08-29, `operational-vault.md` and `technical-vault.md`
2026-08-26), so each id now resolves to different content than the pattern that
was flagged — `md:technical-vault.md#10` points past the end of a 10-section
file. They are recorded here rather than reviewed, because reviewing a pointer
to unknown content is not review.

Fixed at the source: `src/dreaming.ts` now derives ids from the section heading
(`sectionKey()`), and `scripts/dreaming-run.ts` has the queue writeback the
cron's header documented but no code implemented — the reason nothing has been
queued since 2026-06-16.

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

### 2026-08-30T16:23:36.472Z

- [ ] **`md:creative-vault.md#df5a0ff7177b`** — creative → wisdom  
      Cross-vault pattern: found in creative + operational
- [ ] **`md:operational-vault.md#b9e0c175d2c6`** — operational → wisdom  
      Cross-vault pattern: found in operational + creative
- [ ] **`md:strategic-vault.md#2026-06-12-cross-repo-visual-production-workspace-strategy`** — strategic → wisdom  
      Cross-vault pattern: found in strategic + technical
- [ ] **`md:technical-vault.md#2026-06-12-cross-repo-visual-production-pattern`** — technical → wisdom  
      Cross-vault pattern: found in technical + strategic
